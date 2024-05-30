import { outlookClient } from '../auth/outlook';

export async function getEmails() {
    const res = await outlookClient.api('/me/messages').get();
    return res.value || [];
}
