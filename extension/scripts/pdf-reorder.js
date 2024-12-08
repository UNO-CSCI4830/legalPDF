let originalPdfDoc;
let rearrangedPdfDoc = null;
let pageOrder = [];
let currentPageIndex = 0;

document.getElementById('fileInput').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        originalPdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        const numPages = originalPdfDoc.getPageCount();
        pageOrder = Array.from({ length: numPages }, (_, i) => i);
        currentPageIndex = 0;

        rearrangedPdfDoc = await createReorderedPdf();
        displayPages();
        updatePageInfo();
        document.getElementById('preview').style.display = 'block';
        document.getElementById('downloadBtn').style.display = 'inline';
        document.getElementById('addTextBtn').style.display = 'inline';
    } else {
        alert("Please upload a valid PDF file.");
    }
});

async function createReorderedPdf() {
    const newPdfDoc = await PDFLib.PDFDocument.create();
    for (const pageIndex of pageOrder) {
        const [copiedPage] = await newPdfDoc.copyPages(originalPdfDoc, [pageIndex]);
        newPdfDoc.addPage(copiedPage);
    }
    return newPdfDoc;
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
    rearrangedPdfDoc = null;
    displayPages();
    updatePageInfo();
}

function removePage(index) {
    pageOrder.splice(index, 1);
    rearrangedPdfDoc = null;
    displayPages();
    updatePageInfo();
}

function updatePageInfo() {
    const totalPages = pageOrder.length;
    document.getElementById('totalPages').textContent = totalPages;
    document.getElementById('currentPage').textContent = currentPageIndex + 1;

    document.getElementById('prevBtn').style.display = currentPageIndex > 0 ? 'inline' : 'none';
    document.getElementById('nextBtn').style.display = currentPageIndex < totalPages - 1 ? 'inline' : 'none';

    if (totalPages > 0) {
        previewPage(currentPageIndex);
    } else {
        const canvas = document.getElementById('previewCanvas');
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
}

async function previewPage(index) {
    const pageIndex = pageOrder[index];
    const pdfBytes = await originalPdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const loadingTask = pdfjsLib.getDocument(url);
    loadingTask.promise.then(pdf => {
        pdf.getPage(pageIndex + 1).then(page => {
            const canvas = document.getElementById('previewCanvas');
            const context = canvas.getContext('2d');
            const viewport = page.getViewport({ scale: 1 });
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            const renderContext = {
                canvasContext: context,
                viewport: viewport,
            };
            page.render(renderContext);
            URL.revokeObjectURL(url);
        });
    }).catch(error => {
        console.error("Error loading PDF page: ", error);
    });
}

document.getElementById('prevBtn').addEventListener('click', () => {
    if (currentPageIndex > 0) {
        currentPageIndex--;
        updatePageInfo();
    }
});

document.getElementById('nextBtn').addEventListener('click', () => {
    if (currentPageIndex < pageOrder.length - 1) {
        currentPageIndex++;
        updatePageInfo();
    }
});

document.getElementById('downloadBtn').addEventListener('click', async () => {
    if (!rearrangedPdfDoc) rearrangedPdfDoc = await createReorderedPdf();

    const pdfBytes = await rearrangedPdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'reordered.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

document.getElementById('addTextBtn').addEventListener('click', async () => {
    if (!rearrangedPdfDoc) rearrangedPdfDoc = await createReorderedPdf();

    const pdfBytes = await rearrangedPdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
        const pdfAddTextUrl = chrome.runtime.getURL(`../html/pdfaddtext.html?pdfUrl=${encodeURIComponent(url)}`);
        chrome.tabs.create({ url: pdfAddTextUrl });
    } else {
        const pdfAddTextUrl = `../html/pdfaddtext.html?pdfUrl=${encodeURIComponent(url)}`;
        window.open(pdfAddTextUrl, '_blank');
    }
});
