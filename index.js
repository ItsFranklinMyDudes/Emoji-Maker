class Maker {
    addBase(number) {
        if(!number) {
            throw new Error('must be a value');
        }
        if (typeof number !== 'number') {
            throw new Error('must be a number');
        }
        if(number > 61 || number < 0) {
            throw new Error('number must be between 0 and 61');
        }
        return number;
    }
    addEyes(number) {
        if (typeof number !== 'number') {
            throw new Error('must be a number');
        }
        if(number > 63 || number < 0) {
            throw new Error('number must be between 0 and 61');
        }
        return number;
    }
}

module.exports = Maker;
