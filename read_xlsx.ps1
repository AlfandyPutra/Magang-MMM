Add-Type -AssemblyName 'System.IO.Compression.FileSystem'

$xlsxPath = 'c:\Kuliah\AntiGravity\Magang MMM\Ticket_Detail_Source.xlsx'
$zip = [System.IO.Compression.ZipFile]::OpenRead($xlsxPath)

# List all entries
Write-Host "=== ENTRIES IN XLSX ==="
foreach ($entry in $zip.Entries) {
    Write-Host $entry.FullName
}

# Read sharedStrings.xml
$ssEntry = $zip.GetEntry('xl/sharedStrings.xml')
if ($ssEntry -ne $null) {
    $sr = New-Object System.IO.StreamReader($ssEntry.Open())
    $ssContent = $sr.ReadToEnd()
    $sr.Close()
    
    # Parse all <t> values
    $matches = [regex]::Matches($ssContent, '<t[^>]*>([^<]*)</t>')
    Write-Host "`n=== SHARED STRINGS (first 100) ==="
    $idx = 0
    foreach ($m in $matches) {
        if ($idx -ge 100) { break }
        Write-Host "[$idx] $($m.Groups[1].Value)"
        $idx++
    }
    Write-Host "`nTotal shared strings: $($matches.Count)"
} else {
    Write-Host "No sharedStrings.xml"
}

# Read sheet1.xml
$sheetEntry = $zip.GetEntry('xl/worksheets/sheet1.xml')
if ($sheetEntry -ne $null) {
    $sr2 = New-Object System.IO.StreamReader($sheetEntry.Open())
    $sheetContent = $sr2.ReadToEnd()
    $sr2.Close()
    
    # Get first 8000 chars
    $len = [Math]::Min(8000, $sheetContent.Length)
    Write-Host "`n=== SHEET1.XML (first $len chars) ==="
    Write-Host $sheetContent.Substring(0, $len)
    Write-Host "`nTotal sheet1 length: $($sheetContent.Length)"
} else {
    Write-Host "No sheet1.xml"
}

$zip.Dispose()
