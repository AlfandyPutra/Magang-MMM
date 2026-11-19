Add-Type -AssemblyName 'System.IO.Compression.FileSystem'

$xlsxPath = 'c:\Kuliah\AntiGravity\Magang MMM\Ticket_Detail_Source.xlsx'
$zip = [System.IO.Compression.ZipFile]::OpenRead($xlsxPath)

$ssEntry = $zip.GetEntry('xl/sharedStrings.xml')
$sr = New-Object System.IO.StreamReader($ssEntry.Open())
$ssXml = $sr.ReadToEnd()
$sr.Close()

$siMatches = [regex]::Matches($ssXml, '<si>(.*?)</si>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
$sharedStrings = New-Object System.Collections.ArrayList
foreach ($si in $siMatches) {
    $tMatches = [regex]::Matches($si.Groups[1].Value, '<t[^>]*>([^<]*)</t>')
    $val = ''
    foreach ($t in $tMatches) { $val += $t.Groups[1].Value }
    [void]$sharedStrings.Add($val)
}

$sheetEntry = $zip.GetEntry('xl/worksheets/sheet1.xml')
$sr2 = New-Object System.IO.StreamReader($sheetEntry.Open())
$sheetXml = $sr2.ReadToEnd()
$sr2.Close()
$zip.Dispose()

$rowMatches = [regex]::Matches($sheetXml, '<row\s+r="(\d+)"[^>]*>(.*?)</row>', [System.Text.RegularExpressions.RegexOptions]::Singleline)

function GetCV($rc, $col, $rn) {
    $ref = "$col$rn"
    $cm = [regex]::Match($rc, "<c\s+r=`"$ref`"[^>]*>")
    if (-not $cm.Success) { return '' }
    $si = $cm.Index
    $ei = $rc.IndexOf('</c>', $si)
    if ($ei -lt 0) { return '' }
    $blk = $rc.Substring($si, $ei - $si + 4)
    $isSS = $blk -match 't="s"'
    $vm = [regex]::Match($blk, '<v>([^<]*)</v>')
    if (-not $vm.Success) { return '' }
    $rv = $vm.Groups[1].Value
    if ($isSS -and $rv -ne '') {
        $idx = [int]$rv
        if ($idx -lt $sharedStrings.Count) { return $sharedStrings[$idx] }
    }
    return $rv
}

# Build JS array output
$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine("// Auto-generated from Ticket_Detail_(17-11-2026_15_38_08).xlsx")
[void]$sb.AppendLine("// Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
[void]$sb.AppendLine("// Source period: 01-11-2026 s/d 10-11-2026")
[void]$sb.AppendLine("// Total rows: $($rowMatches.Count - 3)")
[void]$sb.AppendLine("")

# --- Master Machines ---
$assetMap = @{}
foreach ($rowMatch in $rowMatches) {
    $rn = [int]$rowMatch.Groups[1].Value
    if ($rn -lt 5) { continue }
    $rc = $rowMatch.Groups[2].Value
    $assetCode = (GetCV $rc 'G' $rn).Trim()
    $assetName = (GetCV $rc 'H' $rn).Trim()
    $branch = (GetCV $rc 'C' $rn).Trim()
    if ($assetCode -eq '' -or $assetCode -eq '-') { continue }
    $key = "$assetCode"
    if (-not $assetMap.ContainsKey($key)) {
        # Determine category from asset name
        $cat = 'Lain-lain'
        if ($assetName -match 'INJ|INJECTION|MOULDING|LIEN YU|HWAMDA|ENGEL|VICTOR') { $cat = 'Injection' }
        elseif ($assetName -match 'PRT|PRINT|PRINTER|KAZE|KASE') { $cat = 'Printing' }
        elseif ($assetName -match 'CHL|CHILLER|COMPRESSOR|COMP|COOLING|TOWER') { $cat = 'Utility' }
        elseif ($assetName -match 'ROBOT|RBT') { $cat = 'Robot' }
        elseif ($assetName -match 'CONVEYOR|MIXER|CRUSHER|HOPPER|DRYER|AIR DRY') { $cat = 'Auxiliary' }
        elseif ($assetName -match 'AOKI') { $cat = 'Injection' }
        
        $assetMap[$key] = @{
            code = $assetCode
            unitName = ($assetName -replace "'", "\'" -replace '"', '\"' -replace "`r`n|`n", ' ').Trim()
            category = $cat
            branch = $branch
        }
    }
}

[void]$sb.AppendLine("const masterMachines = [")
$sortedAssets = $assetMap.Values | Sort-Object { $_.branch }, { $_.category }, { $_.code }
$first = $true
foreach ($a in $sortedAssets) {
    $comma = if ($first) { '' } else { ',' }
    $first = $false
    $safeCode = $a.code -replace "'", "\'"
    $safeName = $a.unitName -replace "'", "\'" -replace '\\', '\\\\'
    $safeBranch = $a.branch -replace "'", "\'"
    [void]$sb.AppendLine("$comma{ code: '$safeCode', unitName: '$safeName', category: '$($a.category)', branch: '$safeBranch' }")
}
[void]$sb.AppendLine("];")
[void]$sb.AppendLine("")

