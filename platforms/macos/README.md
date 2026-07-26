# macOS (optional, self-compile)

Windows and Quest are the primary, actively supported platforms for Crystal Chatbox.
macOS is source-available and **community-maintained** — it runs and has the full
feature set except SteamVR battery (there's no SteamVR on macOS), but there's no
maintained pre-built app to download. You compile it yourself.

## Running from source

Requires Python 3.11+.

```bash
cd platforms/macos
chmod +x run_mac.sh
./run_mac.sh
```

This creates a `.venv` here, installs `requirements.txt` plus `pywebview` and
`pyobjc-framework-Cocoa`, and starts the app at `http://127.0.0.1:5000` in its own
window.

## What's different from Windows/Quest

- Application logic lives in the shared [`app/`](../../app) directory at the repo root
  — `main.py` here is just the macOS-specific entrypoint (window title/size/color,
  pywebview setup). If you're changing app behavior, edit `app/`, not this file.
- No SteamVR integration (Windows-only dependency).
- No packaged distributable is built or published for this platform. If you want a
  double-clickable `.app`, you'd need to set up your own PyInstaller build (see
  `platforms/windows/build_windows.ps1` for the pattern to adapt).

## Reporting issues

Bugs specific to macOS are welcome on the [Discord](https://discord.gg/uxPdvQkfP5) or as
GitHub issues, but fixes for this platform aren't prioritized the way Windows/Quest are.
