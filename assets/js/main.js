
// Wait until the entire DOM (HTML structure) has loaded before running this code
document.addEventListener('DOMContentLoaded', function() {

    // Get the element with the ID 'year' and set it to the current year
    const y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();

    // Select all tab links (navigation buttons) and all tab panels (content sections)
    const links = document.querySelectorAll(".tab-link");
    const panels = document.querySelectorAll(".tab-panel");

    // If there are any tabs, activate the first one by default
    if (links.length) {
        links[0].classList.add("active");   // Highlight first tab
        panels[0].classList.add("active");  // Show first tab content
    }

    // Add click event for each tab link
    links.forEach(link => {
        link.addEventListener("click", () => {
            // Remove the 'active' class from all tabs and panels
            links.forEach(l => l.classList.remove("active"));
            panels.forEach(p => p.classList.remove("active"));

            // Mark the clicked tab as active
            link.classList.add("active");

            // Find the corresponding tab content using the link's data-target attribute
            const target = document.querySelector(link.dataset.target);

            // If the target content exists, mark it as active (visible)
            if (target) target.classList.add("active");
        });
    });

});
