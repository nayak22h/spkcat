document.addEventListener('DOMContentLoaded', () => {
    // Select all category headers (.category h2, .category h3)
    const categoryHeaders = document.querySelectorAll('.category h2, .category h3');
    
    categoryHeaders.forEach(header => {
        header.addEventListener('click', function() {
            toggleCategory(this);
        });
    });

    // Handle deep-linking to categories (e.g. index.html#cat-12)
    const handleDeepLink = () => {
        const hash = window.location.hash;
        if (hash) {
            const targetHeader = document.querySelector(hash);
            if (targetHeader) {
                // If it's a sub-category (h3), also open its parent (h2)
                if (targetHeader.tagName === 'H3') {
                    const parentSubcat = targetHeader.closest('.subcategory');
                    if (parentSubcat) {
                        const mainHeader = parentSubcat.previousElementSibling;
                        if (mainHeader && mainHeader.tagName === 'H2') {
                            openCategory(mainHeader);
                        }
                    }
                }
                openCategory(targetHeader);
                targetHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    function toggleCategory(header) {
        var subcategory = header.nextElementSibling;
        var parentCategory = header.parentElement;

        if (subcategory.style.display === "none" || subcategory.style.display === "") {
            openCategory(header);
        } else {
            closeCategory(header);
        }
    }

    function openCategory(header) {
        var subcategory = header.nextElementSibling;
        var parentCategory = header.parentElement;
        subcategory.style.display = "block";
        parentCategory.classList.add("open");
    }

    function closeCategory(header) {
        var subcategory = header.nextElementSibling;
        var parentCategory = header.parentElement;
        subcategory.style.display = "none";
        parentCategory.classList.remove("open");
    }

    // Run on load
    handleDeepLink();

    // Also handle hash changes without reload
    window.addEventListener('hashchange', handleDeepLink);
});
