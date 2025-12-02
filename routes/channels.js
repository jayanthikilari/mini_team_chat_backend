const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Channel = require('../models/Channel');
const User = require('../models/User');

// get channels
router.get('/', auth, async (req,res)=>{
  try {
    const channels = await Channel.find().select('-__v').populate('members','name email');
    res.json(channels);
  } catch(err){ res.status(500).json({msg:'Server error'}); }
});

// create channel
router.post('/', auth, async (req,res)=>{
  const { name, isPrivate } = req.body;
  if(!name) return res.status(400).json({ msg:'Name required' });
  try {
    let ch = await Channel.findOne({ name });
    if(ch) return res.status(400).json({ msg:'Channel exists' });
    ch = new Channel({ name, members: [req.user._id], isPrivate: !!isPrivate });
    await ch.save();
    res.json(ch);
  } catch(err){ res.status(500).json({msg:'Server error'}); }
});

// join channel
router.post('/:id/join', auth, async (req,res)=>{
  try {
    const ch = await Channel.findById(req.params.id);
    if(!ch) return res.status(404).json({msg:'No channel'});
    if(!ch.members.includes(req.user._id)) ch.members.push(req.user._id);
    await ch.save();
    res.json(ch);
  } catch(err){ res.status(500).json({msg:'Server error'}); }
});

// leave channel
router.post('/:id/leave', auth, async (req,res)=>{
  try {
    const ch = await Channel.findById(req.params.id);
    if(!ch) return res.status(404).json({msg:'No channel'});
    ch.members = ch.members.filter(m => m.toString() !== req.user._id.toString());
    await ch.save();
    res.json({ msg:'Left' });
  } catch(err){ res.status(500).json({msg:'Server error'}); }
});

module.exports = router;
