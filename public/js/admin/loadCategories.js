export async function loadCategories() {
    try {
        const res = await fetch('/api/categories', { credentials: 'same-origin' });
        const result = await res.json();

        if (result.success) {
            const select = document.getElementById('product-category');
            if (select) {
                select.innerHTML = '<option value="">Выберите категорию</option>' +
                    result.categories.map(cat => 
                        `<option value="${cat.id}">${cat.name}</option>`
                    ).join('');
            }
            return result.categories;
        }
        return [];
    } catch (err) {
        console.error('Ошибка загрузки категорий:', err);
        return [];
    }
}