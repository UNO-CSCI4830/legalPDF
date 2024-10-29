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
