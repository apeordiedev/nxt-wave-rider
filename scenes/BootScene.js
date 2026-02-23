import { createTelegramBridge } from "../utils/TelegramBridge.js";
import { loadProgress, saveProgress, updateDailyStreak } from "../utils/Storage.js";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create() {
    const telegram = createTelegramBridge();
    this.registry.set("telegram", telegram);

    const progress = updateDailyStreak(loadProgress(), new Date());
    saveProgress(progress);
    this.registry.set("progress", progress);

    this.scene.start("PreloadScene");
  }
}
