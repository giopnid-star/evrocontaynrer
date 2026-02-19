@echo off
REM ⚡ QUICK DEPLOY SCRIPT - СУПЕР БЫСТРЫЙ ДЕПЛОЙ
REM Использование: double-click this file or: quick-deploy.bat "Your message"

setlocal enabledelayedexpansion

echo.
echo ⏱️   QUICK DEPLOY на Railway...
echo.

REM Если передан параметр - используем его, иначе используем время
if "%1"=="" (
    for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set message=Update %%a:%%b)
) else (
    set message=%*
)

echo 📦 Adding files...
git add -A

echo 💾 Committing: %message%
git commit -m "%message%"

if errorlevel 1 (
    echo ✅ No changes to commit!
    goto end
)

echo ⬆️  Pushing to GitHub...
git push -u origin main

if errorlevel 1 (
    echo ❌ Push failed!
    pause
    exit /b 1
)

echo.
echo ✅ SUCCESS! Railway is deploying...
echo 🌐 Site will update in ~1-2 minutes
echo 🔗 https://evrocontayner.kz
echo.

:end
