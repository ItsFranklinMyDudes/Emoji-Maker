const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

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
 * A class for listing and displaying available emoji components.
 * Provides foolproof functionality to view all available parts for emoji creation.
 * 
 * This class includes comprehensive error handling and helpful guidance.
 */
class List {
    /**
     * Creates a new List instance.
     * @param {string} basePath - The base path to the emojis directory (default: './emojis').
     */
    constructor(basePath = null) {
        try {
            // Validate and set base path
            this.basePath = this._validateAndSetBasePath(basePath);
            
            // Validate directory structure
            this._validateDirectoryStructure();
            
        } catch (error) {
            if (error instanceof ValidationError) {
                console.error('❌ List Constructor Error:', error.getDetailedMessage());
            }
            throw error;
        }
    }

    /**
     * Validates and sets the base path
     * @private
     */
    _validateAndSetBasePath(basePath) {
        if (basePath === null || basePath === undefined) {
            return path.join(__dirname, './emojis');
        }

        if (typeof basePath !== 'string') {
            throw new ValidationError(
                'Base path must be a string',
                'Provide a valid directory path as a string',
                ['new List()', 'new List("./emojis")', 'new List("/path/to/emojis")']
            );
        }

        const trimmedPath = basePath.trim();
        if (trimmedPath === '') {
            throw new ValidationError(
                'Base path cannot be empty',
                'Provide a valid directory path',
                ['new List()', 'new List("./emojis")']
            );
        }

        return path.resolve(trimmedPath);
    }

    /**
     * Validates the directory structure exists and is accessible
     * @private
     */
    _validateDirectoryStructure() {
        // Check if base directory exists
        if (!fs.existsSync(this.basePath)) {
            throw new ValidationError(
                `Emoji directory not found: ${this.basePath}`,
                'Ensure the emojis directory exists',
                ['Check if the path is correct', 'Reinstall the package', 'Verify directory permissions']
            );
        }

        // Check if it's actually a directory
        const stats = fs.statSync(this.basePath);
        if (!stats.isDirectory()) {
            throw new ValidationError(
                `Path is not a directory: ${this.basePath}`,
                'Provide a path to a directory, not a file',
                ['Use a directory path like "./emojis"', 'Check the path is correct']
            );
        }

        // Check read permissions
        try {
            fs.accessSync(this.basePath, fs.constants.R_OK);
        } catch (error) {
            throw new ValidationError(
                `Cannot read emoji directory: ${this.basePath}`,
                'Check directory permissions',
                ['Verify read permissions', 'Run as administrator if needed', 'Check ownership']
            );
        }

        // Validate category directories
        const expectedCategories = ['bases', 'eyes', 'brows', 'mouths', 'extras'];
        const missingCategories = [];

        for (const category of expectedCategories) {
            const categoryPath = path.join(this.basePath, category);
            if (!fs.existsSync(categoryPath)) {
                missingCategories.push(category);
            }
        }

        if (missingCategories.length > 0) {
            throw new ValidationError(
                `Missing emoji category folders: ${missingCategories.join(', ')}`,
                'Ensure all required category folders exist',
                [`Create missing folders: ${missingCategories.join(', ')}`, 'Reinstall the package', 'Check directory structure']
            );
        }
    }

