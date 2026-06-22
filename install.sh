#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${READNOTE_REPO_URL:-https://github.com/pheobepotato/readnote.git}"
INSTALL_DIR="${READNOTE_INSTALL_DIR:-$HOME/.readnote}"

echo "Installing Readnote into $INSTALL_DIR"

if [ -d "$INSTALL_DIR/.git" ]; then
  git -C "$INSTALL_DIR" pull --ff-only
else
  git clone "$REPO_URL" "$INSTALL_DIR"
fi

cd "$INSTALL_DIR"
npm install
npm run verify:extension

if [ ! -f ".env.local" ]; then
  cp .env.example .env.local
fi

cat <<EOF

Readnote is installed.

1. Start the local companion:
   cd "$INSTALL_DIR" && npm run companion

2. Open setup:
   http://127.0.0.1:8791/setup

3. Load the Chrome extension:
   - Open chrome://extensions
   - Enable Developer mode
   - Click Load unpacked
   - Select: $INSTALL_DIR/dist

For a fork, run with:
READNOTE_REPO_URL=https://github.com/yourname/readnote.git bash install.sh
EOF
