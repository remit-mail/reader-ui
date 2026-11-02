#!/usr/bin/env bash
# The browser the rack e2e suite drives: Playwright's headless shell.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

# shellcheck source=./lib/playwright-browser.sh
source npm-scripts/lib/playwright-browser.sh

playwright_install ./node_modules/.bin/playwright chromium --only-shell
