import { createProceduralTextures, createHeroAnimations } from "../utils/TextureFactory.js";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    const { width, height } = this.scale;
    const barBg = this.add.rectangle(width * 0.5, height * 0.55, width * 0.72, 22, 0x0f1a13, 0.85);
    const bar = this.add.rectangle(
      width * 0.14,
      height * 0.55,
      0,
      14,
      0x7cff33,
      1
    ).setOrigin(0, 0.5);
    const title = this.add
      .text(width * 0.5, height * 0.42, "NXT WAVE RIDER", {
        fontFamily: "Arial Black, Impact, sans-serif",
        fontSize: "36px",
        color: "#7cff33",
        stroke: "#000000",
        strokeThickness: 5,
      })
      .setOrigin(0.5);
    const subtitle = this.add
      .text(width * 0.5, height * 0.49, "Forging Surge sprite sheet...", {
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        color: "#ccffd6",
      })
      .setOrigin(0.5);

    this.load.on("progress", (value) => {
      bar.width = (width * 0.72 - 12) * value;
    });

    this.load.once("complete", () => {
      barBg.destroy();
      bar.destroy();
      title.destroy();
      subtitle.destroy();
    });
  }

  create() {
    createProceduralTextures(this);
    createHeroAnimations(this);
    this.scene.start("MenuScene");
  }
}
