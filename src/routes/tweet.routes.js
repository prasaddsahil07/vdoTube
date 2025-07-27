import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getAllTweets,
    getUserTweets,
    updateTweet,
} from "../controllers/tweet.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.post("/", createTweet);
router.get("/user/:userId", getUserTweets);
router.get("/getAllTweets", getAllTweets);
router.patch("/:tweetId", updateTweet);
router.delete("/:tweetId", deleteTweet);

export default router;