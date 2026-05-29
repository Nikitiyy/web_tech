const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const pool = require('../db');
const { requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/products', async (req, res) => {
    const category = req.query.category;

    try {
        let query;
        let params;
        
        if (category === 'all' || !category) {
            query = 'SELECT * FROM products WHERE is_available = TRUE';
            params = [];
        } else {
            const [catRows] = await pool.query('SELECT id FROM categories WHERE slug = ?', [category]);
            
            if (catRows.length === 0) {
                return res.json({ success: true, products: [] });
            }
            
            const categoryId = catRows[0].id;
            
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

router.get('/search', async (req, res) => {
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

router.get('/products/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
        
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'Товар не найден' });
        }

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

router.post('/products', requireAdmin, upload.array('images', 5), async (req, res) => {
    if (!req.session.userId || req.session.role !== 'admin') {
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

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const mainImageUrl = files[0] ? '/uploads/' + files[0].filename : '';
            
            const [result] = await connection.query(
                `INSERT INTO products (name, description, price, category_id, image_url, is_available) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [name.trim(), description.trim(), parseFloat(price), parseInt(category_id), mainImageUrl, is_available === 'true' ? 1 : 0]
            );

            const productId = result.insertId;

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

router.put('/products/:id', requireAdmin, upload.array('images', 5), async (req, res) => {
    if (!req.session.userId || req.session.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Доступ запрещён' });
    }

    const { id } = req.params;
    const { name, description, price, category_id, is_available, existing_images } = req.body;
    const files = req.files || [];
    const existingImages = existing_images ? JSON.parse(existing_images) : [];

    try {
        const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'Товар не найден' });
        }

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const mainImageUrl = files.length > 0 ? '/uploads/' + files[0].filename : products[0].image_url;
            
            await connection.query(
                `UPDATE products SET name = ?, description = ?, price = ?, category_id = ?, image_url = ?, is_available = ? WHERE id = ?`,
                [name.trim(), description.trim(), parseFloat(price), parseInt(category_id), mainImageUrl, is_available === 'true' ? 1 : 0, id]
            );

            const keepImageIds = existingImages.filter(img => img.keep).map(img => img.id);
            if (keepImageIds.length > 0) {
                await connection.query('DELETE FROM product_images WHERE product_id = ? AND id NOT IN (?)', [id, keepImageIds]);
            } else {
                await connection.query('DELETE FROM product_images WHERE product_id = ?', [id]);
            }

            for (let i = 0; i < files.length; i++) {
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

router.delete('/products/:id', requireAdmin, async (req, res) => {
    if (!req.session.userId || req.session.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Доступ запрещён' });
    }

    const { id } = req.params;

    try {
        const [rows] = await pool.query('SELECT image_url FROM products WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Товар не найден' });
        }

        const image_url = rows[0].image_url;
        
        if (image_url && image_url.startsWith('/uploads/')) {
            const filePath = path.join(__dirname, '..', 'public', image_url.substring(1));
            try {
                fs.unlinkSync(filePath);
            } catch (err) {
                console.error('Не удалось удалить файл:', err);
            }
        }

        await pool.query('DELETE FROM products WHERE id = ?', [id]);
        res.json({ success: true, message: 'Товар удалён' });
    } catch (err) {
        console.error('Ошибка удаления товара:', err);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

module.exports = router;