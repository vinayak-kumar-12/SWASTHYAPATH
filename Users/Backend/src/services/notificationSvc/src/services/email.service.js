const nodemailer = require("nodemailer");
const logger = require("../utils/logger");
const {
  renderEmailVerificationTemplate,
  renderPasswordResetTemplate,
  renderWelcomeEmailTemplate,
} = require("../utils/emailTemplates");

let transporter = null;

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: process.env.NODE_ENV === "production" },
    });
    logger.info({ host, port, user }, "Nodemailer SMTP transport configured");
  } else {
    logger.warn(
      "SMTP configuration missing or incomplete. Initializing mock JSON transport for email delivery"
    );
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  return transporter;
};

const getTransporter = () => {
  if (!transporter) {
    createTransporter();
  }
  return transporter;
};

const sendMail = async ({ to, subject, html, text }) => {
  const mailTransporter = getTransporter();
  const fromName = process.env.MAIL_FROM_NAME || "SWASTHYAPATH";
  const fromEmail = process.env.MAIL_FROM || "no-reply@swasthyapath.com";
  const from = `"${fromName}" <${fromEmail}>`;

  const mailOptions = {
    from,
    to,
    subject,
    html,
    text,
  };

  try {
    const info = await mailTransporter.sendMail(mailOptions);
    logger.info(
      { recipient: to, subject, messageId: info.messageId },
      "Email sent successfully"
    );
    return {
      success: true,
      messageId: info.messageId || `mock-${Date.now()}`,
      response: info.response || "Sent via mock transport",
    };
  } catch (error) {
    logger.error(
      { recipient: to, subject, error: error.message },
      "Failed to send email"
    );
    throw error;
  }
};

const sendVerificationEmail = async ({ to, name, verificationUrl, expiresAt }) => {
  const { subject, html, text } = renderEmailVerificationTemplate({
    name,
    verificationUrl,
    expiresAt,
  });

  return sendMail({ to, subject, html, text });
};

const sendPasswordResetEmail = async ({ to, name, resetUrl, expiresAt }) => {
  const { subject, html, text } = renderPasswordResetTemplate({
    name,
    resetUrl,
    expiresAt,
  });

  return sendMail({ to, subject, html, text });
};

const sendWelcomeEmail = async ({ to, name }) => {
  const { subject, html, text } = renderWelcomeEmailTemplate({ name });

  return sendMail({ to, subject, html, text });
};

module.exports = {
  createTransporter,
  getTransporter,
  sendMail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
};
