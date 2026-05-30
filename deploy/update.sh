#!/usr/bin/env bash
# Zentrox VPS — pull latest code, rebuild frontend, refresh backend deps, restart API.
#
# Usage (on the VPS, from anywhere):
#   sudo bash /var/www/zentrox/deploy/update.sh
#
# Options:
#   --skip-pull       Do not run git pull
#   --sync-nginx      Copy deploy/nginx/zentrox.conf and reload nginx
#   --sync-systemd    Copy deploy/systemd/zentrox-api.service and restart API unit
#   --no-restart-api  Skip systemctl restart zentrox-api
#   --help            Show usage
#
# Environment:
#   APP_ROOT          App directory (default: /var/www/zentrox)
#   SITE_URL          Health-check URL (default: https://zentrox.us)

set -euo pipefail

APP_ROOT="${APP_ROOT:-/var/www/zentrox}"
SITE_URL="${SITE_URL:-https://zentrox.us}"
SKIP_PULL=0
SYNC_NGINX=0
SYNC_SYSTEMD=0
RESTART_API=1

log() { printf '[zentrox-update] %s\n' "$*"; }
die() { printf '[zentrox-update] ERROR: %s\n' "$*" >&2; exit 1; }

usage() {
  sed -n '2,16p' "$0" | sed 's/^# \?//'
  exit 0
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-pull) SKIP_PULL=1 ;;
    --sync-nginx) SYNC_NGINX=1 ;;
    --sync-systemd) SYNC_SYSTEMD=1 ;;
    --no-restart-api) RESTART_API=0 ;;
    --help|-h) usage ;;
    *) die "Unknown option: $1 (try --help)" ;;
  esac
  shift
done

[[ -d "$APP_ROOT" ]] || die "APP_ROOT not found: $APP_ROOT"
[[ -d "$APP_ROOT/.git" ]] || die "Not a git repo: $APP_ROOT"

command -v node >/dev/null 2>&1 || die "node is not installed"
command -v npm >/dev/null 2>&1 || die "npm is not installed"
command -v git >/dev/null 2>&1 || die "git is not installed"

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
[[ "$NODE_MAJOR" -ge 20 ]] || die "Node 20+ required (found: $(node -v))"

cd "$APP_ROOT"

if [[ "$SKIP_PULL" -eq 0 ]]; then
  log "Pulling latest code…"
  git pull --ff-only
fi

log "Installing backend dependencies…"
(cd back && npm ci --omit=dev)

if [[ ! -f back/.env ]]; then
  die "Missing back/.env — copy deploy/env.production.example and configure secrets first"
fi

log "Building frontend…"
(cd front && npm ci && npm run build)

[[ -f front/dist/zentrox/browser/index.html ]] \
  || die "Frontend build missing: front/dist/zentrox/browser/index.html"
[[ -f front/dist/zentrox/browser/404.html ]] \
  || die "Frontend build missing: front/dist/zentrox/browser/404.html"

for img in slider-0.jpg slider-1.jpg slider-2.jpg client-0.jpg client-1.jpg client-2.jpg; do
  [[ -f "front/img/$img" ]] || die "Missing static image: front/img/$img"
done

if [[ -d front/img/portfolio ]]; then
  if [[ "$(id -u)" -eq 0 ]]; then
    log "Ensuring portfolio upload dir is writable by www-data…"
    chown -R www-data:www-data front/img/portfolio
    chmod -R u+rwX,g+rwX front/img/portfolio
  else
    log "Tip: run with sudo once if portfolio uploads fail (www-data needs write access)"
  fi
fi

if [[ "$SYNC_NGINX" -eq 1 ]]; then
  [[ "$(id -u)" -eq 0 ]] || die "--sync-nginx requires root (use sudo)"
  log "Installing nginx site config…"
  cp deploy/nginx/zentrox.conf /etc/nginx/sites-available/zentrox.conf
  ln -sf /etc/nginx/sites-available/zentrox.conf /etc/nginx/sites-enabled/zentrox.conf
  nginx -t
  systemctl reload nginx
fi

if [[ "$SYNC_SYSTEMD" -eq 1 ]]; then
  [[ "$(id -u)" -eq 0 ]] || die "--sync-systemd requires root (use sudo)"
  log "Installing systemd unit…"
  cp deploy/systemd/zentrox-api.service /etc/systemd/system/zentrox-api.service
  systemctl daemon-reload
  systemctl enable zentrox-api
fi

if [[ "$RESTART_API" -eq 1 ]]; then
  [[ "$(id -u)" -eq 0 ]] || die "Restarting API requires root (use sudo)"
  log "Restarting zentrox-api…"
  systemctl restart zentrox-api
  systemctl is-active --quiet zentrox-api || {
    journalctl -u zentrox-api -n 30 --no-pager >&2 || true
    die "zentrox-api failed to start"
  }
fi

if command -v curl >/dev/null 2>&1; then
  log "Checking API health…"
  HEALTH="$(curl -fsS "${SITE_URL}/api/health" 2>/dev/null || true)"
  if [[ "$HEALTH" == *'"ok":true'* ]]; then
    log "API health OK"
  else
    log "WARN: API health check did not return ok (response: ${HEALTH:-none})"
  fi

  for img in slider-0.jpg client-0.jpg; do
    CODE="$(curl -sS -o /dev/null -w '%{http_code}' "${SITE_URL}/img/${img}" || echo 000)"
    if [[ "$CODE" == "200" ]]; then
      log "Image OK: /img/${img}"
    else
      log "WARN: /img/${img} returned HTTP ${CODE}"
    fi
  done
else
  log "curl not installed — skipping HTTP checks"
fi

log "Done. Hard-refresh https://zentrox.us/ in the browser (Ctrl+Shift+R)."
