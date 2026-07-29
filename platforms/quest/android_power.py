import os

IS_ANDROID = "ANDROID_ARGUMENT" in os.environ

_wakelock = None
_wifi_lock = None


def acquire_wakelock():
    # Keeps the CPU running while the app is backgrounded so the Flask
    # server and polling threads don't get suspended by Android/Quest's
    # Doze and App Standby power management. No-op outside Android.
    global _wakelock
    if not IS_ANDROID or _wakelock is not None:
        return
    try:
        from jnius import autoclass

        ActivityThread = autoclass("android.app.ActivityThread")
        Context = autoclass("android.content.Context")
        PowerManager = autoclass("android.os.PowerManager")
        context = ActivityThread.currentApplication()
        if context is None:
            return
        power_manager = context.getSystemService(Context.POWER_SERVICE)
        if power_manager is None:
            return
        wakelock = power_manager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK, "CrystalChatbox:BackgroundServer"
        )
        wakelock.setReferenceCounted(False)
        wakelock.acquire()
        _wakelock = wakelock
        print("[AndroidPower] Partial wakelock acquired")
    except Exception as e:
        print(f"[AndroidPower] Failed to acquire wakelock: {e}")


def acquire_wifi_lock():
    # A CPU wakelock alone does not stop Android from throttling the WiFi
    # radio during Doze/App Standby - and OSC goes out over UDP/WiFi, so a
    # throttled radio silently drops chatbox updates while the app process
    # itself keeps running with nothing to report as an error. This is the
    # separate lock that actually keeps WiFi at full power. No-op outside
    # Android.
    global _wifi_lock
    if not IS_ANDROID or _wifi_lock is not None:
        return
    try:
        from jnius import autoclass

        ActivityThread = autoclass("android.app.ActivityThread")
        Context = autoclass("android.content.Context")
        WifiManager = autoclass("android.net.wifi.WifiManager")
        context = ActivityThread.currentApplication()
        if context is None:
            return
        wifi_manager = context.getSystemService(Context.WIFI_SERVICE)
        if wifi_manager is None:
            return
        wifi_lock = wifi_manager.createWifiLock(
            WifiManager.WIFI_MODE_FULL_HIGH_PERF, "CrystalChatbox:OSC"
        )
        wifi_lock.setReferenceCounted(False)
        wifi_lock.acquire()
        _wifi_lock = wifi_lock
        print("[AndroidPower] WiFi high-performance lock acquired")
    except Exception as e:
        print(f"[AndroidPower] Failed to acquire WiFi lock: {e}")


def request_battery_optimization_exemption():
    # Prompts the user, via the standard system dialog, to exempt Crystal
    # Chatbox from battery optimization so Android/Quest is less likely to
    # kill the background server. No-op if already exempted or off-Android.
    if not IS_ANDROID:
        return
    try:
        from jnius import autoclass

        ActivityThread = autoclass("android.app.ActivityThread")
        Context = autoclass("android.content.Context")
        Intent = autoclass("android.content.Intent")
        Uri = autoclass("android.net.Uri")
        Settings = autoclass("android.provider.Settings")

        context = ActivityThread.currentApplication()
        if context is None:
            return
        power_manager = context.getSystemService(Context.POWER_SERVICE)
        package_name = context.getPackageName()
        if power_manager is None or not package_name:
            return
        if power_manager.isIgnoringBatteryOptimizations(package_name):
            return

        intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
        intent.setData(Uri.parse(f"package:{package_name}"))
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent)
        print("[AndroidPower] Requested battery optimization exemption")
    except Exception as e:
        print(f"[AndroidPower] Failed to request battery optimization exemption: {e}")
