#!/usr/bin/env bash
# Database backup script — run on a cron schedule in production

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="school_timesheet_${TIMESTAMP}.sql.gz"

# Load .env if present
if [ -f "$(dirname "$0")/../backend/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  source "$(dirname "$0")/../backend/.env"
  set +a
fi

# Parse DATABASE_URL  postgresql://user:pass@host:port/dbname
DB_URL="${DATABASE_URL:-}"
if [ -z "$DB_URL" ]; then
  echo "ERROR: DATABASE_URL not set"
  exit 1
fi

DB_USER=$(echo "$DB_URL" | sed -n 's|.*://\([^:]*\):.*|\1|p')
DB_PASS=$(echo "$DB_URL" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')
DB_HOST=$(echo "$DB_URL" | sed -n 's|.*@\([^:/]*\)[:/].*|\1|p')
DB_PORT=$(echo "$DB_URL" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
DB_NAME=$(echo "$DB_URL" | sed -n 's|.*/\([^?]*\).*|\1|p')

mkdir -p "$BACKUP_DIR"

echo "Backing up database $DB_NAME → $BACKUP_DIR/$FILENAME"

PGPASSWORD="$DB_PASS" pg_dump \
  -h "$DB_HOST" \
  -p "${DB_PORT:-5432}" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --no-password \
  --format=custom \
  | gzip > "$BACKUP_DIR/$FILENAME"

echo "Backup complete: $BACKUP_DIR/$FILENAME ($(du -sh "$BACKUP_DIR/$FILENAME" | cut -f1))"

# Retain last 30 backups
cd "$BACKUP_DIR"
ls -1t school_timesheet_*.sql.gz 2>/dev/null | tail -n +31 | xargs -r rm -f
echo "Cleanup done — kept latest 30 backups."
