let slideIndex = 0;
let productsData = {}; // To hold the product data

// Fetch product data from JSON
fetch('products.json')
    .then(response => response.json())
    .then(data => {
        productsData = data.products;
        loadProduct('productA'); // Load default product
    })
    .catch(error => console.error('Error fetching product data:', error));

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
        slidesContainer.innerHTML = '';
        dotsContainer.innerHTML = '';

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
    }
}

// Slideshow logic
function showSlides() {
    const slides = document.querySelectorAll('#productImages img');
    const dots = document.querySelectorAll('.dot');

    slides.forEach((slide, index) => {
        slide.style.display = index === slideIndex ? 'block' : 'none';
    });

    dots.forEach(dot => dot.classList.remove('active'));
    if (dots[slideIndex]) dots[slideIndex].classList.add('active');

    slideIndex = (slideIndex + 1) % slides.length;
    setTimeout(showSlides, 7000); // Change image every 7 seconds
}

function currentSlide(index) {
    slideIndex = index;
    showSlides();
}
