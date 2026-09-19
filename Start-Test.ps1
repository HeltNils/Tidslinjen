$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$runtime = Get-Command node -ErrorAction SilentlyContinue
if ($runtime) {
    $nodePath = $runtime.Source
} else {
    $portableRoot = Join-Path $env:TEMP 'tidslinjen-node'
    $portable = Get-ChildItem -LiteralPath $portableRoot -Filter node.exe -Recurse -ErrorAction SilentlyContinue |
        Select-Object -First 1
    if (-not $portable) { throw 'Installer Node.js 24 LTS og start på nytt.' }
    $nodePath = $portable.FullName
}
Write-Host 'Åpne http://127.0.0.1:3000 i nettleseren. Ctrl+C stopper serveren.'
& $nodePath server.mjs
