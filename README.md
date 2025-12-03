# Mini Team Chat Application

A real-time chat application with channels, online presence, and user authentication, built with React, Node.js, MongoDB, and Socket.io.

---

## Table of Contents

* [Features](#features)
* [Tech Stack](#tech-stack)
* [Setup & Run](#setup--run)
* [Assumptions & Limitations](#assumptions--limitations)
* [Optional Features](#optional-features)

---

## Features

* **User Authentication**: Register and login with JWT-based auth.
* **Channels**: Create, join, and leave channels.
* **Real-Time Messaging**: Send and receive messages in channels instantly.
* **Online Presence**: See which users are online.
* **Dynamic UI Updates**: Channel membership and online users update without page reload.

---

## Tech Stack

* **Frontend**: React, React Router DOM, Axios, Socket.io Client
* **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.io Server
* **Authentication**: JWT (JSON Web Tokens), bcrypt for password hashing
* **Environment Variables**: `.env` for configuration

---

## Setup & Run

### Backend

1. Clone the repo:

```bash
git clone <repo-url>
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file:

```
PORT=4000
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
FRONTEND_URL=http://localhost:3000
```

4. Run the server:

```bash
npm start
```

---

### Frontend

1. Navigate to frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file:

```
REACT_APP_SOCKET_URL=http://localhost:4000
REACT_APP_API_URL=http://localhost:4000/api
```

4. Run the React app:

```bash
npm start
```

---

### Usage

* Open the frontend in browser (`http://localhost:3000`).
* Register a new user or login.
* Create channels or join existing ones.
* Send messages in channels.
* See online users in real-time.

---

## Assumptions & Limitations

* No user roles or admin features implemented.
* Channels are either public or private (private only restricts visibility, not enforced in this version).
* Messages are stored in MongoDB, but no pagination implemented.
* Online presence shows all users currently connected via socket, not across multiple devices reliably.
* Error handling is basic; production-level validation is not included.

---

## Optional Features Implemented

* Both **Join** and **Leave** buttons available for all channels.
* Real-time online users display with names instead of IDs.
* Instant UI update when a user leaves a channel without refetching all channels.

---

## Folder Structure

```
/backend
  server.js
  /routes
    auth.js
    channels.js
    messages.js
  /models
    User.js
    Channel.js
    Message.js
  /config
    db.js
/frontend
  /src
    api.js
    /components
      Channels.js
      Login.js
      Signup.js
    utils/auth.js
```

---

This project demonstrates a **full-stack real-time chat app** using modern web technologies with proper separation of frontend and backend.
