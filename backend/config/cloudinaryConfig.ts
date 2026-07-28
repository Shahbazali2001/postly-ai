import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const cloudinaryUpload = async (
  file: string,
  type: "image" | "video" = "image" // default to image
): Promise<string> => {
  try {
    const result = await cloudinary.v2.uploader.upload(file, {
      folder: "generated-posts",
      resource_type: type, // 👈 tells Cloudinary what to expect
    });

    return result.secure_url; // permanent hosted URL
  } catch (error: any) {
    console.error("Cloudinary upload failed:", error);
    throw new Error("Upload failed");
  }
};