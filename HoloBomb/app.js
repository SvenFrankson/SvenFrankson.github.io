var BlockType;
(function (BlockType) {
    BlockType[BlockType["Block"] = 0] = "Block";
    BlockType[BlockType["Top"] = 1] = "Top";
    BlockType[BlockType["Ruin"] = 2] = "Ruin";
    BlockType[BlockType["Explode"] = 3] = "Explode";
})(BlockType || (BlockType = {}));
;
class Block extends BABYLON.Mesh {
    get city() {
        return this.tower.city;
    }
    constructor(type, tower) {
        super("Block-" + BlockType[type], tower.getScene());
        console.log("Create Block " + BlockType[type]);
        this.blockType = type;
        this.tower = tower;
        this.parent = tower;
        BlockLoader.blockData.get(this.blockType).applyToMesh(this);
        this.material = this.city.hologramMaterial;
    }
    SetType(type) {
        this.blockType = type;
        BlockLoader.blockData.get(this.blockType).applyToMesh(this);
    }
}
class BlockLoader {
    static LoadBlockData(scene, callback) {
        BABYLON.SceneLoader.ImportMesh("", "./datas/blocks.babylon", "", scene, (meshes) => {
            meshes.forEach((m) => {
                if (m instanceof BABYLON.Mesh) {
                    if (m.name === "Ruin") {
                        BlockLoader.blockData.set(BlockType.Ruin, BABYLON.VertexData.ExtractFromMesh(m));
                    }
                    if (m.name === "Block") {
                        BlockLoader.blockData.set(BlockType.Block, BABYLON.VertexData.ExtractFromMesh(m));
                    }
                    if (m.name === "Top") {
                        BlockLoader.blockData.set(BlockType.Top, BABYLON.VertexData.ExtractFromMesh(m));
                    }
                    if (m.name === "Explode") {
                        BlockLoader.blockData.set(BlockType.Explode, BABYLON.VertexData.ExtractFromMesh(m));
                    }
                    m.dispose();
                }
            });
            if (callback) {
                callback();
            }
        });
    }
}
BlockLoader.blockData = new Map();
class Bombardier extends BABYLON.Mesh {
    constructor(city) {
        super("Bombardier", city.getScene());
        this._coordinates = BABYLON.Vector3.Zero();
        this._bombCoordinates = BABYLON.Vector3.Zero();
        this.k = 0;
        this._hasWon = false;
        this.Update = () => {
            // Update plane.
            // Move plane.
            this.k += 0.01;
            if (this._hasWon) {
                this.position.x += 0.005;
                this.position.y += 0.005;
                this.rotation.x += 0.01;
                this.rotation.z += 0.005;
                if (this.position.x > this.city.xEnd + 0.18) {
                    this.position.y += 0.15;
                    this.position.x = -0.18;
                }
            }
            else {
                this.getChildren()[0].position.y = 0.05 * Math.cos(this.k);
                this.rotation.x = Math.PI / 8 * Math.cos(this.k);
                this.rotation.z = Math.PI / 32 * Math.cos(this.k);
                this.position.x += 0.005;
                if (this.position.x > this.city.xEnd + 0.18) {
                    this.position.y -= 0.15;
                    this.position.x = -0.18;
                }
            }
            // Check Bombardier collision.
            let xBombardier = this.coordinates.x;
            let tBombardier = this.city.towers[xBombardier];
            if (tBombardier) {
                let yBombardier = this._coordinates.y;
                let bBombardier = tBombardier.blocks[yBombardier];
                if (bBombardier) {
                    this.city.ExplodeAt(32, this._coordinates);
                    this.Dispose();
                    setTimeout(() => {
                        Main.instance.GoToMainMenu();
                    }, 2000);
                }
            }
            // Update bomb.
            // Move bomb.
            this.bomb.position.y -= 0.005;
            if (this.bomb.position.y < 0) {
                this.bomb.position.y = -1;
            }
            // Check bomb collision.
            let xBomb = this.bombCoordinates.x;
            let tBomb = this.city.towers[xBomb];
            if (tBomb) {
                let yBomb = this._bombCoordinates.y;
                let bBomb = tBomb.blocks[yBomb];
                if (bBomb) {
                    tBomb.TakeHit();
                    this.bomb.position.y = -1;
                    // Check for victory.
                    if (this.city.IsDestroyed()) {
                        this._hasWon = true;
                        setTimeout(() => {
                            this.Dispose();
                            Main.instance.GoToMainMenu();
                        }, 3000);
                    }
                }
            }
        };
        this._downTime = 0;
        this.InputDown = () => {
            this._downTime = (new Date()).getTime();
        };
        this.DropBomb = () => {
            let upTime = (new Date()).getTime();
            if (upTime - this._downTime < 250) {
                if (this.bomb.position.y < 0) {
                    console.log("Bombardier DropBomb");
                    this.bomb.position.copyFrom(this.coordinates);
                    this.bomb.position.x *= 0.18;
                    this.bomb.position.y *= 0.15;
                }
            }
        };
        this.city = city;
        this.parent = this.city;
        this.material = this.city.hologramMaterial;
    }
    get coordinates() {
        CityCoordinates.CityPositionToCoordinatesToRef(this.position, this._coordinates);
        return this._coordinates;
    }
    get bombCoordinates() {
        CityCoordinates.CityPositionToCoordinatesToRef(this.bomb.position, this._bombCoordinates);
        return this._bombCoordinates;
    }
    Initialize(h0, callback) {
        BABYLON.SceneLoader.ImportMesh("", "./datas/bombardier.babylon", "", this.getScene(), (meshes) => {
            meshes.forEach((m) => {
                if (m instanceof BABYLON.Mesh) {
                    if (m.name === "Bombardier") {
                        m.parent = this;
                        m.material = this.material;
                    }
                    else if (m.name === "Bomb") {
                        m.parent = this.city;
                        m.material = this.material;
                        this.bomb = m;
                        this.bomb.position.copyFromFloats(0, -1, 0);
                    }
                }
            });
            this.position.copyFromFloats(-0.18, h0 * 0.15, 0);
            if (callback) {
                callback();
            }
        });
    }
    Start() {
        this.getScene().registerBeforeRender(this.Update);
        window.addEventListener("keydown", this.InputDown);
        window.addEventListener("pointerdown", this.InputDown);
        window.addEventListener("keyup", this.DropBomb);
        window.addEventListener("pointerup", this.DropBomb);
    }
    Dispose() {
        this.dispose();
        this.bomb.dispose();
        this.getScene().unregisterBeforeRender(this.Update);
        window.removeEventListener("keydown", this.InputDown);
        window.removeEventListener("pointerdown", this.InputDown);
        window.removeEventListener("keyup", this.DropBomb);
        window.removeEventListener("pointerup", this.DropBomb);
    }
}
class City extends BABYLON.Mesh {
    constructor(scene) {
        super("City", scene);
        this.towers = [];
        this.xEnd = 0;
        this.hologramMaterial = new HoloMaterial("CityHologram", scene);
    }
    Initialize(heights) {
        console.log("Initialize City");
        this.towers = [];
        this.position.x = -(heights.length - 1) / 2 * City.XValue;
        this.xEnd = (heights.length - 1) * City.XValue;
        heights.forEach((h, i) => {
            let tower = new Tower(this);
            tower.Initialize(i, h);
            tower.position.x = i * 0.18;
            this.towers[i] = tower;
        });
    }
    Dispose() {
        this.towers.forEach((t) => {
            t.Dispose();
        });
    }
    IsDestroyed() {
        for (let i = 0; i < this.towers.length; i++) {
            if (this.towers[i].blocks.length > 0) {
                return false;
            }
        }
        return true;
    }
    ExplodeAt(count, coordinates) {
        for (let i = 0; i < count; i++) {
            let explode = new BABYLON.Mesh("Explode", this.getScene());
            BlockLoader.blockData.get(BlockType.Explode).applyToMesh(explode);
            explode.parent = this;
            explode.material = this.hologramMaterial;
            CityCoordinates.CoordinatesToCityPositionToRef(coordinates, explode.position);
            let dir = new BABYLON.Vector3(Math.random() - 0.5, (Math.random() - 0.5) * 0.3, Math.random() - 0.5);
            explode.rotation.copyFromFloats(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
            dir.scaleInPlace(0.025);
            let k = 0;
            let update = () => {
                explode.rotation.addInPlace(dir);
                explode.position.addInPlace(dir);
                explode.position.y += (20 - k) / 60 * 0.05;
                k++;
                if (k > 60) {
                    this.getScene().unregisterBeforeRender(update);
                    explode.dispose();
                }
            };
            this.getScene().registerBeforeRender(update);
        }
    }
    static CreateCityData(size, min, max) {
        let heights = [];
        for (let i = 0; i < size; i++) {
            heights.push(Math.floor(Math.random() * (max - min) + min));
        }
        return heights;
    }
}
City.XValue = 0.18;
City.YValue = 0.15;
class CityCoordinates {
    static CityPositionToCoordinatesToRef(cityPosition, ref) {
        ref.x = Math.round(cityPosition.x / City.XValue);
        ref.y = Math.round(cityPosition.y / City.YValue);
        ref.z = 0;
    }
    static CoordinatesToCityPositionToRef(coordinates, ref) {
        ref.x = coordinates.x * City.XValue;
        ref.y = coordinates.y * City.YValue;
        ref.z = 0;
    }
}
class Main {
    constructor(canvasElement) {
        Main.instance = this;
        this.canvas = document.getElementById(canvasElement);
        this.engine = new BABYLON.Engine(this.canvas, true, {}, true);
        BABYLON.Engine.ShadersRepository = "./shaders/";
    }
    createScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.resize();
        this.light = new BABYLON.HemisphericLight("Light", BABYLON.Vector3.Up(), this.scene);
        this.light.diffuse.copyFromFloats(1, 1, 1);
        this.light.groundColor.copyFromFloats(0.4, 0.4, 0.4);
        this.createArcRotateCamera();
        let skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 100.0 }, this.scene);
        skybox.infiniteDistance = true;
        let skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("./datas/skyboxes/green-nebulae", this.scene, ["-px.png", "-py.png", "-pz.png", "-nx.png", "-ny.png", "-nz.png"]);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
        let k = 0;
        this.scene.registerBeforeRender(() => {
            skybox.rotation.x += 0.0002 * Math.cos(k);
            skybox.rotation.y += 0.0002 * Math.cos(2 * k);
            skybox.rotation.z += 0.0002 * Math.cos(3 * k);
            k += 0.0001;
        });
        this.city = new City(this.scene);
        this.city.position.y = 0.9;
        this.mainMenu = new MainMenu2D();
        BlockLoader.LoadBlockData(this.scene, () => {
            this.GoToMainMenu();
        });
    }
    animate() {
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
        window.addEventListener("resize", () => {
            this.resize();
        });
    }
    resize() {
        this.engine.resize();
    }
    switchToVR() {
        console.log("Switch to VR");
        this.createVRCamera();
        this.engine.switchFullscreen(true);
        var nextFrame = () => {
            this.engine.resize();
            if (this.mainMenu) {
                this.mainMenu.DisposeUI();
            }
            this.mainMenu = new MainMenuVR();
            this.mainMenu.CreateUI(this.scene);
            this.scene.unregisterBeforeRender(nextFrame);
        };
        this.scene.registerBeforeRender(nextFrame);
    }
    switchToStandard() {
        location.reload();
    }
    createArcRotateCamera() {
        this.disposeVRCursor();
        if (this.camera) {
            this.camera.dispose();
        }
        let arcRotateCamera = new BABYLON.ArcRotateCamera("MenuCamera", 0, 0, 1, new BABYLON.Vector3(0, 1.2, 0), this.scene);
        arcRotateCamera.attachControl(this.canvas);
        arcRotateCamera.setPosition(new BABYLON.Vector3(1, 1.8, -2));
        arcRotateCamera.wheelPrecision *= 100;
        arcRotateCamera.pinchPrecision *= 100;
        arcRotateCamera.minZ = 0.05;
        arcRotateCamera.lowerBetaLimit = 3 * Math.PI / 8;
        arcRotateCamera.upperBetaLimit = 5 * Math.PI / 8;
        arcRotateCamera.lowerRadiusLimit = 1;
        arcRotateCamera.upperRadiusLimit = 3;
        this.camera = arcRotateCamera;
    }
    createVRCamera() {
        if (this.camera) {
            this.camera.dispose();
        }
        let vrCamera = new BABYLON.WebVRFreeCamera("VRCamera", new BABYLON.Vector3(0.8, 1.8, -1.6), this.scene);
        vrCamera.setTarget(new BABYLON.Vector3(0, 1.2, 0));
        vrCamera.attachControl(this.canvas);
        this.camera = vrCamera;
        this.createVRCursor();
    }
    createVRCursor() {
        this.vrCursor = BABYLON.MeshBuilder.CreateSphere("vrCursor", { diameter: 0.2 }, this.scene);
        this.vrCursor.position.copyFromFloats(0, 0, 10);
        this.vrCursor.parent = this.camera;
        let vrCursorMaterial = new BABYLON.StandardMaterial("vrCursorMaterial", this.scene);
        vrCursorMaterial.diffuseColor.copyFromFloats(0, 0, 0);
        vrCursorMaterial.specularColor.copyFromFloats(0, 0, 0);
        vrCursorMaterial.emissiveColor.copyFromFloats(1, 1, 1);
        this.vrCursor.material = vrCursorMaterial;
        this.vrCursor.renderOutline = true;
        this.vrCursor.outlineColor.copyFromFloats(0, 0, 0);
        this.vrCursor.outlineWidth = 0.05;
        this.vrCursor.renderingGroupId = 1;
    }
    disposeVRCursor() {
        if (this.vrCursor) {
            this.vrCursor.dispose();
        }
    }
    StartEasyMode() {
        console.log("Initialize Easy Mode");
        this.city.Dispose();
        this.city.Initialize(City.CreateCityData(10, 1, 3));
        this.bombardier = new Bombardier(this.city);
        this.bombardier.Initialize(7, () => {
            this.bombardier.Start();
            this.mainMenu.DisposeUI();
        });
    }
    StartNormalMode() {
        console.log("Initialize Normal Mode");
        this.city.Dispose();
        this.city.Initialize(City.CreateCityData(10, 2, 5));
        this.bombardier = new Bombardier(this.city);
        this.bombardier.Initialize(7, () => {
            this.bombardier.Start();
            this.mainMenu.DisposeUI();
        });
    }
    StartHardMode() {
        console.log("Initialize Hard Mode");
        this.city.Dispose();
        this.city.Initialize(City.CreateCityData(10, 3, 7));
        this.bombardier = new Bombardier(this.city);
        this.bombardier.Initialize(7, () => {
            this.bombardier.Start();
            this.mainMenu.DisposeUI();
        });
    }
    GoToMainMenu() {
        this.mainMenu.CreateUI(this.scene);
    }
}
window.addEventListener("DOMContentLoaded", () => {
    let game = new Main("render-canvas");
    game.createScene();
    game.animate();
    BABYLON.SceneLoader.ImportMesh("", "./datas/test.babylon", "", game.scene, (meshes) => {
        meshes.forEach((m) => {
            if (m.name.startsWith("Hologram")) {
                m.material = new HoloMaterial("Holo", game.scene);
            }
            if (m.name.startsWith("Babylon")) {
                m.material = new HoloMaterial("Holo", game.scene);
                let k = 0.01;
                game.scene.registerBeforeRender(() => {
                    m.rotation.x += k;
                    m.rotation.y += 2 * k;
                });
            }
            if (m.name === "Grid") {
                let gridMaterial = new BABYLON.StandardMaterial("Grid", game.scene);
                gridMaterial.diffuseTexture = new BABYLON.Texture("./datas/grid.png", game.scene);
                gridMaterial.opacityTexture = gridMaterial.diffuseTexture;
                m.material = gridMaterial;
                let k = 0;
                game.scene.registerBeforeRender(() => {
                    gridMaterial.alpha = 0.85 + 0.15 * Math.cos(k / 10);
                    k++;
                });
            }
            if (m.material instanceof BABYLON.StandardMaterial) {
                if (m.material.name.endsWith("LightBox")) {
                    m.material.lightmapTexture = new BABYLON.Texture("./datas/textures/LightBox-ao.png", game.scene);
                    m.material.useLightmapAsShadowmap;
                }
                if (m.material.name.endsWith("MachineBox")) {
                    m.material.lightmapTexture = new BABYLON.Texture("./datas/textures/MachineBox-ao.png", game.scene);
                    m.material.useLightmapAsShadowmap;
                }
                if (m.material.name.endsWith("MachineFrame")) {
                    m.material.diffuseTexture = new BABYLON.Texture("./datas/textures/metal.jpg", game.scene);
                    m.material.diffuseTexture.uScale = 5;
                    m.material.diffuseTexture.vScale = 5;
                    m.material.diffuseColor.copyFromFloats(0.5, 0.5, 0.5);
                    m.material.specularColor.copyFromFloats(0.5, 0.5, 0.5);
                    m.material.bumpTexture = new BABYLON.Texture("./datas/textures/MachineFrame-bump.png", game.scene);
                }
            }
            else if (m.material instanceof BABYLON.MultiMaterial) {
                m.material.subMaterials.forEach((sm) => {
                    if (sm.name.endsWith("WallFrame")) {
                        if (sm instanceof BABYLON.StandardMaterial) {
                            sm.diffuseTexture = new BABYLON.Texture("./datas/textures/metal.jpg", game.scene);
                            sm.diffuseTexture.uScale = 5;
                            sm.diffuseTexture.vScale = 5;
                            sm.diffuseColor.copyFromFloats(0.25, 0.25, 0.25);
                            sm.specularColor.copyFromFloats(0.5, 0.5, 0.5);
                        }
                    }
                    if (sm.name.endsWith("WallBox")) {
                        if (sm instanceof BABYLON.StandardMaterial) {
                            sm.diffuseTexture = new BABYLON.Texture("./datas/textures/wall-metal.jpg", game.scene);
                            sm.diffuseColor.copyFromFloats(0.25, 0.25, 0.25);
                            sm.specularColor.copyFromFloats(0.5, 0.5, 0.5);
                        }
                    }
                });
            }
        });
    });
});
class Tower extends BABYLON.Mesh {
    constructor(city) {
        super("Tower", city.getScene());
        this.xCoordinates = 0;
        this.blocks = [];
        this.city = city;
        this.parent = city;
    }
    Initialize(x, h) {
        this.xCoordinates = x;
        for (let i = 0; i < h; i++) {
            this.blocks[i] = new Block(BlockType.Block, this);
            this.blocks[i].parent = this;
            this.blocks[i].position.y = 0.15 * i;
        }
        this.blocks[h] = new Block(BlockType.Top, this);
        this.blocks[h].position.y = 0.15 * (h);
    }
    Dispose() {
        this.blocks.forEach((b) => {
            b.dispose();
        });
        this.dispose();
    }
    TakeHit() {
        if (this.blocks.length > 0) {
            this.blocks.pop().dispose();
            if (this.blocks.length > 0) {
                this.blocks[this.blocks.length - 1].SetType(BlockType.Ruin);
                this.city.ExplodeAt(6, new BABYLON.Vector3(this.xCoordinates, this.blocks.length - 1, 0));
            }
        }
    }
}
class HoloMaterial extends BABYLON.ShaderMaterial {
    get height() {
        return this._height;
    }
    set height(v) {
        this._height = v;
        this.setFloat("height", this._height);
    }
    get stripeLength() {
        return this._stripeLength;
    }
    set stripeLength(v) {
        this._stripeLength = v;
        this.setFloat("stripeLength", this._stripeLength);
    }
    get stripeTex() {
        return this._stripeTex;
    }
    set stripeTex(t) {
        this._stripeTex = t;
        this.setTexture("stripeTex", this._stripeTex);
    }
    get baseColor() {
        return this._baseColor;
    }
    set baseColor(c) {
        this._baseColor = c;
        this.setColor3("baseColor", this._baseColor);
    }
    get borderColor() {
        return this._borderColor;
    }
    set borderColor(c) {
        this._borderColor = c;
        this.setColor3("borderColor", this._borderColor);
    }
    get fresnelBias() {
        return this._fresnelBias;
    }
    set fresnelBias(v) {
        this._fresnelBias = v;
        this.setFloat("fresnelBias", this._fresnelBias);
    }
    get fresnelPower() {
        return this._fresnelPower;
    }
    set fresnelPower(v) {
        this._fresnelPower = v;
        this.setFloat("fresnelPower", this._fresnelPower);
    }
    constructor(name, scene) {
        super(name, scene, "shield", {
            attributes: ["position", "normal", "uv"],
            uniforms: ["world", "worldView", "worldViewProjection"],
            needAlphaBlending: true
        });
        this.backFaceCulling = false;
        this.stripeLength = 0.02;
        this.height = 0;
        this.baseColor = BABYLON.Color3.FromHexString("#75ceff");
        this.borderColor = BABYLON.Color3.FromHexString("#77ff9b");
        this.fresnelBias = 2;
        this.fresnelPower = 16;
        this.stripeTex = new BABYLON.Texture("./datas/gradient.png", scene);
        let k = 0;
        scene.registerBeforeRender(() => {
            this.setVector3("cameraPosition", scene.activeCamera.position);
            k++;
            this.height = Math.cos(k / 1000);
        });
    }
}
class MainMenu {
    Resize() {
    }
    static SetHoloBombButtonDesign(button) {
        button.fontSize = 40;
        button.background = "#1c1c1c";
        button.color = "white";
    }
    static SetHoloBombButton(button, row) {
        MainMenu.SetHoloBombButtonDesign(button);
        button.width = 0.2;
        button.height = "100px";
        button.top = (100 + row * 125) + "px";
        button.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        MainMenu.DeactivateButton(button);
        button.pointerEnterAnimation = () => {
            MainMenu.ActivateButton(button);
        };
        button.pointerOutAnimation = () => {
            MainMenu.DeactivateButton(button);
        };
    }
    static SetHoloBombSquareButton(button, row) {
        button.width = "200px";
        button.height = "200px";
        button.background = "#1c1c1c";
        button.top = (100 + row * 125) + "px";
        button.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        button.pointerEnterAnimation = undefined;
        button.pointerOutAnimation = undefined;
    }
    static ActivateButton(button) {
        button.alpha = 1;
    }
    static DeactivateButton(button) {
        button.alpha = 0.75;
    }
}
class MainMenu2D extends MainMenu {
    CreateUI(scene) {
        this._advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this._advancedTexture.idealHeight = 900;
        let title = BABYLON.GUI.Button.CreateSimpleButton("title", "Holo Bombardier");
        title.width = 0.35;
        title.height = 0.1;
        title.fontSize = 64;
        title.background = "#232323";
        title.color = "white";
        title.top = 100;
        title.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this._advancedTexture.addControl(title);
        let easyMode = BABYLON.GUI.Button.CreateSimpleButton("easy-mode", "Easy");
        MainMenu.SetHoloBombButton(easyMode, 1);
        this._advancedTexture.addControl(easyMode);
        easyMode.onPointerUpObservable.add((p) => {
            Main.instance.StartEasyMode();
        });
        let normalMode = BABYLON.GUI.Button.CreateSimpleButton("normal-mode", "Normal");
        MainMenu.SetHoloBombButton(normalMode, 2);
        this._advancedTexture.addControl(normalMode);
        normalMode.onPointerUpObservable.add((p) => {
            Main.instance.StartNormalMode();
        });
        let hardMode = BABYLON.GUI.Button.CreateSimpleButton("hard-mode", "Hard");
        MainMenu.SetHoloBombButton(hardMode, 3);
        this._advancedTexture.addControl(hardMode);
        hardMode.onPointerUpObservable.add((p) => {
            Main.instance.StartHardMode();
        });
        let screenMode = BABYLON.GUI.Button.CreateImageOnlyButton("screen-mode", "./datas/screen-mode.png");
        MainMenu.SetHoloBombSquareButton(screenMode, 4);
        screenMode.left = -125;
        this._advancedTexture.addControl(screenMode);
        let vrMode = BABYLON.GUI.Button.CreateImageOnlyButton("vr-mode", "./datas/vr-mode.png");
        MainMenu.SetHoloBombSquareButton(vrMode, 4);
        vrMode.left = 125;
        this._advancedTexture.addControl(vrMode);
        MainMenu.DeactivateButton(vrMode);
        vrMode.onPointerUpObservable.add((p) => {
            Main.instance.switchToVR();
        });
    }
    DisposeUI() {
        Main.instance.resize();
        this._advancedTexture.dispose();
    }
}
class MainMenuVR extends MainMenu {
    constructor() {
        super(...arguments);
        this.meshes = [];
        this.onPointerObservable = (eventData, eventState) => {
            if (eventData.type === BABYLON.PointerEventTypes._POINTERUP) {
                let pickInfo = this.scene.pickWithRay(this.scene.activeCamera.getForwardRay(), (m) => {
                    return (this.meshes.indexOf(m) !== -1);
                });
                if (pickInfo.hit) {
                    console.log("Pick in VR Menu : " + pickInfo.pickedMesh.name);
                    if (pickInfo.pickedMesh.name === "EasyMesh") {
                        Main.instance.StartEasyMode();
                    }
                    else if (pickInfo.pickedMesh.name === "NormalMesh") {
                        Main.instance.StartNormalMode();
                    }
                    else if (pickInfo.pickedMesh.name === "HardMesh") {
                        Main.instance.StartHardMode();
                    }
                    else if (pickInfo.pickedMesh.name === "ScreenModeMesh") {
                        Main.instance.switchToStandard();
                    }
                }
            }
        };
        this.updateMeshes = () => {
            this.meshes.forEach((m) => {
                m.lookAt(this.scene.activeCamera.position);
            });
        };
    }
    CreateUI(scene) {
        this.scene = scene;
        let easyMesh = BABYLON.MeshBuilder.CreatePlane("EasyMesh", { width: 0.5, height: 0.25 }, scene);
        easyMesh.position.y = 2.3;
        this.meshes.push(easyMesh);
        let advancedTextureEasyMode = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(easyMesh, 512, 512, false);
        let easyMode = BABYLON.GUI.Button.CreateSimpleButton("easy-mode", "Easy");
        MainMenu.SetHoloBombButtonDesign(easyMode);
        easyMode.fontSize = 120;
        advancedTextureEasyMode.addControl(easyMode);
        let normalMesh = BABYLON.MeshBuilder.CreatePlane("NormalMesh", { width: 0.5, height: 0.25 }, scene);
        normalMesh.position.y = 1.95;
        this.meshes.push(normalMesh);
        let advanceTextureNormalMode = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(normalMesh, 512, 512, false);
        let normalMode = BABYLON.GUI.Button.CreateSimpleButton("normal-mode", "Normal");
        MainMenu.SetHoloBombButtonDesign(normalMode);
        normalMode.fontSize = 120;
        advanceTextureNormalMode.addControl(normalMode);
        let hardMesh = BABYLON.MeshBuilder.CreatePlane("HardMesh", { width: 0.5, height: 0.25 }, scene);
        hardMesh.position.y = 1.6;
        this.meshes.push(hardMesh);
        let advanceTextureHardMode = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(hardMesh, 512, 512, false);
        let hardMode = BABYLON.GUI.Button.CreateSimpleButton("hard-mode", "Hard");
        MainMenu.SetHoloBombButtonDesign(hardMode);
        hardMode.fontSize = 120;
        advanceTextureHardMode.addControl(hardMode);
        let screenModeMesh = BABYLON.MeshBuilder.CreatePlane("ScreenModeMesh", { width: 0.3, height: 0.3 }, scene);
        screenModeMesh.position.y = 1.2;
        screenModeMesh.position.subtractInPlace(this.scene.activeCamera.getDirection(BABYLON.Axis.X).scale(0.2));
        this.meshes.push(screenModeMesh);
        let advancedTextureScreenMode = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(screenModeMesh, 512, 512, false);
        let screenMode = BABYLON.GUI.Button.CreateImageOnlyButton("screen-mode", "./datas/screen-mode.png");
        MainMenu.SetHoloBombButtonDesign(screenMode);
        screenMode.fontSize = 120;
        advancedTextureScreenMode.addControl(screenMode);
        MainMenu.DeactivateButton(screenMode);
        let vrModeMesh = BABYLON.MeshBuilder.CreatePlane("VRModeMesh", { width: 0.3, height: 0.3 }, scene);
        vrModeMesh.position.y = 1.2;
        vrModeMesh.position.addInPlace(this.scene.activeCamera.getDirection(BABYLON.Axis.X).scale(0.2));
        this.meshes.push(vrModeMesh);
        let advancedTextureVRMode = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(vrModeMesh, 512, 512, false);
        let vrMode = BABYLON.GUI.Button.CreateImageOnlyButton("vr-mode", "./datas/vr-mode.png");
        MainMenu.SetHoloBombButtonDesign(vrMode);
        vrMode.fontSize = 120;
        advancedTextureVRMode.addControl(vrMode);
        var nextFrame = () => {
            this.observer = this.scene.onPointerObservable.add(this.onPointerObservable);
            this.scene.unregisterBeforeRender(nextFrame);
        };
        this.scene.registerBeforeRender(nextFrame);
        this.scene.registerBeforeRender(this.updateMeshes);
    }
    DisposeUI() {
        this.meshes.forEach((m) => {
            m.dispose();
        });
        this.scene.onPointerObservable.remove(this.observer);
        this.scene.unregisterBeforeRender(this.updateMeshes);
    }
}
