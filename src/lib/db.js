import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
    if (isConnected) {
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.MONGODB_DB,
        });

        isConnected = conn.connections[0].readyState === 1;

        console.log("MongoDB Connected");
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
        throw new Error("Failed to connect to MongoDB");
    }
}
