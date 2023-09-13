import {Request, Response, NextFunction} from 'express';
import userModel,{IUser} from '../models/userModel';
import ErrorHandler from '../utils/errorHandler';
import {catchAsyncError} from '../middleware/catchAsyncError';
//import jwt from 'jsonwebtoken';
const jwt = require("jsonwebtoken");
require('dotenv').config();
const ejs = require('ejs');
const path = require('path');


//SIGNUP USER
interface UserRegistrationBody{
    name:string;
    email:string;
    password:string;
    avatar?:string;
}

export const signupUser = catchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try{
        const {name, email, password, avatar} = req.body;
        const emailExist = await userModel.findOne({email});
        if(emailExist){
            return next(new ErrorHandler("This email already exist", 400))
        };
        const user:UserRegistrationBody = {
            name,
            email,
            password
        };
        const activationToken = createActivationToken(user);
        const activationCode = activationToken.activationCode;
        const data = {
            user:{
                name:user.name
            },
            activationCode
        };
        const html = await ejs.renderFile(path.join(__dirname,'../mails/activation-mail.ejs'), data);
        try{}
        catch(err){
            
        }
    }
    catch(err: any){
      return next(new ErrorHandler(err.message, 400));
    }
})

interface IActivationToken{
  token:string,
  activationCode: string
}
export const createActivationToken = (user:any): IActivationToken => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = jwt.sign({
        user, activationCode
    }, process.env.ACTIVATION_SECRET,{
        expiresIn:"5m"
    });
    return {token, activationCode}
}