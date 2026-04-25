document.addEventListener('DOMContentLoaded', () => {
    // Select all category headers (.category h2, .category h3)
    const categoryHeaders = document.querySelectorAll('.category h2, .category h3');
    
    categoryHeaders.forEach(header => {
        header.addEventListener('click', function() {
            var subcategory = this.nextElementSibling;
            var parentCategory = this.parentElement;

            if (subcategory.style.display === "none" || subcategory.style.display === "") {
                subcategory.style.display = "block";
                parentCategory.classList.add("open");
            } else {
                subcategory.style.display = "none";
                parentCategory.classList.remove("open");
            }
        });
    });
});
