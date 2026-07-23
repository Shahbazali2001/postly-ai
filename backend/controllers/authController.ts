import { Request, Response } from "express";
import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";



// Register User & Generate JWT
// POST /api/auth/register
// Public

//Generate JWT
const generateToken = (id: string)=>{
    return jwt.sign({ id }, process.env.JWT_SECRET!, {
        expiresIn: "30d",
    })

}

// Register User
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;
        // If user already exists
        const userExists = await User.findOne({ email });
        if(userExists){
            res.status(400).json({
                message: "User already exists"
            })
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        if(user){
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id.toString()),
            })
        }else{
            res.status(400).json({
                message: "Invalid user data"
            })
        }
    } catch (error : any) {
        console.error(error);
        res.status(500).json({
            message: error.message || "Server Error"
        })
    }
}

// Login User
// POST /api/auth/login
// Public

export const loginUser = async(req: Request, res: Response): Promise<void> => {

    try{
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });

        if(!user){
            res.status(400).json({
                message: "User not found"
            })
            return;
        }

        // Check if password is correct
        const isMatch = await bcrypt.compare(password, user.password);

        if(user && isMatch){
            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id.toString()),
            })
        }else{
            res.status(401).json({
                message: "Invalid credentials"
            })
        }

    }catch(error : any){
        console.error(error);
        res.status(500).json({
            message: error.message || "Server Error"
        })
    }


}








// Logout User
// POST /api/auth/logout
// Private

