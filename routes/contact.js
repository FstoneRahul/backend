const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();


const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

router.post('/', async (req, res) => {
  const { email, message } = req.body;

  if (!email || !message) {
    return res.status(400).json({ error: 'Email and message are required' });
  }

  const mailOptions = {
  from: process.env.EMAIL_USER,
  to: 'info@fstonetechnologies.com',
  subject: 'New Enquiry from Website',
  text: `From: ${email}\n\nMessage: ${message}`,
  replyTo: email
};

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

module.exports = router;