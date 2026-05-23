// router доступен через window.router

export function login() {
    const main_body = `
    
    <div class="background-div">
        <form class="form" method="POST">

            <h1>ВХОД</h1>

            <label for="login">Логин:</label>
            <input 
                id="login"
                class="input"
                type="text"
                placeholder="Введите логин"
            >

            <label for="password">Пароль:</label>
            <input 
                id="password"
                class="input"
                type="password"
                placeholder="Введите пароль"
            >

            <label for="role">Роль:</label>
            <select id="role" class="input">
                <option value="user">Пользователь</option>
                <option value="admin">Администратор</option>
            </select>

            <button type="button" id="button_enter" class="button">
                Войти
            </button>

            <button type="button" id="button_reg" class="button">
                Регистрация
            </button>

            <button type="button" id="button_guest" class="button">
                Гость
            </button>

            <button type="button" id="button_recovery" class="button">
                Восстановить пароль
            </button>

        </form>
    </div>
    `;

    const body = document.querySelector('body'); 
    body.innerHTML = main_body;

    const input_login = document.getElementById('login');
    const input_password = document.getElementById('password');
    const select_role = document.getElementById('role');

    const button_enter = document.getElementById('button_enter');
    button_enter.onclick = async () => {
        const data = {
            login: input_login.value,
            password: input_password.value, 
            role: select_role.value
        }
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if(result.success) {
            if(result.user.role === 'admin') {
                window.router('/main_admin');                   
                history.replaceState({}, '', '/main_admin');
            } else {
                window.router('/main_menu');
                history.replaceState({}, '', '/main_menu');
            }
        } else {
            Toastify({
                text: 'Неверный логин или пароль',
                duration: 5000,
                gravity: 'top',
                position: 'right',
                className: 'toastify-error'
            }).showToast();
        }
    }
    //registration_button
    const button_reg = document.getElementById('button_reg');
    button_reg.onclick = () => {
        window.router('/reg');                   
        history.pushState({}, '', '/reg');
    };
    //enter_guest
    const button_guest = document.getElementById('button_guest');
    button_guest.onclick = () => {
        window.router('/main_menu');
        history.pushState({}, '', '/main_menu');
    }
    //recovery_button
    const button_recovery = document.getElementById('button_recovery');
    button_recovery.onclick = () => {
        window.router('/recovery');
        history.pushState({}, '', '/recovery');
    }
}
    
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
        
        if (newPassword < 6) {
            Toastify({
                text: 'Пароль должен состоять из 6 и более символов',
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
    
export function reg() {
    const main_body = `
    <div class="background-div">
        <form class="form" method="POST">

            <h1>РЕГИСТРАЦИЯ</h1>

            <label for="login">Логин:</label>
            <input 
                id="login"
                class="input"
                type="text"
                placeholder="Придумайте логин"
            >

            <label for="email">Почта:</label>
            <input 
                id="email"
                class="input"
                type="email"
                placeholder="Введите почту"
            >

            <label for="password">Пароль:</label>
            <input 
                id="password"
                class="input"
                type="password"
                placeholder="Придумайте пароль"
            >

            <button type="button" id="button_enter" class="button">
                Создать аккаунт
            </button>

            <button type="button" id="button_reg" class="button">
                Вход
            </button>

            <button type="button" id="button_guest" class="button">
                Гость
            </button>

        </form>
    </div>
    `;
    const body = document.querySelector('body'); 
    body.innerHTML = main_body;

    const input_login = document.getElementById('login');
    const input_email = document.getElementById('email');
    const input_password = document.getElementById('password');

    const button_enter = document.getElementById('button_enter');
    button_enter.onclick = async () => {
        const login = input_login.value.trim();
        const email = input_email.value.trim();
        const password = input_password.value;

        // Валидация на клиенте
        if (!login || login.length < 3) {
            console.log('short login');
            Toastify({
                text: 'Логин должен содержать минимум 3 символа',
                duration: 5000,
                gravity: 'top',
                position: 'right',
                className: 'toastify-error'
            }).showToast();
            return;
        }

        if (!password || password.length < 6) {
            console.log('short password');
            Toastify({
                text: 'Пароль должен содержать минимум 6 символов',
                duration: 5000,
                gravity: 'top',
                position: 'right',
                className: 'toastify-error'
            }).showToast();
            return;
        }

        const data = {
            login,
            email,
            password
        };

        const res = await fetch('/api/reg', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if(result.success) {
            window.router('/main_menu');
            history.replaceState({}, '', '/main_menu');
        } else {
            Toastify({
                text: result.message || 'Ошибка регистрации',
                duration: 5000,
                gravity: 'top',
                position: 'right',
                className: 'toastify-error'
            }).showToast();
        }
    };

    const button_reg = document.getElementById('button_reg');
    button_reg.onclick = () => {
        window.router('/login');
        history.pushState({}, '', '/login');
    };

    const button_guest = document.getElementById('button_guest');
    button_guest.onclick = () => {
        window.router('/main_menu');
        history.replaceState({}, '', '/main_menu');
    };
}