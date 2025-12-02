const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');

// post a message (also saved via socket, but exposing API is useful)
router.post('/', auth, async (req,res)=>{
  const { channelId, text } = req.body;
  if(!channelId || !text) return res.status(400).json({ msg:'Missing fields' });
  try {
    const message = new Message({ sender: req.user._id, channel: channelId, text });
    await message.save();
    await message.populate('sender','name email');
    res.json(message);
  } catch(err){ res.status(500).json({msg:'Server error'}); }
});

// get messages for channel with pagination
// query params: channelId, limit, before (timestamp ISO)
router.get('/', auth, async (req,res)=>{
  const { channelId, limit = 30, before } = req.query;
  if(!channelId) return res.status(400).json({ msg:'channelId required' });
  try {
    const q = { channel: channelId };
    if(before) q.createdAt = { $lt: new Date(before) };
    const messages = await Message.find(q)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('sender','name email');
    // return in chronological order
    res.json(messages.reverse());
  } catch(err){ res.status(500).json({msg:'Server error'}); }
});

module.exports = router;