# --- Daily Logs ---
# Convert each ticket to a daily log entry
[void]$sb.AppendLine("const dailyMaintenanceLogs = [")

$logCount = 0
foreach ($rowMatch in $rowMatches) {
    $rn = [int]$rowMatch.Groups[1].Value
    if ($rn -lt 5) { continue }
    $rc = $rowMatch.Groups[2].Value
    
    $assetCode = (GetCV $rc 'G' $rn).Trim()
    $reqDate = (GetCV $rc 'D' $rn).Trim()
    $probSummary = (GetCV $rc 'I' $rn).Trim()
    $probDetail = (GetCV $rc 'J' $rn).Trim()
    $totalTime = (GetCV $rc 'V' $rn)
    $totalCost = (GetCV $rc 'X' $rn)
    $ticketCode = (GetCV $rc 'B' $rn).Trim()
    $taskName = (GetCV $rc 'M' $rn).Trim()
    $note = (GetCV $rc 'W' $rn).Trim()
    $headerNote = (GetCV $rc 'K' $rn).Trim()
    
    if ($assetCode -eq '' -or $assetCode -eq '-') { continue }
    
    # Convert date format from dd-MM-yyyy to yyyy-MM-dd
    $isoDate = ''
    if ($reqDate -match '^(\d{2})-(\d{2})-(\d{4})$') {
        $isoDate = "$($Matches[3])-$($Matches[2])-$($Matches[1])"
    } else {
        continue
    }
    
    $tt = 0.0
    $tc = 0.0
    if ($totalTime -ne '' -and $totalTime -ne '-') { try { $tt = [double]$totalTime } catch {} }
    if ($totalCost -ne '' -and $totalCost -ne '-') { try { $tc = [double]$totalCost } catch {} }
    
    # Escape for JS
    $safeProb = ($probSummary -replace "'", "\'" -replace '"', '\"' -replace "`r`n|`n", ' ' -replace '\\', '\\\\').Trim()
    $safeDetail = ($probDetail -replace "'", "\'" -replace '"', '\"' -replace "`r`n|`n", ' ' -replace '\\', '\\\\').Trim()
    $safeTask = ($taskName -replace "'", "\'" -replace '"', '\"' -replace "`r`n|`n", ' ' -replace '\\', '\\\\').Trim()
    $safeNote = ($note -replace "'", "\'" -replace '"', '\"' -replace "`r`n|`n", ' ' -replace '\\', '\\\\').Trim()
    $safeHeader = ($headerNote -replace "'", "\'" -replace '"', '\"' -replace "`r`n|`n", ' ' -replace '\\', '\\\\').Trim()
    $safeTicket = ($ticketCode -replace "'", "\'" -replace '"', '\"').Trim()
    
    # Determine if this is a repair (DT) or preventive (PM) ticket
    $isPM = ($safeProb -match 'PERAWATAN REGULAR|PERAWATAN HARIAN') -or ($safeTask -match 'PERAWATAN|REGULAR|HARIAN')
    
    $dtRepair = if ($isPM) { 0 } else { $tt }
    $pmTime = if ($isPM) { $tt } else { 0 }
    $costDt = if ($isPM) { 0 } else { $tc }
    $costPm = if ($isPM) { $tc } else { 0 }
    $spkDt = if ($isPM) { 0 } else { 1 }
    $spkPm = if ($isPM) { 1 } else { 0 }
    
    # Problem text: use detail if available, else summary
    $probText = if ($safeDetail -ne '' -and $safeDetail -ne '-' -and $safeDetail -ne $safeProb) { "$safeProb - $safeDetail" } else { $safeProb }
    
    # Sparepart/note
    $spareText = if ($safeNote -ne '' -and $safeNote -ne '-') { $safeNote } 
                 elseif ($safeHeader -ne '' -and $safeHeader -ne '-') { $safeHeader }
                 else { '-' }
    
    $comma = if ($logCount -eq 0) { ' ' } else { ',' }
    [void]$sb.AppendLine("$comma{ date: '$isoDate', code: '$($assetCode -replace "'","\\'")', ticketCode: '$safeTicket', dtRepair: $dtRepair, pmRegular: $pmTime, pmDaily: 0, costDt: $costDt, costPm: $costPm, spkDt: $spkDt, spkPm: $spkPm, problem: '$probText', sparepart: '$spareText' }")
    $logCount++
}

[void]$sb.AppendLine("];")

Write-Host "Master machines: $($assetMap.Count)"
Write-Host "Daily logs: $logCount"

$outPath = 'c:\Kuliah\AntiGravity\Magang MMM\generated_data.js'
[System.IO.File]::WriteAllText($outPath, $sb.ToString(), [System.Text.Encoding]::UTF8)
Write-Host "Generated: $outPath"
