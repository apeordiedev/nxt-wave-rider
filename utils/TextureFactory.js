const COLORS = {
  bgDark: 0x020608,
  cyberDark: 0x08150f,
  neon: 0x7cff33,
  neonSoft: 0x65ff70,
  foam: 0xe9fff8,
  white: 0xffffff,
  black: 0x050608,
  armor: 0x0e1014,
  red: 0xff3b44,
  void: 0x35123f,
};

function makeTexture(scene, key, width, height, drawFn) {
  if (scene.textures.exists(key)) return;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  drawFn(g, width, height);
  g.generateTexture(key, width, height);
  g.destroy();
}

function drawPolygon(g, points, close = true) {
  g.beginPath();
  g.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) {
    g.lineTo(points[i].x, points[i].y);
  }
  if (close) g.closePath();
}

function drawHero(g, w, h, cfg) {
  const cx = w * 0.5;
  const boardY = h - 34;
  const capeLift = cfg.capeLift || 0;
  const aura = cfg.aura || 0;
  const fistGlow = cfg.fistGlow || 0.4;

  if (aura > 0) {
    g.fillStyle(COLORS.neon, 0.12 + aura * 0.22);
    g.fillCircle(cx, h * 0.48, 55 + aura * 22);
    g.fillStyle(COLORS.neonSoft, 0.08 + aura * 0.2);
    g.fillCircle(cx, h * 0.48, 73 + aura * 26);
  }

  // Surfboard with neon edge glow.
  g.fillStyle(COLORS.neon, 0.45);
  g.fillEllipse(cx, boardY + 2, 108, 22);
  g.fillStyle(0x113522, 1);
  g.fillEllipse(cx, boardY, 100, 16);
  g.lineStyle(3, COLORS.neon, 1);
  g.strokeEllipse(cx, boardY, 100, 16);

  // Cape geometry shifts based on pose.
  g.fillStyle(0x090a0f, 0.95);
  drawPolygon(g, [
    { x: cx - 19, y: 72 },
    { x: cx - 58, y: 92 - capeLift * 0.35 },
    { x: cx - 78, y: 126 - capeLift * 0.15 },
    { x: cx - 36, y: 133 - capeLift * 0.5 },
    { x: cx - 6, y: 101 - capeLift * 0.4 },
  ]);
  g.fillPath();
  g.lineStyle(2, 0x131622, 0.9);
  g.strokePath();

  // Legs and torso armor.
  g.fillStyle(COLORS.armor, 1);
  g.fillRoundedRect(cx - 18, 94, 16, 33, 5);
  g.fillRoundedRect(cx + 2, 95, 16, 32, 5);
  g.fillRoundedRect(cx - 24, 56, 48, 42, 8);
  g.lineStyle(2, 0x212733, 0.95);
  g.strokeRoundedRect(cx - 24, 56, 48, 42, 8);

  // Head.
  g.fillStyle(0x0d0f14, 1);
  g.fillCircle(cx, 45, 16);
  g.lineStyle(2, 0x1f2531, 1);
  g.strokeCircle(cx, 45, 16);

  // Glowing eyes.
  g.fillStyle(COLORS.neonSoft, 1);
  g.fillCircle(cx - 6, 44, 2.8);
  g.fillCircle(cx + 6, 44, 2.8);

  // Arms and fists.
  const armTilt = cfg.armTilt || 0;
  g.fillStyle(COLORS.armor, 1);
  g.fillRoundedRect(cx - 40 + armTilt * 0.25, 66 - armTilt * 0.15, 16, 34, 6);
  g.fillRoundedRect(cx + 24 + armTilt * 0.2, 66 - armTilt * 0.2, 16, 34, 6);
  g.fillStyle(COLORS.neon, 0.45 + fistGlow * 0.4);
  g.fillCircle(cx - 32 + armTilt * 0.25, 99 - armTilt * 0.15, 11 + fistGlow * 4);
  g.fillCircle(cx + 32 + armTilt * 0.2, 99 - armTilt * 0.2, 11 + fistGlow * 4);
  g.fillStyle(COLORS.neonSoft, 0.95);
  g.fillCircle(cx - 32 + armTilt * 0.25, 99 - armTilt * 0.15, 6.5);
  g.fillCircle(cx + 32 + armTilt * 0.2, 99 - armTilt * 0.2, 6.5);

  // Chest emblem (glowing N).
  const pulse = cfg.pulse || 0.5;
  g.lineStyle(3 + pulse * 1.5, COLORS.neon, 0.95);
  g.beginPath();
  g.moveTo(cx - 9, 66);
  g.lineTo(cx - 9, 88);
  g.lineTo(cx + 9, 66);
  g.lineTo(cx + 9, 88);
  g.strokePath();
  g.fillStyle(COLORS.neon, 0.08 + pulse * 0.12);
  g.fillRoundedRect(cx - 15, 61, 30, 32, 7);

  if (cfg.cracked) {
    g.lineStyle(2, COLORS.red, 0.9);
    g.beginPath();
    g.moveTo(cx - 18, 58);
    g.lineTo(cx - 3, 76);
    g.lineTo(cx - 16, 100);
    g.moveTo(cx + 20, 60);
    g.lineTo(cx + 5, 78);
    g.lineTo(cx + 18, 103);
    g.strokePath();
  }
}

