Add-Type -AssemblyName 'System.IO.Compression.FileSystem'

$xlsxPath = 'c:\Kuliah\AntiGravity\Magang MMM\Ticket_Detail_Source.xlsx'
$zip = [System.IO.Compression.ZipFile]::OpenRead($xlsxPath)

# 1. Read shared strings
$ssEntry = $zip.GetEntry('xl/sharedStrings.xml')
$sr = New-Object System.IO.StreamReader($ssEntry.Open())
$ssXml = $sr.ReadToEnd()
$sr.Close()

# Parse shared strings more carefully - each <si> element is one string
$siMatches = [regex]::Matches($ssXml, '<si>(.*?)</si>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
$sharedStrings = New-Object System.Collections.ArrayList
foreach ($si in $siMatches) {
    $tMatches = [regex]::Matches($si.Groups[1].Value, '<t[^>]*>([^<]*)</t>')
    $val = ''
    foreach ($t in $tMatches) {
        $val += $t.Groups[1].Value
    }
    [void]$sharedStrings.Add($val)
}
Write-Host "Shared strings count: $($sharedStrings.Count)"

# Print first 100 shared strings
for ($i = 0; $i -lt [Math]::Min(100, $sharedStrings.Count); $i++) {
    Write-Host "[$i] = $($sharedStrings[$i])"
}

# 2. Read sheet1
$sheetEntry = $zip.GetEntry('xl/worksheets/sheet1.xml')
$sr2 = New-Object System.IO.StreamReader($sheetEntry.Open())
$sheetXml = $sr2.ReadToEnd()
$sr2.Close()
$zip.Dispose()

# 3. Parse rows - extract data rows starting at row 5
$rowMatches = [regex]::Matches($sheetXml, '<row\s+r="(\d+)"[^>]*>(.*?)</row>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
Write-Host "`nTotal rows: $($rowMatches.Count)"

function GetCellValue($rowContent, $colLetter, $rowNum) {
    $cellRef = "$colLetter$rowNum"
    # Match: <c r="XX" ... t="s" ...><v>123</v></c>  OR  <c r="XX" ...><v>123</v></c>
    $pattern = "<c\s+r=`"$cellRef`"[^>]*>"
    $cellMatch = [regex]::Match($rowContent, $pattern)
    if (-not $cellMatch.Success) { return '' }
    
    $startIdx = $cellMatch.Index
    $endTag = $rowContent.IndexOf('</c>', $startIdx)
    if ($endTag -lt 0) { return '' }
    $cellBlock = $rowContent.Substring($startIdx, $endTag - $startIdx + 4)
    
    # Get type
    $isSharedString = $cellBlock -match 't="s"'
    
    # Get value
    $vMatch = [regex]::Match($cellBlock, '<v>([^<]*)</v>')
    if (-not $vMatch.Success) { return '' }
    $rawVal = $vMatch.Groups[1].Value
    
    if ($isSharedString -and $rawVal -ne '') {
        $idx = [int]$rawVal
        if ($idx -lt $sharedStrings.Count) {
            return $sharedStrings[$idx]
        }
    }
    return $rawVal
}

# Extract all data rows
$outLines = New-Object System.Collections.ArrayList
[void]$outLines.Add("No`tCode`tBranch`tReqDate`tServiceType`tAssetCode`tAssetName`tProblemSummary`tProblemDetail`tTotalTime`tTotalCost`tScoring")

$dataCount = 0
foreach ($rowMatch in $rowMatches) {
    $rowNum = [int]$rowMatch.Groups[1].Value
    if ($rowNum -lt 5) { continue }
    
    $rc = $rowMatch.Groups[2].Value
    
    $no         = GetCellValue $rc 'A' $rowNum
    $code       = GetCellValue $rc 'B' $rowNum
    $branch     = GetCellValue $rc 'C' $rowNum
    $reqDate    = GetCellValue $rc 'D' $rowNum
    $svcType    = GetCellValue $rc 'F' $rowNum
    $assetCode  = GetCellValue $rc 'G' $rowNum
    $assetName  = GetCellValue $rc 'H' $rowNum
    $probSum    = GetCellValue $rc 'I' $rowNum
    $probDet    = GetCellValue $rc 'J' $rowNum
    $totalTime  = GetCellValue $rc 'V' $rowNum
    $totalCost  = GetCellValue $rc 'X' $rowNum
    $scoring    = GetCellValue $rc 'Y' $rowNum
    
    # Clean
    $probSum = ($probSum -replace "`t|`r|`n", ' ').Trim()
    $probDet = ($probDet -replace "`t|`r|`n", ' ').Trim()
    $assetName = ($assetName -replace "`t|`r|`n", ' ').Trim()
    
    if ($no -ne '' -and $assetCode -ne '') {
        [void]$outLines.Add("$no`t$code`t$branch`t$reqDate`t$svcType`t$assetCode`t$assetName`t$probSum`t$probDet`t$totalTime`t$totalCost`t$scoring")
        $dataCount++
    }
}

Write-Host "`nData rows: $dataCount"

# Save
$outPath = 'c:\Kuliah\AntiGravity\Magang MMM\ticket_detail_parsed.tsv'
[System.IO.File]::WriteAllLines($outPath, $outLines.ToArray(), [System.Text.Encoding]::UTF8)

# Print first 30 data lines
Write-Host "`n=== FIRST 30 DATA ROWS ==="
$outLines | Select-Object -First 31 | ForEach-Object { Write-Host $_ }

# Unique assets
Write-Host "`n=== TOP 30 ASSETS BY TICKET COUNT ==="
$assetMap = @{}
foreach ($line in ($outLines | Select-Object -Skip 1)) {
    $p = $line -split "`t"
    if ($p.Count -ge 7) {
        $key = "$($p[5]) | $($p[6])"
        if (-not $assetMap.ContainsKey($key)) { $assetMap[$key] = 0 }
        $assetMap[$key]++
    }
}
$assetMap.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 30 | ForEach-Object {
    Write-Host "$($_.Value)x  $($_.Key)"
}
Write-Host "Total unique assets: $($assetMap.Count)"

# Unique branches
Write-Host "`n=== BRANCHES ==="
$branchMap = @{}
foreach ($line in ($outLines | Select-Object -Skip 1)) {
    $p = $line -split "`t"
    if ($p.Count -ge 3) {
        $key = $p[2]
        if (-not $branchMap.ContainsKey($key)) { $branchMap[$key] = 0 }
        $branchMap[$key]++
    }
}
$branchMap.GetEnumerator() | Sort-Object Value -Descending | ForEach-Object {
    Write-Host "$($_.Value)x  $($_.Key)"
}
