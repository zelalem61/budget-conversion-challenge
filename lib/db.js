const config = require('../config');
const mysql = require('mysql');
const sqlite3 = require('sqlite3').verbose();

// Define database engines based on environment
const engines = {
  undefined: 'sqlite3',
  test: 'sqlite3',
  development: 'mysql',
  production: 'mysql'
};

// Initialize the appropriate database engine
const engine = {
  sqlite3: () => new sqlite3.Database(':memory:'),
  mysql: () => mysql.createConnection(config.mysql)
}[engines[process.env.NODE_ENV]]();

const db = module.exports = engine;

// Connect to MySQL database if applicable
if (engines[process.env.NODE_ENV] === 'mysql') {
  db.connect(err => {
    if (err) throw err;
    console.log('Connected to the MySQL database.');
  });
}

// Health check function to ensure database connectivity
db.healthCheck = function(cb) {
  const now = Date.now().toString();
  const createQuery = 'CREATE TABLE IF NOT EXISTS healthCheck (value TEXT)';
  const insertQuery = 'INSERT INTO healthCheck VALUES (?)';

  executeQuery(createQuery, [], err => {
    if (err) return cb(err);
    executeQuery(insertQuery, [now], err => {
      if (err) return cb(err);
      cb(null, now);
    });
  });
};

// Execute a query with promise support
db.executeQuery = function(query, values) {
  return new Promise((resolve, reject) => {
    const callback = (err, data) => {
      if (err) return reject(err);
      resolve(data);
    };

    if (engines[process.env.NODE_ENV] === 'mysql') {
      db.query(query, values, callback);
    } else {
      db.serialize(() => {
        if (query.trim().toUpperCase().startsWith('SELECT') || query.trim().toUpperCase().startsWith('DELETE')) {
          db.all(query, values, callback);
        } else {
          db.run(query, values, callback);
        }
      });
    }
  });
};

// Helper function to execute a query with callback support
function executeQuery(query, values, cb) {
  if (engines[process.env.NODE_ENV] === 'mysql') {
    db.query(query, values, cb);
  } else {
    db.serialize(() => {
      db.run(query, values, (err, data) => cb(err, data));
    });
  }
}