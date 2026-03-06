/**
 * Скрипт для исправления SEO на основных страницах сайта:
 * - Исправляет сломанную HTML структуру (двойные </head>)
 * - Добавляет реальный ID Яндекс.Метрики (106918295)
 * - Добавляет meta description, canonical, robots, og: теги
 * - Добавляет BreadcrumbList schema
 * - Добавляет GA4
 */

const fs = require('fs');
const path = require('path');

const REAL_METRIKA_ID = '106918295';
const GA4_ID = 'G-8G7N29FJK';

const pages = [
  {
    file: 'about/index.html',
    title: 'О компании Evrocontayner — производство киосков и контейнеров в Казахстане',
    description: 'Evrocontayner — ведущий производитель модульных киосков, павильонов и контейнеров в Казахстане с 2010 года. Более 500 реализованных проектов, собственное производство, гарантия качества.',
    canonical: 'https://evrocontayner.kz/about/',
    breadcrumbs: [
      { pos: 1, name: 'Главная', url: 'https://evrocontayner.kz/' },
      { pos: 2, name: 'О компании', url: 'https://evrocontayner.kz/about/' }
    ]
  },
  {
    file: 'contact/index.html',
    title: 'Контакты Evrocontayner — связаться с нами',
    description: 'Свяжитесь с Evrocontayner: телефон +7 777 408 99 28, WhatsApp, email. Производство и продажа киосков, павильонов и контейнеров по всему Казахстану.',
    canonical: 'https://evrocontayner.kz/contact/',
    breadcrumbs: [
      { pos: 1, name: 'Главная', url: 'https://evrocontayner.kz/' },
      { pos: 2, name: 'Контакты', url: 'https://evrocontayner.kz/contact/' }
    ]
  },
  {
    file: 'services/index.html',
    title: 'Услуги Evrocontayner — производство, доставка, монтаж киосков и контейнеров',
    description: 'Полный спектр услуг: проектирование, производство, доставка и монтаж киосков, павильонов и контейнеров под ключ по всему Казахстану. Гарантия 12 месяцев.',
    canonical: 'https://evrocontayner.kz/services/',
    breadcrumbs: [
      { pos: 1, name: 'Главная', url: 'https://evrocontayner.kz/' },
      { pos: 2, name: 'Услуги', url: 'https://evrocontayner.kz/services/' }
    ]
  },
  {
    file: 'products/index.html',
    title: 'Каталог продукции — киоски, павильоны, контейнеры | Evrocontayner',
    description: 'Каталог киосков, павильонов и контейнеров от Evrocontayner. Цены, характеристики, комплектации. Калькулятор стоимости онлайн. Доставка по Казахстану.',
    canonical: 'https://evrocontayner.kz/products/',
    breadcrumbs: [
      { pos: 1, name: 'Главная', url: 'https://evrocontayner.kz/' },
      { pos: 2, name: 'Продукция', url: 'https://evrocontayner.kz/products/' }
    ]
  },
  {
    file: 'kiosks/index.html',
    title: 'Купить киоск в Казахстане — модульные киоски под ключ | Evrocontayner',
    description: 'Производство и продажа модульных киосков под ключ в Казахстане. Торговые киоски от 500 000 ₸. Доставка и монтаж по всей стране. Гарантия качества.',
    canonical: 'https://evrocontayner.kz/kiosks/',
    breadcrumbs: [
      { pos: 1, name: 'Главная', url: 'https://evrocontayner.kz/' },
      { pos: 2, name: 'Продукция', url: 'https://evrocontayner.kz/products/' },
      { pos: 3, name: 'Киоски', url: 'https://evrocontayner.kz/kiosks/' }
    ]
  },
  {
    file: 'pavilions/index.html',
    title: 'Купить торговый павильон в Казахстане — павильоны под ключ | Evrocontayner',
    description: 'Производство и продажа торговых павильонов под ключ в Казахстане. Павильоны для торговли, общепита, сервиса. Доставка и монтаж по всей стране.',
    canonical: 'https://evrocontayner.kz/pavilions/',
    breadcrumbs: [
      { pos: 1, name: 'Главная', url: 'https://evrocontayner.kz/' },
      { pos: 2, name: 'Продукция', url: 'https://evrocontayner.kz/products/' },
      { pos: 3, name: 'Павильоны', url: 'https://evrocontayner.kz/pavilions/' }
    ]
  },
  {
    file: 'containers/index.html',
    title: 'Купить контейнер в Казахстане — переоборудование контейнеров | Evrocontayner',
    description: 'Продажа и переоборудование контейнеров под ключ в Казахстане. Офисные, жилые, торговые контейнеры. Утепление, электрика, отделка. Доставка по всей стране.',
    canonical: 'https://evrocontayner.kz/containers/',
    breadcrumbs: [
      { pos: 1, name: 'Главная', url: 'https://evrocontayner.kz/' },
      { pos: 2, name: 'Продукция', url: 'https://evrocontayner.kz/products/' },
      { pos: 3, name: 'Контейнеры', url: 'https://evrocontayner.kz/containers/' }
    ]
  },
  {
    file: 'gallery/index.html',
    title: 'Галерея проектов — реализованные киоски и контейнеры | Evrocontayner',
    description: 'Фотогалерея реализованных проектов Evrocontayner: киоски, павильоны, контейнеры. Более 120 завершённых объектов по всему Казахстану.',
    canonical: 'https://evrocontayner.kz/gallery/',
    breadcrumbs: [
      { pos: 1, name: 'Главная', url: 'https://evrocontayner.kz/' },
      { pos: 2, name: 'Галерея', url: 'https://evrocontayner.kz/gallery/' }
    ]
  },
  {
    file: 'kiosk-karaganda/index.html',
    title: 'Купить киоск в Карагандe — производство под ключ | Evrocontayner',
    description: 'Купить киоск в Карагандe напрямую у производителя. Павильоны и контейнеры под ключ. Цена, сроки, доставка и монтаж по городу и области.',
    canonical: 'https://evrocontayner.kz/kiosk-karaganda/',
    breadcrumbs: [
      { pos: 1, name: 'Главная', url: 'https://evrocontayner.kz/' },
      { pos: 2, name: 'Киоск Карагандa', url: 'https://evrocontayner.kz/kiosk-karaganda/' }
    ]
  },
  {
    file: 'terms/index.html',
    title: 'Условия пользования | Evrocontayner',
    description: 'Условия пользования сайтом Evrocontayner. Политика конфиденциальности и правила использования.',
    canonical: 'https://evrocontayner.kz/terms/',
    breadcrumbs: [
      { pos: 1, name: 'Главная', url: 'https://evrocontayner.kz/' },
      { pos: 2, name: 'Условия пользования', url: 'https://evrocontayner.kz/terms/' }
    ]
  }
];

