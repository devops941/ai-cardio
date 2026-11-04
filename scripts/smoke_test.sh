#!/usr/bin/env bash
# End-to-end smoke test (Section 12.4).
# Runs against a live stack started with LLM_MOCK=true.
# Exits non-zero on the first failure and prints PASS/FAIL per step.

set -u

AI_URL="${AI_URL:-http://localhost:8000}"
WEB_URL="${WEB_URL:-http://localhost:3000}"

# Fall back to the env files so the shared secret and seeded admin match the stack.
read_env() {
  # read_env <file> <key>: print the value with surrounding quotes removed.
  [ -f "$1" ] || return 0
  awk -F= -v key="$2" '
    $1 == key {
      value = substr($0, length(key) + 2)
      gsub(/^["'"'"']|["'"'"']$/, "", value)
      print value
      exit
    }
  ' "$1"
}

INTERNAL_KEY="${INTERNAL_API_KEY:-$(read_env ai-service/.env INTERNAL_API_KEY)}"
INTERNAL_KEY="${INTERNAL_KEY:-$(read_env web/.env.local INTERNAL_API_KEY)}"
INTERNAL_KEY="${INTERNAL_KEY:-change-me-internal-key}"
ADMIN_EMAIL="${SEED_ADMIN_EMAIL:-$(read_env web/.env.local SEED_ADMIN_EMAIL)}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@healthassistant.ai}"
ADMIN_PASSWORD="${SEED_ADMIN_PASSWORD:-$(read_env web/.env.local SEED_ADMIN_PASSWORD)}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-Admin@12345}"
USER_EMAIL="${SMOKE_USER_EMAIL:-smoke.user.$(date +%s)@example.com}"
USER_PASSWORD="${SMOKE_USER_PASSWORD:-Smoke@12345}"
# shellcheck disable=SC2016
USER_EMAIL=$(eval echo "$USER_EMAIL")

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

FAILED=0

