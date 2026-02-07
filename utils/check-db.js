const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.sqlite');

console.log('📊 Проверка базы данных...\n');
console.log('Путь к БД:', DB_PATH);
console.log('БД существует:', fs.existsSync(DB_PATH));

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Ошибка при открытии БД:', err);
    process.exit(1);
  }
  console.log('✅ БД успешно открыта\n');

  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      console.error('❌ Ошибка при чтении таблиц:', err);
      db.close();
      process.exit(1);
    }

    console.log('📋 Таблицы в БД:', tables.length > 0 ? tables.map(t => t.name).join(', ') : 'нет таблиц');

    db.all('SELECT id, name, email, message, created_at, sent FROM contacts ORDER BY id DESC', (err, rows) => {
      if (err) {
        console.error('❌ Ошибка при чтении контактов:', err);
        db.close();
        process.exit(1);
      }

      console.log(`\n📬 Всего контактов в БД: ${rows.length}\n`);

      if (rows.length > 0) {
        console.log('═══════════════════════════════════════════════════════════');
        rows.forEach((row, idx) => {
          const status = row.sent ? '✉️ Отправлено' : '⏳ Не отправлено';
          console.log(`\n${idx + 1}. ${status}`);
          console.log(`   ID: ${row.id}`);
          console.log(`   Имя: ${row.name}`);
          console.log(`   Email: ${row.email}`);
          console.log(`   Время: ${row.created_at}`);
          console.log(`   Сообщение: ${row.message.substring(0, 60)}${row.message.length > 60 ? '...' : ''}`);
        });
        console.log('\n═══════════════════════════════════════════════════════════');
      } else {
        console.log('📭 В БД нет контактов');
      }

      db.close();
    });
  });
});
