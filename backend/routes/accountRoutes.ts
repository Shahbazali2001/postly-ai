import { Router } from "express";
import { getAccounts, addAccounts, deleteAccount } from "../controllers/accountControllers.js";
import { protectRoute } from "../middlewares/authMiddleware.js";

const accountRouter = Router();

accountRouter.get("/", protectRoute, getAccounts);
accountRouter.post("/", protectRoute, addAccounts);
accountRouter.delete("/:id", protectRoute, deleteAccount);

export default accountRouter;

