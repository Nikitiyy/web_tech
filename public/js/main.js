import { router } from './router.js';

window.router = router;

import './auth.js';
import './cart.js';
import './categories.js';
import './main_menu.js';
import './products_details.js';
import './products.js';
import './profile.js';
import './recovery.js';
import './admin/admin_add_admin.js';
import './admin/admin_add_category.js';
import './admin/admin_add_product.js';
import './admin/admin_admins.js';
import './admin/admin_categories.js';
import './admin/admin_edit_product.js';
import './admin/admin_menu.js';
import './admin/admin_products.js';



window.addEventListener('popstate', () => {
    router(location.href.substring(location.origin.length));  
});

document.addEventListener('DOMContentLoaded', async () => {
    const res = await fetch('/api/check-auth', { credentials: 'same-origin' });
    const result = await res.json();
    
    if (result.isLoggedIn) {
        if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/reg') {
            const redirectPath = result.role === 'admin' ? '/main_admin' : '/main_menu';
            history.replaceState({}, '', redirectPath);
            router(redirectPath);
            return;
        }
    }
    
    router(location.href.substring(location.origin.length));
});