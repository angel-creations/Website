#!/usr/bin/env bash
#
# Rebuilds public/social/angel-creations-card.png — the site's social share card.
#
# Why this exists
#   The captured WordPress source published one share image for the whole site:
#     https://angelcreations.in/wp-content/uploads/2023/08/59c9d53b-b7d3-4c8c-8840-c2d54a62749d_2130x1373-1024x660.png
#   That binary was not duplicated into the preservation snapshot, and /wp-content is not served
#   by the static build, so the original social card resolved to an HTML fallback instead of an
#   image on every route that referenced it.
#
#   This card is built only from assets the site already ships: the preserved "Angel Creations"
#   wordmark on the site's own black field (#000). It is rendered at 1024x660 — the captured
#   image's own geometry — so the published og:image:width / og:image:height / og:image:type
#   values that came from the source stay truthful.
#
#   No new artwork, copy, claim or brand element is introduced.
#
# Usage
#   bash scripts/generateSocialCard.sh
#
# Requires ImageMagick (`convert`). This script is intentionally NOT part of `npm run build`,
# so CI and the Hostinger build stay free of an ImageMagick dependency; the generated PNG is
# committed to public/social/.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORDMARK="$ROOT/public/legacy-assets/logos/wp-content/uploads/2023/01/logo-rectangle-1.png"
OUTPUT="$ROOT/public/social/angel-creations-card.png"

if ! command -v convert >/dev/null 2>&1; then
  echo "error: ImageMagick 'convert' is not installed." >&2
  echo "       Install ImageMagick, or keep the committed $OUTPUT as-is." >&2
  exit 1
fi

if [ ! -f "$WORDMARK" ]; then
  echo "error: preserved wordmark not found at $WORDMARK" >&2
  exit 1
fi

mkdir -p "$(dirname "$OUTPUT")"

# 1024x660 black field (the captured share image's own geometry), wordmark scaled to 820px wide
# and centred. The wordmark's own background is the same black, so the composite is seamless.
convert -size 1024x660 xc:black \
  \( "$WORDMARK" -resize 820x \) \
  -gravity center -composite \
  -depth 8 -strip -define png:compression-level=9 \
  "$OUTPUT"

echo "wrote $OUTPUT"
identify "$OUTPUT"
