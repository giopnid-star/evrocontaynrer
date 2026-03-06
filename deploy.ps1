# Quick deploy script for Railway
# Usage:
#   .\deploy.ps1 "Your commit message"
#   .\deploy.ps1

param([string]$message = "Quick update $(Get-Date -Format 'HH:mm:ss')")

Write-Host ""
Write-Host "[0/4] Pulling latest changes from remote..." -ForegroundColor Yellow
git pull --rebase
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [WARN] git pull failed, continuing..." -ForegroundColor Magenta
} else {
    Write-Host "  [OK] git pull --rebase successful" -ForegroundColor Green
}

Write-Host "=== QUICK DEPLOY to Railway ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] Staging files..." -ForegroundColor Yellow
git add -A

$status = git status --porcelain

if ([string]::IsNullOrEmpty($status)) {
    Write-Host "[2/4] No file changes. Creating empty trigger commit..." -ForegroundColor Yellow
    $triggerMessage = "chore: redeploy trigger $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

    git commit --allow-empty -m "$triggerMessage"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERROR] Failed to create trigger commit" -ForegroundColor Red
        exit 1
    }

    Write-Host "[3/4] Pushing trigger commit..." -ForegroundColor Yellow
    git push -u origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[4/4] SUCCESS: Trigger commit pushed. Railway deploy should start." -ForegroundColor Green
        exit 0
    }

    Write-Host "  [WARN] Push failed. Trying pull --rebase and push again..." -ForegroundColor Magenta
    git pull --rebase
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERROR] Rebase failed" -ForegroundColor Red
        exit 1
    }

    git push -u origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[4/4] SUCCESS: Trigger commit pushed after rebase." -ForegroundColor Green
        exit 0
    } else {
        Write-Host "  [ERROR] Push failed after rebase. Manual intervention required." -ForegroundColor Red
        exit 1
    }
}

Write-Host "[2/4] Creating commit: $message" -ForegroundColor Yellow
git commit -m "$message"
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [ERROR] Commit failed" -ForegroundColor Red
    exit 1
}

Write-Host "[3/4] Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "[4/4] SUCCESS: Pushed. Railway deploy should start." -ForegroundColor Green
    exit 0
}

Write-Host "  [WARN] Push failed. Trying pull --rebase and push again..." -ForegroundColor Magenta
git pull --rebase
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [ERROR] Rebase failed" -ForegroundColor Red
    exit 1
}

git push -u origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "[4/4] SUCCESS: Pushed after rebase. Railway deploy should start." -ForegroundColor Green
    exit 0
} else {
    Write-Host "  [ERROR] Push failed after rebase. Manual intervention required." -ForegroundColor Red
    exit 1
}
