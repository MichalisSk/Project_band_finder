"use strict";

const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const { initDatabase, dropDatabase } = require('./database');
const {insertUser, insertBand, insertReview, insertMessage, insertPublicEvent, insertPrivateEvent } = require('./databaseInsert');
const {users, bands,public_events,private_events, reviews, messages} = require('./resources');
const { getAllUsers, getUserByUsername, getUserByCredentials, updateUser, deleteUser}=require('./databaseQueriesUsers');
const { getAllBands, getBandByCredentials, updateBand, deleteBand}=require('./databaseQueriesBands');

const app = express();
const PORT = 3000;

const session = require('express-session');
var parseUrl = require('body-parser');

const activeSessions = new Map();

app.locals.activeUsers = 0;
app.use(session({
    secret: 'csd4098',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      maxAge: 600000,
      secure: false,
      httpOnly: true,
      sameSite: 'strict'
    } // 10 minute session in milliseconds
}));

// Add session cleanup middleware BEFORE other middleware
app.use((req, res, next) => {
    // Clean up expired sessions periodically
    const now = new Date();
    for (const [sessionId, sessionData] of activeSessions) {
        // Remove sessions older than 10 minutes (600000 ms)
        if (now - new Date(sessionData.loginTime) > 600000) {
            activeSessions.delete(sessionId);
            console.log(`Cleaned up expired session for user: ${sessionData.username}`);
        }
    }
    app.locals.activeUsers = activeSessions.size;
    next();
});

app.use(express.urlencoded({extended: true }));
app.use(express.json());
app.use(express.text());
app.use(express.static('public'));
app.use(cookieParser());

// Route to serve index.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/initdb', async (req, res) => {
  try {
    const result = await initDatabase();
    res.send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/insertRecords', async (req, res) => {
  try {
    for(const user of users)
      var result = await insertUser(user);
    for(const band of bands)
      var result = await insertBand(band);
    for(const pev of public_events)
      var result = await insertPublicEvent(pev);    
    for(const rev of reviews)
      var result = await insertReview(rev);    
    for(const priv of private_events)
      var result = await insertPrivateEvent(priv);    
    for(const msg of messages)
      var result = await insertMessage(msg);
    res.send(result);
  } catch (error) {
    console.log(error.message)
    res.status(500).send(error.message);
  }
});

app.get('/dropdb', async (req, res) => {
  try {
    const message = await dropDatabase();
    res.send(message);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/users/details', async (req, res) => {
  const { username, password } = req.query;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }

  try {
    const users = await getUserByCredentials(username, password);

    if (users.length > 0) {
      res.json(users[0]);
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/users/loginDetails', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username and/or password' });
  }

  // another login check
  if (activeSessions.size > 0) {
    if (!activeSessions.has(req.sessionID)) {
      const sessions = Array.from(activeSessions.values());
      const currentUser = sessions[0].username;
      return res.status(409).json({ 
        error: `User ${currentUser} is already logged in. Please wait for them to logout.` 
      });
    } else {
      const existingSession = activeSessions.get(req.sessionID);
      if (existingSession.username !== username) {
        return res.status(409).json({ 
          error: `Session already active. Please logout first before logging in as another user.` 
        });
      }
    }
  }

  const users = await getUserByCredentials(username, password);
  
  if (users.length === 0) {
    return res.status(400).json({ message: "Invalid credentials!" });
  }

  const user = users[0];
  
  for (const [sessionId, sessionData] of activeSessions) {
    if (sessionData.username === username && sessionId !== req.sessionID) {
      activeSessions.delete(sessionId);
      console.log(`Removed duplicate session for user: ${username}`);
    }
  }
  
  req.session.user = { username: user.username };
  
  activeSessions.set(req.sessionID, { 
    username: user.username,
    role: 'user', 
    loginTime: new Date(),
    sessionId: req.sessionID
  });
  
  app.locals.activeUsers = activeSessions.size;
  
  console.log(`User ${username} logged in. Active sessions: ${activeSessions.size}`);
  
  res.json({ 
    message: "Login successful", 
    user: req.session.user.username,
    sessionCount: activeSessions.size
  });
});

