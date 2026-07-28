import { Router } from "express";
import upload from "../config/multerConfig.js";
import { protectRoute } from "../middlewares/authMiddleware.js";
import { generatePost, getGenerations, getPosts, schedulePosts } from "../controllers/postController.js";

const postRouter = Router();

postRouter.get("/", protectRoute, getPosts);
postRouter.get("/generations", protectRoute, getGenerations);
postRouter.post("/", protectRoute, upload.single("media"), schedulePosts);
postRouter.post("/generate", protectRoute, generatePost);

export default postRouter;