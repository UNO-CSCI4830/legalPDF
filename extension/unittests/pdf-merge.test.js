


const {
  validateFiles,
  loadPdfFiles,
  mergePdfs,
  updateDomWithMergedPdf,
} = require('../scripts/pdf-merge');
const { PDFDocument } = require('pdf-lib');

beforeAll(() => {
  global.alert = jest.fn();
  global.URL.createObjectURL = jest.fn(() => 'mockURL');
});

beforeEach(() => {
  document.body.innerHTML = `
    <form id="pdf-form">
      <input type="file" id="pdf1" />
      <input type="file" id="pdf2" />
    </form>
    <div id="merged-pdf-preview"></div>
    <button id="download-as-is" style="display:none"></button>
    <button id="reset-button"></button>
  `;
});

describe('PDF Merge Script - Smaller Functions', () => {
  test('Should validate files correctly', () => {
    expect(validateFiles(null, null)).toBe(false);
    expect(validateFiles({}, null)).toBe(false);
    expect(validateFiles({}, {})).toBe(true);
  });

  test('Should load PDF files', async () => {
    const mockPdfDocument = await PDFDocument.create();
    const mockPdfBytes = await mockPdfDocument.save();
    const file1 = new File([mockPdfBytes], 'pdf1.pdf', { type: 'application/pdf' });
    const file2 = new File([mockPdfBytes], 'pdf2.pdf', { type: 'application/pdf' });

    Object.defineProperty(file1, 'arrayBuffer', {
      value: jest.fn().mockResolvedValue(mockPdfBytes),
    });
    Object.defineProperty(file2, 'arrayBuffer', {
      value: jest.fn().mockResolvedValue(mockPdfBytes),
    });

    const { pdf1, pdf2 } = await loadPdfFiles(file1, file2);

    expect(pdf1).toBeDefined();
    expect(pdf2).toBeDefined();
  });

  test('Should merge PDF files', async () => {
    const pdf1 = await PDFDocument.create();
    const pdf2 = await PDFDocument.create();

    const mergedPdfBytes = await mergePdfs(pdf1, pdf2);
    expect(mergedPdfBytes).toBeDefined();
  });

  test('Should update the DOM with merged PDF', () => {
    const mockPdfBytes = new Uint8Array([0, 1, 2, 3, 4, 5]);
    updateDomWithMergedPdf(mockPdfBytes);

    const mergedPreviewElement = document.getElementById('merged-pdf-preview');
    expect(mergedPreviewElement.innerHTML).not.toBe('');

    const downloadAsIsButton = document.getElementById('download-as-is');
    expect(downloadAsIsButton.style.display).toBe('block');
  });
});
