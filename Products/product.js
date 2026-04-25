let slideIndex = 0;
let slideTimeout = null;

// The data is now synchronously loaded from data.js into window.productsData
console.log('Products data:', window.productsData);

// Extract the product query parameter from the URL
const params = new URLSearchParams(window.location.search);
let product = params.get('product'); // Get the product parameter as a string

// Safely evaluate if it's numeric and non-empty
if (product !== null && product.trim() !== "" && !isNaN(product)) {
    product = `product${product}`; // Convert numeric product IDs (like '1') to 'product1'
}

console.log('Product:', product);

// If product is found in the query, load it. Otherwise, load default product1.
if (product && window.productsData && window.productsData.products[product]) {
    loadProduct(product);
} else {
    loadProduct('product1'); // Fallback to default 'product1'
}

// Function to load a product by ID from the JSON data
function loadProduct(productId) {
    if (!window.productsData) {
        console.error("productsData is missing. Ensure data.js is loaded correctly.");
        return;
    }
    const products = window.productsData.products; // Access the "products" key
    const product = products[productId]; // Access the product data using the productId
    console.log('Loading product:', product);

    if (product) {
        // Set product name, description, and catalog link
        document.getElementById('productName').innerText = product.name;
        document.getElementById('productDescription').innerText = product.description;
        
        const catalogLink = product.catalogLink;
        document.getElementById('catalogLink').setAttribute('href', catalogLink);
        
        // Setup inline PDF viewer
        const pdfFrame = document.getElementById('catalogFrame');
        const pdfContainer = document.getElementById('pdfContainer');
        if (catalogLink && catalogLink.toLowerCase().endsWith('.pdf')) {
            pdfFrame.src = catalogLink + '#view=FitH';
            pdfContainer.style.display = 'block';
        } else {
            pdfContainer.style.display = 'none';
        }

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
            dot.addEventListener('click', () => currentSlide(index));
            dotsContainer.appendChild(dot);
        });

        slideIndex = 0;
        clearTimeout(slideTimeout); // Clear any existing timeout before starting
        if (product.images.length > 0) {
            showSlides(); // Start the slideshow
        }
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

    if (slides.length <= 1) return; // No need for carousel if 0 or 1 image

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