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

const { movePage, updatePageInfo, setOriginalPdfDoc } = require('../scripts/pdf-reorder.js');

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

describe('movePage', () => {
  it('should return updated pageOrder and currentPageIndex when passing parameters', () => {
    const initialPageOrder = [0, 1, 2];
    const initialCurrentPageIndex = 2;
    const result = movePage(1, -1, initialPageOrder, initialCurrentPageIndex);
    expect(result.pageOrder).toEqual([1, 0, 2]);
    expect(result.currentPageIndex).toBe(2);
  });

  it('should update the DOM and call updatePageInfo when no arguments are given (use globals)', async () => {
    global.pageOrder = [0, 1, 2];
    global.currentPageIndex = 0;

    updatePageInfo(global.pageOrder, global.currentPageIndex);
    movePage(0, 1);
    await Promise.resolve();

    expect(document.getElementById('currentPage').textContent).toBe('1');
    expect(document.getElementById('prevBtn').style.display).toBe('none');
    expect(document.getElementById('nextBtn').style.display).toBe('inline');
    expect(mockedDoc.save).toHaveBeenCalled();
  });

  it('should not move page if new index is out of bounds (lower bound)', () => {
    global.pageOrder = [0, 1, 2];
    global.currentPageIndex = 1;

    updatePageInfo(global.pageOrder, global.currentPageIndex);
    movePage(0, -2);
    expect(global.pageOrder).toEqual([0, 1, 2]);
    expect(document.getElementById('currentPage').textContent).toBe('2');
    expect(document.getElementById('prevBtn').style.display).toBe('inline');
    expect(document.getElementById('nextBtn').style.display).toBe('inline');
  });

  it('should not move page if new index is out of bounds on the upper end', () => {
    global.pageOrder = [0, 1, 2];
    global.currentPageIndex = 1;

    updatePageInfo(global.pageOrder, global.currentPageIndex);
    movePage(2, 1);
    expect(global.pageOrder).toEqual([0, 1, 2]);
    expect(document.getElementById('currentPage').textContent).toBe('2');
    expect(document.getElementById('prevBtn').style.display).toBe('inline');
    expect(document.getElementById('nextBtn').style.display).toBe('inline');
  });
});
