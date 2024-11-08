function loadPage(page) {
    const contentDiv = document.getElementById('content');
    fetch(page)
      .then(response => response.text())
      .then(html => {
        contentDiv.innerHTML = html;
      })
      .catch(error => {
        contentDiv.innerHTML = "<p>Error loading page.</p>";
      });
  }
  
  document.getElementById('mergeLink').addEventListener('click', function() {
    loadPage('../html/pdfmerge.html');
  });
  
  document.getElementById('reorderLink').addEventListener('click', function() {
    loadPage('../html/pdfreorder.html');
  });
  
  document.getElementById('addTextLink').addEventListener('click', function() {
    loadPage('../html/pdfaddtext.html');
  });
  