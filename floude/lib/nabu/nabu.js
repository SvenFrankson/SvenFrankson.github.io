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
    async function NextFrame() {
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                resolve();
            });
        });
    }
    Nabu.NextFrame = NextFrame;
})(Nabu || (Nabu = {}));
var Nabu;
(function (Nabu) {
    var badwordsList = [
        "4r5e",
        "5h1t",
        "5hit",
        "a55",
        "anal",
        "anus",
        "ar5e",
        "arrse",
        "arse",
        "ass",
        "ass-fucker",
        "asses",
        "assfucker",
        "assfukka",
        "asshole",
        "assholes",
        "asswhole",
        "a_s_s",
        "b!tch",
        "b00bs",
        "b17ch",
        "b1tch",
        "ballbag",
        "ballsack",
        "bastard",
        "beastial",
        "beastiality",
        "bellend",
        "bestial",
        "bestiality",
        "bi+ch",
        "biatch",
        "bitch",
        "bitcher",
        "bitchers",
        "bitches",
        "bitchin",
        "bitching",
        "bloody",
        "blow job",
        "blowjob",
        "blowjobs",
        "boiolas",
        "bollock",
        "bollok",
        "boner",
        "boob",
        "boobs",
        "booobs",
        "boooobs",
        "booooobs",
        "booooooobs",
        "breasts",
        "buceta",
        "bugger",
        "bum",
        "bunny fucker",
        "butt",
        "butthole",
        "buttmuch",
        "buttplug",
        "c0ck",
        "c0cksucker",
        "carpet muncher",
        "cawk",
        "chink",
        "cipa",
        "cl1t",
        "clit",
        "clitoris",
        "clits",
        "cnut",
        "cock",
        "cock-sucker",
        "cockface",
        "cockhead",
        "cockmunch",
        "cockmuncher",
        "cocks",
        "cocksuck",
        "cocksucked",
        "cocksucker",
        "cocksucking",
        "cocksucks",
        "cocksuka",
        "cocksukka",
        "cok",
        "cokmuncher",
        "coksucka",
        "coon",
        "cox",
        "crap",
        "cum",
        "cummer",
        "cumming",
        "cums",
        "cumshot",
        "cunilingus",
        "cunillingus",
        "cunnilingus",
        "cunt",
        "cuntlick",
        "cuntlicker",
        "cuntlicking",
        "cunts",
        "cyalis",
        "cyberfuc",
        "cyberfuck",
        "cyberfucked",
        "cyberfucker",
        "cyberfuckers",
        "cyberfucking",
        "d1ck",
        "damn",
        "dick",
        "dickhead",
        "dildo",
        "dildos",
        "dink",
        "dinks",
        "dirsa",
        "dlck",
        "dog-fucker",
        "doggin",
        "dogging",
        "donkeyribber",
        "doosh",
        "duche",
        "dyke",
        "ejaculate",
        "ejaculated",
        "ejaculates",
        "ejaculating",
        "ejaculatings",
        "ejaculation",
        "ejakulate",
        "f u c k",
        "f u c k e r",
        "f4nny",
        "fag",
        "fagging",
        "faggitt",
        "faggot",
        "faggs",
        "fagot",
        "fagots",
        "fags",
        "fanny",
        "fannyflaps",
        "fannyfucker",
        "fanyy",
        "fatass",
        "fcuk",
        "fcuker",
        "fcuking",
        "feck",
        "fecker",
        "felching",
        "fellate",
        "fellatio",
        "fingerfuck",
        "fingerfucked",
        "fingerfucker",
        "fingerfuckers",
        "fingerfucking",
        "fingerfucks",
        "fistfuck",
        "fistfucked",
        "fistfucker",
        "fistfuckers",
        "fistfucking",
        "fistfuckings",
        "fistfucks",
        "flange",
        "fook",
        "fooker",
        "fuck",
        "fucka",
        "fucked",
        "fucker",
        "fuckers",
        "fuckhead",
        "fuckheads",
        "fuckin",
        "fucking",
        "fuckings",
        "fuckingshitmotherfucker",
        "fuckme",
        "fucks",
        "fuckwhit",
        "fuckwit",
        "fudge packer",
        "fudgepacker",
        "fuk",
        "fuker",
        "fukker",
        "fukkin",
        "fuks",
        "fukwhit",
        "fukwit",
        "fux",
        "fux0r",
        "f_u_c_k",
        "gangbang",
        "gangbanged",
        "gangbangs",
        "gaylord",
        "gaysex",
        "goatse",
        "God",
        "god-dam",
        "god-damned",
        "goddamn",
        "goddamned",
        "hardcoresex",
        "hell",
        "heshe",
        "hoar",
        "hoare",
        "hoer",
        "homo",
        "hore",
        "horniest",
        "horny",
        "hotsex",
        "jack-off",
        "jackoff",
        "jap",
        "jerk-off",
        "jism",
        "jiz",
        "jizm",
        "jizz",
        "kawk",
        "knob",
        "knobead",
        "knobed",
        "knobend",
        "knobhead",
        "knobjocky",
        "knobjokey",
        "kock",
        "kondum",
        "kondums",
        "kum",
        "kummer",
        "kumming",
        "kums",
        "kunilingus",
        "l3i+ch",
        "l3itch",
        "labia",
        "lust",
        "lusting",
        "m0f0",
        "m0fo",
        "m45terbate",
        "ma5terb8",
        "ma5terbate",
        "masochist",
        "master-bate",
        "masterb8",
        "masterbat*",
        "masterbat3",
        "masterbate",
        "masterbation",
        "masterbations",
        "masturbate",
        "mo-fo",
        "mof0",
        "mofo",
        "mothafuck",
        "mothafucka",
        "mothafuckas",
        "mothafuckaz",
        "mothafucked",
        "mothafucker",
        "mothafuckers",
        "mothafuckin",
        "mothafucking",
        "mothafuckings",
        "mothafucks",
        "mother fucker",
        "motherfuck",
        "motherfucked",
        "motherfucker",
        "motherfuckers",
        "motherfuckin",
        "motherfucking",
        "motherfuckings",
        "motherfuckka",
        "motherfucks",
        "muff",
        "mutha",
        "muthafecker",
        "muthafuckker",
        "muther",
        "mutherfucker",
        "n1gga",
        "n1gger",
        "nazi",
        "nigg3r",
        "nigg4h",
        "nigga",
        "niggah",
        "niggas",
        "niggaz",
        "nigger",
        "niggers",
        "nob",
        "nob jokey",
        "nobhead",
        "nobjocky",
        "nobjokey",
        "numbnuts",
        "nutsack",
        "orgasim",
        "orgasims",
        "orgasm",
        "orgasms",
        "p0rn",
        "pawn",
        "pecker",
        "penis",
        "penisfucker",
        "phonesex",
        "phuck",
        "phuk",
        "phuked",
        "phuking",
        "phukked",
        "phukking",
        "phuks",
        "phuq",
        "pigfucker",
        "pimpis",
        "piss",
        "pissed",
        "pisser",
        "pissers",
        "pisses",
        "pissflaps",
        "pissin",
        "pissing",
        "pissoff",
        "poop",
        "porn",
        "porno",
        "pornography",
        "pornos",
        "prick",
        "pricks",
        "pron",
        "pube",
        "pusse",
        "pussi",
        "pussies",
        "pussy",
        "pussys",
        "rectum",
        "retard",
        "rimjaw",
        "rimming",
        "s hit",
        "s.o.b.",
        "sadist",
        "schlong",
        "screwing",
        "scroat",
        "scrote",
        "scrotum",
        "semen",
        "sex",
        "sh!+",
        "sh!t",
        "sh1t",
        "shag",
        "shagger",
        "shaggin",
        "shagging",
        "shemale",
        "shi+",
        "shit",
        "shitdick",
        "shite",
        "shited",
        "shitey",
        "shitfuck",
        "shitfull",
        "shithead",
        "shiting",
        "shitings",
        "shits",
        "shitted",
        "shitter",
        "shitters",
        "shitting",
        "shittings",
        "shitty",
        "skank",
        "slut",
        "sluts",
        "smegma",
        "smut",
        "snatch",
        "son-of-a-bitch",
        "spac",
        "spunk",
        "s_h_i_t",
        "t1tt1e5",
        "t1tties",
        "teets",
        "teez",
        "testical",
        "testicle",
        "testicular",
        "tit",
        "titfuck",
        "tits",
        "titt",
        "tittie5",
        "tittiefucker",
        "titties",
        "tittyfuck",
        "tittywank",
        "titwank",
        "tosser",
        "turd",
        "tw4t",
        "twat",
        "twathead",
        "twatty",
        "twunt",
        "twunter",
        "v14gra",
        "v1gra",
        "vagina",
        "viagra",
        "vulva",
        "w00se",
        "wang",
        "wank",
        "wanker",
        "wanky",
        "whoar",
        "whore",
        "willies",
        "xrated",
        "xxx",
    ];
    function ContainsBadwords(input) {
        input = input.toLocaleLowerCase();
        let splitInput = input.split(" ");
        for (let i = 0; i < badwordsList.length; i++) {
            let badword = badwordsList[i];
            // If a badword is spotted
            if (input.indexOf(badword) != -1) {
                if (badword.indexOf(" ") != -1) {
                    // It's a badphrase, there's no valid reason to have it in.
                    return true;
                }
                else {
                    let isSimpleBadwordRegex = new RegExp(/^[A-Za-z]+$/);
                    if (!isSimpleBadwordRegex.test(badword)) {
                        // It's a complex badword, there's no valid reason to have it in.
                        return true;
                    }
                    else {
                        if (splitInput.indexOf(badword) != -1) {
                            // A simple badword is written as-is, it's not allowed.
                            return true;
                        }
                        else {
                            // A simple badword is used inside another word.
                        }
                    }
                }
            }
        }
        return false;
    }
    Nabu.ContainsBadwords = ContainsBadwords;
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
var Nabu;
(function (Nabu) {
    let ConfigurationElementCategory;
    (function (ConfigurationElementCategory) {
        ConfigurationElementCategory[ConfigurationElementCategory["Gameplay"] = 0] = "Gameplay";
        ConfigurationElementCategory[ConfigurationElementCategory["Graphic"] = 1] = "Graphic";
        ConfigurationElementCategory[ConfigurationElementCategory["Control"] = 2] = "Control";
        ConfigurationElementCategory[ConfigurationElementCategory["UI"] = 3] = "UI";
        ConfigurationElementCategory[ConfigurationElementCategory["Dev"] = 4] = "Dev";
    })(ConfigurationElementCategory = Nabu.ConfigurationElementCategory || (Nabu.ConfigurationElementCategory = {}));
    Nabu.ConfigurationElementCategoryName = [
        "Gameplay",
        "Graphic",
        "Control",
        "UI",
        "Dev"
    ];
    let ConfigurationElementType;
    (function (ConfigurationElementType) {
        ConfigurationElementType[ConfigurationElementType["Boolean"] = 0] = "Boolean";
        ConfigurationElementType[ConfigurationElementType["Number"] = 1] = "Number";
        ConfigurationElementType[ConfigurationElementType["Enum"] = 2] = "Enum";
        ConfigurationElementType[ConfigurationElementType["Input"] = 3] = "Input";
    })(ConfigurationElementType = Nabu.ConfigurationElementType || (Nabu.ConfigurationElementType = {}));
    class ConfigurationElement {
        constructor(property, type, value, category, prop, onChange) {
            this.property = property;
            this.type = type;
            this.value = value;
            this.category = category;
            this.prop = prop;
            this.onChange = onChange;
            if (!this.prop) {
                this.prop = {};
            }
            if (!this.prop.displayName) {
                this.prop.displayName = property.split(".")[0];
            }
            if (isNaN(this.prop.min)) {
                this.prop.min = 0;
            }
            if (isNaN(this.prop.max)) {
                this.prop.max = 1000;
            }
            if (isNaN(this.prop.step)) {
                this.prop.step = 1;
            }
            if (!this.prop.toString) {
                this.prop.toString = (v) => { return v.toString(); };
            }
        }
        static InputToInt(input) {
            return ConfigurationElement.Inputs.indexOf(input);
        }
        static SimpleInput(inputManager, name, keyInput, defaultValueString) {
            return new ConfigurationElement(name, ConfigurationElementType.Input, ConfigurationElement.InputToInt(defaultValueString), ConfigurationElementCategory.Control, {}, (newValue, oldValue) => {
                if (isFinite(oldValue)) {
                    inputManager.unMapInput(ConfigurationElement.Inputs[oldValue], keyInput);
                }
                inputManager.mapInput(ConfigurationElement.Inputs[newValue], keyInput);
            });
        }
        forceInit() {
            if (this.onChange && isFinite(this.value)) {
                this.onChange(this.value);
            }
        }
    }
    ConfigurationElement.Inputs = [
        "ArrowLeft",
        "ArrowUp",
        "ArrowRight",
        "ArrowDown",
        "Space",
        "ShiftLeft",
        "ControlLeft",
        "AltLeft",
        "ShiftRight",
        "ControlRight",
        "AltRight",
        "Digit1",
        "Digit2",
        "Digit3",
        "Digit4",
        "Digit5",
        "Digit6",
        "Digit7",
        "Digit8",
        "Digit9",
        "Digit0",
        "KeyA",
        "KeyZ",
        "KeyE",
        "KeyR",
        "KeyT",
        "KeyY",
        "KeyU",
        "KeyI",
        "KeyO",
        "KeyP",
        "KeyQ",
        "KeyS",
        "KeyD",
        "KeyF",
        "KeyG",
        "KeyH",
        "KeyJ",
        "KeyK",
        "KeyL",
        "KeyM",
        "KeyW",
        "KeyX",
        "KeyC",
        "KeyV",
        "KeyB",
        "KeyN",
        "GamepadBtn0",
        "GamepadBtn1",
        "GamepadBtn2",
        "GamepadBtn3",
        "GamepadBtn4",
        "GamepadBtn5",
        "GamepadBtn6",
        "GamepadBtn7",
        "GamepadBtn8",
        "GamepadBtn9",
        "GamepadBtn10",
        "GamepadBtn11",
        "GamepadBtn12",
        "GamepadBtn13",
        "GamepadBtn14",
        "GamepadBtn15",
        "GamepadBtn16"
    ];
    Nabu.ConfigurationElement = ConfigurationElement;
    class Configuration {
        constructor(configName, version = 0) {
            this.configName = configName;
            this.version = version;
            this.hasLocalStorage = false;
            this.configurationElements = [];
        }
        initialize() {
            this._buildElementsArray();
            if (this.hasLocalStorage) {
                let data = JSON.parse(localStorage.getItem(this.configName));
                if (data && data.v === this.version) {
                    this.deserialize(data);
                }
            }
        }
        getElement(property) {
            return this.configurationElements.find(e => { return e.property === property; });
        }
        getValue(property) {
            let element = this.getElement(property);
            if (element) {
                return element.value;
            }
            return undefined;
        }
        setValue(property, value, doForceInit, skipSaveToLocalStorage) {
            let element = this.getElement(property);
            if (element) {
                if (element.value != value) {
                    element.value = value;
                    if (doForceInit) {
                        element.forceInit();
                    }
                    if (this.hasLocalStorage && !skipSaveToLocalStorage) {
                        this.saveToLocalStorage();
                    }
                    if (this.onValueChange) {
                        this.onValueChange(element);
                    }
                }
            }
        }
        saveToLocalStorage() {
            let data = this.serialize();
            localStorage.setItem(this.configName, JSON.stringify(data));
        }
        serialize() {
            let data = { v: this.version };
            this.configurationElements.forEach(configurationElement => {
                data[configurationElement.property] = configurationElement.value;
            });
            return data;
        }
        deserialize(data) {
            if (data) {
                this.configurationElements.forEach(configurationElement => {
                    let v = data[configurationElement.property];
                    if (v != undefined) {
                        configurationElement.value = v;
                    }
                });
            }
        }
    }
    Nabu.Configuration = Configuration;
})(Nabu || (Nabu = {}));
// Part of this code by Andrey Sitnik and Ivan Solovev https://github.com/ai/easings.net
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
        static easeInSine(x) {
            return 1 - Math.cos((x * Math.PI) / 2);
        }
        static easeOutSine(x) {
            return Math.sin((x * Math.PI) / 2);
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
        static invEaseInOutSine(x) {
            return 1 - (Math.sin(x * Math.PI - Math.PI * 0.5) / 2 + 0.5);
        }
        static easePendulum(x) {
            let amplitude = Easing.invEaseInOutSine(x);
            amplitude = amplitude * amplitude;
            let v = Math.sin(8 * x * x * x * Math.PI - Math.PI / 2) * amplitude + 1;
            return v;
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
        static smoothNSec(fps, n) {
            if (!isFinite(fps)) {
                return 0;
            }
            if (n === 0) {
                return 0;
            }
            if (fps < 1) {
                return 0;
            }
            return 1 - 1 / (n * 0.45 * fps);
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
    function IJK(i, j, k) {
        return { i: i, j: j, k: k };
    }
    Nabu.IJK = IJK;
    function IJKToString(ijk) {
        return "{ " + ijk.i + ", " + ijk.j + ", " + ijk.k + " }";
    }
    Nabu.IJKToString = IJKToString;
    function GetLineIJKsFromTo(from, to) {
        let iDist = Math.abs(from.i - to.i);
        let jDist = Math.abs(from.j - to.j);
        let kDist = Math.abs(from.k - to.k);
        let lineIJKs = [];
        if (iDist === 0 && jDist === 0 && kDist === 0) {
            lineIJKs = [IJK(from.i, from.j, from.k)];
        }
        else if (iDist >= jDist && iDist >= kDist) {
            if (from.i < to.i) {
                for (let ii = from.i; ii <= to.i; ii++) {
                    let f = (ii - from.i) / iDist;
                    let jj = Math.round((1 - f) * from.j + f * to.j);
                    let kk = Math.round((1 - f) * from.k + f * to.k);
                    lineIJKs.push(IJK(ii, jj, kk));
                }
            }
            else {
                for (let ii = to.i; ii <= from.i; ii++) {
                    let f = (ii - to.i) / iDist;
                    let jj = Math.round((1 - f) * to.j + f * from.j);
                    let kk = Math.round((1 - f) * to.k + f * from.k);
                    lineIJKs.push(IJK(ii, jj, kk));
                }
            }
        }
        else if (jDist >= iDist && jDist >= kDist) {
            if (from.j < to.j) {
                for (let jj = from.j; jj <= to.j; jj++) {
                    let f = (jj - from.j) / jDist;
                    let ii = Math.round((1 - f) * from.i + f * to.i);
                    let kk = Math.round((1 - f) * from.k + f * to.k);
                    lineIJKs.push(IJK(ii, jj, kk));
                }
            }
            else {
                for (let jj = to.j; jj <= from.j; jj++) {
                    let f = (jj - to.j) / jDist;
                    let ii = Math.round((1 - f) * to.i + f * from.i);
                    let kk = Math.round((1 - f) * to.k + f * from.k);
                    lineIJKs.push(IJK(ii, jj, kk));
                }
            }
        }
        else if (kDist >= iDist && kDist >= kDist) {
            if (from.k < to.k) {
                for (let kk = from.k; kk <= to.k; kk++) {
                    let f = (kk - from.k) / kDist;
                    let ii = Math.round((1 - f) * from.i + f * to.i);
                    let jj = Math.round((1 - f) * from.j + f * to.j);
                    lineIJKs.push(IJK(ii, jj, kk));
                }
            }
            else {
                for (let kk = to.k; kk <= from.k; kk++) {
                    let f = (kk - to.k) / kDist;
                    let ii = Math.round((1 - f) * to.i + f * from.i);
                    let jj = Math.round((1 - f) * to.j + f * from.j);
                    lineIJKs.push(IJK(ii, jj, kk));
                }
            }
        }
        return lineIJKs;
    }
    Nabu.GetLineIJKsFromTo = GetLineIJKsFromTo;
})(Nabu || (Nabu = {}));
var Nabu;
(function (Nabu) {
    class InputManager {
        constructor(canvas, configuration) {
            this.canvas = canvas;
            this.configuration = configuration;
            this.temporaryNoPointerLock = false;
            this.isPointerLocked = false;
            this.isPointerDown = false;
            this.padButtonsMap = new Map();
            this.padButtonsDown = new Nabu.UniqueList(); // If the physical button is pressed, its index is in this list.
            this.keyboardInputMap = new Map();
            this.keyInputDown = new Nabu.UniqueList();
            this.keyDownListeners = [];
            this.mappedKeyDownListeners = new Map();
            this.keyUpListeners = [];
            this.mappedKeyUpListeners = new Map();
            this.deactivateAllKeyInputs = false;
            try {
                navigator.getGamepads();
                this._isGamepadAllowed = true;
            }
            catch {
                this._isGamepadAllowed = false;
            }
        }
        static DeadZoneAxis(axisValue, threshold = 0.1) {
            if (Math.abs(axisValue) > threshold) {
                return (axisValue - threshold * Math.sign(axisValue)) / (1 - threshold);
            }
            return 0;
        }
        get isGamepadAllowed() {
            return this._isGamepadAllowed;
        }
        initialize() {
            this.canvas.addEventListener("pointerdown", (ev) => {
                this.isPointerDown = true;
                if (!this.temporaryNoPointerLock && (this.configuration && this.configuration.getValue("canLockPointer") === 1)) {
                    this.canvas.requestPointerLock();
                    this.isPointerLocked = true;
                }
            });
            this.canvas.addEventListener("pointerup", () => {
                this.isPointerDown = false;
            });
            document.addEventListener("pointerlockchange", () => {
                if ((document.pointerLockElement === this.canvas)) {
                    this.isPointerLocked = true;
                }
                else {
                    this.isPointerLocked = false;
                }
            });
            window.addEventListener("keydown", (e) => {
                let keyInputs = this.keyboardInputMap.get(e.code);
                if (keyInputs) {
                    keyInputs.forEach(keyInput => {
                        if (isFinite(keyInput)) {
                            this.doKeyInputDown(keyInput);
                        }
                    });
                }
            });
            window.addEventListener("keyup", (e) => {
                let keyInputs = this.keyboardInputMap.get(e.code);
                if (keyInputs) {
                    keyInputs.forEach(keyInput => {
                        if (isFinite(keyInput)) {
                            this.doKeyInputUp(keyInput);
                        }
                    });
                }
            });
        }
        initializeInputs(configuration) {
            if (configuration) {
                configuration.configurationElements.forEach(confElement => {
                    if (confElement.type === Nabu.ConfigurationElementType.Input) {
                        confElement.forceInit();
                    }
                });
            }
        }
        update() {
            if (this.isGamepadAllowed) {
                let gamepads = navigator.getGamepads();
                let gamepad = gamepads[0];
                if (gamepad) {
                    let hasButtonsDown = this.padButtonsDown.length > 0;
                    for (let b = 0; b < gamepad.buttons.length; b++) {
                        let v = gamepad.buttons[b].pressed;
                        if (v) {
                            if (!this.padButtonsDown.contains(b)) {
                                this.padButtonsDown.push(b);
                                let keys = this.padButtonsMap.get(b);
                                if (keys) {
                                    keys.forEach(key => {
                                        if (isFinite(key)) {
                                            this.doKeyInputDown(key);
                                        }
                                    });
                                }
                            }
                        }
                        else if (hasButtonsDown) {
                            if (this.padButtonsDown.contains(b)) {
                                this.padButtonsDown.remove(b);
                                let keys = this.padButtonsMap.get(b);
                                if (keys) {
                                    keys.forEach(key => {
                                        if (isFinite(key)) {
                                            this.doKeyInputUp(key);
                                        }
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
        doKeyInputDown(keyInput) {
            if (this.deactivateAllKeyInputs) {
                return;
            }
            this.keyInputDown.push(keyInput);
            for (let i = 0; i < this.keyDownListeners.length; i++) {
                this.keyDownListeners[i](keyInput);
            }
            let listeners = this.mappedKeyDownListeners.get(keyInput);
            if (listeners) {
                for (let i = 0; i < listeners.length; i++) {
                    listeners[i]();
                }
            }
        }
        doKeyInputUp(keyInput) {
            if (this.deactivateAllKeyInputs) {
                return;
            }
            this.keyInputDown.remove(keyInput);
            for (let i = 0; i < this.keyUpListeners.length; i++) {
                this.keyUpListeners[i](keyInput);
            }
            let listeners = this.mappedKeyUpListeners.get(keyInput);
            if (listeners) {
                for (let i = 0; i < listeners.length; i++) {
                    listeners[i]();
                }
            }
        }
        mapInput(input, key) {
            if (input.startsWith("GamepadBtn")) {
                let btnIndex = parseInt(input.replace("GamepadBtn", ""));
                let keyInputs = this.padButtonsMap.get(btnIndex);
                if (!keyInputs) {
                    keyInputs = [];
                    this.padButtonsMap.set(btnIndex, keyInputs);
                }
                keyInputs.push(key);
            }
            else {
                let keyInputs = this.keyboardInputMap.get(input);
                if (!keyInputs) {
                    keyInputs = [];
                    this.keyboardInputMap.set(input, keyInputs);
                }
                keyInputs.push(key);
            }
        }
        unMapInput(input, key) {
            if (input.startsWith("GamepadBtn")) {
                let btnIndex = parseInt(input.replace("GamepadBtn", ""));
                let keyInputs = this.padButtonsMap.get(btnIndex);
                if (keyInputs) {
                    let index = keyInputs.indexOf(key);
                    if (index > -1) {
                        keyInputs.splice(index, 1);
                    }
                    if (keyInputs.length === 0) {
                        this.padButtonsMap.delete(btnIndex);
                    }
                }
            }
            else {
                let keyInputs = this.keyboardInputMap.get(input);
                if (keyInputs) {
                    let index = keyInputs.indexOf(key);
                    if (index > -1) {
                        keyInputs.splice(index, 1);
                    }
                    if (keyInputs.length === 0) {
                        this.keyboardInputMap.delete(input);
                    }
                }
            }
        }
        /*
    public onTouchStart(): void {
        if (!this._firstTouchStartTriggered) {
            this.onFirstTouchStart();
        }
    }

    private _firstTouchStartTriggered: boolean = false;
    private onFirstTouchStart(): void {
        let movePad = new PlayerInputMovePad(this.player);
        movePad.connectInput(true);
        
        let headPad = new PlayerInputHeadPad(this.player);
        headPad.connectInput(false);
        this._firstTouchStartTriggered = true;

        document.getElementById("touch-menu").style.display = "block";
        document.getElementById("touch-jump").style.display = "block";

        this.main.isTouch = true;
    }
    */
        addKeyDownListener(callback) {
            this.keyDownListeners.push(callback);
        }
        addMappedKeyDownListener(k, callback) {
            let listeners = this.mappedKeyDownListeners.get(k);
            if (listeners) {
                listeners.push(callback);
            }
            else {
                listeners = [callback];
                this.mappedKeyDownListeners.set(k, listeners);
            }
        }
        removeKeyDownListener(callback) {
            let i = this.keyDownListeners.indexOf(callback);
            if (i != -1) {
                this.keyDownListeners.splice(i, 1);
            }
        }
        removeMappedKeyDownListener(k, callback) {
            let listeners = this.mappedKeyDownListeners.get(k);
            if (listeners) {
                let i = listeners.indexOf(callback);
                if (i != -1) {
                    listeners.splice(i, 1);
                }
            }
        }
        addKeyUpListener(callback) {
            this.keyUpListeners.push(callback);
        }
        addMappedKeyUpListener(k, callback) {
            let listeners = this.mappedKeyUpListeners.get(k);
            if (listeners) {
                listeners.push(callback);
            }
            else {
                listeners = [callback];
                this.mappedKeyUpListeners.set(k, listeners);
            }
        }
        removeKeyUpListener(callback) {
            let i = this.keyUpListeners.indexOf(callback);
            if (i != -1) {
                this.keyUpListeners.splice(i, 1);
            }
        }
        removeMappedKeyUpListener(k, callback) {
            let listeners = this.mappedKeyUpListeners.get(k);
            if (listeners) {
                let i = listeners.indexOf(callback);
                if (i != -1) {
                    listeners.splice(i, 1);
                }
            }
        }
        isKeyInputDown(keyInput) {
            return this.keyInputDown.contains(keyInput);
        }
    }
    Nabu.InputManager = InputManager;
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
    function RoundTowardZero(n) {
        if (n < 0) {
            return Math.ceil(n);
        }
        return Math.floor(n);
    }
    Nabu.RoundTowardZero = RoundTowardZero;
    function In0_2PIRange(angle) {
        while (angle < 0) {
            angle += 2 * Math.PI;
        }
        while (angle >= 2 * Math.PI) {
            angle -= 2 * Math.PI;
        }
        return angle;
    }
    Nabu.In0_2PIRange = In0_2PIRange;
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
    function RoundPow2(n) {
        let floor = Nabu.Pow2(Nabu.FloorPow2Exponent(n));
        let ceil = Nabu.Pow2(Nabu.CeilPow2Exponent(n));
        if (Math.abs(floor - n) <= Math.abs(ceil - n)) {
            return floor;
        }
        else {
            return ceil;
        }
    }
    Nabu.RoundPow2 = RoundPow2;
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
    function TERP(t, a, b, c, d) {
        return 0.5 * (c - a + (2.0 * a - 5.0 * b + 4.0 * c - d + (3.0 * (b - c) + d - a) * t) * t) * t + b;
    }
    function BicubicInterpolate(x, y, v00, v10, v20, v30, v01, v11, v21, v31, v02, v12, v22, v32, v03, v13, v23, v33) {
        let i0 = TERP(x, v00, v10, v20, v30);
        let i1 = TERP(x, v01, v11, v21, v31);
        let i2 = TERP(x, v02, v12, v22, v32);
        let i3 = TERP(x, v03, v13, v23, v33);
        return TERP(y, i0, i1, i2, i3);
    }
    Nabu.BicubicInterpolate = BicubicInterpolate;
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
        get array() {
            return this._elements;
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
    class Vector2 {
        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }
        static DistanceSquared(v1, v2) {
            return (v2.x - v1.x) * (v2.x - v1.x) + (v2.y - v1.y) * (v2.y - v1.y);
        }
        static Distance(v1, v2) {
            return Math.sqrt(Vector2.DistanceSquared(v1, v2));
        }
        static AverageToRef(ref, ...vectors) {
            let l = vectors.length;
            if (l >= 1) {
                ref.x = 0;
                ref.y = 0;
                for (let i = 0; i < vectors.length; i++) {
                    ref.addInPlace(vectors[i]);
                }
                ref.scaleInPlace(1 / l);
            }
            return ref;
        }
        static Average(...vectors) {
            let v = new Vector2();
            Vector2.AverageToRef(v, ...vectors);
            return v;
        }
        addInPlace(other) {
            this.x += other.x;
            this.y += other.y;
            return this;
        }
        scaleInPlace(s) {
            this.x *= s;
            this.y *= s;
            return this;
        }
    }
    Nabu.Vector2 = Vector2;
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
    class CellMap {
        constructor(_cellMapGenerator, iMap, jMap) {
            this._cellMapGenerator = _cellMapGenerator;
            this.iMap = iMap;
            this.jMap = jMap;
            this.min = 0;
            this.max = 0;
            this.lastUsageTime = performance.now();
        }
        get(i, j) {
            return this.data[i + j * CellMapGenerator.MAP_SIZE];
        }
    }
    Nabu.CellMap = CellMap;
    class BiomeWeight {
        constructor(valueA, weightA, valueB, weightB, valueC, weightC) {
            if (weightC) {
                if (weightA >= weightB && weightA >= weightC) {
                    this.v1 = valueA;
                    this.w1 = weightA;
                    if (weightB >= weightC) {
                        this.v2 = valueB;
                        this.w2 = weightB;
                        this.v3 = valueC;
                        this.w3 = weightC;
                    }
                    else {
                        this.v2 = valueC;
                        this.w2 = weightC;
                        this.v3 = valueB;
                        this.w3 = weightB;
                    }
                }
                else if (weightB >= weightA && weightB >= weightC) {
                    this.v1 = valueB;
                    this.w1 = weightB;
                    if (weightA >= weightC) {
                        this.v2 = valueA;
                        this.w2 = weightA;
                        this.v3 = valueC;
                        this.w3 = weightC;
                    }
                    else {
                        this.v2 = valueC;
                        this.w2 = weightC;
                        this.v3 = valueA;
                        this.w3 = weightA;
                    }
                }
                else if (weightC >= weightA && weightC >= weightB) {
                    this.v1 = valueC;
                    this.w1 = weightC;
                    if (weightA >= weightB) {
                        this.v2 = valueA;
                        this.w2 = weightA;
                        this.v3 = valueB;
                        this.w3 = weightB;
                    }
                    else {
                        this.v2 = valueB;
                        this.w2 = weightB;
                        this.v3 = valueA;
                        this.w3 = weightA;
                    }
                }
                /*
                this.w1 = Easing.easeInOutSine(this.w1);
                this.w2 = Easing.easeInOutSine(this.w2);
                this.w3 = Easing.easeInOutSine(this.w3);
                let l = this.w1 + this.w2 + this.w3;
                this.w1 /= l;
                this.w2 /= l;
                this.w3 /= l;
                */
            }
            else if (weightB) {
                if (weightA >= weightB) {
                    this.v1 = valueA;
                    this.w1 = weightA;
                    this.v2 = valueB;
                    this.w2 = weightB;
                }
                else {
                    this.v1 = valueB;
                    this.w1 = weightB;
                    this.v2 = valueA;
                    this.w2 = weightA;
                }
                /*
                this.w1 = Easing.easeInOutSine(this.w1);
                this.w2 = Easing.easeInOutSine(this.w2);
                let l = this.w1 + this.w2;
                this.w1 /= l;
                this.w2 /= l;
                */
            }
            else {
                this.v1 = valueA;
                this.w1 = 1;
            }
        }
    }
    Nabu.BiomeWeight = BiomeWeight;
    class CellMapGenerator {
        constructor(seededMap, cellSize, pixelSize = 8) {
            this.seededMap = seededMap;
            this.cellSize = cellSize;
            this.pixelSize = pixelSize;
            this.maxFrameTimeMS = 15;
            this.maxCachedMaps = 20;
            this.cellMaps = [];
            this.kernel = [{ v: 0, d: 1 }, { v: 0, d: 1 }, { v: 0, d: 1 }, { v: 0, d: 1 }];
            this.voronoiDiagram = new Nabu.VoronoiDiagram(cellSize, 0.5);
        }
        getMap(IMap, JMap) {
            let map = this.cellMaps.find((map) => {
                return map.iMap === IMap && map.jMap === JMap;
            });
            if (!map) {
                map = new CellMap(this, IMap, JMap);
                this.generateMapData(map);
                this.cellMaps.push(map);
                this.updateDetailedCache();
            }
            map.lastUsageTime = performance.now();
            return map;
        }
        getValue(iGlobal, jGlobal) {
            let l = CellMapGenerator.MAP_SIZE * this.pixelSize;
            let map = this.getMap(Math.floor(iGlobal / l), Math.floor(jGlobal / l));
            let i = Math.floor((iGlobal % l) / this.pixelSize);
            let j = Math.floor((jGlobal % l) / this.pixelSize);
            return map.data[i + j * CellMapGenerator.MAP_SIZE];
        }
        getBiomeWeights(iGlobal, jGlobal) {
            let di = (iGlobal % this.pixelSize) / this.pixelSize;
            let dj = (jGlobal % this.pixelSize) / this.pixelSize;
            let a = this.kernel[0].v = this.getValue(iGlobal, jGlobal);
            let b = this.kernel[1].v = this.getValue((iGlobal + this.pixelSize), jGlobal);
            let c = this.kernel[2].v = this.getValue((iGlobal + this.pixelSize), (jGlobal + this.pixelSize));
            let d = this.kernel[3].v = this.getValue(iGlobal, (jGlobal + this.pixelSize));
            if (a === b && a === c && a === d) {
                return { v1: this.kernel[0].v, w1: 1 };
            }
            if (a === b && c === d) {
                let w = 1 - dj;
                return new BiomeWeight(a, w, c, 1 - w);
            }
            if (a === d && b === c) {
                let w = 1 - di;
                return new BiomeWeight(a, w, b, 1 - w);
            }
            if (b === c && c === d) {
                let w = 1 - Nabu.MinMax(Math.sqrt(di * di + dj * dj), 0, 1);
                return new BiomeWeight(a, w, b, 1 - w);
            }
            if (a === c && c === d) {
                let w = 1 - Nabu.MinMax(Math.sqrt((1 - di) * (1 - di) + dj * dj), 0, 1);
                return new BiomeWeight(b, w, a, 1 - w);
            }
            if (a === b && b === d) {
                let w = 1 - Nabu.MinMax(Math.sqrt((1 - di) * (1 - di) + (1 - dj) * (1 - dj)), 0, 1);
                return new BiomeWeight(c, w, a, 1 - w);
            }
            if (a === b && b === c) {
                let w = 1 - Nabu.MinMax(Math.sqrt(di * di + (1 - dj) * (1 - dj)), 0, 1);
                return new BiomeWeight(d, w, a, 1 - w);
            }
            if (a === b) {
                let wA = 1 - dj;
                let wC = 1 - Nabu.MinMax(Math.sqrt((1 - di) * (1 - di) + (1 - dj) * (1 - dj)), 0, 1);
                let wD = 1 - Nabu.MinMax(Math.sqrt(di * di + (1 - dj) * (1 - dj)), 0, 1);
                let l = wA + wC + wD;
                return new BiomeWeight(a, wA / l, c, wC / l, d, wD / l);
            }
            if (b === c) {
                let wB = di;
                let wA = 1 - Nabu.MinMax(Math.sqrt(di * di + dj * dj), 0, 1);
                let wD = 1 - Nabu.MinMax(Math.sqrt(di * di + (1 - dj) * (1 - dj)), 0, 1);
                let l = wA + wB + wD;
                return new BiomeWeight(b, wB / l, a, wA / l, d, wD / l);
            }
            if (c === d) {
                let wC = dj;
                let wA = 1 - Nabu.MinMax(Math.sqrt(di * di + dj * dj), 0, 1);
                let wB = 1 - Nabu.MinMax(Math.sqrt((1 - di) * (1 - di) + dj * dj), 0, 1);
                let l = wA + wC + wB;
                return new BiomeWeight(c, wC / l, b, wB / l, a, wA / l);
            }
            if (a === d) {
                let wA = 1 - di;
                let wB = 1 - Nabu.MinMax(Math.sqrt((1 - di) * (1 - di) + dj * dj), 0, 1);
                let wC = 1 - Nabu.MinMax(Math.sqrt((1 - di) * (1 - di) + (1 - dj) * (1 - dj)), 0, 1);
                let l = wA + wB + wC;
                return new BiomeWeight(c, wC / l, b, wB / l, a, wA / l);
            }
            return { v1: 0, w1: 1 };
        }
        updateDetailedCache() {
            while (this.cellMaps.length > this.maxCachedMaps) {
                this.cellMaps = this.cellMaps.sort((a, b) => {
                    return a.lastUsageTime - b.lastUsageTime;
                });
                this.cellMaps.splice(0, 1);
            }
        }
        generateMapData(map) {
            let IMap = map.iMap;
            let JMap = map.jMap;
            map.data = this.voronoiDiagram.getValues(CellMapGenerator.MAP_SIZE, IMap, JMap);
        }
    }
    CellMapGenerator.MAP_SIZE = 1024;
    Nabu.CellMapGenerator = CellMapGenerator;
})(Nabu || (Nabu = {}));
var Nabu;
(function (Nabu) {
    class MasterSeed {
        static GetFor(name) {
            let masterSeed = new Uint8ClampedArray(MasterSeed.BaseSeed);
            for (let i = 0; i < masterSeed.length; i++) {
                masterSeed[i] = masterSeed[i] ^ name.charCodeAt(i % name.length);
            }
            return masterSeed;
        }
    }
    MasterSeed.BaseSeed = new Uint8ClampedArray([
        161, 230, 19, 231, 240, 195, 189, 19, 206, 120, 135, 15, 5, 43, 129, 94, 184, 97, 143, 120, 3, 147, 12, 42, 53, 108, 200, 121, 36, 175, 175, 36, 131, 119, 196, 9, 35, 226, 215, 169, 210, 224, 198, 104, 19, 224, 186, 209, 223, 96, 94, 247, 36, 203, 87, 7, 229, 242, 118, 209, 75, 181, 82, 140, 50, 213, 202, 165, 204, 72, 159, 57, 159, 142, 228, 187, 103, 187, 68, 219, 102, 108, 149, 162,
        57, 124, 214, 51, 18, 236, 184, 139, 79, 153, 42, 36, 162, 110, 90, 231, 68, 0, 202, 80, 243, 85, 157, 63, 55, 42, 169, 234, 238, 250, 203, 118, 41, 15, 198, 46, 250, 147, 195, 174, 15, 150, 162, 86, 205, 107, 185, 60, 57, 28, 144, 217, 216, 7, 74, 252, 245, 79, 31, 10, 40, 70, 113, 35, 43, 206, 116, 52, 179, 173, 220, 36, 143, 135, 114, 203, 118, 173, 107, 245, 76, 183, 242, 220, 158,
        133, 157, 215, 57, 147, 70, 148, 138, 234, 47, 195, 90, 30, 29, 106, 13, 68, 123, 161, 179, 162, 46, 159, 84, 129, 168, 254, 210, 18, 74, 223, 97, 240, 234, 46, 49, 46, 164, 217, 27, 152, 157,
    ]);
    Nabu.MasterSeed = MasterSeed;
})(Nabu || (Nabu = {}));
var Nabu;
(function (Nabu) {
    class Point {
        constructor(map, i = 0, j = 0, value = 0) {
            this.map = map;
            this.i = i;
            this.j = j;
            this.value = value;
            this.iGlobal = this.map.iMap * PointsMapGenerator.MAP_SIZE + this.i;
            this.jGlobal = this.map.jMap * PointsMapGenerator.MAP_SIZE + this.j;
        }
    }
    Nabu.Point = Point;
    class PointsMap {
        constructor(pointsMapGenerator, iMap, jMap) {
            this.pointsMapGenerator = pointsMapGenerator;
            this.iMap = iMap;
            this.jMap = jMap;
            this.points = [];
            this.min = 0;
            this.max = 0;
            this.lastUsageTime = performance.now();
        }
    }
    Nabu.PointsMap = PointsMap;
    class PointsMapGenerator {
        constructor(seededMap) {
            this.seededMap = seededMap;
            this.maxFrameTimeMS = 15;
            this.maxCachedMaps = 1000;
            this.pointsMaps = [];
        }
        getPointsToRef(iGlobalMin, iGlobalMax, jGlobalMin, jGlobalMax, ref) {
            let index = 0;
            let IMapMin = Math.floor(iGlobalMin / PointsMapGenerator.MAP_SIZE);
            let IMapMax = Math.ceil(iGlobalMax / PointsMapGenerator.MAP_SIZE);
            let JMapMin = Math.floor(jGlobalMin / PointsMapGenerator.MAP_SIZE);
            let JMapMax = Math.ceil(jGlobalMax / PointsMapGenerator.MAP_SIZE);
            for (let iMap = IMapMin; iMap <= IMapMax; iMap++) {
                for (let jMap = JMapMin; jMap <= JMapMax; jMap++) {
                    let map = this.getMap(iMap, jMap);
                    map.points.forEach(point => {
                        if (point.iGlobal >= iGlobalMin && point.iGlobal <= iGlobalMax) {
                            if (point.jGlobal >= jGlobalMin && point.jGlobal <= jGlobalMax) {
                                ref[index] = point;
                                index++;
                            }
                        }
                    });
                }
            }
            ref[index] = undefined;
        }
        getMap(IMap, JMap) {
            let map = this.pointsMaps.find((map) => {
                return map.iMap === IMap && map.jMap === JMap;
            });
            if (!map) {
                map = new PointsMap(this, IMap, JMap);
                this.generateMapData(map);
                this.pointsMaps.push(map);
                this.updateDetailedCache();
            }
            map.lastUsageTime = performance.now();
            return map;
        }
        updateDetailedCache() {
            while (this.pointsMaps.length > this.maxCachedMaps) {
                this.pointsMaps = this.pointsMaps.sort((a, b) => {
                    return a.lastUsageTime - b.lastUsageTime;
                });
                this.pointsMaps.splice(0, 1);
            }
        }
        generateMapData(map) {
            map.points = [];
            let n = 50;
            for (let i = 0; i < n; i++) {
                let point = new Point(map, Math.floor(Math.random() * PointsMapGenerator.MAP_SIZE), Math.floor(Math.random() * PointsMapGenerator.MAP_SIZE), Math.floor(Math.random() * 2));
                map.points.push(point);
            }
        }
    }
    PointsMapGenerator.MAP_SIZE = 256;
    Nabu.PointsMapGenerator = PointsMapGenerator;
})(Nabu || (Nabu = {}));
var Nabu;
(function (Nabu) {
    class SeedMap {
        constructor(name, size) {
            this.name = name;
            this.size = size;
            this._data = new Uint8ClampedArray(this.size * this.size);
        }
        getData(i, j) {
            i = i % this.size;
            j = j % this.size;
            return this._data[i + j * this.size];
        }
        setData(i, j, v) {
            this._data[i + j * this.size] = v;
        }
        randomFill() {
            for (let i = 0; i < this._data.length; i++) {
                this._data[i] = Math.floor(Math.random() * 128 + 64);
            }
        }
        fillFromBaseSeedMap(baseSeedMap, n, IMap, JMap) {
            for (let i = 0; i < this.size; i++) {
                for (let j = 0; j < this.size; j++) {
                    let I = i + this.size * IMap;
                    let J = j + this.size * JMap;
                    this._data[i + j * this.size] = baseSeedMap[I + J * n];
                }
            }
        }
        fillFromPNG(url) {
            return new Promise((resolve) => {
                let image = document.createElement("img");
                image.src = url;
                image.onload = () => {
                    let canvas = document.createElement("canvas");
                    this.size = Math.min(image.width, image.height);
                    this._data = new Uint8ClampedArray(this.size * this.size);
                    canvas.height = this.size;
                    let ctx = canvas.getContext("2d");
                    ctx.drawImage(image, 0, 0);
                    let imgData = ctx.getImageData(0, 0, this.size, this.size).data;
                    for (let i = 0; i < this._data.length; i++) {
                        this._data[i] = imgData[4 * i];
                    }
                    resolve();
                };
            });
        }
        downloadAsPNG() {
            let canvas = document.createElement("canvas");
            canvas.width = this.size;
            canvas.height = this.size;
            let context = canvas.getContext("2d");
            let pixels = new Uint8ClampedArray(this._data.length * 4);
            for (let i = 0; i < this._data.length; i++) {
                pixels[4 * i] = this._data[i];
                pixels[4 * i + 1] = this._data[i];
                pixels[4 * i + 2] = this._data[i];
                pixels[4 * i + 3] = 255;
            }
            context.putImageData(new ImageData(pixels, this.size, this.size), 0, 0);
            var a = document.createElement("a");
            a.setAttribute("href", canvas.toDataURL());
            a.setAttribute("download", this.name + ".png");
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }
    Nabu.SeedMap = SeedMap;
})(Nabu || (Nabu = {}));
var Nabu;
(function (Nabu) {
    class SeededMap {
        constructor(N, size) {
            this.N = N;
            this.size = size;
            this.seedMaps = [];
            this.primes = [1, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
        }
        static CreateFromMasterSeed(masterSeed, N, size) {
            let seededMap = new SeededMap(N, size);
            let l = N * size;
            let L = l * l;
            let baseSeedMap = new Uint8ClampedArray(L);
            let index = 0;
            let masterSeedLength = masterSeed.length;
            let start = 0;
            while (index < L) {
                for (let i = 0; i < masterSeedLength; i++) {
                    if (index < L) {
                        baseSeedMap[index] = masterSeed[(i + start) % masterSeedLength];
                    }
                    index++;
                }
                start++;
            }
            for (let counts = 0; counts < 4; counts++) {
                let clonedBaseSeedMap = new Uint8ClampedArray(baseSeedMap);
                for (let i = 0; i < l; i++) {
                    for (let j = 0; j < l; j++) {
                        let i2 = (i + 1) % l;
                        if (i % 2 === 1) {
                            i2 = (i - 1 + l) % l;
                        }
                        baseSeedMap[i + j * l] = clonedBaseSeedMap[i2 + j * l];
                    }
                }
                clonedBaseSeedMap = new Uint8ClampedArray(baseSeedMap);
                for (let i = 0; i < l; i++) {
                    for (let j = 0; j < l; j++) {
                        let j2 = (j + 1) % l;
                        if (j % 2 === 1) {
                            j2 = (j - 1 + l) % l;
                        }
                        baseSeedMap[i + j * l] = clonedBaseSeedMap[i + j2 * l];
                    }
                }
                for (let i = 1; i < L; i++) {
                    baseSeedMap[i] = baseSeedMap[i] ^ baseSeedMap[i - 1];
                }
            }
            seededMap.seedMaps = [];
            for (let i = 0; i < seededMap.N; i++) {
                seededMap.seedMaps[i] = [];
                for (let j = 0; j < seededMap.N; j++) {
                    seededMap.seedMaps[i][j] = new Nabu.SeedMap("seedmap-" + i + "-" + j, seededMap.size);
                    seededMap.seedMaps[i][j].fillFromBaseSeedMap(baseSeedMap, N * size, i, j);
                }
            }
            seededMap.debugBaseSeedMap = baseSeedMap;
            /*
        let sorted = baseSeedMap.sort((a, b) => { return a - b; });
        console.log("#0 " + sorted[0]);
        for (let d = 10; d < 100; d += 10) {
            console.log("#" + d.toFixed(0) + " " + (sorted[Math.floor(d / 100 * L)] / 255 * 100).toFixed(2));
        }
        console.log("#100 " + sorted[L - 1]);
        */
            return seededMap;
        }
        static CreateWithRandomFill(N, size) {
            let seededMap = new SeededMap(N, size);
            seededMap.seedMaps = [];
            for (let i = 0; i < seededMap.N; i++) {
                seededMap.seedMaps[i] = [];
                for (let j = 0; j < seededMap.N; j++) {
                    seededMap.seedMaps[i][j] = new Nabu.SeedMap("seedmap-" + i + "-" + j, seededMap.size);
                    seededMap.seedMaps[i][j].randomFill();
                }
            }
            return seededMap;
        }
        getValue(i, j, d) {
            i = Math.max(i, 0);
            j = Math.max(j, 0);
            let di = this.primes[(Math.floor(i / (this.size * this.N)) + d) % this.primes.length];
            let dj = this.primes[(Math.floor(j / (this.size * this.N)) + d) % this.primes.length];
            if (!isFinite(di)) {
                di = 1;
            }
            if (!isFinite(dj)) {
                dj = 1;
            }
            let IMap = (i + Math.floor(i / this.size)) % this.N;
            let JMap = (j + Math.floor(j / this.size)) % this.N;
            return this.seedMaps[IMap][JMap].getData(i * di, j * dj);
        }
        downloadAsPNG(size, d = 0) {
            let canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            let data = new Uint8ClampedArray(size * size);
            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    data[i + j * size] = this.getValue(i, j, d);
                }
            }
            let context = canvas.getContext("2d");
            let pixels = new Uint8ClampedArray(data.length * 4);
            for (let i = 0; i < data.length; i++) {
                let v = Math.floor(data[i] / 32) * 32;
                pixels[4 * i] = v;
                pixels[4 * i + 1] = v;
                pixels[4 * i + 2] = v;
                pixels[4 * i + 3] = 255;
            }
            context.putImageData(new ImageData(pixels, size, size), 0, 0);
            var a = document.createElement("a");
            a.setAttribute("href", canvas.toDataURL());
            a.setAttribute("download", "genMap.png");
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
        downloadDebugBaseSeedAsPNG() {
            let size = this.N * this.size;
            let canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            let context = canvas.getContext("2d");
            let pixels = new Uint8ClampedArray(this.debugBaseSeedMap.length * 4);
            for (let i = 0; i < this.debugBaseSeedMap.length; i++) {
                let v = Math.floor(this.debugBaseSeedMap[i] / 32) * 32;
                pixels[4 * i] = v;
                pixels[4 * i + 1] = v;
                pixels[4 * i + 2] = v;
                pixels[4 * i + 3] = 255;
            }
            context.putImageData(new ImageData(pixels, size, size), 0, 0);
            var a = document.createElement("a");
            a.setAttribute("href", canvas.toDataURL());
            a.setAttribute("download", "genMap.png");
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }
    Nabu.SeededMap = SeededMap;
})(Nabu || (Nabu = {}));
var Nabu;
(function (Nabu) {
    class TerrainMap {
        constructor(_terrainMapGenerator, iMap, jMap) {
            this._terrainMapGenerator = _terrainMapGenerator;
            this.iMap = iMap;
            this.jMap = jMap;
            this.min = 0;
            this.max = 0;
            this.lastUsageTime = performance.now();
        }
        get(i, j) {
            return this.data[i + j * TerrainMapGenerator.MAP_SIZE];
        }
    }
    Nabu.TerrainMap = TerrainMap;
    class TerrainMapGenerator {
        constructor(seededMap, periods) {
            this.seededMap = seededMap;
            this.maxFrameTimeMS = 15;
            this.maxCachedMaps = 20;
            this.detailedMaps = [];
            this.mediumMaps = [];
            this.largeMaps = [];
            this.periods = [];
            if (typeof (periods) === "number") {
                this.periods = [Nabu.RoundPow2(periods)];
            }
            else {
                for (let i = 0; i < periods.length; i++) {
                    this.periods[i] = Nabu.RoundPow2(periods[i]);
                }
            }
            while (this.periods.length < TerrainMapGenerator.PERIODS_COUNT) {
                this.periods.push(Nabu.RoundPow2(this.periods[this.periods.length - 1] * 0.5));
            }
        }
        async getMap(IMap, JMap) {
            let map = this.detailedMaps.find((map) => {
                return map.iMap === IMap && map.jMap === JMap;
            });
            if (!map) {
                map = new TerrainMap(this, IMap, JMap);
                await this.generateMapData(map);
                this.detailedMaps.push(map);
                this.updateDetailedCache();
            }
            map.lastUsageTime = performance.now();
            return map;
        }
        updateDetailedCache() {
            while (this.detailedMaps.length > this.maxCachedMaps) {
                this.detailedMaps = this.detailedMaps.sort((a, b) => {
                    return a.lastUsageTime - b.lastUsageTime;
                });
                this.detailedMaps.splice(0, 1);
            }
        }
        async getMediumMap(IMap, JMap) {
            let map = this.mediumMaps.find((map) => {
                return map.iMap === IMap && map.jMap === JMap;
            });
            if (!map) {
                map = new TerrainMap(this, IMap, JMap);
                await this.generateMapData(map, TerrainMapGenerator.MEDIUM_MAP_PIXEL_SIZE);
                this.mediumMaps.push(map);
                this.updateMediumedCache();
            }
            map.lastUsageTime = performance.now();
            return map;
        }
        updateMediumedCache() {
            while (this.mediumMaps.length > this.maxCachedMaps) {
                this.mediumMaps = this.mediumMaps.sort((a, b) => {
                    return a.lastUsageTime - b.lastUsageTime;
                });
                this.mediumMaps.splice(0, 1);
            }
        }
        async getLargeMap(IMap, JMap) {
            let map = this.largeMaps.find((map) => {
                return map.iMap === IMap && map.jMap === JMap;
            });
            if (!map) {
                map = new TerrainMap(this, IMap, JMap);
                await this.generateMapData(map, TerrainMapGenerator.LARGE_MAP_PIXEL_SIZE);
                this.largeMaps.push(map);
                this.updateLargedCache();
            }
            map.lastUsageTime = performance.now();
            return map;
        }
        updateLargedCache() {
            while (this.largeMaps.length > this.maxCachedMaps) {
                this.largeMaps = this.largeMaps.sort((a, b) => {
                    return a.lastUsageTime - b.lastUsageTime;
                });
                this.largeMaps.splice(0, 1);
            }
        }
        async generateMapData(map, pixelSize = 1) {
            let IMap = map.iMap;
            let JMap = map.jMap;
            return new Promise(async (resolve) => {
                let values = [];
                for (let i = 0; i < TerrainMapGenerator.MAP_SIZE * TerrainMapGenerator.MAP_SIZE; i++) {
                    values[i] = 0;
                }
                // Bicubic version
                let f = 0.5;
                for (let degree = 0; degree < TerrainMapGenerator.PERIODS_COUNT; degree++) {
                    let l = this.periods[degree] / pixelSize;
                    if (l > TerrainMapGenerator.MAP_SIZE) {
                        let count = l / TerrainMapGenerator.MAP_SIZE;
                        let I0 = Math.floor(IMap / count);
                        let J0 = Math.floor(JMap / count);
                        let v00 = this.seededMap.getValue(I0 - 1, J0 - 1, degree);
                        let v10 = this.seededMap.getValue(I0 + 0, J0 - 1, degree);
                        let v20 = this.seededMap.getValue(I0 + 1, J0 - 1, degree);
                        let v30 = this.seededMap.getValue(I0 + 2, J0 - 1, degree);
                        let v01 = this.seededMap.getValue(I0 - 1, J0 + 0, degree);
                        let v11 = this.seededMap.getValue(I0 + 0, J0 + 0, degree);
                        let v21 = this.seededMap.getValue(I0 + 1, J0 + 0, degree);
                        let v31 = this.seededMap.getValue(I0 + 2, J0 + 0, degree);
                        let v02 = this.seededMap.getValue(I0 - 1, J0 + 1, degree);
                        let v12 = this.seededMap.getValue(I0 + 0, J0 + 1, degree);
                        let v22 = this.seededMap.getValue(I0 + 1, J0 + 1, degree);
                        let v32 = this.seededMap.getValue(I0 + 2, J0 + 1, degree);
                        let v03 = this.seededMap.getValue(I0 - 1, J0 + 2, degree);
                        let v13 = this.seededMap.getValue(I0 + 0, J0 + 2, degree);
                        let v23 = this.seededMap.getValue(I0 + 1, J0 + 2, degree);
                        let v33 = this.seededMap.getValue(I0 + 2, J0 + 2, degree);
                        let diMin = (IMap % count) / count;
                        let diMax = diMin + 1 / count;
                        let djMin = (JMap % count) / count;
                        let djMax = djMin + 1 / count;
                        let doStep = (jj) => {
                            for (let ii = 0; ii < TerrainMapGenerator.MAP_SIZE; ii++) {
                                let di = ii / TerrainMapGenerator.MAP_SIZE;
                                di = diMin * (1 - di) + diMax * di;
                                let dj = jj / TerrainMapGenerator.MAP_SIZE;
                                dj = djMin * (1 - dj) + djMax * dj;
                                values[ii + jj * TerrainMapGenerator.MAP_SIZE] += Nabu.BicubicInterpolate(di, dj, v00, v10, v20, v30, v01, v11, v21, v31, v02, v12, v22, v32, v03, v13, v23, v33) * f;
                            }
                        };
                        let t0 = performance.now();
                        for (let jj = 0; jj < TerrainMapGenerator.MAP_SIZE; jj++) {
                            let t1 = performance.now();
                            if (t1 - t0 < this.maxFrameTimeMS) {
                                doStep(jj);
                            }
                            else {
                                //console.log("break 1 at " + (t1 - t0).toFixed(3) + " ms");
                                await Nabu.NextFrame();
                                t0 = performance.now();
                                doStep(jj);
                            }
                        }
                    }
                    else if (l >= 2) {
                        let n = TerrainMapGenerator.MAP_SIZE / l;
                        let iOffset = IMap * n;
                        let jOffset = JMap * n;
                        let doStep = (j) => {
                            let v00 = this.seededMap.getValue(iOffset - 1, jOffset + j - 1, degree);
                            let v10 = this.seededMap.getValue(iOffset + 0, jOffset + j - 1, degree);
                            let v20 = this.seededMap.getValue(iOffset + 1, jOffset + j - 1, degree);
                            let v30 = this.seededMap.getValue(iOffset + 2, jOffset + j - 1, degree);
                            let v01 = this.seededMap.getValue(iOffset - 1, jOffset + j + 0, degree);
                            let v11 = this.seededMap.getValue(iOffset + 0, jOffset + j + 0, degree);
                            let v21 = this.seededMap.getValue(iOffset + 1, jOffset + j + 0, degree);
                            let v31 = this.seededMap.getValue(iOffset + 2, jOffset + j + 0, degree);
                            let v02 = this.seededMap.getValue(iOffset - 1, jOffset + j + 1, degree);
                            let v12 = this.seededMap.getValue(iOffset + 0, jOffset + j + 1, degree);
                            let v22 = this.seededMap.getValue(iOffset + 1, jOffset + j + 1, degree);
                            let v32 = this.seededMap.getValue(iOffset + 2, jOffset + j + 1, degree);
                            let v03 = this.seededMap.getValue(iOffset - 1, jOffset + j + 2, degree);
                            let v13 = this.seededMap.getValue(iOffset + 0, jOffset + j + 2, degree);
                            let v23 = this.seededMap.getValue(iOffset + 1, jOffset + j + 2, degree);
                            let v33 = this.seededMap.getValue(iOffset + 2, jOffset + j + 2, degree);
                            for (let i = 0; i < n; i++) {
                                for (let ii = 0; ii < l; ii++) {
                                    for (let jj = 0; jj < l; jj++) {
                                        let di = ii / l;
                                        let dj = jj / l;
                                        values[i * l + ii + (j * l + jj) * TerrainMapGenerator.MAP_SIZE] += Nabu.BicubicInterpolate(di, dj, v00, v10, v20, v30, v01, v11, v21, v31, v02, v12, v22, v32, v03, v13, v23, v33) * f;
                                    }
                                }
                                if (i < n - 1) {
                                    v00 = v10;
                                    v10 = v20;
                                    v20 = v30;
                                    v30 = this.seededMap.getValue(iOffset + i + 1 + 2, jOffset + j - 1, degree);
                                    v01 = v11;
                                    v11 = v21;
                                    v21 = v31;
                                    v31 = this.seededMap.getValue(iOffset + i + 1 + 2, jOffset + j + 0, degree);
                                    v02 = v12;
                                    v12 = v22;
                                    v22 = v32;
                                    v32 = this.seededMap.getValue(iOffset + i + 1 + 2, jOffset + j + 1, degree);
                                    v03 = v13;
                                    v13 = v23;
                                    v23 = v33;
                                    v33 = this.seededMap.getValue(iOffset + i + 1 + 2, jOffset + j + 2, degree);
                                }
                            }
                        };
                        let t0 = performance.now();
                        for (let j = 0; j < n; j++) {
                            let t1 = performance.now();
                            if (t1 - t0 < this.maxFrameTimeMS) {
                                doStep(j);
                            }
                            else {
                                //console.log("break 2 at " + (t1 - t0).toFixed(3) + " ms");
                                await Nabu.NextFrame();
                                t0 = performance.now();
                                doStep(j);
                            }
                        }
                    }
                    l = l / 2;
                    f = f / 2;
                    await Nabu.NextFrame();
                }
                map.min = 255;
                map.max = 0;
                for (let i = 0; i < values.length; i++) {
                    let v = values[i];
                    map.min = Math.min(map.min, v);
                    map.max = Math.max(map.max, v);
                }
                map.data = new Uint8ClampedArray(values);
                resolve();
            });
        }
        async downloadAsPNG(IMap, JMap, size = 1, range = 0) {
            let canvas = document.createElement("canvas");
            canvas.width = TerrainMapGenerator.MAP_SIZE * size;
            canvas.height = TerrainMapGenerator.MAP_SIZE * size;
            let context = canvas.getContext("2d");
            for (let J = 0; J < size; J++) {
                for (let I = 0; I < size; I++) {
                    let map;
                    if (range === 0) {
                        map = await this.getMap(IMap + I, JMap + J);
                    }
                    else if (range === 1) {
                        map = await this.getMediumMap(IMap + I, JMap + J);
                    }
                    else if (range === 2) {
                        map = await this.getLargeMap(IMap + I, JMap + J);
                    }
                    let pixels = new Uint8ClampedArray(map.data.length * 4);
                    for (let i = 0; i < map.data.length; i++) {
                        let v = map.data[i];
                        pixels[4 * i] = v;
                        pixels[4 * i + 1] = v;
                        pixels[4 * i + 2] = v;
                        pixels[4 * i + 3] = 255;
                    }
                    context.putImageData(new ImageData(pixels, TerrainMapGenerator.MAP_SIZE, TerrainMapGenerator.MAP_SIZE), I * TerrainMapGenerator.MAP_SIZE, J * TerrainMapGenerator.MAP_SIZE);
                }
            }
            var ranges = ["detailed", "medium", "large"];
            var a = document.createElement("a");
            a.setAttribute("href", canvas.toDataURL());
            a.setAttribute("download", "terrainMap_" + ranges[range] + "_" + IMap + "_" + JMap + ".png");
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }
    TerrainMapGenerator.PERIODS_COUNT = 7;
    TerrainMapGenerator.MAP_SIZE = 1024;
    TerrainMapGenerator.MEDIUM_MAP_PIXEL_SIZE = 8;
    TerrainMapGenerator.LARGE_MAP_PIXEL_SIZE = 256;
    Nabu.TerrainMapGenerator = TerrainMapGenerator;
})(Nabu || (Nabu = {}));
var Nabu;
(function (Nabu) {
    class VoronoiCell {
        constructor(diagram, i, j) {
            this.diagram = diagram;
            this.i = i;
            this.j = j;
            this.value = 0;
            this.edges = new Nabu.UniqueList();
            this.center = new Nabu.Vector2();
            this.value = Math.floor(Math.random() * 3);
        }
        getColor() {
            let c = "#";
            if (this.value & 1) {
                c += "ff";
            }
            else {
                c += "00";
            }
            if (this.value & 2) {
                c += "ff";
            }
            else {
                c += "00";
            }
            if (this.value & 4) {
                c += "ff";
            }
            else {
                c += "00";
            }
            return c;
        }
        getPolygon() {
            if (this.polygon) {
                return this.polygon;
            }
            // create connections
            let cell00 = this.diagram.getCell(this.i - 1, this.j - 1);
            let cell10 = this.diagram.getCell(this.i + 0, this.j - 1);
            let cell20 = this.diagram.getCell(this.i + 1, this.j - 1);
            let cell01 = this.diagram.getCell(this.i - 1, this.j + 0);
            let cell11 = this;
            let cell21 = this.diagram.getCell(this.i + 1, this.j + 0);
            let cell02 = this.diagram.getCell(this.i - 1, this.j + 1);
            let cell12 = this.diagram.getCell(this.i + 0, this.j + 1);
            let cell22 = this.diagram.getCell(this.i + 1, this.j + 1);
            this.connect(cell10);
            this.connect(cell01);
            this.connect(cell21);
            this.connect(cell12);
            if (Nabu.Vector2.DistanceSquared(cell00.center, cell11.center) < Nabu.Vector2.DistanceSquared(cell10.center, cell01.center)) {
                cell00.connect(cell11);
            }
            else {
                cell10.connect(cell01);
            }
            if (Nabu.Vector2.DistanceSquared(cell10.center, cell21.center) < Nabu.Vector2.DistanceSquared(cell20.center, cell11.center)) {
                cell10.connect(cell21);
            }
            else {
                cell20.connect(cell11);
            }
            if (Nabu.Vector2.DistanceSquared(cell01.center, cell12.center) < Nabu.Vector2.DistanceSquared(cell11.center, cell02.center)) {
                cell01.connect(cell12);
            }
            else {
                cell11.connect(cell02);
            }
            if (Nabu.Vector2.DistanceSquared(cell11.center, cell22.center) < Nabu.Vector2.DistanceSquared(cell21.center, cell12.center)) {
                cell11.connect(cell22);
            }
            else {
                cell21.connect(cell12);
            }
            this.polygon = [];
            if (this.isConnectedTo(cell20)) {
                this.polygon.push(Nabu.Vector2.Average(cell11.center, cell10.center, cell20.center));
                this.polygon.push(Nabu.Vector2.Average(cell11.center, cell20.center, cell21.center));
            }
            else {
                this.polygon.push(Nabu.Vector2.Average(cell11.center, cell10.center, cell21.center));
            }
            if (this.isConnectedTo(cell22)) {
                this.polygon.push(Nabu.Vector2.Average(cell11.center, cell21.center, cell22.center));
                this.polygon.push(Nabu.Vector2.Average(cell11.center, cell22.center, cell12.center));
            }
            else {
                this.polygon.push(Nabu.Vector2.Average(cell11.center, cell21.center, cell12.center));
            }
            if (this.isConnectedTo(cell02)) {
                this.polygon.push(Nabu.Vector2.Average(cell11.center, cell12.center, cell02.center));
                this.polygon.push(Nabu.Vector2.Average(cell11.center, cell02.center, cell01.center));
            }
            else {
                this.polygon.push(Nabu.Vector2.Average(cell11.center, cell12.center, cell01.center));
            }
            if (this.isConnectedTo(cell00)) {
                this.polygon.push(Nabu.Vector2.Average(cell11.center, cell01.center, cell00.center));
                this.polygon.push(Nabu.Vector2.Average(cell11.center, cell00.center, cell10.center));
            }
            else {
                this.polygon.push(Nabu.Vector2.Average(cell11.center, cell01.center, cell10.center));
            }
            return this.polygon;
        }
        connect(other) {
            this.edges.push(other);
            other.edges.push(this);
        }
        isConnectedTo(other) {
            return this.edges.contains(other);
        }
    }
    Nabu.VoronoiCell = VoronoiCell;
    class VoronoiDiagram {
        constructor(cellSize, cellSpread = 0.5) {
            this.cellSize = cellSize;
            this.cellSpread = cellSpread;
            VoronoiDiagram.colors = [];
            for (let r = 0; r <= 1; r += 1) {
                for (let g = 0; g <= 1; g += 1) {
                    for (let b = 0; b <= 1; b += 1) {
                        for (let a = 1; a <= 1; a += 1) {
                            VoronoiDiagram.colors.push("#" + Math.floor(r * 255).toString(16).padStart(2, "0") + Math.floor(g * 255).toString(16).padStart(2, "0") + Math.floor(b * 255).toString(16).padStart(2, "0") + Math.floor(a * 255).toString(16).padStart(2, "0"));
                        }
                    }
                }
            }
        }
        getCell(i, j) {
            if (!this.cells) {
                this.cells = [];
            }
            if (!this.cells[i]) {
                this.cells[i] = [];
            }
            if (!this.cells[i][j]) {
                let cell = new VoronoiCell(this, i, j);
                cell.center.x = (i + 0.5) * this.cellSize + (Math.random() - 0.5) * this.cellSize * this.cellSpread;
                cell.center.y = (j + 0.5) * this.cellSize + (Math.random() - 0.5) * this.cellSize * this.cellSpread;
                this.cells[i][j] = cell;
            }
            return this.cells[i][j];
        }
        getValues(size, iMap = 0, jMap = 0) {
            let values = new Uint8ClampedArray(size * size);
            let canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            let context = canvas.getContext("2d");
            let count = Math.floor(size / this.cellSize);
            for (let i = 0; i <= count; i++) {
                for (let j = 0; j <= count; j++) {
                    let cell = this.getCell(i + iMap * count, j + jMap * count);
                    let polygon = cell.getPolygon();
                    context.fillStyle = cell.getColor();
                    context.strokeStyle = context.fillStyle;
                    context.beginPath();
                    context.moveTo(polygon[0].x, polygon[0].y);
                    for (let i = 1; i < polygon.length; i++) {
                        context.lineTo(polygon[i].x, polygon[i].y);
                    }
                    context.closePath();
                    context.stroke();
                    context.fill();
                }
            }
            let data = context.getImageData(0, 0, size, size);
            for (let i = 0; i < size * size; i++) {
                let r = Math.round(data.data[4 * i + 0] / 255);
                let g = Math.round(data.data[4 * i + 1] / 255);
                let b = Math.round(data.data[4 * i + 2] / 255);
                let v = r * 1 + g * 2 + b * 4;
                values[i] = v;
            }
            return values;
        }
        async downloadAsPNG(size) {
            let canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            let context = canvas.getContext("2d");
            let count = Math.floor(size / this.cellSize);
            for (let i = 0; i < count; i++) {
                for (let j = 0; j < count; j++) {
                    let cell = this.getCell(i, j);
                    let polygon = cell.getPolygon();
                    context.fillStyle = cell.getColor();
                    context.strokeStyle = context.fillStyle;
                    context.beginPath();
                    context.moveTo(polygon[0].x, polygon[0].y);
                    for (let i = 1; i < polygon.length; i++) {
                        context.lineTo(polygon[i].x, polygon[i].y);
                    }
                    context.closePath();
                    context.stroke();
                    context.fill();
                }
            }
            let data = context.getImageData(0, 0, size, size);
            for (let i = 0; i < data.data.length; i++) {
                data.data[i] = Math.round(data.data[i] / 256) * 256;
            }
            context.putImageData(new ImageData(data.data, size, size), 0, 0);
            var a = document.createElement("a");
            a.setAttribute("href", canvas.toDataURL());
            a.setAttribute("download", "voronoi_diagram.png");
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
        async downloadAsSirenPNG(size) {
            let image = document.createElement("img");
            image.src = "./datas/siren.png";
            image.onload = () => {
                let canvasSiren = document.createElement("canvas");
                canvasSiren.width = size;
                canvasSiren.height = size;
                let ctx = canvasSiren.getContext("2d");
                ctx.drawImage(image, 0, 0);
                let sirenData = ctx.getImageData(0, 0, size, size).data;
                let canvas = document.createElement("canvas");
                canvas.width = size;
                canvas.height = size;
                let context = canvas.getContext("2d");
                let count = Math.floor(size / this.cellSize);
                for (let i = 0; i < count; i++) {
                    for (let j = 0; j < count; j++) {
                        let cell = this.getCell(i, j);
                        let polygon = cell.getPolygon();
                        let r = sirenData[4 * (Math.floor(cell.center.x) + size * Math.floor(cell.center.y))];
                        let g = sirenData[4 * (Math.floor(cell.center.x) + size * Math.floor(cell.center.y)) + 1];
                        let b = sirenData[4 * (Math.floor(cell.center.x) + size * Math.floor(cell.center.y)) + 2];
                        let color = "#" + r.toString(16).padStart(2, "0") + g.toString(16).padStart(2, "0") + b.toString(16).padStart(2, "0");
                        //context.fillStyle = VoronoiDiagram.colors[Math.floor(Math.random() * VoronoiDiagram.colors.length)];
                        context.fillStyle = color;
                        context.beginPath();
                        context.moveTo(polygon[0].x, polygon[0].y);
                        for (let i = 1; i < polygon.length; i++) {
                            context.lineTo(polygon[i].x, polygon[i].y);
                        }
                        context.closePath();
                        context.fill();
                    }
                }
                var a = document.createElement("a");
                a.setAttribute("href", canvas.toDataURL());
                a.setAttribute("download", "voronoi_diagram.png");
                a.style.display = "none";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            };
        }
    }
    VoronoiDiagram.colors = [
        "#000000",
        "#ff0000",
        "#00ff00",
        "#0000ff",
        "#ffff00",
        "#00ffff",
        "#ff00ff",
        "#ffffff"
    ];
    Nabu.VoronoiDiagram = VoronoiDiagram;
})(Nabu || (Nabu = {}));
var Nabu;
(function (Nabu) {
    class DefaultPage extends HTMLElement {
        constructor() {
            super(...arguments);
            this._loading = false;
            this._loaded = false;
            this._shown = false;
            this._timout = -1;
            this._showing = false;
            this.onshow = () => { };
            this._hiding = false;
            this.onhide = () => { };
        }
        static get observedAttributes() {
            return [
                "file"
            ];
        }
        get loaded() {
            return this._loaded;
        }
        get shown() {
            return this._shown;
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
        async waitLoaded() {
            return new Promise(resolve => {
                let wait = () => {
                    if (this._loaded) {
                        resolve();
                    }
                    else {
                        requestAnimationFrame(wait);
                    }
                };
                wait();
            });
        }
        connectedCallback() {
            let file = this.getAttribute("file");
            if (file) {
                this.attributeChangedCallback("file", "", file);
            }
            this._shown = false;
            this.hide(0);
        }
        attributeChangedCallback(name, oldValue, newValue) {
            if (name === "file" && !this._loading) {
                if (this.isConnected) {
                    const xhttp = new XMLHttpRequest();
                    xhttp.onload = () => {
                        this.innerHTML = xhttp.responseText;
                        this.pointerBlocker = document.createElement("div");
                        this.pointerBlocker.style.position = "absolute";
                        this.pointerBlocker.style.left = "0";
                        this.pointerBlocker.style.top = "0";
                        this.pointerBlocker.style.width = "100%";
                        this.pointerBlocker.style.height = "100%";
                        this.pointerBlocker.style.zIndex = "10";
                        this.pointerBlocker.style.backgroundColor = "magenta";
                        this.pointerBlocker.style.opacity = "0";
                        this.appendChild(this.pointerBlocker);
                        this._loaded = true;
                        this._loading = false;
                        if (this._onLoad) {
                            this._onLoad();
                        }
                    };
                    xhttp.open("GET", newValue);
                    xhttp.send();
                    this._loading = true;
                }
            }
        }
        showFast() {
            clearTimeout(this._timout);
            this._shown = true;
            this.style.display = "";
            this.style.opacity = "1";
            this.onshow();
        }
        hideFast(duration = 1) {
            clearTimeout(this._timout);
            this._shown = false;
            this.style.opacity = "0";
            this.onhide();
            this._timout = setTimeout(() => {
                this.style.display = "none";
            }, duration * 1000);
        }
        async show(duration = 1) {
            return new Promise((resolve) => {
                this._showing = true;
                this._hiding = false;
                this._shown = true;
                this.style.display = "";
                this.onshow();
                let opacity0 = parseFloat(this.style.opacity);
                let opacity1 = 1;
                let t0 = performance.now();
                let step = () => {
                    if (this._hiding) {
                        return;
                    }
                    let t = performance.now();
                    let dt = (t - t0) / 1000;
                    if (dt >= duration) {
                        this.style.opacity = "1";
                        if (this.pointerBlocker) {
                            this.pointerBlocker.style.display = "none";
                        }
                        this._showing = false;
                        resolve();
                    }
                    else {
                        let f = dt / duration;
                        this.style.opacity = ((1 - f) * opacity0 + f * opacity1).toFixed(2);
                        requestAnimationFrame(step);
                    }
                };
                step();
            });
        }
        async hide(duration = 1) {
            if (!this._shown) {
                return;
            }
            return new Promise((resolve) => {
                this._showing = false;
                this._hiding = true;
                this.style.display = "";
                if (this.pointerBlocker) {
                    this.pointerBlocker.style.display = "";
                }
                let opacity0 = parseFloat(this.style.opacity);
                let opacity1 = 0;
                let t0 = performance.now();
                let step = () => {
                    if (this._showing) {
                        return;
                    }
                    let t = performance.now();
                    let dt = (t - t0) / 1000;
                    if (dt >= duration) {
                        this.style.display = "none";
                        this.style.opacity = "0";
                        this._shown = false;
                        this._hiding = false;
                        this.onhide();
                        resolve();
                    }
                    else {
                        let f = dt / duration;
                        this.style.opacity = ((1 - f) * opacity0 + f * opacity1).toFixed(2);
                        requestAnimationFrame(step);
                    }
                };
                step();
            });
        }
    }
    Nabu.DefaultPage = DefaultPage;
    customElements.define("default-page", DefaultPage);
})(Nabu || (Nabu = {}));
var Nabu;
(function (Nabu) {
    class NabuCheckBox extends HTMLElement {
        constructor() {
            super(...arguments);
            this.onChange = () => { };
        }
        static get observedAttributes() {
            return [
                "value"
            ];
        }
        connectedCallback() {
            this.onclick = () => {
                this.value = this.value === 1 ? 0 : 1;
            };
        }
        attributeChangedCallback(name, oldValue, newValue) {
            if (name === "value") {
                if (oldValue != newValue) {
                    this.setValue(parseInt(newValue));
                }
            }
        }
        get valueBool() {
            return this._value === 1 ? true : false;
        }
        get value() {
            return this._value;
        }
        set value(v) {
            this.setValue(v);
        }
        setValue(v) {
            let numV;
            if (typeof (v) === "boolean") {
                numV = v ? 1 : 0;
            }
            else {
                numV = v <= 0 ? 0 : 1;
            }
            if (numV != this._value) {
                this._value = numV;
                this.setAttribute("value", this._value.toFixed(0));
                if (this.onChange) {
                    this.onChange();
                }
            }
        }
    }
    Nabu.NabuCheckBox = NabuCheckBox;
    customElements.define("nabu-checkbox", NabuCheckBox);
})(Nabu || (Nabu = {}));
var Nabu;
(function (Nabu) {
    class OptionPage extends HTMLElement {
        constructor() {
            super(...arguments);
            this._loaded = false;
            this._shown = false;
        }
        static get observedAttributes() {
            return [];
        }
        get loaded() {
            return this._loaded;
        }
        get shown() {
            return this._shown;
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
        async waitLoaded() {
            return new Promise(resolve => {
                let wait = () => {
                    if (this._loaded) {
                        resolve();
                    }
                    else {
                        requestAnimationFrame(wait);
                    }
                };
                wait();
            });
        }
        connectedCallback() {
            try {
                navigator.getGamepads();
                this.isGamepadAllowed = true;
            }
            catch {
                this.isGamepadAllowed = false;
            }
            this.style.display = "none";
            this.style.opacity = "0";
            this.titleElement = document.createElement("h1");
            this.titleElement.innerHTML = "OPTIONS";
            this.appendChild(this.titleElement);
            this._containerFrame = document.createElement("div");
            this._containerFrame.classList.add("container-frame");
            this.appendChild(this._containerFrame);
            this._container = document.createElement("div");
            this._container.classList.add("container");
            this._containerFrame.appendChild(this._container);
            this.backButton = document.createElement("button");
            this.backButton.classList.add("back-button");
            this.backButton.innerHTML = "Back";
            this.appendChild(this.backButton);
            this._loaded = true;
        }
        attributeChangedCallback(name, oldValue, newValue) {
        }
        async show(duration = 1) {
            return new Promise((resolve) => {
                if (!this._shown) {
                    this._shown = true;
                    this.style.display = "block";
                    let opacity0 = parseFloat(this.style.opacity);
                    let opacity1 = 1;
                    let t0 = performance.now();
                    let step = () => {
                        let t = performance.now();
                        let dt = (t - t0) / 1000;
                        if (dt >= duration) {
                            this.style.opacity = "1";
                            resolve();
                        }
                        else {
                            let f = dt / duration;
                            this.style.opacity = ((1 - f) * opacity0 + f * opacity1).toFixed(2);
                            requestAnimationFrame(step);
                        }
                    };
                    step();
                }
            });
        }
        async hide(duration = 1) {
            if (duration === 0) {
                this._shown = false;
                this.style.display = "none";
                this.style.opacity = "0";
            }
            else {
                return new Promise((resolve) => {
                    if (this._shown) {
                        this._shown = false;
                        this.style.display = "block";
                        let opacity0 = parseFloat(this.style.opacity);
                        let opacity1 = 0;
                        let t0 = performance.now();
                        let step = () => {
                            let t = performance.now();
                            let dt = (t - t0) / 1000;
                            if (dt >= duration) {
                                this.style.display = "none";
                                this.style.opacity = "0";
                                resolve();
                            }
                            else {
                                let f = dt / duration;
                                this.style.opacity = ((1 - f) * opacity0 + f * opacity1).toFixed(2);
                                requestAnimationFrame(step);
                            }
                        };
                        step();
                    }
                });
            }
        }
        setConfiguration(configuration) {
            this.configuration = configuration;
            this.configuration.onValueChange = () => {
                this.updatePage();
            };
            this.updatePage();
        }
        updatePage() {
            this._container.innerHTML = "";
            let lastCategory;
            let lastInputProperty;
            let lastValueBlock;
            let categoryNames = this.configuration.overrideConfigurationElementCategoryName ? this.configuration.overrideConfigurationElementCategoryName : Nabu.ConfigurationElementCategoryName;
            for (let i = 0; i < this.configuration.configurationElements.length; i++) {
                let configElement = this.configuration.configurationElements[i];
                if (configElement.category != lastCategory) {
                    let h2 = document.createElement("h2");
                    h2.classList.add("category");
                    h2.innerHTML = categoryNames[configElement.category];
                    this._container.appendChild(h2);
                    lastCategory = configElement.category;
                }
                let property = configElement.property.split(".")[0];
                let valueBlock = lastValueBlock;
                if (property != lastInputProperty) {
                    let line = document.createElement("div");
                    line.classList.add("line");
                    this._container.appendChild(line);
                    let label = document.createElement("div");
                    label.classList.add("label");
                    if (configElement.type === Nabu.ConfigurationElementType.Input) {
                        label.classList.add("input");
                    }
                    label.innerHTML = configElement.prop.displayName;
                    label.style.display = "inline-block";
                    label.style.marginLeft = "1%";
                    label.style.marginRight = "1%";
                    label.style.paddingLeft = "1.5%";
                    label.style.paddingRight = "1.5%";
                    label.style.width = "45%";
                    line.appendChild(label);
                    valueBlock = document.createElement("div");
                    valueBlock.classList.add("value-block");
                    valueBlock.style.display = "inline-block";
                    valueBlock.style.marginLeft = "1%";
                    valueBlock.style.marginRight = "1%";
                    valueBlock.style.paddingLeft = "1.5%";
                    valueBlock.style.paddingRight = "1.5%";
                    valueBlock.style.width = "45%";
                    line.appendChild(valueBlock);
                }
                if (configElement.type === Nabu.ConfigurationElementType.Boolean) {
                    let checkbox = document.createElement("nabu-checkbox");
                    checkbox.classList.add("option-button");
                    valueBlock.appendChild(checkbox);
                    checkbox.value = configElement.value;
                    checkbox.onChange = () => {
                        let oldValue = configElement.value;
                        configElement.value = checkbox.value;
                        this.configuration.saveToLocalStorage();
                        if (configElement.onChange) {
                            configElement.onChange(checkbox.value, oldValue, true);
                        }
                    };
                }
                else if (configElement.type === Nabu.ConfigurationElementType.Number || configElement.type === Nabu.ConfigurationElementType.Enum) {
                    let minus = document.createElement("div");
                    minus.classList.add("option-button");
                    if (configElement.type === Nabu.ConfigurationElementType.Number) {
                        minus.classList.add("minus");
                    }
                    else {
                        minus.classList.add("prev");
                    }
                    valueBlock.appendChild(minus);
                    minus.onclick = () => {
                        let oldValue = configElement.value;
                        if (configElement.value > configElement.prop.min) {
                            configElement.value = Math.max(configElement.prop.min, configElement.value - configElement.prop.step);
                            numValue.innerHTML = configElement.prop.toString(configElement.value);
                            this.configuration.saveToLocalStorage();
                            if (configElement.onChange) {
                                configElement.onChange(configElement.value, oldValue, true);
                            }
                        }
                    };
                    let numValue = document.createElement("div");
                    numValue.classList.add("value");
                    numValue.innerHTML = configElement.prop.toString(configElement.value);
                    valueBlock.appendChild(numValue);
                    let plus = document.createElement("div");
                    plus.classList.add("option-button");
                    if (configElement.type === Nabu.ConfigurationElementType.Number) {
                        plus.classList.add("plus");
                    }
                    else {
                        plus.classList.add("next");
                    }
                    valueBlock.appendChild(plus);
                    plus.onclick = () => {
                        let oldValue = configElement.value;
                        if (configElement.value < configElement.prop.max) {
                            configElement.value = Math.min(configElement.prop.max, configElement.value + configElement.prop.step);
                            numValue.innerHTML = configElement.prop.toString(configElement.value);
                            this.configuration.saveToLocalStorage();
                            if (configElement.onChange) {
                                configElement.onChange(configElement.value, oldValue, true);
                            }
                        }
                    };
                }
                else if (configElement.type === Nabu.ConfigurationElementType.Input) {
                    let numValue = document.createElement("div");
                    numValue.classList.add("input-value");
                    numValue.innerHTML = (Nabu.ConfigurationElement.Inputs[configElement.value]).replace("GamepadBtn", "Pad ").replace("Key", "Key ");
                    valueBlock.appendChild(numValue);
                    numValue.onclick = () => {
                        numValue.innerHTML = "press...";
                        let keyup = (ev) => {
                            let oldValue = configElement.value;
                            let newValue = Nabu.ConfigurationElement.InputToInt(ev.code);
                            if (newValue > -1) {
                                configElement.value = newValue;
                                if (configElement.onChange) {
                                    configElement.onChange(newValue, oldValue, true);
                                }
                            }
                            exit();
                        };
                        let waitForGamepad;
                        if (this.isGamepadAllowed) {
                            waitForGamepad = setInterval(() => {
                                let gamepads = navigator.getGamepads();
                                let gamepad = gamepads[0];
                                if (gamepad) {
                                    for (let b = 0; b < gamepad.buttons.length; b++) {
                                        let v = gamepad.buttons[b].pressed;
                                        if (v) {
                                            let oldValue = configElement.value;
                                            let newValue = Nabu.ConfigurationElement.InputToInt("GamepadBtn" + b);
                                            if (newValue > -1) {
                                                configElement.value = newValue;
                                                if (configElement.onChange) {
                                                    configElement.onChange(newValue, oldValue, true);
                                                }
                                            }
                                            exit();
                                        }
                                    }
                                }
                            }, 15);
                        }
                        let exit = () => {
                            numValue.innerHTML = (Nabu.ConfigurationElement.Inputs[configElement.value]).replace("GamepadBtn", "Pad ").replace("Key", "Key ");
                            window.removeEventListener("keyup", keyup);
                            window.clearInterval(waitForGamepad);
                        };
                        window.addEventListener("keyup", keyup);
                        window.addEventListener("pointerdown", exit);
                    };
                }
                if (configElement.type === Nabu.ConfigurationElementType.Input) {
                    lastInputProperty = property;
                    lastValueBlock = valueBlock;
                }
                else {
                    lastInputProperty = "";
                    lastValueBlock = undefined;
                }
            }
        }
    }
    Nabu.OptionPage = OptionPage;
    customElements.define("option-page", OptionPage);
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
            this.fullLine = false;
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
            this._t0 = 0;
            this._duration = 0;
            this._outOfScreenLeft = 0;
            this.autoStoppedUpdate = () => {
                let t = performance.now() / 1000 - this._t0;
                if (this._shown) {
                    if (t >= this._duration) {
                        for (let i = 0; i < this.panels.length; i++) {
                            let panel = this.panels[i];
                            panel.left = panel.computedLeft;
                            panel.style.opacity = "1";
                        }
                        if (this._onNextAutoStoppedUpdateDone) {
                            this._onNextAutoStoppedUpdateDone();
                        }
                    }
                    else {
                        let f = t / this._duration;
                        for (let i = 0; i < this.panels.length; i++) {
                            let panel = this.panels[i];
                            let targetLeft = this._outOfScreenLeft * this.animLineDir;
                            if (Math.floor(panel.y / this.animLineHeight) % 2 != Math.floor(this.yCount / this.animLineHeight) % 2) {
                                targetLeft = -this._outOfScreenLeft * this.animLineDir;
                            }
                            panel.left = (1 - f) * targetLeft + panel.computedLeft;
                            panel.style.opacity = f.toFixed(3);
                        }
                        requestAnimationFrame(this.autoStoppedUpdate);
                    }
                }
                else {
                    let t = performance.now() / 1000 - this._t0;
                    if (t >= this._duration) {
                        for (let i = 0; i < this.panels.length; i++) {
                            let panel = this.panels[i];
                            let targetLeft = this._outOfScreenLeft * this.animLineDir;
                            if (Math.floor(panel.y / this.animLineHeight) % 2 != Math.floor(this.yCount / this.animLineHeight) % 2) {
                                targetLeft = -this._outOfScreenLeft * this.animLineDir;
                            }
                            panel.left = targetLeft + panel.computedLeft;
                            panel.style.display = "none";
                            panel.style.opacity = "0";
                        }
                        if (this._onNextAutoStoppedUpdateDone) {
                            this._onNextAutoStoppedUpdateDone();
                        }
                    }
                    else {
                        let f = t / this._duration;
                        for (let i = 0; i < this.panels.length; i++) {
                            let panel = this.panels[i];
                            let targetLeft = this._outOfScreenLeft * this.animLineDir;
                            if (Math.floor(panel.y / this.animLineHeight) % 2 != Math.floor(this.yCount / this.animLineHeight) % 2) {
                                targetLeft = -this._outOfScreenLeft * this.animLineDir;
                            }
                            panel.left = f * targetLeft + panel.computedLeft;
                            panel.style.opacity = (1 - f).toFixed(3);
                        }
                        requestAnimationFrame(this.autoStoppedUpdate);
                    }
                }
            };
        }
        static get observedAttributes() {
            return ["file", "anim-line-height", "anim-line-dir"];
        }
        get loaded() {
            return this._loaded;
        }
        get shown() {
            return this._shown;
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
        async waitLoaded() {
            return new Promise(resolve => {
                let wait = () => {
                    if (this._loaded) {
                        resolve();
                    }
                    else {
                        requestAnimationFrame(wait);
                    }
                };
                wait();
            });
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
                    this._shown = true;
                    this._outOfScreenLeft = 1.0 * window.innerWidth;
                    for (let i = 0; i < this.panels.length; i++) {
                        let panel = this.panels[i];
                        let targetLeft = this._outOfScreenLeft * this.animLineDir;
                        if (Math.floor(panel.y / this.animLineHeight) % 2 != Math.floor(this.yCount / this.animLineHeight) % 2) {
                            targetLeft = -this._outOfScreenLeft * this.animLineDir;
                        }
                        panel.left = targetLeft + panel.computedLeft;
                        panel.style.display = "block";
                        panel.style.opacity = "0";
                    }
                    this._t0 = performance.now() / 1000;
                    this._duration = duration;
                    this._onNextAutoStoppedUpdateDone = resolve;
                    this.autoStoppedUpdate();
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
                        this._shown = false;
                        this._outOfScreenLeft = 1.0 * window.innerWidth;
                        for (let i = 0; i < this.panels.length; i++) {
                            let panel = this.panels[i];
                            let targetLeft = this._outOfScreenLeft * this.animLineDir;
                            if (Math.floor(panel.y / this.animLineHeight) % 2 != Math.floor(this.yCount / this.animLineHeight) % 2) {
                                targetLeft = -this._outOfScreenLeft * this.animLineDir;
                            }
                            panel.left = targetLeft + panel.computedLeft;
                            panel.style.display = "block";
                            panel.style.opacity = "1";
                        }
                        this._t0 = performance.now() / 1000;
                        this._duration = duration;
                        this._onNextAutoStoppedUpdateDone = resolve;
                        this.autoStoppedUpdate();
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
                panel.h = parseInt(panel.getAttribute("h"));
                if (panel.getAttribute("w") === "line") {
                    panel.fullLine = true;
                    requestedFullLines++;
                }
                else {
                    panel.w = parseInt(panel.getAttribute("w"));
                    let area = panel.w * panel.h;
                    requestedTileCount += area;
                }
            }
            let rect = this.getBoundingClientRect();
            let containerW = rect.width;
            let containerH = rect.height;
            let min = 0;
            let max = 30;
            let ok = false;
            let emptyLinesBottom = 0;
            let emptyColumnsRight = 0;
            while (!ok) {
                ok = true;
                min++;
                if (min > max) {
                    console.log("panelpage fail");
                    return;
                }
                let bestValue = 0;
                for (let xC = min; xC <= max; xC++) {
                    for (let yC = min; yC <= max; yC++) {
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
                    if (panel.fullLine) {
                        panel.w = this.xCount;
                    }
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
                    empty = true;
                    emptyColumnsRight = 0;
                    for (let x = this.xCount - 1; x > 0 && empty; x--) {
                        for (let y = 0; y < this.yCount && empty; y++) {
                            let fullLinePanel = this.panels.find(panel => {
                                return (y >= panel.y && y < panel.y + panel.h) && panel.fullLine;
                            });
                            if (!fullLinePanel) {
                                if (!grid[y][x]) {
                                    empty = false;
                                }
                            }
                        }
                        if (empty) {
                            emptyColumnsRight++;
                        }
                    }
                }
            }
            let tileW = containerW / this.xCount;
            let tileH = containerH / this.yCount;
            let m = 12;
            for (let i = 0; i < this.panels.length; i++) {
                let panel = this.panels[i];
                if (panel.fullLine) {
                    panel.w = this.xCount;
                }
                panel.style.width = (panel.w * tileW - 2 * m).toFixed(0) + "px";
                panel.style.height = (panel.h * tileH - 2 * m).toFixed(0) + "px";
                panel.style.position = "absolute";
                panel.computedLeft = panel.x * tileW;
                if (!panel.fullLine) {
                    panel.computedLeft += m + emptyColumnsRight * 0.5 * tileW;
                }
                panel.computedTop = panel.y * tileH + m + emptyLinesBottom * 0.5 * tileH;
                if (panel.style.display != "none") {
                    panel.style.left = panel.computedLeft.toFixed(0) + "px";
                }
                panel.style.top = panel.computedTop.toFixed(0) + "px";
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
            this.started = false;
            this._update = () => {
                if (!this.started) {
                    return;
                }
                let href = window.location.href;
                if (href != this._currentHRef) {
                    let previousHRef = this._currentHRef;
                    this._currentHRef = href;
                    this._onHRefChange(previousHRef);
                }
                this.onUpdate();
            };
            this._onHRefChange = async (previousHRef) => {
                let split = this._currentHRef.split("/");
                let page = split[split.length - 1];
                let splitPage = page.split("#");
                page = "#" + splitPage[splitPage.length - 1];
                let previousPage;
                if (previousHRef) {
                    let previousSplit = previousHRef.split("/");
                    if (previousSplit.length > 0) {
                        previousPage = previousSplit[split.length - 1];
                        let previousSplitPage = previousPage.split("#");
                        if (previousSplitPage.length > 0) {
                            previousPage = "#" + previousSplitPage[previousSplitPage.length - 1];
                        }
                    }
                }
                this.onHRefChange(page, previousPage);
            };
        }
        async wait(duration) {
            return new Promise((resolve) => {
                setTimeout(resolve, duration * 1000);
            });
        }
        findAllPages() {
            this.pages = [];
            let panelPages = document.querySelectorAll("panel-page");
            panelPages.forEach((panelPage) => {
                if (panelPage instanceof Nabu.PanelPage) {
                    this.pages.push(panelPage);
                }
            });
            let optionsPages = document.querySelectorAll("option-page");
            optionsPages.forEach((optionPage) => {
                if (optionPage instanceof Nabu.OptionPage) {
                    this.pages.push(optionPage);
                }
            });
            let defaultPages = document.querySelectorAll("default-page");
            defaultPages.forEach((defaultPage) => {
                if (defaultPage instanceof Nabu.DefaultPage) {
                    this.pages.push(defaultPage);
                }
            });
            this.onFindAllPages();
            this.onFindAllPagesAsync();
        }
        onFindAllPages() {
        }
        async onFindAllPagesAsync() {
        }
        async initialize() {
            this.findAllPages();
        }
        start() {
            this.started = true;
            this._update();
            setInterval(this._update, 30);
        }
        async show(page, dontCloseOthers, duration = 0) {
            //this.findAllPages();
            if (!dontCloseOthers) {
                this.hideAll(duration);
            }
            await page.show(duration);
        }
        async hideAll(duration = 1) {
            for (let i = 0; i < this.pages.length; i++) {
                this.pages[i].hide(duration);
            }
        }
        onUpdate() {
        }
        onHRefChange(page, previousPage) {
        }
        async waitForAllPagesLoaded() {
            return new Promise(resolve => {
                let wait = () => {
                    for (let i = 0; i < this.pages.length; i++) {
                        if (!this.pages[i].loaded) {
                            console.log("waiting for " + this.pages[i].tagName + " to load.");
                            requestAnimationFrame(wait);
                            return;
                        }
                    }
                    resolve();
                };
                wait();
            });
        }
    }
    Nabu.Router = Router;
})(Nabu || (Nabu = {}));
