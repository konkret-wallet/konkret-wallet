#!/bin/sh

# convert single svg into logo variants pngs

INFILE="${1}"
if [ ! -f "${INFILE}" ]; then
  echo "missing file '${INFILE}'"
  exit 2
fi

set -x
if [ ! -f "package.json" ]; then
  echo "please execute from repo root"
  exit 3
fi

cp "${INFILE}" ./app/images/logo/metamask-fox.svg
cp "${INFILE}" ./app/build-types/main/images/logo/metamask-fox.svg

magick -background none "${INFILE}" -alpha On -background none -resize 200 "app/images/fox.png"
mogrify -filter Triangle -define filter:support=2 -dither none -define png:compression-filter=5 -define png:compression-level=9 -define png:compression-strategy=1 -interlace none -colorspace sRGB "app/images/fox.png"

for s in 16 19 32 38 48 64 128 512; do
  magick -background none "${INFILE}" -alpha On -background none -resize "${s}" "app/images/icon-${s}.png"
  # compress
  #mogrify -filter Triangle -define filter:support=2 -dither none -define png:compression-filter=5 -define png:compression-level=9 -define png:compression-strategy=1 -interlace none -colorspace sRGB inout.png
  mogrify -filter Triangle -define filter:support=2 -dither none -define png:compression-filter=5 -define png:compression-level=9 -define png:compression-strategy=1 -interlace none -colorspace sRGB "app/images/icon-${s}.png"
  cp "app/images/icon-${s}.png" "app/build-types/main/images/icon-${s}.png"
done
