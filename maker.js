const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

class validateError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

/**
 * Validates an input value to ensure it's a positive integer within a specified range.
 *
 * @param {number} inputValue - The input value to validate.
 * @param {number} maxValue - The maximum allowed value.
 * @throws {validateError} If the input value is invalid.
 * @returns {number} The validated input value.
 */
function validateInput(inputValue, maxValue) {
    // if (!inputValue) {
    //     throw new ValidationError('Value is required');
    // } else 
    if (typeof inputValue !== 'number') {
        throw new validateError('Value must be a number');
    } else if (!Number.isInteger(inputValue)) {
        throw new validateError('Value must be an integer');
    } else if (inputValue < 0 || inputValue > maxValue) {
        throw new validateError(`Value must be between 0 and ${maxValue}`);
    } else if (typeof maxValue !== 'number' || !Number.isInteger(maxValue) || maxValue <= 0) {
        throw new validateError('Max value must be a positive integer');
    }
    return inputValue;
}

/**
 * A class for creating and validating maker objects.
 */
class Maker {
    constructor() {
        this.parts = {
            bases: 0,
            eyes: 0,
            brows: 0,
            mouths: 0,
            extras: 0
        };
    }

    addBase(number) {
        this.parts.bases = validateInput(number, 61);
        return this;
    }

    addEyes(number) {
        this.parts.eyes = validateInput(number, 63);
        return this;
    }

    addBrows(number) {
        this.parts.brows = validateInput(number, 22);
        return this;
    }

    addMouths(number) {
        this.parts.mouths = validateInput(number, 70);
        return this;
    }

    addExtras(number) {
        this.parts.extras = validateInput(number, 45);
        return this;
    }

    async build() {
        const canvas = createCanvas(128, 128); // Adjust size if necessary
        const ctx = canvas.getContext('2d');

        const layers = ['bases', 'eyes', 'brows', 'mouths', 'extras'];
        const basePath = path.resolve(__dirname, 'emojis'); // Use path.resolve for absolute path

        for (const layer of layers) {
            const partNumber = this.parts[layer];

            if (partNumber !== 0) {
                const imagePath = path.join(basePath, layer, `${partNumber}.png`);
                // console.log(`Looking for image at: ${imagePath}`);

                if (fs.existsSync(imagePath)) {
                    const image = await loadImage(imagePath);
                    ctx.drawImage(image, 0, 0, 128, 128); // Adjust size as needed
                } else {
                    console.error(`Image not found: ${imagePath}`);
                }
            }
        }

        return {
            image: {
                buffer: canvas.toBuffer('image/png'),
                url: canvas.toDataURL('image/png')
            },
            parts: {
                bases: this.parts.bases,
                eyes: this.parts.eyes,
                brows: this.parts.brows,
                mouths: this.parts.mouths,
                extras: this.parts.extras
            }
        }
    }
}

module.exports = Maker;