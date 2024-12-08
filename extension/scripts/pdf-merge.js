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
  iframe.width = '100%';
  iframe.height = '500px';
  mergedPreviewElement.appendChild(iframe);

  const downloadAsIsButton = document.getElementById('download-as-is');
  const addTextButton = document.getElementById('addTextMergedBtn');
  downloadAsIsButton.style.display = 'block';
  addTextButton.style.display = 'block';

  downloadAsIsButton.addEventListener('click', function () {
    const a = document.createElement('a');
    a.href = mergedPdfUrl;
    a.download = 'merged.pdf';
    a.click();
  });

  addTextButton.addEventListener('click', function () {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
      const pdfAddTextUrl = chrome.runtime.getURL(`../html/pdfaddtext.html?pdfUrl=${encodeURIComponent(mergedPdfUrl)}`);
      chrome.tabs.create({ url: pdfAddTextUrl });
    } else {
      const pdfAddTextUrl = `../html/pdfaddtext.html?pdfUrl=${encodeURIComponent(mergedPdfUrl)}`;
      window.open(pdfAddTextUrl, '_blank');
    }
  });
});

document.getElementById('reset-button').addEventListener('click', function () {
  document.getElementById('merged-pdf-preview').innerHTML = '';
  document.getElementById('download-as-is').style.display = 'none';
  document.getElementById('addTextMergedBtn').style.display = 'none';
});
