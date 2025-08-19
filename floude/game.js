class CubicNoiseTexture {
    constructor(scene) {
        this.scene = scene;
        this.size = 1;
        this._data = [[[0.5]]];
    }
    getData(i, j, k) {
        while (i < 0) {
            i += this.size;
        }
        while (j < 0) {
            j += this.size;
        }
        while (k < 0) {
            k += this.size;
        }
        i = i % this.size;
        j = j % this.size;
        k = k % this.size;
        return this._data[i][j][k];
    }
    setData(v, i, j, k) {
        while (i < 0) {
            i += this.size;
        }
        while (j < 0) {
            j += this.size;
        }
        while (k < 0) {
            k += this.size;
        }
        i = i % this.size;
        j = j % this.size;
        k = k % this.size;
        return this._data[i][j][k];
    }
    double() {
        let newSize = this.size * 2;
        let newData = [];
        for (let i = 0; i < newSize; i++) {
            newData[i] = [];
            for (let j = 0; j < newSize; j++) {
                newData[i][j] = [];
            }
        }
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                for (let k = 0; k < this.size; k++) {
                    let v = this._data[i][j][k];
                    newData[2 * i][2 * j][2 * k] = v;
                    newData[2 * i + 1][2 * j][2 * k] = v;
                    newData[2 * i + 1][2 * j + 1][2 * k] = v;
                    newData[2 * i][2 * j + 1][2 * k] = v;
                    newData[2 * i][2 * j][2 * k + 1] = v;
                    newData[2 * i + 1][2 * j][2 * k + 1] = v;
                    newData[2 * i + 1][2 * j + 1][2 * k + 1] = v;
                    newData[2 * i][2 * j + 1][2 * k + 1] = v;
                }
            }
        }
        this.size = newSize;
        this._data = newData;
    }
    smooth() {
        let newData = [];
        for (let i = 0; i < this.size; i++) {
            newData[i] = [];
            for (let j = 0; j < this.size; j++) {
                newData[i][j] = [];
            }
        }
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                for (let k = 0; k < this.size; k++) {
                    let val = 0;
                    let c = 0;
                    for (let ii = -1; ii <= 1; ii++) {
                        for (let jj = -1; jj <= 1; jj++) {
                            for (let kk = -1; kk <= 1; kk++) {
                                let d = Math.sqrt(ii * ii + jj * jj + kk * kk);
                                let w = 2 - d;
                                let v = this.getData(i + ii, j + jj, k + kk);
                                val += w * v;
                                c += w;
                            }
                        }
                    }
                }
            }
        }
    }
    noise() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                for (let k = 0; k < this.size; k++) {
                    this._data[i][j][k] = (this._data[i][j][k] + Math.random()) * 0.5;
                }
            }
        }
    }
    randomize() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                for (let k = 0; k < this.size; k++) {
                    this._data[i][j][k] = Math.random();
                }
            }
        }
    }
    get3DTexture() {
        let data = new Uint8ClampedArray(this.size * this.size * this.size);
        let min = 255;
        let max = 0;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                for (let k = 0; k < this.size; k++) {
                    data[i + j * this.size + k * this.size * this.size] = 256 * this._data[i][j][k];
                    min = Math.min(min, data[i + j * this.size + k * this.size * this.size]);
                    max = Math.max(max, data[i + j * this.size + k * this.size * this.size]);
                }
            }
        }
        let tex = new BABYLON.RawTexture3D(data, this.size, this.size, this.size, BABYLON.Constants.TEXTUREFORMAT_R, this.scene, false, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE, BABYLON.Engine.TEXTURETYPE_UNSIGNED_BYTE);
        tex.wrapU = 1;
        tex.wrapV = 1;
        tex.wrapR = 1;
        return tex;
    }
}
/// <reference path="../lib/nabu/nabu.d.ts"/>
/// <reference path="../lib/mummu/mummu.d.ts"/>
/// <reference path="../lib/babylon.d.ts"/>
//mklink /D C:\Users\tgames\OneDrive\Documents\GitHub\fluid-x\lib\nabu\ C:\Users\tgames\OneDrive\Documents\GitHub\nabu
var MAJOR_VERSION = 0;
var MINOR_VERSION = 0;
var PATCH_VERSION = 1;
var VERSION = MAJOR_VERSION * 1000 + MINOR_VERSION * 100 + PATCH_VERSION;
var CONFIGURATION_VERSION = MAJOR_VERSION * 1000 + MINOR_VERSION * 100 + PATCH_VERSION;
var observed_progress_speed_percent_second;
var setProgressIndex;
var GLOBAL_GAME_LOAD_CURRENT_STEP;
var USE_POKI_SDK;
var USE_CG_SDK;
var OFFLINE_MODE;
var NO_VERTEX_DATA_LOADER;
var ADVENT_CAL;
var PokiSDK;
var CrazySDK;
var LOCALE = "en";
var SDKPlaying = false;
function SDKGameplayStart() {
    if (!SDKPlaying) {
        console.log("SDK Gameplay Start");
        if (USE_POKI_SDK) {
            PokiSDK.gameplayStart();
        }
        else if (USE_CG_SDK) {
            CrazySDK.game.gameplayStart();
        }
        SDKPlaying = true;
    }
}
var CanStartCommercialBreak = false;
async function PokiCommercialBreak() {
    if (!CanStartCommercialBreak) {
        return;
    }
    if (location.host.startsWith("127.0.0.1")) {
        return;
    }
    let prevMainVolume = BABYLON.Engine.audioEngine.getGlobalVolume();
    BABYLON.Engine.audioEngine.setGlobalVolume(0);
    await PokiSDK.commercialBreak();
    BABYLON.Engine.audioEngine.setGlobalVolume(prevMainVolume);
}
function SDKGameplayStop() {
    if (SDKPlaying) {
        console.log("SDK Gameplay Stop");
        if (USE_POKI_SDK) {
            PokiSDK.gameplayStop();
        }
        else if (USE_CG_SDK) {
            CrazySDK.game.gameplayStop();
        }
        SDKPlaying = false;
    }
}
var PlayerHasInteracted = false;
var IsTouchScreen = -1;
var IsMobile = -1;
var HasLocalStorage = false;
function StorageGetItem(key) {
    if (USE_CG_SDK) {
        return CrazySDK.data.getItem(key);
    }
    else {
        return localStorage.getItem(key);
    }
}
function StorageSetItem(key, value) {
    if (USE_CG_SDK) {
        CrazySDK.data.setItem(key, value);
    }
    else {
        localStorage.setItem(key, value);
    }
}
var SHARE_SERVICE_PATH = "https://carillion.tiaratum.com/index.php/";
if (location.host.startsWith("127.0.0.1")) {
    SHARE_SERVICE_PATH = "http://localhost/index.php/";
}
async function WaitPlayerInteraction() {
    return new Promise(resolve => {
        let wait = () => {
            if (PlayerHasInteracted) {
                resolve();
            }
            else {
                requestAnimationFrame(wait);
            }
        };
        wait();
    });
}
function firstPlayerInteraction() {
    Game.Instance.onResize();
    IsMobile = /(?:phone|windows\s+phone|ipod|blackberry|(?:android|bb\d+|meego|silk|googlebot) .+? mobile|palm|windows\s+ce|opera\smini|avantgo|mobilesafari|docomo)/i.test(navigator.userAgent) ? 1 : 0;
    if (IsMobile === 1) {
        document.body.classList.add("mobile");
    }
    PlayerHasInteracted = true;
}
let onFirstPlayerInteractionTouch = (ev) => {
    if (!Game.Instance.gameLoaded) {
        return;
    }
    console.log("onFirstPlayerInteractionTouch");
    ev.stopPropagation();
    document.body.removeEventListener("touchstart", onFirstPlayerInteractionTouch);
    IsTouchScreen = 1;
    document.body.classList.add("touchscreen");
    Game.Instance.camera.panningSensibility *= 0.4;
    if (!PlayerHasInteracted) {
        firstPlayerInteraction();
    }
};
let onFirstPlayerInteractionClick = (ev) => {
    if (!Game.Instance.gameLoaded) {
        return;
    }
    console.log("onFirstPlayerInteractionClic");
    ev.stopPropagation();
    document.body.removeEventListener("click", onFirstPlayerInteractionClick);
    if (IsTouchScreen === -1) {
        IsTouchScreen = 0;
        document.body.classList.remove("touchscreen");
    }
    if (!PlayerHasInteracted) {
        firstPlayerInteraction();
    }
};
let onFirstPlayerInteractionKeyboard = (ev) => {
    if (!ev.code) {
        return;
    }
    if (!Game.Instance.gameLoaded) {
        return;
    }
    console.log("onFirstPlayerInteractionKeyboard");
    ev.stopPropagation();
    document.body.removeEventListener("keydown", onFirstPlayerInteractionKeyboard);
    if (IsTouchScreen === -1) {
        IsTouchScreen = 0;
        document.body.classList.remove("touchscreen");
    }
    if (!PlayerHasInteracted) {
        firstPlayerInteraction();
    }
};
function addLine(text) {
    let e = document.createElement("div");
    e.classList.add("debug-log");
    e.innerText = text;
    document.body.appendChild(e);
}
function StopPointerProgatation(ev) {
    ev.stopPropagation();
}
function StopPointerProgatationAndMonkeys(ev) {
    console.log("StopPointerProgatationAndMonkeys");
    ev.stopPropagation();
}
class Game {
    constructor(canvasElement) {
        this.DEBUG_MODE = false;
        this.DEBUG_USE_LOCAL_STORAGE = false;
        this.screenRatio = 1;
        this.uiCameraHalfWidth = 1;
        this.uiCameraHalfHeight = 1;
        this.menuCamAlpha = -Math.PI * 0.75;
        this.menuCamBeta = Math.PI * 0.3;
        this.menuCamRadius = 15;
        //public playCameraRange: number = 15;
        this.playCameraRadiusFactor = 0;
        this.playCameraRadius = 20;
        this.playCameraMinRadius = 10;
        this.playCameraMaxRadius = 50;
        this.cameraOrtho = false;
        this.animLightIntensity = Mummu.AnimationFactory.EmptyNumberCallback;
        this.animSpotlightIntensity = Mummu.AnimationFactory.EmptyNumberCallback;
        this.gameLoaded = false;
        this.onResize = () => {
            let rect = this.canvas.getBoundingClientRect();
            this.screenRatio = rect.width / rect.height;
            if (this.screenRatio < 1) {
                document.body.classList.add("vertical");
                this.playCameraMinRadius = 20;
            }
            else {
                document.body.classList.remove("vertical");
            }
            this.engine.resize(true);
            this.canvas.setAttribute("width", Math.floor(rect.width * this.performanceWatcher.devicePixelRatio).toFixed(0));
            this.canvas.setAttribute("height", Math.floor(rect.height * this.performanceWatcher.devicePixelRatio).toFixed(0));
            if (this.screenRatio > 1) {
                this.uiCamera.orthoTop = 1;
                this.uiCamera.orthoBottom = -1;
                this.uiCamera.orthoRight = this.screenRatio;
                this.uiCamera.orthoLeft = -this.screenRatio;
                this.uiCameraHalfWidth = this.screenRatio;
                this.uiCameraHalfHeight = 1;
            }
            else {
                this.uiCamera.orthoTop = 1 / this.screenRatio;
                this.uiCamera.orthoBottom = -1 / this.screenRatio;
                this.uiCamera.orthoRight = 1;
                this.uiCamera.orthoLeft = -1;
                this.uiCameraHalfWidth = 1;
                this.uiCameraHalfHeight = 1 / this.screenRatio;
            }
            this.puzzleInput.resize();
            this.puzzleUI.resize();
            this.camera.target.z = this.puzzle.h * 0.5 * (this.screenRatio < 1 ? 0.8 : 1);
        };
        this.machineEditorContainerIsDisplayed = false;
        this.machineEditorContainerHeight = -1;
        this.machineEditorContainerWidth = -1;
        this.canvasLeft = 0;
        this._pointerDownX = 0;
        this._pointerDownY = 0;
        this.onPointerDown = (event) => {
            this._pointerDownX = this.scene.pointerX;
            this._pointerDownY = this.scene.pointerY;
        };
        this.onPointerUp = (event) => {
        };
        this.onWheelEvent = (event) => {
        };
        Game.Instance = this;
        this.canvas = document.getElementById(canvasElement);
        this.canvas.requestPointerLock = this.canvas.requestPointerLock || this.canvas.msRequestPointerLock || this.canvas.mozRequestPointerLock || this.canvas.webkitRequestPointerLock;
        this.canvasCurtain = document.getElementById("canvas-curtain");
        this.engine = new BABYLON.Engine(this.canvas, true, undefined, false);
        BABYLON.Engine.ShadersRepository = "./shaders/";
        BABYLON.Engine.audioEngine.useCustomUnlockedButton = true;
        BABYLON.Engine.audioEngine.lock();
        this.performanceWatcher = new PerformanceWatcher(this);
    }
    getScene() {
        return this.scene;
    }
    async createScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = BABYLON.Color4.FromHexString("#000000ff");
        this.vertexDataLoader = new Mummu.VertexDataLoader(this.scene);
        if (NO_VERTEX_DATA_LOADER) {
            let datas = await fetch("./datas/meshes/vertexDatas.json");
            this.vertexDataLoader.deserialize(await datas.json());
        }
        setProgressIndex(GLOBAL_GAME_LOAD_CURRENT_STEP++, "fetch VertexDataLoader");
        let rect = this.canvas.getBoundingClientRect();
        this.screenRatio = rect.width / rect.height;
        if (this.screenRatio < 1) {
            document.body.classList.add("vertical");
            this.playCameraMinRadius = 20;
        }
        else {
            document.body.classList.remove("vertical");
        }
        this.canvas.setAttribute("width", Math.floor(rect.width * this.performanceWatcher.devicePixelRatio).toFixed(0));
        this.canvas.setAttribute("height", Math.floor(rect.height * this.performanceWatcher.devicePixelRatio).toFixed(0));
        this.light = new BABYLON.HemisphericLight("light", (new BABYLON.Vector3(2, 4, -3)).normalize(), this.scene);
        this.light.groundColor.copyFromFloats(0.3, 0.3, 0.3);
        this.spotlight = new BABYLON.SpotLight("spotlight", BABYLON.Vector3.Zero(), BABYLON.Vector3.Down(), Math.PI / 6, 10, this.scene);
        this.spotlight.intensity = 0;
        this.animLightIntensity = Mummu.AnimationFactory.CreateNumber(this.light, this.light, "intensity");
        this.animSpotlightIntensity = Mummu.AnimationFactory.CreateNumber(this.spotlight, this.spotlight, "intensity");
        /*
        let skyBoxHolder = new BABYLON.Mesh("skybox-holder");
        skyBoxHolder.rotation.x = Math.PI * 0.3;

        this.skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1500 }, this.scene);
        this.skybox.parent = skyBoxHolder;
        let skyboxMaterial: BABYLON.StandardMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        let skyTexture = new BABYLON.CubeTexture(
            "./datas/skyboxes/cloud",
            this.scene,
            ["-px.jpg", "-py.jpg", "-pz.jpg", "-nx.jpg", "-ny.jpg", "-nz.jpg"]);
        skyboxMaterial.reflectionTexture = skyTexture;
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.emissiveColor = BABYLON.Color3.FromHexString("#5c8b93").scaleInPlace(0.7);
        this.skybox.material = skyboxMaterial;
        */
        this.uiCamera = new BABYLON.FreeCamera("ui-camera", BABYLON.Vector3.Zero());
        this.uiCamera.position.z = -10;
        this.uiCamera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        this.uiCamera.layerMask = 0x10000000;
        this.camera = new BABYLON.ArcRotateCamera("camera", -Math.PI * 0.5, Math.PI * 0.1, 15, BABYLON.Vector3.Zero());
        this.scene.activeCameras = [this.camera, this.uiCamera];
        setProgressIndex(GLOBAL_GAME_LOAD_CURRENT_STEP++, "router initialized");
        if (this.engine.webGLVersion === 2) {
            try {
                let cubicNoiseTexture = new CubicNoiseTexture(this.scene);
                cubicNoiseTexture.double();
                cubicNoiseTexture.double();
                cubicNoiseTexture.double();
                cubicNoiseTexture.double();
                cubicNoiseTexture.double();
                cubicNoiseTexture.double();
                cubicNoiseTexture.double();
                cubicNoiseTexture.randomize();
                cubicNoiseTexture.smooth();
                this.noiseTexture = cubicNoiseTexture.get3DTexture();
                this.performanceWatcher.supportTexture3D = true;
            }
            catch (e) {
                console.error("[ERROR FALLBACKED] No support for 3DTexture, explosion effects are disabled.");
                this.performanceWatcher.supportTexture3D = false;
            }
        }
        else {
            this.performanceWatcher.supportTexture3D = false;
        }
        this.canvas.addEventListener("pointerdown", this.onPointerDown);
        this.canvas.addEventListener("pointerup", this.onPointerUp);
        this.canvas.addEventListener("wheel", this.onWheelEvent);
        /*
        let material = new BABYLON.StandardMaterial("boxMaterial");
        material.specularColor.copyFromFloats(0, 0, 0);
        let color = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
        color = BABYLON.Color3.FromHexString("#EEEDF0");
        for (let i = -20; i < 30; i++) {
            for (let j = -20; j < 30; j++) {
                let box = BABYLON.MeshBuilder.CreateBox("box", { size: 1 });
                box.position.copyFromFloats(
                    i,
                    - 4 + Math.random() * 0.5,
                    j
                );
                box.rotation.copyFromFloats(
                    -0.1 + 0.2 * Math.random(),
                    0,
                    0
                )
                let data = BABYLON.VertexData.ExtractFromMesh(box);
                let f = (0.1 + 0.1 * Math.random())
                let r = Nabu.MinMax(color.r * f, 0, 1);
                let g = Nabu.MinMax(color.g * f, 0, 1);
                let b = Nabu.MinMax(color.b * f, 0, 1);
                Mummu.ColorizeVertexDataInPlace(data, new BABYLON.Color3(r, g, b));
                data.applyToMesh(box);
                box.material = material;
                box.freezeWorldMatrix();
            }
        }
        */
        if (USE_CG_SDK) {
            console.log("Use CrazyGames SDK");
        }
        if (!(USE_POKI_SDK || USE_CG_SDK)) {
        }
        if (window.top != window.self) {
            document.body.classList.add("in-iframe");
        }
        document.querySelector("canvas").addEventListener("pointerup", () => {
            if (!this.puzzle.isCornerFlipping()) {
                let pickingRay = this.scene.createPickingRay(this.scene.pointerX * this.performanceWatcher.devicePixelRatio, this.scene.pointerY * this.performanceWatcher.devicePixelRatio, BABYLON.Matrix.Identity(), this.uiCamera, false);
                let pick = this.scene.pickWithRay(pickingRay, (mesh) => {
                    return mesh.parent instanceof Button || mesh.parent instanceof TextBox;
                });
                if (pick.hit && (pick.pickedMesh.parent instanceof Button || pick.pickedMesh.parent instanceof TextBox)) {
                    pick.pickedMesh.parent.onClick();
                }
            }
        });
        this.puzzleStyle = rainbow;
        this.colorMaterials = [];
        for (let i = 0; i < this.puzzleStyle.colors.length; i++) {
            let material = new BABYLON.StandardMaterial("color-material-" + i.toFixed(0));
            material.diffuseColor = this.puzzleStyle.colors[i];
            material.specularColor.copyFromFloats(0.1, 0.1, 0.1);
            this.colorMaterials[i] = material;
        }
        this.puzzle = new Puzzle(this);
        this.puzzleSolver = new PuzzleSolver(this);
        this.puzzleInput = new PuzzleInput(this);
        this.puzzleUI = new PuzzleUI(this);
        await this.puzzleUI.instantiate();
        /*
        this.loadPuzzle({
            w: 5,
            h: 5,
            colorsCount: 3,
            grid: `11111_12000_12220_00221_22220`,
            topScore: 10,
            naiveScore: 11
        });
        */
        /*
        
        */
        let test = false;
        if (test) {
            await this.loadPuzzle({
                w: 4,
                h: 4,
                inputI: 0,
                inputJ: 3,
                colorsCount: 8,
                grid: "5754_5766_1267_7345",
                topScore: 7,
                naiveScore: 9,
            });
        }
        else {
            await this.loadPuzzle({
                "w": 4,
                "h": 4,
                "inputI": 0,
                "inputJ": 3,
                "colorsCount": 4,
                "grid": "1333_1323_3112_3133_",
                "topScore": 3,
                "naiveScore": 3
            });
        }
        this.gameLoaded = true;
        for (let i = 0; i < 0; i++) {
            console.log("# " + i + " attempt");
            let puzzleData = PuzzleGenerator.MakePuzzleFromTemplate(this.puzzleSolver, TemplateNameToIndex("Disc 8"), 4 + Math.floor(Math.random() * 5));
            console.log(puzzleData);
            this.puzzleSolver.initialize(puzzleData);
            console.log("---------");
        }
        document.body.addEventListener("touchstart", onFirstPlayerInteractionTouch);
        document.body.addEventListener("click", onFirstPlayerInteractionClick);
        document.body.addEventListener("keydown", onFirstPlayerInteractionKeyboard);
        if (location.host.startsWith("127.0.0.1")) {
        }
        if (USE_CG_SDK) {
        }
    }
    async loadPuzzle(data) {
        await this.puzzle.initialize(data);
        this.puzzleSolver.initialize(data);
        //let moves = this.puzzleSolver.getBestMoves();
        //console.log(moves);
        this.puzzle.instantiate();
        this.puzzleInput.instantiate();
        await this.puzzleUI.progressBar.setMaxValue(this.puzzle.lowScore);
        this.puzzleUI.setMove(0);
        this.camera.target.x = this.puzzle.w * 0.5;
        this.camera.target.z = this.puzzle.h * 0.5 * (this.screenRatio < 1 ? 0.8 : 1);
        this.camera.alpha = -Math.PI / 2;
        this.camera.beta = Math.PI / 12;
        let rFromW = (this.puzzle.w + 2) * 0.5 / Math.tan(this.getCameraHorizontalFOV() * 0.5);
        let rFromH = (this.puzzle.h + 4) * 0.5 / Math.tan(this.camera.fov * 0.5);
        this.camera.radius = Math.max(rFromW, rFromH);
        setTimeout(() => {
            this.puzzleUI.showPlay();
            this.puzzle.playing = true;
        }, 300);
    }
    animate() {
        this.engine.runRenderLoop(() => {
            this.scene.render();
            this.update();
        });
        window.onresize = this.onResize;
        if (screen && screen.orientation) {
            screen.orientation.onchange = this.onResize;
        }
    }
    async initialize() {
    }
    getCameraHorizontalFOV() {
        return 2 * Math.atan(this.screenRatio * Math.tan(this.camera.fov / 2));
    }
    update() {
        let rawDT = this.scene.deltaTime / 1000;
        this.performanceWatcher.update(rawDT);
        if (isFinite(rawDT)) {
            if (this.puzzle.isComplete()) {
                this.puzzle.playing = false;
                this.puzzleUI.showSuccess();
            }
        }
    }
    makeRandomPuzzle(w, h, colorsCount) {
        if (isNaN(w)) {
            w = Math.floor(4 + Math.random() * 7);
        }
        if (isNaN(h)) {
            h = Math.floor(4 + Math.random() * 7);
        }
        if (isNaN(colorsCount)) {
            colorsCount = Math.floor(5 + Math.random() * 3);
        }
        let jInput = 0;
        let grid = "";
        for (let j = 0; j < h; j++) {
            for (let i = 0; i < w; i++) {
                let c = Math.floor(0 + (colorsCount - 0) * Math.random());
                grid += c.toFixed(0);
                if (i === 0 && c > 0) {
                    jInput = j;
                }
            }
            grid += "_";
        }
        let data = {
            w: w,
            h: h,
            inputI: 0,
            inputJ: jInput,
            colorsCount: colorsCount,
            grid: grid,
            topScore: 10,
            naiveScore: 11
        };
        this.puzzleSolver.initialize(data);
        let bestMoves = this.puzzleSolver.getBestMoves();
        let naiveMoves = this.puzzleSolver.getNaiveMoves();
        data.topScore = bestMoves.length;
        data.naiveScore = naiveMoves.length;
        return data;
    }
}
let createAndInit = async () => {
    try {
        window.localStorage.setItem("test-local-storage", "Test Local Storage Availability");
        window.localStorage.removeItem("test-local-storage");
        HasLocalStorage = true;
    }
    catch {
        HasLocalStorage = false;
    }
    let main = new Game("render-canvas");
    await main.createScene();
    main.initialize().then(() => {
        main.onResize();
        main.animate();
    });
};
requestAnimationFrame(async () => {
    if (USE_POKI_SDK) {
        PokiSDK.init().then(() => {
            createAndInit();
        });
    }
    else if (USE_CG_SDK) {
        CrazySDK = window.CrazyGames.SDK;
        await CrazySDK.init();
        createAndInit();
    }
    else {
        createAndInit();
    }
});
class PerformanceWatcher {
    constructor(game) {
        this.game = game;
        this.supportTexture3D = false;
        this.average = 24;
        this.worst = 24;
        this.isWorstTooLow = false;
        this.devicePixelRationess = 10;
        this.targetDevicePixelRationess = this.devicePixelRationess;
        this.devicePixelRatioSteps = 10;
        this.resizeCD = 0;
    }
    get devicePixelRatio() {
        let f = this.devicePixelRationess / this.devicePixelRatioSteps;
        return window.devicePixelRatio * f + 0.5 * (1 - f);
    }
    setDevicePixelRationess(v) {
        if (isFinite(v)) {
            v = Nabu.MinMax(v, 0, this.devicePixelRatioSteps);
            if (this.devicePixelRationess != v) {
                this.devicePixelRationess = v;
                let rect = this.game.canvas.getBoundingClientRect();
                requestAnimationFrame(() => {
                    let w = Math.floor(rect.width * this.devicePixelRatio).toFixed(0);
                    let h = Math.floor(rect.height * this.devicePixelRatio).toFixed(0);
                    this.game.canvas.setAttribute("width", w);
                    this.game.canvas.setAttribute("height", h);
                    console.log("update canvas resolution to " + w + " " + h);
                });
                this.resizeCD = 1;
            }
        }
    }
    update(rawDt) {
        return;
        let fps = 1 / rawDt;
        if (isFinite(fps)) {
            this.average = 0.95 * this.average + 0.05 * fps;
            let devicePixelRationess = Math.round((this.average - 24) / (60 - 24) * this.devicePixelRatioSteps);
            devicePixelRationess = Nabu.MinMax(devicePixelRationess, this.devicePixelRationess - 1, this.devicePixelRationess + 1);
            if (devicePixelRationess != this.targetDevicePixelRationess) {
                this.resizeCD = 1;
                this.targetDevicePixelRationess = devicePixelRationess;
            }
            this.resizeCD = Math.max(0, this.resizeCD - rawDt);
            if (this.resizeCD <= 0 && this.targetDevicePixelRationess != this.devicePixelRationess) {
                this.setDevicePixelRationess(this.targetDevicePixelRationess);
            }
            this.worst = Math.min(fps, this.worst);
            this.worst = 0.995 * this.worst + 0.005 * this.average;
            if (this.worst < 24) {
                this.isWorstTooLow = true;
            }
            else if (this.worst > 26) {
                this.isWorstTooLow = false;
            }
        }
    }
    showDebug() {
        let s = 0.3;
        if (document.body.classList.contains("vertical")) {
            s = 0.2;
        }
        let quad = BABYLON.CreateGround("quad", { width: s, height: s * 1.5 });
        quad.parent = this.game.camera;
        let hFov = this.game.getCameraHorizontalFOV();
        let a = hFov / 2;
        quad.position.z = 3;
        quad.position.x = -Math.tan(a) * quad.position.z + s * 0.5;
        quad.position.y = 2 * s;
        quad.rotation.x = -0.5 * Math.PI;
        let debugMaterial = new BABYLON.StandardMaterial("test-haiku-material");
        let dynamicTexture = new BABYLON.DynamicTexture("haiku-texture", { width: 150, height: 225 });
        dynamicTexture.hasAlpha = true;
        debugMaterial.diffuseTexture = dynamicTexture;
        debugMaterial.emissiveColor.copyFromFloats(1, 1, 1);
        debugMaterial.specularColor.copyFromFloats(0, 0, 0);
        debugMaterial.useAlphaFromDiffuseTexture = true;
        quad.material = debugMaterial;
        let update = () => {
            let context = dynamicTexture.getContext();
            context.clearRect(0, 0, 150, 225);
            context.fillStyle = "#00000080";
            context.fillRect(0, 0, 150, 225);
            context.fillStyle = "white";
            context.font = "35px monospace";
            let lineHeight = 40;
            context.fillText(this.average.toFixed(0) + " fa", 15, lineHeight);
            context.fillText(this.worst.toFixed(0) + " fm", 15, 2 * lineHeight);
            let meshesCount = this.game.scene.meshes.length;
            context.fillText(meshesCount.toFixed(0) + " me", 15, 3 * lineHeight);
            let materialsCount = this.game.scene.materials.length;
            context.fillText(materialsCount.toFixed(0) + " ma", 15, 4 * lineHeight);
            let trianglesCount = 0;
            this.game.scene.meshes.forEach(mesh => {
                let indices = mesh.getIndices();
                trianglesCount += indices.length / 3;
            });
            //context.fillText(Math.floor(trianglesCount / 1000).toFixed(0) + " kt", 15, 5 * lineHeight);
            context.fillText(this.devicePixelRatio.toFixed(4), 15, 5 * lineHeight);
            dynamicTexture.update();
        };
        setInterval(update, 100);
    }
}
class Pixel extends BABYLON.Mesh {
    constructor(puzzle, i, j) {
        super("pixel");
        this.puzzle = puzzle;
        this.i = i;
        this.j = j;
        this.pixelFlipDuration = 0.2;
        this.pixelFlipRandomDelay = 0.0;
        this.color = 0;
        this.colorV3 = BABYLON.Vector3.Zero();
        this.animateRotationX = Mummu.AnimationFactory.EmptyNumberCallback;
        this.animateRotationZ = Mummu.AnimationFactory.EmptyNumberCallback;
        this.animateSize = Mummu.AnimationFactory.EmptyNumberCallback;
        this.animateColorV3 = Mummu.AnimationFactory.EmptyVector3Callback;
        this.cornerI = 0;
        this.cornerJ = 0;
        this._flipping = false;
        this.position.x = (this.i + 0.5) / Puzzle.PIXELS_PER_TILE;
        this.position.z = (this.j + 0.5) / Puzzle.PIXELS_PER_TILE;
        this.freezeWorldMatrix();
        this.isCorner = (i % Puzzle.PIXELS_PER_TILE === 0 || (i + 1) % Puzzle.PIXELS_PER_TILE === 0) && (j % Puzzle.PIXELS_PER_TILE === 0 || (j + 1) % Puzzle.PIXELS_PER_TILE === 0);
        if (this.isCorner) {
            this.cornerI = Math.round(this.position.x) - 1;
            this.cornerJ = Math.round(this.position.z) - 1;
        }
        this.animateRotationX = Mummu.AnimationFactory.CreateNumber(this, this.rotation, "x", () => { this.freezeWorldMatrix(); });
        this.animateRotationZ = Mummu.AnimationFactory.CreateNumber(this, this.rotation, "z", () => { this.freezeWorldMatrix(); });
        this.animateSize = Mummu.AnimationFactory.CreateNumber(this, this, "size", () => { this.freezeWorldMatrix(); });
        this.animateColorV3 = Mummu.AnimationFactory.CreateVector3(this, this, "colorV3", () => {
            let n = this.i + this.j * this.puzzle.wP;
            this.puzzle.groundVertexData.colors[4 * n] = this.colorV3.x;
            this.puzzle.groundVertexData.colors[4 * n + 1] = this.colorV3.y;
            this.puzzle.groundVertexData.colors[4 * n + 2] = this.colorV3.z;
            this.puzzle.groundVertexDataNeedUpdate = true;
        }, (f) => {
            return f;
            return 0.5 * (Math.sin(f * 2 * Math.PI) + 2 * f);
        });
    }
    randomFactor() {
        return 1;
        return 0.7 + 0.3 * Math.random();
    }
    setColor(c) {
        this.color = c;
        this.colorV3.x = this.puzzle.colors[this.color].r * this.randomFactor();
        this.colorV3.y = this.puzzle.colors[this.color].g * this.randomFactor();
        this.colorV3.z = this.puzzle.colors[this.color].b * this.randomFactor();
        let n = this.i + this.j * this.puzzle.wP;
        this.puzzle.groundVertexData.colors[4 * n] = this.colorV3.x;
        this.puzzle.groundVertexData.colors[4 * n + 1] = this.colorV3.y;
        this.puzzle.groundVertexData.colors[4 * n + 2] = this.colorV3.z;
        this.puzzle.groundVertexDataNeedUpdate = true;
        if (this.isCorner) {
            this.puzzle.updateCorner(this.cornerI, this.cornerJ);
        }
    }
    get flipping() {
        return this._flipping;
    }
    async flipFromTo(fromC, toC, dir = 0) {
        if (this._flipping) {
            return;
        }
        if (this.color != fromC) {
            return;
        }
        if (this.color === toC) {
            return;
        }
        if (this.color === 0) {
            return;
        }
        this.puzzle.flippingCount++;
        this._flipping = true;
        setTimeout(() => {
            this.animateColorV3(this.puzzle.colorsV3[toC].multiplyByFloats(this.randomFactor(), this.randomFactor(), this.randomFactor()), this.pixelFlipDuration).then(() => {
                this._flipping = false;
                this.puzzle.flippingCount--;
                this.setColor(toC);
            });
        }, 1000 * this.pixelFlipRandomDelay * Math.random());
        /*
        this.animateSize(0, duration * 0.5, Nabu.Easing.easeOutSine).then(
            () => {
                this.setColor(toC);
                this.animateSize(1, duration * 0.5, Nabu.Easing.easeInSine).then(
                    () => {
                        this._flipping = false;
                        this.puzzle.flippingCount--;
                    }
                )
            }
        )
        */
        setTimeout(() => {
            let range = 1;
            for (let d = 1; d <= range; d++) {
                let iPlus = this.puzzle.getPixel(this.i + d, this.j);
                if (iPlus) {
                    iPlus.flipFromTo(fromC, toC, 0);
                }
                let iMinus = this.puzzle.getPixel(this.i - d, this.j);
                if (iMinus) {
                    iMinus.flipFromTo(fromC, toC, 2);
                }
                let jPlus = this.puzzle.getPixel(this.i, this.j + d);
                if (jPlus) {
                    jPlus.flipFromTo(fromC, toC, 1);
                }
                let jMinus = this.puzzle.getPixel(this.i, this.j - d);
                if (jMinus) {
                    jMinus.flipFromTo(fromC, toC, 3);
                }
                if (!this.isCorner && Math.random() < 0.5) {
                    let pp = this.puzzle.getPixel(this.i + d, this.j + d);
                    if (pp) {
                        pp.flipFromTo(fromC, toC, Math.floor(Math.random() * 4));
                    }
                    let pm = this.puzzle.getPixel(this.i + d, this.j - d);
                    if (pm) {
                        pm.flipFromTo(fromC, toC, Math.floor(Math.random() * 4));
                    }
                    let mp = this.puzzle.getPixel(this.i - d, this.j + d);
                    if (mp) {
                        mp.flipFromTo(fromC, toC, Math.floor(Math.random() * 4));
                    }
                    let mm = this.puzzle.getPixel(this.i - d, this.j - d);
                    if (mm) {
                        mm.flipFromTo(fromC, toC, Math.floor(Math.random() * 4));
                    }
                }
            }
        }, Math.random() * 100);
    }
}
class PixelsMaterial extends BABYLON.ShaderMaterial {
    constructor(name, game) {
        super(name, game.scene, {
            vertex: "pixelShader",
            fragment: "pixelShader",
        }, {
            attributes: ["position", "normal", "uv", "color"],
            uniforms: [
                "world", "worldView", "worldViewProjection", "view", "projection",
                "lightInvDirW",
                "alpha",
            ]
        });
        this.game = game;
        this._update = () => {
            let lights = this.getScene().lights;
            for (let i = 0; i < lights.length; i++) {
                let light = lights[i];
                if (light instanceof BABYLON.HemisphericLight) {
                    this.setVector3("lightInvDirW", light.direction);
                }
            }
        };
        this.setVector3("lightInvDirW", BABYLON.Vector3.Up());
        for (let i = 0; i < this.game.puzzleStyle.colorsCount; i++) {
            this.setColor3("col" + i.toFixed(0), this.game.puzzleStyle.colors[i]);
        }
        for (let i = this.game.puzzleStyle.colorsCount; i < 8; i++) {
            this.setColor3("col" + i.toFixed(0), this.game.puzzleStyle.colors[0]);
        }
        if (false) {
            for (let i = 1; i <= 7; i++) {
                let texture = new BABYLON.Texture("./datas/textures/tex" + i.toFixed(0) + ".png");
                this.setTexture("tex" + i.toFixed(0), texture);
            }
        }
        else {
            let texture = new BABYLON.Texture("./datas/textures/tex0.png");
            for (let i = 1; i <= 7; i++) {
                this.setTexture("tex" + i.toFixed(0), texture);
            }
        }
        this.getScene().onBeforeRenderObservable.add(this._update);
    }
    dispose(forceDisposeEffect, forceDisposeTextures, notBoundToMesh) {
        super.dispose(forceDisposeEffect, forceDisposeTextures, notBoundToMesh);
        this.getScene().onBeforeRenderObservable.removeCallback(this._update);
    }
}
class Tile extends BABYLON.Mesh {
    constructor(puzzle, i, j) {
        super("tile_" + i.toFixed(0) + "_" + j.toFixed(0));
        this.puzzle = puzzle;
        this.i = i;
        this.j = j;
        this.initialColor = 0;
        BABYLON.CreateGroundVertexData({ width: 1, height: 1 }).applyToMesh(this);
        this.position.x = i + 0.5;
        this.position.y = 0.05;
        this.position.z = j + 0.5;
        this.visibility = 0;
    }
    get currentColor() {
        let pixel = this.puzzle.pixels[this.i * Puzzle.PIXELS_PER_TILE][this.j * Puzzle.PIXELS_PER_TILE];
        return pixel.color;
    }
}
class Puzzle {
    constructor(game) {
        this.game = game;
        this.playing = false;
        this.flippingCount = 0;
        this.colorsCount = 3;
        this.colors = [];
        this.colorsV3 = [];
        this.moves = 0;
        this.topScore = 10;
        this.naiveScore = 15;
        this.w = 10;
        this.h = 10;
        this.wP = this.w * Puzzle.PIXELS_PER_TILE;
        this.hP = this.h * Puzzle.PIXELS_PER_TILE;
        this.inputI = 0;
        this.inputJ = 0;
        this.tiles = [];
        this.pixels = [];
        this.update = () => {
            if (this.groundVertexDataNeedUpdate) {
                this.groundVertexData.applyToMesh(this.ground);
                this.groundVertexDataNeedUpdate = false;
            }
        };
        this.colors = [
            BABYLON.Color3.FromHexString("#000000"),
            BABYLON.Color3.FromHexString("#0000ff"),
            BABYLON.Color3.FromHexString("#00ff00"),
            BABYLON.Color3.FromHexString("#00ffff"),
            BABYLON.Color3.FromHexString("#ff0000"),
            BABYLON.Color3.FromHexString("#ff00ff"),
            BABYLON.Color3.FromHexString("#ffff00"),
            BABYLON.Color3.FromHexString("#ffffff"),
        ];
        this.colorsV3 = this.colors.map(c => { return new BABYLON.Vector3(c.r, c.g, c.b); });
        this.frame = new PuzzleFrame(this);
        document.querySelector("canvas").addEventListener("pointerup", () => {
            if (this.playing) {
                if (!this.isCornerFlipping()) {
                    let pickingRay = this.game.scene.createPickingRay(this.game.scene.pointerX * this.game.performanceWatcher.devicePixelRatio, this.game.scene.pointerY * this.game.performanceWatcher.devicePixelRatio, BABYLON.Matrix.Identity(), this.game.camera, false);
                    let pick = this.game.scene.pickWithRay(pickingRay, (mesh) => {
                        return mesh instanceof Tile;
                    });
                    if (pick.hit && pick.pickedMesh instanceof Tile) {
                        let pixel = this.pixels[pick.pickedMesh.i * Puzzle.PIXELS_PER_TILE][pick.pickedMesh.j * Puzzle.PIXELS_PER_TILE];
                        this.startFlood(pixel.color);
                    }
                }
            }
        });
    }
    get lowScore() {
        return this.naiveScore + 4;
    }
    getTile(i, j) {
        if (this.tiles[i]) {
            return this.tiles[i][j];
        }
    }
    getPixel(i, j) {
        if (this.pixels[i]) {
            return this.pixels[i][j];
        }
    }
    async initialize(data) {
        this.data = data;
        this.colorsCount = data.colorsCount;
        this.inputI = data.inputI;
        this.inputJ = data.inputJ;
        this.w = data.w;
        this.h = data.h;
        this.wP = this.w * Puzzle.PIXELS_PER_TILE;
        this.hP = this.h * Puzzle.PIXELS_PER_TILE;
        if (isFinite(data.topScore)) {
            this.topScore = data.topScore;
        }
        else {
            this.topScore = 10;
        }
        if (isFinite(data.naiveScore)) {
            this.naiveScore = data.naiveScore;
        }
        else {
            this.naiveScore = 10;
        }
        this.moves = 0;
        if (this.container) {
            this.container.dispose();
        }
        this.container = new BABYLON.Mesh("container");
        if (this.faucet) {
            this.faucet.dispose();
        }
        this.faucet = new BABYLON.Mesh("faucet");
        let faucetVertexData = await this.game.vertexDataLoader.getAtIndex("./datas/meshes/faucet.babylon");
        faucetVertexData.applyToMesh(this.faucet);
        this.faucet.position.x = this.inputI + 0.5;
        this.faucet.position.z = this.inputJ + 1.5;
        let frameMaterial = new BABYLON.StandardMaterial("frame-material");
        frameMaterial.specularColor.copyFromFloats(0, 0, 0);
        frameMaterial.diffuseColor = BABYLON.Color3.FromHexString("#5e8291");
        this.faucet.material = frameMaterial;
        this.tiles = [];
        for (let i = 0; i < this.w; i++) {
            this.tiles[i] = [];
            for (let j = 0; j < this.h; j++) {
                let tile = new Tile(this, i, j);
                this.tiles[i][j] = tile;
            }
        }
        let split = data.grid.split("_");
        for (let i = 0; i < this.w; i++) {
            for (let j = 0; j < this.h; j++) {
                let tile = this.tiles[i][j];
                tile.initialColor = parseInt(split[j][i]);
            }
        }
        this.corners = [];
        for (let i = 0; i < this.w - 1; i++) {
            this.corners[i] = [];
            for (let j = 0; j < this.h - 1; j++) {
                this.corners[i][j] = BABYLON.MeshBuilder.CreateBox("corner", { width: 1 / Puzzle.PIXELS_PER_TILE * 0.7, height: 0.01, depth: 1 / Puzzle.PIXELS_PER_TILE * 0.7 });
                this.corners[i][j].position.copyFromFloats(i + 1, 0, j + 1);
                this.corners[i][j].rotation.y = Math.PI / 4;
            }
        }
    }
    instantiate() {
        if (this.ground) {
            this.ground.dispose();
        }
        this.ground = new BABYLON.Mesh("ground");
        let material = new PixelsMaterial("material", this.game);
        this.ground.material = material;
        this.groundVertexData = new BABYLON.VertexData();
        let positions = [];
        let indices = [];
        let normals = [];
        let colors = [];
        let uvs = [];
        this.pixels = [];
        for (let i = 0; i < this.w * Puzzle.PIXELS_PER_TILE; i++) {
            this.pixels[i] = [];
        }
        for (let j = 0; j < this.h * Puzzle.PIXELS_PER_TILE; j++) {
            for (let i = 0; i < this.w * Puzzle.PIXELS_PER_TILE; i++) {
                let pixel = new Pixel(this, i, j);
                this.pixels[i][j] = pixel;
                let l = positions.length / 3;
                positions.push(pixel.position.x, pixel.position.y, pixel.position.z);
                normals.push(0, 1, 0);
                colors.push(1, 1, 1, 1);
                uvs.push(pixel.position.x, pixel.position.z);
                let tile00 = this.getTile(Math.floor((i - 0) / Puzzle.PIXELS_PER_TILE), Math.floor((j - 0) / Puzzle.PIXELS_PER_TILE));
                if (tile00 && tile00.initialColor === 0) {
                    //positions[3 * l + 1] = - 0.1;
                }
                let tile01 = this.getTile(Math.floor((i - 0) / Puzzle.PIXELS_PER_TILE), Math.floor((j + 1) / Puzzle.PIXELS_PER_TILE));
                let tile10 = this.getTile(Math.floor((i + 1) / Puzzle.PIXELS_PER_TILE), Math.floor((j - 0) / Puzzle.PIXELS_PER_TILE));
                let tile11 = this.getTile(Math.floor((i + 1) / Puzzle.PIXELS_PER_TILE), Math.floor((j + 1) / Puzzle.PIXELS_PER_TILE));
                if (tile00 && tile00.initialColor === 0 || tile01 && tile01.initialColor === 0) {
                    //positions[3 * l] -= 0.05 / Puzzle.PIXELS_PER_TILE;
                }
                else if (tile10 && tile10.initialColor === 0 || tile11 && tile11.initialColor === 0) {
                    //positions[3 * l] += 0.05 / Puzzle.PIXELS_PER_TILE;
                }
                else if (tile00 && tile00.initialColor === 0 || tile10 && tile10.initialColor === 0) {
                    //positions[3 * l + 2] -= 0.05 / Puzzle.PIXELS_PER_TILE;
                }
                else if (tile01 && tile01.initialColor === 0 || tile11 && tile11.initialColor === 0) {
                    //positions[3 * l + 2] += 0.05 / Puzzle.PIXELS_PER_TILE;
                }
                else {
                    if (i < this.wP - 1 && j < this.hP - 1) {
                        if (Math.random() < 0.5) {
                            indices.push(l, l + 1, l + 1 + this.wP);
                            indices.push(l, l + 1 + this.wP, l + this.wP);
                        }
                        else {
                            indices.push(l, l + 1, l + this.wP);
                            indices.push(l + 1, l + 1 + this.wP, l + this.wP);
                        }
                    }
                }
            }
        }
        this.groundVertexData.positions = positions;
        this.groundVertexData.indices = indices;
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        this.groundVertexData.normals = normals;
        this.groundVertexData.colors = colors;
        this.groundVertexData.uvs = uvs;
        this.groundVertexData.applyToMesh(this.ground);
        this.game.scene.onBeforeRenderObservable.add(this.update);
        for (let i = 0; i < this.w; i++) {
            for (let j = 0; j < this.h; j++) {
                let tile = this.tiles[i][j];
                for (let ii = 0; ii < Puzzle.PIXELS_PER_TILE; ii++) {
                    for (let jj = 0; jj < Puzzle.PIXELS_PER_TILE; jj++) {
                        this.pixels[i * Puzzle.PIXELS_PER_TILE + ii][j * Puzzle.PIXELS_PER_TILE + jj].setColor(tile.initialColor);
                    }
                }
            }
        }
        this.frame.instantiate();
    }
    updateCorner(i, j) {
        let pixel00 = this.getPixel((i + 1) * Puzzle.PIXELS_PER_TILE - 1, (j + 1) * Puzzle.PIXELS_PER_TILE - 1);
        let pixel10 = this.getPixel((i + 1) * Puzzle.PIXELS_PER_TILE, (j + 1) * Puzzle.PIXELS_PER_TILE - 1);
        let pixel01 = this.getPixel((i + 1) * Puzzle.PIXELS_PER_TILE - 1, (j + 1) * Puzzle.PIXELS_PER_TILE);
        let pixel11 = this.getPixel((i + 1) * Puzzle.PIXELS_PER_TILE, (j + 1) * Puzzle.PIXELS_PER_TILE);
        if (pixel00 && pixel10 && pixel01 && pixel11) {
            let show = true;
            if (pixel00.color === 0 || pixel00.flipping) {
                show = false;
            }
            else if (pixel10.color === 0 || pixel10.flipping) {
                show = false;
            }
            else if (pixel01.color === 0 || pixel01.flipping) {
                show = false;
            }
            else if (pixel11.color === 0 || pixel11.flipping) {
                show = false;
            }
            else if (pixel00.color === pixel01.color && pixel10.color === pixel11.color) {
                show = false;
            }
            else if (pixel00.color === pixel10.color && pixel01.color === pixel11.color) {
                show = false;
            }
            this.corners[i][j].isVisible = show;
        }
    }
    isComplete() {
        if (this.flippingCount === 0) {
            let color = undefined;
            for (let i = 0; i < this.w; i++) {
                for (let j = 0; j < this.h; j++) {
                    let tile = this.tiles[i][j];
                    let currentColor = tile.currentColor;
                    if (currentColor > 0) {
                        if (color === undefined) {
                            color = currentColor;
                        }
                        else if (color != currentColor) {
                            return false;
                        }
                    }
                }
            }
            return true;
        }
        return false;
    }
    startFlood(color) {
        if (this.playing) {
            if (color > 0) {
                let blob = new FaucetBlob(this, color);
                blob.plop();
                this.moves++;
                this.game.puzzleUI.setMove(this.moves);
                let iPixel = Math.floor((this.inputI + 0.5) * Puzzle.PIXELS_PER_TILE);
                let jPixel = Math.floor((this.inputJ + 1) * Puzzle.PIXELS_PER_TILE - 1);
                this.pixels[iPixel][jPixel].flipFromTo(this.pixels[iPixel][jPixel].color, color);
                //this.game.puzzleSolver.debugFlood(color);
            }
        }
    }
    isCornerFlipping() {
        for (let i = 0; i < 2 * Puzzle.PIXELS_PER_TILE; i++) {
            for (let j = 0; j < 2 * Puzzle.PIXELS_PER_TILE; j++) {
                let pixel = this.getPixel(i, this.hP - 1 - j);
                if (!pixel || pixel.flipping) {
                    return true;
                }
            }
        }
        return false;
    }
}
Puzzle.PIXELS_PER_TILE = 4;
class FaucetBlob extends BABYLON.Mesh {
    constructor(puzzle, color) {
        super("blob");
        this.puzzle = puzzle;
        this.animatePosition = Mummu.AnimationFactory.EmptyVector3Callback;
        this.animateSize = Mummu.AnimationFactory.EmptyNumberCallback;
        BABYLON.CreateSphereVertexData({ diameter: 1 }).applyToMesh(this);
        this.material = this.puzzle.game.colorMaterials[color];
        this.position.copyFrom(this.puzzle.faucet.position);
        this.position.y = 0.5;
        this.position.z -= 0.5;
        this.size = 0;
        this.animatePosition = Mummu.AnimationFactory.CreateVector3(this, this, "position");
        this.animateSize = Mummu.AnimationFactory.CreateNumber(this, this, "size", undefined, undefined, Nabu.Easing.easeInOutSine);
    }
    get size() {
        return this.scaling.x;
    }
    set size(s) {
        this.scaling.copyFromFloats(s, s, 0.5 * s);
    }
    async plop() {
        await this.animateSize(0.6, 0.4, Nabu.Easing.easeOutCubic);
        await this.animateSize(0, 0.4, Nabu.Easing.easeInCubic);
        this.dispose();
    }
}
class PuzzleFrame extends BABYLON.Mesh {
    constructor(puzzle) {
        super("puzzle-frame");
        this.puzzle = puzzle;
        this.borderGrid = [];
        let frameMaterial = new BABYLON.StandardMaterial("frame-material");
        frameMaterial.specularColor.copyFromFloats(0, 0, 0);
        frameMaterial.diffuseColor = BABYLON.Color3.FromHexString("#5e8291");
        this.material = frameMaterial;
    }
    getBorderGrid(i, j) {
        if (this.borderGrid[i]) {
            return this.borderGrid[i][j];
        }
    }
    incBorderGrid(i, j) {
        if (this.borderGrid[i]) {
            if (this.borderGrid[i][j] != undefined) {
                this.borderGrid[i][j]++;
            }
        }
    }
    instantiate() {
        for (let i = 0; i < 2 * this.puzzle.w + 1; i++) {
            this.borderGrid[i] = [];
            for (let j = 0; j < 2 * this.puzzle.h + 1; j++) {
                this.borderGrid[i][j] = 0;
            }
        }
        for (let i = -1; i < this.puzzle.w + 1; i++) {
            for (let j = -1; j < this.puzzle.h + 1; j++) {
                let t = this.puzzle.getTile(i, j);
                if (!t || (t && t.initialColor === 0)) {
                    this.incBorderGrid(2 * i, 2 * j);
                    this.incBorderGrid(2 * i, 2 * j + 1);
                    this.incBorderGrid(2 * i, 2 * j + 2);
                    this.incBorderGrid(2 * i + 1, 2 * j);
                    this.incBorderGrid(2 * i + 1, 2 * j + 2);
                    this.incBorderGrid(2 * i + 2, 2 * j);
                    this.incBorderGrid(2 * i + 2, 2 * j + 1);
                    this.incBorderGrid(2 * i + 2, 2 * j + 2);
                }
            }
        }
        let datas = [];
        for (let i = 0; i < 2 * this.puzzle.w + 1; i++) {
            for (let j = 0; j < 2 * this.puzzle.h + 1; j++) {
                let border = this.getBorderGrid(i, j);
                if (border > 0) {
                    let w = i % 2 === 0 ? 0.15 : 0.85;
                    let d = j % 2 === 0 ? 0.15 : 0.85;
                    let x = i * 0.5;
                    let z = j * 0.5;
                    if ((i % 2 === 1 || j % 2 === 1) && border === 2) {
                        continue;
                    }
                    if ((i % 2 === 0 || j % 2 === 0) && border === 4) {
                        continue;
                    }
                    let block = BABYLON.CreateBoxVertexData({ width: w, height: 4, depth: d });
                    Mummu.ColorizeVertexDataInPlace(block, BABYLON.Color3.White());
                    let l = block.positions.length / 3;
                    for (let n = 0; n < l; n++) {
                        let y = block.positions[3 * n + 1];
                        if (y < 0) {
                            block.colors[4 * n] = 0.1;
                            block.colors[4 * n + 1] = 0.1;
                            block.colors[4 * n + 2] = 0.1;
                        }
                    }
                    Mummu.TranslateVertexDataInPlace(block, new BABYLON.Vector3(x, -2 + 0.1, z));
                    datas.push(block);
                }
            }
        }
        Mummu.MergeVertexDatas(...datas).applyToMesh(this);
    }
}
class PuzzleTemplate {
    constructor(name, content) {
        this.name = name;
        this.content = content;
    }
}
var simpleTemplates = [
    new PuzzleTemplate("Square 4", `
    1111_
    1111_
    1111_
    1111
    `),
    new PuzzleTemplate("Square 5", `
    11111_
    11111_
    11111_
    11111_
    11111
    `),
    new PuzzleTemplate("Square 6", `
    111111_
    111111_
    111111_
    111111_
    111111_
    111111
    `),
    new PuzzleTemplate("Square 7", `
    1111111_
    1111111_
    1111111_
    1111111_
    1111111_
    1111111_
    1111111
    `),
    new PuzzleTemplate("Square 8", `
    11111111_
    11111111_
    11111111_
    11111111_
    11111111_
    11111111_
    11111111_
    11111111
    `),
    new PuzzleTemplate("Square 10", `
    1111111111_
    1111111111_
    1111111111_
    1111111111_
    1111111111_
    1111111111_
    1111111111_
    1111111111_
    1111111111_
    1111111111
    `),
    new PuzzleTemplate("Disc 6", `
    012110_
    111111_
    111111_
    111111_
    111111_
    011110
    `),
    new PuzzleTemplate("Disc 7", `
    0012100_
    0111110_
    1111111_
    1111111_
    1111111_
    0111110_
    0011100
    `),
    new PuzzleTemplate("Disc 8", `
    00121100_
    01111110_
    11111111_
    11111111_
    11111111_
    11111111_
    01111110_
    00111100
    `),
    new PuzzleTemplate("Heart", `
    0011100011100_
    0111110111110_
    1100112111111_
    1101111111111_
    1111111111111_
    0111111111110_
    0011111111100_
    0001111111000_
    0000111110000_
    0000011100000_
    0000001000000
    `)
];
var spaceInvaderTemplates = [
    new PuzzleTemplate("Invader 1", `
    0012001100_
    1001111001_
    1011111101_
    1110110111_
    0111111110_
    0011111100_
    0010000100_
    0110000110
    `),
    new PuzzleTemplate("Invader 2", `
    001000100_
    001121100_
    011010110_
    111111111_
    101111101_
    101111101_
    000101000_
    001101100
    `),
    new PuzzleTemplate("Invader 3", `
    001121100_
    011111110_
    011111110_
    110010011_
    110110111_
    111111111_
    111111111_
    101010101
    `),
    new PuzzleTemplate("Invader 4", `
    001000100_
    001121100_
    011111110_
    010010010_
    111111111_
    111000111_
    111111111_
    101010101
    `),
    new PuzzleTemplate("Invader 5", `
    00011211000_
    00110101100_
    10111111101_
    10100000101_
    11101010111_
    00111111100_
    00110001100_
    00110001100
    `)
];
var templates = [...simpleTemplates, ...spaceInvaderTemplates];
function TemplateNameToIndex(name) {
    return templates.findIndex((template) => {
        return template.name === name;
    });
}
class PuzzleGenerator {
    static MakePuzzleFromTemplate(solver, templateIndex, colorsCount = 8) {
        let template = templates[templateIndex];
        let content = template.content.replaceAll("\n", "");
        content = content.replaceAll(" ", "");
        let splitTemplate = content.split("_");
        splitTemplate.reverse();
        let h = splitTemplate.length;
        let w = splitTemplate[0].length;
        let iInput = -1;
        let jInput = -1;
        let jMax = 0;
        let grid = "";
        for (let j = 0; j < h; j++) {
            for (let i = 0; i < w; i++) {
                let templateC = parseInt(splitTemplate[j][i]);
                let c = 0;
                if (templateC === 0) {
                    c = 0;
                }
                else if (templateC === 1) {
                    c = Math.floor(1 + (colorsCount - 1) * Math.random());
                }
                else if (templateC === 2) {
                    iInput = i;
                    jInput = j;
                    c = Math.floor(1 + (colorsCount - 1) * Math.random());
                }
                else {
                    c = Math.floor(1 + (colorsCount - 1) * Math.random());
                }
                grid += c.toFixed(0);
                if (i === 0 && c > 0) {
                    jMax = j;
                }
            }
            grid += "_";
        }
        if (iInput === -1) {
            iInput = 0;
        }
        if (jInput === -1) {
            jInput = jMax;
        }
        let data = {
            w: w,
            h: h,
            inputI: iInput,
            inputJ: jInput,
            colorsCount: colorsCount,
            grid: grid,
            topScore: 10,
            naiveScore: 10
        };
        solver.initialize(data);
        let bestMoves = solver.getBestMoves();
        let naiveMoves = solver.getNaiveMoves();
        data.topScore = bestMoves.length;
        data.naiveScore = naiveMoves.length;
        console.log("Solvable in " + bestMoves.length + " " + naiveMoves.length + " moves.");
        return data;
    }
}
class Button extends BABYLON.Mesh {
    constructor(game) {
        super("button");
        this.game = game;
        this.animateButtonHeight = Mummu.AnimationFactory.EmptyNumberCallback;
        this.onClickCallback = () => { };
        this.base = new BABYLON.Mesh("base");
        this.base.layerMask = 0x10000000;
        this.base.parent = this;
        this.button = new BABYLON.Mesh("button");
        this.button.layerMask = 0x10000000;
        this.button.parent = this;
        this.animateButtonHeight = Mummu.AnimationFactory.CreateNumber(this.button, this.button.position, "y");
    }
    async instantiate() {
        let data = await this.game.vertexDataLoader.get("datas/meshes/button.babylon");
        data[0].applyToMesh(this.base);
        data[1].applyToMesh(this.button);
    }
    async onClick() {
        if (this.onClickCallback) {
            this.onClickCallback();
        }
        await this.animateButtonHeight(-0.1, 0.2);
        await this.animateButtonHeight(0, 0.3);
    }
}
class PuzzleInput {
    constructor(game) {
        this.game = game;
        this.inputs = [];
    }
    async instantiate() {
        for (let i = 1; i < 8; i++) {
            if (this.inputs[i]) {
                this.inputs[i].dispose();
            }
        }
        for (let i = 1; i < this.game.puzzle.colorsCount; i++) {
            let color = i;
            this.inputs[i] = new Button(this.game);
            this.inputs[i].rotation.x = -Math.PI / 2 * 0.7;
            this.inputs[i].onClickCallback = () => {
                this.game.puzzle.startFlood(color);
            };
            await this.inputs[i].instantiate();
            let material = new BABYLON.StandardMaterial("material");
            material.diffuseColor = this.game.puzzleStyle.colors[i];
            material.specularColor.copyFromFloats(0.1, 0.1, 0.1);
            this.inputs[i].button.material = material;
        }
        this.resize();
    }
    resize() {
        let s = 2 / (this.game.puzzle.colorsCount - 1);
        s = Math.min(s, 0.4);
        if (this.game.screenRatio > 1) {
            for (let i = 1; i < this.game.puzzle.colorsCount; i++) {
                if (this.inputs[i]) {
                    this.inputs[i].position.x = this.game.uiCameraHalfWidth - 0.5 * s;
                    this.inputs[i].position.y = 1 - (i - 1 + 0.5) * s;
                    this.inputs[i].position.z = 0;
                    this.inputs[i].scaling.copyFromFloats(s, s, s).scaleInPlace(0.9);
                }
            }
        }
        else {
            if (this.game.puzzle.colorsCount <= 5) {
                for (let i = 1; i < this.game.puzzle.colorsCount; i++) {
                    if (this.inputs[i]) {
                        this.inputs[i].position.x = -1 + (i - 1 + 0.5) * s;
                        this.inputs[i].position.y = -this.game.uiCameraHalfHeight + 0.5 * s;
                        this.inputs[i].position.z = 0;
                        this.inputs[i].scaling.copyFromFloats(s, s, s).scaleInPlace(0.9);
                    }
                }
            }
            else {
                let s = 2 / (this.game.puzzle.colorsCount * 0.5 - 1);
                s = Math.min(s, 0.4);
                let n = Math.floor(this.game.puzzle.colorsCount * 0.5 + 1);
                for (let i = 1; i < n; i++) {
                    if (this.inputs[i]) {
                        this.inputs[i].position.x = -1 + (i - 1 + 0.5) * s + (2 - (n - 1) * s) * 0.5;
                        this.inputs[i].position.y = -this.game.uiCameraHalfHeight + 0.5 * s;
                        this.inputs[i].position.z = 0;
                        this.inputs[i].scaling.copyFromFloats(s, s, s).scaleInPlace(0.9);
                    }
                }
                for (let i = n; i < this.game.puzzle.colorsCount; i++) {
                    if (this.inputs[i]) {
                        this.inputs[i].position.x = -1 + (i - n + 0.5) * s + (2 - (this.game.puzzle.colorsCount - n) * s) * 0.5;
                        this.inputs[i].position.y = -this.game.uiCameraHalfHeight + 0.5 * s + s;
                        this.inputs[i].position.z = 0;
                        this.inputs[i].scaling.copyFromFloats(s, s, s).scaleInPlace(0.9);
                    }
                }
            }
        }
    }
}
class PuzzleSolver {
    constructor(game) {
        this.game = game;
        this.colorNames = [
            "Zero",
            "Red",
            "Orange",
            "Yellow",
            "Green",
            "LightBlue",
            "Blue",
            "Purple"
        ];
    }
    initialize(data) {
        this.data = data;
        this.tiles = [];
        for (let i = 0; i < this.data.w; i++) {
            this.tiles[i] = [];
        }
        let split = data.grid.split("_");
        for (let i = 0; i < this.data.w; i++) {
            for (let j = 0; j < this.data.h; j++) {
                this.tiles[i][j] = parseInt(split[j][i]);
            }
        }
    }
    cloneTiles(tiles) {
        let clonedTiles = [];
        for (let i = 0; i < tiles.length; i++) {
            clonedTiles[i] = [];
            for (let j = 0; j < tiles[i].length; j++) {
                clonedTiles[i][j] = tiles[i][j];
            }
        }
        return clonedTiles;
    }
    isWon(tiles) {
        let color = tiles[this.data.inputI][this.data.inputJ];
        for (let i = 0; i < tiles.length; i++) {
            for (let j = 0; j < tiles[i].length; j++) {
                if (tiles[i][j] > 0 && tiles[i][j] != color) {
                    return false;
                }
            }
        }
        return true;
    }
    getArea(tiles) {
        let count = { n: 0 };
        let clonedTiles = this.cloneTiles(tiles);
        this.floodTiles(clonedTiles, 16, count);
        return count.n;
    }
    getAreaAfterFlood(tiles, color) {
        tiles = this.cloneTiles(tiles);
        this.floodTiles(tiles, color);
        return this.getArea(tiles);
    }
    getAreaAfterFloods(tiles, colors) {
        let areaZero = this.getArea(tiles);
        let areaPrev = areaZero;
        tiles = this.cloneTiles(tiles);
        for (let i = 0; i < colors.length; i++) {
            this.floodTiles(tiles, colors[i]);
            let area = this.getArea(tiles);
            if (area === areaPrev) {
                return areaPrev;
            }
            areaPrev = area;
        }
        return areaPrev;
    }
    floodTilesStep(i, j, tiles, color, count) {
        let previousColor = tiles[i][j];
        tiles[i][j] = color;
        count.n++;
        if (i - 1 >= 0) {
            if (tiles[i - 1][j] === previousColor) {
                this.floodTilesStep(i - 1, j, tiles, color, count);
            }
        }
        if (i + 1 < this.data.w) {
            if (tiles[i + 1][j] === previousColor) {
                this.floodTilesStep(i + 1, j, tiles, color, count);
            }
        }
        if (j - 1 >= 0) {
            if (tiles[i][j - 1] === previousColor) {
                this.floodTilesStep(i, j - 1, tiles, color, count);
            }
        }
        if (j + 1 < this.data.h) {
            if (tiles[i][j + 1] === previousColor) {
                this.floodTilesStep(i, j + 1, tiles, color, count);
            }
        }
    }
    floodTiles(tiles, color, count) {
        if (!count) {
            count = { n: 0 };
        }
        if (tiles[this.data.inputI][this.data.inputJ] > 0 && tiles[this.data.inputI][this.data.inputJ] != color) {
            this.floodTilesStep(this.data.inputI, this.data.inputJ, tiles, color, count);
        }
    }
    findBestMove(tiles) {
        let currentArea = this.getArea(tiles);
        let bestColor = 0;
        let bestNewArea = currentArea;
        for (let c5 = 1; c5 < this.data.colorsCount; c5++) {
            for (let c4 = 1; c4 < this.data.colorsCount; c4++) {
                if (c4 != c5) {
                    for (let c3 = 1; c3 < this.data.colorsCount; c3++) {
                        if (c3 != c4) {
                            for (let c2 = 1; c2 < this.data.colorsCount; c2++) {
                                if (c2 != c3) {
                                    for (let c1 = 1; c1 < this.data.colorsCount; c1++) {
                                        if (c1 != c2) {
                                            for (let c0 = 1; c0 < this.data.colorsCount; c0++) {
                                                if (c0 != c1) {
                                                    let newArea = this.getAreaAfterFloods(tiles, [c0, c1, c2, c3, c4, c5]);
                                                    if (newArea > bestNewArea) {
                                                        bestNewArea = newArea;
                                                        bestColor = c0;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return bestColor;
    }
    findBestMoveNaive(tiles) {
        let currentArea = this.getArea(tiles);
        let bestColor = 0;
        let bestNewArea = currentArea;
        for (let c0 = 1; c0 < this.data.colorsCount; c0++) {
            let newArea = this.getAreaAfterFloods(tiles, [c0]);
            if (newArea > bestNewArea) {
                bestNewArea = newArea;
                bestColor = c0;
            }
        }
        return bestColor;
    }
    getBestMoves() {
        let moves = [];
        let tiles = this.cloneTiles(this.tiles);
        let nextMove = this.findBestMove(tiles);
        moves.push(this.colorNames[nextMove]);
        this.floodTiles(tiles, nextMove);
        while (nextMove > 0 && !this.isWon(tiles)) {
            nextMove = this.findBestMove(tiles);
            moves.push(this.colorNames[nextMove]);
            this.floodTiles(tiles, nextMove);
        }
        return moves;
    }
    getNaiveMoves() {
        let moves = [];
        let tiles = this.cloneTiles(this.tiles);
        let nextMove = this.findBestMoveNaive(tiles);
        moves.push(this.colorNames[nextMove]);
        this.floodTiles(tiles, nextMove);
        while (nextMove > 0 && !this.isWon(tiles)) {
            nextMove = this.findBestMoveNaive(tiles);
            moves.push(this.colorNames[nextMove]);
            this.floodTiles(tiles, nextMove);
        }
        return moves;
    }
    logSteps() {
        let moves = [];
        let tiles = this.cloneTiles(this.tiles);
        let nextMove = this.findBestMove(tiles);
        moves.push(this.colorNames[nextMove]);
        this.floodTiles(tiles, nextMove);
        while (nextMove > 0 && !this.isWon(tiles)) {
            nextMove = this.findBestMove(tiles);
            moves.push(this.colorNames[nextMove]);
            this.floodTiles(tiles, nextMove);
        }
        if (nextMove === 0) {
            console.log("Not solvable");
            //console.log(moves);
        }
        else {
            let naiveMoves = [];
            tiles = this.cloneTiles(this.tiles);
            let nextNaiveMove = this.findBestMoveNaive(tiles);
            naiveMoves.push(this.colorNames[nextNaiveMove]);
            this.floodTiles(tiles, nextNaiveMove);
            while (nextNaiveMove > 0 && !this.isWon(tiles)) {
                nextNaiveMove = this.findBestMoveNaive(tiles);
                naiveMoves.push(this.colorNames[nextNaiveMove]);
                this.floodTiles(tiles, nextNaiveMove);
            }
            console.log("Solvable in " + moves.length + " " + naiveMoves.length + " moves.");
            //console.log(naiveMoves);
        }
    }
    debugFlood(color) {
        console.log("Current Area Size is " + this.getArea(this.tiles).toFixed(0));
        this.floodTiles(this.tiles, color);
        console.log("Now Area Size is " + this.getArea(this.tiles).toFixed(0));
        console.log("Next Best Move is " + this.colorNames[this.findBestMove(this.tiles)]);
    }
}
class PuzzleStyle {
    get colorsCount() {
        return this.colors.length;
    }
}
var defaultPuzzleStyle = new PuzzleStyle();
defaultPuzzleStyle.colors = [
    BABYLON.Color3.FromHexString("#ffffff"),
    BABYLON.Color3.FromHexString("#8CB369"),
    BABYLON.Color3.FromHexString("#F4E285"),
    BABYLON.Color3.FromHexString("#F4A259"),
    BABYLON.Color3.FromHexString("#5B8E7D"),
    BABYLON.Color3.FromHexString("#BC4B51"),
    BABYLON.Color3.FromHexString("#ffffff"),
    BABYLON.Color3.FromHexString("#ffffff")
];
var toonPuzzleStyle = new PuzzleStyle();
toonPuzzleStyle.colors = [
    BABYLON.Color3.FromHexString("#ffffff"),
    BABYLON.Color3.FromHexString("#E64D3D"),
    BABYLON.Color3.FromHexString("#F1882D"),
    BABYLON.Color3.FromHexString("#FBEB36"),
    BABYLON.Color3.FromHexString("#9BC674"),
    BABYLON.Color3.FromHexString("#01ACE2"),
    BABYLON.Color3.FromHexString("#87589C"),
    BABYLON.Color3.FromHexString("#ffffff")
];
var pastelRainbow = new PuzzleStyle();
pastelRainbow.colors = [
    BABYLON.Color3.FromHexString("#ffffff"),
    BABYLON.Color3.FromHexString("#de324c"),
    BABYLON.Color3.FromHexString("#f4895f"),
    BABYLON.Color3.FromHexString("#f8e16f"),
    BABYLON.Color3.FromHexString("#95cf92"),
    BABYLON.Color3.FromHexString("#369acc"),
    BABYLON.Color3.FromHexString("#9656a2"),
    BABYLON.Color3.FromHexString("#cbabd1")
];
var adult = new PuzzleStyle();
adult.colors = [
    BABYLON.Color3.FromHexString("#ffffff"),
    BABYLON.Color3.FromHexString("#b5215d"),
    BABYLON.Color3.FromHexString("#d94f21"),
    BABYLON.Color3.FromHexString("#febd2b"),
    BABYLON.Color3.FromHexString("#9aab4b"),
    BABYLON.Color3.FromHexString("#182b55"),
    BABYLON.Color3.FromHexString("#5f4e94"),
    BABYLON.Color3.FromHexString("#a291c7"),
];
var rainbow = new PuzzleStyle();
rainbow.colors = [
    BABYLON.Color3.FromHexString("#ffffff"),
    BABYLON.Color3.FromHexString("#de3030"),
    BABYLON.Color3.FromHexString("#e07a34"),
    BABYLON.Color3.FromHexString("#e2c337"),
    BABYLON.Color3.FromHexString("#9dbd3d"),
    BABYLON.Color3.FromHexString("#40d6cf"),
    BABYLON.Color3.FromHexString("#3d9dbd"),
    BABYLON.Color3.FromHexString("#ab567e"),
];
class FillBar extends BABYLON.Mesh {
    constructor(game, w, h, maxValue) {
        super("textbox");
        this.game = game;
        this.w = w;
        this.h = h;
        this.maxValue = maxValue;
        this.boxes = [];
        this.currentValue = 0;
        this.posHide = new BABYLON.Vector3(-2, -2, -2);
        this.posShow = new BABYLON.Vector3(0, 0, 0);
        this.animatePosition = Mummu.AnimationFactory.EmptyVector3Callback;
        this.animatePosition = Mummu.AnimationFactory.CreateVector3(this, this, "position");
    }
    async instantiate() {
        if (this.frame) {
            this.frame.dispose();
        }
        this.frame = new BABYLON.Mesh("frame");
        this.frame.layerMask = 0x10000000;
        this.frame.material = this.game.puzzleUI.uiFrameWhiteMaterial;
        this.frame.parent = this;
        let frameData = await this.game.vertexDataLoader.getAtIndex("datas/meshes/textbox.babylon");
        frameData = Mummu.CloneVertexData(frameData);
        for (let i = 0; i < frameData.positions.length / 3; i++) {
            let x = frameData.positions[3 * i];
            let y = frameData.positions[3 * i + 1];
            if (x > 0) {
                x += this.w * 0.5 - 0.5;
            }
            else if (x < 0) {
                x -= this.w * 0.5 - 0.5;
            }
            if (y > 0) {
                y += this.h * 0.5 - 0.5;
            }
            else if (y < 0) {
                y -= this.h * 0.5 - 0.5;
            }
            frameData.positions[3 * i] = x;
            frameData.positions[3 * i + 1] = y;
        }
        frameData.applyToMesh(this.frame);
        this.boxes = [];
        let bW = (this.w - 0.05) / (this.maxValue) - 0.01;
        let bH = this.h - 0.05;
        for (let i = 0; i < this.maxValue; i++) {
            let box = BABYLON.MeshBuilder.CreateBox("box", { width: bW, height: bH, depth: 0.1 });
            box.layerMask = 0x10000000;
            box.position.x = (this.w - 0.05 - bW) * (-0.5 + i / (this.maxValue - 1));
            box.position.z = -0.1;
            box.parent = this.frame;
            this.boxes[i] = box;
        }
        this.setValue(0);
    }
    setValue(v) {
        this.currentValue = v;
        for (let i = 0; i < this.currentValue && i < this.boxes.length; i++) {
            this.boxes[i].material = this.game.colorMaterials[6];
        }
        for (let i = this.currentValue; i < this.boxes.length; i++) {
            this.boxes[i].material = this.game.colorMaterials[3];
        }
    }
    async setMaxValue(maxValue) {
        this.maxValue = maxValue;
        await this.instantiate();
    }
    getPos(v) {
        let bW = (this.w - 0.05) / (this.maxValue) - 0.01;
        let x = (this.w - 0.05 - bW) * (-0.5 + v / (this.maxValue - 1));
        return this.posShow.add(new BABYLON.Vector3(x, 0, -0.1));
    }
    async show(duration = 0.5) {
        if (duration === 0) {
            this.position.copyFrom(this.posShow);
        }
        else {
            return this.animatePosition(this.posShow, duration, Nabu.Easing.easeOutCubic);
        }
    }
    async hide(duration = 0.5) {
        if (duration === 0) {
            this.position.copyFrom(this.posHide);
        }
        else {
            return this.animatePosition(this.posHide, duration, Nabu.Easing.easeInCubic);
        }
    }
}
class TextBox extends BABYLON.Mesh {
    constructor(game, w, h) {
        super("textbox");
        this.game = game;
        this.w = w;
        this.h = h;
        this.text = "";
        this.backgroundColor = "#000000";
        this.textColor = "#ffffff";
        this.fontSize = 40;
        this.verticalOffset = 0;
        this.posHide = new BABYLON.Vector3(-2, -2, -2);
        this.posShow = new BABYLON.Vector3(0, 0, 0);
        this.animatePosition = Mummu.AnimationFactory.EmptyVector3Callback;
        this.onClickCallback = () => { };
        this.animatePosition = Mummu.AnimationFactory.CreateVector3(this, this, "position");
    }
    async instantiate() {
        this.frame = new BABYLON.Mesh("frame");
        this.frame.layerMask = 0x10000000;
        this.frame.material = this.game.puzzleUI.uiFrameWhiteMaterial;
        this.frame.parent = this;
        let frameData = await this.game.vertexDataLoader.getAtIndex("datas/meshes/textbox.babylon");
        frameData = Mummu.CloneVertexData(frameData);
        for (let i = 0; i < frameData.positions.length / 3; i++) {
            let x = frameData.positions[3 * i];
            let y = frameData.positions[3 * i + 1];
            if (x > 0) {
                x += this.w * 0.5 - 0.5;
            }
            else if (x < 0) {
                x -= this.w * 0.5 - 0.5;
            }
            if (y > 0) {
                y += this.h * 0.5 - 0.5;
            }
            else if (y < 0) {
                y -= this.h * 0.5 - 0.5;
            }
            frameData.positions[3 * i] = x;
            frameData.positions[3 * i + 1] = y;
        }
        frameData.applyToMesh(this.frame);
        this.textMesh = Mummu.CreateQuad("text-mesh", { width: this.w - 0.065, height: this.h - 0.065 });
        this.textMesh.layerMask = 0x10000000;
        this.textMesh.position.z = -0.1;
        this.textMesh.parent = this.frame;
        let textMaterial = new BABYLON.StandardMaterial("text-material");
        textMaterial.useAlphaFromDiffuseTexture = true;
        this.textMesh.material = textMaterial;
        let textureW = Math.floor(this.w * 500);
        let textureH = Math.floor(this.h * 500);
        let textTexture = new BABYLON.DynamicTexture("text-texture", { width: textureW, height: textureH });
        textTexture.hasAlpha = true;
        textMaterial.diffuseTexture = textTexture;
        let context = textTexture.getContext();
        context.fillStyle = this.backgroundColor;
        context.fillRect(0, 0, textureW, textureH);
        context.fillStyle = this.textColor;
        context.font = this.fontSize.toFixed(0) + "px BigBottomCartoonRegular";
        let l = context.measureText(this.text);
        context.fillText(this.text, Math.floor((textureW - l.width) * 0.5), Math.floor(textureH * (0.5 - 0.5 * this.verticalOffset) + this.fontSize * 0.5));
        textTexture.update();
    }
    async show(duration = 0.5) {
        if (duration === 0) {
            this.position.copyFrom(this.posShow);
        }
        else {
            return this.animatePosition(this.posShow, duration, Nabu.Easing.easeOutCubic);
        }
    }
    async hide(duration = 0.5) {
        if (duration === 0) {
            this.position.copyFrom(this.posHide);
        }
        else {
            return this.animatePosition(this.posHide, duration, Nabu.Easing.easeInCubic);
        }
    }
    async onClick() {
        if (this.onClickCallback) {
            this.onClickCallback();
        }
    }
}
class Star extends BABYLON.Mesh {
    constructor(game, s) {
        super("textbox");
        this.game = game;
        this._value = false;
        this.posHide = new BABYLON.Vector3(-2, -2, -2);
        this.posShow = new BABYLON.Vector3(0, 0, 0);
        this.animatePosition = Mummu.AnimationFactory.EmptyVector3Callback;
        this.animateSize = Mummu.AnimationFactory.EmptyNumberCallback;
        this.onClickCallback = () => { };
        this.size = s;
        this.animatePosition = Mummu.AnimationFactory.CreateVector3(this, this, "position");
        this.animateSize = Mummu.AnimationFactory.CreateNumber(this, this, "size");
    }
    get size() {
        return this.scaling.x;
    }
    set size(s) {
        this.scaling.copyFromFloats(s, s, s);
    }
    async instantiate() {
        this.frame = new BABYLON.Mesh("frame");
        this.frame.layerMask = 0x10000000;
        this.frame.material = this.game.puzzleUI.uiFrameWhiteMaterial;
        this.frame.parent = this;
        let frameData = await this.game.vertexDataLoader.getAtIndex("datas/meshes/star.babylon");
        frameData.applyToMesh(this.frame);
        this.colorMesh = new BABYLON.Mesh("color-mesh");
        this.colorMesh.layerMask = 0x10000000;
        this.colorMesh.parent = this.frame;
        this.colorMesh.position.z = -0.1;
        this.colorMesh.material = this.game.colorMaterials[this._value ? 3 : 5];
        Mummu.ScaleVertexDataInPlace(Mummu.CloneVertexData(frameData), 0.8).applyToMesh(this.colorMesh);
    }
    get value() {
        return this._value;
    }
    set value(v) {
        this._value = v;
        if (this.colorMesh) {
            this.colorMesh.material = this.game.colorMaterials[this._value ? 3 : 6];
        }
    }
    async show(duration = 0.5) {
        if (duration === 0) {
            this.position.copyFrom(this.posShow);
        }
        else {
            return this.animatePosition(this.posShow, duration, Nabu.Easing.easeOutCubic);
        }
    }
    async hide(duration = 0.5) {
        if (duration === 0) {
            this.position.copyFrom(this.posHide);
        }
        else {
            return this.animatePosition(this.posHide, duration, Nabu.Easing.easeInCubic);
        }
    }
    async onClick() {
        if (this.onClickCallback) {
            this.onClickCallback();
        }
    }
}
var PuzzleUIState;
(function (PuzzleUIState) {
    PuzzleUIState[PuzzleUIState["None"] = 0] = "None";
    PuzzleUIState[PuzzleUIState["Play"] = 1] = "Play";
    PuzzleUIState[PuzzleUIState["Success"] = 2] = "Success";
})(PuzzleUIState || (PuzzleUIState = {}));
class PuzzleUI {
    constructor(game) {
        this.game = game;
        this.uiState = PuzzleUIState.None;
        this.successStars = [];
        this.uiFrameWhiteMaterial = new BABYLON.StandardMaterial("frame-material");
        this.uiFrameWhiteMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.uiFrameWhiteMaterial.diffuseColor = BABYLON.Color3.FromHexString("#EEEDF0");
    }
    async instantiate() {
        this.successTextbox = new TextBox(this.game, 0.8, 0.4);
        this.successTextbox.text = "Success !";
        this.successTextbox.verticalOffset = 0.2;
        this.successTextbox.backgroundColor = this.game.puzzleStyle.colors[5].toHexString();
        this.successTextbox.posHide.copyFromFloats(-2, 2, 0);
        this.successTextbox.posShow.copyFromFloats(0, 0.4, 0);
        this.successTextbox.fontSize = 50;
        await this.successTextbox.hide(0);
        await this.successTextbox.instantiate();
        this.replayTextbox = new TextBox(this.game, 0.7, 0.4);
        this.replayTextbox.text = "Replay";
        this.replayTextbox.backgroundColor = this.game.puzzleStyle.colors[2].toHexString();
        this.replayTextbox.posHide.copyFromFloats(-2, -2, 0);
        this.replayTextbox.posShow.copyFromFloats(-0.4, -0.1, 0);
        this.replayTextbox.fontSize = 45;
        await this.replayTextbox.hide(0);
        await this.replayTextbox.instantiate();
        this.replayTextbox.onClickCallback = () => {
            //this.game.loadPuzzle(this.game.makeRandomPuzzle(6, 6));
            this.game.loadPuzzle(this.game.puzzle.data);
        };
        this.nextTextbox = new TextBox(this.game, 0.7, 0.4);
        this.nextTextbox.text = "Next >";
        this.nextTextbox.backgroundColor = this.game.puzzleStyle.colors[4].toHexString();
        this.nextTextbox.posHide.copyFromFloats(2, -2, 0);
        this.nextTextbox.posShow.copyFromFloats(0.4, -0.1, 0);
        this.nextTextbox.fontSize = 45;
        await this.nextTextbox.hide(0);
        await this.nextTextbox.instantiate();
        this.nextTextbox.onClickCallback = () => {
            //this.game.loadPuzzle(this.game.makeRandomPuzzle(6, 6));
            this.game.loadPuzzle(GetNextPuzzle());
        };
        this.successStars = [];
        for (let i = 0; i < 3; i++) {
            let star = new Star(this.game, 0.2);
            star.posShow = new BABYLON.Vector3(-0.23 + 0.23 * i, 0.25, -0.1);
            star.posHide.copyFromFloats(0, -2, 0);
            await star.hide(0);
            await star.instantiate();
            this.successStars[i] = star;
        }
        this.progressBar = new FillBar(this.game, 1.5, 0.2, 10);
        this.progressBar.posHide.copyFromFloats(0, 2, 0);
        this.progressBar.posShow.copyFromFloats(0, 0.85, 0);
        await this.progressBar.hide(0);
        await this.progressBar.instantiate();
        this.resize();
    }
    setMove(move) {
        this.progressBar.setValue(move);
        this.successStars[2].value = move <= this.game.puzzle.topScore;
        this.successStars[1].value = move <= this.game.puzzle.naiveScore;
        this.successStars[0].value = move <= this.game.puzzle.lowScore;
    }
    async showSuccess() {
        if (this.uiState != PuzzleUIState.Success) {
            this.uiState = PuzzleUIState.Success;
            this.successTextbox.show();
            this.replayTextbox.show();
            this.nextTextbox.show();
            this.successStars.forEach((star, i) => {
                star.posShow = new BABYLON.Vector3(-0.23 + 0.23 * i, 0.25, -0.1);
                setTimeout(() => {
                    star.animateSize(star.value === true ? 0.2 : 0.15, 0.5);
                    star.show();
                }, 300 + i * 300);
            });
            this.progressBar.hide();
        }
    }
    async showPlay() {
        if (this.uiState != PuzzleUIState.Play) {
            this.uiState = PuzzleUIState.Play;
            this.successTextbox.hide();
            this.replayTextbox.hide();
            this.nextTextbox.hide();
            this.successStars[0].posShow = this.progressBar.getPos(this.game.puzzle.lowScore - 0.5).add(new BABYLON.Vector3(0, -0.15, 0));
            this.successStars[1].posShow = this.progressBar.getPos(this.game.puzzle.naiveScore - 0.5).add(new BABYLON.Vector3(0, -0.15, 0));
            this.successStars[2].posShow = this.progressBar.getPos(this.game.puzzle.topScore - 0.5).add(new BABYLON.Vector3(0, -0.15, 0));
            this.successStars.forEach(star => {
                star.value = true;
                star.animateSize(0.15, 0.5);
                star.show();
            });
            this.progressBar.show();
        }
    }
    async hideAll() {
        if (this.uiState != PuzzleUIState.None) {
            this.uiState = PuzzleUIState.None;
            this.successTextbox.hide();
            this.replayTextbox.hide();
            this.nextTextbox.hide();
            this.successStars.forEach(star => {
                star.hide();
            });
            this.progressBar.hide();
        }
    }
    resize() {
        let s = 2 / (this.game.puzzle.colorsCount - 1);
        s = Math.min(s, 0.4);
        if (this.game.screenRatio > 1) {
            this.progressBar.posShow.y = 0.85;
        }
        else {
            this.progressBar.posShow.y = this.game.uiCameraHalfHeight - 0.15;
        }
    }
}
var square4 = [
    {
        w: 4,
        h: 4,
        inputI: 0,
        inputJ: 3,
        colorsCount: 6,
        grid: "5312_3435_5332_1422",
        topScore: 7,
        naiveScore: 9,
    },
    {
        w: 4,
        h: 4,
        inputI: 0,
        inputJ: 3,
        colorsCount: 8,
        grid: "5632_4755_6745_7727",
        topScore: 6,
        naiveScore: 7,
    },
    {
        w: 4,
        h: 4,
        inputI: 0,
        inputJ: 3,
        colorsCount: 8,
        grid: "5754_5766_1267_7345",
        topScore: 7,
        naiveScore: 9,
    },
    {
        w: 4,
        h: 4,
        inputI: 0,
        inputJ: 3,
        colorsCount: 6,
        grid: "2311_1532_1213_2225",
        topScore: 4,
        naiveScore: 6,
    },
];
var square5 = [
    {
        w: 5,
        h: 5,
        inputI: 0,
        inputJ: 4,
        colorsCount: 5,
        grid: "32112_23421_14434_21344_11324",
        topScore: 5,
        naiveScore: 7,
    },
    {
        w: 5,
        h: 5,
        inputI: 0,
        inputJ: 4,
        colorsCount: 7,
        grid: "24126_42154_11155_41253_43164",
        topScore: 7,
        naiveScore: 9,
    },
    {
        w: 5,
        h: 5,
        inputI: 0,
        inputJ: 4,
        colorsCount: 7,
        grid: "25442_26625_62446_45252_15236",
        topScore: 8,
        naiveScore: 10,
    },
    {
        w: 5,
        h: 5,
        inputI: 0,
        inputJ: 4,
        colorsCount: 7,
        grid: "62214_43521_43454_41154_24351",
        topScore: 7,
        naiveScore: 9,
    },
    {
        w: 5,
        h: 5,
        inputI: 0,
        inputJ: 4,
        colorsCount: 6,
        grid: "41124_23231_35451_14534_41113",
        topScore: 7,
        naiveScore: 10,
    },
    {
        w: 5,
        h: 5,
        inputI: 0,
        inputJ: 4,
        colorsCount: 5,
        grid: "44441_11422_24331_14234_32224",
        topScore: 5,
        naiveScore: 7,
    },
    {
        w: 5,
        h: 5,
        inputI: 0,
        inputJ: 4,
        colorsCount: 6,
        grid: "22112_55322_22343_23451_54135",
        topScore: 8,
        naiveScore: 10,
    },
];
var square6 = [
    {
        w: 6,
        h: 6,
        inputI: 0,
        inputJ: 5,
        colorsCount: 8,
        grid: "732155_114614_544754_564413_776411_544421",
        topScore: 8,
        naiveScore: 10,
    },
    {
        w: 6,
        h: 6,
        inputI: 0,
        inputJ: 5,
        colorsCount: 8,
        grid: "727427_576363_244225_251562_727761_375327",
        topScore: 12,
        naiveScore: 15,
    },
    {
        w: 6,
        h: 6,
        inputI: 0,
        inputJ: 5,
        colorsCount: 8,
        grid: "162212_376356_442563_147444_213251_161616",
        topScore: 11,
        naiveScore: 14,
    },
    {
        w: 6,
        h: 6,
        inputI: 0,
        inputJ: 5,
        colorsCount: 6,
        grid: "435455_531244_325152_125221_523423_355431",
        topScore: 9,
        naiveScore: 12,
    },
    {
        w: 6,
        h: 6,
        inputI: 0,
        inputJ: 5,
        colorsCount: 8,
        grid: "761764_352557_531666_265173_652242_752562",
        topScore: 12,
        naiveScore: 15,
    },
    {
        w: 6,
        h: 6,
        inputI: 0,
        inputJ: 5,
        colorsCount: 8,
        grid: "626363_152237_642725_572732_664347_717662",
        topScore: 11,
        naiveScore: 14,
    },
    {
        w: 6,
        h: 6,
        inputI: 0,
        inputJ: 5,
        colorsCount: 6,
        grid: "335151_531241_322441_214214_312254_311245",
        topScore: 8,
        naiveScore: 9,
    },
];
var square7 = [
    {
        w: 7,
        h: 7,
        inputI: 0,
        inputJ: 6,
        colorsCount: 8,
        grid: "4657627_2426756_2771574_3751253_3415627_6525553_2121334",
        topScore: 14,
        naiveScore: 17,
    },
    {
        w: 7,
        h: 7,
        inputI: 0,
        inputJ: 6,
        colorsCount: 7,
        grid: "4561263_3252132_3663345_6531563_5442251_1455336_5225451",
        topScore: 12,
        naiveScore: 15,
    },
    {
        w: 7,
        h: 7,
        inputI: 0,
        inputJ: 6,
        colorsCount: 8,
        grid: "4756355_4421276_3221554_6356235_1374246_3233443_2517262",
        topScore: 12,
        naiveScore: 17,
    },
    {
        w: 7,
        h: 7,
        inputI: 0,
        inputJ: 6,
        colorsCount: 6,
        grid: "3423422_5345332_2534315_5241523_2335255_2553111_5353223",
        topScore: 11,
        naiveScore: 14,
    },
    {
        w: 7,
        h: 7,
        inputI: 0,
        inputJ: 6,
        colorsCount: 5,
        grid: "2324113_1242323_1411413_3223131_3343312_4432442_4143144",
        topScore: 9,
        naiveScore: 12,
    },
    {
        w: 7,
        h: 7,
        inputI: 0,
        inputJ: 6,
        colorsCount: 8,
        grid: "7657776_2765527_3562616_3312354_5273213_6422254_1165221",
        topScore: 11,
        naiveScore: 15,
    },
    {
        w: 7,
        h: 7,
        inputI: 0,
        inputJ: 6,
        colorsCount: 6,
        grid: "1151222_3342122_1515553_5241252_2514143_1211355_3555343",
        topScore: 10,
        naiveScore: 13,
    },
];
var square8 = [
    {
        w: 8,
        h: 8,
        inputI: 0,
        inputJ: 7,
        colorsCount: 7,
        grid: "63521426_23543531_12661462_22145613_12544526_65513322_54622656_12424634",
        topScore: 14,
        naiveScore: 17,
    },
    {
        w: 8,
        h: 8,
        inputI: 0,
        inputJ: 7,
        colorsCount: 8,
        grid: "64141226_42476336_33727457_33171445_51457732_43365551_54166231_21433755",
        topScore: 15,
        naiveScore: 19,
    },
    {
        w: 8,
        h: 8,
        inputI: 0,
        inputJ: 7,
        colorsCount: 8,
        grid: "64256576_17616617_46735142_64675151_72242536_54277422_65537367_62773732",
        topScore: 15,
        naiveScore: 18,
    },
    {
        w: 8,
        h: 8,
        inputI: 0,
        inputJ: 7,
        colorsCount: 7,
        grid: "45222535_15632264_64345321_31624643_66615631_62141254_44346421_54153133",
        topScore: 13,
        naiveScore: 16,
    },
    {
        w: 8,
        h: 8,
        inputI: 0,
        inputJ: 7,
        colorsCount: 8,
        grid: "37731761_24256234_76623615_25466726_14237766_61661251_47563244_37635771",
        topScore: 14,
        naiveScore: 17,
    },
    {
        w: 8,
        h: 8,
        inputI: 0,
        inputJ: 7,
        colorsCount: 8,
        grid: "57715241_11361121_56746436_74537234_11262615_14412255_31222351_71114747",
        topScore: 13,
        naiveScore: 17,
    },
    {
        w: 8,
        h: 8,
        inputI: 0,
        inputJ: 7,
        colorsCount: 6,
        grid: "25533133_53155225_25354544_24221234_54554431_34315351_11321153_32431544",
        topScore: 11,
        naiveScore: 14,
    },
];
var square10 = [
    {
        w: 10,
        h: 10,
        inputI: 0,
        inputJ: 9,
        colorsCount: 7,
        grid: "2616426635_4441434143_1365134656_1356415252_4256653314_6342123121_2333342532_4142543224_2152252526_3323431413",
        topScore: 15,
        naiveScore: 20,
    },
    {
        w: 10,
        h: 10,
        inputI: 0,
        inputJ: 9,
        colorsCount: 7,
        grid: "4553615645_6152441455_5536151425_3344442532_1666135613_4445114625_5664565623_1116156622_3246234121_6145522233",
        topScore: 17,
        naiveScore: 21,
    },
    {
        w: 10,
        h: 10,
        inputI: 0,
        inputJ: 9,
        colorsCount: 6,
        grid: "1552445325_5322312343_1354211415_5351525355_4232531542_1151434233_2133533213_2225441133_4232431345_1325333454",
        topScore: 15,
        naiveScore: 19,
    },
    {
        w: 10,
        h: 10,
        inputI: 0,
        inputJ: 9,
        colorsCount: 8,
        grid: "4212554647_6224167764_6147666352_7644424344_2431111515_3212214557_6632347772_3455711641_2132446147_2214646372",
        topScore: 17,
        naiveScore: 21,
    },
    {
        w: 10,
        h: 10,
        inputI: 0,
        inputJ: 9,
        colorsCount: 6,
        grid: "3144535131_1531422425_1232334213_4242341145_4553451251_5553412212_1111243424_4541312553_1251454243_3312354535",
        topScore: 15,
        naiveScore: 19,
    },
    {
        w: 10,
        h: 10,
        inputI: 0,
        inputJ: 9,
        colorsCount: 7,
        grid: "4251364444_1526634612_6521211421_5516611241_1221632131_3165262535_3115344521_5265615521_6335336524_2232114615",
        topScore: 13,
        naiveScore: 16,
    },
    {
        w: 10,
        h: 10,
        inputI: 0,
        inputJ: 9,
        colorsCount: 8,
        grid: "4736413174_4545435661_2545552227_1666571626_3724622314_2353612772_3271222332_7556166515_6215467461_7776324242",
        topScore: 17,
        naiveScore: 20,
    },
];
var disc6 = [
    {
        w: 6,
        h: 6,
        inputI: 2,
        inputJ: 5,
        colorsCount: 4,
        grid: "033330_321333_232133_122132_332322_013330",
        topScore: 4,
        naiveScore: 5,
    },
    {
        w: 6,
        h: 6,
        inputI: 2,
        inputJ: 5,
        colorsCount: 8,
        grid: "024670_122354_135567_371617_241721_063610",
        topScore: 10,
        naiveScore: 12,
    },
    {
        w: 6,
        h: 6,
        inputI: 2,
        inputJ: 5,
        colorsCount: 8,
        grid: "034130_724535_643677_676663_416166_024550",
        topScore: 9,
        naiveScore: 11,
    },
    {
        w: 6,
        h: 6,
        inputI: 2,
        inputJ: 5,
        colorsCount: 8,
        grid: "037770_353543_212317_241576_167171_051130",
        topScore: 10,
        naiveScore: 12,
    },
    {
        w: 6,
        h: 6,
        inputI: 2,
        inputJ: 5,
        colorsCount: 6,
        grid: "034320_545335_133113_312351_225311_031530",
        topScore: 9,
        naiveScore: 10,
    },
    {
        w: 6,
        h: 6,
        inputI: 2,
        inputJ: 5,
        colorsCount: 8,
        grid: "025710_415112_621246_162476_277651_071730",
        topScore: 10,
        naiveScore: 11,
    },
    {
        w: 6,
        h: 6,
        inputI: 2,
        inputJ: 5,
        colorsCount: 6,
        grid: "021130_441122_414435_234345_353455_043130",
        topScore: 6,
        naiveScore: 7,
    },
    {
        w: 6,
        h: 6,
        inputI: 2,
        inputJ: 5,
        colorsCount: 7,
        grid: "056450_336143_252135_415454_424653_011220",
        topScore: 9,
        naiveScore: 10,
    },
    {
        w: 6,
        h: 6,
        inputI: 2,
        inputJ: 5,
        colorsCount: 7,
        grid: "023550_335321_632635_563434_136226_041540",
        topScore: 11,
        naiveScore: 12,
    },
];
var disc7 = [
    {
        w: 7,
        h: 7,
        inputI: 3,
        inputJ: 6,
        colorsCount: 7,
        grid: "0024500_0562610_5511626_3465666_5344214_0344550_0044500",
        topScore: 9,
        naiveScore: 10,
    },
    {
        w: 7,
        h: 7,
        inputI: 3,
        inputJ: 6,
        colorsCount: 7,
        grid: "0012300_0436610_5432115_2446125_5621161_0364510_0055300",
        topScore: 9,
        naiveScore: 12,
    },
    {
        w: 7,
        h: 7,
        inputI: 3,
        inputJ: 6,
        colorsCount: 7,
        grid: "0031200_0553440_5426541_6562266_6336642_0625440_0042200",
        topScore: 10,
        naiveScore: 12,
    },
    {
        w: 7,
        h: 7,
        inputI: 3,
        inputJ: 6,
        colorsCount: 7,
        grid: "0021100_0241650_5165515_1256252_4524533_0313330_0066200",
        topScore: 11,
        naiveScore: 15,
    },
    {
        w: 7,
        h: 7,
        inputI: 3,
        inputJ: 6,
        colorsCount: 7,
        grid: "0035400_0561510_5156423_4121551_3314665_0621330_0034100",
        topScore: 11,
        naiveScore: 14,
    },
    {
        w: 7,
        h: 7,
        inputI: 3,
        inputJ: 6,
        colorsCount: 5,
        grid: "0033200_0122230_4132433_3441114_3224323_0431440_0022300",
        topScore: 7,
        naiveScore: 9,
    },
];
var disc8 = [
    {
        w: 8,
        h: 8,
        inputI: 3,
        inputJ: 7,
        colorsCount: 8,
        grid: "00251100_02145760_35365652_37224335_22165156_65323265_07735520_00151700",
        topScore: 14,
        naiveScore: 16,
    },
    {
        w: 8,
        h: 8,
        inputI: 3,
        inputJ: 7,
        colorsCount: 8,
        grid: "00526300_04361660_46427655_33373141_23662624_23667476_02644510_00516200",
        topScore: 14,
        naiveScore: 17,
    },
    {
        w: 8,
        h: 8,
        inputI: 3,
        inputJ: 7,
        colorsCount: 8,
        grid: "00741300_06134730_74637267_72655431_33271334_43216545_01624620_00673200",
        topScore: 13,
        naiveScore: 17,
    },
    {
        w: 8,
        h: 8,
        inputI: 3,
        inputJ: 7,
        colorsCount: 6,
        grid: "00331200_02541450_21334435_41445224_41214111_52145523_02413420_00513300",
        topScore: 10,
        naiveScore: 13,
    },
    {
        w: 8,
        h: 8,
        inputI: 3,
        inputJ: 7,
        colorsCount: 7,
        grid: "00351200_02422330_15241533_24125655_51125615_54512533_01351320_00626500",
        topScore: 13,
        naiveScore: 16,
    },
    {
        w: 8,
        h: 8,
        inputI: 3,
        inputJ: 7,
        colorsCount: 7,
        grid: "00213500_03551650_23433462_65555662_35515411_16253412_04354540_00524600",
        topScore: 11,
        naiveScore: 15,
    },
    {
        w: 8,
        h: 8,
        inputI: 3,
        inputJ: 7,
        colorsCount: 8,
        grid: "00542200_05567260_11252664_64121134_25567776_53413641_01145250_00723200",
        topScore: 14,
        naiveScore: 16,
    },
];
var heart = [
    {
        w: 13,
        h: 11,
        inputI: 6,
        inputJ: 8,
        colorsCount: 8,
        grid: "0000006000000_0000041400000_0000776420000_0001112775000_0055566277100_0615646142270_3376437456376_1405526437216_3100243761472_0424470235760_0064300071200",
        topScore: 17,
        naiveScore: 20,
    },
    {
        w: 13,
        h: 11,
        inputI: 6,
        inputJ: 8,
        colorsCount: 6,
        grid: "0000004000000_0000053500000_0000242230000_0003331152000_0054355312200_0534314255240_1235412231434_1304521515331_4300252432131_0112330254430_0041200025200",
        topScore: 13,
        naiveScore: 16,
    },
    {
        w: 13,
        h: 11,
        inputI: 6,
        inputJ: 8,
        colorsCount: 8,
        grid: "0000007000000_0000036300000_0000455750000_0001133162000_0032265245700_0512233456770_1611551764323_1201144411347_2700423273126_0376730662130_0025700077200",
        topScore: 14,
        naiveScore: 18,
    },
    {
        w: 13,
        h: 11,
        inputI: 6,
        inputJ: 8,
        colorsCount: 8,
        grid: "0000004000000_0000053500000_0000344610000_0007734673000_0017322423300_0577746717260_5463755424646_6207646227566_4500724326122_0343330756740_0013100012600",
        topScore: 15,
        naiveScore: 18,
    },
    {
        w: 13,
        h: 11,
        inputI: 6,
        inputJ: 8,
        colorsCount: 7,
        grid: "0000005000000_0000013200000_0000366540000_0004145222000_0023233165500_0524442552410_4564155323126_4202665126441_3600144225633_0343560553550_0043400023100",
        topScore: 13,
        naiveScore: 18,
    },
    {
        w: 13,
        h: 11,
        inputI: 6,
        inputJ: 8,
        colorsCount: 8,
        grid: "0000001000000_0000041100000_0000442140000_0003412552000_0031215737300_0311467453750_2177477337246_1504263517143_4500577236613_0172560664560_0041100035700",
        topScore: 17,
        naiveScore: 21,
    },
];
var invader1 = [
    {
        w: 10,
        h: 8,
        inputI: 3,
        inputJ: 7,
        colorsCount: 6,
        grid: "0320000410_0030000500_0054552200_0353441310_4550110542_2032345201_4003512001_0024001400",
        topScore: 14,
        naiveScore: 19,
    },
    {
        w: 10,
        h: 8,
        inputI: 3,
        inputJ: 7,
        colorsCount: 8,
        grid: "0170000670_0030000300_0066663200_0527655120_1250620144_6027177603_1006556007_0025001100",
        topScore: 15,
        naiveScore: 19,
    },
    {
        w: 10,
        h: 8,
        inputI: 3,
        inputJ: 7,
        colorsCount: 8,
        grid: "0560000220_0070000200_0035464200_0244741140_1650510251_6017217304_4007433002_0052003200",
        topScore: 16,
        naiveScore: 20,
    },
    {
        w: 10,
        h: 8,
        inputI: 3,
        inputJ: 7,
        colorsCount: 7,
        grid: "0340000240_0030000100_0015613500_0515524150_1110240253_6034614503_2005555006_0063002600",
        topScore: 13,
        naiveScore: 18,
    },
    {
        w: 10,
        h: 8,
        inputI: 3,
        inputJ: 7,
        colorsCount: 6,
        grid: "0340000340_0010000100_0023441500_0424445410_5410310154_5043315503_5004454002_0054001100",
        topScore: 12,
        naiveScore: 15,
    },
    {
        w: 10,
        h: 8,
        inputI: 3,
        inputJ: 7,
        colorsCount: 7,
        grid: "0550000560_0040000500_0022136400_0121655350_6450540211_4033455501_2006552006_0045005100",
        topScore: 12,
        naiveScore: 17,
    },
    {
        w: 10,
        h: 8,
        inputI: 3,
        inputJ: 7,
        colorsCount: 8,
        grid: "0460000130_0060000200_0047735200_0611745430_1670520647_5033657201_7003125006_0031001100",
        topScore: 16,
        naiveScore: 20,
    },
];
var invader2 = [
    {
        w: 9,
        h: 8,
        inputI: 4,
        inputJ: 6,
        colorsCount: 7,
        grid: "001503500_000101000_202526405_206121504_116533621_015010240_005611300_004000400",
        topScore: 11,
        naiveScore: 14,
    },
    {
        w: 9,
        h: 8,
        inputI: 4,
        inputJ: 6,
        colorsCount: 6,
        grid: "001405500_000305000_505335501_401412305_343352355_034020530_004123200_003000200",
        topScore: 9,
        naiveScore: 14,
    },
    {
        w: 9,
        h: 8,
        inputI: 4,
        inputJ: 6,
        colorsCount: 8,
        grid: "006202600_000101000_106725405_704766104_116243731_067040620_005636100_002000600",
        topScore: 14,
        naiveScore: 17,
    },
    {
        w: 9,
        h: 8,
        inputI: 4,
        inputJ: 6,
        colorsCount: 7,
        grid: "006202200_000105000_104515601_206451303_252456652_061010510_002565200_002000100",
        topScore: 12,
        naiveScore: 16,
    },
    {
        w: 9,
        h: 8,
        inputI: 4,
        inputJ: 6,
        colorsCount: 7,
        grid: "005301300_000204000_303342404_302122502_551321633_035060520_001413600_002000600",
        topScore: 12,
        naiveScore: 17,
    },
    {
        w: 9,
        h: 8,
        inputI: 4,
        inputJ: 6,
        colorsCount: 6,
        grid: "002101200_000405000_105241304_501322303_333345412_032010330_004424200_001000200",
        topScore: 11,
        naiveScore: 14,
    },
    {
        w: 9,
        h: 8,
        inputI: 4,
        inputJ: 6,
        colorsCount: 6,
        grid: "004204300_000104000_103255301_205352105_111332452_052020350_001313100_002000100",
        topScore: 11,
        naiveScore: 14,
    },
];
var invader3 = [
    {
        w: 9,
        h: 8,
        inputI: 4,
        inputJ: 7,
        colorsCount: 8,
        grid: "305040701_316334244_664712143_430370633_470020051_015373210_072235530_001211200",
        topScore: 17,
        naiveScore: 22,
    },
    {
        w: 9,
        h: 8,
        inputI: 4,
        inputJ: 7,
        colorsCount: 7,
        grid: "401030204_212346242_333252334_110460336_440010011_031423430_062345240_006126100",
        topScore: 13,
        naiveScore: 18,
    },
    {
        w: 9,
        h: 8,
        inputI: 4,
        inputJ: 7,
        colorsCount: 8,
        grid: "601020602_471327125_754737413_660430614_640060041_046365640_027673370_005577700",
        topScore: 11,
        naiveScore: 14,
    },
    {
        w: 9,
        h: 8,
        inputI: 4,
        inputJ: 7,
        colorsCount: 8,
        grid: "106030605_276336457_132467511_410460541_440030077_023277360_014234320_001467300",
        topScore: 15,
        naiveScore: 19,
    },
    {
        w: 9,
        h: 8,
        inputI: 4,
        inputJ: 7,
        colorsCount: 8,
        grid: "205070607_371773775_463614471_510220254_650030065_025475210_027453260_004257200",
        topScore: 15,
        naiveScore: 18,
    },
    {
        w: 9,
        h: 8,
        inputI: 4,
        inputJ: 7,
        colorsCount: 8,
        grid: "601030101_417523271_573372343_630510111_170030047_061236170_024763220_001751100",
        topScore: 15,
        naiveScore: 22,
    },
];
var invader4 = [
    {
        w: 9,
        h: 8,
        inputI: 4,
        inputJ: 6,
        colorsCount: 6,
        grid: "203040201_315255313_532000421_533351555_010010030_044324530_002241100_001000400",
        topScore: 13,
        naiveScore: 16,
    },
    {
        w: 9,
        h: 8,
        inputI: 4,
        inputJ: 6,
        colorsCount: 8,
        grid: "102040606_423721477_452000173_443147425_020060010_051716260_003632100_005000400",
        topScore: 15,
        naiveScore: 22,
    },
    {
        w: 9,
        h: 8,
        inputI: 4,
        inputJ: 6,
        colorsCount: 6,
        grid: "503050503_541341451_215000533_333313344_040050020_022221420_002111300_004000500",
        topScore: 11,
        naiveScore: 14,
    },
    {
        w: 9,
        h: 8,
        inputI: 4,
        inputJ: 6,
        colorsCount: 8,
        grid: "104030102_774641377_365000152_613323545_060030060_071626270_006556300_007000700",
        topScore: 15,
        naiveScore: 20,
    },
];
var invader5 = [
    {
        w: 11,
        h: 8,
        inputI: 5,
        inputJ: 7,
        colorsCount: 8,
        grid: "00610004500_00560007300_00321573200_75701030634_30100000307_40664427403_00670405600_00075136000",
        topScore: 19,
        naiveScore: 26,
    },
    {
        w: 11,
        h: 8,
        inputI: 5,
        inputJ: 7,
        colorsCount: 6,
        grid: "00340002100_00340002200_00234434300_41403040554_20200000303_20414233301_00210201300_00013215000",
        topScore: 13,
        naiveScore: 15,
    },
    {
        w: 11,
        h: 8,
        inputI: 5,
        inputJ: 7,
        colorsCount: 8,
        grid: "00670005700_00250004500_00432275100_22304060355_30500000703_20533432507_00110205600_00014531000",
        topScore: 19,
        naiveScore: 26,
    },
    {
        w: 11,
        h: 8,
        inputI: 5,
        inputJ: 7,
        colorsCount: 8,
        grid: "00110003400_00360006600_00324462200_45505010646_60400000102_70735726703_00520405100_00022744000",
        topScore: 18,
        naiveScore: 25,
    },
    {
        w: 11,
        h: 8,
        inputI: 5,
        inputJ: 7,
        colorsCount: 6,
        grid: "00350002500_00510004100_00214542500_24104040415_40300000502_20232524501_00410302400_00042421000",
        topScore: 21,
        naiveScore: 25,
    },
];
var simplePuzzles = [...square4, ...square5, ...square6, ...square7, ...square8, ...disc6, ...disc7, ...disc8];
var drawingPuzzles = [...heart];
var invaderPuzzles = [...invader1, ...invader2, ...invader3, ...invader4, ...invader5];
var shapePuzzles = [...simplePuzzles, ...drawingPuzzles];
var allPuzzles = [...simplePuzzles, ...drawingPuzzles, ...invaderPuzzles];
function GetAnyPuzzle() {
    return allPuzzles[Math.floor(Math.random() * allPuzzles.length)];
}
var debugLevelInc = 0;
function GetNextPuzzle() {
    debugLevelInc++;
    if (debugLevelInc === 1) {
        return square4[Math.floor(Math.random() * square4.length)];
    }
    else if (debugLevelInc === 2) {
        return square5[Math.floor(Math.random() * square5.length)];
    }
    else if (debugLevelInc === 3) {
        return disc6[Math.floor(Math.random() * disc6.length)];
    }
    else if (debugLevelInc === 4) {
        return square6[Math.floor(Math.random() * square6.length)];
    }
    else if (debugLevelInc === 5) {
        return disc7[Math.floor(Math.random() * disc7.length)];
    }
    else if (debugLevelInc === 6) {
        return square7[Math.floor(Math.random() * square7.length)];
    }
    else if (debugLevelInc % 6 === 0) {
        return invaderPuzzles[Math.floor(Math.random() * invaderPuzzles.length)];
    }
    else {
        return simplePuzzles[Math.floor(Math.random() * simplePuzzles.length)];
    }
}
console.log(square4);
console.log(square5);
console.log(square6);
console.log(square7);
console.log(square8);
console.log(disc6);
console.log(disc7);
console.log(disc8);
