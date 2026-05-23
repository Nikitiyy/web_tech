import { router } from './router.js';

window.router = router;

import './auth.js';
import './menu.js';
import './products.js';
import './admin.js';

window.addEventListener('popstate', () => {
    router(location.pathname);  
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
    
    router(location.pathname);
});