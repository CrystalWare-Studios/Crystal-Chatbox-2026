# Crystal Chatbox

VRChat OSC chatbox companion app by CrystalWare Studios — rotating custom messages, live Spotify/music with synced lyrics, weather, heart rate, system stats, VR headset/controller battery, and more, all sent to VRChat's chatbox over OSC.

**Get the app**: download the built Windows exe or Quest APK from [Releases](../../releases) or the Meta Store — you don't need to build from source to use Crystal Chatbox.

## About this repository

This repo contains the client-facing parts of Crystal Chatbox: the dashboard UI (`app/static`, `app/templates`) and the platform launchers (`platforms/windows`, `platforms/macos`, `platforms/quest`) that show how the app is packaged and started on each platform.

The server-side application logic — OSC handling, the settings engine, the Spotify/Last.fm/Discord now-playing integrations, VRChat account integration, lyrics sync, and the rest of the backend — is not included here. That's what we build and support the app around, so it stays closed-source.

Because of that, **this repo won't build or run a working copy of Crystal Chatbox on its own.**

## Found a bug or have a suggestion?

Open an issue here, or join our Discord — we read everything and patch reported bugs.

## License

See [LICENSE](LICENSE). In short: you're welcome to read the code and run official builds for personal use. Please don't copy, redistribute, or sell it.
