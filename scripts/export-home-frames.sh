#!/usr/bin/env bash
# Export 480 frames from the home video for instant scroll loading.
# Requires: ffmpeg (install with e.g. brew install ffmpeg)
# Run from project root: ./scripts/export-home-frames.sh

set -e
VIDEO="public/Futura_Home_Final.mp4"
OUT_DIR="public/frames"
FPS=12   # 40s * 12 = 480 frames
TOTAL=480

if ! command -v ffmpeg &> /dev/null; then
  echo "Error: ffmpeg is required. Install with: brew install ffmpeg"
  exit 1
fi

if [[ ! -f "$VIDEO" ]]; then
  echo "Error: Video not found at $VIDEO"
  exit 1
fi

mkdir -p "$OUT_DIR"
echo "Exporting $TOTAL frames to $OUT_DIR (this may take a few minutes)..."
# scale=1920:-2 = max width 1920, height auto. -start_number 1 = frame_001..frame_480 (matches app indices 0..479)
ffmpeg -i "$VIDEO" -vf "fps=$FPS,scale=1920:-2" -q:v 4 -start_number 1 "$OUT_DIR/frame_%03d.jpg" -y
echo "Done. Frames written to $OUT_DIR/frame_001.jpg ... frame_480.jpg (480 total)"