    /**
     * Gets the IDs of all available components for each category.
     * @returns {Promise<Object>} An object with arrays of available IDs for each category.
     * @throws {ValidationError} If the emojis directory structure is invalid.
     */
    async componentIDs() {
        try {
            const components = {};
            const categories = ['bases', 'eyes', 'brows', 'mouths', 'extras'];

            for (const category of categories) {
                const categoryPath = path.join(this.basePath, category);
                
                try {
                    // Check if category directory exists and is readable
                    await fs.promises.access(categoryPath, fs.constants.R_OK);
                    
                    // Read directory contents
                    const files = await fs.promises.readdir(categoryPath);
                    
                    // Filter and process PNG files
                    const validFiles = files
                        .filter(file => {
                            const ext = path.extname(file).toLowerCase();
                            return ext === '.png';
                        })
                        .map(file => path.basename(file, '.png'))
                        .filter(filename => {
                            // Only include numeric filenames
                            const num = parseInt(filename, 10);
                            return !isNaN(num) && num.toString() === filename;
                        })
                        .sort((a, b) => parseInt(a, 10) - parseInt(b, 10)); // Sort numerically

                    components[category] = validFiles;

                    // Warn if no valid files found
                    if (validFiles.length === 0) {
                        console.warn(`⚠️  Warning: No valid PNG files found in ${category} directory`);
                    }

                } catch (error) {
                    throw new ValidationError(
                        `Cannot read category directory: ${category}`,
                        'Check if the directory exists and is readable',
                        [`Verify ${categoryPath} exists`, 'Check permissions', 'Reinstall package']
                    );
                }
            }

            return components;

        } catch (error) {
            if (error instanceof ValidationError) {
                console.error('❌ componentIDs Error:', error.getDetailedMessage());
            }
            throw error;
        }
    }

