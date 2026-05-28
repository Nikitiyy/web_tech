
export function admin_menu() {
    const main = document.querySelector('body');
    main.innerHTML = '';    

    const main_body = `
    <div class="page-container">
        <header class="header">
            <h1 class="logo">Админ Панель</h1>
            <nav class="header-right">
                <span class="admin-name" id="admin-name">Загрузка...</span>
                <button type="button" id="button_logout" class="button-header">
                    Выйти
                </button>
            </nav>
        </header>
        
        <main class="main-content">
            <div class="welcome-section">
                <h2>Панель администратора</h2>
                <p>Управление товарами и администраторами</p>
            </div>
            
            <section class="admin-section">
                <div class="admin-card" id="admin-products">
                    <h3>📦 Товары</h3>
                    <p>Управление ассортиментом товаров</p>
                </div>
                
                <div class="admin-card" id="admin-categories">
                    <h3>📁 Категории</h3>
                    <p>Управление категориями товаров</p>
                </div>
                
                <div class="admin-card" id="admin-admins">
                    <h3>👥 Администраторы</h3>
                    <p>Список администраторов</p>
                </div>
                
                <div class="admin-card" id="admin-add-admin">
                    <h3>➕ Добавить админа</h3>
                    <p>Создание нового администратора</p>
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
    
    const button_logout = document.getElementById('button_logout');
    button_logout.onclick = async () => {        
        await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
        window.router('/');
        history.pushState({}, '', '/');
    };
    
    const adminProducts = document.getElementById('admin-products');
    adminProducts.onclick = () => {
        window.router('/admin-products');
        history.pushState({}, '', '/admin-products');
    };
    
    const adminCategories = document.getElementById('admin-categories');
    adminCategories.onclick = () => {
        window.router('/admin-categories');
        history.pushState({}, '', '/admin-categories');
    };
    
    const adminAdmins = document.getElementById('admin-admins');
    adminAdmins.onclick = () => {
        window.router('/admin-admins');
        history.pushState({}, '', '/admin-admins');
    };
    
    const adminAddAdmin = document.getElementById('admin-add-admin');
    adminAddAdmin.onclick = () => {
        window.router('/admin-add-admin');
        history.pushState({}, '', '/admin-add-admin');
    };
}
    
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
                                <th>Фото</th>
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

window.editProduct = function(id) {
    Toastify({ text: 'Редактирование в разработке', duration: 2000, gravity: 'top', position: 'center', className: 'toastify-info' }).showToast();
};
    
async function loadAdminName() {
    try {
        const res = await fetch('/api/profile', { credentials: 'same-origin' });
        const result = await res.json();
        
        const adminNameEl = document.getElementById('admin-name');
        if (!adminNameEl) return;

        if (result.success && result.user) {
            adminNameEl.textContent = result.user.login;
        } else {
            adminNameEl.textContent = 'Админ';
        }
    } catch (err) {
        const adminNameEl = document.getElementById('admin-name');
        if (adminNameEl) {
            adminNameEl.textContent = 'Админ';
        }
    }
}

export function admin_add_product() {
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
                <h2>Добавить товар</h2>
                <p>Заполните форму для создания нового товара</p>
            </div>
            
            <section class="add-product-section">
                <form class="add-product-form" id="add-product-form">
                    <div class="form-group">
                        <label for="product-name">Название товара</label>
                        <input 
                            type="text" 
                            id="product-name" 
                            class="input" 
                            placeholder="Например: Электрогитара Fender"
                            required
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="product-description">Описание</label>
                        <textarea 
                            id="product-description" 
                            class="input" 
                            placeholder="Описание товара..."
                            rows="4"
                            required
                        ></textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="product-price">Цена (BYN)</label>
                            <input 
                                type="number" 
                                id="product-price" 
                                class="input" 
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                required
                            >
                        </div>
                        
                        <div class="form-group">
                            <label for="product-category">Категория</label>
                            <select id="product-category" class="input" required>
                                <option value="">Выберите категорию</option>
                                <!-- Категории загрузятся сюда -->
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="product-images">Изображения товара (до 5 шт.)</label>
                        <input 
                            type="file" 
                            id="product-images" 
                            class="input" 
                            accept="image/*"
                            multiple
                            required
                        >
                        <p style="color:var(--text-muted);font-size:.85em;margin-top:.3em">Первое фото будет главным</p>
                    </div>
                    
                    <div class="form-group checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="product-available" checked>
                            <span>Товар в наличии</span>
                        </label>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="button-submit">
                            ➕ Добавить товар
                        </button>
                        <button type="button" id="button_cancel" class="button-cancel">
                            Отмена
                        </button>
                    </div>
                </form>
            </section>
        </main>
        
        <footer class="footer">
            <p>&copy; 2026 Музыкальный Магазин</p>
        </footer>
    </div>
    `;
    
    main.innerHTML = main_body;
    
    loadAdminName();
    loadCategories();
    
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
    
    const button_cancel = document.getElementById('button_cancel');
    button_cancel.onclick = () => {
        history.back();
    };
    
    const form = document.getElementById('add-product-form');
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('name', document.getElementById('product-name').value);
        formData.append('description', document.getElementById('product-description').value);
        formData.append('price', document.getElementById('product-price').value);
        formData.append('category_id', document.getElementById('product-category').value);
        formData.append('is_available', document.getElementById('product-available').checked);
        
        const imageFiles = document.getElementById('product-images').files;
        for (let i = 0; i < imageFiles.length; i++) {
            formData.append('images', imageFiles[i]);
        }
        
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                credentials: 'same-origin',
                body: formData
            });
            
            const result = await res.json();
            
            if (result.success) {
                Toastify({
                    text: 'Товар успешно добавлен',
                    duration: 3000,
                    gravity: 'top',
                    position: 'center',
                    className: 'toastify-success'
                }).showToast();
                
                window.router('/admin-products');
                history.pushState({}, '', '/admin-products');
            } else {
                Toastify({
                    text: result.message || 'Ошибка при добавлении товара',
                    duration: 3000,
                    gravity: 'top',
                    position: 'center',
                    className: 'toastify-error'
                }).showToast();
            }
        } catch (err) {
            Toastify({
                text: 'Ошибка сервера',
                duration: 3000,
                gravity: 'top',
                position: 'center',
                className: 'toastify-error'
            }).showToast();
        }
    };
}

