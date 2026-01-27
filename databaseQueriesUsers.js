"use strict";
const mysql = require('mysql2/promise');


let connection;

async function getConnection() {
  if (!connection) {
    connection = await mysql.createConnection({
      host: "localhost",
      port: 3306,
      user: "root",
      password: "",
      database: "HY359_2025",
    });
    console.log('MySQL connection established.');
  }
  return connection;
}


// New function to retrieve all users
async function getAllUsers() {
  try {
    const conn = await getConnection();
    const [rows] = await conn.query('SELECT * FROM users');
    return rows;
  } catch (err) {
    throw new Error('DB error: ' + err.message);
  }
}

async function getUserByUsername(username) {
    
    try {
    const conn = await getConnection();

    const selectQuery = "SELECT * FROM users WHERE username = ?";

    const [rows] = await conn.execute(selectQuery, [username]);

    return rows;
  } catch (err) {
    throw new Error('DB error: ' + err.message);
  }
}   // NEW FUNCTION

async function getUserByCredentials(username, password) {
  try {
    const conn = await getConnection();

    const selectQuery = `
      SELECT * FROM users
      WHERE username = ? AND password = ?
    `;

    const [rows] = await conn.execute(selectQuery, [username, password]);

    return rows; // returns an array of matching users (likely 0 or 1)
  } catch (err) {
    throw new Error('DB error: ' + err.message);
  }
}


async function updateUser(username, updates) {
  try {
    const conn = await getConnection();

    const updateQuery = `
      UPDATE users
      SET
        firstname = ?,
        lastname = ?,
        birthdate = ?,
        gender = ?,
        city = ?,
        address = ?,
        telephone = ?
      WHERE username = ?
    `;

    const values = [
      updates.firstname || null,
      updates.lastname || null,
      updates.birthdate || null,
      updates.gender || null,
      updates.city || null,
      updates.address || null,
      updates.telephone || null,
      username
    ];
    const [result] = await conn.execute(updateQuery, values);

    if (result.affectedRows === 0) {
      return 'No user found with that username.';
    }

    return 'User updated successfully.';
  } catch (err) {
    throw new Error('DB error: ' + err.message);
  }
}

async function deleteUser(username) {
  try {
    const conn = await getConnection();

    // 1. Run the Delete Command
    const deleteQuery = 'DELETE FROM users WHERE username = ?';
    const [result] = await conn.execute(deleteQuery, [username]);

    // 2. CHECK: Did we actually delete a row?
    if (result.affectedRows > 0) {
      return true; // Success!
    } else {
      return false; // User didn't exist, nothing happened
    }

  } catch (err) {
    // 3. CATCH LINKED DATA ERRORS (The "eleni4" issue)
    // If eleni4 has reviews, MySQL will throw code 1451 or ER_ROW_IS_REFERENCED
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
        console.error(`Failed to delete ${username}: User has linked reviews/events.`);
        throw new Error('Cannot delete user: They have linked reviews or events. Delete those first.');
    }
    throw err;
  }
}


module.exports = {getAllUsers, getUserByUsername, getUserByCredentials, updateUser, deleteUser};