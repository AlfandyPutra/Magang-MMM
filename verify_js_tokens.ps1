$html = [System.IO.File]::ReadAllText('c:\Kuliah\AntiGravity\Magang MMM\maintenancesummary-mtd.html', [System.Text.Encoding]::UTF8)

$scriptStart = $html.IndexOf('<script>')
$scriptEnd = $html.IndexOf('</script>', $scriptStart)
$js = $html.Substring($scriptStart + 8, $scriptEnd - $scriptStart - 8)

# Strip out single-quoted strings, double-quoted strings, template strings, and comments
# 1. Multi-line comments
$noComments = [regex]::Replace($js, '/\*.*?\*/', '', [System.Text.RegularExpressions.RegexOptions]::Singleline)
# 2. Single-line comments
$noComments = [regex]::Replace($noComments, '//[^\r\n]*', '')
# 3. Double-quoted strings
$noStrings = [regex]::Replace($noComments, '"(?:[^"\\]|\\.)*"', '""')
# 4. Single-quoted strings
$noStrings = [regex]::Replace($noStrings, "'(?:[^'\\]|\\.)*'", "''")
# 5. Template literals
$noStrings = [regex]::Replace($noStrings, '`[\s\S]*?`', '``')

$ob = ([regex]::Matches($noStrings, '\{')).Count
$cb = ([regex]::Matches($noStrings, '\}')).Count
$obr = ([regex]::Matches($noStrings, '\[' )).Count
$cbr = ([regex]::Matches($noStrings, '\]' )).Count
$op = ([regex]::Matches($noStrings, '\(' )).Count
$cp = ([regex]::Matches($noStrings, '\)' )).Count

Write-Host "Code (non-string) braces:   Open=$ob, Close=$cb"
Write-Host "Code (non-string) brackets: Open=$obr, Close=$cbr"
Write-Host "Code (non-string) parens:   Open=$op, Close=$cp"

if ($ob -eq $cb -and $obr -eq $cbr -and $op -eq $cp) {
    Write-Host "`nSUCCESS: Perfect JS syntax token balance!"
} else {
    Write-Host "`nMismatch detected in code structure!"
}
