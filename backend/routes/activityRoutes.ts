
import { Router } from "express";
import { protectRoute } from "../middlewares/authMiddleware.js";
import { getActivity } from "../controllers/activityController.js";


const activityRouter = Router();

activityRouter.get("/", protectRoute, getActivity);

export default activityRouter;

