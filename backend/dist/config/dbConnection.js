import mongoose from "mongoose";
const connectDB = async () => {
    try {
        const uri = process.env.MONGO_DB_URI || "";
        if (!uri) {
            console.warn("⚠️ MONGO_DB_URI is not defined in environment variables");
            return;
        }
        mongoose.connection.on("connected", () => {
            console.log("✅ MongoDB Database Connected Successfully");
        });
        mongoose.connection.on("error", (err) => {
            console.error("❌ MongoDB Connection Error:", err.message || err);
        });
        mongoose.connection.on("disconnected", () => {
            console.warn("⚠️ MongoDB Disconnected");
        });
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        });
    }
    catch (error) {
        console.error("❌ Database connection error:", error?.message || error);
        console.warn("Note: If using MongoDB Atlas, ensure your current IP address is whitelisted in MongoDB Atlas Network Access.");
    }
};
export default connectDB;
