const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

/**
 * Custom error class for validation errors with helpful suggestions
 */
class ValidationError extends Error {
    constructor(message, suggestion = null, examples = null) {
        super(message);
        this.name = 'ValidationError';
        this.suggestion = suggestion;
        this.examples = examples;
    }

    /**
     * Returns a formatted error message with suggestions and examples
     */
    getDetailedMessage() {
        let msg = this.message;
        if (this.suggestion) {
            msg += `\n💡 Suggestion: ${this.suggestion}`;
        }
        if (this.examples && this.examples.length > 0) {
            msg += `\n📝 Examples: ${this.examples.join(', ')}`;
        }
        return msg;
    }
}

/**
 * Comprehensive input validator with detailed error messages and suggestions
 */
class InputValidator {
    /**
     * Component limits for validation
     */
    static LIMITS = {
        bases: { min: 1, max: 61, name: 'Base' },
        eyes: { min: 1, max: 63, name: 'Eyes' },
        brows: { min: 1, max: 22, name: 'Brows' },
        mouths: { min: 1, max: 70, name: 'Mouth' },
        extras: { min: 1, max: 45, name: 'Extras' }
    };

    /**
     * Validates input with comprehensive error handling
     */
    static validateInput(inputValue, category, allowZero = false) {
        const limits = this.LIMITS[category];
        if (!limits) {
            throw new ValidationError(
                `Invalid category "${category}"`,
                'Use one of the valid categories',
                ['bases', 'eyes', 'brows', 'mouths', 'extras']
            );
        }

        // Handle null/undefined
        if (inputValue === null || inputValue === undefined) {
            throw new ValidationError(
                `${limits.name} ID cannot be null or undefined`,
                'Provide a valid number',
                [`${category}: ${limits.min}`, `${category}: ${limits.max}`]
            );
        }

        // Handle arrays (common mistake)
        if (Array.isArray(inputValue)) {
            throw new ValidationError(
                `${limits.name} ID cannot be an array`,
                'Provide a single number, not an array',
                [`${category}: ${limits.min}`, 'NOT: [1, 2, 3]']
            );
        }

        // Handle objects (common mistake)
        if (typeof inputValue === 'object') {
            throw new ValidationError(
                `${limits.name} ID cannot be an object`,
                'Provide a single number, not an object',
                [`${category}: ${limits.min}`, 'NOT: {id: 1}']
            );
        }

        // Handle string numbers (try to convert)
        let numValue = inputValue;
        if (typeof inputValue === 'string') {
            const trimmed = inputValue.trim();
            if (trimmed === '') {
                throw new ValidationError(
                    `${limits.name} ID cannot be an empty string`,
                    'Provide a valid number',
                    [`${category}: ${limits.min}`, `${category}: ${limits.max}`]
                );
            }
            
            numValue = Number(trimmed);
            if (isNaN(numValue)) {
                throw new ValidationError(
                    `${limits.name} ID "${inputValue}" is not a valid number`,
                    'Provide a numeric value',
                    [`${category}: ${limits.min}`, `${category}: ${limits.max}`, 'NOT: "abc" or "1a"']
                );
            }
        }

        // Handle boolean (common mistake)
        if (typeof inputValue === 'boolean') {
            throw new ValidationError(
                `${limits.name} ID cannot be a boolean (true/false)`,
                'Provide a number instead',
                [`${category}: ${limits.min}`, 'NOT: true or false']
            );
        }

        // Must be a number at this point
        if (typeof numValue !== 'number') {
            throw new ValidationError(
                `${limits.name} ID must be a number, got ${typeof inputValue}`,
                'Provide a numeric value',
                [`${category}: ${limits.min}`, `${category}: ${limits.max}`]
            );
        }

        // Check for NaN
        if (isNaN(numValue)) {
            throw new ValidationError(
                `${limits.name} ID cannot be NaN (Not a Number)`,
                'Provide a valid number',
                [`${category}: ${limits.min}`, `${category}: ${limits.max}`]
            );
        }

        // Check for infinity
        if (!isFinite(numValue)) {
            throw new ValidationError(
                `${limits.name} ID cannot be infinite`,
                'Provide a finite number',
                [`${category}: ${limits.min}`, `${category}: ${limits.max}`]
            );
        }

        // Check if it's an integer
        if (!Number.isInteger(numValue)) {
            throw new ValidationError(
                `${limits.name} ID must be a whole number, got ${numValue}`,
                'Use integers only (no decimals)',
                [`${category}: ${limits.min}`, `${category}: ${limits.max}`, 'NOT: 1.5 or 2.7']
            );
        }

        // Check range
        const min = allowZero ? 0 : limits.min;
        if (numValue < min || numValue > limits.max) {
            const validRange = allowZero ? `0 to ${limits.max}` : `${limits.min} to ${limits.max}`;
            throw new ValidationError(
                `${limits.name} ID ${numValue} is out of range`,
                `Choose a number between ${validRange}`,
                [`${category}: ${limits.min}`, `${category}: ${Math.floor((limits.min + limits.max) / 2)}`, `${category}: ${limits.max}`]
            );
        }

        return numValue;
    }

