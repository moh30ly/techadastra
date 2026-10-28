#!/usr/bin/env bash
# Build techadastra.com and upload it to server 1 (aaPanel).
#
#   ./deploy/deploy.sh                 # build + upload, keeps the server's config.js
#   ./deploy/deploy.sh --with-config   # also overwrite the server's config.js with the local one
#
# Override any of these with environment variables.
set -euo pipefail

HOST="${HOST:-63.250.54.80}"
PORT="${PORT:-2222}"
SSH_USER="${SSH_USER:-root}"
REMOTE_ROOT="${REMOTE_ROOT:-/www/wwwroot/techadastra.com}"
WITH_CONFIG=0
[[ "${1:-}" == "--with-config" ]] && WITH_CONFIG=1

cd "$(dirname "$0")/.."
node build.mjs

SSH="ssh -p $PORT $SSH_USER@$HOST"
$SSH "mkdir -p '$REMOTE_ROOT'"

# First deploy (no config on the server yet) always uploads it.
if ! $SSH "test -f '$REMOTE_ROOT/assets/config.js'"; then WITH_CONFIG=1; fi

# aaPanel puts an immutable .user.ini in every site root; never try to delete it,
# nor the ACME challenge directory used by Let's Encrypt.
EXCLUDES=(--exclude '.user.ini' --exclude '.well-known' --exclude '.htaccess')
[[ $WITH_CONFIG == 0 ]] && EXCLUDES+=(--exclude 'assets/config.js')

rsync -az --delete "${EXCLUDES[@]}" -e "ssh -p $PORT" dist/ "$SSH_USER@$HOST:$REMOTE_ROOT/"

# aaPanel's nginx runs as user "www".
$SSH "chown -R www:www '$REMOTE_ROOT' 2>/dev/null || true"

echo "Deployed to $REMOTE_ROOT$([[ $WITH_CONFIG == 1 ]] && echo ' (config.js uploaded)')"
echo "Check: https://techadastra.com/"
