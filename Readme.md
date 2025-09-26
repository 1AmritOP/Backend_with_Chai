# VideoTube Backend

This is the backend service for VideoTube, a video sharing platform. This README provides an overview of the project, its features, and instructions on how to set it up and run it locally.

---

## Features

* **User Authentication**: Secure user registration and login using JWT (JSON Web Tokens) and bcrypt for password hashing.
* **Video Management**: Upload, publish, and manage video content, including titles, descriptions, and thumbnails.
* **Subscription System**: Users can subscribe and unsubscribe to channels.
* **Commenting and Likes**: Users can comment on videos and like both videos and comments.
* **Watch History**: The platform keeps track of the videos watched by each user.
* **Cloud Media Storage**: Videos and images are uploaded to and served from Cloudinary for efficient and scalable media management.

---

## Technologies Used

* **Node.js**: A JavaScript runtime built on Chrome's V8 JavaScript engine.
* **Express.js**: A fast, unopinionated, minimalist web framework for Node.js.
* **MongoDB**: A cross-platform document-oriented database program.
* **Mongoose**: An elegant MongoDB object modeling tool for Node.js.
* **Cloudinary**: A cloud-based image and video management service.
* **Multer**: A Node.js middleware for handling `multipart/form-data`, which is primarily used for uploading files.
* **JWT (JSON Web Token)**: A compact, URL-safe means of representing claims to be transferred between two parties.
* **Bcrypt**: A library for hashing passwords.
* **Cookie-parser**: A middleware which parses `Cookie` header and populates `req.cookies`.
* **CORS**: A Node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options.

---

## Getting Started

### Prerequisites

* Node.js and npm installed on your machine.
* A MongoDB database instance (local or cloud-based).
* A Cloudinary account for media storage.

### Installation and Setup

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/1AmritOP/videotube-backend.git](https://github.com/1AmritOP/videotube-backend.git)
    cd videotube-backend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env` file in the root of the project and add the following environment variables:

    ```env
    PORT=8000
    MONGODB_URI=your_mongodb_connection_string
    CORS_ORIGIN=*
    ACCESS_TOKEN_SECRET=your_access_token_secret
    ACCESS_TOKEN_EXPIRY=1d
    REFRESH_TOKEN_SECRET=your_refresh_token_secret
    REFRESH_TOKEN_EXPIRY=10d
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    ```

### Running the Application

To run the application in development mode with live reloading, use the following command:

```bash
npm run dev
```

# VideoTube API Endpoints

This document outlines the API endpoints for the VideoTube backend service.

---

## User Routes (`/api/v1/users`)

| Method | Endpoint             | Description                               |
| :----- | :------------------- | :---------------------------------------- |
| `POST` | `/register`          | Register a new user.                      |
| `POST` | `/login`             | Log in an existing user.                  |
| `POST` | `/logout`            | Log out the currently authenticated user. |
| `POST` | `/refresh-token`     | Refresh the access token.                 |
| `POST` | `/change-password`   | Change the current user's password.       |
| `GET`  | `/current-user`      | Get the current authenticated user.       |
| `PATCH`| `/update-account`    | Update account details.                   |
| `PATCH`| `/avatar`            | Update the user's avatar.                 |
| `PATCH`| `/cover-image`       | Update the user's cover image.            |
| `GET`  | `/c/:username`       | Get a user's channel profile.             |
| `GET`  | `/watchHistory`      | Get the user's watch history.             |

---

## Video Routes (`/api/v1/videos`)

| Method | Endpoint             | Description                       |
| :----- | :------------------- | :-------------------------------- |
| `POST` | `/publish-video`     | Publish a new video.              |
| `GET`  | `/gt/:videoId`       | Get a video by its ID.            |
| `DELETE`| `/:videoId`          | Delete a video.                   |
| `PATCH`| `/toggle-publish/:videoId` | Toggle the publish status of a video. |
| `PATCH`| `/:videoId`          | Update video details.             |
| `GET`  | `/default-video`     | Get a list of default videos.     |

---

## Like Routes (`/api/v1/likes`)

| Method | Endpoint                 | Description              |
| :----- | :----------------------- | :----------------------- |
| `POST` | `/toggle/videoLikes/:videoId` | Toggle a like on a video. |

---

## Comment Routes (`/api/v1/comments`)

| Method | Endpoint       | Description                 |
| :----- | :------------- | :-------------------------- |
| `GET`  | `/:videoId`    | Get comments for a video.   |
| `POST` | `/:videoId`    | Add a comment to a video.   |
| `PATCH`| `/c/:commentId`| Update a comment.           |
| `DELETE`| `/c/:commentId`| Delete a comment.           |

---

## Subscription Routes (`/api/v1/subscriptions`)

| Method | Endpoint             | Description                         |
| :----- | :------------------- | :---------------------------------- |
| `POST` | `/:channelId`        | Toggle a subscription to a channel. |
| `GET`  | `/gt-subs/:channelId`| Get subscribers for a channel.    |
