# nxt-wave-rider
Phaser.js endless runner - nxt wave rider

## How to test

The game is a vanilla JS / Phaser 3 app — no build step required.
Because `main.js` uses ES modules (`<script type="module">`), you **must** serve the files over HTTP rather than opening `index.html` directly from disk (browsers block module imports via `file://`).

### 1. Check out the feature branch

```bash
git fetch origin
git checkout cursor/nxt-wave-rider-project-e4b3
```

### 2. Start a local static server

Pick whichever option is already available on your machine:

| Method | Command |
|---|---|
| Python 3 (built-in) | `python3 -m http.server 8080` |
| Node / npx | `npx serve .` |
| Node / http-server | `npx http-server -p 8080` |

### 3. Open in a browser

```
http://localhost:8080
```

The game should load, show the menu screen, and be fully playable with mouse clicks or taps.

### 4. Test the Telegram integration

The Telegram Web App SDK is loaded from CDN and silently no-ops when running outside Telegram, so the game will run fine in a plain browser. To test Telegram-specific features (haptics, share CTA, back button):

1. Deploy the static files to a public HTTPS URL (Vercel, Netlify, or use `ngrok` to tunnel localhost).
2. In **@BotFather**, open your bot → **Bot Settings** → **Menu Button** → set the Web App URL to your HTTPS URL.
3. Open your bot in Telegram and press the menu button.

### 5. Manual test checklist

- [ ] Menu screen renders with neon theme
- [ ] Tap / click starts a game session
- [ ] Surge sprite animates (surf, surge, glide)
- [ ] Wave background scrolls and parallax layers move
- [ ] Obstacles spawn and move toward the player
- [ ] Coin pickups are collectable and score increments
- [ ] Multiplier powerups (x2 / x5 / x10) activate and display
- [ ] Speed ramp triggers every ~10 seconds
- [ ] Death triggers game-over scene with final score
- [ ] High score persists across page reloads (localStorage)
- [ ] Daily streak counter increments on first run of the day

### 6. Browser DevTools tips

- Open **Console** to catch any JS errors on load.
- Open **Network** tab → confirm `phaser.min.js` and `telegram-web-app.js` load from CDN (no 404s).
- Enable **Mobile emulation** (Cmd/Ctrl+Shift+M in Chrome) and set the device to a phone profile to test the touch controls and portrait layout.
- Set CPU throttling to **4x slowdown** to spot performance regressions.

### 7. Adding automated tests (optional)

There is currently no automated test suite. If you want to add one, the straightforward path is:

```bash
npm init -y
npm install --save-dev vitest jsdom
```

Then add unit tests for the pure-logic utilities under `utils/` (e.g. `Storage.js`, `Audio.js`) without needing a real browser.
For full end-to-end tests (rendering, input, Phaser scenes) consider [Playwright](https://playwright.dev/).
