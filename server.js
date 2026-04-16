const express = require('express');
const app = express();
const path = require('path');
const bcrypt = require('bcrypt');
const pool = require('./db');
const sendCode = require('./mail');

app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/login', async (req, res) => {

    const { login, password, role } = req.body;
    try {
        if (role === 'admin') {
            const [rows] = await pool.query(
                'SELECT * FROM admins WHERE login = ?',
                [login]
            );
            
            if (rows.length > 0) {
                const valid = await bcrypt.compare(password, rows[0].password);
                if (valid) {
                    res.json({ success: true, user: rows[0] });
                } else {
                    res.json({ success: false});
                }
            } else {
                res.json({ success: false});
            }
        } else {
            const [rows] = await pool.query(
                'SELECT * FROM users WHERE login = ?',
                [login]
            );
            
            if (rows.length > 0) {
                const valid = await bcrypt.compare(password, rows[0].password);
                if (valid) {
                    res.json({ success: true, user: rows[0] });
                } else {
                    res.json({ success: false});
                }
            } else {
                res.json({ success: false});
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

app.post('/api/recovery', async (req, res) => {
    const email = req.body.email;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        if (rows.length > 0) {
            // Генерация 6-значного кода (100000 - 999999)
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            
            // Время истечения: текущее время + 15 минут
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
            
            // Удаляем старые коды и сохраняем новый
            await pool.query('DELETE FROM reset_codes WHERE email = ?', [email]);
            await pool.query(
                'INSERT INTO reset_codes (email, code, expires_at) VALUES (?, ?, ?)',
                [email, code, expiresAt]
            );
            
            // Отправка кода на email
            await sendCode(email, code);
            
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

app.post('/api/reset-password', async (req, res) => {
    const { code, newPassword } = req.body;
    
    try {
        // Получаем email пользователя по коду
        const [resetRows] = await pool.query(
            'SELECT * FROM reset_codes WHERE code = ? AND expires_at > ?',
            [code, new Date()]
        );
        
        if (resetRows.length === 0) {
            return res.json({ success: false, message: 'Неверный код или срок действия истёк' });
        } 

        const email = resetRows[0].email;
        
        // Находим пользователя по email
        const [userRows] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (userRows.length === 0) {
            return res.json({ success: false, message: 'Пользователь не найден' });
        }
        
        // Хэшируем новый пароль
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Обновляем пароль
        await pool.query(
            'UPDATE users SET password = ? WHERE email = ?',
            [hashedPassword, email]
        );
        
        // Удаляем использованный код
        await pool.query('DELETE FROM reset_codes WHERE email = ?', [email]);
        
        res.json({ success: true });
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

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            'INSERT INTO users (login, email, password) VALUES (?, ?, ?)',
            [login, email, hashedPassword]
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