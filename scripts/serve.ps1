param(
  [string]$Root = (Split-Path -Parent $PSScriptRoot),
  [int]$Port = 4173,
  [string]$BindAddress = '127.0.0.1',
  [int]$MaxRequests = 0
)

$ErrorActionPreference = 'Stop'
$resolvedRoot = [System.IO.Path]::GetFullPath((Resolve-Path -LiteralPath $Root).Path)
$rootPrefix = $resolvedRoot.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
$listenerAddress = [System.Net.IPAddress]::Parse($BindAddress)
$listener = [System.Net.Sockets.TcpListener]::new($listenerAddress, $Port)
$mimeTypes = @{
  '.html' = 'text/html; charset=utf-8'
  '.css' = 'text/css; charset=utf-8'
  '.js' = 'text/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.svg' = 'image/svg+xml'
  '.png' = 'image/png'
  '.jpg' = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
}

function Send-Response {
  param($Stream, [int]$Status, [string]$Reason, [byte[]]$Body, [string]$ContentType, [bool]$HeadOnly)
  $header = "HTTP/1.1 $Status $Reason`r`nContent-Type: $ContentType`r`nContent-Length: $($Body.Length)`r`nCache-Control: no-store`r`nConnection: close`r`n`r`n"
  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
  $Stream.Write($headerBytes, 0, $headerBytes.Length)
  if (-not $HeadOnly -and $Body.Length -gt 0) { $Stream.Write($Body, 0, $Body.Length) }
}

$requestCount = 0
$listener.Start()
Write-Host "Serving $resolvedRoot at http://${BindAddress}:$Port/"

try {
  while ($MaxRequests -eq 0 -or $requestCount -lt $MaxRequests) {
    $client = $listener.AcceptTcpClient()
    try {
      $stream = $client.GetStream()
      $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
      $requestLine = $reader.ReadLine()
      while ($reader.ReadLine()) { }
      if (-not $requestLine) { continue }
      $parts = $requestLine.Split(' ')
      $method = $parts[0]
      $requestTarget = $parts[1].Split('?')[0]
      $relative = [System.Uri]::UnescapeDataString($requestTarget).TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
      if ([string]::IsNullOrWhiteSpace($relative)) { $relative = 'index.html' }
      $candidate = [System.IO.Path]::GetFullPath((Join-Path $resolvedRoot $relative))
      if ((Test-Path -LiteralPath $candidate -PathType Container)) { $candidate = Join-Path $candidate 'index.html' }

      if (-not $candidate.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
        Send-Response $stream 403 'Forbidden' ([System.Text.Encoding]::UTF8.GetBytes('Forbidden')) 'text/plain; charset=utf-8' ($method -eq 'HEAD')
      } elseif (-not (Test-Path -LiteralPath $candidate -PathType Leaf)) {
        Send-Response $stream 404 'Not Found' ([System.Text.Encoding]::UTF8.GetBytes('Not found')) 'text/plain; charset=utf-8' ($method -eq 'HEAD')
      } else {
        $body = [System.IO.File]::ReadAllBytes($candidate)
        $extension = [System.IO.Path]::GetExtension($candidate).ToLowerInvariant()
        $contentType = if ($mimeTypes.ContainsKey($extension)) { $mimeTypes[$extension] } else { 'application/octet-stream' }
        Send-Response $stream 200 'OK' $body $contentType ($method -eq 'HEAD')
      }
    } catch {
      Write-Warning $_.Exception.Message
    } finally {
      $requestCount += 1
      if ($reader) { $reader.Dispose() }
      if ($stream) { $stream.Dispose() }
      $client.Dispose()
    }
  }
} finally {
  $listener.Stop()
}
