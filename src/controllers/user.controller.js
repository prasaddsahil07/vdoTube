import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from '../models/user.models.js'
import { deleteOldImageFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
// import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


//function fro generating access and refresh token(it'll be used several times so create a function)

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        //finding user from database by _id
        const user = await User.findById(userId)

        //generating Token
        const refreshToken = user.generateRefreshToken()
        const accessToken = user.generateAccessToken()

        //saving refreshToken into the database(access token is not added to database)
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })  //automatically mongoose model(password) kick in so we pass validateBeforeSave to avoid this

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")

    }
}


//registering User

const registerUser = asyncHandler(async(req, res) => {

    //getting user data from req
    const { fullName, email, username, password } = req.body  // form-data, json-data is accessed from req.body


    //validating if any filed is empty
    if (
        [fullName, email, username, password].some((field) =>
            field?.trim() === "")
    ) {
        return res.status(400).json({ msg: "All fields are required" })
    }


    //checking if user already exits
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        return res.status(409).json({ msg: "user already exits" })
    }


    //geting files from multer middleware
    const avatarLocalPath = req.files?.avatar[0]?.path   // req.files is provided by multer
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }



    // checking if avatar file is uploaded
    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar file is required')
    }


    //upload images to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)        // if localpath is missing in avatar then cloudinary automatically returns empty string
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)    // if localpath is missing in coverImage then cloudinary automatically returns empty string

    //checking if avatar field successfully uploaded
    if (!avatar) {
        throw new ApiError(400, 'Avatar file is required')
    }


    //creating new user in the database
    const user = await User.create({
        fullName,
        avatar: avatar.url,   // avatar contains many things but we want url only, it can't be empty since required field
        coverImage: coverImage?.url || "",       //it can be empty since it's not required field
        email,
        username: username.toLowerCase(),
        password
    })


    //checking if user created successfully
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"   // don't pass password and refreshToken from response
    )

    //this will return user data if user is founded if not then
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }


    //if user created successfully 
    return res.status(201).json({data: createdUser, msg:"User Registered Successfully"});

})

//login user
const loginUser = asyncHandler(async (req, res) => {

    //getting user login data from request body
    const { email, username, password } = req.body

    //checking if user not entered email and username both
    if (!email && !username) {
        return res.status(400).json({ msg: "username or email is required" })

    }

    //finding user by email or username whichever available 
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    //checking if we found user in database
    if (!user) {
        return res.status(404).json({ msg: "user does not exist!" })
    }

    //if user found then verify its password with hashed password 
    //important note: methods which are created by you like generate token etc
    // you have to use {user} that you found from the database not the schema one
    const isPasswordValid = await user.isPasswordCorrect(password)      // user is not model(User), it has all methods 

    if (!isPasswordValid) {
        return res.status(401).json({ msg: "Invalid user credentials!" })
    }

    //generating refresh and access Token
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    // finding user again so we can get updated one after adding tokens
    //removing passoword and refresh token from it because frontend don't need it
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    //sending cookies 
    const options = {
        httpOnly: true,
        secure: true    // only modifiable from server not from frontend
    }


    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({msg:"User Logged in Successfully"});

})

//logout User

const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $unset: {
            refreshToken: 1
        }
    }, {
        new: true       // mongoDB response will be new one updated
    })


    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json({msg:"user loggedout successfully"});
})

//refresh token
const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken      // for mobile apps, no cookies

        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized request")
        }

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh Token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "refresh token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)        // object
            .cookie("refreshToken", newRefreshToken, options)       // object
            .json({msg: "Access token refreshed", newRefreshToken, accessToken});
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})


//updating user details:

//changing user password
const changeCurrentUserPassword = asyncHandler(async (req, res) => {
    const user = req.user
    const { oldPassword, newPassword } = req.body

    if (!oldPassword && !newPassword) {
        return res.status(401).json({ msg: "All fields are required" })
    }

    const ispassowordCorrect = await user.isPasswordCorrect(oldPassword)     // this method is written in user model

    if (!ispassowordCorrect) {
        return res.status(400).json({ msg: "Invalid old Password" })
    }

    user.password = newPassword     // it's already encrypteed in isPasswordCorrect
    await user.save({ validateBeforeSave: false })

    res.status(200).json({msg: 'Password changed successfully'});
})


