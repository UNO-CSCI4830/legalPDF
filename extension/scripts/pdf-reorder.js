let originalPdfDoc;
let rearrangedPdfDoc;
let pageOrder = [];
let currentPageIndex = 0;

document.getElementById('fileInput').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        originalPdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        const numPages = originalPdfDoc.getPageCount();
        pageOrder = Array.from({ length: numPages }, (_, i) => i);

        displayPages();
        updatePageInfo();
        document.getElementById('downloadBtn').style.display = 'block';
        document.getElementById('preview').style.display = 'block';
    } else {
        alert("Please upload a valid PDF file.");
    }
});

function displayPages() {
    const pdfList = document.getElementById('pdfList');
    pdfList.innerHTML = '';
    
    pageOrder.forEach((pageIndex, i) => {
        const div = document.createElement('div');
        div.classList.add('pdf-page');
        div.innerHTML = `
            Page ${pageIndex + 1}
            <button onclick="movePage(${i}, -1)">↑</button>
            <button onclick="movePage(${i}, 1)">↓</button>
            <button onclick="removePage(${i})">Remove</button>
        `;
        pdfList.appendChild(div);
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

function changePage(direction) {
    const newIndex = currentPageIndex + direction;
    if (newIndex >= 0 && newIndex < pageOrder.length) {
        currentPageIndex = newIndex;
        updatePageInfo();
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

document.getElementById('downloadBtn').addEventListener('click', async () => {
    rearrangedPdfDoc = await PDFLib.PDFDocument.create();
    
    for (const pageIndex of pageOrder) {
        const [copiedPage] = await rearrangedPdfDoc.copyPages(originalPdfDoc, [pageIndex]);
        rearrangedPdfDoc.addPage(copiedPage);
    }

    const pdfBytes = await rearrangedPdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'rearranged.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});
