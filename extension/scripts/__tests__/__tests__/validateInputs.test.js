// Unit Testing for input validation
// John Wischmeier
// University of Nebraska at Omaha
// CSCI 4830

describe('validateInputs', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="pdf-form">
        <input type="file" id="pdf1">
        <input type="file" id="pdf2">
        <div id="merged-pdf-preview"></div>
        <button id="download-as-is" style="display: none;">Download</button>
        <button id="reset-button">Reset</button>
      </form>
    `;
    require('../pdf-merge.js'); // Load after DOM setup
  });
  

  test('should alert if PDFs are not selected', () => {
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});
    require('../pdf-merge.js'); // Load after DOM setup

    const form = document.getElementById('pdf-form');
    form.dispatchEvent(new Event('submit'));

    expect(mockAlert).toHaveBeenCalledWith('Please select both PDFs.');
    mockAlert.mockRestore();
  });
});
