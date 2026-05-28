// router доступен через window.router

export function products(path) {
    const main = document.querySelector('body');
    
    // Парсим category из переданного path, если не передан — из window.location
    let category;
    if (!path) {
        const urlParams = new URLSearchParams(window.location.search);
        category = urlParams.get('category') || 'all';
    } else {
        const pathParts = path.split('?');
        const queryString = pathParts[1] || '';
        const urlParams = new URLSearchParams(queryString);
        category = urlParams.get('category') || 'all';
    }
    
    const main_body = `
    <div class="page-container">
        <header class="header">
            <h1 class="logo">Музыкальный Магазин</h1>
            <div class="header-center">
                <button type="button" id="button_catalog" class="button-header">Каталог</button>
                <div class="header-search">
                    <input type="text" id="search-input" class="input-search" placeholder="Поиск товаров...">
                </div>
            </div>
            <nav class="header-right">
                <button type="button" id="button_back" class="button-header">← Назад</button>
                <button type="button" id="button_profile" class="button-header">Профиль</button>
                <button type="button" id="button_logout" class="button-header">Выйти</button>
            </nav>
        </header>
        
        <main class="main-content">
            <div class="welcome-section">
                <h2>Товары</h2>
            </div>
            
            <section class="products-section" id="products-container">
                <!-- Товары загрузятся сюда -->
            </section>
        </main>
        
        <footer class="footer">
            <p>&copy; 2026 Музыкальный Магазин</p>
        </footer>
    </div>
    `;
    
    main.innerHTML = main_body;
    
    const button_catalog = document.getElementById('button_catalog');
    button_catalog.onclick = () => {
        window.window.router('/categories');
        history.pushState({}, '', '/categories');
    };

    const button_profile = document.getElementById('button_profile');
    button_profile.onclick = () => {
        window.window.router('/profile');
        history.pushState({}, '', '/profile');
    };

    const button_logout = document.getElementById('button_logout');
    button_logout.onclick = async () => {        
        await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
        window.window.router('/');
        history.pushState({}, '', '/');
    };
    
    const button_back = document.getElementById('button_back');
    button_back.onclick = () => {
        history.back();
    };
    
    const searchInput = document.getElementById('search-input');
    searchInput.oninput = () => {
        const query = searchInput.value;
    };
    
    loadProducts(category);
}

async function loadProducts(category) {
    const container = document.getElementById('products-container');
    container.innerHTML = '<p>Загрузка...</p>';
    
    try {
        const res = await fetch(`/api/products?category=${category}`, {
            credentials: 'same-origin'
        });
        const result = await res.json();
        
        console.log('Ответ от сервера:', result);
        
        if (result.success && result.products.length > 0) {
            container.innerHTML = result.products.map(product => `
                <div class="product-card">
                    <img src="${product.image_url}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p class="product-desc">${product.description}</p>
                    <p class="product-price">${product.price} BYN</p>
                    <button class="button-add-to-cart">В корзину</button>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p>Товары не найдены</p>';
        }
    } catch (err) {
        container.innerHTML = '<p>Ошибка загрузки товаров</p>';
    }
}