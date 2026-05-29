import { loadAdminName } from "./loadAdminName";

export function admin_admins() {
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
                <h2>Управление администраторами</h2>
                <p>Создание и управление администраторами</p>
            </div>
            
            <section class="admin-products-section">
                <div class="admin-products-header">
                    <button type="button" id="button_add_admin" class="button-add-product">➕ Добавить админа</button>
                </div>
                
                <div class="products-table-container">
                    <table class="products-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Логин</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody id="admins-table-body">
                            <tr><td colspan="3">Загрузка...</td></tr>
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
    loadAdminsList();
    
    document.getElementById('button_back').onclick = () => history.back();
    document.getElementById('button_logout').onclick = async () => {
        await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
        window.router('/');
        history.pushState({}, '', '/');
    };
    document.getElementById('button_add_admin').onclick = () => {
        window.router('/admin-add-admin');
        history.pushState({}, '', '/admin-add-admin');
    };
}

async function loadAdminsList() {
    const tbody = document.getElementById('admins-table-body');
    if (!tbody) return;
    
    try {
        const res = await fetch('/api/admins', { credentials: 'same-origin' });
        const result = await res.json();
        
        if (!result.success || !result.admins || result.admins.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">Администраторов пока нет</td></tr>';
            return;
        }
        
        const currentAdminId = result.currentUserId ? parseInt(result.currentUserId) : null;
        
        tbody.innerHTML = result.admins.map(admin => {
            const isCurrentUser = currentAdminId !== null && parseInt(admin.id) === currentAdminId;
            
            return `
                <tr>
                    <td>${admin.id}</td>
                    <td class="product-name">${admin.login}</td>
                    <td>
                        ${isCurrentUser ? '<span style="color:var(--text-muted)">—</span>' : `<button class="button-delete" onclick="deleteAdmin(${admin.id})">🗑️ Удалить</button>`}
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="3">Ошибка загрузки</td></tr>';
    }
}

window.deleteAdmin = async function(id) {
    if (!confirm('Удалить администратора?')) return;
    try {
        const res = await fetch(`/api/admins/${id}`, { method: 'DELETE', credentials: 'same-origin' });
        const result = await res.json();
        if (result.success) {
            Toastify({ text: 'Администратор удалён', duration: 2000, gravity: 'top', position: 'center', className: 'toastify-success' }).showToast();
            loadAdminsList();
        } else {
            Toastify({ text: result.message || 'Ошибка', duration: 3000, gravity: 'top', position: 'center', className: 'toastify-error' }).showToast();
        }
    } catch (err) {
        Toastify({ text: 'Ошибка сервера', duration: 3000, gravity: 'top', position: 'center', className: 'toastify-error' }).showToast();
    }
};