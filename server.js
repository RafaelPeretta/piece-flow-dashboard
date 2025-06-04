const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('pieces.db'); // Use um arquivo para persistência real

// Crie a tabela
db.serialize(() => {
  db.run(`CREATE TABLE pieces (
    id TEXT PRIMARY KEY,
    color TEXT,
    size TEXT,
    material TEXT,
    timestamp TEXT
  )`);
});

// Endpoint para listar peças
app.get('/pieces', (req, res) => {
  db.all('SELECT * FROM pieces ORDER BY timestamp DESC', [], (err, rows) => {
    res.json(rows);
  });
});

// Endpoint para adicionar peça
app.post('/pieces', (req, res) => {
  const { id, color, size, material, timestamp } = req.body;
  db.run(
    'INSERT INTO pieces (id, color, size, material, timestamp) VALUES (?, ?, ?, ?, ?)',
    [id, color, size, material, timestamp],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.listen(3001, () => console.log('API rodando na porta 3001'));