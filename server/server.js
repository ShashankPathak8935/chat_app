// Server Setup
const express = require('express');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const cors = require('cors');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const port = 5000;
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000', // Update with your frontend URL
    methods: ['GET', 'POST'],
  },
});
const SECRET_KEY = 'your_jwt_secret_key';

// Database connection pool
const pool = new Pool({
  user: 'postgres',
  host: '192.168.1.6',
  database: 'php_training',
  schema: 'shashank_pathak',
  password: 'mawai123',
  port: 5432,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'uploads'))); // Serve static files from 'uploads' directory

// const jwt = require('jsonwebtoken');

// const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  console.log('Token:', token);

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, 'your_jwt_secret_key', (err, decoded) => {
    if (err) {
      console.log('Invalid token:', err);
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.userId = decoded.id;
    console.log('User ID:', req.userId);
    next();
  });
};



// Function to test the database connection
const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Connection successful:', res.rows[0]);
  } catch (err) {
    console.error('Connection error', err);
  }
};

// Call the test function
testConnection();

// Multer configuration for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory to save files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`); // Filename with timestamp
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed!'));
  }
});

// File upload and form data handling route
app.post('/signup', upload.single('file'), async (req, res) => {
  const { fullName, email, username, password } = req.body;
  const profile_picture = req.file ? req.file.filename : null;

  // Validation
  if (!fullName || !email || !username || !password || !profile_picture) {
    return res.status(400).send('All fields are required.');
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    const query = `
      INSERT INTO shashank_pathak.chatusers (fullname, email, username, password, profile_picture)
      VALUES ($1, $2, $3, $4, $5)
    `;
    const values = [fullName, email, username, hashedPassword, profile_picture];
    await pool.query(query, values);

    res.status(201).send('User registered successfully!');
  } catch (err) {
    console.error('Error saving user to database', err);
    res.status(500).send('Server error');
  }
});


// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM shashank_pathak.chatusers WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });

    res.json({
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        username: user.username,
        profilePicture: user.profile_picture,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// Create a new endpoint to get the list of users
app.get('/users',verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, profile_picture FROM shashank_pathak.chatusers');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users', err);
    res.status(500).send('Server error');
  }
});




// Endpoint to handle sending messages
// Endpoint to handle sending messages
app.post('/send-message', verifyToken, (req, res) => {
  const { receiverId, message } = req.body;
  const senderId = req.userId; // User ID set by verifyToken middleware

  if (!receiverId || !message) {
    return res.status(400).json({ message: 'Receiver and message are required' });
  }

  pool.query(
    'INSERT INTO shashank_pathak.chatmessages (sender_id, receiver_id, message) VALUES ($1, $2, $3) RETURNING *',
    [senderId, receiverId, message],
    (err, result) => {
      if (err) {
        console.error('Error storing message', err);
        return res.status(500).send('Server error');
      }

      const newMessage = result.rows[0];

      // Emit the message to the receiver's room
      io.to(receiverId).emit('receive-message', newMessage);
      io.to(senderId).emit('receive-message', newMessage); // Emit to sender's room as well

      res.status(201).json(newMessage);
    }
  );
});



// fetch msg from table to chat page
app.get('/messages',verifyToken, (req, res) => {
  console.log('User ID:', req.userId); // Log the user ID to verify authentication

  const { receiverId } = req.query;

  if (!receiverId) {
    return res.status(400).json({ message: 'Receiver ID is required' });
  }

  pool.query(
    'SELECT * FROM shashank_pathak.chatmessages WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)',
    [req.userId, receiverId],
    (err, result) => {
      if (err) {
        console.error('Error fetching messages', err);
        return res.status(500).send('Server error');
      }

      res.json(result.rows);
    }
  );
});


// Ensure socket connection is correctly set up
io.on('connection', (socket) => {
  console.log('a user connected');

  // Handle joining a room
  socket.on('join-room', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  // Handle sending messages
  socket.on('send-message', (messageData) => {
    const { senderId, receiverId, message } = messageData;
    io.to(receiverId).emit('receive-message', messageData);
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

console.log("Server is connected");

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
