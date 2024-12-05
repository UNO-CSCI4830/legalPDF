// Event listener for the form submission
document.getElementById('pdf-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const pdf1Input = document.getElementById('pdf1').files[0];
  const pdf2Input = document.getElementById('pdf2').files[0];

  if (!pdf1Input || !pdf2Input) {
    alert("Please select both PDFs.");
    return;
  }

  const pdf1Bytes = await pdf1Input.arrayBuffer();
  const pdf2Bytes = await pdf2Input.arrayBuffer();
  const pdf1 = await PDFLib.PDFDocument.load(pdf1Bytes);
  const pdf2 = await PDFLib.PDFDocument.load(pdf2Bytes);

  const mergedPdf = await PDFLib.PDFDocument.create();
  const pdf1Pages = await mergedPdf.copyPages(pdf1, pdf1.getPageIndices());
  pdf1Pages.forEach((page) => mergedPdf.addPage(page));

  const pdf2Pages = await mergedPdf.copyPages(pdf2, pdf2.getPageIndices());
  pdf2Pages.forEach((page) => mergedPdf.addPage(page));

  const mergedPdfBytes = await mergedPdf.save();

  const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
  const mergedPdfUrl = URL.createObjectURL(blob);

  const mergedPreviewElement = document.getElementById('merged-pdf-preview');
  mergedPreviewElement.innerHTML = '';
  const iframe = document.createElement('iframe');
  iframe.src = mergedPdfUrl;
  mergedPreviewElement.appendChild(iframe);

  const reorderButton = document.getElementById('reorder-button');
  reorderButton.style.display = 'block';

  const downloadLink = document.getElementById('download-link');
  downloadLink.href = mergedPdfUrl;
  downloadLink.download = 'merged.pdf';
  downloadLink.style.display = 'block';
  downloadLink.textContent = 'Download Merged PDF';

  reorderButton.addEventListener('click', function () {
    window.location.href = `reorder.html?pdfUrl=${encodeURIComponent(mergedPdfUrl)}`;
  });
});

// Event listener for the reset button
document.getElementById('reset-button').addEventListener('click', function () {
  document.getElementById('pdf1').value = '';
  document.getElementById('pdf2').value = '';
  document.getElementById('pdf1-preview').innerHTML = '';
  document.getElementById('pdf2-preview').innerHTML = '';
  document.getElementById('merged-pdf-preview').innerHTML = '';
  document.getElementById('reorder-button').style.display = 'none';
  document.getElementById('download-link').style.display = 'none';
  document.getElementById('download-as-is').style.display = 'none';
});

// Navigation buttons functionality
document.getElementById('merge-pdf-button').addEventListener('click', function () {
  window.location.href = 'pdfmerge.html';
});

document.getElementById('reorder-pdf-button').addEventListener('click', function () {
  window.location.href = 'pdfreorder.html';
});

document.getElementById('add-text-pdf-button').addEventListener('click', function () {
  window.location.href = 'pdfaddtext.html';
});
