#!/usr/bin/env bash
# Frame-timing capture for the 1000+ items requirement (Android, release build).
# Prereqs: one device/emulator on adb, the stagingRelease app installed
# (`yarn android:staging:release` with DEV_SEED_MULTIPLIER=100 in .env.staging), maestro on PATH.
# Output: perf/<timestamp>/{device.txt,gfxinfo.txt,summary.txt}
set -euo pipefail

APP_ID=com.explora.staging
SETUP=.maestro/perf/setup.yaml
FLOW=.maestro/perf/1000-items.yaml
OUT="perf/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$OUT"

{
  echo "model:   $(adb shell getprop ro.product.model | tr -d '\r')"
  echo "android: $(adb shell getprop ro.build.version.release | tr -d '\r')"
  echo "abi:     $(adb shell getprop ro.product.cpu.abi | tr -d '\r')"
  echo "emulator: $(adb shell getprop ro.kernel.qemu | tr -d '\r')"
  echo "app:     $(adb shell dumpsys package "$APP_ID" | grep -m1 versionName | tr -d ' \r')"
  echo "debuggable: $(adb shell dumpsys package "$APP_ID" | grep -c DEBUGGABLE || true) (0 = release)"
  echo "commit:  $(git rev-parse --short HEAD)$(git diff --quiet || echo '-dirty')"
} > "$OUT/device.txt"

# Launch + onboarding are not measured: reset the frame stats once the list is on screen.
maestro test "$SETUP"
adb shell dumpsys gfxinfo "$APP_ID" reset > /dev/null
maestro test "$FLOW"
adb shell dumpsys gfxinfo "$APP_ID" > "$OUT/gfxinfo.txt"

grep -E "Total frames rendered|Janky frames|50th percentile|90th percentile|95th percentile|99th percentile|Number Missed Vsync|Number Slow UI thread|Number Frame deadline missed" \
  "$OUT/gfxinfo.txt" | sed 's/^ *//' | tee "$OUT/summary.txt"
cat "$OUT/device.txt"
echo "Saved to $OUT"
