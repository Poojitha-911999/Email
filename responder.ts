import { gmailClient } from '../auth/gmail';
import { outlookClient } from '../auth/outlook';
import { analyzeEmailContent, generateEmailResponse } from '../ai/openai';

async function respondToGmailEmail(emailId: string) {
    const email = await gmailClient.users.messages.get({ userId: 'me', id: emailId });
    const content = email.data.snippet || '';
    const context = await analyzeEmailContent(content);
    const response = await generateEmailResponse(context);

    await gmailClient.users.messages.send({
        userId: 'me',
        requestBody: {
            raw: Buffer.from(
                `To: ${email.data.payload?.headers?.find(h => h.name === 'From')?.value}\n` +
                `Subject: Re: ${email.data.payload?.headers?.find(h => h.name === 'Subject')?.value}\n\n` +
                `${response}`
            ).toString('base64'),
        },
    });
}

async function respondToOutlookEmail(emailId: string) {
    const email = await outlookClient.api(`/me/messages/${emailId}`).get();
    const content = email.body.content;
    const context = await analyzeEmailContent(content);
    const response = await generateEmailResponse(context);

    await outlookClient.api('/me/sendMail').post({
        message: {
            subject: `Re: ${email.subject}`,
            body: {
                contentType: 'Text',
                content: response,
            },
            toRecipients: [
                {
                    emailAddress: {
                        address: email.from.emailAddress.address,
                    },
                },
            ],
        },
    });
}

export { respondToGmailEmail, respondToOutlookEmail };
