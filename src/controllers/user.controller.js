import { ApiError } from "../utils/apiError.js";
import { User } from '../models/user.models.js'
import { deleteOldImageFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"

//function for generating access and refresh token(it'll be used several times so create a function)
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
const registerUser = async (req, res) => {
    try {
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

        //getting files from multer middleware
        const avatarLocalPath = req.files?.avatar[0]?.path   // req.files is provided by multer
        let coverImageLocalPath;
        if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
            coverImageLocalPath = req.files.coverImage[0].path
        }

        // checking if avatar file is uploaded
        if (!avatarLocalPath) {
            return res.status(400).json({ msg: 'Avatar file is required' })
        }

        //upload images to cloudinary
        const avatar = await uploadOnCloudinary(avatarLocalPath)        // if localpath is missing in avatar then cloudinary automatically returns empty string

        // console.log("Avatar uploaded:", avatar);

        const coverImage = await uploadOnCloudinary(coverImageLocalPath)    // if localpath is missing in coverImage then cloudinary automatically returns empty string

        //checking if avatar field successfully uploaded
        if (!avatar) {
            return res.status(400).json({ msg: 'Avatar file is required' })
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
            return res.status(500).json({ msg: "Something went wrong while registering the user" })
        }

        //if user created successfully 
        return res.status(201).json({ data: createdUser, msg: "User Registered Successfully" });

    } catch (error) {
        console.error("Registration error:", error.message);
        return res.status(500).json({ msg: error.message || "Internal server error" });
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        // Ensure at least one identifier is provided
        if (!email && !username) {
            return res.status(400).json({ msg: "Username or email is required" });
        }

        // Find user by email or username
        const user = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (!user) {
            return res.status(404).json({ msg: "User does not exist!" });
        }

        // Verify password
        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            return res.status(401).json({ msg: "Invalid user credentials!" });
        }

        // Generate tokens
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        // Fetch user without sensitive fields
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        // Set secure HTTP-only cookies (set to true if the frontend is not storing tokens in localStorage)
        const options = {
            httpOnly: false,
            secure: false
        };


        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
                msg: "User logged in successfully",
                user: loggedInUser
            });

    } catch (error) {
        console.error("Login error:", error.message);
        return res.status(500).json({ msg: "Internal server error" });
    }
}

//logout User
const logOutUser = async (req, res) => {
    try {
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
            .json({ msg: "user loggedout successfully" });

    } catch (error) {
        console.error("Logout error:", error.message);
        return res.status(500).json({ msg: "Internal server error" });
    }
}

//refresh token
const refreshAccessToken = async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken      // for mobile apps, no cookies

        if (!incomingRefreshToken) {
            return res.status(401).json({ msg: "Unauthorized request" })
        }

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            return res.status(401).json({ msg: "Invalid refresh Token" })
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            return res.status(401).json({ msg: "refresh token is expired or used" })
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)        // object
            .cookie("refreshToken", newRefreshToken, options)       // object
            .json({ msg: "Access token refreshed", newRefreshToken, accessToken });

    } catch (error) {
        console.error("Refresh token error:", error.message);
        return res.status(401).json({ msg: error?.message || "Invalid refresh token" });
    }
}

//updating user details:

//changing user password
const changeCurrentUserPassword = async (req, res) => {
    try {
        const user = req.user
        const { oldPassword, newPassword } = req.body

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ msg: "All fields are required" })
        }

        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)     // this method is written in user model

        if (!isPasswordCorrect) {
            return res.status(400).json({ msg: "Invalid old Password" })
        }

        user.password = newPassword     // it's already encrypted in pre-save hook
        await user.save({ validateBeforeSave: false })

        res.status(200).json({ msg: 'Password changed successfully' });

    } catch (error) {
        console.error("Password change error:", error.message);
        return res.status(500).json({ msg: "Internal server error" });
    }
}

//getting current user
const getCurrentUser = async (req, res) => {   // we've already injected loggedIn user to request in auth middleware
    try {
        return res.status(200).json({ 
            msg: "current user fetched Successfully", 
            data: req.user 
        });
    } catch (error) {
        console.error("Get current user error:", error.message);
        return res.status(500).json({ msg: "Internal server error" });
    }
}

