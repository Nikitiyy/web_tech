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