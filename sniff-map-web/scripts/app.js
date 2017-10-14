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
class Failure {
    constructor(origin, range) {
        Failure.instances.push(this);
        this.origin = origin.clone();
        this.sqrRange = range * range;
    }
    static update() {
        Building.instances.forEach((b) => {
            b.material = Main.okMaterial;
            Failure.instances.forEach((f) => {
                if (BABYLON.Vector2.DistanceSquared(b.coordinates, f.origin) < f.sqrRange) {
                    console.log("FAIL");
                    b.material = Main.failureMaterial;
                }
            });
        });
    }
}
Failure.instances = [];
class Main {
    constructor(canvasElement) {
        Main.instance = this;
        this.canvas = document.getElementById(canvasElement);
        this.engine = new BABYLON.Engine(this.canvas, true);
        BABYLON.Engine.ShadersRepository = "./shaders/";
    }
    createScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor.copyFromFloats(0, 0, 0, 1);
        this.resize();
        let hemisphericLight = new BABYLON.HemisphericLight("Light", BABYLON.Vector3.Up(), this.scene);
        this.light = hemisphericLight;
        let arcRotateCamera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 1, BABYLON.Vector3.Zero(), this.scene);
        arcRotateCamera.setPosition(new BABYLON.Vector3(3, 2, -5));
        arcRotateCamera.attachControl(this.canvas);
        this.scene.activeCamera = arcRotateCamera;
        Main.okMaterial = new BABYLON.StandardMaterial("Random", this.scene);
        Main.okMaterial.diffuseColor = BABYLON.Color3.FromHexString("#42c8f4");
        Main.okMaterial.backFaceCulling = false;
        Main.failureMaterial = new BABYLON.StandardMaterial("Random", this.scene);
        Main.failureMaterial.diffuseColor = BABYLON.Color3.FromHexString("#f48042");
        Main.failureMaterial.backFaceCulling = false;
        let long = 7.76539;
        let lat = 48.581;
        if (localStorage.getItem("long-value") !== null) {
            long = parseFloat(localStorage.getItem("long-value"));
        }
        if (localStorage.getItem("lat-value") !== null) {
            lat = parseFloat(localStorage.getItem("lat-value"));
        }
        $("#long-input").val(long + "");
        $("#lat-input").val(lat + "");
        $("#long-input").on("input change", (e) => {
            long = parseFloat(e.currentTarget.value);
            localStorage.setItem("long-value", long + "");
        });
        $("#lat-input").on("input change", (e) => {
            lat = parseFloat(e.currentTarget.value);
            localStorage.setItem("lat-value", lat + "");
        });
        let poc = new Poc();
        poc.getDataAt(long, lat, () => {
            poc.instantiateBuildings(this.scene);
            setInterval(() => {
                new Failure(new BABYLON.Vector2((Math.random() - 0.5) * 48, (Math.random() - 0.5) * 48), Math.random() * 5);
                Failure.update();
            }, 1500);
        });
        let ground = BABYLON.MeshBuilder.CreateDisc("Ground", { radius: 24 }, this.scene);
        ground.rotation.x = Math.PI / 2;
        BABYLON.SceneLoader.ImportMesh("", "http://svenfrankson.github.io/duck.babylon", "", this.scene, (meshes) => {
            meshes[0].position.x -= 1;
            meshes[0].position.z += 1.5;
            meshes[0].position.y = 0.3;
            this.scene.registerBeforeRender(() => {
                meshes[0].rotation.y += 0.01;
            });
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
window.addEventListener("DOMContentLoaded", () => {
    let game = new Main("render-canvas");
    game.createScene();
    game.animate();
});
class Poc {
    constructor() {
        this.buildings = [];
    }
    instantiateBuildings(scene) {
        this.buildings.forEach((data) => {
            data.instantiate(scene);
        });
    }
    getDataAt(long, lat, callback) {
        let box = (long - 0.008).toFixed(5) + "," + (lat - 0.008).toFixed(5) + "," + (long + 0.008).toFixed(5) + "," + (lat + 0.008).toFixed(5);
        let url = "http://api.openstreetmap.org/api/0.6/map?bbox=" + box;
        console.log(url);
        $.ajax({
            url: url,
            success: (data) => {
                let mapNodes = new Map();
                console.log("Success");
                let root = data.firstElementChild;
                console.log("Root");
                console.log("Root has " + root.childElementCount + " children elements.");
                let nodes = root.children;
                console.log("Nodes");
                for (let i = 0; i < nodes.length; i++) {
                    if (nodes[i].tagName === "node") {
                        let id = parseInt(nodes[i].id);
                        let lLat = parseFloat(nodes[i].getAttribute("lat"));
                        let lLong = parseFloat(nodes[i].getAttribute("lon"));
                        let coordinates = new BABYLON.Vector2(lLong, lLat);
                        coordinates.x -= long;
                        coordinates.x *= 2000;
                        coordinates.y -= lat;
                        coordinates.y *= 2000;
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
                            this.buildings.push(newBuilding);
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
