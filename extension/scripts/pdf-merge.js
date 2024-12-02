//required for testing purposes
if (typeof require !== 'undefined') {
  var { PDFDocument } = require('pdf-lib');
}

function validateFiles(pdf1Input, pdf2Input) {
  if (!pdf1Input || !pdf2Input) {
    alert("Please select both PDFs.");
    return false;
  }
  return true;
}

async function loadPdfFiles(pdf1Input, pdf2Input) {
  const pdf1Bytes = await pdf1Input.arrayBuffer();
  const pdf2Bytes = await pdf2Input.arrayBuffer();
  const pdf1 = await PDFDocument.load(pdf1Bytes);
  const pdf2 = await PDFDocument.load(pdf2Bytes);
  return { pdf1, pdf2 };
}

async function mergePdfs(pdf1, pdf2) {
  const mergedPdf = await PDFDocument.create();
  const pdf1Pages = await mergedPdf.copyPages(pdf1, pdf1.getPageIndices());
  pdf1Pages.forEach((page) => mergedPdf.addPage(page));

  const pdf2Pages = await mergedPdf.copyPages(pdf2, pdf2.getPageIndices());
  pdf2Pages.forEach((page) => mergedPdf.addPage(page));

  return mergedPdf.save();
}

function updateDomWithMergedPdf(mergedPdfBytes) {
  const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
  const mergedPdfUrl = URL.createObjectURL(blob);

  const mergedPreviewElement = document.getElementById('merged-pdf-preview');
  mergedPreviewElement.innerHTML = '';
  const iframe = document.createElement('iframe');
  iframe.src = mergedPdfUrl;
  mergedPreviewElement.appendChild(iframe);

  const downloadAsIsButton = document.getElementById('download-as-is');
  downloadAsIsButton.style.display = 'block';
  downloadAsIsButton.addEventListener('click', function () {
    const a = document.createElement('a');
    a.href = mergedPdfUrl;
    a.download = 'merged.pdf';
    a.click();
  });
}

async function handlePdfMergeSubmit(event) {
  event.preventDefault();

  const pdf1Input = document.getElementById('pdf1').files[0];
  const pdf2Input = document.getElementById('pdf2').files[0];

  if (!validateFiles(pdf1Input, pdf2Input)) {
    return;
  }

  const { pdf1, pdf2 } = await loadPdfFiles(pdf1Input, pdf2Input);
  const mergedPdfBytes = await mergePdfs(pdf1, pdf2);
  updateDomWithMergedPdf(mergedPdfBytes);
}

function setupPdfMerge() {
  document.getElementById('pdf-form').addEventListener('submit', handlePdfMergeSubmit);
}

function handleResetClick() {
  document.getElementById('merged-pdf-preview').innerHTML = '';
  document.getElementById('download-as-is').style.display = 'none';
}

function setupResetButton() {
  document.getElementById('reset-button').addEventListener('click', handleResetClick);
}

document.addEventListener('DOMContentLoaded', () => {
  setupPdfMerge();
  setupResetButton();
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateFiles,
    loadPdfFiles,
    mergePdfs,
    updateDomWithMergedPdf,
    handlePdfMergeSubmit,
    setupPdfMerge,
    handleResetClick,
    setupResetButton,
  };
}