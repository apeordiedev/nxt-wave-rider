export class WaveBackground {
  constructor(scene, opts = {}) {
    this.scene = scene;
    this.opts = {
      crestBaseY: scene.scale.height * 0.69,
      ...opts,
    };

    const { width, height } = scene.scale;

    this.sky = scene.add.rectangle(width * 0.5, height * 0.5, width, height, 0x020507, 1).setDepth(-50);
    this.skyGlow = scene.add.rectangle(width * 0.5, height * 0.5, width, height * 0.9, 0x0b1f13, 0.18).setDepth(-49);

    this.horizonGlow = scene.add.rectangle(width * 0.5, height * 0.34, width, height * 0.22, 0x16341f, 0.2).setDepth(-48);

    this.far = scene.add.tileSprite(width * 0.5, height * 0.53, width + 4, height * 0.75, "wave-far").setDepth(-30);
    this.mid = scene.add.tileSprite(width * 0.5, height * 0.64, width + 4, height * 0.72, "wave-mid").setDepth(-20);
    this.crest = scene.add.tileSprite(width * 0.5, this.opts.crestBaseY, width + 4, height * 0.5, "wave-crest").setDepth(-10);
    this.crestGlow = scene.add.rectangle(width * 0.5, this.opts.crestBaseY - 24, width, 56, 0x7cff33, 0.09).setDepth(-9);

    this.horizonNodes = [];
    for (let i = 0; i < 18; i += 1) {
      const x = (i / 17) * width;
      const y = height * 0.27 + Math.sin(i * 1.9) * 8;
      const node = scene.add.circle(x, y, 2 + (i % 2), 0x78ff88, 0.25).setDepth(-45);
      this.horizonNodes.push(node);
      scene.tweens.add({
        targets: node,
        alpha: { from: 0.1, to: 0.45 },
        duration: 1400 + i * 90,
        yoyo: true,
        repeat: -1,
      });
    }

    this.cyberRain = [];
    for (let i = 0; i < 70; i += 1) {
      const line = scene.add.rectangle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(height * 0.12, height * 0.82),
        Phaser.Math.Between(1, 2),
        Phaser.Math.Between(8, 24),
        Phaser.Math.Between(0, 5) === 0 ? 0xffd95e : 0x89ff64,
        Phaser.Math.FloatBetween(0.08, 0.24)
      ).setDepth(-41);
      line.setData("speed", Phaser.Math.FloatBetween(16, 52));
      this.cyberRain.push(line);
    }

    this.foamParticles = scene.add.particles(0, 0, "particle-foam", {
      speedX: { min: -100, max: -20 },
      speedY: { min: -120, max: -20 },
      lifespan: { min: 250, max: 550 },
      quantity: 0,
      frequency: 40,
      scale: { start: 0.32, end: 0 },
      alpha: { start: 0.9, end: 0 },
      blendMode: "ADD",
      tint: [0xffffff, 0xeffff9, 0xb8ffce],
      emitting: true,
      gravityY: 220,
      depth: 5,
    });

    this.mistParticles = scene.add.particles(0, 0, "particle-foam", {
      speedX: { min: -40, max: 40 },
      speedY: { min: -25, max: 15 },
      lifespan: { min: 900, max: 1800 },
      quantity: 0,
      frequency: 110,
      scale: { start: 0.42, end: 0.05 },
      alpha: { start: 0.12, end: 0 },
      blendMode: "SCREEN",
      tint: [0x97ffb2, 0xd6ffe8],
      depth: -6,
    });

    this.goldSprayParticles = scene.add.particles(0, 0, "particle-goldspark", {
      speedX: { min: -120, max: 20 },
      speedY: { min: -90, max: 20 },
      lifespan: { min: 240, max: 620 },
      quantity: 0,
      frequency: 70,
      scale: { start: 0.35, end: 0 },
      alpha: { start: 0.8, end: 0 },
      blendMode: "ADD",
      tint: [0xffe27c, 0xfff4bc, 0xffc84d],
      depth: 4,
    });
  }

  resize(width, height) {
    this.sky.setPosition(width * 0.5, height * 0.5);
    this.sky.setSize(width, height);
    this.skyGlow.setPosition(width * 0.5, height * 0.5);
    this.skyGlow.setSize(width, height * 0.9);
    this.horizonGlow.setPosition(width * 0.5, height * 0.34);
    this.horizonGlow.setSize(width, height * 0.22);
    this.far.setPosition(width * 0.5, height * 0.53).setSize(width + 4, height * 0.75);
    this.mid.setPosition(width * 0.5, height * 0.64).setSize(width + 4, height * 0.72);
    this.crest.setPosition(width * 0.5, this.opts.crestBaseY).setSize(width + 4, height * 0.5);
    this.crestGlow.setPosition(width * 0.5, this.opts.crestBaseY - 24).setSize(width, 56);
  }

  getCrestY(time) {
    return (
      this.opts.crestBaseY +
      Math.sin(time * 0.0036) * 14 +
      Math.sin(time * 0.00135 + 1.1) * 9
    );
  }

  update(time, delta, speed = 300) {
    const dt = delta / 1000;
    const width = this.scene.scale.width;
    const crestY = this.getCrestY(time);

    this.far.tilePositionX += speed * dt * 0.16;
    this.mid.tilePositionX += speed * dt * 0.34;
    this.crest.tilePositionX += speed * dt * 0.74;

    this.far.y = this.scene.scale.height * 0.53 + Math.sin(time * 0.0008) * 5;
    this.mid.y = this.scene.scale.height * 0.64 + Math.sin(time * 0.0012 + 2.4) * 7;
    this.crest.y = crestY;
    this.crestGlow.y = crestY - 24;
    this.crestGlow.alpha = 0.07 + Math.sin(time * 0.003) * 0.02;

    for (let i = 0; i < this.cyberRain.length; i += 1) {
      const line = this.cyberRain[i];
      line.y += line.getData("speed") * dt;
      line.alpha = 0.08 + Math.abs(Math.sin(time * 0.002 + i * 0.31)) * 0.24;
      if (line.y > this.scene.scale.height * 0.88) {
        line.y = this.scene.scale.height * 0.12 - Phaser.Math.Between(0, 80);
        line.x = Phaser.Math.Between(0, width);
      }
    }

    // Spawn foam and mist along moving crest edge.
    for (let i = 0; i < 3; i += 1) {
      const x = width + (i * 33);
      const y = crestY - 40 + Math.sin((time + i * 90) * 0.008) * 10;
      this.foamParticles.emitParticleAt(x, y, 1);
      this.goldSprayParticles.emitParticleAt(x - 5, y - 8, 1);
    }

    if ((time / 200) % 2 < 1) {
      this.mistParticles.emitParticleAt(
        Phaser.Math.Between(0, width),
        crestY - Phaser.Math.Between(30, 90),
        1
      );
    }
  }
}
