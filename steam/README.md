# Steam packaging

Scaffold for shipping Crystal Chatbox on Steam. Nothing in here is wired up yet — this is
where that work lands once the Steamworks side is set up.

## Before building anything here

1. Register the app on the [Steamworks Partner site](https://partner.steamgames.com/) and
   get a real App ID.
2. Replace the placeholder in `steam_appid.txt` (currently `480` - Valve's public
   "Spacewar" test app, the standard stand-in for local `SteamAPI_Init()` testing before
   a real App ID exists) with the real App ID.
3. Install [SteamCMD](https://developer.valvesoftware.com/wiki/SteamCMD) and the
   Steamworks SDK's ContentBuilder tools.
4. Fill in real depot IDs and paths in `scripts/app_build.vdf.template` and
   `scripts/depot_build.vdf.template`, then drop the `.template` suffix once they're real.

## What goes where

- `steam_appid.txt` — the App ID Steam's API reads at runtime (drop next to the built
  .exe during local testing so `SteamAPI_Init()` can find it before the app is actually
  live on Steam).
- `scripts/` — ContentBuilder VDF scripts (`app_build.vdf`, `depot_build.vdf`) that tell
  `steamcmd` what to upload and where. The build output to upload is whatever
  `platforms/windows/build_windows.ps1` produces in `platforms/windows/Builds/`.
- `store_assets/` — capsule art, header image, screenshots, trailers for the store page.
  Steamworks' image size/format requirements are on the partner site.

## Build → upload flow (once set up)

```
platforms/windows/build_windows.ps1        # produces the .exe
steamcmd +run_app_build ../steam/scripts/app_build.vdf +quit
```
