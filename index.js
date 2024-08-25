class Maker {
    addBase(number) {
        if (!number) {
            throw new Error('must be a value');
        } else if (typeof number !== 'number') {
            throw new Error('must be a number');
        } else if (number > 61 || number < 0) {
            throw new Error('number must be between 0 and 61');
        }
        return number;
    }
    addEyes(number) {
        if (!number) {
            throw new Error('must be a value');
        } else if (typeof number !== 'number') {
            throw new Error('must be a number');
        } else if (number > 63 || number < 0) {
            throw new Error('number must be between 0 and 63');
        }
        return number;
    }
    addBrows(number) {
        if (!number) {
            throw new Error('must be a value');
        } else if (typeof number !== 'number') {
            throw new Error('must be a number');
        } else if (number > 22 || number < 0) {
            throw new Error('number must be between 0 and 2');
        }
        return number;
    }
}

module.exports = Maker;