    /**
     * Generates preview images showing all available components for each category.
     * Each component is displayed with its ID number for easy reference.
     * @param {Object} options - Configuration options for the display.
     * @param {number} options.itemSize - Size of each emoji preview (default: 100, max: 500).
     * @param {number} options.itemsPerRow - Number of items per row (default: 10, max: 20).
     * @param {string} options.backgroundColor - Background color (default: '#2C2F33').
     * @param {string} options.textColor - Text color (default: '#ffffff').
     * @returns {Promise<Object>} An object with image data for each category.
     */
    async displayImage(options = {}) {
        try {
            // Validate options
            const validatedOptions = this._validateDisplayOptions(options);
            const { itemSize, itemsPerRow, backgroundColor, textColor } = validatedOptions;

            const components = await this.componentIDs();
            const canvasWidth = itemsPerRow * itemSize;
            const categoryImages = {};
    
            for (const [category, files] of Object.entries(components)) {
                if (files.length === 0) {
                    console.warn(`⚠️  Skipping ${category}: No valid components found`);
                    continue;
                }

                try {
                    const canvasHeight = Math.max(200, Math.ceil(files.length / itemsPerRow) * itemSize + 100);
                    
                    // Create canvas with error handling
                    let canvas, ctx;
                    try {
                        canvas = createCanvas(canvasWidth, canvasHeight);
                        ctx = canvas.getContext('2d');
                    } catch (error) {
                        throw new ValidationError(
                            `Failed to create canvas for ${category}`,
                            'Canvas size might be too large',
                            ['Try smaller itemSize', 'Reduce itemsPerRow', 'Check available memory']
                        );
                    }
        
                    // Background
                    ctx.fillStyle = backgroundColor;
                    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
                    // Category title
                    ctx.fillStyle = textColor;
                    ctx.font = '40px Arial';
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = textColor;
                    ctx.fillText(category.toUpperCase(), 10, 50);
                    ctx.strokeText(category.toUpperCase(), 10, 50);
        
                    let xPos = 0;
                    let yPos = 70;
                    const loadedCount = { success: 0, failed: 0 };
        
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        const imagePath = path.join(this.basePath, category, `${file}.png`);
                        
                        try {
                            // Verify file exists and is readable
                            await fs.promises.access(imagePath, fs.constants.R_OK);
                            
                            // Load and draw image
                            const image = await loadImage(imagePath);
                            ctx.drawImage(image, xPos, yPos, itemSize, itemSize);
                            loadedCount.success++;
        
                            // Draw ID number on the emoji
                            ctx.fillStyle = textColor;
                            ctx.strokeStyle = textColor;
                            ctx.font = 'bold 16px Arial';
                            ctx.textAlign = 'center';
                            ctx.lineWidth = 1;
                            ctx.textBaseline = 'bottom';
                            
                            const textX = xPos + itemSize / 2;
                            const textY = yPos + itemSize - 5;
                            
                            ctx.fillText(file, textX, textY);
                            ctx.strokeText(file, textX, textY);
                            
                        } catch (error) {
                            console.warn(`⚠️  Failed to load ${category}/${file}.png: ${error.message}`);
                            loadedCount.failed++;
                            
                            // Draw placeholder for failed image
                            ctx.fillStyle = '#666666';
                            ctx.fillRect(xPos, yPos, itemSize, itemSize);
                            ctx.fillStyle = textColor;
                            ctx.font = 'bold 12px Arial';
                            ctx.textAlign = 'center';
                            ctx.fillText('ERROR', xPos + itemSize / 2, yPos + itemSize / 2);
                        }
        
                        xPos += itemSize;
                        if (xPos >= canvasWidth) {
                            xPos = 0;
                            yPos += itemSize;
                        }
                    }

                    // Log loading statistics
                    if (loadedCount.failed > 0) {
                        console.warn(`⚠️  ${category}: ${loadedCount.success} loaded, ${loadedCount.failed} failed`);
                    }
        
                    // Store the buffer and URL for this category
                    categoryImages[category] = {
                        buffer: canvas.toBuffer('image/png'),
                        url: canvas.toDataURL('image/png'),
                        count: files.length,
                        loaded: loadedCount.success,
                        failed: loadedCount.failed
                    };

                } catch (error) {
                    console.error(`❌ Failed to generate preview for ${category}:`, error.message);
                    throw new ValidationError(
                        `Failed to generate preview image for ${category}`,
                        'Try with smaller image parameters or check component files',
                        ['Reduce itemSize', 'Check image files', 'Verify directory permissions']
                    );
                }
            }

            if (Object.keys(categoryImages).length === 0) {
                throw new ValidationError(
                    'No preview images could be generated',
                    'No valid emoji components found in any category',
                    ['Check emoji directory structure', 'Reinstall package', 'Verify PNG files exist']
                );
            }
    
            return categoryImages;

        } catch (error) {
            if (error instanceof ValidationError) {
                console.error('❌ displayImage Error:', error.getDetailedMessage());
            }
            throw error;
        }
    }

    /**
     * Validates display options
     * @private
     */
    _validateDisplayOptions(options) {
        if (options === null || options === undefined) {
            return {
                itemSize: 100,
                itemsPerRow: 10,
                backgroundColor: '#2C2F33',
                textColor: '#ffffff'
            };
        }

        if (typeof options !== 'object' || Array.isArray(options)) {
            throw new ValidationError(
                'Display options must be an object',
                'Provide an object with itemSize, itemsPerRow, backgroundColor, and/or textColor',
                ['{}', '{ itemSize: 80 }', '{ backgroundColor: "#000000" }']
            );
        }

        const result = {};

        // Validate itemSize
        if (options.itemSize !== undefined) {
            if (typeof options.itemSize !== 'number' || !Number.isInteger(options.itemSize) || options.itemSize <= 0) {
                throw new ValidationError(
                    'itemSize must be a positive integer',
                    'Provide a positive whole number for item size',
                    ['itemSize: 50', 'itemSize: 100', 'itemSize: 150']
                );
            }
            if (options.itemSize > 500) {
                throw new ValidationError(
                    'itemSize cannot exceed 500 pixels',
                    'Use a smaller item size to avoid memory issues',
                    ['itemSize: 100', 'itemSize: 200', 'itemSize: 300']
                );
            }
            result.itemSize = options.itemSize;
        } else {
            result.itemSize = 100;
        }

        // Validate itemsPerRow
        if (options.itemsPerRow !== undefined) {
            if (typeof options.itemsPerRow !== 'number' || !Number.isInteger(options.itemsPerRow) || options.itemsPerRow <= 0) {
                throw new ValidationError(
                    'itemsPerRow must be a positive integer',
                    'Provide a positive whole number for items per row',
                    ['itemsPerRow: 5', 'itemsPerRow: 10', 'itemsPerRow: 15']
                );
            }
            if (options.itemsPerRow > 20) {
                throw new ValidationError(
                    'itemsPerRow cannot exceed 20',
                    'Use fewer items per row to avoid layout issues',
                    ['itemsPerRow: 10', 'itemsPerRow: 15', 'itemsPerRow: 20']
                );
            }
            result.itemsPerRow = options.itemsPerRow;
        } else {
            result.itemsPerRow = 10;
        }

        // Validate backgroundColor
        if (options.backgroundColor !== undefined) {
            if (typeof options.backgroundColor !== 'string') {
                throw new ValidationError(
                    'backgroundColor must be a string',
                    'Provide a valid CSS color string',
                    ['backgroundColor: "#000000"', 'backgroundColor: "black"', 'backgroundColor: "rgb(0,0,0)"']
                );
            }
            result.backgroundColor = options.backgroundColor.trim();
        } else {
            result.backgroundColor = '#2C2F33';
        }

        // Validate textColor
        if (options.textColor !== undefined) {
            if (typeof options.textColor !== 'string') {
                throw new ValidationError(
                    'textColor must be a string',
                    'Provide a valid CSS color string',
                    ['textColor: "#ffffff"', 'textColor: "white"', 'textColor: "rgb(255,255,255)"']
                );
            }
            result.textColor = options.textColor.trim();
        } else {
            result.textColor = '#ffffff';
        }

        return result;
    }

    /**
     * Gets the count of available components for each category.
     * @returns {Promise<Object>} An object with the count of items in each category.
     */
    async getCounts() {
        try {
            const components = await this.componentIDs();
            const counts = {};
            
            for (const [category, files] of Object.entries(components)) {
                counts[category] = files.length;
            }
            
            return counts;

        } catch (error) {
            if (error instanceof ValidationError) {
                console.error('❌ getCounts Error:', error.getDetailedMessage());
            }
            throw error;
        }
    }

    /**
     * Validates if a specific component ID exists in a category.
     * @param {string} category - The category to check ('bases', 'eyes', 'brows', 'mouths', 'extras').
     * @param {number} id - The component ID to validate.
     * @returns {Promise<boolean>} True if the component exists, false otherwise.
     */
    async validateComponent(category, id) {
        try {
            // Validate category parameter
            if (typeof category !== 'string') {
                throw new ValidationError(
                    'Category must be a string',
                    'Provide a valid category name',
                    ['bases', 'eyes', 'brows', 'mouths', 'extras']
                );
            }

            const trimmedCategory = category.trim().toLowerCase();
            const validCategories = ['bases', 'eyes', 'brows', 'mouths', 'extras'];
            
            if (!validCategories.includes(trimmedCategory)) {
                throw new ValidationError(
                    `Invalid category "${category}"`,
                    'Use one of the valid categories',
                    validCategories
                );
            }

            // Validate ID parameter
            if (typeof id !== 'number' || !Number.isInteger(id)) {
                throw new ValidationError(
                    'Component ID must be an integer',
                    'Provide a valid component ID number',
                    ['1', '5', '10']
                );
            }

            const components = await this.componentIDs();
            
            if (!components[trimmedCategory]) {
                return false;
            }
            
            return components[trimmedCategory].includes(id.toString());

        } catch (error) {
            if (error instanceof ValidationError) {
                console.error('❌ validateComponent Error:', error.getDetailedMessage());
            }
            throw error;
        }
    }

    /**
     * Gets detailed information about the emoji directory structure
     * @returns {Promise<Object>} Detailed information about each category
     */
    async getDirectoryInfo() {
        try {
            const components = await this.componentIDs();
            const info = {
                basePath: this.basePath,
                categories: {},
                totalComponents: 0
            };

            for (const [category, files] of Object.entries(components)) {
                const categoryPath = path.join(this.basePath, category);
                const stats = await fs.promises.stat(categoryPath);
                
                info.categories[category] = {
                    path: categoryPath,
                    count: files.length,
                    lastModified: stats.mtime,
                    available: files.length > 0,
                    range: files.length > 0 ? `1-${Math.max(...files.map(f => parseInt(f, 10)))}` : 'None'
                };
                
                info.totalComponents += files.length;
            }

            return info;

        } catch (error) {
            if (error instanceof ValidationError) {
                console.error('❌ getDirectoryInfo Error:', error.getDetailedMessage());
            }
            throw error;
        }
    }
}

module.exports = List;