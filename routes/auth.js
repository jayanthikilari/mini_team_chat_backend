const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// register
router.post('/register', async (req,res)=>{
  const { name, email, password } = req.body;
  if(!name || !email || !password) return res.status(400).json({ msg:'Missing fields' });
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg:'User exists' });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    user = new User({ name, email, passwordHash: hash });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// login
router.post('/auth/login', async (req,res)=>{
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({ msg:'Missing fields' });
  try {
    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({ msg:'Invalid creds' });
    const ok = await user.comparePassword(password);
    if(!ok) return res.status(400).json({ msg:'Invalid creds' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email }});
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

module.exports = router;
