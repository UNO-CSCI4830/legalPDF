let PDFDocument;

if (typeof module !== 'undefined' && module.exports) {
    // for testing purposes otherwise jest fails
    PDFDocument = require('pdf-lib').PDFDocument;
} else {
    PDFDocument = PDFLib.PDFDocument;
}


let originalPdfDoc;
let pageOrder = [];
let currentPageIndex = 0;

async function initializePDFReorder() {
    const fileInput = document.getElementById('fileInput');
    if (!fileInput) {
        console.error('File input element not found.');
        return;
    }

    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file || file.type !== 'application/pdf') {
            alert('Please upload a valid PDF file.');
            return;
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            originalPdfDoc = await PDFDocument.load(arrayBuffer);
            const numPages = originalPdfDoc.getPageCount();
            pageOrder = Array.from({ length: numPages }, (_, i) => i);

            displayPages();
            updatePageInfo();
            document.getElementById('downloadBtn').style.display = 'block';
            document.getElementById('preview').style.display = 'block';
        } catch (error) {
            console.error('Error loading PDF:', error);
            alert('Failed to load the PDF. Please try another file.');
        }
    });

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => changePage(-1));
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => changePage(1));
    }

    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadReorderedPdf);
    }
}


function displayPages() {
    const pdfList = document.getElementById('pdfList');
    pdfList.innerHTML = '';

    pageOrder.forEach((pageIndex, i) => {
        const div = document.createElement('div');
        div.classList.add('pdf-page');
        div.innerHTML = `
            Page ${pageIndex + 1}
            <button class="move-up-btn">↑</button>
            <button class="move-down-btn">↓</button>
            <button class="remove-btn">Remove</button>
        `;
        pdfList.appendChild(div);
        div.querySelector('.move-up-btn').addEventListener('click', () => movePage(i, -1));
        div.querySelector('.move-down-btn').addEventListener('click', () => movePage(i, 1));
        div.querySelector('.remove-btn').addEventListener('click', () => removePage(i));
    });
}

function movePage(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= pageOrder.length) return;

    [pageOrder[index], pageOrder[newIndex]] = [pageOrder[newIndex], pageOrder[index]];
    displayPages();
    updatePageInfo();
}

function removePage(index) {
    pageOrder.splice(index, 1);
    displayPages();
    updatePageInfo();
}

function updatePageInfo() {
    const totalPages = pageOrder.length;
    const currentPageElement = document.getElementById('currentPage');
    const totalPagesElement = document.getElementById('totalPages');

    if (currentPageElement && totalPagesElement) {
        currentPageElement.textContent = totalPages > 0 ? currentPageIndex + 1 : 0;
        totalPagesElement.textContent = totalPages;
    }

    // Show or hide navigation buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (prevBtn && nextBtn) {
        prevBtn.style.display = currentPageIndex > 0 ? 'block' : 'none';
        nextBtn.style.display = currentPageIndex < totalPages - 1 ? 'block' : 'none';
    }

    if (totalPages > 0) {
        previewPage(currentPageIndex);
    } else {
        const canvas = document.getElementById('previewCanvas');
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
}


function changePage(direction) {
    const newIndex = currentPageIndex + direction;
    if (newIndex >= 0 && newIndex < pageOrder.length) {
        currentPageIndex = newIndex;
        updatePageInfo();
    }
}

async function previewPage(index) {
    const pageIndex = pageOrder[index];
    const canvas = document.getElementById('previewCanvas');
    const context = canvas.getContext('2d');

    const pdfBytes = await originalPdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const loadingTask = pdfjsLib.getDocument(url);
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(pageIndex + 1);

    const viewport = page.getViewport({ scale: 1 });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderContext = {
        canvasContext: context,
        viewport: viewport,
    };

    await page.render(renderContext).promise;
    URL.revokeObjectURL(url);
}

async function downloadReorderedPdf() {
    try {
        const reorderedPdf = await PDFDocument.create();
        for (const pageIndex of pageOrder) {
            const [copiedPage] = await reorderedPdf.copyPages(originalPdfDoc, [pageIndex]);
            reorderedPdf.addPage(copiedPage);
        }

        const pdfBytes = await reorderedPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'reordered.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading reordered PDF:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializePDFReorder();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializePDFReorder,
        movePage,
        removePage,
        updatePageInfo,
    };
}

