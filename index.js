const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://frontend-lyart-two-29.vercel.app"
  ],
  methods: "GET,POST,PUT,DELETE",
  credentials: true
}));


app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport config
require('./config/passport');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ftp', require('./routes/ftp'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
