const nodemailer = require('nodemailer');
import {Transporter} from 'nodemailer';
const ejs = require('ejs');
const path = require('path');
require('dotenv').config();


interface EmailOptions{
    email: string;
    subject: string;
    template: string;
    data: {[key:string]: any};
};

const sendMail = async (options: EmailOptions): Promise <void> => {
   const transporter:Transporter  = nodemailer.createTransport({
    host: process.env.S_HOST,
    port: parseInt(process.env.S_PORT || '587'),
    service: process.env.S_SERVICE,
    auth:{
        user:process.env.S_MAIL,
        pass: process.env.S_PASSWORD
    },
   });
   const {email, subject, template, data} = options;

   //GET PATH TO EMAIL
   const templatePath = path.join(__dirname, '../mails', template);

   //RENDER EMAIL TEMPLATE WITH EJS
   const html:string = await ejs.renderFile(templatePath, data);

   const mailOptions = {
    from: process.env.S_MAIL,
    to: email,
    subject,
    html,
   };

   //SENDING THE MAIL
   await transporter.sendMail(mailOptions);
};

export default sendMail;
