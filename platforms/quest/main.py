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
            f.write(f"\n--- Crash at {datetime.now().isoformat()} ---\n{message}\n")
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

IS_ANDROID = "ANDROID_ARGUMENT" in os.environ


def _run_android():
    # On Android/Quest, the Flask server runs in a separate foreground
    # service (service/main.py) instead of this Activity process, so the OS
    # is far less likely to kill it under memory pressure (Low Memory Kill).
    # This process just starts that service, acquires a wakelock as a second
    # line of defense against Doze-style suspension, and then stays alive
    # (without loading Flask/routes itself) so PythonActivity's python
    # thread doesn't exit.
    try:
        import android_power
        android_power.acquire_wakelock()
        android_power.acquire_wifi_lock()
        android_power.request_battery_optimization_exemption()
    except Exception as e:
        print(f"[Crystal Chatbox] Android power setup failed: {e}")

    try:
        from android import AndroidService
        service = AndroidService("Crystal Chatbox", "Keeping your VRChat chatbox connected")
        service.start("")
        print("[Crystal Chatbox] Started background service")
    except Exception:
        _report_crash(*sys.exc_info())
        print("[Crystal Chatbox] Failed to start background service")

    import time
    while True:
        time.sleep(3600)


def _run_desktop():
    from routes import app as flask_app
    port = int(os.environ.get("PORT", 5000))
    print(f"[Crystal Chatbox] Starting Flask server at http://127.0.0.1:{port} ...")
    try:
        flask_app.run(host="127.0.0.1", port=port, debug=False, use_reloader=False)
    except Exception:
        _report_crash(*sys.exc_info())
        raise


def main():
    if IS_ANDROID:
        _run_android()
    else:
        _run_desktop()


if __name__ == "__main__":
    main()
