import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    user : {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    content : {type: String, required: true},
    mediaUrl : {type: String},
    mediaType : {type: String, enum: ["image", "video"]},
    platforms : {type: String, enum: ["instagram", "linkedin", "twitter", "facebook" ,"facebook_page", "linkedin_page", "instagram_business"], required: true},
    scheduledFor : {type: Date, required: true},
    status : {type: String, enum: ["scheduled", "draft", "published" , "failed"], default: "scheduled"},
}, {
    timestamps: true
});

export const Post = mongoose.model("Post", postSchema);