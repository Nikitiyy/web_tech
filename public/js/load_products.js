export async function loadProducts(category, searchQuery) {
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
                <div class="click-details" onclick="window.router('/product/${product.id}'); history.pushState({}, '', '/product/${product.id}')">
                    <img src="${product.image_url || '/uploads/placeholder.jpg'}" alt="${product.name}">
                    <h3>${product.name}</h3>
                </div>
                <p class="product-desc">${product.description || 'Описание отсутствует'}</p>
                <div class="product-price">${parseFloat(product.price).toFixed(2)} BYN</div>
                <button type="button" class="button-add-to-cart" onclick="addToCart(${product.id})">
                    🛒 Добавить в корзину
                </button>
            </div>
        ` ).join('');


        
    } catch (err) {
        console.error('Ошибка загрузки товаров:', err);
        container.innerHTML = '<div style="text-align:center;grid-column:1/-1;color:var(--accent);font-size:1.2em">Ошибка загрузки товаров</div>';
    }
} 