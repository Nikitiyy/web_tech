const pool = require('../db');

function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'Требуется авторизация' });
    }
    next();
}

function requireAdmin(req, res, next) {
    if (!req.session.userId || req.session.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Доступ запрещён' });
    }
    next();
}

module.exports = { requireAuth, requireAdmin };