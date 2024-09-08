let slideIndex = 0;
let productsData = {}; // To hold the product data from the JSON

// Fetch product data from JSON file
fetch('products.json')
    .then(response => response.json())
    .then(data => {
        productsData = data; // Store the entire products object
        console.log('Products data:', productsData);

        // Extract the product query parameter from the URL
        const params = new URLSearchParams(window.location.search);
        const product = params.get('product');
        const productId = parseInt(product); // Convert product ID to an integer

        console.log('Product:', productId);
        console.log('Product data:', productsData.products[productId]); // Access the product data using the "products" key

        // If product is found in the query, load it. Otherwise, load default productA.
        if (productId && productsData.products[productId]) {
            loadProduct(productId);
        } else {
            loadProduct('productA'); // Fallback to default productA if no query parameter is present
        }
    })
    .catch(error => console.error('Error fetching product data:', error));

// Function to load a product by ID from the JSON data
function loadProduct(productId) {
    const products = productsData.products; // Access the "products" key
    const product = products[productId]; // Then access the product data using the productId
    console.log('Loading product:', product); // Add this line to verify

    if (product) {
        // Set product name, description, and catalog link
        document.getElementById('productName').innerText = product.name;
        document.getElementById('productDescription').innerText = product.description;
        document.getElementById('catalogLink').setAttribute('href', product.catalogLink);

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

// Slideshow logic for carousel
function showSlides() {
    const slides = document.querySelectorAll('#productImages img');
    const dots = document.querySelectorAll('.dot');

    slides.forEach((slide, index) => {
        slide.style.display = index === slideIndex ? 'block' : 'none'; // Display the current slide
    });

    dots.forEach(dot => dot.classList.remove('active')); // Remove active class from all dots
    if (dots[slideIndex]) dots[slideIndex].classList.add('active'); // Highlight current dot

    slideIndex = (slideIndex + 1) % slides.length; // Move to the next slide
    setTimeout(showSlides, 7000); // Change image every 7 seconds
}

// Function to go to a specific slide
function currentSlide(index) {
    slideIndex = index;
    showSlides();
}