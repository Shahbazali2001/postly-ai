import { Request, Response } from "express";
import { AuthRequest } from "../interfaces/AuthRequest.js";
import { Post } from "../models/Post.js";
import { Generation } from "../models/Generation.js";

// Generate Post
// POST /api/post/generate
// Private
export const generatePost = async (req: AuthRequest, res: Response) : Promise<void> => {

}



// Get Generations
// GET /api/post/generations
// Private
export const getGenerations = async (req: AuthRequest, res: Response) : Promise<void> => {

}



// Get Post
// GET /api/posts
// Private
export const getPosts = async (req: AuthRequest, res: Response) : Promise<void> => {

}



// Schedule Post
// POST /api/posts
// Private
export const schedulePosts = async (req: AuthRequest, res: Response) : Promise<void> => {

}