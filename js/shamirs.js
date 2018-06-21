// Operations are not constant time, they may be vulnerable to timing attacks.
(function(window) {

    // Tables taken from http://www.samiam.org/galois.html
    // They use 0xe5 (229) as the generator

    // logTable provides the log(X)/log(g) at each index X
    const logTable = Uint8Array.from([
        0x00, 0xff, 0xc8, 0x08, 0x91, 0x10, 0xd0, 0x36,
        0x5a, 0x3e, 0xd8, 0x43, 0x99, 0x77, 0xfe, 0x18,
        0x23, 0x20, 0x07, 0x70, 0xa1, 0x6c, 0x0c, 0x7f,
        0x62, 0x8b, 0x40, 0x46, 0xc7, 0x4b, 0xe0, 0x0e,
        0xeb, 0x16, 0xe8, 0xad, 0xcf, 0xcd, 0x39, 0x53,
        0x6a, 0x27, 0x35, 0x93, 0xd4, 0x4e, 0x48, 0xc3,
        0x2b, 0x79, 0x54, 0x28, 0x09, 0x78, 0x0f, 0x21,
        0x90, 0x87, 0x14, 0x2a, 0xa9, 0x9c, 0xd6, 0x74,
        0xb4, 0x7c, 0xde, 0xed, 0xb1, 0x86, 0x76, 0xa4,
        0x98, 0xe2, 0x96, 0x8f, 0x02, 0x32, 0x1c, 0xc1,
        0x33, 0xee, 0xef, 0x81, 0xfd, 0x30, 0x5c, 0x13,
        0x9d, 0x29, 0x17, 0xc4, 0x11, 0x44, 0x8c, 0x80,
        0xf3, 0x73, 0x42, 0x1e, 0x1d, 0xb5, 0xf0, 0x12,
        0xd1, 0x5b, 0x41, 0xa2, 0xd7, 0x2c, 0xe9, 0xd5,
        0x59, 0xcb, 0x50, 0xa8, 0xdc, 0xfc, 0xf2, 0x56,
        0x72, 0xa6, 0x65, 0x2f, 0x9f, 0x9b, 0x3d, 0xba,
        0x7d, 0xc2, 0x45, 0x82, 0xa7, 0x57, 0xb6, 0xa3,
        0x7a, 0x75, 0x4f, 0xae, 0x3f, 0x37, 0x6d, 0x47,
        0x61, 0xbe, 0xab, 0xd3, 0x5f, 0xb0, 0x58, 0xaf,
        0xca, 0x5e, 0xfa, 0x85, 0xe4, 0x4d, 0x8a, 0x05,
        0xfb, 0x60, 0xb7, 0x7b, 0xb8, 0x26, 0x4a, 0x67,
        0xc6, 0x1a, 0xf8, 0x69, 0x25, 0xb3, 0xdb, 0xbd,
        0x66, 0xdd, 0xf1, 0xd2, 0xdf, 0x03, 0x8d, 0x34,
        0xd9, 0x92, 0x0d, 0x63, 0x55, 0xaa, 0x49, 0xec,
        0xbc, 0x95, 0x3c, 0x84, 0x0b, 0xf5, 0xe6, 0xe7,
        0xe5, 0xac, 0x7e, 0x6e, 0xb9, 0xf9, 0xda, 0x8e,
        0x9a, 0xc9, 0x24, 0xe1, 0x0a, 0x15, 0x6b, 0x3a,
        0xa0, 0x51, 0xf4, 0xea, 0xb2, 0x97, 0x9e, 0x5d,
        0x22, 0x88, 0x94, 0xce, 0x19, 0x01, 0x71, 0x4c,
        0xa5, 0xe3, 0xc5, 0x31, 0xbb, 0xcc, 0x1f, 0x2d,
        0x3b, 0x52, 0x6f, 0xf6, 0x2e, 0x89, 0xf7, 0xc0,
        0x68, 0x1b, 0x64, 0x04, 0x06, 0xbf, 0x83, 0x38,
    ]);

    // expTable provides the anti-log or exponentiation value
    // for the equivalent index
    const expTable = Uint8Array.from([
        0x01, 0xe5, 0x4c, 0xb5, 0xfb, 0x9f, 0xfc, 0x12,
        0x03, 0x34, 0xd4, 0xc4, 0x16, 0xba, 0x1f, 0x36,
        0x05, 0x5c, 0x67, 0x57, 0x3a, 0xd5, 0x21, 0x5a,
        0x0f, 0xe4, 0xa9, 0xf9, 0x4e, 0x64, 0x63, 0xee,
        0x11, 0x37, 0xe0, 0x10, 0xd2, 0xac, 0xa5, 0x29,
        0x33, 0x59, 0x3b, 0x30, 0x6d, 0xef, 0xf4, 0x7b,
        0x55, 0xeb, 0x4d, 0x50, 0xb7, 0x2a, 0x07, 0x8d,
        0xff, 0x26, 0xd7, 0xf0, 0xc2, 0x7e, 0x09, 0x8c,
        0x1a, 0x6a, 0x62, 0x0b, 0x5d, 0x82, 0x1b, 0x8f,
        0x2e, 0xbe, 0xa6, 0x1d, 0xe7, 0x9d, 0x2d, 0x8a,
        0x72, 0xd9, 0xf1, 0x27, 0x32, 0xbc, 0x77, 0x85,
        0x96, 0x70, 0x08, 0x69, 0x56, 0xdf, 0x99, 0x94,
        0xa1, 0x90, 0x18, 0xbb, 0xfa, 0x7a, 0xb0, 0xa7,
        0xf8, 0xab, 0x28, 0xd6, 0x15, 0x8e, 0xcb, 0xf2,
        0x13, 0xe6, 0x78, 0x61, 0x3f, 0x89, 0x46, 0x0d,
        0x35, 0x31, 0x88, 0xa3, 0x41, 0x80, 0xca, 0x17,
        0x5f, 0x53, 0x83, 0xfe, 0xc3, 0x9b, 0x45, 0x39,
        0xe1, 0xf5, 0x9e, 0x19, 0x5e, 0xb6, 0xcf, 0x4b,
        0x38, 0x04, 0xb9, 0x2b, 0xe2, 0xc1, 0x4a, 0xdd,
        0x48, 0x0c, 0xd0, 0x7d, 0x3d, 0x58, 0xde, 0x7c,
        0xd8, 0x14, 0x6b, 0x87, 0x47, 0xe8, 0x79, 0x84,
        0x73, 0x3c, 0xbd, 0x92, 0xc9, 0x23, 0x8b, 0x97,
        0x95, 0x44, 0xdc, 0xad, 0x40, 0x65, 0x86, 0xa2,
        0xa4, 0xcc, 0x7f, 0xec, 0xc0, 0xaf, 0x91, 0xfd,
        0xf7, 0x4f, 0x81, 0x2f, 0x5b, 0xea, 0xa8, 0x1c,
        0x02, 0xd1, 0x98, 0x71, 0xed, 0x25, 0xe3, 0x24,
        0x06, 0x68, 0xb3, 0x93, 0x2c, 0x6f, 0x3e, 0x6c,
        0x0a, 0xb8, 0xce, 0xae, 0x74, 0xb1, 0x42, 0xb4,
        0x1e, 0xd3, 0x49, 0xe9, 0x9c, 0xc8, 0xc6, 0xc7,
        0x22, 0x6e, 0xdb, 0x20, 0xbf, 0x43, 0x51, 0x52,
        0x66, 0xb2, 0x76, 0x60, 0xda, 0xc5, 0xf3, 0xf6,
        0xaa, 0xcd, 0x9a, 0xa0, 0x75, 0x54, 0x0e, 0x01,
    ]);

    // makePolynomial constructs a random polynomial of the given
    // degree but with the provided intercept value.
    function makePolynomial(intercept, degree) {
        const coefficients = new Uint8Array(degree + 1);

        // Assign random co-efficients to the polynomial
        window.crypto.getRandomValues(coefficients);

        // Ensure the intercept is set
        coefficients[0] = intercept;

        return coefficients;
    }

    // evaluate returns the value of the polynomial for the given x
    function evaluatePolynomial(coefficients, x) {
        // Special case the origin
        if (x === 0) {
            return coefficients[0];
        }

        // Compute the polynomial value using Horner's method.
        const degree = coefficients.length - 1;
        let out = coefficients[degree];
        for (let i = degree - 1; i >= 0; i--) {
            const coeff = coefficients[i];
            out = add(mult(out, x), coeff);
        }
        return out;
    }

    // interpolatePolynomial takes N sample points and returns
    // the value at a given x using a lagrange interpolation.
    function interpolatePolynomial(xSamples, ySamples, x) {
        const limit = xSamples.length;
        let result = 0;
        for (let i = 0; i < limit; i++) {
            let basis = 1;
            for (let j = 0; j < limit; j++) {
                if (i == j) {
                    continue;
                }
                const num = add(x, xSamples[j]);
                const denom = add(xSamples[i], xSamples[j]);
                const term = div(num, denom);
                basis = mult(basis, term);
            }
            const group = mult(ySamples[i], basis);
		    result = add(result, group);
	    }
	    return result;
    }

    // div divides two numbers in GF(2^8)
    function div(a, b) {
        if (b === 0) {
            throw new Error("divide by zero");
        }
        if (a === 0) {
            return 0;
        }
        return expTable[(logTable[a] - logTable[b] + 255) % 255];
    }

    // mult multiplies two numbers in GF(2^8)
    function mult(a, b) {
        if (a === 0 || b === 0) {
            return 0;
        }
        return expTable[(logTable[a] + logTable[b]) % 255];
    }

    // add combines two numbers in GF(2^8)
    // This can also be used for subtraction since it is symmetric.
    function add(a, b) {
        return a ^ b;
    }

    // Split takes an arbitrarily long secret and generates a `parts`
    // number of shares, `threshold` of which are required to reconstruct
    // the secret. The parts and threshold must be at least 2, and less
    // than 256. The returned shares are each one byte longer than the secret
    // as they attach a tag used to reconstruct the secret.
    function split(secret, parts, threshold) {
        // Sanity check the input
        if (parts < threshold) {
            throw new Error("parts cannot be less than threshold");
        }
        if (parts > 255) {
            throw new Error("parts cannot exceed 255");
        }
        if (threshold < 2) {
            throw new Error("threshold must be at least 2");
        }
        if (threshold > 255) {
            throw new Error("threshold cannot exceed 255");
        }
        if (secret.length === 0) {
            throw new Error("cannot split an empty secret");
        }

        // Generate random list of x coordinates
        const xCoordinates = Uint8Array.from({length: 255}, (_, i) => i);
        permute(xCoordinates, parts);

        // Allocate the output array, initialize the final byte
        // of the output with the offset. The representation of each
        // output is {y1, y2, .., yN, x}.
        const out = [];
        for (let i = 0; i < parts; i++) {
            const share = new Uint8Array(secret.length + 1);
            share[secret.length] = xCoordinates[i] + 1;
            out.push(share);
        }

        // Construct a random polynomial for each byte of the secret.
        // Because we are using a field of size 256, we can only represent
        // a single byte as the intercept of the polynomial, so we must
        // use a new polynomial for each byte.
        for (let idx = 0; idx < secret.length; idx++) {
            const val = secret[idx];
            const coefficients = makePolynomial(val, threshold-1);

            // Generate a `parts` number of (x,y) pairs
		    // We cheat by encoding the x value once as the final index,
		    // so that it only needs to be stored once.
		    for (let i = 0; i < parts; i++) {
			    const x = xCoordinates[i] + 1;
			    const y = evaluatePolynomial(coefficients, x);
			    out[i][idx] = y;
		    }
	    }

	    // Return the encoded secrets
	    return out;
    }

    // Combine is used to reverse a Split and reconstruct a secret
    // once a `threshold` number of parts are available.
    function combine(parts) {
        // Verify enough parts provided
        if (parts.length < 2) {
            throw new Error("less than two parts cannot be used to reconstruct the secret");
        }

        // Verify the parts are all the same length
        const firstPartLen = parts[0].length;
        if (firstPartLen < 2) {
            throw new Error("parts must be at least two bytes");
        }
        for (let i = 1; i < parts.length; i++) {
            if (parts[i].length !== firstPartLen) {
                throw new Error("all parts must be the same length");
            }
        }

        // Create a buffer to store the reconstructed secret
        const secret = new Uint8Array(firstPartLen-1);

        // Buffer to store the samples
        const xSamples = new Uint8Array(parts.length);
        const ySamples = new Uint8Array(parts.length);

        // Set the x value for each sample and ensure no x_sample values are the same,
        // otherwise div() can be unhappy
        const checkMap = new Set();
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const samp = part[firstPartLen-1];
            if (checkMap.has(samp)) {
                throw new Error("duplicate part detected");
            }
            checkMap.add(samp);
            xSamples[i] = samp;
        }

        // Reconstruct each byte
        for (let idx = 0; idx < secret.length; idx++) {
            // Set the y value for each sample
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                ySamples[i] = part[idx];
            }

            // Interpolate the polynomial and compute the value at 0
		    const val = interpolatePolynomial(xSamples, ySamples, 0);

		    // Evaluate the 0th value to get the intercept
		    secret[idx] = val;
	    }
	    return secret;
    }

    function permute(arr, n) {
        for (let i = 0; i < arr.length; i++) {
            const j = i + Math.floor(Math.random() * (arr.length - i));
            const tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
        }
    }

    window.shamirs = {
        split: split,
        combine: combine
    };

})(window);
