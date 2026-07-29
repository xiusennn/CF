#!/usr/bin/env bash
# ToolHub - one-click deploy to Cloudflare Workers (static-first).
# macOS/Linux counterpart of deploy.bat. Usage: bash deploy.sh
set -uo pipefail
cd "$(dirname "$0")"

# ---------------- Config ----------------
CF_TOKEN=""                 # Optional: hardcode your Cloudflare API token; else prompted.
PROXY_URL=""                # Optional: e.g. http://127.0.0.1:7890
DEPLOY_RETRIES=3
RUN_TESTS=1                 # 1 = run fast Node unit tests before deploy.
WARM_AFTER_DEPLOY=1
PUBLIC_SITE_URL=""          # Fallback URL if wrangler output can't be parsed.
# ----------------------------------------

echohr(){ echo "=================================================="; }
echohr; echo "  ToolHub - one-click deploy to Cloudflare Workers"; echohr; echo

command -v node >/dev/null 2>&1 || { echo "[ERROR] Node.js not found. Install from https://nodejs.org"; exit 1; }
command -v curl >/dev/null 2>&1 || echo "[WARN] curl not found; network pre-check and warm-up limited."

: "${CLOUDFLARE_API_TOKEN:=$CF_TOKEN}"
if [ -z "${CLOUDFLARE_API_TOKEN}" ]; then read -r -p "Paste your Cloudflare API Token: " CLOUDFLARE_API_TOKEN; fi
[ -n "${CLOUDFLARE_API_TOKEN}" ] || { echo "[ERROR] No API Token provided."; exit 1; }
export CLOUDFLARE_API_TOKEN

if [ -n "$PROXY_URL" ]; then
  echo "[INFO] Using proxy: $PROXY_URL"
  export HTTP_PROXY="$PROXY_URL" HTTPS_PROXY="$PROXY_URL" ALL_PROXY="$PROXY_URL"
else
  echo "[INFO] No proxy configured."
fi

echo; echo "[0/5] Cloudflare network pre-check..."
if command -v curl >/dev/null 2>&1; then
  if curl -I --connect-timeout 15 --max-time 30 https://api.cloudflare.com/client/v4 >/tmp/th_cf_api_check.log 2>&1; then
    echo "[OK] Cloudflare API is reachable."
  else
    echo "[WARN] Cannot reach Cloudflare API. Check network/proxy/firewall/VPN."; cat /tmp/th_cf_api_check.log
  fi
fi

echo; echo "[1/5] Installing Wrangler dependencies (first run only)..."
npm install || { echo "[ERROR] npm install failed."; exit 1; }

echo; echo "[2/5] Checking Cloudflare token with Wrangler..."
if ! npx wrangler whoami; then
  echo "[ERROR] Wrangler cannot verify your token/account."
  echo "  - Token needs 'Workers Scripts:Edit'."
  echo "  - If behind a proxy/VPN, set PROXY_URL at the top of deploy.sh."
  exit 1
fi

echo; echo "[3/5] Building static site..."
node build/build.mjs || { echo "[ERROR] Build failed."; exit 1; }

if [ "$RUN_TESTS" = "1" ]; then
  echo; echo "[3b] Running fast Node unit tests..."
  for t in core.test.mjs core.v2.test.mjs core.v3.test.mjs core.v4.test.mjs; do
    node "tests/$t" || { echo "[ERROR] Unit tests failed ($t) - aborting deploy."; exit 1; }
  done
  echo "[OK] All unit tests passed."
fi

echo; echo "[4/5] Deploying Worker + static assets..."
SITE_URL=""; DEPLOY_OK=0
for try in $(seq 1 "$DEPLOY_RETRIES"); do
  echo; echo "---- Deploy attempt $try / $DEPLOY_RETRIES ----"
  if npx wrangler deploy 2>&1 | tee /tmp/th_deploy.log; then DEPLOY_OK=1; break; fi
  echo "[WARN] Deploy attempt $try failed."
  if grep -Eiq "fetch failed|assets-upload-session|connectivity|proxy|firewall|network" /tmp/th_deploy.log; then
    echo "[DIAGNOSIS] Looks like a Cloudflare asset-upload network failure. Try PROXY_URL or another network."
  fi
  [ "$try" -lt "$DEPLOY_RETRIES" ] && { echo "Waiting 8s before retry..."; sleep 8; }
done

if [ "$DEPLOY_OK" != "1" ]; then
  echohr; echo "[ERROR] Deploy failed after $DEPLOY_RETRIES attempts. See /tmp/th_deploy.log"; echohr; exit 1
fi

SITE_URL=$(grep -Eio 'https://[a-z0-9.-]*workers\.dev[^ ]*' /tmp/th_deploy.log | head -n1)
[ -z "$SITE_URL" ] && SITE_URL="$PUBLIC_SITE_URL"

if [ "$WARM_AFTER_DEPLOY" = "1" ] && [ -n "$SITE_URL" ] && command -v curl >/dev/null 2>&1; then
  echo; echo "[5/5] Warming key pages..."
  curl -L --connect-timeout 15 --max-time 60 "$SITE_URL/" >/dev/null 2>&1
  curl -L --connect-timeout 15 --max-time 60 "$SITE_URL/tools/ai-tools-directory.html" >/dev/null 2>&1
  curl -L --connect-timeout 15 --max-time 60 "$SITE_URL/healthz" >/dev/null 2>&1
  echo "[OK] Warmed homepage, AI Tools Directory and health endpoint."
fi

echo; echohr
if [ -n "$SITE_URL" ]; then
  echo "  Done!  Your site is LIVE at:"; echo; echo "      $SITE_URL"
  ( command -v open >/dev/null 2>&1 && open "$SITE_URL" ) || ( command -v xdg-open >/dev/null 2>&1 && xdg-open "$SITE_URL" ) || true
else
  echo "  Done!  Deploy finished. Open the https://...workers.dev URL shown above."
fi
echo "  If you still see old pages, hard-refresh (Ctrl/Cmd+Shift+R)."
echohr
