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

const mockedDoc = {
  save: jest.fn().mockResolvedValue(new Uint8Array())
};

jest.mock('pdf-lib', () => ({
  PDFDocument: {
    load: jest.fn().mockResolvedValue({
      getPageCount: () => 3,
      save: jest.fn().mockResolvedValue(new Uint8Array())
    })
  }
}));

global.pdfjsLib = {
  getDocument: () => ({
    promise: Promise.resolve({
      getPage: () => Promise.resolve({
        getViewport: () => ({ width: 100, height: 100 }),
        render: () => ({ promise: Promise.resolve() })
      })
    })
  })
};

jest.isolateModules(() => {
  const { changePage, updatePageInfo } = require('../scripts/pdf-reorder.js');

  beforeEach(() => {
    const canvas = document.getElementById('previewCanvas');
    canvas.getContext = jest.fn(() => ({
      clearRect: jest.fn()
    }));
  });

  describe('changePage', () => {
    it('should return updated currentPageIndex when going back one page', () => {
        const result = changePage(2, [0,1,2,3,4,5], -1);
        expect(result.currentPageIndex).toBe(1);
        expect(result.pageOrder).toEqual([0,1,2,3,4,5]);
      });
    it('should return updated currentPageIndex when going forward one page', () => {
      const result = changePage(2, [0,1,2,3,4,5], 1);
      expect(result.currentPageIndex).toBe(3);
      expect(result.pageOrder).toEqual([0,1,2,3,4,5]);
    });
  });
});
