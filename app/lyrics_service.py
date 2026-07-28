import re
import threading
import time

import requests

LRCLIB_GET_URL = "https://lrclib.net/api/get"
LRCLIB_SEARCH_URL = "https://lrclib.net/api/search"

_LRC_LINE_RE = re.compile(r"^\[(\d+):(\d+(?:\.\d+)?)\](.*)$")

_lock = threading.Lock()
_state = {
    "song_key": "",
    "synced": [],
    "plain": "",
    "found": False,
    "checked_at": 0.0,
}
_tracker_thread = None
_tracker_enabled = False


def _split_song_text(song_text):
    # Every now-playing source formats song_text as "{title} - {artist}",
    # so this is the one place that needs to undo it. Imperfect for titles
    # that themselves contain " - ", but that's an inherent ambiguity of
    # working from the combined display string rather than a real bug.
    title, sep, artist = str(song_text or "").partition(" - ")
    if not sep:
        return "", ""
    return title.strip(), artist.strip()


def _parse_lrc(lrc_text):
    lines = []
    for raw_line in str(lrc_text or "").splitlines():
        match = _LRC_LINE_RE.match(raw_line.strip())
        if not match:
            continue
        minutes, seconds, text = match.groups()
        try:
            total_seconds = int(minutes) * 60 + float(seconds)
        except ValueError:
            continue
        lines.append((total_seconds, text.strip()))
    lines.sort(key=lambda entry: entry[0])
    return lines


def _fetch_lyrics(title, artist, duration):
    params = {"track_name": title, "artist_name": artist}
    if duration:
        params["duration"] = int(duration)
    try:
        response = requests.get(LRCLIB_GET_URL, params=params, timeout=10)
        if response.status_code == 200:
            return response.json()
    except Exception:
        pass
    try:
        response = requests.get(LRCLIB_SEARCH_URL, params={"track_name": title, "artist_name": artist}, timeout=10)
        if response.status_code == 200:
            results = response.json()
            if isinstance(results, list) and results:
                return results[0]
    except Exception:
        pass
    return None


def _refresh_for_song(song_text, duration):
    title, artist = _split_song_text(song_text)
    if not title or not artist:
        with _lock:
            _state.update(song_key=song_text, synced=[], plain="", found=False, checked_at=time.time())
        return

    payload = _fetch_lyrics(title, artist, duration)
    if not payload or payload.get("instrumental"):
        with _lock:
            _state.update(song_key=song_text, synced=[], plain="", found=False, checked_at=time.time())
        return

    synced = _parse_lrc(payload.get("syncedLyrics"))
    plain = str(payload.get("plainLyrics") or "").strip()
    with _lock:
        _state.update(
            song_key=song_text,
            synced=synced,
            plain=" / ".join(line.strip() for line in plain.splitlines() if line.strip()),
            found=bool(synced or plain),
            checked_at=time.time(),
        )


def _tracker_loop(interval):
    import spotify

    print("[Lyrics] Thread started")
    while True:
        try:
            if not _tracker_enabled:
                time.sleep(interval)
                continue
            sstate = spotify.get_spotify_state()
            song_text = sstate.get("song_text") or ""
            with _lock:
                needs_fetch = bool(song_text) and song_text != _state["song_key"]
            if needs_fetch:
                _refresh_for_song(song_text, sstate.get("song_dur", 0))
            elif not song_text:
                with _lock:
                    if _state["song_key"]:
                        _state.update(song_key="", synced=[], plain="", found=False)
        except Exception as e:
            print(f"[Lyrics] Tracker error: {e}")
        time.sleep(interval)


def start_lyrics_tracker(enabled=False, interval=3):
    global _tracker_thread, _tracker_enabled
    _tracker_enabled = enabled
    if enabled and (_tracker_thread is None or not _tracker_thread.is_alive()):
        _tracker_thread = threading.Thread(target=_tracker_loop, args=(interval,), daemon=True)
        _tracker_thread.start()


def set_enabled(enabled):
    global _tracker_enabled
    _tracker_enabled = enabled
    if enabled:
        start_lyrics_tracker(enabled=True)
    else:
        with _lock:
            _state.update(song_key="", synced=[], plain="", found=False)


def get_current_lyric_line(song_pos_seconds):
    with _lock:
        synced = list(_state["synced"])
        plain = _state["plain"]
        found = _state["found"]

    if not found:
        return ""

    if synced:
        pos = float(song_pos_seconds or 0)
        current = ""
        for timestamp, text in synced:
            if timestamp > pos:
                break
            current = text
        return current

    return plain


def get_lyrics_state():
    with _lock:
        return {
            "song_key": _state["song_key"],
            "found": _state["found"],
            "synced_available": bool(_state["synced"]),
            "checked_at": _state["checked_at"],
        }
