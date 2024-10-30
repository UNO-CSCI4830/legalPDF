document.getElementById('pdf-upload').addEventListener('change', handlePdfUpload);
let canvas = document.getElementById('pdfCanvas');
let ctx = canvas.getContext('2d');
let pdfDoc = null;
let scale = 1.5; // Adjust the scale to control the zoom level of the PDF
let textBoxes = [];

// Handles PDF Upload
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
            renderPage(1); // Render first page of PDF
        }).catch(error => {
            console.error('Error loading PDF:', error);
        });
    };
    fileReader.readAsArrayBuffer(file);
}

// Renders a specific page of the PDF
function renderPage(pageNum) {
    pdfDoc.getPage(pageNum).then(function (page) {
        let viewport = page.getViewport({ scale: scale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        let renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };

        page.render(renderContext).then(function () {
            console.log('Page rendered successfully');
        }).catch(function (error) {
            console.error('Error rendering page:', error);
        });
    }).catch(error => {
        console.error('Error getting page:', error);
    });
}

// Function to apply selected font styles to the text box
function applyFontStyles(textBox) {
    const fontFamily = document.getElementById('font-family').value;
    const fontSize = document.getElementById('font-size').value;
    const fontColor = document.getElementById('font-color').value;

    // Apply the styles to the text box
    textBox.style.fontFamily = fontFamily;
    textBox.style.fontSize = `${fontSize}px`;
    textBox.style.color = fontColor;
}

// Handles adding a text box relative to click on the canvas
canvas.addEventListener('click', function (e) {
    const canvasRect = canvas.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;

    let textBox = document.createElement('textarea');
    textBox.classList.add('text-box');
    textBox.style.left = `${x}px`;
    textBox.style.top = `${y}px`;
    textBox.style.position = 'absolute';
    textBox.style.width = '100px';
    textBox.style.height = '30px';

    // Apply initial font styles
    applyFontStyles(textBox);

    // Now make the text box draggable and resizable
    makeTextBoxDraggable(textBox);

    // Append the text box to the PDF container
    document.getElementById('pdfContainer').appendChild(textBox);
    textBoxes.push(textBox);

    // Apply font styles dynamically as the user changes them
    document.getElementById('font-family').addEventListener('change', () => applyFontStyles(textBox));
    document.getElementById('font-size').addEventListener('input', () => applyFontStyles(textBox));
    document.getElementById('font-color').addEventListener('input', () => applyFontStyles(textBox));
});

// Function to make a text box draggable
function makeTextBoxDraggable(textBox) {
    let isDragging = false;
    let startX, startY;

    // Draggable logic
    textBox.addEventListener('mousedown', function (e) {
        // Check if the click is near the edges (resize area), if so, don't drag
        const rect = textBox.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        const isOnEdge = offsetX > rect.width - 10 || offsetY > rect.height - 10;
        if (isOnEdge) {
            return; // Don't drag when clicking near the resize area
        }

        // Start dragging
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

// Handles saving the PDF, applying font styles as well
document.getElementById('savePdf').addEventListener('click', function () {
    html2canvas(canvas).then(function (canvasCapture) {
        const { jsPDF } = window.jspdf; // Ensure jsPDF is correctly initialized
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: [canvas.width, canvas.height]
        });
        
        // Add the canvas (PDF + text) as an image to the PDF
        pdf.addImage(canvasCapture.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);

        // Add text from text boxes with font styles
        textBoxes.forEach(textBox => {
            const textValue = textBox.value;
            const textBoxRect = textBox.getBoundingClientRect();
            const canvasRect = canvas.getBoundingClientRect();
            const textBoxX = textBoxRect.left - canvasRect.left;
            const textBoxY = textBoxRect.top - canvasRect.top + 10; // Adjust vertical position

            // Get font styles from the text box
            const fontFamily = window.getComputedStyle(textBox).fontFamily;
            const fontSize = parseInt(window.getComputedStyle(textBox).fontSize, 10);
            const fontColor = window.getComputedStyle(textBox).color;

            // Set font family, size, and color in jsPDF
            pdf.setFont(fontFamily);
            pdf.setFontSize(fontSize);

            // Set the text color (converting the color to RGB)
            const rgb = fontColor.match(/\d+/g).map(Number); // Extract RGB from "rgb(r, g, b)" format
            pdf.setTextColor(rgb[0], rgb[1], rgb[2]);

            // Add the text to the PDF
            pdf.text(textValue, textBoxX, textBoxY);
        });

        // Save the edited PDF
        pdf.save('edited.pdf');
    }).catch(function (error) {
        console.error('Error capturing canvas:', error);
    });
});
