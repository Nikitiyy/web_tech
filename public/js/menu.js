function main_menu() {
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
        router('/categories');
        history.pushState({}, '', '/categories');
    };

    const button_profile = document.getElementById('button_profile');
    button_profile.onclick = () => {
        router('/profile');
        history.pushState({}, '', '/profile');
    };

    const button_logout = document.getElementById('button_logout');
    button_logout.onclick = () => {        
        router('/');
        history.pushState({}, '', '/');
    };
}

function categories() {
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
                <h2>Категории товаров</h2>
            </div>
            
            <section class="categories-section">
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

    const allCategories = document.querySelectorAll('.category-item');
    allCategories.forEach(item => {
        item.onclick = () => {
            const category = item.getAttribute('data-category');
        
            if (category === 'all') {
                router('/products');
                history.pushState({}, '', '/products');
            } else {
                router(`/products?category=${category}`);
                history.pushState({}, '', `/products?category=${category}`);
            }
        };
    });


    const searchInput = document.getElementById('search-input');
    searchInput.oninput = () => {
        const query = searchInput.value;
    };

    const button_catalog = document.getElementById('button_catalog');
    button_catalog.onclick = () => {
        router('/categories');
        history.pushState({}, '', '/categories');
    };

    const button_profile = document.getElementById('button_profile');
    button_profile.onclick = () => {
        router('/profile');
        history.pushState({}, '', '/profile');
    };

    const button_logout = document.getElementById('button_logout');
    button_logout.onclick = () => {
        router('/');
        history.pushState({}, '', '/');
    };
}