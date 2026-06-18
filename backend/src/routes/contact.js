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

contactRouter.post('/', async (req, res, next) => {
  try {
    const payload = contactSchema.parse(req.body);

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || 'team@myindianstartup.com';

    // If SMTP credentials are not configured, log it and return mock success to prevent blocking UI
    if (!smtpHost || !smtpUser || !smtpPass) {
      console.warn('⚠️ SMTP settings are missing in environment variables. Email could not be dispatched.');
      res.json({
        success: true,
        message: 'Message received (mock mode). Please configure SMTP variables to send live emails.'
      });
      return;
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const mailOptions = {
      from: `"${payload.name}" <${smtpUser}>`, // Must be smtpUser to avoid SMTP relay rejection
      to: receiverEmail,
      replyTo: payload.email, // Allows the client to click 'Reply' and reply directly to the sender
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
        <p><strong>Name:</strong> ${payload.name}</p>
        <p><strong>Email:</strong> <a href="mailto:${payload.email}">${payload.email}</a></p>
        <p><strong>Subject:</strong> ${payload.subject}</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin-top: 15px; border: 1px solid #e2e8f0; white-space: pre-wrap;">
          <strong>Message:</strong><br />
          ${payload.message}
        </div>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 20px; margin-bottom: 20px;" />
        <p style="font-size: 12px; color: #64748b;">This email was automatically generated from the MyIndianStartup contact us form.</p>
      </div>`
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you shortly.'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0]?.message || 'Invalid input parameters.' });
    } else {
      next(error);
    }
  }
});
