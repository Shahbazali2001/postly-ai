import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export interface AuthRequest extends Request {
    user?: any;
}

export const protectRoute = async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try{
            token = req.headers.authorization.split(" ")[1];
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
            req.user = await User.findById(decoded.id).select("-password");
            next();

        }catch(err : any){
            console.error(err)
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    }else{
        res.status(401).json({ message: "Not authorized, no token" });
    }
}