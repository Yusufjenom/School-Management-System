import { NextFunction, Request, Response } from 'express';
import ErrorHandler from '../utils/errorHandler';

export const ErrorMiddleware = (err:any, req:Request, res:Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal server error'

    //WRONG MONGODB ID
  if(err.name === 'CastError'){
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  //DUPLICATE KEY ERROR
  if(err.code === 1100){
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`
    err = new ErrorHandler(message, 400);
  }

  //WRONG JWT TOKEN
  if(err.name === 'JsonWebTokenError'){
    const message = `JsonWebToken is invalid, try again`;
    err = new ErrorHandler(message, 400);
  }

  //JWT EXPIRED
  if(err.name === 'TokenExpiredError'){
    const message = `Jsonwebtoken is expired, try again later`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message
  })
}