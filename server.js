const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const db = require('./database');
const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'e-inside-secret',
  resave: false,
  saveUninitialized: true
}));

function cekLogin(req, res, next) {
  if (req.session && req.session.user === 'admin') {
    next();
  } else {
    res.redirect('/login');
  }
}

app.get('/', cekLogin, (req, res) => {
  db.all('SELECT * FROM barang', (err, rows) => {
    res.render('index', { data: rows });
  });
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === '1234') {
    req.session.user = 'admin';
    res.redirect('/');
  } else {
    res.render('login', { error: 'Username atau password salah' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});
// Pencarian barang
app.get('/search', cekLogin, (req, res) => {
  const keyword = `%${req.query.q}%`;
  db.all(`SELECT * FROM barang WHERE nama LIKE ?`, [keyword], (err, rows) => {
    if (err) {
      console.error(err);
    }
    res.render('index', { data: rows });
  });
});
// Halaman form tambah barang
app.get('/tambah', cekLogin, (req, res) => {
  res.render('tambah');
});
// Hapus barang
app.get('/hapus/:id', cekLogin, (req, res) => {
  const id = req.params.id;
  db.run(`DELETE FROM barang WHERE id = ?`, [id], (err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/');
  });
});
// Halaman edit barang
app.get('/edit/:id', cekLogin, (req, res) => {
  const id = req.params.id;
  db.get(`SELECT * FROM barang WHERE id = ?`, [id], (err, row) => {
    if (err) {
      console.error(err);
    }
    res.render('edit', { barang: row });
  });
});

// Proses update barang
app.post('/edit/:id', cekLogin, (req, res) => {
  const id = req.params.id;
  const { nama, jumlah, kondisi, tanggal_perolehan } = req.body;
  db.run(
    `UPDATE barang SET nama = ?, jumlah = ?, kondisi = ?, tanggal_perolehan = ? WHERE id = ?`,
    [nama, jumlah, kondisi, tanggal_perolehan, id],
    (err) => {
      if (err) {
        console.error(err);
      }
      res.redirect('/');
    }
  );
});

// Proses simpan barang
app.post('/tambah', cekLogin, (req, res) => {
  const { nama, jumlah, kondisi, tanggal_perolehan } = req.body;
  db.run(
    `INSERT INTO barang (nama, jumlah, kondisi, tanggal_perolehan) VALUES (?, ?, ?, ?)`,
    [nama, jumlah, kondisi, tanggal_perolehan],
    (err) => {
      if (err) {
        console.error(err);
      }
      res.redirect('/');
    }
  );
});
app.get('/laporan', cekLogin, (req, res) => {
  const kondisi = req.query.kondisi;
  const start = req.query.start;
  const end = req.query.end;

  let query = 'SELECT * FROM barang WHERE 1=1';
  let params = [];

  if (kondisi) {
    query += ' AND kondisi = ?';
    params.push(kondisi);
  }
  if (start) {
    query += ' AND tanggal_perolehan >= ?';
    params.push(start);
  }
  if (end) {
    query += ' AND tanggal_perolehan <= ?';
    params.push(end);
  }

  db.all(query, params, (err, rows) => {
    res.render('laporan', { data: rows });
  });
});
app.listen(3000, () => {
  console.log('E-INSIDE App berjalan di http://localhost:3000');
});