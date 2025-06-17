const cron = require('node-cron');
const fs = require('fs/promises');
const path = require('path');
const emailQueue = require('./email-queue');

const UPLOAD_DIR = path.join(__dirname, '../uploads/cvs');

// cron job every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  try {
    const queueLength = emailQueue.length;
    if (queueLength === 0) {
      const files = await fs.readdir(UPLOAD_DIR);

      for (const file of files) {
        const filePath = path.join(UPLOAD_DIR, file);
        await fs.unlink(filePath);
        // console.log(`🗑️ Deleted file: ${file}`);
      }

    } else {
      // console.log(`🚫 Skipped cleaning /uploads/cvs (queue has ${queueLength} tasks)`);
    }
  } catch (err) {
    // console.error('❌ Error cleaning uploads:', err.message);
  }
});
