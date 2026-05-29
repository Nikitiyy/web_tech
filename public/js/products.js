import { loadProducts } from "./load_products.js";

export async function products(path) {
    const main = document.querySelector('body');
    
    // Парсим category и search из переданного path
    let category = 'all';
    let searchQuery = null;
    
    if (path && path.includes('?')) {
        const queryString = path.split('?')[1] || '';
        const urlParams = new URLSearchParams(queryString);
        category = urlParams.get('category') || 'all';
        searchQuery = urlParams.get('search');
    } else if (!path) {
        const urlParams = new URLSearchParams(window.location.search);
        category = urlParams.get('category') || 'all';
        searchQuery = urlParams.get('search');
    }
    
    const main_body = `
    <div class="page-container">
        <header class="header">
            <h1 class="logo">Музыкальный Магазин</h1>
                <div class="header-center">
                    <button type="button" id="button_catalog" class="button-header">Каталог</button>
                    <div class="header-search">
                        <input type="text" id="search-input-header" class="input-search" placeholder="Поиск товаров..." value="${searchQuery ? searchQuery : ''}">
                    </div>
                </div>
            <nav class="header-right">
                <button type="button" id="button_cart" class="button-header">🛒 Корзина</button>
                <button type="button" id="button_profile" class="button-header">Профиль</button>
                <button type="button" id="button_logout" class="button-header">Выйти</button>
            </nav>
        </header>
        
        <main class="main-content">
            <div class="welcome-section">
                <h2>${searchQuery ? `Результаты поиска: "${searchQuery}"` : 'Каталог товаров'}</h2>
                <p id="search-info">${searchQuery ? `Найдено товаров: ` : 'Все доступные товары'}</p>
            </div>
            
            <section class="products-section" id="products-container">
                <div style="text-align:center;grid-column:1/-1;">Загрузка...</div>
            </section>
        </main>
        
        <footer class="footer">
            <p>&copy; 2026 Музыкальный Магазин</p>
        </footer>
    </div>
    `;
    
    main.innerHTML = main_body;
    
    // Добавляем обработчик поиска
    const searchInput = document.getElementById('search-input-header');
    if (searchInput) {
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
    }
        
    // Обработчики кнопок
    document.getElementById('button_catalog').onclick = () => {
        window.router('/categories');
        history.pushState({}, '', '/categories');
    };
    
    document.getElementById('button_cart').onclick = () => {
        window.router('/cart');
        history.pushState({}, '', '/cart');
    };
    
    document.getElementById('button_profile').onclick = () => {
        window.router('/profile');
        history.pushState({}, '', '/profile');
    };
    
    document.getElementById('button_logout').onclick = async () => {
        await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
        window.router('/');
        history.pushState({}, '', '/');
    };
    
    // Загрузка товаров
    await loadProducts(category, searchQuery);
}


// Глобальная функция добавления в корзину
window.addToCart = async function(productId) {
    try {
        const addRes = await fetch('/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ product_id: productId, quantity: 1 })
        });
        const addResult = await addRes.json();
        
        if (addResult.success) {
            Toastify({ text: 'Товар добавлен в корзину', duration: 2000, gravity: 'top', position: 'center', className: 'toastify-success' }).showToast();
        } else {
            if (addRes.status === 401) {
                Toastify({ text: 'Войдите, чтобы добавить в корзину', duration: 3000, gravity: 'top', position: 'center', className: 'toastify-error' }).showToast();
            } else {
                Toastify({ text: addResult.message || 'Ошибка', duration: 3000, gravity: 'top', position: 'center', className: 'toastify-error' }).showToast();
            }
        }
    } catch (err) {
        Toastify({ text: 'Ошибка сервера', duration: 3000, gravity: 'top', position: 'center', className: 'toastify-error' }).showToast();
    }
};