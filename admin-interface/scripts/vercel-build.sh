#!/bin/bash
set -e

# Copy shared validation and types from backend
# Works if run from project root (AV/admin-interface) or repo root (AV)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( dirname "$SCRIPT_DIR" )"

echo "Copying shared modules from backend to $PROJECT_ROOT/src/shared..."
mkdir -p "$PROJECT_ROOT/src/shared"

# Assumes backend is sibling directory relative to admin-interface
cp -r "$PROJECT_ROOT/../backend/shared/"* "$PROJECT_ROOT/src/shared/"

echo "Shared modules copied successfully."
