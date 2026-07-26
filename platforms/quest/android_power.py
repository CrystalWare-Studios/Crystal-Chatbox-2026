import os

IS_ANDROID = "ANDROID_ARGUMENT" in os.environ

_wakelock = None


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
