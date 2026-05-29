import { loadAdminName } from './loadAdminName.js';

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