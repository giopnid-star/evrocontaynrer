document.addEventListener('DOMContentLoaded', function () {
    const langToggle = document.getElementById('lang-toggle');
    const langPanel = document.getElementById('lang-panel');

    langToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        langPanel.classList.toggle('active');
    });

    document.querySelectorAll('.lang-option').forEach(btn => {
        btn.addEventListener('click', function () {
            langPanel.classList.remove('active');
        });
    });

    document.addEventListener('click', function (e) {
        if (!e.target.closest('.lang-wrapper')) {
            langPanel.classList.remove('active');
        }
    });
});
