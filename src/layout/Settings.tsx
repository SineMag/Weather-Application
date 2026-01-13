import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const THEME_KEY = "app_theme";
const NOTIFS_KEY = "notifications_enabled";
const OFFLINE_KEY = "offline_enabled";

async function registerSW() {
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("/sw.js");
      // console.log('Service Worker registered');
    } catch (e) {
      console.error("SW registration failed", e);
    }
  }
}

async function unregisterSWAndClearCaches() {
  if ("serviceWorker" in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));
  }
  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  }
}

type NotifyType = "info" | "warning" | "error" | "success";
interface SettingsProps {
  onNotify?: (message: string, type?: NotifyType) => void;
}

export default function Settings({ onNotify }: SettingsProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(THEME_KEY) as Theme) || "light"
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
    () => localStorage.getItem(NOTIFS_KEY) === "true"
  );
  const [offlineEnabled, setOfflineEnabled] = useState<boolean>(
    () => localStorage.getItem(OFFLINE_KEY) === "true"
  );
  const [notifStatus, setNotifStatus] = useState<string>("");

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Keep flags in localStorage
  useEffect(() => {
    localStorage.setItem(NOTIFS_KEY, String(notificationsEnabled));
  }, [notificationsEnabled]);

  useEffect(() => {
    localStorage.setItem(OFFLINE_KEY, String(offlineEnabled));
  }, [offlineEnabled]);

  // If offline enabled on load, ensure SW is registered
  useEffect(() => {
    if (offlineEnabled) {
      registerSW();
    }
  }, []);

  const handleToggleTheme = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
    onNotify?.(
      checked ? "Dark theme enabled" : "Light theme enabled",
      "success"
    );
  };

  const handleToggleNotifications = async (checked: boolean) => {
    if (!checked) {
      setNotificationsEnabled(false);
      setNotifStatus("Notifications disabled");
      onNotify?.("Notifications turned off", "info");
      return;
    }
    if (!("Notification" in window)) {
      setNotifStatus("Notifications not supported in this browser");
      setNotificationsEnabled(false);
      onNotify?.("Notifications not supported", "error");
      return;
    }
    try {
      const result = await Notification.requestPermission();
      if (result === "granted") {
        setNotificationsEnabled(true);
        setNotifStatus("Notifications enabled");
        onNotify?.("Notifications turned on", "success");
        // Send a friendly test notification
        try {
          new Notification("Weather App", {
            body: "Notifications are enabled. You will receive alerts when available.",
          });
        } catch {}
      } else {
        setNotificationsEnabled(false);
        setNotifStatus("Permission denied");
        onNotify?.("Notification permission denied", "warning");
      }
    } catch (e) {
      setNotificationsEnabled(false);
      setNotifStatus("Permission request failed");
      onNotify?.("Failed to enable notifications", "error");
    }
  };

  const handleToggleOffline = async (checked: boolean) => {
    if (checked) {
      await registerSW();
      setOfflineEnabled(true);
      onNotify?.("Offline access enabled", "success");
    } else {
      await unregisterSWAndClearCaches();
      setOfflineEnabled(false);
      onNotify?.("Offline access disabled", "info");
    }
  };

  return (
    <section className="content-area settings-panel">
      <h2>Settings</h2>
      <p>Configure your preferences. Features only work when toggled on.</p>

      <div className="setting-row">
        <div className="setting-info">
          <h3>Theme</h3>
          <p>Switch between light and dark themes.</p>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={theme === "dark"}
            onChange={(e) => handleToggleTheme(e.target.checked)}
            aria-label="Toggle dark theme"
          />
          <span className="slider" />
        </label>
      </div>

      <div className="setting-row">
        <div className="setting-info">
          <h3>Notifications</h3>
          <p>Allow push notifications for weather alerts.</p>
          {notifStatus && <small className="setting-note">{notifStatus}</small>}
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(e) => void handleToggleNotifications(e.target.checked)}
            aria-label="Toggle notifications"
          />
          <span className="slider" />
        </label>
      </div>

      <div className="setting-row">
        <div className="setting-info">
          <h3>Offline Access</h3>
          <p>Cache the app so you can use it without internet.</p>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={offlineEnabled}
            onChange={(e) => void handleToggleOffline(e.target.checked)}
            aria-label="Toggle offline access"
          />
          <span className="slider" />
        </label>
      </div>

      <style>{`
        .settings-panel .setting-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          border-bottom: 1px solid var(--border, #e5e7eb);
        }
        .settings-panel .setting-info h3 {
          margin: 0 0 4px 0;
        }
        .settings-panel .setting-info p {
          margin: 0;
          color: var(--muted, #666);
        }
        .settings-panel .setting-note { color: var(--muted, #666); display: block; margin-top: 6px; }
        /* Toggle Switch */
        .switch { position: relative; display: inline-block; width: 52px; height: 28px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .2s; border-radius: 34px; }
        .slider:before { position: absolute; content: ""; height: 22px; width: 22px; left: 3px; bottom: 3px; background-color: white; transition: .2s; border-radius: 50%; }
        input:checked + .slider { background-color: #4a4a4a; }
        input:checked + .slider:before { transform: translateX(24px); }
      `}</style>
    </section>
  );
}
