# Emoji-Maker

A powerful and customizable emoji generator that creates unique emojis by combining different facial features and accessories using the Canvas API.

[![npm version](https://badge.fury.io/js/emoji-maker.svg)](https://badge.fury.io/js/emoji-maker)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## Features

- 🎨 **Customizable Emojis**: Combine different bases, eyes, brows, mouths, and extras
- 🎲 **Random Generation**: Create random emojis with one method call
- 📐 **Configurable Output**: Customize canvas size and output format (PNG/JPEG)
- 🔍 **Component Preview**: View all available parts with ID numbers
- ✅ **Input Validation**: Comprehensive error handling and validation
- 📘 **TypeScript Support**: Full TypeScript definitions included
- 🧪 **Well Tested**: Comprehensive test suite included

## Installation

```bash
npm install emoji-maker@latest
```

## Quick Start

```javascript
const { Maker, List } = require('emoji-maker');

// Create a custom emoji
const emoji = await new Maker()
    .addBase(1)      // Face base (1-61)
    .addEyes(4)      // Eyes style (1-63)
    .addBrows(6)     // Eyebrows (1-22)
    .addMouths(20)   // Mouth expression (1-70)
    .addExtras(8)    // Accessories (1-45)
    .build();

console.log(emoji);
/*
Output:
{
    image: {
        buffer: <Buffer>,
        url: 'data:image/png;base64...'
    },
    parts: { bases: 1, eyes: 4, brows: 6, mouths: 20, extras: 8 },
    config: { width: 128, height: 128, format: 'png' }
}
*/
```

## API Documentation

### Maker Class

The `Maker` class is the main class for creating custom emojis.

#### Constructor

```javascript
new Maker(options?)
```

**Options:**
- `width` (number): Canvas width in pixels (default: 128)
- `height` (number): Canvas height in pixels (default: 128)  
- `format` (string): Output format - 'png' or 'jpeg' (default: 'png')

```javascript
// Create with custom options
const maker = new Maker({ 
    width: 256, 
    height: 256, 
    format: 'jpeg' 
});
```

#### Methods

##### `addBase(number)` → `Maker`
Sets the base emoji face (required).
- **number**: Base ID from 1-61
- **Returns**: Maker instance for chaining

##### `addEyes(number)` → `Maker`
Sets the eyes for the emoji.
- **number**: Eyes ID from 1-63
- **Returns**: Maker instance for chaining

##### `addBrows(number)` → `Maker`
Sets the eyebrows for the emoji.
- **number**: Brows ID from 1-22
- **Returns**: Maker instance for chaining

##### `addMouths(number)` → `Maker`
Sets the mouth for the emoji.
- **number**: Mouth ID from 1-70
- **Returns**: Maker instance for chaining

##### `addExtras(number)` → `Maker`
Sets extra accessories for the emoji.
- **number**: Extras ID from 1-45
- **Returns**: Maker instance for chaining

##### `randomize(options?)` → `Maker`
Generates random parts for the emoji.
- **options.includeExtras** (boolean): Include random extras (default: true)
- **Returns**: Maker instance for chaining

```javascript
// Create a random emoji
const randomEmoji = await new Maker()
    .randomize()
    .build();

// Random emoji without extras
const randomEmojiNoExtras = await new Maker()
    .randomize({ includeExtras: false })
    .build();
```

##### `build()` → `Promise<EmojiResult>`
Builds and returns the final emoji image.
- **Returns**: Promise resolving to emoji result object
- **Throws**: `ValidationError` if no base is provided

## 🎯 Pro Tips for Foolproof Usage

### **1. Always Use Try-Catch for Async Operations**
```javascript
try {
    const emoji = await new Maker()
        .addBase(1)
        .addEyes(4)
        .build();
    console.log('Success!', emoji);
} catch (error) {
    console.error('Error:', error.message);
    // Error includes helpful suggestions
}
```

### **2. Validate Components Before Using**
```javascript
const list = new List();
const isValid = await list.validateComponent('bases', 1);
if (isValid) {
    const emoji = await new Maker().addBase(1).build();
}
```

### **3. Check Available Ranges**
```javascript
const ranges = Maker.getComponentRanges();
console.log(ranges);
// {
//   bases: { min: 1, max: 61, description: 'Face base shapes...' }
//   eyes: { min: 1, max: 63, description: 'Eye styles...' }
//   ...
// }
```

### **4. Validate Current Parts**
```javascript
const maker = new Maker().addBase(1).addEyes(999); // Invalid eyes
const validation = maker.validateCurrentParts();
if (!validation.isValid) {
    console.log('Issues:', validation.issues);
    // Shows which parts are invalid
}
```

### **5. Use Error Recovery**
```javascript
const maker = new Maker();
try {
    maker.addBase("invalid");
} catch (error) {
    console.log('Caught error, continuing...');
    // Maker is still usable!
    const emoji = await maker.addBase(1).build(); // ✅ Works fine
}
```

### List Class

The `List` class provides functionality to explore available emoji components.

#### Constructor

```javascript
new List(basePath?)
```

**Parameters:**
- `basePath` (string): Path to emojis directory (default: './emojis')

#### Methods

##### `componentIDs()` → `Promise<ComponentIDs>`
Gets all available component IDs for each category.

```javascript
const list = new List();
const components = await list.componentIDs();
console.log(components);
/*
{
    bases: ['1', '2', '3', ...],
    eyes: ['1', '2', '3', ...],
    brows: ['1', '2', '3', ...],
    mouths: ['1', '2', '3', ...],
    extras: ['1', '2', '3', ...]
}
*/
```

##### `displayImage(options?)` → `Promise<CategoryImages>`
Generates preview images for all component categories.

**Options:**
- `itemSize` (number): Size of each preview in pixels (default: 100)
- `itemsPerRow` (number): Items per row (default: 10)
- `backgroundColor` (string): Background color (default: '#2C2F33')
- `textColor` (string): Text color (default: '#ffffff')

```javascript
const images = await list.displayImage({
    itemSize: 80,
    itemsPerRow: 8,
    backgroundColor: '#000000'
});

// Save preview to file
const fs = require('fs');
fs.writeFileSync('mouths-preview.png', images.mouths.buffer);
```

##### `getCounts()` → `Promise<ComponentCounts>`
Gets the count of available components in each category.

```javascript
const counts = await list.getCounts();
console.log(counts); // { bases: 61, eyes: 63, brows: 22, mouths: 70, extras: 45 }
```

##### `validateComponent(category, id)` → `Promise<boolean>`
Validates if a component ID exists in a category.

```javascript
const isValid = await list.validateComponent('bases', 1); // true
const isInvalid = await list.validateComponent('bases', 999); // false
```

## Error Handling

The library uses a custom `ValidationError` class for all validation errors:

```javascript
const { Maker } = require('emoji-maker');

try {
    const emoji = await new Maker()
        .addBase('invalid') // Will throw ValidationError
        .build();
} catch (error) {
    if (error.name === 'ValidationError') {
        console.log('Validation Error:', error.message);
        // Handle validation error
    }
}
```

Common validation errors:
- `"Base ID must be a number"`
- `"Base ID must be between 0 and 61"`
- `"A base must be provided to build an emoji"`
- `"Image not found for eyes ID 999"`

## Advanced Usage

### Creating Multiple Emojis

```javascript
const { Maker } = require('emoji-maker');

// Create multiple random emojis
const emojis = await Promise.all([
    new Maker().randomize().build(),
    new Maker().randomize().build(),
    new Maker().randomize().build()
]);

console.log(`Created ${emojis.length} random emojis!`);
```

### Custom Canvas Size

```javascript
// Create high-resolution emoji
const highResEmoji = await new Maker({ width: 512, height: 512 })
    .addBase(15)
    .addEyes(23)
    .addMouths(45)
    .build();
```

### Saving Emojis to Files

```javascript
const fs = require('fs');
const { Maker } = require('emoji-maker');

const emoji = await new Maker()
    .addBase(10)
    .addEyes(15)
    .build();

// Save as PNG
fs.writeFileSync('my-emoji.png', emoji.image.buffer);

// Or use the data URL directly in HTML
const html = `<img src="${emoji.image.url}" alt="Custom Emoji" />`;
```

## Component Ranges

| Category | Range | Description |
|----------|-------|-------------|
| Bases    | 1-61  | Face shapes and base colors |
| Eyes     | 1-63  | Different eye styles and expressions |
| Brows    | 1-22  | Various eyebrow shapes |
| Mouths   | 1-70  | Mouth expressions and shapes |
| Extras   | 1-45  | Accessories like hats, glasses, etc. |

## TypeScript Support

Full TypeScript definitions are included:

```typescript
import { Maker, List, EmojiResult, ValidationError } from 'emoji-maker';

const maker: Maker = new Maker({ width: 256, height: 256 });
const result: EmojiResult = await maker.addBase(1).build();
```

## Testing

Run the test suite:

```bash
npm test
```

## Requirements

- Node.js >= 14.0.0
- Canvas package dependencies (automatically installed)

## License

ISC

## Contributing

Issues and pull requests are welcome! Please feel free to contribute to make this package even better.

## Repository

[https://github.com/ItsFranklinMyDudes/Emoji-Maker](https://github.com/ItsFranklinMyDudes/Emoji-Maker)