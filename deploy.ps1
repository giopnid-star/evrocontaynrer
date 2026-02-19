# ⚡ БЫСТРЫЙ ДЕПЛОЙ СКРИПТ
# Использование: ./deploy.ps1 "Твое сообщение" или просто ./deploy.ps1

param([string]$message = "Quick update $(Get-Date -Format 'HH:mm:ss')")

Write-Host ""
# PULL (обновить локальный main перед коммитом)
Write-Host "[0/4] Pulling latest changes from remote..." -ForegroundColor Yellow
git pull --rebase
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [WARN] git pull не удался, продолжаем..." -ForegroundColor Magenta
} else {
    Write-Host "  [OK] git pull --rebase successful" -ForegroundColor Green
}

Write-Host "=== QUICK DEPLOY to Railway ===" -ForegroundColor Cyan
Write-Host ""

# Добавляем все файлы
Write-Host "📦 Стейджим файлы..." -ForegroundColor Yellow
git add -A

# Проверяем есть ли что комитить
$status = git status --porcelain

if ([string]::IsNullOrEmpty($status)) {
    Write-Host "✅ Нечего комитить (всё уже синхронизировано)" -ForegroundColor Green
    exit 0
}
Write-Host "[OK] Files staged" -ForegroundColor Green

# Создаем коммит
Write-Host "💾 Создаем коммит: $message" -ForegroundColor Yellow
git commit -m "$message"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка при создании коммита" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Committed" -ForegroundColor Green

# Пушим на GitHub
Write-Host "⬆️  Пушим на GitHub..." -ForegroundColor Yellow
git push -u origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Успешно! Railway автоматически разворачивает..." -ForegroundColor Green
    Write-Host "🌐 Сайт обновится через ~1-2 минуты" -ForegroundColor Cyan
} else {
    Write-Host "  [WARN] Push failed! Скорее всего, есть новые коммиты на сервере. Пробуем git pull --rebase и повтор push..." -ForegroundColor Magenta
    git pull --rebase
    if ($LASTEXITCODE -ne 0) {
        Write-Host "    [ERROR] git pull не удался, остановка." -ForegroundColor Red
        exit 1
    }
    git push -u origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Push successful after rebase" -ForegroundColor Green
        Write-Host ""
        Write-Host "=== SUCCESS ===" -ForegroundColor Green
        Write-Host "Railway is automatically deploying..." -ForegroundColor Cyan
        Write-Host "Your site will be updated in 1-2 minutes" -ForegroundColor Cyan
        Write-Host "Live at: https://evrocontayner.kz" -ForegroundColor Cyan
        Write-Host ""
    } else {
        Write-Host "    [ERROR] Push всё равно не удался. Требуется ручное вмешательство." -ForegroundColor Red
        exit 1
    }
}
