import { WaveBackground } from "../utils/WaveBackground.js";

const LEADERBOARD = [
  { name: "SurgePrime", score: 28420 },
  { name: "FoamSniper", score: 25110 },
  { name: "GreenCrest", score: 22980 },
  { name: "NodeRider", score: 20140 },
  { name: "WaveHash", score: 18870 },
];

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    const telegram = this.registry.get("telegram");
    if (telegram) {
      telegram.setBackButton(false, () => {});
    }

    const { width, height } = this.scale;
    this.bg = new WaveBackground(this, { crestBaseY: height * 0.72 });

    const progress = this.registry.get("progress");

    this.add
      .text(width * 0.5, 68, "NXT WAVE RIDER", {
        fontFamily: "Arial Black, Impact, sans-serif",
        fontSize: `${Math.max(40, Math.floor(width * 0.09))}px`,
        color: "#aaff74",
        stroke: "#000000",
        strokeThickness: 8,
        shadow: {
          offsetX: 0,
          offsetY: 0,
          color: "#9eff84",
          blur: 16,
          stroke: true,
          fill: true,
        },
      })
      .setOrigin(0.5)
      .setDepth(20);

    this.add
      .text(width * 0.5, 120, "Ride the cyber wave forever", {
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        color: "#f1ffd2",
      })
      .setOrigin(0.5)
      .setDepth(20);

    const keyArt = this.add.image(width * 0.5, height * 0.37, "surge-keyart").setDepth(17);
    keyArt.setScale(Math.min(width * 0.00125, 0.54));
    keyArt.setAlpha(0.68);

    const hero = this.add.sprite(width * 0.5, height * 0.4, "surge-sheet", 1).setDepth(18);
    hero.play("surge-surf");
    hero.setScale(Math.min(width * 0.0034, 1.2));

    this.tweens.add({
      targets: hero,
      y: hero.y - 10,
      duration: 1300,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    this.createButton(width * 0.5, height * 0.58, 300, 68, "PLAY", () => {
      this.scene.start("GameScene");
    });

    this.createButton(width * 0.5, height * 0.67, 300, 58, "LEADERBOARD", () => {
      this.showLeaderboardPopup();
    }, true);

    this.add
      .text(
        width * 0.5,
        height * 0.76,
        `Daily Streak: ${progress.streakCount} day${progress.streakCount > 1 ? "s" : ""}`,
        {
          fontFamily: "Arial Black, Arial, sans-serif",
          fontSize: "24px",
          color: "#8dff72",
          stroke: "#000000",
          strokeThickness: 5,
        }
      )
      .setOrigin(0.5)
      .setDepth(20);

    this.add
      .text(
        width * 0.5,
        height * 0.82,
        `Lifetime $NXT: ${progress.lifetimeNxt.toLocaleString()}   |   High Score: ${progress.highScore.toLocaleString()}m`,
        {
          fontFamily: "Arial, sans-serif",
          fontSize: "18px",
          color: "#ccffd8",
        }
      )
      .setOrigin(0.5)
      .setDepth(20);

    this.add
      .text(width * 0.5, height * 0.89, "Close app — Surge keeps riding the wave in the war room", {
        fontFamily: "Arial, sans-serif",
        fontSize: "16px",
        color: "#90ffa7",
      })
      .setOrigin(0.5)
      .setDepth(20);
  }

  createButton(x, y, w, h, label, onTap, muted = false) {
    const bg = this.add
      .rectangle(x, y, w, h, muted ? 0x101812 : 0x132a1a, 0.93)
      .setStrokeStyle(3, muted ? 0x84ff43 : 0xffd95e, 0.94)
      .setDepth(25)
      .setInteractive({ useHandCursor: true });
    const text = this.add
      .text(x, y, label, {
        fontFamily: "Arial Black, Arial, sans-serif",
        fontSize: "28px",
        color: muted ? "#daffd6" : "#fff0a5",
        stroke: "#000000",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(26);

    const hover = () => bg.setFillStyle(muted ? 0x1a2a1e : 0x1d3a24, 0.95);
    const out = () => bg.setFillStyle(muted ? 0x101812 : 0x132a1a, 0.93);
    bg.on("pointerover", hover);
    bg.on("pointerout", out);
    bg.on("pointerdown", () => {
      bg.setScale(0.985);
      this.time.delayedCall(80, () => bg.setScale(1));
      onTap();
    });
  }

  showLeaderboardPopup() {
    const { width, height } = this.scale;
    const shade = this.add.rectangle(width * 0.5, height * 0.5, width, height, 0x000000, 0.6).setDepth(100);
    const panel = this.add.rectangle(width * 0.5, height * 0.5, Math.min(430, width * 0.92), 360, 0x08130f, 0.95)
      .setStrokeStyle(3, 0x84ff43, 1)
      .setDepth(101);

    const title = this.add
      .text(width * 0.5, height * 0.35, "War-Room Top Riders", {
        fontFamily: "Arial Black, Arial, sans-serif",
        fontSize: "30px",
        color: "#8bff42",
        stroke: "#000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(102);

    const rows = LEADERBOARD.map((entry, idx) =>
      this.add
        .text(width * 0.5, height * 0.41 + idx * 40, `${idx + 1}. ${entry.name}  —  ${entry.score.toLocaleString()} m`, {
          fontFamily: "Arial, sans-serif",
          fontSize: "23px",
          color: idx === 0 ? "#fff3a6" : "#d8ffe3",
        })
        .setOrigin(0.5)
        .setDepth(102)
    );

    const close = this.add
      .rectangle(width * 0.5, height * 0.67, 180, 54, 0x15331f, 0.95)
      .setStrokeStyle(2, 0xffd95e, 0.92)
      .setDepth(102)
      .setInteractive({ useHandCursor: true });

    const closeText = this.add
      .text(width * 0.5, height * 0.67, "Close", {
        fontFamily: "Arial Black, Arial, sans-serif",
        fontSize: "24px",
        color: "#e9ffe9",
      })
      .setOrigin(0.5)
      .setDepth(103);

    close.once("pointerdown", () => {
      shade.destroy();
      panel.destroy();
      title.destroy();
      close.destroy();
      closeText.destroy();
      rows.forEach((row) => row.destroy());
    });
  }

  update(time, delta) {
    this.bg.update(time, delta, 180);
  }
}
