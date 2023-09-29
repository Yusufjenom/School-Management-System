//GETTING USER BY ID

import { redis } from "../Database/redis";
import userModel from "../models/userModel";
import { Request, Response, NextFunction } from 'express';

export const getUserById = async (id: string, res: Response) => {
    const userJSON = await redis.get(id);
    if (userJSON) {
        const user = JSON.parse(userJSON);
        res.status(201).json({
            success: true,
            user,
        });
    }
};


