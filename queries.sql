-- ============================================
-- SQL Запросы для Railway PostgreSQL
-- База данных: evrocontayner
-- ============================================

-- ===== ПРОСМОТР ДАННЫХ =====

-- Все контакты (последние 20)
SELECT * FROM contacts 
ORDER BY created_at DESC 
LIMIT 20;

-- Все пользователи
SELECT id, email, name, created_at, last_login, verified 
FROM users 
ORDER BY created_at DESC;

-- ===== СТАТИСТИКА =====

-- Общая статистика
SELECT 
    'Всего контактов' as metric, 
    COUNT(*)::text as value 
FROM contacts
UNION ALL
SELECT 'Отправлено писем', COUNT(*)::text 
FROM contacts WHERE sent = true
UNION ALL
SELECT 'Ожидают отправки', COUNT(*)::text 
FROM contacts WHERE sent = false
UNION ALL
SELECT 'Зарегистрировано пользователей', COUNT(*)::text 
FROM users
UNION ALL
SELECT 'Подтверждённых пользователей', COUNT(*)::text 
FROM users WHERE verified = true;

-- Статистика по датам
SELECT 
    DATE(created_at) as date,
    COUNT(*) as messages_count,
    SUM(CASE WHEN sent = true THEN 1 ELSE 0 END) as sent_count
FROM contacts 
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 30;

-- ===== ПОИСК =====

-- Поиск контактов по email
SELECT * FROM contacts 
WHERE email LIKE '%gmail%' 
ORDER BY created_at DESC;

-- Поиск по тексту сообщения
SELECT name, email, LEFT(message, 100) as message_preview, created_at
FROM contacts 
WHERE message ILIKE '%контейнер%'
ORDER BY created_at DESC;

-- Неотправленные сообщения
SELECT * FROM contacts 
WHERE sent = false 
ORDER BY created_at DESC;

-- ===== ПОЛЬЗОВАТЕЛИ =====

-- Активные сессии пользователей
SELECT 
    email, 
    name, 
    session_expires,
    CASE 
        WHEN session_expires > NOW() THEN '✅ Активна'
        ELSE '❌ Истекла'
    END as status
FROM users 
WHERE session_token IS NOT NULL
ORDER BY session_expires DESC;

-- Последние входы пользователей
SELECT 
    email,
    name,
    last_login,
    NOW() - last_login as time_since_login
FROM users 
WHERE last_login IS NOT NULL
ORDER BY last_login DESC;

-- ===== СТРУКТУРА ТАБЛИЦ =====

-- Информация о таблице contacts
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'contacts'
ORDER BY ordinal_position;

-- Информация о таблице users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- ===== ИНДЕКСЫ =====

-- Просмотр всех индексов
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ===== РАЗМЕР ТАБЛИЦ =====

-- Размер каждой таблицы
SELECT 
    schemaname as schema,
    tablename as table,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ===== БЭКАП/ЭКСПОРТ =====

-- Создать копию таблицы contacts
-- CREATE TABLE contacts_backup AS SELECT * FROM contacts;

-- Восстановить из копии
-- INSERT INTO contacts SELECT * FROM contacts_backup;

-- ===== ОЧИСТКА (ОСТОРОЖНО!) =====

-- Удалить старые сессии (старше 30 дней)
-- UPDATE users 
-- SET session_token = NULL, session_expires = NULL 
-- WHERE session_expires < NOW() - INTERVAL '30 days';

-- Удалить тестовые данные
-- DELETE FROM contacts WHERE email LIKE '%test%';

-- ===== УДОБНЫЕ ПРЕДСТАВЛЕНИЯ =====

-- Последние сообщения с кратким превью
CREATE OR REPLACE VIEW recent_contacts AS
SELECT 
    id,
    name,
    email,
    LEFT(message, 100) as message_preview,
    created_at,
    sent,
    CASE WHEN sent THEN '✅' ELSE '⏳' END as status_icon
FROM contacts 
ORDER BY created_at DESC;

-- Использование представления:
-- SELECT * FROM recent_contacts LIMIT 20;
