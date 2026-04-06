#!/usr/bin/env bash
# Create the finlens database for local development (PostgreSQL on localhost:5432).
set -e
DB_NAME="${1:-finlens}"
if command -v createdb >/dev/null 2>&1; then
  createdb "$DB_NAME" && echo "Created database: $DB_NAME"
else
  echo "createdb not found. Install PostgreSQL or run in psql:"
  echo "  CREATE DATABASE $DB_NAME;"
  exit 1
fi
echo "Next: cd backend && npx prisma migrate dev"
