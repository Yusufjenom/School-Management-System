import {Request, Response, NextFunction} from 'express';
import userModel,{IUser} from '../models/userModel';
import ErrorHandler from '../utils/errorHandler';
import {catchAsyncError} from '../middleware/catchAsyncError';
import sendMail from '../utils/sendMail';
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
        try{
            await sendMail({
                email: user.email,
                subject: "Activate your account",
                template: "activation-mail.ejs",
                data,
            });
            res.status(201).json({
                success: true,
                message: `Please check your email: ${user.email} to activate your account`,
                activationToken: activationToken.token
            })
        }
        catch(err){
            return next(new ErrorHandler(err.message, 400));
        };
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

//ACTIVATE USER
interface IActivationRequest{
    activation_token: string;
    activation_code: string;
};

export const activateUser = catchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try{
       const {activation_token, activation_code} = req.body as IActivationRequest;
       const newUser: {user: IUser; activationCode: string} = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET as string
       ) as {user:IUser; activationCode:string};

       //CHECKING ACTIVATION
       if(newUser.activationCode !== activation_code){
        return next(new ErrorHandler("Invalid activation code", 400));
       }
       const {name, email, password} = newUser.user;
       const userExist = await userModel.findOne({email});

       if(userExist){
        return next(new ErrorHandler("This email already exist", 400));
       }
       
       const user = await userModel.create({
         name,
         email,
         password
       });
       res.status(201).json({
        success:true,

       });
    }
    catch(err){
       return next(new ErrorHandler(err.message, 400));
        //console.log(err)
    }

})