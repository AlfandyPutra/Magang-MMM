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

# 2. Read sheet2
$sheetEntry = $zip.GetEntry('xl/worksheets/sheet2.xml')
$sr2 = New-Object System.IO.StreamReader($sheetEntry.Open())
$sheetXml = $sr2.ReadToEnd()
$sr2.Close()
$zip.Dispose()

$rowMatches = [regex]::Matches($sheetXml, '<row\s+r="(\d+)"[^>]*>(.*?)</row>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
Write-Host "Total rows in Sheet2: $($rowMatches.Count)"

function GetCV2($rc, $col, $rn) {
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

# In Sheet 2:
# Col B: Code (Ticket Code)
# Col G: Asset Code
# Col H: Asset Name
# Col U: Item Code
# Col V: Item Name
# Col W: Qty
# Col X: Price
# Col Y: Subtotal

$partCount = 0
$sampleParts = New-Object System.Collections.ArrayList
foreach ($rowMatch in $rowMatches) {
    $rn = [int]$rowMatch.Groups[1].Value
    if ($rn -lt 5) { continue }
    $rc = $rowMatch.Groups[2].Value
    
    $ticketCode = (GetCV2 $rc 'B' $rn).Trim()
    $assetCode  = (GetCV2 $rc 'G' $rn).Trim()
    $itemName   = (GetCV2 $rc 'V' $rn).Trim()
    $qty        = (GetCV2 $rc 'W' $rn).Trim()
    $subtotal   = (GetCV2 $rc 'Y' $rn).Trim()
    
    if ($itemName -ne '' -and $itemName -ne '-') {
        $partCount++
        if ($sampleParts.Count -lt 25) {
            [void]$sampleParts.Add("$ticketCode | $assetCode | $itemName (Qty: $qty, Subtotal: $subtotal)")
        }
    }
}

Write-Host "Total rows with spareparts in Sheet 2: $partCount"
Write-Host "`n=== SAMPLE SPAREPARTS FROM SHEET 2 ==="
foreach ($sp in $sampleParts) {
    Write-Host $sp
}
