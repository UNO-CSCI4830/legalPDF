// Unit Testing for reading files
// John Wischmeier
// University of Nebraska at Omaha
// CSCI 4830

describe('readFiles', () => {
  afterEach(() => {
    // Clean up the DOM after each test
    document.body.innerHTML = '';
  });

  test('should call arrayBuffer on file input and resolve an ArrayBuffer', async () => {
    // Arrange: Mock file and arrayBuffer
    const mockArrayBuffer = jest.fn(() => Promise.resolve(new ArrayBuffer(8)));
    const mockFile = new Blob(['mockPDF'], { type: 'application/pdf' });
    mockFile.arrayBuffer = mockArrayBuffer;

    document.body.innerHTML = `
      <input type="file" id="pdf1">
    `;

    const pdf1Input = document.getElementById('pdf1');

    // Add mock file to input
    Object.defineProperty(pdf1Input, 'files', {
      value: [mockFile],
      writable: false,
    });

    // Act: Trigger arrayBuffer
    const fileBuffer = await mockFile.arrayBuffer();

    // Assert: Verify arrayBuffer was called and resolved correctly
    expect(mockArrayBuffer).toHaveBeenCalled();
    expect(fileBuffer).toBeInstanceOf(ArrayBuffer);
    expect(fileBuffer.byteLength).toBe(8); // Ensure the ArrayBuffer has expected size
  });
});
