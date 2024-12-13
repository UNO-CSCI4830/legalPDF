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

const { updatePageInfo, setOriginalPdfDoc, previewPage } = require('../scripts/pdf-reorder.js');

global.pdfjsLib = {
  getDocument: jest.fn(() => ({
    promise: Promise.resolve({
      getPage: jest.fn(() => 
        Promise.resolve({
          getViewport: jest.fn(() => ({ width: 100, height: 100 })),
          render: jest.fn(() => ({ promise: Promise.resolve() })),
        })
      ),
    }),
  })),
};


global.URL.createObjectURL = jest.fn().mockReturnValue('mocked-url');
global.URL.revokeObjectURL = jest.fn();

jest.mock('../scripts/pdf-reorder.js', () => {
  const originalModule = jest.requireActual('../scripts/pdf-reorder.js');
  return {
    ...originalModule,
    previewPage: jest.fn(() => {
      console.log('previewPage was reached!');
    }) 
  };
});

describe('updatePageInfo', () => {
  const mockedDoc ={
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

  it('no pages should exist if empty values are passed', () =>{
    updatePageInfo([], 0);

    const canvas = document.getElementById('previewCanvas');
    const context = canvas.getContext('2d');

    expect(document.getElementById('totalPages').textContent).toBe('0');
    expect(document.getElementById('currentPage').textContent).toBe('0');

  });

  it('should update totalPages and currentPage correctly', () => {
    updatePageInfo([0,1,2], 1);
    expect(document.getElementById('totalPages').textContent).toBe('3');
    expect(document.getElementById('currentPage').textContent).toBe('2');
    expect(document.getElementById('prevBtn').style.display).toBe('inline');
    expect(document.getElementById('nextBtn').style.display).toBe('inline');
  });

  it('should update totalPages and currentPage correctly', ()=> {
    updatePageInfo([0, 1, 2,3,4,5], 2);
    expect(document.getElementById('totalPages').textContent).toBe('6');
    expect(document.getElementById('currentPage').textContent).toBe('3');
    expect(document.getElementById('prevBtn').style.display).toBe('inline');
    expect(document.getElementById('nextBtn').style.display).toBe('inline');
  });

});
