#!/usr/bin/env bash
# Initial project setup script

set -euo pipefail

echo "========================================"
echo " School Timesheet – Setup"
echo "========================================"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"

# ── Backend ──────────────────────────────────
echo ""
echo "[1/5] Installing backend dependencies..."
cd "$BACKEND"
npm install

echo ""
echo "[2/5] Configuring backend .env..."
if [ ! -f "$BACKEND/.env" ]; then
  cp "$BACKEND/.env.example" "$BACKEND/.env"
  echo "  Created backend/.env from .env.example"
  echo "  ⚠  Update DATABASE_URL and JWT secrets before running!"
else
  echo "  backend/.env already exists — skipping."
fi

echo ""
echo "[3/5] Running Prisma migrations..."
cd "$BACKEND"
npx prisma generate
npx prisma migrate dev --name init 2>/dev/null || echo "  Migrations already up to date."

echo ""
echo "[4/5] Seeding database with sample data..."
npx ts-node prisma/seed.ts

# ── Frontend ─────────────────────────────────
echo ""
echo "[5/5] Installing frontend dependencies..."
cd "$FRONTEND"
if [ ! -f "$FRONTEND/.env" ]; then
  echo "VITE_API_URL=http://localhost:3001/api/v1" > "$FRONTEND/.env"
  echo "  Created frontend/.env"
fi
npm install

echo ""
echo "========================================"
echo " Setup complete!"
echo ""
echo " Start backend:  cd backend && npm run dev"
echo " Start frontend: cd frontend && npm run dev"
echo ""
echo " Seed credentials:"
echo "   Admin:  admin@greenfield.edu / Admin@1234"
echo "   Parent: parent@example.com   / Parent@1234"
echo "========================================"
