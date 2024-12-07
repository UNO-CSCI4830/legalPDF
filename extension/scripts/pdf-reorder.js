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

function displayPages(localPageOrder = pageOrder, localCurrentPageIndex = currentPageIndex) {
    const pdfList = document.getElementById('pdfList');
    pdfList.innerHTML = '';
    localPageOrder.forEach((pIndex, i) => {
        const div = document.createElement('div');
        div.classList.add('pdf-page');
        div.innerHTML = `
            Page ${pIndex + 1}
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

function movePage(index, direction, localPageOrder = null, localCurrentPageIndex = null) {
    const useGlobals = (localPageOrder === null || localCurrentPageIndex === null);
    const arr = useGlobals ? pageOrder : [...localPageOrder];
    const idx = useGlobals ? currentPageIndex : localCurrentPageIndex;
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= arr.length) return useGlobals ? undefined : { pageOrder: arr, currentPageIndex: idx };
    [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
    if (useGlobals) {
        pageOrder = arr;
        displayPages();
        updatePageInfo();
    } else {
        return { pageOrder: arr, currentPageIndex: idx };
    }
}

function removePageCore(arr, idx) {
    if (idx >= 0 && idx < arr.length) {
        arr.splice(idx, 1);
    }
    return arr;
}

function removePage(index, localPageOrder = null, localCurrentPageIndex = null) {
    const useGlobals = (localPageOrder === null || localCurrentPageIndex === null);
    const arr = useGlobals ? pageOrder : [...localPageOrder];
    removePageCore(arr, index);
    if (useGlobals) {
        pageOrder = arr;
        displayPages();
        updatePageInfo();
    } else {
        return { pageOrder: arr, currentPageIndex: localCurrentPageIndex };
    }
}

function updatePageInfo(localPageOrder = pageOrder, localCurrentPageIndex = currentPageIndex) {
    const totalPages = localPageOrder.length;
    document.getElementById('totalPages').textContent = totalPages;
    document.getElementById('currentPage').textContent = totalPages > 0 ? localCurrentPageIndex + 1 : 0;
    document.getElementById('prevBtn').style.display = localCurrentPageIndex > 0 ? 'inline' : 'none';
    document.getElementById('nextBtn').style.display = localCurrentPageIndex < totalPages - 1 ? 'inline' : 'none';
    if (totalPages > 0) {
        previewPage(localCurrentPageIndex, localPageOrder);
    } else {
        const canvas = document.getElementById('previewCanvas');
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function changePage(direction, localPageOrder = null, localCurrentPageIndex = null) {
    const useGlobals = (localPageOrder === null || localCurrentPageIndex === null);
    const arr = useGlobals ? pageOrder : [...localPageOrder];
    const idx = useGlobals ? currentPageIndex : localCurrentPageIndex;
    const newIndex = idx + direction;
    if (newIndex >= 0 && newIndex < arr.length) {
        if (useGlobals) {
            currentPageIndex = newIndex;
            updatePageInfo();
        } else {
            return { pageOrder: arr, currentPageIndex: newIndex };
        }
    } else {
        return { pageOrder: arr, currentPageIndex: idx };
    }
}

async function previewPage(index, localPageOrder = pageOrder) {
    const pIndex = localPageOrder[index];
    const pdfBytes = await originalPdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const loadingTask = pdfjsLib.getDocument(url);
    loadingTask.promise.then(pdf => {
        pdf.getPage(pIndex + 1).then(page => {
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
    for (const pIndex of pageOrder) {
        const [copiedPage] = await rearrangedPdfDoc.copyPages(originalPdfDoc, [pIndex]);
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

document.addEventListener('DOMContentLoaded', function () {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    if (prevBtn) {
        prevBtn.addEventListener('click', function () {
            changePage(-1);
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', function () {
            changePage(1);
        });
    }
    const resetButton = document.getElementById('reset-button');
    if (resetButton) {
        resetButton.addEventListener('click', function () {
            document.getElementById('merged-pdf-preview').innerHTML = '';
            document.getElementById('download-as-is').style.display = 'none';
        });
    }
});

function setOriginalPdfDoc(doc) {
    originalPdfDoc = doc;
    console.log('originalPdfDoc set to:', originalPdfDoc);
}

module.exports = {
    removePageCore,
    changePage,
    updatePageInfo,
    displayPages,
    movePage,
    removePage,
    previewPage,
    setOriginalPdfDoc
};
