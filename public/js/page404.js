export function page404() {
    const main = document.querySelector('body');
    main.innerHTML = '';

    const main_body = `
    <div class="page-container">
        <header class="header">
            <h1 class="logo">Музыкальный Магазин</h1>
            <nav class="header-right">
                <button type="button" id="button_home" class="button-header">🏠 На главную</button>
            </nav>
        </header>
        
        <main class="main-content">
            <div class="error-container">
                <div class="error-code">404</div>
                <h1 class="error-title">Страница не найдена</h1>
                <p class="error-message">
                    К сожалению, страница, которую вы ищете, не существует или была перемещена.
                </p>
                <div class="error-actions">
                    <button type="button" id="button_back_home" class="button-error-primary">
                        🏠 Вернуться на главную
                    </button>
                    <button type="button" id="button_back_history" class="button-error-secondary">
                        ← Назад
                    </button>
                </div>
                <div class="error-hint">
                    <p>Возможные причины:</p>
                    <ul>
                        <li>Неправильно введён адрес</li>
                        <li>Страница была удалена</li>
                        <li>Товар больше не доступен</li>
                    </ul>
                </div>
            </div>
        </main>
        
        <footer class="footer">
            <p>&copy; 2026 Музыкальный Магазин</p>
        </footer>
    </div>
    `;

    main.innerHTML = main_body;

    // Обработчики кнопок
    document.getElementById('button_home').onclick = () => {
        window.router('/');
        history.pushState({}, '', '/');
    };

    document.getElementById('button_back_home').onclick = () => {
        window.router('/');
        history.pushState({}, '', '/');
    };

    document.getElementById('button_back_history').onclick = () => {
        history.back();
    };
}
