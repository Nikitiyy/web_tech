export function profile() {
    console.log("Profile");
    const main = document.querySelector('body');
    main.innerHTML = '';    

    const main_body = `
    <div class="page-container">
        <header class="header">
            <h1 class="logo">Музыкальный Магазин</h1>
            <div class="header-center">
                <button type="button" id="button_catalog" class="button-header">
                    Каталог
                </button>
                <div class="header-search">
                    <input 
                        type="text" 
                        id="search-input" 
                        class="input-search" 
                        placeholder="Поиск товаров..."
                    >
                </div>
            </div>
            <nav class="header-right">
                <button type="button" id="button_cart" class="button-header">
                    🛒 Корзина
                </button>
                <button type="button" id="button_profile" class="button-header">
                    👤 Профиль
                </button>
                <button type="button" id="button_back" class="button-header">
                    ← Назад
                </button>
                <button type="button" id="button_logout" class="button-header">
                    Выйти
                </button>
            </nav>
        </header>
        
        <main class="main-content">
            <div class="welcome-section">
                <h2>Профиль пользователя</h2>
            </div>
            
            <section class="profile-section">
                <div class="profile-card">
                    <div class="profile-avatar">
                        👤
                    </div>
                    
                    <div class="profile-info">
                        <div class="info-row">
                            <span class="info-label">Имя пользователя:</span>
                            <span class="info-value" id="profile-login">Загрузка...</span>
                        </div>
                        
                        <div class="info-row">
                            <span class="info-label">Почта:</span>
                            <span class="info-value" id="profile-email">Загрузка...</span>
                        </div>
                    </div>
                    
                    <div class="profile-actions">
                        <button type="button" id="button_cart_large" class="button-cart">
                            🛒 Корзина
                        </button>
                    </div>
                </div>
            </section>
        </main>
        
        <footer class="footer">
            <p>&copy; 2026 Музыкальный Магазин. Все права защищены.</p>
        </footer>
    </div>
    `;
    
    main.innerHTML = main_body;

    // Загрузка данных профиля
    loadProfileData();

    const searchInput = document.getElementById('search-input');
    let searchTimeout = null;
    searchInput.oninput = (e) => {
        const query = e.target.value.trim();
        if (searchTimeout) clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            if (query.length >= 2) {
                window.router(`/products?search=${encodeURIComponent(query)}`);
                history.pushState({}, '', `/products?search=${encodeURIComponent(query)}`);
            } else if (query.length === 0) {
                window.router('/products');
                history.pushState({}, '', '/products');
            }
        }, 300);
    };

    const button_catalog = document.getElementById('button_catalog');
    button_catalog.onclick = () => {
        window.router('/categories');
        history.pushState({}, '', '/categories');
    };
    
    const button_cart_large = document.getElementById('button_cart_large');
    button_cart_large.onclick = () => {
        window.router('/cart');
        history.pushState({}, '', '/cart');
    };
    
    const button_cart = document.getElementById('button_cart');
    button_cart.onclick = () => {
        window.router('/cart');
        history.pushState({}, '', '/cart');
    };
    
    const button_profile = document.getElementById('button_profile');
    button_profile.onclick = () => {
        Toastify({
            text: 'Вы уже на странице профиля',
            duration: 2000,
            gravity: 'top',
            position: 'center',
            className: 'toastify-info'
        }).showToast();
    };
    
    const button_back = document.getElementById('button_back');
    button_back.onclick = () => {
        history.back();
    };
    
    const button_logout = document.getElementById('button_logout');
    button_logout.onclick = async () => {
        await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
        window.router('/');
        history.pushState({}, '', '/');
    };
}

async function loadProfileData() {
    try {
        const res = await fetch('/api/profile', { credentials: 'same-origin' });
        const result = await res.json();
        
        if (result.success && result.user) {
            document.getElementById('profile-login').textContent = result.user.login;
            document.getElementById('profile-email').textContent = result.user.email;
        } else {
            document.getElementById('profile-login').textContent = 'Ошибка загрузки';
            document.getElementById('profile-email').textContent = 'Необходимо войти';
        }
    } catch (err) {
        document.getElementById('profile-login').textContent = 'Ошибка';
        document.getElementById('profile-email').textContent = 'Необходимо войти';
    }
}