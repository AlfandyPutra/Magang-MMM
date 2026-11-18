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

# Aggregate per Asset per Branch
$assetData = @{}

foreach ($rowMatch in $rowMatches) {
    $rn = [int]$rowMatch.Groups[1].Value
    if ($rn -lt 5) { continue }
    $rc = $rowMatch.Groups[2].Value
    
    $branch    = (GetCV $rc 'C' $rn) -replace "`t|`r|`n", ' '
    $reqDate   = (GetCV $rc 'D' $rn) -replace "`t|`r|`n", ' '
    $assetCode = (GetCV $rc 'G' $rn) -replace "`t|`r|`n", ' '
    $assetName = (GetCV $rc 'H' $rn) -replace "`t|`r|`n", ' '
    $probSum   = (GetCV $rc 'I' $rn) -replace "`t|`r|`n", ' '
    $totalTime = (GetCV $rc 'V' $rn)
    $totalCost = (GetCV $rc 'X' $rn)
    
    if ($assetCode -eq '' -or $assetCode -eq '-') { continue }
    
    $tt = 0.0
    $tc = 0.0
    if ($totalTime -ne '' -and $totalTime -ne '-') { try { $tt = [double]$totalTime } catch {} }
    if ($totalCost -ne '' -and $totalCost -ne '-') { try { $tc = [double]$totalCost } catch {} }
    
    $key = "$branch|$assetCode"
    if (-not $assetData.ContainsKey($key)) {
        $assetData[$key] = @{
            branch = $branch
            assetCode = $assetCode
            assetName = $assetName
            totalTime = 0.0
            totalCost = 0.0
            ticketCount = 0
            problems = New-Object System.Collections.ArrayList
            dates = New-Object System.Collections.ArrayList
        }
    }
    $assetData[$key].totalTime += $tt
    $assetData[$key].totalCost += $tc
    $assetData[$key].ticketCount++
    if ($probSum -ne '' -and $probSum -ne '-' -and $probSum -ne 'PERAWATAN REGULAR' -and $probSum -ne 'PERAWATAN REGULAR UTILITY') {
        if (-not $assetData[$key].problems.Contains($probSum)) {
            [void]$assetData[$key].problems.Add($probSum)
        }
    }
    if ($reqDate -ne '' -and -not $assetData[$key].dates.Contains($reqDate)) {
        [void]$assetData[$key].dates.Add($reqDate)
    }
}

# Sort by totalTime desc
$sorted = $assetData.Values | Sort-Object { $_.totalTime } -Descending

Write-Host "=== TOP 50 ASSETS BY TOTAL DOWNTIME ==="
Write-Host "Branch | AssetCode | AssetName | TotalTime(hrs) | TotalCost | Tickets | Problems"
Write-Host ("-" * 150)
$count = 0
foreach ($a in $sorted) {
    if ($count -ge 50) { break }
    $probText = ($a.problems | Select-Object -First 3) -join '; '
    Write-Host "$($a.branch) | $($a.assetCode) | $($a.assetName) | $([Math]::Round($a.totalTime, 2)) hrs | Rp $([Math]::Round($a.totalCost, 0)) | $($a.ticketCount) tiket | $probText"
    $count++
}

Write-Host "`n=== SUMMARY PER BRANCH ==="
$branchSummary = @{}
foreach ($a in $assetData.Values) {
    $b = $a.branch
    if (-not $branchSummary.ContainsKey($b)) {
        $branchSummary[$b] = @{ totalTime = 0.0; totalCost = 0.0; tickets = 0; assets = 0 }
    }
    $branchSummary[$b].totalTime += $a.totalTime
    $branchSummary[$b].totalCost += $a.totalCost
    $branchSummary[$b].tickets += $a.ticketCount
    $branchSummary[$b].assets++
}
foreach ($bs in $branchSummary.GetEnumerator()) {
    Write-Host "$($bs.Key): $($bs.Value.assets) assets, $($bs.Value.tickets) tickets, $([Math]::Round($bs.Value.totalTime, 1)) hrs DT, Rp $([Math]::Round($bs.Value.totalCost, 0))"
}

# Classify assets by name prefix
Write-Host "`n=== ASSET CATEGORIES DETECTED ==="
$catCounts = @{}
foreach ($a in $assetData.Values) {
    $name = $a.assetName
    $cat = 'Lain-lain'
    if ($name -match 'INJ|INJECTION|MOULDING|LIEN YU|HWAMDA|ENGEL|VICTOR') { $cat = 'Injection' }
    elseif ($name -match 'PRT|PRINT|PRINTER|KAZE|KASE') { $cat = 'Printing' }
    elseif ($name -match 'CHL|CHILLER|COMPRESSOR|COMP|UTILITY|COOLING') { $cat = 'Utility' }
    elseif ($name -match 'ROBOT|RBT|CONVEYOR|MIXER|CRUSHER|AOKI|HOPPER') { $cat = 'Auxiliary' }
    
    if (-not $catCounts.ContainsKey($cat)) { $catCounts[$cat] = 0 }
    $catCounts[$cat]++
}
foreach ($c in $catCounts.GetEnumerator()) {
    Write-Host "$($c.Key): $($c.Value) assets"
}

# Unique request dates
Write-Host "`n=== UNIQUE REQUEST DATES ==="
$allDates = @{}
foreach ($a in $assetData.Values) {
    foreach ($d in $a.dates) {
        if (-not $allDates.ContainsKey($d)) { $allDates[$d] = 0 }
        $allDates[$d]++
    }
}
$allDates.GetEnumerator() | Sort-Object Key | ForEach-Object {
    Write-Host "$($_.Key): $($_.Value) assets active"
}
