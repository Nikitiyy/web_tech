import { loadAdminName } from "./loadAdminName.js";

export function admin_edit_products(path) {
    const main = document.querySelector('body');
    const queryString = path ? path.split('?')[1] : window.location.search.substring(1);
    const urlParams = new URLSearchParams(queryString);
    const productId = urlParams.get('id');

    if (!productId) {
        window.router('/admin-products');
        history.pushState({}, '', '/admin-products');
        return;
    }
    
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
                <h2>Редактировать товар</h2>
                <p>Изменение данных товара</p>
            </div>
            
            <section class="add-product-section">
                <form class="add-product-form" id="edit-product-form">
                    <div class="form-group">
                        <label for="product-name">Название товара</label>
                        <input type="text" id="product-name" class="input" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="product-description">Описание</label>
                        <textarea id="product-description" class="input" rows="4" required></textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="product-price">Цена (BYN)</label>
                            <input type="number" id="product-price" class="input" step="0.01" min="0" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="product-category">Категория</label>
                            <select id="product-category" class="input" required></select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Текущие изображения</label>
                        <div id="existing-images-container" style="display:flex;gap:.5em;flex-wrap:wrap;margin:.5em 0"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="product-images-new">Добавить новые изображения (до 5)</label>
                        <input type="file" id="product-images-new" class="input" accept="image/*" multiple>
                        <p style="color:var(--text-muted);font-size:.85em;margin-top:.3em">Новые фото добавятся к существующим</p>
                    </div>
                    
                    <div class="form-group checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="product-available">
                            <span>Товар в наличии</span>
                        </label>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="button-submit">💾 Сохранить</button>
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
    loadCategoriesForEdit();
    loadProductData(productId);
    
    document.getElementById('button_back').onclick = () => history.back();
    document.getElementById('button_logout').onclick = async () => {
        await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
        window.router('/');
        history.pushState({}, '', '/');
    };
    document.getElementById('button_cancel').onclick = () => history.back();
    
    document.getElementById('edit-product-form').onsubmit = async (e) => {
        e.preventDefault();
        await saveProduct(productId);
    };
}

async function loadProductData(productId) {
    try {
        const res = await fetch(`/api/products/${productId}`, { credentials: 'same-origin' });
        const result = await res.json();
        
        if (!result.success) {
            Toastify({ text: 'Ошибка загрузки', duration: 3000, gravity: 'top', position: 'center', className: 'toastify-error' }).showToast();
            return;
        }
        
        const { product, images } = result;
        
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-category').value = product.category_id;
        document.getElementById('product-available').checked = product.is_available === 1;
        
        window.currentProductImages = images.map(img => ({ id: img.id, url: img.image_url, keep: true }));
        renderExistingImages();
    } catch (err) {
        Toastify({ text: 'Ошибка загрузки', duration: 3000, gravity: 'top', position: 'center', className: 'toastify-error' }).showToast();
    }
}

function renderExistingImages() {
    const container = document.getElementById('existing-images-container');
    if (!container) return;
    
    container.innerHTML = window.currentProductImages.map(img => `
        <div style="position:relative;display:inline-block;width:80px;margin:.2em">
            <img src="${img.url}" style="width:100%;height:80px;object-fit:cover;border-radius:var(--r-sm);border:2px solid var(--white-10)">
            <button type="button" onclick="toggleImageKeep(${img.id})" 
                style="position:absolute;top:2px;right:2px;background:rgba(233,69,96,.9);color:#fff;border:none;border-radius:50%;width:24px;height:24px;cursor:pointer;font-size:14px">
                ${img.keep ? '✓' : '✗'}
            </button>
        </div>
    `).join('');
}

window.toggleImageKeep = function(imgId) {
    const img = window.currentProductImages.find(i => i.id === imgId);
    if (img) {
        img.keep = !img.keep;
        renderExistingImages();
    }
};

async function loadCategoriesForEdit() {
    try {
        const res = await fetch('/api/categories', { credentials: 'same-origin' });
        const result = await res.json();
        
        if (result.success) {
            const select = document.getElementById('product-category');
            if (select) {
                select.innerHTML = result.categories.map(cat => 
                    `<option value="${cat.id}">${cat.name}</option>`
                ).join('');
            }
        }
    } catch (err) {
        console.error('Ошибка загрузки категорий:', err);
    }
}

async function saveProduct(productId) {
    const formData = new FormData();
    formData.append('name', document.getElementById('product-name').value);
    formData.append('description', document.getElementById('product-description').value);
    formData.append('price', document.getElementById('product-price').value);
    formData.append('category_id', document.getElementById('product-category').value);
    formData.append('is_available', document.getElementById('product-available').checked);
    
    formData.append('existing_images', JSON.stringify(window.currentProductImages));
    
    const newFiles = document.getElementById('product-images-new').files;
    for (let i = 0; i < newFiles.length; i++) {
        formData.append('images', newFiles[i]);
    }
    
    try {
        const res = await fetch(`/api/products/${productId}`, {
            method: 'PUT',
            credentials: 'same-origin',
            body: formData
        });
        
        const result = await res.json();
        
        if (result.success) {
            Toastify({ text: 'Товар сохранён', duration: 2000, gravity: 'top', position: 'center', className: 'toastify-success' }).showToast();
            window.router('/admin-products');
            history.pushState({}, '', '/admin-products');
        } else {
            Toastify({ text: result.message || 'Ошибка', duration: 3000, gravity: 'top', position: 'center', className: 'toastify-error' }).showToast();
        }
    } catch (err) {
        Toastify({ text: 'Ошибка сервера', duration: 3000, gravity: 'top', position: 'center', className: 'toastify-error' }).showToast();
    }
}