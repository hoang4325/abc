#!/bin/sh
set -e

echo "[sharedeal-be] Applying database migrations..."
npx prisma migrate deploy

if [ "$SEED_DB" = "true" ]; then
  echo "[sharedeal-be] SEED_DB=true detected. Seeding database..."
  npx tsx prisma/seed.ts || echo "[sharedeal-be] Seed command finished or already seeded."
fi

echo "[sharedeal-be] Starting NestJS server on port ${PORT:-3001}..."
exec node dist/main.js
