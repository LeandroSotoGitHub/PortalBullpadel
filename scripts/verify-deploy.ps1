# Verifica que lo publicado en produccion sea identico a lo que hay en el repo.
#
# -- Por que existe -------------------------------------------------------
# El deploy de este portal es MANUAL: los archivos se suben a public_html por
# el File Manager de cPanel o por FTP, de a uno. Nada garantiza que lo
# publicado sea lo que esta en `main`. Un archivo que no se subio, uno que se
# subio a medias o uno viejo que quedo arriba no producen ningun error
# visible: el portal sigue andando, con codigo viejo.
#
# Ya paso algo de esta familia -- una version del .htaccess se subio sin el
# punto inicial y por un tiempo parecio que el hosting lo ignoraba (ver el
# comentario largo en .htaccess). El modo de falla es siempre el mismo:
# silencioso.
#
# Este script baja index.html + los assets css/js que index.html referencia,
# y compara SHA-256 contra el archivo local. Correr despues de cada
# publicacion.
#
# -- Uso ------------------------------------------------------------------
#   .\scripts\verify-deploy.ps1
#   .\scripts\verify-deploy.ps1 -BaseUrl 'https://otro-host.com'
#   .\scripts\verify-deploy.ps1 -ExtraPaths 'favicon.ico','img/palas/xplo26.jpg'
#
# Codigos de salida: 0 = todo coincide | 1 = hay diferencias | 2 = error.
#
# -- Que NO verifica ------------------------------------------------------
# - Imagenes, fuentes y favicon: son muchos y no causan bugs de codigo viejo.
#   Pasarlos por -ExtraPaths si en algun momento hace falta.
# - El SDK de Supabase: lo sirve jsDelivr, no nuestro origen.
# - Que el ?v= de cada asset este bien bumpeado. Eso no se deduce comparando
#   bytes; el script imprime el ?v= vigente para poder ojearlo.

