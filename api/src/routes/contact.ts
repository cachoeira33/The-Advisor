import express from 'express';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import { asyncHandler, createError } from '../middleware/errorHandler.js';
import { rateLimiterMiddleware } from '../middleware/rateLimiter.js';

const router = express.Router();

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

// Rate limit contact form submissions
router.use(rateLimiterMiddleware);

router.post('/', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { name, email, subject, message } = contactSchema.parse(req.body);

  // Create transporter
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Email content
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: process.env.CONTACT_EMAIL || 'contact@financepro.com',
    subject: `Contact Form: ${subject}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
      <hr>
      <p><small>Sent from FinancePro Contact Form</small></p>
    `,
    replyTo: email,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Email sending error:', error);
    throw createError('Failed to send message', 500);
  }
}));

export { router as contactRoutes };