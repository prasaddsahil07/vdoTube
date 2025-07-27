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

const router = Router();

router.post("/register", 
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,

        }, {
            name: "coverImage",
            maxCount: 1,
        }
    ]),
    registerUser);


router.post("/login", loginUser);

//secured Routes
router.post("/logout", verifyJWT, logOutUser);
router.post("/refreshToken", refreshAccessToken);
router.post("/changePassword", verifyJwtForUpdatingUserDetails, changeCurrentUserPassword);
router.get("/getUser", verifyJWT, getCurrentUser);
router.get("/getUserById/:userId", verifyJWT, getUserById);


router.patch("/updateDetails", verifyJWT, updateAccountDetails);

router.patch("/updateAvatar", verifyJWT,
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,

        }
    ]), updateUserAvatar);

router.patch("/updateCoverImage", verifyJWT,
    upload.fields([
        {
            name: "coverImage",
            maxCount: 1,

        }
    ]), updateUserCoverImg);

router.get("/history", verifyJWT, getWatchHistory);
router.get("/c/:username", verifyJWT, getUserChannelProfile);

export default router;