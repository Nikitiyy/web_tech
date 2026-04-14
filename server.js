const express = require('express');
const app = express();
const path = require('path');
const pool = require('./db');

app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/login', async (req, res) => {

    const { login, password, role } = req.body;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE login = ? AND password = ? AND role = ?',
            [login, password, role]
        );
        
        if (rows.length > 0) {
            res.json({ success: true, user: rows[0] });
        } else {
            res.json({ success: false});
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

app.post('/api/reg', async (req, res) => {
    const { login, email, password } = req.body;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE login = ? OR email = ?',
            [login, email]
        );
        if (rows.length > 0) {
            return res.json({ success: false});
        } 

        await pool.query(
            'INSERT INTO users (login, email, password, role) VALUES (?, ?, ?, ?)',
            [login, email, password, 'user']
        );

        res.json({
            success: true
        });

    } catch (err) {
        console.error('Ошибка регистрации:', err); 
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



app.listen(3000, () => {
    console.log('Start server');
});