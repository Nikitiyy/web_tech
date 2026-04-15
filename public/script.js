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
                backgroundColor: 'red',
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
                style: {
                    background: 'red'
                }
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
    <div class="background-div">
        <div class="form">
            <h1>ГЛАВНАЯ СТРАНИЦА</h1>
            
            <h2>Добро пожаловать в каталог товаров музыкального магазина!</h2>
            
            <p>Наш магазин предлагает широкий ассортимент музыкальных инструментов и оборудования, доступный для покупки или предзаказа.</p>
            
            <p>Мы предоставляем возможность:</p>
            <ul>
                <li>Просматривать товары</li>
                <li>Бронировать товары</li>
                <li>Получать помощь от наших консультантов</li>
            </ul>

            <button type="button" id="button_catalog" class="button">
                Каталог товаров
            </button>

            <button type="button" id="button_profile" class="button">
                Профиль
            </button>

            <button type="button" id="button_contact" class="button">
                Связь с администраторами
            </button>
        </div>
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



