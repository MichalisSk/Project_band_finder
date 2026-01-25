"use strict";

const express = require('express');
const path = require('path');
const { initDatabase, dropDatabase } = require('./database');
const {insertUser, insertBand, insertReview, insertMessage, insertPublicEvent, insertPrivateEvent } = require('./databaseInsert');
const {users, bands,public_events,private_events, reviews, messages} = require('./resources');
const { getAllUsers, getUserByCredentials, updateUser, deleteUser}=require('./databaseQueriesUsers');
const { getAllBands, getBandByCredentials, updateBand, deleteBand}=require('./databaseQueriesBands');

const app = express();
const PORT = 3000;

app.use(express.static('public'));

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});