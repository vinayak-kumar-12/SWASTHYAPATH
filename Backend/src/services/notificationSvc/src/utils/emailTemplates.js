/**
 * Email templates for SWASTHYAPATH Notification Service
 */

const getBaseStyles = () => `
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; color: #333333; }
  .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #0d9488 0%, #0284c7 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
  .header h1 { margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 0.5px; }
  .content { padding: 36px 32px; }
  .greeting { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 16px; }
  .body-text { font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
  .btn-container { text-align: center; margin: 32px 0; }
  .btn { display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #0284c7 100%); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3); }
  .notice-box { background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 14px 18px; border-radius: 4px; font-size: 13px; color: #64748b; margin-top: 24px; }
  .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
  .footer a { color: #0284c7; text-decoration: none; }
`;

const renderEmailVerificationTemplate = ({ name, verificationUrl, expiresAt }) => {
  const subject = "Verify your SWASTHYAPATH account";
  const expirationText = expiresAt ? ` This link will expire in 24 hours.` : "";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>${getBaseStyles()}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SWASTHYAPATH</h1>
        </div>
        <div class="content">
          <div class="greeting">Hello ${name || "User"},</div>
          <div class="body-text">
            Thank you for registering with SWASTHYAPATH! Please verify your email address to activate your account and start accessing our healthcare services.${expirationText}
          </div>
          <div class="btn-container">
            <a href="${verificationUrl}" class="btn" target="_blank">Verify Email Address</a>
          </div>
          <div class="body-text" style="font-size: 13px; word-break: break-all;">
            If the button above does not work, copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #0284c7;">${verificationUrl}</a>
          </div>
          <div class="notice-box">
            <strong>Security Notice:</strong> If you did not create an account on SWASTHYAPATH, please disregard this email. Your email address remains safe.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} SWASTHYAPATH. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `Hello ${name || "User"},\n\nThank you for registering with SWASTHYAPATH! Please verify your email address by clicking the link below:${expirationText}\n\n${verificationUrl}\n\nIf you did not create an account on SWASTHYAPATH, please ignore this email.`;

  return { subject, html, text };
};

const renderPasswordResetTemplate = ({ name, resetUrl, expiresAt }) => {
  const subject = "Reset your SWASTHYAPATH password";
  const expirationText = expiresAt ? ` This link will expire in 1 hour.` : "";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>${getBaseStyles()}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SWASTHYAPATH</h1>
        </div>
        <div class="content">
          <div class="greeting">Hello ${name || "User"},</div>
          <div class="body-text">
            We received a request to reset the password for your SWASTHYAPATH account. Click the button below to set a new password.${expirationText}
          </div>
          <div class="btn-container">
            <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
          </div>
          <div class="body-text" style="font-size: 13px; word-break: break-all;">
            If the button above does not work, copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #0284c7;">${resetUrl}</a>
          </div>
          <div class="notice-box">
            <strong>Security Notice:</strong> If you did not request a password reset, please ignore this message or contact support if you suspect unauthorized access.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} SWASTHYAPATH. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `Hello ${name || "User"},\n\nWe received a request to reset your SWASTHYAPATH password. Use the link below to set a new password:${expirationText}\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;

  return { subject, html, text };
};

const renderWelcomeEmailTemplate = ({ name }) => {
  const subject = "Welcome to SWASTHYAPATH";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>${getBaseStyles()}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SWASTHYAPATH</h1>
        </div>
        <div class="content">
          <div class="greeting">Welcome to SWASTHYAPATH, ${name || "User"}!</div>
          <div class="body-text">
            Your email address has been successfully verified! We are excited to have you on board.
          </div>
          <div class="body-text">
            You can now log in, complete your profile, and explore our comprehensive digital healthcare management platform.
          </div>
          <div class="notice-box">
            <strong>Need assistance?</strong> Our support team is here to help you get the most out of SWASTHYAPATH.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} SWASTHYAPATH. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `Welcome to SWASTHYAPATH, ${name || "User"}!\n\nYour email address has been successfully verified! You can now log in and access all features of SWASTHYAPATH.`;

  return { subject, html, text };
};

module.exports = {
  renderEmailVerificationTemplate,
  renderPasswordResetTemplate,
  renderWelcomeEmailTemplate,
};
