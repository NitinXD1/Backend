import {asyncHandler} from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import {User} from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/apiResponse.js'

const registerUser = asyncHandler( async (req,res) =>{
    // get user details from frontend
    // validations - notempty
    // check if user already exists :username / email
    // files present or not : avatar is required
    // upload to cloudinary , avatar check
    // create user Object - create Entry in Db
    // remove password and refresh token from response
    // check for user creation
    // return response
    
    
    const {fullName , email , username , password} = req.body
    console.log("email" , email)

    // if(fullName === ""){
    //     throw new ApiError(400,"fullName is required and necessary")
    // }
    //this can also be done but a better way to do this is

    if(
        [fullName,email,username,password].some(
            (field) => (
                field?.trim() === "" 
            )
        )
    ){
        throw new ApiError(400,"All fields are required")
    }

    const existedUser = User.findOne({
        $or : [{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"User already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar is required")
    }

    const user = await User.create({
        fullName,
        username : username.toLowerCase(),
        avatar : avatar,
        coverImage : coverImage ?. coverImage.url || " ",
        email,
        password,
    })
    
    //checking if changes are reflected or not
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    //can do this but we are using a util that maintains our structure
    // return res.status(201).json({createdUser})

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered Successfully")
    )
    
} )

export {
    registerUser,
}