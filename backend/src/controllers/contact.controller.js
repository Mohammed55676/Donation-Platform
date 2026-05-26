/**
 * src/controllers/contact.controller.js
 */
const nodemailer = require('nodemailer');
const { sendSuccess } = require('../utils/apiResponse');
const { AppError } = require('../middleware/error.middleware');

async function sendContactMessage(req, res, next) {
  try {
    const { user_name, user_email, subject, message } = req.body;

    if (!user_name || !user_email || !subject || !message) {
      throw new AppError('يرجى تعبئة كافة الحقول', 400);
    }

    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>رسالة جديدة من نموذج اتصل بنا</h2>
        <p><strong>الاسم:</strong> ${user_name}</p>
        <p><strong>البريد الإلكتروني:</strong> ${user_email}</p>
        <p><strong>الموضوع:</strong> ${subject}</p>
        <div style="margin-top: 20px; padding: 15px; border: 1px solid #eee; background-color: #f9f9f9;">
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      </div>
    `;

    let transporter;
    if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
      transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD,
        }
      });
    } else {
      console.log('No SMTP credentials, using Ethereal for testing contact form');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
    }

    const info = await transporter.sendMail({
      from: `"${user_name}" <${process.env.SMTP_EMAIL || 'noreply@example.com'}>`,
      to: process.env.SMTP_EMAIL || 'mohaa34356@gmail.com', // Sending to the admin email
      replyTo: user_email,
      subject: `[منصة الخير] رسالة اتصال: ${subject}`,
      html: htmlMessage,
    });

    if (!process.env.SMTP_EMAIL) {
      console.log("Contact Email Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }

    return sendSuccess(res, null, 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.');
  } catch (err) {
    next(new AppError('حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة مرة أخرى.', 500));
  }
}

module.exports = { sendContactMessage };
