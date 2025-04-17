// DOM elements
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const searchOptions = document.querySelectorAll('.search-option');
const themeToggle = document.getElementById('themeToggle');
const settingsToggle = document.getElementById('settingsToggle');
const customSettings = document.getElementById('customSettings');
const settingsClose = document.getElementById('settingsClose');
const resultCount = document.getElementById('resultCount');
const searchRegion = document.getElementById('searchRegion');
const searchLanguage = document.getElementById('searchLanguage');
const timePeriod = document.getElementById('timePeriod');
const siteSearch = document.getElementById('siteSearch');
const shortcutCards = document.querySelectorAll('.shortcut-card');
const searchHistory = document.getElementById('searchHistory');
const historyList = document.getElementById('historyList');
const clearHistory = document.getElementById('clearHistory');

// Initialize theme
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

// Toggle theme
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        localStorage.setItem('theme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
});

// Add event listeners to search options
searchOptions.forEach(option => {
    option.addEventListener('click', () => {
        // Update active button
        searchOptions.forEach(btn => btn.classList.remove('active'));
        option.classList.add('active');
        
        // Update form based on search type
        const searchType = option.getAttribute('data-type');
        
        // Remove any existing tbm parameter
        const existingInput = document.querySelector('input[name="tbm"]');
        if (existingInput) existingInput.remove();
        
        // Add the appropriate parameter based on search type
        if (searchType !== 'web') {
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = 'tbm';
            
            switch (searchType) {
                case 'images':
                    hiddenInput.value = 'isch';
                    break;
                case 'videos':
                    hiddenInput.value = 'vid';
                    break;
                case 'news':
                    hiddenInput.value = 'nws';
                    break;
                case 'maps':
                    // Change the form action for maps
                    searchForm.action = 'https://www.google.com/maps';
                    return;
                case 'shopping':
                    hiddenInput.value = 'shop';
                    break;
                case 'books':
                    hiddenInput.value = 'bks';
                    break;
                case 'scholar':
                    // Change the form action for scholar
                    searchForm.action = 'https://scholar.google.com/scholar';
                    return;
            }
            
            searchForm.appendChild(hiddenInput);
            
            // Reset form action to standard Google search if not maps or scholar
            if (searchType !== 'maps' && searchType !== 'scholar') {
                searchForm.action = 'https://www.google.com/search';
            }
        } else {
            // Reset to standard Google search
            searchForm.action = 'https://www.google.com/search';
        }
    });
});

// Settings toggle
settingsToggle.addEventListener('click', () => {
    customSettings.style.display = customSettings.style.display === 'block' ? 'none' : 'block';
});

// Settings close
settingsClose.addEventListener('click', () => {
    customSettings.style.display = 'none';
});

// Helper function to add or update search parameters
function addOrUpdateParameter(name, value) {
    let input = document.querySelector(`input[name="${name}"]`);
    if (input) {
        input.value = value;
    } else {
        input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        searchForm.appendChild(input);
    }
}

// Fixed search form submission
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Save search to history
    saveSearchToHistory(searchInput.value);
    
    // Clear any existing custom parameters
    const hiddenInputs = searchForm.querySelectorAll('input[type="hidden"]:not([name="tbm"])');
    hiddenInputs.forEach(input => {
        if (!['tbm'].includes(input.name)) {
            input.remove();
        }
    });
    
    // Add custom search parameters
    const numResults = resultCount.value;
    if (numResults && numResults !== '10') {
        addOrUpdateParameter('num', numResults);
    }
    
    const region = searchRegion.value;
    if (region) {
        addOrUpdateParameter('cr', region);
    }
    
    const language = searchLanguage.value;
    if (language) {
        addOrUpdateParameter('lr', language);
    }
    
    const time = timePeriod.value;
    if (time) {
        addOrUpdateParameter('tbs', time);
    }
    
    // Handle site search
    const site = siteSearch.value;
    if (site && site.trim() !== '') {
        // Modify the query to include site: operator
        const originalQuery = searchInput.value;
        const siteQuery = `${originalQuery} site:${site.trim()}`;
        
        // Update the input value
        searchInput.value = siteQuery;
    }
    
    // Submit the form
    searchForm.submit();
    
    // Reset site search input display (visual only)
    if (site && site.trim() !== '') {
        setTimeout(() => {
            searchInput.value = searchInput.value.replace(` site:${site.trim()}`, '');
        }, 100);
    }
});

// Shortcut cards
shortcutCards.forEach(card => {
    card.addEventListener('click', () => {
        const query = card.getAttribute('data-query');
        searchInput.value = query;
        searchForm.submit();
    });
});

// Focus on search input when page loads
window.addEventListener('load', () => {
    searchInput.focus();
    initTheme();
    loadSearchHistory();
});

// Search history functions
function saveSearchToHistory(query) {
    if (!query || query.trim() === '') return;
    
    let searches = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    
    // Remove duplicate if exists
    searches = searches.filter(item => item !== query);
    
    // Add to beginning of array
    searches.unshift(query);
    
    // Limit to 10 recent searches
    if (searches.length > 10) {
        searches = searches.slice(0, 10);
    }
    
    localStorage.setItem('searchHistory', JSON.stringify(searches));
    loadSearchHistory();
}

function loadSearchHistory() {
    const searches = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    
    if (searches.length > 0) {
        searchHistory.style.display = 'block';
        historyList.innerHTML = '';
        
        searches.forEach(query => {
            const li = document.createElement('li');
            li.className = 'history-item';
            
            const querySpan = document.createElement('span');
            querySpan.className = 'history-query';
            querySpan.textContent = query;
            querySpan.addEventListener('click', () => {
                searchInput.value = query;
                searchForm.submit();
            });
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'history-delete';
            deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
            deleteBtn.addEventListener('click', () => {
                deleteSearchFromHistory(query);
            });
            
            li.appendChild(querySpan);
            li.appendChild(deleteBtn);
            historyList.appendChild(li);
        });
    } else {
        searchHistory.style.display = 'none';
    }
}

function deleteSearchFromHistory(query) {
    let searches = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    searches = searches.filter(item => item !== query);
    localStorage.setItem('searchHistory', JSON.stringify(searches));
    loadSearchHistory();
}

clearHistory.addEventListener('click', () => {
    localStorage.removeItem('searchHistory');
    loadSearchHistory();
});

// Events for footer links
document.getElementById('privacy-link').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Privacy Policy: Type_Search and Type_Software does not collect or store any personal data. Searches are sent directly to Google. Your search history is stored only in your browser\'s local storage and is not transmitted to our servers.');
});

document.getElementById('terms-link').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Terms of Service: Type_Search is an alternative Google Frontend Project. It provides a custom interface for Google search but is not affiliated with or endorsed by Google. Use of this service is subject to Google\'s terms of service.');
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Focus search input when pressing / (forward slash)
    if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
    }
    
    // Toggle settings with Ctrl+,
    if (e.key === ',' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        customSettings.style.display = customSettings.style.display === 'block' ? 'none' : 'block';
    }
    
    // Toggle theme with Ctrl+D
    if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        themeToggle.click();
    }
});