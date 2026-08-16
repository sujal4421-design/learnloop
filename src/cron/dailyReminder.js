// src/cron/dailyReminder.js
// Runs automatically every day at 8am — no user has to trigger this.

const cron = require('node-cron');
const RevisionService = require('../services/revisionService');
const EmailService = require('../services/emailService');

async function runDailyReminders() {
  console.log('[cron] Running daily revision reminder job...');

  const groups = await RevisionService.getAllDueForReminders();

  if (groups.length === 0) {
    console.log('[cron] No users have revisions due today.');
    return;
  }

  for (const { user, revisions } of groups) {
    const sent = await EmailService.sendRevisionReminder(user, revisions);
    if (sent) {
      console.log(`[cron] Reminder sent to ${user.email} (${revisions.length} topics).`);
    }
  }
}

function startDailyReminderJob() {
  // Cron syntax: minute hour day-of-month month day-of-week
  // '0 8 * * *' = every day at 08:00
  cron.schedule('0 8 * * *', runDailyReminders);
  console.log('[cron] Daily reminder job scheduled for 8:00 AM.');
}

module.exports = { startDailyReminderJob, runDailyReminders };
