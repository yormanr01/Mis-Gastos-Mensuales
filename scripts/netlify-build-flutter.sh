#!/usr/bin/env bash
# Build de Flutter Web para Netlify (Linux). Reutiliza las mismas variables
# NEXT_PUBLIC_FIREBASE_* que la app Next.js en el panel de Netlify.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FLUTTER_DIR="${ROOT_DIR}/flutter_sdk"
export PATH="${FLUTTER_DIR}/bin:${PATH}"

if [[ ! -x "${FLUTTER_DIR}/bin/flutter" ]]; then
  echo "Instalando Flutter (stable, shallow clone)..."
  rm -rf "${FLUTTER_DIR}"
  git clone https://github.com/flutter/flutter.git -b stable --depth 1 "${FLUTTER_DIR}"
fi

flutter --version
flutter config --no-analytics
flutter precache --web

cd "${ROOT_DIR}/mis_gastos_flutter"

flutter pub get

# Mapeo desde variables típicas de este repo (Next.js / Netlify).
flutter build web --release \
  --dart-define=FIREBASE_API_KEY="${NEXT_PUBLIC_FIREBASE_API_KEY:-}" \
  --dart-define=FIREBASE_APP_ID="${NEXT_PUBLIC_FIREBASE_APP_ID:-}" \
  --dart-define=FIREBASE_MESSAGING_SENDER_ID="${NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:-}" \
  --dart-define=FIREBASE_PROJECT_ID="${NEXT_PUBLIC_FIREBASE_PROJECT_ID:-}" \
  --dart-define=FIREBASE_AUTH_DOMAIN="${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:-}" \
  --dart-define=FIREBASE_STORAGE_BUCKET="${NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:-}"

echo "Build listo: mis_gastos_flutter/build/web"
