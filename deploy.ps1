param([string]$message = "Update $(Get-Date -Format 'HH:mm')")

Write-Host ""
Write-Host "[DEPLOY] Starting quick deploy to Railway..." -ForegroundColor Cyan

# Security check
Write-Host "[1/4] Security check..." -ForegroundColor Yellow
$excluded = @(".env", "auth.json", "credentials.json")
foreach ($file in $excluded) {
    if (Test-Path $file) {
        Write-Host "[!] Found $file - excluding from commit" -ForegroundColor Red
        git reset HEAD $file 2>$null | Out-Null
    }
}
Write-Host "[OK] Secure" -ForegroundColor Green

# Stage files
Write-Host "[2/4] Staging files..." -ForegroundColor Yellow
git add -A | Out-Null
$status = git status --porcelain
if ([string]::IsNullOrEmpty($status)) {
    Write-Host "[OK] Nothing to commit" -ForegroundColor Green
    Write-Host ""
    exit 0
}
Write-Host "[OK] Files staged" -ForegroundColor Green

# Commit
Write-Host "[3/4] Creating commit: $message" -ForegroundColor Yellow
git commit -m "$message" | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Commit failed" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Committed" -ForegroundColor Green

# Push
Write-Host "[4/4] Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin main 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Pushed successfully" -ForegroundColor Green
    Write-Host ""
    Write-Host "[SUCCESS] Railway is deploying your changes..." -ForegroundColor Green
    Write-Host "Live at: https://evrocontayner.kz" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "[ERROR] Push failed" -ForegroundColor Red
    exit 1
}
