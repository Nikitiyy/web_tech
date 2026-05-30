import { TIME_OUT } from "./timeOut.js";
import { showSpinner, hideSpinner } from "./spinner.js";

export function main_menu() {
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
                    Профиль
                </button>
                <button type="button" id="button_logout" class="button-header">
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
                </ul>
            </section>
        </main>
        
        <footer class="footer">
            <p>&copy; 2026 Музыкальный Магазин. Все права защищены.</p>
        </footer>
    </div>
    `;
    
    main.innerHTML = main_body;

    const searchInput = document.getElementById('search-input');
    let searchTimeout = null;
    searchInput.oninput = (e) => {
        const query = e.target.value.trim();
        if (searchTimeout) clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            showSpinner();

        try {
            if (query.length >= 2) {
                window.router(`/products?search=${encodeURIComponent(query)}`);
                history.pushState({}, '', `/products?search=${encodeURIComponent(query)}`);
            } else if (query.length === 0) {
                window.router('/products');
                history.pushState({}, '', '/products');
            }
        } finally {
            hideSpinner();
        }
        }, TIME_OUT);
    };

    const button_catalog = document.getElementById('button_catalog');
    button_catalog.onclick = () => {
        window.router('/categories');
        history.pushState({}, '', '/categories');
    };
    
    const button_cart = document.getElementById('button_cart');
    button_cart.onclick = () => {
        window.router('/cart');
        history.pushState({}, '', '/cart');
    };

    const button_profile = document.getElementById('button_profile');
    button_profile.onclick = () => {
        window.router('/profile');
        history.pushState({}, '', '/profile');
    };
    
    const button_logout = document.getElementById('button_logout');
    button_logout.onclick = async () => {        
        await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
        window.router('/');
        history.pushState({}, '', '/');
    };
}