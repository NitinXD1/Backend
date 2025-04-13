import connectDB from "./db/index.js";
import dotenv from "dotenv"
import { app } from "./app.js";

dotenv.config(
    {
        path : './.env'
    }
)

connectDB()
.then(() => {
        app.on('error',(err) => {
            console.log("Connecting the database has some errors",err);
        })

        app.listen(process.env.PORT || 8000,() => {
            console.log(`server is listening on PORT :- ${process.env.PORT}`);
        })
    }
)
.catch((err)=>{
    console.log("MongoDB connection failed : ",err);
})










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