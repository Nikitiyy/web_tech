import { login, recovery, reset_password, reg } from './auth.js';
import { main_menu, categories, profile } from './menu.js';
import { admin_menu, admin_products, admin_add_product, admin_categories, admin_add_category } from './admin.js';
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
        case '/admin-products': {
            admin_products();
            break;
        }
        case '/admin-add-products': {
            admin_add_product();
            break;
        }
        case '/admin-categories': {
            admin_categories();
            break;
        }
        case '/admin-add-category': {
            admin_add_category();
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