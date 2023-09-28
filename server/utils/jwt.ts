require('dotenv').config();
import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/userModel';
import {redis} from '../Database/redis'


interface ITokenOptions {
    expires: Date;
    maxAge: number;
    httpOnly: boolean;
    sameSite: 'lax' | 'strict' | undefined;
    secure?: boolean;
};

export const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || "300", 10);
export const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || '1200', 10);

//COOKIE OPTION
export const accessTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + accessTokenExpire * 1000 * 60 * 60),
    maxAge: accessTokenExpire * 1000 * 60 * 60,
    httpOnly: true,
    sameSite: 'lax'
}

export const refreshTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire * 1000 * 60 * 60 * 24),
    maxAge: accessTokenExpire * 1000 * 60 * 60 * 24,
    httpOnly: true,
    sameSite: 'lax'
}



export const sendToken = (user: IUser, statusCode: number, res: Response) => {
    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();

    //SETTING UP UPLOAD SESSION TO REDIS
       redis.set(user._id, JSON.stringify(user) as any);

    //PARSING ENV VARIABLES TO INTEGRATE WITH FALLBACK VALUES
    // const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || '300', 10);
    // const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || '1200', 10);

    // //OPTIONS FOR COOKIES
    // const accessTokenOptions: ITokenOptions = {
    //     expires: new Date(Date.now() + accessTokenExpire * 1000),
    //     maxAge: accessTokenExpire * 1000,
    //     httpOnly: true,
    //     sameSite: 'lax'
    // }

    // const refreshTokenOptions: ITokenOptions = {
    //     expires: new Date(Date.now() + accessTokenExpire * 1000),
    //     maxAge: refreshTokenExpire * 1000,
    //     httpOnly: true,
    //     sameSite: 'lax'
    // }
    //SETTING SECURE TO "true" DURING PRODUCTION
    if (process.env.NODE_ENV === 'production') {
        accessTokenOptions.secure = true
    }
    res.cookie("access_token", accessToken, accessTokenOptions);
    res.cookie("refresh_token", refreshToken, refreshTokenOptions);

    res.status(statusCode).json({
        success: true,
        user,
        accessToken,
    })
}