    /**
     * Validates constructor options
     */
    static validateOptions(options) {
        if (options === null || options === undefined) {
            return {}; // Default options
        }

        if (typeof options !== 'object' || Array.isArray(options)) {
            throw new ValidationError(
                'Options must be an object',
                'Provide an object with width, height, and/or format properties',
                ['{ width: 256 }', '{ height: 512, format: "jpeg" }', '{}']
            );
        }

        const validatedOptions = {};

        // Validate width
        if (options.width !== undefined) {
            if (typeof options.width !== 'number' || !Number.isInteger(options.width) || options.width <= 0) {
                throw new ValidationError(
                    'Width must be a positive integer',
                    'Provide a positive whole number for canvas width',
                    ['width: 128', 'width: 256', 'width: 512']
                );
            }
            if (options.width > 4096) {
                throw new ValidationError(
                    'Width cannot exceed 4096 pixels',
                    'Use a smaller width to avoid memory issues',
                    ['width: 128', 'width: 512', 'width: 1024']
                );
            }
            validatedOptions.width = options.width;
        }

        // Validate height
        if (options.height !== undefined) {
            if (typeof options.height !== 'number' || !Number.isInteger(options.height) || options.height <= 0) {
                throw new ValidationError(
                    'Height must be a positive integer',
                    'Provide a positive whole number for canvas height',
                    ['height: 128', 'height: 256', 'height: 512']
                );
            }
            if (options.height > 4096) {
                throw new ValidationError(
                    'Height cannot exceed 4096 pixels',
                    'Use a smaller height to avoid memory issues',
                    ['height: 128', 'height: 512', 'height: 1024']
                );
            }
            validatedOptions.height = options.height;
        }

        // Validate format
        if (options.format !== undefined) {
            if (typeof options.format !== 'string') {
                throw new ValidationError(
                    'Format must be a string',
                    'Provide a valid image format',
                    ['format: "png"', 'format: "jpeg"']
                );
            }
            const format = options.format.toLowerCase().trim();
            if (!['png', 'jpeg', 'jpg'].includes(format)) {
                throw new ValidationError(
                    `Invalid format "${options.format}"`,
                    'Use "png" or "jpeg" for the format',
                    ['format: "png"', 'format: "jpeg"']
                );
            }
            validatedOptions.format = format === 'jpg' ? 'jpeg' : format;
        }

        return validatedOptions;
    }
}

/**
 * A class for creating customizable emojis by combining different facial features and accessories.
 * Features include bases, eyes, brows, mouths, and extras.
 * 
 * This class is designed to be foolproof with comprehensive error handling and helpful suggestions.
 */
class Maker {
    /**
     * Creates a new Maker instance.
     * @param {Object} options - Configuration options for the emoji maker.
     * @param {number} options.width - Canvas width in pixels (default: 128, max: 4096).
     * @param {number} options.height - Canvas height in pixels (default: 128, max: 4096).
     * @param {string} options.format - Output format: 'png' or 'jpeg' (default: 'png').
     */
    constructor(options = {}) {
        try {
            const validatedOptions = InputValidator.validateOptions(options);
            
            this.parts = {
                bases: 0,
                eyes: 0,
                brows: 0,
                mouths: 0,
                extras: 0
            };
            
            this.config = {
                width: validatedOptions.width || 128,
                height: validatedOptions.height || 128,
                format: validatedOptions.format || 'png'
            };

            // Validate emoji directory exists
            this._validateEmojiDirectory();
            
        } catch (error) {
            if (error instanceof ValidationError) {
                console.error('❌ Maker Constructor Error:', error.getDetailedMessage());
            }
            throw error;
        }
    }

    /**
     * Validates that the emoji directory structure exists
     * @private
     */
    _validateEmojiDirectory() {
        const emojiPath = path.resolve(__dirname, 'emojis');
        if (!fs.existsSync(emojiPath)) {
            throw new ValidationError(
                'Emoji directory not found',
                'Ensure the "emojis" folder exists in the package directory',
                ['Check if emojis/ folder is present', 'Reinstall the package if missing']
            );
        }

        const categories = ['bases', 'eyes', 'brows', 'mouths', 'extras'];
        for (const category of categories) {
            const categoryPath = path.join(emojiPath, category);
            if (!fs.existsSync(categoryPath)) {
                throw new ValidationError(
                    `Missing emoji category folder: ${category}`,
                    'Ensure all emoji category folders exist',
                    [`Check if emojis/${category}/ folder exists`, 'Reinstall the package if folders are missing']
                );
            }
        }
    }

