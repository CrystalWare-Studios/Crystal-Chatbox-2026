(() => {
    const IS_QUEST = window.CONFIG.platform === "quest";
    const SECTIONS = {
        home: "Home",
        chatbox: "Chatbox",
        presets: "Presets",
        automations: "Automations",
        integrations: "Integrations",
        appearance: "Appearance",
        profiles: "Profiles",
        logs: "Logs",
        settings: "Settings",
        leaderboard: "Leaderboard",
        vrchat: "VRChat",
        help: "Help"
    };

    const MESSAGE_PARTS = [
        { key: "time", label: "Time", setting: "show_time", help: "Current time." },
        { key: "custom", label: "Custom Messages", setting: "show_custom", help: "Your rotating text lines." },
        { key: "vrchat_live", label: "VRChat Instance", setting: "show_vrchat_live", help: "Current world, player count, and join/leave events." },
        { key: "song", label: "Music", setting: "show_music", help: "Current Spotify song." },
        { key: "lyrics", label: "Lyrics", setting: "lyrics_enabled", help: "Current line of lyrics, synced to playback when available." },
        { key: "window", label: "Active Window", setting: "show_window", help: "Current app or game." },
        { key: "heartrate", label: "Heart Rate", setting: "show_heartrate", help: "BPM from your selected source." },
        { key: "weather", label: "Weather", setting: "show_weather", help: "Weather from your configured location." },
        { key: "system_stats", label: "System Stats", setting: "system_stats_enabled", help: "CPU, RAM, GPU, and network usage." },
        { key: "vr_battery", label: IS_QUEST ? "Quest Battery" : "VR Battery", setting: "show_vr_battery", help: IS_QUEST ? "This Quest headset's battery." : "Headset and controller battery from SteamVR." },
        { key: "volume", label: IS_QUEST ? "Quest Volume" : "System Volume", setting: "show_volume", help: IS_QUEST ? "This Quest headset's media volume." : "Your PC's current output volume." },
        { key: "device_storage", label: "Quest Storage", setting: "show_device_storage", help: "Free storage space left on this Quest headset." },
        { key: "afk", label: "AFK", setting: "afk_enabled", help: "Away message after inactivity." },
        { key: "uptime", label: "Uptime", setting: "uptime_enabled", help: "How long Crystal Chatbox has been running this session. No login needed." },
        { key: "total_time", label: "Total Time", setting: "total_time_enabled", help: "Your all-time cumulative usage of Crystal Chatbox. Requires being logged in with Discord." }
    ].filter((part) => {
        if (IS_QUEST && ["window", "system_stats"].includes(part.key)) return false;
        if (!IS_QUEST && ["device_storage"].includes(part.key)) return false;
        return true;
    });

    const ICON_SETTINGS = [
        { label: "Time", emojiKey: "time_emoji", enabledKey: "time_icon_enabled", defaultEmoji: "⏰" },
        { label: "Custom Messages", emojiKey: "custom_emoji", enabledKey: "custom_icon_enabled", defaultEmoji: "💬" },
        { label: "Music", emojiKey: "song_emoji", enabledKey: "song_icon_enabled", defaultEmoji: "🎶" },
        { label: "Lyrics", emojiKey: "lyrics_emoji", enabledKey: "lyrics_icon_enabled", defaultEmoji: "🎤" },
        { label: "Active Window", emojiKey: "window_emoji", enabledKey: "window_icon_enabled", defaultEmoji: "💻" },
        { label: "Heart Rate", emojiKey: "heartrate_emoji", enabledKey: "heartrate_icon_enabled", defaultEmoji: "❤️" },
        { label: "Weather", emojiKey: "weather_emoji", enabledKey: "weather_icon_enabled", defaultEmoji: "🌤️" },
        { label: "System Stats", emojiKey: "system_stats_emoji", enabledKey: "system_stats_icon_enabled", defaultEmoji: "📊" },
        { label: IS_QUEST ? "Quest Battery" : "VR Battery", emojiKey: "vr_battery_emoji", enabledKey: "vr_battery_icon_enabled", defaultEmoji: "🔋" },
        { label: IS_QUEST ? "Quest Volume" : "System Volume", emojiKey: "volume_emoji", enabledKey: "volume_icon_enabled", defaultEmoji: "🔊" },
        { label: "Quest Storage", emojiKey: "device_storage_emoji", enabledKey: "device_storage_icon_enabled", defaultEmoji: "💾" },
        { label: "AFK", emojiKey: "afk_emoji", enabledKey: "afk_icon_enabled", defaultEmoji: "💤" },
        { label: "Uptime", emojiKey: "uptime_emoji", enabledKey: "uptime_icon_enabled", defaultEmoji: "⏱️" },
        { label: "Total Time", emojiKey: "total_time_emoji", enabledKey: "total_time_icon_enabled", defaultEmoji: "📈" }
    ].filter((item) => {
        if (IS_QUEST && item.emojiKey === "window_emoji") return false;
        if (!IS_QUEST && item.emojiKey === "device_storage_emoji") return false;
        return true;
    });

    const SCROLL_SETTINGS = [
        { label: "Time", enabledKey: "time_scroll_enabled" },
        { label: "Custom Messages", enabledKey: "custom_scroll_enabled" },
        { label: "Music", enabledKey: "song_scroll_enabled" },
        { label: "Lyrics", enabledKey: "lyrics_scroll_enabled" },
        { label: "Active Window", enabledKey: "window_scroll_enabled" },
        { label: "Heart Rate", enabledKey: "heartrate_scroll_enabled" },
        { label: "Weather", enabledKey: "weather_scroll_enabled" },
        { label: "System Stats", enabledKey: "system_stats_scroll_enabled" },
        { label: IS_QUEST ? "Quest Battery" : "VR Battery", enabledKey: "vr_battery_scroll_enabled" },
        { label: IS_QUEST ? "Quest Volume" : "System Volume", enabledKey: "volume_scroll_enabled" },
        { label: "Quest Storage", enabledKey: "device_storage_scroll_enabled" },
        { label: "AFK", enabledKey: "afk_scroll_enabled" },
        { label: "Uptime", enabledKey: "uptime_scroll_enabled" },
        { label: "Total Time", enabledKey: "total_time_scroll_enabled" }
    ].filter((item) => {
        if (IS_QUEST && item.enabledKey === "window_scroll_enabled") return false;
        if (!IS_QUEST && item.enabledKey === "device_storage_scroll_enabled") return false;
        return true;
    });

    function isSpacerKey(key) {
        return typeof key === "string" && key.startsWith("spacer_");
    }

    function spacerLabel(text) {
        return text ? `Spacer: "${text}"` : "Spacer (blank line)";
    }

    const state = {
        app: null,
        currentSection: localStorage.getItem("crystal.section") || "home",
        selectedPresetId: "",
        selectedAutomationId: "",
        editorTouched: false,
        preview: null,
        previewTimer: 0,
        logFilter: "",
        setupStep: 0,
        effectsLoaded: false,
        framesLoaded: false,
        lastVrchatEventAt: "",
        vrchatEventsPrimed: false
    };

    const $ = (id) => document.getElementById(id);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    const _pendingEdits = new Map();

    function markPendingEdit(id) {
        _pendingEdits.set(id, Date.now());
    }

    function isPendingEdit(id) {
        const t = _pendingEdits.get(id);
        if (!t) return false;
        if (Date.now() - t > 15000) {
            _pendingEdits.delete(id);
            return false;
        }
        return true;
    }

    function clearPendingEdit(id) {
        _pendingEdits.delete(id);
    }

    function bindAccountIndicator() {
        const loginBtn = $("account_login_btn");
        const chip = $("account_chip");
        const menu = $("account_menu");
        const syncBtn = $("account_sync_btn");
        const loadBtn = $("account_load_btn");
        const logoutBtn = $("account_logout_btn");
        const infoNote = $("account_info_note");
        const infoNoteClose = $("account_info_note_close");

        if (infoNote && !localStorage.getItem("crystal.accountNoteDismissed")) {
            infoNote.style.display = "block";
        }
        if (infoNoteClose) {
            infoNoteClose.addEventListener("click", () => {
                if (infoNote) infoNote.style.display = "none";
                localStorage.setItem("crystal.accountNoteDismissed", "1");
            });
        }

        const anonToggle = $("leaderboard_anonymous_toggle");
        if (anonToggle) {
            anonToggle.addEventListener("change", async () => {
                const anonymous = anonToggle.checked;
                try {
                    await api("/account/leaderboard-visibility", { method: "POST", body: { anonymous } });
                    toast(anonymous ? "You're now hidden on the leaderboard." : "Your name is now visible on the leaderboard.", "success");
                    refreshLeaderboard();
                } catch (error) {
                    anonToggle.checked = !anonymous;
                    toast(error.message, "error");
                }
            });
        }

        const donorAnonToggle = $("donor_leaderboard_anonymous_toggle");
        if (donorAnonToggle) {
            donorAnonToggle.addEventListener("change", async () => {
                const anonymous = donorAnonToggle.checked;
                try {
                    await api("/account/patreon-leaderboard-visibility", { method: "POST", body: { anonymous } });
                    toast(anonymous ? "You're now hidden on the donor leaderboard." : "Your name is now visible on the donor leaderboard.", "success");
                    refreshDonorLeaderboard();
                } catch (error) {
                    donorAnonToggle.checked = !anonymous;
                    toast(error.message, "error");
                }
            });
        }

        const patreonBtn = $("account_patreon_btn");
        if (patreonBtn) {
            patreonBtn.addEventListener("click", () => {
                if (menu) menu.style.display = "none";
                window.location.href = "/account/patreon/connect";
            });
        }

        if (loginBtn) {
            loginBtn.addEventListener("click", () => {
                window.location.href = "/account/login";
            });
        }
        if (chip) {
            chip.addEventListener("click", (event) => {
                event.stopPropagation();
                if (menu) menu.style.display = menu.style.display === "none" ? "flex" : "none";
            });
        }
        document.addEventListener("click", () => {
            if (menu) menu.style.display = "none";
        });
        if (syncBtn) {
            syncBtn.addEventListener("click", async () => {
                if (menu) menu.style.display = "none";
                if (!await confirmDialog("Save your current settings to your account? This overwrites whatever was saved there before.")) return;
                try {
                    await api("/account/sync", { method: "POST" });
                    toast("Settings saved to your account.", "success");
                } catch (error) {
                    toast(error.message, "error");
                }
            });
        }
        if (loadBtn) {
            loadBtn.addEventListener("click", async () => {
                if (menu) menu.style.display = "none";
                if (!await confirmDialog("This replaces the settings on this device with the ones saved to your account. Continue?")) return;
                try {
                    await api("/account/load", { method: "POST" });
                    toast("Settings loaded from your account.", "success");
                    loadState({ silent: true });
                } catch (error) {
                    toast(error.message, "error");
                }
            });
        }
        if (logoutBtn) {
            logoutBtn.addEventListener("click", async () => {
                if (menu) menu.style.display = "none";
                try {
                    await api("/account/logout", { method: "POST" });
                    toast("Logged out.", "info");
                    refreshAccountState();
                } catch (error) {
                    toast(error.message, "error");
                }
            });
        }
    }

    function formatDonorAmount(cents) {
        return `$${((cents || 0) / 100).toFixed(2)}`;
    }

    async function refreshAccountState() {
        const loginBtn = $("account_login_btn");
        const chip = $("account_chip");
        if (!loginBtn || !chip) return;
        try {
            const data = await api("/account/state");
            const avatar = $("account_avatar");
            const username = $("account_username");
            const anonRow = $("leaderboard_anonymous_row");
            const anonToggle = $("leaderboard_anonymous_toggle");
            const patreonBtn = $("account_patreon_btn");
            const patreonStatus = $("account_patreon_status");
            const donorAnonRow = $("donor_leaderboard_anonymous_row");
            const donorAnonToggle = $("donor_leaderboard_anonymous_toggle");
            const donorConnectNote = $("donor_leaderboard_connect_note");
            if (data.logged_in) {
                loginBtn.style.display = "none";
                chip.style.display = "flex";
                if (username) username.textContent = data.username || "Crystal account";
                if (avatar) {
                    if (data.avatar_url) {
                        avatar.src = data.avatar_url;
                        avatar.style.display = "";
                    } else {
                        avatar.style.display = "none";
                    }
                }
                if (anonRow) anonRow.style.display = "flex";
                if (anonToggle && document.activeElement !== anonToggle) anonToggle.checked = !!data.leaderboard_anonymous;

                if (data.patreon_connected) {
                    if (patreonBtn) patreonBtn.style.display = "none";
                    if (patreonStatus) {
                        patreonStatus.style.display = "block";
                        const pledge = data.pledge_cents > 0 ? `${formatDonorAmount(data.pledge_cents)}/mo` : "no active pledge";
                        patreonStatus.textContent = `Patreon connected - ${pledge} - ${formatDonorAmount(data.lifetime_cents)} lifetime`;
                    }
                    if (donorAnonRow) donorAnonRow.style.display = "flex";
                    if (donorConnectNote) donorConnectNote.style.display = "none";
                    if (donorAnonToggle && document.activeElement !== donorAnonToggle) {
                        donorAnonToggle.checked = !!data.donor_leaderboard_anonymous;
                    }
                } else {
                    if (patreonBtn) patreonBtn.style.display = "";
                    if (patreonStatus) patreonStatus.style.display = "none";
                    if (donorAnonRow) donorAnonRow.style.display = "none";
                    if (donorConnectNote) donorConnectNote.style.display = "block";
                }
            } else {
                loginBtn.style.display = "";
                chip.style.display = "none";
                const menu = $("account_menu");
                if (menu) menu.style.display = "none";
                if (anonRow) anonRow.style.display = "none";
                if (donorAnonRow) donorAnonRow.style.display = "none";
                if (donorConnectNote) donorConnectNote.style.display = "block";
            }
        } catch (error) {
            // Account state is non-critical; ignore silently.
        }
    }

    function bindUpdatePanel() {
        onClick("update_check_btn", () => refreshUpdateState(true));
        onClick("update_apply_btn", async () => {
            const btn = $("update_apply_btn");
            if (btn) {
                btn.disabled = true;
                btn.textContent = "Updating...";
            }
            try {
                const result = await api("/update/apply", { method: "POST" });
                toast(result.message || "Update started.", "success");
            } catch (error) {
                toast(error.message, "error");
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = "Update now";
                }
            }
        });
    }

    async function refreshUpdateState(forceCheck = false) {
        const currentEl = $("update_current_version");
        const latestEl = $("update_latest_version");
        if (!currentEl || !latestEl) return;
        try {
            const data = await api(forceCheck ? "/check_updates" : "/update_info");
            const info = forceCheck ? data : data.update_info;
            const current = forceCheck ? (data.current_version || "-") : (data.current_version || "-");
            currentEl.textContent = current;
            if (!info) {
                latestEl.textContent = "Could not check.";
                return;
            }
            latestEl.textContent = info.latest_version || "Unknown";
            const applyBtn = $("update_apply_btn");
            const manualLink = $("update_manual_link");
            if (info.update_available) {
                if (applyBtn) {
                    applyBtn.style.display = info.can_apply ? "" : "none";
                    applyBtn.disabled = false;
                    applyBtn.textContent = "Update now";
                }
                if (manualLink) manualLink.style.display = info.can_apply ? "none" : "";
                latestEl.textContent = `${info.latest_version} available`;
            } else {
                if (applyBtn) applyBtn.style.display = "none";
                if (manualLink) manualLink.style.display = "none";
                latestEl.textContent = `${info.latest_version || current} (up to date)`;
            }
        } catch (error) {
            latestEl.textContent = "Could not check.";
        }
    }

    document.addEventListener("DOMContentLoaded", init);

    function init() {
        bindNavigation();
        bindDashboard();
        bindChatbox();
        bindPresets();
        bindAutomations();
        bindIntegrations();
        bindAppearance();
        bindProfiles();
        bindLogs();
        bindSettings();
        bindSetupWizard();
        bindAccountIndicator();
        bindUpdatePanel();
        bindVrchatExplorer();
        bindExternalLinks();
        showSection(state.currentSection);
        loadAppearanceOptions();
        loadState({ showSetup: true });
        refreshAccountState();
        refreshUpdateState();
        window.setInterval(() => loadState({ silent: true }), 7000);
        window.setInterval(refreshAccountState, 20000);
    }

    async function api(path, options = {}) {
        const initOptions = { ...options };
        if (initOptions.body && !(initOptions.body instanceof FormData)) {
            initOptions.headers = {
                "Content-Type": "application/json",
                ...(initOptions.headers || {})
            };
            if (typeof initOptions.body !== "string") {
                initOptions.body = JSON.stringify(initOptions.body);
            }
        }

        const response = await fetch(path, initOptions);
        const text = await response.text();
        let payload = {};
        if (text) {
            try {
                payload = JSON.parse(text);
            } catch (error) {
                payload = { message: text };
            }
        }
        if (!response.ok || payload.ok === false) {
            const message = payload.message || payload.error || `Request failed (${response.status})`;
            const err = new Error(message);
            err.payload = payload;
            err.status = response.status;
            throw err;
        }
        return payload;
    }

    async function downloadEndpoint(path, body, fallbackName) {
        const response = await fetch(path, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body || {})
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || `Download failed (${response.status})`);
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filenameFromResponse(response) || fallbackName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function filenameFromResponse(response) {
        const header = response.headers.get("Content-Disposition") || "";
        const match = header.match(/filename="?([^"]+)"?/i);
        return match ? match[1] : "";
    }

    async function loadState(options = {}) {
        try {
            const payload = await api("/app/state");
            state.app = payload;
            applyBodySettings(payload.settings || {});
            renderTopbar(payload);
            renderHome(payload);
            renderChatbox(payload);
            renderQuickPhrases(payload.quick_phrases || []);
            renderGlobalHotkeys(payload.settings || {}, (payload.integrations || {}).global_hotkeys || {}, payload.quick_phrases || []);
            renderPresets(payload.presets || [], payload.settings || {});
            renderWorldPresets(payload.presets || [], payload.settings || {}, (payload.integrations || {}).vrchat_live || {});
            renderAutomations(payload.automations || {});
            renderIntegrations(payload.integrations || {}, payload.settings || {});
            renderProfiles(payload.profiles || [], payload.settings || {});
            renderLogs(payload.logs || []);
            hydrateSettings(payload.settings || {});

            if (options.showSetup && !(payload.settings || {}).setup_completed) {
                openSetup();
            }
            if (!options.silent) {
                schedulePreview();
            }
        } catch (error) {
            toast(error.message || "Could not load application state.", "error");
            setText("sidebar_status", "Needs attention");
            setBadge("osc_badge", "OSC unknown", "neutral");
        }
    }

    function bindNavigation() {
        $$(".nav-item").forEach((button) => {
            button.addEventListener("click", () => showSection(button.dataset.section));
        });

        const search = $("global_search");
        if (search) {
            const results = document.createElement("div");
            results.id = "global_search_results";
            results.className = "search-results";
            search.parentElement.appendChild(results);
            let searchTimer = 0;
            search.addEventListener("input", () => {
                window.clearTimeout(searchTimer);
                searchTimer = window.setTimeout(() => runSearch(search.value.trim()), 180);
            });
        }
    }

    function showSection(section) {
        const next = SECTIONS[section] ? section : "home";
        state.currentSection = next;
        localStorage.setItem("crystal.section", next);
        $$(".nav-item").forEach((button) => {
            button.classList.toggle("active", button.dataset.section === next);
        });
        $$(".section").forEach((sectionNode) => {
            sectionNode.classList.toggle("active", sectionNode.id === `section_${next}`);
        });
        setText("page_title", SECTIONS[next]);
        if (next === "logs") {
            refreshLogs();
        }
        if (next === "appearance") {
            loadAppearanceOptions();
        }
        if (next === "leaderboard") {
            refreshLeaderboard();
            refreshDonorLeaderboard();
        }
        if (next === "vrchat") {
            refreshVrchatFriends();
            refreshVrchatFavorites();
        }
    }

    function formatLeaderboardTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        if (hours <= 0) return `${minutes}m`;
        return `${hours}h ${minutes}m`;
    }

    async function refreshLeaderboard() {
        const list = $("leaderboard_list");
        if (!list) return;
        list.textContent = "Loading...";
        try {
            const data = await api("/leaderboard");
            const entries = data.entries || [];
            if (!entries.length) {
                list.innerHTML = `<div class="empty-state">No one's on the board yet. Log in with Discord and use the app to be the first!</div>`;
                return;
            }
            list.innerHTML = entries.map((entry, index) => `
                <div class="item">
                    <div class="item-title">
                        <span>#${index + 1} ${entry.discord_avatar ? `<img class="account-avatar" src="${escapeHtml(entry.discord_avatar)}" alt="">` : ""} ${escapeHtml(entry.discord_username || "Unknown")}</span>
                        <span>${formatLeaderboardTime(entry.total_seconds || 0)}</span>
                    </div>
                </div>
            `).join("");
        } catch (error) {
            list.innerHTML = `<div class="empty-state">Could not load the leaderboard.</div>`;
        }
    }

    async function refreshDonorLeaderboard() {
        const list = $("donor_leaderboard_list");
        if (!list) return;
        list.textContent = "Loading...";
        try {
            const data = await api("/donor-leaderboard");
            const entries = data.entries || [];
            if (!entries.length) {
                list.innerHTML = `<div class="empty-state">No donors on the board yet. Connect Patreon from the account menu to be the first!</div>`;
                return;
            }
            list.innerHTML = entries.map((entry, index) => `
                <div class="item">
                    <div class="item-title">
                        <span>#${index + 1} ${entry.discord_avatar ? `<img class="account-avatar" src="${escapeHtml(entry.discord_avatar)}" alt="">` : ""} ${escapeHtml(entry.discord_username || "Unknown")}</span>
                        <span>${formatDonorAmount(entry.lifetime_cents || 0)}</span>
                    </div>
                </div>
            `).join("");
        } catch (error) {
            list.innerHTML = `<div class="empty-state">Could not load the donor leaderboard.</div>`;
        }
    }

    async function runSearch(query) {
        const container = $("global_search_results");
        if (!container) return;
        if (!query) {
            container.innerHTML = "";
            return;
        }
        try {
            const payload = await api(`/app/search?q=${encodeURIComponent(query)}`);
            const results = payload.results || [];
            if (!results.length) {
                container.innerHTML = `<button class="search-result" type="button">No matches</button>`;
                return;
            }
            container.innerHTML = results.slice(0, 8).map((item) => `
                <button class="search-result" type="button" data-section="${escapeAttr(item.section)}">
                    <strong>${escapeHtml(item.title || item.section)}</strong>
                    <span>${escapeHtml(item.description || item.keywords || "")}</span>
                </button>
            `).join("");
            $$(".search-result", container).forEach((button) => {
                button.addEventListener("click", () => {
                    showSection(button.dataset.section);
                    container.innerHTML = "";
                    $("global_search").value = "";
                });
            });
        } catch (error) {
            container.innerHTML = "";
        }
    }

    function bindDashboard() {
        onClick("quick_test_osc", testOsc);
        onClick("settings_test_osc", testOsc);
        onClick("home_send_now", sendNow);
        onClick("home_clear", clearChatbox);
        onClick("home_toggle_chatbox", toggleChatboxVisibility);
        onClick("open_setup", openSetup);
        onClick("help_open_setup", openSetup);
    }

    function bindChatbox() {
        const template = $("message_template");
        if (template) {
            template.addEventListener("input", () => {
                state.editorTouched = true;
                schedulePreview();
            });
        }
        const enabled = $("chatbox_enabled");
        if (enabled) {
            enabled.addEventListener("change", async () => {
                try {
                    await saveSettings({ chatbox_visible: enabled.checked });
                    toast(enabled.checked ? "Chatbox enabled." : "Chatbox hidden.", "success");
                    await loadState({ silent: true });
                } catch (error) {
                    toast(error.message, "error");
                    enabled.checked = !enabled.checked;
                }
            });
        }
        $$(".var-token").forEach((button) => {
            button.addEventListener("click", () => {
                insertAtCursor(template, button.dataset.token || "");
                state.editorTouched = true;
                schedulePreview();
            });
        });
        onClick("send_message", sendEditorMessage);
        onClick("clear_chatbox", clearChatbox);
        onClick("save_as_preset", saveEditorAsPreset);
        onClick("favorite_message", favoriteCurrentMessage);
        onClick("save_custom_messages", saveCustomMessages);
        onClick("use_first_custom", useFirstCustomMessage);
        onClick("module_move_up", () => moveSelectedModule(-1));
        onClick("module_move_down", () => moveSelectedModule(1));
        onClick("save_layout_order", saveLayoutOrder);
        onClick("add_spacer", addLayoutSpacer);
        onClick("remove_spacer", removeLayoutSpacer);
        const layoutSelect = $("layout_order_select");
        if (layoutSelect) {
            layoutSelect.addEventListener("change", updateSpacerTextField);
        }
        const spacerInput = $("spacer_text_input");
        if (spacerInput) {
            spacerInput.addEventListener("input", () => {
                const select = $("layout_order_select");
                if (!select || select.selectedIndex < 0) return;
                const option = select.options[select.selectedIndex];
                if (!isSpacerKey(option.value)) return;
                option.dataset.spacerText = spacerInput.value;
                option.textContent = spacerLabel(spacerInput.value);
                select.dataset.dirty = "true";
            });
        }
        onClick("save_system_stats_editor", saveSystemStatsEditor);
        onClick("save_window_editor", saveWindowEditor);
        $$(".system-var-token").forEach((button) => {
            button.addEventListener("click", () => {
                insertAtCursor($("system_stats_template_editor"), button.dataset.token || "");
            });
        });
        const moduleList = $("module_toggles");
        if (moduleList) {
            moduleList.addEventListener("change", async (event) => {
                const input = event.target.closest("[data-module-setting]");
                if (!input) return;
                await toggleMessagePart(input.dataset.moduleSetting, input.checked);
            });
        }

        onClick("add_quick_phrase", addQuickPhraseFromForm);
        const phraseList = $("quick_phrases_list");
        if (phraseList) {
            phraseList.addEventListener("click", async (event) => {
                const sendButton = event.target.closest("[data-quick-phrase-send]");
                if (sendButton) {
                    const phrase = (state.app.quick_phrases || [])[Number(sendButton.dataset.quickPhraseSend)];
                    if (phrase) await api("/send_quick_phrase", { method: "POST", body: { phrase: phrase.text } });
                    return;
                }
                const removeButton = event.target.closest("[data-quick-phrase-remove]");
                if (removeButton) {
                    await api("/remove_quick_phrase", { method: "POST", body: { index: Number(removeButton.dataset.quickPhraseRemove) } });
                    await loadState({ silent: true });
                }
            });
        }

        const hotkeysEnabled = $("global_hotkeys_enabled");
        if (hotkeysEnabled) {
            hotkeysEnabled.addEventListener("change", () => saveGlobalHotkeys(null, hotkeysEnabled.checked));
        }
        onClick("add_global_hotkey", addGlobalHotkeyFromForm);
        const hotkeysList = $("global_hotkeys_list");
        if (hotkeysList) {
            hotkeysList.addEventListener("click", async (event) => {
                const removeButton = event.target.closest("[data-hotkey-remove]");
                if (!removeButton) return;
                const hotkeys = (getSettings().global_hotkeys || []).slice();
                hotkeys.splice(Number(removeButton.dataset.hotkeyRemove), 1);
                await saveGlobalHotkeys(hotkeys);
            });
        }
    }

    function bindPresets() {
        onClick("new_preset", () => editPreset(null));
        onClick("save_preset", savePreset);
        onClick("apply_preset", applySelectedPreset);
        onClick("duplicate_preset", duplicateSelectedPreset);
        onClick("delete_preset", deleteSelectedPreset);

        const list = $("preset_list");
        if (list) {
            list.addEventListener("click", (event) => {
                const button = event.target.closest("[data-preset-action]");
                const item = event.target.closest("[data-preset-id]");
                if (!item) return;
                const preset = findPreset(item.dataset.presetId);
                if (!preset) return;
                const action = button ? button.dataset.presetAction : "edit";
                if (action === "edit") editPreset(preset);
                if (action === "apply") applyPreset(preset.id);
                if (action === "duplicate") duplicatePreset(preset.id);
                if (action === "delete") deletePreset(preset.id);
            });
        }

        const worldEnabled = $("world_preset_enabled");
        if (worldEnabled) {
            worldEnabled.addEventListener("change", () => saveWorldPresetRules(null, worldEnabled.checked));
        }
        onClick("world_preset_add_current", async () => {
            const liveState = (state.app && state.app.integrations && state.app.integrations.vrchat_live) || {};
            const worldId = String(liveState.world_id || "");
            if (!worldId) {
                toast("Join a world with VRChat Instance detection on first.", "error");
                return;
            }
            const presetId = $("world_preset_select") ? $("world_preset_select").value : "";
            if (!presetId) {
                toast("Create a preset first.", "error");
                return;
            }
            const existing = (getSettings().world_preset_rules || []).filter((rule) => rule.world_id !== worldId);
            existing.push({ world_id: worldId, world_name: String(liveState.world_name || worldId), preset_id: presetId });
            await saveWorldPresetRules(existing);
            toast("World rule saved.", "success");
        });
        const worldRulesList = $("world_preset_rules");
        if (worldRulesList) {
            worldRulesList.addEventListener("click", async (event) => {
                const button = event.target.closest("[data-world-preset-remove]");
                if (!button) return;
                const index = Number(button.dataset.worldPresetRemove);
                const rules = (getSettings().world_preset_rules || []).slice();
                rules.splice(index, 1);
                await saveWorldPresetRules(rules);
            });
        }
    }

    function bindAutomations() {
        onClick("new_automation", () => editAutomation(null));
        onClick("save_automation", saveAutomation);
        onClick("delete_automation", deleteSelectedAutomation);

        const list = $("automation_list");
        if (list) {
            list.addEventListener("click", (event) => {
                const button = event.target.closest("[data-automation-action]");
                const item = event.target.closest("[data-automation-id]");
                if (!item) return;
                const automation = findAutomation(item.dataset.automationId);
                if (!automation) return;
                const action = button ? button.dataset.automationAction : "edit";
                if (action === "edit") editAutomation(automation);
                if (action === "toggle") toggleAutomation(automation);
                if (action === "delete") deleteAutomation(automation.id);
            });
        }
    }

    function bindIntegrations() {
        onClick("refresh_integrations", () => loadState({ silent: false }));
        onClick("spotify_save_credentials", saveSpotifyCredentials);
        onClick("spotify_save_connect", saveAndConnectSpotify);
        onClick("spotify_save_lastfm", saveLastfmUsername);
        onClick("spotify_save_display", saveSpotifyDisplaySettings);
        if ($("spotify_now_playing_method")) {
            $("spotify_now_playing_method").addEventListener("change", saveNowPlayingMethod);
        }
        if ($("spotify_progress_style")) {
            $("spotify_progress_style").addEventListener("change", toggleCustomProgressBarFields);
        }
        onClick("heart_rate_save_setup", saveHeartRateSettings);
        onClick("location_zip_save", saveLocationZip);
        onClick("weather_temp_unit_save", saveWeatherTempUnit);
        const section = $("section_integrations");
        if (section) {
            section.addEventListener("click", async (event) => {
                const reactionRemove = event.target.closest("[data-reaction-remove]");
                if (reactionRemove) {
                    const index = Number(reactionRemove.dataset.reactionRemove);
                    const rules = (getSettings().reaction_rules || []).slice();
                    rules.splice(index, 1);
                    await api("/osc-reactions/rules", { method: "POST", body: { rules } });
                    await loadState({ silent: true });
                    return;
                }
                const button = event.target.closest("[data-integration-action]");
                if (!button) return;
                await runIntegrationAction(button.dataset.integrationAction);
            });
        }
    }

    function renderSpotifySetup(spotify, settings) {
        const status = $("spotify_setup_status");
        if (!status) return;
        if ($("lyrics_enabled_setup") && document.activeElement !== $("lyrics_enabled_setup")) {
            $("lyrics_enabled_setup").checked = !!settings.lyrics_enabled;
        }
        if ($("lyrics_update_interval_setup") && document.activeElement !== $("lyrics_update_interval_setup")) {
            $("lyrics_update_interval_setup").value = settings.lyrics_update_interval || 2;
        }
        if ($("lyrics_max_length_setup") && document.activeElement !== $("lyrics_max_length_setup")) {
            $("lyrics_max_length_setup").value = settings.lyrics_max_length || 60;
        }
        const source = spotify.source || "spotify_api";
        if ($("spotify_windows_media_group")) {
            $("spotify_windows_media_group").style.display = source === "windows_media" ? "" : "none";
        }
        if ($("spotify_lastfm_group")) {
            $("spotify_lastfm_group").style.display = source === "lastfm" ? "" : "none";
        }
        if ($("spotify_discord_group")) {
            $("spotify_discord_group").style.display = source === "discord" ? "" : "none";
        }
        if ($("spotify_client_setup_group")) {
            $("spotify_client_setup_group").style.display = source === "spotify_api" ? "" : "none";
        }
        if ($("spotify_now_playing_method") && document.activeElement !== $("spotify_now_playing_method")) {
            $("spotify_now_playing_method").value = source;
        }
        if ($("spotify_lastfm_username") && document.activeElement !== $("spotify_lastfm_username")) {
            $("spotify_lastfm_username").value = settings.lastfm_username || "";
        }
        if ($("spotify_redirect_uri_display")) {
            $("spotify_redirect_uri_display").value = `${window.location.origin}/spotify-callback`;
        }
        if ($("spotify_show_music") && document.activeElement !== $("spotify_show_music")) {
            $("spotify_show_music").checked = settings.show_music !== false;
        }
        if ($("spotify_music_progress") && document.activeElement !== $("spotify_music_progress")) {
            $("spotify_music_progress").checked = settings.music_progress !== false;
        }
        if ($("spotify_music_time") && document.activeElement !== $("spotify_music_time")) {
            $("spotify_music_time").checked = settings.music_time_enabled !== false;
        }
        if ($("spotify_progress_style") && document.activeElement !== $("spotify_progress_style")) {
            $("spotify_progress_style").value = settings.progress_style || "bar";
        }
        if ($("progress_bar_filled_char") && document.activeElement !== $("progress_bar_filled_char")) {
            $("progress_bar_filled_char").value = settings.progress_bar_filled_char || "█";
        }
        if ($("progress_bar_empty_char") && document.activeElement !== $("progress_bar_empty_char")) {
            $("progress_bar_empty_char").value = settings.progress_bar_empty_char || "░";
        }
        if ($("progress_bar_length") && document.activeElement !== $("progress_bar_length")) {
            $("progress_bar_length").value = settings.progress_bar_length || 10;
        }
        toggleCustomProgressBarFields();
        const s = String(spotify.status || "").toLowerCase();
        if (source === "windows_media") {
            status.textContent = spotify.song_text ? "Reading now-playing from Windows Media." : "Reading from Windows Media. Nothing detected playing right now.";
        } else if (source === "lastfm") {
            status.textContent = spotify.configured
                ? (spotify.song_text ? "Reading now-playing from Last.fm." : (spotify.last_error || "Waiting for Last.fm to show something scrobbling as now playing."))
                : "Enter your Last.fm username above to show now-playing.";
        } else if (source === "discord") {
            status.textContent = spotify.configured
                ? (spotify.song_text ? "Reading now-playing from Discord." : (spotify.last_error || "Waiting for a Spotify status to show on your Discord account."))
                : "Log in with Discord (top-right) to show now-playing.";
        } else if (s === "connected" || spotify.song_text) {
            status.textContent = "Connected. Your current song will show in the chatbox when Music is on.";
        } else if (!settings.spotify_client_id) {
            status.textContent = "Add your Spotify Client ID and Client Secret above, save, then click Connect Spotify.";
        } else {
            status.textContent = spotify.last_error || "Not connected yet. Click Connect Spotify to sign in.";
        }
    }

    async function saveLastfmUsername() {
        const username = $("spotify_lastfm_username") ? $("spotify_lastfm_username").value.trim() : "";
        await api("/save_lastfm_username", { method: "POST", body: { lastfm_username: username } });
        toast("Last.fm username saved.", "success");
    }

    async function saveNowPlayingMethod() {
        const method = $("spotify_now_playing_method") ? $("spotify_now_playing_method").value : "spotify_api";
        await api("/save_now_playing_method", { method: "POST", body: { now_playing_method: method } });
        toast("Now Playing source updated.", "success");
    }

    async function saveSpotifyCredentials() {
        const clientId = $("spotify_client_id_setup") ? $("spotify_client_id_setup").value.trim() : "";
        const clientSecret = $("spotify_client_secret_setup") ? $("spotify_client_secret_setup").value.trim() : "";
        await api("/save_spotify_credentials", {
            method: "POST",
            body: { client_id: clientId, client_secret: clientSecret }
        });
        ["spotify_client_id_setup", "spotify_client_secret_setup"].forEach((id) => setValue(id, ""));
        toast("Spotify credentials saved.", "success");
        await loadState({ silent: true });
    }

    async function saveAndConnectSpotify() {
        window.location.href = "/spotify-auth";
    }

    function toggleCustomProgressBarFields() {
        const fields = $("progress_bar_custom_fields");
        if (!fields) return;
        const style = $("spotify_progress_style") ? $("spotify_progress_style").value : "bar";
        fields.hidden = style !== "custom";
    }

    async function saveSpotifyDisplaySettings() {
        await saveSettings({
            show_music: !!($("spotify_show_music") && $("spotify_show_music").checked),
            music_progress: !!($("spotify_music_progress") && $("spotify_music_progress").checked),
            music_time_enabled: !!($("spotify_music_time") && $("spotify_music_time").checked),
            progress_style: $("spotify_progress_style") ? $("spotify_progress_style").value : "bar",
            progress_bar_filled_char: $("progress_bar_filled_char") ? $("progress_bar_filled_char").value || "█" : "█",
            progress_bar_empty_char: $("progress_bar_empty_char") ? $("progress_bar_empty_char").value || "░" : "░",
            progress_bar_length: $("progress_bar_length") ? Number($("progress_bar_length").value || 10) : 10,
            lyrics_enabled: !!($("lyrics_enabled_setup") && $("lyrics_enabled_setup").checked),
            lyrics_update_interval: $("lyrics_update_interval_setup") ? Number($("lyrics_update_interval_setup").value || 2) : 2,
            lyrics_max_length: $("lyrics_max_length_setup") ? Number($("lyrics_max_length_setup").value || 60) : 60
        });
        toast("Music display settings saved.", "success");
        await loadState({ silent: true });
    }

    function renderHeartRateSetup(heartRate, settings) {
        if ($("heart_rate_source_setup") && document.activeElement !== $("heart_rate_source_setup")) {
            $("heart_rate_source_setup").value = settings.heart_rate_source || "pulsoid";
        }
        if ($("heart_rate_interval_setup") && document.activeElement !== $("heart_rate_interval_setup")) {
            $("heart_rate_interval_setup").value = settings.heart_rate_update_interval || 5;
        }
        if ($("heart_rate_osc_setup") && document.activeElement !== $("heart_rate_osc_setup")) {
            $("heart_rate_osc_setup").checked = !!settings.heart_rate_osc_enabled;
        }
        setText("heart_rate_setup_status", heartRateDetail(heartRate));
    }

    async function saveHeartRateSettings() {
        await api("/save_heart_rate_settings", {
            method: "POST",
            body: {
                source: $("heart_rate_source_setup") ? $("heart_rate_source_setup").value : "pulsoid",
                pulsoid_token: $("heart_rate_pulsoid_token_setup") ? $("heart_rate_pulsoid_token_setup").value.trim() : "",
                hyperate_id: $("heart_rate_hyperate_id_setup") ? $("heart_rate_hyperate_id_setup").value.trim() : "",
                custom_api: $("heart_rate_custom_api_setup") ? $("heart_rate_custom_api_setup").value.trim() : "",
                update_interval: $("heart_rate_interval_setup") ? Number($("heart_rate_interval_setup").value || 5) : 5,
                heart_rate_osc_enabled: !!($("heart_rate_osc_setup") && $("heart_rate_osc_setup").checked)
            }
        });
        ["heart_rate_pulsoid_token_setup", "heart_rate_hyperate_id_setup", "heart_rate_custom_api_setup"].forEach((id) => setValue(id, ""));
        toast("Heart rate setup saved.", "success");
        await loadState({ silent: true });
    }

    async function saveWeatherTempUnit() {
        const select = $("weather_temp_unit");
        const unit = select ? select.value : "F";
        await api("/save_weather_settings", { method: "POST", body: { temp_unit: unit } });
        toast("Temperature unit saved.", "success");
        await loadState({ silent: true });
    }

    async function saveLocationZip() {
        const zipInput = $("location_zip_input");
        const status = $("location_zip_status");
        const zipCode = zipInput ? zipInput.value.trim() : "";
        try {
            const result = await api("/save_location_zip", { method: "POST", body: { zip_code: zipCode } });
            if (status) status.textContent = `Set to ${result.city}, ${result.state} (${result.timezone}).`;
            toast("Weather and time zone updated.", "success");
            await loadState({ silent: true });
        } catch (error) {
            if (status) status.textContent = error.message;
            toast(error.message, "error");
        }
    }

    async function toggleAppearanceSetting(buttonId, key, value, isOn, message) {
        const settings = getSettings();
        const previous = settings[key];
        settings[key] = value;
        setToggleState(buttonId, isOn);
        applyBodySettings(settings);
        try {
            await saveSettings({ [key]: value });
            toast(message, "success");
        } catch (error) {
            settings[key] = previous;
            setToggleState(buttonId, !isOn);
            applyBodySettings(settings);
            toast(error.message, "error");
        }
    }

    function bindAppearance() {
        onClick("theme_toggle", () => {
            const next = getSettings().theme === "light" ? "dark" : "light";
            toggleAppearanceSetting("theme_toggle", "theme", next, next === "light", "Theme updated.");
        });
        onClick("streamer_toggle", () => {
            const next = !getSettings().streamer_mode;
            toggleAppearanceSetting("streamer_toggle", "streamer_mode", next, next, "Streamer mode updated.");
        });
        onClick("compact_toggle", () => {
            const next = !getSettings().compact_mode;
            toggleAppearanceSetting("compact_toggle", "compact_mode", next, next, "Compact mode updated.");
        });
        onClick("slim_toggle", () => {
            const next = !getSettings().slim_chatbox;
            toggleAppearanceSetting("slim_toggle", "slim_chatbox", next, next, "Slim chatbox updated.");
        });
        onClick("diagnostics_toggle", () => {
            const next = !getSettings().diagnostics_opt_in;
            toggleAppearanceSetting("diagnostics_toggle", "diagnostics_opt_in", next, next, next ? "Thanks - sharing anonymous diagnostics." : "Diagnostics sharing turned off.");
        });
        onClick("save_appearance", async () => {
            await saveSettingsWithToast({
                text_effect: $("appearance_effect").value,
                chatbox_frame: $("appearance_frame").value,
                chatbox_frame_emoji: $("appearance_frame_emoji") ? ($("appearance_frame_emoji").value.trim() || "✨") : "✨",
                chatbox_frame_wrap: $("appearance_frame_wrap") ? $("appearance_frame_wrap").checked : false,
                chatbox_overflow_mode: $("appearance_overflow_mode") ? $("appearance_overflow_mode").value : "smart",
                chatbox_scroll_speed: $("appearance_scroll_speed") ? $("appearance_scroll_speed").value : "normal",
                chatbox_scroll_fixed_emoji: $("appearance_scroll_fixed_emoji") ? $("appearance_scroll_fixed_emoji").checked : false,
                chatbox_page_indicator: $("appearance_page_indicator") ? $("appearance_page_indicator").checked : true
            }, "Appearance saved.");
            clearPendingEdit("appearance_effect");
            clearPendingEdit("appearance_frame");
            clearPendingEdit("appearance_overflow_mode");
            clearPendingEdit("appearance_scroll_speed");
        });
        if ($("appearance_effect")) {
            $("appearance_effect").addEventListener("change", () => markPendingEdit("appearance_effect"));
        }
        if ($("appearance_frame")) {
            $("appearance_frame").addEventListener("change", () => { markPendingEdit("appearance_frame"); updateFrameEmojiVisibility(); updateFrameWrapVisibility(); refreshFramePreview(); });
        }
        if ($("appearance_overflow_mode")) {
            $("appearance_overflow_mode").addEventListener("change", () => { markPendingEdit("appearance_overflow_mode"); updateScrollSpeedVisibility(); });
        }
        if ($("appearance_scroll_speed")) {
            $("appearance_scroll_speed").addEventListener("change", () => markPendingEdit("appearance_scroll_speed"));
        }
        if ($("appearance_frame_emoji")) {
            $("appearance_frame_emoji").addEventListener("input", refreshFramePreview);
        }
        bindCustomFrameBuilder();
        bindIconSettings();
        bindScrollSettings();
    }

    function renderIconSettingsGrid() {
        const grid = $("icon_settings_grid");
        if (!grid) return;
        const settings = getSettings();
        grid.innerHTML = ICON_SETTINGS.map((item) => `
            <div class="icon-setting-row">
                <span>${escapeHtml(item.label)}</span>
                <input type="text" maxlength="8" data-icon-emoji="${escapeAttr(item.emojiKey)}" value="${escapeAttr(settings[item.emojiKey] || item.defaultEmoji)}">
                <label class="switch-row"><input type="checkbox" data-icon-enabled="${escapeAttr(item.enabledKey)}" ${settings[item.enabledKey] !== false ? "checked" : ""}> <span>On</span></label>
            </div>
        `).join("");
    }

    function bindIconSettings() {
        renderIconSettingsGrid();
        if ($("show_module_icons")) {
            $("show_module_icons").checked = getSettings().show_module_icons !== false;
        }
        onClick("save_icon_settings", saveIconSettings);
    }

    async function saveIconSettings() {
        try {
            const patch = {
                show_module_icons: $("show_module_icons") ? $("show_module_icons").checked : true
            };
            $$("[data-icon-emoji]").forEach((input) => {
                patch[input.dataset.iconEmoji] = input.value.trim() || undefined;
            });
            $$("[data-icon-enabled]").forEach((checkbox) => {
                patch[checkbox.dataset.iconEnabled] = checkbox.checked;
            });
            await saveSettings(patch);
            await loadState({ silent: true });
            toast("Icon settings saved.", "success");
        } catch (error) {
            toast(error.message || "Could not save icon settings.", "error");
        }
    }

    function updateFrameEmojiVisibility() {
        const field = $("appearance_frame_emoji_field");
        if (field) field.style.display = ($("appearance_frame") && $("appearance_frame").value === "emoji") ? "" : "none";
    }

    function updateScrollSpeedVisibility() {
        const isScroll = $("appearance_overflow_mode") && $("appearance_overflow_mode").value === "scroll";
        const field = $("appearance_scroll_speed_field");
        if (field) field.style.display = isScroll ? "" : "none";
        const fixedEmojiField = $("appearance_scroll_fixed_emoji_field");
        if (fixedEmojiField) fixedEmojiField.style.display = isScroll ? "" : "none";
        const scrollSettingsField = $("scroll_settings_field");
        if (scrollSettingsField) scrollSettingsField.style.display = isScroll ? "" : "none";
    }

    function updateFrameWrapVisibility() {
        const field = $("appearance_frame_wrap_field");
        if (field) field.style.display = ($("appearance_frame") && $("appearance_frame").value !== "none") ? "" : "none";
    }

    function renderScrollSettingsGrid() {
        const grid = $("scroll_settings_grid");
        if (!grid) return;
        const settings = getSettings();
        grid.innerHTML = SCROLL_SETTINGS.map((item) => `
            <label class="switch-row"><input type="checkbox" data-scroll-enabled="${escapeAttr(item.enabledKey)}" ${settings[item.enabledKey] !== false ? "checked" : ""}> <span>${escapeHtml(item.label)}</span></label>
        `).join("");
    }

    function bindScrollSettings() {
        renderScrollSettingsGrid();
        onClick("save_scroll_settings", saveScrollSettings);
    }

    async function saveScrollSettings() {
        try {
            const patch = {};
            $$("[data-scroll-enabled]").forEach((checkbox) => {
                patch[checkbox.dataset.scrollEnabled] = checkbox.checked;
            });
            await saveSettings(patch);
            await loadState({ silent: true });
            toast("Scroll settings saved.", "success");
        } catch (error) {
            toast(error.message || "Could not save scroll settings.", "error");
        }
    }

    function bindProfiles() {
        onClick("save_profile", saveCurrentProfile);
        const list = $("profile_list");
        if (list) {
            list.addEventListener("click", async (event) => {
                const button = event.target.closest("[data-profile-action]");
                const item = event.target.closest("[data-profile-name]");
                if (!button || !item) return;
                const name = item.dataset.profileName;
                if (button.dataset.profileAction === "apply") {
                    await applyProfile(name);
                } else if (button.dataset.profileAction === "delete") {
                    await deleteProfile(name);
                }
            });
        }
    }

    function bindLogs() {
        $$(".filter").forEach((button) => {
            button.addEventListener("click", () => {
                $$(".filter").forEach((node) => node.classList.remove("active"));
                button.classList.add("active");
                state.logFilter = button.dataset.severity || "";
                refreshLogs();
            });
        });
        onClick("clear_logs", async () => {
            if (!await confirmDialog("Clear the visible application logs?")) return;
            await api("/app/logs/clear", { method: "POST" });
            toast("Logs cleared.", "success");
            await refreshLogs();
        });
        onClick("export_logs", async () => {
            try {
                await downloadEndpoint("/app/diagnostics", {}, `crystal_diagnostics_${Date.now()}.zip`);
                toast("Diagnostics report exported.", "success");
            } catch (error) {
                toast(error.message, "error");
            }
        });
    }

    function bindSettings() {
        onClick("save_settings", saveSettingsForm);
        onClick("export_config", async () => {
            try {
                await downloadEndpoint("/app/export", { redacted: true }, `crystal_config_${Date.now()}.json`);
                toast("Configuration exported.", "success");
            } catch (error) {
                toast(error.message, "error");
            }
        });
        const importInput = $("import_config");
        if (importInput) {
            importInput.addEventListener("change", async () => {
                if (!importInput.files || !importInput.files[0]) return;
                if (!await confirmDialog("Import this configuration? A backup will be created first.")) {
                    importInput.value = "";
                    return;
                }
                const formData = new FormData();
                formData.append("file", importInput.files[0]);
                try {
                    await api("/app/import", { method: "POST", body: formData });
                    toast("Configuration imported.", "success");
                    await loadState({ silent: false });
                } catch (error) {
                    toast(error.message, "error");
                } finally {
                    importInput.value = "";
                }
            });
        }
        onClick("reset_defaults", async () => {
            if (!await confirmDialog("Reset all settings to defaults? This cannot be undone from the app.")) return;
            try {
                await api("/reset_settings", { method: "POST" });
                state.editorTouched = false;
                toast("Settings reset.", "success");
                await loadState({ silent: false });
            } catch (error) {
                toast(error.message, "error");
            }
        });
    }

    function bindSetupWizard() {
        onClick("setup_close", closeSetup);
        onClick("setup_back", () => setSetupStep(state.setupStep - 1));
        onClick("setup_next", () => setSetupStep(state.setupStep + 1));
        onClick("setup_finish", finishSetup);
    }

    function renderTopbar(payload) {
        const settings = payload.settings || {};
        const runtime = payload.runtime || {};
        const status = runtime.connection_status || (payload.integrations && payload.integrations.osc && payload.integrations.osc.status) || "unknown";
        const readable = status === "connected" ? "OSC connected" : status === "disconnected" ? "OSC disconnected" : "OSC not tested";
        setBadge("osc_badge", readable, status === "connected" ? "good" : status === "disconnected" ? "bad" : "neutral");
        setText("sidebar_status", settings.setup_completed ? "Crystal Chatbox, Developed 2025" : "Setup needed");
        setText("current_profile_label", `Profile: ${settings.active_profile || "Default"}`);
    }

    function renderHome(payload) {
        const settings = payload.settings || {};
        const runtime = payload.runtime || {};
        const activePreset = payload.active_preset || {};
        setBadge("chatbox_enabled_badge", settings.chatbox_visible ? "Chatbox active" : "Chatbox hidden", settings.chatbox_visible ? "good" : "warn");
        setText("home_preview", displayMessage(runtime.preview || "No message ready yet."));
        setText("home_osc_target", ((payload.integrations || {}).osc || {}).target || `${settings.quest_ip || "127.0.0.1"}:${settings.quest_port || 9000}`);
        setText("home_last_sent", runtime.last_successful_send || "Never");
        setText("home_preset", activePreset.name || "None");

        renderAutomationSummary((payload.automations || {}));
        renderWarnings(payload.warnings || []);
        renderActivity(payload.logs || []);
        renderInsights(payload.insights || {});
    }

    function renderInsights(insights) {
        setText("insights_uptime", insights.uptime_text || "-");
        setText("insights_messages", insights.messages_sent_session != null ? String(insights.messages_sent_session) : "-");
        const stats = insights.message_stats || {};
        setText("insights_messages_period", `${stats.last_hour || 0} / ${stats.last_day || 0}`);
        setText("insights_unique_songs", insights.unique_songs_played != null ? String(insights.unique_songs_played) : "-");
        const node = $("insights_top_songs");
        if (!node) return;
        const songs = insights.top_songs || [];
        if (!songs.length) {
            node.innerHTML = `<div class="empty-state">No songs tracked yet.</div>`;
            return;
        }
        node.innerHTML = songs.map((entry) => `
            <div class="item">
                <div class="item-title"><span>${escapeHtml(entry.song)}</span><span>${entry.plays} play${entry.plays === 1 ? "" : "s"}</span></div>
            </div>
        `).join("");
    }

    function renderAutomationSummary(summary) {
        const node = $("home_automations");
        if (!node) return;
        const rules = summary.rules || [];
        if (!rules.length) {
            node.className = "empty-state";
            node.textContent = "No automations yet. Create one when you want messages to run on a schedule.";
            return;
        }
        node.className = "stack";
        node.innerHTML = `
            <div class="item">
                <div class="item-title"><span>${summary.enabled || 0} enabled</span><span>${summary.total || rules.length} total</span></div>
                <div class="item-meta">Highest priority: ${summary.top_priority || 0}</div>
            </div>
            ${rules.slice(0, 3).map((rule) => automationItemHtml(rule, false)).join("")}
        `;
    }

    function renderWarnings(warnings) {
        const node = $("home_warnings");
        if (!node) return;
        if (!warnings.length) {
            node.innerHTML = `<div class="empty-state">No warnings right now.</div>`;
            return;
        }
        node.innerHTML = warnings.map((warning) => `
            <div class="warning-card">
                <div class="item-title"><span>${escapeHtml(warning.message)}</span><span>${escapeHtml(warning.severity || "info")}</span></div>
                <div class="item-meta">${escapeHtml(warning.action || "")}</div>
            </div>
        `).join("");
    }

    function renderActivity(logs) {
        const node = $("home_activity");
        if (!node) return;
        if (!logs.length) {
            node.innerHTML = `<div class="empty-state">Recent activity will appear here.</div>`;
            return;
        }
        node.innerHTML = logs.slice().reverse().slice(0, 6).map(activityHtml).join("");
    }

    function activityHtml(entry) {
        const severity = String(entry.severity || "info").toLowerCase();
        return `
            <div class="activity-entry ${escapeAttr(severity)}">
                <div class="activity-dot" aria-hidden="true"></div>
                <div class="activity-body">
                    <div class="activity-main">
                        <span class="activity-component">${escapeHtml(entry.component || "app")}</span>
                        <span class="activity-time">${escapeHtml(formatTime(entry.timestamp))}</span>
                    </div>
                    <div class="activity-message">${escapeHtml(entry.message || "Activity recorded")}</div>
                </div>
            </div>
        `;
    }

    function renderChatbox(payload) {
        const settings = payload.settings || {};
        const runtime = payload.runtime || {};
        const template = $("message_template");
        const initialMessage = (settings.custom_texts && settings.custom_texts[0]) || (payload.active_preset || {}).message_template || "";
        if (template && !state.editorTouched && template.value !== initialMessage) {
            template.value = initialMessage;
        }
        if ($("chatbox_enabled")) {
            $("chatbox_enabled").checked = !!settings.chatbox_visible;
        }
        setText("current_sending", displayMessage(runtime.preview || "None yet."));
        setText("previous_message", displayMessage(runtime.last_message || "None yet."));
        setText("assembled_chatbox_preview", displayMessage(runtime.preview || "No automatic message ready yet."));
        renderMessageList("recent_messages", payload.typed_history || payload.message_history || [], "No recent messages yet.");
        renderMessageList("favorite_messages", settings.favorite_messages || [], "Favorite messages appear here.");
        renderMessageList("saved_templates", settings.saved_templates || [], "Saved templates appear here.");
        renderMessagePartEditor(settings);
        renderCustomMessageEditor(settings);
        renderSystemStatsEditor(settings, runtime);
        renderWindowEditor(settings);
        renderChatboxBudget(runtime);
    }

    function renderChatboxBudget(runtime) {
        const badge = $("chatbox_char_budget");
        if (!badge) return;
        const length = Number(runtime.chatbox_length || 0);
        const limit = Number(runtime.chatbox_limit || 144);
        badge.textContent = `${length} / ${limit}`;
        badge.className = `status-pill ${length > limit ? "bad" : length >= limit - 15 ? "warn" : "neutral"}`;
    }

    function isOverChatboxBudget() {
        const runtime = (state.app && state.app.runtime) || {};
        return Number(runtime.chatbox_length || 0) > Number(runtime.chatbox_limit || 144);
    }

    function renderMessagePartEditor(settings) {
        const list = $("module_toggles");
        if (list) {
            list.innerHTML = MESSAGE_PARTS.map((part) => `
                <label class="module-toggle">
                    <input type="checkbox" data-module-setting="${escapeAttr(part.setting)}" ${settings[part.setting] ? "checked" : ""}>
                    <span>
                        <strong>${escapeHtml(part.label)}</strong>
                        <small>${escapeHtml(part.help)}</small>
                    </span>
                </label>
            `).join("");
        }
        const select = $("layout_order_select");
        if (!select || select.dataset.dirty === "true") return;
        const order = normalizeLayoutOrder(settings.layout_order || []);
        const spacerTexts = settings.layout_spacers || {};
        select.innerHTML = order.map((key) => {
            if (isSpacerKey(key)) {
                const text = spacerTexts[key] || "";
                return `<option value="${escapeAttr(key)}" data-spacer-text="${escapeAttr(text)}">${escapeHtml(spacerLabel(text))}</option>`;
            }
            const part = MESSAGE_PARTS.find((item) => item.key === key);
            return `<option value="${escapeAttr(key)}">${escapeHtml(part ? part.label : key)}</option>`;
        }).join("");
        updateSpacerTextField();
    }

    function renderCustomMessageEditor(settings) {
        const textarea = $("custom_messages_text");
        if (!textarea || document.activeElement === textarea) return;
        textarea.value = (settings.custom_texts || []).join("\n");
    }

    function renderSystemStatsEditor(settings, runtime) {
        const enabled = $("system_stats_enabled_editor");
        if (enabled) enabled.checked = !!settings.system_stats_enabled;
        const checkboxMap = {
            system_show_cpu: "system_stats_show_cpu",
            system_show_ram: "system_stats_show_ram",
            system_show_gpu: "system_stats_show_gpu",
            system_show_network: "system_stats_show_network",
            system_show_battery: "system_stats_show_battery"
        };
        Object.entries(checkboxMap).forEach(([id, key]) => {
            const node = $(id);
            if (node) node.checked = !!settings[key];
        });
        setValue("system_update_interval", settings.system_stats_update_interval || 5);
        setValue("system_decimals", settings.system_stats_decimals == null ? 0 : settings.system_stats_decimals);
        setValue("system_network_units", settings.system_stats_network_units || "bits");
        const template = $("system_stats_template_editor");
        if (template && document.activeElement !== template) {
            template.value = settings.system_stats_template || "";
        }
        setText(
            "system_stats_preview_editor",
            settings.system_stats_enabled
                ? displayMessage(runtime.system_stats_text || systemStatsDetail((state.app && state.app.integrations && state.app.integrations.system_stats) || {}))
                : "System stats are off. Turn on Show system stats and save."
        );
    }

    function renderWindowEditor(settings) {
        const enabled = $("window_tracking_enabled_editor");
        if (enabled) enabled.checked = !!settings.window_tracking_enabled;
        if ($("window_emoji_editor") && document.activeElement !== $("window_emoji_editor")) {
            setValue("window_emoji_editor", settings.window_emoji || "");
        }
        if ($("window_prefix_editor") && document.activeElement !== $("window_prefix_editor")) {
            setValue("window_prefix_editor", settings.window_prefix || "");
        }
        if ($("window_max_length_editor") && document.activeElement !== $("window_max_length_editor")) {
            setValue("window_max_length_editor", settings.window_title_max_length || 50);
        }
        if ($("window_tracking_mode_editor") && document.activeElement !== $("window_tracking_mode_editor")) {
            setValue("window_tracking_mode_editor", settings.window_tracking_mode || "both");
        }
        const aliasField = $("window_aliases_editor");
        if (aliasField && document.activeElement !== aliasField) {
            const aliases = settings.window_name_aliases || {};
            aliasField.value = Object.entries(aliases).map(([key, value]) => `${key} = ${value}`).join("\n");
        }
    }

    function parseWindowAliases(text) {
        const aliases = {};
        (text || "").split("\n").forEach((line) => {
            const idx = line.indexOf("=");
            if (idx === -1) return;
            const key = line.slice(0, idx).trim();
            const value = line.slice(idx + 1).trim();
            if (key && value) aliases[key] = value;
        });
        return aliases;
    }

    async function saveWindowEditor() {
        const payload = {
            window_prefix: ($("window_prefix_editor") && $("window_prefix_editor").value) || "",
            window_emoji: ($("window_emoji_editor") && $("window_emoji_editor").value) || "",
            window_title_max_length: parseInt(($("window_max_length_editor") && $("window_max_length_editor").value) || "50", 10),
            window_tracking_mode: ($("window_tracking_mode_editor") && $("window_tracking_mode_editor").value) || "both",
            window_name_aliases: parseWindowAliases($("window_aliases_editor") && $("window_aliases_editor").value)
        };
        try {
            await api("/save_window_settings", { method: "POST", body: payload });
            const trackingEnabled = $("window_tracking_enabled_editor") ? $("window_tracking_enabled_editor").checked : false;
            if (trackingEnabled !== !!getSettings().window_tracking_enabled) {
                await api("/toggle_window_tracking", { method: "POST" });
            }
            toast("Active window settings saved.", "success");
            await loadState({ silent: true });
        } catch (error) {
            toast(error.message, "error");
        }
    }

    function renderMessageList(id, messages, emptyText) {
        const node = $(id);
        if (!node) return;
        const rows = (messages || []).map(normalizeMessageRecord).filter((message) => message.text);
        if (!rows.length) {
            node.innerHTML = `<div class="empty-state">${escapeHtml(emptyText)}</div>`;
            return;
        }
        node.innerHTML = rows.slice(0, 8).map((message) => `
            <div class="item" data-message="${escapeAttr(message.text)}">
                <div class="item-title"><span>${escapeHtml(displayMessage(message.text))}</span></div>
                <div class="item-meta">${escapeHtml(message.meta || "")}</div>
                <div class="item-actions"><button class="secondary" type="button" data-use-message="${escapeAttr(message.text)}">Use</button></div>
            </div>
        `).join("");
        $$("[data-use-message]", node).forEach((button) => {
            button.addEventListener("click", () => {
                $("message_template").value = button.dataset.useMessage || "";
                state.editorTouched = true;
                showSection("chatbox");
                schedulePreview();
            });
        });
    }

    function normalizeMessageRecord(record) {
        if (typeof record === "string") return { text: record, meta: "" };
        if (!record || typeof record !== "object") return { text: "", meta: "" };
        let meta = record.created_at || record.name || "";
        if (!meta && typeof record.timestamp === "number") {
            meta = formatTime(record.timestamp * 1000);
        } else if (!meta) {
            meta = record.timestamp || "";
        }
        return {
            text: record.message || record.text || record.template || record.content || "",
            meta
        };
    }

    function schedulePreview() {
        window.clearTimeout(state.previewTimer);
        state.previewTimer = window.setTimeout(previewEditorMessage, 160);
    }

    async function previewEditorMessage() {
        const template = $("message_template");
        if (!template) return null;
        const value = template.value || "";
        try {
            const payload = await api("/app/chatbox/preview", { method: "POST", body: { message: value } });
            state.preview = payload;
            setText("resolved_preview", displayMessage(payload.resolved || ""));
            setText("final_preview", displayMessage(payload.final || payload.formatted || ""));
            setText("char_count", `${payload.length || 0} / ${payload.limit || 144}`);
            setText("validation_text", payload.will_truncate ? "Too long. Final output will be shortened." : "Ready");
            $("validation_text").classList.toggle("danger-text", !!payload.will_truncate);
            return payload;
        } catch (error) {
            setText("validation_text", error.message || "Preview failed.");
            return null;
        }
    }

    async function sendEditorMessage() {
        const preview = await previewEditorMessage();
        if (!preview) return;
        if (!preview.final || !preview.final.trim()) {
            toast("Enter a message before sending.", "error");
            return;
        }
        if (preview.will_truncate && !await confirmDialog("This message is over the VRChat limit. Send the shortened final output?")) {
            return;
        }
        try {
            await api("/send_typed_message", { method: "POST", body: { message: preview.final } });
            toast("Message sent to the chatbox queue.", "success");
            await loadState({ silent: true });
        } catch (error) {
            toast(error.message, "error");
        }
    }

    async function sendNow() {
        try {
            await api("/send_now", { method: "POST" });
            toast("Current chatbox message sent.", "success");
            await loadState({ silent: true });
        } catch (error) {
            toast("Could not send. Check OSC and your message settings.", "error");
        }
    }

    async function clearChatbox() {
        try {
            await api("/app/chatbox/clear", { method: "POST" });
            toast("Chatbox cleared.", "success");
            await loadState({ silent: true });
        } catch (error) {
            toast(error.message, "error");
        }
    }

    async function toggleChatboxVisibility() {
        try {
            await api("/toggle_chatbox", { method: "POST" });
            toast("Chatbox visibility toggled.", "success");
            await loadState({ silent: true });
        } catch (error) {
            toast(error.message, "error");
        }
    }

    async function testOsc() {
        try {
            await api("/test_connection", { method: "POST" });
            toast("OSC test message sent successfully.", "success");
            await loadState({ silent: true });
        } catch (error) {
            toast("OSC test failed. Enable OSC in VRChat and confirm the address and port.", "error");
            await loadState({ silent: true });
        }
    }

    async function saveEditorAsPreset() {
        const preview = await previewEditorMessage();
        const template = $("message_template").value.trim();
        if (!template) {
            toast("Enter a message before saving a preset.", "error");
            return;
        }
        const name = window.prompt("Preset name", "New chatbox preset");
        if (!name) return;
        try {
            await api("/app/presets", {
                method: "POST",
                body: {
                    name,
                    description: "Saved from the chatbox editor.",
                    message_template: template,
                    refresh_interval: getSettings().osc_send_interval || 3,
                    display_duration: getSettings().typed_message_duration || 5,
                    priority: 50
                }
            });
            if (preview && preview.will_truncate) {
                toast("Preset saved. It is over the VRChat limit, so review it before sending.", "success");
            } else {
                toast("Preset saved.", "success");
            }
            await loadState({ silent: true });
            showSection("presets");
        } catch (error) {
            toast(error.message, "error");
        }
    }

    async function favoriteCurrentMessage() {
        const message = $("message_template").value.trim();
        if (!message) {
            toast("Enter a message before saving a favorite.", "error");
            return;
        }
        const settings = getSettings();
        const favorites = Array.from(new Set([message, ...(settings.favorite_messages || [])])).slice(0, 30);
        await saveSettingsWithToast({ favorite_messages: favorites }, "Favorite saved.");
    }

    async function toggleMessagePart(setting, checked) {
        if (!setting) return;
        try {
            if (setting === "system_stats_enabled") {
                await saveSystemStatsEditor({ enabledOverride: checked, quiet: true });
            } else if (setting === "show_vr_battery") {
                if (checked !== !!getSettings().vr_battery_enabled) {
                    await api("/vr-battery/toggle", { method: "POST" });
                }
            } else if (setting === "show_volume") {
                if (checked !== !!getSettings().volume_enabled) {
                    await api("/volume/toggle", { method: "POST" });
                }
            } else if (setting === "show_device_storage") {
                if (checked !== !!getSettings().device_status_enabled) {
                    await api("/device-status/toggle", { method: "POST" });
                }
            } else if (setting === "show_window") {
                await saveSettings({ show_window: checked });
                if (checked !== !!getSettings().window_tracking_enabled) {
                    await api("/toggle_window_tracking", { method: "POST" });
                }
            } else if (setting === "show_heartrate") {
                await saveSettings({ show_heartrate: checked, heart_rate_enabled: checked });
            } else if (setting === "show_weather") {
                if (checked !== !!getSettings().show_weather) {
                    await api("/toggle_weather", { method: "POST" });
                }
            } else if (setting === "afk_enabled") {
                if (checked !== !!getSettings().afk_enabled) {
                    await api("/toggle_afk", { method: "POST" });
                }
            } else {
                await saveSettings({ [setting]: checked });
            }
            await loadState({ silent: true });
            if (checked && isOverChatboxBudget()) {
                await revertMessagePart(setting);
                toast(`${messagePartLabel(setting)} would push your chatbox past VRChat's 144 character limit, so it's been turned back off. Turn something else off first, or shorten your custom messages.`, "error");
                return;
            }
            toast(`${messagePartLabel(setting)} ${checked ? "enabled" : "disabled"}.`, "success");
        } catch (error) {
            toast(error.message, "error");
            await loadState({ silent: true });
        }
    }

    async function revertMessagePart(setting) {
        if (setting === "system_stats_enabled") {
            await saveSystemStatsEditor({ enabledOverride: false, quiet: true });
        } else if (setting === "show_vr_battery") {
            await api("/vr-battery/toggle", { method: "POST" });
        } else if (setting === "show_volume") {
            await api("/volume/toggle", { method: "POST" });
        } else if (setting === "show_device_storage") {
            await api("/device-status/toggle", { method: "POST" });
        } else if (setting === "show_window") {
            await saveSettings({ show_window: false });
            await api("/toggle_window_tracking", { method: "POST" });
        } else if (setting === "show_heartrate") {
            await saveSettings({ show_heartrate: false, heart_rate_enabled: false });
        } else if (setting === "show_weather") {
            await api("/toggle_weather", { method: "POST" });
        } else if (setting === "afk_enabled") {
            await api("/toggle_afk", { method: "POST" });
        } else {
            await saveSettings({ [setting]: false });
        }
        await loadState({ silent: true });
    }

    function renderQuickPhrases(phrases) {
        const list = $("quick_phrases_list");
        if (list) {
            list.innerHTML = phrases.length
                ? phrases.map((phrase, index) => `
                    <div class="item">
                        <div class="item-title"><span>${escapeHtml(phrase.emoji ? `${phrase.emoji} ${phrase.text}` : phrase.text)}</span><span>${escapeHtml(phrase.category || "")}</span></div>
                        <div class="item-actions">
                            <button class="secondary" type="button" data-quick-phrase-send="${index}">Send</button>
                            <button class="danger" type="button" data-quick-phrase-remove="${index}">Remove</button>
                        </div>
                    </div>
                `).join("")
                : `<div class="empty-state">No quick phrases yet.</div>`;
        }
        const select = $("hotkey_phrase_select");
        if (select && document.activeElement !== select) {
            const currentValue = select.value;
            select.innerHTML = phrases.map((phrase) => `<option value="${escapeAttr(phrase.text)}">${escapeHtml(phrase.text)}</option>`).join("");
            if (currentValue && phrases.some((phrase) => phrase.text === currentValue)) select.value = currentValue;
        }
    }

    async function addQuickPhraseFromForm() {
        const text = $("quick_phrase_text") ? $("quick_phrase_text").value.trim() : "";
        const category = $("quick_phrase_category") ? $("quick_phrase_category").value.trim() || "custom" : "custom";
        if (!text) {
            toast("Enter phrase text first.", "error");
            return;
        }
        await api("/add_quick_phrase", { method: "POST", body: { text, category } });
        setValue("quick_phrase_text", "");
        setValue("quick_phrase_category", "");
        toast("Quick phrase added.", "success");
        await loadState({ silent: true });
    }

    function renderGlobalHotkeys(settings, hotkeyStatus, phrases) {
        const enabledBox = $("global_hotkeys_enabled");
        if (enabledBox) enabledBox.checked = !!settings.global_hotkeys_enabled;

        const warning = $("global_hotkeys_warning");
        if (warning) {
            if (hotkeyStatus.error) {
                warning.style.display = "";
                warning.textContent = hotkeyStatus.error;
            } else {
                warning.style.display = "none";
            }
        }

        const list = $("global_hotkeys_list");
        if (!list) return;
        const hotkeys = settings.global_hotkeys || [];
        list.innerHTML = hotkeys.length
            ? hotkeys.map((hotkey, index) => `
                <div class="item">
                    <div class="item-title"><span>${escapeHtml(hotkey.combo)}</span><span>${escapeHtml(hotkey.phrase)}</span></div>
                    <div class="item-actions">
                        <button class="danger" type="button" data-hotkey-remove="${index}">Remove</button>
                    </div>
                </div>
            `).join("")
            : `<div class="empty-state">No hotkeys yet.</div>`;
    }

    async function saveGlobalHotkeys(hotkeys, enabledOverride) {
        const enabled = enabledOverride != null ? enabledOverride : !!($("global_hotkeys_enabled") && $("global_hotkeys_enabled").checked);
        await api("/global-hotkeys", {
            method: "POST",
            body: { hotkeys: hotkeys != null ? hotkeys : (getSettings().global_hotkeys || []), enabled }
        });
        await loadState({ silent: true });
    }

    async function addGlobalHotkeyFromForm() {
        const combo = $("hotkey_combo_input") ? $("hotkey_combo_input").value.trim().toLowerCase() : "";
        const phrase = $("hotkey_phrase_select") ? $("hotkey_phrase_select").value : "";
        if (!combo || !phrase) {
            toast("Enter a key combo and pick a phrase (add a quick phrase first if the list is empty).", "error");
            return;
        }
        const hotkeys = (getSettings().global_hotkeys || []).slice();
        hotkeys.push({ combo, phrase });
        await saveGlobalHotkeys(hotkeys);
        setValue("hotkey_combo_input", "");
        toast("Hotkey added.", "success");
    }

    async function saveCustomMessages() {
        const textarea = $("custom_messages_text");
        const text = textarea ? textarea.value.trim() : "";
        try {
            await api("/save_customs", { method: "POST", body: { customs: text } });
            state.editorTouched = false;
            toast("Custom messages saved.", "success");
            await loadState({ silent: false });
        } catch (error) {
            toast(error.message, "error");
        }
    }

    function useFirstCustomMessage() {
        const lines = (($("custom_messages_text") && $("custom_messages_text").value) || "")
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);
        if (!lines.length) {
            toast("Add at least one custom message first.", "error");
            return;
        }
        setValue("message_template", lines[0]);
        state.editorTouched = true;
        schedulePreview();
    }

    function moveSelectedModule(direction) {
        const select = $("layout_order_select");
        if (!select || select.selectedIndex < 0) return;
        const index = select.selectedIndex;
        const target = index + direction;
        if (target < 0 || target >= select.options.length) return;
        const option = select.options[index];
        const reference = direction < 0 ? select.options[target] : select.options[target].nextSibling;
        select.insertBefore(option, reference);
        option.selected = true;
        select.dataset.dirty = "true";
    }

    function addLayoutSpacer() {
        const select = $("layout_order_select");
        if (!select) return;
        const id = `spacer_${Date.now()}`;
        const option = document.createElement("option");
        option.value = id;
        option.dataset.spacerText = "";
        option.textContent = spacerLabel("");
        const refIndex = select.selectedIndex;
        if (refIndex >= 0 && select.options[refIndex + 1]) {
            select.insertBefore(option, select.options[refIndex + 1]);
        } else {
            select.appendChild(option);
        }
        Array.from(select.options).forEach((opt) => { opt.selected = (opt === option); });
        select.dataset.dirty = "true";
        updateSpacerTextField();
        if ($("spacer_text_input")) $("spacer_text_input").focus();
    }

    function removeLayoutSpacer() {
        const select = $("layout_order_select");
        if (!select || select.selectedIndex < 0) return;
        const option = select.options[select.selectedIndex];
        if (!isSpacerKey(option.value)) {
            toast("Select a spacer to remove - regular message parts are toggled off above instead of deleted.", "error");
            return;
        }
        option.remove();
        select.dataset.dirty = "true";
        updateSpacerTextField();
    }

    async function saveLayoutOrder() {
        const select = $("layout_order_select");
        if (!select) return;
        const order = Array.from(select.options).map((option) => option.value);
        const spacers = {};
        Array.from(select.options).forEach((option) => {
            if (isSpacerKey(option.value)) {
                spacers[option.value] = option.dataset.spacerText || "";
            }
        });
        try {
            await api("/save_layout", { method: "POST", body: { layout_order: normalizeLayoutOrder(order), spacers } });
            select.dataset.dirty = "false";
            toast("Chatbox order saved.", "success");
            await loadState({ silent: false });
        } catch (error) {
            toast(error.message, "error");
        }
    }

    function updateSpacerTextField() {
        const select = $("layout_order_select");
        const field = $("spacer_text_field");
        const input = $("spacer_text_input");
        if (!select || !field || !input) return;
        const option = select.options[select.selectedIndex];
        if (option && isSpacerKey(option.value)) {
            field.style.display = "";
            if (document.activeElement !== input) input.value = option.dataset.spacerText || "";
        } else {
            field.style.display = "none";
        }
    }

    async function saveSystemStatsEditor(options = {}) {
        const enabledNode = $("system_stats_enabled_editor");
        const body = {
            enabled: options.enabledOverride == null ? !!(enabledNode && enabledNode.checked) : !!options.enabledOverride,
            show_cpu: !!($("system_show_cpu") && $("system_show_cpu").checked),
            show_ram: !!($("system_show_ram") && $("system_show_ram").checked),
            show_gpu: !!($("system_show_gpu") && $("system_show_gpu").checked),
            show_network: !!($("system_show_network") && $("system_show_network").checked),
            show_battery: !!($("system_show_battery") && $("system_show_battery").checked),
            update_interval: Number(($("system_update_interval") && $("system_update_interval").value) || 5),
            decimals: Number(($("system_decimals") && $("system_decimals").value) || 0),
            network_units: ($("system_network_units") && $("system_network_units").value) || "bits",
            template: ($("system_stats_template_editor") && $("system_stats_template_editor").value.trim()) || "{system_emoji} {cpu_emoji} CPU {cpu} | {ram_emoji} RAM {ram}"
        };
        const result = await api("/save_system_stats_settings", { method: "POST", body });
        setText("system_stats_preview_editor", displayMessage(result.preview || ""));
        if (!options.quiet) {
            toast("System stats saved.", "success");
            await loadState({ silent: false });
        }
    }

    function normalizeLayoutOrder(order) {
        const allowed = MESSAGE_PARTS.map((part) => part.key);
        const seen = new Set();
        const normalized = [];
        (order || []).forEach((key) => {
            if ((allowed.includes(key) || isSpacerKey(key)) && !seen.has(key)) {
                normalized.push(key);
                seen.add(key);
            }
        });
        allowed.forEach((key) => {
            if (!seen.has(key)) normalized.push(key);
        });
        return normalized;
    }

    function messagePartLabel(setting) {
        const part = MESSAGE_PARTS.find((item) => item.setting === setting);
        return part ? part.label : "Message part";
    }

    function enabledVariablesFromSettings() {
        const settings = getSettings();
        const out = {};
        MESSAGE_PARTS.forEach((part) => {
            const key = part.key === "song" ? "music" : part.key === "system_stats" ? "system" : part.key;
            out[key] = !!settings[part.setting];
        });
        return out;
    }

    function renderPresets(presets, settings) {
        const node = $("preset_list");
        if (!node) return;
        if (!presets.length) {
            node.innerHTML = `<div class="empty-state">Create your first preset to switch messages quickly.</div>`;
            return;
        }
        node.innerHTML = presets.map((preset) => presetItemHtml(preset, preset.id === settings.active_preset_id)).join("");
        if (!state.selectedPresetId) {
            const active = presets.find((preset) => preset.id === settings.active_preset_id) || presets[0];
            if (active) editPreset(active);
        }
    }

    function presetItemHtml(preset, active) {
        return `
            <div class="item ${active ? "active" : ""}" data-preset-id="${escapeAttr(preset.id)}">
                <div class="item-title">
                    <span>${escapeHtml(preset.name)}</span>
                    <span>${active ? "In use now" : `Priority ${preset.priority || 0}`}</span>
                </div>
                <div class="item-meta">${escapeHtml(preset.description || preset.message_template || "")}</div>
                <div class="preset-summary">
                    <span>Message: ${escapeHtml(displayMessage(preset.message_template || "").slice(0, 90) || "Empty")}</span>
                    <span>Updates every ${Number(preset.refresh_interval || 3)}s</span>
                    <span>Manual messages show for ${Number(preset.display_duration || 5)}s</span>
                </div>
                <div class="item-actions">
                    <button class="secondary" type="button" data-preset-action="edit">Edit</button>
                    <button class="secondary" type="button" data-preset-action="apply">Use this preset</button>
                    <button class="secondary" type="button" data-preset-action="duplicate">Make a copy</button>
                    <button class="danger" type="button" data-preset-action="delete">Delete</button>
                </div>
            </div>
        `;
    }

    function renderWorldPresets(presets, settings, liveState) {
        const select = $("world_preset_select");
        if (select && document.activeElement !== select) {
            const currentValue = select.value;
            select.innerHTML = presets.map((preset) => `<option value="${escapeAttr(preset.id)}">${escapeHtml(preset.name)}</option>`).join("");
            if (currentValue && presets.some((preset) => preset.id === currentValue)) select.value = currentValue;
        }

        const enabledBox = $("world_preset_enabled");
        if (enabledBox) enabledBox.checked = !!settings.world_preset_auto_switch_enabled;

        const worldId = String((liveState || {}).world_id || "");
        const worldName = String((liveState || {}).world_name || "");
        const currentWorldNode = $("world_preset_current_world");
        if (currentWorldNode) {
            currentWorldNode.innerHTML = worldId
                ? `<strong>Current world:</strong> ${escapeHtml(worldName || worldId)}`
                : `<strong>Current world:</strong> unknown. Turn on VRChat Instance detection to add a rule for the world you're in.`;
        }
        const addButton = $("world_preset_add_current");
        if (addButton) addButton.disabled = !worldId;

        const list = $("world_preset_rules");
        if (!list) return;
        const rules = settings.world_preset_rules || [];
        if (!rules.length) {
            list.innerHTML = `<div class="empty-state">No world rules yet. Join a world and click "Add rule for current world".</div>`;
            return;
        }
        const presetName = (id) => (presets.find((preset) => preset.id === id) || {}).name || "Unknown preset";
        list.innerHTML = rules.map((rule, index) => `
            <div class="item">
                <div class="item-title">
                    <span>${escapeHtml(rule.world_name || rule.world_id)}</span>
                    <span>${escapeHtml(presetName(rule.preset_id))}</span>
                </div>
                <div class="item-actions">
                    <button class="danger" type="button" data-world-preset-remove="${index}">Remove</button>
                </div>
            </div>
        `).join("");
    }

    async function saveWorldPresetRules(rules, enabledOverride) {
        const settings = getSettings();
        const enabled = enabledOverride != null ? enabledOverride : !!($("world_preset_enabled") && $("world_preset_enabled").checked);
        try {
            await api("/app/world-presets", {
                method: "POST",
                body: { rules: rules != null ? rules : (settings.world_preset_rules || []), enabled }
            });
            await loadState({ silent: true });
        } catch (error) {
            toast(error.message, "error");
        }
    }

    function editPreset(preset) {
        const fallback = {
            id: "",
            name: "",
            description: "",
            message_template: $("message_template") ? $("message_template").value : "",
            refresh_interval: getSettings().osc_send_interval || 3,
            display_duration: getSettings().typed_message_duration || 5,
            priority: 50
        };
        const data = preset || fallback;
        state.selectedPresetId = data.id || "";
        setValue("preset_id", data.id || "");
        setValue("preset_name", data.name || "");
        setValue("preset_description", data.description || "");
        setValue("preset_template", data.message_template || "");
        setValue("preset_refresh", data.refresh_interval || 3);
        setValue("preset_duration", data.display_duration || 5);
        setValue("preset_priority", data.priority || 50);
        setText("preset_editor_title", data.id ? "Edit preset" : "New preset");
    }

    async function savePreset() {
        const payload = {
            id: $("preset_id").value || undefined,
            name: $("preset_name").value.trim(),
            description: $("preset_description").value.trim(),
            message_template: $("preset_template").value.trim(),
            refresh_interval: Number($("preset_refresh").value || 3),
            display_duration: Number($("preset_duration").value || 5),
            priority: Number($("preset_priority").value || 50),
            enabled_variables: enabledVariablesFromSettings(),
            formatting: {
                text_effect: getSettings().text_effect || "none",
                frame: getSettings().chatbox_frame || "none",
                slim: !!getSettings().slim_chatbox
            }
        };
        if (!payload.name || !payload.message_template) {
            toast("Preset needs a name and message.", "error");
            return;
        }
        try {
            const result = await api("/app/presets", { method: "POST", body: payload });
            state.selectedPresetId = (result.preset || {}).id || "";
            toast("Preset saved.", "success");
            await loadState({ silent: true });
        } catch (error) {
            toast(error.message, "error");
        }
    }

    async function applySelectedPreset() {
        const id = $("preset_id").value;
        if (!id) {
            toast("Save the preset before applying it.", "error");
            return;
        }
        await applyPreset(id);
    }

    async function applyPreset(id) {
        try {
            await api(`/app/presets/${encodeURIComponent(id)}/apply`, { method: "POST" });
            state.editorTouched = false;
            toast("Preset applied.", "success");
            await loadState({ silent: false });
        } catch (error) {
            toast(error.message, "error");
        }
    }

    async function duplicateSelectedPreset() {
        const id = $("preset_id").value;
        if (!id) return toast("Pick a preset first.", "error");
        await duplicatePreset(id);
    }

    async function duplicatePreset(id) {
        try {
            await api(`/app/presets/${encodeURIComponent(id)}/duplicate`, { method: "POST" });
            toast("Preset duplicated.", "success");
            await loadState({ silent: true });
        } catch (error) {
            toast(error.message, "error");
        }
    }

    async function deleteSelectedPreset() {
        const id = $("preset_id").value;
        if (!id) return toast("Pick a preset first.", "error");
        await deletePreset(id);
    }

    async function deletePreset(id) {
        if (!await confirmDialog("Delete this preset?")) return;
        try {
            await api(`/app/presets/${encodeURIComponent(id)}`, { method: "DELETE" });
            state.selectedPresetId = "";
            editPreset(null);
            toast("Preset deleted.", "success");
            await loadState({ silent: true });
        } catch (error) {
            toast(error.message, "error");
        }
    }

    function renderAutomations(summary) {
        const node = $("automation_list");
        if (!node) return;
        const rules = summary.rules || summary || [];
        if (!rules.length) {
            node.innerHTML = `<div class="empty-state">Add a timed or idle automation when you want Crystal to update messages for you.</div>`;
            return;
        }
        node.innerHTML = rules.map((rule) => automationItemHtml(rule, true)).join("");
        if (!state.selectedAutomationId && rules[0]) {
            editAutomation(rules[0]);
        }
    }

    function automationItemHtml(rule, withActions) {
        return `
            <div class="item ${rule.enabled ? "active" : ""}" data-automation-id="${escapeAttr(rule.id)}">
                <div class="item-title">
                    <span>${escapeHtml(rule.name)}</span>
                    <span>${rule.enabled ? "Enabled" : "Paused"}</span>
                </div>
                <div class="item-meta">${escapeHtml(rule.trigger || "timed")} every ${Number(rule.interval_seconds || 0)}s, priority ${Number(rule.priority || 0)}</div>
                <div class="item-meta">${escapeHtml(rule.message_template || "")}</div>
                ${withActions ? `
                    <div class="item-actions">
                        <button class="secondary" type="button" data-automation-action="edit">Edit</button>
                        <button class="secondary" type="button" data-automation-action="toggle">${rule.enabled ? "Pause" : "Enable"}</button>
                        <button class="danger" type="button" data-automation-action="delete">Delete</button>
                    </div>
                ` : ""}
            </div>
        `;
    }

    function editAutomation(rule) {
        const data = rule || {
            id: "",
            enabled: true,
            name: "",
            trigger: "timed",
            message_template: "",
            interval_seconds: 60,
            priority: 50
        };
        state.selectedAutomationId = data.id || "";
        setValue("automation_id", data.id || "");
        $("automation_enabled").checked = !!data.enabled;
        setValue("automation_name", data.name || "");
        setValue("automation_trigger", data.trigger || "timed");
        setValue("automation_message", data.message_template || "");
        setValue("automation_interval", data.interval_seconds || 60);
        setValue("automation_priority", data.priority || 50);
    }

    async function saveAutomation() {
        const payload = {
            id: $("automation_id").value || undefined,
            enabled: $("automation_enabled").checked,
            name: $("automation_name").value.trim(),
            trigger: $("automation_trigger").value,
            message_template: $("automation_message").value.trim(),
            interval_seconds: Number($("automation_interval").value || 60),
            priority: Number($("automation_priority").value || 50)
        };
        if (!payload.name || !payload.message_template) {
            toast("Automation needs a name and message.", "error");
            return;
        }
        try {
            const result = await api("/app/automations", { method: "POST", body: payload });
            state.selectedAutomationId = (result.automation || {}).id || "";
            toast("Automation saved.", "success");
            await loadState({ silent: true });
        } catch (error) {
            toast(error.message, "error");
        }
    }

    async function toggleAutomation(rule) {
        await saveAutomationPayload({ ...rule, enabled: !rule.enabled }, "Automation updated.");
    }

    async function deleteSelectedAutomation() {
        const id = $("automation_id").value;
        if (!id) return toast("Pick an automation first.", "error");
        await deleteAutomation(id);
    }

    async function deleteAutomation(id) {
        if (!await confirmDialog("Delete this automation?")) return;
        try {
            await api(`/app/automations/${encodeURIComponent(id)}`, { method: "DELETE" });
            state.selectedAutomationId = "";
            editAutomation(null);
            toast("Automation deleted.", "success");
            await loadState({ silent: true });
        } catch (error) {
            toast(error.message, "error");
        }
    }

    async function saveAutomationPayload(rule, message) {
        try {
            await api(`/app/automations/${encodeURIComponent(rule.id)}`, { method: "PUT", body: rule });
            toast(message, "success");
            await loadState({ silent: true });
        } catch (error) {
            toast(error.message, "error");
        }
    }

    function renderIntegrations(integrations, settings) {
        const grid = $("integration_grid");
        if (!grid) return;
        const groups = [
            {
                label: "Chatbox Connection",
                cards: [
                    {
                        title: "VRChat OSC",
                        status: integrations.osc && integrations.osc.status,
                        detail: integrations.osc && integrations.osc.target,
                        help: "Sends messages to the VRChat chatbox.",
                        actions: [{ label: "Test", action: "test_osc" }]
                    }
                ]
            },
            {
                label: IS_QUEST ? "Media and Online" : "Media and System",
                cards: [
                    {
                        title: "Spotify",
                        status: spotifyStatus(integrations.spotify),
                        detail: (integrations.spotify && integrations.spotify.song_text) || (integrations.spotify && integrations.spotify.last_error) || "Shows the current song when connected.",
                        help: spotifyHelpText(integrations.spotify),
                        actions: spotifyCardActions(integrations.spotify)
                    },
                    {
                        title: "Weather",
                        status: settings.weather_enabled ? "enabled" : "disabled",
                        detail: weatherDetail(integrations.weather),
                        help: "Adds local weather to variables.",
                        actions: [{ label: settings.weather_enabled ? "Disable" : "Enable", action: "toggle_weather" }]
                    },
                    {
                        title: "Heart Rate",
                        status: settings.heart_rate_enabled ? "enabled" : "disabled",
                        detail: heartRateDetail(integrations.heart_rate),
                        help: "Shows Pulsoid, HypeRate, simulator, or custom API heart rate.",
                        actions: [{ label: settings.heart_rate_enabled ? "Disable" : "Enable", action: "toggle_heart_rate" }]
                    },
                    {
                        title: "Active Window",
                        status: settings.window_tracking_enabled ? "enabled" : "disabled",
                        detail: windowDetail(integrations.window),
                        help: "Can show your current app with privacy filtering.",
                        actions: [{ label: settings.window_tracking_enabled ? "Disable" : "Enable", action: "toggle_window" }]
                    },
                    {
                        title: "System Stats",
                        status: settings.system_stats_enabled ? "enabled" : "disabled",
                        detail: systemStatsDetail(integrations.system_stats),
                        help: "Adds CPU, RAM, and optional GPU variables.",
                        actions: [{ label: settings.system_stats_enabled ? "Stop" : "Start", action: "toggle_system_stats" }]
                    },
                    {
                        title: IS_QUEST ? "Quest Volume" : "System Volume",
                        status: volumeStatus(integrations.volume),
                        detail: volumeDetail(integrations.volume),
                        help: IS_QUEST ? "Reads this Quest headset's media volume." : "Reads your PC's current output volume.",
                        actions: [{ label: settings.volume_enabled ? "Disable" : "Enable", action: "toggle_volume" }]
                    }
                ]
            },
            {
                label: IS_QUEST ? "VRChat and Quest" : "VRChat and VR Hardware",
                cards: [
                    {
                        title: "VRChat Account",
                        status: vrcxAccountCardStatus(integrations.vrchat_account),
                        detail: vrcxAccountName(integrations.vrchat_account) || "Not connected yet.",
                        help: "Log in to your VRChat account for avatar search and account features.",
                        actions: []
                    },
                    {
                        title: "VRChat Live",
                        status: vrchatLiveStatus(integrations.vrchat_live),
                        detail: vrchatLiveDetail(integrations.vrchat_live),
                        help: IS_QUEST ? "Uses a manual world link or your connected VRChat account." : "Uses the VRChat log, manual links, or account data for current world info.",
                        actions: []
                    },
                    {
                        title: IS_QUEST ? "Quest Battery" : "VR Battery",
                        status: vrBatteryStatus(integrations.vr_battery),
                        detail: vrBatteryDetail(integrations.vr_battery),
                        help: IS_QUEST ? "Reads this Quest headset's battery directly." : "Headset and controller battery levels from SteamVR.",
                        actions: [{ label: settings.vr_battery_enabled ? "Disable" : "Enable", action: "toggle_vr_battery" }]
                    },
                    {
                        title: "Quest Storage",
                        status: deviceStorageStatus(integrations.device_status),
                        detail: deviceStorageDetail(integrations.device_status),
                        help: "Reads free storage space left on this Quest headset.",
                        actions: [{ label: settings.device_status_enabled ? "Disable" : "Enable", action: "toggle_device_status" }]
                    }
                ]
            }
        ];
        if (IS_QUEST) {
            groups.forEach((group) => {
                group.cards = group.cards.filter((card) => !["Active Window", "System Stats"].includes(card.title));
            });
        } else {
            groups.forEach((group) => {
                group.cards = group.cards.filter((card) => card.title !== "Quest Storage");
            });
        }
        grid.innerHTML = groups.map((group) => `
            <div class="integration-group-label">${escapeHtml(group.label)}</div>
            ${group.cards.map(integrationCardHtml).join("")}
        `).join("");
        renderIntegrationTools(integrations, settings);
        refreshVrcxPanel(false);
    }

    function renderIntegrationTools(integrations, settings) {
        const account = integrations.vrchat_account || {};
        const live = integrations.vrchat_live || {};
        const battery = integrations.vr_battery || {};
        const steamvrLaunch = integrations.steamvr_launch || {};
        const volume = integrations.volume || {};
        const deviceStatus = integrations.device_status || {};
        const oscReactions = integrations.osc_reactions || {};
        renderSpotifySetup(integrations.spotify || {}, settings);
        renderHeartRateSetup(integrations.heart_rate || {}, settings);
        setText("vrcx_account_status", vrcxAccountStatusText(account));
        setText("vrchat_live_status", live.enabled === false ? "Disabled" : live.status || "Unknown");
        setText("vrchat_live_source", live.source || "Unknown");
        setText("vrchat_live_world", live.world_name || live.world_id || "No world detected");
        setText("vrchat_live_instance", live.instance_privacy || live.instance_short || "No instance detected");
        setText("vrchat_live_players", `${live.player_count || 0}${live.capacity ? ` / ${live.capacity}` : ""}`);
        setText("vrchat_live_last_event", live.last_event || "No join/leave event yet");
        setText("vrchat_live_log", live.log_file || live.last_error || "Waiting for VRChat output log");
        setText("vrchat_live_lines_scanned", live.lines_scanned || 0);
        setText("vrchat_live_last_line", live.last_line_preview || "None yet");
        setText("vrchat_live_process_running", live.vrchat_process_running ? "Yes" : "No");
        if ($("vrchat_live_log_dir") && document.activeElement !== $("vrchat_live_log_dir")) {
            $("vrchat_live_log_dir").value = settings.vrchat_live_log_dir || live.log_dir || "";
        }
        if ($("vrchat_live_manual_location") && document.activeElement !== $("vrchat_live_manual_location")) {
            $("vrchat_live_manual_location").value = settings.vrchat_live_manual_location || live.location || "";
        }
        if ($("vrchat_live_template") && document.activeElement !== $("vrchat_live_template")) {
            $("vrchat_live_template").value = settings.vrchat_live_template || "{world} ({player_count}/{capacity}) | {instance} | {last_event}";
        }
        const liveEvents = $("vrchat_live_events");
        if (liveEvents) {
            const events = (live.events || []).slice(0, 8);
            liveEvents.innerHTML = events.length
                ? events.map((event) => `<div><strong>${escapeHtml(event.title || "")}</strong>${event.detail ? ` <span>${escapeHtml(event.detail)}</span>` : ""}</div>`).join("")
                : `<div>No live VRChat events yet.</div>`;
        }
        announceVrchatEvents(live.events || []);
        renderVrBatteryPanel(battery, settings);
        renderSteamVrLaunchPanel(steamvrLaunch);
        renderVolumePanel(volume, settings);
        renderDeviceStoragePanel(deviceStatus, settings);
        renderOscReactionsPanel(oscReactions, settings);
    }

    function renderOscReactionsPanel(oscReactions, settings) {
        const statusNode = $("osc_reactions_status");
        if (statusNode) {
            setText("osc_reactions_status", oscReactions.running
                ? `Listening on port ${oscReactions.port}`
                : (oscReactions.error || "Not running"));
        }
        setText("osc_reactions_muted", oscReactions.muted ? "Yes" : "No");

        if ($("avatar_change_enabled") && document.activeElement !== $("avatar_change_enabled")) {
            $("avatar_change_enabled").checked = !!settings.avatar_change_announce_enabled;
        }
        if ($("avatar_change_message") && document.activeElement !== $("avatar_change_message")) {
            $("avatar_change_message").value = settings.avatar_change_message || "";
        }
        if ($("mute_indicator_enabled") && document.activeElement !== $("mute_indicator_enabled")) {
            $("mute_indicator_enabled").checked = !!settings.mute_indicator_enabled;
        }
        if ($("mute_indicator_text") && document.activeElement !== $("mute_indicator_text")) {
            $("mute_indicator_text").value = settings.mute_indicator_text || "";
        }
        if ($("speaking_indicator_enabled") && document.activeElement !== $("speaking_indicator_enabled")) {
            $("speaking_indicator_enabled").checked = !!settings.speaking_indicator_enabled;
        }
        if ($("speaking_indicator_text") && document.activeElement !== $("speaking_indicator_text")) {
            $("speaking_indicator_text").value = settings.speaking_indicator_text || "";
        }

        const list = $("reaction_rules_list");
        if (!list) return;
        const rules = settings.reaction_rules || [];
        list.innerHTML = rules.length
            ? rules.map((rule, index) => `
                <div class="item">
                    <div class="item-title"><span>${escapeHtml(rule.name || rule.address)}</span><span>${escapeHtml(rule.address)} = ${escapeHtml(rule.trigger_value)}</span></div>
                    <div class="item-meta">${escapeHtml(rule.message)}</div>
                    <div class="item-actions">
                        <button class="danger" type="button" data-reaction-remove="${index}">Remove</button>
                    </div>
                </div>
            `).join("")
            : `<div class="empty-state">No reactions yet.</div>`;
    }

    async function saveAvatarChangeSettings() {
        await api("/osc-reactions/avatar-change", {
            method: "POST",
            body: {
                enabled: $("avatar_change_enabled") ? $("avatar_change_enabled").checked : false,
                message: $("avatar_change_message") ? $("avatar_change_message").value : ""
            }
        });
    }

    async function saveMuteIndicatorSettings() {
        await api("/osc-reactions/mute-indicator", {
            method: "POST",
            body: {
                enabled: $("mute_indicator_enabled") ? $("mute_indicator_enabled").checked : false,
                text: $("mute_indicator_text") ? $("mute_indicator_text").value : ""
            }
        });
    }

    async function saveSpeakingIndicatorSettings() {
        await api("/osc-reactions/speaking-indicator", {
            method: "POST",
            body: {
                enabled: $("speaking_indicator_enabled") ? $("speaking_indicator_enabled").checked : false,
                text: $("speaking_indicator_text") ? $("speaking_indicator_text").value : ""
            }
        });
    }

    async function addReactionRule() {
        const address = $("reaction_address_input") ? $("reaction_address_input").value.trim() : "";
        const value = $("reaction_value_input") ? $("reaction_value_input").value.trim() : "";
        const message = $("reaction_message_input") ? $("reaction_message_input").value.trim() : "";
        if (!address.startsWith("/avatar/parameters/") || !value || !message) {
            toast("Fill in an OSC address (starting with /avatar/parameters/), a trigger value, and a message.", "error");
            return;
        }
        const rules = (getSettings().reaction_rules || []).slice();
        rules.push({ enabled: true, name: address.split("/").pop(), address, trigger_value: value, message });
        await api("/osc-reactions/rules", { method: "POST", body: { rules } });
        // Without this, adding a second rule before anything else refreshes
        // state.app.settings reads reaction_rules from this same stale
        // pre-save snapshot again - the rule just added here would silently
        // vanish, overwritten by a save built from before it existed.
        await loadState({ silent: true });
        setValue("reaction_address_input", "");
        setValue("reaction_value_input", "");
        setValue("reaction_message_input", "");
        toast("Reaction added.", "success");
    }

    function batteryRowHtml(device) {
        if (!device) return "";
        const pct = device.has_battery ? `${device.battery_percent}%` : "no reading";
        const charging = device.charging ? " (charging)" : "";
        return `<div><strong>${escapeHtml(device.label)}</strong> <span>${escapeHtml(pct)}${escapeHtml(charging)}${device.model ? ` - ${escapeHtml(device.model)}` : ""}</span></div>`;
    }

    function renderVrBatteryPanel(battery, settings) {
        const status = $("vr_battery_status");
        if (!status) return;
        if (!battery.available) {
            setText("vr_battery_status", "Not available");
            setText("vr_battery_detail", IS_QUEST ? "Quest battery reporting is unavailable on this build." : "SteamVR battery support is unavailable on this build.");
        } else if (!battery.enabled) {
            setText("vr_battery_status", "Disabled");
            setText("vr_battery_detail", IS_QUEST ? "Turn this on to read the Quest headset battery." : "Turn this on to poll SteamVR for battery levels.");
        } else if (battery.status !== "active") {
            setText("vr_battery_status", battery.status === "error" ? "Error" : IS_QUEST ? "Waiting for Quest" : "Waiting for SteamVR");
            setText("vr_battery_detail", battery.last_error || (IS_QUEST ? "Waiting for the Quest battery service." : "Start SteamVR with your headset connected."));
        } else {
            setText("vr_battery_status", "Connected");
            setText("vr_battery_detail", IS_QUEST ? "The Quest headset battery is reporting below." : "SteamVR is reporting device battery levels below.");
        }

        const devices = [battery.hmd, ...(battery.controllers || []), ...(battery.trackers || [])].filter(Boolean);
        const list = $("vr_battery_devices");
        if (list) {
            list.innerHTML = devices.length
                ? devices.map(batteryRowHtml).join("")
                : `<div>${IS_QUEST ? "No Quest battery reading yet." : "No VR devices detected yet."}</div>`;
        }

        if ($("vr_battery_include_controllers") && document.activeElement !== $("vr_battery_include_controllers")) {
            $("vr_battery_include_controllers").checked = settings.vr_battery_include_controllers !== false;
        }
        if ($("vr_battery_include_trackers") && document.activeElement !== $("vr_battery_include_trackers")) {
            $("vr_battery_include_trackers").checked = !!settings.vr_battery_include_trackers;
        }
        if ($("vr_battery_show_charging") && document.activeElement !== $("vr_battery_show_charging")) {
            $("vr_battery_show_charging").checked = settings.vr_battery_show_charging !== false;
        }
        if ($("vr_battery_low_threshold") && document.activeElement !== $("vr_battery_low_threshold")) {
            $("vr_battery_low_threshold").value = settings.vr_battery_low_threshold ?? 20;
        }
        if ($("vr_battery_interval") && document.activeElement !== $("vr_battery_interval")) {
            $("vr_battery_interval").value = settings.vr_battery_interval || 20;
        }
    }

    function renderSteamVrLaunchPanel(steamvrLaunch) {
        const status = $("steamvr_launch_status");
        if (!status) return;
        if (!steamvrLaunch.supported) {
            setText("steamvr_launch_status", "Not available (needs the packaged .exe with SteamVR installed)");
        } else if (steamvrLaunch.enabled) {
            if (steamvrLaunch.auto_launch_confirmed) {
                setText("steamvr_launch_status", "Enabled - confirmed with SteamVR");
            } else if (steamvrLaunch.registered) {
                setText("steamvr_launch_status", "Enabled - registered, but SteamVR hasn't confirmed auto-launch yet. Try disabling and re-enabling with SteamVR running.");
            } else {
                setText("steamvr_launch_status", "Enabled - not yet confirmed, start SteamVR once to register");
            }
        } else {
            setText("steamvr_launch_status", "Disabled");
        }
    }

    async function toggleSteamVrAutoLaunch() {
        try {
            const result = await api("/steamvr/toggle-auto-launch", { method: "POST" });
            toast(result.enabled ? "Crystal Chatbox will now start with SteamVR." : "SteamVR auto-launch disabled.", "success");
        } catch (error) {
            toast(error.message, "error");
        }
    }

    function renderVolumePanel(volume, settings) {
        const status = $("volume_status");
        if (!status) return;
        if (!volume.available) {
            setText("volume_status", "Not available");
            setText("volume_detail", "Volume reporting is unavailable on this build.");
        } else if (!volume.enabled) {
            setText("volume_status", "Disabled");
            setText("volume_detail", IS_QUEST ? "Turn this on to read the Quest media volume." : "Turn this on to poll the system output volume.");
        } else if (volume.status !== "active") {
            setText("volume_status", volume.status === "error" ? "Error" : "Waiting");
            setText("volume_detail", volume.last_error || "Waiting for a volume reading.");
        } else {
            setText("volume_status", volume.muted ? "Muted" : `${volume.percent}%`);
            setText("volume_detail", IS_QUEST ? "Media volume reported by this Quest headset." : "Current system output volume.");
        }

        if ($("volume_interval") && document.activeElement !== $("volume_interval")) {
            $("volume_interval").value = settings.volume_interval || 10;
        }
    }

    function renderDeviceStoragePanel(deviceStatus, settings) {
        const status = $("device_storage_status");
        if (!status) return;
        if (!deviceStatus.available) {
            setText("device_storage_status", "Not available");
            setText("device_storage_detail", "Storage reporting is only available on the Quest build.");
        } else if (!deviceStatus.enabled) {
            setText("device_storage_status", "Disabled");
            setText("device_storage_detail", "Turn this on to read the Quest headset's free storage.");
        } else if (deviceStatus.status !== "active") {
            setText("device_storage_status", deviceStatus.status === "error" ? "Error" : "Waiting");
            setText("device_storage_detail", deviceStatus.last_error || "Waiting for a storage reading.");
        } else {
            setText("device_storage_status", `${deviceStatus.storage_free_gb}GB free`);
            setText("device_storage_detail", `${deviceStatus.storage_free_gb}GB free of ${deviceStatus.storage_total_gb}GB (${deviceStatus.storage_percent_used}% used)`);
        }

        if ($("device_storage_interval") && document.activeElement !== $("device_storage_interval")) {
            $("device_storage_interval").value = settings.device_status_interval || 60;
        }
    }

    function integrationCardHtml(card) {
        const badgeClass = cardStatusClass(card.status);
        return `
            <article class="integration-card">
                <div class="item-title">
                    <span>${escapeHtml(card.title)}</span>
                    <span class="status-pill ${badgeClass}">${escapeHtml(card.status || "unknown")}</span>
                </div>
                <p>${escapeHtml(card.detail || "")}</p>
                <div class="item-meta">${escapeHtml(card.help || "")}</div>
                ${(card.actions || []).length ? `<div class="item-actions">
                    ${(card.actions || []).map((action) => `<button class="secondary" type="button" data-integration-action="${escapeAttr(action.action)}">${escapeHtml(action.label)}</button>`).join("")}
                </div>` : ""}
            </article>
        `;
    }

    async function runIntegrationAction(action) {
        try {
            const quietActions = new Set([
                "refresh_vrchat_live",
                "refresh_vr_battery",
                "refresh_volume",
                "refresh_device_status",
                "vrchat_friends_refresh",
                "vrchat_avatar_explorer_search",
                "vrchat_roster_refresh",
                "vrchat_roster_join",
                "vrchat_user_search"
            ]);
            if (action === "test_osc") return testOsc();
            if (action === "spotify_connect") {
                window.location.href = "/spotify-auth";
                return;
            }
            if (action === "toggle_weather") await api("/toggle_weather", { method: "POST" });
            if (action === "toggle_heart_rate") await api("/toggle_heart_rate_enabled", { method: "POST" });
            if (action === "toggle_window") await api("/toggle_window_tracking", { method: "POST" });
            if (action === "toggle_system_stats") await api("/toggle_system_stats", { method: "POST" });
            if (action === "vrcx_avatar_provider_save") await vrcxSaveAvatarProvider();
            if (action === "toggle_vrchat_live") await api("/vrchat-live/toggle", { method: "POST" });
            if (action === "refresh_vrchat_live") await api("/vrchat-live/refresh", { method: "POST" });
            if (action === "save_vrchat_live_settings") await saveVrchatLiveSettings();
            if (action === "apply_vrchat_live_manual") await applyVrchatLiveManualLocation();
            if (action === "clear_vrchat_live_manual") await clearVrchatLiveManualLocation();
            if (action === "toggle_vr_battery") await api("/vr-battery/toggle", { method: "POST" });
            if (action === "refresh_vr_battery") await api("/vr-battery/refresh", { method: "POST" });
            if (action === "save_vr_battery_settings") await saveVrBatterySettings();
            if (action === "toggle_steamvr_auto_launch") await toggleSteamVrAutoLaunch();
            if (action === "toggle_volume") await api("/volume/toggle", { method: "POST" });
            if (action === "refresh_volume") await api("/volume/refresh", { method: "POST" });
            if (action === "save_volume_settings") await saveVolumeSettings();
            if (action === "toggle_device_status") await api("/device-status/toggle", { method: "POST" });
            if (action === "refresh_device_status") await api("/device-status/refresh", { method: "POST" });
            if (action === "save_device_status_settings") await saveDeviceStatusSettings();
            if (action === "vrcx_login") await vrcxLogin();
            if (action === "vrcx_2fa") await vrcxVerify2fa();
            if (action === "vrcx_logout") await api("/vrcx-plus/vrchat/logout", { method: "POST" });
            if (action === "vrchat_friends_refresh") await refreshVrchatFriends();
            if (action === "vrchat_avatar_explorer_search") await vrchatAvatarExplorerSearch();
            if (action === "vrchat_roster_refresh") await refreshVrchatRoster();
            if (action === "vrchat_roster_join") await joinVrchatRosterInstance();
            if (action === "vrchat_user_search") await vrchatUserSearch();
            if (action === "save_avatar_change") await saveAvatarChangeSettings();
            if (action === "save_mute_indicator") await saveMuteIndicatorSettings();
            if (action === "save_speaking_indicator") await saveSpeakingIndicatorSettings();
            if (action === "add_reaction_rule") await addReactionRule();
            if (!quietActions.has(action)) {
                toast("Integration updated.", "success");
            }
            await loadState({ silent: true });
        } catch (error) {
            toast(error.message, "error");
        }
    }

    async function refreshVrcxPanel(showToast) {
        try {
            const payload = await api("/vrcx-plus/state");
            const account = payload.vrchat || {};
            setText("vrcx_account_status", vrcxAccountStatusText(account));
            renderVrcxPlusPanel(payload);
            if (showToast) toast("Account and avatar search refreshed.", "success");
        } catch (error) {
            if (showToast) toast(error.message, "error");
        }
    }

    function renderVrcxPlusPanel(payload) {
        const provider = payload.provider || {};
        if ($("vrcx_provider_enabled")) $("vrcx_provider_enabled").checked = !!provider.enabled;
        if ($("vrcx_provider_urls") && document.activeElement !== $("vrcx_provider_urls")) {
            $("vrcx_provider_urls").value = (provider.urls || (provider.url ? [provider.url] : [])).join("\n");
        }
    }

    async function vrcxSaveAvatarProvider() {
        const urls = vrcxProviderUrls();
        await api("/vrcx-plus/vrchat/provider", {
            method: "POST",
            body: { enabled: !!($("vrcx_provider_enabled") && $("vrcx_provider_enabled").checked), urls }
        });
        await refreshVrcxPanel(false);
    }

    async function vrcxSelectAvatar(avatarId) {
        const id = String(avatarId || "").trim();
        if (!id) return;
        if (!await confirmDialog("Switch to this avatar in VRChat?")) return;
        try {
            await api("/vrcx-plus/vrchat/avatar-select", { method: "POST", body: { avatar_id: id } });
            toast("Avatar change sent to VRChat.", "success");
        } catch (error) {
            toast(error.message || "Couldn't switch avatar.", "error");
        }
    }

    function vrcxProviderUrls() {
        const raw = $("vrcx_provider_urls") ? $("vrcx_provider_urls").value : "";
        return raw
            .split(/\r?\n|,/)
            .map((line) => line.trim())
            .filter(Boolean);
    }

    async function vrcxLogin() {
        const username = $("vrcx_username") ? $("vrcx_username").value.trim() : "";
        const password = $("vrcx_password") ? $("vrcx_password").value : "";
        if (!username || !password) {
            throw new Error("Enter your VRChat username and password first.");
        }
        await api("/vrcx-plus/vrchat/login", { method: "POST", body: { username, password } });
        if ($("vrcx_password")) $("vrcx_password").value = "";
    }

    async function vrcxVerify2fa() {
        const code = $("vrcx_2fa_code") ? $("vrcx_2fa_code").value.trim() : "";
        const method = $("vrcx_2fa_method") ? $("vrcx_2fa_method").value : "totp";
        if (!code) {
            throw new Error("Enter your 2FA code first.");
        }
        await api("/vrcx-plus/vrchat/2fa", { method: "POST", body: { code, method } });
        if ($("vrcx_2fa_code")) $("vrcx_2fa_code").value = "";
    }

    function bindExternalLinks() {
        // Plain <a target="_blank"> clicks don't reliably leave the app's
        // embedded webview (pywebview on Windows/Mac, a WebView on Quest),
        // so route them through the backend, which hands off to a real
        // browser (or an Android VIEW intent on Quest) instead.
        document.addEventListener("click", async (event) => {
            const link = event.target.closest("[data-external-link]");
            if (!link) return;
            event.preventDefault();
            const url = link.dataset.externalLink || link.href;
            if (!url) return;
            try {
                await api("/open_external_link", { method: "POST", body: { url } });
            } catch (error) {
                toast(error.message || "Couldn't open the link.", "error");
            }
        });
    }

    const vrchatState = {
        friends: [],
        avatarResults: [],
        avatarSearched: false,
        userResults: [],
        userSearched: false,
        roster: {},
        favorites: { avatar: [], user: [], world: [] }
    };

    function bindVrchatExplorer() {
        $$(".vrchat-tab-btn").forEach((button) => {
            button.addEventListener("click", () => showVrchatTab(button.dataset.vrchatTab));
        });
        const filter = $("vrchat_friends_filter");
        if (filter) filter.addEventListener("input", () => renderVrchatFriends());
        const section = $("section_vrchat");
        if (section) {
            section.addEventListener("click", async (event) => {
                const button = event.target.closest("[data-integration-action]");
                if (!button) return;
                await runIntegrationAction(button.dataset.integrationAction);
            });
        }
        const closeBtn = document.querySelector("[data-vrchat-preview-close]");
        if (closeBtn) closeBtn.addEventListener("click", closeVrchatPreview);
        const previewDialog = $("vrchat_preview_dialog");
        if (previewDialog) {
            previewDialog.addEventListener("click", (event) => {
                if (event.target === previewDialog) closeVrchatPreview();
            });
        }
        document.addEventListener("click", async (event) => {
            const favBtn = event.target.closest("[data-vrchat-favorite]");
            if (favBtn) {
                event.preventDefault();
                event.stopPropagation();
                await toggleVrchatFavorite(favBtn);
                return;
            }
            const selectBtn = event.target.closest("[data-vrchat-select-avatar]");
            if (selectBtn) {
                await vrcxSelectAvatar(selectBtn.dataset.vrchatSelectAvatar || "");
                return;
            }
            const copyBtn = event.target.closest("[data-vrchat-copy]");
            if (copyBtn) {
                const value = copyBtn.dataset.vrchatCopy || "";
                if (value && navigator.clipboard) {
                    navigator.clipboard.writeText(value).then(() => toast("Copied to clipboard.", "success")).catch(() => {});
                }
                return;
            }
            const card = event.target.closest("[data-vrchat-card]");
            if (card) {
                openVrchatCardPreview(card);
            }
        });
    }

    function showVrchatTab(tab) {
        const next = tab || "setup";
        $$(".vrchat-tab-btn").forEach((button) => {
            button.classList.toggle("active", button.dataset.vrchatTab === next);
        });
        $$(".vrchat-pane").forEach((pane) => {
            pane.classList.toggle("active", pane.id === `vrchat_pane_${next}`);
        });
        if (next === "friends" && !vrchatState.friends.length) refreshVrchatFriends();
        if (next === "ingame") refreshVrchatRoster();
        if (next === "favorites") refreshVrchatFavorites();
    }

    function vrchatFavoriteActive(type, id) {
        return (vrchatState.favorites[type] || []).some((item) => item.id === id);
    }

    function vrchatFavoriteButtonHtml(type, id, name, image, extra) {
        if (!id) return "";
        const active = vrchatFavoriteActive(type, id);
        return `<button class="vrchat-favorite-btn${active ? " active" : ""}" type="button" title="${active ? "Remove favorite" : "Add favorite"}"
            data-vrchat-favorite data-vrchat-fav-type="${escapeAttr(type)}" data-vrchat-fav-id="${escapeAttr(id)}"
            data-vrchat-fav-name="${escapeAttr(name || "")}" data-vrchat-fav-image="${escapeAttr(image || "")}" data-vrchat-fav-extra="${escapeAttr(extra || "")}">${active ? "★" : "☆"}</button>`;
    }

    function vrchatUserCardHtml(user) {
        const id = user.id || "";
        const name = user.displayName || user.username || "Unknown user";
        const image = user.currentAvatarThumbnailImageUrl || user.currentAvatarImageUrl || user.userIcon || user.profilePicOverride || "";
        const status = String(user.status || "offline").toLowerCase();
        const statusText = user.statusDescription || (status === "offline" ? "Offline" : status);
        return `
            <div class="vrchat-card" data-vrchat-card data-vrchat-card-type="user" data-vrchat-card-id="${escapeAttr(id)}" data-vrchat-card-name="${escapeAttr(name)}">
                ${vrchatFavoriteButtonHtml("user", id, name, image, status)}
                ${image ? `<img class="vrchat-card-thumb" src="${escapeAttr(image)}" alt="" loading="lazy">` : `<div class="vrchat-card-thumb"></div>`}
                <div class="vrchat-card-body">
                    <span class="vrchat-card-title">${escapeHtml(name)}</span>
                    <span class="vrchat-card-status${status !== "offline" ? " online" : ""}">${escapeHtml(statusText)}</span>
                    ${user.currentAvatarName ? `<span class="vrchat-card-meta">Wearing: ${escapeHtml(user.currentAvatarName)}</span>` : ""}
                </div>
            </div>
        `;
    }

    function vrchatAvatarCardHtml(avatar) {
        const id = avatar.id || avatar.avatarId || avatar.avatar_id || "";
        const name = avatar.name || "Unknown avatar";
        const image = avatar.thumbnailImageUrl || avatar.imageUrl || "";
        const author = avatar.authorName || avatar.author || avatar.provider || "Unknown author";
        return `
            <div class="vrchat-card" data-vrchat-card data-vrchat-card-type="avatar" data-vrchat-card-id="${escapeAttr(id)}">
                ${vrchatFavoriteButtonHtml("avatar", id, name, image, author)}
                ${image ? `<img class="vrchat-card-thumb" src="${escapeAttr(image)}" alt="" loading="lazy">` : `<div class="vrchat-card-thumb"></div>`}
                <div class="vrchat-card-body">
                    <span class="vrchat-card-title">${escapeHtml(name)}</span>
                    <span class="vrchat-card-meta">${escapeHtml(author)}</span>
                    ${avatar.releaseStatus ? `<span class="vrchat-card-meta">${escapeHtml(avatar.releaseStatus)}</span>` : ""}
                </div>
            </div>
        `;
    }

    function vrchatRosterCardHtml(player) {
        const id = player.id || "";
        const name = player.display_name || "Unknown player";
        const joined = player.joined_at ? new Date(player.joined_at).toLocaleTimeString() : "";
        return `
            <div class="vrchat-card" data-vrchat-card data-vrchat-card-type="roster" data-vrchat-card-id="${escapeAttr(id)}" data-vrchat-card-name="${escapeAttr(name)}">
                <div class="vrchat-card-thumb"></div>
                <div class="vrchat-card-body">
                    <span class="vrchat-card-title">${escapeHtml(name)}</span>
                    ${joined ? `<span class="vrchat-card-meta">Joined ${escapeHtml(joined)}</span>` : ""}
                </div>
            </div>
        `;
    }

    async function refreshVrchatFriends() {
        const onlineNode = $("vrchat_friends_online");
        const offlineNode = $("vrchat_friends_offline");
        if (!onlineNode || !offlineNode) return;
        onlineNode.innerHTML = `<div class="empty-state">Loading friends...</div>`;
        offlineNode.innerHTML = "";
        try {
            const payload = await api("/vrcx-plus/vrchat/friends?n=200");
            vrchatState.friends = payload.friends || [];
            renderVrchatFriends();
        } catch (error) {
            onlineNode.innerHTML = `<div class="empty-state">${escapeHtml(error.message || "Could not load friends. Log in with VRChat under Integrations first.")}</div>`;
            offlineNode.innerHTML = "";
        }
    }

    function renderVrchatFriends() {
        const onlineNode = $("vrchat_friends_online");
        const offlineNode = $("vrchat_friends_offline");
        if (!onlineNode || !offlineNode) return;
        const filterValue = ($("vrchat_friends_filter") ? $("vrchat_friends_filter").value : "").trim().toLowerCase();
        const filtered = vrchatState.friends.filter((f) => !filterValue || String(f.displayName || "").toLowerCase().includes(filterValue));
        const online = filtered.filter((f) => String(f.status || "offline").toLowerCase() !== "offline");
        const offline = filtered.filter((f) => String(f.status || "offline").toLowerCase() === "offline");
        setText("vrchat_friends_online_count", online.length);
        setText("vrchat_friends_offline_count", offline.length);
        onlineNode.innerHTML = online.length ? online.map(vrchatUserCardHtml).join("") : `<div class="empty-state">No online friends${filterValue ? " match that filter" : " right now"}.</div>`;
        offlineNode.innerHTML = offline.length ? offline.map(vrchatUserCardHtml).join("") : `<div class="empty-state">No offline friends${filterValue ? " match that filter" : ""}.</div>`;
    }

    async function vrchatAvatarExplorerSearch() {
        const query = $("vrchat_avatar_explorer_query") ? $("vrchat_avatar_explorer_query").value.trim() : "";
        const source = $("vrchat_avatar_explorer_source") ? $("vrchat_avatar_explorer_source").value : "auto";
        if (query.length < 2) throw new Error("Avatar search needs at least 2 characters.");
        const node = $("vrchat_avatar_explorer_results");
        if (node) node.innerHTML = `<div class="empty-state">Searching...</div>`;
        try {
            const payload = await api("/vrcx-plus/vrchat/avatar-search", {
                method: "POST",
                body: { query, source, n: 24, urls: vrcxProviderUrls() }
            });
            renderVrchatAvatarResults(payload.results || []);
        } catch (error) {
            if (node) node.innerHTML = `<div class="empty-state">${escapeHtml(error.message || "Avatar search failed.")}</div>`;
            throw error;
        }
    }

    function renderVrchatAvatarResults(results) {
        if (results !== undefined) {
            vrchatState.avatarResults = results;
            vrchatState.avatarSearched = true;
        }
        if (!vrchatState.avatarSearched) return;
        const node = $("vrchat_avatar_explorer_results");
        if (!node) return;
        const list = vrchatState.avatarResults;
        node.innerHTML = list.length ? list.map(vrchatAvatarCardHtml).join("") : `<div class="empty-state">No avatars found.</div>`;
    }

    async function refreshVrchatRoster() {
        const node = $("vrchat_roster_list");
        try {
            const payload = await api("/vrcx-plus/vrchat/instance-roster");
            vrchatState.roster = payload;
            renderVrchatRoster();
        } catch (error) {
            if (node) node.innerHTML = `<div class="empty-state">${escapeHtml(error.message || "Could not load the current instance.")}</div>`;
        }
    }

    function renderVrchatRoster() {
        const node = $("vrchat_roster_list");
        if (!node) return;
        const rosterState = vrchatState.roster || {};
        setText("vrchat_roster_world", rosterState.world_name || "No world detected");
        setText("vrchat_roster_instance", rosterState.instance || "No instance detected");
        const players = rosterState.players || [];
        node.innerHTML = players.length ? players.map(vrchatRosterCardHtml).join("") : `<div class="empty-state">No players detected yet. Turn on the VRChat Live monitor under Integrations.</div>`;
    }

    async function joinVrchatRosterInstance() {
        const worldId = (vrchatState.roster || {}).world_id || "";
        if (!worldId) {
            throw new Error("No current world detected yet.");
        }
        await api("/vrcx-plus/vrchat/join", {
            method: "POST",
            body: { world_id: worldId, instance_id: (vrchatState.roster || {}).instance_id || "" }
        });
        toast("Sent to VRChat.", "success");
    }

    async function vrchatUserSearch() {
        const query = $("vrchat_user_search_query") ? $("vrchat_user_search_query").value.trim() : "";
        if (query.length < 2) throw new Error("User search needs at least 2 characters.");
        const node = $("vrchat_user_search_results");
        if (node) node.innerHTML = `<div class="empty-state">Searching...</div>`;
        try {
            const payload = await api("/vrcx-plus/vrchat/user-search", { method: "POST", body: { query, n: 24 } });
            renderVrchatUserResults(payload.results || []);
        } catch (error) {
            if (node) node.innerHTML = `<div class="empty-state">${escapeHtml(error.message || "User search failed.")}</div>`;
            throw error;
        }
    }

    function renderVrchatUserResults(results) {
        if (results !== undefined) {
            vrchatState.userResults = results;
            vrchatState.userSearched = true;
        }
        if (!vrchatState.userSearched) return;
        const node = $("vrchat_user_search_results");
        if (!node) return;
        const list = vrchatState.userResults;
        node.innerHTML = list.length ? list.map(vrchatUserCardHtml).join("") : `<div class="empty-state">No users found.</div>`;
    }

    async function refreshVrchatFavorites() {
        try {
            const payload = await api("/vrcx-plus/vrchat/favorites");
            vrchatState.favorites = payload.favorites || { avatar: [], user: [], world: [] };
        } catch (error) {
            // Favorites are non-critical - keep whatever we had cached.
        }
        renderVrchatFavorites();
        renderVrchatFriends();
        renderVrchatAvatarResults();
        renderVrchatUserResults();
    }

    function renderVrchatFavorites() {
        ["avatar", "user", "world"].forEach((type) => {
            const node = $(`vrchat_favorites_${type}`);
            if (!node) return;
            const items = vrchatState.favorites[type] || [];
            if (!items.length) {
                node.innerHTML = `<div class="empty-state">No favorite ${type}s yet.</div>`;
                return;
            }
            node.innerHTML = items.map((item) => `
                <div class="vrchat-card" data-vrchat-card data-vrchat-card-type="${type}" data-vrchat-card-id="${escapeAttr(item.id)}" data-vrchat-card-name="${escapeAttr(item.name || "")}">
                    ${vrchatFavoriteButtonHtml(type, item.id, item.name, item.image, item.extra)}
                    ${item.image ? `<img class="vrchat-card-thumb" src="${escapeAttr(item.image)}" alt="" loading="lazy">` : `<div class="vrchat-card-thumb"></div>`}
                    <div class="vrchat-card-body">
                        <span class="vrchat-card-title">${escapeHtml(item.name || item.id)}</span>
                        ${item.extra ? `<span class="vrchat-card-meta">${escapeHtml(item.extra)}</span>` : ""}
                    </div>
                </div>
            `).join("");
        });
    }

    async function toggleVrchatFavorite(btn) {
        const type = btn.dataset.vrchatFavType;
        const id = btn.dataset.vrchatFavId;
        if (!type || !id) return;
        const active = btn.classList.contains("active");
        try {
            if (active) {
                await api("/vrcx-plus/vrchat/favorites", { method: "DELETE", body: { type, id } });
            } else {
                await api("/vrcx-plus/vrchat/favorites", {
                    method: "POST",
                    body: {
                        type,
                        id,
                        name: btn.dataset.vrchatFavName || "",
                        image: btn.dataset.vrchatFavImage || "",
                        extra: btn.dataset.vrchatFavExtra || ""
                    }
                });
            }
            await refreshVrchatFavorites();
        } catch (error) {
            toast(error.message || "Could not update favorites.", "error");
        }
    }

    function openVrchatCardPreview(cardEl) {
        const type = cardEl.dataset.vrchatCardType;
        const id = cardEl.dataset.vrchatCardId;
        const name = cardEl.dataset.vrchatCardName || "";
        if (type === "avatar") {
            const avatar = vrchatState.avatarResults.find((a) => (a.id || a.avatarId || a.avatar_id) === id)
                || vrchatState.favorites.avatar.find((a) => a.id === id);
            openAvatarPreview(avatar, id);
        } else if (type === "user" || type === "roster") {
            openUserPreview(id, name);
        } else if (type === "world") {
            const fav = vrchatState.favorites.world.find((w) => w.id === id);
            openVrchatPreview((fav && fav.name) || name || "World", `
                ${fav && fav.image ? `<img src="${escapeAttr(fav.image)}" alt="">` : ""}
                <div class="button-row wrap"><button class="secondary" type="button" data-vrchat-copy="${escapeAttr(id)}">Copy world ID</button></div>
            `);
        }
    }

    function openAvatarPreview(avatar, id) {
        const name = (avatar && avatar.name) || "Avatar";
        const image = avatar ? (avatar.thumbnailImageUrl || avatar.imageUrl || "") : "";
        const author = avatar ? (avatar.authorName || avatar.author || avatar.extra || "Unknown author") : "";
        const description = avatar && avatar.description ? `<p>${escapeHtml(avatar.description)}</p>` : "";
        const canSelect = String(id || "").startsWith("avtr_");
        openVrchatPreview(name, `
            ${image ? `<img src="${escapeAttr(image)}" alt="">` : ""}
            <p class="item-meta">${escapeHtml(author)}</p>
            ${description}
            <div class="button-row wrap">
                ${canSelect ? `<button type="button" data-vrchat-select-avatar="${escapeAttr(id)}">Use this avatar</button>` : ""}
                ${id ? `<button class="secondary" type="button" data-vrchat-copy="${escapeAttr(id)}">Copy avatar ID</button>` : ""}
            </div>
        `);
    }

    async function openUserPreview(id, fallbackName) {
        openVrchatPreview(fallbackName || "User", `<p class="field-note">Loading profile...</p>`);
        if (!id) {
            openVrchatPreview(fallbackName || "Player", `<p class="field-note">No VRChat user ID available for this player yet.</p>`);
            return;
        }
        try {
            const payload = await api(`/vrcx-plus/vrchat/user/${encodeURIComponent(id)}`);
            const user = payload.user || {};
            const name = user.displayName || fallbackName || "User";
            const image = user.currentAvatarImageUrl || user.currentAvatarThumbnailImageUrl || user.userIcon || user.profilePicOverride || "";
            const status = String(user.status || "offline").toLowerCase();
            const bio = user.bio ? `<p>${escapeHtml(user.bio)}</p>` : "";
            openVrchatPreview(name, `
                ${image ? `<img src="${escapeAttr(image)}" alt="">` : ""}
                <p class="vrchat-card-status${status !== "offline" ? " online" : ""}">${escapeHtml(user.statusDescription || status)}</p>
                ${user.currentAvatarName ? `<p class="item-meta">Wearing: ${escapeHtml(user.currentAvatarName)}</p>` : ""}
                ${bio}
                <div class="button-row wrap">
                    ${!IS_QUEST ? `<a class="secondary" href="https://vrchat.com/home/user/${escapeAttr(id)}" target="_blank" rel="noopener">View on vrchat.com</a>` : ""}
                    <button class="secondary" type="button" data-vrchat-copy="${escapeAttr(id)}">Copy user ID</button>
                </div>
            `);
        } catch (error) {
            openVrchatPreview(fallbackName || "User", `<p class="field-note">${escapeHtml(error.message || "Could not load this profile.")}</p>`);
        }
    }

    function openVrchatPreview(title, bodyHtml) {
        setText("vrchat_preview_title", title || "Preview");
        const body = $("vrchat_preview_body");
        if (body) body.innerHTML = bodyHtml;
        const dialog = $("vrchat_preview_dialog");
        if (dialog && typeof dialog.showModal === "function" && !dialog.open) dialog.showModal();
    }

    function closeVrchatPreview() {
        const dialog = $("vrchat_preview_dialog");
        if (dialog && typeof dialog.close === "function" && dialog.open) dialog.close();
    }

    async function saveVrchatLiveSettings() {
        const logDir = $("vrchat_live_log_dir") ? $("vrchat_live_log_dir").value.trim() : "";
        const template = $("vrchat_live_template") ? $("vrchat_live_template").value.trim() : "";
        await saveSettings({
            vrchat_live_log_dir: logDir,
            vrchat_live_manual_location: $("vrchat_live_manual_location") ? $("vrchat_live_manual_location").value.trim() : "",
            vrchat_live_template: template || "{world} ({player_count}/{capacity}) | {instance} | {last_event}"
        });
        await api("/vrchat-live/refresh", { method: "POST" });
    }

    async function applyVrchatLiveManualLocation() {
        const location = $("vrchat_live_manual_location") ? $("vrchat_live_manual_location").value.trim() : "";
        if (!location) throw new Error("Paste a VRChat world link or wrld_xxx:instance first.");
        await api("/vrchat-live/manual-location", { method: "POST", body: { location } });
    }

    async function clearVrchatLiveManualLocation() {
        if ($("vrchat_live_manual_location")) $("vrchat_live_manual_location").value = "";
        await api("/vrchat-live/manual-location", { method: "POST", body: { location: "" } });
    }

    async function saveVrBatterySettings() {
        const includeControllers = $("vr_battery_include_controllers") ? $("vr_battery_include_controllers").checked : !IS_QUEST;
        const includeTrackers = $("vr_battery_include_trackers") ? $("vr_battery_include_trackers").checked : false;
        const showCharging = $("vr_battery_show_charging") ? $("vr_battery_show_charging").checked : true;
        const lowThreshold = $("vr_battery_low_threshold") ? Number($("vr_battery_low_threshold").value || 20) : 20;
        const interval = $("vr_battery_interval") ? Number($("vr_battery_interval").value || 20) : 20;
        await api("/vr-battery/settings", {
            method: "POST",
            body: {
                include_controllers: includeControllers,
                include_trackers: includeTrackers,
                show_charging: showCharging,
                low_threshold: lowThreshold,
                interval
            }
        });
    }

    async function saveVolumeSettings() {
        const interval = $("volume_interval") ? Number($("volume_interval").value || 10) : 10;
        await api("/volume/settings", {
            method: "POST",
            body: { interval }
        });
    }

    async function saveDeviceStatusSettings() {
        const interval = $("device_storage_interval") ? Number($("device_storage_interval").value || 60) : 60;
        await api("/device-status/settings", {
            method: "POST",
            body: { interval }
        });
    }

    function isVrcxLoggedIn(account) {
        return !!(account && (account.logged_in || account.loggedIn));
    }

    function needsVrcx2fa(account) {
        return !!(account && (account.requires_2fa || account.requires2fa));
    }

    function vrcxAccountStatusText(account) {
        if (!account) return "Not connected";
        if (isVrcxLoggedIn(account)) {
            const name = vrcxAccountName(account) || "Connected";
            return account.stale ? `${name} (cached)` : name;
        }
        if (needsVrcx2fa(account)) return "Waiting for 2FA";
        return account.error || "Not connected";
    }

    function vrcxAccountCardStatus(account) {
        if (!account) return "not connected";
        if (isVrcxLoggedIn(account)) return account.stale ? "connected (cached)" : "connected";
        if (needsVrcx2fa(account)) return "2FA required";
        return "not connected";
    }

    function vrcxAccountName(account) {
        if (!account) return "";
        const user = account.user || {};
        return account.displayName || account.display_name || user.displayName || user.display_name || user.username || "";
    }

    async function loadAppearanceOptions() {
        if (!state.effectsLoaded) {
            try {
                const payload = await api("/text_effects");
                const select = $("appearance_effect");
                if (select) {
                    const rawEffects = Array.isArray(payload.effects) ? payload.effects : Object.keys(payload.effects || {});
                    select.innerHTML = rawEffects.map((effect) => {
                        const id = (effect && typeof effect === "object") ? (effect.id || effect.name || "none") : effect;
                        const label = (effect && typeof effect === "object") ? (effect.name || id) : effect;
                        return `<option value="${escapeAttr(id)}">${escapeHtml(label)}</option>`;
                    }).join("");
                    select.value = getSettings().text_effect || "none";
                }
                state.effectsLoaded = true;
            } catch (error) {
                toast("Could not load text effects.", "error");
            }
        }
        if (!state.framesLoaded) {
            try {
                const payload = await api("/get_frame_styles");
                const select = $("appearance_frame");
                if (select) {
                    const styles = payload.styles || {};
                    const entries = Array.isArray(styles)
                        ? styles.map((style) => (style && typeof style === "object") ? [style.id, style] : [style, style])
                        : Object.entries(styles);
                    select.innerHTML = entries.map(([key, value]) => {
                        const label = (value && typeof value === "object") ? (value.name || key) : (value || key);
                        return `<option value="${escapeAttr(key)}">${escapeHtml(label)}</option>`;
                    }).join("");
                    select.value = getSettings().chatbox_frame || payload.current || "none";
                }
                state.framesLoaded = true;
            } catch (error) {
                toast("Could not load chatbox frames.", "error");
            }
        }
        await refreshFramePreview();
    }

    async function refreshFramePreview() {
        const select = $("appearance_frame");
        const preview = $("appearance_frame_preview");
        if (!select || !preview) return;
        const emoji = $("appearance_frame_emoji") ? ($("appearance_frame_emoji").value.trim() || "✨") : "✨";
        try {
            const payload = await api("/preview_frame", { method: "POST", body: { frame: select.value || "none", emoji } });
            preview.textContent = payload.preview || "Select a frame to preview it here.";
        } catch (error) {
            preview.textContent = "Preview unavailable.";
        }
    }

    const customFrameState = { editingId: "", timer: 0 };

    function bindCustomFrameBuilder() {
        const modeSelect = $("custom_frame_mode");
        if (modeSelect) modeSelect.addEventListener("change", () => { updateCustomFrameFieldVisibility(); scheduleCustomFramePreview(); });
        [
            "custom_frame_name", "custom_frame_top_left", "custom_frame_top_right",
            "custom_frame_bottom_left", "custom_frame_bottom_right", "custom_frame_horizontal",
            "custom_frame_vertical", "custom_frame_emoji", "custom_frame_top_line", "custom_frame_bottom_line"
        ].forEach((id) => {
            const node = $(id);
            if (node) node.addEventListener("input", scheduleCustomFramePreview);
        });
        if ($("custom_frame_padding")) $("custom_frame_padding").addEventListener("change", scheduleCustomFramePreview);
        onClick("save_custom_frame", saveCustomFrame);
        onClick("new_custom_frame", () => { newCustomFrame(); toast("Started a new frame.", "success"); });
        updateCustomFrameFieldVisibility();
        refreshCustomFrames();
    }

    function updateCustomFrameFieldVisibility() {
        const mode = $("custom_frame_mode") ? $("custom_frame_mode").value : "box";
        const corners = $("custom_frame_corners_field");
        const edges = $("custom_frame_edges_field");
        const vertical = $("custom_frame_vertical_field");
        const emojiField = $("custom_frame_emoji_field");
        const bannerField = $("custom_frame_banner_field");
        const padding = $("custom_frame_padding_field");
        if (corners) corners.style.display = (mode === "emoji" || mode === "banner") ? "none" : "";
        if (edges) edges.style.display = (mode === "box" || mode === "minimal_top" || mode === "minimal_both") ? "" : "none";
        if (vertical) vertical.style.display = mode === "box" ? "" : "none";
        if (emojiField) emojiField.style.display = mode === "emoji" ? "" : "none";
        if (bannerField) bannerField.style.display = mode === "banner" ? "" : "none";
        if (padding) padding.style.display = mode === "emoji" ? "none" : "";
    }

    function buildCustomFrameDraft() {
        return {
            name: $("custom_frame_name") ? $("custom_frame_name").value.trim() : "",
            mode: $("custom_frame_mode") ? $("custom_frame_mode").value : "box",
            top_left: $("custom_frame_top_left") ? $("custom_frame_top_left").value : "",
            top_right: $("custom_frame_top_right") ? $("custom_frame_top_right").value : "",
            bottom_left: $("custom_frame_bottom_left") ? $("custom_frame_bottom_left").value : "",
            bottom_right: $("custom_frame_bottom_right") ? $("custom_frame_bottom_right").value : "",
            horizontal: $("custom_frame_horizontal") ? $("custom_frame_horizontal").value : "",
            vertical: $("custom_frame_vertical") ? $("custom_frame_vertical").value : "",
            padding: $("custom_frame_padding") ? $("custom_frame_padding").checked : true,
            emoji: $("custom_frame_emoji") ? $("custom_frame_emoji").value.trim() : "",
            top_line: $("custom_frame_top_line") ? $("custom_frame_top_line").value : "",
            bottom_line: $("custom_frame_bottom_line") ? $("custom_frame_bottom_line").value : ""
        };
    }

    function scheduleCustomFramePreview() {
        window.clearTimeout(customFrameState.timer);
        customFrameState.timer = window.setTimeout(refreshCustomFramePreview, 250);
    }

    async function refreshCustomFramePreview() {
        const preview = $("custom_frame_preview");
        if (!preview) return;
        const draft = buildCustomFrameDraft();
        const fallbackEmoji = $("appearance_frame_emoji") ? ($("appearance_frame_emoji").value.trim() || "✨") : (getSettings().chatbox_frame_emoji || "✨");
        try {
            const payload = await api("/preview_frame", {
                method: "POST",
                body: { frame: "none", emoji: fallbackEmoji, draft }
            });
            preview.textContent = payload.preview || "Fill in the fields above to preview.";
        } catch (error) {
            preview.textContent = "Preview unavailable.";
        }
    }

    async function saveCustomFrame() {
        try {
            const draft = buildCustomFrameDraft();
            if (!draft.name) {
                toast("Enter a name for your frame.", "error");
                return;
            }
            const body = { ...draft };
            if (customFrameState.editingId) body.id = customFrameState.editingId;
            const payload = await api("/custom_frames", { method: "POST", body });
            customFrameState.editingId = payload.id;
            state.framesLoaded = false;
            await loadAppearanceOptions();
            await refreshCustomFrames();
            toast("Frame saved.", "success");
        } catch (error) {
            toast(error.message || "Could not save frame.", "error");
        }
    }

    function newCustomFrame() {
        customFrameState.editingId = "";
        if ($("custom_frame_name")) $("custom_frame_name").value = "";
        if ($("custom_frame_mode")) $("custom_frame_mode").value = "box";
        ["custom_frame_top_left", "custom_frame_top_right", "custom_frame_bottom_left", "custom_frame_bottom_right", "custom_frame_horizontal", "custom_frame_vertical", "custom_frame_emoji", "custom_frame_top_line", "custom_frame_bottom_line"].forEach((id) => {
            if ($(id)) $(id).value = "";
        });
        if ($("custom_frame_padding")) $("custom_frame_padding").checked = true;
        updateCustomFrameFieldVisibility();
        refreshCustomFramePreview();
    }

    function loadCustomFrameIntoForm(frameId, definition) {
        customFrameState.editingId = frameId;
        if ($("custom_frame_name")) $("custom_frame_name").value = definition.name || "";
        if ($("custom_frame_mode")) $("custom_frame_mode").value = definition.mode || "box";
        if ($("custom_frame_top_left")) $("custom_frame_top_left").value = definition.top_left || "";
        if ($("custom_frame_top_right")) $("custom_frame_top_right").value = definition.top_right || "";
        if ($("custom_frame_bottom_left")) $("custom_frame_bottom_left").value = definition.bottom_left || "";
        if ($("custom_frame_bottom_right")) $("custom_frame_bottom_right").value = definition.bottom_right || "";
        if ($("custom_frame_horizontal")) $("custom_frame_horizontal").value = definition.horizontal || "";
        if ($("custom_frame_vertical")) $("custom_frame_vertical").value = definition.vertical || "";
        if ($("custom_frame_padding")) $("custom_frame_padding").checked = definition.padding !== false;
        if ($("custom_frame_emoji")) $("custom_frame_emoji").value = definition.emoji || "";
        if ($("custom_frame_top_line")) $("custom_frame_top_line").value = definition.top_line || "";
        if ($("custom_frame_bottom_line")) $("custom_frame_bottom_line").value = definition.bottom_line || "";
        updateCustomFrameFieldVisibility();
        refreshCustomFramePreview();
    }

    async function refreshCustomFrames() {
        const list = $("custom_frames_list");
        if (!list) return;
        try {
            const payload = await api("/custom_frames");
            const frames = payload.custom_frames || {};
            const entries = Object.entries(frames);
            if (!entries.length) {
                list.innerHTML = `<div class="empty-state">No custom frames yet.</div>`;
                return;
            }
            list.innerHTML = entries.map(([id, definition]) => `
                <div class="item">
                    <div class="item-title"><span>${escapeHtml(definition.name || "Custom")}</span></div>
                    <div class="item-actions">
                        <button class="secondary" type="button" data-custom-frame-edit="${escapeAttr(id)}">Edit</button>
                        <button class="danger" type="button" data-custom-frame-delete="${escapeAttr(id)}">Delete</button>
                    </div>
                </div>
            `).join("");
            list.querySelectorAll("[data-custom-frame-edit]").forEach((button) => {
                button.addEventListener("click", () => {
                    const id = button.dataset.customFrameEdit;
                    if (frames[id]) loadCustomFrameIntoForm(id, frames[id]);
                });
            });
            list.querySelectorAll("[data-custom-frame-delete]").forEach((button) => {
                button.addEventListener("click", async () => {
                    try {
                        const id = button.dataset.customFrameDelete;
                        await api(`/custom_frames/${encodeURIComponent(id)}`, { method: "DELETE" });
                        if (customFrameState.editingId === id) newCustomFrame();
                        state.framesLoaded = false;
                        await loadAppearanceOptions();
                        await refreshCustomFrames();
                        toast("Frame deleted.", "success");
                    } catch (error) {
                        toast(error.message || "Could not delete frame.", "error");
                    }
                });
            });
        } catch (error) {
            list.innerHTML = `<div class="empty-state">Could not load your custom frames.</div>`;
        }
    }

    function renderProfiles(profiles, settings) {
        const node = $("profile_list");
        if (!node) return;
        if (!profiles.length) {
            node.innerHTML = `<div class="empty-state">Save a profile when you want a full setup for streaming, gaming, or away status.</div>`;
            return;
        }
        node.innerHTML = profiles.map((profile) => `
            <div class="item ${profile.name === settings.active_profile ? "active" : ""}" data-profile-name="${escapeAttr(profile.name)}">
                <div class="item-title">
                    <span>${escapeHtml(profile.name)}</span>
                    <span>${profile.name === settings.active_profile ? "Active" : "Saved"}</span>
                </div>
                <div class="item-meta">${escapeHtml(profile.description || "No description")}</div>
                <div class="item-actions">
                    <button class="secondary" type="button" data-profile-action="apply">Apply</button>
                    <button class="danger" type="button" data-profile-action="delete">Delete</button>
                </div>
            </div>
        `).join("");
    }

    async function saveCurrentProfile() {
        const name = $("profile_name").value.trim();
        if (!name) {
            toast("Profile name is required.", "error");
            return;
        }
        try {
            await api("/app/profiles", {
                method: "POST",
                body: { name, description: $("profile_description").value.trim() }
            });
            toast("Profile saved.", "success");
            await loadState({ silent: true });
        } catch (error) {
            toast(error.message, "error");
        }
    }

    async function applyProfile(name) {
        try {
            await api(`/app/profiles/${encodeURIComponent(name)}/apply`, { method: "POST" });
            state.editorTouched = false;
            toast("Profile applied.", "success");
            await loadState({ silent: false });
        } catch (error) {
            toast(error.message, "error");
        }
    }

    async function deleteProfile(name) {
        if (!await confirmDialog(`Delete profile "${name}"?`)) return;
        try {
            await api(`/app/profiles/${encodeURIComponent(name)}`, { method: "DELETE" });
            toast("Profile deleted.", "success");
            await loadState({ silent: true });
        } catch (error) {
            toast(error.message, "error");
        }
    }

    async function refreshLogs() {
        try {
            const query = state.logFilter ? `?severity=${encodeURIComponent(state.logFilter)}` : "";
            const payload = await api(`/app/logs${query}`);
            renderLogs(payload.logs || []);
        } catch (error) {
            toast(error.message, "error");
        }
    }

    function renderLogs(logs) {
        const node = $("log_list");
        if (!node) return;
        if (!logs.length) {
            node.innerHTML = `<div class="empty-state">No log entries match this filter.</div>`;
            return;
        }
        node.innerHTML = logs.slice().reverse().map(logHtml).join("");
    }

    function logHtml(entry) {
        const details = entry.details ? JSON.stringify(entry.details, null, 2) : "";
        return `
            <details class="log-entry">
                <summary>
                    <span>${escapeHtml(formatDate(entry.timestamp))}</span>
                    <strong>${escapeHtml(entry.severity || "info")}</strong>
                    <span>${escapeHtml(entry.component || "app")}</span>
                    <span>${escapeHtml(entry.message || "")}</span>
                </summary>
                <pre>${escapeHtml(details || "No technical details.")}</pre>
            </details>
        `;
    }

    function hydrateSettings(settings) {
        if ($("weather_temp_unit") && document.activeElement !== $("weather_temp_unit")) {
            $("weather_temp_unit").value = settings.weather_temp_unit || "F";
        }
        setValue("setting_quest_ip", settings.quest_ip || "127.0.0.1");
        setValue("setting_quest_port", settings.quest_port || 9000);
        setValue("setting_osc_interval", settings.osc_send_interval || 3);
        setValue("setting_typed_duration", settings.typed_message_duration || 5);
        if ($("appearance_effect") && $("appearance_effect").options.length && document.activeElement !== $("appearance_effect") && !isPendingEdit("appearance_effect")) {
            $("appearance_effect").value = settings.text_effect || "none";
        }
        if ($("appearance_frame") && $("appearance_frame").options.length && document.activeElement !== $("appearance_frame") && !isPendingEdit("appearance_frame")) {
            $("appearance_frame").value = settings.chatbox_frame || "none";
        }
        if ($("appearance_frame_emoji") && document.activeElement !== $("appearance_frame_emoji")) {
            $("appearance_frame_emoji").value = settings.chatbox_frame_emoji || "✨";
        }
        updateFrameEmojiVisibility();
        if ($("appearance_frame_wrap")) {
            $("appearance_frame_wrap").checked = settings.chatbox_frame_wrap === true;
        }
        updateFrameWrapVisibility();
        if ($("appearance_overflow_mode") && document.activeElement !== $("appearance_overflow_mode") && !isPendingEdit("appearance_overflow_mode")) {
            $("appearance_overflow_mode").value = settings.chatbox_overflow_mode || "smart";
        }
        if ($("appearance_scroll_speed") && document.activeElement !== $("appearance_scroll_speed") && !isPendingEdit("appearance_scroll_speed")) {
            $("appearance_scroll_speed").value = settings.chatbox_scroll_speed || "normal";
        }
        if ($("appearance_scroll_fixed_emoji") && document.activeElement !== $("appearance_scroll_fixed_emoji")) {
            $("appearance_scroll_fixed_emoji").checked = !!settings.chatbox_scroll_fixed_emoji;
        }
        updateScrollSpeedVisibility();
        if ($("appearance_page_indicator")) {
            $("appearance_page_indicator").checked = settings.chatbox_page_indicator !== false;
        }
        setToggleState("theme_toggle", settings.theme === "light");
        setToggleState("streamer_toggle", !!settings.streamer_mode);
        setToggleState("compact_toggle", !!settings.compact_mode);
        setToggleState("slim_toggle", !!settings.slim_chatbox);
        setToggleState("diagnostics_toggle", !!settings.diagnostics_opt_in);
    }

    function setToggleState(id, isOn) {
        const el = $(id);
        if (el) el.classList.toggle("is-on", isOn);
    }

    async function saveSettingsForm() {
        const errors = $("settings_errors");
        errors.textContent = "";
        const payload = {
            quest_ip: $("setting_quest_ip").value.trim(),
            quest_port: Number($("setting_quest_port").value),
            osc_send_interval: Number($("setting_osc_interval").value),
            typed_message_duration: Number($("setting_typed_duration").value)
        };
        try {
            await saveSettings(payload, true);
            toast("Settings saved.", "success");
            await loadState({ silent: true });
        } catch (error) {
            const fieldErrors = error.payload && error.payload.errors ? error.payload.errors : {};
            errors.innerHTML = Object.values(fieldErrors).map(escapeHtml).join("<br>") || escapeHtml(error.message);
        }
    }

    async function saveSettingsWithToast(patch, message) {
        try {
            await saveSettings(patch);
            toast(message || "Saved.", "success");
            await loadState({ silent: true });
        } catch (error) {
            toast(error.message, "error");
        }
    }

    async function saveSettings(patch, backup = false) {
        return api("/app/settings", {
            method: "POST",
            body: { settings: patch, backup }
        });
    }

    function openSetup() {
        const dialog = $("setup_dialog");
        if (!dialog) return;
        const settings = getSettings();
        setValue("setup_ip", settings.quest_ip || "127.0.0.1");
        setValue("setup_port", settings.quest_port || 9000);
        setValue("setup_message", (settings.custom_texts && settings.custom_texts[0]) || "Hello, come chat!");
        setText("setup_result", "");
        setSetupStep(0);
        if (typeof dialog.showModal === "function" && !dialog.open) {
            dialog.showModal();
        } else {
            dialog.setAttribute("open", "open");
        }
    }

    function closeSetup() {
        const dialog = $("setup_dialog");
        if (!dialog) return;
        if (typeof dialog.close === "function") dialog.close();
        dialog.removeAttribute("open");
    }

    function setSetupStep(step) {
        const lastStep = $$(".wizard-step").length - 1;
        state.setupStep = Math.max(0, Math.min(lastStep, step));
        $$(".wizard-step").forEach((node) => {
            node.classList.toggle("active", Number(node.dataset.step) === state.setupStep);
        });
        $("setup_back").disabled = state.setupStep === 0;
        $("setup_next").hidden = state.setupStep === lastStep;
        $("setup_finish").hidden = state.setupStep !== lastStep;
    }

    async function finishSetup() {
        const payload = {
            quest_ip: $("setup_ip").value.trim(),
            quest_port: Number($("setup_port").value),
            message: $("setup_message").value.trim(),
            chatbox_visible: true
        };
        try {
            await api("/app/setup", { method: "POST", body: payload });
            setText("setup_result", "Setup saved. Testing OSC...");
            try {
                await api("/test_connection", { method: "POST" });
                toast("Setup complete. OSC test succeeded.", "success");
            } catch (error) {
                toast("Setup saved, but OSC did not respond yet. Enable OSC in VRChat and test again.", "error");
            }
            closeSetup();
            state.editorTouched = false;
            await loadState({ silent: false });
        } catch (error) {
            const errors = error.payload && error.payload.errors ? Object.values(error.payload.errors).join(" ") : error.message;
            setText("setup_result", errors);
            toast(errors, "error");
        }
    }

    function applyBodySettings(settings) {
        document.body.classList.toggle("light", settings.theme === "light");
        document.body.classList.toggle("compact", !!settings.compact_mode);
    }

    function getSettings() {
        return (state.app && state.app.settings) || {};
    }

    function findPreset(id) {
        return ((state.app && state.app.presets) || []).find((preset) => preset.id === id);
    }

    function findAutomation(id) {
        const summary = (state.app && state.app.automations) || {};
        return (summary.rules || []).find((rule) => rule.id === id);
    }

    function spotifyStatus(spotify) {
        if (!spotify) return "unknown";
        if (spotify.status) return spotify.status;
        if (spotify.last_error) return "error";
        if (spotify.song_text) return "connected";
        return spotify.configured ? "ready" : "not configured";
    }

    function spotifyHelpText(spotify) {
        const source = spotify && spotify.source;
        if (source === "windows_media") return "Reads whatever's playing from Windows Media - no setup needed.";
        if (source === "lastfm") return "Scroll down to Spotify/Music Integration to enter your Last.fm username.";
        if (source === "discord") return "Log in with Discord (top-right) to read your Spotify status automatically.";
        return "Scroll down to Spotify/Music Integration to connect your own free Spotify app.";
    }

    function spotifyCardActions(spotify) {
        const source = spotify && spotify.source;
        if (source === "windows_media" || source === "lastfm" || source === "discord") return [];
        return [{ label: "Connect", action: "spotify_connect" }];
    }

    function weatherDetail(weather) {
        if (!weather) return "No weather data yet.";
        if (weather.condition && (weather.temp_f || weather.temp_c)) {
            return `${weather.temp_f || weather.temp_c} - ${weather.condition}`;
        }
        return weather.enabled ? "Waiting for weather data." : "Disabled.";
    }

    function heartRateDetail(heartRate) {
        if (!heartRate) return "No heart-rate data yet.";
        if (heartRate.is_connected && heartRate.bpm) return `${heartRate.bpm} BPM`;
        return heartRate.is_connected ? "Connected, waiting for BPM." : "Not connected.";
    }

    function windowDetail(windowState) {
        if (!windowState) return "No active window data yet.";
        return windowState.app_name || windowState.window_title || "Waiting for active window.";
    }

    function systemStatsDetail(stats) {
        if (!stats || stats.available === false) return "System stats are unavailable.";
        if (stats.cpu_percent || stats.ram_percent) return `CPU ${stats.cpu_percent || 0}% | RAM ${stats.ram_percent || 0}%`;
        return "Ready to start.";
    }

    function vrchatLiveStatus(live) {
        if (!live) return "unknown";
        if (live.enabled === false) return "disabled";
        if (live.last_error) return "warning";
        return live.status || "waiting";
    }

    function vrchatLiveDetail(live) {
        if (!live) return "Waiting for VRChat.";
        if (live.enabled === false) return "Disabled.";
        const world = live.world_name || live.world_id || "";
        if (!world) return live.last_error || live.log_file || "Waiting for a running VRChat session.";
        const capacity = live.capacity ? `/${live.capacity}` : "";
        const instance = live.instance_privacy || live.instance_short || "";
        return `${world}${instance ? ` (${instance})` : ""} - ${live.player_count || 0}${capacity} players`;
    }

    function vrBatteryStatus(battery) {
        if (!battery) return "unknown";
        if (!battery.available) return "disabled";
        if (!battery.enabled) return "disabled";
        if (battery.status === "active") return "connected";
        if (battery.status === "error") return "warning";
        return battery.status || "waiting";
    }

    function vrBatteryDetail(battery) {
        if (!battery || !battery.available) return "Requires SteamVR and pyopenvr.";
        if (!battery.enabled) return "Off. Enable to poll SteamVR for battery levels.";
        if (battery.status !== "active") return battery.last_error || "Waiting for SteamVR to start.";
        const parts = [];
        if (battery.hmd && battery.hmd.has_battery) parts.push(`Headset ${battery.hmd.battery_percent}%`);
        (battery.controllers || []).forEach((controller) => {
            if (controller.has_battery) parts.push(`${controller.label.replace(" Controller", "")} ${controller.battery_percent}%`);
        });
        if (!parts.length) return "Connected. No devices reporting battery yet.";
        return parts.join(" | ");
    }

    function volumeStatus(volume) {
        if (!volume) return "unknown";
        if (!volume.available) return "disabled";
        if (!volume.enabled) return "disabled";
        if (volume.status === "active") return "connected";
        if (volume.status === "error") return "warning";
        return volume.status || "waiting";
    }

    function volumeDetail(volume) {
        if (!volume || !volume.available) return "Not available on this build.";
        if (!volume.enabled) return "Off. Enable to poll the output volume.";
        if (volume.status !== "active") return volume.last_error || "Waiting for a volume reading.";
        if (volume.muted) return "Muted";
        return `${volume.percent}%`;
    }

    function deviceStorageStatus(deviceStatus) {
        if (!deviceStatus) return "unknown";
        if (!deviceStatus.available) return "disabled";
        if (!deviceStatus.enabled) return "disabled";
        if (deviceStatus.status === "active") return "connected";
        if (deviceStatus.status === "error") return "warning";
        return deviceStatus.status || "waiting";
    }

    function deviceStorageDetail(deviceStatus) {
        if (!deviceStatus || !deviceStatus.available) return "Only available on the Quest build.";
        if (!deviceStatus.enabled) return "Off. Enable to poll storage space.";
        if (deviceStatus.status !== "active") return deviceStatus.last_error || "Waiting for a storage reading.";
        return `${deviceStatus.storage_free_gb}GB free of ${deviceStatus.storage_total_gb}GB`;
    }

    function cardStatusClass(status) {
        const text = String(status || "").toLowerCase();
        if (["connected", "enabled", "running", "ready", "ok"].some((word) => text.includes(word))) return "good";
        if (["error", "failed", "disconnected", "stopped"].some((word) => text.includes(word))) return "bad";
        if (["disabled", "not", "auth", "warning", "unavailable"].some((word) => text.includes(word))) return "warn";
        return "neutral";
    }

    function setBadge(id, text, statusClass) {
        const node = $(id);
        if (!node) return;
        node.className = `status-pill ${statusClass || "neutral"}`;
        node.textContent = text;
    }

    function setText(id, text) {
        const node = $(id);
        if (node) node.textContent = text == null ? "" : String(text);
    }

    function setValue(id, value) {
        const node = $(id);
        if (node) node.value = value == null ? "" : value;
    }

    function displayMessage(value) {
        return String(value == null ? "" : value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
    }

    function onClick(id, handler) {
        const node = $(id);
        if (!node) return;
        node.addEventListener("click", (event) => {
            event.preventDefault();
            handler(event);
        });
    }

    function insertAtCursor(textarea, value) {
        if (!textarea || !value) return;
        const start = textarea.selectionStart || 0;
        const end = textarea.selectionEnd || 0;
        textarea.value = `${textarea.value.slice(0, start)}${value}${textarea.value.slice(end)}`;
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + value.length;
    }

    function toast(message, type = "info") {
        const region = $("toast_region");
        if (!region) return;
        const node = document.createElement("div");
        node.className = `toast ${type}`;
        node.textContent = message;
        region.appendChild(node);
        window.setTimeout(() => {
            node.style.opacity = "0";
            node.style.transform = "translateY(8px)";
        }, 3600);
        window.setTimeout(() => node.remove(), 4200);
    }

    function confirmDialog(message) {
        // window.confirm() depends on the host app implementing a JS-dialog
        // callback (WebChromeClient.onJsConfirm on Android) - p4a's webview
        // bootstrap doesn't, so it silently returns undefined instead of
        // ever showing anything, and every `if (!window.confirm(...)) return`
        // call site quietly no-ops. This uses the same <dialog> element
        // already proven working elsewhere in this page instead.
        return new Promise((resolve) => {
            const dialog = $("confirm_dialog");
            if (!dialog || typeof dialog.showModal !== "function") {
                resolve(true);
                return;
            }
            const msgEl = $("confirm_dialog_message");
            if (msgEl) msgEl.textContent = message;
            const okBtn = dialog.querySelector("[data-confirm-ok]");
            const cancelBtn = dialog.querySelector("[data-confirm-cancel]");
            const cleanup = (result) => {
                okBtn.removeEventListener("click", onOk);
                cancelBtn.removeEventListener("click", onCancel);
                dialog.removeEventListener("cancel", onCancel);
                if (dialog.open) dialog.close();
                resolve(result);
            };
            const onOk = () => cleanup(true);
            const onCancel = () => cleanup(false);
            okBtn.addEventListener("click", onOk);
            cancelBtn.addEventListener("click", onCancel);
            dialog.addEventListener("cancel", onCancel);
            dialog.showModal();
        });
    }

    function announceVrchatEvents(events) {
        if (!Array.isArray(events) || !events.length) return;
        if (!state.vrchatEventsPrimed) {
            state.vrchatEventsPrimed = true;
            state.lastVrchatEventAt = events[0].created_at || "";
            return;
        }
        const newEvents = events.filter((event) => (event.created_at || "") > state.lastVrchatEventAt);
        if (!newEvents.length) return;
        state.lastVrchatEventAt = events[0].created_at || state.lastVrchatEventAt;
        newEvents.slice().reverse().forEach((event) => {
            const type = event.kind === "join" ? "success" : event.kind === "leave" ? "warn" : "info";
            toast(event.title || "VRChat event", type);
        });
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function escapeAttr(value) {
        return escapeHtml(value).replace(/`/g, "&#96;");
    }

    function formatDate(value) {
        if (!value) return "";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);
        return date.toLocaleString();
    }

    function formatTime(value) {
        if (!value) return "";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);
        return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    }
})();
