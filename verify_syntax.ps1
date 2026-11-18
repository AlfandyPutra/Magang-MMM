$html = [System.IO.File]::ReadAllText('c:\Kuliah\AntiGravity\Magang MMM\maintenancesummary-mtd.html', [System.Text.Encoding]::UTF8)

$scriptStart = $html.IndexOf('<script>')
$scriptEnd = $html.IndexOf('</script>', $scriptStart)
$js = $html.Substring($scriptStart + 8, $scriptEnd - $scriptStart - 8)

Write-Host "JS characters: $($js.Length)"

# Check balance of braces
$openBraces = ([regex]::Matches($js, '\{')).Count
$closeBraces = ([regex]::Matches($js, '\}')).Count
Write-Host "Open braces: $openBraces, Close braces: $closeBraces"

# Check balance of brackets
$openBrackets = ([regex]::Matches($js, '\[' )).Count
$closeBrackets = ([regex]::Matches($js, '\]' )).Count
Write-Host "Open brackets: $openBrackets, Close brackets: $closeBrackets"

# Check balance of parens
$openParens = ([regex]::Matches($js, '\(' )).Count
$closeParens = ([regex]::Matches($js, '\)' )).Count
Write-Host "Open parens: $openParens, Close parens: $closeParens"

if ($openBraces -eq $closeBraces -and $openBrackets -eq $closeBrackets -and $openParens -eq $closeParens) {
    Write-Host "`nAll braces, brackets, and parentheses are BALANCED!"
} else {
    Write-Host "`nWarning: Potential mismatch found!"
}
