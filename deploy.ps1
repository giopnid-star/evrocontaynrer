# ⚡ БЫСТРЫЙ ДЕПЛОЙ СКРИПТ
# Использование: ./deploy.ps1 "Твое сообщение" или просто ./deploy.ps1

param([string]$message = "Quick update $(Get-Date -Format 'HH:mm:ss')")

Write-Host "🚀 Начинаем деплой..." -ForegroundColor Cyan

# Добавляем все файлы
Write-Host "📦 Стейджим файлы..." -ForegroundColor Yellow
git add -A

# Проверяем есть ли что комитить
$status = git status --porcelain
if ([string]::IsNullOrEmpty($status)) {
    Write-Host "✅ Нечего комитить (всё уже синхронизировано)" -ForegroundColor Green
    exit 0
}

# Создаем коммит
Write-Host "💾 Создаем коммит: $message" -ForegroundColor Yellow
git commit -m "$message"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка при создании коммита" -ForegroundColor Red
    exit 1
}

# Пушим на GitHub
Write-Host "⬆️  Пушим на GitHub..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Успешно! Railway автоматически разворачивает..." -ForegroundColor Green
    Write-Host "🌐 Сайт обновится через ~1-2 минуты" -ForegroundColor Cyan
} else {
    Write-Host "❌ Ошибка при пуше" -ForegroundColor Red
    exit 1
}
