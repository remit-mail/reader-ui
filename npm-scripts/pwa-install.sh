#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
source npm-scripts/lib/playwright-browser.sh
playwright_install ./node_modules/.bin/playwright firefox
