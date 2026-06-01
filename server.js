const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const PORT = process.env.PORT || 3000;

app.use(express.json()); 

app.set('trust proxy', 1);

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 3600000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));


app.use(express.static(path.join(__dirname, 'public')));

// Подключение роутов
app.use('/api', require('./routes/auth'));
app.use('/api', require('./routes/admin'));
app.use('/api', require('./routes/categories'));
app.use('/api', require('./routes/products'));
app.use('/api', require('./routes/cart'));

// Fallback для SPA
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
});