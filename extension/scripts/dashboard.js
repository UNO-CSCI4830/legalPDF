document.getElementById('openPdfAddText').addEventListener('click', () => {
    chrome.storage.local.get('pdfUrl', (data) => {
        if (data.pdfUrl) {
            const pdfAddTextUrl = chrome.runtime.getURL(`../html/pdfaddtext.html?pdfUrl=${encodeURIComponent(data.pdfUrl)}`);
            chrome.tabs.create({ url: pdfAddTextUrl });
        } else {
            alert("No PDF detected on the current webpage.");
        }
    });
});
