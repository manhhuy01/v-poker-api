#!/usr/bin/env bash
# Backup Postgres -> poker.sql (data-only, cùng format với dump cũ trong repo).
#
# Cách dùng:
#   export DATABASE_URL='postgresql://neondb_owner:xxx@ep-xxx-pooler....neon.tech/neondb?sslmode=require'
#   ./scripts/backup_poker_sql.sh                    # ghi ra ../poker.sql (cạnh repo)
#   ./scripts/backup_poker_sql.sh /duong/dan/poker.sql
#
# File sinh ra dùng trực tiếp được với ./scripts/migrate_to_neon.sh
# (schema lấy từ scripts/init_db.sql, data lấy từ file này).
#
# Yêu cầu: psql + pg_dump >= 18 (giống version đang dùng cho repo này).

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:-$REPO_ROOT/../poker.sql}"

: "${DATABASE_URL:?Chưa export DATABASE_URL (connection string Postgres)}"
command -v psql    >/dev/null 2>&1 || { echo "✗ Không tìm thấy psql trong PATH"; exit 1; }
command -v pg_dump >/dev/null 2>&1 || { echo "✗ Không tìm thấy pg_dump trong PATH"; exit 1; }

PG_MAJOR="$(pg_dump --version | grep -oE '[0-9]+' | head -1)"
HOST_DISPLAY="$(printf '%s' "$DATABASE_URL" | sed -E 's#://[^@]+@#://***@#')"

mkdir -p "$(dirname "$OUT")"
OUT_DIR="$(cd "$(dirname "$OUT")" && pwd)"
OUT="$OUT_DIR/$(basename "$OUT")"

# Ghi ra file tạm rồi mới mv: dump lỗi giữa chừng không làm hỏng file backup cũ.
TMP="$(mktemp "${OUT}.XXXXXX")"
trap 'rm -f "$TMP"' EXIT

echo "→ nguồn: $HOST_DISPLAY"
echo "→ đích : $OUT"
echo "[1/3] pg_dump --data-only..."
pg_dump "$DATABASE_URL" \
  --data-only --no-owner --no-privileges --format=plain \
  --file="$TMP"

[ -s "$TMP" ] || { echo "✗ Dump rỗng, không ghi đè file cũ"; exit 1; }

echo "[2/3] Kiểm tra số dòng..."
SRC_ACCOUNTS="$(psql "$DATABASE_URL" -qAtc 'select count(*) from public.accounts')"
DUMP_ACCOUNTS="$(awk '
  /^COPY public\.accounts / { inblk = 1; next }
  inblk && /^\\\.$/         { inblk = 0; next }
  inblk                     { n++ }
  END                       { print n + 0 }
' "$TMP")"
TABLES="$(grep -c '^COPY public\.' "$TMP" || true)"

if [ "$SRC_ACCOUNTS" != "$DUMP_ACCOUNTS" ]; then
  echo "✗ Số account không khớp: DB=$SRC_ACCOUNTS, dump=$DUMP_ACCOUNTS — không ghi đè"
  exit 1
fi

echo "[3/3] Ghi file..."
mv "$TMP" "$OUT"
trap - EXIT

echo
echo "✓ Backup xong: $OUT ($(du -h "$OUT" | cut -f1))"
echo "  COPY blocks : $TABLES"
echo "  accounts    : $DUMP_ACCOUNTS"
if [ "${PG_MAJOR:-0}" -lt 18 ]; then
  echo "  ⚠ pg_dump $PG_MAJOR (< 18): file không có \\restrict, psql cũ vẫn đọc được"
fi
echo "  khôi phục   : psql \"\$DATABASE_URL\" -f scripts/init_db.sql && psql \"\$DATABASE_URL\" -f \"$OUT\""
