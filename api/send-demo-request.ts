import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const SALES_EMAIL = 'info@dynamicsolutions.am';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, company, email, phone, message } = req.body as {
    name: string;
    company: string;
    email: string;
    phone: string;
    message?: string;
  };

  if (!name || !company || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const html = `
    <h2>New Demo Request</h2>
    <table cellpadding="8" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      <tr><td><strong>Name</strong></td><td>${name}</td></tr>
      <tr><td><strong>Company</strong></td><td>${company}</td></tr>
      <tr><td><strong>Email</strong></td><td><a href="mailto:${email}">${email}</a></td></tr>
      <tr><td><strong>Phone</strong></td><td>${phone || '—'}</td></tr>
      ${message ? `<tr><td><strong>Message</strong></td><td style="white-space:pre-wrap">${message}</td></tr>` : ''}
    </table>
  `;

  const { error } = await resend.emails.send({
    from: 'MDAnalytics <noreply@dynamicsolutions.am>',
    to: SALES_EMAIL,
    replyTo: email,
    subject: `Demo Request — ${company}`,
    html,
  });

  if (error) {
    console.error('Resend error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }

  return res.status(200).json({ ok: true });
}
