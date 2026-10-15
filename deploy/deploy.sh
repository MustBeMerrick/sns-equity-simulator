#!/usr/bin/env bash
# Deploy control for sns-equity-simulator -> gmktec home server. Run from the Mac.
# Usage: deploy/deploy.sh <deploy|logs|status|restart|stop>
set -euo pipefail

HOST="${DEPLOY_HOST:-gmktec}"
ROOT="${DEPLOY_ROOT:-apps/sns-equity-simulator}"   # relative to $HOME on the server
SRC="$ROOT/src"
COMPOSE="docker compose -f deploy/compose.yml"

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cmd_deploy() {
  cd "$REPO_ROOT"
  if ! git diff-index --quiet HEAD --; then
    echo "warning: uncommitted changes -- deploying committed HEAD only" >&2
  fi
  local tmp
  tmp="$(mktemp -d)"
  # expand $tmp now: it's a local and would be gone when the EXIT trap fires
  trap "rm -rf '$tmp'" EXIT
  # src-tauri isn't needed for the web build and carries the bulk of the icons
  git archive HEAD | tar -x -C "$tmp" --exclude=src-tauri
  ssh "$HOST" "mkdir -p ~/$SRC"
  rsync -az --delete "$tmp"/ "$HOST:$SRC/"
  ssh "$HOST" "set -e; cd ~/$SRC; $COMPOSE build app; $COMPOSE up -d app"
  echo "deployed $(git rev-parse --short HEAD) -> https://snequity.mustbemerrick.com"
}

cmd_logs()    { ssh "$HOST" "cd ~/$SRC && $COMPOSE logs -f --tail=200 app"; }
cmd_status()  { ssh "$HOST" "cd ~/$SRC && $COMPOSE ps"; }
cmd_restart() { ssh "$HOST" "cd ~/$SRC && $COMPOSE up -d app"; }
cmd_stop()    { ssh "$HOST" "cd ~/$SRC && $COMPOSE stop app"; }

case "${1:-}" in
  deploy)   cmd_deploy ;;
  logs)     cmd_logs ;;
  status)   cmd_status ;;
  restart)  cmd_restart ;;
  stop)     cmd_stop ;;
  *) echo "usage: $0 <deploy|logs|status|restart|stop>" >&2; exit 1 ;;
esac