//getting current user
const getCurrentUser = asyncHandler(async (req, res) => {   // we've already injected loggedIn user to request in auth middleware
    return res.status(200).json({msg: "current user fetched Successfully"});
})


//updating user details like fullName and email
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body

    if (!fullName && !email) {
        throw new ApiError(401, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                fullName, email
            }
        },
        { new: true }).select("-password")

    return res
        .status(200)
        .json({msg: "Account Details Updated Successfully!!"});
})


//update user avatar
const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.files?.avatar[0].path   // we inject req.files in multer middleware

    if (!avatarLocalPath) {
        return res.status(400).json({ msg: "avatar file is missing" })
    }

    const NewAvatar = await uploadOnCloudinary(avatarLocalPath)     // NewAvatar is object here 

    if (!NewAvatar.url) {
        throw new ApiError(400, "Error while uploading avatar")
    }

    //deleting old avatar image form cloudinary
    await deleteOldImageFromCloudinary(req.user?.avatar)

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                avatar: NewAvatar.url
            }
        }, { new: true }
    ).select("-password")

    if (!user) {
        throw new ApiError(402, "Failed to update user avatar")
    }

    return res.status(200).json({msg: "Avatar image updated successfully"});
})

//update user cover image
const updateUserCoverImg = asyncHandler(async (req, res) => {
    const coverImgLocalPath = req.files?.coverImage[0].path

    if (!coverImgLocalPath) {
        throw new ApiError(400, "coverImage file is missing")
    }

    //uploading cover image on cloudinary
    const coverImg = await uploadOnCloudinary(coverImgLocalPath)

    if (!coverImg.url) {
        throw new ApiError(400, "Error while uploading cover image")

    }

    //deleting old coverImage form cloudinary
    await deleteOldImageFromCloudinary(req.user?.coverImage)

    //fetching user from database and then updating new coverImage
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                coverImage: coverImg.url
            }
        }, { new: true }).select("-password")



    return res.status(200).json({msg: "cover image updated successfully"});
})



//mongoDB aggregate pipelines **Important

//get user channel profile
const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params     // not req body but req url(params)

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([      // aggregate takes an array and returns an array
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",      // mongoDB saves models in lowercase and plural form
                localField: "_id",
                foreignField: "channel",       
                as: "subscribers"             // to check for how many subscribers do I have
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",     
                as: "subscribedTo"           // to check for how many channels have I subscribed
            }
        },
        {
            $addFields: {                  // add fields to our "User" model
                subscribersCount: {
                    $size: "$subscribers"       // total no. of documents who have subscribed to us, since subscribers is a field now so we use '$' with that
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"      // total no. of documents whom I have subscribed, since subscribedTo is a field now so we use '$' with that
                },
                isSubscribed: {     // to check whether a channel is subscribed or not
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {       // "$project" gives selected values to the document join(to reduce network conjestion)
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])

    if (!channel?.length) {     // if channel is empty(by chance)
        throw new ApiError(404, "channel does not exists")
    }

    return res
        .status(200)
        .json(
            {msg:"User channel fetched successfully", data: channel[0]} //we have obly one document in channel so it should be first index of array, "channel" 
        )
})


//getting user watch history

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {       // match based on user id
                _id: req.user._id   // todo
            }
        }, {
            $lookup: {
                from: "videos",             // inside Users document(schema)
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [            // nested aggregation pipeline for owner of the videos added in watch history
                    {
                        $lookup: {
                            from: "users",                   // inside Videos document(schema)
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {                // over writing the existing value of owner
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200).json({data: user[0].watchHistory,msg: "user watch history fetch successfully"});
})

const getUserById = asyncHandler(async (req, res) => {
    const { userId } = req.params

    const user = await User.findById(userId)
    if (!user) {
        return res.status(404).json({ msg: 'No User found' })
    }

    return res.status(200).json(user)
})

export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changeCurrentUserPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImg,
    getUserChannelProfile,
    getWatchHistory, 
    getUserById
}