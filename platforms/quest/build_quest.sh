#!/usr/bin/env bash
set -euo pipefail

BUILD_TYPE="${1:-debug}"
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$(cd "$ROOT_DIR/../../app" && pwd)"
CACHE_VOLUME="${BUILDOZER_CACHE_VOLUME:-crystalclient-buildozer-cache}"

echo "Assembling shared app/ source into $ROOT_DIR ..."
cp "$APP_DIR"/*.py "$ROOT_DIR/"
rm -rf "$ROOT_DIR/templates" "$ROOT_DIR/static"
cp -r "$APP_DIR/templates" "$ROOT_DIR/templates"
cp -r "$APP_DIR/static" "$ROOT_DIR/static"
cp "$ROOT_DIR/../../CHANGELOG.md" "$ROOT_DIR/CHANGELOG.md"

echo "Building Quest APK ($BUILD_TYPE) via Docker/buildozer ..."
cd "$ROOT_DIR"

SIGN_ARGS=()
if [ "$BUILD_TYPE" = "release" ] && [ -n "${QUEST_KEYSTORE_PATH:-}" ]; then
    echo "Release signing enabled with keystore: $QUEST_KEYSTORE_PATH"
    SIGN_ARGS+=(
        -v "$QUEST_KEYSTORE_PATH":/home/user/release.keystore
        -e P4A_RELEASE_KEYSTORE=/home/user/release.keystore
        -e P4A_RELEASE_KEYSTORE_PASSWD="$QUEST_KEYSTORE_PASSWD"
        -e P4A_RELEASE_KEYALIAS="$QUEST_KEY_ALIAS"
        -e P4A_RELEASE_KEYALIAS_PASSWD="$QUEST_KEY_PASSWD"
    )
fi

MSYS_NO_PATHCONV=1 docker run --rm \
    -v "$(pwd)":/home/user/hostcwd \
    -v "$CACHE_VOLUME":/home/user/.buildozer \
    "${SIGN_ARGS[@]}" \
    kivy/buildozer:latest android "$BUILD_TYPE"

# buildozer names the APK after package.name (internal Android identity, left
# as "crystalclient" so existing installs keep updating in place) - rename
# the output file itself to the public Crystal Chatbox branding.
VERSION="$(grep -m1 '^version *= *' "$ROOT_DIR/buildozer.spec" | sed 's/^version *= *//' | tr -d '[:space:]')"
for src in "$ROOT_DIR"/bin/crystalclient-"$VERSION"-arm64-v8a-"$BUILD_TYPE".apk; do
    [ -f "$src" ] || continue
    dest="$ROOT_DIR/bin/Crystal_Chatbox-$VERSION-Quest-arm64-v8a-$BUILD_TYPE.apk"
    mv -f "$src" "$dest"
    echo "Renamed to $(basename "$dest")"
done

echo ""
echo "Done. APK(s) in $ROOT_DIR/bin/"
