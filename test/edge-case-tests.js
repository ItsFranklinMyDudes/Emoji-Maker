const { Maker, List } = require('../index.js');
const fs = require('fs');
const path = require('path');

console.log('🧪 Running Comprehensive Idiot-Proof Tests...\n');

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

// ===== MAKER CLASS EDGE CASE TESTS =====
console.log('🔧 Testing Maker class edge cases...');

// Constructor validation tests
test('Constructor handles null options', () => {
    const maker = new Maker(null);
    if (maker.config.width !== 128) throw new Error('Default width not set');
});

test('Constructor handles undefined options', () => {
    const maker = new Maker(undefined);
    if (maker.config.height !== 128) throw new Error('Default height not set');
});

test('Constructor rejects array options', () => {
    try {
        new Maker([128, 128]);
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('object')) throw new Error('Wrong error message');
    }
});

test('Constructor rejects string options', () => {
    try {
        new Maker("invalid");
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('object')) throw new Error('Wrong error message');
    }
});

test('Constructor validates width limits', () => {
    try {
        new Maker({ width: 5000 });
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('4096')) throw new Error('Wrong error message');
    }
});

test('Constructor validates height limits', () => {
    try {
        new Maker({ height: -10 });
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('positive')) throw new Error('Wrong error message');
    }
});

test('Constructor validates format options', () => {
    try {
        new Maker({ format: 'gif' });
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('png') || !error.message.includes('jpeg')) throw new Error('Wrong error message');
    }
});

// Input validation tests
test('addBase rejects null', () => {
    const maker = new Maker();
    try {
        maker.addBase(null);
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('null')) throw new Error('Wrong error message');
    }
});

test('addBase rejects undefined', () => {
    const maker = new Maker();
    try {
        maker.addBase(undefined);
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('undefined')) throw new Error('Wrong error message');
    }
});

test('addBase rejects arrays', () => {
    const maker = new Maker();
    try {
        maker.addBase([1, 2, 3]);
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('array')) throw new Error('Wrong error message');
    }
});

test('addBase rejects objects', () => {
    const maker = new Maker();
    try {
        maker.addBase({ id: 1 });
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('object')) throw new Error('Wrong error message');
    }
});

test('addBase rejects empty strings', () => {
    const maker = new Maker();
    try {
        maker.addBase('');
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('empty')) throw new Error('Wrong error message');
    }
});

test('addBase converts valid string numbers', () => {
    const maker = new Maker();
    const result = maker.addBase('5');
    if (maker.parts.bases !== 5) throw new Error('String number not converted');
});

test('addBase rejects invalid string numbers', () => {
    const maker = new Maker();
    try {
        maker.addBase('abc');
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('not a valid number')) throw new Error('Wrong error message');
    }
});

test('addBase rejects mixed string numbers', () => {
    const maker = new Maker();
    try {
        maker.addBase('5a');
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('not a valid number')) throw new Error('Wrong error message');
    }
});

test('addBase rejects booleans', () => {
    const maker = new Maker();
    try {
        maker.addBase(true);
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('boolean')) throw new Error('Wrong error message');
    }
});

test('addBase rejects decimals', () => {
    const maker = new Maker();
    try {
        maker.addBase(1.5);
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('whole number')) throw new Error('Wrong error message');
    }
});

test('addBase rejects NaN', () => {
    const maker = new Maker();
    try {
        maker.addBase(NaN);
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('NaN')) throw new Error('Wrong error message');
    }
});

test('addBase rejects Infinity', () => {
    const maker = new Maker();
    try {
        maker.addBase(Infinity);
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('infinite')) throw new Error('Wrong error message');
    }
});

test('addBase rejects negative infinity', () => {
    const maker = new Maker();
    try {
        maker.addBase(-Infinity);
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('infinite')) throw new Error('Wrong error message');
    }
});

test('addBase rejects zero', () => {
    const maker = new Maker();
    try {
        maker.addBase(0);
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('out of range')) throw new Error('Wrong error message');
    }
});

test('addBase rejects negative numbers', () => {
    const maker = new Maker();
    try {
        maker.addBase(-5);
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('out of range')) throw new Error('Wrong error message');
    }
});

test('addBase rejects out of range numbers', () => {
    const maker = new Maker();
    try {
        maker.addBase(100);
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('out of range')) throw new Error('Wrong error message');
    }
});

// Test all component methods with same validation
const componentMethods = ['addEyes', 'addBrows', 'addMouths', 'addExtras'];
for (const method of componentMethods) {
    test(`${method} rejects null`, () => {
        const maker = new Maker();
        try {
            maker[method](null);
            throw new Error('Should have thrown validation error');
        } catch (error) {
            if (!error.message.includes('null')) throw new Error('Wrong error message');
        }
    });

    test(`${method} rejects arrays`, () => {
        const maker = new Maker();
        try {
            maker[method]([1]);
            throw new Error('Should have thrown validation error');
        } catch (error) {
            if (!error.message.includes('array')) throw new Error('Wrong error message');
        }
    });
}

// Randomize validation tests
test('randomize handles null options', () => {
    const maker = new Maker();
    const result = maker.randomize(null);
    if (maker.parts.bases === 0) throw new Error('Randomize failed to set base');
});

test('randomize rejects non-object options', () => {
    const maker = new Maker();
    try {
        maker.randomize("invalid");
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('object')) throw new Error('Wrong error message');
    }
});

