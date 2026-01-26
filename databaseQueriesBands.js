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


// New function to retrieve all bands
async function getAllBands() {
  try {
    const conn = await getConnection();
    const [rows] = await conn.query('SELECT * FROM bands');
    return rows;
  } catch (err) {
    throw new Error('DB error: ' + err.message);
  }
}

async function getBandByUsername(username) {
    
    try {
    const conn = await getConnection();

    const selectQuery = "SELECT * FROM bands WHERE username = ?";

    const [rows] = await conn.execute(selectQuery, [username]);

    return rows;
  } catch (err) {
    throw new Error('DB error: ' + err.message);
  }
} 

async function updateBand(username, updates) {
  try {
    const conn = await getConnection();

    const updateQuery = `
      UPDATE bands
      SET
        band_name = ?,
        music_genres = ?,
        band_description = ?,
        members_number = ?,
        foundedYear = ?,
        band_city = ?,
        telephone = ?,
        webpage = ?,
        photo = ?
      WHERE username = ?
    `;

    const values = [
      updates.band_name ?? null,
      updates.music_genres ?? null,
      updates.band_description ?? null,
      updates.members_number ?? null,
      updates.foundedYear ?? null,
      updates.band_city ?? null,
      updates.telephone ?? null,
      updates.webpage || null,   // optional
      updates.photo || null,     // optional
      username
    ];

    const [result] = await conn.execute(updateQuery, values);

    return result.affectedRows > 0;
  } catch (err) {
    throw new Error('DB error: ' + err.message);
  }
}

async function getBandByCredentials(username, password) {
  try {
    const conn = await getConnection();

    const selectQuery = `
      SELECT * FROM bands
      WHERE username = ? AND password = ?
    `;

    const [rows] = await conn.execute(selectQuery, [username, password]);

    return rows; // returns an array of matching bands (likely 0 or 1)
  } catch (err) {
    throw new Error('DB error: ' + err.message);
  }
}

async function deleteBand(username) {
  try {
    const conn = await getConnection();

    const deleteQuery = `
      DELETE FROM bands
      WHERE username = ?
    `;

    const [result] = await conn.execute(deleteQuery, [username]);

    if (result.affectedRows === 0) {
      return 'No band found with that username.';
    }

    return 'User deleted successfully.';
  } catch (err) {
    throw new Error('DB error: ' + err.message);
  }
}


module.exports = {getAllBands, getBandByUsername, getBandByCredentials, updateBand, deleteBand};