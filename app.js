// --- 1. Fetch Data ---
async function fetchAllData() {
    try {
        const response = await fetch(CONFIG.CSV_URL);
        const text = await response.text();
        return parseCSV(text);
    } catch (e) {
        console.error("Gagal ambil data:", e);
        return [];
    }
}

// --- 2. Parser CSV (JANGAN DIUBAH) ---
function parseCSV(csv) {
    const lines = []; let row = []; let cell = ''; let quote = false;
    for (let i = 0; i < csv.length; i++) {
        let c = csv[i], n = csv[i+1];
        if (c === '"' && quote && n === '"') { cell += '"'; i++; }
        else if (c === '"') { quote = !quote; }
        else if (c === ',' && !quote) { row.push(cell); cell = ''; }
        else if ((c === '\r' || c === '\n') && !quote) {
            if (c === '\r' && n === '\n') i++;
            if (cell || row.length) row.push(cell);
            if (row.length) lines.push(row);
            row = []; cell = '';
        } else { cell += c; }
    }
    if (cell || row.length) row.push(cell);
    if (row.length) lines.push(row);
    const headers = lines[0].map(h => h.trim());
    return lines.slice(1).map(r => {
        let obj = {}; headers.forEach((h, i) => obj[h] = r[i] || ''); return obj;
    });
}

// --- 3. UI & Utility ---
function initApp() {
    document.body.setAttribute('data-color', CONFIG.THEME_COLOR);
    const theme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.body.setAttribute('data-theme', theme);
    updateIcon(theme === 'dark');
}

function toggleTheme() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
    updateIcon(!isDark);
}

function updateIcon(isDark) {
    const btn = document.getElementById('theme-btn');
    if(btn) btn.innerText = isDark ? '☀️' : '🌙';
}