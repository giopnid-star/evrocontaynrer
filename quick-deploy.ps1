# Скрипт для автоматического деплоя
Write-Host "🚀 Начинаем отправку изменений..." -ForegroundColor Green

# Удаляем старый статический файл, чтобы не мешал динамическому маршруту
if (Test-Path "sitemap.xml") {
    Remove-Item "sitemap.xml"
    Write-Host "🗑️  Удален старый sitemap.xml (теперь он генерируется автоматически)" -ForegroundColor Yellow
}

git add .
git commit -m "Update: Dynamic sitemap and security fixes"
git push

Write-Host "✅ Изменения отправлены на GitHub! Railway скоро обновит сайт." -ForegroundColor Green