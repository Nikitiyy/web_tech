window.addEventListener('popstate', () => {
    router(location.pathname);
});

document.addEventListener('DOMContentLoaded', () => {
    router(location.pathname);
});