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

function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function encodeFileName(fileName) {
    return encodeURIComponent(fileName).replace(/%2F/g, '/');
}

function buildPath(basePath, fileName) {
    return `${basePath}/${encodeFileName(fileName)}`;
}

function initGalleryRandomizer(galleryElement) {
    if (!galleryElement) return;

    const pools = {
        containers: [
            buildPath('/images/contayner/contayner1', 'photo_2026-02-13_00-11-36.jpg'),
            buildPath('/images/contayner/contayner1', 'photo_2026-02-13_00-11-36 (2).jpg'),
            buildPath('/images/contayner/contayner1', 'photo_2026-02-13_00-11-36 (3).jpg'),
            buildPath('/images/contayner/contayner1', 'photo_2026-02-13_00-11-36 (4).jpg'),
            buildPath('/images/contayner/contayner1', 'photo_2026-02-13_00-11-36 (5).jpg'),
            buildPath('/images/contayner/contayner1', 'photo_2026-02-13_00-11-36 (6).jpg'),
            buildPath('/images/contayner/contayner1', 'photo_2026-02-13_00-11-37.jpg'),
            buildPath('/images/contayner/contayner1', 'photo_2026-02-13_00-11-37 (2).jpg'),
            buildPath('/images/contayner/contayner1', 'photo_2026-02-13_00-11-37 (3).jpg'),
            buildPath('/images/contayner/contayner1', 'photo_2026-02-13_00-11-37 (4).jpg'),
            buildPath('/images/contayner/contayner2', 'photo_2026-02-13_00-07-41.jpg'),
            buildPath('/images/contayner/contayner2', 'photo_2026-02-13_00-07-41 (2).jpg'),
            buildPath('/images/contayner/contayner2', 'photo_2026-02-13_00-07-41 (3).jpg'),
            buildPath('/images/contayner/contayner2', 'photo_2026-02-13_00-07-42.jpg'),
            buildPath('/images/contayner/contayner2', 'photo_2026-02-13_00-07-42 (2).jpg'),
            buildPath('/images/contayner/contayner2', 'photo_2026-02-13_00-07-42 (3).jpg'),
            buildPath('/images/contayner/contayner2', 'photo_2026-02-13_00-07-42 (4).jpg'),
            buildPath('/images/contayner/contayner2', 'photo_2026-02-13_00-07-42 (5).jpg'),
            buildPath('/images/contayner/contayner2', 'photo_2026-02-13_00-07-43.jpg'),
            buildPath('/images/contayner/contayner2', 'photo_2026-02-13_00-07-43 (2).jpg'),
            buildPath('/images/contayner/contayner3', 'photo_2026-02-13_00-15-02.jpg'),
            buildPath('/images/contayner/contayner3', 'photo_2026-02-13_00-15-02 (2).jpg'),
            buildPath('/images/contayner/contayner3', 'photo_2026-02-13_00-15-03.jpg'),
            buildPath('/images/contayner/contayner3', 'photo_2026-02-13_00-15-03 (2).jpg'),
            buildPath('/images/contayner/contayner3', 'photo_2026-02-13_00-15-04.jpg'),
            buildPath('/images/contayner/contayner3', 'photo_2026-02-13_00-15-05.jpg'),
            buildPath('/images/contayner/contayner3', 'photo_2026-02-13_00-15-05 (2).jpg'),
            buildPath('/images/contayner/contayner4', 'photo_2026-02-13_00-09-46.jpg'),
            buildPath('/images/contayner/contayner4', 'photo_2026-02-13_00-09-46 (2).jpg'),
            buildPath('/images/contayner/contayner4', 'photo_2026-02-13_00-09-46 (3).jpg'),
            buildPath('/images/contayner/contayner4', 'photo_2026-02-13_00-09-46 (4).jpg')
        ],
        kiosks: [
            buildPath('/images/kiosks/kiosk-recycling', 'photo_2026-02-19_15-50-53.jpg'),
            buildPath('/images/kiosks/kiosk-recycling', 'photo_2026-02-19_15-50-55.jpg'),
            buildPath('/images/kiosks/kiosk-recycling', 'photo_2026-02-19_15-50-57.jpg'),
            buildPath('/images/kiosks/kiosk-recycling', 'photo_2026-02-19_15-50-58.jpg'),
            buildPath('/images/kiosks/kiosk1', 'photo_2026-02-19_16-02-11.jpg'),
            buildPath('/images/kiosks/kiosk1', 'photo_2026-02-19_16-02-20.jpg'),
            buildPath('/images/kiosks/kiosk1', 'photo_2026-02-19_16-02-24.jpg'),
            buildPath('/images/kiosks/kiosk2', 'photo_2026-02-13_00-23-41.jpg'),
            buildPath('/images/kiosks/kiosk2', 'photo_2026-02-13_00-23-41 (2).jpg'),
            buildPath('/images/kiosks/kiosk2', 'photo_2026-02-13_00-23-41 (3).jpg'),
            buildPath('/images/kiosks/kiosk2', 'photo_2026-02-13_00-23-41 (4).jpg'),
            buildPath('/images/kiosks/recycling-kiosk', 'photo_1_2026-02-13_00-15-45.jpg'),
            buildPath('/images/kiosks/recycling-kiosk', 'photo_2_2026-02-13_00-15-45.jpg'),
            buildPath('/images/kiosks/recycling-kiosk', 'photo_3_2026-02-13_00-15-45.jpg'),
            buildPath('/images/kiosks/recycling-kiosk', 'photo_4_2026-02-13_00-15-45.jpg')
        ],
        itr: [
            buildPath('/images/itr', 'WhatsApp Image 2026-03-06 at 23.12.17.jpeg'),
            buildPath('/images/itr', 'WhatsApp Image 2026-03-06 at 23.12.17 (1).jpeg'),
            buildPath('/images/itr', 'WhatsApp Image 2026-03-06 at 23.12.26.jpeg'),
            buildPath('/images/itr', 'WhatsApp Image 2026-03-06 at 23.12.26 (1).jpeg'),
            buildPath('/images/itr', 'WhatsApp Image 2026-03-06 at 23.12.27.jpeg'),
            buildPath('/images/itr', 'WhatsApp Image 2026-03-06 at 23.12.27 (1).jpeg')
        ]
    };

    const labels = {
        containers: 'Евро-контейнер',
        kiosks: 'Модульный киоск',
        itr: 'ИТР'
    };

    const groupedItems = {
        containers: [],
        kiosks: [],
        itr: []
    };

    galleryElement.querySelectorAll('.gallery-item').forEach(item => {
        const type = item.dataset.type;
        if (groupedItems[type]) {
            groupedItems[type].push(item);
        }
    });

    Object.keys(groupedItems).forEach(type => {
        const items = groupedItems[type];
        const pool = pools[type];
        if (!items.length || !pool || !pool.length) return;

        const shuffled = shuffleArray(pool);
        items.forEach((item, index) => {
            const img = item.querySelector('img');
            const title = item.querySelector('h3');
            if (!img) return;

            const src = shuffled[index % shuffled.length];
            img.src = src;
            img.alt = `${labels[type] || 'Фото'} ${index + 1}`;
            if (title) {
                title.textContent = `${labels[type] || 'Фото'} ${index + 1}`;
            }
        });
    });
}

