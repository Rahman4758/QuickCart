import nodemailer from 'nodemailer';
import dotenv from 'dotenv'
dotenv.config()

if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.SENDER_EMAIL) {
    console.error("Please provide SMTP_USER, SMTP_PASS, and SENDER_EMAIL in the .env file");
    process.exit(1);
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_USER, // smtp-relay.brevo.com
    port: 587,
    secure: false, // TLS
    auth: {
        user: process.env.LOGIN,  // 7b7ca1001@smtp-brevo.com
        pass: process.env.SMTP_PASS
    }
});


const sendEmail = async({sendTo, subject, html })=>{
    try {
       const info = await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to: sendTo,
            subject: subject,
            html: html
        });
        console.log("Email sent:", info.messageId);
        return info;
    } catch (error) {
        console.error("Email sending failed:", error);
        throw error;
    }
};

export default sendEmail;