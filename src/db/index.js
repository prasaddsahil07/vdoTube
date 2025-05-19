import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


export const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log("MONGODB connected successfully!!")
    } catch (error) {
        console.log("MONGODB connection error: ", error)
        process.exit(1)
    }
}