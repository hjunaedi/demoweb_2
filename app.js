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
        console.error("Error:", error);
        return [];
    }
}

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

function initApp() {
    document.body.setAttribute('data-color', CONFIG.THEME_COLOR);
    if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.setAttribute('data-theme', 'dark');
        if(document.getElementById('theme-btn')) document.getElementById('theme-btn').innerText = '☀️';
    }
}

function toggleTheme() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
    if(document.getElementById('theme-btn')) document.getElementById('theme-btn').innerText = isDark ? '🌙' : '☀️';
}