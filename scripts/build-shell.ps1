# Builds the new index.html shell from the original file's body markup,
# now referencing external css/js instead of inline <style>/<script>.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$src = Get-Content -Path (Join-Path $root 'index_original_backup.html') -Encoding UTF8

function Lines($start, $end) {
  return ($src[($start - 1)..($end - 1)] -join "`n")
}

$scripts = @(
  'data','estado','helpers','auth','render-core','catalogo','recomendador',
  'comparador','mapa-competitivo','capacitaciones','home','onboarding','admin',
  'eventos','main'
) | Where-Object {
  # render-core.js was not created — its content was distributed into
  # catalogo.js/comparador.js (nothing generic was left over). Skip it.
  $_ -ne 'render-core'
}
$scriptTags = ($scripts | ForEach-Object { "<script src=`"js/$_.js`"></script>" }) -join "`n"

$head = @'
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Bullpadel 2026 · Portal Distribuidores</title>
<link rel="stylesheet" href="css/styles.css">
</head>
<body>

'@

$bodyPart1 = Lines 2868 3686
$bodyPart2 = Lines 9534 9569

$footer = @"

$scriptTags

</body>
</html>
"@

$full = $head + $bodyPart1 + "`n`n" + $bodyPart2 + $footer
[System.IO.File]::WriteAllText((Join-Path $root 'index.html'), $full, (New-Object System.Text.UTF8Encoding($false)))
Write-Output "Shell built."
