const nodemailer = require('nodemailer');

const SMTP_USER = (process.env.SMTP_USER || 'sk61398sny@gmail.com').trim();
const SMTP_PASS = (process.env.SMTP_PASS || 'hcfg wjnm vgtu mxbz').replace(/\s+/g, '');
const RELAY_SECRET = process.env.RELAY_SECRET || 'swastik_internal_mail_secret_2026';

module.exports = async (req, res) => {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-relay-secret');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { to, subject, html, text, secret } = req.body || {};

    const providedSecret = secret || req.headers['x-relay-secret'];
    if (providedSecret !== RELAY_SECRET) {
      return res.status(401).json({ success: false, message: 'Unauthorized mail relay request' });
    }

    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({ success: false, message: 'Missing required fields: to, subject, html/text' });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 15000,
    });

    const info = await transporter.sendMail({
      from: `"Swastik Photography" <${SMTP_USER}>`,
      to,
      subject,
      text: text || '',
      html: html || '',
      priority: 'high',
      headers: {
        'X-Priority': '1',
      },
    });

    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      response: info.response,
    });
  } catch (err) {
    console.error('[Vercel Mail Relay Error]:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to dispatch email via Vercel relay',
    });
  }
};