    /**
     * Sets the base emoji face (REQUIRED for building).
     * @param {number} number - The base ID (1-61).
     * @returns {Maker} Returns this instance for method chaining.
     * @example
     * // Set base to ID 1
     * maker.addBase(1)
     * 
     * // Common mistakes to avoid:
     * // maker.addBase("1")     // ❌ String instead of number
     * // maker.addBase([1])     // ❌ Array instead of number  
     * // maker.addBase(0)       // ❌ Zero is not valid (use 1-61)
     * // maker.addBase(100)     // ❌ Out of range (max is 61)
     */
    addBase(number) {
        try {
            this.parts.bases = InputValidator.validateInput(number, 'bases');
            return this;
        } catch (error) {
            if (error instanceof ValidationError) {
                console.error('❌ addBase Error:', error.getDetailedMessage());
            }
            throw error;
        }
    }

    /**
     * Sets the eyes for the emoji.
     * @param {number} number - The eyes ID (1-63).
     * @returns {Maker} Returns this instance for method chaining.
     */
    addEyes(number) {
        try {
            this.parts.eyes = InputValidator.validateInput(number, 'eyes');
            return this;
        } catch (error) {
            if (error instanceof ValidationError) {
                console.error('❌ addEyes Error:', error.getDetailedMessage());
            }
            throw error;
        }
    }

    /**
     * Sets the eyebrows for the emoji.
     * @param {number} number - The brows ID (1-22).
     * @returns {Maker} Returns this instance for method chaining.
     */
    addBrows(number) {
        try {
            this.parts.brows = InputValidator.validateInput(number, 'brows');
            return this;
        } catch (error) {
            if (error instanceof ValidationError) {
                console.error('❌ addBrows Error:', error.getDetailedMessage());
            }
            throw error;
        }
    }

    /**
     * Sets the mouth for the emoji.
     * @param {number} number - The mouth ID (1-70).
     * @returns {Maker} Returns this instance for method chaining.
     */
    addMouths(number) {
        try {
            this.parts.mouths = InputValidator.validateInput(number, 'mouths');
            return this;
        } catch (error) {
            if (error instanceof ValidationError) {
                console.error('❌ addMouths Error:', error.getDetailedMessage());
            }
            throw error;
        }
    }

    /**
     * Sets extra accessories for the emoji.
     * @param {number} number - The extras ID (1-45).
     * @returns {Maker} Returns this instance for method chaining.
     */
    addExtras(number) {
        try {
            this.parts.extras = InputValidator.validateInput(number, 'extras');
            return this;
        } catch (error) {
            if (error instanceof ValidationError) {
                console.error('❌ addExtras Error:', error.getDetailedMessage());
            }
            throw error;
        }
    }

    /**
     * Generates a random emoji with random parts.
     * @param {Object} options - Options for random generation.
     * @param {boolean} options.includeExtras - Whether to include random extras (default: true).
     * @returns {Maker} Returns this instance for method chaining.
     */
    randomize(options = {}) {
        try {
            if (options !== null && typeof options !== 'object') {
                throw new ValidationError(
                    'Randomize options must be an object',
                    'Provide an object with includeExtras property',
                    ['randomize()', 'randomize({ includeExtras: false })']
                );
            }

            const { includeExtras = true } = options || {};
            
            this.parts.bases = Math.floor(Math.random() * 61) + 1;
            this.parts.eyes = Math.floor(Math.random() * 63) + 1;
            this.parts.brows = Math.floor(Math.random() * 22) + 1;
            this.parts.mouths = Math.floor(Math.random() * 70) + 1;
            
            if (includeExtras) {
                this.parts.extras = Math.floor(Math.random() * 45) + 1;
            } else {
                this.parts.extras = 0;
            }
            
            return this;
        } catch (error) {
            if (error instanceof ValidationError) {
                console.error('❌ randomize Error:', error.getDetailedMessage());
            }
            throw error;
        }
    }

