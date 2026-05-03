document.addEventListener('DOMContentLoaded', () => {
    // Select all category headers (.category h2, .category h3)
    const categoryHeaders = document.querySelectorAll('.category h2, .category h3');
    
    categoryHeaders.forEach(header => {
        // Accessibility
        header.setAttribute('tabindex', '0');
        header.setAttribute('role', 'button');
        header.setAttribute('aria-expanded', 'false');

        header.addEventListener('click', function() {
            toggleCategory(this);
        });

        // Keyboard support
        header.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleCategory(this);
            }
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
                setTimeout(() => {
                    targetHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 300); // wait for CSS transition
            }
        }
    };

    function toggleCategory(header) {
        if (header.classList.contains("open")) {
            closeCategory(header);
        } else {
            openCategory(header);
        }
    }

    function openCategory(header) {
        var content = header.nextElementSibling;
        header.classList.add("open");
        header.setAttribute("aria-expanded", "true");
        if (content) {
            content.classList.add("expanded");
        }
    }

    function closeCategory(header) {
        var content = header.nextElementSibling;
        header.classList.remove("open");
        header.setAttribute("aria-expanded", "false");
        if (content) {
            content.classList.remove("expanded");
        }
    }

    // Run on load
    handleDeepLink();

    // Also handle hash changes without reload
    window.addEventListener('hashchange', handleDeepLink);
});
