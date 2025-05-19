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
console.log('verifyJWT middleware:', verifyJWT); // should log a function

router.use(verifyJWT);
router.route("/").post(createTweet);
router.route("/user/:userId").get(getUserTweets);
router.route("/getAllTweets").get(getAllTweets);
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router;