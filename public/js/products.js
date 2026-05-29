// router доступен через window.router

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

async function loadProducts(category, searchQuery) {
    const container = document.getElementById('products-container');
    const infoElement = document.getElementById('search-info');
    if (!container) return;
    
    try {
        let products = [];
        let count = 0;
        
        if (searchQuery && searchQuery.trim().length >= 2) {
            // Поиск товаров
            const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, { credentials: 'same-origin' });
            const result = await res.json();
            
            if (result.success) {
                products = result.products || [];
                count = result.count || products.length;
                
                if (infoElement) {
                    infoElement.textContent = `Найдено товаров: ${count}`;
                }
                
                if (products.length === 0) {
                    container.innerHTML = '<div style="text-align:center;grid-column:1/-1;color:var(--text-secondary);font-size:1.2em">По вашему запросу ничего не найдено</div>';
                    return;
                }
            }
        } else {
            // Загрузка по категории
            const categoryParam = category === 'all' ? '' : `?category=${category}`;
            const res = await fetch(`/api/products${categoryParam}`, { credentials: 'same-origin' });
            const result = await res.json();
            
            if (result.success) {
                products = result.products || [];
                count = products.length;
                
                if (infoElement) {
                    infoElement.textContent = `Товаров: ${count}`;
                }
                
                if (products.length === 0) {
                    container.innerHTML = '<div style="text-align:center;grid-column:1/-1;color:var(--text-secondary);font-size:1.2em">Товаров пока нет</div>';
                    return;
                }
            }
        }
        
        // Отображение товаров
        container.innerHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.image_url || '/uploads/placeholder.jpg'}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="product-desc">${product.description || 'Описание отсутствует'}</p>
                <div class="product-price">${parseFloat(product.price).toFixed(2)} BYN</div>
                <button type="button" class="button-add-to-cart" onclick="addToCart(${product.id})">
                    🛒 Добавить в корзину
                </button>
            </div>
        `).join('');
        
    } catch (err) {
        console.error('Ошибка загрузки товаров:', err);
        container.innerHTML = '<div style="text-align:center;grid-column:1/-1;color:var(--accent);font-size:1.2em">Ошибка загрузки товаров</div>';
    }
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

// Функция отображения деталей товара
export async function productDetails(productId) { 
    const main = document.querySelector('body');
    if (!productId) {
        window.router('/products');
        history.pushState({}, '', '/products');
        return;
    }
    
    try {
        const res = await fetch(`/api/products/${productId}`, { credentials: 'same-origin' });
        const result = await res.json();
        
        if (!result.success || !result.product) {
            Toastify({ text: 'Товар не найден', duration: 3000, gravity: 'top', position: 'center', className: 'toastify-error' }).showToast();
            window.router('/products');
            history.pushState({}, '', '/products');
            return;
        }
        
        const { product, images } = result;
        const productImages = images && images.length > 0 ? images : [{ image_url: product.image_url, is_main: 1 }];
        
        const main_body = `
    <div class="page-container">
        <header class="header">
            <h1 class="logo">Музыкальный Магазин</h1>
            <div class="header-center">
                <button type="button" id="button_catalog" class="button-header">Каталог</button>
                <div class="header-search">
                    <input type="text" id="search-input-header" class="input-search" placeholder="Поиск товаров...">
                </div>
            </div>
            <nav class="header-right">
                <button type="button" id="button_back" class="button-header">← Назад</button>
                <button type="button" id="button_cart" class="button-header">🛒 Корзина</button>
                <button type="button" id="button_profile" class="button-header">Профиль</button>
                <button type="button" id="button_logout" class="button-header">Выйти</button>
            </nav>
        </header>
        
        <main class="main-content">
            <div class="welcome-section">
                <h2>Детали товара</h2>
            </div>
            
            <div class="product-details-container">
                <div class="product-details-image">
                    <div class="product-main-image">
                        <img id="main-product-image" src="${productImages[0].image_url}" alt="${product.name}">
                    </div>
                    ${productImages.length > 1 ? `
                    <div class="product-thumbnails">
                        ${productImages.map((img, index) => `
                            <img class="thumbnail ${index === 0 ? 'active' : ''}" 
                                 src="${img.image_url}" 
                                 onclick="changeMainImage(this)">
                        `).join('')}
                    </div>
                    ` : ''}
                </div>
                
                <div class="product-details-info">
                    <h1 id="product-name">${product.name}</h1>
                    <p class="product-category">Категория ID: ${product.category_id}</p>
                    <p class="product-description">${product.description || 'Описание отсутствует'}</p>
                    <div class="product-details-price">${parseFloat(product.price).toFixed(2)} BYN</div>
                    
                    <button type="button" id="button_add_to_cart" class="button-add-to-cart button-large">
                        🛒 Добавить в корзину
                    </button>
                </div>
            </div>
        </main>
        
        <footer class="footer">
            <p>&copy; 2026 Музыкальный Магазин</p>
        </footer>
    </div>
        `;
        
        main.innerHTML = main_body;
        
        // Обработчик добавления в корзину
        document.getElementById('button_add_to_cart').onclick = async () => {
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
        
        // Обработчик поиска
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
        
        document.getElementById('button_back').onclick = () => history.back();
        
        document.getElementById('button_logout').onclick = async () => {
            await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
            window.router('/');
            history.pushState({}, '', '/');
        };
        
        // Функция смены главного изображения
        window.changeMainImage = function(element) {
            const mainImage = document.getElementById('main-product-image');
            if (mainImage) {
                mainImage.src = element.src;
            }
            
            // Обновляем активный класс
            document.querySelectorAll('.thumbnail').forEach(thumb => thumb.classList.remove('active'));
            element.classList.add('active');
        };
        
    } catch (err) {
        console.error('Ошибка загрузки товара:', err);
        main.innerHTML = '<div style="text-align:center;padding:2em;color:var(--accent);">Ошибка загрузки товара</div>';
    }
} 