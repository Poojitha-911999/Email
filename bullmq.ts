import { Queue, Worker, QueueScheduler } from 'bullmq';
import { getEmails as getGmailEmails } from '../email/gmail';
import { getEmails as getOutlookEmails } from '../email/outlook';
import { respondToGmailEmail, respondToOutlookEmail } from '../email/responder';
import dotenv from 'dotenv';

dotenv.config();

const connection = {
    host: 'localhost',
    port: 6379,
};

const emailQueue = new Queue('emailQueue', { connection });
new QueueScheduler('emailQueue', { connection });

new Worker('emailQueue', async job => {
    const { emailId, provider } = job.data;
    if (provider === 'gmail') {
        await respondToGmailEmail(emailId);
    } else if (provider === 'outlook') {
        await respondToOutlookEmail(emailId);
    }
}, { connection });

async function scheduleEmailChecks() {
    const gmailEmails = await getGmailEmails();
    for (const email of gmailEmails) {
        await emailQueue.add('processEmail', { emailId: email.id, provider: 'gmail' });
    }

    const outlookEmails = await getOutlookEmails();
    for (const email of outlookEmails) {
        await emailQueue.add('processEmail', { emailId: email.id, provider: 'outlook' });
    }
}

setInterval(scheduleEmailChecks, 60000);  // Check for new emails every minute
