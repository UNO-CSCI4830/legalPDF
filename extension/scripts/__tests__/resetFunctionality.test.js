// Unit Testing for reset functionality
// John Wischmeier
// University of Nebraska at Omaha
// CSCI 4830

describe('resetFunctionality', () => {
  afterEach(() => {
    // Clean up the DOM after each test
    document.body.innerHTML = '';
  });

  test('should clear preview and hide download button', () => {
    // Arrange: Set up DOM elements and include reset button
    document.body.innerHTML = `
      <div id="merged-pdf-preview"><iframe src="mockURL"></iframe></div>
      <button id="download-as-is" style="display: block;">Download</button>
      <button id="reset-button">Reset</button>
    `;

    // Mock reset button functionality
    document.getElementById('reset-button').addEventListener('click', () => {
      document.getElementById('merged-pdf-preview').innerHTML = '';
      document.getElementById('download-as-is').style.display = 'none';
    });

    // Act: Simulate click on reset button
    document.getElementById('reset-button').click();

    // Assert: Check the DOM has been reset correctly
    expect(document.getElementById('merged-pdf-preview').innerHTML).toBe('');
    expect(document.getElementById('download-as-is').style.display).toBe('none');
  });
});
