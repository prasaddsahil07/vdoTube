import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
    watchedStatus,
} from "../controllers/video.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router();
router.use(verifyJWT);


router.get("/", getAllVideos);
router.post("/", upload.fields([
        {
            name: "video",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        }
    ]),
        publishAVideo
    );

router.get("/:videoId", getVideoById);
router.delete("/:videoId", deleteVideo);
router.patch("/:videoId", upload.single("thumbnail"), updateVideo);

router.patch("/toggle/publish/:videoId", togglePublishStatus);
router.patch("/watchHistory/:videoId", watchedStatus);

export default router;