const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

class List {
    constructor(basePath = path.join(__dirname, './emojis')) {
        this.basePath = basePath;
        // console.log(`Base path set to: ${this.basePath}`);
    }

    /**
     * 
     * @returns every emojis ID in the file system (don't use)
     */
    async componentIDs() {
        const components = {};
        const categories = ['bases', 'eyes', 'brows', 'mouths', 'extras'];

        for (const category of categories) {
            const categoryPath = path.join(this.basePath, category);
            // console.log(`Checking category path: ${categoryPath}`);
            if (fs.existsSync(categoryPath)) {
                const files = fs.readdirSync(categoryPath)
                    .filter(file => path.extname(file) === '.png')
                    .map(file => path.basename(file, '.png'));

                components[category] = files;
            } else {
                // console.warn(`Directory not found: ${categoryPath}`);
            }
        }

        return components;
    }

    /**
     * 
     * @returns an image with every emoji component and there ID
     */
    async displayImage() {
        const components = await this.componentIDs();
        const canvasWidth = 1000; // Adjusted canvas width to fit more emojis in a row
        const itemSize = 100; // Size of each emoji
        const padding = 0; // Space between emojis
        const categoryImages = {};
    
        for (const [category, files] of Object.entries(components)) {
            // Sort the files array numerically
            files.sort((a, b) => a - b);
    
            const canvasHeight = Math.ceil(files.length / 10) * (itemSize + padding) + 100;
            const canvas = createCanvas(canvasWidth, canvasHeight);
            const ctx = canvas.getContext('2d');
    
            // Background
            ctx.fillStyle = '#2C2F33'; // Dark background color
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
            // Category title
            ctx.fillStyle = '#ffffff';
            ctx.font = '40px Arial';
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#ffffff';
            ctx.fillText(category.toUpperCase(), 10, 30);
            ctx.strokeText(category.toUpperCase(), 10, 30);
    
            let xPos = 0;
            let yPos = 50;
    
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const imagePath = path.join(this.basePath, category, `${file}.png`);
                const image = await loadImage(imagePath);
    
                // Draw emoji image
                ctx.drawImage(image, xPos, yPos, itemSize, itemSize);
    
                // Draw number on the emoji
                ctx.fillStyle = '#ffffff';
                ctx.strokeStyle = '#ffffff';
                ctx.font = 'bold 30px Arial';
                ctx.textAlign = 'left';
                ctx.lineWidth = 2;
                ctx.textBaseline = 'bottom';
                ctx.fillText(file, xPos + itemSize / 2, yPos + itemSize / 2);
                ctx.strokeText(file, xPos + itemSize / 2, yPos + itemSize / 2);
    
                xPos += itemSize + padding;
                if (xPos + itemSize > canvasWidth) {
                    xPos = 0;
                    yPos += itemSize + padding;
                }
            }
    
            // Store the buffer and URL for this category
            categoryImages[category] = {
                buffer: canvas.toBuffer('image/png'),
                url: canvas.toDataURL('image/png')
            };
        }
    
        return categoryImages;
    }
}

module.exports = List;