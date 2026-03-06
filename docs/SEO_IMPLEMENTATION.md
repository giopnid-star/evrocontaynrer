# JSON-LD Структурированные данные для Evrocontayner

## 1. Для главной страницы - ORGANIZATION

Добавить в `<head>` index.html перед `</head>`:

```html
<!-- Organization Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Evrocontayner",
  "url": "https://evrocontayner.kz",
  "logo": "https://evrocontayner.kz/images/logo.png",
  "description": "Производство и продажа евроконтейнеров, киосков и павильонов для раздельного сбора отходов в Казахстане",
  "sameAs": [
    "https://www.facebook.com/evrocontayner",
    "https://www.instagram.com/evrocontayner",
    "https://www.linkedin.com/company/evrocontayner",
    "https://www.youtube.com/evrocontayner"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+7 777 408 99 28",
    "contactType": "Customer Service",
    "areaServed": "KZ"
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "[Your Address]",
    "addressLocality": "[Your City]",
    "addressRegion": "[Region]",
    "postalCode": "[Postal Code]",
    "addressCountry": "KZ"
  },
  "foundingDate": "2020",
  "areaServed": {
    "@type": "Country",
    "name": "Kazakhstan"
  }
}
</script>
```

---

## 2. Для городских страниц - LOCAL BUSINESS

Добавить на `/city/almaty/index.html` и другие городские страницы:

```html
<!-- Local Business Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Evrocontayner - Алматы",
  "image": "https://evrocontayner.kz/images/services.jpg",
  "description": "Доставка и монтаж евроконтейнеров и киосков в Алматы. Системы раздельного сбора отходов.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "[Address if available]",
    "addressLocality": "Almaty",
    "addressRegion": "Almaty",
    "postalCode": "[Postal]",
    "addressCountry": "KZ"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "43.2380",
    "longitude": "76.9386"
  },
  "telephone": "+7 777 408 99 28",
  "url": "https://evrocontayner.kz/city/almaty/",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "opens": "09:00",
    "closes": "18:00"
  },
  "areaServed": "Almaty",
  "serviceType": ["Евроконтейнеры", "Киоски", "Павильоны", "Раздельный сбор"]
}
</script>
```

Координаты для разных городов:
- **Алматы**: 43.2380, 76.9386
- **Астана**: 51.1694, 71.4491
- **Шымкент**: 42.3104, 69.5901
- **Караганда**: 49.8046, 72.7864
- **Актобе**: 50.2839, 57.2010

---

## 3. Для страницы Продукты - PRODUCT

Добавить на `/products/index.html` для каждого продукта:

```html
<!-- Product Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Евроконтейнер 1100 л",
  "image": "https://evrocontayner.kz/images/product-1.jpg",
  "description": "Стандартный евроконтейнер 1100 литров для раздельного сбора отходов",
  "brand": {
    "@type": "Brand",
    "name": "Evrocontayner"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://evrocontayner.kz/products/",
    "priceCurrency": "KZT",
    "price": "180000",
    "priceValidUntil": "2026-12-31",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "150"
  }
}
</script>
```

---

## 4. Для страницы Услуги - SERVICE

Добавить на `/services/index.html`:

```html
<!-- Service Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Service",
  "name": "Услуги проектирования и монтажа",
  "serviceType": "Дизайн, производство и установка",
  "provider": {
    "@type": "Organization",
    "name": "Evrocontayner"
  },
  "description": "Полный спектр услуг от проектирования до монтажа евроконтейнеров и киосков",
  "areaServed": "Kazakhstan",
  "availableChannel": {
    "@type": "ServiceChannel",
    "serviceUrl": "https://evrocontayner.kz/services/"
  }
}
</script>
```

---

## 5. Для FAQ - FAQ PAGE

