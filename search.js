document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('productSearch');
    const resultsContainer = document.getElementById('autocompleteResults');

    if (!searchInput || !resultsContainer) return;

    let productsList = [];
    
    // Convert products object to an array for easier filtering
    if (window.productsData && window.productsData.products) {
        productsList = Object.entries(window.productsData.products).map(([id, data]) => ({
            id,
            name: data.name,
            description: data.description
        }));
    } else {
        console.warn("productsData is not loaded. Search will not work.");
    }

    // Determine the base path for product links
    // If we are in Products/ directory, we don't need 'Products/' prefix
    const isProductPage = window.location.pathname.includes('/Products/');
    const productPathPrefix = isProductPage ? 'prod.html?product=' : 'Products/prod.html?product=';

    // Function to render items
    const renderResults = (matches) => {
        resultsContainer.innerHTML = '';
        
        if (matches.length === 0) {
            resultsContainer.innerHTML = '<li class="autocomplete-item" style="color: #888;">No products found</li>';
            resultsContainer.classList.remove('hidden');
            return;
        }

        matches.forEach(product => {
            const li = document.createElement('li');
            li.className = 'autocomplete-item';
            
            // Highlight matching text if desired
            li.textContent = product.name; 
            
            li.addEventListener('click', () => {
                // Action on click: load product or navigate
                searchInput.value = product.name;
                resultsContainer.classList.add('hidden');
                
                // Navigate to the product details page
                window.location.href = productPathPrefix + product.id;
            });
            resultsContainer.appendChild(li);
        });

        resultsContainer.classList.remove('hidden');
    };

    // Event listener for typing
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length < 1) {
            resultsContainer.classList.add('hidden');
            return;
        }

        const matches = productsList.filter(product => 
            product.name.toLowerCase().includes(query) || 
            product.description.toLowerCase().includes(query)
        );

        renderResults(matches);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
            resultsContainer.classList.add('hidden');
        }
    });
});