function drawWaveShape(g, width, baseY, amplitude, frequency, step, color, alpha) {
  g.fillStyle(color, alpha);
  g.beginPath();
  g.moveTo(0, baseY);
  for (let x = 0; x <= width; x += step) {
    const y = baseY + Math.sin(x * frequency) * amplitude + Math.sin(x * 0.02) * 5;
    g.lineTo(x, y);
  }
  g.lineTo(width, 300);
  g.lineTo(0, 300);
  g.closePath();
  g.fillPath();
}

function drawPowerOrb(g, w, h, tier) {
  const cx = w / 2;
  const cy = h / 2;
  const glowScale = tier / 2;

  g.fillStyle(COLORS.neonSoft, 0.13 + glowScale * 0.12);
  g.fillCircle(cx, cy, 36 + tier * 3);
  g.fillStyle(0x11351d, 1);
  g.fillCircle(cx, cy, 26);
  g.lineStyle(3, COLORS.neon, 1);
  g.strokeCircle(cx, cy, 26);

  g.fillStyle(COLORS.neon, 0.95);
  drawPolygon(g, [
    { x: cx - 5, y: cy - 18 },
    { x: cx + 7, y: cy - 18 },
    { x: cx - 1, y: cy - 2 },
    { x: cx + 9, y: cy - 2 },
    { x: cx - 9, y: cy + 18 },
    { x: cx - 3, y: cy + 4 },
    { x: cx - 13, y: cy + 4 },
  ]);
  g.fillPath();

  // Minimal numeric glyphs to avoid external fonts.
  g.lineStyle(3, COLORS.white, 1);
  if (tier === 2) {
    g.beginPath();
    g.moveTo(cx - 17, cy + 20);
    g.lineTo(cx - 8, cy + 20);
    g.lineTo(cx - 16, cy + 28);
    g.lineTo(cx - 8, cy + 28);
    g.strokePath();
  } else if (tier === 5) {
    g.beginPath();
    g.moveTo(cx - 18, cy + 20);
    g.lineTo(cx - 10, cy + 20);
    g.lineTo(cx - 18, cy + 20);
    g.lineTo(cx - 18, cy + 24);
    g.lineTo(cx - 11, cy + 24);
    g.lineTo(cx - 11, cy + 28);
    g.lineTo(cx - 18, cy + 28);
    g.strokePath();
  } else {
    g.beginPath();
    g.moveTo(cx - 20, cy + 20);
    g.lineTo(cx - 20, cy + 28);
    g.moveTo(cx - 15, cy + 20);
    g.lineTo(cx - 15, cy + 28);
    g.moveTo(cx - 10, cy + 20);
    g.lineTo(cx - 10, cy + 28);
    g.strokePath();
  }
}

