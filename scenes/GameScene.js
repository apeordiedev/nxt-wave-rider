import { WaveBackground } from "../utils/WaveBackground.js";
import { createSfx } from "../utils/Audio.js";
import { applyRunResults, saveProgress } from "../utils/Storage.js";

const OBSTACLE_DEFS = {
  "obstacle-wave-lip": { w: 62, h: 108, family: "top" },
  "obstacle-fud-cloud": { w: 90, h: 58, family: "top" },
  "obstacle-bear-fin": { w: 58, h: 72, family: "bottom" },
  "obstacle-red-candle": { w: 40, h: 118, family: "bottom" },
  "obstacle-rug-void": { w: 74, h: 74, family: "center" },
};

const POWERUPS = [
  { key: "powerup-x2", value: 2, weight: 0.55 },
  { key: "powerup-x5", value: 5, weight: 0.32 },
  { key: "powerup-x10", value: 10, weight: 0.13 },
];

export class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    this.telegram = this.registry.get("telegram");
    this.progress = this.registry.get("progress");
    this.sfx = createSfx(this);

    const { width, height } = this.scale;

    this.wave = new WaveBackground(this, { crestBaseY: height * 0.73 });
    this.physics.world.setBounds(-200, -200, width + 420, height + 420);
    this.physics.world.gravity.y = 1020;

    this.speed = 285;
    this.distance = 0;
    this.runNxt = 0;
    this.multiplier = 1;
    this.multiplierExpiresAt = 0;
    this.maxMultiplier = 1;
    this.difficulty = 0;
    this.nextSpeedUpAt = this.time.now + 10000;
    this.nextObstacleAt = this.time.now + 600;
    this.nextCoinAt = this.time.now + 900;
    this.nextPowerupAt = this.time.now + 8500;
    this.lastNearMissAt = -9999;
    this.gameEnded = false;

    this.player = this.physics.add.sprite(width * 0.26, height * 0.5, "surge-sheet", 0);
    this.player
      .setDepth(50)
      .setScale(0.93)
      .setCollideWorldBounds(false)
      .setDamping(false)
      .setDrag(0);
    this.player.play("surge-surf");
    this.player.body.setSize(80, 128, false);
    this.player.body.setOffset(56, 30);

    this.playerPulse = this.add.circle(this.player.x, this.player.y, 48, 0x82ff64, 0.09).setDepth(45);
    this.playerPulseBlendTween = this.tweens.add({
      targets: this.playerPulse,
      alpha: { from: 0.06, to: 0.22 },
      scale: { from: 0.85, to: 1.13 },
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    this.capeTrail = this.add.particles(0, 0, "particle-spark", {
      follow: this.player,
      followOffset: { x: -48, y: -8 },
      speedX: { min: -35, max: -4 },
      speedY: { min: -5, max: 35 },
      lifespan: { min: 220, max: 540 },
      quantity: 0,
      frequency: 32,
      scale: { start: 0.24, end: 0 },
      alpha: { start: 0.6, end: 0 },
      tint: [0x73ff6a, 0x4cff6b, 0xb2ff84],
      blendMode: "ADD",
      depth: 41,
    });

    this.energyParticles = this.add.particles(0, 0, "particle-spark", {
      speed: { min: 70, max: 250 },
      lifespan: { min: 180, max: 450 },
      quantity: 0,
      gravityY: 260,
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.9, end: 0 },
      blendMode: "ADD",
      depth: 100,
      tint: [0x7cff33, 0xa4ff89, 0xd6ffcb],
    });

    this.goldSparkParticles = this.add.particles(0, 0, "particle-goldspark", {
      speed: { min: 40, max: 210 },
      lifespan: { min: 180, max: 460 },
      quantity: 0,
      gravityY: 180,
      scale: { start: 0.58, end: 0 },
      alpha: { start: 0.95, end: 0 },
      blendMode: "ADD",
      depth: 102,
      tint: [0xffdb6d, 0xfff7b7, 0xffc84a],
    });

    this.foamParticles = this.add.particles(0, 0, "particle-foam", {
      speedX: { min: -260, max: -80 },
      speedY: { min: -280, max: -40 },
      lifespan: { min: 240, max: 580 },
      quantity: 0,
      gravityY: 420,
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0.88, end: 0 },
      blendMode: "ADD",
      depth: 40,
      tint: [0xffffff, 0xd5ffe9],
    });

    this.lightningParticles = this.add.particles(0, 0, "particle-lightning", {
      speedY: { min: 320, max: 560 },
      speedX: { min: -120, max: 120 },
      lifespan: { min: 210, max: 420 },
      quantity: 0,
      scale: { start: 0.7, end: 0.05 },
      alpha: { start: 0.95, end: 0 },
      blendMode: "ADD",
      gravityY: 280,
      depth: 110,
      tint: [0x7cff33, 0xb8ff80, 0xddffd8],
    });

    this.shardParticles = this.add.particles(0, 0, "particle-shard", {
      speed: { min: 90, max: 300 },
      lifespan: { min: 320, max: 720 },
      quantity: 0,
      gravityY: 820,
      rotate: { min: -240, max: 240 },
      scale: { start: 1, end: 0.25 },
      alpha: { start: 1, end: 0 },
      depth: 120,
    });

    this.obstacles = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      maxSize: 50,
      runChildUpdate: false,
    });
    this.coins = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      maxSize: 70,
      runChildUpdate: false,
    });
    this.powerups = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      maxSize: 16,
      runChildUpdate: false,
    });

    this.physics.add.overlap(this.player, this.obstacles, this.handleObstacleHit, null, this);
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
    this.physics.add.overlap(this.player, this.powerups, this.collectPowerup, null, this);

    this.flashOverlay = this.add
      .rectangle(width * 0.5, height * 0.5, width, height, 0xccffd8, 0)
      .setScrollFactor(0)
      .setDepth(500);

    this.createHud();

    this.energySurgeBound = () => this.energySurge();
    this.input.on("pointerdown", this.energySurgeBound);
    this.input.keyboard.on("keydown-SPACE", this.energySurgeBound);
    this.input.keyboard.on("keydown-UP", this.energySurgeBound);

    this.input.once("pointerdown", () => {
      if (this.sound.context && this.sound.context.state === "suspended") {
        this.sound.context.resume().catch(() => {});
      }
    });

    this.backHandler = () => {
      if (!this.gameEnded) {
        this.scene.start("MenuScene");
      }
    };

    if (this.telegram) {
      this.telegram.setBackButton(true, this.backHandler);
    }

    this.events.once("shutdown", () => {
      if (this.telegram) this.telegram.setBackButton(false, this.backHandler);
      this.input.off("pointerdown", this.energySurgeBound);
      this.input.keyboard.off("keydown-SPACE", this.energySurgeBound);
      this.input.keyboard.off("keydown-UP", this.energySurgeBound);
    });

    this.scale.on("resize", this.handleResize, this);
  }

  createHud() {
    const { width } = this.scale;
    const topY = 24;

    this.distText = this.add
      .text(16, topY, "DISTANCE: 00000 m", {
        fontFamily: "Arial Black, Arial, sans-serif",
        fontSize: "26px",
        color: "#a9ff75",
        stroke: "#000000",
        strokeThickness: 5,
      })
      .setDepth(300)
      .setScrollFactor(0)
      .setOrigin(0, 0);

    this.runText = this.add
      .text(width * 0.5, topY, "$NXT x 0000", {
        fontFamily: "Arial Black, Arial, sans-serif",
        fontSize: "28px",
        color: "#ffe17d",
        stroke: "#000000",
        strokeThickness: 5,
      })
      .setDepth(300)
      .setScrollFactor(0)
      .setOrigin(0.5, 0);

    this.multiplierBadge = this.add
      .text(width * 0.5, topY + 32, "x1", {
        fontFamily: "Arial Black, Arial, sans-serif",
        fontSize: "20px",
        color: "#90ff4b",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setDepth(300)
      .setScrollFactor(0)
      .setOrigin(0.5, 0);

    this.lifetimeText = this.add
      .text(width - 12, topY, `Lifetime $NXT: ${this.progress.lifetimeNxt.toLocaleString()}`, {
        fontFamily: "Arial Black, Arial, sans-serif",
        fontSize: "23px",
        color: "#9dff71",
        stroke: "#000000",
        strokeThickness: 4,
        align: "right",
      })
      .setDepth(300)
      .setScrollFactor(0)
      .setOrigin(1, 0);

    this.airdropHintText = this.add
      .text(width - 12, topY + 28, "→ Future Airdrop Qualifier", {
        fontFamily: "Arial, sans-serif",
        fontSize: "15px",
        color: "#e4fbd3",
      })
      .setDepth(300)
      .setScrollFactor(0)
      .setOrigin(1, 0);

    this.multiplierBanner = this.add
      .container(width * 0.5, 98)
      .setScrollFactor(0)
      .setDepth(320)
      .setVisible(false);
    const bannerBg = this.add.rectangle(0, 0, Math.min(420, width * 0.88), 54, 0x0b170f, 0.93).setStrokeStyle(2, 0xffd95e, 0.9);
    const bannerIcon = this.add.image(-150, 0, "ui-bolt").setScale(0.85);
    this.bannerText = this.add
      .text(4, 0, "x2 LIGHTNING SURGE!", {
        fontFamily: "Arial Black, Arial, sans-serif",
        fontSize: "28px",
        color: "#ffe88a",
        stroke: "#000000",
        strokeThickness: 5,
      })
      .setOrigin(0.5);
    this.multiplierBanner.add([bannerBg, bannerIcon, this.bannerText]);

    this.multiplierBarBg = this.add
      .rectangle(width * 0.5, 132, Math.min(420, width * 0.88), 10, 0x1a2013, 0.9)
      .setScrollFactor(0)
      .setDepth(320)
      .setVisible(false);
    this.multiplierBar = this.add
      .rectangle(
        this.multiplierBarBg.x - this.multiplierBarBg.width * 0.5,
        132,
        this.multiplierBarBg.width,
        8,
        0x9fff63,
        1
      )
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(321)
      .setVisible(false);
  }

  handleResize(size) {
    const { width, height } = size;
    this.wave.opts.crestBaseY = height * 0.73;
    this.wave.resize(width, height);
    this.flashOverlay.setPosition(width * 0.5, height * 0.5).setSize(width, height);
  }

  energySurge() {
    if (this.gameEnded) return;
    const power = 560 + Math.min(190, this.speed * 0.13);
    this.player.setVelocityY(Math.min(this.player.body.velocity.y, 80) - power);
    this.player.play("surge-energy", true);
    this.player.angle = -10;

    this.energyParticles.emitParticleAt(this.player.x - 26, this.player.y + 26, 8);
    this.energyParticles.emitParticleAt(this.player.x + 26, this.player.y + 26, 8);
    this.lightningParticles.emitParticleAt(this.player.x, this.player.y - 20, 4);
    this.goldSparkParticles.emitParticleAt(this.player.x + 8, this.player.y + 10, 5);
    this.flash(0xb8ff98, 0.17, 80);
    this.sfx.waveWhoosh();
    if (this.telegram) this.telegram.hapticImpact("light");
  }

  spawnObstacle(time) {
    const width = this.scale.width;
    const crestY = this.wave.getCrestY(time);
    const gapSize = Phaser.Math.Clamp(238 - this.difficulty * 8, 126, 238);
    const gapCenter = crestY - Phaser.Math.Between(108, 160) + Phaser.Math.Between(-38, 38);
    const spawnX = width + 96;

    const topChoices = ["obstacle-wave-lip", "obstacle-fud-cloud"];
    const bottomChoices = ["obstacle-bear-fin", "obstacle-red-candle"];
    const topKey = Phaser.Utils.Array.GetRandom(topChoices);
    const bottomKey = Phaser.Utils.Array.GetRandom(bottomChoices);

    this.placeObstacle(topKey, spawnX, gapCenter - gapSize * 0.5 - Phaser.Math.Between(38, 70));
    this.placeObstacle(bottomKey, spawnX, gapCenter + gapSize * 0.5 + Phaser.Math.Between(28, 72));

    if (Math.random() < 0.28 + this.difficulty * 0.03) {
      this.placeObstacle(
        "obstacle-rug-void",
        spawnX + Phaser.Math.Between(22, 52),
        gapCenter + Phaser.Math.Between(-45, 45)
      );
    }

    const min = Math.max(460, 930 - this.speed * 0.9 - this.difficulty * 42);
    const max = Math.max(min + 80, 1220 - this.speed * 1.1 - this.difficulty * 30);
    this.nextObstacleAt = time + Phaser.Math.Between(min, max);
  }

  placeObstacle(key, x, y) {
    const def = OBSTACLE_DEFS[key];
    const obstacle = this.obstacles.get(x, y, key);
    if (!obstacle) return;

    obstacle
      .setActive(true)
      .setVisible(true)
      .setDepth(58)
      .setTexture(key)
      .setVelocityX(-this.speed * Phaser.Math.FloatBetween(0.98, 1.08));
    obstacle.body.allowGravity = false;
    obstacle.body.enable = true;
    obstacle.body.setSize(def.w, def.h);
    obstacle.setData("nearMiss", false);
    obstacle.setData("type", key);
  }

  spawnCoins(time) {
    const width = this.scale.width;
    const crestY = this.wave.getCrestY(time);
    const count = Phaser.Math.Between(3, 6);
    const startX = width + 100;
    const laneY = crestY - Phaser.Math.Between(95, 220);

    for (let i = 0; i < count; i += 1) {
      const coin = this.coins.get(startX + i * 72, laneY + Math.sin(i * 0.8) * 20, "coin-nxt");
      if (!coin) continue;
      coin
        .setActive(true)
        .setVisible(true)
        .setDepth(56)
        .setVelocityX(-this.speed * 1.03)
        .setAngularVelocity(180);
      coin.body.allowGravity = false;
      coin.body.enable = true;
      coin.body.setCircle(15, 12, 12);
    }

    const min = Math.max(980, 1700 - this.difficulty * 60);
    const max = Math.max(min + 120, 2400 - this.difficulty * 80);
    this.nextCoinAt = time + Phaser.Math.Between(min, max);
  }

  spawnPowerup(time) {
    const roll = Math.random();
    let accum = 0;
    let selected = POWERUPS[0];
    for (const entry of POWERUPS) {
      accum += entry.weight;
      if (roll <= accum) {
        selected = entry;
        break;
      }
    }

    const width = this.scale.width;
    const crestY = this.wave.getCrestY(time);
    const power = this.powerups.get(
      width + Phaser.Math.Between(100, 140),
      crestY - Phaser.Math.Between(120, 250),
      selected.key
    );
    if (!power) return;

    power
      .setTexture(selected.key)
      .setActive(true)
      .setVisible(true)
      .setDepth(57)
      .setVelocityX(-this.speed * 1.02);
    power.body.allowGravity = false;
    power.body.enable = true;
    power.body.setCircle(23, 13, 13);
    power.setData("value", selected.value);

    this.nextPowerupAt = time + Phaser.Math.Between(9000, 14500);
  }

  updatePools(time, delta) {
    const dt = delta / 1000;
    const offscreenX = -140;

    this.obstacles.children.each((obj) => {
      if (!obj.active) return;
      obj.setVelocityX(-this.speed * (obj.texture.key === "obstacle-rug-void" ? 1.12 : 1.03));
      if (obj.texture.key === "obstacle-rug-void") {
        obj.angle += 90 * dt;
      }

      if (!obj.getData("nearMiss") && obj.x < this.player.x - 24) {
        obj.setData("nearMiss", true);
        const yDelta = Math.abs(obj.y - this.player.y);
        if (yDelta < 90 + (obj.body.height || 42) * 0.4) {
          this.triggerNearMiss(time);
        }
      }

      if (obj.x < offscreenX) {
        obj.disableBody(true, true);
      }
    });

    this.coins.children.each((coin) => {
      if (!coin.active) return;
      coin.setVelocityX(-this.speed * 1.03);
      coin.angle += 240 * dt;
      if (coin.x < offscreenX) {
        coin.disableBody(true, true);
      }
    });

    this.powerups.children.each((power) => {
      if (!power.active) return;
      power.setVelocityX(-this.speed * 1.02);
      power.angle += 120 * dt;
      power.setScale(1 + Math.sin(time * 0.007 + power.x * 0.03) * 0.08);
      if (power.x < offscreenX) {
        power.disableBody(true, true);
      }
    });
  }

  collectCoin(player, coin) {
    coin.disableBody(true, true);
    const gain = this.multiplier;
    this.runNxt += gain;

    this.sfx.coinDing();
    if (this.telegram) this.telegram.hapticImpact("light");

    this.energyParticles.emitParticleAt(player.x + Phaser.Math.Between(-8, 8), player.y - 8, 6);
    this.goldSparkParticles.emitParticleAt(player.x + Phaser.Math.Between(-6, 6), player.y - 6, 4);

    const popup = this.add
      .text(coin.x, coin.y - 10, `+${gain}`, {
        fontFamily: "Arial Black, Arial, sans-serif",
        fontSize: "24px",
        color: "#ffe887",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(200);
    this.tweens.add({
      targets: popup,
      y: popup.y - 38,
      alpha: 0,
      duration: 450,
      ease: "Sine.out",
      onComplete: () => popup.destroy(),
    });
  }

  collectPowerup(player, power) {
    const value = Math.max(2, Number(power.getData("value")) || 2);
    power.disableBody(true, true);

    this.multiplier = Phaser.Math.Clamp(this.multiplier * value, 1, 200);
    this.maxMultiplier = Math.max(this.maxMultiplier, this.multiplier);
    this.multiplierExpiresAt = Math.max(this.multiplierExpiresAt, this.time.now) + 12000;

    this.bannerText.setText(`x${this.multiplier} LIGHTNING SURGE!`);
    this.multiplierBanner.setVisible(true);
    this.multiplierBarBg.setVisible(true);
    this.multiplierBar.setVisible(true);

    this.triggerLightningStrike();
    this.sfx.lightningCrack();
    this.goldSparkParticles.emitParticleAt(player.x, player.y - 24, 16);
    if (this.telegram) this.telegram.hapticImpact("medium");
  }

  triggerLightningStrike() {
    const x = this.player.x;
    const y = this.player.y;

    for (let i = 0; i < 3; i += 1) {
      this.time.delayedCall(i * 70, () => {
        const startX = x + Phaser.Math.Between(-42, 42);
        const startY = -20;
        const endX = x + Phaser.Math.Between(-16, 16);
        const endY = y + Phaser.Math.Between(-36, 28);
        const bolt = this.add.image(startX, startY, "particle-lightning").setDepth(150).setBlendMode("ADD");
        const angle = Phaser.Math.Angle.Between(startX, startY, endX, endY) + Math.PI / 2;
        const dist = Phaser.Math.Distance.Between(startX, startY, endX, endY);
        bolt.setRotation(angle);
        bolt.setScale(1.2, Math.max(0.8, dist / 64));

        this.tweens.add({
          targets: bolt,
          alpha: 0,
          duration: 120,
          onComplete: () => bolt.destroy(),
        });

        this.lightningParticles.emitParticleAt(endX, endY, 6);
        this.energyParticles.emitParticleAt(endX, endY, 10);
        this.goldSparkParticles.emitParticleAt(endX, endY - 6, 6);
      });
    }

    this.flash(0xd8ffb2, 0.32, 140);
  }

  triggerNearMiss(now) {
    if (now - this.lastNearMissAt < 1400) return;
    this.lastNearMissAt = now;

    this.physics.world.timeScale = 0.52;
    this.time.delayedCall(180, () => {
      this.physics.world.timeScale = 1;
    });

    this.energyParticles.emitParticleAt(this.player.x + 18, this.player.y + 20, 10);
    this.goldSparkParticles.emitParticleAt(this.player.x + 16, this.player.y + 10, 6);
    this.cameras.main.shake(80, 0.0028);
  }

  handleObstacleHit() {
    this.loseRun("obstacle");
  }

  loseRun(reason) {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.player.play("surge-death", true);
    this.player.setVelocity(0, -120);

    this.shardParticles.emitParticleAt(this.player.x, this.player.y, 24);
    this.lightningParticles.emitParticleAt(this.player.x, this.player.y, 11);
    this.foamParticles.emitParticleAt(this.player.x + 26, this.player.y + 40, 18);
    this.goldSparkParticles.emitParticleAt(this.player.x + 6, this.player.y + 8, 12);

    this.flash(0xd9ffc4, 0.36, 210);
    this.cameras.main.shake(280, 0.006);
    this.sfx.crash();
    if (this.telegram) this.telegram.hapticNotification("error");

    this.physics.pause();
    this.input.enabled = false;

    const distanceMeters = Math.floor(this.distance);
    const finalScore = distanceMeters + this.runNxt;
    const wasHighScore = distanceMeters > this.progress.highScore;
    const updated = applyRunResults(this.progress, {
      runNxt: this.runNxt,
      distance: distanceMeters,
    });
    saveProgress(updated);
    this.registry.set("progress", updated);

    this.time.delayedCall(900, () => {
      this.scene.start("GameOverScene", {
        reason,
        distance: distanceMeters,
        runNxt: this.runNxt,
        finalScore,
        highScore: updated.highScore,
        lifetimeNxt: updated.lifetimeNxt,
        isNewHighScore: wasHighScore,
        maxMultiplier: this.maxMultiplier,
      });
    });
  }

  flash(color, alpha, duration = 100) {
    this.flashOverlay.setFillStyle(color, alpha);
    this.flashOverlay.alpha = alpha;
    this.tweens.add({
      targets: this.flashOverlay,
      alpha: 0,
      duration,
      ease: "Sine.out",
    });
  }

  updateHud(now) {
    const distance = Math.floor(this.distance);
    this.distText.setText(`DISTANCE: ${String(distance).padStart(5, "0")} m`);
    this.runText.setText(`$NXT x ${String(this.runNxt).padStart(4, "0")}`);
    this.multiplierBadge.setText(`x${this.multiplier}`);

    const active = this.multiplier > 1 && now < this.multiplierExpiresAt;
    this.multiplierBanner.setVisible(active);
    this.multiplierBarBg.setVisible(active);
    this.multiplierBar.setVisible(active);

    if (active) {
      const total = 12000;
      const remaining = Math.max(0, this.multiplierExpiresAt - now);
      const ratio = Phaser.Math.Clamp(remaining / total, 0, 1);
      this.multiplierBar.width = this.multiplierBarBg.width * ratio;
      this.bannerText.setText(`x${this.multiplier} LIGHTNING SURGE!`);
    }
  }

  update(time, delta) {
    if (this.gameEnded) return;

    this.wave.update(time, delta, this.speed);

    const crestY = this.wave.getCrestY(time);
    const desiredY = crestY - 90;
    const pull = Phaser.Math.Clamp((desiredY - this.player.y) * 6.6, -320, 220);
    this.player.body.velocity.y += (pull * delta) / 1000;

    // Keep horizontal position stable while surfing an auto-scrolling world.
    this.player.x = this.scale.width * 0.26;
    this.playerPulse.setPosition(this.player.x, this.player.y);

    // Animation state machine.
    if (this.player.body.velocity.y < -120) {
      this.player.play("surge-energy", true);
      this.player.angle = -12;
    } else if (this.player.body.velocity.y > 110) {
      this.player.play("surge-glide", true);
      this.player.angle = Phaser.Math.Clamp(this.player.body.velocity.y * 0.03, -6, 18);
    } else {
      this.player.play("surge-surf", true);
      this.player.angle = Phaser.Math.Clamp(this.player.body.velocity.y * 0.018, -5, 8);
    }

    // Death boundaries.
    if (this.player.y < 8) {
      this.loseRun("top-edge");
      return;
    }
    if (this.player.y > crestY + 220) {
      this.loseRun("fell-off-wave");
      return;
    }

    this.distance += (this.speed * delta) / 1000 * 0.115;
    this.difficulty += delta / 1000 * 0.1;

    if (time >= this.nextSpeedUpAt) {
      this.speed += 22;
      this.nextSpeedUpAt += 10000;
    }

    if (time >= this.nextObstacleAt) this.spawnObstacle(time);
    if (time >= this.nextCoinAt) this.spawnCoins(time);
    if (time >= this.nextPowerupAt) this.spawnPowerup(time);

    this.updatePools(time, delta);

    if (this.multiplier > 1 && time >= this.multiplierExpiresAt) {
      this.multiplier = 1;
      this.multiplierExpiresAt = 0;
      this.multiplierBanner.setVisible(false);
      this.multiplierBarBg.setVisible(false);
      this.multiplierBar.setVisible(false);
    }

    // Surf foam around board/wave interaction.
    if ((time / 75) % 2 < 1) {
      this.foamParticles.emitParticleAt(this.player.x + 46, this.player.y + 52, 1);
      if ((time / 140) % 2 < 1) {
        this.goldSparkParticles.emitParticleAt(this.player.x + 34, this.player.y + 38, 1);
      }
    }

    this.updateHud(time);
  }
}
