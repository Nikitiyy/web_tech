import { TIME_OUT } from "./timeOut.js";
import { showSpinner, hideSpinner } from "./spinner.js";

export async function categories() {
    const main = document.querySelector('body');
    main.innerHTML = '';

    const main_body = `
    <div class="page-container">
        <header class="header">
            <h1 class="logo">Музыкальный Магазин</h1>
            <div class="header-center">
                <button type="button" id="button_catalog" class="button-header">
                    Каталог
                </button>
                <div class="header-search">
                    <input 
                        type="text" 
                        id="search-input" 
                        class="input-search" 
                        placeholder="Поиск товаров..."
                    >
                </div>
            </div>
            <nav class="header-right">
                <button type="button" id="button_cart" class="button-header">
                    🛒 Корзина
                </button>
                <button type="button" id="button_back" class="button-header">
                    ← Назад
                </button>
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
                <h2>Категории товаров</h2>
            </div>
            
            <section class="categories-section" id="categories-container">
                <div class="category-item" data-category="all">
                    <h3>Всё</h3>
                    <p>Все товары магазина</p>
                </div>
            </section>
        </main>
        
        <footer class="footer">
            <p>&copy; 2026 Музыкальный Магазин. Все права защищены.</p>
        </footer>
    </div>
    `;
    
    main.innerHTML = main_body;
    
    await loadUserCategories();

    const searchInput = document.getElementById('search-input');
    let searchTimeout = null;
    searchInput.oninput = (e) => {
        const query = e.target.value.trim();
        if (searchTimeout) clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            showSpinner();

        try {
            if (query.length >= 2) {
                window.router(`/products?search=${encodeURIComponent(query)}`);
                history.pushState({}, '', `/products?search=${encodeURIComponent(query)}`);
            } else if (query.length === 0) {
                window.router('/products');
                history.pushState({}, '', '/products');
            }
        } finally {
            hideSpinner();
        }
        }, TIME_OUT);
    };
    
    const button_catalog = document.getElementById('button_catalog');
    button_catalog.onclick = () => {
        window.router('/categories');
        history.pushState({}, '', '/categories');
    };
    
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

    const button_back = document.getElementById('button_back');
    button_back.onclick = () => {
        history.back();
    };
}

async function loadUserCategories() {
    const container = document.getElementById('categories-container');
    if (!container) return;
    
    try {
        const res = await fetch('/api/categories', { credentials: 'same-origin' });
        const result = await res.json();
        
        if (!result.success || !result.categories || result.categories.length === 0) {
            container.innerHTML = '<div class="category-item" data-category="all" onclick="window.router(\'/products?category=all\'); history.pushState({}, \'\', \'/products?category=all\');"><h3>Всё</h3><p>Все товары магазина</p></div>';
            return;
        }
        
        const categories = result.categories;
        const parentMap = new Map();
        
        categories.forEach(cat => {
            const parentId = cat.parent_id !== null ? String(cat.parent_id) : 'root';
            if (!parentMap.has(parentId)) {
                parentMap.set(parentId, []);
            }
            parentMap.get(parentId).push(cat);
        });
        
        container.innerHTML = '';
        
        // Добавляем "Всё"
        const allCard = document.createElement('div');
        allCard.className = 'category-item';
        allCard.setAttribute('data-category', 'all');
        allCard.innerHTML = '<h3>Всё</h3><p>Все товары магазина</p>';
        allCard.onclick = () => {
            window.router('/products?category=all');
            history.pushState({}, '', '/products?category=all');
        };
        container.appendChild(allCard);
        
        const rootCategories = parentMap.get('root') || [];
        
        rootCategories.forEach(rootCat => {
            const children = parentMap.get(String(rootCat.id)) || [];
            
            const group = document.createElement('div');
            group.className = 'category-group';
            
            // Родительская категория
            const rootItem = document.createElement('div');
            rootItem.className = 'category-item';
            rootItem.setAttribute('data-category', rootCat.slug);
            rootItem.innerHTML = `
                <h3>${rootCat.name}</h3>
                <p>Товары категории</p>
            `;
            rootItem.onclick = () => {
                window.router(`/products?category=${rootCat.slug}`);
                history.pushState({}, '', `/products?category=${rootCat.slug}`);
            };
            group.appendChild(rootItem);
            
            // Дочерние категории
            if (children.length > 0) {
                const childrenContainer = document.createElement('div');
                childrenContainer.className = 'category-children';
                
                children.forEach(child => {
                    const childItem = document.createElement('div');
                    childItem.className = 'category-item category-child';
                    childItem.setAttribute('data-category', child.slug);
                    childItem.innerHTML = `
                        <h3>${child.name}</h3>
                        <p>Товары подкатегории</p>
                    `;
                    childItem.onclick = () => {
                        window.router(`/products?category=${child.slug}`);
                        history.pushState({}, '', `/products?category=${child.slug}`);
                    };
                    childrenContainer.appendChild(childItem);
                });
                
                group.appendChild(childrenContainer);
            }
            
            container.appendChild(group);
        });
    } catch (err) {
        console.error('Ошибка загрузки категорий:', err);
    }
}