const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db');
const sendCode = require('../gmail');

router.post('/login', async (req, res) => {
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
                    req.session.userId = rows[0].id;
                    req.session.role = 'admin';

                    res.json({ 
                        success: true, 
                        user: { 
                            id: rows[0].id,
                            login: rows[0].login,
                            role: 'admin'
                        } 
                    });
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
                    req.session.userId = rows[0].id;
                    req.session.role = 'user';

                    res.json({ 
                        success: true, 
                        user: { 
                            id: rows[0].id,
                            login: rows[0].login,
                            email: rows[0].email,
                            role: 'user'
                        } 
                    });
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

router.post('/recovery', async (req, res) => {
    const email = req.body.email;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        if (rows.length > 0) {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
            
            await pool.query('DELETE FROM reset_codes WHERE email = ?', [email]);
            await pool.query(
                'INSERT INTO reset_codes (email, code, expires_at) VALUES (?, ?, ?)',
                [email, code, expiresAt]
            );
            
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

router.post('/reset-password', async (req, res) => {
    const { code, newPassword } = req.body;

    try {
        if(newPassword.length < 6) {
            return res.json({ 
                success: false, 
                message: 'Пароль должен состоять из 6 и более символов' 
            });
        }
        const [resetRows] = await pool.query(
            'SELECT * FROM reset_codes WHERE code = ? AND expires_at > ?',
            [code, new Date()]
        );
        
        if (resetRows.length === 0) {
            return res.json({ success: false, message: 'Неверный код или срок действия истёк' });
        } 

        const email = resetRows[0].email;
        
        const [userRows] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (userRows.length === 0) {
            return res.json({ success: false, message: 'Пользователь не найден' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await pool.query(
            'UPDATE users SET password = ? WHERE email = ?',
            [hashedPassword, email]
        );
        
        await pool.query('DELETE FROM reset_codes WHERE email = ?', [email]);
        
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

router.post('/reg', async (req, res) => {
    const { login, email, password } = req.body;
    try {
        if (!password || password.length < 6) {
            return res.json({ success: false, message: 'Пароль должен содержать минимум 6 символов' });
        }
        
        if (!login || login.length < 3) {
            return res.json({ success: false, message: 'Логин должен содержать минимум 3 символа' });
        }
        
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE login = ? OR email = ?',
            [login, email]
        );
        if (rows.length > 0) {
            return res.json({ success: false, message: 'Пользователь уже существует' });
        } 

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            'INSERT INTO users (login, email, password) VALUES (?, ?, ?)',
            [login, email, hashedPassword]
        );

        const [newUser] = await pool.query(
            'SELECT id FROM users WHERE login = ?',
            [login]
        );
        
        req.session.userId = newUser[0].id;
        req.session.role = 'user';

        res.json({
            success: true
        });

    } catch (err) {
        console.error('Ошибка регистрации:', err); 
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err) {
            return res.status(500).json({ success: false, message: 'Ошибка сервера' });
        }
        res.clearCookie('connect-sid');
        res.json({ success: true });
    });
});

router.get('/check-auth', (req, res) => {
    if (req.session.userId) {
        res.json({ success: true, isLoggedIn: true, userId: req.session.userId, role: req.session.role });
    } else {
        res.json({ success: true, isLoggedIn: false });
    }
});

module.exports = router;