test('randomize works with includeExtras false', () => {
    const maker = new Maker();
    maker.randomize({ includeExtras: false });
    if (maker.parts.extras !== 0) throw new Error('Extras should be 0 when disabled');
});

// Build validation tests
asyncTest('build requires base', async () => {
    const maker = new Maker();
    try {
        await maker.build();
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('base must be provided')) throw new Error('Wrong error message');
    }
});

asyncTest('build validates all parts', async () => {
    const maker = new Maker();
    const validation = maker.validateCurrentParts();
    if (!validation.isValid !== (validation.issues.length > 0)) throw new Error('Validation logic incorrect');
});

// ===== LIST CLASS EDGE CASE TESTS =====
console.log('\n🔧 Testing List class edge cases...');

// Constructor validation tests
test('List constructor handles null path', () => {
    const list = new List(null);
    if (!list.basePath.includes('emojis')) throw new Error('Default path not set');
});

test('List constructor rejects non-string path', () => {
    try {
        new List(123);
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('string')) throw new Error('Wrong error message');
    }
});

test('List constructor rejects empty string path', () => {
    try {
        new List('');
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('empty')) throw new Error('Wrong error message');
    }
});

test('List constructor rejects array path', () => {
    try {
        new List(['path']);
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('string')) throw new Error('Wrong error message');
    }
});

// Display options validation tests
asyncTest('displayImage handles null options', async () => {
    const list = new List();
    const result = await list.displayImage(null);
    if (!result.bases) throw new Error('Should generate bases image');
});

asyncTest('displayImage rejects non-object options', async () => {
    const list = new List();
    try {
        await list.displayImage("invalid");
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('object')) throw new Error('Wrong error message');
    }
});

asyncTest('displayImage validates itemSize limits', async () => {
    const list = new List();
    try {
        await list.displayImage({ itemSize: 1000 });
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('500')) throw new Error('Wrong error message');
    }
});

asyncTest('displayImage validates itemsPerRow limits', async () => {
    const list = new List();
    try {
        await list.displayImage({ itemsPerRow: 50 });
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('20')) throw new Error('Wrong error message');
    }
});

asyncTest('displayImage validates itemSize type', async () => {
    const list = new List();
    try {
        await list.displayImage({ itemSize: 'big' });
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('positive integer')) throw new Error('Wrong error message');
    }
});

asyncTest('displayImage validates backgroundColor type', async () => {
    const list = new List();
    try {
        await list.displayImage({ backgroundColor: 123 });
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('string')) throw new Error('Wrong error message');
    }
});

// ValidateComponent tests
asyncTest('validateComponent rejects non-string category', async () => {
    const list = new List();
    try {
        await list.validateComponent(123, 1);
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('string')) throw new Error('Wrong error message');
    }
});

asyncTest('validateComponent rejects invalid category', async () => {
    const list = new List();
    try {
        await list.validateComponent('invalid', 1);
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('Invalid category')) throw new Error('Wrong error message');
    }
});

asyncTest('validateComponent rejects non-integer ID', async () => {
    const list = new List();
    try {
        await list.validateComponent('bases', 'abc');
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('integer')) throw new Error('Wrong error message');
    }
});

asyncTest('validateComponent rejects decimal ID', async () => {
    const list = new List();
    try {
        await list.validateComponent('bases', 1.5);
        throw new Error('Should have thrown validation error');
    } catch (error) {
        if (!error.message.includes('integer')) throw new Error('Wrong error message');
    }
});

// Integration tests with edge cases
console.log('\n🔧 Testing integration edge cases...');

asyncTest('Full workflow with string inputs', async () => {
    const maker = new Maker();
    const emoji = await maker
        .addBase('1')    // String number
        .addEyes('4')    // String number
        .build();
    
    if (emoji.parts.bases !== 1) throw new Error('String input not converted');
});

asyncTest('Error recovery test', async () => {
    const maker = new Maker();
    try {
        maker.addBase('invalid');
    } catch (error) {
        // Should still be able to use maker after error
        const emoji = await maker.addBase(1).build();
        if (!emoji.image.buffer) throw new Error('Maker not recoverable after error');
    }
});

// Memory and performance tests
asyncTest('Large canvas size handling', async () => {
    try {
        const maker = new Maker({ width: 2048, height: 2048 });
        const emoji = await maker.addBase(1).build();
        if (!emoji.image.buffer) throw new Error('Large canvas failed');
    } catch (error) {
        if (!error.message.includes('canvas')) throw new Error('Wrong error handling');
    }
});

asyncTest('Multiple randomizations work', async () => {
    const maker = new Maker();
    for (let i = 0; i < 5; i++) {
        maker.randomize();
        if (maker.parts.bases === 0) throw new Error('Randomization failed');
    }
    const emoji = await maker.build();
    if (!emoji.image.buffer) throw new Error('Multiple randomizations broke maker');
});

// Run all tests
(async () => {
    // Wait for all async tests to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log(`\n📊 Comprehensive Test Results:`);
    console.log(`Tests run: ${testsRun}`);
    console.log(`Tests passed: ${testsPassed}`);
    console.log(`Tests failed: ${testsRun - testsPassed}`);
    
    if (testsPassed === testsRun) {
        console.log('🎉 All edge case tests passed! Package is idiot-proof! 🛡️');
        process.exit(0);
    } else {
        console.log('💥 Some edge case tests failed!');
        process.exit(1);
    }
})();