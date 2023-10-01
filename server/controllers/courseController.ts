import { Response, Request, NextFunction } from 'express';
import { catchAsyncError } from '../middleware/catchAsyncError';
import ErrorHandler from '../utils/errorHandler';
import { createCourse } from '../services/courseService';
//import cloudinary from 'cloudinary'
const cloudinary = require('cloudinary');

//UPLOADING COURSES
export const uploadCourse = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        if (thumbnail) {
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "courses"
            });
            data.thumbnail = {
                public_id:myCloud.public_id,
                url:myCloud.secure_url
            }
        }
        createCourse(data, res, next);
    }
    catch (err: any) {
        return next(new ErrorHandler(err.message, 500));
    }
});
