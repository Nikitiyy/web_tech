/*
этот файл разделён
*/

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
                    <li>Получать помощь от наших консультантов</li>
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
    
export async function categories() {
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
                <button type="button" id="button_back" class="button-header">
                    ← Назад
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
                <h2>Категории товаров</h2>
            </div>
            
            <section class="categories-section" id="categories-container">
                <div class="category-item" data-category="all">
                    <h3>Всё</h3>
                    <p>Все товары магазина</p>
                </div>
            </section>
        </main>
        
        <footer class="footer">
            <p>&copy; 2026 Музыкальный Магазин. Все права защищены.</p>
        </footer>
    </div>
    `;
    
    main.innerHTML = main_body;
    
    await loadUserCategories();

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

    const button_back = document.getElementById('button_back');
    button_back.onclick = () => {
        history.back();
    };
}

async function loadUserCategories() {
    const container = document.getElementById('categories-container');
    if (!container) return;
    
    try {
        const res = await fetch('/api/categories', { credentials: 'same-origin' });
        const result = await res.json();
        
        if (!result.success || !result.categories || result.categories.length === 0) {
            container.innerHTML = '<div class="category-item" data-category="all" onclick="window.router(\'/products?category=all\'); history.pushState({}, \'\', \'/products?category=all\');"><h3>Всё</h3><p>Все товары магазина</p></div>';
            return;
        }
        
        const categories = result.categories;
        const parentMap = new Map();
        
        categories.forEach(cat => {
            const parentId = cat.parent_id !== null ? String(cat.parent_id) : 'root';
            if (!parentMap.has(parentId)) {
                parentMap.set(parentId, []);
            }
            parentMap.get(parentId).push(cat);
        });
        
        container.innerHTML = '';
        
        // Добавляем "Всё"
        const allCard = document.createElement('div');
        allCard.className = 'category-item';
        allCard.setAttribute('data-category', 'all');
        allCard.innerHTML = '<h3>Всё</h3><p>Все товары магазина</p>';
        allCard.onclick = () => {
            window.router('/products?category=all');
            history.pushState({}, '', '/products?category=all');
        };
        container.appendChild(allCard);
        
        const rootCategories = parentMap.get('root') || [];
        
        rootCategories.forEach(rootCat => {
            const children = parentMap.get(String(rootCat.id)) || [];
            
            const group = document.createElement('div');
            group.className = 'category-group';
            
            // Родительская категория
            const rootItem = document.createElement('div');
            rootItem.className = 'category-item';
            rootItem.setAttribute('data-category', rootCat.slug);
            rootItem.innerHTML = `
                <h3>${rootCat.name}</h3>
                <p>Товары категории</p>
            `;
            rootItem.onclick = () => {
                window.router(`/products?category=${rootCat.slug}`);
                history.pushState({}, '', `/products?category=${rootCat.slug}`);
            };
            group.appendChild(rootItem);
            
            // Дочерние категории
            if (children.length > 0) {
                const childrenContainer = document.createElement('div');
                childrenContainer.className = 'category-children';
                
                children.forEach(child => {
                    const childItem = document.createElement('div');
                    childItem.className = 'category-item category-child';
                    childItem.setAttribute('data-category', child.slug);
                    childItem.innerHTML = `
                        <h3>${child.name}</h3>
                        <p>Товары подкатегории</p>
                    `;
                    childItem.onclick = () => {
                        window.router(`/products?category=${child.slug}`);
                        history.pushState({}, '', `/products?category=${child.slug}`);
                    };
                    childrenContainer.appendChild(childItem);
                });
                
                group.appendChild(childrenContainer);
            }
            
            container.appendChild(group);
        });
    } catch (err) {
        console.error('Ошибка загрузки категорий:', err);
    }
}

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

export function cart() {
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
                    <input type="text" id="search-input" class="input-search" placeholder="Поиск товаров...">
                    <button type="button" id="button_clear_search" style="display:none;">✕</button>
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
                <h2>🛒 Корзина</h2>
                <p>Товары, которые вы выбрали</p>
            </div>
            
            <section class="admin-products-section">
                <div class="products-table-container" id="cart-container">
                    <table class="products-table">
                        <thead>
                            <tr>
                                <th>Фото</th>
                                <th>Название</th>
                                <th>Цена (BYN)</th>
                                <th>Количество</th>
                                <th>Сумма</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody id="cart-table-body">
                            <tr><td colspan="6">Загрузка...</td></tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="cart-summary" id="cart-summary" style="display:none;">
                    <div class="cart-total">
                        <h3>Итого: <span id="cart-total-amount">0</span> BYN</h3>
                    </div>
                    <div class="cart-actions">
                        <button type="button" id="button_continue" class="button-cancel">Продолжить покупки</button>
                    </div>
                </div>
            </section>
        </main>
        
        <footer class="footer">
            <p>&copy; 2026 Музыкальный Магазин</p>
        </footer>
    </div>
    `;
    
    main.innerHTML = main_body;
    
    loadCart();
    
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
    
    document.getElementById('button_catalog').onclick = () => {
        window.router('/categories');
        history.pushState({}, '', '/categories');
    };
    
    document.getElementById('button_cart').onclick = () => {
        Toastify({ text: 'Вы уже в корзине', duration: 2000, gravity: 'top', position: 'center', className: 'toastify-info' }).showToast();
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
    
    document.getElementById('button_continue').onclick = () => {
        window.router('/categories');
        history.pushState({}, '', '/categories');
    };

}

async function loadCart() {
    const tbody = document.getElementById('cart-table-body');
    const summary = document.getElementById('cart-summary');
    
    if (!tbody) return;
    
    try {
        const res = await fetch('/api/cart', { credentials: 'same-origin' });
        const result = await res.json();
        
        if (!result.success) {
            if (res.status === 401) {
                tbody.innerHTML = '<tr><td colspan="6">Войдите, чтобы увидеть корзину</td></tr>';
                return;
            }
            tbody.innerHTML = '<tr><td colspan="6">Ошибка загрузки</td></tr>';
            return;
        }
        
        if (!result.items || result.items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">Корзина пуста</td></tr>';
            if (summary) summary.style.display = 'none';
            return;
        }
        
        tbody.innerHTML = result.items.map(item => `
            <tr>
                <td><img src="${item.image_url || '/uploads/placeholder.jpg'}" alt="${item.name}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;"></td>
                <td class="product-name">${item.name}</td>
                <td class="product-price">${parseFloat(item.price).toFixed(2)}</td>
                <td>
                    <div class="quantity-control">
                        <button class="button-qty" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">−</button>
                        <span class="qty-value">${item.quantity}</span>
                        <button class="button-qty" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                </td>
                <td class="product-price">${(item.price * item.quantity).toFixed(2)}</td>
                <td>
                    <button class="button-delete" onclick="removeFromCart(${item.id})">🗑️ Удалить</button>
                </td>
            </tr>
        `).join('');
        
        document.getElementById('cart-total-amount').textContent = result.total.toFixed(2);
        if (summary) summary.style.display = 'flex';
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="6">Ошибка загрузки</td></tr>';
    }
}

window.removeFromCart = async function(cartItemId) {
    try {
        const res = await fetch(`/api/cart/${cartItemId}`, {
            method: 'DELETE',
            credentials: 'same-origin'
        });
        const result = await res.json();
        
        if (result.success) {
            Toastify({ text: 'Товар удалён', duration: 2000, gravity: 'top', position: 'center', className: 'toastify-success' }).showToast();
            loadCart();
        } else {
            Toastify({ text: result.message || 'Ошибка', duration: 3000, gravity: 'top', position: 'center', className: 'toastify-error' }).showToast();
        }
    } catch (err) {
        Toastify({ text: 'Ошибка сервера', duration: 3000, gravity: 'top', position: 'center', className: 'toastify-error' }).showToast();
    }
};

window.updateQuantity = async function(cartItemId, quantity) {
    try {
        const res = await fetch('/api/cart/update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ cart_item_id: cartItemId, quantity: quantity })
        });
        const result = await res.json();
        
        if (result.success) {
            loadCart();
        } else {
            Toastify({ text: result.message || 'Ошибка', duration: 3000, gravity: 'top', position: 'center', className: 'toastify-error' }).showToast();
        }
    } catch (err) {
        Toastify({ text: 'Ошибка сервера', duration: 3000, gravity: 'top', position: 'center', className: 'toastify-error' }).showToast();
    }
};