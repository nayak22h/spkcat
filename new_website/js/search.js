document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('productSearch');
    const resultsContainer = document.getElementById('autocompleteResults');

    if (!searchInput || !resultsContainer) return;

    // Accessibility setup
    searchInput.setAttribute('role', 'combobox');
    searchInput.setAttribute('aria-expanded', 'false');
    searchInput.setAttribute('aria-autocomplete', 'list');
    searchInput.setAttribute('aria-controls', 'autocompleteResults');
    resultsContainer.setAttribute('role', 'listbox');

    let productsList = [];
    let currentFocusIndex = -1;
    let currentMatches = [];
    
    // 1. Data Initialization
    // The data is loaded via Products/data.js which sets window.productsData
    const initData = () => {
        if (window.productsData && window.productsData.products) {
            productsList = Object.entries(window.productsData.products).map(([id, data]) => ({
                id,
                name: data.name,
                description: data.description || ''
            }));
        } else {
            console.warn("productsData is not loaded. Search will not work.");
        }
    };

    // Try to init data immediately, or wait for it
    if (window.productsData) {
        initData();
    } else {
        // In case data.js loads after this script
        window.addEventListener('load', initData);
    }

    // Path to product detail page in the new website
    const productPathPrefix = 'product.html?product=';

    // 2. Debounce Utility
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    };

    // 3. Highlight Matching Text
    const escapeHTML = (str) => {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    };

    const highlightMatch = (text, query) => {
        const escapedText = escapeHTML(text);
        if (!query) return escapedText;
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')})`, 'gi');
        return escapedText.replace(regex, '<strong>$1</strong>');
    };

    const normalizeString = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

    // 4. Scoring Algorithm
    const getSearchResults = (query) => {
        const normalizedQuery = normalizeString(query);
        
        return productsList
            .map(product => {
                const normalizedName = normalizeString(product.name);
                const normalizedDesc = normalizeString(product.description);
                let score = 0;

                if (normalizedName === normalizedQuery) score = 100;
                else if (normalizedName.startsWith(normalizedQuery)) score = 75;
                else if (normalizedName.includes(normalizedQuery)) score = 50;
                else if (normalizedDesc.includes(normalizedQuery)) score = 25;

                return { ...product, score };
            })
            .filter(product => product.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
    };

    // 5. Render Results
    const renderResults = (matches, query) => {
        resultsContainer.innerHTML = '';
        currentFocusIndex = -1;
        currentMatches = matches;
        
        if (matches.length === 0) {
            const li = document.createElement('li');
            li.className = 'autocomplete-item';
            li.style.color = '#888';
            li.textContent = 'No products found';
            resultsContainer.appendChild(li);
            resultsContainer.classList.remove('hidden');
            return;
        }

        const fragment = document.createDocumentFragment();

        matches.forEach((product, index) => {
            const li = document.createElement('li');
            li.className = 'autocomplete-item';
            li.id = `autocomplete-item-${index}`;
            li.setAttribute('role', 'option');
            li.innerHTML = highlightMatch(product.name, query);
            
            li.addEventListener('click', () => {
                navigateToProduct(product);
            });
            fragment.appendChild(li);
        });

        resultsContainer.appendChild(fragment);
        resultsContainer.classList.remove('hidden');
        searchInput.setAttribute('aria-expanded', 'true');
    };

    const navigateToProduct = (product) => {
        searchInput.value = product.name;
        resultsContainer.classList.add('hidden');
        searchInput.setAttribute('aria-expanded', 'false');
        
        // Handle pathing - if we are on index.html/products.html/about.html etc.
        // product.html is in the same directory.
        window.location.href = productPathPrefix + product.id;
    };

    const updateActiveItem = (items) => {
        Array.from(items).forEach(item => item.classList.remove('selected'));
        if (currentFocusIndex >= 0 && currentFocusIndex < items.length) {
            const activeItem = items[currentFocusIndex];
            activeItem.classList.add('selected');
            activeItem.scrollIntoView({ block: 'nearest' });
            searchInput.setAttribute('aria-activedescendant', activeItem.id);
        }
    };

    // 6. Handle Keyboard Navigation
    searchInput.addEventListener('keydown', (e) => {
        const items = resultsContainer.querySelectorAll('.autocomplete-item');
        if (resultsContainer.classList.contains('hidden') || items.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentFocusIndex = Math.min(currentFocusIndex + 1, items.length - 1);
            updateActiveItem(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentFocusIndex = Math.max(currentFocusIndex - 1, 0);
            updateActiveItem(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentFocusIndex >= 0 && currentMatches[currentFocusIndex]) {
                navigateToProduct(currentMatches[currentFocusIndex]);
            } else if (currentMatches.length > 0) {
                navigateToProduct(currentMatches[0]);
            }
        } else if (e.key === 'Escape') {
            resultsContainer.classList.add('hidden');
            searchInput.setAttribute('aria-expanded', 'false');
            currentFocusIndex = -1;
        }
    });

    const handleInput = debounce((e) => {
        const query = e.target.value.trim();
        
        if (query.length < 1) {
            resultsContainer.classList.add('hidden');
            searchInput.setAttribute('aria-expanded', 'false');
            currentMatches = [];
            return;
        }

        const matches = getSearchResults(query);
        renderResults(matches, query);
    }, 200);

    searchInput.addEventListener('input', handleInput);

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
            resultsContainer.classList.add('hidden');
            searchInput.setAttribute('aria-expanded', 'false');
            currentFocusIndex = -1;
        }
    });
});
