// Вкладки (активируются только если есть элементы)
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
if (tabs.length && tabContents.length) {
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            tabContents.forEach(c => c.classList.remove('active'));
            const target = document.getElementById(tab.dataset.target);
            if (target) target.classList.add('active');
        });
    });
}

// Вкладки проектов
const projectsTabs = document.querySelectorAll('.projects-tab');
if (projectsTabs.length) {
    projectsTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            projectsTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const targetValue = tab.dataset.target;
            const projectsContents = document.querySelectorAll('.projects-content');
            projectsContents.forEach(content => content.classList.remove('active'));

            const activeContent = document.getElementById(targetValue);
            if (activeContent) activeContent.classList.add('active');

            // Сбросить на первую страницу при смене вкладки
            resetProjectsPage();
        });
    });
}

// Листание проектов
const CARDS_PER_PAGE = 4;
let currentPage = 1;

function updateProjectsDisplay() {
    const activeContent = document.querySelector('.projects-content.active');
    if (!activeContent) return;

    const cards = activeContent.querySelectorAll('.project-card');
    const totalPages = Math.ceil(cards.length / CARDS_PER_PAGE);

    // Скрыть все карточки
    cards.forEach(card => card.style.display = 'none');

    // Показать карточки текущей страницы
    const startIdx = (currentPage - 1) * CARDS_PER_PAGE;
    const endIdx = startIdx + CARDS_PER_PAGE;

    for (let i = startIdx; i < endIdx && i < cards.length; i++) {
        cards[i].style.display = 'block';
    }

    // Обновить информацию о странице
    document.querySelector('.current-page').textContent = currentPage;
    document.querySelector('.total-pages').textContent = totalPages;

    // Обновить состояние кнопок
    document.querySelector('.prev-btn').disabled = currentPage === 1;
    document.querySelector('.next-btn').disabled = currentPage === totalPages;
}

function resetProjectsPage() {
    currentPage = 1;
    updateProjectsDisplay();
}

// Обработчики кнопок листания
const paginationBtns = document.querySelectorAll('.pagination-btn');
paginationBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const activeContent = document.querySelector('.projects-content.active');
        const cards = activeContent.querySelectorAll('.project-card');
        const totalPages = Math.ceil(cards.length / CARDS_PER_PAGE);

        if (action === 'next' && currentPage < totalPages) {
            currentPage++;
        } else if (action === 'prev' && currentPage > 1) {
            currentPage--;
        }

        updateProjectsDisplay();
    });
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    updateProjectsDisplay();
});

// Фильтр галереи
const searchBtn = document.getElementById('search-btn');
function applyFilter() {
    const searchInput = document.getElementById('search');
    const filterSelect = document.getElementById('filter');
    if (!searchInput || !filterSelect) return;
    const searchValue = searchInput.value.toLowerCase();
    const filterValue = filterSelect.value;
    const items = document.querySelectorAll('.gallery-item');
    items.forEach(item => {
        const h3 = item.querySelector('h3');
        const title = h3 ? h3.textContent.toLowerCase() : '';
        const type = item.dataset.type;
        if ((title.includes(searchValue) || searchValue === '') && (filterValue === 'all' || type === filterValue)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}
if (searchBtn) searchBtn.addEventListener('click', applyFilter);

// Подсветка активной ссылки в боковой панели
const sidebarLinks = document.querySelectorAll('.sidebar a');
if (sidebarLinks.length) {
    const current = location.pathname.split('/').pop() || '/';
    sidebarLinks.forEach(link => {
        const href = link.getAttribute('href').split('/').pop();
        if (href === current || (current === '' && href === '/')) {
            link.classList.add('active');
        }
    });
}

// Перетаскивание блоков галереи
let dragItem = null;
document.querySelectorAll('.draggable').forEach(item => {
    item.setAttribute('draggable', true);
    item.addEventListener('dragstart', e => { dragItem = item; });
    item.addEventListener('dragend', e => { dragItem = null; });
});

const gallery = document.getElementById('gallery-container');
if (gallery) {
    gallery.addEventListener('dragover', e => e.preventDefault());
    gallery.addEventListener('drop', e => {
        e.preventDefault();
        if (dragItem) {
            let afterElement = document.elementFromPoint(e.clientX, e.clientY);
            if (afterElement && afterElement.parentElement === gallery && afterElement !== dragItem) {
                gallery.insertBefore(dragItem, afterElement.nextSibling);
            }
        }
    });
}

// Hero слайдер с переключением картинок
const heroButtons = document.querySelectorAll('.hero-btn');
const heroImages = document.querySelectorAll('.hero-img');

if (heroButtons.length && heroImages.length) {
    // Убрать текст из кнопок
    heroButtons.forEach(btn => {
        btn.textContent = '';
    });

    heroButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);

            // Снимаем активный класс со всех
            heroButtons.forEach(b => b.classList.remove('active'));
            heroImages.forEach(img => img.classList.remove('active'));

            // Добавляем на нужные
            btn.classList.add('active');
            heroImages[index].classList.add('active');
        });
    });
}

// Прячем header-nav при скролле и поднимаем кнопки
const header = document.querySelector('header');
const headerNav = document.querySelector('.header-nav');
let scrollTimeout;

if (header && headerNav) {
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        scrollTimeout = setTimeout(() => {
            if (scrollTop > 150) {
                header.classList.add('collapsed');
            } else {
                header.classList.remove('collapsed');
            }
        }, 0);
    }, { passive: true });
}
// Открытие/закрытие поисковика
const searchToggleBtn = document.querySelector('.search-toggle-btn');
const headerTop = document.querySelector('.header-top');

if (searchToggleBtn && headerTop) {
    searchToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        headerTop.classList.toggle('search-active');

        // Фокус на input при открытии
        const searchInput = document.getElementById('search');
        if (headerTop.classList.contains('search-active') && searchInput) {
            setTimeout(() => searchInput.focus(), 100);
        }
    });

    // Закрытие поисковика при клике вне его
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.header-top')) {
            headerTop.classList.remove('search-active');
        }
    });
}

// Обработчик кнопок "Подробнее" в услугах
const serviceButtons = document.querySelectorAll('.service-btn');
serviceButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const card = btn.closest('.service-card');
        const title = card.querySelector('h3').textContent;
        alert(`Для услуги "${title}" требуется консультация. Пожалуйста, свяжитесь с нами через форму контактов.`);
    });
});