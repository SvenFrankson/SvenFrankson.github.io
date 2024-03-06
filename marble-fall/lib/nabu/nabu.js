var Nabu;
(function (Nabu) {
    async function Wait(frames = 1) {
        return new Promise(resolve => {
            let check = () => {
                if (frames <= 0) {
                    resolve();
                    return;
                }
                else {
                    frames--;
                    requestAnimationFrame(check);
                }
            };
            check();
        });
    }
    Nabu.Wait = Wait;
})(Nabu || (Nabu = {}));
var Nabu;
(function (Nabu) {
    function Compress(data) {
        let out = [];
        let lastD;
        let count;
        for (let i = 0; i < data.length; i++) {
            let d = data[i];
            if (d === lastD) {
                count++;
                if (count > 255) {
                    out.push(255, lastD);
                    count = 1;
                }
            }
            else {
                if (isFinite(lastD)) {
                    out.push(count, lastD);
                }
                lastD = d;
                count = 1;
            }
        }
        if (isFinite(lastD)) {
            out.push(count, lastD);
        }
        return new Uint8Array(out);
    }
    Nabu.Compress = Compress;
    function Decompress(data) {
        let out = [];
        for (let i = 0; i < data.length / 2; i++) {
            let count = data[2 * i];
            let d = data[2 * i + 1];
            for (let n = 0; n < count; n++) {
                out.push(d);
            }
        }
        return new Uint8Array(out);
    }
    Nabu.Decompress = Decompress;
})(Nabu || (Nabu = {}));
// Code by Andrey Sitnik and Ivan Solovev https://github.com/ai/easings.net
var Nabu;
(function (Nabu) {
    class Easing {
        static easeInSquare(x) {
            return x * x;
        }
        static easeOutSquare(x) {
            return 1 - (1 - x) * (1 - x);
        }
        static easeInCubic(x) {
            return x * x * x;
        }
        static easeOutCubic(x) {
            return 1 - Math.pow(1 - x, 3);
        }
        static easeInOutSine(x) {
            return -(Math.cos(Math.PI * x) - 1) / 2;
        }
        static easeOutElastic(x) {
            const c4 = (2 * Math.PI) / 3;
            return x === 0
                ? 0
                : x === 1
                    ? 1
                    : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
        }
        static easeInOutBack(x) {
            const c1 = 1.70158;
            const c2 = c1 * 1.525;
            return x < 0.5
                ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
                : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
        }
        static smooth010Sec(fps) {
            if (fps < 13) {
                return 0;
            }
            return 1 - 1 / (0.08 * fps);
        }
        static smooth025Sec(fps) {
            if (fps < 8) {
                return 0;
            }
            return 1 - 1 / (0.13 * fps);
        }
        static smooth05Sec(fps) {
            if (fps < 4) {
                return 0;
            }
            return 1 - 1 / (0.25 * fps);
        }
        static smooth1Sec(fps) {
            if (fps < 2.25) {
                return 0;
            }
            return 1 - 1 / (0.45 * fps);
        }
        static smooth2Sec(fps) {
            if (fps < 1.2) {
                return 0;
            }
            return 1 - 1 / (0.9 * fps);
        }
        static smooth3Sec(fps) {
            if (fps < 1) {
                return 0;
            }
            return 1 - 1 / (1.35 * fps);
        }
    }
    Nabu.Easing = Easing;
})(Nabu || (Nabu = {}));
var Nabu;
(function (Nabu) {
    function download(filename, text) {
        var e = document.createElement('a');
        e.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        e.setAttribute('download', filename);
        e.style.display = 'none';
        document.body.appendChild(e);
        e.click();
        document.body.removeChild(e);
    }
    Nabu.download = download;
})(Nabu || (Nabu = {}));
var Nabu;
(function (Nabu) {
    var Pow2Values = [];
    for (let i = 0; i < 20; i++) {
        Pow2Values[i] = Math.pow(2, i);
    }
    function MinMax(n, min, max) {
        return Math.min(Math.max(n, min), max);
    }
    Nabu.MinMax = MinMax;
    function Pow2(n) {
        return Pow2Values[n];
    }
    Nabu.Pow2 = Pow2;
    function FloorPow2Exponent(n) {
        let exponent = 0;
        while (Pow2Values[exponent] < n) {
            exponent++;
        }
        return exponent;
    }
    Nabu.FloorPow2Exponent = FloorPow2Exponent;
    function CeilPow2Exponent(n) {
        let exponent = 0;
        while (Pow2Values[exponent] < n) {
            exponent++;
        }
        return exponent + 1;
    }
    Nabu.CeilPow2Exponent = CeilPow2Exponent;
    function Step(from, to, step) {
        if (Math.abs(from - to) <= step) {
            return to;
        }
        if (to < from) {
            step *= -1;
        }
        return from + step;
    }
    Nabu.Step = Step;
    function StepAngle(from, to, step) {
        while (from < 0) {
            from += 2 * Math.PI;
        }
        while (to < 0) {
            to += 2 * Math.PI;
        }
        while (from >= 2 * Math.PI) {
            from -= 2 * Math.PI;
        }
        while (to >= 2 * Math.PI) {
            to -= 2 * Math.PI;
        }
        if (Math.abs(from - to) <= step) {
            return to;
        }
        if (to < from) {
            step *= -1;
        }
        if (Math.abs(from - to) > Math.PI) {
            step *= -1;
        }
        return from + step;
    }
    Nabu.StepAngle = StepAngle;
    function LerpAngle(from, to, t) {
        while (from < 0) {
            from += 2 * Math.PI;
        }
        while (to < 0) {
            to += 2 * Math.PI;
        }
        while (from >= 2 * Math.PI) {
            from -= 2 * Math.PI;
        }
        while (to >= 2 * Math.PI) {
            to -= 2 * Math.PI;
        }
        if (Math.abs(from - to) > Math.PI) {
            if (from > Math.PI) {
                from -= 2 * Math.PI;
            }
            else {
                to -= 2 * Math.PI;
            }
        }
        return from * (1 - t) + to * t;
    }
    Nabu.LerpAngle = LerpAngle;
    function AngularDistance(from, to) {
        while (from < 0) {
            from += 2 * Math.PI;
        }
        while (to < 0) {
            to += 2 * Math.PI;
        }
        while (from >= 2 * Math.PI) {
            from -= 2 * Math.PI;
        }
        while (to >= 2 * Math.PI) {
            to -= 2 * Math.PI;
        }
        let d = Math.abs(from - to);
        if (d > Math.PI) {
            d *= -1;
        }
        if (to < from) {
            d *= -1;
        }
        return d;
    }
    Nabu.AngularDistance = AngularDistance;
})(Nabu || (Nabu = {}));
var Nabu;
(function (Nabu) {
    class OctreeNode {
        constructor(arg1) {
            this.degree = 3;
            this.i = 0;
            this.j = 0;
            this.k = 0;
            if (arg1 instanceof OctreeNode) {
                this.parent = arg1;
                this.degree = arg1.degree - 1;
            }
            else if (isFinite(arg1)) {
                this.degree = arg1;
            }
            this.size = Nabu.Pow2(this.degree);
        }
        forEach(callback) {
            this.forEachNode((node) => {
                for (let n = 0; n < 8; n++) {
                    let child = node.children[n];
                    if (child != undefined) {
                        if (!(child instanceof OctreeNode)) {
                            let ijk = OctreeNode.NToIJK[n];
                            let I = 2 * node.i + ijk.i;
                            let J = 2 * node.j + ijk.j;
                            let K = 2 * node.k + ijk.k;
                            let S = node.size * 0.5;
                            for (let ii = 0; ii < S; ii++) {
                                for (let jj = 0; jj < S; jj++) {
                                    for (let kk = 0; kk < S; kk++) {
                                        callback(child, S * I + ii, S * J + jj, S * K + kk);
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }
        forEachNode(callback) {
            callback(this);
            for (let n = 0; n < 8; n++) {
                let child = this.children[n];
                if (child instanceof OctreeNode) {
                    child.forEachNode(callback);
                }
            }
        }
        collapse() {
            if (this.children != undefined) {
                let first = this.children[0];
                for (let i = 1; i < 8; i++) {
                    if (this.children[i] != first) {
                        return;
                    }
                }
                let index = this.parent.children.indexOf(this);
                this.parent.children[index] = first;
                this.parent.collapse();
            }
        }
        _getChild(ii, jj, kk) {
            if (this.children) {
                return this.children[4 * ii + 2 * jj + kk];
            }
        }
        _setChild(child, ii, jj, kk) {
            if (this.children === undefined) {
                this.children = [];
            }
            if (child instanceof OctreeNode) {
                child.i = 2 * this.i + ii;
                child.j = 2 * this.j + jj;
                child.k = 2 * this.k + kk;
            }
            this.children[4 * ii + 2 * jj + kk] = child;
        }
        _setNthChild(child, n) {
            if (this.children === undefined) {
                this.children = [];
            }
            if (child instanceof OctreeNode) {
                let k = n % 2;
                let j = ((n - k) / 2) % 2;
                let i = ((n - 2 * j - k) / 4);
                child.i = 2 * this.i + i;
                child.j = 2 * this.j + j;
                child.k = 2 * this.k + k;
            }
            this.children[n] = child;
        }
        get(i, j, k) {
            if (!this.children) {
                return undefined;
            }
            let ii = Math.floor((i - this.size * this.i) / (this.size / 2));
            let jj = Math.floor((j - this.size * this.j) / (this.size / 2));
            let kk = Math.floor((k - this.size * this.k) / (this.size / 2));
            let child = this._getChild(ii, jj, kk);
            if (!child) {
                return undefined;
            }
            else if (child instanceof OctreeNode) {
                return child.get(i, j, k);
            }
            else {
                return child;
            }
        }
        set(v, i, j, k) {
            let ii = Math.floor((i - this.size * this.i) / (this.size / 2));
            let jj = Math.floor((j - this.size * this.j) / (this.size / 2));
            let kk = Math.floor((k - this.size * this.k) / (this.size / 2));
            if (this.degree === 1) {
                this._setChild(v, ii, jj, kk);
                this.collapse();
            }
            else {
                let childOctree = this._getChild(ii, jj, kk);
                if (!childOctree) {
                    childOctree = new OctreeNode(this);
                    this._setChild(childOctree, ii, jj, kk);
                }
                else if (!(childOctree instanceof OctreeNode)) {
                    let oldV = childOctree;
                    childOctree = new OctreeNode(this);
                    childOctree.children = [oldV, oldV, oldV, oldV, oldV, oldV, oldV, oldV];
                    this._setChild(childOctree, ii, jj, kk);
                }
                childOctree.set(v, i, j, k);
            }
        }
        serializeToString() {
            let output = this.serialize();
            let compressedOutput = output.reduce((prev, curr) => { return prev + "#" + curr; });
            let l1 = compressedOutput.length;
            compressedOutput = compressedOutput.replaceAll("________", "H");
            compressedOutput = compressedOutput.replaceAll("_______", "G");
            compressedOutput = compressedOutput.replaceAll("______", "F");
            compressedOutput = compressedOutput.replaceAll("_____", "E");
            compressedOutput = compressedOutput.replaceAll("____", "D");
            compressedOutput = compressedOutput.replaceAll("___", "C");
            compressedOutput = compressedOutput.replaceAll("__", "B");
            //compressedOutput = compressedOutput.replaceAll("_", "A");
            compressedOutput = compressedOutput.replaceAll("........", "P");
            compressedOutput = compressedOutput.replaceAll(".......", "O");
            compressedOutput = compressedOutput.replaceAll("......", "N");
            compressedOutput = compressedOutput.replaceAll(".....", "M");
            compressedOutput = compressedOutput.replaceAll("....", "L");
            compressedOutput = compressedOutput.replaceAll("...", "K");
            compressedOutput = compressedOutput.replaceAll("..", "J");
            //compressedOutput = compressedOutput.replaceAll(".", "I");
            let l2 = compressedOutput.length;
            //console.log("Compression rate " + ((l2 / l1) * 100).toFixed(0) + "%");
            return compressedOutput;
        }
        serialize(output) {
            if (!output) {
                output = [];
                output[0] = this.degree.toFixed(0);
            }
            if (!output[this.degree]) {
                output[this.degree] = "";
            }
            for (let n = 0; n < 8; n++) {
                let child = this.children[n];
                if (child === undefined) {
                    output[this.degree] += "_";
                }
                else if (child instanceof OctreeNode) {
                    output[this.degree] += ".";
                    child.serialize(output);
                }
                else {
                    output[this.degree] += child.toString().padStart(1, "0");
                }
            }
            return output;
        }
        static DeserializeFromString(strInput) {
            let deCompressedInput = strInput;
            deCompressedInput = deCompressedInput.replaceAll("H", "________");
            deCompressedInput = deCompressedInput.replaceAll("G", "_______");
            deCompressedInput = deCompressedInput.replaceAll("F", "______");
            deCompressedInput = deCompressedInput.replaceAll("E", "_____");
            deCompressedInput = deCompressedInput.replaceAll("D", "____");
            deCompressedInput = deCompressedInput.replaceAll("C", "___");
            deCompressedInput = deCompressedInput.replaceAll("B", "__");
            deCompressedInput = deCompressedInput.replaceAll("A", "_");
            deCompressedInput = deCompressedInput.replaceAll("P", "........");
            deCompressedInput = deCompressedInput.replaceAll("O", ".......");
            deCompressedInput = deCompressedInput.replaceAll("N", "......");
            deCompressedInput = deCompressedInput.replaceAll("M", ".....");
            deCompressedInput = deCompressedInput.replaceAll("L", "....");
            deCompressedInput = deCompressedInput.replaceAll("K", "...");
            deCompressedInput = deCompressedInput.replaceAll("J", "..");
            deCompressedInput = deCompressedInput.replaceAll("I", ".");
            let input = deCompressedInput.split("#");
            return OctreeNode.Deserialize(input);
        }
        static Deserialize(input) {
            let dMax = parseInt(input[0]);
            let rootNode = new OctreeNode(dMax);
            let previousDegreeNodes = [rootNode];
            for (let d = dMax; d > 0; d--) {
                let currentDegreeNodes = [];
                let cursor = 0;
                while (previousDegreeNodes.length > 0) {
                    let node = previousDegreeNodes.splice(0, 1)[0];
                    let n = 0;
                    while (n < 8) {
                        let c = input[d][cursor];
                        if (c === "_") {
                            cursor++;
                        }
                        else if (c === ".") {
                            let newNode = new OctreeNode(node);
                            currentDegreeNodes.push(newNode);
                            node._setNthChild(newNode, n);
                            cursor++;
                        }
                        else {
                            let v = parseInt(input[d].substring(cursor, cursor + 1));
                            if (isNaN(v)) {
                                return undefined;
                            }
                            cursor += 1;
                            node._setNthChild(v, n);
                        }
                        n++;
                    }
                }
                previousDegreeNodes = currentDegreeNodes;
            }
            return rootNode;
        }
    }
    OctreeNode.NToIJK = [
        { i: 0, j: 0, k: 0 },
        { i: 0, j: 0, k: 1 },
        { i: 0, j: 1, k: 0 },
        { i: 0, j: 1, k: 1 },
        { i: 1, j: 0, k: 0 },
        { i: 1, j: 0, k: 1 },
        { i: 1, j: 1, k: 0 },
        { i: 1, j: 1, k: 1 }
    ];
    Nabu.OctreeNode = OctreeNode;
})(Nabu || (Nabu = {}));
var Nabu;
(function (Nabu) {
    class UniqueList {
        constructor() {
            this._elements = [];
        }
        get length() {
            return this._elements.length;
        }
        get(i) {
            return this._elements[i];
        }
        getLast() {
            return this.get(this.length - 1);
        }
        indexOf(e) {
            return this._elements.indexOf(e);
        }
        push(...elements) {
            elements.forEach((e) => {
                if (this._elements.indexOf(e) === -1) {
                    this._elements.push(e);
                }
            });
        }
        remove(e) {
            let i = this._elements.indexOf(e);
            if (i != -1) {
                this._elements.splice(i, 1);
                return e;
            }
            return undefined;
        }
        removeAt(i) {
            if (i >= 0 && i < this._elements.length) {
                let e = this._elements.splice(i, 1);
                return e[0];
            }
        }
        contains(e) {
            return this._elements.indexOf(e) != -1;
        }
        forEach(callback) {
            this._elements.forEach(e => {
                callback(e);
            });
        }
        sort(callback) {
            this._elements = this._elements.sort(callback);
        }
        cloneAsArray() {
            return [...this._elements];
        }
    }
    Nabu.UniqueList = UniqueList;
})(Nabu || (Nabu = {}));
var Nabu;
(function (Nabu) {
    class InputNumber extends HTMLElement {
        constructor() {
            super(...arguments);
            this._decimals = 3;
            this._step = 0.005;
            this._n = 0;
            this._update = () => {
                if (!this.isConnected) {
                    clearInterval(this._updateInterval);
                }
            };
            this._initialized = false;
            this._onInputCallback = () => {
                this._n = parseFloat(this._nElement.value);
                if (this.onInputNCallback) {
                    this.onInputNCallback(this._n);
                }
            };
        }
        static get observedAttributes() {
            return [
                "decimals",
                "step"
            ];
        }
        connectedCallback() {
            this.initialize();
            this._updateInterval = setInterval(this._update, 100);
        }
        attributeChangedCallback(name, oldValue, newValue) {
            if (this._initialized) {
                if (name === "decimals") {
                    let value = parseInt(newValue);
                    if (isFinite(value)) {
                        this._decimals = value;
                    }
                    if (this._nElement) {
                        this._setValueProps(this._nElement);
                        this.setValue(this._n);
                    }
                }
                if (name === "step") {
                    let value = parseFloat(newValue);
                    if (isFinite(value)) {
                        this._step = value;
                    }
                    if (this._nElement) {
                        this._setValueProps(this._nElement);
                    }
                }
            }
        }
        _setValueProps(e) {
            e.setAttribute("type", "number");
            e.setAttribute("step", this._step.toFixed(this._decimals));
            e.addEventListener("input", this._onInputCallback);
            e.classList.add("input-vec3-value");
            e.style.display = "inline-block";
            e.style.width = "90%";
        }
        initialize() {
            if (!this._initialized) {
                this.style.display = "inline-block";
                this.style.textAlign = "center";
                this._nElement = document.createElement("input");
                this._setValueProps(this._nElement);
                this.appendChild(this._nElement);
                this._initialized = true;
                for (let i = 0; i < Nabu.DebugDisplayVector3Value.observedAttributes.length; i++) {
                    let name = Nabu.DebugDisplayVector3Value.observedAttributes[i];
                    let value = this.getAttribute(name);
                    this.attributeChangedCallback(name, value + "_forceupdate", value);
                }
            }
        }
        setValue(n) {
            if (isFinite(n)) {
                this._n = n;
            }
            this._nElement.value = this._n.toFixed(this._decimals);
        }
    }
    Nabu.InputNumber = InputNumber;
    customElements.define("input-number", InputNumber);
})(Nabu || (Nabu = {}));
var Nabu;
(function (Nabu) {
    class InputVector3 extends HTMLElement {
        constructor() {
            super(...arguments);
            this._useIJK = false;
            this._decimals = 4;
            this._x = 0;
            this._y = 0;
            this._z = 0;
            this._update = () => {
                if (!this.isConnected) {
                    clearInterval(this._updateInterval);
                }
                if (this.targetXYZ && (this.targetXYZ.x != this._x || this.targetXYZ.y != this._y || this.targetXYZ.z != this._z)) {
                    this._x = this.targetXYZ.x;
                    this._y = this.targetXYZ.y;
                    this._z = this.targetXYZ.z;
                    this.setValue(this.targetXYZ);
                }
            };
            this._initialized = false;
            this._onInputCallback = () => {
                this._x = parseFloat(this._xElement.value);
                this._y = parseFloat(this._yElement.value);
                this._z = parseFloat(this._zElement.value);
                if (this.targetXYZ) {
                    this.targetXYZ.x = this._x;
                    this.targetXYZ.y = this._y;
                    this.targetXYZ.z = this._z;
                }
                if (this.onInputXYZCallback) {
                    this.onInputXYZCallback({
                        x: this._x,
                        y: this._y,
                        z: this._z
                    });
                }
            };
        }
        static get observedAttributes() {
            return [
                "label",
                "useIJK",
                "decimals"
            ];
        }
        connectedCallback() {
            this.initialize();
            this._updateInterval = setInterval(this._update, 100);
        }
        attributeChangedCallback(name, oldValue, newValue) {
            if (this._initialized) {
                if (name === "useIJK") {
                    this._useIJK = newValue === "true" ? true : false;
                    if (this._useIJK) {
                        this._xLabelElement.textContent = "i";
                        this._yLabelElement.textContent = "j";
                        this._zLabelElement.textContent = "k";
                    }
                    else {
                        this._xLabelElement.textContent = "x";
                        this._yLabelElement.textContent = "y";
                        this._zLabelElement.textContent = "z";
                    }
                }
                if (name === "decimals") {
                    let value = parseInt(newValue);
                    if (isFinite(value)) {
                        this._decimals = value;
                    }
                    this.setValue({
                        x: this._x,
                        y: this._y,
                        z: this._z
                    });
                }
            }
        }
        _setLabelProps(e) {
            e.classList.add("input-vec3-label");
            e.style.display = "inline-block";
            e.style.textAlign = "center";
            e.style.width = "18px";
        }
        _setValueProps(e) {
            e.setAttribute("type", "number");
            e.setAttribute("step", "0.0002");
            e.addEventListener("input", this._onInputCallback);
            e.classList.add("input-vec3-value");
            e.style.display = "inline-block";
            e.style.width = "24%";
        }
        initialize() {
            if (!this._initialized) {
                this.style.display = "inline-block";
                this._xLabelElement = document.createElement("span");
                this._setLabelProps(this._xLabelElement);
                this.appendChild(this._xLabelElement);
                this._xElement = document.createElement("input");
                this._setValueProps(this._xElement);
                this.appendChild(this._xElement);
                this._yLabelElement = document.createElement("span");
                this._setLabelProps(this._yLabelElement);
                this.appendChild(this._yLabelElement);
                this._yElement = document.createElement("input");
                this._setValueProps(this._yElement);
                this.appendChild(this._yElement);
                this._zLabelElement = document.createElement("span");
                this._setLabelProps(this._zLabelElement);
                this.appendChild(this._zLabelElement);
                this._zElement = document.createElement("input");
                this._setValueProps(this._zElement);
                this.appendChild(this._zElement);
                this._initialized = true;
                for (let i = 0; i < Nabu.DebugDisplayVector3Value.observedAttributes.length; i++) {
                    let name = Nabu.DebugDisplayVector3Value.observedAttributes[i];
                    let value = this.getAttribute(name);
                    this.attributeChangedCallback(name, value + "_forceupdate", value);
                }
            }
        }
        setValue(vec3, j, k) {
            if (isFinite(j) && isFinite(k)) {
                this._x = vec3;
                this._y = j;
                this._z = k;
            }
            else {
                this._x = isFinite(vec3.x) ? vec3.x : vec3.i;
                this._y = isFinite(vec3.y) ? vec3.y : vec3.j;
                this._z = isFinite(vec3.z) ? vec3.z : vec3.k;
            }
            this._xElement.value = this._x.toFixed(this._decimals);
            this._yElement.value = this._y.toFixed(this._decimals);
            this._zElement.value = this._z.toFixed(this._decimals);
        }
    }
    Nabu.InputVector3 = InputVector3;
    customElements.define("input-vec3", InputVector3);
})(Nabu || (Nabu = {}));
var Nabu;
(function (Nabu) {
    class DebugDisplayColorInput extends HTMLElement {
        constructor() {
            super(...arguments);
            this._initialized = false;
            this._onInput = () => {
                this._colorFloat.innerText = this._colorInput.value;
                if (this.onInput) {
                    this.onInput(this._colorInput.value);
                }
            };
        }
        static get observedAttributes() {
            return [
                "label"
            ];
        }
        connectedCallback() {
            this.initialize();
            this.style.display = "block";
            this.style.width = "100%";
            this.style.marginLeft = "auto";
            this.style.marginBottom = "5px";
        }
        attributeChangedCallback(name, oldValue, newValue) {
            if (this._initialized) {
                if (name === "label") {
                    this._label = newValue;
                    this._labelElement.textContent = this._label;
                }
            }
        }
        initialize() {
            if (!this._initialized) {
                this.style.position = "relative";
                this._labelElement = document.createElement("div");
                this._labelElement.style.display = "inline-block";
                this._labelElement.style.width = "33%";
                this._labelElement.style.marginRight = "2%";
                this.appendChild(this._labelElement);
                this._colorInput = document.createElement("input");
                this._colorInput.setAttribute("type", "color");
                this._colorInput.style.display = "inline-block";
                this._colorInput.style.verticalAlign = "middle";
                this._colorInput.style.width = "65%";
                this.appendChild(this._colorInput);
                this._colorInput.oninput = this._onInput;
                this._colorFloat = document.createElement("span");
                this._colorFloat.innerText = "0.324, 0.123, 0.859";
                this._colorFloat.style.display = "block";
                this._colorFloat.style.verticalAlign = "middle";
                this._colorFloat.style.width = "100%";
                this._colorFloat.style.userSelect = "none";
                this._colorFloat.innerText = this._colorInput.value;
                this._colorFloat.onclick = () => {
                    navigator.clipboard.writeText(this._colorFloat.innerText);
                };
                this.appendChild(this._colorFloat);
                this._initialized = true;
                for (let i = 0; i < Nabu.DebugDisplayFrameValue.observedAttributes.length; i++) {
                    let name = Nabu.DebugDisplayFrameValue.observedAttributes[i];
                    let value = this.getAttribute(name);
                    this.attributeChangedCallback(name, value + "_forceupdate", value);
                }
            }
        }
        setColor(hexColor) {
            this._colorInput.value = hexColor;
            this._colorFloat.innerText = this._colorInput.value;
        }
    }
    Nabu.DebugDisplayColorInput = DebugDisplayColorInput;
    customElements.define("debug-display-color-input", DebugDisplayColorInput);
})(Nabu || (Nabu = {}));
var Nabu;
(function (Nabu) {
    class DebugDisplayFrameValue extends HTMLElement {
        constructor() {
            super(...arguments);
            this.size = 2;
            this.frameCount = 300;
            this._minValue = 0;
            this._maxValue = 100;
            this._values = [];
            this._initialized = false;
        }
        static get observedAttributes() {
            return [
                "label",
                "min",
                "max"
            ];
        }
        connectedCallback() {
            this.initialize();
            this.style.display = "block";
            this.style.width = "100%";
            this.style.marginLeft = "auto";
            this.style.marginBottom = "5px";
        }
        attributeChangedCallback(name, oldValue, newValue) {
            if (this._initialized) {
                if (name === "min") {
                    let v = parseFloat(newValue);
                    if (isFinite(v)) {
                        this._minValue = v;
                        this._minElement.textContent = this._minValue.toFixed(0);
                    }
                }
                if (name === "max") {
                    let v = parseFloat(newValue);
                    if (isFinite(v)) {
                        this._maxValue = v;
                        this._maxElement.textContent = this._maxValue.toFixed(0);
                    }
                }
                if (name === "label") {
                    this._label = newValue;
                    this._labelElement.textContent = this._label;
                }
            }
        }
        initialize() {
            if (!this._initialized) {
                this.style.position = "relative";
                this._labelElement = document.createElement("div");
                this._labelElement.style.display = "inline-block";
                this._labelElement.style.width = "33%";
                this._labelElement.style.marginRight = "2%";
                this.appendChild(this._labelElement);
                this._minElement = document.createElement("span");
                this._minElement.style.position = "absolute";
                this._minElement.style.bottom = "0%";
                this._minElement.style.right = "1%";
                this._minElement.style.fontSize = "80%";
                this.appendChild(this._minElement);
                this._maxElement = document.createElement("span");
                this._maxElement.style.position = "absolute";
                this._maxElement.style.top = "0%";
                this._maxElement.style.right = "1%";
                this._maxElement.style.fontSize = "80%";
                this.appendChild(this._maxElement);
                let container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                container.style.display = "inline-block";
                container.style.verticalAlign = "middle";
                container.style.width = "57%";
                container.style.marginRight = "8%";
                container.setAttribute("viewBox", "0 0 600 100");
                this.appendChild(container);
                this._valuesElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
                this._valuesElement.setAttribute("stroke", "#00FF00");
                this._valuesElement.setAttribute("stroke-width", "2");
                container.appendChild(this._valuesElement);
                this._initialized = true;
                for (let i = 0; i < DebugDisplayFrameValue.observedAttributes.length; i++) {
                    let name = DebugDisplayFrameValue.observedAttributes[i];
                    let value = this.getAttribute(name);
                    this.attributeChangedCallback(name, value + "_forceupdate", value);
                }
            }
        }
        _redraw() {
            let d = "";
            for (let i = 0; i < this._values.length; i++) {
                let x = (i * this.size).toFixed(1);
                d += "M" + x + " 100 L" + x + " " + (100 - (this._values[i] - this._minValue) / (this._maxValue - this._minValue) * 100).toFixed(1) + " ";
            }
            this._valuesElement.setAttribute("d", d);
        }
        addValue(v) {
            if (isFinite(v)) {
                this._values.push(v);
                while (this._values.length > this.frameCount) {
                    this._values.splice(0, 1);
                }
                this._redraw();
            }
        }
    }
    Nabu.DebugDisplayFrameValue = DebugDisplayFrameValue;
    customElements.define("debug-display-frame-value", DebugDisplayFrameValue);
})(Nabu || (Nabu = {}));
var Nabu;
(function (Nabu) {
    class DebugDisplayTextValue extends HTMLElement {
        constructor() {
            super(...arguments);
            this._label = "";
            this._initialized = false;
        }
        static get observedAttributes() {
            return [
                "label"
            ];
        }
        connectedCallback() {
            this.initialize();
            this.style.display = "block";
            this.style.width = "100%";
            this.style.marginLeft = "auto";
            this.style.marginBottom = "5px";
        }
        attributeChangedCallback(name, oldValue, newValue) {
            if (this._initialized) {
                if (name === "label") {
                    this._label = newValue;
                    this._labelElement.textContent = this._label;
                }
            }
        }
        initialize() {
            if (!this._initialized) {
                this.style.position = "relative";
                this._labelElement = document.createElement("div");
                this._labelElement.style.display = "inline-block";
                this._labelElement.style.width = "33%";
                this._labelElement.style.marginRight = "2%";
                this.appendChild(this._labelElement);
                this._textElement = document.createElement("div");
                this._textElement.style.display = "inline-block";
                this._textElement.style.marginLeft = "5%";
                this._textElement.style.width = "60%";
                this._textElement.style.textAlign = "left";
                this.appendChild(this._textElement);
                this._initialized = true;
                for (let i = 0; i < DebugDisplayTextValue.observedAttributes.length; i++) {
                    let name = DebugDisplayTextValue.observedAttributes[i];
                    let value = this.getAttribute(name);
                    this.attributeChangedCallback(name, value + "_forceupdate", value);
                }
            }
        }
        setText(text) {
            this._textElement.textContent = text;
        }
    }
    Nabu.DebugDisplayTextValue = DebugDisplayTextValue;
    customElements.define("debug-display-text-value", DebugDisplayTextValue);
})(Nabu || (Nabu = {}));
var Nabu;
(function (Nabu) {
    class DebugDisplayVector3Value extends HTMLElement {
        constructor() {
            super(...arguments);
            this._label = "";
            this._useIJK = false;
            this._decimals = 3;
            this._x = 0;
            this._y = 0;
            this._z = 0;
            this._initialized = false;
        }
        static get observedAttributes() {
            return [
                "label",
                "useIJK",
                "decimals"
            ];
        }
        connectedCallback() {
            this.initialize();
            this.style.display = "block";
            this.style.width = "100%";
            this.style.marginLeft = "auto";
            this.style.marginBottom = "5px";
        }
        attributeChangedCallback(name, oldValue, newValue) {
            if (this._initialized) {
                if (name === "label") {
                    this._label = newValue;
                    this._labelElement.textContent = this._label;
                }
                if (name === "useIJK") {
                    this._useIJK = newValue === "true" ? true : false;
                    if (this._useIJK) {
                        this._xLabelElement.textContent = "i";
                        this._yLabelElement.textContent = "j";
                        this._zLabelElement.textContent = "k";
                    }
                    else {
                        this._xLabelElement.textContent = "x";
                        this._yLabelElement.textContent = "y";
                        this._zLabelElement.textContent = "z";
                    }
                }
                if (name === "decimals") {
                    let value = parseInt(newValue);
                    if (isFinite(value)) {
                        this._decimals = value;
                    }
                    this.setValue({
                        x: this._x,
                        y: this._y,
                        z: this._z
                    });
                }
            }
        }
        initialize() {
            if (!this._initialized) {
                this.style.position = "relative";
                this._labelElement = document.createElement("div");
                this._labelElement.style.display = "inline-block";
                this._labelElement.style.width = "33%";
                this._labelElement.style.marginRight = "2%";
                this.appendChild(this._labelElement);
                this._xLabelElement = document.createElement("div");
                this._xLabelElement.style.display = "inline-block";
                this._xLabelElement.style.width = "6%";
                this._xLabelElement.style.marginRight = "2%";
                this._xLabelElement.style.fontSize = "80%";
                this.appendChild(this._xLabelElement);
                this._xElement = document.createElement("div");
                this._xElement.style.display = "inline-block";
                this._xElement.style.textAlign = "left";
                this._xElement.style.width = "13.66%";
                this._xElement.textContent = "10";
                this.appendChild(this._xElement);
                this._yLabelElement = document.createElement("div");
                this._yLabelElement.style.display = "inline-block";
                this._yLabelElement.style.width = "6%";
                this._yLabelElement.style.marginRight = "2%";
                this._yLabelElement.style.fontSize = "80%";
                this.appendChild(this._yLabelElement);
                this._yElement = document.createElement("div");
                this._yElement.style.display = "inline-block";
                this._yElement.style.textAlign = "left";
                this._yElement.style.width = "13.66%";
                this._yElement.textContent = "10";
                this.appendChild(this._yElement);
                this._zLabelElement = document.createElement("div");
                this._zLabelElement.style.display = "inline-block";
                this._zLabelElement.style.width = "6%";
                this._zLabelElement.style.marginRight = "2%";
                this._zLabelElement.style.fontSize = "80%";
                this.appendChild(this._zLabelElement);
                this._zElement = document.createElement("div");
                this._zElement.style.display = "inline-block";
                this._zElement.style.textAlign = "left";
                this._zElement.style.width = "13.66%";
                this._zElement.textContent = "10";
                this.appendChild(this._zElement);
                this._initialized = true;
                for (let i = 0; i < DebugDisplayVector3Value.observedAttributes.length; i++) {
                    let name = DebugDisplayVector3Value.observedAttributes[i];
                    let value = this.getAttribute(name);
                    this.attributeChangedCallback(name, value + "_forceupdate", value);
                }
            }
        }
        setValue(vec3, j, k) {
            if (isFinite(j) && isFinite(k)) {
                this._x = vec3;
                this._y = j;
                this._z = k;
            }
            else {
                this._x = isFinite(vec3.x) ? vec3.x : vec3.i;
                this._y = isFinite(vec3.y) ? vec3.y : vec3.j;
                this._z = isFinite(vec3.z) ? vec3.z : vec3.k;
            }
            this._xElement.innerText = this._x.toFixed(this._decimals);
            this._yElement.innerText = this._y.toFixed(this._decimals);
            this._zElement.innerText = this._z.toFixed(this._decimals);
        }
    }
    Nabu.DebugDisplayVector3Value = DebugDisplayVector3Value;
    customElements.define("debug-display-vector3-value", DebugDisplayVector3Value);
})(Nabu || (Nabu = {}));
var Nabu;
(function (Nabu) {
    Nabu.PIString = "314594565123";
})(Nabu || (Nabu = {}));
/// <reference path="./PIString.ts"/>
var Nabu;
(function (Nabu) {
    class RandSeed {
        constructor(stringInput) {
            this.stringInput = stringInput;
            this.values = [1000, 1000, 1000, 1000, 1000, 1000, 1000];
            stringInput = stringInput.padEnd(10, "x");
            for (let i = 0; i < 7; i++) {
                let mixedStringInput = stringInput.substring(i) + stringInput.substring(0, i);
                this.values[i] = RandSeed.EasyHash(mixedStringInput);
            }
        }
        static EasyHash(stringInput) {
            let h = 0;
            for (let i = 0; i < stringInput.length; i++) {
                let v = stringInput.charCodeAt(i);
                h = (h * h + v) % 10000;
            }
            return h;
        }
    }
    Nabu.RandSeed = RandSeed;
    class Rand {
        constructor() {
            this.values = [];
            let N = Nabu.PIString.length;
            let i = 0;
            while (i + 7 < N) {
                let n = parseInt(Nabu.PIString.substring(i, i + 7));
                this.values.push(n / 9999999);
                i++;
            }
            this.L = this.values.length;
        }
        getValue1D(seed, i) {
            let n1 = seed.values[0] * (i + 1);
            n1 = n1 % this.L;
            let n2 = seed.values[1] * (n1 * i + 1);
            n2 = n2 % this.L;
            let n3 = seed.values[2] * (n2 * i + 1);
            n3 = n3 % this.L;
            let n4 = seed.values[3] * (n3 * i + 1);
            n4 = n4 % this.L;
            let index = Math.floor(Math.abs(n1 + n2 + n3 + n4)) % this.L;
            let v = this.values[index];
            return v;
        }
        getValue3D(seed, i, j, k) {
            let n1 = seed.values[0] * (i + 1);
            n1 = n1 % this.L;
            let n2 = seed.values[1] * (n1 * j + 1);
            n2 = n2 % this.L;
            let n3 = seed.values[2] * (n2 * k + 1);
            n3 = n3 % this.L;
            let n4 = seed.values[3] * (n3 * (i * j) + 1);
            n4 = n4 % this.L;
            let n5 = seed.values[4] * (n4 * i + 1);
            n5 = n5 % this.L;
            let n6 = seed.values[5] * (n5 * j + 1);
            n6 = n6 % this.L;
            let n7 = seed.values[6] * (n6 * k + 1);
            n7 = n7 % this.L;
            let n8 = seed.values[0] * (n7 * (j * k) + 1);
            n8 = n8 % this.L;
            let index = Math.floor(Math.abs(n1 + n2 + n3 + n4 + n5 + n6 + n7 + n8)) % this.L;
            let v = this.values[index];
            return v;
        }
        getValue4D(seed, i, j, k, d) {
            let n1 = seed.values[0] * (i + 1);
            n1 = n1 % this.L;
            let n2 = seed.values[1] * (n1 * j + 1);
            n2 = n2 % this.L;
            let n3 = seed.values[2] * (n2 * k + 1);
            n3 = n3 % this.L;
            let n4 = seed.values[3] * (n3 * d + 1);
            n4 = n4 % this.L;
            let n5 = seed.values[4] * (n4 * i + 1);
            n5 = n5 % this.L;
            let n6 = seed.values[5] * (n5 * j + 1);
            n6 = n6 % this.L;
            let n7 = seed.values[6] * (n6 * k + 1);
            n7 = n7 % this.L;
            let n8 = seed.values[0] * (n7 * d + 1);
            n8 = n8 % this.L;
            let index = Math.floor(Math.abs(n1 + n2 + n3 + n4 + n5 + n6 + n7 + n8)) % this.L;
            let v = this.values[index];
            return v;
        }
    }
    Nabu.Rand = Rand;
    Nabu.RAND = new Rand();
})(Nabu || (Nabu = {}));
var Nabu;
(function (Nabu) {
    class PanelElement extends HTMLElement {
        constructor() {
            super(...arguments);
            this.x = 0;
            this.y = 0;
            this.w = 1;
            this.h = 1;
            this.computedTop = 0;
            this.computedLeft = 0;
        }
        get top() {
            return parseFloat(this.style.top);
        }
        set top(v) {
            if (this) {
                this.style.top = v.toFixed(1) + "px";
            }
        }
        get left() {
            return parseFloat(this.style.left);
        }
        set left(v) {
            if (this) {
                this.style.left = v.toFixed(1) + "px";
            }
        }
    }
    Nabu.PanelElement = PanelElement;
    customElements.define("panel-element", PanelElement);
})(Nabu || (Nabu = {}));
var Nabu;
(function (Nabu) {
    class PanelPage extends HTMLElement {
        constructor() {
            super(...arguments);
            this._loaded = false;
            this._shown = false;
            this.panels = [];
            this.xCount = 1;
            this.yCount = 1;
            this.animLineHeight = 1;
            this.animLineDir = 1;
        }
        static get observedAttributes() {
            return ["file", "anim-line-height", "anim-line-dir"];
        }
        get onLoad() {
            return this._onLoad;
        }
        set onLoad(callback) {
            this._onLoad = callback;
            if (this._loaded) {
                this._onLoad();
            }
        }
        connectedCallback() {
            let file = this.getAttribute("file");
            if (file) {
                this.attributeChangedCallback("file", "", file);
            }
        }
        attributeChangedCallback(name, oldValue, newValue) {
            if (name === "file") {
                if (this.isConnected) {
                    const xhttp = new XMLHttpRequest();
                    xhttp.onload = () => {
                        this.innerHTML = xhttp.responseText;
                        this.style.position = "fixed";
                        this.style.zIndex = "10";
                        this._shown = false;
                        this.resize();
                        this.hide(0);
                        this._loaded = true;
                        if (this._onLoad) {
                            this._onLoad();
                        }
                    };
                    xhttp.open("GET", newValue);
                    xhttp.send();
                }
            }
            else if (name === "anim-line-height") {
                let v = parseInt(newValue);
                if (v > 0) {
                    this.animLineHeight = v;
                }
            }
            else if (name === "anim-line-dir") {
                let v = parseInt(newValue);
                if (v === -1 || v === 1) {
                    this.animLineDir = v;
                }
            }
        }
        async show(duration = 1) {
            return new Promise((resolve) => {
                if (!this._shown) {
                    clearInterval(this._animateShowInterval);
                    this._shown = true;
                    let outOfScreenLeft = 1.0 * window.innerWidth;
                    for (let i = 0; i < this.panels.length; i++) {
                        let panel = this.panels[i];
                        let targetLeft = outOfScreenLeft * this.animLineDir;
                        if (Math.floor(panel.y / this.animLineHeight) % 2 != Math.floor(this.yCount / this.animLineHeight) % 2) {
                            targetLeft = -outOfScreenLeft * this.animLineDir;
                        }
                        panel.left = targetLeft + panel.computedLeft;
                        panel.style.display = "block";
                        panel.style.opacity = "0";
                    }
                    let t0 = performance.now() / 1000;
                    this._animateShowInterval = setInterval(() => {
                        let t = performance.now() / 1000 - t0;
                        if (t >= duration) {
                            clearInterval(this._animateShowInterval);
                            for (let i = 0; i < this.panels.length; i++) {
                                let panel = this.panels[i];
                                panel.left = panel.computedLeft;
                                panel.style.opacity = "1";
                            }
                            resolve();
                        }
                        else {
                            let f = t / duration;
                            for (let i = 0; i < this.panels.length; i++) {
                                let panel = this.panels[i];
                                let targetLeft = outOfScreenLeft * this.animLineDir;
                                if (Math.floor(panel.y / this.animLineHeight) % 2 != Math.floor(this.yCount / this.animLineHeight) % 2) {
                                    targetLeft = -outOfScreenLeft * this.animLineDir;
                                }
                                panel.left = (1 - f) * targetLeft + panel.computedLeft;
                                panel.style.opacity = f.toFixed(3);
                            }
                        }
                    }, 15);
                }
            });
        }
        async hide(duration = 1) {
            if (duration === 0) {
                this._shown = false;
                let outOfScreenLeft = 1.0 * window.innerWidth;
                for (let i = 0; i < this.panels.length; i++) {
                    let panel = this.panels[i];
                    panel.left = outOfScreenLeft + panel.computedLeft;
                    panel.style.display = "none";
                    panel.style.opacity = "0";
                }
            }
            else {
                return new Promise((resolve) => {
                    if (this._shown) {
                        clearInterval(this._animateShowInterval);
                        this._shown = false;
                        let outOfScreenLeft = 1.0 * window.innerWidth;
                        for (let i = 0; i < this.panels.length; i++) {
                            let panel = this.panels[i];
                            let targetLeft = outOfScreenLeft * this.animLineDir;
                            if (Math.floor(panel.y / this.animLineHeight) % 2 != Math.floor(this.yCount / this.animLineHeight) % 2) {
                                targetLeft = -outOfScreenLeft * this.animLineDir;
                            }
                            panel.left = targetLeft + panel.computedLeft;
                            panel.style.display = "block";
                            panel.style.opacity = "1";
                        }
                        let t0 = performance.now() / 1000;
                        this._animateShowInterval = setInterval(() => {
                            let t = performance.now() / 1000 - t0;
                            if (t >= duration) {
                                clearInterval(this._animateShowInterval);
                                for (let i = 0; i < this.panels.length; i++) {
                                    let panel = this.panels[i];
                                    let targetLeft = outOfScreenLeft * this.animLineDir;
                                    if (Math.floor(panel.y / this.animLineHeight) % 2 != Math.floor(this.yCount / this.animLineHeight) % 2) {
                                        targetLeft = -outOfScreenLeft * this.animLineDir;
                                    }
                                    panel.left = targetLeft + panel.computedLeft;
                                    panel.style.display = "none";
                                    panel.style.opacity = "0";
                                }
                                resolve();
                            }
                            else {
                                let f = t / duration;
                                for (let i = 0; i < this.panels.length; i++) {
                                    let panel = this.panels[i];
                                    let targetLeft = outOfScreenLeft * this.animLineDir;
                                    if (Math.floor(panel.y / this.animLineHeight) % 2 != Math.floor(this.yCount / this.animLineHeight) % 2) {
                                        targetLeft = -outOfScreenLeft * this.animLineDir;
                                    }
                                    panel.left = f * targetLeft + panel.computedLeft;
                                    panel.style.opacity = (1 - f).toFixed(3);
                                }
                            }
                        }, 15);
                    }
                });
            }
        }
        resize() {
            let requestedTileCount = 0;
            let requestedFullLines = 0;
            this.panels = [];
            let elements = this.querySelectorAll("panel-element");
            for (let i = 0; i < elements.length; i++) {
                let panel = elements[i];
                this.panels[i] = panel;
                panel.w = parseInt(panel.getAttribute("w"));
                panel.h = parseInt(panel.getAttribute("h"));
                let area = panel.w * panel.h;
                requestedTileCount += area;
            }
            let rect = this.getBoundingClientRect();
            let containerW = rect.width;
            let containerH = rect.height;
            let kill = 0;
            let min = 0;
            let ok = false;
            let emptyLinesBottom = 0;
            while (!ok) {
                kill++;
                if (kill > 10) {
                    return;
                }
                ok = true;
                min++;
                let bestValue = 0;
                for (let xC = min; xC <= 10; xC++) {
                    for (let yC = min; yC <= 10; yC++) {
                        let count = xC * yC;
                        if (count >= requestedTileCount) {
                            let w = containerW / xC;
                            let h = containerH / (yC + requestedFullLines);
                            let area = w * h;
                            let squareness = Math.min(w / h, h / w);
                            let value = area * squareness;
                            if (value > bestValue) {
                                this.xCount = xC;
                                this.yCount = yC + requestedFullLines;
                                bestValue = value;
                            }
                        }
                    }
                }
                let grid = [];
                for (let y = 0; y <= this.yCount; y++) {
                    grid[y] = [];
                    for (let x = 0; x <= this.xCount; x++) {
                        grid[y][x] = x < this.xCount && y < this.yCount;
                    }
                }
                for (let n = 0; n < this.panels.length; n++) {
                    let panel = this.panels[n];
                    panel.x = -1;
                    panel.y = -1;
                    for (let line = 0; line < this.yCount && panel.x === -1; line++) {
                        for (let col = 0; col < this.xCount && panel.x === -1; col++) {
                            let fit = true;
                            for (let x = 0; x < panel.w; x++) {
                                for (let y = 0; y < panel.h; y++) {
                                    fit = fit && grid[line + y][col + x];
                                }
                            }
                            if (fit) {
                                panel.x = col;
                                panel.y = line;
                                for (let x = 0; x < panel.w; x++) {
                                    for (let y = 0; y < panel.h; y++) {
                                        grid[line + y][col + x] = false;
                                    }
                                }
                            }
                        }
                    }
                    if (panel.x === -1) {
                        ok = false;
                    }
                }
                if (ok) {
                    let empty = true;
                    emptyLinesBottom = 0;
                    for (let y = this.yCount - 1; y > 0 && empty; y--) {
                        for (let x = 0; x < this.xCount && empty; x++) {
                            if (!grid[y][x]) {
                                empty = false;
                            }
                        }
                        if (empty) {
                            emptyLinesBottom++;
                        }
                    }
                }
            }
            let tileW = containerW / this.xCount;
            let tileH = containerH / this.yCount;
            let m = Math.min(tileW, tileH) / 15;
            for (let i = 0; i < this.panels.length; i++) {
                let panel = this.panels[i];
                panel.style.display = "block";
                panel.style.width = (panel.w * tileW - 2 * m).toFixed(0) + "px";
                panel.style.height = (panel.h * tileH - 2 * m).toFixed(0) + "px";
                panel.style.position = "absolute";
                panel.computedLeft = panel.x * tileW + m;
                if (panel.style.display != "none") {
                    panel.style.left = panel.computedLeft.toFixed(0) + "px";
                }
                panel.computedTop = panel.y * tileH + m + emptyLinesBottom * 0.5 * tileH;
                panel.style.top = panel.computedTop.toFixed(0) + "px";
                let label = panel.querySelector(".label");
                if (label) {
                    label.style.fontSize = (tileW / 4).toFixed(0) + "px";
                }
                let label2 = panel.querySelector(".label-2");
                if (label2) {
                    label2.style.fontSize = (tileW / 7).toFixed(0) + "px";
                }
            }
        }
    }
    Nabu.PanelPage = PanelPage;
    customElements.define("panel-page", PanelPage);
})(Nabu || (Nabu = {}));
var Nabu;
(function (Nabu) {
    class Router {
        constructor() {
            this.pages = [];
            this._update = () => {
                let href = window.location.href;
                if (href != this._currentHRef) {
                    this._currentHRef = href;
                    this._onHRefChange();
                }
                this.onUpdate();
            };
            this._onHRefChange = async () => {
                let split = this._currentHRef.split("/");
                let page = split[split.length - 1];
                this.onHRefChange(page);
            };
        }
        async wait(duration) {
            return new Promise((resolve) => {
                setTimeout(resolve, duration * 1000);
            });
        }
        findAllPages() {
            this.pages = [];
            let mainMenus = document.querySelectorAll("panel-page");
            mainMenus.forEach((mainMenu) => {
                if (mainMenu instanceof Nabu.PanelPage) {
                    this.pages.push(mainMenu);
                }
            });
            this.onFindAllPages();
        }
        onFindAllPages() {
        }
        initialize() {
            this.findAllPages();
            setInterval(this._update, 30);
        }
        async show(page, dontCloseOthers) {
            this.findAllPages();
            if (!dontCloseOthers) {
                this.hideAll();
            }
            await page.show(1);
        }
        async hideAll() {
            for (let i = 0; i < this.pages.length; i++) {
                this.pages[i].hide(1);
            }
        }
        onUpdate() {
        }
        onHRefChange(page) {
        }
    }
    Nabu.Router = Router;
})(Nabu || (Nabu = {}));
