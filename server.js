const express = require('express');
const app = express();
const path = require('path');
const bcrypt = require('bcrypt');
const pool = require('./db');
const sendCode = require('./mail');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');

// Создаём папку uploads если её нет
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Настройка multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Только изображения!'), false);
        }
    }
});

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
    });
});

app.get('/api/check-auth', (req, res) => {
    if (req.session.userId) {
        res.json({ success: true, isLoggedIn: true, userId: req.session.userId, role: req.session.role });
    } else {
        res.json({ success: true, isLoggedIn: false });
    }
});



app.get('/api/admins', async (req, res) => {
    if (!req.session.userId || req.session.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Доступ запрещён' });
    }

    try {
        const [rows] = await pool.query('SELECT id, login FROM admins ORDER BY id');
        res.json({ success: true, admins: rows, currentUserId: req.session.userId });
    } catch (err) {
        console.error('Ошибка загрузки админов:', err);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

app.post('/api/admins', async (req, res) => {
    if (!req.session.userId || req.session.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Доступ запрещён' });
    }

    const { login, password } = req.body;

    try {
        if (!login || login.trim().length < 3) {
            return res.json({ success: false, message: 'Логин минимум 3 символа' });
        }
        if (!password || password.length < 6) {
            return res.json({ success: false, message: 'Пароль минимум 6 символов' });
        }

        // Проверяем уникальность логина
        const [existing] = await pool.query('SELECT id FROM admins WHERE login = ?', [login.trim()]);
        if (existing.length > 0) {
            return res.json({ success: false, message: 'Такой логин уже существует' });
        }

        const hash = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO admins (login, password) VALUES (?, ?)',
            [login.trim(), hash]
        );

        res.json({ success: true, adminId: result.insertId, message: 'Администратор добавлен' });
    } catch (err) {
        console.error('Ошибка добавления админа:', err);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

app.delete('/api/admins/:id', async (req, res) => {
    if (!req.session.userId || req.session.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Доступ запрещён' });
    }

    const { id } = req.params;

    try {
        // Проверяем, не удаляет ли админ сам себя
        if (parseInt(id) === req.session.userId) {
            return res.json({ success: false, message: 'Нельзя удалить самого себя' });
        }

        await pool.query('DELETE FROM admins WHERE id = ?', [id]);
        res.json({ success: true, message: 'Администратор удалён' });
    } catch (err) {
        console.error('Ошибка удаления админа:', err);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

app.get('/api/categories', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM categories ORDER BY display_order');
        res.json({ success: true, categories: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

app.post('/api/categories', async (req, res) => {
    if (!req.session.userId || req.session.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Доступ запрещён' });
    }

    const { name, slug, display_order, parent_id } = req.body;

    try {
        if (!name || !slug) {
            return res.json({ success: false, message: 'Название и slug обязательны' });
        }

        const [result] = await pool.query(
            'INSERT INTO categories (name, slug, display_order, parent_id) VALUES (?, ?, ?, ?)',
            [name.trim(), slug.trim(), display_order || 0, parent_id || null]
        );

        res.json({ success: true, categoryId: result.insertId, message: 'Категория добавлена' });
    } catch (err) {
        console.error('Ошибка добавления категории:', err);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

app.delete('/api/categories/:id', async (req, res) => {
    if (!req.session.userId || req.session.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Доступ запрещён' });
    }

    const { id } = req.params;

    try {
        // Проверяем, есть ли дочерние категории
        const [children] = await pool.query('SELECT COUNT(*) as count FROM categories WHERE parent_id = ?', [id]);
        if (children[0].count > 0) {
            return res.json({ success: false, message: 'Нельзя удалить категорию с подкатегориями' });
        }

        // Проверяем, есть ли товары в этой категории
        const [products] = await pool.query('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [id]);
        if (products[0].count > 0) {
            return res.json({ success: false, message: 'Нельзя удалить категорию с товарами' });
        }

        await pool.query('DELETE FROM categories WHERE id = ?', [id]);
        res.json({ success: true, message: 'Категория удалена' });
    } catch (err) {
        console.error('Ошибка удаления категории:', err);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    if (!req.session.userId || req.session.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Доступ запрещён' });
    }

    const { id } = req.params;

    try {
        // Получаем товар чтобы удалить файл
        const [rows] = await pool.query('SELECT image_url FROM products WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Товар не найден' });
        }

        const image_url = rows[0].image_url;
        
        // Удаляем файл если он есть
        if (image_url && image_url.startsWith('/uploads/')) {
            const filePath = path.join(__dirname, 'public', image_url.substring(1));
            try {
                fs.unlinkSync(filePath);
            } catch (err) {
                console.error('Не удалось удалить файл:', err);
            }
        }

        // Удаляем запись из БД
        await pool.query('DELETE FROM products WHERE id = ?', [id]);
        res.json({ success: true, message: 'Товар удалён' });
    } catch (err) {
        console.error('Ошибка удаления товара:', err);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Получаем товар
        const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
        
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'Товар не найден' });
        }

        // Получаем все фото товара
        const [images] = await pool.query(
            'SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order',
            [id]
        );

        res.json({
            success: true,
            product: products[0],
            images: images
        });
    } catch (err) {
        console.error('Ошибка загрузки товара:', err);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

app.put('/api/products/:id', upload.array('images', 5), async (req, res) => {
    if (!req.session.userId || req.session.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Доступ запрещён' });
    }

    const { id } = req.params;
    const { name, description, price, category_id, is_available, existing_images } = req.body;
    const files = req.files || [];
    const existingImages = existing_images ? JSON.parse(existing_images) : [];

    try {
        // Проверяем существование товара
        const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'Товар не найден' });
        }

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Обновляем основные данные товара
            const mainImageUrl = files.length > 0 ? '/uploads/' + files[0].filename : products[0].image_url;
            
            await connection.query(
                `UPDATE products SET name = ?, description = ?, price = ?, category_id = ?, image_url = ?, is_available = ? WHERE id = ?`,
                [name.trim(), description.trim(), parseFloat(price), parseInt(category_id), mainImageUrl, is_available === 'true' ? 1 : 0, id]
            );

            // 2. Удаляем только те фото, которые пользователь пометил на удаление
            const keepImageIds = existingImages.filter(img => img.keep).map(img => img.id);
            if (keepImageIds.length > 0) {
                await connection.query('DELETE FROM product_images WHERE product_id = ? AND id NOT IN (?)', [id, keepImageIds]);
            } else {
                await connection.query('DELETE FROM product_images WHERE product_id = ?', [id]);
            }

            // 3. Добавляем новые фото
            for (let i = 0; i < files.length; i++) {
                // Получаем текущее max display_order
                const [maxOrder] = await connection.query(
                    'SELECT MAX(display_order) as max_order FROM product_images WHERE product_id = ?',
                    [id]
                );
                const newOrder = (maxOrder[0].max_order || 0) + 1;
                
                await connection.query(
                    `INSERT INTO product_images (product_id, image_url, is_main, display_order) 
                     VALUES (?, ?, ?, ?)`,
                    [id, '/uploads/' + files[i].filename, i === 0 ? 1 : 0, newOrder]
                );
            }

            await connection.commit();
            connection.release();

            res.json({ success: true, message: 'Товар обновлён' });
        } catch (err) {
            await connection.rollback();
            connection.release();
            throw err;
        }
    } catch (err) {
        console.error('Ошибка обновления товара:', err);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

app.post('/api/products', upload.array('images', 5), async (req, res) => {
    if (!req.session.userId || req.session.role !== 'admin') {
        // Удаляем загруженные файлы если доступ запрещён
        if (req.files) {
            req.files.forEach(file => fs.unlinkSync(file.path));
        }
        return res.status(403).json({ 
            success: false,
            message: 'Доступ запрещён' 
        });
    }

    const { name, description, price, category_id, is_available } = req.body;
    const files = req.files || [];

    try {
        // Валидация
        if (!name || name.trim().length === 0) {
            files.forEach(file => fs.unlinkSync(file.path));
            return res.json({ success: false, message: 'Название товара обязательно' });
        }
        if (!price || parseFloat(price) <= 0) {
            files.forEach(file => fs.unlinkSync(file.path));
            return res.json({ success: false, message: 'Цена должна быть больше 0' });
        }
        if (!category_id) {
            files.forEach(file => fs.unlinkSync(file.path));
            return res.json({ success: false, message: 'Выберите категорию' });
        }
        if (files.length === 0) {
            return res.json({ success: false, message: 'Загрузите хотя бы одно изображение товара' });
        }

        // Транзакция: вставка товара и фото
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Создаём товар (image_url будет первым фото)
            const mainImageUrl = files[0] ? '/uploads/' + files[0].filename : '';
            
            const [result] = await connection.query(
                `INSERT INTO products (name, description, price, category_id, image_url, is_available) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [name.trim(), description.trim(), parseFloat(price), parseInt(category_id), mainImageUrl, is_available === 'true' ? 1 : 0]
            );

            const productId = result.insertId;

            // 2. Добавляем все фото в product_images
            for (let i = 0; i < files.length; i++) {
                await connection.query(
                    `INSERT INTO product_images (product_id, image_url, is_main, display_order) 
                     VALUES (?, ?, ?, ?)`,
                    [productId, '/uploads/' + files[i].filename, i === 0 ? 1 : 0, i]
                );
            }

            await connection.commit();
            connection.release();

            res.json({
                success: true,
                productId: productId,
                imagesCount: files.length,
                message: 'Товар успешно добавлен с ' + files.length + ' изображени' + (files.length % 10 === 1 && files.length !== 11 ? 'ем' : 'ями')
            });
        } catch (err) {
            await connection.rollback();
            connection.release();
            // Удаляем все файлы при ошибке
            files.forEach(file => {
                try { fs.unlinkSync(file.path); } catch (e) {}
            });
            throw err;
        }
    } catch (err) {
        console.error('Ошибка добавления товара:', err);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

app.get('/api/products', async (req, res) => {
    const category = req.query.category;

    try {
        let query;
        let params;
        
        if (category === 'all' || !category) {
            query = 'SELECT * FROM products WHERE is_available = TRUE';
            params = [];
        } else {
            // Получаем категорию по slug
            const [catRows] = await pool.query('SELECT id FROM categories WHERE slug = ?', [category]);
            
            if (catRows.length === 0) {
                return res.json({ success: true, products: [] });
            }
            
            const categoryId = catRows[0].id;
            
            // Получаем все дочерние категории (простой запрос без рекурсии)
            const [childRows] = await pool.query(
                'SELECT id FROM categories WHERE parent_id = ?',
                [categoryId]
            );
            
            let categoryIds = [categoryId];
            if (childRows.length > 0) {
                categoryIds = [categoryId, ...childRows.map(r => r.id)];
            }
            
            query = 'SELECT * FROM products WHERE is_available = TRUE AND category_id IN (?)';
            params = [categoryIds];
        }
        
        const [rows] = await pool.query(query, params);

        res.json({ success: true, products: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

app.get('/api/search', async (req, res) => {
    const query = req.query.q;

    try {
        if (!query || query.trim().length < 2) {
            return res.json({ success: true, products: [], message: 'Введите минимум 2 символа' });
        }

        const searchQuery = `
            SELECT * FROM products 
            WHERE is_available = TRUE 
            AND (
                name LIKE ? 
                OR description LIKE ?
            )
            LIMIT 50
        `;
        
        const searchTerm = `%${query.trim()}%`;
        const [rows] = await pool.query(searchQuery, [searchTerm, searchTerm]);

        res.json({ success: true, products: rows, count: rows.length });
    } catch (err) {
        console.error('Ошибка поиска:', err);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// ===== КОРЗИНА =====
app.get('/api/cart', async (req, res) => {
    if (!req.session.userId || req.session.role !== 'user') {
        return res.status(401).json({ success: false, message: 'Требуется авторизация' });
    }

    try {
        const [rows] = await pool.query(
            `SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price, p.image_url
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.user_id = ?`,
            [req.session.userId]
        );

        const total = rows.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        res.json({ success: true, items: rows, total: total });
    } catch (err) {
        console.error('Ошибка загрузки корзины:', err);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

app.post('/api/cart/add', async (req, res) => {
    if (!req.session.userId || req.session.role !== 'user') {
        return res.status(401).json({ success: false, message: 'Требуется авторизация' });
    }

    const { product_id, quantity = 1 } = req.body;

    try {
        const [existing] = await pool.query(
            'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
            [req.session.userId, product_id]
        );

        if (existing.length > 0) {
            await pool.query(
                'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
                [parseInt(quantity), existing[0].id]
            );
        } else {
            await pool.query(
                'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
                [req.session.userId, product_id, parseInt(quantity)]
            );
        }

        res.json({ success: true, message: 'Товар добавлен в корзину' });
    } catch (err) {
        console.error('Ошибка добавления в корзину:', err);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

app.delete('/api/cart/:id', async (req, res) => {
    if (!req.session.userId || req.session.role !== 'user') {
        return res.status(401).json({ success: false, message: 'Требуется авторизация' });
    }

    const { id } = req.params;

    try {
        await pool.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [id, req.session.userId]);
        res.json({ success: true, message: 'Товар удалён из корзины' });
    } catch (err) {
        console.error('Ошибка удаления из корзины:', err);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

app.put('/api/cart/update', async (req, res) => {
    if (!req.session.userId || req.session.role !== 'user') {
        return res.status(401).json({ success: false, message: 'Требуется авторизация' });
    }

    const { cart_item_id, quantity } = req.body;

    try {
        if (quantity <= 0) {
            await pool.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [cart_item_id, req.session.userId]);
            return res.json({ success: true, message: 'Товар удалён из корзины' });
        }

        await pool.query(
            'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
            [parseInt(quantity), cart_item_id, req.session.userId]
        );
        res.json({ success: true, message: 'Количество обновлено' });
    } catch (err) {
        console.error('Ошибка обновления корзины:', err);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

app.get('/api/profile', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            success: false,
            message: 'Требуется авторизация'
        });
    }

    try {
        let rows;

        if (req.session.role === 'admin') {
            [rows] = await pool.query(
                'SELECT login FROM admins WHERE id = ?',
                [req.session.userId]
            );
        } else {
            [rows] = await pool.query(
                'SELECT login, email FROM users WHERE id = ?',
                [req.session.userId]
            );
        }

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }

        res.json({
            success: true,
            user: {
                login: rows[0].login,
                email: rows[0].email || null,
                role: req.session.role
            }
        });
    } catch (err) {
        console.error('Ошибка профиля:', err);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});


app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



app.listen(3000, () => {
    console.log('Start server');
});