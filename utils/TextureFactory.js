const COLORS = {
  bgDark: 0x010305,
  cyberDark: 0x07100d,
  neon: 0x84ff43,
  neonSoft: 0xa7ff6b,
  neonDeep: 0x2faa3e,
  foam: 0xeefff4,
  gold: 0xffd95e,
  goldSoft: 0xfff2a3,
  white: 0xffffff,
  black: 0x040506,
  armor: 0x0a0e12,
  armorEdge: 0x1f262f,
  red: 0xff3b44,
  void: 0x35123f,
};

const SURGE_SHEET = {
  key: "surge-sheet",
  frameWidth: 192,
  frameHeight: 192,
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

function drawArmorStrand(g, points, stroke = COLORS.neon, alpha = 0.7) {
  g.lineStyle(2.2, stroke, alpha);
  g.beginPath();
  g.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) {
    g.lineTo(points[i].x, points[i].y);
  }
  g.strokePath();
}

function drawHeroFrame(g, w, h, cfg) {
  const cx = w * 0.5;
  const boardY = h - 28 + (cfg.boardOffsetY || 0);
  const capeLift = cfg.capeLift || 0;
  const aura = cfg.aura || 0;
  const fistGlow = cfg.fistGlow || 0.4;
  const armTilt = cfg.armTilt || 0;
  const pulse = cfg.pulse || 0.6;
  const boardTilt = cfg.boardTilt || 0;

  // Green/gold wave aura around hero to match provided concept art.
  for (let i = 0; i < 3; i += 1) {
    g.lineStyle(2 + i, COLORS.neon, 0.15 + aura * 0.08 - i * 0.03);
    g.beginPath();
    g.arc(
      cx - 10,
      h * 0.56,
      56 + i * 12 + aura * 18,
      Phaser.Math.DegToRad(-165 + i * 10),
      Phaser.Math.DegToRad(-5 + i * 16),
      false
    );
    g.strokePath();
  }
  for (let i = 0; i < 14; i += 1) {
    const sparkX = cx - 65 + i * 10;
    const sparkY = h * 0.62 - Math.sin(i * 0.7 + pulse * 3) * 18 - aura * 7;
    g.fillStyle(i % 3 === 0 ? COLORS.goldSoft : COLORS.gold, 0.18 + aura * 0.15);
    g.fillCircle(sparkX, sparkY, 1.1 + (i % 2));
  }

  // Surfboard base.
  g.fillStyle(COLORS.neon, 0.32 + aura * 0.1);
  drawPolygon(g, [
    { x: cx - 66, y: boardY + 10 - boardTilt * 0.24 },
    { x: cx + 62, y: boardY - 2 + boardTilt * 0.22 },
    { x: cx + 76, y: boardY + 2 + boardTilt * 0.25 },
    { x: cx + 2, y: boardY + 19 + boardTilt * 0.2 },
    { x: cx - 73, y: boardY + 17 - boardTilt * 0.2 },
  ]);
  g.fillPath();
  g.fillStyle(0x0c2615, 0.98);
  drawPolygon(g, [
    { x: cx - 60, y: boardY + 6 - boardTilt * 0.2 },
    { x: cx + 60, y: boardY - 3 + boardTilt * 0.2 },
    { x: cx + 68, y: boardY + 2 + boardTilt * 0.2 },
    { x: cx + 2, y: boardY + 14 + boardTilt * 0.2 },
    { x: cx - 66, y: boardY + 13 - boardTilt * 0.2 },
  ]);
  g.fillPath();
  g.lineStyle(2.6, COLORS.neonSoft, 0.92);
  g.beginPath();
  g.moveTo(cx - 58, boardY + 6 - boardTilt * 0.19);
  g.lineTo(cx + 58, boardY - 3 + boardTilt * 0.2);
  g.strokePath();
  g.lineStyle(1.4, COLORS.goldSoft, 0.55);
  g.beginPath();
  g.moveTo(cx - 54, boardY + 10);
  g.lineTo(cx + 48, boardY + 2);
  g.strokePath();

  // Cape.
  g.fillStyle(0x050608, 0.96);
  drawPolygon(g, [
    { x: cx - 12, y: 75 },
    { x: cx - 62, y: 96 - capeLift * 0.42 },
    { x: cx - 90, y: 130 - capeLift * 0.23 },
    { x: cx - 44, y: 151 - capeLift * 0.56 },
    { x: cx - 2, y: 120 - capeLift * 0.43 },
  ]);
  g.fillPath();
  g.lineStyle(2, 0x1a1f28, 0.95);
  g.strokePath();
  g.lineStyle(2, COLORS.neonDeep, 0.48 + aura * 0.2);
  g.beginPath();
  g.moveTo(cx - 21, 84);
  g.lineTo(cx - 58, 110 - capeLift * 0.3);
  g.lineTo(cx - 45, 142 - capeLift * 0.45);
  g.strokePath();

  // Core body.
  g.fillStyle(COLORS.armor, 1);
  g.fillRoundedRect(cx - 22, 56, 44, 48, 10);
  g.fillRoundedRect(cx - 18, 102, 16, 40, 6);
  g.fillRoundedRect(cx + 2, 103, 16, 38, 6);
  g.lineStyle(2, COLORS.armorEdge, 1);
  g.strokeRoundedRect(cx - 22, 56, 44, 48, 10);
  g.strokeRoundedRect(cx - 18, 102, 16, 40, 6);
  g.strokeRoundedRect(cx + 2, 103, 16, 38, 6);

  // Shoulders + arms.
  g.fillStyle(0x0a0d11, 1);
  g.fillCircle(cx - 25, 70, 9);
  g.fillCircle(cx + 25, 70, 9);
  g.fillRoundedRect(cx - 46 + armTilt * 0.3, 71 - armTilt * 0.2, 17, 40, 7);
  g.fillRoundedRect(cx + 29 + armTilt * 0.24, 71 - armTilt * 0.16, 17, 40, 7);
  g.lineStyle(2, COLORS.armorEdge, 1);
  g.strokeRoundedRect(cx - 46 + armTilt * 0.3, 71 - armTilt * 0.2, 17, 40, 7);
  g.strokeRoundedRect(cx + 29 + armTilt * 0.24, 71 - armTilt * 0.16, 17, 40, 7);

  // Fist glows.
  g.fillStyle(COLORS.neon, 0.36 + fistGlow * 0.44);
  g.fillCircle(cx - 37 + armTilt * 0.3, 111 - armTilt * 0.18, 12 + fistGlow * 4.2);
  g.fillCircle(cx + 37 + armTilt * 0.24, 111 - armTilt * 0.15, 12 + fistGlow * 4.2);
  g.fillStyle(COLORS.neonSoft, 0.94);
  g.fillCircle(cx - 37 + armTilt * 0.3, 111 - armTilt * 0.18, 6.6);
  g.fillCircle(cx + 37 + armTilt * 0.24, 111 - armTilt * 0.15, 6.6);

  // Helmet.
  g.fillStyle(0x070a0d, 1);
  drawPolygon(g, [
    { x: cx - 18, y: 50 },
    { x: cx - 14, y: 30 },
    { x: cx, y: 22 },
    { x: cx + 14, y: 30 },
    { x: cx + 18, y: 50 },
    { x: cx + 5, y: 62 },
    { x: cx - 5, y: 62 },
  ]);
  g.fillPath();
  g.lineStyle(2, COLORS.armorEdge, 1);
  g.strokePath();
  g.fillStyle(COLORS.neonSoft, 1);
  g.fillCircle(cx - 7, 44, 2.8);
  g.fillCircle(cx + 7, 44, 2.8);
  g.lineStyle(2, COLORS.neon, 0.65);
  g.beginPath();
  g.moveTo(cx - 12, 49);
  g.lineTo(cx - 1, 44);
  g.lineTo(cx + 12, 49);
  g.strokePath();

  // Chest emblem N.
  g.fillStyle(COLORS.neon, 0.09 + pulse * 0.14);
  g.fillRoundedRect(cx - 16, 63, 32, 34, 8);
  g.lineStyle(3 + pulse * 1.8, COLORS.neonSoft, 0.96);
  g.beginPath();
  g.moveTo(cx - 10, 66);
  g.lineTo(cx - 10, 92);
  g.lineTo(cx + 10, 66);
  g.lineTo(cx + 10, 92);
  g.strokePath();
  g.lineStyle(2, COLORS.goldSoft, 0.5 + aura * 0.14);
  g.beginPath();
  g.moveTo(cx - 11, 71);
  g.lineTo(cx + 11, 83);
  g.strokePath();

  // Armor accent strands.
  drawArmorStrand(g, [
    { x: cx - 22, y: 84 },
    { x: cx - 8, y: 89 },
    { x: cx - 2, y: 99 },
  ]);
  drawArmorStrand(g, [
    { x: cx + 22, y: 84 },
    { x: cx + 9, y: 89 },
    { x: cx + 2, y: 99 },
  ]);
  drawArmorStrand(
    g,
    [
      { x: cx - 4, y: 105 },
      { x: cx - 5, y: 124 },
      { x: cx - 6, y: 138 },
    ],
    COLORS.gold,
    0.45
  );
  drawArmorStrand(
    g,
    [
      { x: cx + 4, y: 105 },
      { x: cx + 5, y: 124 },
      { x: cx + 6, y: 138 },
    ],
    COLORS.gold,
    0.45
  );

  if (cfg.cracked) {
    g.lineStyle(2, COLORS.red, 0.95);
    g.beginPath();
    g.moveTo(cx - 17, 61);
    g.lineTo(cx - 1, 80);
    g.lineTo(cx - 17, 106);
    g.moveTo(cx + 17, 63);
    g.lineTo(cx + 2, 82);
    g.lineTo(cx + 18, 108);
    g.strokePath();
  }
}

