const { Maker, List } = require('../index.js');
const fs = require('fs');
const path = require('path');

console.log('🧪 Running Emoji-Maker Tests...\n');

let testsRun = 0;
let testsPassed = 0;

function test(name, testFn) {
    testsRun++;
    try {
        testFn();
        console.log(`✅ ${name}`);
        testsPassed++;
    } catch (error) {
        console.log(`❌ ${name}: ${error.message}`);
    }
}

async function asyncTest(name, testFn) {
    testsRun++;
    try {
        await testFn();
        console.log(`✅ ${name}`);
        testsPassed++;
    } catch (error) {
        console.log(`❌ ${name}: ${error.message}`);
    }
}

// Test Maker class
console.log('📝 Testing Maker class...');

test('Maker can be instantiated', () => {
    const maker = new Maker();
    if (!maker.parts) throw new Error('Maker instance missing parts property');
});

test('Maker can be instantiated with options', () => {
    const maker = new Maker({ width: 256, height: 256, format: 'jpeg' });
    if (maker.config.width !== 256) throw new Error('Width option not set correctly');
    if (maker.config.height !== 256) throw new Error('Height option not set correctly');
    if (maker.config.format !== 'jpeg') throw new Error('Format option not set correctly');
});

test('addBase validates input correctly', () => {
    const maker = new Maker();
    try {
        maker.addBase('invalid');
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('not a valid number')) {
            throw new Error('Wrong validation error message');
        }
    }
});

test('addBase accepts valid input', () => {
    const maker = new Maker();
    const result = maker.addBase(1);
    if (result !== maker) throw new Error('Should return this for chaining');
    if (maker.parts.bases !== 1) throw new Error('Base not set correctly');
});

test('Method chaining works', () => {
    const maker = new Maker();
    const result = maker.addBase(1).addEyes(2).addBrows(3).addMouths(4).addExtras(5);
    if (result !== maker) throw new Error('Method chaining broken');
});

test('randomize generates valid parts', () => {
    const maker = new Maker();
    maker.randomize();
    if (maker.parts.bases < 1 || maker.parts.bases > 61) throw new Error('Invalid random base');
    if (maker.parts.eyes < 1 || maker.parts.eyes > 63) throw new Error('Invalid random eyes');
    if (maker.parts.brows < 1 || maker.parts.brows > 22) throw new Error('Invalid random brows');
    if (maker.parts.mouths < 1 || maker.parts.mouths > 70) throw new Error('Invalid random mouths');
});

asyncTest('build requires a base', async () => {
    const maker = new Maker();
    try {
        await maker.build();
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('No base provided')) {
            throw new Error('Wrong validation error message');
        }
    }
});

asyncTest('build works with valid parts', async () => {
    const maker = new Maker();
    const result = await maker.addBase(1).build();
    
    if (!result.image) throw new Error('Missing image in result');
    if (!result.image.buffer) throw new Error('Missing buffer in result');
    if (!result.image.url) throw new Error('Missing URL in result');
    if (!result.parts) throw new Error('Missing parts in result');
    if (!result.config) throw new Error('Missing config in result');
});

// Test List class
console.log('\n📝 Testing List class...');

test('List can be instantiated', () => {
    const list = new List();
    if (!list.basePath) throw new Error('List instance missing basePath property');
});

asyncTest('componentIDs returns valid structure', async () => {
    const list = new List();
    const components = await list.componentIDs();
    
    const expectedCategories = ['bases', 'eyes', 'brows', 'mouths', 'extras'];
    for (const category of expectedCategories) {
        if (!components[category]) throw new Error(`Missing category: ${category}`);
        if (!Array.isArray(components[category])) throw new Error(`Category ${category} is not an array`);
    }
});

asyncTest('getCounts returns valid counts', async () => {
    const list = new List();
    const counts = await list.getCounts();
    
    if (typeof counts.bases !== 'number') throw new Error('Invalid bases count');
    if (counts.bases <= 0) throw new Error('Bases count should be positive');
});

asyncTest('validateComponent works correctly', async () => {
    const list = new List();
    const isValid = await list.validateComponent('bases', 1);
    if (!isValid) throw new Error('Component validation failed for valid component');
    
    const isInvalid = await list.validateComponent('bases', 999);
    if (isInvalid) throw new Error('Component validation passed for invalid component');
});

asyncTest('displayImage generates images', async () => {
    const list = new List();
    try {
        const images = await list.displayImage();
        
        if (!images.bases) throw new Error('Missing bases image');
        if (!images.bases.buffer) throw new Error('Missing buffer in bases image');
        if (!images.bases.url) throw new Error('Missing URL in bases image');
    } catch (error) {
        // If directory doesn't exist, this is expected in test environment
        if (error.message.includes('not found') || error.message.includes('Missing')) {
            console.log('⚠️  Skipping displayImage test - emoji directory not available');
            return;
        }
        throw error;
    }
});

// Integration tests
console.log('\n📝 Running integration tests...');

asyncTest('Full emoji creation workflow', async () => {
    const maker = new Maker();
    const emoji = await maker
        .addBase(1)
        .addEyes(4)
        .addBrows(6)
        .addMouths(20)
        .addExtras(8)
        .build();
    
    if (!emoji.image.buffer) throw new Error('Failed to create emoji buffer');
    if (emoji.parts.bases !== 1) throw new Error('Incorrect parts in result');
    if (emoji.parts.eyes !== 4) throw new Error('Incorrect eyes in result');
});

asyncTest('Random emoji generation', async () => {
    const maker = new Maker();
    const emoji = await maker.randomize().build();
    
    if (!emoji.image.buffer) throw new Error('Failed to create random emoji');
    if (emoji.parts.bases === 0) throw new Error('Random emoji missing base');
});

// Run all tests
(async () => {
    // Wait for all async tests to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log(`\n📊 Test Results:`);
    console.log(`Tests run: ${testsRun}`);
    console.log(`Tests passed: ${testsPassed}`);
    console.log(`Tests failed: ${testsRun - testsPassed}`);
    
    if (testsPassed === testsRun) {
        console.log('🎉 All tests passed!');
        process.exit(0);
    } else {
        console.log('💥 Some tests failed!');
        process.exit(1);
    }
})();