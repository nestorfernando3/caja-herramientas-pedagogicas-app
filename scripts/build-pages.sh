#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"

rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR/data"

cp -R "$ROOT_DIR/site/." "$DIST_DIR/"
cp "$ROOT_DIR/data/db.json" "$DIST_DIR/data/db.json"

echo "GitHub Pages build listo en $DIST_DIR"
