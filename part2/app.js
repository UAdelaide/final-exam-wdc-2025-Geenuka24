const express = require('express');
const path = require('path');
require('dotenv').config();
const app = express();
const session = require('express-session');


// Middleware
app.use(express.json());
// this handles the user sessions
app.use(session({
    secret: ' ',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));
app.use(express.static(path.join(__dirname, '/public')));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// Export the app instead of listening here
module.exports = app;
