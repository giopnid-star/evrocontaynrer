document.addEventListener('DOMContentLoaded', () => {
    const elems = {
        type: document.getElementById('pc-type'),
        size: document.getElementById('pc-size'),
        material: document.getElementById('pc-material'),
        qty: document.getElementById('pc-qty'),
        addonIns: document.getElementById('addon-insulation'),
        addonEl: document.getElementById('addon-electrical'),
        addonShelving: document.getElementById('addon-shelving'),
        baseEl: document.getElementById('pc-base'),
        materialEl: document.getElementById('pc-material-mod'),
        addonsEl: document.getElementById('pc-addons'),
        qtyEl: document.getElementById('pc-qty-show'),
        totalEl: document.getElementById('pc-total'),
        areaEl: document.getElementById('pc-area'),
        presets: document.querySelectorAll('[data-preset]'),
        resetBtn: document.getElementById('pc-reset'),
        // Киоск элементы
        kioskLengthSlider: document.getElementById('pc-kiosk-length'),
        kioskLengthInput: document.getElementById('pc-kiosk-length-input'),
        kioskLengthDisplay: document.getElementById('pc-kiosk-length-display'),
        kioskWidthSlider: document.getElementById('pc-kiosk-width'),
        kioskWidthInput: document.getElementById('pc-kiosk-width-input'),
        kioskWidthDisplay: document.getElementById('pc-kiosk-width-display'),
        sizeSelectBlock: document.getElementById('pc-size-select-block'),
        sizeKioskBlock: document.getElementById('pc-size-kiosk-block')
    };

    const prices = {
        container: {medium: 2200000, large: 3700000 },
        kiosk: { small: 240000, medium: 420000, large: 600000 },
        mobile: { small: 180000, medium: 300000, large: 480000 }
    };

    const materialMult = { steel: 1.0, composite: 1.15, wood: 0.9 };
    const addonPrices = { insulation: 30000, electrical: 42000, shelving: 12000 };
    const kioskPricePerSqm = 145000; // 160 тысяч за квадратный метр

    function formatTenge(n) {
        return new Intl.NumberFormat('kk-KZ', { style: 'currency', currency: 'KZT', maximumFractionDigits: 0 }).format(n);
    }

    function syncKioskDimensions(source) {
        if (source === 'slider-length' || source === 'all') {
            const val = parseFloat(elems.kioskLengthSlider.value);
            elems.kioskLengthInput.value = val;
            elems.kioskLengthDisplay.textContent = val;
        }
        if (source === 'input-length' || source === 'all') {
            let val = parseFloat(elems.kioskLengthInput.value);
            val = Math.max(3, Math.min(13, val));
            elems.kioskLengthSlider.value = val;
            elems.kioskLengthInput.value = val;
            elems.kioskLengthDisplay.textContent = val;
        }
        if (source === 'slider-width' || source === 'all') {
            const val = parseFloat(elems.kioskWidthSlider.value);
            elems.kioskWidthInput.value = val;
            elems.kioskWidthDisplay.textContent = val;
        }
        if (source === 'input-width' || source === 'all') {
            let val = parseFloat(elems.kioskWidthInput.value);
            val = Math.max(2, Math.min(4, val));
            elems.kioskWidthSlider.value = val;
            elems.kioskWidthInput.value = val;
            elems.kioskWidthDisplay.textContent = val;
        }
    }

    function calculate() {
        const type = elems.type.value;
        const size = elems.size.value;
        const material = elems.material.value;
        const qty = Math.max(1, parseInt(elems.qty.value) || 1);

        let base = 0;
        let areaDisplay = '';

        if (type === 'kiosk') {
            // Расчёт по площади для киоска
            const length = parseFloat(elems.kioskLengthSlider.value);
            const width = parseFloat(elems.kioskWidthSlider.value);
            const area = length * width;
            base = Math.round(area * kioskPricePerSqm);
            areaDisplay = `${area} м² (${length} × ${width})`;
        } else {
            // Расчёт по размеру для контейнеров и мобильных
            base = (prices[type] && prices[type][size]) ? prices[type][size] : 0;
            areaDisplay = '';
        }

        const materialFactor = materialMult[material] || 1;

        let addons = 0;
        const selectedAddons = [];
        if (elems.addonIns.checked) { addons += addonPrices.insulation; selectedAddons.push('Утепление'); }
        if (elems.addonEl.checked) { addons += addonPrices.electrical; selectedAddons.push('Электрика'); }
        if (elems.addonShelving.checked) { addons += addonPrices.shelving; selectedAddons.push('Полки'); }

        const perUnit = Math.round((base * materialFactor) + addons);
        const total = perUnit * qty;

        elems.baseEl.textContent = formatTenge(base);
        if (areaDisplay) {
            elems.areaEl.textContent = areaDisplay;
            elems.areaEl.parentElement.style.display = 'flex';
        } else {
            elems.areaEl.parentElement.style.display = 'none';
        }
        elems.materialEl.textContent = `${(materialFactor).toFixed(2)}× → ${formatTenge(Math.round(base * materialFactor))}`;
        elems.addonsEl.textContent = selectedAddons.length ? selectedAddons.join(', ') + ' (' + formatTenge(addons) + ')' : 'Нет';
        elems.qtyEl.textContent = qty;
        elems.totalEl.textContent = formatTenge(total);
    }

    // Переключение видимости блоков размеров
    function updateSizeBlocks() {
        if (elems.type.value === 'kiosk') {
            elems.sizeSelectBlock.style.display = 'none';
            elems.sizeKioskBlock.style.display = 'block';
        } else {
            elems.sizeSelectBlock.style.display = 'block';
            elems.sizeKioskBlock.style.display = 'none';
        }
        calculate();
    }

    // Attach listeners для основных элементов
    ['change', 'input'].forEach(evt => {
        elems.type.addEventListener(evt, updateSizeBlocks);
        elems.size.addEventListener(evt, calculate);
        elems.material.addEventListener(evt, calculate);
        elems.qty.addEventListener(evt, calculate);
        elems.addonIns.addEventListener(evt, calculate);
        elems.addonEl.addEventListener(evt, calculate);
        elems.addonShelving.addEventListener(evt, calculate);
    });

    // Слайдеры и input для киоска
    elems.kioskLengthSlider.addEventListener('input', () => {
        syncKioskDimensions('slider-length');
        calculate();
    });
    elems.kioskLengthInput.addEventListener('input', () => {
        syncKioskDimensions('input-length');
        calculate();
    });
    elems.kioskWidthSlider.addEventListener('input', () => {
        syncKioskDimensions('slider-width');
        calculate();
    });
    elems.kioskWidthInput.addEventListener('input', () => {
        syncKioskDimensions('input-width');
        calculate();
    });

    // presets
    elems.presets.forEach(btn => {
        btn.addEventListener('click', () => {
            const p = btn.dataset.preset;
            if (p === 'kiosk-standard') {
                elems.type.value = 'kiosk';
                elems.kioskLengthSlider.value = 6;
                elems.kioskWidthSlider.value = 4;
                syncKioskDimensions('all');
                elems.material.value = 'steel';
                elems.addonIns.checked = false;
                elems.addonEl.checked = true;
                elems.addonShelving.checked = true;
                elems.qty.value = 1;
                updateSizeBlocks();
            }
            if (p === 'container-large') {
                elems.type.value = 'container';
                elems.size.value = 'large';
                elems.material.value = 'steel';
                elems.addonIns.checked = true;
                elems.addonEl.checked = true;
                elems.addonShelving.checked = false;
                elems.qty.value = 1;
                updateSizeBlocks();
            }
        });
    });

    elems.resetBtn.addEventListener('click', () => {
        elems.type.value = 'container';
        elems.size.value = 'medium';
        elems.kioskLengthSlider.value = 6;
        elems.kioskWidthSlider.value = 4;
        syncKioskDimensions('all');
        elems.material.value = 'steel';
        elems.addonIns.checked = false;
        elems.addonEl.checked = false;
        elems.addonShelving.checked = false;
        elems.qty.value = 1;
        updateSizeBlocks();
    });

    // initial calc
    updateSizeBlocks();
});
