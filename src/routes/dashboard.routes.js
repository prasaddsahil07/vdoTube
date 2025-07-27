import { Router } from "express";
import {getAllVideos, getChannelStats, getChannelVideos} from "../controllers/dashboard.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.get("/stats/:channelId", getChannelStats);
router.get("/videos/:channelId", getChannelVideos);
router.get("/videos/getAllPublishedVideos/published", getAllVideos);

export default router;