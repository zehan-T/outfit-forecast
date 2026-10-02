param([int]$Port = 4174)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$serverScript = Join-Path $PSScriptRoot 'serve.ps1'
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
if (-not (Test-Path -LiteralPath $chrome)) { throw 'Google Chrome is required for the dependency-free browser tests.' }
$temporaryRoot = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
$browserProfile = Join-Path $temporaryRoot ("outfit-forecast-tests-{0}" -f [guid]::NewGuid())
New-Item -ItemType Directory -Path $browserProfile | Out-Null

$serverArguments = @(
  '-NoProfile',
  '-ExecutionPolicy', 'Bypass',
  '-File', ('"{0}"' -f $serverScript),
  '-Root', ('"{0}"' -f $projectRoot),
  '-Port', $Port
)
$serverProcess = Start-Process -FilePath 'powershell.exe' -ArgumentList $serverArguments -WindowStyle Hidden -PassThru

try {
  $ready = $false
  for ($attempt = 0; $attempt -lt 40; $attempt += 1) {
    try {
      $client = [System.Net.Sockets.TcpClient]::new()
      $client.Connect('127.0.0.1', $Port)
      $client.Dispose()
      $ready = $true
      break
    } catch {
      Start-Sleep -Milliseconds 100
    }
  }
  if (-not $ready) { throw "Local test server did not start on port $Port." }

  $url = "http://127.0.0.1:$Port/tests/"
  $chromeArguments = @('--headless', '--disable-gpu', '--hide-scrollbars', '--no-first-run', ("--user-data-dir={0}" -f $browserProfile), '--virtual-time-budget=3000', '--dump-dom', $url)
  $dom = (& $chrome $chromeArguments 2>$null) -join "`n"
  if ($null -ne $LASTEXITCODE -and $LASTEXITCODE -ne 0) { throw "Chrome exited with code $LASTEXITCODE." }
  if ($dom -notmatch 'data-status="passed"') {
    $failureLines = [regex]::Matches($dom, 'FAIL[^<]*') | ForEach-Object { $_.Value }
    throw "Browser tests failed. $($failureLines -join '; ')"
  }
  $summary = [regex]::Match($dom, '<p id="summary"[^>]*>([^<]+)</p>').Groups[1].Value
  Write-Host "PASS: $summary"
} finally {
  if ($serverProcess -and -not $serverProcess.HasExited) {
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    $serverProcess.WaitForExit(3000) | Out-Null
  }
  $resolvedProfile = [System.IO.Path]::GetFullPath($browserProfile)
  if ($resolvedProfile.StartsWith($temporaryRoot, [System.StringComparison]::OrdinalIgnoreCase) -and
      (Split-Path -Leaf $resolvedProfile).StartsWith('outfit-forecast-tests-')) {
    Remove-Item -LiteralPath $resolvedProfile -Recurse -Force -ErrorAction SilentlyContinue
  }
}
