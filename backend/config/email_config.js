require("dotenv").config();
const {Resend} = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY)

const sendEmail = async (to, subject, html) => {
  try {
    await resend.emails.send({
      from: `NoteDown <no-reply@${process.env.EMAIL_DOMAIN}>`, 
      to: [to],
      subject,
      html,
    });
    return { success: true, message: "Email sent" };
  } catch (error) {
    console.error("Error sending email:", error.message);
    return { success: false, message: "Failed to send email" };
  }
};

module.exports = { sendEmail };