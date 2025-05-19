import { Router } from 'express'
import {
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
} from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js'
import { verifyJWT, verifyJwtForUpdatingUserDetails } from '../middlewares/auth.middleware.js';

const router = Router()

// router.route("/register").post(
//     upload.fields([
//         {
//             name: "avatar",
//             maxCount: 1,

//         }, {
//             name: "coverImage",
//             maxCount: 1,
//         }
//     ]),
//     registerUser)


// router.route("/login").post(loginUser)

//secured Routes
router.route("/logout").post(verifyJWT, logOutUser)
router.route("/refreshToken").post(refreshAccessToken)
router.route("/changePassword").post(verifyJwtForUpdatingUserDetails, changeCurrentUserPassword)
router.route("/getUser").get(verifyJWT, getCurrentUser)
router.route("/getUserById/:userId").get(verifyJWT, getUserById)


router.route("/updateDetails").patch(verifyJWT, updateAccountDetails)

router.route("/updateAvatar").patch(verifyJWT,
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,

        }
    ]), updateUserAvatar)

router.route("/updateCoverImage").patch(verifyJWT,
    upload.fields([
        {
            name: "coverImage",
            maxCount: 1,

        }
    ]), updateUserCoverImg)

router.route("/history").get(verifyJWT, getWatchHistory)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)

export default router;