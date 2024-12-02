const { JSDOM } = require('jsdom');
const { createCanvas } = require('canvas');

Object.defineProperty(JSDOM.prototype, 'createElement', {
    value: (type) => {
        if (type === 'canvas') {
            const canvas = createCanvas(800, 600); // Default canvas size
            canvas.getContext = createCanvas().getContext; // Mock the context
            return canvas;
        }
        return document.createElement(type);
    },
});
