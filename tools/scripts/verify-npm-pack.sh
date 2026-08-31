#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DIST_DIR="$REPO_ROOT/dist/packages/cli"
WORK_DIR="$(mktemp -d)"

trap "rm -rf \"$WORK_DIR\"; cp \"$REPO_ROOT/dist/packages/core/package.json.bak\" \"$REPO_ROOT/dist/packages/core/package.json\" 2>/dev/null || true; cp \"$DIST_DIR/package.json.bak\" \"$DIST_DIR/package.json\" 2>/dev/null || true" EXIT INT TERM

# Build
cd "$REPO_ROOT"
npx nx run-many -t build -p core cli

CORE_DIST_DIR="$REPO_ROOT/dist/packages/core"

# Backup core package.json
cp "$CORE_DIST_DIR/package.json" "$CORE_DIST_DIR/package.json.bak"

# Patch and pack core
node -e "const fs=require('fs'); const p=require('./dist/packages/core/package.json'); delete p.private; fs.writeFileSync('./dist/packages/core/package.json', JSON.stringify(p,null,2));"
cd "$CORE_DIST_DIR"
CORE_TARBALL=$(npm pack --pack-destination "$WORK_DIR" --json 2>"$WORK_DIR/npm-core.err" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); process.stdout.write((Array.isArray(d)?d[0]:Object.values(d)[0]).filename)")
echo "Packed Core: $CORE_TARBALL"

cd "$REPO_ROOT"

# Backup cli package.json
cp "$DIST_DIR/package.json" "$DIST_DIR/package.json.bak"

# Patch dist package.json before packing
node -e "const fs=require('fs'); const p=require('./dist/packages/cli/package.json'); const coreVersion = require('./dist/packages/core/package.json').version; delete p.private; if (p.dependencies && p.dependencies['@origo/core']) { p.dependencies['@origo/core'] = coreVersion; } fs.writeFileSync('./dist/packages/cli/package.json', JSON.stringify(p,null,2));"

# Pack CLI
cd "$DIST_DIR"
TARBALL=$(npm pack --pack-destination "$WORK_DIR" --json 2>"$WORK_DIR/npm-cli.err" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); process.stdout.write((Array.isArray(d)?d[0]:Object.values(d)[0]).filename)")
echo "Packed CLI: $TARBALL"

# Install into isolated dir
cd "$WORK_DIR"
npm init -y
npm install "./$TARBALL" "./$CORE_TARBALL"

ORIGO="$(pwd)/node_modules/.bin/origo"

# Verify permissions
if [ ! -x "$ORIGO" ]; then
  echo "ERROR: CLI binary is not executable."
  exit 1
fi

# Positive tests
$ORIGO new test-project
if [ ! -d "test-project" ]; then
  echo "ERROR: Scaffolded test-project directory does not exist."
  exit 1
fi
(cd test-project && $ORIGO validate ./schemas)

$ORIGO generate entity test-entity

# Negative path-traversal guard
if $ORIGO new "../../../evil" > "$WORK_DIR/traversal.out" 2>&1; then
  echo "SECURITY REGRESSION: path traversal input was accepted (expected non-zero exit)"
  exit 1
fi

# Template asset check
shopt -s nullglob
TEMPLATES=(./node_modules/@origo/cli/src/templates/*.json)
if [ ${#TEMPLATES[@]} -eq 0 ]; then
  echo "ERROR: template .json files missing from installed package — check project.json build assets glob"
  exit 1
fi

echo "✅ E2E npm pack verification passed."

