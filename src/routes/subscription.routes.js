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

router
    .route("/c/:channelId")
    .get(getChannelTotalSubscribers)
    .post(toggleSubscription);

router.route("/u/:subscriberId").get(getSubscribedChannels);
router.route("/isSubscribed/:channelId").get(checkIfSubscribed);

export default router