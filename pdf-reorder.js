document.getElementById('pdf-reorder-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const pdfInput = document.getElementById('pdf-file').files[0];
  const orderInput = document.getElementById('page-order').value.split(',').map(Number);
  const keepPagesInput = document.getElementById('keep-pages').value.split(',').map(Number);

  if (!pdfInput) {
    alert("Please select a PDF.");
    return;
  }

  const pdfBytes = await pdfInput.arrayBuffer();
  const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
  const newPdfDoc = await PDFLib.PDFDocument.create();

  const pdfPages = await pdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
  
  keepPagesInput.forEach((pageIndex) => {
    const page = pdfPages[orderInput.indexOf(pageIndex)];
    if (page) {
      newPdfDoc.addPage(page);
    }
  });

  const newPdfBytes = await newPdfDoc.save();

  const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
  const downloadLink = document.getElementById('download-reordered-link');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = 'reordered.pdf';
  downloadLink.style.display = 'block';
  downloadLink.textContent = 'Download Reordered PDF';

  const reorderPreviewElement = document.getElementById('reorder-pdf-preview');
  reorderPreviewElement.innerHTML = '';
  const iframe = document.createElement('iframe');
  iframe.src = URL.createObjectURL(blob);
  reorderPreviewElement.appendChild(iframe);
});
