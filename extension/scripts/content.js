// Check if the current page is displaying a PDF
if (document.contentType === "application/pdf") {
    const pdfUrl = window.location.href; // Get the URL of the displayed PDF

    // Send the PDF URL to the background script
    chrome.runtime.sendMessage({ type: "PDF_FOUND", pdfUrl }, () => {
        console.log("PDF URL sent to background script:", pdfUrl);
    });
} else {
    console.log("No PDF detected on this page.");
}
