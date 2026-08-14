// src/services/streakService.js
// Business logic for the streak system. Called once, whenever a user
// creates a log — hooked in from logService.createLog.

const StreakModel = require('../models/streakModel');

function todayDateString() {
  // "Today" according to the server's local calendar date.
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function daysBetween(earlierDateStr, laterDateStr) {
  // Anchor both dates to UTC midnight explicitly, so the day-count is
  // never affected by the server's local timezone or daylight saving shifts.
  const a = new Date(`${earlierDateStr}T00:00:00Z`);
  const b = new Date(`${laterDateStr}T00:00:00Z`);
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

const StreakService = {
  // Call this every time a user logs a new topic.
  async recordActivity(userId) {
    const streak = await StreakModel.findByUser(userId);
    if (!streak) return; // shouldn't happen — every user gets a row at registration

    const today = todayDateString();

    let newCurrentStreak;

    if (!streak.last_logged_date) {
      // First log this account has ever made.
      newCurrentStreak = 1;
    } else {
      // last_logged_date now arrives as a plain 'YYYY-MM-DD' string
      // (see dateStrings config in src/config/db.js) — no conversion needed.
      const gap = daysBetween(streak.last_logged_date, today);

      if (gap === 0) {
        // Already logged today — a second log today doesn't increase the streak.
        newCurrentStreak = streak.current_streak;
      } else if (gap === 1) {
        // Logged again on the very next calendar day — streak continues.
        newCurrentStreak = streak.current_streak + 1;
      } else {
        // A day (or more) was skipped — streak resets, today counts as day 1.
        newCurrentStreak = 1;
      }
    }

    const newLongestStreak = Math.max(streak.longest_streak, newCurrentStreak);

    await StreakModel.update(userId, {
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastLoggedDate: today
    });
  }
};

module.exports = StreakService;
