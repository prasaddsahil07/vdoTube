import { Router } from 'express';
import {
    getLikedVideos,
    getLikedTweets,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
    checkIfVideoAlreadyLiked,
    checkIfCommentAlreadyLiked,   
    checkIfTweetAlreadyLiked 
} from "../controllers/like.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT);

router.post("/toggle/v/:videoId", toggleVideoLike);
router.post("/toggle/c/:commentId", toggleCommentLike);
router.post("/toggle/t/:tweetId", toggleTweetLike);
router.get("/tweets", getLikedTweets);
router.get("/videos", getLikedVideos);
router.get("/isLiked/v/:Id", checkIfVideoAlreadyLiked);
router.get("/isLiked/c/:Id", checkIfCommentAlreadyLiked);
router.get("/isLiked/t/:Id", checkIfTweetAlreadyLiked);

export default router