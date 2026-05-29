import { loadAdminName } from "./loadAdminName.js";
import {loadCategories} from "./loadCategories.js";

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