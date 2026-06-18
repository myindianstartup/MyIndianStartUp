import { Router } from 'express';
import { z } from 'zod';
import nodemailer from 'nodemailer';

export const contactRouter = Router();

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters.'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters.')
});

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildMailContent = (payload) => {
  const safeName = escapeHtml(payload.name);
  const safeEmail = escapeHtml(payload.email);
  const safeSubject = escapeHtml(payload.subject);
  const safeMessage = escapeHtml(payload.message);

  return {
    subject: `[Contact Form Query] ${payload.subject}`,
    text: `You received a new message from the contact form:

Name: ${payload.name}
Email: ${payload.email}
Subject: ${payload.subject}

Message:
${payload.message}`,
    html: `<div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #2563eb; margin-top: 0;">New Contact Form Message</h2>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 20px;" />
      <p><strong>Name:</strong> ${safeName}</p>
      <p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
      <p><strong>Subject:</strong> ${safeSubject}</p>
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin-top: 15px; border: 1px solid #e2e8f0; white-space: pre-wrap;">
        <strong>Message:</strong><br />
        ${safeMessage}
      </div>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 20px; margin-bottom: 20px;" />
      <p style="font-size: 12px; color: #64748b;">This email was automatically generated from the MyIndianStartup contact us form.</p>
    </div>`
  };
};

const sendWithResend = async ({ payload, receiverEmail }) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const content = buildMailContent(payload);
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'MyIndianStartup <team@myindianstartup.com>';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [receiverEmail],
        reply_to: payload.email,
        subject: content.subject,
        text: content.text,
        html: content.html
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend API error ${response.status}: ${errorText}`);
    }
  } finally {
    clearTimeout(timeout);
  }
};

const sendWithSmtp = async ({ payload, receiverEmail, smtpHost, smtpPort, smtpUser, smtpPass }) => {
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });
  const content = buildMailContent(payload);

  await transporter.sendMail({
    from: `"${payload.name}" <${smtpUser}>`,
    to: receiverEmail,
    replyTo: payload.email,
    subject: content.subject,
    text: content.text,
    html: content.html
  });
};

contactRouter.post('/', async (req, res) => {
  try {
    const payload = contactSchema.parse(req.body);

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || 'team@myindianstartup.com';
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      await sendWithResend({ payload, receiverEmail });
    } else if (smtpHost && smtpUser && smtpPass) {
      await sendWithSmtp({ payload, receiverEmail, smtpHost, smtpPort, smtpUser, smtpPass });
    } else {
      console.warn('[contact] Email provider is not configured. Message could not be dispatched.');
      res.json({
        success: true,
        message: 'Message received (mock mode). Please configure email provider variables to send live emails.'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you shortly.'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0]?.message || 'Invalid input parameters.' });
      return;
    }

    console.error('[contact] Email dispatch failed:', {
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
      message: error.message
    });
    res.status(502).json({
      error: 'We could not send your message right now. Please email team@myindianstartup.com directly or try again in a few minutes.'
    });
  }
});
