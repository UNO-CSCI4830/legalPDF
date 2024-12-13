const { uploadFile } = require('./dragdropgui.js');

describe('uploadFile', () => {
    beforeEach(() => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ message: 'success' }),
            })
        );
        console.log = jest.fn();
        console.error = jest.fn();
    });

    test('calls fetch with correct arguments and logs success on resolve', async () => {
        const file = new File(['file content'], 'test.txt', { type: 'text/plain' });
        await uploadFile(file);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
            'YOUR_UPLOAD_URL',
            expect.objectContaining({
                method: 'POST',
                body: expect.any(FormData),
            })
        );
        expect(console.log).toHaveBeenCalledWith('File uploaded successfully');
    });

    test('logs error on fetch rejection', async () => {
        fetch.mockRejectedValueOnce(new Error('Network error'));
        const file = new File(['file content'], 'test.txt', { type: 'text/plain' });

        await uploadFile(file);

        expect(console.error).toHaveBeenCalledWith('File upload failed');
    });
});