app.post('/users/logout', (req, res) => {
  if (req.session.user) {
    const sessionId = req.sessionID;
    const username = req.session.user.username;
    
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ error: 'Could not log out' });
      }
      
      // Remove from active sessions
      activeSessions.delete(sessionId);
      app.locals.activeUsers = activeSessions.size;
      
      res.clearCookie('connect.sid');
      console.log(`User ${username} logged out. Active sessions: ${activeSessions.size}`);
      return res.json({ 
        message: 'Logout successful',
        sessionCount: activeSessions.size
      });
    });
  } else {
    return res.status(400).json({ error: 'No active session' });
  }
});

app.post('/subscribeUser', async (req, res) => {

  console.log(req.body);
  const newUser = req.body;

  if(users.some(user => user.username === newUser.username)){
    res.status(403).json({
      error: 'Username Exists.',
    });
  }
  else if(users.some(user => user.telephone === newUser.telephone)){
    res.status(403).json({
      error: 'Telephone already in use.',
    });
  }
  else if(users.some(user => user.email === newUser.email)){
    res.status(403).json({
      error: 'Email already in use.',
    });
  }
  else{
    try {
      users.push(newUser);
      await insertUser(newUser);
      return res.status(200).json(newUser);
    }
    catch (error) {
      console.log(error.message);
      return res.status(500).send(error.message);
    }
  }
});

app.post('/subscribeBand', async (req, res) => {

  console.log(req.body);
  const newBand = req.body;

  if(bands.some(band => band.username === newBand.username)){
    res.status(403).json({
      error: 'Username Exists.',
    });
  }
  else if(bands.some(band => band.telephone=== newBand.telephone)){
    res.status(403).json({
      error: 'Telephone already in use.',
    });
  }
  else if(bands.some(band => band.email=== newBand.email)){
    res.status(403).json({
      error: 'Email already in use.',
    });
  }
  else{
    try {
      bands.push(newBand);
      await insertBand(newBand);
      return res.status(200).json(newBand);
    }
    catch (error) {
      console.log(error.message);
      return res.status(500).send(error.message);
    }
  }
});
/*
app.get('/users/userSession', (req, res) => {
    if (req.session.user && activeSessions.has(req.sessionID)) {
        return res.json({ 
            logIn: true, 
            user: req.session.user,
            sessionCount: activeSessions.size
        });
    } else {
        // Clean up if session exists but not in activeSessions
        if (req.session.user) {
            req.session.destroy();
            res.clearCookie('connect.sid');
        }
        return res.json({ 
            logIn: false,
            sessionCount: activeSessions.size
        });
    }
});
*/
app.post('/bands/loginDetails', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Missing username and/or password' });
    }

    // Single active session rule (shared with users)
    if (activeSessions.size > 0) {
        if (!activeSessions.has(req.sessionID)) {
            const sessions = Array.from(activeSessions.values());
            const current = sessions[0];
            return res.status(409).json({
                error: `${current.role} ${current.username} is already logged in. Please wait for them to logout.`
            });
        }
    }

    const bands = await getBandByCredentials(username, password);

    if (bands.length === 0) {
        return res.status(400).json({ message: "Invalid credentials!" });
    }

    const band = bands[0];

    // Remove duplicate sessions of same band
    for (const [sessionId, sessionData] of activeSessions) {
        if (sessionData.username === username && sessionId !== req.sessionID) {
            activeSessions.delete(sessionId);
        }
    }

    req.session.band = { username: band.username };

    activeSessions.set(req.sessionID, {
        username: band.username,
        role: 'band',
        loginTime: new Date(),
        sessionId: req.sessionID
    });

    app.locals.activeUsers = activeSessions.size;

    console.log(`Band ${username} logged in. Active sessions: ${activeSessions.size}`);

    res.json({
        message: "Login successful",
        band: band.username,
        sessionCount: activeSessions.size
    });
});

