window.addEventListener('popstate', () => {
    router(location.pathname);
});

document.addEventListener('DOMContentLoaded', () => {
    router(location.pathname);
});

function makeEl(elem, classEl) {
    const main = document.createElement(elem);
    main.className = classEl;
    return main;
}

function login() {
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
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if(result.success) {
            if(result.user.role === 'admin') {
                router('/main_admin');                   
                history.pushState({}, '', '/main_admin');
            } else {
                router('/main_menu');
                history.pushState({}, '', '/main_menu');
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
        router('/reg');                   
        history.pushState({}, '', '/reg');
    };
    //enter_guest
    const button_guest = document.getElementById('button_guest');
    button_guest.onclick = () => {
        router('/guest_menu');
        history.pushState({}, '', '/guest_admin');
    }
    //recovery_button
    const button_recovery = document.getElementById('button_recovery');
    button_recovery.onclick = () => {
        router('/recovery');
        history.pushState({}, '', '/recovery');
    }
}

function recovery() {
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
        router('/login');
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
            body: JSON.stringify(data)
    });
       const result = await res.json();
       if(result.success) {
        router('/reset-password');
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

function reset_password() {
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
        router('/recovery');
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
            router('/login');
            history.pushState({}, '', '/login');
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

function reg() {
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
        const data = {
            login: input_login.value,
            email: input_email.value,
            password: input_password.value
        };

        const res = await fetch('/api/reg', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if(result.success) {
            router('/main_menu');
            history.pushState({}, '', '/main_menu');
        } else {
            Toastify({
                text: 'Пользователь уже существует',
                duration: 5000,
                gravity: 'top',
                position: 'right',
                className: 'toastify-error'
            }).showToast();
        }
    };

    const button_reg = document.getElementById('button_reg');
    button_reg.onclick = () => {
        router('/login');
        history.pushState({}, '', '/login');
    };

    const button_guest = document.getElementById('button_guest');
    button_guest.onclick = () => {
        router('/guest_menu');
        history.pushState({}, '', '/guest_menu');
    };
}

function main_admin() {
    const main = document.querySelector('body');
    main.innerHTML = '';    

    const div = makeEl('div', 'background-div');
    div.textContent = 'Вы вошли как администратор';
    main.appendChild(div);
}

function main_menu() {
    const main = document.querySelector('body');
    main.innerHTML = '';
    
    const main_body = `
    <div class="page-container">
        <header class="header">
            <h1 class="logo">Музыкальный Магазин</h1>
            <nav class="header-nav">
                <button type="button" id="button_profile" class="button button-header">
                    Профиль
                </button>
                <button type="button" id="button_logout" class="button button-header">
                    Выйти
                </button>
            </nav>
        </header>
        
        <main class="main-content">
            <div class="welcome-section">
                <h2>Добро пожаловать!</h2>
                <p>Добро пожаловать в каталог товаров музыкального магазина!</p>
            </div>
            
            <section class="info-section">
                <h3>О нашем магазине</h3>
                <p>Наш магазин предлагает широкий ассортимент музыкальных инструментов и оборудования, доступный для покупки или предзаказа.</p>
            </section>
            
            <section class="features-section">
                <h3>Мы предоставляем возможность:</h3>
                <ul class="features-list">
                    <li>Просматривать товары</li>
                    <li>Бронировать выбранные товары</li>
                    <li>Получать помощь от наших консультантов</li>
                </ul>
            </section>
            
            <section class="actions-section">
                <button type="button" id="button_catalog" class="button button-large">
                    Каталог товаров
                </button>
                
                <button type="button" id="button_contact" class="button button-large">
                    Связь с администраторами
                </button>
            </section>
        </main>
        
        <footer class="footer">
            <p>&copy; 2026 Музыкальный Магазин. Все права защищены.</p>
        </footer>
    </div>
    `;
    
    main.innerHTML = main_body;

    const button_catalog = document.getElementById('button_catalog');
    button_catalog.onclick = () => {
        router('/categories');
        history.pushState({}, '', '/categories');
    };

    const button_profile = document.getElementById('button_profile');
    button_profile.onclick = () => {
        router('/profile');
        history.pushState({}, '', '/profile');
    };

    const button_contact = document.getElementById('button_contact');
    button_contact.onclick = () => {
        router('/contact');
        history.pushState({}, '', '/contact');
    };

    const button_logout = document.getElementById('button_logout');
    button_logout.onclick = () => {
        router('/');
        history.pushState({}, '', '/');
    };
}

function guest_menu() {
    const main = document.querySelector('body');
    main.innerHTML = '';
    
    const div = makeEl('div', 'background-div');
    div.textContent = 'Вы вошли как гость';
    main.appendChild(div);
}

function router(path) {
    const main = document.querySelector('body');
    main.innerHTML = '';    

    switch(path) {
        case '/':
        case '/login': {
            login();
            break;
        }
        case '/recovery': {
            recovery();
            break;
        }
        case '/reset-password': {
            reset_password();
            break;
        }
        case '/reg': {
            reg();
            break;
        }
        case '/main_admin': {
            main_admin();
            break;
        }
        case '/main_menu': {
            main_menu();
            break;
        }
        case '/guest_menu': {
            guest_menu();
            break;
        }

    }
}



