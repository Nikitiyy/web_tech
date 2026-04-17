const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nikita184615@gmail.com',
        pass: 'rdwqsrinzaoxwubi'
    }
});

async function sendCode(email, code) { 
    await transporter.sendMail({
        from: 'nikita184615@gmail.com',
        to: email,
        subject: 'Восстановление пароля',
        html: `
            <h2>Восстановление пароля</h2>
            <p>Ваш код:</p>
            <h1>${code}</h1>
        `
    });
}

module.exports = sendCode;
