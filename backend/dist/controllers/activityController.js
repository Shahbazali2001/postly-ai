import { ActivityLog } from "../models/ActivityLog.js";
//Get All Activity
// GET /api/activity
export const getActivity = async (req, res) => {
    try {
        const user = req.user._id;
        const activity = await ActivityLog.find({ user }).sort({ createdAt: -1 }).limit(10).populate('relatedPost', 'content');
        res.status(200).json(activity);
    }
    catch (error) {
        res.status(500).json({
            message: error instanceof Error ? error.message : "Server Error"
        });
    }
};
