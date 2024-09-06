let slideIndex = 0;

let productsData = {
    productA: {
        name: "Product A",
        description: "Description of Product A.",
        catalogLink: "#", // Add a link to the catalog if available
        images: ["img/productA1.jpg", "img/productA2.jpg"]
    },
    productB: {
        name: "Product B",
        description: "Description of Product B.",
        catalogLink: "#", // Add a link to the catalog if available
        images: ["img/productB1.jpg", "img/productB2.jpg"]
    },
    productC: {
        name: "Product C",
        description: "Description of Product C.",
        catalogLink: "#", // Add a link to the catalog if available
        images: ["img/productC1.jpg", "img/productC2.jpg"]
    }
};

// Load default product on page load
window.onload = function () {
    loadProduct('productA'); // Load default product A
};

// Function to load a product by ID
function loadProduct(productId) {
    const product = productsData[productId];

    if (product) {
        // Set product name and description
        document.getElementById('productName').innerText = product.name;
        document.getElementById('productDescription').innerText = product.description;
        document.getElementById('catalogLink').setAttribute('href', product.catalogLink);

        // Set product images
        const slidesContainer = document.getElementById('productImages');
        const dotsContainer = document.getElementById('dots');
        slidesContainer.innerHTML = ''; // Clear previous slides
        dotsContainer.innerHTML = ''; // Clear previous dots

        product.images.forEach((image, index) => {
            // Create image elements for the carousel
            const imgElement = document.createElement('img');
            imgElement.src = image;
            imgElement.style.display = index === 0 ? 'block' : 'none'; // Show the first image by default
            slidesContainer.appendChild(imgElement);

            // Create navigation dots
            const dot = document.createElement('span');
            dot.className = 'dot';
            dot.onclick = () => currentSlide(index); // Navigate to specific slide
            dotsContainer.appendChild(dot);
        });

        slideIndex = 0; // Reset to the first slide
        showSlides(); // Start the slideshow
    }
}

// Slideshow logic
function showSlides() {
    const slides = document.querySelectorAll('#productImages img');
    const dots = document.querySelectorAll('.dot');

    slides.forEach((slide, index) => {
        slide.style.display = index === slideIndex ? 'block' : 'none'; // Show current slide
    });

    dots.forEach(dot => dot.classList.remove('active')); // Remove active class from all dots
    if (dots[slideIndex]) dots[slideIndex].classList.add('active'); // Highlight current dot

    slideIndex = (slideIndex + 1) % slides.length; // Move to next slide
    setTimeout(showSlides, 7000); // Change image every 7 seconds
}

// Navigate to specific slide
function currentSlide(index) {
    slideIndex = index;
    showSlides();
}
