import { Request, Response, NextFunction } from 'express';
import userModel, { IUser } from '../models/userModel';
import ErrorHandler from '../utils/errorHandler';
import { catchAsyncError } from '../middleware/catchAsyncError';
import sendMail from '../utils/sendMail';
const jwt = require("jsonwebtoken");
require('dotenv').config();
const ejs = require('ejs');
const path = require('path');
import { sendToken } from '../utils/jwt'
import { JwtPayload } from 'jsonwebtoken';
import {Redis} from 'ioredis';


//SIGNUP USER
interface UserRegistrationBody {
    name: string;
    email: string;
    password: string;
    avatar?: string;
}

export const signupUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password, avatar } = req.body;
        const emailExist = await userModel.findOne({ email });
        if (emailExist) {
            return next(new ErrorHandler("This email already exist", 400))
        };
        const user: UserRegistrationBody = {
            name,
            email,
            password
        };
        const activationToken = createActivationToken(user);
        const activationCode = activationToken.activationCode;
        const data = {
            user: {
                name: user.name
            },
            activationCode
        };
        const html = await ejs.renderFile(path.join(__dirname, '../mails/activation-mail.ejs'), data);
        try {
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
        catch (err) {
            return next(new ErrorHandler(err.message, 400));
        };
    }
    catch (err: any) {
        return next(new ErrorHandler(err.message, 400));
    }
})

interface IActivationToken {
    token: string,
    activationCode: string
}
export const createActivationToken = (user: any): IActivationToken => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = jwt.sign({
        user, activationCode
    }, process.env.ACTIVATION_SECRET, {
        expiresIn: "5m"
    });
    return { token, activationCode }
}

//ACTIVATE USER
interface IActivationRequest {
    activation_token: string;
    activation_code: string;
};

export const activateUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { activation_token, activation_code } = req.body as IActivationRequest;
        const newUser: { user: IUser; activationCode: string } = jwt.verify(
            activation_token,
            process.env.ACTIVATION_SECRET as string
        ) as { user: IUser; activationCode: string };

        //CHECKING ACTIVATION
        if (newUser.activationCode !== activation_code) {
            return next(new ErrorHandler("Invalid activation code", 400));
        }
        const { name, email, password } = newUser.user;
        const userExist = await userModel.findOne({ email });

        if (userExist) {
            return next(new ErrorHandler("This email already exist", 400));
        }

        const user = await userModel.create({
            name,
            email,
            password
        });
        res.status(201).json({
            success: true,

        });
    }
    catch (err: any) {
        return next(new ErrorHandler(err.message, 400));
        //console.log(err)
    }

});

//USER LOGIN
interface ILoginRequest {
    email: string;
    password: string;
};

export const loginUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body as ILoginRequest;
        if (!email || !password) {
            return next(new ErrorHandler("Kindly enter an email and password", 400));
        };

        const user = await userModel.findOne({ email }).select("+password");

        if (!user) {
            return next(new ErrorHandler("Invalid email or password", 400));
        }

        const isPassword = await user.comparePassword(password);
        if (!isPassword) {
            return next(new ErrorHandler("Invalid email or password", 400));
        }

        sendToken(user, 200, res)

    }
    catch (err: any) {
        return next(new ErrorHandler(err.message, 400));
    }
});


//LOGOUT THE USER
export const logout = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.cookie("access_token", "", { maxAge: 0 });
        res.cookie("refresh_token", "", { maxAge: 0 });
      
        //TO CLEAR REDIS CACHE
        // const userId = req.user?._id || ''
        // redis.del(userId)
        res.status(200).json({
            success: true,
            msg: "Logged out successfully"
        })
    }
    catch (err: any) {
        return next(new ErrorHandler(err.message, 400));
    }
});


//UPDATE ACCESS TOKEN

export const updateAccessToken = catchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try{
       const refresh_token = req.cookies.refresh_token as string;
       const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN as string) as JwtPayload;
       const message = 'Could not refresh token';
       if(!decoded){
        return next(new ErrorHandler(message, 400));
       }
    //    const session = await Redis.get(decoded.id as string);
    //    if(!session){
    //     return next(new ErrorHandler(message, 400));
    //    }
    //    const user = JSON.parse(session);
    //    const accessToken = jwt.sign({id:user._id}, process.env.ACCESS_TOKEN as string, {
    //     expiresIn: "5m"
    //    })
    //    const refreshToken = jwt.sign({id:user._id}, process.env.REFRESH_TOKEN as string, {
    //     expiresIn: "3d"
    //    })

    // res.cookie("access_token", accessToken, accessTokenOptions)

    }
    catch(err){
        return next(new ErrorHandler(err.message, 400));
    }
})