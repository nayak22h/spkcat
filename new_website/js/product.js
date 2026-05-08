let slideIndex = 0;
let slideTimeout = null;

// Ensure productsData is loaded
console.log('Products data:', window.productsData);

document.addEventListener('DOMContentLoaded', () => {
    // Extract the product query parameter from the URL
    const params = new URLSearchParams(window.location.search);
    let product = params.get('product'); 

    // Safely evaluate if it's numeric and non-empty
    if (product !== null && product.trim() !== "" && !isNaN(product)) {
        product = `product${product}`; 
    }

    console.log('Product:', product);

    // Load requested product or fallback
    if (product && window.productsData && window.productsData.products[product]) {
        loadProduct(product);
    } else {
        loadProduct('product1'); // Fallback
    }
});

function loadProduct(productId) {
    if (!window.productsData) {
        console.error("productsData is missing. Ensure data.js is loaded correctly.");
        return;
    }
    
    const products = window.productsData.products;
    const product = products[productId];

    if (product) {
        // Set basic details
        document.getElementById('productName').innerText = product.name;
        document.getElementById('productDescription').innerText = product.description;
        
        // Set Badge
        const badge = document.getElementById('productCategoryBadge');
        if (badge) {
            badge.innerText = product.category || 'Product';
        }

        // Setup Document Links
        const catalogLink = product.catalogLink;
        // Fix relative path for catalogLink since we are in a subfolder. 
        // data.js provides links like "../path/to/file.pdf" assuming from Products/ folder.
        // We are in new_website/ folder, so the path works the exact same way as from Products/ because both are 1 level deep from root.
        
        const linkEl       = document.getElementById('catalogLink');
        const pdfFrame     = document.getElementById('catalogFrame');
        const pdfContainer = document.getElementById('pdfContainer');
        const pdfFallback  = document.getElementById('pdfFallback');
        const viewBtn      = document.getElementById('catalogViewBtn');
        const downloadBtn  = document.getElementById('catalogDownloadBtn');
        const actionButtons = document.getElementById('actionButtons');
        const breadcrumbs   = document.getElementById('breadcrumbs');
        const pdfSection    = document.getElementById('pdfSection');

        // Render Breadcrumbs
        if (breadcrumbs) {
            let breadcrumbHtml = `<a href="index.html">Home</a>`;
            if (product.category) {
                const catLink = product.categoryId ? `../index.html#${product.categoryId}` : '../index.html';
                breadcrumbHtml += ` <span class="separator">/</span> <a href="${catLink}">${product.category}</a>`;
            }
            if (product.subcategory) {
                breadcrumbHtml += ` <span class="separator">/</span> <span>${product.subcategory}</span>`;
            }
            breadcrumbHtml += ` <span class="separator">/</span> <span style="color:var(--text-main); font-weight:600;">${product.name}</span>`;
            breadcrumbs.innerHTML = breadcrumbHtml;
        }

        const pdfLoader = document.getElementById('pdfLoader');
        const hasPdf   = catalogLink && catalogLink.toLowerCase().endsWith('.pdf');
        const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

        // Wire buttons
        if (linkEl) linkEl.setAttribute('href', catalogLink || '#');
        if (viewBtn) viewBtn.setAttribute('href', catalogLink || '#');
        if (downloadBtn) downloadBtn.setAttribute('href', catalogLink || '#');

        if (hasPdf) {
            pdfSection.style.display = 'block'; // Show the whole section
            
            if (isMobile) {
                pdfContainer.style.display = 'none';
                pdfFallback.style.display  = 'block';
                if (actionButtons) actionButtons.style.display = 'none'; 
            } else {
                pdfContainer.style.display = 'block';
                pdfFallback.style.display  = 'none';
                if (pdfLoader) pdfLoader.style.display = 'flex';
                
                // Load PDF
                pdfFrame.src = catalogLink + '#view=FitH';

                // Fallback timer
                const fallbackTimer = setTimeout(() => {
                    if (pdfLoader) pdfLoader.style.display = 'none';
                    if (actionButtons) actionButtons.style.display = 'none';
                    showPdfFallback(pdfContainer, pdfFallback);
                }, 8000);

                pdfFrame.addEventListener('load', () => {
                    if (pdfLoader) pdfLoader.style.display = 'none';
                    try {
                        const doc = pdfFrame.contentDocument || pdfFrame.contentWindow.document;
                        if (doc && doc.body && doc.body.innerHTML.trim() === '') {
                            clearTimeout(fallbackTimer);
                            if (actionButtons) actionButtons.style.display = 'none';
                            showPdfFallback(pdfContainer, pdfFallback);
                        } else {
                            clearTimeout(fallbackTimer);
                            if (actionButtons) actionButtons.style.display = 'inline-flex';
                        }
                    } catch (e) {
                        clearTimeout(fallbackTimer);
                        if (actionButtons) actionButtons.style.display = 'inline-flex';
                    }
                }, { once: true });
            }
        } else {
            pdfSection.style.display = 'none';
            if (actionButtons) actionButtons.style.display = 'none';
        }

        // Setup Carousel Images
        const slidesContainer = document.getElementById('productImages');
        const dotsContainer = document.getElementById('dots');
        slidesContainer.innerHTML = '';
        dotsContainer.innerHTML = '';

        product.images.forEach((image, index) => {
            const imgElement = document.createElement('img');
            // Fix image path if needed (data.js has relative paths like "prod1.jpeg")
            // Since data.js assumes we are in Products/, images are in Products/
            // But we are in new_website/, so we need to point to ../Products/prod1.jpeg
            // If the path doesn't start with http or ../
            let imgPath = image;
            if (!imgPath.startsWith('http') && !imgPath.startsWith('../')) {
                imgPath = `../Products/${imgPath}`;
            }
            
            imgElement.src = imgPath;
            imgElement.style.display = index === 0 ? 'block' : 'none';
            slidesContainer.appendChild(imgElement);

            const dot = document.createElement('span');
            dot.className = 'dot';
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => currentSlide(index));
            dotsContainer.appendChild(dot);
        });

        slideIndex = 0;
        clearTimeout(slideTimeout);
        
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (product.images.length > 0) {
            showSlides();
        }

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
        document.getElementById('productName').innerText = "Product Not Found";
        document.getElementById('productDescription').innerText = "The requested product does not exist.";
    }
}

function showPdfFallback(container, fallback) {
    if (container) container.style.display = 'none';
    if (fallback) fallback.style.display = 'block';
}

function showSlides() {
    const slides = document.querySelectorAll('#productImages img');
    const dots = document.querySelectorAll('.dot');

    slides.forEach((slide) => slide.style.display = 'none');
    
    if (slides[slideIndex]) {
        slides[slideIndex].style.display = 'block';
    }

    dots.forEach(dot => dot.classList.remove('active'));
    if (dots[slideIndex]) {
        dots[slideIndex].classList.add('active');
    }

    clearTimeout(slideTimeout);

    if (slides.length <= 1) return;

    slideTimeout = setTimeout(() => {
        slideIndex = (slideIndex + 1) % slides.length;
        showSlides();
    }, 7000);
}

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

// Event listeners for prev/next
document.getElementById('prevBtn')?.addEventListener('click', prevSlide);
document.getElementById('nextBtn')?.addEventListener('click', nextSlide);
