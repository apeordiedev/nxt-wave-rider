# NXT Wave Rider (Telegram Mini App + Phaser 3.90)

Production-ready, mobile-first Telegram Mini App endless vertical wave survival game:

- **Title:** NXT WAVE RIDER
- **Hero:** Surge (black armored superhero with glowing neon-green power)
- **Core loop:** tap to energy-surge upward, survive the crashing cyber wave, dodge obstacles, collect $NXT, chain lightning multipliers.

## Highlights

- Phaser **3.90.0** (3.80+ compatible requirement satisfied)
- Scene architecture:
  - `BootScene`
  - `PreloadScene`
  - `MenuScene`
  - `GameScene`
  - `GameOverScene`
- Dynamic "Sushi Surf style" wave stack:
  - Multi-layer parallax cyber ocean
  - Rolling crest motion
  - Foam + mist + gold spark particles
  - Neon edge glow + cyber-rain background code lines
- Hero state animation set:
  - Surf
  - Energy surge
  - Glide/carve
  - Death frame + explosion FX
  - Built from an in-game generated sprite sheet (`surge-sheet`, 192x192 frames)
- Gameplay systems:
  - Endless speed ramp (every 10 seconds)
  - Pooled obstacles
  - Pooled coin pickups
  - Rare x2/x5/x10 lightning multipliers
  - Near-miss slow-mo sparks
  - Distance + $NXT scoring
- Persistence (`localStorage`):
  - High score (distance)
  - Lifetime total $NXT across all runs
  - Daily streak counter
- Telegram integration:
  - `WebApp.ready()`
  - `expand()`
  - Haptics on surge/collect/death
  - Share score CTA
  - Back button support
- WebAudio placeholder SFX:
  - wave whoosh
  - coin ding
  - lightning crack
  - crash

## Project structure

```text
/
  index.html
  main.js
  assets/
    surge-reference.svg
  scenes/
    BootScene.js
    PreloadScene.js
    MenuScene.js
    GameScene.js
    GameOverScene.js
  utils/
    Audio.js
    Storage.js
    TelegramBridge.js
    TextureFactory.js
    WaveBackground.js
```

## Surge sprite sheet details

Surge is rendered from a runtime-built sprite sheet in:

```text
utils/TextureFactory.js
```

The function `buildSurgeSpriteSheet()` composes 7 frames:

1. Surf A
2. Surf B
3. Glide A
4. Glide B
5. Energy surge A
6. Energy surge B
7. Death

This keeps the game self-contained (single-page deploy, no external art dependency) while matching the black armor + neon green + gold particle aesthetic from the reference.

If you later want to replace with your exact hand-authored frames, update `buildSurgeSpriteSheet()` to copy from your PNG sprite strip and keep animation keys unchanged.

## Run locally

Any static server works:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Telegram Mini App setup (BotFather)

1. Open **@BotFather**
2. Run `/mybots` and select your bot
3. Open **Bot Settings** -> **Menu Button** -> **Configure menu button**
4. Set button text (example): `Play NXT Wave Rider`
5. Set Web App URL to your hosted `index.html` (Vercel / Netlify / Replit)
6. Optional: set domain in BotFather if prompted
7. Launch bot in Telegram and open via the menu button

## Deployment notes

- Host as plain static files.
- `index.html` is the Telegram entry page.
- Recommended hosts:
  - Vercel
  - Netlify
  - Replit

## Gameplay scoring details

- **Distance score:** meters survived
- **Run $NXT:** each coin gives `+1 * currentMultiplier`
- **Final score:** `distance + runNxt`
- **Multiplier duration:** 12 seconds per pickup, stacks by multiplying and extending duration.

## Performance notes

- Object pooling used for obstacles/coins/powerups.
- Arcade physics tuned for mobile 60fps targets.
- Particle counts capped for lower-end devices.

