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
router.use(verifyJWT);

router.post("/toggle/v/:videoId", toggleVideoLike);
router.post("/toggle/c/:commentId", toggleCommentLike);
router.get("/videos", getLikedVideos);
router.get("/isLiked/v/:Id", checkIfVideoAlreadyLiked);
router.get("/isLiked/c/:Id", checkIfCommentAlreadyLiked);

export default router