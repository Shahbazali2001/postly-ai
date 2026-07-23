import express from "express";
import { generateOAuthURL, syncConnectedAccounts } from "../controllers/socialAuthController.js";
import { protectRoute } from "../middlewares/authMiddleware.js";

const socialAuthRouter = express.Router();

socialAuthRouter.get("/:platform/url", protectRoute, generateOAuthURL);
socialAuthRouter.get("/sync", protectRoute, syncConnectedAccounts);


export default socialAuthRouter;
