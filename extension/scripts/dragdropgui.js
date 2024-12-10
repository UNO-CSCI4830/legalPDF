const dropZone = document.createElement('div');
dropZone.id = 'dropZone';
dropZone.textContent = 'Drop files here';
Object.assign(dropZone.style, {
    width: '300px',
    height: '200px',
    border: '2px dashed #ccc',
    textAlign: 'center',
    lineHeight: '200px',
    margin: '20px auto',
    color: '#ccc',
});
document.body.appendChild(dropZone);

const hoverStyle = document.createElement('style');
hoverStyle.textContent = `
    #dropZone.hover {
        border-color: #333;
        color: #333;
    }
`;
document.head.appendChild(hoverStyle);

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add('hover'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove('hover'), false);
});

dropZone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFiles(files) {
    [...files].forEach(uploadFile);
}

function uploadFile(file) {
    const url = 'YOUR_UPLOAD_URL';
    const formData = new FormData();
    formData.append('file', file);

    fetch(url, {
        method: 'POST',
        body: formData
    })
    .then(() => { console.log('File uploaded successfully'); })
    .catch(() => { console.error('File upload failed'); });
}
