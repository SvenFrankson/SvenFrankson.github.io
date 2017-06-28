var Main = (function () {
    function Main(canvasElement) {
        this.k = 0;
        Main.Canvas = document.getElementById(canvasElement);
        Main.Engine = new BABYLON.Engine(Main.Canvas, true);
    }
    Main.prototype.CreateScene = function () {
        Main.Scene = new BABYLON.Scene(Main.Engine);
        Main.Camera = new BABYLON.ArcRotateCamera("ArcCamera", 0, 0, 1, BABYLON.Vector3.Zero(), Main.Scene);
        Main.Camera.setPosition(new BABYLON.Vector3(256, 256, 256));
        Main.Camera.attachControl(Main.Canvas);
        Main.Camera.wheelPrecision = 5;
        Main.Light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), Main.Scene);
        Main.Light.diffuse = new BABYLON.Color3(1, 1, 1);
        Main.Light.groundColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        Main.Light.specular = new BABYLON.Color3(1, 1, 1);
    };
    Main.prototype.Animate = function () {
        Main.Engine.runRenderLoop(function () {
            Main.Scene.render();
        });
        window.addEventListener("resize", function () {
            Main.Engine.resize();
        });
    };
    Main.prototype.LoadTerrainFromBabylonFile = function () {
        var t0 = new Date();
        BABYLON.SceneLoader.ImportMesh("", "./datas/terrain256.babylon", "", Main.Scene, function (meshes, particles, skeletons) {
            console.log("Terrain Successfuly loaded.");
            var t1 = new Date();
            $("#loading-time").text((t1.getTime() - t0.getTime()).toString());
        });
    };
    Main.prototype.LoadTerrainFromPNGHeightMap = function () {
        var t0 = new Date();
        var img = $("#height-map").get(0);
        img.onload = function () {
            var c = document.getElementById("debug-output");
            var ctx = c.getContext("2d");
            ctx.drawImage(img, 0, 0, 257, 257);
            var mesh = new BABYLON.Mesh("Terrain00", Main.Scene);
            var vertexData = new BABYLON.VertexData();
            var positions = [];
            var indices = [];
            var pixels = ctx.getImageData(0, 0, 129, 129).data;
            for (var i = 0; i < 129; i++) {
                for (var j = 0; j < 129; j++) {
                    var pixel = pixels[(i + j * 129) * 4];
                    positions.push(i - 128);
                    positions.push(pixel / 256 * 100);
                    positions.push(j - 128);
                    if (i > 0 && j > 0) {
                        indices.push(i + j * 129);
                        indices.push(i + (j - 1) * 129);
                        indices.push((i - 1) + j * 129);
                        indices.push((i - 1) + (j - 1) * 129);
                        indices.push((i - 1) + j * 129);
                        indices.push(i + (j - 1) * 129);
                    }
                }
            }
            vertexData.positions = positions;
            vertexData.indices = indices;
            vertexData.normals = [];
            BABYLON.VertexData.ComputeNormals(positions, indices, vertexData.normals);
            vertexData.applyToMesh(mesh);
            var t1 = new Date();
            mesh = new BABYLON.Mesh("Terrain10", Main.Scene);
            vertexData = new BABYLON.VertexData();
            positions = [];
            indices = [];
            pixels = ctx.getImageData(128, 0, 129, 129).data;
            for (var i = 0; i < 129; i++) {
                for (var j = 0; j < 129; j++) {
                    var pixel = pixels[(i + j * 129) * 4];
                    positions.push(i);
                    positions.push(pixel / 256 * 100);
                    positions.push(j - 128);
                    if (i > 0 && j > 0) {
                        indices.push(i + j * 129);
                        indices.push(i + (j - 1) * 129);
                        indices.push((i - 1) + j * 129);
                        indices.push((i - 1) + (j - 1) * 129);
                        indices.push((i - 1) + j * 129);
                        indices.push(i + (j - 1) * 129);
                    }
                }
            }
            vertexData.positions = positions;
            vertexData.indices = indices;
            vertexData.normals = [];
            BABYLON.VertexData.ComputeNormals(positions, indices, vertexData.normals);
            vertexData.applyToMesh(mesh);
            mesh = new BABYLON.Mesh("Terrain11", Main.Scene);
            vertexData = new BABYLON.VertexData();
            positions = [];
            indices = [];
            pixels = ctx.getImageData(128, 128, 129, 129).data;
            for (var i = 0; i < 129; i++) {
                for (var j = 0; j < 129; j++) {
                    var pixel = pixels[(i + j * 129) * 4];
                    positions.push(i);
                    positions.push(pixel / 256 * 100);
                    positions.push(j);
                    if (i > 0 && j > 0) {
                        indices.push(i + j * 129);
                        indices.push(i + (j - 1) * 129);
                        indices.push((i - 1) + j * 129);
                        indices.push((i - 1) + (j - 1) * 129);
                        indices.push((i - 1) + j * 129);
                        indices.push(i + (j - 1) * 129);
                    }
                }
            }
            vertexData.positions = positions;
            vertexData.indices = indices;
            vertexData.normals = [];
            BABYLON.VertexData.ComputeNormals(positions, indices, vertexData.normals);
            vertexData.applyToMesh(mesh);
            mesh = new BABYLON.Mesh("Terrain01", Main.Scene);
            vertexData = new BABYLON.VertexData();
            positions = [];
            indices = [];
            pixels = ctx.getImageData(0, 128, 129, 129).data;
            for (var i = 0; i < 129; i++) {
                for (var j = 0; j < 129; j++) {
                    var pixel = pixels[(i + j * 129) * 4];
                    positions.push(i - 128);
                    positions.push(pixel / 256 * 100);
                    positions.push(j);
                    if (i > 0 && j > 0) {
                        indices.push(i + j * 129);
                        indices.push(i + (j - 1) * 129);
                        indices.push((i - 1) + j * 129);
                        indices.push((i - 1) + (j - 1) * 129);
                        indices.push((i - 1) + j * 129);
                        indices.push(i + (j - 1) * 129);
                    }
                }
            }
            vertexData.positions = positions;
            vertexData.indices = indices;
            vertexData.normals = [];
            BABYLON.VertexData.ComputeNormals(positions, indices, vertexData.normals);
            vertexData.applyToMesh(mesh);
            t1 = new Date();
            $("#loading-time").text((t1.getTime() - t0.getTime()).toString());
        };
    };
    Main.prototype.DebugGetMeshHeightMap = function (mesh) {
        var c = document.getElementById("debug-output");
        var ctx = c.getContext("2d");
        if (mesh instanceof BABYLON.Mesh) {
            var vertices = BABYLON.VertexData.ExtractFromMesh(mesh).positions;
            for (var i = 0; i < vertices.length / 3; i++) {
                var x = Math.floor(vertices[3 * i] + 128);
                var y = vertices[3 * i + 1];
                var z = Math.floor(vertices[3 * i + 2] + 128);
                var c_1 = new BABYLON.Color3(y / 100, y / 100, y / 100);
                ctx.fillStyle = c_1.toHexString();
                ctx.fillRect(x, z, 1, 1);
            }
        }
        else {
            console.warn("Argument is not a mesh. Aborting");
        }
    };
    Main.prototype.LoadDemoScene = function () {
        var _this = this;
        var t0 = new Date();
        BABYLON.SceneLoader.ImportMesh("", "./datas/demoScene.babylon", "", Main.Scene, function (meshes, particles, skeletons) {
            console.log("Demo Scene Successfuly loaded.");
            var t1 = new Date();
            $("#loading-time").text((t1.getTime() - t0.getTime()).toString());
            Main.Camera.setPosition(new BABYLON.Vector3(5, 5, 5));
            var shadowMaker = new BABYLON.ShadowGenerator(1024, Main.ShadowLight);
            shadowMaker.usePoissonSampling = true;
            var _loop_1 = function (i) {
                meshes[i].renderOutline = true;
                meshes[i].outlineColor = BABYLON.Color3.Black();
                meshes[i].outlineWidth = 0.01;
                if (meshes[i].name.indexOf("Ball") !== -1) {
                    shadowMaker.getShadowMap().renderList.push(meshes[i]);
                    Main.Scene.registerBeforeRender(function () {
                        meshes[i].rotation.y += 0.01;
                    });
                }
                if (meshes[i].name.indexOf("LargeCube") !== -1) {
                    shadowMaker.getShadowMap().renderList.push(meshes[i]);
                    Main.Scene.registerBeforeRender(function () {
                        meshes[i].rotation.y -= 0.01;
                        meshes[i].position.y = Math.cos(_this.k / 50) + 1;
                        _this.k++;
                    });
                }
                if (meshes[i].name.indexOf("Base") !== -1) {
                    meshes[i].receiveShadows = true;
                }
            };
            for (var i = 0; i < meshes.length; i++) {
                _loop_1(i);
            }
        });
    };
    return Main;
}());
Main.Sliding = false;
Main.LockedMouse = false;
Main.ClientXOnLock = -1;
Main.ClientYOnLock = -1;
window.addEventListener("DOMContentLoaded", function () {
    var game = new Main("render-canvas");
    game.CreateScene();
    game.Animate();
    if ($("#babylon-file").get(0)) {
        console.log("Load Terrain from Babylon file");
        game.LoadTerrainFromBabylonFile();
    }
    if ($("#png-height-map").get(0)) {
        console.log("Load Terrain from PNG HeightMap");
        game.LoadTerrainFromPNGHeightMap();
    }
    if ($("#demo-scene").get(0)) {
        console.log("Load Terrain from PNG HeightMap");
        game.LoadDemoScene();
    }
});
