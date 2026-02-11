# Fix FOUC (Flash of Unstyled Content) - remove hide/show and merge inline scripts

$oldPattern = @'
    <script>
        document.documentElement.style.display = 'none';
    </script>
    <script>
        (function () {
            const theme = localStorage.getItem('theme') || 'dark';
            if (theme === 'dark') document.documentElement.classList.add('dark-mode');
        })();
    </script>
    <script>
        (function () {
            const lang = localStorage.getItem('lang') || 'ru';
            document.documentElement.setAttribute('data-lang', lang);
            document.documentElement.lang = (lang === 'kz') ? 'kk' : 'ru';
        })();
    </script>
    <script>
        document.documentElement.style.display = '';
    </script>
'@

$newPattern = @'
    <script>
        (function () {
            const theme = localStorage.getItem('theme') || 'dark';
            if (theme === 'dark') {
                document.documentElement.classList.add('dark-mode');
            }
            const lang = localStorage.getItem('lang') || 'ru';
            document.documentElement.setAttribute('data-lang', lang);
            document.documentElement.lang = (lang === 'kz') ? 'kk' : 'ru';
        })();
    </script>
'@

$oldPattern2 = @'
	<script>
		document.documentElement.style.display = 'none';
	</script>
	<script>
		(function () {
			const theme = localStorage.getItem('theme') || 'dark';
			if (theme === 'dark') document.documentElement.classList.add('dark-mode');
		})();
	</script>
	<script>
		(function () {
			const lang = localStorage.getItem('lang') || 'ru';
			document.documentElement.setAttribute('data-lang', lang);
			document.documentElement.lang = (lang === 'kz') ? 'kk' : 'ru';
		})();
	</script>
	<script>
		document.documentElement.style.display = '';
	</script>
'@

$newPattern2 = @'
	<script>
		(function () {
			const theme = localStorage.getItem('theme') || 'dark';
			if (theme === 'dark') {
				document.documentElement.classList.add('dark-mode');
			}
			const lang = localStorage.getItem('lang') || 'ru';
			document.documentElement.setAttribute('data-lang', lang);
			document.documentElement.lang = (lang === 'kz') ? 'kk' : 'ru';
		})();
	</script>
'@

$rootPath = Split-Path -Parent $PSScriptRoot
$htmlFiles = Get-ChildItem -Path $rootPath -Include "*.html" -Recurse -File

$updatedCount = 0
$skippedCount = 0

foreach ($file in $htmlFiles) {
    if ($file.FullName -eq "$rootPath\index.html") {
        Write-Host "Skip (already updated): $($file.Name)" -ForegroundColor Yellow
        $skippedCount++
        continue
    }
    
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    
    if ($content -match "document\.documentElement\.style\.display = 'none';") {
        if ($content.Contains($oldPattern)) {
            $content = $content.Replace($oldPattern, $newPattern)
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
            Write-Host "Updated: $($file.Name)" -ForegroundColor Green
            $updatedCount++
        }
        elseif ($content.Contains($oldPattern2)) {
            $content = $content.Replace($oldPattern2, $newPattern2)
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
            Write-Host "Updated (tabs): $($file.Name)" -ForegroundColor Green
            $updatedCount++
        }
        else {
            Write-Host "Found pattern but format mismatch: $($file.Name)" -ForegroundColor Yellow
            $skippedCount++
        }
    }
    else {
        $skippedCount++
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Updated: $updatedCount files" -ForegroundColor Green
Write-Host "Skipped: $skippedCount files" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
