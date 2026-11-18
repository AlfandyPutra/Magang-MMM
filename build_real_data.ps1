Add-Type -AssemblyName 'System.IO.Compression.FileSystem'

$xlsxPath = 'c:\Kuliah\AntiGravity\Magang MMM\Ticket_Detail_Source.xlsx'
$zip = [System.IO.Compression.ZipFile]::OpenRead($xlsxPath)

# 1. Read shared strings
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

function GetCellVal($rc, $col, $rn) {
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

# 2. Parse Sheet 2: Spareparts map
$sheet2Entry = $zip.GetEntry('xl/worksheets/sheet2.xml')
$sr2 = New-Object System.IO.StreamReader($sheet2Entry.Open())
$sheet2Xml = $sr2.ReadToEnd()
$sr2.Close()

$rowMatches2 = [regex]::Matches($sheet2Xml, '<row\s+r="(\d+)"[^>]*>(.*?)</row>', [System.Text.RegularExpressions.RegexOptions]::Singleline)

$ticketPartsMap = @{} # ticketCode -> list of spareparts
$currentTicketCode = ''

foreach ($rm in $rowMatches2) {
    $rn = [int]$rm.Groups[1].Value
    if ($rn -lt 5) { continue }
    $rc = $rm.Groups[2].Value
    
    $codeCol = (GetCellVal $rc 'B' $rn).Trim()
    if ($codeCol -match '^OTRQS') {
        $currentTicketCode = $codeCol
    }
    
    $itemName = (GetCellVal $rc 'V' $rn).Trim()
    $qty = (GetCellVal $rc 'W' $rn).Trim()
    $subtotal = (GetCellVal $rc 'Y' $rn).Trim()
    
    if ($itemName -ne '' -and $itemName -ne '-' -and $currentTicketCode -ne '') {
        if (-not $ticketPartsMap.ContainsKey($currentTicketCode)) {
            $ticketPartsMap[$currentTicketCode] = New-Object System.Collections.ArrayList
        }
        $subNum = 0.0
        try { $subNum = [double]$subtotal } catch {}
        $costStr = if ($subNum -gt 0) { " (Rp $([Math]::Round($subNum,0).ToString('N0', [System.Globalization.CultureInfo]::GetCultureInfo('id-ID'))))" } else { "" }
        $partDesc = "$itemName x$qty$costStr"
        [void]$ticketPartsMap[$currentTicketCode].Add($partDesc)
    }
}
Write-Host "Tickets with spareparts in Sheet 2: $($ticketPartsMap.Count)"

# 3. Parse Sheet 1: Tickets
$sheet1Entry = $zip.GetEntry('xl/worksheets/sheet1.xml')
$sr1 = New-Object System.IO.StreamReader($sheet1Entry.Open())
$sheet1Xml = $sr1.ReadToEnd()
$sr1.Close()
$zip.Dispose()

$rowMatches1 = [regex]::Matches($sheet1Xml, '<row\s+r="(\d+)"[^>]*>(.*?)</row>', [System.Text.RegularExpressions.RegexOptions]::Singleline)

# Collect Master Machines & Daily Logs
$machinesMap = @{}
$logsList = New-Object System.Collections.ArrayList

foreach ($rm in $rowMatches1) {
    $rn = [int]$rm.Groups[1].Value
    if ($rn -lt 5) { continue }
    $rc = $rm.Groups[2].Value
    
    $branch      = (GetCellVal $rc 'C' $rn).Trim()
    $reqDate     = (GetCellVal $rc 'D' $rn).Trim()
    $assetCode   = (GetCellVal $rc 'G' $rn).Trim()
    $assetName   = (GetCellVal $rc 'H' $rn).Trim()
    $probSummary = (GetCellVal $rc 'I' $rn).Trim()
    $probDetail  = (GetCellVal $rc 'J' $rn).Trim()
    $taskName    = (GetCellVal $rc 'M' $rn).Trim()
    $totalTime   = (GetCellVal $rc 'V' $rn).Trim()
    $note        = (GetCellVal $rc 'W' $rn).Trim()
    $totalCost   = (GetCellVal $rc 'X' $rn).Trim()
    $ticketCode  = (GetCellVal $rc 'B' $rn).Trim()
    
    # Filter out empty or header/summary rows
    if ($assetCode -eq '' -or $assetCode -eq '-' -or $assetCode -eq '0' -or $branch -eq '' -or $branch -eq '0') { continue }
    
    # Convert date dd-MM-yyyy -> yyyy-MM-dd
    $isoDate = ''
    if ($reqDate -match '^(\d{2})-(\d{2})-(\d{4})$') {
        $isoDate = "$($Matches[3])-$($Matches[2])-$($Matches[1])"
    } else {
        continue
    }
    
    # Category detection
    $cat = 'Lain-lain'
    if ($assetName -match 'INJ|INJECTION|MOULDING|LIEN YU|HWAMDA|ENGEL|VICTOR|AOKI|BORCHE|LESHAN') {
        $cat = 'Injection'
    } elseif ($assetName -match 'PRT|PRINT|PRINTER|KAZE|KASE|OFFSET|NYLO') {
        $cat = 'Printing'
    } elseif ($assetName -match 'CHL|CHILLER|COMPRESSOR|COMP|COOLING|TOWER|CLT|PPA|POMPA|GENSET|GST') {
        $cat = 'Utility'
    } elseif ($assetName -match 'ROBOT|RBT|PALLETIZER|PTZ') {
        $cat = 'Robot'
    } elseif ($assetName -match 'CONVEYOR|CNV|MIXER|MIX|CRUSHER|CRS|HOPPER|DRYER|AIR DRY|ADR|MOTAN|MOT|VACCUM') {
        $cat = 'Auxiliary'
    }
    
    # Master Machine entry
    if (-not $machinesMap.ContainsKey($assetCode)) {
        $machinesMap[$assetCode] = @{
            code = $assetCode
            unitName = $assetName
            category = $cat
            branch = $branch
        }
    }
    
    # Downtime & Cost
    $tt = 0.0
    $tc = 0.0
    if ($totalTime -ne '' -and $totalTime -ne '-') { try { $tt = [double]$totalTime } catch {} }
    if ($totalCost -ne '' -and $totalCost -ne '-') { try { $tc = [double]$totalCost } catch {} }
    
    # Check if PM or Repair
    $isPM = ($probSummary -match 'PERAWATAN REGULAR|PERAWATAN HARIAN') -or ($taskName -match 'PERAWATAN|REGULAR|HARIAN')
    
    $dtRepair = if ($isPM) { 0.0 } else { $tt }
    $pmRegular = if ($isPM) { $tt } else { 0.0 }
    $costDt = if ($isPM) { 0.0 } else { $tc }
    $costPm = if ($isPM) { $tc } else { 0.0 }
    $spkDt = if ($isPM) { 0 } else { 1 }
    $spkPm = if ($isPM) { 1 } else { 0 }
    
    # Problem text
    $cleanProb = ($probSummary -replace "`r`n|`n|`t", ' ').Trim()
    $cleanDetail = ($probDetail -replace "`r`n|`n|`t", ' ').Trim()
    $probText = $cleanProb
    if ($cleanDetail -ne '' -and $cleanDetail -ne '-' -and $cleanDetail -ne $cleanProb) {
        $probText = $cleanProb + ": " + $cleanDetail
    }
    if ($probText.Length -gt 120) {
        $probText = $probText.Substring(0, 117) + "..."
    }
    
    # Sparepart / Action note
    $spareText = '-'
    if ($ticketPartsMap.ContainsKey($ticketCode) -and $ticketPartsMap[$ticketCode].Count -gt 0) {
        $spareText = ($ticketPartsMap[$ticketCode] | Select-Object -First 3) -join '; '
    } elseif ($note -ne '' -and $note -ne '-') {
        $cleanNote = ($note -replace "`r`n|`n|`t", ' ').Trim()
        if ($cleanNote.Length -gt 100) { $cleanNote = $cleanNote.Substring(0, 97) + "..." }
        $spareText = $cleanNote
    } elseif ($taskName -ne '' -and $taskName -ne '-') {
        $spareText = ($taskName -replace "`r`n|`n|`t", ' ').Trim()
    }
    
    $logObj = [PSCustomObject]@{
        date = $isoDate
        code = $assetCode
        ticketCode = $ticketCode
        branch = $branch
        dtRepair = [Math]::Round($dtRepair, 2)
        pmRegular = [Math]::Round($pmRegular, 2)
        pmDaily = 0
        costDt = [Math]::Round($costDt, 0)
        costPm = [Math]::Round($costPm, 0)
        spkDt = $spkDt
        spkPm = $spkPm
        problem = $probText
        sparepart = $spareText
    }
    [void]$logsList.Add($logObj)
}

Write-Host "Total machines in catalog: $($machinesMap.Count)"
Write-Host "Total logs extracted: $($logsList.Count)"

# Output JS format
$outJs = New-Object System.Text.StringBuilder
[void]$outJs.AppendLine("        // Master Daftar Mesin Realitas Pabrik PT Mitra Mulia Makmur (MMS, MMN, MMG, MMM)")
[void]$outJs.AppendLine("        const masterMachines = [")

$sortedMachines = $machinesMap.Values | Sort-Object { $_.branch }, { $_.category }, { $_.code }
$first = $true
foreach ($m in $sortedMachines) {
    $comma = if ($first) { ' ' } else { ',' }
    $first = $false
    $safeCode = $m.code -replace "'", "\'"
    $safeName = $m.unitName -replace "'", "\'" -replace '\\', '\\\\'
    $safeCat = $m.category
    $safeBranch = $m.branch
    [void]$outJs.AppendLine("           $comma{ code: '$safeCode', unitName: '$safeName', category: '$safeCat', branch: '$safeBranch' }")
}
[void]$outJs.AppendLine("        ];")
[void]$outJs.AppendLine("")

[void]$outJs.AppendLine("        // Log Pemeliharaan Realitas (Ticket Detail Periode 01 - 10 Nov 2026)")
[void]$outJs.AppendLine("        const dailyMaintenanceLogs = [")

$firstLog = $true
foreach ($l in $logsList) {
    $comma = if ($firstLog) { ' ' } else { ',' }
    $firstLog = $false
    $safeProb = $l.problem -replace "'", "\'" -replace '\\', '\\\\'
    $safeSpare = $l.sparepart -replace "'", "\'" -replace '\\', '\\\\'
    $safeTicket = $l.ticketCode -replace "'", "\'"
    [void]$outJs.AppendLine("           $comma{ date: '$($l.date)', code: '$($l.code)', ticketCode: '$safeTicket', branch: '$($l.branch)', dtRepair: $($l.dtRepair), pmRegular: $($l.pmRegular), pmDaily: 0, costDt: $($l.costDt), costPm: $($l.costPm), spkDt: $($l.spkDt), spkPm: $($l.spkPm), problem: '$safeProb', sparepart: '$safeSpare' }")
}
[void]$outJs.AppendLine("        ];")

[System.IO.File]::WriteAllText('c:\Kuliah\AntiGravity\Magang MMM\mms_real_data.js', $outJs.ToString(), [System.Text.Encoding]::UTF8)
Write-Host "Successfully generated: c:\Kuliah\AntiGravity\Magang MMM\mms_real_data.js"
