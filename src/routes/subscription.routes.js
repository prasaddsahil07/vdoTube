import { Router } from 'express';
import {
    getSubscribedChannels,
    getChannelTotalSubscribers,
    toggleSubscription,
    checkIfSubscribed,
} from "../controllers/subscription.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT);       // Apply verifyJWT middleware to all routes in this file

router.get("/c/:channelId", getChannelTotalSubscribers);
router.post("/c/:channelId", toggleSubscription);

router.get("/u/:subscriberId", getSubscribedChannels);
router.get("/isSubscribed/:channelId", checkIfSubscribed);

export default router