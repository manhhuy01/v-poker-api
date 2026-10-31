#!/usr/bin/env bash
# Migration: dump poker.sql (data-only) -> Postgres mới (Neon / Supabase / ...)
#
# Cách dùng:
#   export DATABASE_URL='postgresql://neondb_owner:xxx@ep-xxx-pooler....neon.tech/neondb?sslmode=require'
#   ./scripts/migrate_to_neon.sh                    # dùng ../poker.sql (cạnh repo)
#   ./scripts/migrate_to_neon.sh /duong/dan/poker.sql
#   RESET=1 ./scripts/migrate_to_neon.sh            # xoá 4 bảng rồi import lại (XOÁ DỮ LIỆU)
#
# Yêu cầu: psql >= 18 (dump tạo bằng pg_dump 18 nên có \restrict).
# Xong bước này DB dùng được cho cả bản Render (bcrypt native) và bản Worker (pgcrypto):
# hash được đổi $2b$ -> $2a$ (bcrypt native vẫn verify $2a$ bình thường).

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DUMP="${1:-$REPO_ROOT/../poker.sql}"
PSQL="${PSQL:-psql}"

# ---------------------------------------------------------------- kiểm tra
: "${DATABASE_URL:?Chưa export DATABASE_URL (connection string của Neon)}"
command -v "$PSQL" >/dev/null 2>&1 || { echo "✗ Không tìm thấy psql trong PATH"; exit 1; }
[ -f "$DUMP" ] || { echo "✗ Không thấy file dump: $DUMP"; exit 1; }

PG_MAJOR="$("$PSQL" --version | grep -oE '[0-9]+' | head -1)"
if [ "${PG_MAJOR:-0}" -lt 18 ]; then
  echo "⚠ psql $PG_MAJOR < 18: dump có \\restrict nên có thể lỗi. Dùng: PATH=/opt/homebrew/opt/postgresql@18/bin:\$PATH"
fi

HOST_DISPLAY="$(printf '%s' "$DATABASE_URL" | sed -E 's#://[^@]+@#://***@#')"
echo "→ DB   : $HOST_DISPLAY"
echo "→ dump : $DUMP"
echo

echo "[0/4] Kết nối thử..."
"$PSQL" "$DATABASE_URL" -v ON_ERROR_STOP=1 -qAtc "select 'ok'" >/dev/null
echo "      ok"

# ---------------------------------------------------------------- chống chạy đè
HAS_ACCOUNTS="$("$PSQL" "$DATABASE_URL" -qAtc "select to_regclass('public.accounts') is not null")"
ROWS=0
if [ "$HAS_ACCOUNTS" = "t" ]; then
  ROWS="$("$PSQL" "$DATABASE_URL" -qAtc "select count(*) from public.accounts")"
fi

if [ "$ROWS" -gt 0 ] && [ "${RESET:-0}" != "1" ]; then
  echo "✗ DB đã có $ROWS account — dừng để tránh ghi đè."
  echo "  Nếu chắc chắn muốn làm lại từ đầu: RESET=1 $0 $DUMP"
  exit 1
fi

if [ "${RESET:-0}" = "1" ]; then
  echo "[!] RESET=1 → xoá 4 bảng trên $HOST_DISPLAY"
  "$PSQL" "$DATABASE_URL" -v ON_ERROR_STOP=1 -q <<'SQL'
DROP TABLE IF EXISTS public.game_log CASCADE;
DROP TABLE IF EXISTS public.transaction_log CASCADE;
DROP TABLE IF EXISTS public.poker_log CASCADE;
DROP TABLE IF EXISTS public.accounts CASCADE;
SQL
fi

# ---------------------------------------------------------------- 1. schema
echo "[1/4] Tạo schema (scripts/init_db.sql)..."
"$PSQL" "$DATABASE_URL" -v ON_ERROR_STOP=1 -q -f "$REPO_ROOT/scripts/init_db.sql"

# ---------------------------------------------------------------- 2. data
echo "[2/4] Import dữ liệu (có thể mất vài giây)..."
"$PSQL" "$DATABASE_URL" -v ON_ERROR_STOP=1 -q --single-transaction -f "$DUMP" >/dev/null

# ---------------------------------------------------------------- 3. hậu xử lý
echo '[3/4] pgcrypto + đổi $2b$ -> $2a$ + resync sequence...'
"$PSQL" "$DATABASE_URL" -v ON_ERROR_STOP=1 -q <<'SQL'
CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE accounts
SET password = '$2a$' || substr(password, 5)
WHERE password LIKE '$2b$%';

SELECT setval(pg_get_serial_sequence('accounts', 'id'),          COALESCE((SELECT MAX(id) FROM accounts), 1));
SELECT setval(pg_get_serial_sequence('transaction_log', 'id'),   COALESCE((SELECT MAX(id) FROM transaction_log), 1));
SELECT setval(pg_get_serial_sequence('poker_log', 'id'),         COALESCE((SELECT MAX(id) FROM poker_log), 1));
SELECT setval(pg_get_serial_sequence('game_log', 'id'),          COALESCE((SELECT MAX(id) FROM game_log), 1));
SQL

# ---------------------------------------------------------------- 4. verify
echo "[4/4] Kiểm tra:"
"$PSQL" "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT 'accounts' AS bang, count(*) FROM accounts
UNION ALL SELECT 'transaction_log', count(*) FROM transaction_log
UNION ALL SELECT 'poker_log', count(*) FROM poker_log
UNION ALL SELECT 'game_log', count(*) FROM game_log
ORDER BY 1;

SELECT count(*) AS hash_con_2b FROM accounts WHERE password LIKE '$2b$%';
SELECT last_value AS accounts_id_seq FROM accounts_id_seq;
SQL

echo
echo "✓ Xong. Kiểm tra nhanh: login bằng 1 user cũ, hoặc:"
echo "  psql \"\$DATABASE_URL\" -c \"select username, balance from accounts order by id desc limit 5;\""
