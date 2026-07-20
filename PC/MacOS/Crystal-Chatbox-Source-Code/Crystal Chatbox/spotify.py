import threading
import time

import requests

from settings import SETTINGS

SPOTIFY_REFRESH_URL = "https://crystalwarestudios.com/spotify/refresh"
SPOTIFY_API_URL = "https://api.spotify.com/v1/me/player"
SPOTIFY_AVAILABLE = True


spotify_state = {
    "song_text": "",
    "song_pos": 0,
    "song_dur": 0,
    "album_art": "",
    "status": "not_configured",
    "configured": False,
    "available": SPOTIFY_AVAILABLE,
    "last_error": "",
    "last_error_at": 0,
}

spotify_lock = threading.Lock()
sp = None
force_reinit_event = threading.Event()
tracker_started = False
tracker_lock = threading.Lock()


def get_spotify_state():
    with spotify_lock:
        return spotify_state.copy()


def _configured():
    return bool(SETTINGS.get("spotify_refresh_token", "").strip())


def _friendly_error(error):
    text = str(error or "")
    lower = text.lower()
    if "failed to resolve" in lower or "nameresolutionerror" in lower or "getaddrinfo failed" in lower:
        return "Spotify could not be reached. Check your internet connection or DNS, then try again."
    if "401" in lower or "unauthorized" in lower or "token" in lower:
        return "Spotify needs you to reconnect your account."
    if "timeout" in lower:
        return "Spotify took too long to respond. It will retry automatically."
    return text[:240] or "Spotify is unavailable."


def _set_state(**updates):
    with spotify_lock:
        spotify_state.update(updates)
        spotify_state["configured"] = _configured()
        spotify_state["available"] = SPOTIFY_AVAILABLE
        if updates.get("last_error"):
            spotify_state["last_error_at"] = time.time()


def init_spotify_web():
    global sp
    refresh_token = SETTINGS.get("spotify_refresh_token", "").strip()

    if not refresh_token:
        sp = None
        _set_state(
            status="not_configured",
            last_error="Click Connect Spotify to authorize playback access.",
            song_text="",
            song_pos=0,
            song_dur=0,
            album_art="",
        )
        print("[Spotify] Waiting for user authorization.")
        return

    try:
        response = requests.post(
            SPOTIFY_REFRESH_URL,
            json={"refresh_token": refresh_token},
            timeout=15,
        )
        response.raise_for_status()
        access_token = response.json().get("access_token", "")
        if not access_token:
            raise RuntimeError("Spotify did not return an access token.")
        sp = access_token
        _set_state(status="connected", last_error="")
        print("[Spotify] Connected.")
    except Exception as exc:
        friendly = _friendly_error(exc)
        sp = None
        _set_state(status="error", last_error=friendly, song_text="", song_pos=0, song_dur=0, album_art="")
        print(f"[Spotify] {friendly}")


def force_reinit():
    global sp
    sp = None
    force_reinit_event.set()
    print("[Spotify] Re-initialization requested.")


def _update_playback(current):
    with spotify_lock:
        if current and current.get("is_playing") and current.get("item"):
            item = current["item"]
            artists = ", ".join(artist.get("name", "") for artist in item.get("artists", []))
            track_name = item.get("name", "Unknown")
            spotify_state["song_text"] = f"{track_name} - {artists}".strip(" -")
            spotify_state["song_pos"] = current.get("progress_ms", 0) // 1000
            spotify_state["song_dur"] = item.get("duration_ms", 0) // 1000
            images = item.get("album", {}).get("images", [])
            spotify_state["album_art"] = images[0].get("url", "") if images else ""
        else:
            spotify_state["song_text"] = ""
            spotify_state["song_pos"] = 0
            spotify_state["song_dur"] = 0
            spotify_state["album_art"] = ""
        spotify_state["status"] = "connected"
        spotify_state["last_error"] = ""
        spotify_state["configured"] = _configured()
        spotify_state["available"] = SPOTIFY_AVAILABLE


def _get_current_playback(access_token):
    response = requests.get(
        SPOTIFY_API_URL,
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=15,
    )
    if response.status_code == 204:
        return None
    response.raise_for_status()
    return response.json()


def start_spotify_tracker(interval=1):
    global tracker_started
    with tracker_lock:
        if tracker_started:
            return
        tracker_started = True

    def tracker():
        global sp
        print("[Spotify Tracker] Thread started")
        last_error_time = 0.0
        last_init_attempt = 0.0
        logged_waiting = False

        while True:
            try:
                if force_reinit_event.is_set():
                    force_reinit_event.clear()
                    last_init_attempt = 0.0
                    sp = None

                if sp is None:
                    now = time.time()
                    retry_seconds = 60 if spotify_state.get("status") == "error" else 10
                    if _configured() and (last_init_attempt == 0.0 or now - last_init_attempt >= retry_seconds):
                        print("[Spotify Tracker] Attempting initialization...")
                        init_spotify_web()
                        last_init_attempt = now
                    if sp is None:
                        if not logged_waiting:
                            print("[Spotify Tracker] Waiting for setup or connectivity.")
                            logged_waiting = True
                        time.sleep(max(5, interval))
                        continue

                logged_waiting = False
                try:
                    current = _get_current_playback(sp)
                except Exception as exc:
                    if isinstance(exc, requests.HTTPError) and exc.response is not None and exc.response.status_code == 401:
                        friendly = "Spotify needs you to reconnect your account."
                    else:
                        friendly = _friendly_error(exc)
                    if time.time() - last_error_time > 60:
                        print(f"[Spotify Tracker] {friendly}")
                        last_error_time = time.time()
                    _set_state(status="error", last_error=friendly, song_text="", song_pos=0, song_dur=0, album_art="")
                    if "reconnect" in friendly.lower():
                        sp = None
                    time.sleep(max(5, interval))
                    continue

                _update_playback(current)
                time.sleep(interval)
            except Exception as exc:
                friendly = _friendly_error(exc)
                if time.time() - last_error_time > 60:
                    print(f"[Spotify Tracker] {friendly}")
                    last_error_time = time.time()
                _set_state(status="error", last_error=friendly)
                time.sleep(max(5, interval))

    threading.Thread(target=tracker, daemon=True).start()
