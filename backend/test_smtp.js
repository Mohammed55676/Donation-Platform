require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

transporter.verify(function(error, success) {
  if (error) {
    console.log('❌ Connection failed. Google rejected the password or email:', error.message);
  } else {
    console.log('✅ Connection successful. The App Password is valid!');
  }
  process.exit();
});
