import { Request, Response, NextFunction } from 'express';
import { catchAsyncError } from './catchAsyncError';
import ErrorHandler from '../utils/errorHandler';
import { Redis } from 'ioredis';
const jwt = require('jsonwebtoken');

// CHECKING FOR AUTHENTICATED USER
export const isAuthenticated = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token;

    if (!access_token) {
        return next(new ErrorHandler("This user is not Authenticated", 400));
    }

    const decoded = await jwt.verify(access_token, process.env.ACCESS_TOKEN as string);

    if (!decoded) {
        return next(new ErrorHandler("invalid access token", 400));
    };

    // const user = await Redis.get(decoded.id);
    // if(!user){
    //     return next(new ErrorHandler("user not found", 400));

    // }
    // req.user = JSON.parse(user);
    next();
});


//VALIDATE USERS ROLE
export const authorizeRoles = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user?.role || "")) {
            return next(new ErrorHandler(`Role: ${req.user?.role} is not allowed to access this resource`, 403));
        }
        next();
    }
};