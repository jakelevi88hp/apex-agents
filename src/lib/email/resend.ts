import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Apex Agents <onboarding@resend.dev>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const APP_NAME = 'Apex Agents';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error('Resend email error:', error);
      return { success: false, error: error.message };
    }

    console.log('Email sent successfully:', data?.id);
    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(to: string, resetToken: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f6f9fc;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">${APP_NAME}</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
                    
                    <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                      We received a request to reset your password. Click the button below to create a new password:
                    </p>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);">
                            Reset Password
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 20px 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                      Or copy and paste this link into your browser:
                    </p>
                    <p style="margin: 10px 0 0; color: #667eea; font-size: 14px; word-break: break-all;">
                      ${resetUrl}
                    </p>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
                    
                    <p style="margin: 0; color: #718096; font-size: 14px; line-height: 1.6;">
                      <strong>This link will expire in 1 hour.</strong>
                    </p>
                    
                    <p style="margin: 20px 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                      If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f7fafc; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="margin: 0; color: #a0aec0; font-size: 13px;">
                      © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                    </p>
                    <p style="margin: 10px 0 0; color: #a0aec0; font-size: 13px;">
                      Need help? Contact us at support@apexagents.com
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const text = `
Reset Your Password

We received a request to reset your password for ${APP_NAME}.

Click the link below to create a new password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.

Need help? Contact us at support@apexagents.com

© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
  `.trim();

  return sendEmail({
    to,
    subject: `Reset your ${APP_NAME} password`,
    html,
    text,
  });
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(to: string, name: string) {
  const dashboardUrl = `${APP_URL}/dashboard`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ${APP_NAME}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f6f9fc;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">${APP_NAME}</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600;">Welcome, ${name}! 🎉</h2>
                    
                    <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                      Thank you for joining ${APP_NAME}! We're excited to have you on board.
                    </p>
                    
                    <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                      Your 14-day free trial has started. During this time, you'll have access to all features:
                    </p>
                    
                    <ul style="margin: 0 0 20px; padding-left: 20px; color: #4a5568; font-size: 16px; line-height: 1.8;">
                      <li>Create up to 10 AI agents</li>
                      <li>Send 100 AGI messages</li>
                      <li>Build 5 workflows</li>
                      <li>1 GB storage</li>
                    </ul>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);">
                            Get Started
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
                    
                    <p style="margin: 0; color: #718096; font-size: 14px; line-height: 1.6;">
                      Need help getting started? Check out our documentation or reach out to our support team.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f7fafc; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="margin: 0; color: #a0aec0; font-size: 13px;">
                      © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                    </p>
                    <p style="margin: 10px 0 0; color: #a0aec0; font-size: 13px;">
                      Need help? Contact us at support@apexagents.com
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const text = `
Welcome to ${APP_NAME}, ${name}!

Thank you for joining ${APP_NAME}! We're excited to have you on board.

Your 14-day free trial has started. During this time, you'll have access to all features:
- Create up to 10 AI agents
- Send 100 AGI messages
- Build 5 workflows
- 1 GB storage

Get started: ${dashboardUrl}

Need help getting started? Check out our documentation or reach out to our support team.

© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
Need help? Contact us at support@apexagents.com
  `.trim();

  return sendEmail({
    to,
    subject: `Welcome to ${APP_NAME}! 🎉`,
    html,
    text,
  });
}
