let slideIndex = 0;
let slideTimeout = null;
let productsData = {}; // To hold the product data from the JSON

// Fetch product data from JSON file
fetch('products.json')
    .then(response => response.json())
    .then(data => {
        productsData = data; // Store the entire products object
        console.log('Products data:', productsData);

        // Extract the product query parameter from the URL
        const params = new URLSearchParams(window.location.search);
        let product = params.get('product'); // Get the product parameter as a string

        // Check if product is numeric, if so, convert it to 'productX' format
        if (!isNaN(product)) {
            product = `product${product}`; // Convert numeric product IDs (like '1') to 'product1'
        }

        console.log('Product:', product);
        console.log('Product data:', productsData.products[product]); // Access the product data

        // If product is found in the query, load it. Otherwise, load default product1.
        if (product && productsData.products[product]) {
            loadProduct(product); // Use the key as 'product1', 'product2', etc.
        } else {
            loadProduct('product1'); // Fallback to default 'product1' if no query parameter is present or invalid
        }
    })
    .catch(error => console.error('Error fetching product data:', error));

// Function to load a product by ID from the JSON data
function loadProduct(productId) {
    const products = productsData.products; // Access the "products" key
    const product = products[productId]; // Access the product data using the productId (either 'product1', 'product2', etc.)
    console.log('Loading product:', product);

    if (product) {
        // Set product name, description
        document.getElementById('productName').innerText = product.name;
        document.getElementById('productDescription').innerText = product.description;

        // Setup PDF viewer
        const pdfContainer = document.getElementById('pdfContainer');
        const pdfObject = document.getElementById('pdfObject');
        const pdfFrameFallback = document.getElementById('pdfFrameFallback');
        const pdfDownloadLink = document.getElementById('pdfDownloadLink');
        const catalogBtn = document.getElementById('catalogBtn');

        // Reset viewer state when loading new product
        pdfContainer.style.display = 'none';
        catalogBtn.innerText = 'View Product Catalog';

        // Bind click event to toggle the PDF
        catalogBtn.onclick = function(e) {
            e.preventDefault();
            if (pdfContainer.style.display === 'none') {
                // Show PDF (Set paths dynamically)
                pdfObject.setAttribute('data', product.catalogLink);
                pdfFrameFallback.setAttribute('src', product.catalogLink);
                pdfDownloadLink.setAttribute('href', product.catalogLink);
                
                pdfContainer.style.display = 'block';
                catalogBtn.innerText = 'Close Product Catalog';
                // Scroll down slightly so the user sees the PDF viewer opened
                pdfContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                // Hide PDF
                pdfContainer.style.display = 'none';
                catalogBtn.innerText = 'View Product Catalog';
            }
        };

        // Clear previous images and dots
        const slidesContainer = document.getElementById('productImages');
        const dotsContainer = document.getElementById('dots');
        slidesContainer.innerHTML = '';
        dotsContainer.innerHTML = '';

        // Add product images and dots
        product.images.forEach((image, index) => {
            const imgElement = document.createElement('img');
            imgElement.src = image;
            imgElement.style.display = index === 0 ? 'block' : 'none';
            slidesContainer.appendChild(imgElement);

            const dot = document.createElement('span');
            dot.className = 'dot';
            dot.onclick = () => currentSlide(index);
            dotsContainer.appendChild(dot);
        });

        slideIndex = 0;
        showSlides(); // Start the slideshow
    } else {
        console.error('Product not found:', productId);
    }
}

// NEW Slideshow logic for carousel 
function showSlides() {
    const slides = document.querySelectorAll('#productImages img');
    const dots = document.querySelectorAll('.dot');

    // Hide all slides
    slides.forEach((slide) => {
        slide.style.display = 'none';
    });

    // Show the current slide
    if (slides[slideIndex]) {
        slides[slideIndex].style.display = 'block';
    }

    // Update dots
    dots.forEach(dot => dot.classList.remove('active'));
    if (dots[slideIndex]) {
        dots[slideIndex].classList.add('active');
    }

    // Clear existing timer to prevent speeding up when clicking dots
    clearTimeout(slideTimeout);

    // Schedule next slide after 7 seconds
    slideTimeout = setTimeout(() => {
        slideIndex = (slideIndex + 1) % slides.length;
        showSlides();
    }, 7000);
}

// Function to go to a specific slide
function currentSlide(index) {
    slideIndex = index;
    showSlides();
}