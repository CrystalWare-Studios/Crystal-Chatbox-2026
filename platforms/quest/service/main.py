import os
import sys

os.environ["PYTHONUTF8"] = "1"
os.environ["PYTHONIOENCODING"] = "utf-8"


def _report_crash(exc_type, exc_value, exc_tb):
    import traceback
    from datetime import datetime
    message = "".join(traceback.format_exception(exc_type, exc_value, exc_tb))
    try:
        from settings import DATA_DIR
        path = os.path.join(DATA_DIR, "crash_log.txt")
        with open(path, "a", encoding="utf-8") as f:
            f.write(f"\n--- Service crash at {datetime.now().isoformat()} ---\n{message}\n")
    except Exception:
        pass
    try:
        import crystalware_cloud
        crystalware_cloud.report_crash(message)
    except Exception:
        pass


def _report_thread_crash(args):
    _report_crash(args.exc_type, args.exc_value, args.exc_traceback)


sys.excepthook = _report_crash
try:
    import threading
    threading.excepthook = _report_thread_crash
except Exception:
    pass

# service/main.py runs as its own process under a separate Android foreground
# service (started from the Activity's main.py via android.AndroidService),
# so it needs the app root on sys.path to import sibling modules like routes.
_app_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _app_root not in sys.path:
    sys.path.insert(0, _app_root)

# The Activity's main.py already acquires a CPU wakelock, but that process
# is not the one sending OSC and can itself get backgrounded/deprioritized
# while this service keeps running. Acquire both locks directly in this
# process too: the wakelock as a second line of defense, and - critically -
# the WiFi lock, which nothing else acquires anywhere, so Android has been
# free to throttle the WiFi radio during Doze/App Standby the whole time.
# That drops outgoing OSC packets silently while the app itself keeps
# running with no error to show for it, which matches "OSC randomly turns
# off and back on" far better than anything CPU-side.
try:
    import android_power
    android_power.acquire_wakelock()
    android_power.acquire_wifi_lock()
except Exception as e:
    print(f"[Crystal Chatbox Service] Android power setup failed: {e}")

from routes import app as flask_app


def main():
    port = int(os.environ.get("PORT", 5000))
    print(f"[Crystal Chatbox Service] Starting Flask server at http://127.0.0.1:{port} ...")
    try:
        flask_app.run(host="127.0.0.1", port=port, debug=False, use_reloader=False)
    except Exception:
        _report_crash(*sys.exc_info())
        raise


if __name__ == "__main__":
    main()
