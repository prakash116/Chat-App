import mongoose from 'mongoose'
export const connentDB = async() => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL);
        console.log(`MongoDB connectd: ${conn.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection error: " + error);
    }
}