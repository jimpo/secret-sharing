function strToByteArray(str) {
    const buffer = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
        buffer[i] = str.charCodeAt(i);
    }
    return buffer;
}

function byteArrayToStr(arr) {
    return String.fromCharCode.apply(this, arr);
}

describe('shamirs', () => {
    describe('split()', () => {
        it('invalid', () => {
            const secret = strToByteArray('test');

            assert.throws(() => shamirs.split(secret, 0, 0));
            assert.throws(() => shamirs.split(secret, 2, 3));
            assert.throws(() => shamirs.split(secret, 1000, 3));
            assert.throws(() => shamirs.split(secret, 10, 1));
        });

        it('valid', () => {
            const secret = strToByteArray('test');

            const out = shamirs.split(secret, 5, 3);
            assert.lengthOf(out, 5);
            for (let part of out) {
                assert.lengthOf(part, secret.length + 1);
            }
        });
    });

    describe('combine()', () => {
        it('invalid', () => {
            // Not enough parts
            assert.throws(() => shamirs.combine([]));

            // Mis-match in length
            let parts = [
                strToByteArray('foo'),
                strToByteArray('ba'),
            ];
            assert.throws(() => shamirs.combine(parts));

            // Too short
            parts = [
                strToByteArray('f'),
                strToByteArray('b')
            ];
            assert.throws(() => shamirs.combine(parts));

            // Duplicate
            parts = [
                strToByteArray('foo'),
                strToByteArray('foo')
            ];
            assert.throws(() => shamirs.combine(parts));
        });

        it('valid', () => {
            const secret = strToByteArray('test');

            const out = shamirs.split(secret, 5, 3);

            // There is 5*4*3 possible choices,
            // we will just brute force try them all
            for (let i = 0; i < 5; i++) {
                for (let j = 0; j < 5; j++) {
                    if (j === i) {
                        continue;
                    }
                    for (let k = 0; k < 5; k++) {
                        if (k === i || k === j) {
                            continue;
                        }
                        const parts = [out[i], out[j], out[k]];
                        const recomb = shamirs.combine(parts);
                        assert.equal(byteArrayToStr(recomb), byteArrayToStr(secret));
                    }
                }
            }
        });
    });
});
