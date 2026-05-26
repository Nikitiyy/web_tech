export function main_menu() {
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
                <h2>Добро пожаловать!</h2>
                <p>Добро пожаловать в каталог товаров музыкального магазина!</p>
            </div>
            
            <section class="info-section">
                <h3>О нашем магазине</h3>
                <p>Наш магазин предлагает широкий ассортимент музыкальных инструментов и оборудования, доступный для покупки или предзаказа.</p>
            </section>
            
            <section class="features-section">
                <h3>Мы предоставляем возможность:</h3>
                <ul class="features-list">
                    <li>Просматривать товары</li>
                    <li>Бронировать выбранные товары</li>
                    <li>Получать помощь от наших консультантов</li>
                </ul>
            </section>
        </main>
        
        <footer class="footer">
            <p>&copy; 2026 Музыкальный Магазин. Все права защищены.</p>
        </footer>
    </div>
    `;
    
    main.innerHTML = main_body;

    const searchInput = document.getElementById('search-input');
    searchInput.oninput = () => {
        const query = searchInput.value;
        console.log('Поиск:', query);
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
}

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
    searchInput.oninput = () => {
        const query = searchInput.value;
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
        
        const allCard = container.querySelector('[data-category="all"]');
        container.innerHTML = '';
        if (allCard) container.appendChild(allCard);
        
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
                        <p>Подкатегория</p>
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

export function profile() {
    console.log("Profile");
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
                <button type="button" id="button_profile" class="button-header">
                    👤 Профиль
                </button>
                <button type="button" id="button_back" class="button-header">
                    ← Назад
                </button>
                <button type="button" id="button_logout" class="button-header">
                    Выйти
                </button>
            </nav>
        </header>
        
        <main class="main-content">
            <div class="welcome-section">
                <h2>Профиль пользователя</h2>
            </div>
            
            <section class="profile-section">
                <div class="profile-card">
                    <div class="profile-avatar">
                        👤
                    </div>
                    
                    <div class="profile-info">
                        <div class="info-row">
                            <span class="info-label">Имя пользователя:</span>
                            <span class="info-value" id="profile-login">Загрузка...</span>
                        </div>
                        
                        <div class="info-row">
                            <span class="info-label">Почта:</span>
                            <span class="info-value" id="profile-email">Загрузка...</span>
                        </div>
                    </div>
                    
                    <div class="profile-actions">
                        <button type="button" id="button_cart_large" class="button-cart">
                            🛒 Корзина
                        </button>
                    </div>
                </div>
            </section>
        </main>
        
        <footer class="footer">
            <p>&copy; 2026 Музыкальный Магазин. Все права защищены.</p>
        </footer>
    </div>
    `;
    
    main.innerHTML = main_body;

    // Загрузка данных профиля
    loadProfileData();

    const button_catalog = document.getElementById('button_catalog');
    button_catalog.onclick = () => {
        window.router('/categories');
        history.pushState({}, '', '/categories');
    };

    const button_cart_large = document.getElementById('button_cart_large');
    button_cart_large.onclick = () => {
        Toastify({
            text: 'Корзина пока пуста',
            duration: 3000,
            gravity: 'top',
            position: 'center',
            className: 'toastify-info'
        }).showToast();
    };

    const button_profile = document.getElementById('button_profile');
    button_profile.onclick = () => {
        Toastify({
            text: 'Вы уже на странице профиля',
            duration: 2000,
            gravity: 'top',
            position: 'center',
            className: 'toastify-info'
        }).showToast();
    };

    const button_back = document.getElementById('button_back');
    button_back.onclick = () => {
        history.back();
    };

    const button_logout = document.getElementById('button_logout');
    button_logout.onclick = async () => {
        await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
        window.router('/');
        history.pushState({}, '', '/');
    };
}

async function loadProfileData() {
    try {
        const res = await fetch('/api/profile', { credentials: 'same-origin' });
        const result = await res.json();
        
        if (result.success && result.user) {
            document.getElementById('profile-login').textContent = result.user.login;
            document.getElementById('profile-email').textContent = result.user.email;
        } else {
            document.getElementById('profile-login').textContent = 'Ошибка загрузки';
            document.getElementById('profile-email').textContent = 'Необходимо войти';
        }
    } catch (err) {
        document.getElementById('profile-login').textContent = 'Ошибка';
        document.getElementById('profile-email').textContent = 'Необходимо войти';
    }
}