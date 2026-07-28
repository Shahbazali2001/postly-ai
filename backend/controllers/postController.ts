import { Request, Response } from "express";
import { AuthRequest } from "../interfaces/AuthRequest.js";
import { Post } from "../models/Post.js";
import { Generation } from "../models/Generation.js";
import { GoogleGenAI } from "@google/genai";
import { cloudinaryUpload } from "../config/cloudinaryConfig.js";




// Generate Post
// POST /api/post/generate
// Private
export const generatePost = async (req: AuthRequest, res: Response) : Promise<void> => {
    try {
        const {prompt, tone, generateImage } = req.body;
        const apiKey = process.env.GEMINI_API_KEY_CNT;
        if(!apiKey){
            res.status(400).json({message: "Gemini API Key not found"});
            return;
        }

        {/* GenAi instance */}
        const ai = new GoogleGenAI({
            apiKey : apiKey
        });

        // Generate Text Content
        const textResponse = await ai.models.generateContent({
            model : "gemini-2.5-flash",
            contents : `Generate a social media post based on this prompt: "${prompt}". The tone should be:  ${tone}. Also generate and include relevant hashtags. Format the response as JSON with "content" and "imagePrompt" fields. The imagePrompt field should be a highly descriptive for an image generator that complements the post.`,
        })

        const rawText = textResponse.text ?? "";
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);

        if(!jsonMatch){
            res.status(400).json({message: "Failed to generate post"});
            return;
        }

        let content = "";
        let imagePrompt = "";

        try {
            const jsonData = JSON.parse(jsonMatch[0]);
            content = jsonData.content ?? "";
            imagePrompt = jsonData.imagePrompt ?? "";

        } catch (error) {
            console.error("Error parsing JSON:", error);
            res.status(400).json({ message: "Failed to parse Gemini response" });
        }

        if(!content || !imagePrompt){
            res.status(400).json({message: "Failed to generate post"});
            return;
        }

        // Generate Image
        const imageInteraction = await ai.interactions.create({
            model: "gemini-3.1-flash-image",
            input: imagePrompt,

        });

        const imageResponse = imageInteraction.output_image;
        if (!imageResponse || typeof imageResponse.data !== "string") {
            res.status(400).json({ message: "Failed to generate image" });
            return;
        }

        const image = `data:image/png;base64,${imageResponse.data}`;

        // Auto-detect type from base64 prefix
        const fileType: "image" | "video" = image.startsWith("data:video") ? "video" : "image";

        // Handle Cloudinary Upload
        const mediaUrl = await cloudinaryUpload(image, fileType);

        // Save to DB
        const generation = await Generation.create({
            user: req.user._id,
            prompt,
            content,
            mediaUrl,
            mediaType: fileType,
            tone,
        });



        res.status(200).json({message: "Post generated successfully", generation});


    } catch (error) {
        console.error("Error generating post:", error);
        res.status(500).json({message: "Failed to generate post"});
    }
}



// Get Generations
// GET /api/post/generations
// Private
export const getGenerations = async (req: AuthRequest, res: Response) : Promise<void> => {
    try {
        const user = req.user._id;
        const generations = await Generation.find({ user }).sort({ createdAt: -1 });
        res.status(200).json(generations);
    } catch (error: unknown) {
        res.status(500).json({
            message: error instanceof Error ? error.message : "Server Error"
        });
    }
}



// Get Post
// GET /api/posts
// Private
export const getPosts = async (req: AuthRequest, res: Response) : Promise<void> => {
    try {
        const user = req.user._id;
        const posts = await Post.find({ user });
        res.status(200).json(posts);

    } catch (error: unknown) {
        res.status(500).json({
            message: error instanceof Error ? error.message : "Server Error"
        });
    }
}



// Schedule Post
// POST /api/posts
// Private
export const schedulePosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content, platforms, scheduledFor, status, mediaUrl: bodyMediaUrl, mediaType: bodyMediaType } = req.body;

    // Parse platforms if passed as JSON string
    let parsedPlatforms = platforms;
    if (typeof platforms === "string") {
      try {
        parsedPlatforms = JSON.parse(platforms);
      } catch (error) {
        res.status(400).json({ message: "Failed to parse platforms" });
      }
    }

    let mediaUrl: string | undefined = bodyMediaUrl;
    let mediaType: "image" | "video" | undefined = bodyMediaType;

    // Case 1: Handle file upload via req.file
        if ((req as any).file) {
            const file = (req as any).file;
            const isVideo = file.mimetype.startsWith("video");
            mediaType = isVideo ? "video" : "image";

            mediaUrl = await cloudinaryUpload(file.path, mediaType);
        }

    // Case 2: Handle already-hosted URL from req.body
    // If no req.file, we just use mediaUrl/mediaType from body

    const post = await Post.create({
      user: req.user._id,
      content,
      platforms: parsedPlatforms,
      scheduledFor,
      status,
      mediaUrl,
      mediaType,
    });

    res.status(200).json(post);
  } catch (error: unknown) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Server Error",
    });
  }
};