#!/usr/bin/env bash
# smoke.sh — blast all endpoints on your Elysia server (no prechecks)

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3001}"
OUT_DIR="${1:-./logs/smoke}"
mkdir -p "$OUT_DIR"

say() { printf "\n— %s\n" "$*"; }
hit() {
  local method="$1"; shift
  local url="$1"; shift
  local name="$1"; shift
  local out="$OUT_DIR/$(echo -n "$name" | tr ' /:?=&' '_').out"
  echo "curl -X $method $url" > "${out}.cmd"
  if [[ "$method" == "GET" ]]; then
    curl -sS -D "${out}.hdr" -o "$out" "$url" || true
  else
    curl -sS -D "${out}.hdr" -o "$out" -X "$method" "$url" "$@" || true
  fi
  printf "[%s] -> %s\n" "$(sed -n '1s/.* //p' "${out}.hdr")" "$name"
}

say "Utility"
hit GET  "$BASE_URL/"               "root"
hit GET  "$BASE_URL/status"         "status"
hit GET  "$BASE_URL/version"        "version"
hit GET  "$BASE_URL/info"           "info"
hit GET  "$BASE_URL/health"         "health"

say "Swagger"
hit GET  "$BASE_URL/swagger"        "swagger"

say "Search / News / YouTube"
# These will still be called even if your server replies 4xx/5xx due to missing keys.
hit GET  "$BASE_URL/api/google/cse?q=Elysia.js&num=3"                 "google_cse"
hit GET  "$BASE_URL/api/gnews/search?q=OpenAI&lang=en&max=3"         "gnews_search"
hit GET  "$BASE_URL/api/gnews/top-headlines?lang=en&country=us&max=3" "gnews_headlines"
hit GET  "$BASE_URL/api/google/youtube/search?q=elysia%20tutorial&maxResults=3" "youtube_search"

say "Reverse image (multipart/form-data)"
# Create a tiny 1x1 PNG so we always exercise the endpoint
TMP_IMG="$(mktemp -t smoke_img_XXXXXX.png)"
base64 -d > "$TMP_IMG" <<'PNG'
iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/xcAAt8B4y5oG4kAAAAASUVORK5CYII=
PNG
hit POST "$BASE_URL/api/google/reverse-image" "reverse_image" \
  -F "file=@${TMP_IMG};type=image/png"
rm -f "$TMP_IMG"

echo -e "\nlogs saved to: $OUT_DIR"