const gallery = document.getElementById('gallery-container');
if (gallery) {
    initGalleryRandomizer(gallery);

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

// Toggle search panel + search logic
const searchToggleBtn = document.querySelector('.search-toggle-btn');
const headerTop = document.querySelector('.header-top');
const searchPanel = document.querySelector('.search-panel');
const searchPanelInput = document.querySelector('.search-panel-input');
const searchPanelBtn = document.querySelector('.search-panel-btn');
const searchSuggestions = document.querySelector('.search-suggestions');
const searchResults = document.querySelector('.search-results');

const SEARCH_INDEX_KEY = 'siteSearchIndex_v2';
let searchIndexPromise = null;

function normalizeText(value) {
    return (value || '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}

function getSnippet(text, query) {
    const clean = (text || '').replace(/\s+/g, ' ').trim();
    if (!clean) return '';
    const idx = clean.toLowerCase().indexOf(query);
    if (idx === -1) return clean.slice(0, 90) + (clean.length > 90 ? '...' : '');
    const start = Math.max(0, idx - 30);
    const end = Math.min(clean.length, idx + 70);
    const prefix = start > 0 ? '...' : '';
    const suffix = end < clean.length ? '...' : '';
    return prefix + clean.slice(start, end) + suffix;
}

async function buildSearchIndex() {
    try {
        const cached = localStorage.getItem(SEARCH_INDEX_KEY);
        if (cached) return JSON.parse(cached);
    } catch (e) {
        // ignore cache errors
    }

    try {
        const sitemapResponse = await fetch('/sitemap.xml', { cache: 'no-store' });
        const sitemapText = await sitemapResponse.text();
        const xml = new DOMParser().parseFromString(sitemapText, 'application/xml');
        const urls = Array.from(xml.getElementsByTagName('loc'))
            .map(node => (node.textContent || '').trim())
            .filter(url => url && (url.endsWith('/') || url.endsWith('.html')));

        const pages = await Promise.all(urls.map(async (url) => {
            try {
                const pageResponse = await fetch(url, { cache: 'no-store' });
                const html = await pageResponse.text();
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const cards = Array.from(doc.querySelectorAll('.service-card'));
                if (!cards.length) return [];

                return cards.map((card) => {
                    const title = (card.querySelector('h3')?.textContent || '').trim();
                    const desc = (card.querySelector('p')?.textContent || '').trim();
                    const listText = Array.from(card.querySelectorAll('li'))
                        .map(li => li.textContent.trim())
                        .join(' ');
                    const text = normalizeText([title, desc, listText].join(' ')).slice(0, 3000);
                    const snippet = [desc, listText].filter(Boolean).join(' ').slice(0, 200);
                    const anchor = card.id ? `#${card.id}` : '';
                    return {
                        title: title || 'Услуга',
                        url: `${url}${anchor}`,
                        snippet,
                        text
                    };
                });
            } catch (e) {
                return [];
            }
        }));

        const index = pages.flat().filter(Boolean);
        try {
            localStorage.setItem(SEARCH_INDEX_KEY, JSON.stringify(index));
        } catch (e) {
            // ignore storage errors
        }
        return index;
    } catch (e) {
        return [];
    }
}

async function getSearchIndex() {
    if (!searchIndexPromise) {
        searchIndexPromise = buildSearchIndex();
    }
    return searchIndexPromise;
}

function clearSearchUI() {
    if (searchSuggestions) searchSuggestions.innerHTML = '';
    if (searchResults) searchResults.innerHTML = '';
    if (searchPanel) searchPanel.classList.remove('has-results');
}

function renderSuggestions(list) {
    if (!searchSuggestions) return;
    searchSuggestions.innerHTML = '';
    list.forEach((text) => {
        const item = document.createElement('li');
        item.textContent = text;
        item.addEventListener('click', () => {
            if (searchPanelInput) searchPanelInput.value = text;
            runSearch();
        });
        searchSuggestions.appendChild(item);
    });
}

function renderResults(items, query) {
    if (!searchResults) return;
    searchResults.innerHTML = '';
    if (!items.length) {
        const empty = document.createElement('div');
        empty.className = 'search-empty';
        empty.textContent = 'Ничего не найдено.';
        searchResults.appendChild(empty);
        return;
    }

    items.forEach((item) => {
        const link = document.createElement('a');
        link.className = 'search-result-item';
        link.href = item.url;

        const title = document.createElement('span');
        title.className = 'search-result-title';
        title.textContent = item.title;

        const snippet = document.createElement('span');
        snippet.className = 'search-result-snippet';
        snippet.textContent = getSnippet(item.snippet, query);

        link.appendChild(title);
        link.appendChild(snippet);
        searchResults.appendChild(link);
    });
}

async function runSearch() {
    if (!searchPanelInput) return;
    const query = normalizeText(searchPanelInput.value);
    if (query.length < 2) {
        clearSearchUI();
        return;
    }

    const index = await getSearchIndex();
    const results = index.filter(item => item.text.includes(query)).slice(0, 10);
    const suggestions = Array.from(new Set(results.map(item => item.title))).slice(0, 5);

    renderSuggestions(suggestions);
    renderResults(results, query);

    if (searchPanel) searchPanel.classList.add('has-results');
}

if (searchToggleBtn && headerTop) {
    searchToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        headerTop.classList.toggle('search-active');
        const isOpen = headerTop.classList.contains('search-active');
        if (searchPanel) searchPanel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
        if (isOpen && searchPanelInput) {
            setTimeout(() => searchPanelInput.focus(), 120);
        } else {
            clearSearchUI();
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.header-top')) {
            headerTop.classList.remove('search-active');
            if (searchPanel) searchPanel.setAttribute('aria-hidden', 'true');
            clearSearchUI();
        }
    });
}

if (searchPanelInput) {
    let typingTimer = null;
    searchPanelInput.addEventListener('input', () => {
        if (typingTimer) clearTimeout(typingTimer);
        typingTimer = setTimeout(runSearch, 200);
    });

    searchPanelInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            runSearch();
        }
    });
}

if (searchPanelBtn) {
    searchPanelBtn.addEventListener('click', runSearch);
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