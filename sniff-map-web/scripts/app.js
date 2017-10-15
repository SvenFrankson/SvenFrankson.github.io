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
    static UpdateCenterAndRadius() {
        if (Building.instances.length === 0) {
            return;
        }
        let minX = Infinity;
        let maxX = -Infinity;
        let minZ = Infinity;
        let maxZ = -Infinity;
        Building.instances.forEach((b) => {
            minX = Math.min(minX, b.c.x);
            minZ = Math.min(minZ, b.c.y);
            maxX = Math.max(maxX, b.c.x);
            maxZ = Math.max(maxZ, b.c.y);
        });
        Building.center.x = (minX + maxX) / 2;
        Building.center.z = (minZ + maxZ) / 2;
        Building.radius = Math.max(maxZ - minZ, maxX - minX);
        let lon = Tools.XToLon(Building.center.x);
        let lat = Tools.ZToLat(Building.center.z);
        Main.instance.groundManager.localGround.position.copyFrom(Building.center);
        Main.instance.groundManager.localGround.scaling.copyFromFloats(Building.radius, Building.radius, Building.radius);
    }
}
Building.instances = [];
Building.center = BABYLON.Vector3.Zero();
Building.radius = 10;
class BuildingData {
    constructor() {
        this.c = BABYLON.Vector2.Zero();
        this.s = [];
        this.l = 1;
    }
    pushNode(node) {
        this.c.scaleInPlace(this.s.length);
        this.s.push(node);
        this.c.addInPlace(node);
        this.c.scaleInPlace(1 / this.s.length);
    }
    static instantiateBakeMany(data, scene) {
        if (data.length === 0) {
            return undefined;
        }
        let rawData = BuildingData.extrudeToSolidRaw(data[0].s, data[0].l * 0.3 + 0.15 * Math.random());
        let vCount = rawData.positions.length / 3;
        for (let i = 1; i < data.length; i++) {
            let otherRawData = BuildingData.extrudeToSolidRaw(data[i].s, data[i].l * 0.3 + 0.15 * Math.random());
            for (let j = 0; j < otherRawData.indices.length; j++) {
                otherRawData.indices[j] += vCount;
            }
            vCount += otherRawData.positions.length / 3;
            rawData.positions.push(...otherRawData.positions);
            rawData.indices.push(...otherRawData.indices);
            rawData.colors.push(...otherRawData.colors);
        }
        let building = new Building(scene);
        building.c = data[0].c.clone();
        let vertexData = new BABYLON.VertexData();
        vertexData.positions = rawData.positions;
        vertexData.indices = rawData.indices;
        vertexData.colors = rawData.colors;
        vertexData.applyToMesh(building);
        building.freezeWorldMatrix();
        return building;
    }
    instantiate(scene) {
        let building = new Building(scene);
        building.c = this.c.clone();
        let data = BuildingData.extrudeToSolid(this.s, this.l * 0.3 + 0.15 * Math.random());
        data.applyToMesh(building);
        building.freezeWorldMatrix();
        return building;
    }
    static extrudeToSolidRaw(points, height) {
        let positions = [];
        let indices = [];
        let colors = [];
        let colorTop = BABYLON.Color4.FromHexString("#FFFFFFFF");
        let colorBottom = BABYLON.Color4.FromHexString("#A0A0A0FF");
        for (let i = 0; i < points.length; i++) {
            positions.push(points[i].x, height, points[i].y);
            colors.push(colorTop.r, colorTop.g, colorTop.b, colorTop.a);
        }
        for (let i = 0; i < points.length; i++) {
            positions.push(points[i].x, 0, points[i].y);
            colors.push(colorBottom.r, colorBottom.g, colorBottom.b, colorBottom.a);
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
        return {
            positions: positions,
            indices: indices,
            colors: colors
        };
    }
    static extrudeToSolid(points, height) {
        let data = new BABYLON.VertexData();
        let rawData = BuildingData.extrudeToSolidRaw(points, height);
        data.positions = rawData.positions;
        data.indices = rawData.indices;
        data.colors = rawData.colors;
        return data;
    }
}
BuildingData.instances = [];
class BuildingMaker {
    constructor() {
        this.stepInstantiate = () => {
            let t0 = (new Date()).getTime();
            let t1 = t0;
            let work = false;
            if (this.toDoList.length > 0) {
                work = true;
            }
            while (this.toDoList.length > 0 && (t1 - t0) < 10) {
                if (this.toDoList.length > 4) {
                    let data0 = this.toDoList.pop();
                    let data1 = this.toDoList.pop();
                    let data2 = this.toDoList.pop();
                    let data3 = this.toDoList.pop();
                    let data4 = this.toDoList.pop();
                    BuildingData.instantiateBakeMany([data0, data1, data2, data3, data4], Main.instance.scene);
                    t1 = (new Date()).getTime();
                }
                else {
                    let data = this.toDoList.pop();
                    data.instantiate(Main.instance.scene);
                    t1 = (new Date()).getTime();
                }
            }
            if (work && this.toDoList.length === 0) {
                Failure.update();
            }
        };
        this.toDoList = [];
        Main.instance.scene.registerBeforeRender(this.stepInstantiate);
    }
}
class CameraManager {
    constructor() {
        this._preventForcedMove = false;
        this.k = 0;
        this.duration = 180;
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
    get preventForcedMove() {
        return this._preventForcedMove;
    }
    set preventForcedMove(b) {
        this._preventForcedMove = b;
        if (this.preventForcedMove) {
            Main.instance.scene.unregisterBeforeRender(this.transitionStep);
            if (this.onTransitionDone) {
                this.onTransitionDone();
            }
        }
    }
    goToLocal(target) {
        Main.instance.scene.unregisterBeforeRender(this.transitionStep);
        this.fromPosition.copyFrom(Main.instance.camera.position);
        this.toPosition.copyFrom(target);
        let direction = target.subtract(Main.instance.camera.position);
        direction.normalize();
        direction.scaleInPlace(10);
        direction.y = Math.min(10, Main.instance.camera.position.y);
        this.toPosition.addInPlace(direction);
        this.fromTarget.copyFrom(Main.instance.camera.target);
        this.toTarget.copyFrom(target);
        this.onTransitionDone = () => {
            Main.instance.camera.useAutoRotationBehavior = true;
            Main.instance.camera.autoRotationBehavior.idleRotationWaitTime = 3000;
            Main.instance.camera.autoRotationBehavior.idleRotationSpinupTime = 3000;
        };
        this.k = 0;
        Main.instance.scene.registerBeforeRender(this.transitionStep);
    }
    goToGlobal() {
        this.fromPosition.copyFrom(Main.instance.camera.position);
        this.toPosition.copyFrom(new BABYLON.Vector3(-80, 80, -80));
        this.fromTarget.copyFrom(Main.instance.camera.target);
        this.toTarget.copyFromFloats(0, 0, 0);
        this.onTransitionDone = () => {
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
        this.model = new PowerStation(true, Main.instance.scene);
        this.model.position.x = origin.x;
        this.model.position.z = origin.y;
        Failure.update();
    }
    Dispose() {
        let index = Failure.instances.indexOf(this);
        if (index !== -1) {
            Failure.instances.splice(index, 1);
        }
        this.model.Dispose();
        Failure.update();
    }
    static update() {
        Building.instances.forEach((b) => {
            b.material = Main.okMaterial;
            Failure.instances.forEach((f) => {
                if (BABYLON.Vector2.DistanceSquared(b.c, f.origin) < f.sqrRange) {
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
            Main.failureMaterial.alpha = this.k / this.duration;
            if (this.k >= this.duration) {
                Main.instance.scene.unregisterBeforeRender(this.transitionStepToGlobal);
            }
        };
        this.transitionStepToLocal = () => {
            this.k++;
            Main.failureMaterial.alpha = 1 - this.k / this.duration;
            if (this.k >= this.duration) {
                Main.instance.scene.unregisterBeforeRender(this.transitionStepToLocal);
            }
        };
        this.globalGround = BABYLON.MeshBuilder.CreateGround("GlobalGround", { width: w, height: h }, Main.instance.scene);
        this.globalGround.position.y = -0.2;
        let globalScale = 2.14;
        this.globalGround.scaling.copyFromFloats(globalScale, globalScale, globalScale);
        let groundMaterial = new BABYLON.StandardMaterial("GroundMaterial", Main.instance.scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("http://svenfrankson.github.io/sniff-map-web/Content/alsace.png", Main.instance.scene);
        groundMaterial.specularColor.copyFromFloats(0.2, 0.2, 0.2);
        this.globalGround.material = groundMaterial;
        this.localGround = BABYLON.MeshBuilder.CreateDisc("LocalGround", { radius: 1, sideOrientation: 1 }, Main.instance.scene);
        this.localGround.rotation.x = -Math.PI / 2;
        let s = 141.51682965;
        this.localGround.scaling.copyFromFloats(s, s, s);
        let localGroundMaterial = new BABYLON.StandardMaterial("LocalGroundMaterial", Main.instance.scene);
        localGroundMaterial.diffuseTexture = new BABYLON.Texture("http://svenfrankson.github.io/sniff-map-web/Content/strasbourg.png", Main.instance.scene);
        localGroundMaterial.specularColor.copyFromFloats(0.2, 0.2, 0.2);
        this.localGround.material = localGroundMaterial;
    }
    toLocalGround(target) {
        this.k = 0;
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
        Main.medX = Tools.LonToX(Main.medLon);
        Main.medZ = Tools.LatToZ(Main.medLat);
        console.log("MedX " + Main.medX);
        console.log("MedZ " + Main.medZ);
        this.canvas = document.getElementById(canvasElement);
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.positionPointerDown = BABYLON.Vector2.Zero();
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
        this.camera.setPosition(new BABYLON.Vector3(-350, 350, -350));
        this.cameraManager = new CameraManager();
        Main.okMaterial = new BABYLON.StandardMaterial("Random", this.scene);
        Main.okMaterial.diffuseColor = BABYLON.Color3.FromHexString("#FFFFFF");
        Main.okMaterial.backFaceCulling = false;
        Main.nokMaterial = new BABYLON.StandardMaterial("Random", this.scene);
        Main.nokMaterial.diffuseColor = BABYLON.Color3.FromHexString("#E74D3B");
        Main.nokMaterial.backFaceCulling = false;
        Main.failureMaterial = new BABYLON.StandardMaterial("Random", this.scene);
        Main.failureMaterial.diffuseColor = BABYLON.Color3.FromHexString("#E74D3B");
        Main.failureMaterial.backFaceCulling = false;
        Main.greenMaterial = new BABYLON.StandardMaterial("Random", this.scene);
        Main.greenMaterial.diffuseColor = BABYLON.Color3.FromHexString("#0FEACA");
        Main.purpleMaterial = new BABYLON.StandardMaterial("Random", this.scene);
        Main.purpleMaterial.diffuseColor = BABYLON.Color3.FromHexString("#AD5EEC");
        Main.twitterMaterial = new BABYLON.StandardMaterial("TwitterMaterial", this.scene);
        Main.twitterMaterial.diffuseTexture = new BABYLON.Texture("./Content/twitter-logo.png", this.scene);
        this.ui = new UI();
        let poc = new Poc();
        let h = 1024;
        let w = 1024;
        this.groundManager = new GroundManager(h, w);
        let lon = Tools.XToLon(0);
        let lat = Tools.ZToLat(0);
        Building.Clear();
        poc.loadTile(0, () => {
            poc.loadTile(1, () => {
                poc.loadTile(2, () => {
                    poc.loadTile(3, () => {
                        poc.loadTile(4, () => {
                            poc.loadTile(5, () => {
                                poc.loadTile(6, () => {
                                    poc.loadTile(7, () => {
                                        poc.loadTile(8, () => {
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
        let positionPointerUp = BABYLON.Vector2.Zero();
        this.scene.onPointerObservable.add((eventData, eventState) => {
            if (eventData.type === BABYLON.PointerEventTypes._POINTERUP) {
                positionPointerUp.x = this.scene.pointerX;
                positionPointerUp.y = this.scene.pointerY;
                if (BABYLON.Vector2.Distance(this.positionPointerDown, positionPointerUp) > 5) {
                    return;
                }
                this.cameraManager.preventForcedMove = false;
                let pickingInfo = this.scene.pick(this.scene.pointerX, this.scene.pointerY, (m) => {
                    return m.name === "Tile";
                });
                if (pickingInfo.pickedMesh) {
                    let tweetAlert = pickingInfo.pickedMesh.parent;
                    tweetAlert.hidden = !tweetAlert.hidden;
                }
                pickingInfo = this.scene.pick(this.scene.pointerX, this.scene.pointerY, (m) => {
                    return m === this.groundManager.globalGround;
                });
                if (pickingInfo.hit) {
                    this.cameraManager.goToLocal(pickingInfo.pickedPoint);
                }
            }
            else if (eventData.type === BABYLON.PointerEventTypes._POINTERDOWN) {
                this.cameraManager.preventForcedMove = true;
                this.positionPointerDown.x = this.scene.pointerX;
                this.positionPointerDown.y = this.scene.pointerY;
            }
            else if (eventData.type === BABYLON.PointerEventTypes._POINTERWHEEL) {
                this.cameraManager.preventForcedMove = true;
                this.cameraManager.preventForcedMove = false;
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
    pointsOfInterestBoundingInfo() {
        let min = new BABYLON.Vector3(-1, -1, -1);
        let max = new BABYLON.Vector3(1, 1, 1);
        Twittalert.instances.forEach((t) => {
            min.x = Math.min(t.position.x, min.x);
            min.y = Math.min(t.position.y, min.y);
            min.z = Math.min(t.position.z, min.z);
            max.x = Math.max(t.position.x, max.x);
            max.y = Math.max(t.position.y, max.y);
            max.z = Math.max(t.position.z, max.z);
        });
        Failure.instances.forEach((f) => {
            min.x = Math.min(f.origin.x, min.x);
            min.z = Math.min(f.origin.y, min.z);
            max.x = Math.max(f.origin.x, max.x);
            max.z = Math.max(f.origin.y, max.z);
        });
        return {
            min: min,
            max: max
        };
    }
}
Main.medLon = 7.7554;
Main.medLat = 48.5844;
Main.medX = 0;
Main.medZ = 0;
function myMethod(node1) {
    let position = BABYLON.Vector3.Zero();
    position.x = Tools.LonToX(node1.Longitude);
    position.z = -Tools.LatToZ(node1.Latitude);
    position.x += (Math.random() - 0.5) * 64;
    position.z += (Math.random() - 0.5) * 64;
    new Twittalert(position, node1.Text, " Today", node1.Name, node1.URLPicture, Main.instance.scene);
}
window.addEventListener("DOMContentLoaded", () => {
    let game = new Main("supermap");
    game.createScene();
    game.animate();
});
class Poc {
    constructor() {
        this.tileSize = 0.006;
        this.success = (data, box, callback) => {
            let mapNodes = new Map();
            let root = data.firstElementChild;
            if (!root) {
                root = data.rootElement;
            }
            let nodes = root.children;
            let newBuildings = [];
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].tagName === "node") {
                    let id = parseInt(nodes[i].id);
                    let lLat = parseFloat(nodes[i].getAttribute("lat"));
                    let lLong = parseFloat(nodes[i].getAttribute("lon"));
                    let coordinates = new BABYLON.Vector2(lLong, lLat);
                    coordinates.x = Tools.LonToX(lLong);
                    coordinates.y = -Tools.LatToZ(lLat);
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
                        newBuilding.l = level;
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
        };
    }
    loadTile(index, callback) {
        let url = "http://svenfrankson.github.io/sniff-map-web/Content/map_" + index + ".xml";
        $.ajax({
            url: url,
            success: (data) => {
                this.success(data, "", callback);
            },
            error: () => {
                console.log("Error");
            }
        });
    }
    getDataAt(long, lat, callback) {
        let box = (long - this.tileSize).toFixed(7) + "," + (lat - this.tileSize).toFixed(7) + "," + (long + this.tileSize).toFixed(7) + "," + (lat + this.tileSize).toFixed(7);
        if (false) {
        }
        else {
            let url = "http://api.openstreetmap.org/api/0.6/map?bbox=" + box;
            $.ajax({
                url: url,
                success: (data) => {
                    this.success(data, box, callback);
                },
                error: () => {
                    console.log("Error");
                }
            });
        }
    }
}
Poc.newNewBuildings = [];
class PowerStation extends BABYLON.Mesh {
    constructor(failure, scene) {
        super("PowerStation", scene);
        this.update = () => {
            this.rotation.y += 0.02;
            let s = BABYLON.Vector3.Distance(this.position, Main.instance.scene.activeCamera.position) / 20;
            this.scaling.copyFromFloats(s, s, s);
        };
        PowerStation.instances.push(this);
        BABYLON.SceneLoader.ImportMesh("", "http://svenfrankson.github.io/sniff-map-web/Content/elec-logo.babylon", "", scene, (meshes) => {
            this.model = meshes[0];
            meshes[0].parent = this;
            if (failure) {
                meshes[0].material = Main.nokMaterial;
            }
            else {
                meshes[0].material = Main.greenMaterial;
            }
            this.getScene().registerBeforeRender(this.update);
        });
    }
    static LogPosition() {
        let v3 = [];
        PowerStation.instances.forEach((p) => {
            v3.push(p.position);
        });
        console.log(v3);
    }
    Dispose() {
        let index = PowerStation.instances.indexOf(this);
        if (index !== -1) {
            PowerStation.instances.splice(index, 1);
        }
        this.model.dispose();
        this.dispose();
    }
}
PowerStation.instances = [];
var RAD2DEG = 180 / Math.PI;
var PI_4 = Math.PI / 4;
var zoom = 20;
class Tools {
    static LonToX(lon) {
        return (lon + 180) / 360 * Math.pow(2, zoom) - Main.medX;
    }
    static LatToZ(lat) {
        let res = Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180));
        return (1 - res / Math.PI) * Math.pow(2, zoom - 1) - Main.medZ;
    }
    static XToLon(x) {
        return (x + Main.medX) / Math.pow(2, zoom) * 360 - 180;
    }
    static ZToLat(z) {
        return Math.atan(Math.sinh(Math.PI - (z + Main.medZ) / Math.pow(2, zoom) * 2 * Math.PI)) * 180 / Math.PI;
    }
}
var dataPositions = [-3.4261, 1.6076, -0.0309, -3.1362, 1.0937, -0.7691, -3.4261, 1.6076, -0.7691, -3.4788, 2.227, -0.0309, -3.4788, 2.227, -0.7691, -3.3037, 2.7773, -0.0309, -3.3037, 2.7773, -0.7691, 2.6925, 2.6522, -0.0309, 3.0044, 2.6882, -0.7691, 3.0044, 2.6882, -0.0309, 3.3207, 2.8068, -0.7691, 3.3207, 2.8068, -0.0309, 2.9957, 2.15, -0.0309, 3.347, 2.1742, -0.7691, 3.347, 2.1742, -0.0309, 3.5974, 2.2665, -0.7691, 3.5974, 2.2665, -0.0309, 3.8323, 2.3604, -0.7691, 3.8323, 2.3604, -0.0309, 3.6107, 2.988, -0.7691, 3.6107, 2.988, -0.0309, -3.1362, 1.0937, -0.0309, -2.7895, 0.7594, -0.7691, -3.4129, 0.369, -0.0309, -3.5127, 0.9052, -0.7691, -3.5127, 0.9052, -0.0309, -3.123, -0.1186, -0.0309, -3.4129, 0.369, -0.7691, -2.6223, -1.2387, -0.0309, -2.9362, -0.6987, -0.7691, -2.9362, -0.6987, -0.0309, -2.1742, -1.5944, -0.0309, -2.6223, -1.2387, -0.7691, -3.7412, -2.4386, -0.0309, -3.0176, -2.8068, -0.7691, -3.7412, -2.4386, -0.7691, -2.2665, -3.0439, -0.0309, -3.0176, -2.8068, -0.0309, -1.4495, -3.1098, -0.0309, -2.2665, -3.0439, -0.7691, -1.5189, -1.7709, -0.0309, -2.1742, -1.5944, -0.7691, -2.6882, -0.4612, -0.7691, -3.123, -0.1186, -0.7691, -2.2295, -0.6348, -0.0309, -2.6882, -0.4612, -0.0309, -2.0967, -0.652, 0, 0.0077, 1.162, 0, -1.4216, -1.7651, 0, -0.6325, -3.0571, -0.0309, -1.4495, -3.1098, -0.7691, 0.145, -2.8595, -0.0309, -0.6325, -3.0571, -0.7691, 0.1055, -2.8376, 0, 0.9522, -2.428, 0, 1.5523, -1.9452, 0, 2.0351, -1.4494, 0, 2.4004, -0.9667, 0, 2.6744, -0.4839, 0, 2.844, -0.0273, 0, 2.9875, 0.4946, 0, 3.0658, 1.0426, 0, 3.0795, 1.5916, 0, 2.8647, 2.11, 0, 2.6434, 2.6154, 0, 2.2609, 2.8886, 0, 2.2928, 2.9122, -0.0309, 2.6367, 2.6666, -0.7691, 2.6367, 2.6666, -0.0309, 1.4495, 3.1098, -0.0309, 1.8712, 3.0703, -0.7691, 1.8712, 3.0703, -0.0309, 2.2928, 2.9122, -0.7691, 0.5666, 2.8068, -0.0309, 0.9751, 3.0308, -0.7691, 0.9751, 3.0308, -0.0309, 0.2635, 2.5169, -0.0309, 0.5666, 2.8068, -0.7691, 0.0659, 2.1479, -0.0309, 0.2635, 2.5169, -0.7691, -0.0659, 1.6735, -0.0309, 0.0659, 2.1479, -0.7691, -0.0289, 1.2299, -0.0309, -0.0659, 1.6735, -0.7691, -3.3912, 1.6161, -0.8, -2.9086, 2.3317, -0.8, -3.444, 2.2333, -0.8, -3.2913, 2.7143, -0.8, 2.8655, 2.1101, -0.8, 3.4171, 1.8588, -0.8, 3.3538, 2.1438, -0.8, 3.027, 2.6675, -0.8, 3.2845, 2.4324, -0.8, 2.6441, 2.6233, -0.8, 0.0077, 1.162, -0.8, 3.7881, 2.3094, -0.8, 3.6113, 2.2386, -0.8, 3.6732, 2.1149, -0.8, -0.6508, -3.0299, -0.8, 0.1055, -2.8376, -0.8, -1.4216, -1.7651, -0.8, 2.2667, 2.8929, -0.8, -3.1022, 1.1039, -0.8, -2.298, 1.8803, -0.8, -2.6814, 0.698, -0.8, -1.6607, 1.5351, -0.8, -3.4945, 0.8914, -0.8, -3.4014, 0.3907, -0.8, -3.2034, 0.7633, -0.8, -2.6904, -0.4273, -0.8, -2.0967, -0.652, -0.8, -2.91, -0.7067, -0.8, -2.6163, -1.2119, -0.8, -2.5105, -0.742, -0.8, -2.1751, -1.5622, -0.8, -3.657, -2.4506, -0.8, -3.0086, -2.7805, -0.8, -2.8834, -2.4165, -0.8, -2.263, -3.0159, -0.8, -3.113, -0.0944, -0.8, -1.4503, -3.0815, -0.8, -2.1647, -2.2168, -0.8, 0.9522, -2.428, -0.8, 1.5523, -1.9452, -0.8, 2.0351, -1.4494, -0.8, 2.4004, -0.9667, -0.8, 2.6744, -0.4839, -0.8, 2.844, -0.0273, -0.8, 2.9875, 0.4946, -0.8, 3.0658, 1.0426, -0.8, 3.0795, 1.5916, -0.8, 3.5824, 2.9339, -0.8, 3.3498, 2.7885, -0.8, 3.5048, 2.6916, -0.8, 1.8498, 3.0492, -0.8, 1.4329, 3.0883, -0.8, 0.9638, 3.0101, -0.8, 0.5599, 2.7887, -0.8, 0.2603, 2.502, -0.8, 0.1274, 2.254, -0.8, -0.0347, 1.6706, -0.8, -0.9467, 1.3236, -0.8, -2.91, -0.7067, 0, -2.5105, -0.742, 0, -2.6163, -1.2119, 0, -0.0347, 1.6706, 0, 0.1263, 2.25, 0, -2.5037, -0.7116, -0.0309, -2.9209, -0.6748, -0.7691, -2.5037, -0.7116, -0.7691, -0.0568, 1.2043, -0.0309, -0.8829, 1.3441, -0.7691, -0.0568, 1.2043, -0.7691, -2.2308, -0.6522, -0.0309, -2.2308, -0.6522, -0.7691, 3.3538, 2.1438, 0, 3.6732, 2.1149, 0, 3.4171, 1.8588, 0, -2.6904, -0.4273, 0, -2.6814, 0.698, 0, 3.7881, 2.3094, 0, 3.6113, 2.2386, 0, -3.113, -0.0944, 0, 3.8452, 2.3453, -0.0309, 3.6896, 2.082, -0.7691, 3.6896, 2.082, -0.0309, -3.4014, 0.3907, 0, 3.4261, 1.8185, -0.0309, 3.4261, 1.8185, -0.7691, -3.4945, 0.8914, 0, -3.2034, 0.7633, 0, 3.134, 1.5873, -0.7691, 3.134, 1.5873, -0.0309, -3.4901, 0.9231, -0.0309, -3.1889, 0.7906, -0.7691, -3.1889, 0.7906, -0.0309, 3.0967, 1.041, -0.0309, 3.1091, 1.5372, -0.7691, 3.0967, 1.041, -0.7691, -2.7979, 0.7418, -0.7691, -2.7979, 0.7418, -0.0309, 3.0176, 0.4876, -0.0309, 3.0176, 0.4876, -0.7691, -1.6607, 1.5351, 0, -0.9467, 1.3236, 0, 2.8726, -0.0395, -0.7691, 2.8726, -0.0395, -0.0309, -3.1022, 1.1039, 0, -2.298, 1.8803, 0, 2.7013, -0.5007, -0.7691, 2.7013, -0.5007, -0.0309, -3.3912, 1.6161, 0, -2.9086, 2.3317, 0, 2.4246, -0.9883, -0.7691, 2.4246, -0.9883, -0.0309, -3.2913, 2.7143, 0, -3.444, 2.2333, 0, 2.0557, -1.4759, -0.7691, 2.0557, -1.4759, -0.0309, -3.2725, 2.7849, -0.0309, -2.8331, 2.3456, -0.7691, -2.8331, 2.3456, -0.0309, 1.5681, -1.9766, -0.0309, 1.5681, -1.9766, -0.7691, -2.227, 1.8975, -0.7691, -2.227, 1.8975, -0.0309, 0.9619, -2.4641, -0.7691, 0.9619, -2.4641, -0.0309, 3.3075, 2.4114, -0.0309, 2.9894, 2.1667, -0.7691, 2.9894, 2.1667, -0.0309, -1.5944, 1.5549, -0.7691, -1.5944, 1.5549, -0.0309, 0.145, -2.8595, -0.7691, 3.5315, 2.675, -0.7691, 3.3075, 2.4114, -0.7691, -0.8829, 1.3441, -0.0309, -0.6508, -3.0299, 0, 3.6275, 2.975, -0.0309, 3.5315, 2.675, -0.0309, -1.4503, -3.0815, 0, 3.5769, 2.9183, 0, 3.5045, 2.6919, 0, 3.3596, 2.7824, 0, -2.1647, -2.2168, 0, 3.2842, 2.4327, 0, -2.263, -3.0159, 0, -2.8834, -2.4165, 0, 3.0346, 2.6606, 0, -3.657, -2.4506, 0, -3.0086, -2.7805, 0, 1.4495, 3.1098, -0.7691, -3.7378, -2.4233, -0.0309, -2.8726, -2.3851, -0.7691, -2.8726, -2.3851, -0.0309, 1.8451, 3.0446, 0, 1.4292, 3.0836, 0, -2.1611, -2.1874, -0.7691, -2.1611, -2.1874, -0.0309, 0.9613, 3.0056, 0, -1.5154, -1.795, -0.0309, -1.5154, -1.795, -0.7691, 0.5585, 2.7846, 0, -2.1751, -1.5622, 0, 0.2596, 2.4987, 0, 3.1091, 1.5372, -0.0309, -2.9209, -0.6748, -0.0309, -2.7895, 0.7594, -0.0309, 2.9957, 2.15, -0.7691, 3.6275, 2.975, -0.7691, 2.6925, 2.6522, -0.7691, -0.0289, 1.2299, -0.7691, 3.8452, 2.3453, -0.7691, -3.7378, -2.4233, -0.7691, -1.5189, -1.7709, -0.7691, -2.2295, -0.6348, -0.7691, -3.4901, 0.9231, -0.7691, -3.2725, 2.7849, -0.7691];
var dataNormals = [-0.8776, -0.2688, 0.3969, -0.7341, -0.5576, -0.3875, -0.8776, -0.2688, -0.3969, -0.9169, 0.094, 0.3879, -0.9169, 0.094, -0.3879, -0.5875, 0.6693, 0.4548, -0.5875, 0.6693, -0.4548, 0.0248, 0.901, 0.4331, -0.2067, 0.9174, -0.3402, -0.1994, 0.8901, 0.4097, -0.4008, 0.8363, -0.3741, -0.3871, 0.8089, 0.4425, 0.2698, 0.745, 0.61, -0.1918, 0.897, -0.3982, -0.1918, 0.897, 0.3982, -0.3308, 0.8617, -0.3847, -0.3308, 0.8617, 0.3847, 0.2353, 0.8579, -0.4568, 0.2353, 0.8579, 0.4568, 0.0685, 0.8926, -0.4456, 0.0631, 0.8765, 0.4772, -0.7341, -0.5576, 0.3875, -0.7386, -0.3018, -0.6028, -0.8953, -0.3572, 0.2661, -0.8927, 0.3529, -0.28, -0.8927, 0.3529, 0.28, -0.7061, -0.6356, 0.312, -0.8953, -0.3572, -0.2661, -0.7093, -0.6371, 0.3016, -0.9481, 0.0355, -0.3159, -0.9481, 0.0355, 0.3159, -0.4078, -0.8422, 0.3526, -0.7093, -0.6371, -0.3016, -0.8047, -0.3524, 0.4777, -0.3537, -0.8668, -0.3514, -0.8047, -0.3524, -0.4777, -0.1784, -0.9185, 0.3528, -0.3537, -0.8668, 0.3514, -0.007, -0.934, 0.3572, -0.1784, -0.9185, -0.3528, -0.5073, -0.6362, 0.5813, -0.4078, -0.8422, -0.3526, -0.4474, -0.82, -0.3569, -0.7061, -0.6356, -0.312, -0.5577, -0.5619, 0.611, -0.4474, -0.82, 0.3569, -0.0252, 0.0017, 0.9997, -0.0714, 0.0778, 0.9944, -0.0498, -0.0079, 0.9987, 0.1515, -0.9173, 0.3683, -0.007, -0.934, -0.3572, 0.3252, -0.856, 0.402, 0.1515, -0.9173, -0.3683, 0.1187, -0.3699, 0.9214, 0.2042, -0.3103, 0.9284, 0.2541, -0.2748, 0.9273, 0.2907, -0.2468, 0.9244, 0.3244, -0.2113, 0.922, 0.3583, -0.1649, 0.9189, 0.3721, -0.1192, 0.9205, 0.3875, -0.0803, 0.9183, 0.3934, -0.0332, 0.9188, 0.2033, -0.1075, 0.9732, 0.0235, 0.0089, 0.9997, 0.0688, 0.24, 0.9683, 0.1668, 0.3384, 0.9261, 0.4376, 0.802, 0.4064, 0.4046, 0.809, -0.4263, 0.3929, 0.789, 0.4723, -0.019, 0.9414, 0.3367, 0.223, 0.9164, -0.3322, 0.2194, 0.9, 0.3765, 0.4462, 0.818, -0.3629, -0.5628, 0.8006, 0.2056, -0.2983, 0.9243, -0.2382, -0.2933, 0.9142, 0.2796, -0.7753, 0.6174, 0.1332, -0.5684, 0.8047, -0.1712, -0.8805, 0.3175, 0.3521, -0.7796, 0.6167, -0.1089, -0.9243, 0.087, 0.3717, -0.8806, 0.3171, -0.352, -0.8228, 0.2145, 0.5263, -0.9243, 0.087, -0.3717, -0.3703, -0.1173, -0.9214, 0.149, 0.1636, -0.9752, -0.3976, 0.057, -0.9157, -0.2016, 0.2511, -0.9467, 0.0236, 0.0089, -0.9997, 0.2433, -0.2649, -0.933, -0.0734, 0.3421, -0.9368, -0.1039, 0.3814, -0.9185, 0.2768, -0.2927, -0.9152, 0.0811, 0.2765, -0.9576, -0.0714, 0.0778, -0.9944, 0.2067, 0.1758, -0.9625, -0.1361, 0.3537, -0.9254, 0.3189, -0.2326, -0.9188, 0.0565, -0.4088, -0.9109, 0.1187, -0.3699, -0.9214, -0.0498, -0.0079, -0.9987, 0.189, 0.3808, -0.9051, -0.3079, -0.2524, -0.9173, 0.1379, 0.2033, -0.9693, -0.0277, 0.0131, -0.9995, 0.1163, 0.2467, -0.9621, -0.4, 0.3072, -0.8635, -0.517, -0.1648, -0.84, 0.0991, 0.3417, -0.9345, -0.234, -0.374, -0.8974, -0.0252, 0.0017, -0.9997, -0.4322, 0.1628, -0.8869, -0.401, -0.3113, -0.8616, -0.0162, 0.3559, -0.9344, -0.2237, -0.3919, -0.8924, -0.2349, 0.0228, -0.9717, -0.1617, -0.3931, -0.9051, -0.049, 0.3642, -0.93, -0.0837, -0.4195, -0.9039, -0.3788, -0.3079, -0.8727, -0.0038, -0.4177, -0.9086, -0.1448, 0.3631, -0.9204, 0.2042, -0.3103, -0.9284, 0.2541, -0.2748, -0.9273, 0.2907, -0.2468, -0.9244, 0.3244, -0.2113, -0.922, 0.3583, -0.1649, -0.9189, 0.3721, -0.1192, -0.9205, 0.3875, -0.0803, -0.9183, 0.3934, -0.0332, -0.9188, 0.2033, -0.1075, -0.9732, 0.1798, 0.2263, -0.9573, -0.172, 0.3282, -0.9288, 0.3666, -0.2011, -0.9084, 0.0877, 0.4532, -0.8871, -0.0374, 0.5033, -0.8633, -0.2152, 0.5287, -0.8211, -0.3849, 0.484, -0.7859, -0.5534, 0.3845, -0.7389, -0.586, 0.3008, -0.7524, -0.4126, 0.0389, -0.9101, 0.086, 0.3223, -0.9427, -0.4322, 0.1628, 0.8869, -0.0162, 0.3559, 0.9344, -0.401, -0.3113, 0.8616, -0.4126, 0.0389, 0.9101, -0.5765, 0.2954, 0.7618, -0.0666, 0.9197, 0.3868, -0.4059, 0.84, -0.36, -0.0666, 0.9197, -0.3868, -0.1443, 0.8379, 0.5263, 0.1939, 0.8962, -0.3989, -0.1443, 0.8379, -0.5263, -0.4711, 0.6535, 0.5925, -0.4711, 0.6535, -0.5925, -0.0734, 0.3421, 0.9368, 0.3189, -0.2326, 0.9188, 0.2433, -0.2649, 0.933, -0.234, -0.374, 0.8974, -0.0277, 0.0131, 0.9995, 0.2067, 0.1758, 0.9625, -0.1361, 0.3537, 0.9254, -0.3788, -0.3079, 0.8727, 0.8838, 0.1017, 0.4566, 0.7221, -0.5712, -0.3902, 0.7221, -0.5712, 0.3902, -0.517, -0.1648, 0.84, 0.6015, -0.683, 0.4143, 0.6015, -0.683, -0.4143, -0.4, 0.3072, 0.8635, 0.0991, 0.3417, 0.9345, 0.6615, -0.5758, -0.4804, 0.6615, -0.5758, 0.4804, -0.1035, 0.9321, 0.3469, 0.2391, 0.8894, -0.3896, 0.2391, 0.8894, 0.3896, 0.9227, -0.0768, 0.3777, 0.8793, -0.1734, -0.4435, 0.9227, -0.0768, -0.3777, -0.2267, 0.7754, -0.5893, -0.2267, 0.7754, 0.5893, 0.9066, -0.1889, 0.3773, 0.9066, -0.1889, -0.3773, 0.1163, 0.2467, 0.9621, 0.086, 0.3223, 0.9427, 0.8801, -0.2846, -0.38, 0.8801, -0.2846, 0.38, -0.3079, -0.2524, 0.9173, 0.1379, 0.2033, 0.9693, 0.8376, -0.3919, -0.3806, 0.8376, -0.3919, 0.3806, -0.3703, -0.1173, 0.9214, 0.149, 0.1636, 0.9752, 0.7697, -0.5084, -0.386, 0.7697, -0.5084, 0.386, -0.2016, 0.2511, 0.9467, -0.3976, 0.057, 0.9157, 0.6966, -0.6013, -0.3913, 0.6966, -0.6013, 0.3913, 0.2356, 0.8422, 0.485, 0.548, 0.6497, -0.5267, 0.548, 0.6497, 0.5267, 0.6151, -0.6804, 0.3983, 0.6151, -0.6804, -0.3983, 0.4562, 0.7358, -0.5004, 0.4562, 0.7358, 0.5004, 0.4839, -0.775, -0.4065, 0.4839, -0.775, 0.4065, 0.6393, -0.6696, 0.3781, 0.6968, -0.3798, -0.6084, 0.6953, -0.3781, 0.6112, 0.3221, 0.8296, -0.4562, 0.3221, 0.8296, 0.4562, 0.3252, -0.856, -0.402, 0.8113, -0.4524, -0.3703, 0.6401, -0.6704, -0.3752, 0.1939, 0.8962, 0.3989, 0.0565, -0.4088, 0.9109, 0.8352, 0.2854, 0.4701, 0.8103, -0.4518, 0.3732, -0.0038, -0.4177, 0.9086, 0.2056, 0.1583, 0.9657, 0.3638, -0.1996, 0.9098, -0.1427, 0.2706, 0.952, -0.1448, 0.3631, 0.9204, 0.2746, -0.2904, 0.9166, -0.0837, -0.4195, 0.9039, -0.049, 0.3642, 0.93, -0.0884, 0.3193, 0.9435, -0.2349, 0.0228, 0.9717, -0.1617, -0.3931, 0.9051, -0.0201, 0.956, -0.2925, -0.5845, 0.6545, 0.4796, -0.1561, 0.9131, -0.3765, -0.1561, 0.9131, 0.3765, 0.0773, 0.4082, 0.9096, -0.0365, 0.4609, 0.8867, -0.3863, 0.856, -0.3435, -0.3863, 0.856, 0.3435, -0.2063, 0.4956, 0.8437, -0.6836, 0.5108, 0.5213, -0.6836, 0.5108, -0.5213, -0.3728, 0.4625, 0.8044, -0.2237, -0.3919, 0.8924, -0.5454, 0.3726, 0.7508, 0.8793, -0.1734, 0.4435, -0.4059, 0.84, 0.36, -0.7386, -0.3018, 0.6028, 0.2702, 0.7449, -0.6099, 0.8483, 0.2868, -0.4451, 0.0202, 0.9299, -0.3673, -0.8228, 0.2145, -0.5263, 0.8838, 0.1017, -0.4566, -0.5845, 0.6545, -0.4796, -0.5073, -0.6362, -0.5813, -0.5577, -0.5619, -0.611, -0.1035, 0.9321, -0.3469, 0.2356, 0.8422, -0.485];
var dataIndices = [0, 1, 2, 3, 2, 4, 5, 4, 6, 7, 8, 9, 9, 10, 11, 12, 13, 14, 14, 15, 16, 16, 17, 18, 11, 19, 20, 21, 22, 1, 23, 24, 25, 26, 27, 23, 28, 29, 30, 31, 32, 28, 33, 34, 35, 36, 34, 37, 38, 39, 36, 40, 41, 31, 26, 42, 43, 44, 42, 45, 46, 47, 48, 49, 50, 38, 51, 52, 49, 48, 47, 53, 53, 47, 54, 54, 47, 55, 55, 47, 56, 56, 47, 57, 57, 47, 58, 58, 47, 59, 59, 47, 60, 60, 47, 61, 61, 47, 62, 62, 47, 63, 64, 63, 47, 64, 47, 65, 66, 67, 68, 69, 70, 71, 71, 72, 66, 73, 74, 75, 76, 77, 73, 78, 79, 76, 80, 81, 78, 82, 83, 80, 84, 85, 86, 87, 86, 85, 88, 89, 90, 91, 88, 92, 93, 94, 88, 95, 96, 97, 98, 99, 100, 93, 101, 94, 102, 103, 84, 104, 105, 102, 106, 107, 108, 109, 110, 104, 111, 112, 113, 114, 100, 110, 115, 116, 117, 118, 117, 116, 110, 112, 114, 104, 107, 119, 119, 109, 104, 110, 100, 94, 120, 121, 118, 120, 98, 100, 100, 99, 94, 99, 122, 94, 122, 123, 94, 123, 124, 94, 124, 125, 94, 125, 126, 94, 126, 127, 94, 127, 128, 94, 128, 129, 94, 129, 130, 94, 90, 97, 96, 131, 132, 133, 130, 88, 94, 101, 134, 94, 134, 135, 94, 135, 136, 94, 136, 137, 94, 137, 138, 94, 138, 139, 94, 140, 94, 139, 141, 110, 94, 142, 143, 144, 145, 146, 47, 147, 148, 149, 150, 151, 152, 153, 149, 154, 155, 156, 157, 158, 159, 46, 160, 156, 161, 162, 159, 158, 163, 164, 165, 166, 159, 162, 167, 164, 168, 169, 170, 166, 167, 171, 172, 173, 174, 175, 176, 177, 178, 175, 179, 180, 181, 178, 182, 159, 183, 184, 181, 185, 186, 187, 188, 183, 186, 189, 190, 191, 192, 188, 190, 193, 194, 195, 192, 196, 194, 197, 198, 199, 200, 201, 202, 197, 203, 63, 157, 62, 201, 204, 205, 202, 206, 207, 208, 209, 210, 205, 211, 212, 207, 213, 51, 208, 214, 215, 212, 151, 216, 217, 48, 53, 218, 214, 219, 132, 92, 133, 220, 48, 217, 221, 222, 223, 184, 46, 159, 220, 224, 48, 225, 223, 222, 226, 227, 224, 63, 228, 225, 229, 227, 230, 75, 231, 69, 232, 233, 234, 235, 47, 236, 234, 237, 238, 236, 47, 239, 240, 237, 241, 239, 47, 242, 243, 46, 48, 242, 47, 244, 144, 46, 243, 244, 47, 146, 82, 47, 150, 7, 64, 68, 218, 221, 20, 210, 12, 63, 18, 163, 160, 172, 245, 62, 33, 232, 229, 240, 40, 48, 30, 246, 142, 153, 44, 46, 25, 173, 169, 180, 247, 159, 5, 199, 195, 209, 88, 248, 249, 19, 131, 250, 67, 93, 251, 152, 94, 17, 95, 252, 171, 130, 177, 35, 115, 253, 241, 100, 254, 29, 111, 148, 154, 110, 255, 24, 106, 256, 179, 104, 22, 6, 87, 257, 210, 225, 208, 208, 222, 219, 219, 221, 218, 11, 221, 223, 11, 228, 9, 7, 228, 64, 68, 65, 66, 71, 65, 235, 69, 235, 236, 75, 236, 239, 73, 239, 242, 76, 242, 244, 76, 146, 78, 78, 145, 80, 82, 145, 47, 12, 155, 63, 14, 161, 155, 16, 160, 161, 165, 160, 163, 165, 157, 156, 172, 157, 167, 245, 61, 62, 181, 61, 176, 181, 59, 60, 186, 58, 59, 190, 57, 58, 194, 56, 57, 198, 55, 56, 202, 54, 55, 51, 54, 207, 49, 53, 51, 38, 217, 49, 36, 220, 38, 37, 226, 36, 37, 229, 230, 234, 229, 232, 234, 224, 227, 240, 224, 238, 40, 243, 48, 28, 243, 31, 30, 144, 28, 147, 142, 246, 153, 143, 147, 44, 158, 46, 26, 158, 45, 23, 162, 26, 25, 166, 23, 175, 169, 173, 180, 170, 175, 247, 187, 159, 21, 191, 187, 3, 191, 0, 3, 195, 196, 199, 192, 195, 201, 188, 192, 205, 183, 188, 212, 184, 183, 184, 150, 47, 92, 209, 215, 133, 215, 214, 131, 214, 249, 131, 10, 132, 91, 10, 8, 91, 250, 93, 101, 67, 72, 101, 70, 134, 134, 231, 135, 135, 74, 136, 136, 77, 137, 137, 79, 138, 139, 79, 81, 140, 81, 83, 140, 251, 94, 90, 248, 88, 96, 13, 90, 95, 15, 96, 95, 164, 252, 89, 164, 97, 89, 171, 168, 129, 177, 130, 129, 182, 178, 127, 182, 128, 126, 185, 127, 125, 189, 126, 124, 193, 125, 123, 197, 124, 122, 203, 123, 122, 213, 206, 99, 52, 213, 98, 50, 52, 120, 39, 50, 118, 34, 39, 115, 34, 116, 115, 233, 253, 121, 233, 117, 121, 241, 237, 114, 254, 100, 114, 32, 41, 112, 29, 32, 111, 149, 148, 113, 154, 149, 109, 255, 110, 109, 43, 42, 119, 27, 43, 107, 24, 27, 106, 174, 256, 108, 179, 174, 102, 22, 104, 84, 1, 102, 84, 4, 2, 87, 4, 86, 85, 257, 87, 103, 200, 85, 105, 204, 103, 141, 211, 105, 152, 141, 94, 148, 30, 29, 152, 82, 150, 209, 12, 210, 44, 154, 255, 163, 17, 252, 173, 24, 256, 245, 171, 177, 247, 179, 22, 199, 6, 257, 19, 218, 20, 67, 7, 68, 232, 35, 253, 40, 241, 254, 65, 47, 235, 0, 21, 1, 3, 0, 2, 5, 3, 4, 7, 250, 8, 9, 8, 10, 12, 248, 13, 14, 13, 15, 16, 15, 17, 11, 10, 19, 21, 247, 22, 23, 27, 24, 26, 43, 27, 28, 32, 29, 31, 41, 32, 33, 37, 34, 36, 39, 34, 38, 50, 39, 40, 254, 41, 26, 45, 42, 44, 255, 42, 49, 52, 50, 51, 213, 52, 66, 72, 67, 69, 231, 70, 71, 70, 72, 73, 77, 74, 76, 79, 77, 78, 81, 79, 80, 83, 81, 82, 251, 83, 84, 103, 85, 88, 130, 89, 91, 93, 88, 102, 105, 103, 104, 141, 105, 118, 121, 117, 110, 113, 112, 104, 108, 107, 120, 100, 121, 90, 89, 97, 141, 104, 110, 147, 246, 148, 150, 216, 151, 153, 147, 149, 155, 161, 156, 163, 252, 164, 166, 170, 159, 167, 165, 164, 167, 168, 171, 173, 256, 174, 176, 245, 177, 175, 174, 179, 181, 176, 178, 159, 187, 183, 181, 182, 185, 187, 191, 188, 186, 185, 189, 191, 196, 192, 190, 189, 193, 194, 193, 197, 199, 257, 200, 202, 198, 197, 63, 155, 157, 201, 200, 204, 202, 203, 206, 208, 215, 209, 205, 204, 211, 207, 206, 213, 208, 219, 214, 212, 211, 151, 218, 249, 214, 132, 91, 92, 184, 47, 46, 220, 226, 224, 225, 228, 223, 226, 230, 227, 63, 64, 228, 75, 74, 231, 232, 253, 233, 234, 233, 237, 240, 238, 237, 144, 143, 46, 210, 63, 225, 208, 225, 222, 219, 222, 221, 11, 20, 221, 11, 223, 228, 7, 9, 228, 68, 64, 65, 71, 66, 65, 69, 71, 235, 75, 69, 236, 73, 75, 239, 76, 73, 242, 76, 244, 146, 78, 146, 145, 82, 80, 145, 12, 14, 155, 14, 16, 161, 16, 18, 160, 165, 156, 160, 165, 167, 157, 172, 62, 157, 245, 176, 61, 181, 60, 61, 181, 186, 59, 186, 190, 58, 190, 194, 57, 194, 198, 56, 198, 202, 55, 202, 207, 54, 51, 53, 54, 49, 217, 53, 38, 220, 217, 36, 226, 220, 37, 230, 226, 37, 33, 229, 234, 227, 229, 234, 238, 224, 240, 48, 224, 40, 31, 243, 28, 144, 243, 30, 142, 144, 147, 143, 142, 153, 46, 143, 44, 45, 158, 26, 162, 158, 23, 166, 162, 25, 169, 166, 175, 170, 169, 180, 159, 170, 247, 21, 187, 21, 0, 191, 3, 196, 191, 3, 5, 195, 199, 201, 192, 201, 205, 188, 205, 212, 183, 212, 216, 184, 184, 216, 150, 92, 88, 209, 133, 92, 215, 131, 133, 214, 131, 19, 10, 91, 132, 10, 91, 8, 250, 101, 93, 67, 101, 72, 70, 134, 70, 231, 135, 231, 74, 136, 74, 77, 137, 77, 79, 139, 138, 79, 140, 139, 81, 140, 83, 251, 90, 13, 248, 96, 15, 13, 95, 17, 15, 95, 97, 164, 89, 168, 164, 89, 130, 171, 129, 178, 177, 129, 128, 182, 127, 185, 182, 126, 189, 185, 125, 193, 189, 124, 197, 193, 123, 203, 197, 122, 206, 203, 122, 99, 213, 99, 98, 52, 98, 120, 50, 120, 118, 39, 118, 116, 34, 115, 35, 34, 115, 117, 233, 121, 237, 233, 121, 100, 241, 114, 41, 254, 114, 112, 32, 112, 111, 29, 111, 113, 149, 113, 110, 154, 109, 42, 255, 109, 119, 43, 119, 107, 27, 107, 106, 24, 106, 108, 174, 108, 104, 179, 102, 1, 22, 84, 2, 1, 84, 86, 4, 87, 6, 4, 85, 200, 257, 103, 204, 200, 105, 211, 204, 141, 151, 211, 152, 151, 141, 148, 246, 30, 152, 251, 82, 209, 248, 12, 44, 153, 154, 163, 18, 17, 173, 25, 24, 245, 172, 171, 247, 180, 179, 199, 5, 6, 19, 249, 218, 67, 250, 7, 232, 33, 35, 40, 240, 241];
class Twittalert extends BABYLON.Mesh {
    constructor(position, content, date, author, pictureUrl, scene) {
        super("TwittAlert", scene);
        this.lifeSpan = 500000;
        this.minDist = 30;
        this.maxDist = 100;
        this.timeout = 0;
        this.popIn = () => {
            this.container.alpha += 0.02;
            if (this.container.alpha >= this.computeAlpha()) {
                this.container.alpha = 1;
                this.getScene().unregisterBeforeRender(this.popIn);
                this.getScene().registerBeforeRender(this.update);
            }
        };
        this.update = () => {
            this.container.alpha = this.computeAlpha();
        };
        this.kill = () => {
            this.container.alpha -= 0.01;
            if (this.container.alpha <= 0) {
                this.getScene().unregisterBeforeRender(this.kill);
                this.Dispose();
            }
        };
        BABYLON.SceneLoader.ImportMesh("", "./Content/twitter-logo.babylon", "", scene, (meshes) => {
            this.tile = meshes[0];
            this.tile.name = "Tile";
            this.tile.material = Main.twitterMaterial;
            this.tile.renderingGroupId++;
            this.tile.position.y -= 4;
            this.tile.parent = this;
        });
        let color = true;
        if (Math.random() > 0.5) {
            color = false;
        }
        this.ground = position.clone();
        this.position.copyFrom(position);
        this.position.y += 4;
        this.tube = BABYLON.Mesh.CreateTube("Tube", [this.ground, this.position], 0.05, 6, undefined, 1, scene);
        this.tube.renderingGroupId++;
        if (color) {
            this.tube.material = Main.purpleMaterial;
        }
        else {
            this.tube.material = Main.greenMaterial;
        }
        this.texture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("tmp");
        this.texture.idealWidth = 1250;
        this.container = new BABYLON.GUI.Container("container");
        this.container.width = "480px";
        this.container.height = "80px";
        this.texture.addControl(this.container);
        let rectangle = new BABYLON.GUI.Rectangle("rectangle");
        rectangle.background = "white";
        rectangle.thickness = 3;
        if (color) {
            rectangle.color = "#AD5EEC";
        }
        else {
            rectangle.color = "#0FEACA";
        }
        this.container.addControl(rectangle);
        let avatar = new BABYLON.GUI.Image("avatar", pictureUrl);
        avatar.width = "60px";
        avatar.height = "60px";
        avatar.top = "0px";
        avatar.left = "-200px";
        this.container.addControl(avatar);
        let authorBox = new BABYLON.GUI.TextBlock("author", author);
        authorBox.color = "black";
        authorBox.fontStyle = "bold";
        authorBox.fontSize = 18;
        authorBox.fontFamily = "Helvetica Neue";
        authorBox.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        authorBox.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        authorBox.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        authorBox.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        authorBox.top = "5px";
        authorBox.left = "90px";
        this.container.addControl(authorBox);
        let metaBox = new BABYLON.GUI.TextBlock("date", " - " + date);
        metaBox.color = "grey";
        metaBox.fontSize = 16;
        metaBox.fontFamily = "Helvetica Neue";
        metaBox.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        metaBox.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        metaBox.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        metaBox.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        metaBox.top = "10px";
        metaBox.left = "250px";
        this.container.addControl(metaBox);
        let textBox = new BABYLON.GUI.TextBlock("content", content);
        textBox.color = "black";
        textBox.fontSize = 14;
        textBox.fontFamily = "Helvetica Neue";
        textBox.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        textBox.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        textBox.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        textBox.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        textBox.textWrapping = true;
        textBox.top = "35px";
        textBox.left = "90px";
        textBox.width = "380px";
        this.container.addControl(textBox);
        let warning = BABYLON.GUI.Button.CreateImageOnlyButton("Warning", "http://svenfrankson.github.io/sniff-map-web/Content/alert.png");
        warning.width = "25px";
        warning.height = "25px";
        warning.top = "-15px";
        warning.left = "215px";
        warning.thickness = 0;
        warning.onPointerUpObservable.add(() => {
            new Failure(new BABYLON.Vector2(this.ground.x, this.ground.z), 10);
            Main.instance.positionPointerDown.x = -42;
        });
        this.container.addControl(warning);
        let hide = BABYLON.GUI.Button.CreateImageOnlyButton("Hide", "http://svenfrankson.github.io/sniff-map-web/Content/hide.png");
        hide.width = "25px";
        hide.height = "25px";
        hide.top = "15px";
        hide.left = "215px";
        hide.thickness = 0;
        hide.onPointerUpObservable.add(() => {
            this.hidden = !this.hidden;
            Main.instance.positionPointerDown.x = -42;
        });
        this.container.addControl(hide);
        this.container.linkWithMesh(this);
        this.container.linkOffsetX = "120px";
        this.container.alpha = 0;
        scene.registerBeforeRender(this.popIn);
        Main.instance.cameraManager.goToLocal(this.ground);
        setTimeout(() => {
            scene.unregisterBeforeRender(this.popIn);
            scene.unregisterBeforeRender(this.update);
            scene.registerBeforeRender(this.kill);
        }, this.lifeSpan);
    }
    get hidden() {
        return this._hidden;
    }
    set hidden(b) {
        this._hidden = b;
        if (this._hidden) {
            this.container.isVisible = false;
            this.tube.isVisible = false;
        }
        if (!this._hidden) {
            this.container.isVisible = true;
            this.tube.isVisible = true;
        }
    }
    Dispose() {
        let index = Twittalert.instances.indexOf(this);
        if (index !== -1) {
            Twittalert.instances.splice(index, 1);
        }
        this.container.linkWithMesh(undefined);
        this.container.dispose();
        this.texture.dispose();
        this.tube.dispose();
        this.dispose();
    }
    DemoTryCauseFailure() {
        let proba = 0.2;
        for (let i = 0; i < Twittalert.instances.length; i++) {
            if (Twittalert.instances[i] !== this) {
                if (BABYLON.Vector3.DistanceSquared(Twittalert.instances[i].position, this.position) < 10000) {
                    proba += 0.2;
                }
            }
        }
        if (Math.random() < proba) {
            new Failure(new BABYLON.Vector2(this.position.x, this.position.z), 10 + 10 * Math.random());
        }
    }
    computeAlpha() {
        let alpha = 0;
        let dist = BABYLON.Vector3.Distance(Main.instance.scene.activeCamera.position, this.position);
        if (dist > this.maxDist) {
            alpha = 0;
        }
        else if (dist < this.minDist) {
            alpha = 1;
        }
        else {
            let delta = dist - this.minDist;
            alpha = -delta / (this.maxDist - this.minDist) + 1;
        }
        return alpha;
    }
}
Twittalert.instances = [];
class UI {
    constructor() {
        this.texture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.texture.idealWidth = 1250;
        this.back = BABYLON.GUI.Button.CreateSimpleButton("Back", "Back");
        this.back.width = 0.1;
        this.back.height = 0.1;
        this.back.left = "4Opx";
        this.back.top = "10px";
        this.back.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.back.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.back.background = "white";
        this.back.color = "#13EA8D";
        this.back.children[0].color = "black";
        this.back.cornerRadius = 5;
        this.back.onPointerUpObservable.add(() => {
            Main.instance.cameraManager.goToGlobal();
            Main.instance.groundManager.toGlobalGround();
            Main.instance.positionPointerDown.x = -42;
        });
        this.texture.addControl(this.back);
    }
}
