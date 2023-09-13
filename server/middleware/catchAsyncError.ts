import { NextFunction, Request, Response } from "express";
import { resolve } from "path";

export const catchAsyncError = (theFunc : any) => (req: Request, res: Response, next:NextFunction) => {
   Promise.resolve(theFunc(req, res, next))
   .catch(next);
}