pass() { printf 'PASS  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1"; FAILED=1; }

check() {
  # check <description> <expected-status> <actual-status>
  if [ "$2" = "$3" ]; then pass "$1"; else fail "$1 (expected $2, got $3)"; fi
}

code() { curl -s -o /dev/null -w '%{http_code}' "$@"; }

# 1. AI health and auth.
check "AI /health" 200 "$(code "$AI_URL/health")"
check "AI /ml/versions without key -> 401" 401 "$(code "$AI_URL/ml/versions")"

# 2. Ingest the sample knowledge base directly.
for file in docs/knowledge/heart_symptoms_kb.xlsx docs/knowledge/heart_basics.md; do
  [ -f "$file" ] || continue
  status=$(curl -s -o "$TMP/ingest.json" -w '%{http_code}' \
    -H "X-Internal-Key: $INTERNAL_KEY" \
    -F "file=@$file" -F "document_id=smoke-$(basename "$file")" \
    "$AI_URL/ingest")
  check "AI ingest $(basename "$file")" 200 "$status"
done

chunks=$(curl -s -H "X-Internal-Key: $INTERNAL_KEY" "$AI_URL/documents/stats" \
  | python3 -c 'import json,sys; print(json.load(sys.stdin).get("total_chunks", 0))' 2>/dev/null || echo 0)
if [ "${chunks:-0}" -gt 0 ]; then pass "AI /documents/stats chunks > 0 ($chunks)"; else fail "AI /documents/stats chunks = 0"; fi

# 3. Clinical prediction with a Cleveland record.
clinical='{"age":57,"sex":1,"cp":4,"trestbps":140,"chol":241,"fbs":0,"restecg":1,"thalach":123,"exang":1,"oldpeak":0.2,"slope":2,"ca":0,"thal":7}'
status=$(curl -s -o "$TMP/clinical.json" -w '%{http_code}' \
  -H "X-Internal-Key: $INTERNAL_KEY" -H "Content-Type: application/json" \
  -d "$clinical" "$AI_URL/predict/clinical")
check "AI /predict/clinical" 200 "$status"

# 4. Web auth: admin, demo user, anonymous.
login() {
  # login <jar> <email> <password>
  local jar="$1" email="$2" password="$3"
  local csrf
  csrf=$(curl -s -c "$jar" "$WEB_URL/api/auth/csrf" \
    | python3 -c 'import json,sys; print(json.load(sys.stdin)["csrfToken"])')
  curl -s -b "$jar" -c "$jar" -o /dev/null \
    --data-urlencode "csrfToken=$csrf" --data-urlencode "email=$email" \
    --data-urlencode "password=$password" --data-urlencode "callbackUrl=$WEB_URL" \
    --data-urlencode "json=true" \
    "$WEB_URL/api/auth/callback/credentials"
}

login "$TMP/admin.jar" "$ADMIN_EMAIL" "$ADMIN_PASSWORD"
check "admin GET /api/admin/stats" 200 "$(code -b "$TMP/admin.jar" "$WEB_URL/api/admin/stats")"
check "anonymous POST /api/check -> 401" 401 "$(code -X POST "$WEB_URL/api/check")"

# 5. Admin document upload + hospital CSV import.
if [ -f docs/knowledge/heart_basics.md ]; then
  status=$(curl -s -o "$TMP/upload.json" -w '%{http_code}' -b "$TMP/admin.jar" \
    -F "file=@docs/knowledge/heart_basics.md" "$WEB_URL/api/admin/documents")
  if [ "$status" = "201" ] || [ "$status" = "409" ]; then
    pass "admin upload document ($status)"
  else
    fail "admin upload document (got $status)"
  fi
fi

if [ -f web/public/templates/hospitals_template.csv ]; then
  status=$(curl -s -o "$TMP/import.json" -w '%{http_code}' -b "$TMP/admin.jar" \
    -F "file=@web/public/templates/hospitals_template.csv" "$WEB_URL/api/admin/hospitals/import")
  check "admin hospital import" 200 "$status"
fi

# 6. User symptom check.
register_status=$(curl -s -o /dev/null -w '%{http_code}' -H "Content-Type: application/json" \
  -d "{\"name\":\"Smoke User\",\"email\":\"$USER_EMAIL\",\"password\":\"$USER_PASSWORD\",\"consent\":true,\"adult\":true}" \
  "$WEB_URL/api/auth/register")
if [ "$register_status" = "201" ] || [ "$register_status" = "409" ]; then
  pass "user register ($register_status)"
else
  fail "user register (got $register_status)"
fi

login "$TMP/user.jar" "$USER_EMAIL" "$USER_PASSWORD"
check "user GET /api/admin/stats -> 403" 403 "$(code -b "$TMP/user.jar" "$WEB_URL/api/admin/stats")"

emergency='{"symptoms":["chest_pain","pain_spreading","cold_sweat"],"duration":"15_60min","severity":8,"sudden":false,"consent":true,"age":58,"gender":"male","riskFactors":["smoking"],"location":{"city":"Bengaluru"}}'
status=$(curl -s -o "$TMP/check.json" -w '%{http_code}' -b "$TMP/user.jar" \
  -H "Content-Type: application/json" -d "$emergency" "$WEB_URL/api/check")
check "user POST /api/check (emergency)" 200 "$status"
if grep -q '"finalRisk":"HIGH"' "$TMP/check.json" && grep -q '"emergency":true' "$TMP/check.json"; then
  pass "emergency check -> HIGH risk + banner"
else
  fail "emergency check did not return HIGH risk + banner"
fi

nonheart='{"symptoms":[],"freeText":"fever and cough","consent":true}'
status=$(curl -s -o "$TMP/nonheart.json" -w '%{http_code}' -b "$TMP/user.jar" \
  -H "Content-Type: application/json" -d "$nonheart" "$WEB_URL/api/check")
check "user POST /api/check (non-heart)" 200 "$status"

# 7. Hospital search.
check "GET /api/hospitals/nearby" 200 "$(code -b "$TMP/user.jar" "$WEB_URL/api/hospitals/nearby?city=Bengaluru")"
check "GET /api/hospitals?city=Chennai" 200 "$(code -b "$TMP/user.jar" "$WEB_URL/api/hospitals?city=Chennai")"

# 8. Rate limit: the 11th check within a minute is 429.
last=""
for _ in $(seq 1 11); do
  last=$(code -b "$TMP/user.jar" -H "Content-Type: application/json" -d "$nonheart" "$WEB_URL/api/check")
done
check "11th /api/check -> 429" 429 "$last"

if [ "$FAILED" -eq 0 ]; then
  echo "ALL SMOKE STEPS PASSED"
  exit 0
fi
echo "SMOKE TEST FAILED"
exit 1