```html
<!-- FAQ Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Сколько стоит евроконтейнер?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Стоимость зависит от объема и материала. Базовый контейнер 1100л начинается от 180,000 тг. Для точной стоимости свяжитесь с нами."
      }
    },
    {
      "@type": "Question",
      "name": "Как долго идет доставка?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Доставка в города Астана, Алматы, Шымкент занимает 3-5 рабочих дней. В другие города - 7-15 дней в зависимости от расстояния."
      }
    },
    {
      "@type": "Question",
      "name": "Предоставляете ли вы монтаж?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Да, мы предоставляем полный спектр услуг включая проектирование, производство и монтаж под ключ."
      }
    }
  ]
}
</script>
```

---

## 6. Для навигации - BREADCRUMB

Добавить на ВСЕ внутренние страницы (пример для `/city/almaty/`):

```html
<!-- Breadcrumb Schema -->
<script type="application/ld+json">
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
      "name": "По городам",
      "item": "https://evrocontayner.kz/city/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Алматы",
      "item": "https://evrocontayner.kz/city/almaty/"
    }
  ]
}
</script>
```

---

## 7. Добавление Google Analytics 4

Добавить в `<head>` ВСЕХ HTML файлов перед `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Получить ID:**
1. Перейти на https://analytics.google.com
2. Нажать на шестеренку → "Создать новое свойство"
3. Указать https://evrocontayner.kz
4. Копировать measurement ID вида G-XXXXXXXXXX
5. Заменить в коде выше

---

## 8. Добавление Яндекс.Метрики

Добавить перед `</body>` ВСЕХ HTML файлов:

```html
<!-- Yandex.Metrika counter -->
<script type="text/javascript" >
   (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
   m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
   (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

   ym(XXXXXXXX, "init", {
        clickmap:true,
        trackLinks:true,
        accurateTrackBounce:true,
        webvisor:true
   });
</script>
<noscript><div><img src="https://mc.yandex.ru/watch/XXXXXXXX" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
```

**Получить ID:**
1. Перейти на https://metrica.yandex.ru
2. Добавить счетчик → https://evrocontayner.kz
3. Скопировать ID счетчика (8-10 цифр)
4. Заменить XXXXXXXX в коде выше

---

## 9. Проверка структурированных данных

После добавления кода, проверить через инструменты Google:

1. **Google Rich Results Test**
   - https://search.google.com/test/rich-results
   - Вставить URL или HTML код
   - Проверить что нет ошибок

2. **Schema.org Validator**
   - https://validator.schema.org/
   - Вставить HTML код
   - Убедиться что валидны все элементы

3. **Яндекс Валидатор**
   - https://webmaster.yandex.ru/tools/microdata/
   - Вставить URL
   - Проверить микроданные

---

## 10. Чек-лист для каждой страницы

Для каждой HTML страницы добавить:

- [ ] Meta charset UTF-8
- [ ] Viewport meta tag
- [ ] Title (30-60 символов)
- [ ] Meta description (120-160 символов)
- [ ] Meta keywords (5-10 слов)
- [ ] Canonical URL
- [ ] Open Graph теги (og:title, og:description, og:image)
- [ ] H1 заголовок (один на странице)
- [ ] H2, H3 структурированные заголовки
- [ ] Alt текст для всех изображений
- [ ] JSON-LD структурированные данные
- [ ] Google Analytics код
- [ ] Яндекс.Метрика код
- [ ] Внутренние ссылки на важные страницы
- [ ] Мобильный дизайн оптимизирован

---

## ПОРЯДОК ВНЕДРЕНИЯ

**Неделя 1:**
- [ ] Добавить Google Analytics на все страницы
- [ ] Добавить Яндекс.Метрику на все страницы
- [ ] Проверить коды через инструменты

**Неделя 2:**
- [ ] Добавить Organization Schema на главную
- [ ] Добавить Local Business для каждого города
- [ ] Добавить BreadcrumbList на все страницы

**Неделя 3:**
- [ ] Добавить Product Schema для продуктов
- [ ] Добавить Service Schema для услуг
- [ ] Добавить FAQ Schema в услугах

**Неделя 4:**
- [ ] Проверить всё через Google Rich Results Test
- [ ] Исправить ошибки
- [ ] Тестирование на всех устройствах
