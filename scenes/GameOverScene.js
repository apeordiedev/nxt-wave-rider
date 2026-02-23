import { WaveBackground } from "../utils/WaveBackground.js";

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOverScene");
  }

  init(data) {
    this.result = {
      distance: data.distance || 0,
      runNxt: data.runNxt || 0,
      finalScore: data.finalScore || 0,
      highScore: data.highScore || 0,
      lifetimeNxt: data.lifetimeNxt || 0,
      isNewHighScore: Boolean(data.isNewHighScore),
      maxMultiplier: data.maxMultiplier || 1,
      reason: data.reason || "wipeout",
    };
  }

  create() {
    this.telegram = this.registry.get("telegram");
    if (this.telegram) {
      this.backHandler = () => this.scene.start("MenuScene");
      this.telegram.setBackButton(true, this.backHandler);
      this.events.once("shutdown", () => this.telegram.setBackButton(false, this.backHandler));
    }

    const { width, height } = this.scale;
    this.bg = new WaveBackground(this, { crestBaseY: height * 0.76 });

    this.add.rectangle(width * 0.5, height * 0.5, width, height, 0x000000, 0.54).setDepth(40);

    this.add
      .text(width * 0.5, 72, "WAVE OVER", {
        fontFamily: "Arial Black, Impact, sans-serif",
        fontSize: "62px",
        color: "#8eff56",
        stroke: "#000000",
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setDepth(60);

    this.add
      .text(width * 0.5, 124, "Surge got clipped by the chaos. Reload and ride.", {
        fontFamily: "Arial, sans-serif",
        fontSize: "20px",
        color: "#d8ffe5",
      })
      .setOrigin(0.5)
      .setDepth(60);

    const panelW = Math.min(520, width * 0.92);
    const panel = this.add.rectangle(width * 0.5, height * 0.41, panelW, 260, 0x08130f, 0.96)
      .setStrokeStyle(3, 0x7cff33, 1)
      .setDepth(60);

    this.add
      .text(width * 0.5, panel.y - 92, `Final Score: ${this.result.finalScore.toLocaleString()}`, {
        fontFamily: "Arial Black, Arial, sans-serif",
        fontSize: "40px",
        color: "#dcff69",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(61);

    this.add
      .text(width * 0.5, panel.y - 36, `Distance: ${this.result.distance.toLocaleString()} m`, {
        fontFamily: "Arial Black, Arial, sans-serif",
        fontSize: "29px",
        color: "#9dff6d",
        stroke: "#000000",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(61);

    this.add
      .text(
        width * 0.5,
        panel.y + 8,
        `Run $NXT: ${this.result.runNxt.toLocaleString()}   |   Peak Multiplier: x${this.result.maxMultiplier}`,
        {
          fontFamily: "Arial, sans-serif",
          fontSize: "24px",
          color: "#d6ffd8",
        }
      )
      .setOrigin(0.5)
      .setDepth(61);

    this.add
      .text(
        width * 0.5,
        panel.y + 48,
        `Lifetime $NXT: ${this.result.lifetimeNxt.toLocaleString()}   |   High Score: ${this.result.highScore.toLocaleString()} m`,
        {
          fontFamily: "Arial, sans-serif",
          fontSize: "22px",
          color: "#c9ffd5",
        }
      )
      .setOrigin(0.5)
      .setDepth(61);

    if (this.result.isNewHighScore) {
      const high = this.add
        .text(width * 0.5, panel.y + 92, "NEW HIGH SCORE!", {
          fontFamily: "Arial Black, Arial, sans-serif",
          fontSize: "34px",
          color: "#f3ff8f",
          stroke: "#000000",
          strokeThickness: 6,
        })
        .setOrigin(0.5)
        .setDepth(61);
      this.tweens.add({
        targets: high,
        scale: { from: 0.95, to: 1.07 },
        duration: 420,
        yoyo: true,
        repeat: -1,
      });
      if (this.telegram) this.telegram.hapticNotification("success");
    }

    this.createButton(
      width * 0.5,
      height * 0.67,
      Math.min(520, width * 0.92),
      64,
      "Share to NXT Wave War Room",
      () => this.shareRun()
    );

    this.createButton(width * 0.5, height * 0.76, 290, 62, "Play Again", () => {
      this.scene.start("GameScene");
    });

    this.createButton(width * 0.5, height * 0.85, 290, 58, "Ask Surge", () => {
      if (this.telegram) this.telegram.openSurgeBot();
      else window.open("https://t.me/SurgeBot", "_blank", "noopener,noreferrer");
    }, true);
  }

  createButton(x, y, w, h, label, onClick, alt = false) {
    const bg = this.add
      .rectangle(x, y, w, h, alt ? 0x111d16 : 0x1a4427, 0.95)
      .setStrokeStyle(3, 0x7cff33, 1)
      .setDepth(70)
      .setInteractive({ useHandCursor: true });
    const text = this.add
      .text(x, y, label, {
        fontFamily: "Arial Black, Arial, sans-serif",
        fontSize: w > 420 ? "30px" : "28px",
        color: "#e8ffe8",
        stroke: "#000000",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(71);

    bg.on("pointerdown", () => {
      bg.setScale(0.985);
      this.time.delayedCall(80, () => bg.setScale(1));
      onClick();
    });
    bg.on("pointerover", () => bg.setFillStyle(alt ? 0x183123 : 0x235b34, 0.97));
    bg.on("pointerout", () => bg.setFillStyle(alt ? 0x111d16 : 0x1a4427, 0.95));

    return { bg, text };
  }

  shareRun() {
    const text = `I just rode Surge for ${this.result.distance.toLocaleString()}m & earned ${this.result.runNxt.toLocaleString()} $NXT 🔥 Lifetime: ${this.result.lifetimeNxt.toLocaleString()} $NXT – catch the NXT Wave!`;
    if (this.telegram) {
      this.telegram.shareText(text);
      this.telegram.hapticImpact("medium");
    } else {
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
        "https://t.me"
      )}&text=${encodeURIComponent(text)}`;
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  }

  update(time, delta) {
    this.bg.update(time, delta, 190);
  }
}
