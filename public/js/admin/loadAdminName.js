export async function loadAdminName() {
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