function getAudioContext(scene) {
  const ctx = scene.sound && scene.sound.context ? scene.sound.context : null;
  if (!ctx) return null;
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

function tone(ctx, { freq = 440, duration = 0.08, type = "sine", gain = 0.05, startAt = 0 }) {
  const now = ctx.currentTime + startAt;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  amp.gain.setValueAtTime(0.0001, now);
  amp.gain.exponentialRampToValueAtTime(gain, now + 0.01);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export function createSfx(scene) {
  return {
    waveWhoosh() {
      const ctx = getAudioContext(scene);
      if (!ctx) return;
      tone(ctx, { freq: 220, duration: 0.14, type: "sawtooth", gain: 0.03 });
      tone(ctx, { freq: 320, duration: 0.12, type: "triangle", gain: 0.02, startAt: 0.02 });
    },

    coinDing() {
      const ctx = getAudioContext(scene);
      if (!ctx) return;
      tone(ctx, { freq: 960, duration: 0.06, type: "triangle", gain: 0.05 });
      tone(ctx, { freq: 1240, duration: 0.08, type: "sine", gain: 0.04, startAt: 0.03 });
    },

    lightningCrack() {
      const ctx = getAudioContext(scene);
      if (!ctx) return;
      tone(ctx, { freq: 170, duration: 0.11, type: "square", gain: 0.06 });
      tone(ctx, { freq: 80, duration: 0.15, type: "sawtooth", gain: 0.05, startAt: 0.05 });
    },

    crash() {
      const ctx = getAudioContext(scene);
      if (!ctx) return;
      tone(ctx, { freq: 95, duration: 0.25, type: "sawtooth", gain: 0.06 });
      tone(ctx, { freq: 60, duration: 0.3, type: "triangle", gain: 0.05, startAt: 0.04 });
    },
  };
}
