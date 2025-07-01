const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('sarpras.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS barang (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT,
    jumlah INTEGER,
    kondisi TEXT
  )`);
});

module.exports = db;