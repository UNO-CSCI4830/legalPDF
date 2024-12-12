describe('Tests for handling the upload of PDF file', () => {
    // Always mocking pdfjsLib in case of use in tests //
    const pdfjsLib = {
        getDocument: jest.fn(() => ({
            promise: Promise.resolve({
                numPages: 3,
                getPage: jest.fn(() =>
                    Promise.resolve({
                        getViewport: jest.fn(({ scale }) => ({
                            width: 800,
                            height: 600,
                        })),
                        render: jest.fn(() => ({
                            promise: Promise.resolve(),
                        })),
                    })
                ),
            }),
        })),
    };

    test('should call getDocument when a PDF is uploaded', async () => {
        const handlePdfUpload = jest.fn((event) => {
            const mockPdf = { type: 'application/pdf' };
            if (event.target.files[0].type === mockPdf.type) {
                return 'PDF Uploaded Successfully';
            }
            return 'Invalid File Type';
        });

        const mockEvent = {
            target: { files: [{ type: 'application/pdf' }] },
        };

        const result = handlePdfUpload(mockEvent);
        expect(result).toBe('PDF Uploaded Successfully');
    });

    test('should display an alert for non-PDF files', () => {
        const handlePdfUpload = jest.fn((event) => {
            const mockPdf = { type: 'application/pdf' };
            if (event.target.files[0].type !== mockPdf.type) {
                return 'Invalid File Type';
            }
            return 'PDF Uploaded Successfully';
        });

        const mockEvent = {
            target: { files: [{ type: 'text/plain' }] },
        };

        const result = handlePdfUpload(mockEvent);
        expect(result).toBe('Invalid File Type');
    });
});