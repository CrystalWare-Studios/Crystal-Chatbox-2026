#!/usr/bin/env bash
set -euo pipefail

# Publishes this repo's current local history to the public GitHub origin
# with every app/*.py server-side module stripped out of every commit -
# app/*.py is deliberately never allowed to reach the public repo, past or
# present. This repo's own local history/branches/tags are never touched;
# the filtering happens in a throwaway mirror clone that gets force-pushed
# and then deleted. Requires git-filter-repo (pip install git-filter-repo).
#
# Usage: scripts/publish_public.sh
# Run this instead of `git push` whenever you want local commits to reach
# the public repo. A plain `git push origin main` will not work after the
# first run of this script, since local and origin histories permanently
# diverge (origin's commit hashes are rewritten each time).

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REMOTE_URL="$(git -C "$ROOT_DIR" remote get-url origin)"
TMP_DIR="$(mktemp -d)"
MIRROR_DIR="$TMP_DIR/publish-mirror"

cleanup() { rm -rf "$TMP_DIR"; }
trap cleanup EXIT

echo "Cloning local repo state into a throwaway mirror..."
git clone --mirror "$ROOT_DIR" "$MIRROR_DIR" >/dev/null

echo "Stripping app/*.py from every commit in the mirror..."
git filter-repo --source "$MIRROR_DIR" --target "$MIRROR_DIR" \
    --path-glob 'app/*.py' --invert-paths --force

echo "Verifying no app/*.py blobs remain..."
LEFTOVER="$(git --git-dir="$MIRROR_DIR" rev-list --objects --all | grep -E 'app/[A-Za-z0-9_]+\.py$' || true)"
if [ -n "$LEFTOVER" ]; then
    echo "ABORT: app/*.py still present after filtering:"
    echo "$LEFTOVER"
    exit 1
fi

git --git-dir="$MIRROR_DIR" remote set-url origin "$REMOTE_URL" 2>/dev/null || \
    git --git-dir="$MIRROR_DIR" remote add origin "$REMOTE_URL"
# `git clone --mirror` sets remote.origin.mirror=true, which makes git refuse
# any push with explicit refspecs ("--mirror can't be combined with
# refspecs") - this repo is being force-pushed as two separate refspecs
# below, not as a true mirror push, so that flag has to go.
git --git-dir="$MIRROR_DIR" config --unset-all remote.origin.mirror || true

echo ""
echo "Ready to force-push the scrubbed history to: $REMOTE_URL"
echo "This will replace what's currently public. Existing clones/forks will"
echo "need to re-clone after this."
read -r -p "Type PUBLISH to continue: " CONFIRM
if [ "$CONFIRM" != "PUBLISH" ]; then
    echo "Cancelled, nothing was pushed."
    exit 1
fi

git --git-dir="$MIRROR_DIR" push --force origin refs/heads/main:refs/heads/main
git --git-dir="$MIRROR_DIR" push --force origin 'refs/tags/*:refs/tags/*'

echo ""
echo "Published. origin/main and all tags now reflect local history with"
echo "app/*.py removed."
