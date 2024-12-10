if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('libs/pdf.worker.min.js');
} else {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'libs/pdf.worker.min.js';
}

document.getElementById('pdf-upload').addEventListener('change', function (event) {
    handlePdfUpload(event);
});

let pdfDoc = null;
let scale = 1.0;
let textBoxes = [];

function handlePdfUpload(event) {
    const file = event.target.files[0];
    if (file.type !== 'application/pdf') {
        alert('Please upload a valid PDF file.');
        return;
    }
    const fileReader = new FileReader();
    fileReader.onload = function () {
        const typedarray = new Uint8Array(this.result);
        pdfjsLib.getDocument(typedarray).promise.then(function (pdf) {
            pdfDoc = pdf;
            renderAllPages();
        }).catch(error => {
            console.error('Error loading PDF:', error);
        });
    };
    fileReader.readAsArrayBuffer(file);
}

function renderAllPages() {
    if (!pdfDoc) {
        return;
    }
    const pdfContainer = document.getElementById('pdfContainer');
    pdfContainer.innerHTML = '';
    const containerWidth = pdfContainer.clientWidth;
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        pdfDoc.getPage(pageNum).then(function (page) {
            const viewport = page.getViewport({ scale: 1.0 });
            const scale = containerWidth / viewport.width;
            const scaledViewport = page.getViewport({ scale: scale });
            const canvas = document.createElement('canvas');
            canvas.classList.add('page-canvas');
            canvas.width = scaledViewport.width;
            canvas.height = scaledViewport.height;
            const ctx = canvas.getContext('2d');
            const renderContext = {
                canvasContext: ctx,
                viewport: scaledViewport
            };
            pdfContainer.appendChild(canvas);
            page.render(renderContext).promise.catch(error => {
                console.error(`Error rendering page ${pageNum}:`, error);
            });
        }).catch(error => {
            console.error(`Error getting page ${pageNum}:`, error);
        });
    }
}

function applyFontStyles(textBox) {
    const fontFamily = document.getElementById('font-family').value;
    const fontSize = document.getElementById('font-size').value;
    const fontColor = document.getElementById('font-color').value;
    textBox.style.fontFamily = fontFamily;
    textBox.style.fontSize = `${fontSize}px`;
    textBox.style.color = fontColor;
}

document.getElementById('pdfContainer').addEventListener('click', function (e) {
    if (e.target.tagName === 'CANVAS') {
        const canvasRect = e.target.getBoundingClientRect();
        const x = (e.clientX - canvasRect.left) / scale;
        const y = (e.clientY - canvasRect.top) / scale;
        let textBox = document.createElement('textarea');
        textBox.classList.add('text-box');
        textBox.style.left = `${x}px`;
        textBox.style.top = `${y}px`;
        textBox.style.position = 'absolute';
        textBox.style.width = '100px';
        textBox.style.height = '30px';
        textBox.style.resize = 'both';
        applyFontStyles(textBox);
        makeTextBoxDraggable(textBox);
        document.getElementById('pdfContainer').appendChild(textBox);
        textBoxes.push(textBox);
    }
});

function makeTextBoxDraggable(textBox) {
    textBox.style.resize = 'both';
    let isDragging = false;
    let startX, startY;
    textBox.addEventListener('mousedown', function (e) {
        const rect = textBox.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        const isOnEdge = offsetX > rect.width - 10 || offsetY > rect.height - 10;
        if (isOnEdge) return;
        isDragging = true;
        startX = e.clientX - textBox.offsetLeft;
        startY = e.clientY - textBox.offsetTop;
        textBox.style.zIndex = 1000;
    });
    document.addEventListener('mousemove', function (e) {
        if (isDragging) {
            textBox.style.left = `${e.clientX - startX}px`;
            textBox.style.top = `${e.clientY - startY}px`;
        }
    });
    document.addEventListener('mouseup', function () {
        isDragging = false;
    });
}

document.getElementById('savePdf').addEventListener('click', function () {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
    });
    const pdfContainer = document.getElementById('pdfContainer');
    const pageCanvases = document.querySelectorAll('.page-canvas');
    if (pageCanvases.length === 0) {
        console.error('No canvases found for saving');
        return;
    }
    pageCanvases.forEach((canvas, pageIndex) => {
        html2canvas(canvas, { scale: 1 }).then(function (canvasCapture) {
            const imgWidth = pdf.internal.pageSize.getWidth();
            const imgHeight = (canvasCapture.height * imgWidth) / canvasCapture.width;
            if (pageIndex > 0) {
                pdf.addPage();
            }
            pdf.addImage(
                canvasCapture.toDataURL('image/png'),
                'PNG',
                0,
                0,
                imgWidth,
                imgHeight
            );
            textBoxes.forEach(textBox => {
                const textBoxRect = textBox.getBoundingClientRect();
                const canvasRect = canvas.getBoundingClientRect();
                if (textBoxRect.top >= canvasRect.top && textBoxRect.bottom <= canvasRect.bottom) {
                    const x = ((textBoxRect.left - canvasRect.left) / canvas.width) * imgWidth;
                    const y = ((textBoxRect.top - canvasRect.top) / canvas.height) * imgHeight;
            
                    const fontFamily = window.getComputedStyle(textBox).fontFamily;
                    const fontSize = parseInt(window.getComputedStyle(textBox).fontSize, 10); // Ensure this is declared before use
                    const fontColor = window.getComputedStyle(textBox).color;
            
                    const adjustedY = y + fontSize * 0.9;
            
                    pdf.setFont(fontFamily);
                    pdf.setFontSize(fontSize);
                    const rgb = fontColor.match(/\d+/g).map(Number);
                    pdf.setTextColor(rgb[0], rgb[1], rgb[2]);
                    pdf.text(textBox.value, x, adjustedY);
                }
            });
            
            
            if (pageIndex === pageCanvases.length - 1) {
                pdf.save('edited.pdf');
            }
        }).catch(function (error) {
            console.error('Error capturing canvas:', error);
        });
    });
});

const urlParams = new URLSearchParams(window.location.search);
const pdfUrl = urlParams.get('pdfUrl');

if (pdfUrl) {
    fetch(pdfUrl)
        .then(response => response.arrayBuffer())
        .then(pdfBytes => {
            pdfjsLib.getDocument(new Uint8Array(pdfBytes)).promise.then(function (pdf) {
                pdfDoc = pdf;
                renderAllPages();
            }).catch(error => {
                console.error('Error loading PDF:', error);
            });
        })
        .catch(error => {
            console.error('Failed to load PDF from URL:', error);
        });
}
