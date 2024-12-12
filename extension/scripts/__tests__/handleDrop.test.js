const { handleDrop } = require('./dragdropgui.js');

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ message: 'success' })
  })
);

describe('handleDrop', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    test('calls fetch when a file is dropped', async () => {
        const mockFile = new File(['file content'], 'test.txt', { type: 'text/plain' });

        const mockDataTransfer = {
            files: [mockFile],
        };

        const mockEvent = {
            dataTransfer: mockDataTransfer,
            preventDefault: jest.fn(),
            stopPropagation: jest.fn(),
        };

        await handleDrop(mockEvent);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
          'YOUR_UPLOAD_URL',
          expect.objectContaining({
            method: 'POST',
            body: expect.any(FormData),
          })
        );
    });
});
