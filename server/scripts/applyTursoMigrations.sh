#!/usr/bin/env bash
set -euo pipefail

DB_NAME="${1:-}"
if [[ -z "$DB_NAME" ]]; then
  echo "Usage: ./server/scripts/applyTursoMigrations.sh <turso-db-name>" >&2
  exit 1
fi

if ! command -v turso >/dev/null 2>&1; then
  echo "turso CLI not found. Install it (WSL recommended on Windows) then re-run." >&2
  exit 1
fi

MIGRATIONS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/prisma/migrations"

mapfile -t MIGRATION_FILES < <(find "$MIGRATIONS_DIR" -maxdepth 2 -mindepth 2 -type f -name migration.sql | sort)

if [[ ${#MIGRATION_FILES[@]} -eq 0 ]]; then
  echo "No migration.sql files found under $MIGRATIONS_DIR" >&2
  exit 1
fi

for file in "${MIGRATION_FILES[@]}"; do
  echo "Applying $file"
  turso db shell "$DB_NAME" < "$file"
done

echo "Done."
