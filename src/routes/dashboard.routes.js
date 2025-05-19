import { Router } from "express";
import {getAllVideos, getChannelStats, getChannelVideos} from "../controllers/dashboard.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/stats/:channelId").get(getChannelStats);
router.route("/videos/:channelId").get(getChannelVideos);
router.route("/videos/getAllPublishedVideos/published").get(getAllVideos);

export default router;