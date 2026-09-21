import { Response } from "express";
import { AuthRequest } from "../interfaces/AuthRequest.js";
import { Post } from "../models/Post.js";
import { Generation } from "../models/Generation.js";
import { GoogleGenAI } from "@google/genai";
import { cloudinaryUpload } from "../config/cloudinaryConfig.js";

// Generate Post with Gemini AI and optional Imagen
// POST /api/posts/generate
// Private
export const generatePost = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { prompt, tone = "Professional", generateImage = true } = req.body;

    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      res
        .status(400)
        .json({ message: "Please provide a prompt for post generation" });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY_CNT || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res
        .status(500)
        .json({ message: "Gemini API key is not configured on the server" });
      return;
    }

    // GenAI instance
    const ai = new GoogleGenAI({ apiKey });

    // Generate Text Content
    const promptInstruction = `You are an expert social media strategist and copywriter.
Generate a high-converting, engaging social media post based on this request: "${prompt}".
Tone of voice: ${tone}.
Include 3-5 trending and relevant hashtags at the end.
Also generate a detailed, cinematic visual prompt for an image generator that perfectly matches the post.

Return ONLY a valid JSON object in this exact schema without any markdown formatting or code blocks:
{
  "content": "the complete social media post text with hashtags",
  "imagePrompt": "a descriptive, detailed prompt for generating an illustrative image"
}`;

    const textResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptInstruction,
    });

    const rawText = textResponse.text ?? "";
    let content = "";
    let imagePrompt = "";

    // Parse JSON safely
    try {
      const cleaned = rawText
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/gi, "")
        .trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        content = parsed.content || "";
        imagePrompt = parsed.imagePrompt || "";
      } else {
        content = cleaned;
        imagePrompt = prompt;
      }
    } catch (parseErr) {
      console.warn(
        "Could not parse JSON from Gemini, using raw text:",
        parseErr,
      );
      content = rawText.trim();
      imagePrompt = prompt;
    }

    if (!content) {
      res.status(500).json({ message: "Failed to generate content from AI" });
      return;
    }

    let mediaUrl = "";
    let mediaType: "image" | "video" | undefined = undefined;

    // Generate Image if requested
    if (generateImage && imagePrompt) {
      try {
        const imageResult = await ai.models.generateImages({
          model: "imagen-3.0-generate-002",
          prompt: imagePrompt,
          config: {
            numberOfImages: 1,
            outputMimeType: "image/jpeg",
          },
        });

        const base64Data = imageResult.generatedImages?.[0]?.image?.imageBytes;
        if (base64Data) {
          const dataUri = `data:image/jpeg;base64,${base64Data}`;
          mediaUrl = await cloudinaryUpload(dataUri, "image");
          mediaType = "image";
        }
      } catch (imageErr: any) {
        console.warn(
          "Imagen generation failed or not available, proceeding without image:",
          imageErr?.message || imageErr,
        );
      }
    }

    // Save to Generation history
    const generation = await Generation.create({
      user: req.user._id,
      prompt,
      content,
      mediaUrl: mediaUrl || undefined,
      mediaType: mediaType || undefined,
      tone,
    });

    res.status(200).json({
      message: "Post generated successfully",
      generation,
    });
  } catch (error: any) {
    console.error("Error generating post:", error?.message || error);
    res
      .status(500)
      .json({ message: error?.message || "Failed to generate post" });
  }
};

// Get Generations
// GET /api/posts/generations
// Private
export const getGenerations = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user._id;
    const generations = await Generation.find({ user }).sort({ createdAt: -1 });
    res.status(200).json(generations);
  } catch (error: unknown) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Server Error",
    });
  }
};

// Get Posts
// GET /api/posts
// Private
export const getPosts = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user._id;
    const posts = await Post.find({ user }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error: unknown) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Server Error",
    });
  }
};

// Schedule / Create Post
// POST /api/posts
// Private
export const schedulePosts = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const {
      content,
      platforms,
      scheduledFor,
      status = "scheduled",
      mediaUrl: bodyMediaUrl,
      mediaType: bodyMediaType,
    } = req.body;

    if (!content || !platforms) {
      res.status(400).json({ message: "Content and platforms are required" });
      return;
    }

    // Parse platforms if passed as string or JSON
    let parsedPlatforms: string[] = [];
    if (Array.isArray(platforms)) {
      parsedPlatforms = platforms;
    } else if (typeof platforms === "string") {
      try {
        const json = JSON.parse(platforms);
        parsedPlatforms = Array.isArray(json) ? json : [json];
      } catch {
        parsedPlatforms = platforms
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean);
      }
    }

    if (parsedPlatforms.length === 0) {
      res
        .status(400)
        .json({ message: "At least one platform must be selected" });
      return;
    }

    let mediaUrl: string | undefined = bodyMediaUrl;
    let mediaType: "image" | "video" | undefined = bodyMediaType;

    // Handle file upload via req.file (Multer)
    if ((req as any).file) {
      const file = (req as any).file;
      const isVideo = file.mimetype?.startsWith("video");
      mediaType = isVideo ? "video" : "image";

      mediaUrl = await cloudinaryUpload(file.path, mediaType);
    }

    const scheduledDate = scheduledFor ? new Date(scheduledFor) : new Date();

    const post = await Post.create({
      user: req.user._id,
      content,
      platforms: parsedPlatforms,
      scheduledFor: scheduledDate,
      status,
      mediaUrl,
      mediaType,
    });

    res.status(201).json(post);
  } catch (error: unknown) {
    console.error("Error creating/scheduling post:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Server Error",
    });
  }
};

// Delete Post
// DELETE /api/posts/:id
// Private
export const deletePost = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const _id = req.params.id;
    const user = req.user._id;

    const post = await Post.findOneAndDelete({ _id, user });
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    res.status(200).json({ message: "Post deleted successfully", post });
  } catch (error: unknown) {
    console.error("Error deleting post:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Server Error",
    });
  }
};
