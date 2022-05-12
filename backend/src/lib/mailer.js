const nodemailer = require("nodemailer");

const mailer = async ({ subject, to, text, html }) => {
  const transport = nodemailer.createTransport({
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
    host: "smtp.gmail.com",
    // host: "gsmtp.gmail.com",
    // host: "smtp.etheral.email",
  });
  await transport.sendMail({
    subject: subject || "Test Subject",
    to: to || "bgsrng3@gmail.com",
    text: text || "Test nodemailer",
    html: html || "<h1>This is sent from my Express API</h1>",
  });
};

module.exports = mailer;