app.post('/bands/logout', (req, res) => {
    if (req.session.band) {
        const sessionId = req.sessionID;
        const username = req.session.band.username;

        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ error: 'Could not log out' });
            }

            activeSessions.delete(sessionId);
            app.locals.activeUsers = activeSessions.size;

            res.clearCookie('connect.sid');
            console.log(`Band ${username} logged out. Active sessions: ${activeSessions.size}`);

            return res.json({
                message: 'Logout successful',
                sessionCount: activeSessions.size
            });
        });
    } else {
        return res.status(400).json({ error: 'No active session' });
    }
});
/*
app.get('/bands/bandSession', (req, res) => {
    if (req.session.band && activeSessions.has(req.sessionID)) {
        return res.json({
            logIn: true,
            band: req.session.band,
            sessionCount: activeSessions.size
        });
    } else {
        if (req.session.band) {
            req.session.destroy();
            res.clearCookie('connect.sid');
        }
        return res.json({
            logIn: false,
            sessionCount: activeSessions.size
        });
    }
});
*/
app.get('/session/status', (req, res) => {

    // No active sessions at all
    if (activeSessions.size === 0) {
        return res.json({
            loggedIn: false,
            role: null,
            username: null,
            sessionCount: 0
        });
    }

    // Logged in as USER
    if (req.session.user && activeSessions.has(req.sessionID)) {
        return res.json({
            loggedIn: true,
            role: 'user',
            username: req.session.user.username,
            sessionCount: activeSessions.size
        });
    }

    // Logged in as BAND
    if (req.session.band && activeSessions.has(req.sessionID)) {
        return res.json({
            loggedIn: true,
            role: 'band',
            username: req.session.band.username,
            sessionCount: activeSessions.size
        });
    }

    // Someone else is logged in
    const sessions = Array.from(activeSessions.values());
    const current = sessions[0];

    return res.json({
        loggedIn: false,
        role: current.role,
        username: current.username,
        sessionCount: activeSessions.size
    });
});

// Add endpoint to force logout all sessions (testing)
app.post('/users/forceLogoutAll', (req, res) => {
    activeSessions.clear();
    app.locals.activeUsers = 0;
    console.log('All sessions forcefully logged out');
    res.json({ message: 'All sessions logged out', sessionCount: 0 });
});

app.get('/users/checkActiveSession', (req, res) => {
    if (activeSessions.size > 0) {
        const sessions = Array.from(activeSessions.values());
        const usernames = sessions.map(s => s.username);
        return res.json({ 
            active: true, 
            count: activeSessions.size,
            users: usernames,
            message: `User(s) logged in: ${usernames.join(', ')}`
        });
    } else {
        return res.json({ 
            active: false, 
            count: 0,
            message: 'No active sessions' 
        });
    }
});

