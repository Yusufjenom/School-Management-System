const nodemailer = require('nodemailer');
import {Transporter} from 'nodemailer';
const ejs = require('ejs');
const path = require('path');


interface EmailOptions{
    email: string;
    subject: string;
    template: string;
    data: {[key:string]: any};
};

const sendMail = async (options: EmailOptions): Promise <void> => {
   const transporter:Transporter  = nodemailer.createTransport({
    host: process.env
   })
}
