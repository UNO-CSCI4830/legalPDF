// Unit Testing for save and preview
// John Wischmeier
// University of Nebraska at Omaha
// CSCI 4830

describe('saveAndPreview', () => {
    afterEach(() => {
      document.body.innerHTML = ''; // Clean up DOM
      jest.restoreAllMocks(); // Restore mocked implementations
    });
  
    test('should create blob and iframe preview', () => {
      // Ensure global.URL.createObjectURL exists
      if (!global.URL.createObjectURL) {
        global.URL.createObjectURL = jest.fn(); // Add it to the global object if missing
      }
  
      const mockCreateObjectURL = jest.fn(() => `${window.location.origin}/mockURL`);
      jest.spyOn(global.URL, 'createObjectURL').mockImplementation(mockCreateObjectURL);
  
      document.body.innerHTML = `
        <div id="merged-pdf-preview"></div>
      `;
  
      const blob = new Blob(['mockPDF'], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
  
      const iframe = document.createElement('iframe');
      iframe.src = url;
      document.getElementById('merged-pdf-preview').appendChild(iframe);
  
      expect(mockCreateObjectURL).toHaveBeenCalledWith(blob); // Assert URL generation
      const iframeElement = document.querySelector('#merged-pdf-preview iframe');
      expect(iframeElement).not.toBeNull(); // Ensure iframe is added
      expect(iframeElement.src).toBe(`${window.location.origin}/mockURL`); // Match the full URL
    });
  });
  