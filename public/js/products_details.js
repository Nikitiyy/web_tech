import { TIME_OUT } from "./timeOut.js";
import { showSpinner, hideSpinner } from "./spinner.js";

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
                    
                    <div id="cart-control-detail" class="cart-control-detail">
                        <button type="button" id="button_add_to_cart" class="button-add-to-cart button-large">
                            🛒 Добавить в корзину
                        </button>
                    </div>
                </div>
            </div>
        </main>
        
        <footer class="footer">
            <p>&copy; 2026 Музыкальный Магазин</p>
        </footer>
    </div>
        `;
        
        main.innerHTML = main_body;
        
        // Проверяем авторизацию и загружаем количество
        let isLoggedIn = false;
        try {
            const authRes = await fetch('/api/check-auth', { credentials: 'same-origin' });
            const authResult = await authRes.json();
            isLoggedIn = authResult.isLoggedIn && authResult.role === 'user';
        } catch (e) {
            // Игнорируем ошибки
        }
        
        if (isLoggedIn) {
            loadCartQuantityDetail(productId);
        }
        
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
                    loadCartQuantityDetail(productId);
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

// Загрузка количества товара в корзине для страницы деталей
async function loadCartQuantityDetail(productId) {
    try {
        const res = await fetch(`/api/cart/quantity/${productId}`, { credentials: 'same-origin' });
        const result = await res.json();
        
        const controlDiv = document.getElementById('cart-control-detail');
        if (!controlDiv) return;
        
        if (result.success && result.quantity > 0) {
            controlDiv.innerHTML = `
                <div class="quantity-control-detail">
                    <button type="button" class="button-qty-small" onclick="decreaseQuantityDetail(${productId})">−</button>
                    <span class="qty-value">${result.quantity}</span>
                    <button type="button" class="button-qty-small" onclick="increaseQuantityDetail(${productId})">+</button>
                </div>
            `;
        } else {
            controlDiv.innerHTML = `
                <button type="button" id="button_add_to_cart" class="button-add-to-cart button-large">
                    🛒 Добавить в корзину
                </button>
            `;
            
            // Восстанавливаем обработчик кнопки
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
                        loadCartQuantityDetail(productId);
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
        }
    } catch (err) {
        console.error('Ошибка загрузки количества:', err);
    }
}

// Глобальные функции для управления количеством на странице деталей
window.decreaseQuantityDetail = async function(productId) {
    try {
        // Получаем всю корзину для поиска cart_item_id
        const fullCartRes = await fetch('/api/cart', { credentials: 'same-origin' });
        const fullCartResult = await fullCartRes.json();
        
        if (!fullCartResult.success) return;
        
        const item = fullCartResult.items.find(i => i.product_id === productId);
        if (!item) return;
        
        const currentQty = item.quantity;
        
        if (currentQty <= 1) {
            // Удаляем из корзины
            await fetch(`/api/cart/${item.id}`, {
                method: 'DELETE',
                credentials: 'same-origin'
            });
        } else {
            // Уменьшаем количество
            await fetch('/api/cart/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ cart_item_id: item.id, quantity: currentQty - 1 })
            });
        }
        
        await loadCartQuantityDetail(productId);
        Toastify({ text: 'Количество изменено', duration: 2000, gravity: 'top', position: 'center', className: 'toastify-success' }).showToast();
    } catch (err) {
        Toastify({ text: 'Ошибка сервера', duration: 3000, gravity: 'top', position: 'center', className: 'toastify-error' }).showToast();
    }
}; 

window.increaseQuantityDetail = async function(productId) {
    try {
        const addRes = await fetch('/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ product_id: productId, quantity: 1 })
        });
        const addResult = await addRes.json();
        
        if (addResult.success) {
            await loadCartQuantityDetail(productId);
            Toastify({ text: 'Товар добавлен', duration: 2000, gravity: 'top', position: 'center', className: 'toastify-success' }).showToast();
        }
    } catch (err) {
        Toastify({ text: 'Ошибка сервера', duration: 3000, gravity: 'top', position: 'center', className: 'toastify-error' }).showToast();
    }
}; 