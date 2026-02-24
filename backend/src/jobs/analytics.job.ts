import cron from 'node-cron';
import { prisma } from '../config/db';


export const startAnalyticsJob = () => {
  // Runs every day at 00:00 (Midnight) GMT
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily Analytics Engine job...');
    
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    yesterday.setUTCHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    try {
      const readCounts = await prisma.readLog.groupBy({
        by: ['articleId'],
        where: { readAt: { gte: yesterday, lt: today } },
        _count: { id: true }
      });

      for (const log of readCounts) {
        await prisma.dailyAnalytics.upsert({
          where: { articleId_date: { articleId: log.articleId, date: yesterday } },
          update: { viewCount: { increment: log._count.id } },
          create: { articleId: log.articleId, date: yesterday, viewCount: log._count.id }
        });
      }
      console.log(`Analytics aggregated for ${readCounts.length} articles.`);
    } catch (error) {
      console.error('Analytics Job Error:', error);
    }
  }, { timezone: "Etc/UTC" });
};