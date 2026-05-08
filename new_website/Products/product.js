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
        const linkEl       = document.getElementById('catalogLink');
        const pdfFrame     = document.getElementById('catalogFrame');
        const pdfContainer = document.getElementById('pdfContainer');
        const pdfFallback  = document.getElementById('pdfFallback');
        const viewBtn      = document.getElementById('catalogViewBtn');
        const downloadBtn  = document.getElementById('catalogDownloadBtn');

        const actionButtons = document.getElementById('actionButtons');
        const breadcrumbs   = document.getElementById('breadcrumbs');

        const backBtn       = document.getElementById('backBtn');

        // Render Breadcrumbs
        if (breadcrumbs) {
            let breadcrumbHtml = `<a href="../index.html"><svg class="home-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>Home</a>`;
            if (product.category) {
                const catLink = product.categoryId ? `../index.html#${product.categoryId}` : '../index.html';
                breadcrumbHtml += ` <span class="separator">/</span> <a href="${catLink}" class="category-crumb">${product.category}</a>`;
                
                // Also update header back button
                if (backBtn) {
                    backBtn.href = catLink;
                    backBtn.innerText = `Back to ${product.category}`;
                }
            }
            if (product.subcategory) {
                breadcrumbHtml += ` <span class="separator">/</span> <span class="subcategory-crumb">${product.subcategory}</span>`;
            }
            breadcrumbHtml += ` <span class="separator">/</span> <span class="current-crumb">${product.name}</span>`;
            breadcrumbs.innerHTML = breadcrumbHtml;
        }

        const pdfLoader     = document.getElementById('pdfLoader');

        // Always wire up the download link at the bottom
        linkEl.setAttribute('href', catalogLink || '#');

        const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
        const hasPdf   = catalogLink && catalogLink.toLowerCase().endsWith('.pdf');

        // Wire fallback buttons regardless of device (they are always correct)
        if (viewBtn)      viewBtn.setAttribute('href', catalogLink || '#');
        if (downloadBtn)  downloadBtn.setAttribute('href', catalogLink || '#');

        // Reset visibility
        if (actionButtons) actionButtons.style.display = 'none';

        if (hasPdf) {
            if (isMobile) {
                // Mobile: skip iframe entirely — it won't render the PDF
                pdfContainer.style.display = 'none';
                pdfFallback.style.display  = 'block';
                if (actionButtons) actionButtons.style.display = 'none'; // Ensure hidden on mobile
            } else {
                // Desktop: try the iframe, but show fallback if it doesn't load within 8 s
                pdfContainer.style.display = 'block';
                pdfFallback.style.display  = 'none';
                if (pdfLoader) pdfLoader.style.display = 'flex';
                pdfFrame.src = catalogLink + '#view=FitH';

                // Fallback timer — fires if the iframe stays blank (e.g. browser blocks PDFs)
                const fallbackTimer = setTimeout(() => {
                    if (pdfLoader) pdfLoader.style.display = 'none';
                    if (actionButtons) actionButtons.style.display = 'none';
                    showPdfFallback(pdfContainer, pdfFallback);
                }, 8000);

                // If the iframe loads successfully, cancel the fallback timer
                pdfFrame.addEventListener('load', () => {
                    if (pdfLoader) pdfLoader.style.display = 'none';
                    
                    // A blank/failed frame still fires 'load', so we try to detect
                    // an empty contentDocument as a failure signal
                    try {
                        const doc = pdfFrame.contentDocument || pdfFrame.contentWindow.document;
                        if (doc && doc.body && doc.body.innerHTML.trim() === '') {
                            clearTimeout(fallbackTimer);
                            if (actionButtons) actionButtons.style.display = 'none';
                            showPdfFallback(pdfContainer, pdfFallback);
                        } else {
                            clearTimeout(fallbackTimer);
                            if (actionButtons) actionButtons.style.display = 'flex'; // Show button only on success
                        }
                    } catch (e) {
                        // Cross-origin frame: assume it loaded OK (PDF rendered by browser plugin)
                        clearTimeout(fallbackTimer);
                        if (actionButtons) actionButtons.style.display = 'flex'; // Show button
                    }
                }, { once: true });
            }
        } else {
            pdfContainer.style.display = 'none';
            pdfFallback.style.display  = 'none';
            if (actionButtons) actionButtons.style.display = 'none';
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

        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        if (prevBtn && nextBtn) {
            if (product.images.length > 1) {
                prevBtn.style.display = 'flex';
                nextBtn.style.display = 'flex';
            } else {
                prevBtn.style.display = 'none';
                nextBtn.style.display = 'none';
            }
        }
    } else {
        console.error('Product not found:', productId);
    }
}

// Helper function to hide the iframe container and show the fallback card
function showPdfFallback(container, fallback) {
    if (container) container.style.display = 'none';
    if (fallback) fallback.style.display = 'block';
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

function nextSlide() {
    const slides = document.querySelectorAll('#productImages img');
    if (slides.length <= 1) return;
    slideIndex = (slideIndex + 1) % slides.length;
    showSlides();
}

function prevSlide() {
    const slides = document.querySelectorAll('#productImages img');
    if (slides.length <= 1) return;
    slideIndex = (slideIndex - 1 + slides.length) % slides.length;
    showSlides();
}

const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
if (prevBtn) prevBtn.addEventListener('click', prevSlide);
if (nextBtn) nextBtn.addEventListener('click', nextSlide);