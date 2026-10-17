import cron from 'node-cron';
import { sendStats } from './send_stats.js';
import { rebuildPlayerStats } from './player_stats.js';
import { rebuildAchievements } from './achievements.js';

cron.schedule(
  '* * * * *',
  async () => {
    await sendStats();
  },
  { noOverlap: true }
);

cron.schedule(
  '* * * * *',
  async () => {
    await rebuildAchievements();
  },
  { noOverlap: true }
);

cron.schedule(
  '* * * * *',
  async () => {
    await rebuildPlayerStats();
  },
  { noOverlap: true }
);
