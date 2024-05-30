import { gmailClient } from '../auth/gmail';

export async function getEmails() {
    const res = await gmailClient.users.messages.list({ userId: 'me' });
    return res.data.messages || [];
}
