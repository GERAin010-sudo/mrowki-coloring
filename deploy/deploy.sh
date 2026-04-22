#!/usr/bin/env bash
# Mrówki Coloring — deploy to remote VM via SSH
#
# Usage:
#   ./deploy.sh user@host [target-dir]
# Example:
#   ./deploy.sh root@openclaw2 /opt/mrowki
#
# What it does:
#   1. rsyncs site/, crm/, deploy/ to the VM
#   2. on the VM: docker compose build && up -d
#   3. shows status

set -e

REMOTE="${1:-}"
TARGET="${2:-/opt/mrowki}"

if [ -z "$REMOTE" ]; then
  echo "Usage: $0 user@host [target-dir]"
  echo "Example: $0 root@openclaw2 /opt/mrowki"
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "📦 Syncing files to $REMOTE:$TARGET ..."
ssh "$REMOTE" "mkdir -p $TARGET"
rsync -az --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.claude' \
  --exclude '.openclaw' \
  --exclude '.vercel' \
  --exclude '*.db*' \
  --exclude 'crm/uploads/*' \
  --exclude 'crm/.env' \
  --exclude 'AGENTS.md' --exclude 'SOUL.md' --exclude 'TOOLS.md' \
  --exclude 'IDENTITY.md' --exclude 'HEARTBEAT.md' --exclude 'USER.md' \
  --exclude 'TM_MIGRATION_STATUS.md' \
  "$REPO_ROOT/" "$REMOTE:$TARGET/"

echo "⚙️  Setting up env on VM..."
ssh "$REMOTE" "if [ ! -f $TARGET/deploy/crm.env ]; then cp $TARGET/deploy/crm.env.example $TARGET/deploy/crm.env && echo '⚠️  Created deploy/crm.env from example — edit it on the VM!'; fi"

echo "🐳 Building & starting containers..."
ssh "$REMOTE" "cd $TARGET/deploy && docker compose up -d --build"

echo "📊 Status:"
ssh "$REMOTE" "cd $TARGET/deploy && docker compose ps"

echo ""
echo "✅ Done!"
echo ""
echo "Access the apps:"
echo "  • CRM:  http://$(echo $REMOTE | cut -d@ -f2):8080"
echo "  • Site: http://$(echo $REMOTE | cut -d@ -f2):8081"
echo ""
echo "First-time setup (run on the VM):"
echo "  ssh $REMOTE"
echo "  cd $TARGET/deploy"
echo "  nano crm.env                           # add TELEGRAM_BOT_TOKEN etc"
echo "  docker compose exec crm node setup-password.js list"
echo "  docker compose exec crm node setup-password.js set --user 1 --login admin --password XXX"
echo "  docker compose restart crm"
