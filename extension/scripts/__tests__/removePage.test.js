document.body.innerHTML = `
  <input type="file" id="fileInput" />
  <div id="pdfList"></div>
  <div id="downloadBtn" style="display:none"></div>
  <div id="preview" style="display:none"></div>
  <canvas id="previewCanvas"></canvas>
  <span id="totalPages"></span>
  <span id="currentPage"></span>
  <button id="prevBtn"></button>
  <button id="nextBtn"></button>
`;

global.alert = jest.fn();
global.PDFLib = {
  PDFDocument: {
    load: jest.fn().mockResolvedValue({
      getPageCount: () => 3,
      save: jest.fn().mockResolvedValue(new Uint8Array())
    })
  }
};
global.pdfjsLib = {
  getDocument: jest.fn().mockReturnValue({
    promise: Promise.resolve({
      getPage: jest.fn().mockResolvedValue({
        getViewport: jest.fn().mockReturnValue({ width: 100, height: 100 }),
        render: jest.fn().mockReturnValue({ promise: Promise.resolve() })
      })
    })
  })
};

const { removePageCore, changePage } = require('../scripts/pdf-reorder.js');

describe('removePageCore', () => {
    it('should remove the page at the specified index', () => {
        const pageOrder = [0, 1, 2];
        removePageCore(pageOrder, 1);
        expect(pageOrder).toEqual([0, 2]);
    });

    it('should handle removing the first page', () => {
        const pageOrder = [0, 1, 2];
        removePageCore(pageOrder, 0);
        expect(pageOrder).toEqual([1, 2]); 
    });

    it('should handle removing the last page', () => {
        const pageOrder = [0, 1, 2];
        removePageCore(pageOrder, 2);
        expect(pageOrder).toEqual([0, 1]);
    });
    it('should handle not removing a page outside the range', () => {
      const pageOrder = [0, 1, 2,3,4,5];
      removePageCore(pageOrder, 9);
      expect(pageOrder).toEqual([0, 1, 2,3,4,5]);
  });
});
