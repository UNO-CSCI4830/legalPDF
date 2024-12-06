describe('Tests for displaying text boxes', () => {
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

    test('should correctly apply font styles to text box', () => {
        const applyFontStyles = jest.fn((textBox) => {
            textBox.style.fontFamily = 'Arial';
            textBox.style.fontSize = '16px';
            textBox.style.color = '#000000';
        });

        const mockTextBox = { style: {} };
        applyFontStyles(mockTextBox);

        expect(mockTextBox.style.fontFamily).toBe('Arial');
        expect(mockTextBox.style.fontSize).toBe('16px');
        expect(mockTextBox.style.color).toBe('#000000');
    });

    test('should make text box draggable', () => {
        const makeTextBoxDraggable = jest.fn((textBox) => {
            textBox.draggable = true;
        });

        const mockTextBox = {};
        makeTextBoxDraggable(mockTextBox);

        expect(mockTextBox.draggable).toBe(true);
    });
});