import connectDB from "./db/index.js";
import dotenv from "dotenv"

dotenv.config(
    {
        path : './.env'
    }
)

connectDB()










// import mongoose from 'mongoose';

// import express from 'express';
// import { DB_NAME } from './constants';

// const app = express();

// ;(async() => {
//     try{
//         await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        
//         app.on('error', (err) => {
//             console.log("Error connecting to MongoDB", err);
//         })

//         app.listen(process.env.PORT, () => {
//             console.log("Server is running on port", process.env.PORT);
//         } )
//     }
//     catch(err){
//         console.log(err)
//     }
// })()