import { Request, Response } from "express";
import { AuthRequest } from "../interfaces/AuthRequest.js";
import { ActivityLog } from "../models/ActivityLog.js";




//Get All Activity
// GET /api/activity
export const getActivity = async (req: AuthRequest, res: Response) : Promise<void> => {
    try {
        const user = req.user._id;
        const activity = await ActivityLog.find({ user }).sort({ createdAt: -1 }).limit(10).populate('relatedPost', 'content');
        res.status(200).json(activity);
    } catch (error: unknown) {
        res.status(500).json({
            message: error instanceof Error ? error.message : "Server Error"
        });
    }
};