// --- LOGIKA FETCH DATA ---
async function fetchAllData() {
    try {
        if (CONFIG.DATA_SOURCE === 'api') {
            const response = await fetch(CONFIG.API_URL);
            return await response.json();
        } else {
            const response = await fetch(CONFIG.CSV_URL);
            const csvText = await response.text();
            return parseCSV(csvText);
        }
    } catch (error) {
        console.error("Error Fetching Data:", error);
        return [];
    }
}

// --- CSV PARSER (JANGAN DIUBAH) ---
function parseCSV(csvText) {
    const lines = [];
    let currentRow = [];
    let currentCell = '';
    let insideQuotes = false;
    for (let i = 0; i < csvText.length; i++) {
        const char = csvText[i];
        const nextChar = csvText[i + 1];
        if (char === '"' && insideQuotes && nextChar === '"') { currentCell += '"'; i++; }
        else if (char === '"') { insideQuotes = !insideQuotes; }
        else if (char === ',' && !insideQuotes) { currentRow.push(currentCell); currentCell = ''; }
        else if ((char === '\r' || char === '\n') && !insideQuotes) {
            if (char === '\r' && nextChar === '\n') i++;
            if (currentCell || currentRow.length > 0) currentRow.push(currentCell);
            if (currentRow.length > 0) lines.push(currentRow);
            currentRow = []; currentCell = '';
        } else { currentCell += char; }
    }
    if (currentCell || currentRow.length > 0) currentRow.push(currentCell);
    if (currentRow.length > 0) lines.push(currentRow);
    
    const headers = lines[0].map(h => h.trim());
    return lines.slice(1).map(line => {
        let obj = {};
        headers.forEach((h, i) => obj[h] = line[i] || '');
        return obj;
    });
}

// --- TEMA & UI ---
function initApp() {
    document.body.setAttribute('data-color', CONFIG.THEME_COLOR);
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.setAttribute('data-theme', 'dark');
        updateThemeIcon(true);
    } else {
        updateThemeIcon(false);
    }
}

function toggleTheme() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(!isDark);
}

function updateThemeIcon(isDark) {
    const btn = document.getElementById('theme-btn');
    if(btn) btn.innerHTML = isDark ? '<i class="fas fa-sun"></i> ☀️' : '<i class="fas fa-moon"></i> 🌙';
}