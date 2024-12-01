if (typeof require !== 'undefined') {
  var { PDFDocument } = require('pdf-lib');
}


// Function to validate file inputs
function validateFiles(pdf1Input, pdf2Input) {
  if (!pdf1Input || !pdf2Input) {
    alert("Please select both PDFs.");
    return false;
  }
  return true;
}

// Function to load PDF files into PDFDocument instances
async function loadPdfFiles(pdf1Input, pdf2Input) {
  const pdf1Bytes = await pdf1Input.arrayBuffer();
  const pdf2Bytes = await pdf2Input.arrayBuffer();
  const pdf1 = await PDFLib.PDFDocument.load(pdf1Bytes);
  const pdf2 = await PDFLib.PDFDocument.load(pdf2Bytes);
  return { pdf1, pdf2 };
}

// Function to merge two PDF files
async function mergePdfs(pdf1, pdf2) {
  const mergedPdf = await PDFLib.PDFDocument.create();
  const pdf1Pages = await mergedPdf.copyPages(pdf1, pdf1.getPageIndices());
  pdf1Pages.forEach((page) => mergedPdf.addPage(page));

  const pdf2Pages = await mergedPdf.copyPages(pdf2, pdf2.getPageIndices());
  pdf2Pages.forEach((page) => mergedPdf.addPage(page));

  return mergedPdf.save();
}

// Function to update the DOM with the merged PDF preview and download link
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

// Main function to handle PDF merge submission
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

// Function to add event listener for PDF merge
function setupPdfMerge() {
  document.getElementById('pdf-form').addEventListener('submit', handlePdfMergeSubmit);
}

// Function to handle reset button click
function handleResetClick() {
  document.getElementById('merged-pdf-preview').innerHTML = '';
  document.getElementById('download-as-is').style.display = 'none';
}

// Function to add event listener for reset button
function setupResetButton() {
  document.getElementById('reset-button').addEventListener('click', handleResetClick);
}

// Set up event listeners once the DOM is fully loaded
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