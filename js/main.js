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

function showSplitResults(shares) {
    const splitResults = document.querySelector('#split-results');
    while (splitResults.firstChild) {
        splitResults.removeChild(splitResults.firstChild);
    }

    splitResults.appendChild(document.createElement('hr'));
    for (let i = 0; i < shares.length; i++) {
        const shareBase64 = window.btoa(byteArrayToStr(shares[i]));

        const label = document.createElement('span');
        label.textContent = `Share ${i + 1}: `;

        const value = document.createElement('code');
        value.textContent = shareBase64;

        const element = document.createElement('p');
        element.appendChild(label);
        element.appendChild(value);

        splitResults.appendChild(element);
    }
}

function showCombineInputs(m) {
    const combineInputs = document.querySelector('#combine-inputs');
    while (m < combineInputs.childNodes.length) {
        combineInputs.removeChild(combineInputs.lastChild);
    }
    for (let i = combineInputs.childNodes.length; i < m; i++) {
        const label = document.createElement('label');
        label.setAttribute('for', `share-${i + 1}`);
        label.textContent = `Share ${i + 1}: `;

        const value = document.createElement('textarea');
        value.setAttribute('name', `share-${i + 1}`);
        value.setAttribute('rows', 1);

        const element = document.createElement('p');
        element.appendChild(label);
        element.appendChild(value);

        combineInputs.appendChild(element);
    }
}

function showCombineResult(secret) {
    const combineResult = document.querySelector('#combine-result');
    while (combineResult.firstChild) {
        combineResult.removeChild(combineResult.firstChild);
    }

    combineResult.appendChild(document.createElement('hr'));

    const label = document.createElement('span');
    label.textContent = `Secret: `;

    const value = document.createElement('code');
    value.textContent = byteArrayToStr(secret);

    const element = document.createElement('p');
    element.appendChild(label);
    element.appendChild(value);

    combineResult.appendChild(element);
}

window.addEventListener('load', () => {
    const splitForm = document.querySelector('#split-form');
    splitForm.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const n = Number.parseInt(splitForm.querySelector('input[name=n]').value);
        const m = Number.parseInt(splitForm.querySelector('input[name=m]').value);
        const secret = splitForm.querySelector('textarea[name=secret]').value;

        const shares = shamirs.split(strToByteArray(secret), n, m);
        showSplitResults(shares);
    });

    const combineForm = document.querySelector('#combine-form');

    const combineThreshold = combineForm.querySelector('input[name=m]');
    const updateCombineInputs = () => showCombineInputs(Number.parseInt(combineThreshold.value));
    combineThreshold.addEventListener('change', updateCombineInputs);
    updateCombineInputs();

    combineForm.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const m = Number.parseInt(combineForm.querySelector('input[name=m]').value);
        const shares = [];
        for (let i = 0; i < m; i++) {
            const shareBase64 = combineForm.querySelector(`textarea[name=share-${i + 1}]`).value;
            const share = strToByteArray(window.atob(shareBase64));
            shares.push(share);
        }

        const secret = shamirs.combine(shares);
        showCombineResult(secret);
    });
});
