//getting the file from local storage and sending it to cloudinary

import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY, 
    api_secret : process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (localFilePath) =>{
    try{
        if(!localFilePath)return null
        
        //this returns an object which contains the whole data about the 
        //file such as its url,size,pixels,etc
        const res = await cloudinary.uploader.upload(localFilePath,{
            resource_type : "auto"
        })
        // console.log("file is successfully uploaded on the server with stats:",res)
        fs.unlinkSync(localFilePath)
        return res
    }
    catch(err){
        fs.unlinkSync(localFilePath)
        //file wasnt properly in the local storage remove it and reupload it on local storage
        return null
    }
}

export {uploadOnCloudinary}