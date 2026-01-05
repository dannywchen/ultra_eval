import nodemailer from 'nodemailer';

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const SENDER_EMAIL = process.env.SENDER_EMAIL || GMAIL_USER;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
    },
});

export async function sendGmail({ to, subject, html }: { to: string; subject: string; html: string }) {
    try {
        if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
            console.error('Missing GMAIL_USER or GMAIL_APP_PASSWORD in environment variables.');
            return { success: false, error: 'Credentials missing' };
        }

        const mailOptions = {
            from: `"Ultra Eval" <${SENDER_EMAIL}>`,
            to,
            subject,
            html,
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Gmail sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Gmail send error:', error);
        return { success: false, error };
    }
}
