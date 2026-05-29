const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'Nikitiy',
    password: 'O1ne42T6',
    database: 'web_tech',
    waitForConnections: true,
    connectionLimit: 10,    
    queueLimit: 0
})

module.exports = pool;