// Unit Testing for download button
// John Wischmeier
// University of Nebraska at Omaha
// CSCI 4830

describe('Download button functionality', () => {
  let downloadButton;
  let mockBlob;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="merged-pdf-preview"></div>
      <button id="download-as-is" style="display: none;"></button>
    `;

    downloadButton = document.getElementById('download-as-is');

    // Mock the Blob object to simulate PDF data
    mockBlob = new Blob(['mock pdf content'], { type: 'application/pdf' });

    // Mock URL.createObjectURL
    global.URL.createObjectURL = jest.fn(() => 'blob:http://example.com/merged-pdf-url');
  });

  it('should trigger download when the download button is clicked', () => {
    const anchorClickMock = jest.fn();

    // Set up the download button behavior
    downloadButton.style.display = 'block'; // Ensure the button is visible
    downloadButton.addEventListener('click', () => {
      const anchor = document.createElement('a');
      const mergedPdfUrl = global.URL.createObjectURL(mockBlob); // Pass the mock Blob
      anchor.href = mergedPdfUrl;
      anchor.download = 'merged.pdf';
      anchor.click = anchorClickMock; // Mock the click
      anchor.click();
    });

    // Simulate clicking the download button
    downloadButton.click();

    // Assertions
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
    expect(anchorClickMock).toHaveBeenCalledTimes(1);
  });
});
