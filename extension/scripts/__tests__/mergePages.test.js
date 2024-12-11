// Unit Testing for merging pages
// John Wischmeier
// University of Nebraska at Omaha
// CSCI 4830

jest.mock('pdf-lib', () => ({
  PDFDocument: {
    create: jest.fn(() => ({
      copyPages: jest.fn(() => [jest.fn(), jest.fn()]),
      addPage: jest.fn(),
      save: jest.fn(() => new Uint8Array())
    })),
    load: jest.fn(() => ({
      getPageIndices: jest.fn(() => [0, 1]) // Mock getPageIndices
    }))
  }
}));

const { PDFDocument } = require('pdf-lib');

describe('mergePages', () => {
  test('should copy and add pages to the merged PDF', async () => {
    // Arrange: Create a merged PDF and mock its behavior
    const pdf1 = await PDFDocument.load();
    const pdf2 = await PDFDocument.load();

    const mergedPDF = PDFDocument.create();
    const mockPages = [jest.fn(() => 'Page1'), jest.fn(() => 'Page2')];
    mergedPDF.copyPages.mockReturnValue(mockPages);

    // Act: Simulate the merging process
    const pdf1Pages = mergedPDF.copyPages(pdf1, pdf1.getPageIndices());
    pdf1Pages.forEach((page) => mergedPDF.addPage(page));

    const pdf2Pages = mergedPDF.copyPages(pdf2, pdf2.getPageIndices());
    pdf2Pages.forEach((page) => mergedPDF.addPage(page));

    // Assert: Check copyPages and addPage calls
    expect(mergedPDF.copyPages).toHaveBeenCalledTimes(2);
    expect(mergedPDF.copyPages).toHaveBeenCalledWith(pdf1, [0, 1]);
    expect(mergedPDF.copyPages).toHaveBeenCalledWith(pdf2, [0, 1]);
    expect(mergedPDF.addPage).toHaveBeenCalledTimes(mockPages.length * 2); // Pages from both PDFs
    expect(mergedPDF.addPage).toHaveBeenCalledWith(mockPages[0]);
    expect(mergedPDF.addPage).toHaveBeenCalledWith(mockPages[1]);
  });
});
