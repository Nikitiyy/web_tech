export function recovery() {
    const main_body = `
    <div class="background-div">
        <form class="form">

            <h1>Восстановление пароля</h1>

            <label for="email">Введите почту:</label>
            <input 
                id="email"
                class="input"
                type="email"
                placeholder="Введите email"
            >

            <button type="button" id="button_send" class="button">
                Отправить
            </button>

            <button type="button" id="button_back" class="button">
                Назад
            </button>

        </form>
    </div>
    `;
    const body = document.querySelector('body'); 
    body.innerHTML = main_body;

    const button_back = document.getElementById('button_back');
    button_back.onclick = () => {
        window.router('/login');
        history.pushState({}, '', '/login');
    }

    const input_email = document.getElementById('email');
    const button_send = document.getElementById('button_send');
    button_send.onclick = async () => {
        const data = {
            email: input_email.value
        };

        const res = await fetch('/api/recovery', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if(result.success) {
            window.router('/reset-password');
            history.pushState({}, '', '/reset-password');
        } else {
        Toastify({
            text: 'Пользователь не найден',
            duration: 5000,
            gravity: 'top',
            position: 'right',
            className: 'toastify-error'
        }).showToast();
       }
    }
}
    
export function reset_password() {
    const main_body = `
    <div class="background-div">
        <form class="form">

            <h1>Восстановление пароля</h1>

            <label for="code">Введите код из email:</label>
            <input 
                id="code"
                class="input"
                type="text"
                placeholder="6-значный код"
                maxlength="6"
            >

            <label for="new-password">Новый пароль:</label>
            <input 
                id="new-password"
                class="input"
                type="password"
                placeholder="Придумайте новый пароль"
            >

            <label for="confirm-password">Подтвердите пароль:</label>
            <input 
                id="confirm-password"
                class="input"
                type="password"
                placeholder="Повторите пароль"
            >

            <button type="button" id="button_reset" class="button">
                Сменить пароль
            </button>

            <button type="button" id="button_back" class="button">
                Назад
            </button>

        </form>
    </div>
    `;
    
    const body = document.querySelector('body'); 
    body.innerHTML = main_body;

    const button_back = document.getElementById('button_back');
    button_back.onclick = () => {
        window.router('/recovery');
        history.pushState({}, '', '/recovery');
    }

    const input_code = document.getElementById('code');
    const input_new_password = document.getElementById('new-password');
    const input_confirm_password = document.getElementById('confirm-password');
    const button_reset = document.getElementById('button_reset');
    
    button_reset.onclick = async () => {
        const code = input_code.value;
        const newPassword = input_new_password.value;
        const confirmPassword = input_confirm_password.value;

        if (code.length !== 6) {
            Toastify({
                text: 'Введите 6-значный код',
                duration: 5000,
                gravity: 'top',
                position: 'right',
                className: 'toastify-error'
            }).showToast();
            return;
        }
        
        if (newPassword.length < 6) {
            Toastify({
                text: 'Пароль должен содержать минимум 6 символов',
                duration: 5000,
                gravity: 'top',
                position: 'right',
                className: 'toastify-error'
            }).showToast();
            return;
        }

        if (!/[a-z]/.test(newPassword)) {
            Toastify({
                text: 'Пароль должен содержать хотя бы одну строчную букву',
                duration: 5000,
                gravity: 'top',
                position: 'right',
                className: 'toastify-error'
            }).showToast();
            return;
        }

        if (!/[A-Z]/.test(newPassword)) {
            Toastify({
                text: 'Пароль должен содержать хотя бы одну заглавную букву',
                duration: 5000,
                gravity: 'top',
                position: 'right',
                className: 'toastify-error'
            }).showToast();
            return;
        }

        if (!/[0-9]/.test(newPassword)) {
            Toastify({
                text: 'Пароль должен содержать хотя бы одну цифру',
                duration: 5000,
                gravity: 'top',
                position: 'right',
                className: 'toastify-error'
            }).showToast();
            return;
        }

        if (newPassword !== confirmPassword) {
            Toastify({
                text: 'Пароли не совпадают',
                duration: 5000,
                gravity: 'top',
                position: 'right',
                className: 'toastify-error'
            }).showToast();
            return;
        }

        const res = await fetch('/api/reset-password', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify({ code, newPassword })
        });

        const result = await res.json();
        if (result.success) {
            Toastify({
                text: 'Пароль успешно изменён',
                duration: 5000,
                gravity: 'top',
                position: 'right',
                className: 'toastify-success'
            }).showToast();
            window.router('/main_menu');
            history.replaceState({}, '', '/main_menu');
    
        } else {
            Toastify({
                text: result.message || 'Неверный код или ошибка',
                duration: 5000,
                gravity: 'top',
                position: 'right',
                className: 'toastify-error'
            }).showToast();
        }
    };
}