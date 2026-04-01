import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports (587)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: `${process.env.EMAIL_FROM}`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html, // Optional: You can pass HTML contents here
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
