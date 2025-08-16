# VdoTube Backend

A robust backend API for the VdoTube video sharing platform built with Node.js, Express, and MongoDB.

## Features

- User authentication with JWT tokens
- Video upload and management
- Like and comment system
- User profiles and subscriptions
- Playlist management
- Watch history tracking
- File upload to Cloudinary
- RESTful API design

## Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- Cloudinary account for file storage
- npm or yarn

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vdotube-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the root directory:
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=8000
   MONGODB_URI=mongodb://localhost:27017/vdotube
   ACCESS_TOKEN_SECRET=your_access_token_secret_here
   REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
   CORS_ORIGIN=http://localhost:3000
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system or use a cloud MongoDB instance.

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Verify the server is running**
   
   Visit [http://localhost:8000](http://localhost:8000) to see the welcome message.

## API Endpoints

### Authentication
- `POST /api/v1/users/register` - Register a new user
- `POST /api/v1/users/login` - Login user
- `POST /api/v1/users/logout` - Logout user
- `POST /api/v1/users/refreshToken` - Refresh access token

### Users
- `GET /api/v1/users/getUser` - Get current user
- `PATCH /api/v1/users/updateDetails` - Update user details
- `PATCH /api/v1/users/updateAvatar` - Update user avatar
- `PATCH /api/v1/users/updateCoverImage` - Update cover image
- `GET /api/v1/users/history` - Get watch history
- `GET /api/v1/users/c/:username` - Get channel profile

### Videos
- `GET /api/v1/videos` - Get all videos
- `POST /api/v1/videos` - Upload a video
- `GET /api/v1/videos/:videoId` - Get video by ID
- `PATCH /api/v1/videos/:videoId` - Update video
- `DELETE /api/v1/videos/:videoId` - Delete video
- `PATCH /api/v1/videos/toggle/publish/:videoId` - Toggle publish status
- `PATCH /api/v1/videos/watchHistory/:videoId` - Add to watch history

### Comments
- `POST /api/v1/comments/:videoId` - Add comment
- `GET /api/v1/comments/:videoId` - Get video comments
- `PATCH /api/v1/comments/c/:commentId` - Update comment
- `DELETE /api/v1/comments/c/:commentId` - Delete comment

### Likes
- `POST /api/v1/likes/toggle/v/:videoId` - Toggle video like
- `POST /api/v1/likes/toggle/t/:tweetId` - Toggle tweet like
- `POST /api/v1/likes/toggle/c/:commentId` - Toggle comment like
- `GET /api/v1/likes/videos` - Get liked videos
- `GET /api/v1/likes/tweets` - Get liked tweets

### Subscriptions
- `POST /api/v1/subscriptions/c/:channelId` - Toggle subscription
- `GET /api/v1/subscriptions/isSubscribed/:channelId` - Check subscription status

### Playlists
- `POST /api/v1/playlist` - Create playlist
- `GET /api/v1/playlist/user/:userId` - Get user playlists
- `GET /api/v1/playlist/:playlistId` - Get playlist by ID
- `PATCH /api/v1/playlist/add/:videoId/:playlistId` - Add video to playlist
- `PATCH /api/v1/playlist/remove/:videoId/:playlistId` - Remove video from playlist
- `DELETE /api/v1/playlist/:playlistId` - Delete playlist

### Dashboard
- `GET /api/v1/dashboard/videos/:userId` - Get user videos
- `GET /api/v1/dashboard/stats/:channelId` - Get channel stats
- `GET /api/v1/dashboard/videos/getAllPublishedVideos/published` - Get all published videos

### Health Check
- `GET /api/v1/healthcheck` - Check API health

## Authentication

The API uses JWT tokens for authentication:

- **Access Token**: Short-lived token for API requests
- **Refresh Token**: Long-lived token for refreshing access tokens
- **Cookies**: Tokens are stored in HTTP-only cookies for security

## File Upload

The API supports file uploads for:
- User avatars and cover images
- Video files and thumbnails

Files are uploaded to Cloudinary for storage and CDN delivery.

## Error Handling

The API uses standardized error responses:

```json
{
  "msg": "Error message",
  "statusCode": 400
}
```

## CORS Configuration

CORS is configured to allow requests from the frontend application. Update `CORS_ORIGIN` in your environment variables to match your frontend URL.

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run lint` - Run ESLint

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **File Storage**: Cloudinary
- **File Upload**: Multer
- **Validation**: Built-in validation
- **CORS**: cors middleware

## Project Structure

```
src/
├── controllers/         # Route controllers
├── middlewares/         # Custom middlewares
├── models/             # Database models
├── routes/             # API routes
├── utils/              # Utility functions
├── db/                 # Database connection
├── app.js              # Express app configuration
└── index.js            # Server entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.