app.get('/users/profile', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Not logged in" });
    }

    const username = req.session.user.username;  // Get username from session
    
    try {
        const users = await getUserByUsername(username);
        if (users.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        // Remove password from response for security
        const userData = { ...users[0] };
        delete userData.password;
        
        res.json(userData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/users/profile/update', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Not logged in" });
    }
    
    const username = req.session.user.username;
    const updates = req.body;
    
    try {
        // Get current user data
        const users = await getUserByUsername(username);
        if (users.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        
        // Update user with new data
        const updatedUser = { ...users[0], ...updates };
        
        // Call your updateUser function (you need to implement this)
        const result = await updateUser(username, updates);
        
        if (result) {
            res.json({ message: "Profile updated successfully" });
        } else {
            res.status(500).json({ error: "Failed to update profile" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// REST API ROUTES

const { getConnection } = require('./databaseInsert');

// 1. POST /review/ - Create a new review
app.post('/review', async (req, res) => {
    let connection;
    try {
        const { band_name, sender, review, rating } = req.body;
        
        // Validate required fields
        if (!band_name || !sender || !review || !rating) {
            return res.status(400).json({ 
                error: 'Missing required fields: band_name, sender, review, rating' 
            });
        }
        
        // Validate rating (1-5 integer)
        const ratingNum = parseInt(rating);
        if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
            return res.status(406).json({ 
                error: 'Rating must be an integer between 1 and 5' 
            });
        }
        
        // Get database connection
        connection = await getConnection();
        
        // Check if band exists
        const [bands] = await connection.execute(
            'SELECT * FROM bands WHERE band_name = ?',
            [band_name]
        );
        
        if (bands.length === 0) {
            return res.status(403).json({ 
                error: 'Band not found' 
            });
        }
        
        // Insert review with status 'pending'
        // Note: Your database table uses 'date_time' not 'datetime'
        const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const [result] = await connection.execute(
            'INSERT INTO reviews (band_name, sender, review, rating, date_time, status) VALUES (?, ?, ?, ?, ?, "pending")',
            [band_name, sender, review, ratingNum, currentTime]
        );
        
        console.log(`Review created with ID: ${result.insertId}`);
        res.status(200).json({ 
            message: 'REST API POST request was successfully created!!',
            review_id: result.insertId,
            band_name,
            sender,
            review,
            rating: ratingNum,
            status: 'pending',
            date_time: currentTime
        });
        
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
});

// 2. GET /reviews/:band_name - Get reviews for a band
app.get('/reviews/:band_name', async (req, res) => {
    let connection;
    try {
        const { band_name } = req.params;
        const { ratingFrom, ratingTo } = req.query;
        
        // Build query
        let query = 'SELECT * FROM reviews WHERE status = "published"';
        const params = [];
        
        // Handle band_name parameter
        if (band_name !== 'all') {
            query += ' AND band_name = ?';
            params.push(band_name);
        }
        
        // Handle rating range
        if (ratingFrom || ratingTo) {
            const from = parseInt(ratingFrom) || 1;
            const to = parseInt(ratingTo) || 5;
            
            if (isNaN(from) || isNaN(to) || from < 1 || to > 5 || from > to) {
                return res.status(406).json({ 
                    error: 'Invalid rating range. Rating must be between 1-5 and ratingFrom must be <= ratingTo' 
                });
            }
            
            query += ' AND rating BETWEEN ? AND ?';
            params.push(from, to);
        }
        
        query += ' ORDER BY date_time DESC';
        
        // Get database connection
        connection = await getConnection();
        const [reviews] = await connection.execute(query, params);
        
        res.status(200).json(reviews);
        
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 3. PUT /reviewStatus/:review_id/:status - Update review status
app.put('/reviewStatus/:review_id/:status', async (req, res) => {
    let connection;
    try {
        const { review_id, status } = req.params;
        
        // Validate status
        if (!['published', 'rejected'].includes(status)) {
            return res.status(406).json({ 
                error: 'Status must be either "published" or "rejected"' 
            });
        }
        
        // Get database connection
        connection = await getConnection();
        
        // Check if review exists and is pending
        const [reviews] = await connection.execute(
            'SELECT * FROM reviews WHERE review_id = ? AND status = "pending"',
            [review_id]
        );
        
        if (reviews.length === 0) {
            return res.status(403).json({ 
                error: 'Review not found or not in pending status' 
            });
        }
        
        // Update status
        await connection.execute(
            'UPDATE reviews SET status = ? WHERE review_id = ?',
            [status, review_id]
        );
        
        res.status(200).json({ 
            message: `Review ${review_id} status updated to ${status}`,
            review_id,
            new_status: status
        });
        
    } catch (error) {
        console.error('Error updating review status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 4. DELETE /reviewDeletion/:review_id - Delete a review
app.delete('/reviewDeletion/:review_id', async (req, res) => {
    let connection;
    try {
        const { review_id } = req.params;
        
        // Get database connection
        connection = await getConnection();
        
        // Check if review exists
        const [reviews] = await connection.execute(
            'SELECT * FROM reviews WHERE review_id = ?',
            [review_id]
        );
        
        if (reviews.length === 0) {
            return res.status(403).json({ 
                error: 'Review not found' 
            });
        }
        
        // Delete review
        await connection.execute(
            'DELETE FROM reviews WHERE review_id = ?',
            [review_id]
        );
        
        res.status(200).json({ 
            message: `Review ${review_id} deleted successfully`,
            review_id
        });
        
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});