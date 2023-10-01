import { Response, Request, NextFunction } from 'express';
import { catchAsyncError } from '../middleware/catchAsyncError';
import ErrorHandler from '../utils/errorHandler';
import { createCourse } from '../services/courseService';
import CourseModel from '../models/courseModel';
import { redis } from '../Database/redis';
const mongoose = require('mongoose');
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
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        }
        createCourse(data, res, next);
    }
    catch (err: any) {
        return next(new ErrorHandler(err.message, 500));
    }
});

//MODIFY OR EDIT COURSE

export const editCourse = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;

        if (thumbnail) {
            await cloudinary.v2.uploader.destroy(thumbnail.public_id);
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "courses"
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        const courseId = req.params.id;

        const course = await CourseModel.findByIdAndUpdate(courseId, { $set: data }, {
            new: true
        });
        res.status(201).json({
            success: true,
            course,
        })
    }
    catch (err: any) {
        return next(new ErrorHandler(err.message, 500));
    }
});


//GET SINGLE COURSE WITHOUT PURCHASE
export const getSingleCourse = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courseId = req.params.id;
        //in case we have multiple users hitting our server, cache is faster thats why we using redis
        const existInRedis = await redis.get(courseId);
        if (existInRedis) {
            const course = JSON.parse(existInRedis);
            res.status(200).json({
                success: true,
                course
            })
        } else {
            const course = await CourseModel.findById(req.params.id).select(
                "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
            );
            await redis.set(courseId, JSON.stringify(course));
            res.status(200).json({
                success: true,
                course
            });
        }

    }
    catch (err: any) {
        return next(new ErrorHandler(err.message, 500));
    }
});


//GET ALL COURSES WITHOUT PURCHASE
export const getAllCourses = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const existInRedis = await redis.get("allCourses");
        if (existInRedis) {
            const courses = JSON.parse(existInRedis);
            res.status(200).json({
                success: true,
                courses
            })
        } else {
            const courses = await CourseModel.find().select(
                "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
            );

            await redis.set("allCourses", JSON.stringify(courses));
            res.status(200).json({
                success: true,
                courses,
            });
        }

    }
    catch (err: any) {
        return next(new ErrorHandler(err.message, 500));
    }
});


//GETTING COURSE CONTENT FOR VALID USER
export const getCourseByUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;

        const courseExist = userCourseList?.find((course: any) => course._id.toString() === courseId);
        if (!courseExist) {
            return next(new ErrorHandler("You're not elligible to access this course", 404));
        }
        const course = await CourseModel.findById(courseId);
        const courseContent = course?.courseData;
        res.status(200).json({
            success: true,
            courseContent,
        })
    }
    catch (err: any) {
        return next(new ErrorHandler(err.message, 500));
    }
});

//ADDING QUESTIONS AND ANSWERS IN COURSES
interface IAddQuestionData {
    question: string;
    courseId: string;
    contentId: string;
}

export const addQuestion = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
       const {question, courseId, contentId}: IAddQuestionData = req.body;
       const course = await CourseModel.findById(contentId);
       
       if(!mongoose.Types.ObjectId.isValid(contentId)){
        return next(new ErrorHandler("Invalid Contenttt Id", 400));
       }

       const courseContent = course?.courseData.find((item:any) => item._id === contentId);

       if(!courseContent){
        return next(new ErrorHandler("Invalid Content Id", 400));
       }

       //create a new question object
       const newQuestion: any = {
        user: req.user,
        question,
        questionReplies:[]
       };

       //adding this above question to our course content
       courseContent.questions.push(newQuestion);

       //save the updated course
       await course?.save()

       res.status(200).json({
        success:true,
        course
       });
    }
    catch (err: any) {
        return next(new ErrorHandler(err.message, 500));
    }
});