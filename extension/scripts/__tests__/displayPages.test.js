/** @jest-environment jsdom */

document.body.innerHTML = `
  <input type="file" id="fileInput" />
  <div id="pdfList"></div>
  <button id="downloadBtn"></button>
  <div id="preview"></div>
  <canvas id="previewCanvas"></canvas>
  <div id="totalPages"></div>
  <div id="currentPage"></div>
  <button id="prevBtn"></button>
  <button id="nextBtn"></button>
  <div id="merged-pdf-preview"></div>
  <button id="reset-button"></button>
  <div id="download-as-is" style="display:none"></div>
`;

global.URL.createObjectURL = jest.fn(() => 'mocked-url');
global.URL.revokeObjectURL = jest.fn();

jest.mock('pdf-lib', () => ({
  PDFDocument: {
    load: jest.fn().mockResolvedValue({
      getPageCount: () => 3,
      save: jest.fn().mockResolvedValue(new Uint8Array())
    }),
    create: jest.fn().mockResolvedValue({
      copyPages: jest.fn().mockResolvedValue([[{}]]),
      addPage: jest.fn(),
      save: jest.fn().mockResolvedValue(new Uint8Array())
    })
  }
}));

global.pdfjsLib = {
  getDocument: jest.fn(() => ({
    promise: Promise.resolve({
      getPage: jest.fn(() => Promise.resolve({
        getViewport: () => ({ width: 100, height: 100 }),
        render: jest.fn(() => ({ promise: Promise.resolve() }))
      }))
    })
  }))
};

const { updatePageInfo, setOriginalPdfDoc, previewPage } = require('../scripts/pdf-reorder.js');

describe('updatePageInfo', () => {
  const mockedDoc = {
    save: jest.fn().mockResolvedValue(new Uint8Array())
  };

  beforeEach(() => {
    setOriginalPdfDoc(mockedDoc);
    const canvas = document.getElementById('previewCanvas');
    canvas.getContext = jest.fn(() => ({
      clearRect: jest.fn()
    }));

    global.pageOrder = [];
    global.currentPageIndex = 0;

    jest.clearAllMocks();
  });

  it('should update totalPages and currentPage correctly', () => {
    updatePageInfo([0, 1, 2], 1);
    expect(document.getElementById('totalPages').textContent).toBe('3');
    expect(document.getElementById('currentPage').textContent).toBe('2');
    expect(document.getElementById('prevBtn').style.display).toBe('inline');
    expect(document.getElementById('nextBtn').style.display).toBe('inline');
  });

  it('should clear the canvas when there are no pages', () => {
    updatePageInfo([], 0);
    expect(document.getElementById('totalPages').textContent).toBe('0');
    expect(document.getElementById('currentPage').textContent).toBe('0');
  });

});
