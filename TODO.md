# SEO Оптимизация — TODO

## Статус: ✅ ЗАВЕРШЕНО

### 1. robots.txt
- [x] Убрать `Disallow: /*.js$` и `Disallow: /*.css$`
- [x] Убрать `Disallow: /*?*`
- [x] Добавить правила для Bingbot
- [x] Добавить `Disallow: /data/`

### 2. index.html
- [x] Убрать заглушку Яндекс.Метрики (закомментировано с инструкцией)
- [x] Добавить geo meta теги (geo.region, geo.placename, geo.position, ICBM)
- [x] Добавить `<link rel="sitemap">` в head
- [x] Добавить WebSite schema (SearchAction для Google Sitelinks)
- [x] Добавить BreadcrumbList schema
- [x] Добавить og:image:width и og:image:height
- [x] Добавить meta author и copyright

### 3. server.js
- [x] Добавить endpoint /sitemap-cities.xml (с hreflang)
- [x] Добавить endpoint /sitemap-images.xml (с image:image)

### 4. Городские страницы (20 штук) — все обновлены скриптом
- [x] almaty — GA4, BreadcrumbList, og:image, geo meta, robots meta, sitemap link
- [x] astana — GA4, BreadcrumbList, og:image, geo meta, robots meta, sitemap link
- [x] shymkent — GA4, BreadcrumbList, og:image, geo meta, robots meta, sitemap link
- [x] karaganda — GA4, BreadcrumbList, og:image, geo meta, robots meta, sitemap link
- [x] aktobe — GA4, BreadcrumbList, og:image, geo meta, robots meta, sitemap link
- [x] taraz — GA4, BreadcrumbList, og:image, geo meta, robots meta, sitemap link
- [x] pavlodar — GA4, BreadcrumbList, og:image, geo meta, robots meta, sitemap link
- [x] ust-kamenogorsk — GA4, BreadcrumbList, og:image, geo meta, robots meta, sitemap link
- [x] semey — GA4, BreadcrumbList, og:image, geo meta, robots meta, sitemap link
- [x] atyrau — GA4, BreadcrumbList, og:image, geo meta, robots meta, sitemap link
- [x] kostanay — GA4, BreadcrumbList, og:image, geo meta, robots meta, sitemap link
- [x] kyzylorda — GA4, BreadcrumbList, og:image, geo meta, robots meta, sitemap link
- [x] aktau — GA4, BreadcrumbList, og:image, geo meta, robots meta, sitemap link
- [x] oral — GA4, BreadcrumbList, og:image, geo meta, robots meta, sitemap link
- [x] turkistan — GA4, BreadcrumbList, og:image, geo meta, robots meta, sitemap link
- [x] kokshetau — GA4, BreadcrumbList, og:image, geo meta, robots meta, sitemap link
- [x] taldykorgan — GA4, BreadcrumbList, og:image, geo meta, robots meta, sitemap link
- [x] petropavl — GA4, BreadcrumbList, og:image, geo meta, robots meta, sitemap link
- [x] ekibastuz — GA4, BreadcrumbList, og:image, geo meta, robots meta, sitemap link
- [x] zhezkazgan — GA4, BreadcrumbList, og:image, geo meta, robots meta, sitemap link

### 5. Дополнительно создано
- [x] scripts/update-city-seo.js — скрипт для массового обновления городских страниц
- [x] scripts/fix-main-pages-seo.js — скрипт для исправления основных страниц

### 6. Основные страницы сайта (10 штук)
- [x] about/index.html — исправлена сломанная HTML структура, добавлены SEO теги, GA4, Яндекс.Метрика, BreadcrumbList
- [x] contact/index.html — исправлена сломанная HTML структура, добавлены SEO теги, GA4, Яндекс.Метрика, BreadcrumbList
- [x] services/index.html — добавлены SEO теги, GA4, Яндекс.Метрика, BreadcrumbList
- [x] products/index.html — добавлены SEO теги, GA4, Яндекс.Метрика, BreadcrumbList
- [x] kiosks/index.html — добавлены SEO теги, GA4, Яндекс.Метрика, BreadcrumbList
- [x] pavilions/index.html — добавлены SEO теги, GA4, Яндекс.Метрика, BreadcrumbList
- [x] containers/index.html — добавлены SEO теги, GA4, Яндекс.Метрика, BreadcrumbList
- [x] gallery/index.html — добавлены SEO теги, GA4, Яндекс.Метрика, BreadcrumbList
- [x] kiosk-karaganda/index.html — добавлены SEO теги, GA4, Яндекс.Метрика, BreadcrumbList
- [x] terms/index.html — добавлены SEO теги, GA4, Яндекс.Метрика, BreadcrumbList

### 7. index.html — финальные улучшения
- [x] Добавлен реальный ID Яндекс.Метрики (106918295) с webvisor
