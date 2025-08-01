const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST a new user (simple signup)
router.post('/register', async (req, res) => {
  const {
    username, email, password, role
  } = req.body;

  try {
    const [result] = await db.query(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [username, email, password, role]);

    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});

// POST login (changes made!!!)
router.post('/login', async (req, res) => {
  const { user: username, pass: password } = req.body;

  try {
    const [rows] = await db.query(`
      SELECT user_id, username, role FROM Users
      WHERE username = ? AND password_hash = ?
    `, [username, password]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = rows[0];
    req.session.user = { id: user.user_id, username: user.username, role: user.role };
    res.json({ message: 'Login successful', role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST LOGOUT
router.post('/logout', async (req,res) => {
  req.session.destroy((err) => {
    if(err){
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: "logout " });
  });
});

// Post on getting owners dogs
router.get('/dogs', async(req,res) => {
  try{
    const[rows]=await db.query('SELECT dog_id, name FROM Dogs WHERE owner_id = ?', [req.query.owner_id]);
    res.json(rows);
  } catch(error){
    res.status(500).json({ error: 'Failed to fetach the dogs ' });
  }
});

// Get API dogs
router.get('/dogs', async(req,res)=>{
  try{
    const[dogs]= await db.query(`
      SELECT dog_id, owner_id, name, size FROM Dogs`);
      res.json(dogs);

  }catch(err){
    res.status(500).json({error: 'Failed to fetch dogs'});
  }
});

module.exports = router;
