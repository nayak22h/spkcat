function toggleSubcategories(element) {
    var subcategory = element.nextElementSibling;
    var parentCategory = element.parentElement;

    if (subcategory.style.display === "none" || subcategory.style.display === "") {
        subcategory.style.display = "block";
        parentCategory.classList.add("open");
    } else {
        subcategory.style.display = "none";
        parentCategory.classList.remove("open");
    }
}
