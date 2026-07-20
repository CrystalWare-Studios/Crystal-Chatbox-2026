#!/usr/bin/env python3
"""
Pulls the shared Flask/JS source from the Windows build into this Android
app folder, so this stays a build target rather than a second copy of the
app to maintain by hand. Run this before every buildozer build.
"""
import os
import shutil

HERE = os.path.dirname(os.path.abspath(__file__))
WINDOWS_SRC = os.path.join(
    HERE, "..", "..", "..", "PC", "Windows",
    "Crystal-Chatbox-Source-Code", "Crystal Chatbox",
)

# Desktop-only packages/APIs with no Android equivalent - excluded so the
# build doesn't try to compile/install something that can't work here.
# The modules that import them already fall back gracefully when the
# import fails (built up over the PC hardening work), so nothing else
# needs to change for these to be skipped.
SKIP_FOR_ANDROID = set()

PY_FILES_EXCLUDE = {
    "main.py",  # Android has its own entry point (see android_main.py)
}


def sync():
    dest = HERE
    copied = []

    for name in sorted(os.listdir(WINDOWS_SRC)):
        if name in PY_FILES_EXCLUDE:
            continue
        if not name.endswith(".py"):
            continue
        src_path = os.path.join(WINDOWS_SRC, name)
        if not os.path.isfile(src_path):
            continue
        shutil.copy2(src_path, os.path.join(dest, name))
        copied.append(name)

    for folder in ("templates", "static"):
        src_folder = os.path.join(WINDOWS_SRC, folder)
        dest_folder = os.path.join(dest, folder)
        if os.path.isdir(dest_folder):
            shutil.rmtree(dest_folder)
        shutil.copytree(src_folder, dest_folder)
        copied.append(folder + "/")

    print(f"Synced {len(copied)} items from Windows source into {dest}:")
    for item in copied:
        print(f"  {item}")


if __name__ == "__main__":
    sync()
