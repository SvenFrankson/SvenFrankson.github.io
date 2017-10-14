class Main {
    constructor(canvasElement) {
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
            poc.instantiateBuildings(long, lat, this.scene);
        });
        let ground = BABYLON.MeshBuilder.CreateDisc("Ground", { radius: 12 }, this.scene);
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
    instantiateBuildings(long, lat, scene) {
        for (let i = 0; i < this.buildings.length; i++) {
            let building = this.buildings[i];
            let randomMaterial = new BABYLON.StandardMaterial("Random", scene);
            randomMaterial.diffuseColor = BABYLON.Color3.FromHexString("#42c8f4");
            randomMaterial.diffuseColor.r += (Math.random() - 0.5) * 0.3;
            randomMaterial.diffuseColor.g += (Math.random() - 0.5) * 0.3;
            randomMaterial.diffuseColor.b += (Math.random() - 0.5) * 0.3;
            randomMaterial.backFaceCulling = false;
            let bMesh = new BABYLON.Mesh("Building", scene);
            let data = this.extrudeToSolid(building, 0.2 + 0.1 * Math.random());
            data.applyToMesh(bMesh);
            bMesh.material = randomMaterial;
        }
    }
    extrudeToSolid(points, height) {
        let data = new BABYLON.VertexData();
        let positions = [];
        let indices = [];
        let center = BABYLON.Vector2.Zero();
        for (let i = 0; i < points.length; i++) {
            center.addInPlace(points[i]);
        }
        if (points.length > 0) {
            center.scaleInPlace(1 / points.length);
        }
        positions.push(center.x, height, center.y);
        for (let i = 0; i < points.length - 1; i++) {
            let zero = positions.length / 3;
            positions.push(points[i].x, 0, points[i].y);
            positions.push(points[i].x, height, points[i].y);
            positions.push(points[i + 1].x, height, points[i + 1].y);
            positions.push(points[i + 1].x, 0, points[i + 1].y);
            indices.push(zero, zero + 1, zero + 2);
            indices.push(zero, zero + 2, zero + 3);
            indices.push(0, zero + 2, zero + 1);
        }
        let zero = positions.length / 3;
        positions.push(points[points.length - 1].x, 0, points[points.length - 1].y);
        positions.push(points[points.length - 1].x, height, points[points.length - 1].y);
        positions.push(points[0].x, height, points[0].y);
        positions.push(points[0].x, 0, points[0].y);
        indices.push(zero, zero + 1, zero + 2);
        indices.push(zero, zero + 2, zero + 3);
        indices.push(0, zero + 2, zero + 1);
        data.positions = positions;
        data.indices = indices;
        return data;
    }
    getDataAt(long, lat, callback) {
        let box = (long - 0.004).toFixed(5) + "," + (lat - 0.004).toFixed(5) + "," + (long + 0.004).toFixed(5) + "," + (lat + 0.004).toFixed(5);
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
                        let nodeIChildren = nodes[i].children;
                        for (let j = 0; j < nodeIChildren.length; j++) {
                            if (nodeIChildren[j].tagName === "tag") {
                                if (nodeIChildren[j].hasAttribute("k")) {
                                    if (nodeIChildren[j].getAttribute("k") === "building") {
                                        itsBuilding = true;
                                        break;
                                    }
                                }
                            }
                        }
                        if (itsBuilding) {
                            let newBuilding = [];
                            for (let j = 0; j < nodeIChildren.length; j++) {
                                if (nodeIChildren[j].tagName === "nd") {
                                    let nodeRef = parseInt(nodeIChildren[j].getAttribute("ref"));
                                    let node = mapNodes.get(nodeRef);
                                    newBuilding.push(node);
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
