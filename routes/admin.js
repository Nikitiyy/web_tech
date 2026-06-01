const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db.js');
const { requireAuth, requireAdmin } = require('../middleware/auth.js');

router.get('/admins', requireAdmin, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, login FROM admins ORDER BY id');
        res.json({ success: true, admins: rows, currentUserId: req.session.userId });
    } catch (err) {
        console.error('Ошибка загрузки админов:', err);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

router.post('/admins', requireAdmin, async (req, res) => {
    const { login, password } = req.body;

    try {
        if (!login || login.trim().length < 3) {
            return res.json({ success: false, message: 'Логин минимум 3 символа' });
        }
        if (!password || password.length < 6) {
            return res.json({ success: false, message: 'Пароль минимум 6 символов' });
        }

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

router.delete('/admins/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;

    try {
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

router.get('/profile', requireAuth, async (req, res) => {
    try {
        console.log('Профиль:', req.session.userId);
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

router.get('/admin/reservations', requireAdmin, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT r.id, r.quantity, r.status,
                    u.login AS user_login,
                    p.id AS product_id, p.name AS product_name, p.price, p.image_url
             FROM reservations r
             JOIN users u ON r.user_id = u.id
             JOIN products p ON r.product_id = p.id
             WHERE r.status = 'active'
             ORDER BY r.id DESC`
        );

        res.json({ success: true, reservations: rows });
    } catch (err) {
        console.error('Ошибка загрузки бронирований:', err);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

router.delete('/admin/reservations/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query('DELETE FROM reservations WHERE id = ?', [id]);
        res.json({ success: true, message: 'Бронирование удалено' });
    } catch (err) {
        console.error('Ошибка удаления бронирования:', err);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

module.exports = router;