export function createProceduralTextures(scene) {
  // Surge animation frames
  makeTexture(scene, "surge-surf-1", 160, 160, (g, w, h) =>
    drawHero(g, w, h, { capeLift: 0, pulse: 0.4, fistGlow: 0.45, armTilt: 0 })
  );
  makeTexture(scene, "surge-surf-2", 160, 160, (g, w, h) =>
    drawHero(g, w, h, { capeLift: 16, pulse: 0.7, fistGlow: 0.5, armTilt: 6 })
  );
  makeTexture(scene, "surge-glide-1", 160, 160, (g, w, h) =>
    drawHero(g, w, h, { capeLift: 6, pulse: 0.35, fistGlow: 0.35, armTilt: -8 })
  );
  makeTexture(scene, "surge-glide-2", 160, 160, (g, w, h) =>
    drawHero(g, w, h, { capeLift: 12, pulse: 0.5, fistGlow: 0.4, armTilt: -4 })
  );
  makeTexture(scene, "surge-energy-1", 160, 160, (g, w, h) =>
    drawHero(g, w, h, { capeLift: 44, pulse: 0.95, fistGlow: 0.95, armTilt: 13, aura: 1 })
  );
  makeTexture(scene, "surge-energy-2", 160, 160, (g, w, h) =>
    drawHero(g, w, h, { capeLift: 58, pulse: 1, fistGlow: 1, armTilt: 17, aura: 1.2 })
  );
  makeTexture(scene, "surge-death-1", 160, 160, (g, w, h) =>
    drawHero(g, w, h, { capeLift: 30, pulse: 0.8, fistGlow: 0.8, armTilt: 3, aura: 0.8, cracked: true })
  );

  // Wave layers
  makeTexture(scene, "wave-far", 1024, 300, (g, w) => {
    g.fillStyle(0x020406, 1);
    g.fillRect(0, 0, w, 300);
    drawWaveShape(g, w, 185, 26, 0.016, 20, 0x05100b, 1);
    drawWaveShape(g, w, 198, 18, 0.028, 16, 0x0a2014, 0.95);
    for (let i = 0; i < 26; i += 1) {
      const x = (i * 37) % w;
      const y = 70 + ((i * 19) % 90);
      g.fillStyle(COLORS.neonSoft, 0.25);
      g.fillCircle(x, y, 1.2 + (i % 3));
    }
  });

  makeTexture(scene, "wave-mid", 1024, 320, (g, w) => {
    g.fillStyle(0x03090b, 1);
    g.fillRect(0, 0, w, 320);
    drawWaveShape(g, w, 200, 34, 0.02, 18, 0x0b2415, 1);
    drawWaveShape(g, w, 220, 26, 0.033, 16, 0x12351d, 0.95);
    g.lineStyle(2, 0x3dff7a, 0.35);
    for (let i = 0; i < 20; i += 1) {
      const y = 140 + i * 7;
      g.beginPath();
      g.moveTo(0, y + Math.sin(i * 0.7) * 4);
      for (let x = 0; x <= w; x += 48) {
        g.lineTo(x, y + Math.sin((x + i * 36) * 0.02) * 5);
      }
      g.strokePath();
    }
  });

  makeTexture(scene, "wave-crest", 1024, 260, (g, w) => {
    g.fillStyle(0x07130d, 0.98);
    g.fillRect(0, 0, w, 260);
    drawWaveShape(g, w, 120, 20, 0.03, 12, 0x1c4b25, 1);
    drawWaveShape(g, w, 136, 28, 0.04, 10, 0x2f7f35, 0.9);
    g.lineStyle(4, COLORS.neon, 0.95);
    g.beginPath();
    g.moveTo(0, 108);
    for (let x = 0; x <= w; x += 10) {
      g.lineTo(x, 108 + Math.sin(x * 0.04) * 12 + Math.sin(x * 0.013) * 5);
    }
    g.strokePath();
    g.lineStyle(2, COLORS.foam, 0.82);
    g.beginPath();
    g.moveTo(0, 104);
    for (let x = 0; x <= w; x += 12) {
      g.lineTo(x, 104 + Math.sin(x * 0.04 + 0.8) * 7);
    }
    g.strokePath();
  });

  // Collectibles
  makeTexture(scene, "coin-nxt", 54, 54, (g, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    g.fillStyle(COLORS.neon, 0.26);
    g.fillCircle(cx, cy, 25);
    g.fillStyle(0xf7cb47, 1);
    g.fillCircle(cx, cy, 18);
    g.lineStyle(3, 0xffed8a, 1);
    g.strokeCircle(cx, cy, 18);
    g.lineStyle(3, 0x9d6f10, 1);
    g.beginPath();
    g.moveTo(cx - 8, cy + 8);
    g.lineTo(cx - 8, cy - 8);
    g.lineTo(cx + 8, cy + 8);
    g.lineTo(cx + 8, cy - 8);
    g.strokePath();
  });

  makeTexture(scene, "powerup-x2", 72, 72, (g, w, h) => drawPowerOrb(g, w, h, 2));
  makeTexture(scene, "powerup-x5", 72, 72, (g, w, h) => drawPowerOrb(g, w, h, 5));
  makeTexture(scene, "powerup-x10", 72, 72, (g, w, h) => drawPowerOrb(g, w, h, 10));

  // Obstacles
  makeTexture(scene, "obstacle-wave-lip", 92, 140, (g, w, h) => {
    g.fillStyle(0x1f6f2f, 0.95);
    drawPolygon(g, [
      { x: 10, y: h - 6 },
      { x: 20, y: 74 },
      { x: 50, y: 20 },
      { x: 82, y: 62 },
      { x: 72, y: h - 10 },
    ]);
    g.fillPath();
    g.lineStyle(3, COLORS.foam, 0.95);
    g.beginPath();
    g.moveTo(22, 74);
    g.lineTo(51, 22);
    g.lineTo(80, 63);
    g.strokePath();
  });

  makeTexture(scene, "obstacle-fud-cloud", 120, 88, (g) => {
    g.fillStyle(0x212632, 0.95);
    g.fillCircle(36, 42, 24);
    g.fillCircle(60, 34, 28);
    g.fillCircle(88, 43, 22);
    g.fillRect(22, 42, 76, 26);
    g.lineStyle(4, COLORS.red, 0.92);
    g.beginPath();
    g.moveTo(56, 46);
    g.lineTo(47, 62);
    g.lineTo(59, 62);
    g.lineTo(50, 78);
    g.strokePath();
  });

  makeTexture(scene, "obstacle-bear-fin", 84, 96, (g, w, h) => {
    g.fillStyle(0x0f1816, 1);
    drawPolygon(g, [
      { x: 10, y: h - 6 },
      { x: 40, y: 16 },
      { x: 74, y: h - 6 },
    ]);
    g.fillPath();
    g.lineStyle(3, COLORS.neon, 0.65);
    g.strokePath();
    g.fillStyle(COLORS.red, 0.85);
    g.fillCircle(42, 44, 5);
  });

  makeTexture(scene, "obstacle-red-candle", 62, 140, (g, w, h) => {
    g.fillStyle(0x250808, 1);
    g.fillRect(18, 42, 26, 84);
    g.fillStyle(COLORS.red, 1);
    g.fillRect(20, 44, 22, 80);
    g.fillStyle(0x7a1212, 1);
    drawPolygon(g, [
      { x: 31, y: 8 },
      { x: 47, y: 40 },
      { x: 15, y: 40 },
    ]);
    g.fillPath();
  });

  makeTexture(scene, "obstacle-rug-void", 108, 108, (g, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    g.fillStyle(COLORS.void, 0.22);
    g.fillCircle(cx, cy, 48);
    g.fillStyle(0x18061e, 1);
    g.fillCircle(cx, cy, 34);
    g.lineStyle(4, COLORS.red, 0.9);
    g.strokeCircle(cx, cy, 34);
    g.lineStyle(2, COLORS.red, 0.6);
    for (let i = 0; i < 8; i += 1) {
      g.beginPath();
      g.moveTo(cx - 30 + i * 8, cy - 28);
      g.lineTo(cx + 30 - i * 8, cy + 28);
      g.strokePath();
    }
  });

  // Particle textures
  makeTexture(scene, "particle-foam", 16, 16, (g) => {
    g.fillStyle(COLORS.foam, 0.95);
    g.fillCircle(8, 8, 5);
  });
  makeTexture(scene, "particle-spark", 12, 12, (g) => {
    g.fillStyle(COLORS.neon, 0.95);
    g.fillCircle(6, 6, 3);
  });
  makeTexture(scene, "particle-shard", 14, 14, (g) => {
    g.fillStyle(0x1a1d27, 1);
    drawPolygon(g, [
      { x: 2, y: 12 },
      { x: 7, y: 1 },
      { x: 12, y: 12 },
    ]);
    g.fillPath();
    g.lineStyle(2, COLORS.red, 0.8);
    g.strokePath();
  });
  makeTexture(scene, "particle-lightning", 26, 64, (g) => {
    g.lineStyle(4, COLORS.neonSoft, 1);
    g.beginPath();
    g.moveTo(14, 2);
    g.lineTo(9, 20);
    g.lineTo(17, 20);
    g.lineTo(10, 42);
    g.lineTo(19, 42);
    g.lineTo(12, 62);
    g.strokePath();
  });

  // UI icon
  makeTexture(scene, "ui-bolt", 32, 32, (g) => {
    g.fillStyle(COLORS.neon, 1);
    drawPolygon(g, [
      { x: 14, y: 2 },
      { x: 22, y: 2 },
      { x: 16, y: 14 },
      { x: 24, y: 14 },
      { x: 9, y: 30 },
      { x: 14, y: 18 },
      { x: 8, y: 18 },
    ]);
    g.fillPath();
  });
}

export function createHeroAnimations(scene) {
  const anims = scene.anims;

  if (!anims.exists("surge-surf")) {
    anims.create({
      key: "surge-surf",
      frames: [{ key: "surge-surf-1" }, { key: "surge-surf-2" }],
      frameRate: 6,
      repeat: -1,
    });
  }

  if (!anims.exists("surge-glide")) {
    anims.create({
      key: "surge-glide",
      frames: [{ key: "surge-glide-1" }, { key: "surge-glide-2" }],
      frameRate: 6,
      repeat: -1,
    });
  }

  if (!anims.exists("surge-energy")) {
    anims.create({
      key: "surge-energy",
      frames: [{ key: "surge-energy-1" }, { key: "surge-energy-2" }],
      frameRate: 12,
      repeat: -1,
    });
  }

  if (!anims.exists("surge-death")) {
    anims.create({
      key: "surge-death",
      frames: [{ key: "surge-death-1" }],
      frameRate: 1,
      repeat: 0,
    });
  }
}
