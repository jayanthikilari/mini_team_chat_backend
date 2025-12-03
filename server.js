require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const channelRoutes = require('./routes/channels');
const messageRoutes = require('./routes/messages');
const jwt = require('jsonwebtoken');
const Message = require('./models/Message');
const Channel = require('./models/Channel');
const User = require('./models/User');

connectDB();

const app = express();
const server = http.createServer(app);

const io = require('socket.io')(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ["GET", "POST"]
  }
});

app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);

const onlineUsers = {}; // { userId: Set of socketIds }
const socketUserMap = {}; // { socketId: userId }

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Auth error'));
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return next(new Error('Auth error'));
    socket.user = { id: user._id.toString(), name: user.name };
    return next();
  } catch (err) {
    return next(new Error('Auth error'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.user.id;
  socketUserMap[socket.id] = userId;
  if (!onlineUsers[userId]) onlineUsers[userId] = new Set();
  onlineUsers[userId].add(socket.id);

  // broadcast updated presence
  const onlineList = Object.keys(onlineUsers);
  io.emit('presence:update', onlineList);

  // Join rooms for channels the user is a member of, so they can get messages
  // (Option: find channels and join)
  // For simplicity, user may join channels client-side via socket.emit('join-channel')

  socket.on('join-channel', async (channelId) => {
    socket.join(channelId);
  });

  socket.on('leave-channel', (channelId) => {
    socket.leave(channelId);
  });

  socket.on('message:create', async ({ channelId, text }) => {
    try {
      if(!channelId || !text) return;
      const msg = new Message({ sender: userId, channel: channelId, text });
      await msg.save();
      await msg.populate('sender','name email');
      // emit to everyone in the channel
      io.to(channelId).emit('message:new', msg);
    } catch (err) {
      console.error(err);
    }
  });

  socket.on('disconnect', () => {
    const sid = socket.id;
    const uid = socketUserMap[sid];
    if (uid && onlineUsers[uid]) {
      onlineUsers[uid].delete(sid);
      if (onlineUsers[uid].size === 0) delete onlineUsers[uid];
    }
    delete socketUserMap[sid];
    // broadcast
    io.emit('presence:update', Object.keys(onlineUsers));
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, ()=> console.log(`Server running on ${PORT}`));