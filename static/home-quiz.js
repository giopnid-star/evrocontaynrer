(() => {
  const form = document.getElementById('quick-quiz-form');
  if (!form) return;

  const steps = Array.from(form.querySelectorAll('.quiz-step'));
  const stepCurrentEl = document.getElementById('quiz-step-current');
  const progressBarEl = document.getElementById('quiz-progress-bar');
  const prevBtn = document.getElementById('quiz-prev');
  const nextBtn = document.getElementById('quiz-next');
  const resultEl = document.getElementById('quiz-result');

  if (!steps.length || !stepCurrentEl || !progressBarEl || !prevBtn || !nextBtn || !resultEl) return;

  let currentStep = 0;
  let completed = false;

  const setStep = (index) => {
    currentStep = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((step, idx) => {
      step.classList.toggle('active', idx === currentStep);
    });

    stepCurrentEl.textContent = String(currentStep + 1);
    progressBarEl.style.width = `${Math.round(((currentStep + 1) / steps.length) * 100)}%`;
    prevBtn.disabled = currentStep === 0;
    nextBtn.textContent = currentStep === steps.length - 1 ? 'Показать результат' : 'Далее';
  };

  const currentSelect = () => steps[currentStep].querySelector('select');

  const validateCurrentStep = () => {
    const select = currentSelect();
    if (!select) return true;

    const valid = Boolean(select.value.trim());
    select.classList.toggle('quiz-invalid', !valid);
    return valid;
  };

  const clearInvalidOnChange = () => {
    const selects = form.querySelectorAll('select');
    selects.forEach((select) => {
      select.addEventListener('change', () => {
        if (select.value.trim()) {
          select.classList.remove('quiz-invalid');
        }
      });
    });
  };

  const estimateFromData = (data) => {
    const typeMap = {
      'киоск': 1600000,
      'павильон': 2500000,
      'контейнер': 2200000,
      'модульный офис': 3000000
    };

    const sizeMap = {
      'до 12 м2': 1,
      '12-24 м2': 1.2,
      '24-40 м2': 1.45,
      '40+ м2': 1.75
    };

    const insulationMap = {
      'базовая': 1,
      'усиленная': 1.18,
      'премиум': 1.33
    };

    const deadlineMap = {
      'срочно 7-10 дней': 1.12,
      'до 3 недель': 1.05,
      'до 1 месяца': 1,
      'гибкий срок': 0.96
    };

    const typeBase = typeMap[data.type] || 1800000;
    const sizeFactor = sizeMap[data.size] || 1;
    const insulationFactor = insulationMap[data.insulation] || 1;
    const deadlineFactor = deadlineMap[data.deadline] || 1;

    const estimate = Math.round(typeBase * sizeFactor * insulationFactor * deadlineFactor);
    const min = Math.max(estimate - 350000, 650000);
    const max = estimate + 450000;

    return {
      estimate,
      rangeText: `${min.toLocaleString('ru-RU')} - ${max.toLocaleString('ru-RU')} KZT`
    };
  };

  const renderResult = () => {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const estimate = estimateFromData(data);
    const message = [
      'Здравствуйте! Оставляю данные из быстрого калькулятора:',
      `Тип: ${data.type}`,
      `Размер: ${data.size}`,
      `Комплектация: ${data.insulation}`,
      `Бюджет: ${data.budget}`,
      `Срок: ${data.deadline}`,
      `Ориентир по стоимости: ${estimate.rangeText}`,
      'Прошу подготовить точное коммерческое предложение.'
    ].join('\n');

    const waHref = `https://wa.me/77072534022?text=${encodeURIComponent(message)}`;

    resultEl.innerHTML = `
      <h3>Ориентир по проекту: ${estimate.rangeText}</h3>
      <p>Это предварительный диапазон. Точный расчет зависит от инженерии, отделки и логистики.</p>
      <div class="quiz-result-actions">
        <a class="quiz-result-whatsapp" href="${waHref}" target="_blank" rel="noopener" data-track="quiz_whatsapp_click">Отправить в WhatsApp</a>
        <a class="quiz-result-contact" href="/contact/" data-track="quiz_contact_click">Получить подробное КП</a>
      </div>
    `;

    resultEl.classList.add('active');
    completed = true;
    prevBtn.disabled = true;
    nextBtn.textContent = 'Заполнить заново';

    try {
      window.dispatchEvent(new CustomEvent('quiz:completed', {
        detail: {
          type: data.type,
          size: data.size,
          budget: data.budget,
          deadline: data.deadline,
          estimate: estimate.estimate
        }
      }));
    } catch (_) {
      // No-op
    }
  };

  prevBtn.addEventListener('click', () => {
    if (completed) return;
    if (currentStep > 0) {
      setStep(currentStep - 1);
    }
  });

  nextBtn.addEventListener('click', () => {
    if (completed) {
      form.reset();
      resultEl.classList.remove('active');
      resultEl.innerHTML = '';
      completed = false;
      setStep(0);
      return;
    }

    if (!validateCurrentStep()) return;

    if (currentStep < steps.length - 1) {
      setStep(currentStep + 1);
      return;
    }

    renderResult();
  });

  clearInvalidOnChange();
  setStep(0);
})();