//updating user details like fullName and email
const updateAccountDetails = async (req, res) => {
    try {
        const { fullName, email } = req.body

        if (!fullName || !email) {
            return res.status(400).json({ msg: "All fields are required" })
        }

        const user = await User.findByIdAndUpdate(req.user?._id,
            {
                $set: {
                    fullName, email
                }
            },
            { new: true }).select("-password")

        if (!user) {
            return res.status(404).json({ msg: "User not found" })
        }

        return res
            .status(200)
            .json({ msg: "Account Details Updated Successfully!!", data: user });

    } catch (error) {
        console.error("Update account details error:", error.message);
        return res.status(500).json({ msg: "Internal server error" });
    }
}

//update user avatar
const updateUserAvatar = async (req, res) => {
    try {
        const avatarLocalPath = req.files?.avatar[0]?.path   // we inject req.files in multer middleware

        if (!avatarLocalPath) {
            return res.status(400).json({ msg: "avatar file is missing" })
        }

        const newAvatar = await uploadOnCloudinary(avatarLocalPath)     // newAvatar is object here 

        if (!newAvatar?.url) {
            return res.status(400).json({ msg: "Error while uploading avatar" })
        }

        //deleting old avatar image from cloudinary
        if (req.user?.avatar) {
            await deleteOldImageFromCloudinary(req.user.avatar)
        }

        const user = await User.findByIdAndUpdate(req.user?._id,
            {
                $set: {
                    avatar: newAvatar.url
                }
            }, { new: true }
        ).select("-password")

        if (!user) {
            return res.status(400).json({ msg: "Failed to update user avatar" })
        }

        return res.status(200).json({ msg: "Avatar image updated successfully", data: user });

    } catch (error) {
        console.error("Update avatar error:", error.message);
        return res.status(500).json({ msg: "Internal server error" });
    }
}

//update user cover image
const updateUserCoverImg = async (req, res) => {
    try {
        const coverImgLocalPath = req.files?.coverImage[0]?.path

        if (!coverImgLocalPath) {
            return res.status(400).json({ msg: "coverImage file is missing" })
        }

        //uploading cover image on cloudinary
        const coverImg = await uploadOnCloudinary(coverImgLocalPath)

        if (!coverImg?.url) {
            return res.status(400).json({ msg: "Error while uploading cover image" })
        }

        //deleting old coverImage from cloudinary
        if (req.user?.coverImage) {
            await deleteOldImageFromCloudinary(req.user.coverImage)
        }

        //fetching user from database and then updating new coverImage
        const user = await User.findByIdAndUpdate(req.user?._id,
            {
                $set: {
                    coverImage: coverImg.url
                }
            }, { new: true }).select("-password")

        if (!user) {
            return res.status(400).json({ msg: "Failed to update cover image" })
        }

        return res.status(200).json({ msg: "cover image updated successfully", data: user });

    } catch (error) {
        console.error("Update cover image error:", error.message);
        return res.status(500).json({ msg: "Internal server error" });
    }
}

//mongoDB aggregate pipelines **Important

//get user channel profile
const getUserChannelProfile = async (req, res) => {
    try {
        const { username } = req.params     // not req body but req url(params)

        if (!username?.trim()) {
            return res.status(400).json({ msg: "username is missing" })
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
                $project: {       // "$project" gives selected values to the document join(to reduce network congestion)
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
            return res.status(404).json({ msg: "channel does not exists" })
        }

        return res
            .status(200)
            .json({
                msg: "User channel fetched successfully",
                data: channel[0]
            }) //we have only one document in channel so it should be first index of array

    } catch (error) {
        console.error("Get user channel profile error:", error.message);
        return res.status(500).json({ msg: "Internal server error" });
    }
}

//getting user watch history
const getWatchHistory = async (req, res) => {
    try {
        const user = await User.aggregate([
            {
                $match: {       // match based on user id
                    _id: req.user._id
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

        return res.status(200).json({
            data: user[0]?.watchHistory || [],
            msg: "user watch history fetch successfully"
        });

    } catch (error) {
        console.error("Get watch history error:", error.message);
        return res.status(500).json({ msg: "Internal server error" });
    }
}

const getUserById = async (req, res) => {
    try {
        const { userId } = req.params

        console.log("User: ", userId)

        const user = await User.findById(userId).select("-password -refreshToken")
        if (!user) {
            return res.status(404).json({ msg: 'No User found' })
        }

        return res.status(200).json({ data: user, msg: "User fetched successfully" })

    } catch (error) {
        console.error("Get user by ID error:", error.message);
        return res.status(500).json({ msg: "Internal server error" });
    }
}

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