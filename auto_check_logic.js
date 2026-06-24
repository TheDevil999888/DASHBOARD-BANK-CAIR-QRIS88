
// ==========================================
// NEW AUTO-CHECK LOGIC
// ==========================================

function resetAutoCheckState() {
    const input = document.getElementById('auto-check-limit');
    if (input) input.value = '';

    const highlighted = document.querySelectorAll('.row-marked-professional');
    highlighted.forEach(tr => {
        tr.classList.remove('row-marked-professional');
        const cb = tr.querySelector('.minera-check');
        if (cb) cb.checked = false;
    });
}

function parseLimitInput(valStr) {
    if (!valStr) return 0;
    valStr = valStr.toLowerCase().trim();

    // Multipliers
    let multiplier = 1;
    if (valStr.includes('jt') || valStr.includes('juta') || valStr.includes('m')) {
        multiplier = 1000000;
        valStr = valStr.replace(/jt|juta|m/g, '');
    } else if (valStr.includes('rb') || valStr.includes('ribu') || valStr.includes('k')) {
        multiplier = 1000;
        valStr = valStr.replace(/rb|ribu|k/g, '');
    }

    // Clean non-numeric (keep dot/comma if needed, but simple parse usually handles dots as thousands if removed)
    // Assuming standard format 50,000. Replace comma with empty? 
    // JS parseFloat: "50,000" -> 50. So we need to remove commas.
    const cleanNum = valStr.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleanNum) || 0;

    return num * multiplier;
}

function autoCheckUnderLimit() {
    const input = document.getElementById('auto-check-limit');
    if (!input) return;

    // Use smart parsing
    const rawVal = parseLimitInput(input.value);

    if (rawVal <= 0) {
        if (!confirm("Nominal 0 detected. Uncheck all?")) return;
    }

    const rows = document.querySelectorAll('#minera-table-body tr');
    let markedCount = 0;

    rows.forEach(tr => {
        const checkbox = tr.querySelector('.minera-check');
        const saldoCell = tr.querySelector('.minera-saldo-col');

        if (checkbox && saldoCell) {
            // Get text content and parse (Using script.js global parseNominal)
            // parseNominal cleans "Rp 10,000" -> 10000
            const saldoVal = parseNominal(saldoCell.textContent);

            // LOGIC: Check IF saldo < input_limit
            if (saldoVal < rawVal) {
                checkbox.checked = true;
                markedCount++;
                tr.classList.add('row-marked-professional');
            } else {
                checkbox.checked = false;
                tr.classList.remove('row-marked-professional');
            }
        }
    });

    showToast(`${markedCount} Data ditandai (Saldo < ${formatIDR(rawVal)})`, 'success');
}

// Add event listener for formatting the input & Enter Key
document.addEventListener('DOMContentLoaded', () => {
    const limitInput = document.getElementById('auto-check-limit');
    if (limitInput) {
        limitInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                autoCheckUnderLimit();
            }
        });

        // Optional: Simple formatter on blur to show the parsed value
        limitInput.addEventListener('change', (e) => {
            const val = parseLimitInput(e.target.value);
            if (val > 0) e.target.value = val.toLocaleString('en-US');
        });
    }
});
