$html = [System.IO.File]::ReadAllText('c:\Kuliah\AntiGravity\Magang MMM\maintenancesummary-mtd.html', [System.Text.Encoding]::UTF8)

# Test with HTML Document COM
$doc = New-Object -ComObject 'htmlfile'
$doc.IHTMLDocument2_write($html)
$doc.close()

# Check title or script error
$win = $doc.parentWindow
$masterCount = $win.masterMachines.length
$logsCount = $win.dailyMaintenanceLogs.length

Write-Host "JS Execution Test in Windows Browser Engine:"
Write-Host "masterMachines length: $masterCount"
Write-Host "dailyMaintenanceLogs length: $logsCount"
