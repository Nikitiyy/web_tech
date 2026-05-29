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