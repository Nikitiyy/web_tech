import { loadAdminName } from "./loadAdminName.js";

export function admin_add_admin() {
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
                <h2>Добавить администратора</h2>
                <p>Создание нового администратора</p>
            </div>
            
            <section class="add-product-section">
                <form class="add-product-form" id="add-admin-form">
                    <div class="form-group">
                        <label for="admin-login">Логин</label>
                        <input type="text" id="admin-login" class="input" placeholder="Придумайте логин (минимум 3 символа)" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="admin-password">Пароль</label>
                        <input type="password" id="admin-password" class="input" placeholder="Придумайте пароль (минимум 6 символов)" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="admin-password-confirm">Подтвердите пароль</label>
                        <input type="password" id="admin-password-confirm" class="input" placeholder="Повторите пароль" required>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="button-submit">➕ Добавить админа</button>
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
    
    document.getElementById('button_back').onclick = () => history.back();
    document.getElementById('button_logout').onclick = async () => {
        await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
        window.router('/');
        history.pushState({}, '', '/');
    };
    document.getElementById('button_cancel').onclick = () => history.back();
    
    document.getElementById('add-admin-form').onsubmit = async (e) => {
        e.preventDefault();
        
        const login = document.getElementById('admin-login').value.trim();
        const password = document.getElementById('admin-password').value;
        const passwordConfirm = document.getElementById('admin-password-confirm').value;
        
        if (password !== passwordConfirm) {
            Toastify({ text: 'Пароли не совпадают', duration: 3000, gravity: 'top', position: 'center', className: 'toastify-error' }).showToast();
            return;
        }
        
        if (password.length < 6) {
            Toastify({ text: 'Пароль минимум 6 символов', duration: 3000, gravity: 'top', position: 'center', className: 'toastify-error' }).showToast();
            return;
        }
        
        try {
            const res = await fetch('/api/admins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ login, password })
            });
            
            const result = await res.json();
            
            if (result.success) {
                Toastify({ text: 'Администратор добавлен', duration: 2000, gravity: 'top', position: 'center', className: 'toastify-success' }).showToast();
                window.router('/admin-admins');
                history.pushState({}, '', '/admin-admins');
            } else {
                Toastify({ text: result.message || 'Ошибка', duration: 3000, gravity: 'top', position: 'center', className: 'toastify-error' }).showToast();
            }
        } catch (err) {
            Toastify({ text: 'Ошибка сервера', duration: 3000, gravity: 'top', position: 'center', className: 'toastify-error' }).showToast();
        }
    };
}