function buildSurgeSpriteSheet(scene) {
  const frameW = SURGE_SHEET.frameWidth;
  const frameH = SURGE_SHEET.frameHeight;

  const frames = [
    { key: "__surge-frame-0", cfg: { capeLift: 8, pulse: 0.45, fistGlow: 0.36, armTilt: 2, aura: 0.35, boardTilt: -3 } },
    { key: "__surge-frame-1", cfg: { capeLift: 18, pulse: 0.63, fistGlow: 0.46, armTilt: 7, aura: 0.45, boardTilt: 2 } },
    { key: "__surge-frame-2", cfg: { capeLift: 12, pulse: 0.4, fistGlow: 0.32, armTilt: -9, aura: 0.3, boardTilt: 5 } },
    { key: "__surge-frame-3", cfg: { capeLift: 22, pulse: 0.55, fistGlow: 0.4, armTilt: -4, aura: 0.4, boardTilt: 8 } },
    { key: "__surge-frame-4", cfg: { capeLift: 60, pulse: 0.95, fistGlow: 0.98, armTilt: 16, aura: 1.1, boardTilt: -4, boardOffsetY: -6 } },
    { key: "__surge-frame-5", cfg: { capeLift: 72, pulse: 1, fistGlow: 1.05, armTilt: 19, aura: 1.25, boardTilt: 1, boardOffsetY: -8 } },
    { key: "__surge-frame-6", cfg: { capeLift: 36, pulse: 0.8, fistGlow: 0.72, armTilt: 4, aura: 0.8, cracked: true, boardTilt: 0 } },
  ];

  for (const frame of frames) {
    if (scene.textures.exists(frame.key)) {
      scene.textures.remove(frame.key);
    }
    makeTexture(scene, frame.key, frameW, frameH, (g, w, h) => {
      drawHeroFrame(g, w, h, frame.cfg);
    });
  }

  if (scene.textures.exists("__surge-sheet-canvas")) {
    scene.textures.remove("__surge-sheet-canvas");
  }

  const sheetCanvas = scene.textures.createCanvas("__surge-sheet-canvas", frameW * frames.length, frameH);
  const ctx = sheetCanvas.context;
  ctx.clearRect(0, 0, frameW * frames.length, frameH);

  for (let i = 0; i < frames.length; i += 1) {
    const src = scene.textures.get(frames[i].key).getSourceImage();
    ctx.drawImage(src, i * frameW, 0, frameW, frameH);
  }
  sheetCanvas.refresh();

  if (scene.textures.exists(SURGE_SHEET.key)) {
    scene.textures.remove(SURGE_SHEET.key);
  }

  scene.textures.addSpriteSheet(SURGE_SHEET.key, sheetCanvas.getSourceImage(), {
    frameWidth: frameW,
    frameHeight: frameH,
    startFrame: 0,
    endFrame: frames.length - 1,
  });

  // Keep an in-menu frame key for static key art usage.
  if (!scene.textures.exists("surge-keyart")) {
    makeTexture(scene, "surge-keyart", 320, 320, (g, w, h) => {
      drawHeroFrame(g, w, h, {
        capeLift: 72,
        pulse: 1,
        fistGlow: 1,
        armTilt: 8,
        aura: 1.4,
        boardTilt: 0,
        boardOffsetY: 44,
      });
    });
  }
}

