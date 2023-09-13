import { NextFunction, Request, Response } from "express";

//import express from 'express';
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
export const app = express();
require('dotenv').config();
require('./Database/db');
import {ErrorMiddleware} from "./middleware/error";

//BODY PARSER
app.use(express.json({limit: "50mb"}));

//COOKIE-PARSER
app.use(cookieParser());

//CORS
app.use(cors({
    origin:process.env.ORIGIN
}));

//testing the API
app.get('/test', (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        success: true,
        msg: "successful routing"
    });
});

//ERROR ROUTE
app.all("*", (req:Request, res:Response, next:NextFunction) => {
    const err = new Error(`Route ${req.originalUrl} not found`) as any;
    err.statusCode = 404;
    next(err);
    // res.status(404).json({err:"this page does not exist"})
});

//ERROR HANDLING
app.use(ErrorMiddleware)