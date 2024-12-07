const { handleFiles, uploadFile } = require('./dragdropgui.js');

global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({ message: 'success' }),
    })
);

jest.mock('./dragdropgui.js', () => {
    const originalModule = jest.requireActual('./dragdropgui.js');
    return {
        ...originalModule,
        uploadFile: jest.fn(),
    };
});

describe('handleFiles', () => {
    beforeEach(() => {
        uploadFile.mockClear();
    });

    test('calls uploadFile for each file', () => {
        const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
        const file2 = new File(['content2'], 'file2.txt', { type: 'text/plain' });

        handleFiles([file1, file2]);

        expect(uploadFile).toHaveBeenCalledTimes(2);
        expect(uploadFile).toHaveBeenCalledWith(file1);
        expect(uploadFile).toHaveBeenCalledWith(file2);
    });
});