$js = [System.IO.File]::ReadAllText('c:\Kuliah\AntiGravity\Magang MMM\mms_real_data.js', [System.Text.Encoding]::UTF8)

# Check line by line
$lines = $js -split "`r`n|`n"
$lineNum = 0
$errors = 0
foreach ($line in $lines) {
    $lineNum++
    $trimmed = $line.Trim()
    if ($trimmed -match '^\s*[,]?\s*\{.*\}\s*$') {
        # Valid object line
        # Count single quotes
        $quotes = [regex]::Matches($trimmed, "(?<!\\)'").Count
        if ($quotes % 2 -ne 0) {
            Write-Host "Unmatched quote at line $lineNum : $trimmed"
            $errors++
        }
    }
}
Write-Host "Total lines checked: $lineNum, errors: $errors"
