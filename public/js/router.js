import { login, reg } from './auth.js';
import { cart } from './cart.js';
import { categories } from './categories.js';
import { main_menu } from './main_menu.js';
import { productDetails } from './products_details.js';
import { products } from './products.js';
import { profile } from './profile.js';
import { recovery, reset_password } from './recovery.js';
import { admin_add_admin } from './admin/admin_add_admin.js';
import { admin_add_category } from './admin/admin_add_category.js';
import { admin_add_product } from './admin/admin_add_product.js';
import { admin_admins } from './admin/admin_admins.js';
import { admin_categories } from './admin/admin_categories.js';
import { admin_edit_products } from './admin/admin_edit_product.js';
import { admin_menu } from './admin/admin_menu.js';
import { admin_products } from './admin/admin_products.js';
import { admin_reservations } from './admin/admin_reservations.js';




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
        case '/admin-reservations': {
            admin_reservations();
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