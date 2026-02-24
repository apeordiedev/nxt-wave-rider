import { BootScene } from "./scenes/BootScene.js";
import { PreloadScene } from "./scenes/PreloadScene.js";
import { MenuScene } from "./scenes/MenuScene.js";
import { GameScene } from "./scenes/GameScene.js";
import { GameOverScene } from "./scenes/GameOverScene.js";

const gameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  backgroundColor: "#020507",
  scene: [BootScene, PreloadScene, MenuScene, GameScene, GameOverScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
      fps: 60,
      fixedStep: true,
    },
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 420,
    height: 900,
  },
  render: {
    antialias: true,
    roundPixels: false,
    powerPreference: "high-performance",
  },
};

const game = new Phaser.Game(gameConfig);

// Optional browser fullscreen fallback (Telegram clients already expand).
window.addEventListener(
  "pointerdown",
  () => {
    const doc = document;
    const target = doc.documentElement;
    const isFullscreen = doc.fullscreenElement || doc.webkitFullscreenElement;
    if (!isFullscreen && target.requestFullscreen) {
      target.requestFullscreen().catch(() => {});
    }
  },
  { once: true, passive: true }
);

window.__NXT_WAVE_RIDER__ = game;
