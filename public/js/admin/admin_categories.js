import { loadAdminName } from './admin_name.js';

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