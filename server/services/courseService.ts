import { Response, Request, NextFunction } from 'express';
import CourseModel from '../models/courseModel';
import { catchAsyncError } from '../middleware/catchAsyncError';

//CREATING OUR COURSES
export const createCourse = catchAsyncError(async(data:any, res:Response) => {
    const course = await CourseModel.create(data);
    res.status(201).json({
        success:true,
        course
    })
})