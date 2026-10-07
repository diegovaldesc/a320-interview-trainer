# Corre la bateria de regresion (tests/suite/*.js, unidos en orden de nombre)
# dentro de la propia app, en un Chrome o Edge sin ventana. Antes, si hay Node,
# revisa la integridad de los datos (tests/data-integrity.js); sin Node, avisa
# y sigue solo con la bateria.
#
#   powershell -ExecutionPolicy Bypass -File tests\run.ps1
#
# Sale con codigo 0 si todos los casos pasan, 1 si alguno falla y 2 si la
# bateria no pudo ejecutarse. El detalle de cada caso esta en TESTING.md.
#
# Uso avanzado: -Script otro.js ejecuta ese archivo en lugar de la bateria
# (debe escribir su resultado en #__test_results como JSON) e imprime ese
# JSON tal cual; -Width/-Height fijan el tamano de ventana (p. ej. 375x812
# para simular un iPhone). Sirve para diagnosticos puntuales dentro de la app.
param([string]$Browser = "", [string]$Script = "", [int]$Width = 0, [int]$Height = 0)
$ErrorActionPreference = "Stop"

$root  = Split-Path -Parent $PSScriptRoot
$index = Join-Path $root "index.html"
$suiteDir = Join-Path $PSScriptRoot "suite"

if (-not $Script) {
  $node = Get-Command node -ErrorAction SilentlyContinue
  if ($node) {
    & $node.Source (Join-Path $PSScriptRoot "data-integrity.js")
    if ($LASTEXITCODE -ne 0) { exit 1 }
  } else {
    Write-Host "AVISO  sin Node: no se reviso la integridad de los datos (node tests/data-integrity.js)"
  }
}

$candidates = @(
  $Browser,
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
) | Where-Object { $_ -and (Test-Path $_) }
if (-not $candidates) { Write-Host "No se encontro Chrome ni Edge."; exit 2 }
$browserExe = @($candidates)[0]

$work = Join-Path ([IO.Path]::GetTempPath()) ("a320-tests-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $work | Out-Null
try {
  $html      = [IO.File]::ReadAllText($index, [Text.Encoding]::UTF8)
  if ($Script) {
    $suiteText = [IO.File]::ReadAllText((Resolve-Path $Script).Path, [Text.Encoding]::UTF8)
  } else {
    # La bateria esta dividida por secciones: 00-arnes.js abre la funcion con los ayudantes y
    # 99-ejecucion.js la cierra; se unen en orden de nombre.
    $parts = @(Get-ChildItem -LiteralPath $suiteDir -Filter "*.js" | Sort-Object Name)
    if (-not $parts.Count) { throw "no hay archivos en tests/suite/" }
    $suiteText = ($parts | ForEach-Object { [IO.File]::ReadAllText($_.FullName, [Text.Encoding]::UTF8) }) -join "`n"
  }
  if ($suiteText.Contains("</script")) { throw "la bateria no puede contener la secuencia </script" }

  # Se arma una copia temporal de la app con la bateria al final. La app
  # publicada no se toca.
  $headHook = '<script>window.__errs=[];window.addEventListener("error",function(e){window.__errs.push(String(e.message))});window.alert=function(){};window.confirm=function(){return true};</script>'
  $m = [regex]::Match($html, '<head[^>]*>')
  if (-not $m.Success) { throw "index.html no tiene <head>" }
  $html = $html.Insert($m.Index + $m.Length, $headHook)
  $closeIdx = $html.LastIndexOf('</body>')
  if ($closeIdx -lt 0) { throw "index.html no tiene </body>" }
  $html = $html.Insert($closeIdx, '<pre id="__test_results"></pre><script>' + $suiteText + '</script>')
  $page = Join-Path $work "run.html"
  [IO.File]::WriteAllText($page, $html, (New-Object Text.UTF8Encoding($false)))

  # La app carga sus estilos, sus bancos y su logica desde archivos aparte
  # (css/, data/, js/): se copian junto a la copia temporal, con las mismas rutas.
  foreach ($ref in [regex]::Matches($html, '<(?:script|link)\b[^>]*?\b(?:src|href)="([^"]+)"')) {
    $rel = ($ref.Groups[1].Value -split '[?#]')[0]
    if ($rel -match '^(?:[a-z][a-z0-9+.-]*:|//)') { continue }
    $from = Join-Path $root $rel
    if (-not (Test-Path -LiteralPath $from -PathType Leaf)) { throw "index.html carga $rel, que no existe" }
    $to = Join-Path $work $rel
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $to) | Out-Null
    Copy-Item -LiteralPath $from -Destination $to
  }

  $profile = Join-Path $work "profile"
  $out = Join-Path $work "dom.html"
  $err = Join-Path $work "err.txt"
  $url = ([Uri]$page).AbsoluteUri
  # --allow-file-access-from-files: sin esto, un error en js/ o data/ llega solo como
  # "Script error." (archivos locales distintos cuentan como otro origen).
  $argList = @("--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
               "--disable-extensions", "--allow-file-access-from-files",
               "--user-data-dir=`"$profile`"", "--virtual-time-budget=20000")
  if ($Width -gt 0 -and $Height -gt 0) { $argList += "--window-size=$Width,$Height" }
  $argList += @("--dump-dom", $url)

  $sw = [Diagnostics.Stopwatch]::StartNew()
  $p = Start-Process -FilePath $browserExe -ArgumentList $argList -NoNewWindow -PassThru `
        -RedirectStandardOutput $out -RedirectStandardError $err
  if (-not $p.WaitForExit(120000)) {
    try { $p.Kill() } catch {}
    Write-Host "Tiempo agotado esperando al navegador."; exit 2
  }
  $secs = [math]::Round($sw.Elapsed.TotalSeconds, 1)

  # El navegador puede tener tomado el archivo de salida un instante despues de cerrarse.
  $dom = $null
  for ($i = 0; $i -lt 40 -and $null -eq $dom; $i++) {
    try { $dom = [IO.File]::ReadAllText($out, [Text.Encoding]::UTF8) } catch { Start-Sleep -Milliseconds 250 }
  }
  if ($null -eq $dom) { Write-Host "No se pudo leer la salida del navegador."; exit 2 }
  $mm = [regex]::Match($dom, '<pre id="__test_results">(.*?)</pre>', 'Singleline')
  if (-not $mm.Success -or [string]::IsNullOrWhiteSpace($mm.Groups[1].Value)) {
    Write-Host "La bateria no entrego resultados. Revisa errores de script en la app (index.html, js/, data/) o en tests/suite/."
    exit 2
  }
  $decoded = [Net.WebUtility]::HtmlDecode($mm.Groups[1].Value)
  if ($Script) { Write-Output $decoded; exit 0 }
  $res = $decoded | ConvertFrom-Json

  if ($res.failed -eq 0) {
    Write-Host "OK  $($res.passed)/$($res.total) casos de regresion pasaron ($secs s)"
    exit 0
  }
  Write-Host "FALLAN $($res.failed) de $($res.total) casos ($secs s):"
  foreach ($f in $res.failures) {
    Write-Host "  - $($f.name)"
    Write-Host "      $($f.message)"
  }
  exit 1
}
finally {
  Remove-Item -Recurse -Force $work -ErrorAction SilentlyContinue
}