function drawWaveShape(g, width, baseY, amplitude, frequency, step, color, alpha) {
  g.fillStyle(color, alpha);
  g.beginPath();
  g.moveTo(0, baseY);
  for (let x = 0; x <= width; x += step) {
    const y = baseY + Math.sin(x * frequency) * amplitude + Math.sin(x * 0.019) * 7;
    g.lineTo(x, y);
  }
  g.lineTo(width, 320);
  g.lineTo(0, 320);
  g.closePath();
  g.fillPath();
}

function drawPowerOrb(g, w, h, tier) {
  const cx = w / 2;
  const cy = h / 2;
  const glowScale = tier / 2;

  g.fillStyle(COLORS.neonSoft, 0.15 + glowScale * 0.1);
  g.fillCircle(cx, cy, 36 + tier * 3);
  g.fillStyle(0x0e2a16, 1);
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
  buildSurgeSpriteSheet(scene);

  // Wave layers
  makeTexture(scene, "wave-far", 1024, 320, (g, w) => {
    g.fillStyle(0x010305, 1);
    g.fillRect(0, 0, w, 320);
    drawWaveShape(g, w, 188, 28, 0.014, 18, 0x04120a, 1);
    drawWaveShape(g, w, 206, 22, 0.024, 16, 0x092015, 0.95);
    g.lineStyle(1.5, 0x2f8d41, 0.38);
    for (let i = 0; i < 26; i += 1) {
      const y = 118 + i * 5;
      g.beginPath();
      g.moveTo(0, y + Math.sin(i * 0.6) * 4);
      for (let x = 0; x <= w; x += 56) {
        g.lineTo(x, y + Math.sin((x + i * 24) * 0.021) * 5);
      }
      g.strokePath();
    }
    for (let i = 0; i < 38; i += 1) {
      const x = (i * 41) % w;
      const y = 50 + ((i * 37) % 145);
      g.fillStyle(i % 4 === 0 ? COLORS.gold : COLORS.neonSoft, i % 4 === 0 ? 0.24 : 0.22);
      g.fillCircle(x, y, 1.2 + (i % 3) * 0.4);
    }
  });

  makeTexture(scene, "wave-mid", 1024, 340, (g, w) => {
    g.fillStyle(0x02090b, 1);
    g.fillRect(0, 0, w, 340);
    drawWaveShape(g, w, 216, 36, 0.02, 14, 0x0b2718, 1);
    drawWaveShape(g, w, 236, 28, 0.031, 12, 0x134324, 0.92);
    g.lineStyle(2.2, COLORS.neon, 0.34);
    g.beginPath();
    g.moveTo(0, 170);
    for (let x = 0; x <= w; x += 14) {
      g.lineTo(x, 170 + Math.sin(x * 0.03) * 10 + Math.sin(x * 0.011) * 6);
    }
    g.strokePath();
    g.lineStyle(1.5, COLORS.gold, 0.24);
    g.beginPath();
    g.moveTo(0, 158);
    for (let x = 0; x <= w; x += 17) {
      g.lineTo(x, 158 + Math.sin(x * 0.035 + 1.3) * 7);
    }
    g.strokePath();
  });

  makeTexture(scene, "wave-crest", 1024, 280, (g, w) => {
    g.fillStyle(0x06140f, 0.98);
    g.fillRect(0, 0, w, 280);
    drawWaveShape(g, w, 126, 24, 0.029, 10, 0x1a5f31, 1);
    drawWaveShape(g, w, 150, 32, 0.039, 9, 0x2b8f44, 0.88);

    g.lineStyle(4, COLORS.neonSoft, 0.95);
    g.beginPath();
    g.moveTo(0, 112);
    for (let x = 0; x <= w; x += 10) {
      g.lineTo(x, 112 + Math.sin(x * 0.04) * 12 + Math.sin(x * 0.013) * 6);
    }
    g.strokePath();

    g.lineStyle(2, COLORS.foam, 0.85);
    g.beginPath();
    g.moveTo(0, 106);
    for (let x = 0; x <= w; x += 12) {
      g.lineTo(x, 106 + Math.sin(x * 0.044 + 0.8) * 7);
    }
    g.strokePath();

    g.lineStyle(1.6, COLORS.goldSoft, 0.52);
    g.beginPath();
    g.moveTo(0, 118);
    for (let x = 0; x <= w; x += 14) {
      g.lineTo(x, 118 + Math.sin(x * 0.05 + 2.1) * 6);
    }
    g.strokePath();
  });

  // Collectibles
  makeTexture(scene, "coin-nxt", 54, 54, (g, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    g.fillStyle(COLORS.neon, 0.22);
    g.fillCircle(cx, cy, 24);
    g.fillStyle(COLORS.gold, 1);
    g.fillCircle(cx, cy, 18);
    g.lineStyle(3, COLORS.goldSoft, 1);
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
    g.fillStyle(0x2d8f49, 0.95);
    drawPolygon(g, [
      { x: 8, y: h - 6 },
      { x: 20, y: 72 },
      { x: 50, y: 18 },
      { x: 84, y: 62 },
      { x: 72, y: h - 8 },
    ]);
    g.fillPath();
    g.lineStyle(3, COLORS.foam, 0.95);
    g.beginPath();
    g.moveTo(23, 73);
    g.lineTo(50, 22);
    g.lineTo(80, 62);
    g.strokePath();
  });

  makeTexture(scene, "obstacle-fud-cloud", 120, 88, (g) => {
    g.fillStyle(0x1e222d, 0.95);
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
    g.fillStyle(0x0d1512, 1);
    drawPolygon(g, [
      { x: 10, y: h - 6 },
      { x: 40, y: 16 },
      { x: 74, y: h - 6 },
    ]);
    g.fillPath();
    g.lineStyle(3, COLORS.neon, 0.7);
    g.strokePath();
    g.fillStyle(COLORS.red, 0.88);
    g.fillCircle(42, 44, 5);
  });

  makeTexture(scene, "obstacle-red-candle", 62, 140, (g) => {
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
    g.fillStyle(COLORS.void, 0.24);
    g.fillCircle(cx, cy, 48);
    g.fillStyle(0x14061d, 1);
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
  makeTexture(scene, "particle-goldspark", 12, 12, (g) => {
    g.fillStyle(COLORS.goldSoft, 0.95);
    g.fillCircle(6, 6, 2.8);
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
  const sheet = SURGE_SHEET.key;

  if (!anims.exists("surge-surf")) {
    anims.create({
      key: "surge-surf",
      frames: [{ key: sheet, frame: 0 }, { key: sheet, frame: 1 }],
      frameRate: 7,
      repeat: -1,
    });
  }

  if (!anims.exists("surge-glide")) {
    anims.create({
      key: "surge-glide",
      frames: [{ key: sheet, frame: 2 }, { key: sheet, frame: 3 }],
      frameRate: 7,
      repeat: -1,
    });
  }

  if (!anims.exists("surge-energy")) {
    anims.create({
      key: "surge-energy",
      frames: [{ key: sheet, frame: 4 }, { key: sheet, frame: 5 }],
      frameRate: 12,
      repeat: -1,
    });
  }

  if (!anims.exists("surge-death")) {
    anims.create({
      key: "surge-death",
      frames: [{ key: sheet, frame: 6 }],
      frameRate: 1,
      repeat: 0,
    });
  }
}
