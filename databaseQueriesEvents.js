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
  }
  return connection;
}

async function getAllPublicEvents() {
  try {
    const conn = await getConnection();
    // Select all columns from public_events
    const [rows] = await conn.query('SELECT * FROM public_events ORDER BY event_datetime ASC');
    return rows;
  } catch (err) {
    throw new Error('DB error: ' + err.message);
  }
}

module.exports = { getAllPublicEvents };