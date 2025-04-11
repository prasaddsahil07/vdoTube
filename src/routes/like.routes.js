import { Router } from 'express';
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    checkIfVideoAlreadyLiked,
    checkIfCommentAlreadyLiked,    
} from "../controllers/like.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/videos").get(getLikedVideos);
router.route("/isLiked/v/:Id").get(checkIfVideoAlreadyLiked);
router.route("/isLiked/c/:Id").get(checkIfCommentAlreadyLiked);

export default router