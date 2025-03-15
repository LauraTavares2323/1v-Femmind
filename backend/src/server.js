const express = require('express');
const cors = require('cors');
const connection = require('./db_config');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/cadastro', (req, res) => {
    const { username, password} = req.body;
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    connection.query(query, [username, password], (err, result) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Erro ao cadastrar.' });
      }
      res.json({ 
        success: true, 
        message: 'Você foi cadastrado',
         id: result.insertId });
    });
  });