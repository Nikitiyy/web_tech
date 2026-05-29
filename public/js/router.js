import { login, recovery, reset_password, reg } from './auth.js';
import { main_menu, categories, profile, cart } from './menu.js';
import { admin_menu, admin_products, admin_add_product, admin_categories, admin_add_category, admin_edit_products, admin_admins, admin_add_admin } from './admin.js';
import { products, productDetails } from './products.js';

export async function router(path) {
    const main = document.querySelector('body');
    main.innerHTML = '';    

    // Извлекаем pathname без query string
    const pathname = path.split('?')[0];

    // Проверяем маршрут /product/{id}
    const productMatch = pathname.match(/^\/product\/(\d+)$/);
    if (productMatch) {
        await productDetails(parseInt(productMatch[1]));
        return;
    }

    switch(pathname) {
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
        case '/cart': {
            cart();
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
        case '/admin-admins': {
            admin_admins();
            break;
        }
        case '/admin-add-admin': {
            admin_add_admin();
            break;
        }
        case '/admin-edit-products': {
            admin_edit_products(path);
            break;
        }
        case '/admin-edit-products': {
            admin_edit_products();
            break;
        }
        case '/products':
        case '/profile': {
            if (pathname === '/products') {
                products(path);
            } else {
                profile();
            }
            break;
        }
        case '/admin-edit-products': {
            admin_edit_products(path);
            break;
        }
    }
}