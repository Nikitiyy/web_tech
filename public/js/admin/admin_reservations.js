import { loadAdminName } from './loadAdminName.js';

export function admin_reservations() {
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
                <h2>Бронирования</h2>
                <p>Управление забронированными товарами</p>
            </div>

            <section class="admin-products-section">
                <div class="products-table-container">
                    <table class="products-table">
                        <thead>
                            <tr>
                                <th>Фото</th>
                                <th>Товар</th>
                                <th>Цена (BYN)</th>
                                <th>Количество</th>
                                <th>Пользователь</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody id="reservations-table-body">
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
    loadReservations();

    document.getElementById('button_back').onclick = () => history.back();
    document.getElementById('button_logout').onclick = async () => {
        await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
        window.router('/');
        history.pushState({}, '', '/');
    };
}

async function loadReservations() {
    const tbody = document.getElementById('reservations-table-body');
    if (!tbody) return;

    try {
        const res = await fetch('/api/admin/reservations', { credentials: 'same-origin' });
        const result = await res.json();

        if (!result.success || !result.reservations || result.reservations.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">Активных бронирований нет</td></tr>';
            return;
        }

        tbody.innerHTML = result.reservations.map(r => `
            <tr>
                <td><img src="${r.image_url || '/uploads/placeholder.jpg'}" alt="${r.product_name}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;"></td>
                <td class="product-name">${r.product_name}</td>
                <td class="product-price">${parseFloat(r.price).toFixed(2)}</td>
                <td>${r.quantity}</td>
                <td>${r.user_login}</td>
                <td>
                    <button class="button-delete" onclick="deleteReservation(${r.id})">🗑️ Удалить</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="6">Ошибка загрузки</td></tr>';
    }
}

window.deleteReservation = async function(id) {
    if (!confirm('Удалить бронирование?')) return;
    try {
        const res = await fetch(`/api/admin/reservations/${id}`, {
            method: 'DELETE',
            credentials: 'same-origin'
        });
        const result = await res.json();

        if (result.success) {
            Toastify({ text: 'Бронирование удалено', duration: 2000, gravity: 'top', position: 'center', className: 'toastify-success' }).showToast();
            loadReservations();
        } else {
            Toastify({ text: result.message || 'Ошибка', duration: 3000, gravity: 'top', position: 'center', className: 'toastify-error' }).showToast();
        }
    } catch (err) {
        Toastify({ text: 'Ошибка сервера', duration: 3000, gravity: 'top', position: 'center', className: 'toastify-error' }).showToast();
    }
};
