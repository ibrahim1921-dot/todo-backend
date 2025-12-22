import mongoose from "mongoose";

export const connectDB = async () => {
    try{
        const MONGO_URI = process.env.MONGO_URI;
        if(!MONGO_URI) {
            throw new Error("MONGO_URI must be defined in environment variables");
        }
        await mongoose.connect(process.env.MONGO_URI)
        console.log("MongoDB connected successfully");
    } catch(error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
}