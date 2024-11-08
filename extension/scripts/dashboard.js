document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('.nav-link');
    
    // Function to load a page into the container
    function loadPage(pageUrl) {
        const container = document.getElementById('pageContainer');
        fetch(pageUrl)
            .then(response => response.text())
            .then(html => {
                container.innerHTML = html;
            })
            .catch(error => {
                console.error('Error loading page:', error);
            });
    }

    // Event listeners for the links
    document.getElementById('pdfReorderLink').addEventListener('click', function(event) {
        event.preventDefault();
        loadPage('../html/pdfreorder.html');
    });

    document.getElementById('pdfMergeLink').addEventListener('click', function(event) {
        event.preventDefault();
        loadPage('../html/pdfmerge.html');
    });

    document.getElementById('pdfAddTextLink').addEventListener('click', function(event) {
        event.preventDefault();
        loadPage('../html/pdfaddtext.html');
    });

    // Load the default page (pdfmerge.html) on load
    loadPage('../html/pdfmerge.html');
});
