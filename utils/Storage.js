const STORAGE_KEY = "nxt_wave_rider_progress_v1";

const DEFAULT_PROGRESS = {
  highScore: 0,
  lifetimeNxt: 0,
  streakCount: 1,
  lastPlayedDate: "",
};

function parseNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_PROGRESS };
    }

    const parsed = JSON.parse(raw);
    return {
      highScore: Math.max(0, Math.floor(parseNumber(parsed.highScore))),
      lifetimeNxt: Math.max(0, Math.floor(parseNumber(parsed.lifetimeNxt))),
      streakCount: Math.max(1, Math.floor(parseNumber(parsed.streakCount, 1))),
      lastPlayedDate: typeof parsed.lastPlayedDate === "string" ? parsed.lastPlayedDate : "",
    };
  } catch (error) {
    console.warn("[Storage] Failed to read progress, using defaults.", error);
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.warn("[Storage] Failed to save progress.", error);
  }
}

export function updateDailyStreak(progress, now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  const last = progress.lastPlayedDate || "";

  if (!last) {
    return {
      ...progress,
      streakCount: 1,
      lastPlayedDate: today,
    };
  }

  if (last === today) {
    return {
      ...progress,
      lastPlayedDate: today,
    };
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const dayDiff = Math.round(
    (new Date(`${today}T00:00:00Z`) - new Date(`${last}T00:00:00Z`)) / msPerDay
  );

  const nextStreak = dayDiff === 1 ? progress.streakCount + 1 : 1;

  return {
    ...progress,
    streakCount: Math.max(1, nextStreak),
    lastPlayedDate: today,
  };
}

export function applyRunResults(progress, run) {
  return {
    ...progress,
    lifetimeNxt: Math.max(0, Math.floor(progress.lifetimeNxt + run.runNxt)),
    highScore: Math.max(Math.floor(progress.highScore), Math.floor(run.distance)),
  };
}

export const ProgressDefaults = DEFAULT_PROGRESS;
