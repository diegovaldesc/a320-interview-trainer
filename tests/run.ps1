# Corre la bateria de regresion (tests/suite.js) dentro de la propia app,
# en un Chrome o Edge sin ventana. No necesita Node ni instalar nada.
#
#   powershell -ExecutionPolicy Bypass -File tests\run.ps1
#
# Sale con codigo 0 si todos los casos pasan, 1 si alguno falla y 2 si la
# bateria no pudo ejecutarse. El detalle de cada caso esta en TESTING.md.
param([string]$Browser = "")
$ErrorActionPreference = "Stop"

$root  = Split-Path -Parent $PSScriptRoot
$index = Join-Path $root "index.html"
$suite = Join-Path $PSScriptRoot "suite.js"

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
  $suiteText = [IO.File]::ReadAllText($suite, [Text.Encoding]::UTF8)
  if ($suiteText.Contains("</script")) { throw "suite.js no puede contener la secuencia </script" }

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

  $profile = Join-Path $work "profile"
  $out = Join-Path $work "dom.html"
  $err = Join-Path $work "err.txt"
  $url = ([Uri]$page).AbsoluteUri
  $argList = @("--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
               "--disable-extensions", "--user-data-dir=`"$profile`"", "--virtual-time-budget=20000",
               "--dump-dom", $url)

  $sw = [Diagnostics.Stopwatch]::StartNew()
  $p = Start-Process -FilePath $browserExe -ArgumentList $argList -NoNewWindow -PassThru `
        -RedirectStandardOutput $out -RedirectStandardError $err
  if (-not $p.WaitForExit(120000)) {
    try { $p.Kill() } catch {}
    Write-Host "Tiempo agotado esperando al navegador."; exit 2
  }
  $secs = [math]::Round($sw.Elapsed.TotalSeconds, 1)

  $dom = [IO.File]::ReadAllText($out, [Text.Encoding]::UTF8)
  $mm = [regex]::Match($dom, '<pre id="__test_results">(.*?)</pre>', 'Singleline')
  if (-not $mm.Success -or [string]::IsNullOrWhiteSpace($mm.Groups[1].Value)) {
    Write-Host "La bateria no entrego resultados. Revisa errores de script en index.html o tests/suite.js."
    exit 2
  }
  $res = ([Net.WebUtility]::HtmlDecode($mm.Groups[1].Value)) | ConvertFrom-Json

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
