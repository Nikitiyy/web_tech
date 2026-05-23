
export function admin_menu() {
    const main = document.querySelector('body');
    main.innerHTML = '';    

    const main_body = `
    <div class="page-container">
        <header class="header">
            <h1 class="logo">Админ Панель</h1>
            <nav class="header-right">
                <button type="button" id="button_profile" class="button-header">
                    Профиль
                </button>
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
                
                <div class="admin-card" id="admin-add-products">
                    <h3>➕ Добавить товар</h3>
                    <p>Создание нового товара</p>
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
    
    const button_profile = document.getElementById('button_profile');
    button_profile.onclick = () => {
        window.router('/profile');
        history.pushState({}, '', '/profile');
    };
    
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
    
    const adminAddProducts = document.getElementById('admin-add-products');
    adminAddProducts.onclick = () => {
        window.router('/admin-add-products');
        history.pushState({}, '', '/admin-add-products');
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