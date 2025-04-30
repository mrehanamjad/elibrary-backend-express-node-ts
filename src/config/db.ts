import mongoose from "mongoose";
import { config } from "./config";

const connectDB = async () => {
    try {
        mongoose.connection.on("connected",()=>{
            console.log("connected to database successfully!")
        })

        mongoose.connection.on('error',(err)=>{
            console.log("error connecting to database : ",err)
        })

        // first write these handler 👆 so that handlers can regestered
        // then connect to database 👇

        await mongoose.connect(config.databaseUrl);

    } catch (error) {
        console.log("failed to connect to database : ", error)
        process.exit(1);
    }
};


export default connectDB;