async function loadCategories() {
    try {
        const res = await fetch('/api/categories', { credentials: 'same-origin' });
        const result = await res.json();

        if (result.success) {
            const select = document.getElementById('product-category');
            if (select) {
                select.innerHTML = '<option value="">Выберите категорию</option>' +
                    result.categories.map(cat => 
                        `<option value="${cat.id}">${cat.name}</option>`
                    ).join('');
            }
            return result.categories;
        }
        return [];
    } catch (err) {
        console.error('Ошибка загрузки категорий:', err);
        return [];
    }
}

export function admin_categories() {
    const main = document.querySelector('body');
    main.innerHTML = '';    

    const main_body = `
    <div class="page-container">
        <header class="header">
            <h1 class="logo">Админ Панель</h1>
            <nav class="header-right">
                <button type="button" id="button_back" class="button-header">← Назад</button>
                <span class="admin-name" id="admin-name">Загрузка...</span>
                <button type="button" id="button_logout" class="button-header">Выйти</button>
            </nav>
        </header>
        
        <main class="main-content">
            <div class="welcome-section">
                <h2>Управление категориями</h2>
                <p>Добавление и удаление категорий товаров</p>
            </div>
            
            <section class="admin-products-section">
                <div class="admin-products-header">
                    <button type="button" id="button_add_category" class="button-add-product">➕ Добавить категорию</button>
                </div>
                
                <div class="products-table-container">
                    <table class="products-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Название</th>
                                <th>Slug</th>
                                <th>Родитель</th>
                                <th>Порядок</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody id="categories-table-body">
                            <tr><td colspan="6">Загрузка...</td></tr>
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
    loadCategoriesTable();
    
    document.getElementById('button_back').onclick = () => history.back();
    document.getElementById('button_logout').onclick = async () => {
        await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
        window.router('/');
        history.pushState({}, '', '/');
    };
    document.getElementById('button_add_category').onclick = () => {
        window.router('/admin-add-category');
        history.pushState({}, '', '/admin-add-category');
    };
}

async function loadCategoriesTable() {
    const categories = await loadCategories();
    const tbody = document.getElementById('categories-table-body');
    
    if (categories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">Категорий пока нет</td></tr>';
        return;
    }
    
    const parentMap = new Map(categories.map(c => [c.id, c.name]));
    
    tbody.innerHTML = categories.map(cat => `
        <tr>
            <td>${cat.id}</td>
            <td class="product-name">${cat.name}</td>
            <td>${cat.slug}</td>
            <td>${cat.parent_id ? (parentMap.get(cat.parent_id) || 'ID: ' + cat.parent_id) : '—'}</td>
            <td>${cat.display_order}</td>
            <td class="actions-cell">
                <button class="button-delete" onclick="deleteCategory(${cat.id})">🗑️ Удалить</button>
            </td>
        </tr>
    `).join('');
}

window.deleteCategory = async function(id) {
    if (!confirm('Удалить категорию?')) return;
    
    try {
        const res = await fetch(`/api/categories/${id}`, {
            method: 'DELETE',
            credentials: 'same-origin'
        });
        const result = await res.json();
        
        if (result.success) {
            Toastify({ text: 'Категория удалена', duration: 2000, gravity: 'top', position: 'center', className: 'toastify-success' }).showToast();
            loadCategoriesTable();
        } else {
            Toastify({ text: result.message || 'Ошибка', duration: 3000, gravity: 'top', position: 'center', className: 'toastify-error' }).showToast();
        }
    } catch (err) {
        Toastify({ text: 'Ошибка сервера', duration: 3000, gravity: 'top', position: 'center', className: 'toastify-error' }).showToast();
    }
};

export function admin_add_category() {
    const main = document.querySelector('body');
    main.innerHTML = '';    

    const main_body = `
    <div class="page-container">
        <header class="header">
            <h1 class="logo">Админ Панель</h1>
            <nav class="header-right">
                <button type="button" id="button_back" class="button-header">← Назад</button>
                <span class="admin-name" id="admin-name">Загрузка...</span>
                <button type="button" id="button_logout" class="button-header">Выйти</button>
            </nav>
        </header>
        
        <main class="main-content">
            <div class="welcome-section">
                <h2>Добавить категорию</h2>
                <p>Создание новой категории товаров</p>
            </div>
            
            <section class="add-product-section">
                <form class="add-product-form" id="add-category-form">
                    <div class="form-group">
                        <label for="category-name">Название категории</label>
                        <input type="text" id="category-name" class="input" placeholder="Например: Струнные инструменты" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="category-slug">Slug (URL-идентификатор)</label>
                        <input type="text" id="category-slug" class="input" placeholder="Например: strunye" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="category-parent">Родительская категория</label>
                        <select id="category-parent" class="input">
                            <option value="">— Корневая категория —</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="category-order">Порядок отображения</label>
                        <input type="number" id="category-order" class="input" value="0" min="0">
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="button-submit">➕ Добавить категорию</button>
                        <button type="button" id="button_cancel" class="button-cancel">Отмена</button>
                    </div>
                </form>
            </section>
        </main>
        
        <footer class="footer">
            <p>&copy; 2026 Музыкальный Магазин</p>
        </footer>
    </div>
    `;
    
    main.innerHTML = main_body;
    
    loadAdminName();
    loadParentCategories();
    
    document.getElementById('button_back').onclick = () => history.back();
    document.getElementById('button_logout').onclick = async () => {
        await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
        window.router('/');
        history.pushState({}, '', '/');
    };
    document.getElementById('button_cancel').onclick = () => history.back();
    
    // Автогенерация slug из названия
    document.getElementById('category-name').oninput = (e) => {
        const slug = e.target.value
            .toLowerCase()
            .replace(/[^a-zа-я0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);
        document.getElementById('category-slug').value = slug;
    };
    
    document.getElementById('add-category-form').onsubmit = async (e) => {
        e.preventDefault();
        
        const data = {
            name: document.getElementById('category-name').value.trim(),
            slug: document.getElementById('category-slug').value.trim(),
            display_order: parseInt(document.getElementById('category-order').value) || 0,
            parent_id: document.getElementById('category-parent').value || null
        };
        
        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify(data)
            });
            
            const result = await res.json();
            
            if (result.success) {
                Toastify({ text: 'Категория добавлена', duration: 2000, gravity: 'top', position: 'center', className: 'toastify-success' }).showToast();
                history.back();
            } else {
                Toastify({ text: result.message || 'Ошибка', duration: 3000, gravity: 'top', position: 'center', className: 'toastify-error' }).showToast();
            }
        } catch (err) {
            Toastify({ text: 'Ошибка сервера', duration: 3000, gravity: 'top', position: 'center', className: 'toastify-error' }).showToast();
        }
    };
}

async function loadParentCategories() {
    try {
        const res = await fetch('/api/categories', { credentials: 'same-origin' });
        const result = await res.json();

        if (result.success && result.categories) {
            const select = document.getElementById('category-parent');
            if (!select) return;
            
            select.innerHTML = '<option value="">— Корневая категория —</option>' +
                result.categories.map(cat => 
                    `<option value="${cat.id}">${cat.name}</option>`
                ).join('');
        }
    } catch (err) {
        console.error('Ошибка загрузки категорий:', err);
    }
}

