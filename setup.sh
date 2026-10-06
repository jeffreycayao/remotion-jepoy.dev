#!/usr/bin/env bash
# Promo Studio setup (macOS / Linux). Run with: bash setup.sh
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed."
  if [ "$(uname)" = "Darwin" ]; then echo "  Install: brew install node   (or https://nodejs.org)"; else echo "  Install: https://nodejs.org/en/download"; fi
  exit 1
fi
exec node promo-studio/scripts/setup.mjs "$@"
