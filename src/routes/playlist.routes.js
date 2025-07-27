import { Router } from 'express';
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.post("/", createPlaylist);
router.get("/:playlistId", getPlaylistById);
router.patch("/:playlistId", updatePlaylist);
router.delete("/:playlistId", deletePlaylist);

router.patch("/add/:videoId/:playlistId", addVideoToPlaylist);
router.patch("/remove/:videoId/:playlistId", removeVideoFromPlaylist);
router.get("/user/:userId", getUserPlaylists);

export default router;