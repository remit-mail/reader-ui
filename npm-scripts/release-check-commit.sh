#!/usr/bin/env bash
# A release tag publishes only a commit that is on main and whose `ci` check
# passed. Usage: release-check-commit.sh <sha>
set -euo pipefail

sha=$1
git fetch --quiet origin main
if ! git merge-base --is-ancestor "$sha" origin/main; then
	echo "::error::$sha is not on main; tag a commit main already carries"
	exit 1
fi
conclusion=$(gh api "repos/$GITHUB_REPOSITORY/commits/$sha/check-runs?check_name=ci" \
	--jq '[.check_runs[].conclusion] | if length == 0 then "missing" else (if all(. == "success") then "success" else map(tostring) | join(",") end) end')
if [ "$conclusion" != success ]; then
	echo "::error::the ci check on $sha is $conclusion; tag a commit whose ci passed"
	exit 1
fi
echo "release: $sha is on main with a green ci check"
