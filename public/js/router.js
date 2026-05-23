import { login, recovery, reset_password, reg } from './auth.js';
import { main_menu, categories, profile } from './menu.js';
import { admin_menu } from './admin.js';
import { products } from './products.js';

export function router(path) {
    const main = document.querySelector('body');
    main.innerHTML = '';    

    console.log(path);
    switch(path) {
        case '/':
        case '/login': {
            login();
            break;
        }
        case '/recovery': {
            recovery();
            break;
        }
        case '/reset-password': {
            reset_password();
            break;
        }
        case '/reg': {
            reg();
            break;
        }
        case '/main_menu': {
            main_menu();
            break;
        }
        case '/guest_menu': {
            guest_menu();
            break;
        }
        case '/categories': {
            categories();
            break;
        }
        case '/main_admin': {
            admin_menu();
            break;
        }
        case '/profile': {
            profile();
            break;
        }
    }

    if (path.startsWith('/products')) {
        products();
        return;
    }
}