const express = require('express');
const app = express();
const path = require('path');
const bcrypt = require('bcrypt');
const pool = require('./db');
const sendCode = require('./mail');
const session = require('express-session');

app.use(express.json()); 

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 3600000,
        httpOnly: true
    }
}));

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

        if(newPassword.length < 6) {
            return res.json({ 
                success: false, 
                message: 'Пароль должен состоять из 6 и более символов' 
            });
        }
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
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
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
        // Проверка длины пароля
        if (!password || password.length < 6) {
            return res.json({ success: false, message: 'Пароль должен содержать минимум 6 символов' });
        }
        
        // Проверка длины логина
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

app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err) {
            return res.status(500).json({ success: false, message: 'Ошибка сервера' });
        }
        res.clearCookie('connect-sid');
        res.json({ success: true });
    });//--------------------------------------------------------------------------------------------------------
});

app.get('/api/check-auth', (req, res) => {
    if (req.session.userId) {
        res.json({ success: true, isLoggedIn: true, role: req.session.role });
    } else {
        res.json({ success: true, isLoggedIn: false });
    }
});



app.get('/api/products', async (req, res) => {
    const category = req.query.category;

    try {
        let query;
        let params;

        if(category === 'all' || !category) {
            query = 'SELECT * FROM products WHERE is_available = TRUE';
            params = [];
        } else {
            query = `
                SELECT p.* FROM products p
                JOIN categories c ON p.category_id = c.id
                WHERE c.slug = ? AND p.is_available = TRUE
            `;
            params = [category];
        }
        const [rows] = await pool.query(query, params);
        
        res.json({ success: true, products: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});




app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



app.listen(3000, () => {
    console.log('Start server');
});