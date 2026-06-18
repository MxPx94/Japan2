$path = Join-Path $PSScriptRoot '..\tokyo-districts.html'
$path = (Resolve-Path $path).ProviderPath
$s = Get-Content $path -Raw -Encoding UTF8
# remove comments
$s = [regex]::Replace($s, '<!--.*?-->', '', 'Singleline')
$pattern = '<(/?)\s*([a-zA-Z0-9-]+)([^>]*)>'
$selfClosing = @('area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr')
$stack = @()
$errors = @()

# prepare line starts
$lineStarts = @(0)
$index = 0
foreach ($c in ($s.ToCharArray())) {
    if ($c -eq "`n") { $index++; $lineStarts += $index }
    else { $index++ }
}
function Get-Line([int]$pos) {
    for ($i = 0; $i -lt $lineStarts.Count; $i++) {
        if ($lineStarts[$i] -gt $pos) { return $i }
    }
    return $lineStarts.Count
}

$matches = [regex]::Matches($s, $pattern)
foreach ($m in $matches) {
    $closing = $m.Groups[1].Value -eq '/'
    $tag = $m.Groups[2].Value.ToLower()
    $attrs = $m.Groups[3].Value
    $pos = $m.Index
    $ln = (Get-Line $pos)
    if (-not $closing) {
        if ($selfClosing -contains $tag -or $attrs.Trim().EndsWith('/')) { continue }
        $stack += [pscustomobject]@{tag=$tag;ln=$ln}
    } else {
        if ($stack.Count -eq 0) { $errors += "Closing </$tag> at line $ln with empty stack"; continue }
        $top = $stack[-1]
        if ($top.tag -eq $tag) { $stack = $stack[0..($stack.Count-2)] }
        else {
            $found = $false
            for ($i = $stack.Count-1; $i -ge 0; $i--) {
                if ($stack[$i].tag -eq $tag) { $found = $true; break }
            }
            if (-not $found) {
                $errors += "Unmatched closing </$tag> at line $ln, top is </$($top.tag)> from line $($top.ln)"
            } else {
                $unclosed = $stack[($i+1)..($stack.Count-1)] | ForEach-Object { $_.tag + "(line" + $_.ln + ")" }
                $errors += "Found </$tag> at line $ln but previous tags not closed: " + ($unclosed -join ', ')
                if ($i -ge 0) { $stack = $stack[0..$i] } else { $stack = @() }
            }
        }
    }
}

Write-Host "Tag nesting check for $path"
Write-Host "Total opening tags remaining on stack:" $stack.Count
if ($stack.Count -gt 0) {
    foreach ($it in $stack) { Write-Host "  Unclosed <" $it.tag "> opened at line" $it.ln }
}
if ($errors.Count -gt 0) {
    Write-Host "`nErrors found:"
    foreach ($e in $errors) { Write-Host ' -' $e }
} else { Write-Host 'No nesting errors detected.' }

# quick counts
$tags = [regex]::Matches($s, '<(/?)\s*([a-zA-Z0-9-]+)') | ForEach-Object { $_.Groups[2].Value.ToLower() }
$counts = @{}
foreach ($t in $tags) { if ($counts.ContainsKey($t)) { $counts[$t]++ } else { $counts[$t]=1 } }
Write-Host "`nTag counts (approx):"
$counts.GetEnumerator() | Sort-Object Name | ForEach-Object { Write-Host $_.Name $_.Value }
