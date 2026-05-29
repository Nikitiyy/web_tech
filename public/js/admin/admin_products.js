import { loadAdminName } from './loadAdminName.js';

export function admin_products() {
    const main = document.querySelector('body');
    main.innerHTML = '';    

    const main_body = `
    <div class="page-container">
        <header class="header">
            <h1 class="logo">Админ Панель</h1>
            <nav class="header-right">
                <button type="button" id="button_back" class="button-header">
                    ← Назад
                </button>
                <span class="admin-name" id="admin-name">Загрузка...</span>
                <button type="button" id="button_logout" class="button-header">
                    Выйти
                </button>
            </nav>
        </header>
        
        <main class="main-content">
            <div class="welcome-section">
                <h2>Управление товарами</h2>
                <p>Редактирование и удаление товаров</p>
            </div>
            
            <section class="admin-products-section">
                <div class="admin-products-header">
                    <button type="button" id="button_add_product" class="button-add-product">
                        ➕ Добавить товар
                    </button>
                </div>
                
                <div class="products-table-container">
                    <table class="products-table">
                        <thead>
                            <tr>
                                <th>Главное фото</th>
                                <th>Название</th>
                                <th>Категория</th>
                                <th>Цена (BYN)</th>
                                <th>Наличие</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody id="products-table-body">
                            <!-- Товары загрузятся сюда -->
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
        
        <footer class="footer">
            <p>&copy; 2026 Музыкальный Магазин</p>
        </footer>
    </div>
    `;
    
    main.innerHTML = main_body;
    
    loadAdminName();
    loadAdminProducts();
    
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
    
    const button_add_product = document.getElementById('button_add_product');
    button_add_product.onclick = () => {
        window.router('/admin-add-products');
        history.pushState({}, '', '/admin-add-products');
    };
}
    
async function loadAdminProducts() {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="6">Загрузка...</td></tr>';
    
    try {
        const res = await fetch('/api/products?category=all', { credentials: 'same-origin' });
        const result = await res.json();
        
        if (!result.success || !result.products || result.products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7">Товаров пока нет</td></tr>';
            return;
        }
        
        tbody.innerHTML = result.products.map(p => `
            <tr>
                <td><img src="${p.image_url || '/uploads/placeholder.jpg'}" alt="${p.name}"></td>
                <td class="product-name">${p.name}</td>
                <td class="product-category">ID: ${p.category_id}</td>
                <td class="product-price">${parseFloat(p.price).toFixed(2)} BYN</td>
                <td class="${p.is_available ? 'product-available' : 'product-unavailable'}">${p.is_available ? '✅ В наличии' : '❌ Нет'}</td>
                <td class="actions-cell">
                    <button class="button-edit" onclick="editProduct(${p.id})">✏️ Изменить</button>
                    <button class="button-delete" onclick="deleteProduct(${p.id})">🗑️ Удалить</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="6">Ошибка загрузки</td></tr>';
    }
}

window.deleteProduct = async function(id) {
    if (!confirm('Удалить товар?')) return;
    try {
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE', credentials: 'same-origin' });
        const result = await res.json();
        if (result.success) {
            Toastify({ text: 'Товар удалён', duration: 2000, gravity: 'top', position: 'center', className: 'toastify-success' }).showToast();
            loadAdminProducts();
        } else {
            Toastify({ text: result.message || 'Ошибка', duration: 3000, gravity: 'top', position: 'center', className: 'toastify-error' }).showToast();
        }
    } catch (err) {
        Toastify({ text: 'Ошибка сервера', duration: 3000, gravity: 'top', position: 'center', className: 'toastify-error' }).showToast();
    }
};

window.editProduct = async function(id) {
    try {
        const res = await fetch(`/api/products/${id}`, { credentials: 'same-origin' });
        const result = await res.json();
        
        if (!result.success) {
            Toastify({ text: 'Ошибка загрузки данных', duration: 3000, gravity: 'top', position: 'center', className: 'toastify-error' }).showToast();
            return;
        }
        
        const { product, images } = result;
        
        // Сохраняем текущие фото для отправки при сохранении
        window.currentProductImages = images.map(img => ({ id: img.id, url: img.image_url, keep: true }));
        
        // Переходим на страницу редактирования
        window.router(`/admin-edit-products?id=${id}`);
        history.pushState({}, '', `/admin-edit-products?id=${id}`);
    } catch (err) {
        Toastify({ text: 'Ошибка сервера', duration: 3000, gravity: 'top', position: 'center', className: 'toastify-error' }).showToast();
    }
};``