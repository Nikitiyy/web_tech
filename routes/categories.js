const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAdmin } = require('../middleware/auth');

router.get('/categories', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM categories ORDER BY display_order');
        res.json({ success: true, categories: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

router.post('/categories', requireAdmin, async (req, res) => {
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

router.delete('/categories/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const [children] = await pool.query('SELECT COUNT(*) as count FROM categories WHERE parent_id = ?', [id]);
        if (children[0].count > 0) {
            return res.json({ success: false, message: 'Нельзя удалить категорию с подкатегориями' });
        }

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

module.exports = router;