param(
  [Parameter(Mandatory=$true)]
  [string]$Db
)

$ErrorActionPreference = 'Stop'

if (-not (Get-Command turso -ErrorAction SilentlyContinue)) {
  throw "turso CLI not found in PATH. Install Turso CLI first, then re-run."
}

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$migrationsDir = Join-Path $root 'prisma\migrations'

if (-not (Test-Path $migrationsDir)) {
  throw "Migrations directory not found: $migrationsDir"
}

$migrationFiles = Get-ChildItem -Path $migrationsDir -Directory |
  Sort-Object Name |
  ForEach-Object { Join-Path $_.FullName 'migration.sql' } |
  Where-Object { Test-Path $_ }

if (-not $migrationFiles -or $migrationFiles.Count -eq 0) {
  throw "No migration.sql files found under $migrationsDir"
}

foreach ($file in $migrationFiles) {
  Write-Host "Applying $file" -ForegroundColor Cyan
  Get-Content $file | turso db shell $Db
}

Write-Host "Done." -ForegroundColor Green
