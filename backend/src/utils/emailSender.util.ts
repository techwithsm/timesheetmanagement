import nodemailer from 'nodemailer';
import { logger } from '../config/logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: nodemailer.SendMailOptions['attachments'];
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"School Attendance" <${process.env.SMTP_FROM}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    });
    logger.info(`Email sent to ${options.to}`);
  } catch (error) {
    logger.error('Failed to send email:', error);
    throw error;
  }
}

export function buildAbsenceAlertEmail(
  studentName: string,
  parentName: string,
  date: string,
  consecutive: number
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e53e3e;">Attendance Alert</h2>
      <p>Dear ${parentName},</p>
      <p>This is to inform you that <strong>${studentName}</strong> has been marked absent on <strong>${date}</strong>.</p>
      ${consecutive >= 3 ? `<p style="color: #e53e3e; font-weight: bold;">Warning: ${studentName} has been absent for ${consecutive} consecutive school days.</p>` : ''}
      <p>Please contact the school if you have any concerns.</p>
      <p>Regards,<br/>School Administration</p>
    </div>
  `;
}

export function buildPasswordResetEmail(resetLink: string, name: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>Hello ${name},</p>
      <p>Click the link below to reset your password. This link expires in 1 hour.</p>
      <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;
}
