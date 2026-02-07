document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const expandService = urlParams.get('expand');

    const serviceCards = document.querySelectorAll('.service-card');

    serviceCards.forEach((card, index) => {
        const cardNum = index + 1;
        const btn = card.querySelector('.service-btn');
        const fullDescDiv = card.querySelector('.service-full-desc');

        if (btn) {
            if (fullDescDiv) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    toggleCard(card);
                });
            } else if (window.location.pathname.includes('services.html')) {
                // На странице services.html, но блока с полным описанием нет — создаём его динамически
                const newFull = document.createElement('div');
                newFull.className = 'service-full-desc';
                newFull.style.display = 'none';
                const p = document.createElement('p');
                p.setAttribute('data-i18n', `services.card${cardNum}.fullDesc`);
                p.textContent = 'Полное описание услуги';
                newFull.appendChild(p);
                const wrapper = document.createElement('div');
                wrapper.className = 'service-close-btn-wrapper';
                const closeBtn = document.createElement('button');
                closeBtn.className = 'service-close-btn';
                closeBtn.textContent = '← Свернуть';
                wrapper.appendChild(closeBtn);
                newFull.appendChild(wrapper);
                const footer = card.querySelector('.service-card-footer');
                if (footer) card.insertBefore(newFull, footer);

                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    toggleCard(card);
                });
            } else {
                // Если на странице нет полного описания, перенаправляем на services.html с параметром
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = `services.html?expand=card${cardNum}`;
                });
            }
        }

        // Если в URL указан номер - разворачиваем эту карту при загрузке
        if (expandService === `card${cardNum}`) {
            expandCard(card);
        }
    });

    function toggleCard(card) {
        const isExpanded = card.classList.contains('expanded');
        closeAllCards();

        if (!isExpanded) {
            expandCard(card);
        }
    }

    function expandCard(card) {
        card.classList.add('expanded');

        // Scroll to card if not visible
        setTimeout(() => {
            card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }

    function closeAllCards() {
        serviceCards.forEach(card => {
            card.classList.remove('expanded');
        });
    }

    // Close card when clicking on close button if it exists
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('service-close-btn')) {
            e.preventDefault();
            e.target.closest('.service-card').classList.remove('expanded');
        }
    });
});
