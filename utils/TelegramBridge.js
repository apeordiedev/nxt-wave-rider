export function createTelegramBridge() {
  const webApp =
    typeof window !== "undefined" &&
    window.Telegram &&
    window.Telegram.WebApp
      ? window.Telegram.WebApp
      : null;

  const safe = (fn) => {
    try {
      fn();
    } catch (error) {
      console.warn("[Telegram] Bridge call failed:", error);
    }
  };

  const hasBridge = Boolean(webApp);

  if (hasBridge) {
    safe(() => webApp.ready());
    safe(() => webApp.expand());
    safe(() => webApp.disableVerticalSwipes());
    safe(() => {
      webApp.setHeaderColor("#03070a");
      webApp.setBackgroundColor("#03070a");
    });
  }

  return {
    hasBridge,
    webApp,

    hapticImpact(style = "light") {
      if (!hasBridge || !webApp.HapticFeedback) return;
      safe(() => webApp.HapticFeedback.impactOccurred(style));
    },

    hapticNotification(type = "success") {
      if (!hasBridge || !webApp.HapticFeedback) return;
      safe(() => webApp.HapticFeedback.notificationOccurred(type));
    },

    shareText(text) {
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
        "https://t.me"
      )}&text=${encodeURIComponent(text)}`;

      if (hasBridge && typeof webApp.openTelegramLink === "function") {
        safe(() => webApp.openTelegramLink(shareUrl));
      } else {
        window.open(shareUrl, "_blank", "noopener,noreferrer");
      }
    },

    openSurgeBot() {
      const botUrl = "https://t.me/SurgeBot";
      if (hasBridge && typeof webApp.openTelegramLink === "function") {
        safe(() => webApp.openTelegramLink(botUrl));
      } else {
        window.open(botUrl, "_blank", "noopener,noreferrer");
      }
    },

    setBackButton(enabled, callback) {
      if (!hasBridge || !webApp.BackButton) return;

      safe(() => {
        webApp.BackButton.offClick(callback);
      });

      if (enabled) {
        safe(() => {
          webApp.BackButton.onClick(callback);
          webApp.BackButton.show();
        });
      } else {
        safe(() => webApp.BackButton.hide());
      }
    },
  };
}
