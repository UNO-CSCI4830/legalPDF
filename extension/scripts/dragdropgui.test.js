document.body.innerHTML = `
  <div id="dropZone">Drop files here</div>
`;

const { preventDefaults } = require('./dragdropgui.js');

describe('preventDefaults', () => {
  test('should call preventDefault and stopPropagation on the event', () => {
    const mockEvent = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
    };

    preventDefaults(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });
});