[CmdletBinding()]
param(
  [string]   $BaseUrl    = 'https://onyxsportspdv.com.ar',
  [string[]] $ExtraPaths = @()
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

# Hosting viejo + PS 5.1: sin esto el handshake puede negociar TLS 1.0.
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Get-Sha256([byte[]] $Bytes) {
  $sha = [System.Security.Cryptography.SHA256]::Create()
  try     { return [BitConverter]::ToString($sha.ComputeHash($Bytes)).Replace('-', '') }
  finally { $sha.Dispose() }
}

# Saca los CR de las secuencias CRLF a nivel byte, sin decodificar texto (asi
# el encoding no se mete en el medio). Sirve para distinguir "el archivo es
# otro" de "el FTP subio en modo ASCII y convirtio los finales de linea".
function Remove-Cr([byte[]] $Bytes) {
  $out = New-Object System.Collections.Generic.List[byte]
  for ($i = 0; $i -lt $Bytes.Length; $i++) {
    if ($Bytes[$i] -eq 13 -and ($i + 1) -lt $Bytes.Length -and $Bytes[$i + 1] -eq 10) { continue }
    $out.Add($Bytes[$i])
  }
  return $out.ToArray()
}

# La lista de assets sale de index.html y no de una constante aca: cuando se
# agrega un modulo nuevo (CONTEXT.md seccion 2) el script lo toma solo.
$indexPath = Join-Path $root 'index.html'
if (-not (Test-Path $indexPath)) {
  Write-Host "No encuentro index.html en $root" -ForegroundColor Red
  exit 2
}
$indexText = Get-Content -Path $indexPath -Raw -Encoding UTF8

$pattern = '(?:src|href)="((?:js|css)/[^"]+)"'
$assets  = @('index.html')
$assets += [regex]::Matches($indexText, $pattern) | ForEach-Object { $_.Groups[1].Value }
$assets += $ExtraPaths
$assets  = $assets | Select-Object -Unique

Write-Host ""
Write-Host "Verificando $($assets.Count) archivos contra $BaseUrl" -ForegroundColor Cyan
Write-Host ""

$ok = 0; $distintos = @(); $faltantes = @(); $errores = @(); $soloEol = @()

foreach ($asset in $assets) {
  # El ?v= se manda tal cual lo pide el navegador. En un host estatico la
  # query no cambia que archivo se sirve, pero asi pedimos lo mismo que el
  # usuario real.
  $relPath = ($asset -split '\?')[0]
  $version = if ($asset -match '\?v=(.+)$') { $Matches[1] } else { '' }
  $localPath = Join-Path $root ($relPath -replace '/', '\')
  $label = if ($version) { "{0} (?v={1})" -f $relPath, $version } else { $relPath }

  if (-not (Test-Path $localPath)) {
    $origen = if ($ExtraPaths -contains $asset) { '-ExtraPaths' } else { 'index.html' }
    Write-Host ("  [LOCAL?]   {0}" -f $label) -ForegroundColor Magenta
    Write-Host  "             $origen lo referencia pero no existe en el repo" -ForegroundColor DarkGray
    $errores += $relPath
    continue
  }

  $url = "$BaseUrl/$asset"
  try {
    $req = [System.Net.HttpWebRequest]::Create($url)
    $req.Method      = 'GET'
    $req.UserAgent   = 'verify-deploy.ps1'
    $req.Timeout     = 30000
    # Que no conteste una cache intermedia: queremos el byte del origen.
    $req.CachePolicy = New-Object System.Net.Cache.RequestCachePolicy([System.Net.Cache.RequestCacheLevel]::NoCacheNoStore)

    $resp   = $req.GetResponse()
    $stream = $resp.GetResponseStream()
    $mem    = New-Object System.IO.MemoryStream
    $stream.CopyTo($mem)
    $remoteBytes = $mem.ToArray()
    $mem.Dispose(); $stream.Dispose(); $resp.Dispose()
  }
  catch [System.Net.WebException] {
    $status = $null
    if ($_.Exception.Response) { $status = [int]$_.Exception.Response.StatusCode }
    if ($status -eq 404) {
      Write-Host ("  [FALTA]    {0}" -f $label) -ForegroundColor Red
      Write-Host  "             404 -- el archivo no esta publicado" -ForegroundColor DarkGray
      $faltantes += $relPath
    } else {
      $detalle = if ($status) { "HTTP $status" } else { $_.Exception.Message }
      Write-Host ("  [ERROR]    {0}" -f $label) -ForegroundColor Red
      Write-Host  "             $detalle" -ForegroundColor DarkGray
      $errores += $relPath
    }
    continue
  }

  $localBytes = [System.IO.File]::ReadAllBytes($localPath)

  if ((Get-Sha256 $localBytes) -eq (Get-Sha256 $remoteBytes)) {
    Write-Host ("  [OK]       {0}" -f $label) -ForegroundColor Green
    $ok++
    continue
  }

  # Byte a byte no coinciden. Antes de gritar, descartar el caso benigno.
  if ((Get-Sha256 (Remove-Cr $localBytes)) -eq (Get-Sha256 (Remove-Cr $remoteBytes))) {
    Write-Host ("  [EOL]      {0}" -f $label) -ForegroundColor Yellow
    Write-Host  "             mismo contenido, distintos finales de linea" -ForegroundColor DarkGray
    $soloEol += $relPath
    continue
  }

  $delta = $remoteBytes.Length - $localBytes.Length
  Write-Host ("  [DISTINTO] {0}" -f $label) -ForegroundColor Red
  Write-Host ("             local {0:N0} B | publicado {1:N0} B | delta {2:+#;-#;0} B" -f `
              $localBytes.Length, $remoteBytes.Length, $delta) -ForegroundColor DarkGray
  $distintos += $relPath
}

Write-Host ""
Write-Host ("-" * 62)
Write-Host ("  Coinciden: {0}/{1}" -f $ok, $assets.Count) -ForegroundColor Green
if ($soloEol.Count)   { Write-Host ("  Solo finales de linea: {0}" -f $soloEol.Count) -ForegroundColor Yellow }
if ($distintos.Count) { Write-Host ("  Distintos: {0}"        -f $distintos.Count)    -ForegroundColor Red }
if ($faltantes.Count) { Write-Host ("  No publicados: {0}"    -f $faltantes.Count)    -ForegroundColor Red }
if ($errores.Count)   { Write-Host ("  Errores: {0}"          -f $errores.Count)      -ForegroundColor Red }
Write-Host ("-" * 62)
Write-Host ""

if ($distintos.Count -or $faltantes.Count) {
  Write-Host "Subir a public_html:" -ForegroundColor Yellow
  ($distintos + $faltantes) | ForEach-Object { Write-Host "  $_" }
  Write-Host ""
}

if ($soloEol.Count) {
  Write-Host "Nota sobre los finales de linea:" -ForegroundColor Yellow
  Write-Host "  El contenido es correcto, asi que el portal funciona igual. Pero la"  -ForegroundColor DarkGray
  Write-Host "  conversion indica que el FTP esta subiendo en modo ASCII, y ese modo" -ForegroundColor DarkGray
  Write-Host "  SI corrompe archivos binarios (las imagenes de img/). Conviene pasar" -ForegroundColor DarkGray
  Write-Host "  el cliente FTP a modo binario."                                       -ForegroundColor DarkGray
  Write-Host ""
}

if ($distintos.Count -or $faltantes.Count -or $errores.Count) { exit 1 }
exit 0
