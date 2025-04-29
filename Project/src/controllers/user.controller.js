import {asyncHandler} from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import {User} from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/apiResponse.js'
import jwt from 'jsonwebtoken'

const generateAccessAndRefreshTokens = async(userId) => {
    try{
        const user = await User.findById(userId)

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({
            validateBeforeSave : false
        })
        
        return {accessToken,refreshToken}
    }
    catch(err){
        console.log(err)
        throw new ApiError(500,"Something went wrong while generating refresh and access tokens")
    }
}

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

    const existedUser = await User.findOne({
        $or : [{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"User already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

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
        avatar : avatar?.url || " ",
        coverImage : coverImage ?.url || " ",
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

const loginUser = asyncHandler(async (req,res) => {
    //req body se --> data
    //username || email se login
    //find the user if it exists or not
    //if doesnt exists please register first
    //check password -> 1. checked (send access and refresh token) 2.not Checked (Error wrong password)
    //send cookies 
    //send response

    const {email,username,password} = req.body

    if(!username && !email){
        throw new ApiError(400,"Username or Email is required")
    }

    const user = await User.findOne({
         $or : [{username} , {email}]
    })

    if(!user){
        throw new ApiError(404,"User doesnt exist , Please consider registering first")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid Password")
    }
    
    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findOne(user._id).select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure : true
    }

    res.status(200)
    .cookie("refreshToken",refreshToken,options)
    .cookie("accessToken",accessToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user : loggedInUser , refreshToken , accessToken
            },
            "User logged In Succesfully"
        )
    )
})

const logoutUser = asyncHandler(async(req,res) => {
    //cookies reset
    //reset refreshToken in database

    await User.findByIdAndUpdate(req.user._id , 
        {
            $set : {
                refreshToken : undefined
            }
        }, 
        {
            new : true
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged Out Successfully"))

})

const refreshAccessToken = asyncHandler(async(req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized Request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401,"Invalid Refresh Token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(404,"Refresh Token is expired or used")
        }
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        const {accessToken,newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(200,
                {accessToken,refreshToken : newRefreshToken},
                "refreshToken refreshed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async(req,res) => {
    //user se old and new password lo
    const {oldPassword , newPassword} = req.body

    const user = await User.findById(req?.user._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid old Password")
    }

    user.password = newPassword
    await user.save({
        validateBeforeSave : false
    })

    return res.status(400)
    .json(
        new ApiResponse(200,{},"Password changed successfully")
    )
})

const getCurrentUser = asyncHandler(async(req,res) => {
    return res
    .status(200)
    .json(
        new ApiResponse(200,req.user,
        "Current User fetched successfully"
        )
    )
})

const updateAccountDetails = asyncHandler(async(req,res) => {
    const {email,fullName} = req.body

    if(!fullName || !email){
        throw new ApiError(400,"All fields are required")
    }

    const user = await User.findByIdAndUpdate(req?.user._id,
        {
            $set : {
                fullName,
                email
            }
        },
        {
            new : true
        }
    )
    .select("-password  -refreshToken")

    return res
    .status(200)
    .json(
        new ApiResponse(200,
            user,
            "Account details updated Successfully"
        )
    )

})

const updateUserAvatar = asyncHandler(async(req,res) =>{
    const {avatarLocalPath} = req?.file?.avatar[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Please upload avatar")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar){
        throw new ApiError(400,"Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
           $set:{
                    avatar : avatar.url
                }
        },
        {
            new : true
        }
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Avatar updated successfully")
    )
})

const updateUserCoverImage = asyncHandler(async(req,res) =>{
    const {coverImageLocalPath} = req?.file?.coverImage[0]?.path;

    if(!coverImageLocalPath){
        throw new ApiError(400,"Cover Image is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage){
        throw new ApiError(400,"Error while uploading on coverImage")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                coverImage : coverImage.url
            }
        },
        {
            new : true
        }
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"CoverImage updated successfully")
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
}