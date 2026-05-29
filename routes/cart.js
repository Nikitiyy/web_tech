const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

router.get('/cart', requireAuth, async (req, res) => {
    if (req.session.role !== 'user') {
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

router.post('/cart/add', requireAuth, async (req, res) => {
    if (req.session.role !== 'user') {
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

router.delete('/cart/:id', requireAuth, async (req, res) => {
    if (req.session.role !== 'user') {
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

router.put('/cart/update', requireAuth, async (req, res) => {
    if (req.session.role !== 'user') {
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

module.exports = router;