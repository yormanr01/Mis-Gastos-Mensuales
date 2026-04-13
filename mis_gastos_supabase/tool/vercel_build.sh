#!/usr/bin/env bash
# Build Flutter Web en Vercel (Linux). Variables en el panel de Vercel:
#   SUPABASE_URL
#   SUPABASE_ANON_KEY
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SDK="${ROOT}/.flutter-sdk"
export PATH="${SDK}/bin:${PATH}"

if [[ ! -x "${SDK}/bin/flutter" ]]; then
  echo "Clonando Flutter stable..."
  rm -rf "${SDK}"
  git clone https://github.com/flutter/flutter.git -b stable --depth 1 "${SDK}"
fi

flutter --version
flutter config --no-analytics
flutter precache --web

cd "${ROOT}"
flutter pub get

: "${SUPABASE_URL:?Falta SUPABASE_URL en Vercel}"
: "${SUPABASE_ANON_KEY:?Falta SUPABASE_ANON_KEY en Vercel}"

flutter build web --release \
  --dart-define=SUPABASE_URL="${SUPABASE_URL}" \
  --dart-define=SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY}"

echo "Salida: ${ROOT}/build/web"
