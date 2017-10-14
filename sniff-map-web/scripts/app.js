class Building extends BABYLON.Mesh {
    constructor(scene) {
        super("Building", scene);
        Building.instances.push(this);
        this.material = Main.okMaterial;
    }
    Dispose() {
        let index = Building.instances.indexOf(this);
        if (index !== -1) {
            Building.instances.splice(index, 1);
        }
        this.dispose();
    }
    static Clear() {
        while (Building.instances.length > 0) {
            Building.instances[0].Dispose();
        }
    }
}
Building.instances = [];
class BuildingData {
    constructor() {
        this.coordinates = BABYLON.Vector2.Zero();
        this.shape = [];
        this.level = 1;
    }
    pushNode(node) {
        this.coordinates.scaleInPlace(this.shape.length);
        this.shape.push(node);
        this.coordinates.addInPlace(node);
        this.coordinates.scaleInPlace(1 / this.shape.length);
    }
    instantiate(scene) {
        let building = new Building(scene);
        building.coordinates = this.coordinates.clone();
        let data = BuildingData.extrudeToSolid(this.shape, this.level * 0.2 + 0.1 * Math.random());
        data.applyToMesh(building);
        building.freezeWorldMatrix();
        return building;
    }
    static extrudeToSolid(points, height) {
        let data = new BABYLON.VertexData();
        let positions = [];
        let indices = [];
        for (let i = 0; i < points.length; i++) {
            positions.push(points[i].x, height, points[i].y);
        }
        for (let i = 0; i < points.length; i++) {
            positions.push(points[i].x, 0, points[i].y);
        }
        for (let i = 0; i < points.length; i++) {
            let a = i + points.length;
            let b = i + points.length + 1;
            if (i === points.length - 1) {
                b = points.length;
            }
            let c = i + 1;
            if (i === points.length - 1) {
                c = 0;
            }
            let d = i;
            indices.push(a, b, c);
            indices.push(a, c, d);
        }
        let topPoints = [];
        for (let i = 0; i < points.length; i++) {
            topPoints.push(points[i].x, points[i].y);
        }
        indices.push(...Earcut.earcut(topPoints, [], 2));
        data.positions = positions;
        data.indices = indices;
        return data;
    }
}
class BuildingMaker {
    constructor() {
        this.stepInstantiate = () => {
            let t0 = (new Date()).getTime();
            let t1 = t0;
            if (this.toDoList.length > 0) {
                console.log(".");
            }
            while (this.toDoList.length > 0 && (t1 - t0) < 10) {
                let data = this.toDoList.pop();
                data.instantiate(Main.instance.scene);
                t1 = (new Date()).getTime();
            }
            if (this.toDoList.length === 0) {
                Failure.update();
            }
        };
        this.toDoList = [];
        Main.instance.scene.registerBeforeRender(this.stepInstantiate);
    }
}
var CameraState;
(function (CameraState) {
    CameraState[CameraState["global"] = 0] = "global";
    CameraState[CameraState["ready"] = 1] = "ready";
    CameraState[CameraState["transition"] = 2] = "transition";
    CameraState[CameraState["local"] = 3] = "local";
})(CameraState || (CameraState = {}));
class CameraManager {
    constructor() {
        this.state = CameraState.global;
        this.k = 0;
        this.duration = 120;
        this.fromPosition = BABYLON.Vector3.Zero();
        this.toPosition = BABYLON.Vector3.Zero();
        this.fromTarget = BABYLON.Vector3.Zero();
        this.toTarget = BABYLON.Vector3.Zero();
        this.tmpPosition = BABYLON.Vector3.Zero();
        this.tmpTarget = BABYLON.Vector3.Zero();
        this.transitionStep = () => {
            this.k++;
            this.tmpPosition.x = this.fromPosition.x * (1 - this.k / this.duration) + this.toPosition.x * this.k / this.duration;
            this.tmpPosition.y = this.fromPosition.y * (1 - this.k / this.duration) + this.toPosition.y * this.k / this.duration;
            this.tmpPosition.z = this.fromPosition.z * (1 - this.k / this.duration) + this.toPosition.z * this.k / this.duration;
            this.tmpTarget.x = this.fromTarget.x * (1 - this.k / this.duration) + this.toTarget.x * this.k / this.duration;
            this.tmpTarget.y = this.fromTarget.y * (1 - this.k / this.duration) + this.toTarget.y * this.k / this.duration;
            this.tmpTarget.z = this.fromTarget.z * (1 - this.k / this.duration) + this.toTarget.z * this.k / this.duration;
            Main.instance.camera.setPosition(this.tmpPosition);
            Main.instance.camera.setTarget(this.tmpTarget);
            if (this.k >= this.duration) {
                Main.instance.scene.unregisterBeforeRender(this.transitionStep);
                if (this.onTransitionDone) {
                    this.onTransitionDone();
                }
            }
        };
    }
    goToLocal(target) {
        if (this.state !== CameraState.ready) {
            return;
        }
        this.state = CameraState.transition;
        this.fromPosition.copyFrom(Main.instance.camera.position);
        this.toPosition.copyFrom(target);
        let direction = new BABYLON.Vector3(-3, 5, -4);
        direction.normalize();
        direction.scaleInPlace(20);
        this.toPosition.addInPlace(direction);
        this.fromTarget.copyFrom(Main.instance.camera.target);
        this.toTarget.copyFrom(target);
        this.onTransitionDone = () => {
            this.state = CameraState.local;
            Main.instance.camera.useAutoRotationBehavior = true;
            Main.instance.camera.autoRotationBehavior.idleRotationWaitTime = 500;
            Main.instance.camera.autoRotationBehavior.idleRotationSpinupTime = 2000;
        };
        this.k = 0;
        Main.instance.scene.registerBeforeRender(this.transitionStep);
    }
    goToGlobal() {
        if (this.state !== CameraState.local) {
            return;
        }
        this.state = CameraState.transition;
        this.fromPosition.copyFrom(Main.instance.camera.position);
        this.toPosition.copyFrom(new BABYLON.Vector3(-1000, 1000, -1000));
        this.fromTarget.copyFrom(Main.instance.camera.target);
        this.toTarget.copyFromFloats(0, 0, 0);
        this.onTransitionDone = () => {
            this.state = CameraState.global;
            Main.instance.camera.useAutoRotationBehavior = false;
        };
        this.k = 0;
        Main.instance.scene.registerBeforeRender(this.transitionStep);
    }
}
class Failure {
    constructor(origin, range) {
        Failure.instances.push(this);
        this.origin = origin.clone();
        this.sqrRange = range * range;
        let debugSphere = BABYLON.MeshBuilder.CreateSphere("Sphere", {
            diameter: 2 * range
        }, Main.instance.scene);
        debugSphere.position.x = origin.x;
        debugSphere.position.z = origin.y;
        debugSphere.material = Main.failureMaterial;
    }
    static update() {
        Building.instances.forEach((b) => {
            b.material = Main.okMaterial;
            Failure.instances.forEach((f) => {
                if (BABYLON.Vector2.DistanceSquared(b.coordinates, f.origin) < f.sqrRange) {
                    b.material = Main.nokMaterial;
                }
            });
        });
    }
}
Failure.instances = [];
class GroundManager {
    constructor(w, h) {
        this.k = 0;
        this.duration = 120;
        this.transitionStepToGlobal = () => {
            this.k++;
            this.localGround.visibility = (1 - this.k / this.duration);
            this.globalGround.visibility = this.k / this.duration;
            Main.failureMaterial.alpha = this.k / this.duration;
            if (this.k >= this.duration) {
                Main.instance.scene.unregisterBeforeRender(this.transitionStepToGlobal);
            }
        };
        this.transitionStepToLocal = () => {
            this.k++;
            this.localGround.visibility = this.k / this.duration;
            this.globalGround.visibility = 1 - this.k / this.duration;
            Main.failureMaterial.alpha = 1 - this.k / this.duration;
            if (this.k >= this.duration) {
                Main.instance.scene.unregisterBeforeRender(this.transitionStepToLocal);
            }
        };
        this.globalGround = BABYLON.MeshBuilder.CreateGround("GlobalGround", { width: w, height: h }, Main.instance.scene);
        let groundMaterial = new BABYLON.StandardMaterial("GroundMaterial", Main.instance.scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("./data/map.png", Main.instance.scene);
        groundMaterial.specularColor.copyFromFloats(0.2, 0.2, 0.2);
        this.globalGround.material = groundMaterial;
        this.localGround = BABYLON.MeshBuilder.CreateDisc("LocalGround", { radius: 1 }, Main.instance.scene);
        this.localGround.rotation.x = Math.PI / 2;
        this.localGround.position.y = -0.05;
        this.localGround.scaling.copyFromFloats(20, 20, 20);
        let localGroundMaterial = new BABYLON.StandardMaterial("LocalGroundMaterial", Main.instance.scene);
        localGroundMaterial.diffuseColor.copyFromFloats(0.6, 0.6, 0.6);
        localGroundMaterial.specularColor.copyFromFloats(0.2, 0.2, 0.2);
        this.localGround.material = localGroundMaterial;
    }
    toLocalGround(target) {
        this.k = 0;
        this.localGround.position.x = target.x;
        this.localGround.position.z = target.z;
        Main.instance.scene.registerBeforeRender(this.transitionStepToLocal);
    }
    toGlobalGround() {
        this.k = 0;
        Main.instance.scene.registerBeforeRender(this.transitionStepToGlobal);
    }
}
class Main {
    constructor(canvasElement) {
        Main.instance = this;
        Main.medLon = (Main.minLon + Main.maxLon) / 2;
        Main.medLat = (Main.minLat + Main.maxLat) / 2;
        Main.medX = Tools.LonToX(Main.medLon);
        Main.medZ = Tools.LatToZ(Main.medLat);
        console.log("MedX " + Main.medX);
        console.log("MedZ " + Main.medZ);
        this.canvas = document.getElementById(canvasElement);
        this.engine = new BABYLON.Engine(this.canvas, true);
        BABYLON.Engine.ShadersRepository = "./shaders/";
    }
    createScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor.copyFromFloats(0, 0, 0, 1);
        this.resize();
        this.buildingMaker = new BuildingMaker();
        let hemisphericLight = new BABYLON.HemisphericLight("Light", BABYLON.Vector3.Up(), this.scene);
        this.light = hemisphericLight;
        this.camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 1, BABYLON.Vector3.Zero(), this.scene);
        this.camera.attachControl(this.canvas);
        this.camera.setPosition(new BABYLON.Vector3(-1000, 1000, -1000));
        this.cameraManager = new CameraManager();
        Main.okMaterial = new BABYLON.StandardMaterial("Random", this.scene);
        Main.okMaterial.diffuseColor = BABYLON.Color3.FromHexString("#42c8f4");
        Main.okMaterial.backFaceCulling = false;
        Main.nokMaterial = new BABYLON.StandardMaterial("Random", this.scene);
        Main.nokMaterial.diffuseColor = BABYLON.Color3.FromHexString("#f48042");
        Main.nokMaterial.backFaceCulling = false;
        Main.failureMaterial = new BABYLON.StandardMaterial("Random", this.scene);
        Main.failureMaterial.diffuseColor = BABYLON.Color3.FromHexString("#f48042");
        Main.failureMaterial.backFaceCulling = false;
        this.ui = new UI();
        let poc = new Poc();
        let h = Tools.LatToZ(Main.maxLat) - Tools.LatToZ(Main.minLat);
        let w = Tools.LonToX(Main.maxLon) - Tools.LonToX(Main.minLon);
        this.groundManager = new GroundManager(h, w);
        new Failure(new BABYLON.Vector2(Tools.LonToX(7.76539), Tools.LatToZ(48.581)), 5);
        BABYLON.SceneLoader.ImportMesh("", "http://svenfrankson.github.io/duck.babylon", "", this.scene, (meshes) => {
            meshes[0].position.x -= 1;
            meshes[0].position.z += 1.5;
            meshes[0].position.y = 0.3;
            this.scene.registerBeforeRender(() => {
                meshes[0].rotation.y += 0.01;
            });
        });
        let bottomLeft = BABYLON.MeshBuilder.CreateBox("Cube", { size: 10 }, this.scene);
        bottomLeft.position.x = Tools.LonToX(Main.minLon);
        bottomLeft.position.z = Tools.LatToZ(Main.minLat);
        console.log("BottomLeft " + bottomLeft.position);
        let topLeft = BABYLON.MeshBuilder.CreateBox("Cube", { size: 10 }, this.scene);
        topLeft.position.x = Tools.LonToX(Main.minLon);
        topLeft.position.z = Tools.LatToZ(Main.maxLat);
        let topRight = BABYLON.MeshBuilder.CreateBox("Cube", { size: 10 }, this.scene);
        topRight.position.x = Tools.LonToX(Main.maxLon);
        topRight.position.z = Tools.LatToZ(Main.maxLat);
        console.log("TopRight " + topRight.position);
        let bottomRight = BABYLON.MeshBuilder.CreateBox("Cube", { size: 10 }, this.scene);
        bottomRight.position.x = Tools.LonToX(Main.maxLon);
        bottomRight.position.z = Tools.LatToZ(Main.minLat);
        this.scene.onPointerObservable.add((eventData, eventState) => {
            if (eventData.type === BABYLON.PointerEventTypes._POINTERUP) {
                let pickingInfo = this.scene.pick(this.scene.pointerX, this.scene.pointerY, (m) => {
                    return m === this.groundManager.globalGround;
                });
                if (pickingInfo.hit && this.cameraManager.state === CameraState.global) {
                    this.cameraManager.state = CameraState.ready;
                    let lon = Tools.XToLon(pickingInfo.pickedPoint.x);
                    let lat = Tools.ZToLat(pickingInfo.pickedPoint.z);
                    Building.Clear();
                    poc.getDataAt(lon, lat, () => {
                        this.cameraManager.goToLocal(pickingInfo.pickedPoint);
                        this.groundManager.toLocalGround(pickingInfo.pickedPoint);
                        for (let i = -1; i <= 1; i++) {
                            for (let j = -1; j <= 1; j++) {
                                if (i !== j) {
                                    poc.getDataAt(lon + i * poc.tileSize * 2, lat + j * poc.tileSize * 2, () => {
                                    });
                                }
                            }
                        }
                    });
                }
            }
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
}
Main.minLon = 7.1665596;
Main.maxLon = 8.1771085;
Main.minLat = 48.3614766;
Main.maxLat = 49.0194274;
Main.medX = 0;
Main.medZ = 0;
window.addEventListener("DOMContentLoaded", () => {
    let game = new Main("render-canvas");
    game.createScene();
    game.animate();
});
class Poc {
    constructor() {
        this.tileSize = 0.002;
    }
    getDataAt(long, lat, callback) {
        let box = (long - this.tileSize).toFixed(7) + "," + (lat - this.tileSize).toFixed(7) + "," + (long + this.tileSize).toFixed(7) + "," + (lat + this.tileSize).toFixed(7);
        let url = "http://api.openstreetmap.org/api/0.6/map?bbox=" + box;
        $.ajax({
            url: url,
            success: (data) => {
                let mapNodes = new Map();
                let root = data.firstElementChild;
                let nodes = root.children;
                for (let i = 0; i < nodes.length; i++) {
                    if (nodes[i].tagName === "node") {
                        let id = parseInt(nodes[i].id);
                        let lLat = parseFloat(nodes[i].getAttribute("lat"));
                        let lLong = parseFloat(nodes[i].getAttribute("lon"));
                        let coordinates = new BABYLON.Vector2(lLong, lLat);
                        coordinates.x = Tools.LonToX(lLong);
                        coordinates.y = Tools.LatToZ(lLat);
                        mapNodes.set(id, coordinates);
                    }
                    if (nodes[i].tagName === "way") {
                        let itsBuilding = false;
                        let level = 1;
                        let nodeIChildren = nodes[i].children;
                        for (let j = 0; j < nodeIChildren.length; j++) {
                            if (nodeIChildren[j].tagName === "tag") {
                                if (nodeIChildren[j].hasAttribute("k")) {
                                    if (nodeIChildren[j].getAttribute("k") === "building") {
                                        itsBuilding = true;
                                    }
                                    if (nodeIChildren[j].getAttribute("k") === "building:levels") {
                                        level = parseInt(nodeIChildren[j].getAttribute("v"));
                                    }
                                }
                            }
                        }
                        if (itsBuilding) {
                            let newBuilding = new BuildingData();
                            newBuilding.level = level;
                            for (let j = 0; j < nodeIChildren.length; j++) {
                                if (nodeIChildren[j].tagName === "nd") {
                                    let nodeRef = parseInt(nodeIChildren[j].getAttribute("ref"));
                                    let node = mapNodes.get(nodeRef);
                                    newBuilding.pushNode(node);
                                }
                            }
                            Main.instance.buildingMaker.toDoList.push(newBuilding);
                        }
                    }
                }
                if (callback) {
                    callback();
                }
            },
            error: () => {
                console.log("Error");
            }
        });
    }
}
var RAD2DEG = 180 / Math.PI;
var PI_4 = Math.PI / 4;
class Tools {
    static LonToX(lon) {
        return lon * 1000 - Main.medX;
    }
    static LatToZ(lat) {
        return Math.log(Math.tan((lat / 90 + 1) * PI_4)) * RAD2DEG * 1000 - Main.medZ;
    }
    static XToLon(x) {
        return (x + Main.medX) / 1000;
    }
    static ZToLat(z) {
        return (Math.atan(Math.exp((z + Main.medZ) / 1000 / RAD2DEG)) / PI_4 - 1) * 90;
    }
}
class UI {
    constructor() {
        this.texture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.back = BABYLON.GUI.Button.CreateSimpleButton("Back", "Back");
        this.back.left = -0.95;
        this.back.top = -0.95;
        this.back.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.back.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.back.width = 0.1;
        this.back.height = 0.1;
        this.back.background = "black";
        this.back.color = "white";
        this.back.onPointerUpObservable.add(() => {
            if (Main.instance.cameraManager.state === CameraState.local) {
                Main.instance.cameraManager.goToGlobal();
                Main.instance.groundManager.toGlobalGround();
            }
        });
        this.texture.addControl(this.back);
    }
}
