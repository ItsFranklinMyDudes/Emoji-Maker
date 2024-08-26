const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

class List {
    constructor(basePath = path.join(__dirname, './emojis')) {
        this.basePath = basePath;
        // console.log(`Base path set to: ${this.basePath}`);
    }    

    async displayComponents() {
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

    async displayComponentsByCategory() {
        const components = await this.displayComponents();
        const canvasWidth = 1400; // Adjusted canvas width to fit more emojis in a row
        const itemSize = 90; // Size of each emoji
        const padding = 10; // Space between emojis
        const categoryImages = {};
    
        for (const [category, files] of Object.entries(components)) {
            // Sort the files array numerically
            files.sort((a, b) => a - b);
    
            const canvasHeight = Math.ceil(files.length / 15) * (itemSize + padding) + 90;
            const canvas = createCanvas(canvasWidth, canvasHeight);
            const ctx = canvas.getContext('2d');
    
            // Background
            ctx.fillStyle = '#2C2F33'; // Dark background color
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
            // Category title
            ctx.fillStyle = '#ffffff';
            ctx.font = '24px Arial';
            ctx.lineWidth = 2
            ctx.strokeStyle = '#ffffff'
            ctx.fillText(category.toUpperCase(), 10, 30);
            ctx.strokeText(category.toUpperCase(), 10, 30)
    
            let xPos = 10;
            let yPos = 50;
    
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const imagePath = path.join(this.basePath, category, `${file}.png`);
                const image = await loadImage(imagePath);
    
                // Draw emoji image
                ctx.drawImage(image, xPos, yPos, itemSize, itemSize);
    
                // Draw number in the center
                ctx.fillStyle = '#ffffff';
                ctx.strokeStyle = '#ffffff'
                ctx.font = 'bold 20px Arial';
                ctx.textAlign = 'center';
                ctx.lineWidth = 2
                ctx.textBaseline = 'middle'; // Ensure the text is centered vertically
                ctx.fillText(file, xPos + itemSize / 2, yPos + itemSize / 2)
                ctx.strokeText(file, xPos + itemSize / 2, yPos + itemSize / 2)
    
                xPos += itemSize + padding;
                if (xPos + itemSize > canvasWidth) {
                    xPos = 10;
                    yPos += itemSize + padding;
                }
            }
    
            categoryImages[category] = canvas.toBuffer('image/png');
        }
    
        return categoryImages;
    }
}

module.exports = List;
