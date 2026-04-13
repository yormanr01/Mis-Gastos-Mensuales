# Ejecuta la app en Chrome leyendo SUPABASE_URL y SUPABASE_ANON_KEY desde .env
# Uso: .\run_web.ps1
# Opcional: $env:FLUTTER_WEB_PORT = "9200"

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$envPath = Join-Path $PSScriptRoot ".env"
if (-not (Test-Path $envPath)) {
  $parentEnv = Join-Path (Split-Path $PSScriptRoot -Parent) ".env"
  if (Test-Path $parentEnv) {
    $envPath = $parentEnv
    Write-Host "Usando .env del repositorio raíz: $envPath"
  }
}

if (-not (Test-Path $envPath)) {
  Write-Host "No se encontró .env"
  Write-Host "1. Copia env.example a mis_gastos_supabase\.env"
  Write-Host "2. Pega tu URL y anon key (Project Settings → API en Supabase)"
  exit 1
}

$dartDefines = @()
Get-Content $envPath | ForEach-Object {
  $line = $_.Trim()
  if ($line -match '^\s*#' -or $line -eq '') { return }
  if ($line -match '^([^=]+)=(.*)$') {
    $k = $matches[1].Trim()
    $v = $matches[2].Trim().Trim('"').Trim("'")
    if ($k -eq "SUPABASE_URL" -or $k -eq "SUPABASE_ANON_KEY") {
      $dartDefines += "--dart-define=${k}=$v"
    }
  }
}

if ($dartDefines.Count -lt 2) {
  Write-Host "En $envPath deben existir las líneas:"
  Write-Host "  SUPABASE_URL=..."
  Write-Host "  SUPABASE_ANON_KEY=..."
  exit 1
}

$port = if ($env:FLUTTER_WEB_PORT) { $env:FLUTTER_WEB_PORT } else { "9155" }
Write-Host "flutter run (puerto $port)..."
flutter run -d chrome --web-port $port @dartDefines
