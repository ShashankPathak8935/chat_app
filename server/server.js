const express = require('express');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const { Pool } = require('pg');
const cors = require('cors');


const app = express();
port = 5000;
const SECRET_KEY = 'shashank@123';



// connection to database 
// Create a pool instance
const pool = new Pool({
  user: 'postgres', 
  host: '192.168.1.6', 
  database: 'php_training', 
  db_schema: 'shashank_pathak',
  password: 'mawai123', 
  port: 5432, 
});

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'uploads'))); // Serve static files from 'uploads' directory

// Verify JWT Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Failed to authenticate token' });
    }
    req.userId = decoded.id;
    next();
  });
};


// Function to test the connection
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

module.exports = pool;




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
// Create a new endpoint to get the list of users
app.get('/users', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, profile_picture FROM shashank_pathak.chatusers');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users', err);
    res.status(500).send('Server error');
  }
});



// Add the endpoint to handle sending messages
app.post('/send-message', verifyToken, async (req, res) => {
  const { receiverId, message } = req.body;
  const senderId = req.userId; // The sender is the logged-in user

  if (!receiverId || !message) {
    return res.status(400).json({ message: 'Receiver and message are required' });
  }

  try {
    const query = `
      INSERT INTO shashank_pathak.chatmessages (sender_id, receiver_id, message)
      VALUES ($1, $2, $3)
    `;
    await pool.query(query, [senderId, receiverId, message]);

    res.status(201).json({ message: 'Message sent successfully' });
  } catch (err) {
    console.error('Error storing message', err);
    res.status(500).send('Server error');
  }
});










  






app.get('/', (req,res)=>{
    res.send("home page")
});

app.listen(port, ()=>{
    console.log( `server is running on ${port}`);
})