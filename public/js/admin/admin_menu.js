import { loadAdminName } from './loadAdminName.js';

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

                <div class="admin-card" id="admin-reservations">
                    <h3>📌 Бронирования</h3>
                    <p>Управление забронированными товарами</p>
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

    const adminReservations = document.getElementById('admin-reservations');
    adminReservations.onclick = () => {
        window.router('/admin-reservations');
        history.pushState({}, '', '/admin-reservations');
    };
}