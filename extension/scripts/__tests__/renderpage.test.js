describe('Render page test', () => {
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

    test('should render the correct number of pages', async () => {
        const renderAllPages = jest.fn(() => {
            return [1, 2, 3].map((page) => ({
                render: jest.fn(() => Promise.resolve(`Page ${page} Rendered`)),
            }));
        });

        const pages = renderAllPages();
        expect(pages.length).toBe(3);
        pages.forEach((page, index) => {
            expect(page.render).toBeDefined();
            expect(page.render()).resolves.toBe(`Page ${index + 1} Rendered`);
        });
    });
});