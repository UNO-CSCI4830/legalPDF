jest.mock('canvas', () => ({
    createCanvas: () => ({
        getContext: jest.fn(() => ({
            clearRect: jest.fn(),
            fillRect: jest.fn(),
            drawImage: jest.fn(),
        })),
    }),
}));



jest.mock('pdf-lib', () => ({
    PDFDocument: {
        load: jest.fn(),
        create: jest.fn(),
    },
}));

const { initializePDFReorder, movePage, removePage, updatePageInfo } = require('../scripts/pdf-reorder');
const { PDFDocument } = require('pdf-lib');

beforeAll(() => {
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    document.body.innerHTML = `
        <input type="file" id="fileInput" />
        <button id="downloadBtn" style="display:none"></button>
        <div id="pdfList"></div>
        <div id="preview" style="display:none">
            <canvas id="previewCanvas" width="600" height="400"></canvas>
            <div id="pageInfo">
                Page <span id="currentPage">1</span> of <span id="totalPages">0</span>
            </div>
            <button id="prevBtn" style="display:none"></button>
            <button id="nextBtn" style="display:none"></button>
        </div>
    `;
    initializePDFReorder();
});

describe('PDF Reorder Tool Tests', () => {
    test('Should load a valid PDF file and enable navigation buttons', async () => {
        const mockPdf = {
            getPageCount: jest.fn().mockReturnValue(3),
            copyPages: jest.fn().mockResolvedValue([{}]),
            save: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
        };
        PDFDocument.load.mockResolvedValue(mockPdf);
    
        const input = document.getElementById('fileInput');
        const file = new File([new Uint8Array([1, 2, 3])], 'test.pdf', { type: 'application/pdf' });
    
        Object.defineProperty(file, 'arrayBuffer', {
            value: jest.fn().mockResolvedValue(new ArrayBuffer(8)), // Mock arrayBuffer method
        });
    
        Object.defineProperty(input, 'files', {
            configurable: true,
            writable: true,
            value: [file],
        });
    
        const changeEvent = new Event('change');
        input.dispatchEvent(changeEvent);
    
        await new Promise((r) => setTimeout(r, 10));
    
        expect(PDFDocument.load).toHaveBeenCalledWith(expect.any(ArrayBuffer));
        expect(mockPdf.getPageCount).toHaveBeenCalled();
        expect(document.getElementById('pdfList').childElementCount).toBe(3);
        expect(document.getElementById('prevBtn').style.display).toBe('none');
        expect(document.getElementById('nextBtn').style.display).toBe('block');
    });
    
    test('Should navigate between pages using buttons', async () => {
        pageOrder = [0, 1, 2];
        currentPageIndex = 1;

        updatePageInfo();

        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        nextBtn.click();
        expect(document.getElementById('currentPage').textContent).toBe('3');

        prevBtn.click();
        expect(document.getElementById('currentPage').textContent).toBe('2');
    });

    test('Should handle invalid file type', async () => {
        const input = document.getElementById('fileInput');
        const file = new File(['Invalid Content'], 'test.txt', { type: 'text/plain' });
        Object.defineProperty(input, 'files', {
            configurable: true,
            writable: true,
            value: [file],
        });

        const changeEvent = new Event('change');
        input.dispatchEvent(changeEvent);

        await new Promise((r) => setTimeout(r, 10));

        expect(window.alert).toHaveBeenCalledWith('Please upload a valid PDF file.');
    });

    test('Should remove a page using removePage', () => {
        pageOrder = [0, 1, 2];
        removePage(1);
        expect(pageOrder).toEqual([0, 2]);
    });

    test('Should move a page using movePage', () => {
        pageOrder = [0, 1, 2];
        movePage(1, -1);
        expect(pageOrder).toEqual([1, 0, 2]);
    });
});