const METRIKA_SNIPPET = `  <!-- Yandex.Metrika counter -->
  <script type="text/javascript">
    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
    (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
    ym(${REAL_METRIKA_ID}, "init", {
         clickmap:true,
         trackLinks:true,
         accurateTrackBounce:true,
         webvisor:true
    });
  </script>
  <noscript><div><img src="https://mc.yandex.ru/watch/${REAL_METRIKA_ID}" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
  <!-- /Yandex.Metrika counter -->`;

const GA4_SNIPPET = `  <!-- Google Analytics 4 -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=${GA4_ID}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA4_ID}');
  </script>`;

function getBreadcrumbSchema(breadcrumbs) {
  const items = breadcrumbs.map(b => `      {
        "@type": "ListItem",
        "position": ${b.pos},
        "name": "${b.name}",
        "item": "${b.url}"
      }`).join(',\n');
  return `  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
${items}
    ]
  }
  </script>`;
}

function getSeoHead(page) {
  return `  <meta name="description" content="${page.description}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="${page.canonical}">
  <link rel="sitemap" type="application/xml" href="/sitemap.xml">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Evrocontayner">
  <meta property="og:locale" content="ru_KZ">
  <meta property="og:title" content="${page.title}">
  <meta property="og:description" content="${page.description}">
  <meta property="og:url" content="${page.canonical}">
  <meta property="og:image" content="https://evrocontayner.kz/images/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${page.title}">
  <meta name="twitter:description" content="${page.description}">
  <meta name="twitter:image" content="https://evrocontayner.kz/images/og-image.jpg">
  <meta name="geo.region" content="KZ">
  <meta name="geo.placename" content="Казахстан">`;
}

let updated = 0;
let skipped = 0;

pages.forEach(page => {
  const filePath = path.join(__dirname, '..', page.file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Не найден: ${page.file}`);
    skipped++;
    return;
  }

  let html = fs.readFileSync(filePath, 'utf8');

  // Fix broken HTML: remove Yandex Metrika and GA4 placed OUTSIDE </head>
  // Pattern: </head>\n<!-- Yandex.Metrika ... --> ... </head>
  // Remove duplicate </head> and misplaced scripts
  html = html.replace(/(<\/head>)\s*\n\s*<!-- Yandex\.Metrika counter -->[\s\S]*?<!-- \/Yandex\.Metrika counter -->\s*\n\s*(<\/head>|<style>[\s\S]*?<\/style>\s*<\/head>)/g, '$1');
  html = html.replace(/(<\/head>)\s*\n\s*<!-- Google Analytics 4 -->[\s\S]*?<\/script>\s*\n\s*<\/head>/g, '$1');
  // Also remove standalone misplaced Yandex Metrika blocks outside head
  html = html.replace(/\n\s*<!-- Yandex\.Metrika counter -->[\s\S]*?<!-- \/Yandex\.Metrika counter -->\s*\n(?=<\/head>)/g, '\n');
  html = html.replace(/\n\s*<!-- Google Analytics 4 -->\s*\n\s*<script async src="https:\/\/www\.googletagmanager[\s\S]*?<\/script>\s*\n(?=<\/head>)/g, '\n');

  // Update title if it's generic
  if (html.includes('<title>О нас — Evrocontayner</title>') ||
      html.includes('<title>Связаться с нами — Evrocontayner</title>') ||
      !html.includes('<meta name="description"')) {
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${page.title}</title>`);
  }

  // Add SEO meta tags if missing
  if (!html.includes('meta name="description"')) {
    const seoHead = getSeoHead(page);
    html = html.replace('</title>', `</title>\n${seoHead}`);
  }

  // Add BreadcrumbList if missing
  if (!html.includes('BreadcrumbList')) {
    const breadcrumb = getBreadcrumbSchema(page.breadcrumbs);
    html = html.replace('</head>', `${breadcrumb}\n</head>`);
  }

  // Add GA4 if missing
  if (!html.includes(GA4_ID)) {
    html = html.replace('</head>', `${GA4_SNIPPET}\n</head>`);
  }

  // Add/fix Yandex Metrika with real ID
  if (!html.includes(REAL_METRIKA_ID)) {
    // Remove old placeholder if exists
    html = html.replace(/<!-- Yandex\.Metrika counter -->[\s\S]*?<!-- \/Yandex\.Metrika counter -->/g, '');
    html = html.replace('</head>', `${METRIKA_SNIPPET}\n</head>`);
  }

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`✅ Обновлён: ${page.file}`);
  updated++;
});

console.log(`\n📊 Итого: обновлено ${updated}, пропущено ${skipped}`);
