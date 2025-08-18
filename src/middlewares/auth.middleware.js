import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {

        // console.log("Verifying jwt: ", req.cookies?.accessToken);
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")   // request has cookie ka access     header is for mobile application

        if (!token) {
            throw new ApiError(401, "unauthorized Request")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }

        req.user = user     // here we are adding this "user" object to the request and assigning it the verified user and this will be helpful in LogOut controller because we can take this req.user and logit.

        next()
    } catch (error) {
        console.log("jwt error hai bhai");
        throw new ApiError(401, error.message || "something went wrong while verifing token")

    }

})

export const verifyJwtForUpdatingUserDetails = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            throw new ApiError(401, "unauthorized Request")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-refreshToken")

        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }

        req.user = user

        next()
    } catch (error) {
        throw new ApiError(401, error.message || "something went wrong while verifing token")

    }

})