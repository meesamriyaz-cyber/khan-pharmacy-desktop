import { MailtrapClient } from 'mailtrap';
import dotenv from 'dotenv';

dotenv.config();    
const TOKEN = process.env.MAILTRAP_API_TOKEN;

export const client = new MailtrapClient({
  token: TOKEN,
});

export const sender = {
  email: "test@cuttingedge-enterprises.in",
  name: "Mailtrap Test",
};
const recipients = [
  {
    email: "meesamriyaz@gmail.com",
  }
];

client
  .send({
    from: sender,
    to: recipients,
    subject: "You are awesome!",
    text: "Congrats for sending test email with Mailtrap!",
    category: "Integration Test",
  })
  .then(console.log, console.error);