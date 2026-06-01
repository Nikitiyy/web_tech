export async function loadProducts(category, searchQuery) {
    const container = document.getElementById('products-container');
    const infoElement = document.getElementById('search-info');
    if (!container) return;
    
    try {
        let products = [];
        let count = 0;
        
        // Проверяем авторизацию для загрузки количества в корзине
        let isLoggedIn = false;
        try {
            const authRes = await fetch('/api/check-auth', { credentials: 'same-origin' });
            const authResult = await authRes.json();
            isLoggedIn = authResult.isLoggedIn && authResult.role === 'user';
        } catch (e) {
        }
        
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
                <div class="click-details" onclick="window.router('/product/${product.id}'); history.pushState({}, '', '/product/${product.id}')">
                    <img src="${product.image_url || '/uploads/placeholder.jpg'}" alt="${product.name}">
                    <h3>${product.name}</h3>
                </div>
                <p class="product-desc">${product.description || 'Описание отсутствует'}</p>
                <div class="product-price">${parseFloat(product.price).toFixed(2)} BYN</div>
                <div id="cart-control-${product.id}" class="cart-control">
                    <button type="button" class="button-add-to-cart" onclick="addToCart(${product.id})">
                        🛒 Добавить в корзину
                    </button>
                </div>
            </div>
        ` ).join('');

        // Загрузка количества для каждого товара, если пользователь авторизован
        if (isLoggedIn) {
            products.forEach(product => {
                loadCartQuantity(product.id);
            });
        }

    } catch (err) {
        console.error('Ошибка загрузки товаров:', err);
        container.innerHTML = '<div style="text-align:center;grid-column:1/-1;color:var(--accent);font-size:1.2em">Ошибка загрузки товаров</div>';
    }
} 

// Загрузка количества товара в корзине (глобальная функция)
window.loadCartQuantity = async function(productId) {
    try {
        const res = await fetch(`/api/cart/quantity/${productId}`, { credentials: 'same-origin' });
        const result = await res.json();
        
        const controlDiv = document.getElementById(`cart-control-${productId}`);
        if (!controlDiv) return;
        
        if (result.success && result.quantity > 0) {
            controlDiv.innerHTML = `
                <div class="quantity-control-inline">
                    <button type="button" class="button-qty-small" onclick="decreaseQuantity(${productId})">−</button>
                    <span class="qty-value">${result.quantity}</span>
                    <button type="button" class="button-qty-small" onclick="increaseQuantity(${productId})">+</button>
                </div>
            `;
        } else {
            controlDiv.innerHTML = `
                <button type="button" class="button-add-to-cart" onclick="addToCart(${productId})">
                    🛒 Добавить в корзину
                </button>
            `;
        }
    } catch (err) {
        console.error('Ошибка загрузки количества:', err);
    }
}; 

// Глобальные функции для управления количеством
window.decreaseQuantity = async function(productId) {
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
        
        // Обновляем отображение
        await loadCartQuantity(productId);
        Toastify({ text: 'Количество изменено', duration: 2000, gravity: 'top', position: 'center', className: 'toastify-success' }).showToast();
    } catch (err) {
        Toastify({ text: 'Ошибка сервера', duration: 3000, gravity: 'top', position: 'center', className: 'toastify-error' }).showToast();
    }
}; 

window.increaseQuantity = async function(productId) {
    try {
        // Просто добавляем ещё один товар
        const addRes = await fetch('/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ product_id: productId, quantity: 1 })
        });
        const addResult = await addRes.json();
        
        if (addResult.success) {
            await loadCartQuantity(productId);
            Toastify({ text: 'Товар добавлен', duration: 2000, gravity: 'top', position: 'center', className: 'toastify-success' }).showToast();
        }
    } catch (err) {
        Toastify({ text: 'Ошибка сервера', duration: 3000, gravity: 'top', position: 'center', className: 'toastify-error' }).showToast();
    }
}; 