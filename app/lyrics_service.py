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
    # Every now-playing source formats song_text as "{title} - {artist}". Titles
    # commonly contain their own " - " (e.g. "Song Name - Live", "Song Name -
    # Radio Edit") while artist names essentially never do, so split on the
    # LAST " - " rather than the first to avoid truncating the title into the
    # artist field.
    title, sep, artist = str(song_text or "").rpartition(" - ")
    if not sep:
        return "", ""
    return title.strip(), artist.strip()


_LYRICS_NOISE_PATTERNS = [
    re.compile(r"[\(\[][^)\]]*\b(feat\.?|featuring|ft\.?|with)\b[^)\]]*[\)\]]", re.IGNORECASE),
    re.compile(
        r"[\(\[][^)\]]*\b(remaster(?:ed)?|remix|re-?recorded|live|acoustic|"
        r"radio edit|single version|album version|explicit|clean|deluxe|"
        r"bonus track|mono|stereo|demo|edit|version)\b[^)\]]*[\)\]]",
        re.IGNORECASE,
    ),
    re.compile(
        r"\s-\s(?:\d{4}\s)?(?:remaster(?:ed)?|remix|live|acoustic|radio edit|"
        r"single version|album version|mono version|stereo version)\b.*$",
        re.IGNORECASE,
    ),
]


def _clean_lyrics_query(text):
    # LRCLIB's catalog is keyed on the plain song/artist name. Streaming
    # sources often decorate titles with "(feat. X)", "- Remastered 2011",
    # "(Live)" etc, which makes an otherwise-correct exact match miss and
    # falls back to fuzzy search - which can silently return a different
    # version of the song (wrong timings) rather than no match at all.
    cleaned = str(text or "")
    for pattern in _LYRICS_NOISE_PATTERNS:
        cleaned = pattern.sub("", cleaned)
    cleaned = re.sub(r"\s{2,}", " ", cleaned).strip(" -")
    return cleaned or str(text or "").strip()


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
    cleaned_title = _clean_lyrics_query(title)
    cleaned_artist = _clean_lyrics_query(artist)
    attempts = [(title, artist)]
    if (cleaned_title, cleaned_artist) != (title, artist) and cleaned_title and cleaned_artist:
        attempts.append((cleaned_title, cleaned_artist))

    # Exact match (with duration when known) first, in both the raw and
    # noise-stripped forms - this is the only lookup that verifies it's the
    # same recording, so it's the one that actually guarantees correct timing.
    for attempt_title, attempt_artist in attempts:
        params = {"track_name": attempt_title, "artist_name": attempt_artist}
        if duration:
            params["duration"] = int(duration)
        try:
            response = requests.get(LRCLIB_GET_URL, params=params, timeout=10)
            if response.status_code == 200:
                return response.json()
        except Exception:
            pass

    # Fuzzy fallback - no duration verification built into this endpoint, so
    # when we know the real duration, prefer whichever result's own duration
    # is closest to it rather than blindly trusting the top text match (which
    # can be a cover, remix, or live version with completely different timing).
    search_title, search_artist = attempts[-1]
    try:
        response = requests.get(
            LRCLIB_SEARCH_URL, params={"track_name": search_title, "artist_name": search_artist}, timeout=10
        )
        if response.status_code == 200:
            results = response.json()
            if isinstance(results, list) and results:
                if duration:
                    closest = min(results, key=lambda r: abs(int(r.get("duration") or 0) - int(duration)))
                    if abs(int(closest.get("duration") or 0) - int(duration)) <= 5:
                        return closest
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
