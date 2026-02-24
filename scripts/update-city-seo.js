/**
 * Скрипт для массового обновления SEO в городских страницах
 * Добавляет: GA4, BreadcrumbList schema, og:image, geo meta, robots meta
 */

const fs = require('fs');
const path = require('path');

const cities = [
  { slug: 'almaty',         name: 'Алматы',           nameRu: 'Алматы',           geo: '43.238949;76.889709', region: 'KZ-ALA' },
  { slug: 'astana',         name: 'Астана',            nameRu: 'Астана',           geo: '51.180000;71.446000', region: 'KZ-AST' },
  { slug: 'shymkent',       name: 'Шымкент',           nameRu: 'Шымкент',          geo: '42.317000;69.587000', region: 'KZ-YUZ' },
  { slug: 'karaganda',      name: 'Карагандa',         nameRu: 'Карагандa',        geo: '49.806000;73.085000', region: 'KZ-KAR' },
  { slug: 'aktobe',         name: 'Актобе',            nameRu: 'Актобе',           geo: '50.300000;57.154000', region: 'KZ-AKT' },
  { slug: 'taraz',          name: 'Тараз',             nameRu: 'Тараз',            geo: '42.900000;71.367000', region: 'KZ-ZHA' },
  { slug: 'pavlodar',       name: 'Павлодар',          nameRu: 'Павлодар',         geo: '52.285000;76.940000', region: 'KZ-PAV' },
  { slug: 'ust-kamenogorsk',name: 'Усть-Каменогорск', nameRu: 'Усть-Каменогорск',geo: '49.948000;82.628000', region: 'KZ-VOS' },
  { slug: 'semey',          name: 'Семей',             nameRu: 'Семей',            geo: '50.411000;80.226000', region: 'KZ-VOS' },
  { slug: 'atyrau',         name: 'Атырау',            nameRu: 'Атырау',           geo: '47.117000;51.883000', region: 'KZ-ATY' },
  { slug: 'kostanay',       name: 'Костанай',          nameRu: 'Костанай',         geo: '53.214000;63.625000', region: 'KZ-KUS' },
  { slug: 'kyzylorda',      name: 'Кызылорда',         nameRu: 'Кызылорда',        geo: '44.853000;65.509000', region: 'KZ-KZY' },
  { slug: 'aktau',          name: 'Актау',             nameRu: 'Актау',            geo: '43.650000;51.167000', region: 'KZ-MAN' },
  { slug: 'oral',           name: 'Орал',              nameRu: 'Орал',             geo: '51.233000;51.367000', region: 'KZ-ZAP' },
  { slug: 'turkistan',      name: 'Туркестан',         nameRu: 'Туркестан',        geo: '43.300000;68.267000', region: 'KZ-YUZ' },
  { slug: 'kokshetau',      name: 'Кокшетау',          nameRu: 'Кокшетау',         geo: '53.283000;69.400000', region: 'KZ-AKM' },
  { slug: 'taldykorgan',    name: 'Талдыкорган',       nameRu: 'Талдыкорган',      geo: '45.017000;78.367000', region: 'KZ-ALA' },
  { slug: 'petropavl',      name: 'Петропавловск',     nameRu: 'Петропавловск',    geo: '54.867000;69.150000', region: 'KZ-SEV' },
  { slug: 'ekibastuz',      name: 'Экибастуз',         nameRu: 'Экибастуз',        geo: '51.717000;75.367000', region: 'KZ-PAV' },
  { slug: 'zhezkazgan',     name: 'Жезказган',         nameRu: 'Жезказган',        geo: '47.800000;67.717000', region: 'KZ-KAR' }
];

const GA4_SNIPPET = `  <!-- Google Analytics 4 -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-8G7N29FJK"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-8G7N29FJK');
  </script>`;

function getBreadcrumbSchema(city) {
  return `  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Главная",
        "item": "https://evrocontayner.kz/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Города",
        "item": "https://evrocontayner.kz/#cities"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Киоски и контейнеры в ${city.nameRu}",
        "item": "https://evrocontayner.kz/city/${city.slug}/"
      }
    ]
  }
  </script>`;
}

function getGeoMeta(city) {
  return `  <meta name="geo.region" content="${city.region}">
  <meta name="geo.placename" content="${city.nameRu}">
  <meta name="geo.position" content="${city.geo}">
  <meta name="ICBM" content="${city.geo.replace(';', ', ')}">`;
}

let updated = 0;
let errors = 0;

cities.forEach(city => {
  const filePath = path.join(__dirname, '..', 'city', city.slug, 'index.html');

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Файл не найден: ${filePath}`);
    errors++;
    return;
  }

  let html = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 1. Add meta robots if missing
  if (!html.includes('name="robots"')) {
    html = html.replace(
      '<link rel="canonical"',
      '  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">\n  <link rel="canonical"'
    );
    changed = true;
  }

  // 2. Add og:image if missing
  if (!html.includes('og:image')) {
    html = html.replace(
      '<meta property="og:type"',
      `  <meta property="og:image" content="https://evrocontayner.kz/images/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Evrocontayner">
  <meta property="og:locale" content="ru_KZ">
  <meta property="og:type"`
    );
    changed = true;
  }

  // 3. Add geo meta tags if missing
  if (!html.includes('geo.region')) {
    const geoMeta = getGeoMeta(city);
    html = html.replace(
      '<script type="application/ld+json">',
      `${geoMeta}\n  <script type="application/ld+json">`
    );
    changed = true;
  }

  // 4. Add BreadcrumbList schema if missing
  if (!html.includes('BreadcrumbList')) {
    const breadcrumb = getBreadcrumbSchema(city);
    // Insert before closing </head>
    html = html.replace('</head>', `${breadcrumb}\n</head>`);
    changed = true;
  }

  // 5. Add GA4 if missing
  if (!html.includes('G-8G7N29FJK') && !html.includes('googletagmanager')) {
    html = html.replace('</head>', `${GA4_SNIPPET}\n</head>`);
    changed = true;
  }

  // 6. Add sitemap link if missing
  if (!html.includes('rel="sitemap"')) {
    html = html.replace(
      '<link rel="canonical"',
      '  <link rel="sitemap" type="application/xml" href="/sitemap.xml">\n  <link rel="canonical"'
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`✅ Обновлён: city/${city.slug}/index.html`);
    updated++;
  } else {
    console.log(`ℹ️  Без изменений: city/${city.slug}/index.html`);
  }
});

console.log(`\n📊 Итого: обновлено ${updated}, ошибок ${errors}, всего ${cities.length}`);
