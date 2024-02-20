import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const mailConfig = {
  transporter: nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  }),
  from: process.env.EMAIL_FROM,
};

export default mailConfig;
