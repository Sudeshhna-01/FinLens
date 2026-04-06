#!/usr/bin/env bash
# Generate human insights + portfolio prediction rows for all users.
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"
if [[ -x ./venv/bin/python ]]; then
  PY=./venv/bin/python
else
  PY=python3
fi
echo "==> insights_engine.py"
"$PY" insights_engine.py
echo "==> portfolio_predictions.py"
"$PY" portfolio_predictions.py
echo "==> Done"
