// router доступен через window.router

export function products(path) {
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
                        <input type="text" class="input-search" placeholder="Поиск товаров..." disabled style="opacity:0.5;cursor:not-allowed">
                    </div>
                </div>
                        ${images.length > 1 ? `
                        <div class="product-thumbnails">
                            ${images.map((img, index) => `
                                <img class="thumbnail ${img.is_main ? 'active' : ''}" 
                                     src="${img.image_url}" 
                                     data-src="${img.image_url}"
                                     onclick="changeMainImage(this)">
                            `).join('')}
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="product-details-info">
                        <h1 id="product-name">${product.name}</h1>
                        <p id="product-category" class="product-category">Категория: ${product.category_id}</p>
                        <p id="product-description" class="product-description">${product.description || 'Описание отсутствует'}</p>
                        <div class="product-details-price" id="product-price">${parseFloat(product.price).toFixed(2)} BYN</div>
                        
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
    } 