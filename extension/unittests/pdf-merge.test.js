const {
  validateFiles,
  loadPdfFiles,
  mergePdfs,
  updateDomWithMergedPdf,
  handleResetClick,
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

describe('PDF Merge Script - Edge Cases', () => {
  test('Should handle invalid PDF files gracefully', async () => {
    const invalidPdfBytes = new Uint8Array([1, 2, 3]); // Not a valid PDF
    const file1 = new File([invalidPdfBytes], 'invalid1.pdf', { type: 'application/pdf' });
    const file2 = new File([invalidPdfBytes], 'invalid2.pdf', { type: 'application/pdf' });

    Object.defineProperty(file1, 'arrayBuffer', {
      value: jest.fn().mockResolvedValue(invalidPdfBytes),
    });
    Object.defineProperty(file2, 'arrayBuffer', {
      value: jest.fn().mockResolvedValue(invalidPdfBytes),
    });

    await expect(loadPdfFiles(file1, file2)).rejects.toThrow();
  });

  test('Should not merge if PDFs are not loaded properly', async () => {
    const pdf1 = null; // Simulate failed PDF load
    const pdf2 = await PDFDocument.create();

    await expect(mergePdfs(pdf1, pdf2)).rejects.toThrow();
  });
});

describe('PDF Merge Script - Button Interactions', () => {
  test('Reset button should clear the merged PDF preview', () => {

    const mergedPreviewElement = document.getElementById('merged-pdf-preview');
    mergedPreviewElement.innerHTML = '<iframe src="mockURL"></iframe>';
    const downloadButton = document.getElementById('download-as-is');
    downloadButton.style.display = 'block';

    handleResetClick();

    expect(mergedPreviewElement.innerHTML).toBe('');
    expect(downloadButton.style.display).toBe('none');
  });

  test('Download button should trigger a download of the merged PDF', () => {
    const mockPdfBytes = new Uint8Array([0, 1, 2, 3, 4, 5]);
    updateDomWithMergedPdf(mockPdfBytes);
  
    const downloadButton = document.getElementById('download-as-is');
    const aElement = document.createElement('a');
    jest.spyOn(aElement, 'click'); 
  
    document.body.appendChild(aElement);
    jest.spyOn(document, 'createElement').mockReturnValueOnce(aElement);
  
    downloadButton.click();
  
    const expectedUrl = 'http://localhost/mockURL';
    expect(aElement.href).toBe(expectedUrl);
    expect(aElement.download).toBe('merged.pdf');
    expect(aElement.click).toHaveBeenCalled(); 
  });
  
  
});
