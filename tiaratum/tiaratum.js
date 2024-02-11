class Ground extends BABYLON.Mesh {
    constructor(terrarium) {
        super("ground");
        this.terrarium = terrarium;
        this.flatten = [];
        let dirtMaterial = new ToonMaterial("dirt", this.getScene());
        this.material = dirtMaterial;
        dirtMaterial.setDiffuse(BABYLON.Color3.FromHexString("#bf811d"));
        dirtMaterial.setDiffuseSharpness(0.5);
        //dirtMaterial.setDiffuseTexture(new BABYLON.Texture("./datas/textures/dirt.png", undefined, undefined, false));
        dirtMaterial.setSpecularIntensity(0);
        let plasticMaterial = new BABYLON.StandardMaterial("black-plastic");
        plasticMaterial.diffuseColor = BABYLON.Color3.FromHexString("#3b3b3b");
        plasticMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.base = new BABYLON.Mesh("base");
        this.base.material = plasticMaterial;
    }
    resize() {
        let data = new BABYLON.VertexData();
        let cW = Math.round(this.terrarium.innerWidth * 5);
        let cD = Math.round(this.terrarium.innerDepth * 5);
        let w = this.terrarium.innerWidth / cW;
        let d = this.terrarium.innerDepth / cD;
        let heightMap = [];
        for (let i = 0; i <= cW; i++) {
            for (let j = 0; j <= cD; j++) {
                heightMap[i + j * cW] = Math.random();
            }
        }
        for (let n = 0; n < 10; n++) {
            let i = Math.round(cW * Math.random());
            let j = Math.round(cD * Math.random());
            heightMap[i + j * cW] += 4 + 4 * Math.random();
        }
        for (let n = 0; n < 20; n++) {
            let i = Math.round(cW * Math.random());
            let j = Math.round(cD * Math.random());
            heightMap[i + j * cW] += 2 + 2 * Math.random();
        }
        for (let n = 0; n < 30; n++) {
            let i = Math.round(cW * Math.random());
            let j = Math.round(cD * Math.random());
            heightMap[i + j * cW] += 1 + 1 * Math.random();
        }
        for (let n = 0; n < 1; n++) {
            let tmpHeightMap = [...heightMap];
            for (let i = 0; i <= cW; i++) {
                for (let j = 0; j <= cD; j++) {
                    let v = 0;
                    let c = 0;
                    for (let ii = -2; ii <= 2; ii++) {
                        for (let jj = -2; jj <= 2; jj++) {
                            let ni = i + ii;
                            if (ni >= 0 && ni <= cW) {
                                let nj = j + jj;
                                if (nj >= 0 && nj <= cD) {
                                    v += heightMap[ni + nj * cW];
                                    c++;
                                }
                            }
                        }
                    }
                    tmpHeightMap[i + j * cW] = v / c;
                }
            }
            heightMap = [...tmpHeightMap];
        }
        for (let j = -1; j <= cD; j++) {
            for (let i = 0; i <= cW; i++) {
                let x = i * w - this.terrarium.innerWidth * 0.5;
                let z = j * d - this.terrarium.innerDepth * 0.5;
                for (let k = 0; k < this.flatten.length; k++) {
                    let p = this.flatten[k].p;
                    let dx = p.x - x;
                    let dz = p.y - z;
                    let d = Math.sqrt(dx * dx + dz * dz);
                    if (d < this.flatten[k].r) {
                        heightMap[i + j * cW] = 1;
                    }
                    else if (d < 2 * this.flatten[k].r) {
                        let f = (d - this.flatten[k].r) / this.flatten[k].r;
                        heightMap[i + j * cW] *= f;
                        heightMap[i + j * cW] += (1 - f) * 1;
                    }
                }
            }
        }
        let positions = [];
        let indices = [];
        let normals = [];
        let colors = [];
        let uvs = [];
        for (let j = -1; j <= 0; j++) {
            for (let i = 0; i <= cW; i++) {
                let x = i * w - this.terrarium.innerWidth * 0.5;
                let y = 0;
                let z = -this.terrarium.innerDepth * 0.5;
                if (j > -1) {
                    y = 0.3 * heightMap[i + j * cW];
                    z = j * d - this.terrarium.innerDepth * 0.5;
                }
                let n = positions.length / 3;
                positions.push(x, y, z);
                uvs.push(i, j);
                if (i < cW && j < 0) {
                    indices.push(n, n + 1, n + 1 + (cW + 1));
                    indices.push(n, n + 1 + (cW + 1), n + (cW + 1));
                }
            }
        }
        for (let j = 0; j <= cD; j++) {
            for (let i = 0; i <= cW; i++) {
                let x = i * w - this.terrarium.innerWidth * 0.5;
                let y = 0.3 * heightMap[i + j * cW];
                let z = j * d - this.terrarium.innerDepth * 0.5;
                let n = positions.length / 3;
                positions.push(x, y, z);
                uvs.push(i, j);
                if (i < cW && j < cD) {
                    indices.push(n, n + 1, n + 1 + (cW + 1));
                    indices.push(n, n + 1 + (cW + 1), n + (cW + 1));
                }
            }
        }
        data.positions = positions;
        data.indices = indices;
        BABYLON.VertexData.ComputeNormals(data.positions, data.indices, normals);
        data.normals = normals;
        //data.colors = colors;
        data.uvs = uvs.map(v => { return v * 0.05; });
        data.applyToMesh(this);
        BABYLON.CreateBoxVertexData({ width: this.terrarium.width + 0.2, depth: this.terrarium.depth + 0.2, height: 0.1 }).applyToMesh(this.base);
        this.base.position.y = -0.05;
    }
}
class LocalizedText {
    constructor(props) {
        this._texts = new Map();
        if (props.fr) {
            this._texts.set("fr", props.fr);
        }
        this._texts.set("en", props.en);
    }
    get(lang) {
        let langNoCountry = lang.split("-")[0].toLowerCase();
        if (this._texts.has(langNoCountry)) {
            return this._texts.get(langNoCountry);
        }
        return this._texts.get("en");
    }
}
/// <reference path="../lib/babylon.d.ts"/>
/// <reference path="../../mummu/mummu.d.ts"/>
/// <reference path="../../nabu/nabu.d.ts"/>
/// <reference path="../../sumuqan/sumuqan.d.ts"/>
function addLine(text) {
    let e = document.createElement("div");
    e.classList.add("debug-log");
    e.innerText = text;
    document.body.appendChild(e);
}
class Game {
    constructor(canvasElement) {
        this.lang = "en";
        this._moving = false;
        this._update = () => {
            let href = window.location.href;
            if (href != this._currentHRef) {
                this._currentHRef = href;
                this._onHRefChange();
            }
        };
        this._onHRefChange = async () => {
            let split = this._currentHRef.split("/");
            let page = split[split.length - 1];
            console.log(page);
            if (page.endsWith("#phasmida") || page.endsWith("#credit")) {
                this.hideLangContainer();
                if (page.endsWith("#credit")) {
                    this.showCreditContainer();
                }
                else {
                    this.hideCreditContainer();
                }
                this.sourcePage.hide();
                this.showHomeButton();
                this.showCreditButton();
                this.mainMenu.hide();
            }
            else if (page.endsWith("#sourcecode")) {
                this.showLangContainer();
                this.hideCreditContainer();
                this.mainMenu.hide();
                this.showHomeButton();
                this.hideCreditButton();
                this.sourcePage.show();
            }
            else if (page.endsWith("#home") || true) {
                this.showLangContainer();
                this.hideCreditContainer();
                this.hideHomeButton();
                this.hideCreditButton();
                this.sourcePage.hide();
                this.mainMenu.show();
            }
        };
        Game.Instance = this;
        this.canvas = document.getElementById(canvasElement);
        this.canvas.requestPointerLock = this.canvas.requestPointerLock || this.canvas.msRequestPointerLock || this.canvas.mozRequestPointerLock || this.canvas.webkitRequestPointerLock;
        this.engine = new BABYLON.Engine(this.canvas, true);
        BABYLON.Engine.ShadersRepository = "./shaders/";
    }
    getScene() {
        return this.scene;
    }
    setHighlitProp(prop) {
        if (this.highlitProp) {
            this.highlitProp.unlit();
        }
        this.highlitProp = prop;
        if (this.highlitProp) {
            this.highlitProp.highlight();
        }
    }
    async createScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = BABYLON.Color4.FromHexString("#ffffff00");
        this.vertexDataLoader = new Mummu.VertexDataLoader(this.scene);
        new BABYLON.HemisphericLight("ambient-light", (new BABYLON.Vector3(2, 3, -1)).normalize(), this.scene);
        this.homeButton = document.getElementById("home-button");
        this.creditButton = document.getElementById("credits-button");
        this.creditContainer = document.getElementById("credits");
        this.langContainer = document.getElementById("language-selection");
        this.mainMenu = new MainMenu("home", this);
        this.mainMenu.panels = [
            new MainMenuPanel(this.mainMenu, {
                fullLine: true,
                height: 1,
                backgroundUrl: "./datas/textures/logo-white-web-no-bg.png"
            }),
            new MainMenuPanel(this.mainMenu, {
                width: 1,
                height: 1,
                title: new LocalizedText({ fr: "A propos", en: "About" }),
                paragraphs: [
                    new LocalizedText({
                        fr: "Bonjour ! Je suis Tiaratum Games, un studio individuel de création de jeux vidéo créé en 2024.",
                        en: "Hello ! I'm Tiaratum Games, a one-person game studio founded in 2024."
                    }),
                    new LocalizedText({
                        fr: "Mon objectif est de réaliser des jeux html avec un focus sur l'innovation technique.",
                        en: "My ambition is to release some cool html-based games with a focus on technical innovation."
                    }),
                ]
            }),
            new MainMenuPanel(this.mainMenu, {
                width: 2,
                height: 1,
                title: new LocalizedText({ fr: "Jouez maintenant sur Itch.io !", en: "Play now on Itch.io !" }),
                backgroundUrl: "./datas/textures/marble-run-simulator-logo.png",
                selectable: true,
                href: "https://svenfrankson.itch.io/marble-fall",
                target: "_blank"
            }),
            new MainMenuPanel(this.mainMenu, {
                width: 1,
                height: 1,
                title: new LocalizedText({ fr: "Contact", en: "Stay tuned" }),
                children: [
                    '<a href="https://bsky.app/profile/tiaratumgames.bsky.social" target="_blank"><span class="social-item"><img class="social-icon" src="./datas/textures/Bluesky_butterfly-logo.png"></img><span class="social-title">Bluesky</span></span></a>',
                    '<a href="https://twitter.com/tiaratumgames" target="_blank"><span class="social-item"><img class="social-icon" src="./datas/textures/logo-x.svg"></img><span class="social-title">X (Twitter)</span></span></a>',
                    '<a href = "mailto: tiaratumgames@gmail.com"><span class="social-item"><img class="social-icon" src="./datas/textures/email.svg"></img><span class="social-title">Mail</span></span></a>'
                ]
            }),
            new MainMenuPanel(this.mainMenu, {
                width: 1,
                height: 1,
                title: new LocalizedText({ fr: "Sources & Libs", en: "Sources & Libs" }),
                backgroundUrl: "./datas/textures/github-logo.png",
                paragraphs: [
                    new LocalizedText({
                        fr: "Une partie du code produit par Tiaratum Games est open-source et accessible sur GitHub.",
                        en: "Part of Tiaratum Games code is open-sourced and can be found on GitHub."
                    })
                ],
                selectable: true,
                href: "#sourcecode",
            })
        ];
        this.showHidePanel = new MainMenuPanel(this.mainMenu, {
            width: 1,
            height: 1,
            title: new LocalizedText({ fr: "Terrarium", en: "Terrarium" }),
            fromBottomRight: true,
            backgroundUrl: "./datas/textures/phasms.png",
            paragraphs: [
                new LocalizedText({
                    fr: "En arrière plan, une démo de Sumuqan, mon projet de bibliothèque d'animation procédurale basée sur BabylonJS.",
                    en: "In the background, a demo of Sumuqan, my BabylonJS-based procedural animation library project."
                })
            ],
            selectable: true,
            href: "#phasmida",
        });
        this.mainMenu.panels.push(this.showHidePanel);
        this.sourcePage = new Page("source", this);
        this.sourcePage.hide();
        this.setLang(navigator.language);
        this.skybox = BABYLON.MeshBuilder.CreateSphere("skyBox", { diameter: 100, sideOrientation: BABYLON.Mesh.BACKSIDE }, this.scene);
        let skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        let skyTexture = new BABYLON.Texture("./datas/skyboxes/room.jpeg");
        skyboxMaterial.diffuseTexture = skyTexture;
        skyboxMaterial.emissiveColor = BABYLON.Color3.White();
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        this.skybox.material = skyboxMaterial;
        this.skybox.rotation.y = 0.16 * Math.PI;
        this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, -10));
        this.camera.speed *= 0.1;
        this.camera.fov *= 1;
        document.getElementById("language-select-en").onclick = () => {
            this.setLang("en");
        };
        document.getElementById("language-select-fr").onclick = () => {
            this.setLang("fr");
        };
        InstantiateTerrarium(this);
        this.scene.onBeforeRenderObservable.add(this._update);
    }
    animate() {
        this.engine.runRenderLoop(() => {
            this.scene.render();
            if (this._moving) {
                this.skybox.rotation.y += 0.01;
                console.log(this.skybox.rotation.y);
            }
        });
        window.addEventListener("resize", () => {
            this.engine.resize();
            this.terrarium.resize();
            this.mainMenu.resize();
        });
    }
    async initialize() {
    }
    setLang(lang) {
        this.lang = lang;
        let langNoCountry = this.lang.split("-")[0].toLowerCase();
        if (langNoCountry === "fr") {
            document.getElementById("language-select-en").classList.remove("active");
            document.getElementById("language-select-fr").classList.add("active");
            document.querySelectorAll("[lang=fr]").forEach(e => {
                if (e instanceof HTMLElement) {
                    e.style.display = "";
                }
            });
            document.querySelectorAll("[lang=en]").forEach(e => {
                if (e instanceof HTMLElement) {
                    e.style.display = "none";
                }
            });
        }
        else {
            document.getElementById("language-select-fr").classList.remove("active");
            document.getElementById("language-select-en").classList.add("active");
            document.querySelectorAll("[lang=en]").forEach(e => {
                if (e instanceof HTMLElement) {
                    e.style.display = "";
                }
            });
            document.querySelectorAll("[lang=fr]").forEach(e => {
                if (e instanceof HTMLElement) {
                    e.style.display = "none";
                }
            });
        }
        this.mainMenu.resize();
    }
    get homeButtonBottom() {
        return parseFloat(this.homeButton.style.bottom);
    }
    set homeButtonBottom(v) {
        this.homeButton.style.bottom = v.toFixed(2) + "svh";
    }
    async showHomeButton() {
        if (this.homeButton.style.visibility != "visible") {
            return new Promise(resolve => {
                let duration = 0.5;
                let anim = Mummu.AnimationFactory.CreateNumber(this, this, "homeButtonBottom", undefined, undefined, Nabu.Easing.easeOutSquare);
                this.homeButton.style.visibility = "visible";
                this.homeButton.style.pointerEvents = "none";
                this.homeButtonBottom = -5;
                anim(0, duration).then(() => {
                    this.homeButton.style.visibility = "visible";
                    this.homeButton.style.pointerEvents = "auto";
                    resolve();
                });
            });
        }
    }
    async hideHomeButton() {
        if (this.homeButton.style.visibility != "hidden") {
            return new Promise(resolve => {
                let duration = 0.5;
                let anim = Mummu.AnimationFactory.CreateNumber(this, this, "homeButtonBottom", undefined, undefined, Nabu.Easing.easeOutSquare);
                this.homeButton.style.visibility = "visible";
                this.homeButton.style.pointerEvents = "none";
                this.homeButtonBottom = 0;
                anim(-5, duration).then(() => {
                    this.homeButton.style.visibility = "hidden";
                    resolve();
                });
            });
        }
    }
    get creditButtonBottom() {
        return parseFloat(this.creditButton.style.bottom);
    }
    set creditButtonBottom(v) {
        this.creditButton.style.bottom = v.toFixed(2) + "svh";
    }
    async showCreditButton() {
        if (this.creditButton.style.visibility != "visible") {
            return new Promise(resolve => {
                let duration = 0.5;
                let anim = Mummu.AnimationFactory.CreateNumber(this, this, "creditButtonBottom", undefined, undefined, Nabu.Easing.easeOutSquare);
                this.creditButton.style.visibility = "visible";
                this.creditButton.style.pointerEvents = "none";
                this.creditButtonBottom = -5;
                anim(0, duration).then(() => {
                    this.creditButton.style.visibility = "visible";
                    this.creditButton.style.pointerEvents = "auto";
                    resolve();
                });
            });
        }
    }
    async hideCreditButton() {
        if (this.creditButton.style.visibility != "hidden") {
            return new Promise(resolve => {
                let duration = 0.5;
                let anim = Mummu.AnimationFactory.CreateNumber(this, this, "creditButtonBottom", undefined, undefined, Nabu.Easing.easeOutSquare);
                this.creditButton.style.visibility = "visible";
                this.creditButton.style.pointerEvents = "none";
                this.creditButtonBottom = 0;
                anim(-5, duration).then(() => {
                    this.creditButton.style.visibility = "hidden";
                    resolve();
                });
            });
        }
    }
    showCreditContainer() {
        this.creditContainer.style.display = "";
    }
    hideCreditContainer() {
        this.creditContainer.style.display = "none";
    }
    showLangContainer() {
        this.langContainer.style.display = "";
    }
    hideLangContainer() {
        this.langContainer.style.display = "none";
    }
}
window.addEventListener("DOMContentLoaded", () => {
    //addLine("Kulla Test Scene");
    let main = new Game("render-canvas");
    main.createScene();
    main.initialize().then(() => {
        main.animate();
    });
});
class PhasmController {
    constructor(phasm) {
        this.phasm = phasm;
        this.timer = Infinity;
        this.stop = false;
        this.debug = new BABYLON.Mesh("debug");
        //BABYLON.CreateSphereVertexData({ diameter: 0.1 }).applyToMesh(this.debug);
    }
    updateExplorerDestination() {
        let dir = new BABYLON.Vector3(-0.5 + Math.random(), -Math.random() * 0.3, -0.5 + Math.random());
        dir.normalize();
        let ray = new BABYLON.Ray(new BABYLON.Vector3(0, this.phasm.game.terrarium.height - 1, 0), dir);
        ray.length = 100;
        let intersection = Mummu.RayCollidersIntersection(ray, this.phasm.terrain);
        if (intersection.hit) {
            //Mummu.DrawDebugLine(ray.origin, intersection.point, 60);
            this.destination = intersection.point;
            this.debug.position.copyFrom(this.destination);
        }
        return true;
    }
    update() {
        if (this.stop) {
            this.phasm.speed = 0;
            this.phasm.rotationSpeed = 0;
            return;
        }
        let dt = this.phasm.getScene().getEngine().getDeltaTime() / 1000;
        this.timer += dt;
        if (this.timer > 30) {
            if (this.updateExplorerDestination()) {
                this.timer = 0;
                return;
            }
        }
        if (!this.destination || !Mummu.IsFinite(this.destination)) {
            if (this.updateExplorerDestination()) {
                this.timer = 0;
            }
            return;
        }
        let dirDestination = this.destination.subtract(this.phasm.position);
        let distDestination = dirDestination.length();
        if (distDestination < 0.4) {
            if (this.updateExplorerDestination()) {
                this.timer = 0;
                if (Math.random() > 0.5) {
                    this.stop = true;
                    setTimeout(() => {
                        this.stop = false;
                    }, Math.random() * 15000);
                }
                return;
            }
        }
        this.phasm.speed = distDestination * 0.5;
        this.phasm.speed = Math.max(Math.min(this.phasm.speed, 0.5), 0);
        let alphaDestination = Mummu.AngleFromToAround(dirDestination, this.phasm.forward, this.phasm.up);
        this.phasm.rotationSpeed = 0;
        if (alphaDestination > Math.PI / 64) {
            this.phasm.rotationSpeed = -0.25;
        }
        else if (alphaDestination < -Math.PI / 64) {
            this.phasm.rotationSpeed = 0.25;
        }
    }
}
class Phasm extends Sumuqan.Polypode {
    constructor(game) {
        super("phasm", {
            legPairsCount: 3,
            headAnchor: (new BABYLON.Vector3(0, 0.04, 0.25)),
            hipAnchors: [
                new BABYLON.Vector3(0.12, 0.026, -0.217),
                new BABYLON.Vector3(0.08, 0, 0),
                new BABYLON.Vector3(0.037, 0.028, 0.22)
            ],
            footTargets: [
                new BABYLON.Vector3(0.25, -.2, -0.5),
                new BABYLON.Vector3(0.32, -.2, 0),
                new BABYLON.Vector3(0.15, -.2, 0.5)
            ],
            footThickness: 0,
            upperLegLength: 0.27,
            lowerLegLength: 0.31,
            legScales: [1.1, 0.9, 1],
            stepHeight: 0.15,
            stepDuration: 0.3,
            bodyWorldOffset: new BABYLON.Vector3(0, -0.05, 0),
            antennaAnchor: new BABYLON.Vector3(0.045, 0.041, 0.065),
            antennaLength: 0.5,
            scorpionTailProps: {
                length: 7,
                dist: 0.11,
                distGeometricFactor: 0.9,
                anchor: new BABYLON.Vector3(0, 0.035, -0.28)
            }
        });
        this.game = game;
        this.destination = BABYLON.Vector3.Zero();
        this._updateDrone = () => {
            this.controller.update();
        };
        this.rightLegs[0].kneeMode = Sumuqan.KneeMode.Backward;
        this.leftLegs[0].kneeMode = Sumuqan.KneeMode.Backward;
        this.rightLegs[2].kneeMode = Sumuqan.KneeMode.Outward;
        this.leftLegs[2].kneeMode = Sumuqan.KneeMode.Outward;
        let povMaterial = new ToonMaterial("debug-pov-material", this.game.scene);
        povMaterial.setDiffuse(new BABYLON.Color3(0.5, 0.5, 1));
        povMaterial.setAlpha(0.4);
        povMaterial.setSpecularIntensity(0.5);
        let colliderMaterial = new ToonMaterial("body", this.game.scene);
        colliderMaterial.setDiffuse(new BABYLON.Color3(0.5, 1, 0.5));
        colliderMaterial.setAlpha(0.4);
        colliderMaterial.setSpecularIntensity(0.5);
        let colliderHitMaterial = new ToonMaterial("body", this.game.scene);
        colliderHitMaterial.setDiffuse(new BABYLON.Color3(1, 0.5, 0.5));
        colliderHitMaterial.setAlpha(0.4);
        colliderHitMaterial.setSpecularIntensity(0.5);
        this.terrain = this.getScene().meshes.filter((m) => {
            return m.name.startsWith("ground") || m.name.startsWith("top-lid") || m.name.startsWith("cloth") || m.name.endsWith("-collider");
        });
        this.terrain.push(this.game.terrarium.wallLeftCollider);
        this.terrain.push(this.game.terrarium.wallBackCollider);
        this.terrain.push(this.game.terrarium.wallRightCollider);
        this.terrain.push(this.game.terrarium.wallFrontCollider);
        this.controller = new PhasmController(this);
        this.debugColliderMaterial = colliderMaterial;
        this.debugColliderHitMaterial = colliderHitMaterial;
        let headCollider = new Mummu.SphereCollider(new BABYLON.Vector3(0, 0, 0.1), 0.15, this.head);
        let assCollider = new Mummu.SphereCollider(new BABYLON.Vector3(0, 0, -0.2), 0.2, this.body);
        this.bodyColliders.push(headCollider, assCollider);
        let tailEndCollider = new Mummu.SphereCollider(BABYLON.Vector3.Zero(), 0.15, this.tail.tailSegments[6]);
        this.tail.tailCollider = tailEndCollider;
        this.updateBodyCollidersMeshes();
        this.debugPovMaterial = povMaterial;
        this.showCollisionDebug = false;
        if (this.showCollisionDebug) {
            BABYLON.CreateBoxVertexData({ width: 0.1, height: 0.8, depth: 0.1 }).applyToMesh(this);
            this.material = colliderHitMaterial;
        }
    }
    async initialize() {
        await super.initialize();
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.getScene().onBeforeRenderObservable.add(this._updateDrone);
    }
    async instantiate() {
        let datas = await Game.Instance.vertexDataLoader.get("./datas/meshes/phasm.babylon");
        let droneMaterial = new ToonMaterial("drone-material", this.getScene());
        let color = BABYLON.Color3.FromHexString("#9e6120");
        color.r *= 0.7 + 0.6 * Math.random();
        color.g *= 0.7 + 0.6 * Math.random();
        color.b *= 0.7 + 0.6 * Math.random();
        droneMaterial.setDiffuse(color);
        droneMaterial.setUseVertexColor(false);
        this.legs.forEach(leg => {
            datas[0].applyToMesh(leg.upperLeg);
            datas[1].applyToMesh(leg.lowerLeg);
            leg.upperLeg.material = droneMaterial;
            leg.lowerLeg.material = droneMaterial;
        });
        datas[2].applyToMesh(this.body);
        datas[3].applyToMesh(this.head);
        datas[11].applyToMesh(this.antennas[0]);
        datas[11].applyToMesh(this.antennas[1]);
        for (let i = 0; i < 7; i++) {
            datas[4 + i].applyToMesh(this.tail.tailSegments[i]);
            this.tail.tailSegments[i].material = droneMaterial;
        }
        this.body.material = droneMaterial;
        this.head.material = droneMaterial;
        this.antennas[0].material = droneMaterial;
        this.antennas[1].material = droneMaterial;
    }
}
class PlantProp {
    constructor() {
        this.trunkHeight = 8;
        this.trunkAlphaMax = Math.PI / 8;
        this.firstBranchLevel = 1;
        this.branchProba = 0.5;
        this.branchAlphaMax = Math.PI / 6;
        this.connectionAlphaMin = 0.7 * Math.PI / 2;
        this.connectionAlphaMax = 1.3 * Math.PI / 2;
        this.branchLengthMin = 1;
        this.branchLengthMax = 3;
        this.distanceMin = 0.3;
        this.distanceMax = 0.4;
    }
}
class PlantNode {
    constructor(parent) {
        this.parent = parent;
        this.position = BABYLON.Vector3.Zero();
        this.dir = BABYLON.Vector3.Up();
        this.distance = 1;
        this.level = 0;
        this.branchLevel = 0;
        this.children = [];
        if (this.parent) {
            this.level = parent.level + 1;
        }
    }
    generate(prop) {
        if (this.parent) {
            this.position.copyFrom(this.dir).scaleInPlace(this.distance).addInPlace(this.parent.position);
        }
        if (this.level < prop.trunkHeight) {
            let child = new PlantNode(this);
            let random = new BABYLON.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
            let ortho = BABYLON.Vector3.Cross(this.dir, random);
            let alpha = 2 * (Math.random() - 0.5) * (this.branchLevel === 0 ? prop.trunkAlphaMax : prop.branchAlphaMax);
            Mummu.RotateToRef(this.dir, ortho, alpha, child.dir);
            child.branchLevel = this.branchLevel;
            child.distance = Math.random() * (prop.distanceMax - prop.distanceMin) + prop.distanceMin;
            this.children.push(child);
            child.generate(prop);
        }
        if (this.branchLevel === 0 && this.level > prop.firstBranchLevel) {
            if (Math.random() < prop.branchProba) {
                let child = new PlantNode(this);
                let branchLength = Math.round(Math.random() * (prop.branchLengthMax - prop.branchLengthMin) + prop.branchLengthMin);
                child.level = prop.trunkHeight - branchLength + 1;
                let random = new BABYLON.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
                let ortho = BABYLON.Vector3.Cross(this.dir, random);
                let alpha = Math.random() * (prop.connectionAlphaMax - prop.connectionAlphaMin) + prop.connectionAlphaMin;
                Mummu.RotateToRef(this.dir, ortho, alpha, child.dir);
                child.branchLevel = this.branchLevel + 1;
                child.distance = Math.random() * (prop.distanceMax - prop.distanceMin) + prop.distanceMin;
                this.children.push(child);
                child.generate(prop);
            }
        }
    }
    draw() {
        if (this.parent) {
            let dirStart = this.parent.dir;
            if (this.branchLevel > this.parent.branchLevel) {
                dirStart = this.parent.dir.add(this.dir).normalize();
            }
            let dirEnd = this.dir;
            if (this.children[0]) {
                dirEnd = this.children[0].dir;
            }
            let p = BABYLON.Vector3.Hermite(this.parent.position, dirStart, this.position, dirEnd, 0.5);
            let color = new BABYLON.Color4(Math.random(), Math.random(), Math.random(), 1);
            BABYLON.MeshBuilder.CreateLines("plant-node", { points: [this.parent.position, p, this.position], colors: [color, color, color] });
        }
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].draw();
        }
    }
}
class Plant extends BABYLON.Mesh {
    constructor(name, game) {
        super(name);
        this.game = game;
        this.height = 3;
        this.trunckLength = 4;
        this.branchesCount = 6;
        this.branchLength = 0.7;
        this.trunck = [];
        this.branches = [];
        this.branchesDirs = [];
    }
    generate() {
        let dy = this.height / this.trunckLength;
        this.trunck = [BABYLON.Vector3.Zero()];
        for (let n = 1; n < this.trunckLength; n++) {
            this.trunck.push(new BABYLON.Vector3(0.3 * (-1 + 2 * Math.random()), n * dy, 0.3 * (-1 + 2 * Math.random())));
        }
        Mummu.CatmullRomPathInPlace(this.trunck);
        Mummu.CatmullRomPathInPlace(this.trunck);
        Mummu.CatmullRomPathInPlace(this.trunck);
        Mummu.CatmullRomPathInPlace(this.trunck);
        let random = new BABYLON.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
        for (let i = 0; i < this.branchesCount; i++) {
            let n = Math.round(this.trunck.length * (i + 1) / (this.branchesCount + 1) - 1 + 2 * Math.random());
            n = Nabu.MinMax(n, 1, this.trunck.length - 2);
            let l = this.branchLength * (0.5 + 1 * Math.random() * (1 - i / this.branchesCount));
            let trunckDir = this.trunck[n + 1].subtract(this.trunck[n - 1]);
            let orthoTrunck = BABYLON.Vector3.Cross(trunckDir, random).normalize();
            Mummu.RotateInPlace(orthoTrunck, trunckDir, i * Math.PI / 2 + Math.PI / 2 * (0.75 + 0.5 * Math.random()));
            this.branchesDirs[i] = orthoTrunck;
            let p = this.trunck[n].add(orthoTrunck.scale(l * 0.5));
            let right = BABYLON.Vector3.Cross(trunckDir, orthoTrunck).normalize();
            let branchTip = Mummu.Rotate(orthoTrunck, right, -Math.PI / 6 + 2 * Math.random() * Math.PI / 6).scale(l * 0.5).add(p);
            this.branches[i] = [this.trunck[n].clone(), p, branchTip];
            Mummu.CatmullRomPathInPlace(this.branches[i]);
            Mummu.CatmullRomPathInPlace(this.branches[i]);
        }
    }
    async instantiate() {
        let plantMaterial = new ToonMaterial("prop-material", this.game.scene);
        plantMaterial.setDiffuse(BABYLON.Color3.FromHexString("#72E738"));
        plantMaterial.setSpecularIntensity(0.2);
        let n = 6;
        let shape = [];
        for (let i = 0; i < n; i++) {
            let a = i / n * 2 * Math.PI;
            let cosa = Math.cos(a);
            let sina = Math.sin(a);
            shape[i] = new BABYLON.Vector3(cosa * 0.03, sina * 0.03, 0);
        }
        let wire = BABYLON.ExtrudeShape("wire", { shape: shape, path: this.trunck, closeShape: true, cap: BABYLON.Mesh.CAP_ALL });
        wire.material = plantMaterial;
        wire.parent = this;
        let leavesDatas = [];
        let up = this.trunck[this.trunck.length - 1].subtract(this.trunck[this.trunck.length - 2]).normalize();
        let q = Mummu.QuaternionFromZYAxis(this.branchesDirs[this.branchesDirs.length - 1].scale(-1), up);
        let datas = await this.game.vertexDataLoader.get("./datas/meshes/leaf.babylon");
        let data = Mummu.CloneVertexData(datas[0]);
        Mummu.RotateVertexDataInPlace(data, q);
        Mummu.TranslateVertexDataInPlace(data, this.trunck[this.trunck.length - 1]);
        leavesDatas.push(data);
        shape = shape.map(v => { return v.scale(0.8); });
        for (let n = 0; n < this.branches.length; n++) {
            let branch = this.branches[n];
            let wire = BABYLON.ExtrudeShape("wire", { shape: shape, path: branch, closeShape: true, cap: BABYLON.Mesh.CAP_ALL });
            wire.material = plantMaterial;
            wire.parent = this;
            let dir = branch[branch.length - 1].subtract(branch[branch.length - 2]).normalize();
            let up = Mummu.Rotate(BABYLON.Vector3.Up(), dir, (-1 + 2 * Math.random()) * Math.PI / 4);
            let q = Mummu.QuaternionFromZYAxis(dir, up);
            let data = Mummu.CloneVertexData(datas[0]);
            Mummu.ScaleVertexDataInPlace(data, 0.5 + 0.5 * Math.random());
            Mummu.RotateVertexDataInPlace(data, q);
            Mummu.TranslateVertexDataInPlace(data, branch[branch.length - 1]);
            leavesDatas.push(data);
        }
        let leaves = new BABYLON.Mesh("leaves");
        leaves.material = this.game.terrarium.propMaterial;
        leaves.parent = this;
        Mummu.MergeVertexDatas(...leavesDatas).applyToMesh(leaves);
    }
}
class Prop extends BABYLON.Mesh {
    constructor(props) {
        super(props.name);
        this.props = props;
        this.peers = [];
        if (props.rotation) {
            this.rotation.copyFrom(props.rotation);
        }
        this.material = this.props.terrarium.propMaterial;
        if (!isFinite(props.index)) {
            props.index = 0;
        }
        if (!Mummu.IsFinite(this.props.offsetPos)) {
            this.props.offsetPos = BABYLON.Vector3.Zero();
        }
        if (!Mummu.IsFinite(this.props.targetUpOffset)) {
            this.props.targetUpOffset = BABYLON.Vector3.Zero();
        }
    }
    async instantiate() {
        let vertexDatas = await this.props.terrarium.game.vertexDataLoader.get("./datas/meshes/" + this.name + ".babylon");
        if (vertexDatas && vertexDatas[this.props.index]) {
            vertexDatas[this.props.index].applyToMesh(this);
        }
        if (isFinite(this.props.colliderIndex)) {
            if (vertexDatas && vertexDatas[this.props.colliderIndex]) {
                this.mummuCollider = new BABYLON.Mesh(this.name + "-collider");
                this.mummuCollider.parent = this;
                this.mummuCollider.visibility = 0;
                this.mummuCollider.material = this.props.terrarium.colliderMaterial;
                vertexDatas[this.props.colliderIndex].applyToMesh(this.mummuCollider);
            }
        }
        if (this.props.update) {
            this.props.terrarium.game.scene.onBeforeRenderObservable.add(this.props.update.bind(this, this));
        }
    }
    resize() {
        let w = this.props.terrarium.innerWidth;
        let h = this.props.terrarium.height;
        let d = this.props.terrarium.innerDepth;
        this.position.x = (-0.5 + this.props.relativePos.x) * w;
        this.position.y = this.props.relativePos.y * h;
        this.position.z = (-0.5 + this.props.relativePos.z) * d;
        this.position.addInPlace(this.props.offsetPos);
        if (this.props.relativeTargetUp) {
            let targetUp = BABYLON.Vector3.Zero();
            targetUp.x = (-0.5 + this.props.relativeTargetUp.x) * w;
            targetUp.y = this.props.relativeTargetUp.y * h;
            targetUp.z = (-0.5 + this.props.relativeTargetUp.z) * d;
            targetUp.addInPlace(this.props.targetUpOffset);
            targetUp.subtractInPlace(this.position);
            this.rotationQuaternion = Mummu.QuaternionFromYZAxis(targetUp, this.forward);
        }
        if (this.props.scaleOnWidth) {
            this.scaling.copyFromFloats(w, w, w);
        }
        if (this.props.scaleOnHeight) {
            this.scaling.copyFromFloats(h, h, h);
        }
        if (this.props.scaleOnDepth) {
            this.scaling.copyFromFloats(d, d, d);
        }
    }
    highlight(doNotPropagate) {
        this.renderOutline = true;
        this.outlineColor = BABYLON.Color3.White();
        this.outlineWidth = 0.02;
        if (!doNotPropagate) {
            this.peers.forEach(prop => {
                prop.highlight(true);
            });
        }
    }
    unlit(doNotPropagate) {
        this.renderOutline = false;
        if (!doNotPropagate) {
            this.peers.forEach(prop => {
                prop.unlit(true);
            });
        }
    }
}
class PictureProp extends Prop {
    constructor(props, pictureMeshIndex, picturePath) {
        super(props);
        this.pictureMeshIndex = pictureMeshIndex;
        this.picturePath = picturePath;
    }
    async instantiate() {
        await super.instantiate();
        let vertexDatas = await this.props.terrarium.game.vertexDataLoader.get("./datas/meshes/" + this.name + ".babylon");
        if (vertexDatas && vertexDatas[this.pictureMeshIndex]) {
            this.pictureMesh = new BABYLON.Mesh(this.name + "-picture");
            this.pictureMesh.parent = this;
            let pictureMaterial = new ToonMaterial("picture", this.getScene());
            pictureMaterial.setAutoLight(1);
            this.pictureMesh.material = pictureMaterial;
            pictureMaterial.setDiffuseTexture(new BABYLON.Texture(this.picturePath));
            pictureMaterial.setSpecularIntensity(0);
            vertexDatas[this.pictureMeshIndex].applyToMesh(this.pictureMesh);
        }
    }
}
class Terrarium {
    constructor(game) {
        this.game = game;
        this.thickness = 0.07;
        this.width = 5;
        this.height = 5;
        this.depth = 5;
        this.props = [];
        this.propMaterial = new ToonMaterial("prop-material", this.game.scene);
        this.propMaterial.setSpecularIntensity(0.2);
        this.propMaterial.setUseVertexColor(true);
        this.colliderMaterial = new ToonMaterial("collider", this.game.scene);
        this.colliderMaterial.setDiffuse(new BABYLON.Color3(0.5, 1, 0.5));
        this.colliderMaterial.setSpecularIntensity(0.5);
        let glassMaterial = new ToonMaterial("glass", this.game.scene);
        glassMaterial.setDiffuse(new BABYLON.Color3(0.8, 0.9, 1));
        glassMaterial.setAlpha(0.3);
        glassMaterial.setSpecularIntensity(0.4);
        glassMaterial.setUseFlatSpecular(true);
        let thickGlassMaterial = new ToonMaterial("glass-thick", this.game.scene);
        thickGlassMaterial.setDiffuse(new BABYLON.Color3(0.8, 0.9, 1));
        thickGlassMaterial.setAlpha(0.6);
        thickGlassMaterial.setSpecularIntensity(0.4);
        thickGlassMaterial.setUseFlatSpecular(true);
        this.innerWallLeft = new BABYLON.Mesh("inner-wall-left");
        this.innerWallLeft.material = glassMaterial;
        this.innerWallLeft.rotation.y = -Math.PI * 0.5;
        this.innerWallBack = new BABYLON.Mesh("inner-wall-back");
        this.innerWallBack.material = glassMaterial;
        this.innerWallRight = new BABYLON.Mesh("inner-wall-right");
        this.innerWallRight.material = glassMaterial;
        this.innerWallRight.rotation.y = Math.PI * 0.5;
        this.innerWallFront = new BABYLON.Mesh("inner-wall-front");
        this.innerWallFront.material = glassMaterial;
        this.innerWallFront.rotation.y = Math.PI;
        this.wallLeft = new BABYLON.Mesh("wall-left");
        this.wallLeft.material = glassMaterial;
        this.wallLeft.rotation.y = Math.PI * 0.5;
        this.wallBack = new BABYLON.Mesh("wall-back");
        this.wallBack.material = glassMaterial;
        this.wallBack.rotation.y = Math.PI;
        this.wallRight = new BABYLON.Mesh("wall-right");
        this.wallRight.material = glassMaterial;
        this.wallRight.rotation.y = -Math.PI * 0.5;
        this.wallFront = new BABYLON.Mesh("wall-front");
        this.wallFront.material = glassMaterial;
        this.wallThickness = new BABYLON.Mesh("wall-thickness");
        this.wallThickness.material = thickGlassMaterial;
        this.ground = new Ground(this);
        this.topLid = new TopLid(this);
        let steelMaterial = new ToonMaterial("steel", this.game.scene);
        steelMaterial.setDiffuse(BABYLON.Color3.FromHexString("#868b8a"));
        steelMaterial.setSpecularIntensity(1);
        steelMaterial.setSpecularCount(2);
        steelMaterial.setSpecularPower(16);
        let plasticMaterial = new ToonMaterial("plastic", this.game.scene);
        plasticMaterial.setDiffuse(BABYLON.Color3.FromHexString("#f0dd0c"));
        plasticMaterial.setSpecularIntensity(0.1);
        plasticMaterial.setSpecularCount(1);
        plasticMaterial.setSpecularPower(2);
        let bowl = new Prop({
            name: "bowl",
            colliderIndex: 2,
            relativePos: new BABYLON.Vector3(0.4, 0, 0.4),
            offsetPos: new BABYLON.Vector3(0, 0.3, 0),
            flattenRadius: 1,
            terrarium: this
        });
        let water = new Prop({
            name: "bowl",
            index: 1,
            relativePos: new BABYLON.Vector3(0.4, 0, 0.4),
            offsetPos: new BABYLON.Vector3(0, 0.3, 0),
            terrarium: this
        });
        let bamboo = new Prop({
            name: "bamboo2",
            colliderIndex: 1,
            relativePos: new BABYLON.Vector3(0, 0.6, 0),
            offsetPos: new BABYLON.Vector3(0.2, 0, 0.2),
            relativeTargetUp: new BABYLON.Vector3(0, 0, 0.5),
            targetUpOffset: new BABYLON.Vector3(0.2, 0, 0),
            terrarium: this
        });
        let bamboo2 = new Prop({
            name: "bamboo",
            colliderIndex: 1,
            relativePos: new BABYLON.Vector3(1, 0.5, 0.3),
            offsetPos: new BABYLON.Vector3(-0.2, 0, 0),
            relativeTargetUp: new BABYLON.Vector3(0.7, 0, 0.3),
            terrarium: this
        });
        let rock = new Prop({
            name: "rock",
            colliderIndex: 1,
            relativePos: new BABYLON.Vector3(0.6, 0, 0.1),
            offsetPos: new BABYLON.Vector3(0, 0.3, 0),
            flattenRadius: 0.5,
            terrarium: this
        });
        let ronces = new Prop({
            name: "plant-3",
            colliderIndex: 1,
            relativePos: new BABYLON.Vector3(0, 0, 1),
            rotation: new BABYLON.Vector3(0, Math.PI / 2, 0),
            offsetPos: new BABYLON.Vector3(0, 0, 0),
            terrarium: this
        });
        let ronces2 = new Prop({
            name: "plant-3",
            colliderIndex: 1,
            relativePos: new BABYLON.Vector3(1, 0, 1),
            rotation: new BABYLON.Vector3(0, Math.PI, 0),
            offsetPos: new BABYLON.Vector3(0, 0, 0),
            terrarium: this
        });
        let logo = new Prop({
            name: "tiaratum-logo",
            colliderIndex: 1,
            relativePos: new BABYLON.Vector3(0.5, 1, 1),
            rotation: new BABYLON.Vector3(0, -Math.PI, 0),
            offsetPos: new BABYLON.Vector3(0, -0.1, 0),
            scaleOnWidth: true,
            terrarium: this
        });
        let waterMaterial = new ToonMaterial("water", this.game.scene);
        waterMaterial.setDiffuse(new BABYLON.Color3(0, 0.5, 1));
        waterMaterial.setAlpha(0.5);
        let logoMaterial = new ToonMaterial("logo", this.game.scene);
        logoMaterial.setDiffuse(BABYLON.Color3.FromHexString("#262b2a"));
        logoMaterial.setSpecularIntensity(0.5);
        logoMaterial.setSpecularCount(1);
        logoMaterial.setSpecularPower(16);
        logoMaterial.setUseLightFromPOV(true);
        logoMaterial.setUseFlatSpecular(true);
        this.props = [
            bowl,
            water,
            bamboo,
            bamboo2,
            rock,
            ronces,
            ronces2,
            logo
        ];
        water.material = waterMaterial;
        logo.material = logoMaterial;
    }
    get centerWidth() {
        return this.width - this.thickness;
    }
    get innerWidth() {
        return this.width - 2 * this.thickness;
    }
    get centerDepth() {
        return this.depth - this.thickness;
    }
    get innerDepth() {
        return this.depth - 2 * this.thickness;
    }
    get showFrontGlass() {
        return this.wallFront.isVisible && this.innerWallFront.isVisible;
    }
    set showFrontGlass(v) {
        this.wallFront.isVisible = v;
        this.innerWallFront.isVisible = v;
    }
    async instantiate() {
        for (let i = 0; i < this.props.length; i++) {
            await this.props[i].instantiate();
        }
    }
    async resize() {
        let area = this.depth * this.depth;
        let ratio = this.game.canvas.clientWidth / this.game.canvas.clientHeight;
        this.height = Math.sqrt(area / ratio);
        this.width = area / this.height;
        BABYLON.CreatePlaneVertexData({ width: this.innerDepth, height: this.height }).applyToMesh(this.innerWallLeft);
        this.innerWallLeft.position.x = -this.innerWidth * 0.5;
        this.innerWallLeft.position.y = this.height * 0.5;
        this.wallLeftCollider = Mummu.PlaneCollider.CreateFromBJSPlane(this.innerWallLeft);
        BABYLON.CreatePlaneVertexData({ width: this.innerWidth, height: this.height }).applyToMesh(this.innerWallBack);
        this.innerWallBack.position.z = this.innerDepth * 0.5;
        this.innerWallBack.position.y = this.height * 0.5;
        this.wallBackCollider = Mummu.PlaneCollider.CreateFromBJSPlane(this.innerWallBack);
        BABYLON.CreatePlaneVertexData({ width: this.innerDepth, height: this.height }).applyToMesh(this.innerWallRight);
        this.innerWallRight.position.x = this.innerWidth * 0.5;
        this.innerWallRight.position.y = this.height * 0.5;
        this.wallRightCollider = Mummu.PlaneCollider.CreateFromBJSPlane(this.innerWallRight);
        BABYLON.CreatePlaneVertexData({ width: this.innerWidth, height: this.height }).applyToMesh(this.innerWallFront);
        this.innerWallFront.position.z = -this.innerDepth * 0.5;
        this.innerWallFront.position.y = this.height * 0.5;
        this.wallFrontCollider = Mummu.PlaneCollider.CreateFromBJSPlane(this.innerWallFront);
        BABYLON.CreatePlaneVertexData({ width: this.depth, height: this.height }).applyToMesh(this.wallLeft);
        this.wallLeft.position.x = -this.width * 0.5;
        this.wallLeft.position.y = this.height * 0.5;
        BABYLON.CreatePlaneVertexData({ width: this.width, height: this.height }).applyToMesh(this.wallBack);
        this.wallBack.position.z = this.depth * 0.5;
        this.wallBack.position.y = this.height * 0.5;
        BABYLON.CreatePlaneVertexData({ width: this.depth, height: this.height }).applyToMesh(this.wallRight);
        this.wallRight.position.x = this.width * 0.5;
        this.wallRight.position.y = this.height * 0.5;
        BABYLON.CreatePlaneVertexData({ width: this.width, height: this.height }).applyToMesh(this.wallFront);
        this.wallFront.position.z = -this.depth * 0.5;
        this.wallFront.position.y = this.height * 0.5;
        let d = this.thickness;
        let dataBL = Mummu.CreateQuadVertexData({
            p1: new BABYLON.Vector3(-this.width * 0.5, 0, -this.innerDepth * 0.5 - d),
            p2: new BABYLON.Vector3(-this.innerWidth * 0.5, 0, -this.innerDepth * 0.5),
            p3: new BABYLON.Vector3(-this.innerWidth * 0.5, this.height, -this.innerDepth * 0.5),
            p4: new BABYLON.Vector3(-this.width * 0.5, this.height, -this.innerDepth * 0.5 - d),
            sideOrientation: 2
        });
        let dataFL = Mummu.CreateQuadVertexData({
            p1: new BABYLON.Vector3(-this.width * 0.5, 0, this.innerDepth * 0.5 + d),
            p2: new BABYLON.Vector3(-this.innerWidth * 0.5, 0, this.innerDepth * 0.5),
            p3: new BABYLON.Vector3(-this.innerWidth * 0.5, this.height, this.innerDepth * 0.5),
            p4: new BABYLON.Vector3(-this.width * 0.5, this.height, this.innerDepth * 0.5 + d),
            sideOrientation: 2
        });
        let dataFR = Mummu.CreateQuadVertexData({
            p1: new BABYLON.Vector3(this.innerWidth * 0.5, 0, this.innerDepth * 0.5),
            p2: new BABYLON.Vector3(this.width * 0.5, 0, this.innerDepth * 0.5 + d),
            p3: new BABYLON.Vector3(this.width * 0.5, this.height, this.innerDepth * 0.5 + d),
            p4: new BABYLON.Vector3(this.innerWidth * 0.5, this.height, this.innerDepth * 0.5),
            sideOrientation: 2
        });
        let dataBR = Mummu.CreateQuadVertexData({
            p1: new BABYLON.Vector3(this.innerWidth * 0.5, 0, -this.innerDepth * 0.5),
            p2: new BABYLON.Vector3(this.width * 0.5, 0, -this.innerDepth * 0.5 - d),
            p3: new BABYLON.Vector3(this.width * 0.5, this.height, -this.innerDepth * 0.5 - d),
            p4: new BABYLON.Vector3(this.innerWidth * 0.5, this.height, -this.innerDepth * 0.5),
            sideOrientation: 2
        });
        Mummu.MergeVertexDatas(dataBL, dataFL, dataFR, dataBR).applyToMesh(this.wallThickness);
        this.ground.flatten = [];
        for (let i = 0; i < this.props.length; i++) {
            let prop = this.props[i];
            prop.resize();
            if (prop.props.flattenRadius > 0) {
                this.ground.flatten.push({
                    p: new BABYLON.Vector2(prop.position.x, prop.position.z),
                    r: prop.props.flattenRadius
                });
            }
        }
        this.ground.resize();
        this.topLid.resize();
        let dist = 0.5 * this.height / (Math.tan(this.game.camera.fov * 0.5));
        this.game.camera.position.y = this.height * 0.5;
        this.game.camera.position.z = -this.depth * 0.5 - dist;
    }
}
function ShowOnlyColliders(terrarium) {
    for (let i = 0; i < terrarium.props.length; i++) {
        let prop = terrarium.props[i];
        prop.visibility = 0;
        if (prop.mummuCollider) {
            prop.mummuCollider.visibility = 1;
        }
    }
    terrarium.innerWallLeft.material = terrarium.colliderMaterial;
    terrarium.innerWallBack.material = terrarium.colliderMaterial;
    terrarium.innerWallRight.material = terrarium.colliderMaterial;
    terrarium.innerWallFront.material = terrarium.colliderMaterial;
}
async function InstantiateTerrarium(game) {
    game.terrarium = new Terrarium(game);
    game.terrarium.showFrontGlass = false;
    await game.terrarium.instantiate();
    await game.terrarium.resize();
    //ShowOnlyColliders(game.terrarium);
    let phasms = [];
    for (let i = 0; i < 2; i++) {
        let phasm = new Phasm(game);
        phasm.initialize();
        phasm.instantiate();
        phasm.setPosition(new BABYLON.Vector3(-1.5 + 3 * Math.random(), 0.5, -1.5 + 3 * Math.random()));
        phasms.push(phasm);
    }
    if (window.location.href.includes("127.0.0.1")) {
        let cameraControlAttached = false;
        document.addEventListener("keydown", (event) => {
            if (event.key === "s") {
                for (let i = 0; i < phasms.length; i++) {
                    phasms[i].controller.stop = !phasms[i].controller.stop;
                }
            }
            if (event.key === "z") {
                for (let i = 0; i < phasms.length; i++) {
                    phasms[i].controller.updateExplorerDestination();
                }
            }
            if (event.key === "c") {
                cameraControlAttached = !cameraControlAttached;
                if (cameraControlAttached) {
                    game.camera.attachControl();
                }
                else {
                    game.camera.detachControl();
                }
            }
        });
    }
}
class ToonMaterial extends BABYLON.ShaderMaterial {
    constructor(name, scene) {
        super(name, scene, {
            vertex: "toon",
            fragment: "toon",
        }, {
            attributes: ["position", "normal", "uv", "color"],
            uniforms: [
                "world", "worldView", "worldViewProjection", "view", "projection",
                "useVertexColor",
                "useLightFromPOV",
                "autoLight",
                "diffuseSharpness",
                "diffuse",
                "diffuseTexture",
                "viewPositionW",
                "viewDirectionW",
                "lightInvDirW",
                "alpha",
                "useFlatSpecular",
                "specularIntensity",
                "specularColor",
                "specularCount",
                "specularPower"
            ]
        });
        this._update = () => {
            let camera = this.getScene().activeCamera;
            let direction = camera.getForwardRay().direction;
            this.setVector3("viewPositionW", camera.position);
            this.setVector3("viewDirectionW", direction);
            let lights = this.getScene().lights;
            for (let i = 0; i < lights.length; i++) {
                let light = lights[i];
                if (light instanceof BABYLON.HemisphericLight) {
                    this.setVector3("lightInvDirW", light.direction);
                }
            }
        };
        this._useVertexColor = false;
        this._useLightFromPOV = false;
        this._autoLight = 0;
        this._diffuseSharpness = 0;
        this._diffuse = BABYLON.Color3.White();
        this._useFlatSpecular = false;
        this._specularIntensity = 0;
        this._specular = BABYLON.Color3.White();
        this._specularCount = 1;
        this._specularPower = 4;
        this._voidTexture = new BABYLON.Texture("./datas/textures/void-texture.png");
        this._voidTexture.wrapU = 1;
        this._voidTexture.wrapV = 1;
        this.updateUseVertexColor();
        this.updateUseLightFromPOV();
        this.updateAutoLight();
        this.updateDiffuseSharpness();
        this.updateDiffuse();
        this.updateDiffuseTexture();
        this.updateAlpha();
        this.updateUseFlatSpecular();
        this.updateSpecularIntensity();
        this.updateSpecular();
        this.updateSpecularCount();
        this.updateSpecularPower();
        this.setVector3("viewPositionW", BABYLON.Vector3.Zero());
        this.setVector3("viewDirectionW", BABYLON.Vector3.Up());
        this.setVector3("lightInvDirW", BABYLON.Vector3.Up());
        this.getScene().onBeforeRenderObservable.add(this._update);
    }
    dispose(forceDisposeEffect, forceDisposeTextures, notBoundToMesh) {
        super.dispose(forceDisposeEffect, forceDisposeTextures, notBoundToMesh);
        this.getScene().onBeforeRenderObservable.removeCallback(this._update);
    }
    get useVertexColor() {
        return this._useVertexColor;
    }
    setUseVertexColor(b) {
        this._useVertexColor = b;
        this.updateUseVertexColor();
    }
    updateUseVertexColor() {
        this.setInt("useVertexColor", this._useVertexColor ? 1 : 0);
    }
    get useLightFromPOV() {
        return this._useLightFromPOV;
    }
    setUseLightFromPOV(b) {
        this._useLightFromPOV = b;
        this.updateUseLightFromPOV();
    }
    updateUseLightFromPOV() {
        this.setInt("useLightFromPOV", this._useLightFromPOV ? 1 : 0);
    }
    get autoLight() {
        return this._autoLight;
    }
    setAutoLight(v) {
        this._autoLight = v;
        this.updateAutoLight();
    }
    updateAutoLight() {
        this.setFloat("autoLight", this._autoLight);
    }
    get diffuseSharpness() {
        return this._diffuseSharpness;
    }
    setDiffuseSharpness(v) {
        this._diffuseSharpness = v;
        this.updateDiffuseSharpness();
    }
    updateDiffuseSharpness() {
        this.setFloat("diffuseSharpness", this._diffuseSharpness);
    }
    get diffuse() {
        return this._diffuse;
    }
    setDiffuse(c) {
        this._diffuse = c;
        this.updateDiffuse();
    }
    updateDiffuse() {
        this.setColor3("diffuse", this._diffuse);
    }
    get diffuseTexture() {
        return this._diffuseTexture;
    }
    setDiffuseTexture(t) {
        this._diffuseTexture = t;
        this.updateDiffuseTexture();
    }
    updateDiffuseTexture() {
        if (this._diffuseTexture) {
            this.setTexture("diffuseTexture", this._diffuseTexture);
        }
        else {
            this.setTexture("diffuseTexture", this._voidTexture);
        }
    }
    get alpha() {
        return this._alpha;
    }
    setAlpha(v) {
        this._alpha = v;
        this.updateAlpha();
    }
    updateAlpha() {
        if (this.alpha != 1) {
            this.alphaMode = BABYLON.Material.MATERIAL_ALPHABLEND;
        }
        else {
            this.alphaMode = BABYLON.Material.MATERIAL_OPAQUE;
        }
        this.setFloat("alpha", this._alpha);
    }
    get useFlatSpecular() {
        return this._useFlatSpecular;
    }
    setUseFlatSpecular(b) {
        this._useFlatSpecular = b;
        this.updateUseFlatSpecular();
    }
    updateUseFlatSpecular() {
        this.setInt("useFlatSpecular", this._useFlatSpecular ? 1 : 0);
    }
    get specularIntensity() {
        return this._specularIntensity;
    }
    setSpecularIntensity(v) {
        this._specularIntensity = v;
        this.updateSpecularIntensity();
    }
    updateSpecularIntensity() {
        this.setFloat("specularIntensity", this._specularIntensity);
    }
    get specular() {
        return this._specular;
    }
    setSpecular(c) {
        this._specular = c;
        this.updateSpecular();
    }
    updateSpecular() {
        this.setColor3("specular", this._specular);
    }
    get specularCount() {
        return this._specularCount;
    }
    setSpecularCount(v) {
        this._specularCount = v;
        this.updateSpecularCount();
    }
    updateSpecularCount() {
        this.setFloat("specularCount", this._specularCount);
    }
    get specularPower() {
        return this._specularPower;
    }
    setSpecularPower(v) {
        this._specularPower = v;
        this.updateSpecularPower();
    }
    updateSpecularPower() {
        this.setFloat("specularPower", this._specularPower);
    }
}
class TopLid extends BABYLON.Mesh {
    constructor(terrarium) {
        super("top-lid");
        this.terrarium = terrarium;
        let plasticMaterial = new BABYLON.StandardMaterial("black-plastic");
        plasticMaterial.diffuseColor = BABYLON.Color3.FromHexString("#3b3b3b");
        plasticMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.material = plasticMaterial;
        this.cloth = new BABYLON.Mesh("cloth");
        let clothMaterial = new BABYLON.StandardMaterial("cloth");
        clothMaterial.diffuseColor.copyFromFloats(1, 1, 1);
        clothMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/top-lid-texture.png");
        clothMaterial.diffuseTexture.hasAlpha = true;
        clothMaterial.useAlphaFromDiffuseTexture = true;
        clothMaterial.emissiveColor.copyFromFloats(1, 1, 1);
        clothMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.cloth.material = clothMaterial;
    }
    async resize() {
        let dW = this.terrarium.centerWidth * 0.5 - 1;
        let dD = this.terrarium.centerDepth * 0.5 - 1;
        let vertexDatas = await this.terrarium.game.vertexDataLoader.get("./datas/meshes/top-frame.babylon");
        let data = Mummu.CloneVertexData(vertexDatas[0]);
        let positions = [...data.positions];
        for (let i = 0; i < positions.length / 3; i++) {
            let x = positions[3 * i];
            let z = positions[3 * i + 2];
            if (x > 0) {
                positions[3 * i] += dW;
            }
            else if (x < 0) {
                positions[3 * i] -= dW;
            }
            if (z > 0) {
                positions[3 * i + 2] += dD;
            }
            else if (z < 0) {
                positions[3 * i + 2] -= dD;
            }
        }
        data.positions = positions;
        data.applyToMesh(this);
        this.position.y = this.terrarium.height;
        this._resizeCloth();
    }
    _resizeCloth() {
        let data = new BABYLON.VertexData();
        let positions = [];
        let indices = [];
        let normals = [];
        let uvs = [];
        let cW = Math.round(this.terrarium.width * 5);
        let cD = Math.round(this.terrarium.depth * 5);
        let w = this.terrarium.width / cW;
        let d = this.terrarium.depth / cD;
        for (let j = 0; j <= cD; j++) {
            for (let i = 0; i <= cW; i++) {
                let dh = Math.min(Math.sin(i / cW * Math.PI), Math.sin(j / cD * Math.PI));
                let x = i * w - this.terrarium.width * 0.5;
                let y = -0.2 * dh;
                let z = this.terrarium.depth * 0.5 - j * d;
                let n = positions.length / 3;
                positions.push(x, y, z);
                normals.push(0, -1, 0);
                uvs.push(3 * i, 3 * j);
                if (i < cW && j < cD) {
                    indices.push(n, n + 1, n + 1 + (cW + 1));
                    indices.push(n, n + 1 + (cW + 1), n + (cW + 1));
                }
            }
        }
        data.positions = positions;
        data.indices = indices;
        data.normals = normals;
        data.uvs = uvs;
        data.applyToMesh(this.cloth);
        this.cloth.position.y = this.terrarium.height + 0.25;
    }
}
class Page {
    constructor(id, game) {
        this.id = id;
        this.game = game;
        this._shown = false;
        this.container = document.getElementById(id);
        this.container.style.opacity = "0";
        this.container.style.visibility = "hidden";
        this.container.style.pointerEvents = "none";
    }
    get shown() {
        return this._shown;
    }
    async show() {
        if (this.container.style.visibility != "visible") {
            return new Promise((resolve) => {
                let duration = 0.5;
                let updateNode = new BABYLON.Node("main-menu-update-node");
                let anim = Mummu.AnimationFactory.CreateNumber(updateNode, this.container.style, "opacity", undefined, undefined, Nabu.Easing.easeOutSquare);
                this.container.style.visibility = "visible";
                this.container.style.pointerEvents = "none";
                anim(1, duration).then(() => {
                    updateNode.dispose();
                    this.container.style.visibility = "visible";
                    this.container.style.pointerEvents = "auto";
                });
                document.getElementById("language-selection").style.display = "";
                setTimeout(() => {
                    resolve();
                    this._shown = true;
                }, duration * 1000);
            });
        }
    }
    async hide() {
        if (this.container.style.visibility != "hidden") {
            return new Promise((resolve) => {
                let duration = 0.5;
                let updateNode = new BABYLON.Node("main-menu-update-node");
                let anim = Mummu.AnimationFactory.CreateNumber(updateNode, this.container.style, "opacity", undefined, undefined, Nabu.Easing.easeOutSquare);
                this.container.style.visibility = "visible";
                this.container.style.pointerEvents = "none";
                anim(0, duration).then(() => {
                    updateNode.dispose();
                    this.container.style.visibility = "hidden";
                    this.container.style.pointerEvents = "none";
                });
                setTimeout(() => {
                    resolve();
                    this._shown = true;
                }, duration * 1000);
            });
        }
    }
}
/// <reference path="Page.ts"/>
class MainMenu extends Page {
    constructor(id, game) {
        super(id, game);
        this.xCount = 1;
        this.yCount = 1;
        this.panels = [];
        this.container.style.opacity = "";
        this.container.style.visibility = "";
        this.container.style.pointerEvents = "";
    }
    async show() {
        if (this._shown) {
            return;
        }
        return new Promise(resolve => {
            this._shown = true;
            let duration = 0.5;
            for (let i = 0; i < this.panels.length; i++) {
                let panel = this.panels[i];
                if (panel) {
                    if (panel.element.style.visibility != "visible") {
                        let updateNode = new BABYLON.Node("main-menu-update-node");
                        let anim = Mummu.AnimationFactory.CreateNumber(updateNode, panel, "left", undefined, undefined, Nabu.Easing.easeOutSquare);
                        panel.element.style.visibility = "visible";
                        panel.element.style.pointerEvents = "none";
                        let targetLeft = 2 * this.game.engine.getRenderWidth();
                        if (panel.y % 2 != this.yCount % 2) {
                            targetLeft = -targetLeft;
                        }
                        panel.left = targetLeft + panel.computedLeft;
                        anim(panel.computedLeft, duration).then(() => {
                            updateNode.dispose();
                            panel.element.style.visibility = "visible";
                            panel.element.style.pointerEvents = "auto";
                        });
                    }
                }
            }
            setTimeout(() => {
                resolve();
                this._shown = true;
            }, duration * 1000);
        });
    }
    async hide() {
        if (!this._shown) {
            return;
        }
        return new Promise(resolve => {
            this._shown = false;
            let duration = 0.5;
            for (let i = 0; i < this.panels.length; i++) {
                let panel = this.panels[i];
                if (panel) {
                    if (panel.element.style.visibility != "hidden") {
                        let updateNode = new BABYLON.Node("main-menu-update-node");
                        let anim = Mummu.AnimationFactory.CreateNumber(updateNode, panel, "left", undefined, undefined, Nabu.Easing.easeInSquare);
                        panel.element.style.visibility = "visible";
                        let targetLeft = 2 * this.game.engine.getRenderWidth();
                        if (panel.y % 2 != this.yCount % 2) {
                            targetLeft = -targetLeft;
                        }
                        anim(targetLeft + panel.computedLeft, duration).then(() => {
                            updateNode.dispose();
                            panel.element.style.visibility = "hidden";
                            panel.element.style.pointerEvents = "none";
                        });
                    }
                }
            }
            setTimeout(() => {
                resolve();
                this._shown = false;
            }, duration * 1000);
        });
    }
    resize() {
        let requestedTileCount = 0;
        let requestedFullLines = 0;
        for (let i = 0; i < this.panels.length; i++) {
            if (this.panels[i].props.fullLine) {
                requestedFullLines++;
            }
            else {
                requestedTileCount += this.panels[i].area;
            }
        }
        let rect = this.container.getBoundingClientRect();
        let containerW = rect.width;
        let containerH = rect.height;
        let min = 0;
        let ok = false;
        while (!ok) {
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
            console.log("test " + this.xCount + " " + this.yCount);
            let grid = [];
            for (let y = 0; y <= this.yCount; y++) {
                grid[y] = [];
                for (let x = 0; x <= this.xCount; x++) {
                    grid[y][x] = (x < this.xCount && y < this.yCount);
                }
            }
            for (let n = 0; n < this.panels.length; n++) {
                let panel = this.panels[n];
                if (panel.props.fullLine) {
                    panel.props.width = this.xCount;
                }
                panel.x = -1;
                panel.y = -1;
                if (panel.props.fromBottomRight) {
                    for (let line = this.yCount - 1; line >= 0 && panel.x === -1; line--) {
                        for (let col = this.xCount; col >= 0 && panel.x === -1; col--) {
                            let fit = true;
                            for (let x = 0; x < panel.props.width; x++) {
                                for (let y = 0; y < panel.props.height; y++) {
                                    fit = fit && grid[line + y][col + x];
                                }
                            }
                            if (fit) {
                                panel.x = col;
                                panel.y = line;
                                for (let x = 0; x < panel.props.width; x++) {
                                    for (let y = 0; y < panel.props.height; y++) {
                                        grid[line + y][col + x] = false;
                                    }
                                }
                            }
                        }
                    }
                }
                else {
                    for (let line = 0; line < this.yCount && panel.x === -1; line++) {
                        for (let col = 0; col < this.xCount && panel.x === -1; col++) {
                            let fit = true;
                            for (let x = 0; x < panel.props.width; x++) {
                                for (let y = 0; y < panel.props.height; y++) {
                                    fit = fit && grid[line + y][col + x];
                                }
                            }
                            if (fit) {
                                panel.x = col;
                                panel.y = line;
                                for (let x = 0; x < panel.props.width; x++) {
                                    for (let y = 0; y < panel.props.height; y++) {
                                        grid[line + y][col + x] = false;
                                    }
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
                console.warn("error, can't find a way to make a menu layout");
            }
            else {
                console.log("now it's ok");
            }
        }
        let tileW = containerW / this.xCount;
        let tileH = containerH / this.yCount;
        let m = Math.min(tileW, tileH) / 30;
        this.container.innerHTML = "";
        for (let i = 0; i < this.panels.length; i++) {
            let panel = this.panels[i];
            if (!panel.element) {
                if (panel.props.href) {
                    panel.element = document.createElement("a");
                    panel.element.setAttribute("href", panel.props.href);
                    if (panel.props.target) {
                        panel.element.setAttribute("target", panel.props.target);
                    }
                }
                else {
                    panel.element = document.createElement("div");
                }
                panel.element.classList.add("panel");
            }
            if (panel.props.selectable) {
                panel.element.classList.add("selectable");
            }
            panel.element.style.fontSize = (tileH / 16).toFixed(1) + "px";
            if (panel.props.title instanceof LocalizedText) {
                panel.element.innerHTML = '<span class="title">' + panel.props.title.get(this.game.lang) + '</span>';
            }
            else if (panel.props.title) {
                panel.element.innerHTML = '<span class="title">' + panel.props.title + '</span>';
            }
            this.container.appendChild(panel.element);
            if (panel.props.paragraphs) {
                for (let j = 0; j < panel.props.paragraphs.length; j++) {
                    let text = panel.props.paragraphs[j];
                    let p = document.createElement("p");
                    p.classList.add("text");
                    if (text instanceof LocalizedText) {
                        p.innerHTML = text.get(this.game.lang);
                    }
                    else {
                        p.innerHTML = text;
                    }
                    panel.element.appendChild(p);
                }
            }
            if (panel.props.children) {
                for (let j = 0; j < panel.props.children.length; j++) {
                    panel.element.innerHTML += panel.props.children[j];
                }
            }
            panel.element.style.display = "block";
            panel.element.style.width = (panel.props.width * tileW - 2 * m).toFixed(0) + "px";
            panel.element.style.height = (panel.props.height * tileH - 2 * m).toFixed(0) + "px";
            panel.element.style.position = "absolute";
            panel.computedLeft = (panel.x * tileW + m);
            if (panel.element.style.display != "none") {
                panel.element.style.left = panel.computedLeft.toFixed(0) + "px";
            }
            panel.computedTop = (panel.y * tileH + m);
            panel.element.style.top = panel.computedTop.toFixed(0) + "px";
            if (panel.props.backgroundUrl) {
                panel.element.style.backgroundImage = "url(" + panel.props.backgroundUrl + ")";
            }
            if (panel.props.onClick) {
                panel.element.onclick = panel.props.onClick;
            }
            if (!this.shown) {
                panel.element.style.visibility = "hidden";
                panel.element.style.pointerEvents = "none";
            }
        }
        /*
        let n = demoButtons.length;

        let buttonCreate = this.container.querySelector(".panel.create") as HTMLDivElement;
        buttonCreate.style.display = "block";
        buttonCreate.style.width = (2 * tileW - 2 * m).toFixed(0) + "px";
        buttonCreate.style.height = (tileH - 2 * m).toFixed(0) + "px";
        buttonCreate.style.position = "absolute";
        buttonCreate.style.left = m.toFixed(0) + "px";
        buttonCreate.style.top = m.toFixed(0) + "px";
        buttonCreate.style.backgroundImage = "url(./datas/icons/create.png)"
        buttonCreate.style.backgroundPosition = "bottom right"

        let buttonOption = this.container.querySelector(".panel.option") as HTMLDivElement;
        buttonOption.style.display = "block";
        buttonOption.style.width = (tileW - 2 * m).toFixed(0) + "px";
        buttonOption.style.height = (tileH * 0.5 - 2 * m).toFixed(0) + "px";
        buttonOption.style.position = "absolute";
        buttonOption.style.right = (m).toFixed(0) + "px";
        buttonOption.style.bottom = (0.5 * tileH + m).toFixed(0) + "px";

        let buttonCredit = this.container.querySelector(".panel.credit") as HTMLDivElement;
        buttonCredit.style.display = "block";
        buttonCredit.style.width = (tileW - 2 * m).toFixed(0) + "px";
        buttonCredit.style.height = (tileH * 0.5 - 2 * m).toFixed(0) + "px";
        buttonCredit.style.position = "absolute";
        buttonCredit.style.right = (m).toFixed(0) + "px";
        buttonCredit.style.bottom = m.toFixed(0) + "px";
        */
    }
}
class MainMenuPanel {
    constructor(mainMenu, props) {
        this.mainMenu = mainMenu;
        this.props = props;
        this.x = 0;
        this.y = 0;
        this.computedTop = 0;
        this.computedLeft = 0;
        if (!this.props) {
            this.props = {};
        }
        if (!this.props.title) {
            this.props.title = "";
        }
        if (!isFinite(this.props.width)) {
            this.props.width = 1;
        }
        if (!isFinite(this.props.height)) {
            this.props.height = 1;
        }
    }
    get area() {
        return this.props.width * this.props.height;
    }
    get top() {
        if (!this.element) {
            return 0;
        }
        return parseFloat(this.element.style.top);
    }
    set top(v) {
        if (this.element) {
            this.element.style.top = v.toFixed(1) + "px";
        }
    }
    get left() {
        if (!this.element) {
            return 0;
        }
        return parseFloat(this.element.style.left);
    }
    set left(v) {
        if (this.element) {
            this.element.style.left = v.toFixed(1) + "px";
        }
    }
    get title() {
        return this.props.title;
    }
    set title(s) {
        this.props.title = s;
        if (this.element) {
            let titleElement = this.element.querySelector("span.title");
            if (titleElement) {
                if (this.props.title instanceof LocalizedText) {
                    titleElement.innerHTML = this.props.title.get(this.mainMenu.game.lang);
                }
                else if (this.props.title) {
                    titleElement.innerHTML = this.props.title;
                }
            }
        }
    }
}
