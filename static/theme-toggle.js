// Получить текущую тему из localStorage или использовать 'dark' по умолчанию
function getCurrentTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        return savedTheme;
    }
    // Проверить системное предпочтение
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'dark';
}

// Применить тему
function applyTheme(theme) {
    const root = document.documentElement;
    const body = document.body;
    const themeBtn = document.getElementById('theme-toggle');

    if (theme === 'dark') {
        // Добавляем класс и на <html>, и на <body> чтобы избежать мерцания при прелоадере
        if (root) root.classList.add('dark-mode');
        if (body) body.classList.add('dark-mode');
        if (themeBtn) themeBtn.textContent = '☀️';
    } else {
        if (root) root.classList.remove('dark-mode');
        if (body) body.classList.remove('dark-mode');
        if (themeBtn) themeBtn.textContent = '🌙';
    }

    // Сохранить в localStorage
    localStorage.setItem('theme', theme);
}

// Переключить тему
function toggleTheme() {
    const currentTheme = getCurrentTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
}

// Инициализировать при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
    const theme = getCurrentTheme();
    applyTheme(theme);

    // Добавить обработчик клика на кнопку переключения
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }
});

// Если скрипт загружается после DOMContentLoaded
if (document.readyState !== 'loading') {
    const theme = getCurrentTheme();
    applyTheme(theme);

    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }
}
