//GETTING USER BY ID

import userModel from "../models/userModel";
import {Request, Response, NextFunction} from 'express';

export const getUserById = async (id: string, res:Response) => {
    const user = await userModel.findById(id);
    res.status(201).json({
        success: true,
        user, 
    })
}