    /**
     * Builds and returns the final emoji image.
     * @returns {Promise<Object>} An object containing the image buffer, data URL, and parts used.
     * @throws {ValidationError} If no base is provided or if image files are missing.
     */
    async build() {
        try {
            // Validate that at least a base is provided
            if (this.parts.bases === 0) {
                throw new ValidationError(
                    'Cannot build emoji: No base provided',
                    'You must add a base before building the emoji',
                    ['maker.addBase(1).build()', 'maker.randomize().build()']
                );
            }

            // Create canvas with error handling
            let canvas, ctx;
            try {
                canvas = createCanvas(this.config.width, this.config.height);
                ctx = canvas.getContext('2d');
            } catch (error) {
                throw new ValidationError(
                    'Failed to create canvas',
                    'Canvas size might be too large or system resources insufficient',
                    ['Try smaller dimensions like 128x128', 'Check available memory']
                );
            }

            const layers = ['bases', 'eyes', 'brows', 'mouths', 'extras'];
            const basePath = path.resolve(__dirname, 'emojis');
            const loadedImages = [];

            // Load and validate all images first
            for (const layer of layers) {
                const partNumber = this.parts[layer];

                if (partNumber !== 0) {
                    const imagePath = path.join(basePath, layer, `${partNumber}.png`);

                    // Check if file exists
                    if (!fs.existsSync(imagePath)) {
                        throw new ValidationError(
                            `Image file missing: ${layer}/${partNumber}.png`,
                            'This component ID does not exist in the emoji package',
                            [`Use ${layer} ID between 1 and ${InputValidator.LIMITS[layer].max}`, 'Check available IDs with List.componentIDs()']
                        );
                    }

                    // Check if file is readable
                    try {
                        await fs.promises.access(imagePath, fs.constants.R_OK);
                    } catch (error) {
                        throw new ValidationError(
                            `Cannot read image file: ${layer}/${partNumber}.png`,
                            'File exists but cannot be read (permission issue)',
                            ['Check file permissions', 'Reinstall the package']
                        );
                    }

                    // Load image with error handling
                    try {
                        const image = await loadImage(imagePath);
                        loadedImages.push({ layer, image });
                    } catch (error) {
                        throw new ValidationError(
                            `Failed to load image: ${layer}/${partNumber}.png`,
                            'Image file might be corrupted or in wrong format',
                            ['Reinstall the package', `Try a different ${layer} ID`]
                        );
                    }
                }
            }

            // Draw all loaded images
            try {
                for (const { image } of loadedImages) {
                    ctx.drawImage(image, 0, 0, this.config.width, this.config.height);
                }
            } catch (error) {
                throw new ValidationError(
                    'Failed to draw images on canvas',
                    'Error occurred while compositing the emoji',
                    ['Try with different component IDs', 'Check canvas size settings']
                );
            }

            // Generate output with error handling
            let buffer, dataUrl;
            try {
                const mimeType = this.config.format === 'jpeg' ? 'image/jpeg' : 'image/png';
                buffer = canvas.toBuffer(mimeType);
                dataUrl = canvas.toDataURL(mimeType);
            } catch (error) {
                throw new ValidationError(
                    'Failed to generate final image',
                    'Error occurred while creating output buffer',
                    ['Try PNG format instead of JPEG', 'Use smaller canvas size']
                );
            }
            
            return {
                image: {
                    buffer: buffer,
                    url: dataUrl
                },
                parts: {
                    bases: this.parts.bases,
                    eyes: this.parts.eyes,
                    brows: this.parts.brows,
                    mouths: this.parts.mouths,
                    extras: this.parts.extras
                },
                config: {
                    width: this.config.width,
                    height: this.config.height,
                    format: this.config.format
                }
            };
        } catch (error) {
            if (error instanceof ValidationError) {
                console.error('❌ build Error:', error.getDetailedMessage());
            }
            throw error;
        }
    }

    /**
     * Gets information about available component ranges
     * @returns {Object} Object with min/max values for each component type
     */
    static getComponentRanges() {
        return {
            bases: { min: 1, max: 61, description: 'Face base shapes and colors' },
            eyes: { min: 1, max: 63, description: 'Eye styles and expressions' },
            brows: { min: 1, max: 22, description: 'Eyebrow shapes and styles' },
            mouths: { min: 1, max: 70, description: 'Mouth expressions and shapes' },
            extras: { min: 1, max: 45, description: 'Accessories like hats, glasses, etc.' }
        };
    }

    /**
     * Validates if all current parts are within valid ranges
     * @returns {Object} Validation result with any issues found
     */
    validateCurrentParts() {
        const issues = [];
        const parts = this.parts;
        
        for (const [category, value] of Object.entries(parts)) {
            if (value !== 0) {
                const limits = InputValidator.LIMITS[category];
                if (value < limits.min || value > limits.max) {
                    issues.push({
                        category,
                        value,
                        error: `${limits.name} ID ${value} is out of range (${limits.min}-${limits.max})`
                    });
                }
            }
        }

        return {
            isValid: issues.length === 0,
            issues: issues,
            parts: parts
        };
    }
}

module.exports = Maker;