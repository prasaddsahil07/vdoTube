# VdoTube

A MERN backend project for a video-sharing platform, supporting user authentication, video uploads, playlists, likes, comments, subscriptions, and more.

## Features

- **User Authentication:** Register, login, logout, JWT-based auth, password change, refresh tokens.
- **Video Management:** Upload, update, delete, publish/unpublish, view count, watch history.
- **Playlists:** Create, update, delete playlists; add/remove videos.
- **Likes & Comments:** Like/unlike videos/comments, add/update/delete comments.
- **Subscriptions:** Subscribe/unsubscribe to channels, fetch subscriber stats.
- **Tweets:** Post, update, delete, and fetch tweets (microblogging).
- **Dashboard:** Channel stats, published videos.
- **Healthcheck:** API endpoint for server health.
- **Cloudinary Integration:** Media uploads and deletions.
- **Multer:** File uploads (video, images).
- **MongoDB:** Data storage via Mongoose models.

## Project Structure

```
src/
  app.js                # Express app setup and routes
  index.js              # Entry point, DB connection
  constants.js          # Constants (e.g., DB name)
  cron.js               # Cron job for healthcheck
  controllers/          # Route handlers (business logic)
  db/                   # DB connection logic
  middlewares/          # Auth, multer, etc.
  models/               # Mongoose schemas
  routes/               # Express routers
  utils/                # Helpers (cloudinary, asyncHandler, errors)
public/
  temp/                 # Temporary file storage for uploads
.env                    # Environment variables
```

## API Endpoints

- `/api/v1/users` - User registration, login, profile, avatar/cover updates, etc.
- `/api/v1/videos` - Video CRUD, publish toggle, watch history.
- `/api/v1/playlist` - Playlist CRUD, add/remove videos.
- `/api/v1/comments` - Comment CRUD.
- `/api/v1/likes` - Like/unlike videos/comments.
- `/api/v1/subscriptions` - Subscribe/unsubscribe, stats.
- `/api/v1/tweets` - Tweet CRUD.
- `/api/v1/dashboard` - Channel stats, published videos.
- `/api/v1/healthcheck` - Server health status.

## Setup & Running

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Configure environment:**
   - Copy `.env.example` to `.env` and fill in values for:
     - `PORT`
     - `MONGO_URI`
     - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
     - `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, etc.

3. **Start the server:**
   ```sh
   npm run dev
   ```
   or
   ```sh
   npm start
   ```

## Key Technologies

- **Node.js** + **Express**: Backend framework
- **MongoDB** + **Mongoose**: Database & ODM
- **JWT**: Authentication
- **Cloudinary**: Media storage
- **Multer**: File uploads
- **bcrypt**: Password hashing

## Notes

- All protected routes require a valid JWT (sent via cookies or `Authorization` header).
- Uploaded files are stored temporarily in `public/temp` before being uploaded to Cloudinary.
- Error handling is standardized via [`ApiError`](src/utils/apiError.js) and [`asyncHandler`](src/utils/asyncHandler.js).

---



{"type":"excalidraw/clipboard","workspaceId":"YUS7MDFjhF3tgjfjRoZt","elements":[{"modifiedBy":"NfHFOwKrh3Rszu7xhg54YJ1VUnC3","modifiedAt":1754885299257,"userId":"NfHFOwKrh3Rszu7xhg54YJ1VUnC3","id":"B2QskPe1fUDFA8-6XaOix","x":-326.41796875,"y":-231.6298828125,"version":10577,"versionNonce":795499843,"diagramType":"entity-relationship-diagram","scale":0.7809128440521502,"roughness":0,"strokeSharpness":"sharp","code":"users [icon: user] {\n  id string pk\n  username string\n  email string\n  fullName string\n  avatar string\n  coverImage string\n  watchHistory ObjectId[] videos\n  password string\n  refreshToken string\n  createdAt Date\n  updatedAt Date\n}\n\nvideos [icon: video] {\n  id string pk\n  owner ObjectId users\n  videoFile string\n  thumbnail string\n  title string\n  description string\n  duration number\n  views number\n  isPublished boolean\n  createdAt Date\n  updatedAt Date\n}\n\nsubscriptions [icon: money] {\n  id string pk\n  subscriber ObjectId users\n  channel ObjectId users\n  createdAt Date\n  updatedAt Date\n}\n\nlikes [icon: thumbs-up] {\n  id string pk\n  video ObjectId videos\n  comment ObjectId comments\n  tweet ObjectId tweets\n  likedBy ObjectId users\n  createdAt Date\n  updatedAt Date\n}\n\ncomments [icon: comment] {\n  id string pk\n  video ObjectId videos\n  owner ObjectId users\n  content string\n  createdAt Date\n  updatedAt Date\n}\n\nplaylists [icon: library] {\n  id string pk\n  owner ObjectId users\n  videos ObjectId[] videos\n  name string\n  description string\n  createdAt Date\n  updatedAt Date\n}\n\ntweets [icon: twitter] {\n  id string pk\n  owner ObjectId users\n  content string\n  createdAt Date\n  updatedAt Date  \n}\n\n\nusers.watchHistory <> videos.id\n\n\nvideos.owner - users.id\n\nsubscriptions.subscriber - users.id\nsubscriptions.channel - users.id\n\nlikes.likedBy - users.id\nlikes.video - videos.id\nlikes.comment - comments.id\nlikes.tweet - tweets.id\n\ncomments.owner - users.id\n\ncomments.video - videos.id\n\nplaylists.owner - users.id\nplaylists.videos < videos.id\n\ntweets.owner - users.id\n\n// follows.followee - users.id\n// follows.follower - users.id","width":1261.1742431442226,"height":1076.097899103863,"seed":985073441,"idMap":{},"zIndex":0,"lineMapping":{},"lastCheckedAt":1742833271432,"isDeleted":false,"type":"diagram","opacity":100,"angle":0,"shouldApplyRoughness":true,"groupIds":[],"boundElementIds":null,"lockedGroupId":null,"diagramId":null,"containerId":null,"figureId":null,"fillStyle":"solid","backgroundColor":"transparent","strokeColor":"#d7d9dc","strokeWidth":1,"strokeStyle":"solid","isBeingGenerated":false,"forceAiMode":false,"isSyntaxMissing":false,"isSyntaxBroken":false}]}
