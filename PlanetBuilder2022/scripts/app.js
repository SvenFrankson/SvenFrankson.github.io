var CameraMode;
(function (CameraMode) {
    CameraMode[CameraMode["Sky"] = 0] = "Sky";
    CameraMode[CameraMode["Player"] = 1] = "Player";
})(CameraMode || (CameraMode = {}));
class CameraManager {
    constructor(main) {
        this.main = main;
        this.useOutline = true;
        this.cameraMode = CameraMode.Sky;
        this.arcRotateCamera = new BABYLON.ArcRotateCamera("Camera", 0, Math.PI / 2, 120, BABYLON.Vector3.Zero(), this.main.scene);
        this.arcRotateCamera.angularSensibilityX *= 5;
        this.arcRotateCamera.angularSensibilityY *= 5;
        this.arcRotateCamera.attachControl(this.main.canvas);
        this.freeCamera = new BABYLON.FreeCamera("camera", BABYLON.Vector3.Zero(), this.main.scene);
        this.freeCamera.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.freeCamera.minZ = 0.1;
        this.freeCamera.maxZ = 3000;
        if (this.useOutline) {
            const rtt = new BABYLON.RenderTargetTexture('render target', { width: this.main.engine.getRenderWidth(), height: this.main.engine.getRenderHeight() }, this.main.scene);
            rtt.samples = 1;
            this.freeCamera.outputRenderTarget = rtt;
            this.noOutlineCamera = new BABYLON.FreeCamera("no-outline-camera", BABYLON.Vector3.Zero(), this.main.scene);
            this.noOutlineCamera.minZ = 0.1;
            this.noOutlineCamera.maxZ = 3000;
            this.noOutlineCamera.layerMask = 0x10000000;
            this.noOutlineCamera.parent = this.freeCamera;
            let postProcess = OutlinePostProcess.AddOutlinePostProcess(this.freeCamera);
            postProcess.onSizeChangedObservable.add(() => {
                if (!postProcess.inputTexture.depthStencilTexture) {
                    postProcess.inputTexture.createDepthStencilTexture(0, true, false, 4);
                    postProcess.inputTexture._shareDepth(rtt.renderTarget);
                }
            });
            const pp = new BABYLON.PassPostProcess("pass", 1, this.noOutlineCamera);
            pp.inputTexture = rtt.renderTarget;
            pp.autoClear = false;
        }
    }
    get absolutePosition() {
        if (this.cameraMode === CameraMode.Sky) {
            return this.arcRotateCamera.position;
        }
        else {
            return this.freeCamera.globalPosition;
        }
    }
    setMode(newCameraMode) {
        if (newCameraMode != this.cameraMode) {
            if (this.cameraMode === CameraMode.Sky) {
                this.arcRotateCamera.detachControl();
            }
            this.cameraMode = newCameraMode;
            if (this.cameraMode === CameraMode.Player) {
                this.freeCamera.parent = this.player.camPos;
                this.freeCamera.position.copyFromFloats(0, 0, 0);
                this.freeCamera.rotationQuaternion.copyFrom(BABYLON.Quaternion.Identity());
                this.freeCamera.computeWorldMatrix();
                if (this.useOutline) {
                    this.main.scene.activeCameras = [this.freeCamera, this.noOutlineCamera];
                }
                else {
                    this.main.scene.activeCameras = [this.freeCamera];
                }
            }
            if (this.cameraMode === CameraMode.Sky) {
                if (this.useOutline) {
                    this.main.scene.activeCameras = [this.arcRotateCamera];
                }
                else {
                    this.main.scene.activeCamera = this.arcRotateCamera;
                }
                this.arcRotateCamera.attachControl(this.main.canvas);
            }
        }
    }
}
class ExtendedVertexData {
    constructor(ref, vertexData) {
        this.vertexData = vertexData;
        this.trianglesData = [];
        let colors = [];
        let uvs = [];
        let d0 = ref & (0b1 << 0);
        let d1 = ref & (0b1 << 1);
        let d2 = ref & (0b1 << 2);
        let d3 = ref & (0b1 << 3);
        let d4 = ref & (0b1 << 4);
        let d5 = ref & (0b1 << 5);
        let d6 = ref & (0b1 << 6);
        let d7 = ref & (0b1 << 7);
        for (let n = 0; n < this.vertexData.indices.length / 3; n++) {
            let n1 = this.vertexData.indices[3 * n];
            let n2 = this.vertexData.indices[3 * n + 1];
            let n3 = this.vertexData.indices[3 * n + 2];
            let x0 = this.vertexData.positions[3 * n1];
            let y0 = this.vertexData.positions[3 * n1 + 1] - this.vertexData.normals[3 * n1 + 1] * 0.2;
            let z0 = this.vertexData.positions[3 * n1 + 2];
            let x1 = this.vertexData.positions[3 * n2];
            let y1 = this.vertexData.positions[3 * n2 + 1] - this.vertexData.normals[3 * n2 + 1] * 0.2;
            let z1 = this.vertexData.positions[3 * n2 + 2];
            let x2 = this.vertexData.positions[3 * n3];
            let y2 = this.vertexData.positions[3 * n3 + 1] - this.vertexData.normals[3 * n3 + 1] * 0.2;
            let z2 = this.vertexData.positions[3 * n3 + 2];
            let bx = (x0 + x1 + x2) / 3;
            let by = (y0 + y1 + y2) / 3;
            let bz = (z0 + z1 + z2) / 3;
            let minDistance = Infinity;
            if (d0) {
                let distance = ExtendedVertexData.SquaredLength(bx, by, bz);
                if (distance < minDistance) {
                    this.trianglesData[n] = 0;
                    minDistance = distance;
                }
            }
            if (d1) {
                let distance = ExtendedVertexData.SquaredLength((1 - bx), by, bz);
                if (distance < minDistance) {
                    this.trianglesData[n] = 1;
                    minDistance = distance;
                }
            }
            if (d2) {
                let distance = ExtendedVertexData.SquaredLength((1 - bx), by, (1 - bz));
                if (distance < minDistance) {
                    this.trianglesData[n] = 2;
                    minDistance = distance;
                }
            }
            if (d3) {
                let distance = ExtendedVertexData.SquaredLength(bx, by, (1 - bz));
                if (distance < minDistance) {
                    this.trianglesData[n] = 3;
                    minDistance = distance;
                }
            }
            if (d4) {
                let distance = ExtendedVertexData.SquaredLength(bx, (1 - by), bz);
                if (distance < minDistance) {
                    this.trianglesData[n] = 4;
                    minDistance = distance;
                }
            }
            if (d5) {
                let distance = ExtendedVertexData.SquaredLength((1 - bx), (1 - by), bz);
                if (distance < minDistance) {
                    this.trianglesData[n] = 5;
                    minDistance = distance;
                }
            }
            if (d6) {
                let distance = ExtendedVertexData.SquaredLength((1 - bx), (1 - by), (1 - bz));
                if (distance < minDistance) {
                    this.trianglesData[n] = 6;
                    minDistance = distance;
                }
            }
            if (d7) {
                let distance = ExtendedVertexData.SquaredLength(bx, (1 - by), (1 - bz));
                if (distance < minDistance) {
                    this.trianglesData[n] = 7;
                    minDistance = distance;
                }
            }
            colors[4 * n1] = 1;
            colors[4 * n1 + 1] = 1;
            colors[4 * n1 + 2] = 1;
            colors[4 * n1 + 3] = 1;
            colors[4 * n2] = 1;
            colors[4 * n2 + 1] = 1;
            colors[4 * n2 + 2] = 1;
            colors[4 * n2 + 3] = 1;
            colors[4 * n3] = 1;
            colors[4 * n3 + 1] = 1;
            colors[4 * n3 + 2] = 1;
            colors[4 * n3 + 3] = 1;
            uvs[2 * n1] = 1;
            uvs[2 * n1 + 1] = 1;
            uvs[2 * n2] = 1;
            uvs[2 * n2 + 1] = 1;
            uvs[2 * n3] = 1;
            uvs[2 * n3 + 1] = 1;
        }
        this.vertexData.colors = colors;
        this.vertexData.uvs = uvs;
    }
    static SquaredLength(x, y, z) {
        return x * x + y * y + z * z;
    }
}
class FlightPlan {
    constructor(from, fromPlanet, to, toPlanet, waypoints) {
        this.from = from;
        this.fromPlanet = fromPlanet;
        this.to = to;
        this.toPlanet = toPlanet;
        this.waypoints = waypoints;
    }
}
class FlyTool {
    static CreateFlightPlan(from, fromPlanet, to, toPlanet) {
        let dir = to.subtract(from).normalize();
        let h = 20;
        // insert takeOff
        let takeOffAltitude = BABYLON.Vector3.Distance(from, fromPlanet.position);
        let takeOffY = from.subtract(fromPlanet.position).normalize();
        let takeOffX = BABYLON.Vector3.Cross(takeOffY, dir).normalize();
        let takeOffZ = BABYLON.Vector3.Cross(takeOffX, takeOffY).normalize();
        let takeOffPoint = from.add(takeOffZ.scale(2 * h)).add(takeOffY.scale(h));
        // insert landing
        let landingAltitude = BABYLON.Vector3.Distance(to, toPlanet.position);
        let landingY = to.subtract(toPlanet.position).normalize();
        let landingX = BABYLON.Vector3.Cross(landingY, dir).normalize();
        let landingZ = BABYLON.Vector3.Cross(landingX, landingY).normalize();
        let landingPoint = to.add(landingZ.scale(-2 * h)).add(landingY.scale(h));
        takeOffAltitude = BABYLON.Vector3.Distance(fromPlanet.position, takeOffPoint);
        landingAltitude = BABYLON.Vector3.Distance(toPlanet.position, landingPoint);
        let waypoints = [takeOffPoint, landingPoint];
        for (let n = 0; n < 5; n++) {
            waypoints = FlyTool.SmoothFlightPlan(waypoints);
            for (let i = 1; i < waypoints.length - 1; i++) {
                if (BABYLON.Vector3.DistanceSquared(waypoints[i], fromPlanet.position) < takeOffAltitude * takeOffAltitude) {
                    VMath.ForceDistanceInPlace(waypoints[i], fromPlanet.position, takeOffAltitude);
                }
                if (BABYLON.Vector3.DistanceSquared(waypoints[i], toPlanet.position) < landingAltitude * landingAltitude) {
                    VMath.ForceDistanceInPlace(waypoints[i], toPlanet.position, landingAltitude);
                }
            }
        }
        waypoints = [from, ...waypoints, to];
        waypoints = FlyTool.SmoothFlightPlan(waypoints);
        waypoints = FlyTool.SmoothFlightPlan(waypoints);
        waypoints = FlyTool.SmoothFlightPlan(waypoints);
        return new FlightPlan(from.clone(), fromPlanet, to.clone(), toPlanet, waypoints);
    }
    static SmoothFlightPlan(flightPlan) {
        let extendedFlightPlan = [];
        for (let i = 0; i < flightPlan.length - 1; i++) {
            extendedFlightPlan.push(flightPlan[i].clone());
            extendedFlightPlan.push(flightPlan[i].add(flightPlan[i + 1]).scale(0.5));
        }
        extendedFlightPlan.push(flightPlan[flightPlan.length - 1]);
        let smoothedFlightPlan = [extendedFlightPlan[0].clone()];
        for (let i = 1; i < extendedFlightPlan.length - 1; i++) {
            smoothedFlightPlan[i] = extendedFlightPlan[i].add(extendedFlightPlan[i - 1]).add(extendedFlightPlan[i + 1]).scale(1 / 3);
        }
        smoothedFlightPlan.push(extendedFlightPlan[extendedFlightPlan.length - 1].clone());
        return smoothedFlightPlan;
    }
    static ShowWaypoints(flightPlan, scene) {
        BABYLON.MeshBuilder.CreateLines("flightPlan", { points: flightPlan }, scene);
    }
    static Fly(flightPlan, player, scene) {
        let index = 1;
        let takeOffUp = flightPlan.from.subtract(flightPlan.fromPlanet.position).normalize();
        let landingUp = flightPlan.to.subtract(flightPlan.toPlanet.position).normalize();
        let totalDist = BABYLON.Vector3.Distance(flightPlan.from, flightPlan.to);
        let totalDir = flightPlan.to.subtract(flightPlan.from).normalize();
        let step = () => {
            let wp = flightPlan.waypoints[index];
            if (wp) {
                let dir = wp.subtract(flightPlan.waypoints[index - 1]).normalize();
                let dist = BABYLON.Vector3.Dot(player.position.subtract(flightPlan.from), totalDir);
                let f = dist / totalDist;
                if ((1 - f) * totalDist > 20) {
                    player.targetLook = flightPlan.to;
                    player.targetLookStrength = 0.1;
                }
                else {
                    player.targetLook = undefined;
                    player.targetLookStrength = 1;
                }
                let speed = Math.sin(f * Math.PI) * 70 + 5;
                let up = takeOffUp.scale(1 - f).add(landingUp.scale(f)).normalize();
                if (BABYLON.Vector3.DistanceSquared(wp, player.position) < 1 || BABYLON.Vector3.Dot(wp.subtract(player.position), dir) <= 0) {
                    index++;
                    step();
                }
                else {
                    VMath.StepToRef(player.position, wp, speed / 60, player.position);
                    player.upDirection.copyFrom(up);
                    requestAnimationFrame(step);
                }
            }
            else {
                player.lockInPlace = false;
            }
        };
        player.lockInPlace = true;
        step();
    }
}
class Main {
    constructor(canvasElement) {
        this.planets = [];
        this._chunckManagersWorkingTimer = 3;
        this._onNextChunckManagerNotWorking = [];
        this.isTouch = false;
        Main.Instance = this;
        this.canvas = document.getElementById(canvasElement);
        this.canvas.requestPointerLock = this.canvas.requestPointerLock || this.canvas.msRequestPointerLock || this.canvas.mozRequestPointerLock || this.canvas.webkitRequestPointerLock;
        Main.Engine = new BABYLON.Engine(this.canvas, true);
        this.engine = Main.Engine;
        BABYLON.Engine.ShadersRepository = "./shaders/";
    }
    get chunckManagerWorking() {
        return this._chunckManagersWorkingTimer > 0;
    }
    createScene() {
        Main.Scene = new BABYLON.Scene(Main.Engine);
        this.scene = Main.Scene;
        this.scene.clearColor.copyFromFloats(166 / 255, 231 / 255, 255 / 255, 1);
        this.vertexDataLoader = new VertexDataLoader(this.scene);
        this.inputManager = new InputManager(this.scene, this.canvas, this);
        this.cameraManager = new CameraManager(this);
        this.subtitleManager = new SubtitleManager(this);
    }
    animate() {
        Main.Engine.runRenderLoop(() => {
            this.scene.render();
            this.update();
        });
        window.addEventListener("resize", () => {
            Main.Engine.resize();
        });
    }
    async initialize() {
        this.subtitleManager.initialize();
    }
    update() {
        if (this.planets.length > 0) {
            let checkIfReachesZero = false;
            if (this._chunckManagersWorkingTimer > 0) {
                checkIfReachesZero = true;
            }
            this._chunckManagersWorkingTimer = Math.max(this._chunckManagersWorkingTimer - 1, 0);
            let needRedrawCount = 0;
            for (let i = 0; i < this.planets.length; i++) {
                needRedrawCount += this.planets[i].chunckManager.needRedrawCount;
            }
            if (needRedrawCount > 0) {
                this._chunckManagersWorkingTimer = 3;
            }
            if (needRedrawCount > 10) {
                if (showLoading(false)) {
                    this._onNextChunckManagerNotWorking.push(() => { hideLoading(); });
                }
            }
            if (checkIfReachesZero && this._chunckManagersWorkingTimer <= 0) {
                while (this._onNextChunckManagerNotWorking.length > 0) {
                    this._onNextChunckManagerNotWorking.pop()();
                }
            }
        }
    }
    onChunckManagerNotWorking(callback) {
        if (!this.chunckManagerWorking) {
            callback();
        }
        else {
            this._onNextChunckManagerNotWorking.push(callback);
        }
    }
}
var loadingInterval;
function showLoading(darkBackground) {
    let loadingElement = document.getElementById("loading");
    if (loadingElement.style.display != "block") {
        console.log("showLoading " + darkBackground);
        if (darkBackground) {
            delete loadingElement.style.backgroundColor;
            loadingElement.querySelector("div").classList.remove("small");
        }
        else {
            loadingElement.style.backgroundColor = "rgba(0, 0, 0, 0%)";
            loadingElement.querySelector("div").classList.add("small");
        }
        loadingElement.style.display = "block";
        let n = 0;
        clearInterval(loadingInterval);
        loadingInterval = setInterval(() => {
            for (let i = 0; i < 4; i++) {
                if (i === n) {
                    document.getElementById("load-" + i).style.display = "";
                }
                else {
                    document.getElementById("load-" + i).style.display = "none";
                }
            }
            n = (n + 1) % 4;
        }, 500);
        return true;
    }
    return false;
}
function hideLoading() {
    console.log("hideLoading");
    document.getElementById("loading").style.display = "none";
    clearInterval(loadingInterval);
}
window.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded " + window.location.href);
    if (window.location.href.indexOf("planet-toy.html") != -1) {
        let planetToy = new PlanetToy("renderCanvas");
        planetToy.createScene();
        planetToy.initialize().then(() => {
            planetToy.animate();
        });
    }
    else if (window.location.href.indexOf("game.html") != -1) {
        let game = new Game("renderCanvas");
        game.createScene();
        game.initialize().then(() => {
            game.animate();
        });
    }
    else if (window.location.href.indexOf("miniature.html") != -1) {
        let miniature = new Miniature("renderCanvas");
        miniature.createScene();
        miniature.initialize().then(() => {
            miniature.animate();
        });
    }
    else if (window.location.href.indexOf("demo.html") != -1) {
        let demo = new Demo("renderCanvas");
        demo.createScene();
        demo.initialize().then(() => {
            demo.animate();
        });
    }
    else if (window.location.href.indexOf("chunck-test.html") != -1) {
        let chunckTest = new ChunckTest("renderCanvas");
        chunckTest.createScene();
        chunckTest.initialize().then(() => {
            chunckTest.animate();
        });
    }
    else if (window.location.href.indexOf("vmath-test.html") != -1) {
        let vMathTest = new VMathTest("renderCanvas");
        vMathTest.createScene();
        vMathTest.initialize().then(() => {
            vMathTest.animate();
        });
    }
    else {
        let mainMenu = new MainMenu("renderCanvas");
        showLoading(true);
        mainMenu.createScene();
        mainMenu.initialize().then(() => {
            mainMenu.animate();
        });
    }
});
// get shared VertexData from exposed arrays.
// obviously not the easiest way to get shapes: mostly an attempt at complete procedural generation.
class MeshTools {
    static Angle(v1, v2) {
        return Math.acos(BABYLON.Vector3.Dot(BABYLON.Vector3.Normalize(v1), BABYLON.Vector3.Normalize(v2)));
    }
    // tool method to add a mesh triangle.
    static PushTriangle(vertices, a, b, c, positions, indices) {
        let index = positions.length / 3;
        for (let n in vertices[a]) {
            if (vertices[a] != null) {
                positions.push(vertices[a][n]);
            }
        }
        for (let n in vertices[b]) {
            if (vertices[b] != null) {
                positions.push(vertices[b][n]);
            }
        }
        for (let n in vertices[c]) {
            if (vertices[c] != null) {
                positions.push(vertices[c][n]);
            }
        }
        indices.push(index);
        indices.push(index + 1);
        indices.push(index + 2);
    }
    // tool method to add two triangles forming a mesh quad.
    static PushQuad(vertices, a, b, c, d, positions, indices) {
        let index = positions.length / 3;
        positions.push(vertices[a].x);
        positions.push(vertices[a].y);
        positions.push(vertices[a].z);
        positions.push(vertices[b].x);
        positions.push(vertices[b].y);
        positions.push(vertices[b].z);
        positions.push(vertices[c].x);
        positions.push(vertices[c].y);
        positions.push(vertices[c].z);
        positions.push(vertices[d].x);
        positions.push(vertices[d].y);
        positions.push(vertices[d].z);
        indices.push(index);
        indices.push(index + 2);
        indices.push(index + 1);
        indices.push(index + 3);
        indices.push(index + 2);
        indices.push(index);
    }
    static PushTopQuadUvs(block, uvs) {
        let i = 1;
        let j = 0;
        block = Math.min(block, 128 + 8);
        i = (block - 128 - 1) % 4;
        j = Math.floor((block - 128 - 1) / 4);
        uvs.push(0 + i * 0.25);
        uvs.push(0.75 - j * 0.25);
        uvs.push(0 + i * 0.25);
        uvs.push(1 - j * 0.25);
        uvs.push(0.25 + i * 0.25);
        uvs.push(1 - j * 0.25);
        uvs.push(0.25 + i * 0.25);
        uvs.push(0.75 - j * 0.25);
    }
    static PushSideQuadUvs(block, uvs) {
        let i = 1;
        let j = 0;
        block = Math.min(block, 128 + 8);
        i = (block - 128 - 1) % 4;
        j = Math.floor((block - 128 - 1) / 4);
        uvs.push(0 + i * 0.25);
        uvs.push(0.25 - j * 0.25);
        uvs.push(0 + i * 0.25);
        uvs.push(0.5 - j * 0.25);
        uvs.push(0.25 + i * 0.25);
        uvs.push(0.5 - j * 0.25);
        uvs.push(0.25 + i * 0.25);
        uvs.push(0.25 - j * 0.25);
    }
    static PushQuadColor(r, g, b, a, colors) {
        colors.push(r, g, b, a);
        colors.push(r, g, b, a);
        colors.push(r, g, b, a);
        colors.push(r, g, b, a);
    }
    static PushWaterUvs(uvs) {
        uvs.push(0);
        uvs.push(0);
        uvs.push(0);
        uvs.push(1);
        uvs.push(1);
        uvs.push(1);
        uvs.push(1);
        uvs.push(0);
    }
    static VertexDataFromJSON(jsonData) {
        let tmp = JSON.parse(jsonData);
        let vertexData = new BABYLON.VertexData();
        vertexData.positions = tmp.positions;
        vertexData.normals = tmp.normals;
        vertexData.matricesIndices = tmp.matricesIndices;
        vertexData.matricesWeights = tmp.matricesWeights;
        vertexData.indices = tmp.indices;
        return vertexData;
    }
}
class OutlinePostProcess {
    static AddOutlinePostProcess(camera) {
        let scene = camera.getScene();
        let engine = scene.getEngine();
        BABYLON.Effect.ShadersStore["EdgeFragmentShader"] = `
			#ifdef GL_ES
			precision highp float;
			#endif
			varying vec2 vUV;
			uniform sampler2D textureSampler;
			uniform sampler2D depthSampler;
			uniform float 		width;
			uniform float 		height;
			void make_kernel_color(inout vec4 n[9], sampler2D tex, vec2 coord)
			{
				float w = 1.0 / width;
				float h = 1.0 / height;
				n[0] = texture2D(tex, coord + vec2( -w, -h));
				n[1] = texture2D(tex, coord + vec2(0.0, -h));
				n[2] = texture2D(tex, coord + vec2(  w, -h));
				n[3] = texture2D(tex, coord + vec2( -w, 0.0));
				n[4] = texture2D(tex, coord);
				n[5] = texture2D(tex, coord + vec2(  w, 0.0));
				n[6] = texture2D(tex, coord + vec2( -w, h));
				n[7] = texture2D(tex, coord + vec2(0.0, h));
				n[8] = texture2D(tex, coord + vec2(  w, h));
			}
			
			void make_kernel_depth(inout float n[9], sampler2D tex, vec2 coord)
			{
				float w = 1.0 / width;
				float h = 1.0 / height;
				n[0] = texture2D(tex, coord + vec2( -w, -h)).r;
				n[1] = texture2D(tex, coord + vec2(0.0, -h)).r;
				n[2] = texture2D(tex, coord + vec2(  w, -h)).r;
				n[3] = texture2D(tex, coord + vec2( -w, 0.0)).r;
				n[4] = texture2D(tex, coord).r;
				n[5] = texture2D(tex, coord + vec2(  w, 0.0)).r;
				n[6] = texture2D(tex, coord + vec2( -w, h)).r;
				n[7] = texture2D(tex, coord + vec2(0.0, h)).r;
				n[8] = texture2D(tex, coord + vec2(  w, h)).r;
			}

			void main(void) 
			{
				vec4 d = texture2D(depthSampler, vUV);
				float depth = d.r * (1000.0 - 0.1) + 0.1;
				float depthFactor = sqrt(d.r);
				
				float nD[9];
				make_kernel_depth( nD, depthSampler, vUV );
				float sobel_depth_edge_h = nD[2] + (2.0*nD[5]) + nD[8] - (nD[0] + (2.0*nD[3]) + nD[6]);
				float sobel_depth_edge_v = nD[0] + (2.0*nD[1]) + nD[2] - (nD[6] + (2.0*nD[7]) + nD[8]);
				float sobel_depth = sqrt((sobel_depth_edge_h * sobel_depth_edge_h) + (sobel_depth_edge_v * sobel_depth_edge_v));

				vec4 n[9];
				make_kernel_color( n, textureSampler, vUV );
				vec4 sobel_edge_h = n[2] + (2.0*n[5]) + n[8] - (n[0] + (2.0*n[3]) + n[6]);
				vec4 sobel_edge_v = n[0] + (2.0*n[1]) + n[2] - (n[6] + (2.0*n[7]) + n[8]);
				vec4 sobel = sqrt((sobel_edge_h * sobel_edge_h) + (sobel_edge_v * sobel_edge_v));
				
				gl_FragColor = n[4];
				if (max(sobel.r, max(sobel.g, sobel.b)) > 2. * depthFactor) {
					gl_FragColor = n[4] * 0.5;
					gl_FragColor.a = 1.0;
				}
				if (sobel_depth > 0.02 * depthFactor) {
					gl_FragColor = vec4(0.);
					gl_FragColor.a = 1.0;
				}
			}
        `;
        let depthMap = scene.enableDepthRenderer(camera).getDepthMap();
        let postProcess = new BABYLON.PostProcess("Edge", "Edge", ["width", "height"], ["depthSampler"], 1, camera);
        postProcess.onApply = (effect) => {
            effect.setTexture("depthSampler", depthMap);
            effect.setFloat("width", engine.getRenderWidth());
            effect.setFloat("height", engine.getRenderHeight());
        };
        return postProcess;
    }
}
class PlanetObject extends BABYLON.Mesh {
    constructor(name, main) {
        super(name);
        this.main = main;
        this.onPositionChangedObservable = new BABYLON.Observable();
        this.onRotationChangedObservable = new BABYLON.Observable();
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
    }
    setPosition(position, noRotationUpdate) {
        if (this) {
            this.position = position;
            if (!noRotationUpdate && this.planet) {
                VMath.QuaternionFromYZAxisToRef(this.position.subtract(this.planet.position).normalize(), this.forward, this.rotationQuaternion);
                this.computeWorldMatrix(true);
                this.onRotationChangedObservable.notifyObservers();
            }
            this.onPositionChangedObservable.notifyObservers();
        }
    }
    setTarget(target) {
        if (this.planet) {
            let z = target.subtract(this.position).normalize().scaleInPlace(-1);
            VMath.QuaternionFromYZAxisToRef(this.position.subtract(this.planet.position).normalize(), z, this.rotationQuaternion);
            this.computeWorldMatrix(true);
            this.onRotationChangedObservable.notifyObservers();
        }
    }
}
class SharedMaterials {
    static MainMaterial() {
        if (!SharedMaterials.mainMaterial) {
            SharedMaterials.mainMaterial = new PlanetMaterial("mainMaterial", Game.Scene);
        }
        return SharedMaterials.mainMaterial;
    }
    static HighlightChunckMaterial() {
        if (!SharedMaterials.highlightChunckMaterial) {
            SharedMaterials.highlightChunckMaterial = new PlanetMaterial("highlightChunckMaterial", Game.Scene);
            SharedMaterials.highlightChunckMaterial.setGlobalColor(new BABYLON.Color3(0, 1, 1));
        }
        return SharedMaterials.highlightChunckMaterial;
    }
    static DebugMaterial() {
        if (!SharedMaterials.debugMaterial) {
            SharedMaterials.debugMaterial = new BABYLON.StandardMaterial("debugMaterial", Game.Scene);
        }
        return SharedMaterials.debugMaterial;
    }
    static WaterMaterial() {
        if (!SharedMaterials.waterMaterial) {
            SharedMaterials.waterMaterial = new BABYLON.StandardMaterial("waterMaterial", Game.Scene);
            SharedMaterials.waterMaterial.diffuseColor = SharedMaterials.MainMaterial().getColor(BlockType.Water);
            SharedMaterials.waterMaterial.specularColor = BABYLON.Color3.Black();
            SharedMaterials.waterMaterial.alpha = 0.8;
        }
        return SharedMaterials.waterMaterial;
    }
    static RedMaterial() {
        if (!SharedMaterials.redMaterial) {
            SharedMaterials.redMaterial = new BABYLON.StandardMaterial("redMaterial", Game.Scene);
            SharedMaterials.redMaterial.diffuseColor.copyFromFloats(1, 0, 0);
        }
        return SharedMaterials.redMaterial;
    }
    static GreenMaterial() {
        if (!SharedMaterials.greenMaterial) {
            SharedMaterials.greenMaterial = new BABYLON.StandardMaterial("greenMaterial", Game.Scene);
            SharedMaterials.greenMaterial.diffuseColor.copyFromFloats(0, 1, 0);
        }
        return SharedMaterials.greenMaterial;
    }
    static BlueMaterial() {
        if (!SharedMaterials.blueMaterial) {
            SharedMaterials.blueMaterial = new BABYLON.StandardMaterial("blueMaterial", Game.Scene);
            SharedMaterials.blueMaterial.diffuseColor.copyFromFloats(0, 0, 1);
        }
        return SharedMaterials.blueMaterial;
    }
    static MagentaMaterial() {
        if (!SharedMaterials.magentaMaterial) {
            SharedMaterials.magentaMaterial = new BABYLON.StandardMaterial("magentaMaterial", Game.Scene);
            SharedMaterials.magentaMaterial.diffuseColor.copyFromFloats(1, 0, 1);
        }
        return SharedMaterials.magentaMaterial;
    }
    static YellowMaterial() {
        if (!SharedMaterials.yellowMaterial) {
            SharedMaterials.yellowMaterial = new BABYLON.StandardMaterial("yellowMaterial", Game.Scene);
            SharedMaterials.yellowMaterial.diffuseColor.copyFromFloats(1, 1, 0);
        }
        return SharedMaterials.yellowMaterial;
    }
    static CyanMaterial() {
        if (!SharedMaterials.cyanMaterial) {
            SharedMaterials.cyanMaterial = new BABYLON.StandardMaterial("cyanMaterial", Game.Scene);
            SharedMaterials.cyanMaterial.diffuseColor.copyFromFloats(0, 1, 1);
        }
        return SharedMaterials.cyanMaterial;
    }
}
class ToonMaterial extends BABYLON.ShaderMaterial {
    constructor(name, scene) {
        super(name, scene, {
            vertex: "toon",
            fragment: "toon",
        }, {
            attributes: ["position", "normal", "uv", "color"],
            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "lightInvDirW"]
        });
        this.setVector3("lightInvDirW", (new BABYLON.Vector3(0.5, 2.5, 1.5)).normalize());
    }
}
var TutorialStep;
(function (TutorialStep) {
    TutorialStep[TutorialStep["Off"] = 0] = "Off";
    TutorialStep[TutorialStep["LookAround"] = 1] = "LookAround";
    TutorialStep[TutorialStep["MoveAround"] = 2] = "MoveAround";
    TutorialStep[TutorialStep["MoveToLocation"] = 3] = "MoveToLocation";
    TutorialStep[TutorialStep["Jump"] = 4] = "Jump";
    TutorialStep[TutorialStep["OpenMenu"] = 5] = "OpenMenu";
    TutorialStep[TutorialStep["Completed"] = 6] = "Completed";
})(TutorialStep || (TutorialStep = {}));
class TutorialManager {
    constructor(main) {
        this.main = main;
        this.step = TutorialStep.Off;
        this.lookAroundText = [
            ["Lesson 1 / 87 - Head control. Hold clic ", "<img src='datas/icons/mouse-left.svg'/>", " and rotate to look around."],
            ["Lesson 1 / 87 - Head control. Touch ", "<img src='datas/icons/touch-icon.svg'/>", " and rotate to look around. You may also use joystick ", "<span class='joystick'>R</span>"],
        ];
        this.moveText = [
            ["Lesson 1.a / 87 - Movement. Press ", "<span class='keyboard'>W</span>", ", ", "<span class='keyboard'>A</span>", ", ", "<span class='keyboard'>S</span>", " and ", "<span class='keyboard'>D</span>", " to move."],
            ["Lesson 1.a / 87 - Movement. Use joystick ", "<span class='joystick'>L</span>", " to move."],
        ];
        this.moveToLocationText = [
            ["Lesson 1.b / 87 - Move To Location. Hold clic ", "<img src='datas/icons/mouse-left.svg'/>", " in place to move to target location."],
            ["Lesson 1.b / 87 - Move To Location. Hold touch ", "<img src='datas/icons/touch-icon.svg'/>", " in place to move to target location."],
        ];
        this.jumpText = [
            ["Lesson 1.c / 87 - Jump. Press ", "<span class='keyboard'>SPACE</span>", " to jump."],
            ["Lesson 1.c / 87 - Jump. Press ", "<span class='pad yellow'>Y</span>", " to jump."],
        ];
        this.mainMenuText = [
            ["Lesson 1.d / 87 - Open Menu. Press ", "<span class='keyboard'>²</span>", " to open Planet Selection Menu."],
            ["Lesson 1.d / 87 - Open Menu. Press ", "<span class='pad'>start</span>", " to open Planet Selection Menu."],
        ];
        this.waitForLookAroundTimer = 0;
        this.waitForLookAround = () => {
            if (this.player.inputHeadUp != 0 || this.player.inputHeadRight != 0) {
                let dt = this.engine.getDeltaTime() / 1000;
                this.waitForLookAroundTimer += dt;
                // If current tutorial step (look around) is completed.
                if (this.waitForLookAroundTimer > 2) {
                    this.scene.onBeforeRenderObservable.removeCallback(this.waitForLookAround);
                    // Start next tutorial step (move).
                    this.main.subtitleManager.display(Subtitle.Create(["Well done ! You can now look around."], 3)).then(() => {
                        this.main.subtitleManager.display(Subtitle.Create(this.moveText[this.textIndex], 20, 3));
                        this.scene.onBeforeRenderObservable.add(this.waitForMove);
                    });
                }
            }
        };
        this.waitForMoveTimer = 0;
        this.waitForMove = () => {
            if (this.player.inputForward != 0 || this.player.inputRight != 0) {
                let dt = this.engine.getDeltaTime() / 1000;
                this.waitForMoveTimer += dt;
                // If current tutorial step (move) is completed.
                if (this.waitForMoveTimer > 2) {
                    this.scene.onBeforeRenderObservable.removeCallback(this.waitForMove);
                    // Start next tutorial step (move to location).
                    this.main.subtitleManager.display(Subtitle.Create(["Ok, you know how to move."], 3)).then(() => {
                        this.main.subtitleManager.display(Subtitle.Create(this.moveToLocationText[this.textIndex], 20, 3));
                        this.scene.onBeforeRenderObservable.add(this.waitForMoveToLocation);
                    });
                }
            }
        };
        this.waitForMoveToLocationTimer = 0;
        this.waitForMoveToLocation = () => {
            if (this.player.isPosAnimating) {
                let dt = this.engine.getDeltaTime() / 1000;
                this.waitForMoveToLocationTimer += dt;
                // If current tutorial step (move to location) is completed.
                if (this.waitForMoveToLocationTimer > 0.5) {
                    this.scene.onBeforeRenderObservable.removeCallback(this.waitForMoveToLocation);
                    // Start next tutorial step (jump).
                    this.main.subtitleManager.display(Subtitle.Create(["Nice, that's how you move to target location."], 3)).then(() => {
                        this.main.subtitleManager.display(Subtitle.Create(this.jumpText[this.textIndex], 20, 3));
                        this.main.inputManager.addMappedKeyUpListener(KeyInput.JUMP, this.onJump);
                    });
                }
            }
        };
        this.onJump = () => {
            this.main.inputManager.removeMappedKeyUpListener(KeyInput.JUMP, this.onJump);
            // Start next tutorial step (open main menu).
            this.main.subtitleManager.display(Subtitle.Create(["That's a new height record !"], 3)).then(() => {
                this.main.subtitleManager.display(Subtitle.Create(this.mainMenuText[this.textIndex], 20, 3));
                this.main.inputManager.addMappedKeyUpListener(KeyInput.MAIN_MENU, this.onMainMenu);
            });
        };
        this.onMainMenu = () => {
            this.main.inputManager.removeMappedKeyUpListener(KeyInput.MAIN_MENU, this.onMainMenu);
            this.main.subtitleManager.display(Subtitle.Create(["Good, now pick a planet and explore !"], 3));
        };
    }
    get engine() {
        return this.main.engine;
    }
    get scene() {
        return this.main.scene;
    }
    get player() {
        return this.main.player;
    }
    get textIndex() {
        return this.main.isTouch ? 1 : 0;
    }
    ;
    async runTutorial() {
        await this.main.subtitleManager.display(Subtitle.Create(["Hello there ! Let me introduce myself : I'm an extremely advanced AI, and I will take you through a quick control course."], 3));
        this.step = TutorialStep.LookAround;
        this.main.subtitleManager.display(Subtitle.Create(this.lookAroundText[this.textIndex], 20, 3));
        this.scene.onBeforeRenderObservable.add(this.waitForLookAround);
    }
}
class VMath {
    static IsFinite(o) {
        if (o instanceof BABYLON.Vector3) {
            return isFinite(o.x) && isFinite(o.y) && isFinite(o.z);
        }
        return false;
    }
    static ProjectPerpendicularAt(v, at) {
        let p = BABYLON.Vector3.Zero();
        let k = (v.x * at.x + v.y * at.y + v.z * at.z);
        k = k / (at.x * at.x + at.y * at.y + at.z * at.z);
        p.copyFrom(v);
        p.subtractInPlace(at.multiplyByFloats(k, k, k));
        return p;
    }
    static Angle(from, to) {
        let pFrom = BABYLON.Vector3.Normalize(from);
        let pTo = BABYLON.Vector3.Normalize(to);
        let angle = Math.acos(BABYLON.Vector3.Dot(pFrom, pTo));
        return angle;
    }
    static AngleFromToAround(from, to, around) {
        let pFrom = VMath.ProjectPerpendicularAt(from, around).normalize();
        let pTo = VMath.ProjectPerpendicularAt(to, around).normalize();
        let dot = BABYLON.Vector3.Dot(pFrom, pTo);
        let angle = Math.acos(dot);
        if (angle > Math.PI / 360 / 60 && BABYLON.Vector3.Dot(BABYLON.Vector3.Cross(pFrom, pTo), around) < 0) {
            angle = -angle;
        }
        return angle;
    }
    static StepToRef(from, to, step, ref) {
        from = VMath._Tmp3.copyFrom(from);
        let sqrStep = step * step;
        if (BABYLON.Vector3.DistanceSquared(from, to) < sqrStep) {
            ref.copyFrom(to);
        }
        else {
            ref.copyFrom(to).subtractInPlace(from).normalize().scaleInPlace(step).addInPlace(from);
        }
        return ref;
    }
    static ForceDistanceInPlace(point, origin, distance) {
        VMath._Tmp5.copyFrom(point).subtractInPlace(origin).normalize().scaleInPlace(distance);
        point.copyFrom(origin).addInPlace(VMath._Tmp5);
        return point;
    }
    static RotateVectorByQuaternionToRef(v, q, ref) {
        let u = VMath._Tmp4.copyFromFloats(q.x, q.y, q.z);
        let s = q.w;
        let v1 = u.scale(2 * BABYLON.Vector3.Dot(u, v));
        let v2 = v.scale(s * s - BABYLON.Vector3.Dot(u, u));
        let v3 = BABYLON.Vector3.Cross(u, v).scale(2 * s);
        return ref.copyFrom(v1).addInPlace(v2).addInPlace(v3);
    }
    static GetQuaternionAngle(q) {
        return 2 * Math.acos(Math.min(Math.abs(q.w), 1));
    }
    static GetAngleBetweenQuaternions(q1, q2) {
        VMath._Tmp6.copyFrom(q1).conjugateInPlace().multiplyInPlace(q2);
        return VMath.GetQuaternionAngle(VMath._Tmp6);
    }
    static StepQuaternionToRef(q1, q2, step, ref) {
        let angle = VMath.GetAngleBetweenQuaternions(q1, q2);
        if (step > angle) {
            return ref.copyFrom(q2);
        }
        let d = step / angle;
        return BABYLON.Quaternion.SlerpToRef(q1, q2, d, ref);
    }
    static StepQuaternionInPlace(q1, q2, step) {
        return VMath.StepQuaternionToRef(q1, q2, step, q1);
    }
    static QuaternionFromXYAxisToRef(x, y, ref) {
        let xAxis = VMath._Tmp0.copyFrom(x);
        let yAxis = VMath._Tmp1.copyFrom(y);
        let zAxis = VMath._Tmp2;
        BABYLON.Vector3.CrossToRef(xAxis, yAxis, zAxis);
        BABYLON.Vector3.CrossToRef(zAxis, xAxis, yAxis);
        BABYLON.Quaternion.RotationQuaternionFromAxisToRef(xAxis, yAxis, zAxis, ref);
        return ref;
    }
    static QuaternionFromYZAxisToRef(y, z, ref) {
        let xAxis = VMath._Tmp0;
        let yAxis = VMath._Tmp1.copyFrom(y);
        let zAxis = VMath._Tmp2.copyFrom(z);
        BABYLON.Vector3.CrossToRef(yAxis, zAxis, xAxis);
        BABYLON.Vector3.CrossToRef(xAxis, yAxis, zAxis);
        BABYLON.Quaternion.RotationQuaternionFromAxisToRef(xAxis, yAxis, zAxis, ref);
        return ref;
    }
    static QuaternionFromZXAxisToRef(z, x, ref) {
        let xAxis = VMath._Tmp0.copyFrom(x);
        let yAxis = VMath._Tmp1;
        let zAxis = VMath._Tmp2.copyFrom(z);
        BABYLON.Vector3.CrossToRef(zAxis, xAxis, yAxis);
        BABYLON.Vector3.CrossToRef(yAxis, zAxis, xAxis);
        BABYLON.Quaternion.RotationQuaternionFromAxisToRef(xAxis, yAxis, zAxis, ref);
        return ref;
    }
    static QuaternionFromZYAxisToRef(z, y, ref) {
        let xAxis = VMath._Tmp0;
        let yAxis = VMath._Tmp1.copyFrom(y);
        let zAxis = VMath._Tmp2.copyFrom(z);
        BABYLON.Vector3.CrossToRef(yAxis, zAxis, xAxis);
        BABYLON.Vector3.CrossToRef(zAxis, xAxis, yAxis);
        BABYLON.Quaternion.RotationQuaternionFromAxisToRef(xAxis, yAxis, zAxis, ref);
        return ref;
    }
}
VMath._Tmp3 = BABYLON.Vector3.Zero();
VMath._Tmp5 = BABYLON.Vector3.One();
VMath._Tmp4 = BABYLON.Vector3.Zero();
VMath._Tmp6 = BABYLON.Quaternion.Identity();
VMath._Tmp0 = BABYLON.Vector3.Zero();
VMath._Tmp1 = BABYLON.Vector3.Zero();
VMath._Tmp2 = BABYLON.Vector3.Zero();
class VertexDataLoader {
    constructor(scene) {
        this.scene = scene;
        this._vertexDatas = new Map();
        VertexDataLoader.instance = this;
    }
    static clone(data) {
        let clonedData = new BABYLON.VertexData();
        clonedData.positions = [...data.positions];
        clonedData.indices = [...data.indices];
        clonedData.normals = [...data.normals];
        if (data.matricesIndices) {
            clonedData.matricesIndices = [...data.matricesIndices];
        }
        if (data.matricesWeights) {
            clonedData.matricesWeights = [...data.matricesWeights];
        }
        if (data.uvs) {
            clonedData.uvs = [...data.uvs];
        }
        if (data.colors) {
            clonedData.colors = [...data.colors];
        }
        return clonedData;
    }
    async get(name) {
        if (this._vertexDatas.get(name)) {
            return this._vertexDatas.get(name);
        }
        let vertexData = undefined;
        let loadedFile = await BABYLON.SceneLoader.ImportMeshAsync("", "./datas/meshes/" + name + ".babylon", "", Main.Scene);
        let vertexDatas = [];
        let loadedFileMeshes = loadedFile.meshes.sort((m1, m2) => {
            if (m1.name < m2.name) {
                return -1;
            }
            else if (m1.name > m2.name) {
                return 1;
            }
            return 0;
        });
        for (let i = 0; i < loadedFileMeshes.length; i++) {
            let loadedMesh = loadedFileMeshes[i];
            if (loadedMesh instanceof BABYLON.Mesh) {
                vertexData = BABYLON.VertexData.ExtractFromMesh(loadedMesh);
                let colors = [];
                if (loadedMesh.material) {
                    if (loadedMesh.material instanceof BABYLON.PBRMaterial) {
                        let color = loadedMesh.material.albedoColor;
                        for (let k = 0; k < vertexData.positions.length / 3; k++) {
                            let index = k;
                            colors[4 * index] = color.r;
                            colors[4 * index + 1] = color.g;
                            colors[4 * index + 2] = color.b;
                            colors[4 * index + 3] = 1;
                        }
                    }
                    else if (loadedMesh.material instanceof BABYLON.MultiMaterial) {
                        for (let j = 0; j < loadedMesh.material.subMaterials.length; j++) {
                            let subMaterial = loadedMesh.material.subMaterials[j];
                            if (subMaterial instanceof BABYLON.PBRMaterial) {
                                let color = subMaterial.albedoColor;
                                let subMesh = loadedMesh.subMeshes.find(sm => { return sm.materialIndex === j; });
                                for (let k = 0; k < subMesh.verticesCount; k++) {
                                    let index = subMesh.verticesStart + k;
                                    colors[4 * index] = color.r;
                                    colors[4 * index + 1] = color.g;
                                    colors[4 * index + 2] = color.b;
                                    colors[4 * index + 3] = 1;
                                }
                            }
                        }
                    }
                }
                if (colors.length === 0) {
                    for (let i = 0; i < vertexData.positions.length / 3; i++) {
                        colors.push(1, 1, 1, 1);
                    }
                }
                vertexData.colors = colors;
                vertexDatas.push(vertexData);
            }
        }
        this._vertexDatas.set(name, vertexDatas);
        loadedFileMeshes.forEach(m => { m.dispose(); });
        loadedFile.skeletons.forEach(s => { s.dispose(); });
        return vertexDatas;
    }
    async getColorized(name, baseColorHex = "#FFFFFF", frameColorHex = "", color1Hex = "", // Replace red
    color2Hex = "", // Replace green
    color3Hex = "" // Replace blue
    ) {
        let vertexDatas = await this.getColorizedMultiple(name, baseColorHex, frameColorHex, color1Hex, color2Hex, color3Hex);
        return vertexDatas[0];
    }
    async getColorizedMultiple(name, baseColorHex = "#FFFFFF", frameColorHex = "", color1Hex = "", // Replace red
    color2Hex = "", // Replace green
    color3Hex = "" // Replace blue
    ) {
        let baseColor;
        if (baseColorHex !== "") {
            baseColor = BABYLON.Color3.FromHexString(baseColorHex);
        }
        let frameColor;
        if (frameColorHex !== "") {
            frameColor = BABYLON.Color3.FromHexString(frameColorHex);
        }
        let color1;
        if (color1Hex !== "") {
            color1 = BABYLON.Color3.FromHexString(color1Hex);
        }
        let color2;
        if (color2Hex !== "") {
            color2 = BABYLON.Color3.FromHexString(color2Hex);
        }
        let color3;
        if (color3Hex !== "") {
            color3 = BABYLON.Color3.FromHexString(color3Hex);
        }
        let vertexDatas = await VertexDataLoader.instance.get(name);
        let colorizedVertexDatas = [];
        for (let d = 0; d < vertexDatas.length; d++) {
            let vertexData = vertexDatas[d];
            let colorizedVertexData = VertexDataLoader.clone(vertexData);
            if (colorizedVertexData.colors) {
                for (let i = 0; i < colorizedVertexData.colors.length / 4; i++) {
                    let r = colorizedVertexData.colors[4 * i];
                    let g = colorizedVertexData.colors[4 * i + 1];
                    let b = colorizedVertexData.colors[4 * i + 2];
                    if (baseColor) {
                        if (r === 1 && g === 1 && b === 1) {
                            colorizedVertexData.colors[4 * i] = baseColor.r;
                            colorizedVertexData.colors[4 * i + 1] = baseColor.g;
                            colorizedVertexData.colors[4 * i + 2] = baseColor.b;
                            continue;
                        }
                    }
                    if (frameColor) {
                        if (r === 0.502 && g === 0.502 && b === 0.502) {
                            colorizedVertexData.colors[4 * i] = frameColor.r;
                            colorizedVertexData.colors[4 * i + 1] = frameColor.g;
                            colorizedVertexData.colors[4 * i + 2] = frameColor.b;
                            continue;
                        }
                    }
                    if (color1) {
                        if (r === 1 && g === 0 && b === 0) {
                            colorizedVertexData.colors[4 * i] = color1.r;
                            colorizedVertexData.colors[4 * i + 1] = color1.g;
                            colorizedVertexData.colors[4 * i + 2] = color1.b;
                            continue;
                        }
                    }
                    if (color2) {
                        if (r === 0 && g === 1 && b === 0) {
                            colorizedVertexData.colors[4 * i] = color2.r;
                            colorizedVertexData.colors[4 * i + 1] = color2.g;
                            colorizedVertexData.colors[4 * i + 2] = color2.b;
                            continue;
                        }
                    }
                    if (color3) {
                        if (r === 0 && g === 0 && b === 1) {
                            colorizedVertexData.colors[4 * i] = color3.r;
                            colorizedVertexData.colors[4 * i + 1] = color3.g;
                            colorizedVertexData.colors[4 * i + 2] = color3.b;
                            continue;
                        }
                    }
                }
            }
            else {
                let colors = [];
                for (let i = 0; i < colorizedVertexData.positions.length / 3; i++) {
                    colors[4 * i] = baseColor.r;
                    colors[4 * i + 1] = baseColor.g;
                    colors[4 * i + 2] = baseColor.b;
                    colors[4 * i + 3] = 1;
                }
                colorizedVertexData.colors = colors;
            }
            colorizedVertexDatas.push(colorizedVertexData);
        }
        return colorizedVertexDatas;
    }
}
class DebugDisplayColorInput extends HTMLElement {
    constructor() {
        super(...arguments);
        this._initialized = false;
        this._onInput = () => {
            let color = BABYLON.Color3.FromHexString(this._colorInput.value);
            this._colorFloat.innerText = color.r.toFixed(3) + ", " + color.g.toFixed(3) + ", " + color.b.toFixed(3);
            if (this.onInput) {
                this.onInput(color);
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
            let color = BABYLON.Color3.FromHexString(this._colorInput.value);
            this._colorFloat.innerText = color.r.toFixed(3) + ", " + color.g.toFixed(3) + ", " + color.b.toFixed(3);
            this._colorFloat.onclick = () => {
                navigator.clipboard.writeText(this._colorFloat.innerText);
            };
            this.appendChild(this._colorFloat);
            this._initialized = true;
            for (let i = 0; i < DebugDisplayFrameValue.observedAttributes.length; i++) {
                let name = DebugDisplayFrameValue.observedAttributes[i];
                let value = this.getAttribute(name);
                this.attributeChangedCallback(name, value + "_forceupdate", value);
            }
        }
    }
    setColor(color) {
        this._colorInput.value = color.toHexString();
        this._colorFloat.innerText = color.r.toFixed(3) + ", " + color.g.toFixed(3) + ", " + color.b.toFixed(3);
    }
}
customElements.define("debug-display-color-input", DebugDisplayColorInput);
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
customElements.define("debug-display-frame-value", DebugDisplayFrameValue);
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
customElements.define("debug-display-text-value", DebugDisplayTextValue);
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
customElements.define("debug-display-vector3-value", DebugDisplayVector3Value);
class DebugDefine {
}
DebugDefine.USE_VERTEX_SET_MESH_HISTORY = false;
DebugDefine.USE_CHUNCK_LEVEL_DEBUG_COLORS = false;
DebugDefine.SHOW_PLAYER_ARM_CURRENT_TARGET = false;
DebugDefine.SHOW_PLAYER_COLLISION_MESHES = false;
DebugDefine.SHOW_PLANET_CORNER_FLAGS = false;
DebugDefine.LOG_GLOBAL_START_TIME_PERFORMANCE = false;
DebugDefine.LOG_CHUNCK_VERTEXDATA_INIT_PERFORMANCE = false;
DebugDefine.LOG_PLANET_INSTANTIATE_PERFORMANCE = false;
DebugDefine.LOG_PLANETMAP_PERFORMANCE = false;
DebugDefine.LOG_INPUTMANAGER_GETPICKINGINFO_PERFORMANCE = false;
class DebugInput {
    constructor(player) {
        this.player = player;
        this._initialized = false;
        this._update = () => {
            this._playerHeadRight.addValue(this.player.inputHeadRight);
            this._playerHeadUp.addValue(this.player.inputHeadUp);
        };
    }
    get initialized() {
        return this._initialized;
    }
    get scene() {
        return this.player.scene;
    }
    initialize() {
        this.debugContainer = document.querySelector("#debug-container");
        if (!this.debugContainer) {
            this.debugContainer = document.createElement("div");
            this.debugContainer.id = "debug-container";
            document.body.appendChild(this.debugContainer);
        }
        this.container = document.querySelector("#debug-player-position");
        if (!this.container) {
            this.container = document.createElement("div");
            this.container.id = "debug-player-position";
            this.container.classList.add("debug", "hidden");
            this.debugContainer.appendChild(this.container);
        }
        let playerHeadRightId = "player-head-right";
        this._playerHeadRight = document.querySelector("#" + playerHeadRightId);
        if (!this._playerHeadRight) {
            this._playerHeadRight = document.createElement("debug-display-frame-value");
            this._playerHeadRight.id = playerHeadRightId;
            this._playerHeadRight.setAttribute("label", "Head X");
            this._playerHeadRight.setAttribute("min", "-1");
            this._playerHeadRight.setAttribute("max", "1");
            this.container.appendChild(this._playerHeadRight);
        }
        let playerHeadUpId = "player-head-up";
        this._playerHeadUp = document.querySelector("#" + playerHeadUpId);
        if (!this._playerHeadUp) {
            this._playerHeadUp = document.createElement("debug-display-frame-value");
            this._playerHeadUp.id = playerHeadUpId;
            this._playerHeadUp.setAttribute("label", "Head Y");
            this._playerHeadUp.setAttribute("min", "-1");
            this._playerHeadUp.setAttribute("max", "1");
            this.container.appendChild(this._playerHeadUp);
        }
        this._initialized = true;
    }
    show() {
        if (!this.initialized) {
            this.initialize();
        }
        this.container.classList.remove("hidden");
        this.scene.onBeforeRenderObservable.add(this._update);
    }
    hide() {
        this.container.classList.add("hidden");
        this.scene.onBeforeRenderObservable.removeCallback(this._update);
    }
}
class DebugPlanetPerf {
    constructor(game, _showLayer = false) {
        this.game = game;
        this._showLayer = _showLayer;
        this._initialized = false;
        this._update = () => {
            this._frameRate.addValue(Game.Engine.getFps());
            let sortRatio = 0;
            for (let i = 0; i < this.game.planets.length; i++) {
                sortRatio += this.game.planets[i].chunckManager.chunckSortedRatio * 100;
            }
            sortRatio /= this.game.planets.length;
            this._chunckSort.addValue(sortRatio);
            let needRedrawCount = 0;
            for (let i = 0; i < this.game.planets.length; i++) {
                needRedrawCount += this.game.planets[i].chunckManager.needRedrawCount;
            }
            this._drawRequestCount.addValue(needRedrawCount);
            this._chunckManagerWorking.setText(this.game.chunckManagerWorking ? "WORKING" : "IDLE");
            this._meshesCount.setText(this.game.scene.meshes.length.toFixed(0));
            if (this._showLayer) {
                for (let i = 0; i < 6; i++) {
                    let lodLayerCount = 0;
                    for (let j = 0; j < this.game.planets.length; j++) {
                        lodLayerCount += this.game.planets[j].chunckManager.lodLayerCount(i);
                    }
                    this._layerCounts[i].setText(lodLayerCount.toFixed(0));
                }
            }
        };
    }
    get initialized() {
        return this._initialized;
    }
    get scene() {
        return this.game.scene;
    }
    initialize() {
        this.debugContainer = document.querySelector("#debug-container");
        if (!this.debugContainer) {
            this.debugContainer = document.createElement("div");
            this.debugContainer.id = "debug-container";
            document.body.appendChild(this.debugContainer);
        }
        this.container = document.querySelector("#debug-planet-perf");
        if (!this.container) {
            this.container = document.createElement("div");
            this.container.id = "debug-planet-perf";
            this.container.classList.add("debug", "hidden");
            this.debugContainer.appendChild(this.container);
        }
        let frameRateId = "#frame-rate";
        this._frameRate = document.querySelector(frameRateId);
        if (!this._frameRate) {
            this._frameRate = document.createElement("debug-display-frame-value");
            this._frameRate.id = frameRateId;
            this._frameRate.setAttribute("label", "Frame Rate fps");
            this._frameRate.setAttribute("min", "0");
            this._frameRate.setAttribute("max", "60");
            this.container.appendChild(this._frameRate);
        }
        let chunckSortId = "#chunck-sort";
        this._chunckSort = document.querySelector("#chunck-sort");
        if (!this._chunckSort) {
            this._chunckSort = document.createElement("debug-display-frame-value");
            this._chunckSort.id = chunckSortId;
            this._chunckSort.setAttribute("label", "Chuncks Sort %");
            this._chunckSort.setAttribute("min", "0");
            this._chunckSort.setAttribute("max", "100");
            this.container.appendChild(this._chunckSort);
        }
        let drawRequestId = "#draw-request-count";
        this._drawRequestCount = document.querySelector(drawRequestId);
        if (!this._drawRequestCount) {
            this._drawRequestCount = document.createElement("debug-display-frame-value");
            this._drawRequestCount.id = drawRequestId;
            this._drawRequestCount.setAttribute("label", "Draw Requests");
            this._drawRequestCount.setAttribute("min", "0");
            this._drawRequestCount.setAttribute("max", "100");
            this.container.appendChild(this._drawRequestCount);
        }
        let chunckManagerWorkingId = "#chunck-manager-working";
        this._chunckManagerWorking = document.querySelector(chunckManagerWorkingId);
        if (!this._chunckManagerWorking) {
            this._chunckManagerWorking = document.createElement("debug-display-text-value");
            this._chunckManagerWorking.id = chunckManagerWorkingId;
            this._chunckManagerWorking.setAttribute("label", "ChunckManager");
            this.container.appendChild(this._chunckManagerWorking);
        }
        let meshesCountId = "#meshes-count";
        this._meshesCount = document.querySelector(meshesCountId);
        if (!this._meshesCount) {
            this._meshesCount = document.createElement("debug-display-text-value");
            this._meshesCount.id = meshesCountId;
            this._meshesCount.setAttribute("label", "Meshes Count");
            this.container.appendChild(this._meshesCount);
        }
        if (this._showLayer) {
            this._layerCounts = [];
            for (let i = 0; i < Config.performanceConfiguration.lodRanges.length; i++) {
                let id = "#layer-" + i + "-count";
                this._layerCounts[i] = document.querySelector(id);
                if (!this._layerCounts[i]) {
                    this._layerCounts[i] = document.createElement("debug-display-text-value");
                    this._layerCounts[i].id = id;
                    this._layerCounts[i].setAttribute("label", "Layer " + i);
                    this.container.appendChild(this._layerCounts[i]);
                }
            }
        }
        this._initialized = true;
    }
    show() {
        if (!this.initialized) {
            this.initialize();
        }
        this.container.classList.remove("hidden");
        this.scene.onBeforeRenderObservable.add(this._update);
    }
    hide() {
        this.container.classList.add("hidden");
        this.scene.onBeforeRenderObservable.removeCallback(this._update);
    }
}
class DebugPlanetSkyColor {
    constructor(game) {
        this.game = game;
        this._initialized = false;
    }
    get initialized() {
        return this._initialized;
    }
    initialize() {
        this.container = document.querySelector("#debug-planet-sky-color");
        let planetSky = this.game.planetSky;
        let inputDawnColor = document.querySelector("#planet-sky-dawn-color");
        inputDawnColor.setColor(planetSky.dawnColor);
        inputDawnColor.onInput = (color) => {
            planetSky.dawnColor.copyFrom(color);
        };
        let inputZenithColor = document.querySelector("#planet-sky-zenith-color");
        inputZenithColor.setColor(planetSky.zenithColor);
        inputZenithColor.onInput = (color) => {
            planetSky.zenithColor.copyFrom(color);
        };
        let inputNightColor = document.querySelector("#planet-sky-night-color");
        inputNightColor.setColor(planetSky.nightColor);
        inputNightColor.onInput = (color) => {
            planetSky.nightColor.copyFrom(color);
        };
        this._initialized = true;
    }
    show() {
        if (!this.initialized) {
            this.initialize();
        }
        this.container.classList.remove("hidden");
    }
    hide() {
        this.container.classList.add("hidden");
    }
}
class DebugPlayerPosition {
    constructor(player) {
        this.player = player;
        this._initialized = false;
        this._update = () => {
            let position = this.player.position.clone().add(this.player.upDirection.scale(0.1));
            let longitude = -VMath.AngleFromToAround(BABYLON.Axis.Z, position, BABYLON.Axis.Y) / Math.PI * 180;
            let latitude = 0;
            let heading = 0;
            if (position.y * position.y === position.lengthSquared()) {
                latitude = Math.sign(position.y) * 90;
            }
            else {
                let equatorPosition = position.clone();
                equatorPosition.y = 0;
                let axis = BABYLON.Vector3.Cross(position, BABYLON.Axis.Y);
                if (axis.lengthSquared() > 0) {
                    latitude = VMath.AngleFromToAround(equatorPosition, position, axis) / Math.PI * 180;
                }
                if (this.player.planet) {
                    let northPole = new BABYLON.Vector3(0, this.player.planet.kPosMax * PlanetTools.CHUNCKSIZE, 0);
                    let northDir = northPole.subtract(position);
                    let dir = this.player.forward;
                    heading = VMath.AngleFromToAround(northDir, dir, position) / Math.PI * 180;
                }
            }
            this._playerCoordinates.setText("Lat " + latitude.toFixed(0) + "° Lon " + longitude.toFixed(0) + "° Hdg " + heading.toFixed(0) + "°");
            this._playerPosition.setValue(position);
            if (this.player.planet) {
                let planetSide = PlanetTools.PlanetPositionToPlanetSide(this.player.planet, position);
                let quat = planetSide.rotationQuaternion.clone();
                let localPos = position.clone();
                position.rotateByQuaternionToRef(quat, localPos);
                this._playerLocalPosition.setValue(localPos);
                this._playerSide.setText(SideNames[planetSide.side]);
                let globalIJK = PlanetTools.PlanetPositionToGlobalIJK(planetSide, position);
                this._playerGlobalIJK.setValue(globalIJK);
                let localIJK = PlanetTools.GlobalIJKToLocalIJK(planetSide, globalIJK);
                if (localIJK) {
                    let chunck = localIJK.planetChunck;
                    this._playerChunck.setValue(chunck.iPos, chunck.jPos, chunck.kPos);
                    this._playerLocalIJK.setValue(localIJK);
                }
            }
        };
    }
    get initialized() {
        return this._initialized;
    }
    get scene() {
        return this.player.scene;
    }
    initialize() {
        this.debugContainer = document.querySelector("#debug-container");
        if (!this.debugContainer) {
            this.debugContainer = document.createElement("div");
            this.debugContainer.id = "debug-container";
            document.body.appendChild(this.debugContainer);
        }
        this.container = document.querySelector("#debug-player-position");
        if (!this.container) {
            this.container = document.createElement("div");
            this.container.id = "debug-player-position";
            this.container.classList.add("debug", "hidden");
            this.debugContainer.appendChild(this.container);
        }
        let playerCoordinatesId = "#player-coordinates";
        this._playerCoordinates = document.querySelector(playerCoordinatesId);
        if (!this._playerCoordinates) {
            this._playerCoordinates = document.createElement("debug-display-text-value");
            this._playerCoordinates.id = playerCoordinatesId;
            this._playerCoordinates.setAttribute("label", "Coordinates");
            this.container.appendChild(this._playerCoordinates);
        }
        let playerPositionId = "player-position";
        this._playerPosition = document.querySelector("#" + playerPositionId);
        if (!this._playerPosition) {
            this._playerPosition = document.createElement("debug-display-vector3-value");
            this._playerPosition.id = playerPositionId;
            this._playerPosition.setAttribute("label", "Position");
            this.container.appendChild(this._playerPosition);
        }
        let playerLocalPositionId = "player-local-position";
        this._playerLocalPosition = document.querySelector("#" + playerLocalPositionId);
        if (!this._playerLocalPosition) {
            this._playerLocalPosition = document.createElement("debug-display-vector3-value");
            this._playerLocalPosition.id = playerLocalPositionId;
            this._playerLocalPosition.setAttribute("label", "Local Pos");
            this.container.appendChild(this._playerLocalPosition);
        }
        let playerSideId = "#player-planet-side";
        this._playerSide = document.querySelector(playerSideId);
        if (!this._playerSide) {
            this._playerSide = document.createElement("debug-display-text-value");
            this._playerSide.id = playerSideId;
            this._playerSide.setAttribute("label", "Side");
            this.container.appendChild(this._playerSide);
        }
        let playerGlobalIJKId = "player-global-ijk";
        this._playerGlobalIJK = document.querySelector("#" + playerGlobalIJKId);
        if (!this._playerGlobalIJK) {
            this._playerGlobalIJK = document.createElement("debug-display-vector3-value");
            this._playerGlobalIJK.id = playerGlobalIJKId;
            this._playerGlobalIJK.setAttribute("label", "Global IJK");
            this.container.appendChild(this._playerGlobalIJK);
        }
        let playerChunckId = "player-chunck";
        this._playerChunck = document.querySelector("#" + playerChunckId);
        if (!this._playerChunck) {
            this._playerChunck = document.createElement("debug-display-vector3-value");
            this._playerChunck.id = playerChunckId;
            this._playerChunck.setAttribute("label", "Player Chunck");
            this.container.appendChild(this._playerChunck);
        }
        let playerLocalIJKId = "player-local-ijk";
        this._playerLocalIJK = document.querySelector("#" + playerLocalIJKId);
        if (!this._playerLocalIJK) {
            this._playerLocalIJK = document.createElement("debug-display-vector3-value");
            this._playerLocalIJK.id = playerLocalIJKId;
            this._playerLocalIJK.setAttribute("label", "Local IJK");
            this.container.appendChild(this._playerLocalIJK);
        }
        this._initialized = true;
    }
    show() {
        if (!this.initialized) {
            this.initialize();
        }
        this.container.classList.remove("hidden");
        this.scene.onBeforeRenderObservable.add(this._update);
    }
    hide() {
        this.container.classList.add("hidden");
        this.scene.onBeforeRenderObservable.removeCallback(this._update);
    }
}
class DebugTerrainColor {
    constructor() {
        this._initialized = false;
    }
    get initialized() {
        return this._initialized;
    }
    initialize() {
        this.container = document.querySelector("#debug-terrain-color");
        if (!this.container) {
            this.container = document.createElement("div");
            this.container.id = "debug-terrain-color";
            this.container.classList.add("debug", "hidden");
            document.querySelector("#meshes-info").appendChild(this.container);
        }
        for (let i = BlockType.Water; i < BlockType.Unknown; i++) {
            let blockType = i;
            let id = "#terrain-" + BlockTypeNames[blockType].toLowerCase() + "-color";
            let input = document.querySelector(id);
            if (!input) {
                input = document.createElement("debug-display-color-input");
                input.id = id;
                input.setAttribute("label", BlockTypeNames[blockType]);
                this.container.appendChild(input);
            }
            input.setColor(SharedMaterials.MainMaterial().getColor(blockType));
            input.onInput = (color) => {
                SharedMaterials.MainMaterial().setColor(blockType, color);
            };
        }
        this._initialized = true;
    }
    show() {
        if (!this.initialized) {
            this.initialize();
        }
        this.container.classList.remove("hidden");
    }
    hide() {
        this.container.classList.add("hidden");
    }
}
class Altimeter3D {
    constructor(player) {
        this.player = player;
        this._x = BABYLON.Vector3.Right();
        this._y = BABYLON.Vector3.Up();
        this._z = BABYLON.Vector3.Forward();
        this._update = () => {
            if (this.player.planet && this.player.planet != this._previousPlanet) {
                this.redrawMesh();
                this._previousPlanet = this.player.planet;
            }
            if (this.lineMesh) {
                let camera;
                if (this.player.planet) {
                    this.lineMesh.position.copyFrom(this.player.planet.position);
                }
                if (this.scene.activeCameras && this.scene.activeCameras.length > 0) {
                    camera = this.scene.activeCameras[0];
                }
                else {
                    camera = this.scene.activeCamera;
                }
                if (camera) {
                    let camDir = camera.getForwardRay().direction;
                    this._y.copyFrom(camDir).scaleInPlace(4).addInPlace(camera.globalPosition.subtract(this.lineMesh.position)).normalize();
                    this._z.copyFrom(camDir);
                    BABYLON.Vector3.CrossToRef(this._y, this._z, this._x);
                    BABYLON.Vector3.CrossToRef(this._x, this._y, this._z);
                    BABYLON.Quaternion.RotationQuaternionFromAxisToRef(this._x, this._y, this._z, this.lineMesh.rotationQuaternion);
                }
            }
        };
    }
    get scene() {
        return this.player.scene;
    }
    instantiate() {
        this.redrawMesh();
        this.scene.onBeforeRenderObservable.add(this._update);
    }
    redrawMesh() {
        if (this.player.planet) {
            let lines = [];
            for (let k = 0; k < this.player.planet.kPosMax * PlanetTools.CHUNCKSIZE; k++) {
                let altitude = PlanetTools.KGlobalToAltitude(k);
                lines.push([new BABYLON.Vector3(0, altitude, 0), new BABYLON.Vector3(1, altitude, 0)]);
            }
            let count = lines.length;
            lines.push([lines[0][0], lines[count - 1][0]]);
            if (this.lineMesh) {
                this.lineMesh.dispose();
            }
            this.lineMesh = BABYLON.MeshBuilder.CreateLineSystem("altimeter3D", { lines: lines }, this.scene);
            this.lineMesh.rotationQuaternion = BABYLON.Quaternion.Identity();
            this.lineMesh.layerMask = 0x1;
            for (let k = 0; k < this.player.planet.kPosMax * PlanetTools.CHUNCKSIZE; k++) {
                let altitude = PlanetTools.KGlobalToAltitude(k);
                let value = new Number3D("value-" + k, k, 0.5);
                value.redraw();
                value.position.x = 1;
                value.position.y = altitude + 0.1;
                value.parent = this.lineMesh;
            }
        }
    }
}
class Number3D extends BABYLON.LinesMesh {
    constructor(name, value, height = 0.5) {
        super(name);
        this.value = value;
        this.height = height;
    }
    get digitSize() {
        return this.height * 0.5;
    }
    get halfDigitSize() {
        return this.digitSize * 0.5;
    }
    get quaterDigitSize() {
        return this.halfDigitSize * 0.5;
    }
    _getDigitLine(n) {
        if (n === 0) {
            return [
                new BABYLON.Vector3(0, 0, 0),
                new BABYLON.Vector3(0, this.digitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, this.digitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, 0, 0),
                new BABYLON.Vector3(0, 0, 0)
            ];
        }
        if (n === 1) {
            return [
                new BABYLON.Vector3(this.halfDigitSize, 0, 0),
                new BABYLON.Vector3(this.halfDigitSize, this.digitSize, 0)
            ];
        }
        if (n === 2) {
            return [
                new BABYLON.Vector3(0, this.digitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, this.digitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, this.halfDigitSize, 0),
                new BABYLON.Vector3(0, this.halfDigitSize, 0),
                new BABYLON.Vector3(0, 0, 0),
                new BABYLON.Vector3(this.halfDigitSize, 0, 0)
            ];
        }
        if (n === 3) {
            return [
                new BABYLON.Vector3(0, this.digitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, this.digitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, this.halfDigitSize, 0),
                new BABYLON.Vector3(0, this.halfDigitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, this.halfDigitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, 0, 0),
                new BABYLON.Vector3(0, 0, 0)
            ];
        }
        if (n === 4) {
            return [
                new BABYLON.Vector3(0, this.digitSize, 0),
                new BABYLON.Vector3(0, this.halfDigitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, this.halfDigitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, this.digitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, 0, 0)
            ];
        }
        if (n === 5) {
            return [
                new BABYLON.Vector3(this.halfDigitSize, this.digitSize, 0),
                new BABYLON.Vector3(0, this.digitSize, 0),
                new BABYLON.Vector3(0, this.halfDigitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, this.halfDigitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, 0, 0),
                new BABYLON.Vector3(0, 0, 0)
            ];
        }
        if (n === 6) {
            return [
                new BABYLON.Vector3(0, this.halfDigitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, this.halfDigitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, 0, 0),
                new BABYLON.Vector3(0, 0, 0),
                new BABYLON.Vector3(0, this.digitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, this.digitSize, 0)
            ];
        }
        if (n === 7) {
            return [
                new BABYLON.Vector3(this.halfDigitSize, 0, 0),
                new BABYLON.Vector3(this.halfDigitSize, this.digitSize, 0),
                new BABYLON.Vector3(0, this.digitSize, 0)
            ];
        }
        if (n === 8) {
            return [
                new BABYLON.Vector3(this.halfDigitSize, this.halfDigitSize, 0),
                new BABYLON.Vector3(0, this.halfDigitSize, 0),
                new BABYLON.Vector3(0, 0, 0),
                new BABYLON.Vector3(this.halfDigitSize, 0, 0),
                new BABYLON.Vector3(this.halfDigitSize, this.digitSize, 0),
                new BABYLON.Vector3(0, this.digitSize, 0),
                new BABYLON.Vector3(0, this.halfDigitSize, 0)
            ];
        }
        if (n === 9) {
            return [
                new BABYLON.Vector3(this.halfDigitSize, this.halfDigitSize, 0),
                new BABYLON.Vector3(0, this.halfDigitSize, 0),
                new BABYLON.Vector3(0, this.digitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, this.digitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, 0, 0),
                new BABYLON.Vector3(0, 0, 0)
            ];
        }
    }
    redraw() {
        let stringValue = this.value.toFixed(0);
        let lines = [];
        let x = 0;
        for (let i = 0; i < stringValue.length; i++) {
            let digit = parseInt(stringValue[i]);
            let digitLines = this._getDigitLine(digit);
            if (digitLines) {
                digitLines.forEach(v => {
                    v.x += x;
                });
                lines.push(digitLines);
            }
            x += this.halfDigitSize + this.quaterDigitSize;
        }
        BABYLON.CreateLineSystemVertexData({ lines: lines }).applyToMesh(this);
    }
}
/// <reference path="../../lib/babylon.d.ts"/>
/// <reference path="../Main.ts"/>
class ChunckTest extends Main {
    constructor(canvasElement) {
        super(canvasElement);
        this.path = [];
        ChunckTest.DEBUG_INSTANCE = this;
    }
    createScene() {
        super.createScene();
        this.scene.clearColor = BABYLON.Color4.FromHexString("#218db5ff");
        this.light = new BABYLON.HemisphericLight("light", (new BABYLON.Vector3(0.5, 2.5, 1.5)).normalize(), this.scene);
        this.light.diffuse = new BABYLON.Color3(0.7, 0.7, 0.7);
        this.light.groundColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        this.camera = new BABYLON.ArcRotateCamera("camera", -3 * Math.PI / 4, Math.PI / 4, 50, BABYLON.Vector3.Zero());
        this.camera.attachControl();
    }
    async initialize() {
        //Config.chunckPartConfiguration.setFilename("round-smooth-chunck-parts", false);
        //Config.chunckPartConfiguration.setLodMin(0, false);
        //Config.chunckPartConfiguration.setLodMax(1);
        //Config.chunckPartConfiguration.useXZAxisRotation = false;
        Config.chunckPartConfiguration.setFilename("round-smooth-chunck-parts", false);
        Config.chunckPartConfiguration.useXZAxisRotation = false;
        Config.chunckPartConfiguration.setLodMin(0);
        Config.chunckPartConfiguration.setLodMax(1);
        let lod = 0;
        let mainMaterial = new BABYLON.StandardMaterial("main-material");
        mainMaterial.specularColor.copyFromFloats(0.1, 0.1, 0.1);
        mainMaterial.diffuseColor = BABYLON.Color3.FromHexString("#624dfa");
        let sideMaterialOk = new BABYLON.StandardMaterial("side-material");
        sideMaterialOk.specularColor.copyFromFloats(0.1, 0.1, 0.1);
        sideMaterialOk.diffuseColor = BABYLON.Color3.FromHexString("#4dfa62");
        let sideMaterialMiss = new BABYLON.StandardMaterial("side-material");
        sideMaterialMiss.specularColor.copyFromFloats(0.1, 0.1, 0.1);
        sideMaterialMiss.diffuseColor = BABYLON.Color3.FromHexString("#fa624d");
        return new Promise(resolve => {
            PlanetChunckVertexData.InitializeData().then(() => {
                for (let i = 0; i < 16; i++) {
                    for (let j = 0; j < 16; j++) {
                        let mainRef = i + 16 * j;
                        if (mainRef != 0b00000000 && mainRef != 0b11111111) {
                            let mat = sideMaterialOk;
                            if (!PlanetChunckVertexData.Get(lod, mainRef)) {
                                console.warn(mainRef.toString(2).padStart(8, "0").split("").reverse().join("") + " is missing.");
                                mat = sideMaterialMiss;
                            }
                            let grid = [
                                [
                                    [0, 0, 0, 0],
                                    [0, 0, 0, 0],
                                    [0, 0, 0, 0],
                                    [0, 0, 0, 0]
                                ],
                                [
                                    [0, 0, 0, 0],
                                    [0, mainRef & 0b1 << 0, mainRef & 0b1 << 4, 0],
                                    [0, mainRef & 0b1 << 3, mainRef & 0b1 << 7, 0],
                                    [0, 0, 0, 0]
                                ],
                                [
                                    [0, 0, 0, 0],
                                    [0, mainRef & 0b1 << 1, mainRef & 0b1 << 5, 0],
                                    [0, mainRef & 0b1 << 2, mainRef & 0b1 << 6, 0],
                                    [0, 0, 0, 0]
                                ],
                                [
                                    [0, 0, 0, 0],
                                    [0, 0, 0, 0],
                                    [0, 0, 0, 0],
                                    [0, 0, 0, 0]
                                ]
                            ];
                            for (let ii = 0; ii < 3; ii++) {
                                for (let jj = 0; jj < 3; jj++) {
                                    for (let kk = 0; kk < 3; kk++) {
                                        let ref = 0b0;
                                        let d0 = grid[ii][jj][kk];
                                        if (d0) {
                                            ref |= 0b1 << 0;
                                        }
                                        let d1 = grid[ii + 1][jj][kk];
                                        if (d1) {
                                            ref |= 0b1 << 1;
                                        }
                                        let d2 = grid[ii + 1][jj + 1][kk];
                                        if (d2) {
                                            ref |= 0b1 << 2;
                                        }
                                        let d3 = grid[ii][jj + 1][kk];
                                        if (d3) {
                                            ref |= 0b1 << 3;
                                        }
                                        let d4 = grid[ii][jj][kk + 1];
                                        if (d4) {
                                            ref |= 0b1 << 4;
                                        }
                                        let d5 = grid[ii + 1][jj][kk + 1];
                                        if (d5) {
                                            ref |= 0b1 << 5;
                                        }
                                        let d6 = grid[ii + 1][jj + 1][kk + 1];
                                        if (d6) {
                                            ref |= 0b1 << 6;
                                        }
                                        let d7 = grid[ii][jj + 1][kk + 1];
                                        if (d7) {
                                            ref |= 0b1 << 7;
                                        }
                                        if (ref != 0b00000000 && ref != 0b11111111) {
                                            let part = PlanetChunckVertexData.Get(lod, ref);
                                            if (part) {
                                                let mesh = new BABYLON.Mesh("part-mesh");
                                                part.vertexData.colors = part.vertexData.colors.map((c) => { return 1; });
                                                part.vertexData.applyToMesh(mesh);
                                                if (ii === 1 && jj === 1 && kk === 1) {
                                                    mesh.material = mainMaterial;
                                                }
                                                else {
                                                    mesh.material = mat;
                                                }
                                                mesh.position.x = i * 3 - 23 - 1 + ii;
                                                mesh.position.y = -1 + kk;
                                                mesh.position.z = j * 3 - 23 - 1 + jj;
                                                mesh.freezeWorldMatrix();
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                resolve();
            });
        });
    }
    update() {
        this.camera.target.y = 0;
    }
}
/// <reference path="../../lib/babylon.d.ts"/>
class Demo extends Main {
    constructor(canvasElement) {
        super(canvasElement);
        this.inputMode = InputMode.Unknown;
        this.path = [];
        Demo.DEBUG_INSTANCE = this;
    }
    createScene() {
        super.createScene();
        this.light = new BABYLON.HemisphericLight("light", (new BABYLON.Vector3(0.5, 2.5, 1.5)).normalize(), this.scene);
        this.light.diffuse = new BABYLON.Color3(1, 1, 1);
        this.light.groundColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        this.cameraManager = new CameraManager(this);
        this.cameraManager.arcRotateCamera.lowerRadiusLimit = 130;
        this.cameraManager.arcRotateCamera.upperRadiusLimit = 350;
    }
    async initialize() {
        await super.initialize();
        Config.chunckPartConfiguration.setFilename("round-smooth-chunck-parts", false);
        Config.chunckPartConfiguration.setLodMin(0, false);
        Config.chunckPartConfiguration.setLodMax(1);
        Config.chunckPartConfiguration.useXZAxisRotation = false;
        return new Promise(resolve => {
            let kPosMax = 7;
            let planetTest = PlanetGeneratorFactory.Create(BABYLON.Vector3.Zero(), PlanetGeneratorType.Mars, kPosMax, this.scene);
            planetTest.instantiate();
            //let moon: Planet = new Planet("Moon", 2, 0.60, this.scene);
            //moon.position.x = 160;
            //moon.initialize();
            this.planets = [planetTest];
            window["PlanetTest"] = planetTest;
            //let p = new BABYLON.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().scaleInPlace((kPosMax + 1) * PlanetTools.CHUNCKSIZE * 0.75);
            //planetTest.generator = new PlanetGeneratorHole(planetTest, 0.60, 0.15, p, 40);
            //planetTest.generator.showDebug();
            this.planetSky = new PlanetSky(undefined, this.scene);
            this.planetSky.setInvertLightDir((new BABYLON.Vector3(0.5, 2.5, 1.5)).normalize());
            this.planetSky.initialize();
            this.planetSky.player = this.player;
            this.player = new Player(new BABYLON.Vector3(0, (kPosMax + 1) * PlanetTools.CHUNCKSIZE * 0.8, 0), this);
            this.cameraManager.player = this.player;
            this.player.lockInPlace = true;
            let debugPlanetPerf = new DebugPlanetPerf(this);
            debugPlanetPerf.show();
            //let debugAltimeter = new Altimeter3D(planetTest);
            //debugAltimeter.instantiate();
            this.scene.onPointerObservable.add((eventData) => {
                if (eventData.type === BABYLON.PointerEventTypes.POINTERDOUBLETAP) {
                    if (eventData.pickInfo.hit) {
                        let p = eventData.pickInfo.pickedPoint;
                        if (isFinite(p.x)) {
                            p = p.add(BABYLON.Vector3.Normalize(p).scale(1));
                            if (this.cameraManager.cameraMode === CameraMode.Sky) {
                                this.player.position.copyFrom(this.cameraManager.absolutePosition);
                            }
                            this.player.animatePos(p, 1, true);
                            this.cameraManager.setMode(CameraMode.Player);
                            document.querySelector("#sky-view").style.display = "flex";
                            document.querySelector("#ground-view").style.display = "none";
                        }
                        else {
                            debugger;
                        }
                    }
                }
            });
            document.querySelector("#sky-view").addEventListener("pointerdown", () => {
                this.cameraManager.setMode(CameraMode.Sky);
                document.querySelector("#sky-view").style.display = "none";
                document.querySelector("#ground-view").style.display = "flex";
            });
            document.querySelector("#sky-view").style.display = "none";
            PlanetChunckVertexData.InitializeData().then(() => {
                this.player.initialize();
                this.player.registerControl();
                planetTest.register();
                //moon.register();
                resolve();
            });
            this.canvas.addEventListener("pointerup", (event) => {
                if (this.cameraManager.cameraMode === CameraMode.Sky) {
                    return;
                }
                this.inputMode = InputMode.Mouse;
            });
        });
    }
    update() {
    }
}
/// <reference path="../../lib/babylon.d.ts"/>
var InputMode;
(function (InputMode) {
    InputMode[InputMode["Unknown"] = 0] = "Unknown";
    InputMode[InputMode["Mouse"] = 1] = "Mouse";
    InputMode[InputMode["Touch"] = 2] = "Touch";
})(InputMode || (InputMode = {}));
class Game extends Main {
    constructor(canvasElement) {
        super(canvasElement);
        this.inputMode = InputMode.Unknown;
        Game.Instance = this;
    }
    createScene() {
        super.createScene();
        Game.Light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0.6, 1, 0.3), this.scene);
        Game.Light.diffuse = new BABYLON.Color3(1, 1, 1);
        Game.Light.groundColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        Game.CameraManager = new CameraManager(this);
        this.cameraManager = Game.CameraManager;
    }
    async initialize() {
        await super.initialize();
        Config.chunckPartConfiguration.setFilename("round-smooth-chunck-parts", false);
        Config.chunckPartConfiguration.setLodMin(0, false);
        Config.chunckPartConfiguration.setLodMax(1);
        Config.chunckPartConfiguration.useXZAxisRotation = false;
        Config.controlConfiguration.canLockPointer = true;
        return new Promise(resolve => {
            let kPosMax = 7;
            let planetTest = PlanetGeneratorFactory.Create(BABYLON.Vector3.Zero(), PlanetGeneratorType.Earth, kPosMax, this.scene);
            planetTest.instantiate();
            window["PlanetTest"] = planetTest;
            Game.Player = new Player(new BABYLON.Vector3(0, (kPosMax + 1) * PlanetTools.CHUNCKSIZE * 0.8, 0), this);
            this.player = Game.Player;
            this.actionManager = new PlayerActionManager(this.player, this);
            this.actionManager.initialize();
            let ass = async () => {
                let slotIndex = 1;
                for (let i = BlockType.Grass; i < BlockType.Unknown; i++) {
                    this.actionManager.linkAction(await PlayerActionTemplate.CreateBlockAction(this.player, i), slotIndex);
                    slotIndex++;
                }
            };
            ass();
            this.player.registerControl();
            //Game.Plane = new Plane(new BABYLON.Vector3(0, 80, 0), planetTest);
            //Game.Plane.instantiate();
            //Game.CameraManager.plane = Game.Plane;
            Game.CameraManager.player = this.player;
            Game.CameraManager.setMode(CameraMode.Player);
            //planetTest.AsyncInitialize();
            this.planetSky = new PlanetSky(undefined, this.scene);
            this.planetSky.setInvertLightDir((new BABYLON.Vector3(0.5, 2.5, 1.5)).normalize());
            this.planetSky.initialize();
            this.planetSky.player = this.player;
            PlanetChunckVertexData.InitializeData().then(() => {
                planetTest.register();
                this.player.initialize();
                let debugPlanetPerf = new DebugPlanetPerf(this);
                debugPlanetPerf.show();
                //let debugPlanetSkyColor = new DebugPlanetSkyColor(this);
                //debugPlanetSkyColor.show();
                let debugTerrainColor = new DebugTerrainColor();
                debugTerrainColor.show();
                let debugPlayerPosition = new DebugPlayerPosition(this.player);
                debugPlayerPosition.show();
                resolve();
            });
            this.canvas.addEventListener("pointerup", (event) => {
                if (Game.CameraManager.cameraMode === CameraMode.Sky) {
                    return;
                }
                if (event["pointerType"] === "mouse") {
                    this.setInputMode(InputMode.Mouse);
                }
            });
            this.canvas.addEventListener("touchstart", (event) => {
                this.setInputMode(InputMode.Touch);
            });
        });
    }
    update() {
    }
    setInputMode(newInputMode) {
        if (newInputMode != this.inputMode) {
            this.inputMode = newInputMode;
            if (this.inputMode === InputMode.Touch) {
                this.movePad = new PlayerInputMovePad(this.player);
                this.movePad.connectInput(true);
                this.headPad = new PlayerInputHeadPad(this.player);
                this.headPad.connectInput(false);
                this.actionButton = new PlayerInputVirtualButton(this.player);
                this.actionButton.connectInput(() => {
                    if (this.player.currentAction) {
                        if (this.player.currentAction.onClick) {
                            this.player.currentAction.onClick();
                        }
                    }
                });
            }
            else {
                if (this.movePad) {
                    this.movePad.disconnect();
                }
                if (this.headPad) {
                    this.headPad.disconnect();
                }
            }
            return;
        }
    }
    static UnlockMouse() {
        document.exitPointerLock();
        console.log("Unlock");
    }
}
Game.ShowDebugPlanetHeightMap = false;
Game.DebugLodDistanceFactor = 100;
/// <reference path="../../lib/babylon.d.ts"/>
class MainMenu extends Main {
    createScene() {
        super.createScene();
        let light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0.6, 1, 0.3), this.scene);
        light.diffuse = new BABYLON.Color3(1, 1, 1);
        light.groundColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        this.scene.clearColor.copyFromFloats(0, 0, 0, 1);
    }
    async initialize() {
        let timers;
        let logOutput;
        let useLog = DebugDefine.LOG_GLOBAL_START_TIME_PERFORMANCE;
        if (useLog) {
            timers = [];
            timers.push(performance.now());
            logOutput = "main initialize starts at " + timers[0].toFixed(0) + " ms";
        }
        await super.initialize();
        if (useLog) {
            timers.push(performance.now());
            logOutput += "\n  super.initialize executed in " + (timers[timers.length - 1] - timers[timers.length - 2]).toFixed(0) + " ms";
        }
        Config.chunckPartConfiguration.setFilename("round-smooth-chunck-parts", false);
        Config.chunckPartConfiguration.useXZAxisRotation = false;
        Config.chunckPartConfiguration.setLodMin(0);
        Config.chunckPartConfiguration.setLodMax(1);
        //Config.chunckPartConfiguration.useXZAxisRotation = false;
        let confPreset = window.localStorage.getItem("graphic-setting-preset");
        if (confPreset === ConfigurationPreset.Low) {
            Config.setConfLowPreset();
        }
        else if (confPreset === ConfigurationPreset.Medium) {
            Config.setConfMediumPreset();
        }
        else if (confPreset === ConfigurationPreset.High) {
            Config.setConfHighPreset();
        }
        else {
            window.localStorage.setItem("graphic-setting-preset", ConfigurationPreset.None);
        }
        return new Promise(resolve => {
            this.tutorialManager = new TutorialManager(this);
            this.skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 6000 / Math.sqrt(3) }, Main.Scene);
            this.skybox.rotation.y = Math.PI / 2;
            let skyboxMaterial = new BABYLON.StandardMaterial("skyBox", Main.Scene);
            skyboxMaterial.backFaceCulling = false;
            let skyTexture = new BABYLON.CubeTexture("./datas/skyboxes/dark", Main.Scene, ["-px.png", "-py.png", "-pz.png", "-nx.png", "-ny.png", "-nz.png"]);
            skyboxMaterial.reflectionTexture = skyTexture;
            skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
            skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
            skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
            this.skybox.material = skyboxMaterial;
            //let testGrab = new TestGrab("test-grab", this);
            //testGrab.position = new BABYLON.Vector3(- 0.3, this._testAltitude + 1.1, - 0.1);
            //testGrab.instantiate();
            let mainMenuPlanet = PlanetGeneratorFactory.Create(BABYLON.Vector3.Zero(), PlanetGeneratorType.Moon, 2, this.scene);
            mainMenuPlanet.instantiate();
            this.planets = [mainMenuPlanet];
            let dir = new BABYLON.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
            dir.normalize();
            dir.copyFromFloats(0, 1, 0);
            let side = PlanetTools.PlanetPositionToPlanetSide(mainMenuPlanet, dir);
            let globalIJK = PlanetTools.PlanetDirectionToGlobalIJK(mainMenuPlanet, dir);
            let pos = PlanetTools.GlobalIJKToPlanetPosition(side, globalIJK);
            //let cubeTest = BABYLON.MeshBuilder.CreateBox("cube-test");
            //cubeTest.position.copyFrom(pos);
            pos = pos.clone();
            let l = pos.length();
            this.player = new Player(pos, this);
            this.cameraManager.player = this.player;
            this.cameraManager.setMode(CameraMode.Player);
            /*
            let debugPlanetPerf = new DebugPlanetPerf(this, true);
            debugPlanetPerf.show();

            let debugPlayerPosition = new DebugPlayerPosition(this.player);
            debugPlayerPosition.show();

            let debugInput = new DebugInput(this.player);
            debugInput.show();
            */
            this.planetSky = new PlanetSky(this.skybox, this.scene);
            this.planetSky.setInvertLightDir(BABYLON.Vector3.One().normalize());
            this.planetSky.initialize();
            this.planetSky.player = this.player;
            let mainPanel = new MainMenuPanel(100, this);
            mainPanel.instantiate();
            mainPanel.register();
            mainPanel.planet = mainMenuPlanet;
            PlanetChunckVertexData.InitializeData().then(async () => {
                this.generatePlanets();
                this.planets.forEach(p => {
                    p.register();
                });
                this.inputManager.initialize(this.player);
                this.onChunckManagerNotWorking(async () => {
                    await this.player.initialize();
                    this.player.registerControlUIOnly();
                    setTimeout(() => {
                        hideLoading();
                        setTimeout(() => {
                            mainPanel.openAtPlayerPosition();
                        }, 1000);
                        /*
                        this.subtitleManager.add(Subtitle.Create(
                            ["Use joystick ", "<span class='joystick'>R</span>", " to look around."],
                            3
                        ));
                        this.subtitleManager.add(Subtitle.Create(
                            ["Hold clic ", "<img src='datas/icons/mouse-left.svg'/>", " and rotate to look around."],
                            3
                        ));
                        this.subtitleManager.add(Subtitle.Create(
                            ["Touch ", "<img src='datas/icons/touch-icon.svg'/>", " and rotate to look around."],
                            3
                        ));

                        this.subtitleManager.add(Subtitle.Create(
                            ["Use joystick ", "<span class='joystick'>L</span>", " to move."],
                            3
                        ));
                        this.subtitleManager.add(Subtitle.Create(
                            [
                                "Press ",
                                "<span class='keyboard'>W</span>",
                                ", ",
                                "<span class='keyboard'>A</span>",
                                ", ",
                                "<span class='keyboard'>S</span>",
                                " and ",
                                "<span class='keyboard'>D</span>",
                                " to move."
                            ],
                            3
                        ));
                        this.subtitleManager.add(Subtitle.Create(
                            ["Hold clic ", "<img src='datas/icons/mouse-left.svg'/>", " in place to move to target location."],
                            3
                        ));
                        this.subtitleManager.add(Subtitle.Create(
                            ["Hold touch ", "<img src='datas/icons/touch-icon.svg'/>", " in place to move to target location."],
                            3
                        ));
                        
                        this.subtitleManager.add(Subtitle.Create(["Press ", "<span class='keyboard'>SPACE</span>", " to jump."], 3));
                        this.subtitleManager.add(Subtitle.Create(["Press ", "<span class='pad yellow'>Y</span>", " to jump."], 3));
                        
                        this.subtitleManager.add(Subtitle.Create(["Press ", "<span class='keyboard'>²</span>", " to open Menu."], 3));
                        this.subtitleManager.add(Subtitle.Create(["Press ", "<span class='pad'>start</span>", " to open Menu."], 3));
                        
                        this.subtitleManager.add(new Subtitle(
                            [
                                "Press ",
                                " or ",
                                " or ",
                                " or ",
                                " or ",
                                " or ",
                                " or ",
                                " or ",
                                " or ",
                                " or ",
                                " or ",
                                " or ",
                                " to Jump. Also please clic ",
                                " and ",
                                " and ",
                                ".",

                            ],
                            [
                                "<span class='keyboard'>SPACE</span>",
                                "<span class='keyboard'>J</span>",
                                "<span class='pad green'>A</span>",
                                "<span class='pad red'>B</span>",
                                "<span class='pad blue'>X</span>",
                                "<span class='pad yellow'>Y</span>",
                                "<span class='pad'>start</span>",
                                "<span class='joystick'>R</span>",
                                "<span class='pad red'>B</span>",
                                "<span class='pad blue'>X</span>",
                                "<span class='pad yellow'>Y</span>",
                                "<span class='joystick'>R</span>",
                                "<img src='datas/icons/mouse-left.svg'/>",
                                "<img src='datas/icons/mouse-right.svg'/>",
                                "<img src='datas/icons/mouse-wheel.svg'/>"
                            ],
                            3600)
                        );
                        */
                        //mainPanel.openAtPlayerPosition();
                    }, 500);
                });
                //let debugAltimeter = new Altimeter3D(this.player);
                //debugAltimeter.instantiate();
                if (useLog) {
                    timers.push(performance.now());
                    logOutput += "initialize executed in " + (timers[timers.length - 1] - timers[timers.length - 2]).toFixed(0) + " ms";
                    console.log(logOutput);
                }
                resolve();
            });
        });
    }
    update() {
        super.update();
        this.skybox.position = this.scene.activeCameras[0].globalPosition;
    }
    async generatePlanets() {
        let orbitCount = 3;
        let orbitRadius = 500;
        let alpha = Math.PI / 2;
        for (let i = 0; i < orbitCount; i++) {
            let kPosMax = Math.floor(6 + 8 * Math.random());
            let planet = PlanetGeneratorFactory.Create(new BABYLON.Vector3(Math.cos(alpha) * orbitRadius * (i + 1), 0, Math.sin(alpha) * orbitRadius * (i + 1)), i + 1, kPosMax, this.scene);
            //let planet: Planet = PlanetGeneratorFactory.Create(new BABYLON.Vector3(Math.cos(alpha) * orbitRadius * (i + 1), 0, Math.sin(alpha) * orbitRadius * (i + 1)), PlanetGeneratorType.Earth, kPosMax, this.scene);
            planet.instantiate();
            this.planets.push(planet);
            alpha += Math.PI * 0.5 + Math.PI * Math.random();
        }
    }
}
class Miniature extends Main {
    constructor() {
        super(...arguments);
        this.targets = [];
    }
    updateCameraPosition(useSizeMarker = false) {
        if (this.camera instanceof BABYLON.ArcRotateCamera) {
            this.camera.lowerRadiusLimit = 0.01;
            this.camera.upperRadiusLimit = 1000;
            let size = 0;
            this.targets.forEach(t => {
                let bbox = t.getBoundingInfo();
                size = Math.max(size, bbox.maximum.x - bbox.minimum.x);
                size = Math.max(size, bbox.maximum.y - bbox.minimum.y);
                size = Math.max(size, bbox.maximum.z - bbox.minimum.z);
            });
            if (useSizeMarker) {
                size += 1.5;
            }
            let bbox = this.targets[0].getBoundingInfo();
            this.camera.target.copyFrom(bbox.maximum).addInPlace(bbox.minimum).scaleInPlace(0.5);
            let cameraPosition = (new BABYLON.Vector3(-1, 0.6, 0.8)).normalize();
            let f = (size - 0.4) / (7.90 - 0.4);
            //cameraPosition.scaleInPlace(Math.pow(size, 0.6) * 3.2);
            cameraPosition.scaleInPlace(1 * (1 - f) + 12 * f).scaleInPlace(1);
            cameraPosition.addInPlace(this.camera.target);
            this.camera.setPosition(cameraPosition);
            if (this.sizeMarkers) {
                this.sizeMarkers.dispose();
            }
            /*
            if (useSizeMarker) {
                this.sizeMarkers = new BABYLON.Mesh("size-markers");
                let n = 0;
                for (let x = bbox.minimum.x; x < bbox.maximum.x - DX05; x += DX) {
                    let cylinder = BABYLON.MeshBuilder.CreateCylinder("x", { diameter: 0.04, height: (n % 2 === 0) ? 0.8 : 0.3 });
                    cylinder.material = this.sizeMarkerMaterial;
                    cylinder.position.x = x;
                    cylinder.position.z = bbox.maximum.z + ((n % 2 === 0) ? 0.6 : 0.35);
                    cylinder.rotation.x = Math.PI / 2;
                    cylinder.parent = this.sizeMarkers;
                    cylinder.layerMask = 1;
                    n++;
                }
                n = 0;
                for (let y = bbox.minimum.y; y < bbox.maximum.y + DY05; y += DY) {
                    let cylinder = BABYLON.MeshBuilder.CreateCylinder("y", { diameter: 0.04, height: (n % 3 === 0) ? 0.8 : 0.3 });
                    cylinder.material = this.sizeMarkerMaterial;
                    cylinder.position.x = bbox.maximum.x;
                    cylinder.position.y = y;
                    cylinder.position.z = bbox.maximum.z + ((n % 3 === 0) ? 0.6 : 0.35);
                    cylinder.rotation.x = Math.PI / 2;
                    cylinder.parent = this.sizeMarkers;
                    cylinder.layerMask = 1;
                    n++;
                }
                n = 0;
                for (let z = bbox.minimum.z; z < bbox.maximum.z + DX05; z += DX) {
                    let cylinder = BABYLON.MeshBuilder.CreateCylinder("z", { diameter: 0.04, height: (n % 2 === 0) ? 0.8 : 0.3 });
                    cylinder.material = this.sizeMarkerMaterial;
                    cylinder.position.x = bbox.minimum.x - ((n % 2 === 0) ? 0.6 : 0.35);
                    cylinder.position.z = z;
                    cylinder.rotation.z = Math.PI / 2;
                    cylinder.parent = this.sizeMarkers;
                    cylinder.layerMask = 1;
                    n++;
                }
            }
            */
        }
    }
    async initialize() {
        super.initialize();
        this.camera = new BABYLON.ArcRotateCamera("camera", 0, 0, 10, BABYLON.Vector3.Zero());
        this.camera.wheelPrecision *= 10;
        this.sizeMarkerMaterial = new BABYLON.StandardMaterial("size-marker-material", Main.Scene);
        this.sizeMarkerMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.sizeMarkerMaterial.diffuseColor.copyFromFloats(0, 0, 0);
        Main.Scene.clearColor.copyFromFloats(0, 0, 0, 0);
        setTimeout(async () => {
            for (let i = BlockType.Grass; i < BlockType.Unknown; i++) {
                await this.createBlock(i);
            }
        }, 100);
    }
    async createBlock(blockType) {
        let vertexData = (await this.vertexDataLoader.get("chunck-part"))[0];
        let colors = [];
        let uvs = [];
        for (let i = 0; i < vertexData.positions.length / 3; i++) {
            colors[4 * i] = 1;
            colors[4 * i + 1] = 1;
            colors[4 * i + 2] = 1;
            colors[4 * i + 3] = blockType / 128;
            uvs[2 * i] = blockType / 128;
            uvs[2 * i + 1] = blockType / 128;
        }
        vertexData.colors = colors;
        vertexData.uvs = uvs;
        let block = BABYLON.MeshBuilder.CreateBox("block");
        vertexData.applyToMesh(block);
        block.material = SharedMaterials.MainMaterial();
        this.targets = [block];
        return new Promise(resolve => {
            setTimeout(() => {
                this.updateCameraPosition();
                setTimeout(async () => {
                    await this.makeScreenShot("block-icon-" + BlockTypeNames[blockType], false);
                    block.dispose();
                    resolve();
                }, 200);
            }, 200);
        });
    }
    async makeScreenShot(miniatureName, desaturate = true) {
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                BABYLON.ScreenshotTools.CreateScreenshot(Main.Engine, this.camera, {
                    width: 256 * this.canvas.width / this.canvas.height,
                    height: 256
                }, (data) => {
                    let img = document.createElement("img");
                    img.src = data;
                    img.onload = () => {
                        let sx = (img.width - 256) * 0.5;
                        let sy = (img.height - 256) * 0.5;
                        let canvas = document.createElement("canvas");
                        canvas.width = 256;
                        canvas.height = 256;
                        let context = canvas.getContext("2d");
                        context.drawImage(img, sx, sy, 256, 256, 0, 0, 256, 256);
                        let data = context.getImageData(0, 0, 256, 256);
                        for (let i = 0; i < data.data.length / 4; i++) {
                            let r = data.data[4 * i];
                            let g = data.data[4 * i + 1];
                            let b = data.data[4 * i + 2];
                            /*if (r === 0 && g === 255 && b === 0) {
                                data.data[4 * i] = 0;
                                data.data[4 * i + 1] = 0;
                                data.data[4 * i + 2] = 0;
                                data.data[4 * i + 3] = 0;
                            }
                            else*/ if (desaturate) {
                                let desat = (r + g + b) / 3;
                                desat = Math.floor(Math.sqrt(desat / 255) * 255);
                                data.data[4 * i] = desat;
                                data.data[4 * i + 1] = desat;
                                data.data[4 * i + 2] = desat;
                                data.data[4 * i + 3] = 255;
                            }
                        }
                        /*
                        for (let i = 0; i < data.data.length / 4; i++) {
                            let a = data.data[4 * i + 3];
                            if (a === 0) {
                                let hasColoredNeighbour = false;
                                for (let ii = -2; ii <= 2; ii++) {
                                    for (let jj = -2; jj <= 2; jj++) {
                                        if (ii !== 0 || jj !== 0) {
                                            let index = 4 * i + 3;
                                            index += ii * 4;
                                            index += jj * 4 * 256;
                                            if (index >= 0 && index < data.data.length) {
                                                let aNeighbour = data.data[index];
                                                if (aNeighbour === 255) {
                                                    hasColoredNeighbour = true;
                                                }
                                            }
                                        }
                                    }
                                }
                                if (hasColoredNeighbour) {
                                    data.data[4 * i] = 255;
                                    data.data[4 * i + 1] = 255;
                                    data.data[4 * i + 2] = 255;
                                    data.data[4 * i + 3] = 254;
                                }
                            }
                        }
                        */
                        context.putImageData(data, 0, 0);
                        var tmpLink = document.createElement('a');
                        let name = "Unknown";
                        if (miniatureName) {
                            name = miniatureName;
                        }
                        tmpLink.download = name + "-miniature.png";
                        tmpLink.href = canvas.toDataURL();
                        document.body.appendChild(tmpLink);
                        tmpLink.click();
                        document.body.removeChild(tmpLink);
                        resolve();
                    };
                });
            });
        });
    }
}
/// <reference path="../../lib/babylon.d.ts"/>
class PlanetToy extends Main {
    constructor() {
        super(...arguments);
        this.periodPlanet = 7 * 1.5;
        this._tPlanet = 0;
        this.periodCamera = 11 * 1.5;
        this._tCamera = 0;
    }
    createScene() {
        super.createScene();
        let light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0.6, 1, 0.3), this.scene);
        light.diffuse = new BABYLON.Color3(1, 1, 1);
        light.groundColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        this.camera = new BABYLON.ArcRotateCamera("camera", 0, 0, 10, BABYLON.Vector3.Zero(), this.scene);
        this.camera.radius = 20;
        this.camera.attachControl(this.canvas);
        this.scene.clearColor.copyFromFloats(0, 0, 0, 1);
    }
    async initialize() {
        return new Promise(resolve => {
            let core = BABYLON.MeshBuilder.CreateSphere("core", { diameter: 19.5 }, this.scene);
            let blackMat = new BABYLON.StandardMaterial("black", this.scene);
            blackMat.diffuseColor = BABYLON.Color3.Black();
            blackMat.specularColor = BABYLON.Color3.Black();
            core.material = blackMat;
            /*
            let XMesh = BABYLON.MeshBuilder.CreateLines(
                "XAxis",
                {
                    points: [new BABYLON.Vector3(1, 0, 0), new BABYLON.Vector3(14, 0, 0), new BABYLON.Vector3(14, 0, 1), new BABYLON.Vector3(15, 0, 0), new BABYLON.Vector3(14, 0, - 1)]
                }
            )
            let ZMesh = BABYLON.MeshBuilder.CreateLines(
                "ZAxis",
                {
                    points: [new BABYLON.Vector3(0, 0, 1), new BABYLON.Vector3(0, 0, 14), new BABYLON.Vector3(1, 0, 14), new BABYLON.Vector3(0, 0, 15), new BABYLON.Vector3(-1, 0, 14)]
                }
            )
            let YMesh = BABYLON.MeshBuilder.CreateLines(
                "YAxis",
                {
                    points: [new BABYLON.Vector3(0, -100, 0), new BABYLON.Vector3(0, 100, 0)]
                }
            )
            */
            let vertices = [];
            let n = 8;
            for (let i = 0; i <= n; i++) {
                vertices[i] = [];
                for (let j = 0; j <= n; j++) {
                    vertices[i][j] = PlanetTools.EvaluateVertex(n, i, j);
                }
            }
            let lines = [];
            let colors = [];
            for (let i = 0; i < n - 0; i++) {
                for (let j = 0; j < n - 0; j++) {
                    let v0 = vertices[i][j].clone();
                    let v1 = vertices[i + 1][j].clone();
                    let v2 = vertices[i + 1][j + 1].clone();
                    let v3 = vertices[i][j + 1].clone();
                    let h = Math.floor(Math.random() * 3) * 0.3;
                    v0.scaleInPlace(10);
                    v1.scaleInPlace(10);
                    v2.scaleInPlace(10);
                    v3.scaleInPlace(10);
                    lines.push([v0, v1, v2, v3, v0]);
                    let c = new BABYLON.Color4(1, 1, 1, 1);
                    colors.push([c, c, c, c, c]);
                }
            }
            this.planet = new BABYLON.Mesh("planet", this.scene);
            for (let i = 0; i < 6; i++) {
                let face = BABYLON.MeshBuilder.CreateLineSystem("Top", {
                    lines: lines,
                    colors: colors
                }, this.scene);
                face.rotationQuaternion = PlanetTools.QuaternionForSide(i);
                face.parent = this.planet;
            }
            resolve();
        });
    }
    update() {
        /*
        this._tPlanet += this.engine.getDeltaTime() / 1000;
        if (this._tPlanet > this.periodPlanet) {
            this._tPlanet -= this.periodPlanet;
        }
        this.planet.rotation.y = Math.PI * 2 * (this._tPlanet / this.periodPlanet);

        this._tCamera += this.engine.getDeltaTime() / 1000;
        if (this._tCamera > this.periodCamera) {
            this._tCamera -= this.periodCamera;
        }
        this.camera.beta = Math.PI / 2 + Math.PI / 6 * Math.sin(this._tCamera / this.periodCamera * 2 * Math.PI);
        */
    }
}
/// <reference path="../../lib/babylon.d.ts"/>
class VMathTest extends Main {
    createScene() {
        Main.Scene = new BABYLON.Scene(Main.Engine);
        this.scene = Main.Scene;
        this.vertexDataLoader = new VertexDataLoader(this.scene);
        this.inputManager = new InputManager(this.scene, this.canvas, this);
        let light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0.6, 1, 0.3), this.scene);
        light.diffuse = new BABYLON.Color3(1, 1, 1);
        light.groundColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        this.camera = new BABYLON.ArcRotateCamera("camera", 5 * Math.PI / 4, Math.PI / 4, 20, BABYLON.Vector3.Zero(), this.scene);
        this.camera.attachControl(this.canvas);
        this.scene.clearColor.copyFromFloats(0, 0, 0, 1);
    }
    async initialize() {
        return new Promise(resolve => {
            let meshA = BABYLON.MeshBuilder.CreateLines("object-A", {
                points: [BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, 5)],
                colors: [new BABYLON.Color4(1, 0, 0, 1), new BABYLON.Color4(1, 0, 0, 1)]
            }, this.scene);
            meshA.rotationQuaternion = BABYLON.Quaternion.Identity();
            let meshB = BABYLON.MeshBuilder.CreateLines("object-B", {
                points: [BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, 5)],
                colors: [new BABYLON.Color4(0, 1, 0, 1), new BABYLON.Color4(0, 1, 0, 1)]
            }, this.scene);
            let a = 2 * Math.PI * Math.random();
            meshB.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, a);
            let meshC = BABYLON.MeshBuilder.CreateLines("object-C", {
                points: [BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, 5)],
                colors: [new BABYLON.Color4(0, 0, 1, 1), new BABYLON.Color4(0, 0, 1, 1)]
            }, this.scene);
            meshC.rotationQuaternion = BABYLON.Quaternion.Slerp(meshA.rotationQuaternion, meshB.rotationQuaternion, 0.5);
            let angle = VMath.GetAngleBetweenQuaternions(meshA.rotationQuaternion, meshB.rotationQuaternion) / Math.PI * 180;
            let valueDisplay = new Number3D("angle", Math.round(angle), 1);
            valueDisplay.redraw();
            valueDisplay.position.z = 10;
            setInterval(() => {
                a += Math.PI * 0.003;
                meshB.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, a);
                meshC.rotationQuaternion = BABYLON.Quaternion.Slerp(meshA.rotationQuaternion, meshB.rotationQuaternion, 0.5);
                let angle = VMath.GetAngleBetweenQuaternions(meshA.rotationQuaternion, meshB.rotationQuaternion) / Math.PI * 180;
                valueDisplay.value = Math.round(angle);
                valueDisplay.redraw();
            }, 15);
            resolve();
        });
    }
    update() {
    }
}
class HoloPanelMaterial extends BABYLON.ShaderMaterial {
    constructor(name, scene) {
        super(name, scene, {
            vertex: "holoPanel",
            fragment: "holoPanel",
        }, {
            attributes: ["position", "normal", "uv", "color"],
            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "alpha"],
            needAlphaBlending: true
        });
        this._offset = 0;
        this._up = BABYLON.Vector3.Up();
        this.setFloat("alpha", this._alpha);
        this.setFloat("offset", this._offset);
        this.setVector3("upDirW", this._up);
    }
    get offset() {
        return this._offset;
    }
    set offset(v) {
        this._offset = v;
        this.setFloat("offset", this._offset);
    }
    get alpha() {
        return this._alpha;
    }
    set alpha(v) {
        this._alpha = v;
        this.setFloat("alpha", this._alpha);
    }
    get up() {
        return this._up;
    }
    set up(v) {
        this._up.copyFrom(v);
        this.setVector3("upDirW", this._up);
    }
    get holoTexture() {
        return this._holoTexture;
    }
    set holoTexture(t) {
        this._holoTexture = t;
        this.setTexture("holoTexture", this._holoTexture);
    }
}
class AbstractPlanetChunck {
    constructor(iPos, jPos, kPos, planetSide, parentGroup) {
        this.iPos = iPos;
        this.jPos = jPos;
        this.kPos = kPos;
        this.planetSide = planetSide;
        this.parentGroup = parentGroup;
        this._degree = 0;
        this._chunckCount = 0;
        this._size = 0;
        this.isShellLevel = false;
        this._registered = false;
        this.lod = NaN;
    }
    get scene() {
        return this.planetSide.getScene();
    }
    get side() {
        return this.planetSide.side;
    }
    get planet() {
        return this.planetSide.planet;
    }
    get chunckManager() {
        return this.planetSide.chunckManager;
    }
    get degree() {
        return this._degree;
    }
    get chunckCount() {
        return this._chunckCount;
    }
    get size() {
        return this._size;
    }
    get planetName() {
        return this.planetSide.GetPlanetName();
    }
    get kPosMax() {
        return this.planetSide.kPosMax;
    }
    get registered() {
        return this._registered;
    }
    get barycenter() {
        return this._barycenter;
    }
    get normal() {
        return this._normal;
    }
    register() {
        if (!this.registered) {
            this._registered = this.chunckManager.registerChunck(this);
        }
    }
    unregister() {
        if (this.registered) {
            this.chunckManager.unregister(this);
            this._registered = false;
        }
    }
    canCollapse() {
        if (this.parentGroup) {
            let siblings = this.parentGroup.children;
            let level = 0;
            if (this instanceof PlanetChunckGroup) {
                level = this.level;
            }
            for (let i = 0; i < siblings.length; i++) {
                let sib = siblings[i];
                if (sib.lod - 1 <= level) {
                    return false;
                }
            }
        }
        return true;
    }
}
// Notice : Adding a BlockType
// 1) BlockType in the enum
// 2) BlockTypeNames in the list
// 3) Incrementing array size in terrainToon fragment shader
// 4) Initializing with a color in PlanetMaterial.ts 
var BlockTypeNames = [
    "None",
    "Water",
    "Grass",
    "Dirt",
    "Sand",
    "Rock",
    "Wood",
    "Leaf",
    "Laterite",
    "Basalt",
    "Snow",
    "Ice",
    "Regolith",
    "Unknown"
];
var BlockType;
(function (BlockType) {
    BlockType[BlockType["None"] = 0] = "None";
    BlockType[BlockType["Water"] = 1] = "Water";
    BlockType[BlockType["Grass"] = 2] = "Grass";
    BlockType[BlockType["Dirt"] = 3] = "Dirt";
    BlockType[BlockType["Sand"] = 4] = "Sand";
    BlockType[BlockType["Rock"] = 5] = "Rock";
    BlockType[BlockType["Wood"] = 6] = "Wood";
    BlockType[BlockType["Leaf"] = 7] = "Leaf";
    BlockType[BlockType["Laterite"] = 8] = "Laterite";
    BlockType[BlockType["Basalt"] = 9] = "Basalt";
    BlockType[BlockType["Snow"] = 10] = "Snow";
    BlockType[BlockType["Ice"] = 11] = "Ice";
    BlockType[BlockType["Regolith"] = 12] = "Regolith";
    BlockType[BlockType["Unknown"] = 13] = "Unknown";
})(BlockType || (BlockType = {}));
class Planet extends BABYLON.Mesh {
    constructor(name, position, kPosMax, seaLevelRatio, scene, createGenerator) {
        super(name, scene);
        this.kPosMax = kPosMax;
        this.seaLevelRatio = seaLevelRatio;
        this.scene = scene;
        this.position.copyFrom(position);
        this.freezeWorldMatrix();
        Planet.DEBUG_INSTANCE = this;
        this.kPosMax = kPosMax;
        this.degree = PlanetTools.KPosToDegree(this.kPosMax);
        this.seaLevel = Math.floor(this.kPosMax * this.seaLevelRatio * PlanetTools.CHUNCKSIZE);
        this.seaAltitude = PlanetTools.KGlobalToAltitude(this.seaLevel);
        this.generator = createGenerator(this);
        if (!this.generator) {
            debugger;
        }
        this.chunckMaterial = new PlanetMaterial(this.name + "-chunck-material", this.scene);
        this.chunckMaterial.setPlanetPos(this.position);
        this.planetSides = [];
        this.planetSides[Side.Front] = new PlanetSide(Side.Front, this);
        this.planetSides[Side.Right] = new PlanetSide(Side.Right, this);
        this.planetSides[Side.Back] = new PlanetSide(Side.Back, this);
        this.planetSides[Side.Left] = new PlanetSide(Side.Left, this);
        this.planetSides[Side.Top] = new PlanetSide(Side.Top, this);
        this.planetSides[Side.Bottom] = new PlanetSide(Side.Bottom, this);
        this.chunckManager = new PlanetChunckManager(this._scene);
        if (DebugDefine.SHOW_PLANET_CORNER_FLAGS) {
            let p = BABYLON.Vector3.One();
            p.scaleInPlace(this.kPosMax * PlanetTools.CHUNCKSIZE);
            let d = p.x;
            let lines = [
                [new BABYLON.Vector3(d, d, d), new BABYLON.Vector3(-d, -d, -d)],
                [new BABYLON.Vector3(d, d, -d), new BABYLON.Vector3(-d, -d, d)],
                [new BABYLON.Vector3(-d, d, d), new BABYLON.Vector3(d, -d, -d)],
                [new BABYLON.Vector3(-d, d, -d), new BABYLON.Vector3(d, -d, d)]
            ];
            let color = new BABYLON.Color4(1, 0, 1);
            let colors = [
                [color, color],
                [color, color],
                [color, color],
                [color, color]
            ];
            let debugCornerFlagsMesh = BABYLON.MeshBuilder.CreateLineSystem(this.name + "-debug-corner-flags", {
                lines: lines,
                colors: colors
            }, this.scene);
            debugCornerFlagsMesh.parent = this;
        }
    }
    GetSide(side) {
        return this.planetSides[side];
    }
    GetPlanetName() {
        return this.name;
    }
    instantiate() {
        let timers;
        let logOutput;
        let useLog = DebugDefine.LOG_PLANET_INSTANTIATE_PERFORMANCE;
        if (useLog) {
            timers = [];
            timers.push(performance.now());
            logOutput = "instantiate planet " + this.name;
        }
        this.chunckManager.initialize();
        if (useLog) {
            timers.push(performance.now());
            logOutput += "\n  chunckManager initialized in " + (timers[1] - timers[0]).toFixed(0) + " ms";
        }
        this.planetSides.forEach(planetSide => {
            planetSide.instantiate();
        });
        if (useLog) {
            timers.push(performance.now());
            logOutput += "\n  planetsides instantiated in " + (timers[2] - timers[1]).toFixed(0) + " ms";
            logOutput += "\nplanet " + this.name + " instantiated in " + (timers[2] - timers[0]).toFixed(0) + " ms";
            console.log(logOutput);
        }
    }
    register() {
        let chunckCount = 0;
        for (let i = 0; i < this.planetSides.length; i++) {
            chunckCount += this.planetSides[i].register();
        }
    }
}
class PlanetBlockMaker {
    static AddSphere(planet, world, radius, block) {
        let impactedChunck = [];
        for (let x = -radius; x < radius + 0.6; x += 0.6) {
            for (let y = -radius; y < radius + 0.6; y += 0.6) {
                for (let z = -radius; z < radius + 0.6; z += 0.6) {
                    x = Math.min(x, radius);
                    y = Math.min(y, radius);
                    z = Math.min(z, radius);
                    if (x * x + y * y + z * z < radius * radius) {
                        let p = new BABYLON.Vector3(world.x + x, world.y + y, world.z + z);
                        let planetSide = PlanetTools.PlanetPositionToPlanetSide(planet, p);
                        let globalIJK = PlanetTools.PlanetPositionToGlobalIJK(planetSide, p);
                        let localIJK = PlanetTools.GlobalIJKToLocalIJK(planetSide, globalIJK);
                        let chunck = localIJK.planetChunck;
                        if (chunck) {
                            chunck.SetData(localIJK.i, localIJK.j, localIJK.k, block, true);
                            if (impactedChunck.indexOf(chunck) === -1) {
                                impactedChunck.push(chunck);
                            }
                        }
                    }
                }
            }
        }
        return impactedChunck;
    }
    static AddLine(planet, from, to, block) {
        let impactedChunck = [];
        let o = from.clone();
        let l = BABYLON.Vector3.Distance(from, to);
        let count = Math.round(l / 0.7);
        for (let i = 0; i <= count; i++) {
            let x = from.x + (to.x - from.x) * i / count;
            let y = from.y + (to.y - from.y) * i / count;
            let z = from.z + (to.z - from.z) * i / count;
            let p = new BABYLON.Vector3(x, y, z);
            let planetSide = PlanetTools.PlanetPositionToPlanetSide(planet, p);
            let globalIJK = PlanetTools.PlanetPositionToGlobalIJK(planetSide, p);
            let localIJK = PlanetTools.GlobalIJKToLocalIJK(planetSide, globalIJK);
            let chunck = localIJK.planetChunck;
            if (chunck) {
                chunck.SetData(localIJK.i, localIJK.j, localIJK.k, block, true);
                if (impactedChunck.indexOf(chunck) === -1) {
                    impactedChunck.push(chunck);
                }
            }
        }
        return impactedChunck;
    }
}
/// <reference path="AbstractPlanetChunck.ts"/>
var Neighbour;
(function (Neighbour) {
    Neighbour[Neighbour["IPlus"] = 0] = "IPlus";
    Neighbour[Neighbour["JPlus"] = 1] = "JPlus";
    Neighbour[Neighbour["KPlus"] = 2] = "KPlus";
    Neighbour[Neighbour["IMinus"] = 3] = "IMinus";
    Neighbour[Neighbour["JMinus"] = 4] = "JMinus";
    Neighbour[Neighbour["KMinus"] = 5] = "KMinus";
})(Neighbour || (Neighbour = {}));
class PlanetChunck extends AbstractPlanetChunck {
    constructor(iPos, jPos, kPos, planetSide, parentGroup) {
        super(iPos, jPos, kPos, planetSide, parentGroup);
        this._dataInitialized = false;
        this._adjacentsDataSynced = false;
        this._proceduralItemsGenerated = false;
        this._isEmpty = true;
        this._isFull = false;
        this._isDirty = false;
        this._setMeshHistory = [];
        // AABBoxes relative to planet origin
        this.aabbMin = new BABYLON.Vector3(Infinity, Infinity, Infinity);
        this.aabbMax = new BABYLON.Vector3(-Infinity, -Infinity, -Infinity);
        this._debugSyncCount = 0;
        this._degree = PlanetTools.KPosToDegree(this.kPos);
        this._size = PlanetTools.DegreeToSize(this.degree);
        this._chunckCount = PlanetTools.DegreeToChuncksCount(this.degree);
        this.name = "chunck:" + this.side + ":" + this.iPos + "-" + this.jPos + "-" + this.kPos;
        this._barycenter = PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 0.5), PlanetTools.CHUNCKSIZE * (this.jPos + 0.5)).scale(PlanetTools.KGlobalToAltitude((this.kPos + 0.5) * PlanetTools.CHUNCKSIZE));
        this._barycenter = BABYLON.Vector3.TransformCoordinates(this._barycenter, planetSide.computeWorldMatrix(true));
        this._normal = BABYLON.Vector3.Normalize(this.barycenter);
        for (let i = 0; i <= 1; i++) {
            for (let j = 0; j <= 1; j++) {
                let v = PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + i), PlanetTools.CHUNCKSIZE * (this.jPos + j));
                for (let k = 0; k <= 1; k++) {
                    let p = v.scale(PlanetTools.KGlobalToAltitude((this.kPos + k) * PlanetTools.CHUNCKSIZE));
                    VMath.RotateVectorByQuaternionToRef(p, this.planetSide.rotationQuaternion, p);
                    this.aabbMin.x = Math.min(p.x, this.aabbMin.x);
                    this.aabbMin.y = Math.min(p.y, this.aabbMin.y);
                    this.aabbMin.z = Math.min(p.z, this.aabbMin.z);
                    this.aabbMax.x = Math.max(p.x, this.aabbMax.x);
                    this.aabbMax.y = Math.max(p.y, this.aabbMax.y);
                    this.aabbMax.z = Math.max(p.z, this.aabbMax.z);
                }
            }
        }
        let kMin = this.kPos * PlanetTools.CHUNCKSIZE;
        let kMax = (this.kPos + 1) * PlanetTools.CHUNCKSIZE;
        /*
        let f = Math.pow(2, this.planet.degree - this.degree);
        let kShell = Math.floor(this.planet.generator.altitudeMap.getForSide(
            this.side,
            (PlanetTools.CHUNCKSIZE * (this.iPos + 0.5)) * f,
            (PlanetTools.CHUNCKSIZE * (this.jPos + 0.5)) * f
        ) * this.kPosMax * PlanetTools.CHUNCKSIZE);
        */
        if (kMin <= this.planet.seaLevel && this.planet.seaLevel < kMax) {
            this.isShellLevel = true;
        }
        if (this.isShellLevel) {
            this.redrawSeaLevelMesh();
        }
        let degreeBellow = PlanetTools.KPosToDegree(this.kPos - 1);
        if (degreeBellow != this.degree) {
            this.isDegreeLayerBottom = true;
        }
        this.isCorner = false;
        if (this.iPos === 0) {
            if (this.jPos === 0) {
                this.isCorner = true;
            }
            else if (this.jPos === this.chunckCount - 1) {
                this.isCorner = true;
            }
        }
        if (this.iPos === this.chunckCount - 1) {
            if (this.jPos === 0) {
                this.isCorner = true;
            }
            else if (this.jPos === this.chunckCount - 1) {
                this.isCorner = true;
            }
        }
        this._firstI = 0;
        this._firstJ = 0;
        this._lastJ = PlanetTools.CHUNCKSIZE;
        this._firstK = 0;
        if (this.side === Side.Top || this.side === Side.Bottom) {
            if (this.iPos === 0) {
                this._firstI = -1;
            }
            if (this.jPos === 0) {
                this._firstJ = -1;
            }
        }
        if (this.side <= Side.Left) {
            if (this.jPos === this.chunckCount - 1) {
                this._lastJ = PlanetTools.CHUNCKSIZE - 1;
            }
        }
        if (this.isDegreeLayerBottom) {
            this._firstK = -1;
        }
    }
    Position() {
        return {
            i: this.iPos,
            j: this.jPos,
            k: this.kPos,
        };
    }
    findAdjacents() {
        this._adjacents = [];
        this.adjacentsAsArray = [];
        for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
                for (let dk = -1; dk <= 1; dk++) {
                    if (di != 0 || dj != 0 || dk != 0) {
                        if (!this._adjacents[1 + di]) {
                            this._adjacents[1 + di] = [];
                        }
                        if (!this._adjacents[1 + di][1 + dj]) {
                            this._adjacents[1 + di][1 + dj] = [];
                        }
                        if (!this._adjacents[1 + di][1 + dj][1 + dk]) {
                            let n = this.planetSide.getChunck(this.iPos + di, this.jPos + dj, this.kPos + dk, this.degree);
                            if (n instanceof PlanetChunck) {
                                this._adjacents[1 + di][1 + dj][1 + dk] = [n];
                                this.adjacentsAsArray.push(n);
                            }
                            else if (n instanceof Array) {
                                this._adjacents[1 + di][1 + dj][1 + dk] = n;
                                this.adjacentsAsArray.push(...n);
                            }
                        }
                    }
                }
            }
        }
    }
    get dataInitialized() {
        return this._dataInitialized;
    }
    get dataNeighbourSynced() {
        return this._adjacentsDataSynced;
    }
    get firstI() {
        return this._firstI;
    }
    get firstJ() {
        return this._firstJ;
    }
    get lastJ() {
        return this._lastJ;
    }
    get firstK() {
        return this._firstK;
    }
    get proceduralItemsGenerated() {
        return this._proceduralItemsGenerated;
    }
    GetData(i, j, k) {
        if (!this.dataInitialized) {
            this.initializeData();
        }
        if (i >= this.firstI && i <= PlanetTools.CHUNCKSIZE) {
            if (j >= this.firstJ && j <= this.lastJ) {
                if (k >= this.firstK && k <= PlanetTools.CHUNCKSIZE) {
                    return this.data[i - this.firstI][j - this.firstJ][k - this.firstK];
                }
            }
        }
        return this.GetDataGlobal(this.iPos * PlanetTools.CHUNCKSIZE + i, this.jPos * PlanetTools.CHUNCKSIZE + j, this.kPos * PlanetTools.CHUNCKSIZE + k);
    }
    GetDataNice(i, j, k) {
        if (!this.dataInitialized) {
            this.initializeData();
        }
        if (i >= 0 && i < PlanetTools.CHUNCKSIZE) {
            if (j >= 0 && j < PlanetTools.CHUNCKSIZE) {
                if (k >= 0 && k < PlanetTools.CHUNCKSIZE) {
                    return this.data[i - this.firstI][j - this.firstJ][k - this.firstK];
                }
            }
        }
        return BlockType.None;
    }
    GetDataGlobal(iGlobal, jGlobal, kGlobal) {
        return this.planetSide.GetData(iGlobal, jGlobal, kGlobal, this.degree);
    }
    SetData(i, j, k, value, noDataSafety = false) {
        if (!this.dataInitialized) {
            this.initializeData();
        }
        if (!this.dataNeighbourSynced) {
            this.syncWithAdjacents();
        }
        this.data[i - this.firstI][j - this.firstJ][k - this.firstK] = value;
        if (noDataSafety) {
            return;
        }
        this.doDataSafety();
    }
    doDataSafety() {
        this.updateIsEmptyIsFull();
        this.adjacentsAsArray.forEach(adj => {
            if (adj.syncWithAdjacents()) {
                if (adj.lod <= 1) {
                    adj.chunckManager.requestDraw(adj, adj.lod, "PlanetChunck.doDataSafety");
                }
            }
        });
        this.register();
    }
    get isEmpty() {
        return this._isEmpty;
    }
    get isFull() {
        return this._isFull;
    }
    get isDirty() {
        return this._isDirty;
    }
    isMeshDrawn() {
        return this.mesh && !this.mesh.isDisposed();
    }
    isMeshDisposed() {
        return !this.mesh || this.mesh.isDisposed();
    }
    static CreateChunck(iPos, jPos, kPos, planetSide, parentGroup) {
        if (kPos < planetSide.kPosMax - 1) {
            let degree = PlanetTools.KPosToDegree(kPos);
            let chunckCount = PlanetTools.DegreeToChuncksCount(degree);
            if (planetSide.side <= Side.Left || iPos > 0 && iPos < chunckCount - 1) {
                if (jPos > 0 && jPos < chunckCount - 1) {
                    let degreeBellow = PlanetTools.KPosToDegree(kPos - 1);
                    if (degreeBellow === degree) {
                        let degreeAbove = PlanetTools.KPosToDegree(kPos + 1);
                        if (degreeAbove === degree) {
                            PlanetChunck._DEBUG_NICE_CHUNCK_COUNT++;
                            return new PlanetChunckNice(iPos, jPos, kPos, planetSide, parentGroup);
                        }
                        else {
                            PlanetChunck._DEBUG_NICE_CHUNCK_COUNT++;
                            return new PlanetChunckSemiNice(iPos, jPos, kPos, planetSide, parentGroup);
                        }
                    }
                }
            }
        }
        PlanetChunck._DEBUG_CHUNCK_COUNT++;
        return new PlanetChunck(iPos, jPos, kPos, planetSide, parentGroup);
    }
    initialize() {
        this.initializeData();
        this.initializeMesh();
    }
    initializeData() {
        if (!this.dataInitialized) {
            this.data = [];
            this.proceduralItems = [];
            this.planetSide.planet.generator.makeData(this, this.data, this.proceduralItems);
            for (let i = this.firstI; i <= PlanetTools.CHUNCKSIZE; i++) {
                if (!this.data[i - this.firstI]) {
                    this.data[i - this.firstI] = [];
                }
                for (let j = this.firstJ; j <= this.lastJ; j++) {
                    if (!this.data[i - this.firstI][j - this.firstJ]) {
                        this.data[i - this.firstI][j - this.firstJ] = [];
                    }
                    for (let k = this.firstK; k <= PlanetTools.CHUNCKSIZE; k++) {
                        if (!this.data[i - this.firstI][j - this.firstJ][k - this.firstK]) {
                            this.data[i - this.firstI][j - this.firstJ][k - this.firstK] = BlockType.None;
                        }
                    }
                }
            }
            this._dataInitialized = true;
            this.updateIsEmptyIsFull();
        }
    }
    collapse() {
        if (this.canCollapse()) {
            if (this.parentGroup) {
                this.parentGroup.collapseChildren();
            }
            return true;
        }
        return false;
    }
    _syncStep(i, j, k) {
        let r = false;
        let d = this.GetDataGlobal(this.iPos * PlanetTools.CHUNCKSIZE + i, this.jPos * PlanetTools.CHUNCKSIZE + j, this.kPos * PlanetTools.CHUNCKSIZE + k);
        if (this.data[i - this.firstI][j - this.firstJ][k - this.firstK] != d) {
            r = true;
        }
        this.data[i - this.firstI][j - this.firstJ][k - this.firstK] = d;
        return r;
    }
    syncWithAdjacents() {
        let hasUpdated = false;
        if (!this.dataInitialized) {
            return hasUpdated;
        }
        this._adjacentsDataSynced = true;
        this.findAdjacents();
        // Use this case so Top and Bottom corner Chuncks synchronize their data with an adjacent chunck that has already copied the adequate corner value.
        if (this.isCorner && this.side > Side.Left) {
            for (let i = 0; i < this.adjacentsAsArray.length; i++) {
                let adjacent = this.adjacentsAsArray[i];
                if (adjacent.isCorner && adjacent.side <= Side.Left) {
                    adjacent.syncWithAdjacents();
                }
            }
        }
        this._debugSyncCount++;
        PlanetChunck._GLOBAL_DEBUG_SYNC_COUNT++;
        //console.log(this._debugSyncCount + " " + PlanetChunck._GLOBAL_DEBUG_SYNC_COUNT);
        let i = 0;
        let j = 0;
        let k = 0;
        for (i = this.firstI; i < 0; i++) {
            for (j = this.firstJ; j <= this.lastJ; j++) {
                for (k = this.firstK; k <= PlanetTools.CHUNCKSIZE; k++) {
                    hasUpdated = this._syncStep(i, j, k) || hasUpdated;
                }
            }
        }
        for (j = this.firstJ; j <= this.lastJ; j++) {
            for (k = this.firstK; k <= PlanetTools.CHUNCKSIZE; k++) {
                hasUpdated = this._syncStep(PlanetTools.CHUNCKSIZE, j, k) || hasUpdated;
            }
        }
        for (j = this.firstJ; j < 0; j++) {
            for (i = this.firstI; i <= PlanetTools.CHUNCKSIZE; i++) {
                for (k = this.firstK; k <= PlanetTools.CHUNCKSIZE; k++) {
                    hasUpdated = this._syncStep(i, j, k) || hasUpdated;
                }
            }
        }
        if (this._lastJ === PlanetTools.CHUNCKSIZE) {
            for (i = this.firstI; i <= PlanetTools.CHUNCKSIZE; i++) {
                for (k = this.firstK; k <= PlanetTools.CHUNCKSIZE; k++) {
                    hasUpdated = this._syncStep(i, PlanetTools.CHUNCKSIZE, k) || hasUpdated;
                }
            }
        }
        for (k = this.firstK; k < 0; k++) {
            for (i = this.firstI; i <= PlanetTools.CHUNCKSIZE; i++) {
                for (j = this.firstJ; j <= this.lastJ; j++) {
                    hasUpdated = this._syncStep(i, j, k) || hasUpdated;
                }
            }
        }
        for (i = this.firstI; i <= PlanetTools.CHUNCKSIZE; i++) {
            for (j = this.firstJ; j <= this.lastJ; j++) {
                hasUpdated = this._syncStep(i, j, PlanetTools.CHUNCKSIZE) || hasUpdated;
            }
        }
        if (this.side <= Side.Left && this.isCorner) {
            if (this.jPos === 0) {
                j = 0;
                if (this.iPos === 0) {
                    i = 0;
                    for (let k = this.firstK; k <= PlanetTools.CHUNCKSIZE; k++) {
                        let d = this.GetDataGlobal(0, -1, this.kPos * PlanetTools.CHUNCKSIZE + k);
                        if (this.data[i - this.firstI][j - this.firstJ][k - this.firstK] != d) {
                            hasUpdated = true;
                        }
                        this.data[i - this.firstI][j - this.firstJ][k - this.firstK] = d;
                    }
                }
                if (this.iPos === this.chunckCount - 1) {
                    i = PlanetTools.CHUNCKSIZE - 1;
                    for (let k = this.firstK; k <= PlanetTools.CHUNCKSIZE; k++) {
                        let d = this.GetDataGlobal(this.iPos * PlanetTools.CHUNCKSIZE + i, -1, this.kPos * PlanetTools.CHUNCKSIZE + k);
                        if (this.data[i - this.firstI][j - this.firstJ][k - this.firstK] != d) {
                            hasUpdated = true;
                        }
                        this.data[i - this.firstI][j - this.firstJ][k - this.firstK] = d;
                    }
                }
            }
            if (this.jPos === this.chunckCount - 1) {
                j = PlanetTools.CHUNCKSIZE - 1;
                if (this.iPos === 0) {
                    i = 0;
                    for (let k = this.firstK; k <= PlanetTools.CHUNCKSIZE; k++) {
                        let d = this.GetDataGlobal(0, (this.jPos + 1) * PlanetTools.CHUNCKSIZE, this.kPos * PlanetTools.CHUNCKSIZE + k);
                        if (this.data[i - this.firstI][j - this.firstJ][k - this.firstK] != d) {
                            hasUpdated = true;
                        }
                        this.data[i - this.firstI][j - this.firstJ][k - this.firstK] = d;
                    }
                }
                if (this.iPos === this.chunckCount - 1) {
                    i = PlanetTools.CHUNCKSIZE - 1;
                    for (let k = this.firstK; k <= PlanetTools.CHUNCKSIZE; k++) {
                        let d = this.GetDataGlobal(this.iPos * PlanetTools.CHUNCKSIZE + i, (this.jPos + 1) * PlanetTools.CHUNCKSIZE, this.kPos * PlanetTools.CHUNCKSIZE + k);
                        if (this.data[i - this.firstI][j - this.firstJ][k - this.firstK] != d) {
                            hasUpdated = true;
                        }
                        this.data[i - this.firstI][j - this.firstJ][k - this.firstK] = d;
                    }
                }
            }
        }
        this.updateIsEmptyIsFull();
        this.register();
        return hasUpdated;
    }
    initializeMesh() {
        if (this.dataInitialized) {
            this.redrawMesh();
        }
    }
    updateIsEmptyIsFull() {
        this._isEmpty = true;
        this._isFull = true;
        for (let i = this.firstI; i <= PlanetTools.CHUNCKSIZE; i++) {
            for (let j = this.firstJ; j <= this.lastJ; j++) {
                for (let k = this.firstK; k <= PlanetTools.CHUNCKSIZE; k++) {
                    let block = this.data[i - this.firstI][j - this.firstJ][k - this.firstK];
                    this._isFull = this._isFull && (block > BlockType.Water);
                    this._isEmpty = this._isEmpty && (block < BlockType.Water);
                    if (!this._isFull && !this._isEmpty) {
                        return;
                    }
                }
            }
        }
    }
    isEmptyOrHidden() {
        if (!this.dataInitialized) {
            this.initializeData();
        }
        if (!this.dataNeighbourSynced) {
            this.syncWithAdjacents();
        }
        return this.isEmpty || this.isFull;
    }
    redrawMesh() {
        if (this.lod < Config.performanceConfiguration.lodCount) {
            if (this.isEmptyOrHidden()) {
                this.disposeMesh();
                return;
            }
            if (!this._adjacentsDataSynced) {
                this.syncWithAdjacents();
            }
            if (!this.proceduralItemsGenerated) {
                this._proceduralItemsGenerated = true;
                for (let i = 0; i < this.proceduralItems.length; i++) {
                    this.proceduralItems[i].generateData();
                }
            }
            if (this.isMeshDisposed()) {
                this.mesh = new BABYLON.Mesh("chunck-" + this.iPos + "-" + this.jPos + "-" + this.kPos, this.scene);
            }
            let vertexDatas;
            vertexDatas = PlanetChunckMeshBuilder.BuildVertexData(this, this.iPos, this.jPos, this.kPos);
            let vertexData = vertexDatas[0];
            if (vertexData.positions.length > 0) {
                vertexData.applyToMesh(this.mesh);
                this.mesh.material = this.planet.chunckMaterial;
                //this.mesh.material = SharedMaterials.WaterMaterial();
            }
            else {
                this.mesh.dispose();
            }
            let waterVertexData = vertexDatas[1];
            if (waterVertexData) {
                if (!this.waterMesh || this.waterMesh.isDisposed()) {
                    this.waterMesh = new BABYLON.Mesh("chunckWater-" + this.iPos + "-" + this.jPos + "-" + this.kPos, this.scene);
                }
                waterVertexData.applyToMesh(this.waterMesh);
                this.waterMesh.material = SharedMaterials.WaterMaterial();
                this.waterMesh.parent = this.planetSide;
                this.waterMesh.freezeWorldMatrix();
                this.waterMesh.refreshBoundingInfo();
            }
            this.mesh.parent = this.planetSide;
            this.mesh.freezeWorldMatrix();
            this.mesh.refreshBoundingInfo();
            if (DebugDefine.USE_VERTEX_SET_MESH_HISTORY) {
                this._setMeshHistory.push(performance.now());
            }
        }
    }
    redrawSeaLevelMesh() {
        if (this.isMeshDisposed()) {
            this.mesh = new BABYLON.Mesh("chunck-" + this.iPos + "-" + this.jPos + "-" + this.kPos, this.scene);
        }
        PlanetChunckMeshBuilder.BuildShellLevelVertexData(this).applyToMesh(this.mesh);
        if (DebugDefine.USE_CHUNCK_LEVEL_DEBUG_COLORS) {
            this.mesh.material = SharedMaterials.RedMaterial();
        }
        else {
            this.planetSide.onShellMaterialReady(() => {
                if (this.mesh && !this.mesh.isDisposed() && this.mesh.material != this.planet.chunckMaterial) {
                    this.mesh.material = this.planetSide.shellMaterial;
                }
            });
        }
        this.mesh.parent = this.planetSide;
        requestAnimationFrame(() => {
            this.mesh.freezeWorldMatrix();
            this.mesh.refreshBoundingInfo();
        });
    }
    highlight() {
        if (this.mesh) {
            this.mesh.material = SharedMaterials.HighlightChunckMaterial();
        }
    }
    unlit() {
        if (this.mesh) {
            this.mesh.material = SharedMaterials.MainMaterial();
        }
    }
    disposeMesh() {
        if (this.mesh) {
            this.mesh.dispose();
        }
        if (this.waterMesh) {
            this.waterMesh.dispose();
        }
    }
    serialize() {
        let output = "";
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    output += this.data[i][j][k].toFixed(0);
                }
            }
        }
        let compressed = Utils.compress(output);
        //console.log("Compressed " + this.name + " data to " + (compressed.length / output.length * 100).toFixed(0) + "% of uncompressed size.");
        return compressed;
    }
    deserialize(input) {
        let data = Utils.decompress(input);
        this.data = [];
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            this.data[i] = [];
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                this.data[i][j] = [];
                for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    let n = k + j * PlanetTools.CHUNCKSIZE + i * PlanetTools.CHUNCKSIZE * PlanetTools.CHUNCKSIZE;
                    this.data[i][j][k] = parseInt(data[n]);
                }
            }
        }
    }
    saveToLocalStorage() {
        localStorage.setItem(this.name, this.serialize());
    }
    debugTextInfo() {
        let textInfo = [];
        textInfo[0] = this.name + ". degree=" + this.degree + ". adjacentsCount=" + this.adjacentsAsArray.length + ".";
        if (DebugDefine.USE_VERTEX_SET_MESH_HISTORY) {
            for (let i = 0; i < this._setMeshHistory.length; i++) {
                textInfo.push(this._setMeshHistory[i].toFixed(0));
            }
        }
        return textInfo;
    }
}
PlanetChunck._DEBUG_NICE_CHUNCK_COUNT = 0;
PlanetChunck._DEBUG_CHUNCK_COUNT = 0;
PlanetChunck._GLOBAL_DEBUG_SYNC_COUNT = 0;
class PlanetChunckGroup extends AbstractPlanetChunck {
    constructor(iPos, jPos, kPos, planetSide, parentGroup, degree, level) {
        super(iPos, jPos, kPos, planetSide, parentGroup);
        this.level = level;
        this.children = [];
        this.lines = [];
        this._subdivisionsCount = 0;
        this._subdivisionsSkipedCount = 0;
        this._subdivided = false;
        this.name = "group:" + this.side + ":" + this.iPos + "-" + this.jPos + "-" + this.kPos + ":" + this.level;
        this._degree = degree;
        this._size = PlanetTools.DegreeToSize(this.degree);
        this._chunckCount = PlanetTools.DegreeToChuncksCount(this.degree);
        this.kOffset = PlanetTools.DegreeToKOffset(this.degree);
        this.kOffsetNext = PlanetTools.DegreeToKOffset(this.degree + 1);
        let levelCoef = Math.pow(2, level);
        let iCenter = PlanetTools.CHUNCKSIZE * (this.iPos + 0.5) * levelCoef;
        let jCenter = PlanetTools.CHUNCKSIZE * (this.jPos + 0.5) * levelCoef;
        let pts = [];
        let kMin = Math.floor((this.kOffset + (this.kPos) * levelCoef) * PlanetTools.CHUNCKSIZE);
        let kMax = Math.floor((this.kOffset + (this.kPos + 1) * levelCoef) * PlanetTools.CHUNCKSIZE);
        kMax = Math.min(kMax, Math.floor(this.kOffsetNext * PlanetTools.CHUNCKSIZE));
        let altMin = PlanetTools.KGlobalToAltitude(Math.floor((this.kOffset + (this.kPos) * levelCoef) * PlanetTools.CHUNCKSIZE));
        let altMax = PlanetTools.KGlobalToAltitude(Math.floor((this.kOffset + (this.kPos + 1) * levelCoef) * PlanetTools.CHUNCKSIZE));
        pts.push(PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 0) * levelCoef, PlanetTools.CHUNCKSIZE * (this.jPos + 0) * levelCoef).scale(altMin));
        pts.push(PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 1) * levelCoef, PlanetTools.CHUNCKSIZE * (this.jPos + 0) * levelCoef).scale(altMin));
        pts.push(PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 1) * levelCoef, PlanetTools.CHUNCKSIZE * (this.jPos + 1) * levelCoef).scale(altMin));
        pts.push(PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 0) * levelCoef, PlanetTools.CHUNCKSIZE * (this.jPos + 1) * levelCoef).scale(altMin));
        pts.push(PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 0) * levelCoef, PlanetTools.CHUNCKSIZE * (this.jPos + 0) * levelCoef).scale(altMax));
        pts.push(PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 1) * levelCoef, PlanetTools.CHUNCKSIZE * (this.jPos + 0) * levelCoef).scale(altMax));
        pts.push(PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 1) * levelCoef, PlanetTools.CHUNCKSIZE * (this.jPos + 1) * levelCoef).scale(altMax));
        pts.push(PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 0) * levelCoef, PlanetTools.CHUNCKSIZE * (this.jPos + 1) * levelCoef).scale(altMax));
        this._barycenter = BABYLON.Vector3.Zero();
        pts.forEach(p => {
            this._barycenter.addInPlace(p);
        });
        this._barycenter.scaleInPlace(1 / pts.length);
        this._barycenter = BABYLON.Vector3.TransformCoordinates(this._barycenter, planetSide.computeWorldMatrix(true));
        if (kMin < this.planet.seaLevel && this.planet.seaLevel < kMax) {
            this.isShellLevel = true;
        }
        /*
        let p00 = PlanetTools.EvaluateVertex(chunck.size, i0, j0);
        
        let altOffset = 0;
        if (i < 0) {
            i0 = PlanetTools.CHUNCKSIZE * chunck.iPos * levelCoef;
            altOffset = - 0.2;
        }
        if (j < 0) {
            j0 = PlanetTools.CHUNCKSIZE * chunck.jPos * levelCoef;
            altOffset = - 0.2;
        }
        if (i > vertexCount) {
            i0 = PlanetTools.CHUNCKSIZE * (chunck.iPos + 1) * levelCoef;
            altOffset = - 0.2;
        }
        if (j > vertexCount) {
            j0 = PlanetTools.CHUNCKSIZE * (chunck.jPos + 1) * levelCoef;
            altOffset = - 0.2;
        }
        p00.scaleInPlace(PlanetTools.KGlobalToAltitude(h00 + 1) + altOffset);
        */
        if (this.isShellLevel) {
            this.drawMesh();
        }
    }
    drawMesh() {
        if (this.mesh) {
            this.mesh.dispose();
        }
        this.mesh = new BABYLON.Mesh(this.name);
        PlanetChunckMeshBuilder.BuildShellLevelVertexData(this).applyToMesh(this.mesh);
        if (DebugDefine.USE_CHUNCK_LEVEL_DEBUG_COLORS) {
            if (this.level === 1) {
                this.mesh.material = SharedMaterials.GreenMaterial();
            }
            else if (this.level === 2) {
                this.mesh.material = SharedMaterials.BlueMaterial();
            }
            else if (this.level === 3) {
                this.mesh.material = SharedMaterials.MagentaMaterial();
            }
            else if (this.level === 4) {
                this.mesh.material = SharedMaterials.YellowMaterial();
            }
            else if (this.level === 5) {
                this.mesh.material = SharedMaterials.CyanMaterial();
            }
            else if (this.level === 6) {
                this.mesh.material = SharedMaterials.RedMaterial();
            }
            else if (this.level === 7) {
                this.mesh.material = SharedMaterials.GreenMaterial();
            }
        }
        else {
            this.planetSide.onShellMaterialReady(() => {
                if (this.mesh && !this.mesh.isDisposed()) {
                    this.mesh.material = this.planetSide.shellMaterial;
                }
            });
        }
        this.mesh.parent = this.planetSide;
        this.mesh.freezeWorldMatrix();
        /*
        let pts: BABYLON.Vector3[] = [];
        let levelCoef = Math.pow(2, this.level);

        let altMin = PlanetTools.KGlobalToAltitude(Math.floor((this.kOffset + (this.kPos) * levelCoef) * PlanetTools.CHUNCKSIZE));
        let altMax = PlanetTools.KGlobalToAltitude(Math.floor((this.kOffset + (this.kPos + 1) * levelCoef) * PlanetTools.CHUNCKSIZE));

        pts.push(PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 0) * levelCoef, PlanetTools.CHUNCKSIZE * (this.jPos + 0) * levelCoef).scale(altMin));
        pts.push(PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 1) * levelCoef, PlanetTools.CHUNCKSIZE * (this.jPos + 0) * levelCoef).scale(altMin));
        pts.push(PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 1) * levelCoef, PlanetTools.CHUNCKSIZE * (this.jPos + 1) * levelCoef).scale(altMin));
        pts.push(PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 0) * levelCoef, PlanetTools.CHUNCKSIZE * (this.jPos + 1) * levelCoef).scale(altMin));
        pts.push(PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 0) * levelCoef, PlanetTools.CHUNCKSIZE * (this.jPos + 0) * levelCoef).scale(altMax));
        pts.push(PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 1) * levelCoef, PlanetTools.CHUNCKSIZE * (this.jPos + 0) * levelCoef).scale(altMax));
        pts.push(PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 1) * levelCoef, PlanetTools.CHUNCKSIZE * (this.jPos + 1) * levelCoef).scale(altMax));
        pts.push(PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 0) * levelCoef, PlanetTools.CHUNCKSIZE * (this.jPos + 1) * levelCoef).scale(altMax));

        let f = 0.99;

        let color = new BABYLON.Color4(1, 1, 1, 1);
        if (this.level === 1) {
            color = new BABYLON.Color4(1, 0, 0, 1);
            //this.mesh.material = SharedMaterials.RedMaterial();
            f = 0.99;
        }
        if (this.level === 2) {
            color = new BABYLON.Color4(0, 1, 0, 1);
            //this.mesh.material = SharedMaterials.GreenMaterial();
            f = 0.98;
        }
        if (this.level === 3) {
            color = new BABYLON.Color4(0, 0, 1, 1);
            //this.mesh.material = SharedMaterials.BlueMaterial();
            f = 0.97;
        }
        if (this.level === 4) {
            color = new BABYLON.Color4(0, 1, 1, 1);
            f = 0.96;
        }

        f = 1;
        for (let i = 0; i < pts.length; i++) {
            pts[i] = pts[i].scale(f).add(this.barycenter.scale(1 - f));
        }

        let hitBox = BABYLON.MeshBuilder.CreateLineSystem(
            "hitbox",
            {
                lines: [
                    [pts[0], pts[1], pts[2], pts[3], pts[0]],
                    [pts[4], pts[5], pts[6], pts[7], pts[4]],
                    [pts[0], pts[4]],
                    [pts[1], pts[5]],
                    [pts[2], pts[6]],
                    [pts[3], pts[7]]
                ],
                colors: [
                    [color, color, color, color, color],
                    [color, color, color, color, color],
                    [color, color],
                    [color, color],
                    [color, color],
                    [color, color]
                ]
            },
            this.scene
        );
        
        hitBox.layerMask = 0x10000000;
        hitBox.parent = this.mesh;
        */
    }
    getPlanetChunck(iPos, jPos, kPos) {
        if (!this.children || this.children.length === 0) {
            this.subdivide();
        }
        if (this.level === 1) {
            let i = Math.floor((iPos - 2 * this.iPos));
            let j = Math.floor((jPos - 2 * this.jPos));
            let k = Math.floor((kPos - (2 * this.kPos + this.kOffset)));
            let child = this.children[j + 2 * i + 4 * k];
            if (child instanceof PlanetChunck) {
                return child;
            }
            else {
                console.error("PlanetChunckGroup " + this.name + " of level == 1 has a child that is not a PlanetChunck.");
                debugger;
            }
        }
        else {
            let levelCoef = Math.pow(2, this.level);
            let i = Math.floor((iPos - levelCoef * this.iPos) / (levelCoef / 2));
            let j = Math.floor((jPos - levelCoef * this.jPos) / (levelCoef / 2));
            let k = Math.floor((kPos - this.kOffset - levelCoef * this.kPos) / (levelCoef / 2));
            let child = this.children[j + 2 * i + 4 * k];
            if (child instanceof PlanetChunckGroup) {
                return child.getPlanetChunck(iPos, jPos, kPos);
            }
            else {
                console.error("PlanetChunckGroup " + this.name + " of level > 1 has a child that is not a PlanetChunckGroup.");
                debugger;
            }
        }
        console.error("PlanetChunckGroup " + this.name + " does not contain PlanetChunck " + iPos + " " + jPos + " " + kPos);
        debugger;
    }
    get subdivided() {
        return this._subdivided;
    }
    subdivide() {
        this._subdivisionsSkipedCount++;
        this.unregister();
        if (this._subdivided) {
            return;
        }
        this._subdivided = true;
        for (let k = 0; k < 2; k++) {
            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 2; j++) {
                    if (this.level === 1) {
                        let childKPos = this.kOffset + this.kPos * 2 + k;
                        if (childKPos < this.kOffsetNext) {
                            let chunck = this.children[j + 2 * i + 4 * k];
                            if (!chunck) {
                                chunck = PlanetChunck.CreateChunck(this.iPos * 2 + i, this.jPos * 2 + j, childKPos, this.planetSide, this);
                                //console.log(PlanetChunck._DEBUG_NICE_CHUNCK_COUNT + " " + PlanetChunck._DEBUG_CHUNCK_COUNT);
                                this.children[j + 2 * i + 4 * k] = chunck;
                            }
                            chunck.register();
                        }
                    }
                    else {
                        let levelCoef = Math.pow(2, this.level - 1);
                        let childKPos = this.kPos * 2 + k;
                        if (childKPos * levelCoef < this.kOffsetNext - this.kOffset) {
                            let chunck = this.children[j + 2 * i + 4 * k];
                            if (!chunck) {
                                chunck = new PlanetChunckGroup(this.iPos * 2 + i, this.jPos * 2 + j, childKPos, this.planetSide, this, this.degree, this.level - 1);
                                this.children[j + 2 * i + 4 * k] = chunck;
                                if (chunck.isShellLevel) {
                                    chunck.drawMesh();
                                }
                            }
                            chunck.register();
                        }
                    }
                }
            }
        }
        if (this.mesh) {
            this.mesh.dispose();
        }
        this._subdivisionsCount++;
        //console.log(this.name + " " + this._subdivisionsCount + " (" + this._subdivisionsSkipedCount + ")");
    }
    collapse() {
        if (this.canCollapse()) {
            if (this.parentGroup) {
                this.parentGroup.collapseChildren();
            }
        }
    }
    collapseChildren() {
        for (let i = 0; i < this.children.length; i++) {
            let child = this.children[i];
            if (child instanceof PlanetChunck) {
                child.disposeMesh();
                child.unregister();
            }
            else if (child instanceof PlanetChunckGroup) {
                if (child.subdivided) {
                    child.collapseChildren();
                }
                if (child.mesh) {
                    child.mesh.dispose();
                }
                child.lines.forEach(l => { l.dispose(); });
                child.unregister();
            }
        }
        this.children = [];
        if (this.isShellLevel) {
            this.drawMesh();
        }
        this._subdivided = false;
        this.register();
    }
}
class PlanetChunckRedrawRequest {
    constructor(chunck, callback, info = "") {
        this.chunck = chunck;
        this.callback = callback;
        this.info = info;
    }
}
class PlanetChunckManager {
    // activity increase while manager is redrawing Chuncks.
    //private _maxActivity: number = 20;
    constructor(scene) {
        this.scene = scene;
        this._needRedraw = [];
        this._layersCount = 6;
        // estimated percentage of chuncks in the adequate layer
        this.chunckSortedRatio = 0;
        this._update = () => {
            if (this.scene.activeCameras && this.scene.activeCameras.length > 0) {
                this._viewpoint.copyFrom(this.scene.activeCameras[0].globalPosition);
            }
            else {
                this._viewpoint.copyFrom(this.scene.activeCamera.globalPosition);
            }
            let t0 = performance.now();
            let t = t0;
            let sortedCount = 0;
            let unsortedCount = 0;
            let todo = [];
            while ((t - t0) < 1 && todo.length < 100) {
                for (let prevLayerIndex = 0; prevLayerIndex < this._layersCount; prevLayerIndex++) {
                    let cursor = this._layersCursors[prevLayerIndex];
                    let chunck = this._layers[prevLayerIndex][cursor];
                    if (chunck) {
                        chunck.sqrDistanceToViewpoint = BABYLON.Vector3.DistanceSquared(this._viewpoint, chunck.barycenter);
                        let newLayerIndex = this._getLayerIndex(chunck.sqrDistanceToViewpoint);
                        if (newLayerIndex != prevLayerIndex) {
                            let adequateLayerCursor = this._layersCursors[newLayerIndex];
                            this._layers[prevLayerIndex].splice(cursor, 1);
                            this._layers[newLayerIndex].splice(adequateLayerCursor, 0, chunck);
                            chunck.lod = newLayerIndex;
                            todo.push(chunck);
                            this._layersCursors[newLayerIndex]++;
                            if (this._layersCursors[newLayerIndex] >= this._layers[newLayerIndex].length) {
                                this._layersCursors[newLayerIndex] = 0;
                            }
                            unsortedCount++;
                        }
                        else {
                            this._layersCursors[prevLayerIndex]++;
                            if (this._layersCursors[prevLayerIndex] >= this._layers[prevLayerIndex].length) {
                                this._layersCursors[prevLayerIndex] = 0;
                            }
                            sortedCount++;
                        }
                    }
                    else {
                        this._layersCursors[prevLayerIndex] = 0;
                        if (prevLayerIndex === this._layersCount) {
                            break;
                        }
                    }
                }
                t = performance.now();
            }
            for (let i = 0; i < todo.length; i++) {
                this.onChunckMovedToLayer(todo[i], todo[i].lod);
            }
            /*
            if (this._needRedraw.length > 0) {
                this._activity ++;
                this._activity = Math.min(this._activity, this._maxActivity);
            }
            else {
                this._activity--;
                this._activity = Math.max(this._activity, 0);
                if (this._activity < 1) {
                    if (this._onNextInactiveCallback) {
                        this._onNextInactiveCallback();
                        this._onNextInactiveCallback = undefined;
                    }
                }
            }
            */
            this._needRedraw = this._needRedraw.sort((r1, r2) => { return r2.chunck.sqrDistanceToViewpoint - r1.chunck.sqrDistanceToViewpoint; });
            // Recalculate chunck meshes.
            t0 = performance.now();
            while (this._needRedraw.length > 0 && (t - t0) < 1000 / 120) {
                let request = this._needRedraw.pop();
                if (request.chunck.lod === 0) {
                    request.chunck.initialize();
                }
                else {
                    request.chunck.disposeMesh();
                }
                t = performance.now();
            }
            if ((t - t0) > 100) {
                console.log(((t - t0)).toFixed(3));
            }
            this.chunckSortedRatio = (this.chunckSortedRatio + sortedCount / (sortedCount + unsortedCount)) * 0.5;
            if (isNaN(this.chunckSortedRatio)) {
                this.chunckSortedRatio = 1;
            }
        };
    }
    get needRedrawCount() {
        return this._needRedraw.length;
    }
    lodLayerCount(layerIndex) {
        return this._layers[layerIndex].length;
    }
    initialize() {
        this._layersCount = Config.performanceConfiguration.lodRanges.length;
        if (this.scene.activeCameras && this.scene.activeCameras.length > 0) {
            this._viewpoint = this.scene.activeCameras[0].globalPosition.clone();
        }
        else {
            this._viewpoint = this.scene.activeCamera.globalPosition.clone();
        }
        this._layers = [];
        this._layersCursors = [];
        this._lodLayersSqrDistances = [];
        for (let i = 0; i < this._layersCount - 1; i++) {
            this._layers[i] = [];
            this._layersCursors[i] = 0;
            this._lodLayersSqrDistances[i] = Config.performanceConfiguration.lodRanges[i] * Config.performanceConfiguration.lodRanges[i];
        }
        this._layers[this._layersCount - 1] = [];
        this._layersCursors[this._layersCount - 1] = 0;
        this._lodLayersSqrDistances[this._layersCount - 1] = Infinity;
        this.scene.onBeforeRenderObservable.add(this._update);
        Config.performanceConfiguration.onLodConfigChangedCallbacks.push(() => {
            this._layersCount = Config.performanceConfiguration.lodRanges.length;
            this._layersCursors = [];
            this._lodLayersSqrDistances = [];
            for (let i = 0; i < this._layersCount - 1; i++) {
                this._layersCursors[i] = 0;
                this._lodLayersSqrDistances[i] = Config.performanceConfiguration.lodRanges[i] * Config.performanceConfiguration.lodRanges[i];
            }
            this._layersCursors[this._layersCount - 1] = 0;
            this._lodLayersSqrDistances[this._layersCount - 1] = Infinity;
        });
    }
    dispose() {
        this.scene.onBeforeRenderObservable.removeCallback(this._update);
    }
    registerChunck(chunck) {
        while (this.unregister(chunck)) {
        }
        if (this._layers[this._layersCount - 1].indexOf(chunck) === -1) {
            this._layers[this._layersCount - 1].push(chunck);
            chunck.lod = this._layersCount - 1;
        }
        return true;
    }
    unregister(chunck) {
        for (let layerIndex = 0; layerIndex < this._layers.length; layerIndex++) {
            let index = this._layers[layerIndex].indexOf(chunck);
            if (index != -1) {
                this._layers[layerIndex].splice(index, 1);
                return true;
            }
        }
        return false;
    }
    async requestDraw(chunck, prio, info) {
        if (chunck.lod <= Config.performanceConfiguration.lodCount) {
            return new Promise(resolve => {
                if (!this._needRedraw.find(request => { return request.chunck === chunck; })) {
                    this._needRedraw.push(new PlanetChunckRedrawRequest(chunck, resolve, info));
                }
            });
        }
        else {
        }
    }
    cancelDraw(chunck) {
        let index = this._needRedraw.findIndex(request => { return request.chunck === chunck; });
        if (index != -1) {
            this._needRedraw.splice(index, 1);
        }
    }
    _getLayerIndex(sqrDistance) {
        for (let i = 0; i < this._layersCount - 1; i++) {
            if (sqrDistance < this._lodLayersSqrDistances[i]) {
                return i;
            }
        }
        return this._layersCount - 1;
    }
    onChunckMovedToLayer(chunck, layerIndex) {
        if (!chunck.registered) {
            return;
        }
        if (Math.random() < 1 / 100) {
            //console.log("chunck lod = " + chunck.lod + " " + chunck.sqrDistanceToViewpoint.toFixed(0) + " " + chunck.planetName);
        }
        if (layerIndex < Config.performanceConfiguration.lodCount) {
            if (chunck instanceof PlanetChunck) {
                this.requestDraw(chunck, 0, "ChunckManager.update");
            }
            else if (chunck instanceof PlanetChunckGroup) {
                if (Math.random() < 1 / 100) {
                    console.log("wtf !");
                }
                return chunck.subdivide();
            }
        }
        else {
            if (chunck instanceof PlanetChunck) {
                this.cancelDraw(chunck);
                chunck.collapse();
                return;
            }
            else if (chunck instanceof PlanetChunckGroup) {
                let expectedLevel = layerIndex - (Config.performanceConfiguration.lodCount - 1);
                if (chunck.level > expectedLevel) {
                    //console.log("sub " + chunck.name + " expected " + expectedLevel + " " + chunck.sqrDistanceToViewpoint.toFixed(0));
                    chunck.subdivide();
                    return;
                }
                else if (chunck.level < expectedLevel) {
                    //console.log("col " + chunck.name + " expected " + expectedLevel + " " + chunck.sqrDistanceToViewpoint.toFixed(0));
                    chunck.collapse();
                    return;
                }
            }
        }
    }
}
class PlanetChunckMeshBuilder {
    static get BlockColor() {
        if (!PCMB._BlockColor) {
            PCMB._BlockColor = new Map();
            PCMB._BlockColor.set(BlockType.None, undefined);
            PCMB._BlockColor.set(BlockType.Grass, BABYLON.Color3.FromHexString("#50723C"));
            PCMB._BlockColor.set(BlockType.Dirt, BABYLON.Color3.FromHexString("#462521"));
            PCMB._BlockColor.set(BlockType.Sand, BABYLON.Color3.FromHexString("#F5B700"));
            PCMB._BlockColor.set(BlockType.Rock, BABYLON.Color3.FromHexString("#9DB5B2"));
            PCMB._BlockColor.set(BlockType.Wood, BABYLON.Color3.FromHexString("#965106"));
            PCMB._BlockColor.set(BlockType.Leaf, BABYLON.Color3.FromHexString("#27a800"));
        }
        return PCMB._BlockColor;
    }
    static GetVertex(size, i, j) {
        let out = BABYLON.Vector3.Zero();
        return PCMB.GetVertexToRef(size, i, j, out);
    }
    static GetVertexToRef(size, i, j, out) {
        if (!PCMB.cachedVertices) {
            PCMB.cachedVertices = [];
        }
        if (!PCMB.cachedVertices[size]) {
            PCMB.cachedVertices[size] = [];
        }
        if (!PCMB.cachedVertices[size][i]) {
            PCMB.cachedVertices[size][i] = [];
        }
        if (!PCMB.cachedVertices[size][i][j]) {
            PCMB.cachedVertices[size][i][j] = PlanetTools.EvaluateVertex(size, i, j);
        }
        out.copyFrom(PCMB.cachedVertices[size][i][j]);
        return out;
    }
    static BuildBlockVertexData(size, iGlobal, jGlobal, hGlobal, data, scale = 1) {
        let vertexData = new BABYLON.VertexData();
        if (!PCMB.tmpVertices) {
            PCMB.tmpVertices = [];
            for (let i = 0; i < 8; i++) {
                PCMB.tmpVertices[i] = BABYLON.Vector3.Zero();
            }
        }
        else {
            for (let i = 0; i < 8; i++) {
                PCMB.tmpVertices[i].copyFromFloats(0, 0, 0);
            }
        }
        let positions = [];
        let indices = [];
        let uvs = [];
        let colors = [];
        PCMB.GetVertexToRef(2 * size, 2 * (iGlobal) + 1, 2 * (jGlobal) + 1, PCMB.tmpVertices[0]);
        PCMB.GetVertexToRef(2 * size, 2 * (iGlobal) + 1, 2 * (jGlobal + 1) + 1, PCMB.tmpVertices[1]);
        PCMB.GetVertexToRef(2 * size, 2 * (iGlobal + 1) + 1, 2 * (jGlobal) + 1, PCMB.tmpVertices[2]);
        PCMB.GetVertexToRef(2 * size, 2 * (iGlobal + 1) + 1, 2 * (jGlobal + 1) + 1, PCMB.tmpVertices[3]);
        let center = PCMB.tmpVertices[0].add(PCMB.tmpVertices[1]).add(PCMB.tmpVertices[2]).add(PCMB.tmpVertices[3]);
        center.scaleInPlace(0.25);
        for (let i = 0; i < 4; i++) {
            PCMB.tmpVertices[i].scaleInPlace(0.8).addInPlace(center.scale(0.2));
        }
        let hLow = PlanetTools.KGlobalToAltitude(hGlobal);
        let hHigh = PlanetTools.KGlobalToAltitude(hGlobal + 1);
        PCMB.tmpVertices[0].scaleToRef(hHigh, PCMB.tmpVertices[4]);
        PCMB.tmpVertices[1].scaleToRef(hHigh, PCMB.tmpVertices[5]);
        PCMB.tmpVertices[2].scaleToRef(hHigh, PCMB.tmpVertices[6]);
        PCMB.tmpVertices[3].scaleToRef(hHigh, PCMB.tmpVertices[7]);
        PCMB.tmpVertices[0].scaleInPlace(hLow);
        PCMB.tmpVertices[1].scaleInPlace(hLow);
        PCMB.tmpVertices[2].scaleInPlace(hLow);
        PCMB.tmpVertices[3].scaleInPlace(hLow);
        if (scale != 1) {
            this._tmpBlockCenter.copyFrom(PCMB.tmpVertices[0]);
            for (let v = 1; v < PCMB.tmpVertices.length; v++) {
                this._tmpBlockCenter.addInPlace(PCMB.tmpVertices[v]);
            }
            this._tmpBlockCenter.scaleInPlace(1 / PCMB.tmpVertices.length);
            for (let v = 0; v < PCMB.tmpVertices.length; v++) {
                PCMB.tmpVertices[v].subtractInPlace(this._tmpBlockCenter);
                PCMB.tmpVertices[v].scaleInPlace(scale);
                PCMB.tmpVertices[v].addInPlace(this._tmpBlockCenter);
            }
        }
        let c = PCMB.BlockColor.get(data);
        if (!c) {
            c = PCMB.BlockColor.get(136);
        }
        MeshTools.PushQuad(PCMB.tmpVertices, 1, 5, 4, 0, positions, indices);
        MeshTools.PushSideQuadUvs(data, uvs);
        MeshTools.PushQuadColor(c.r, c.g, c.b, 1, colors);
        MeshTools.PushQuad(PCMB.tmpVertices, 0, 4, 6, 2, positions, indices);
        MeshTools.PushSideQuadUvs(data, uvs);
        MeshTools.PushQuadColor(c.r, c.g, c.b, 1, colors);
        MeshTools.PushQuad(PCMB.tmpVertices, 0, 2, 3, 1, positions, indices);
        MeshTools.PushTopQuadUvs(data, uvs);
        MeshTools.PushQuadColor(c.r, c.g, c.b, 1, colors);
        MeshTools.PushQuad(PCMB.tmpVertices, 2, 6, 7, 3, positions, indices);
        MeshTools.PushSideQuadUvs(data, uvs);
        MeshTools.PushQuadColor(c.r, c.g, c.b, 1, colors);
        MeshTools.PushQuad(PCMB.tmpVertices, 3, 7, 5, 1, positions, indices);
        MeshTools.PushSideQuadUvs(data, uvs);
        MeshTools.PushQuadColor(c.r, c.g, c.b, 1, colors);
        MeshTools.PushQuad(PCMB.tmpVertices, 4, 5, 7, 6, positions, indices);
        MeshTools.PushTopQuadUvs(data, uvs);
        MeshTools.PushQuadColor(c.r, c.g, c.b, 1, colors);
        let normals = [];
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.uvs = uvs;
        vertexData.colors = colors;
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        vertexData.normals = normals;
        return vertexData;
    }
    static ManhattanLength(x, y, z) {
        return x + y + z;
    }
    static SquaredLength(x, y, z) {
        return x * x + y * y + z * z;
    }
    static Length(x, y, z) {
        return Math.sqrt(PCMB.SquaredLength(x, y, z));
    }
    static DistanceSquared(x0, y0, z0, x1, y1, z1) {
        let x = x1 - x0;
        let y = y1 - y0;
        let z = z1 - z0;
        return x * x + y * y + z * z;
    }
    static Distance(x0, y0, z0, x1, y1, z1) {
        return Math.sqrt(PCMB.DistanceSquared(x0, y0, z0, x1, y1, z1));
    }
    static BuildVertexData(chunck, iPos, jPos, kPos) {
        let lod = chunck.lod;
        let size = chunck.size;
        let vertexData = new BABYLON.VertexData();
        if (!PCMB.tmpVertices || PCMB.tmpVertices.length < 30) {
            PCMB.tmpVertices = [];
            for (let i = 0; i < 30; i++) {
                PCMB.tmpVertices[i] = BABYLON.Vector3.Zero();
            }
        }
        if (!PCMB.tmpUVs || PCMB.tmpUVs.length < 8) {
            PCMB.tmpUVs = [];
            for (let i = 0; i < 8; i++) {
                PCMB.tmpUVs[i] = BABYLON.Vector2.Zero();
            }
        }
        if (!PCMB.tmpQuaternions || PCMB.tmpQuaternions.length < 1) {
            PCMB.tmpQuaternions = [];
            for (let i = 0; i < 1; i++) {
                PCMB.tmpQuaternions[i] = BABYLON.Quaternion.Identity();
            }
        }
        let unstretchedPositionsX = [];
        let unstretchedPositionsY = [];
        let unstretchedPositionsZ = [];
        let positions = [];
        let indices = [];
        let trianglesData = [];
        let uvs = [];
        let uvs2 = [];
        let normals = [];
        let colors = [];
        let waterPositions = [];
        let waterIndices = [];
        let waterUvs = [];
        let waterNormals = [];
        let waterColors = [];
        let v0 = PCMB.tmpVertices[0];
        let v1 = PCMB.tmpVertices[1];
        let v2 = PCMB.tmpVertices[2];
        let v3 = PCMB.tmpVertices[3];
        let v4 = PCMB.tmpVertices[4];
        let v5 = PCMB.tmpVertices[5];
        let v6 = PCMB.tmpVertices[6];
        let v7 = PCMB.tmpVertices[7];
        let v01 = PCMB.tmpVertices[8];
        let v32 = PCMB.tmpVertices[9];
        let v45 = PCMB.tmpVertices[10];
        let v76 = PCMB.tmpVertices[11];
        let v0132 = PCMB.tmpVertices[12];
        let v4576 = PCMB.tmpVertices[13];
        let vertex = PCMB.tmpVertices[14];
        let chunckDir = PCMB.tmpVertices[15];
        PCMB.GetVertexToRef(size, iPos * PlanetTools.CHUNCKSIZE, jPos * PlanetTools.CHUNCKSIZE, PCMB.tmpVertices[0]);
        PCMB.GetVertexToRef(size, (iPos + 1) * PlanetTools.CHUNCKSIZE, (jPos + 1) * PlanetTools.CHUNCKSIZE, PCMB.tmpVertices[1]);
        chunckDir.copyFrom(PCMB.tmpVertices[1]).subtractInPlace(PCMB.tmpVertices[0]).normalize();
        BABYLON.Vector3.TransformNormalToRef(chunckDir, chunck.planetSide.getWorldMatrix(), chunckDir);
        let uL = 1 / (PlanetTools.CHUNCKSIZE - chunck.firstI);
        let vL = 1 / (PlanetTools.CHUNCKSIZE - chunck.firstJ);
        let wL = 1 / (PlanetTools.CHUNCKSIZE - chunck.firstK);
        for (let i = chunck.firstI; i < PlanetTools.CHUNCKSIZE; i++) {
            let u = (i - chunck.firstI) / (PlanetTools.CHUNCKSIZE - chunck.firstI);
            for (let j = chunck.firstJ; j < chunck.lastJ; j++) {
                let v = (j - chunck.firstJ) / (PlanetTools.CHUNCKSIZE - chunck.firstJ);
                for (let k = chunck.firstK; k < PlanetTools.CHUNCKSIZE; k++) {
                    let w = (k - chunck.firstK) / (PlanetTools.CHUNCKSIZE - chunck.firstK);
                    let cornerCase = false;
                    if ((chunck.side === Side.Top || chunck.side === Side.Bottom) && chunck.isCorner) {
                        if (chunck.iPos === 0) {
                            if (i === chunck.firstI) {
                                if (chunck.jPos === 0) {
                                    if (j === chunck.firstJ) {
                                        cornerCase = true;
                                        //console.log("imin jmin");
                                    }
                                }
                                if (chunck.jPos === chunck.chunckCount - 1) {
                                    if (j === chunck.lastJ - 1) {
                                        cornerCase = true;
                                        //console.log("imin jmax");
                                    }
                                }
                            }
                        }
                        if (chunck.iPos === chunck.chunckCount - 1) {
                            if (i === PlanetTools.CHUNCKSIZE - 1) {
                                if (chunck.jPos === 0) {
                                    if (j === chunck.firstJ) {
                                        cornerCase = true;
                                        //console.log("imax jmin");
                                    }
                                }
                                if (chunck.jPos === chunck.chunckCount - 1) {
                                    if (j === chunck.lastJ - 1) {
                                        cornerCase = true;
                                        //console.log("imax jmax");
                                    }
                                }
                            }
                        }
                    }
                    if (cornerCase) {
                        let d = chunck.GetData(i, j, k);
                        if (d > BlockType.Water) {
                            let cornerFace = 0;
                            if (chunck.GetData(i, j, k + 1) <= BlockType.Water) {
                                cornerFace = 1;
                            }
                            else if (chunck.GetData(i, j, k - 1) <= BlockType.Water) {
                                cornerFace = -1;
                            }
                            if (cornerFace != 0) {
                                let iGlobal = i + iPos * PlanetTools.CHUNCKSIZE;
                                let jGlobal = j + jPos * PlanetTools.CHUNCKSIZE;
                                PCMB.GetVertexToRef(2 * size, 2 * (iGlobal) + 1, 2 * (jGlobal) + 1, v0);
                                PCMB.GetVertexToRef(2 * size, 2 * (iGlobal + 1) + 1, 2 * (jGlobal) + 1, v1);
                                PCMB.GetVertexToRef(2 * size, 2 * (iGlobal + 1) + 1, 2 * (jGlobal + 1) + 1, v2);
                                PCMB.GetVertexToRef(2 * size, 2 * (iGlobal) + 1, 2 * (jGlobal + 1) + 1, v3);
                                let hGlobal = (k + kPos * PlanetTools.CHUNCKSIZE) + cornerFace * 0.5;
                                let hLow = PlanetTools.KGlobalToAltitude(hGlobal - 0.5) * 0.5 + PlanetTools.KGlobalToAltitude(hGlobal + 0.5) * 0.5;
                                let hHigh = PlanetTools.KGlobalToAltitude(hGlobal + 0.5) * 0.5 + PlanetTools.KGlobalToAltitude(hGlobal + 1.5) * 0.5;
                                let h = hLow * 0.5 + hHigh * 0.5;
                                v0.scaleInPlace(h);
                                PCMB.tmpUVs[0].copyFromFloats(u + 0 * uL, v + 0 * vL);
                                PCMB.tmpUVs[4].copyFromFloats(w + 0 * wL, 1);
                                v1.scaleInPlace(h);
                                PCMB.tmpUVs[1].copyFromFloats(u + 1 * uL, v + 0 * vL);
                                PCMB.tmpUVs[5].copyFromFloats(w + 0 * wL, 1);
                                v2.scaleInPlace(h);
                                PCMB.tmpUVs[2].copyFromFloats(u + 1 * uL, v + 1 * vL);
                                PCMB.tmpUVs[6].copyFromFloats(w + 0 * wL, 1);
                                v3.scaleInPlace(h);
                                PCMB.tmpUVs[3].copyFromFloats(u + 0 * uL, v + 1 * vL);
                                PCMB.tmpUVs[7].copyFromFloats(w + 0 * wL, 1);
                                if (BABYLON.Vector3.DistanceSquared(v0, v1) < 0.01) {
                                    v1.copyFrom(v2);
                                    PCMB.tmpUVs[1].copyFrom(PCMB.tmpUVs[2]);
                                    PCMB.tmpUVs[5].copyFrom(PCMB.tmpUVs[6]);
                                    v2.copyFrom(v3);
                                    PCMB.tmpUVs[2].copyFrom(PCMB.tmpUVs[3]);
                                    PCMB.tmpUVs[6].copyFrom(PCMB.tmpUVs[7]);
                                }
                                else if (BABYLON.Vector3.DistanceSquared(v1, v2) < 0.01) {
                                    v2.copyFrom(v3);
                                    PCMB.tmpUVs[2].copyFrom(PCMB.tmpUVs[3]);
                                    PCMB.tmpUVs[6].copyFrom(PCMB.tmpUVs[7]);
                                }
                                let l = positions.length / 3;
                                //positions.push(v0.x, v0.y, v0.z, v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v3.x, v3.y, v3.z);
                                positions.push(v0.x, v0.y, v0.z, v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
                                //normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
                                normals.push(0, cornerFace, 0, 0, cornerFace, 0, 0, cornerFace, 0);
                                //indices.push(l, l + 1, l + 2, l, l + 2, l + 3);
                                if (cornerFace > 0) {
                                    indices.push(l, l + 1, l + 2);
                                }
                                else {
                                    indices.push(l, l + 2, l + 1);
                                }
                                //colors.push(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1);
                                colors.push(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1);
                                //uvs.push(u, v, u, v, u, v, u, v);
                                uvs.push(PCMB.tmpUVs[0].x, PCMB.tmpUVs[0].y, PCMB.tmpUVs[1].x, PCMB.tmpUVs[1].y, PCMB.tmpUVs[2].x, PCMB.tmpUVs[2].y);
                                //uvs2.push(w, 1, w, 1, w, 1, w, 1);
                                uvs2.push(PCMB.tmpUVs[4].x, PCMB.tmpUVs[4].y, PCMB.tmpUVs[5].x, PCMB.tmpUVs[5].y, PCMB.tmpUVs[6].x, PCMB.tmpUVs[6].y);
                                //trianglesData.push(d, d);
                                trianglesData.push(d);
                            }
                        }
                    }
                    else {
                        let ref = 0b0;
                        let d0 = chunck.GetData(i, j, k);
                        if (d0 > BlockType.Water) {
                            ref |= 0b1 << 0;
                        }
                        let d4 = chunck.GetData(i, j, k + 1);
                        if (d4 > BlockType.Water) {
                            ref |= 0b1 << 4;
                        }
                        // Solid case
                        let d1 = chunck.GetData(i + 1, j, k);
                        if (d1 > BlockType.Water) {
                            ref |= 0b1 << 1;
                        }
                        let d2 = chunck.GetData(i + 1, j + 1, k);
                        if (d2 > BlockType.Water) {
                            ref |= 0b1 << 2;
                        }
                        let d3 = chunck.GetData(i, j + 1, k);
                        if (d3 > BlockType.Water) {
                            ref |= 0b1 << 3;
                        }
                        let d5 = chunck.GetData(i + 1, j, k + 1);
                        if (d5 > BlockType.Water) {
                            ref |= 0b1 << 5;
                        }
                        let d6 = chunck.GetData(i + 1, j + 1, k + 1);
                        if (d6 > BlockType.Water) {
                            ref |= 0b1 << 6;
                        }
                        let d7 = chunck.GetData(i, j + 1, k + 1);
                        if (d7 > BlockType.Water) {
                            ref |= 0b1 << 7;
                        }
                        let iGlobal = i + iPos * PlanetTools.CHUNCKSIZE;
                        let jGlobal = j + jPos * PlanetTools.CHUNCKSIZE;
                        let kGlobal = (k + kPos * PlanetTools.CHUNCKSIZE);
                        // Water case
                        if (d0 === BlockType.Water && d4 === BlockType.None || d1 === BlockType.Water && d5 === BlockType.None || d2 === BlockType.Water && d6 === BlockType.None || d3 === BlockType.Water && d7 === BlockType.None) {
                            let altitude = PlanetTools.KGlobalToAltitude(kGlobal) * 0.5 + PlanetTools.KGlobalToAltitude(kGlobal + 1) * 0.5;
                            PCMB.GetVertexToRef(2 * size, 2 * (iGlobal) + 1, 2 * (jGlobal) + 1, PCMB.tmpVertices[0]);
                            PCMB.GetVertexToRef(2 * size, 2 * (iGlobal) + 1, 2 * (jGlobal + 1) + 1, PCMB.tmpVertices[1]);
                            PCMB.GetVertexToRef(2 * size, 2 * (iGlobal + 1) + 1, 2 * (jGlobal) + 1, PCMB.tmpVertices[2]);
                            PCMB.GetVertexToRef(2 * size, 2 * (iGlobal + 1) + 1, 2 * (jGlobal + 1) + 1, PCMB.tmpVertices[3]);
                            PCMB.tmpVertices[0].scaleInPlace(altitude);
                            PCMB.tmpVertices[1].scaleInPlace(altitude);
                            PCMB.tmpVertices[2].scaleInPlace(altitude);
                            PCMB.tmpVertices[3].scaleInPlace(altitude);
                            let vertices = [PCMB.tmpVertices[0], PCMB.tmpVertices[1], PCMB.tmpVertices[2], PCMB.tmpVertices[3]];
                            MeshTools.PushQuad(vertices, 0, 1, 3, 2, waterPositions, waterIndices);
                            MeshTools.PushWaterUvs(waterUvs);
                            MeshTools.PushQuad(vertices, 0, 2, 3, 1, waterPositions, waterIndices);
                            MeshTools.PushWaterUvs(waterUvs);
                        }
                        if (ref === 0b0 || ref === 0b11111111) {
                            continue;
                        }
                        //if (d4 > BlockType.Water && d5 > BlockType.Water && d6 > BlockType.Water && d7 > BlockType.Water) {
                        //    continue;
                        //}
                        let dAsArray = [d0, d1, d2, d3, d4, d5, d6, d7];
                        let extendedpartVertexData = PlanetChunckVertexData.Get(lod + Config.performanceConfiguration.lodMin, ref);
                        if (!extendedpartVertexData) {
                            console.log("fail " + lod + " " + Config.performanceConfiguration.lodMin);
                            debugger;
                            continue;
                        }
                        let partVertexData = extendedpartVertexData.vertexData;
                        PCMB.GetVertexToRef(2 * size, 2 * (iGlobal) + 1, 2 * (jGlobal) + 1, PCMB.tmpVertices[0]);
                        PCMB.GetVertexToRef(2 * size, 2 * (iGlobal + 1) + 1, 2 * (jGlobal) + 1, PCMB.tmpVertices[1]);
                        PCMB.GetVertexToRef(2 * size, 2 * (iGlobal + 1) + 1, 2 * (jGlobal + 1) + 1, PCMB.tmpVertices[2]);
                        PCMB.GetVertexToRef(2 * size, 2 * (iGlobal) + 1, 2 * (jGlobal + 1) + 1, PCMB.tmpVertices[3]);
                        /*
                        for (let i = 0; i < 4; i++) {
                            blockCenter.copyFrom(PCMB.tmpVertices[i]).addInPlace(PCMB.tmpVertices[2]).scaleInPlace(0.5);
                            let angle = VMath.Angle(BABYLON.Axis.Y, blockCenter);
                            BABYLON.Vector3.CrossToRef(BABYLON.Axis.Y, blockCenter, blockAxis);
                            BABYLON.Quaternion.RotationAxisToRef(blockAxis, angle, blockQuaternions[i]);
                        }
                        */
                        let altLow = PlanetTools.KGlobalToAltitude(kGlobal) * 0.5 + PlanetTools.KGlobalToAltitude(kGlobal + 1) * 0.5;
                        let altHigh = PlanetTools.KGlobalToAltitude(kGlobal + 1) * 0.5 + PlanetTools.KGlobalToAltitude(kGlobal + 2) * 0.5;
                        PCMB.tmpVertices[0].scaleToRef(altHigh /* + Math.sin(iGlobal * 10000 + jGlobal * 5000 + (hGlobal + 1) * 20000) * 0.15*/, PCMB.tmpVertices[4]);
                        PCMB.tmpVertices[1].scaleToRef(altHigh /* + Math.sin((iGlobal + 1) * 10000 + jGlobal * 5000 + (hGlobal + 1) * 20000) * 0.15*/, PCMB.tmpVertices[5]);
                        PCMB.tmpVertices[2].scaleToRef(altHigh /* + Math.sin((iGlobal + 1) * 10000 + (jGlobal + 1) * 5000 + (hGlobal + 1) * 20000) * 0.15*/, PCMB.tmpVertices[6]);
                        PCMB.tmpVertices[3].scaleToRef(altHigh /* + Math.sin(iGlobal * 10000 + (jGlobal + 1) * 5000 + (hGlobal + 1) * 20000) * 0.15*/, PCMB.tmpVertices[7]);
                        PCMB.tmpVertices[0].scaleInPlace(altLow /* + Math.sin(iGlobal * 10000 + jGlobal * 5000 + hGlobal * 20000) * 0.15*/);
                        PCMB.tmpVertices[1].scaleInPlace(altLow /* + Math.sin((iGlobal + 1) * 10000 + jGlobal * 5000 + hGlobal * 20000) * 0.15*/);
                        PCMB.tmpVertices[2].scaleInPlace(altLow /* + Math.sin((iGlobal + 1) * 10000 + (jGlobal + 1) * 5000 + hGlobal * 20000) * 0.15*/);
                        PCMB.tmpVertices[3].scaleInPlace(altLow /* + Math.sin(iGlobal * 10000 + (jGlobal + 1) * 5000 + hGlobal * 20000) * 0.15*/);
                        /*
                        let center = BABYLON.Vector3.Zero();
                        for (let i = 0; i < 8; i++) {
                            center.addInPlace(PCMB.tmpVertices[i]);
                        }
                        center.scaleInPlace(1 / 8);

                        center.scaleInPlace(0.015);
                        for (let i = 0; i < 8; i++) {
                            PCMB.tmpVertices[i].scaleInPlace(0.985).addInPlace(center);
                        }
                        */
                        let l = positions.length / 3;
                        let partColors = [...partVertexData.colors];
                        let partUvs = [...partVertexData.uvs];
                        let partIndexes = [...partVertexData.indices];
                        let pIndex = l;
                        for (let n = 0; n < partVertexData.positions.length / 3; n++) {
                            let x = partVertexData.positions[3 * n];
                            let y = partVertexData.positions[3 * n + 1];
                            let z = partVertexData.positions[3 * n + 2];
                            let edgeCase = Math.abs(x - 0.5) <= 0.01 || Math.abs(y - 0.5) <= 0.01 || Math.abs(z - 0.5) <= 0.01;
                            if (edgeCase) {
                                let unstretchedPosition = { x: x + i, y: y + k, z: z + j, index: pIndex };
                                let existingIndex = -1;
                                let edge = 0;
                                if (Math.abs(x - 0.5) <= 0.01) {
                                    edge = 1;
                                    let existing = unstretchedPositionsX.find(uP => {
                                        return Math.abs(uP.x - unstretchedPosition.x) < 0.01 &&
                                            Math.abs(uP.y - unstretchedPosition.y) < 0.01 &&
                                            Math.abs(uP.z - unstretchedPosition.z) < 0.01;
                                    });
                                    if (existing) {
                                        existingIndex = existing.index;
                                    }
                                }
                                else if (Math.abs(y - 0.5) <= 0.01) {
                                    edge = 2;
                                    let existing = unstretchedPositionsY.find(uP => {
                                        return Math.abs(uP.x - unstretchedPosition.x) < 0.01 &&
                                            Math.abs(uP.y - unstretchedPosition.y) < 0.01 &&
                                            Math.abs(uP.z - unstretchedPosition.z) < 0.01;
                                    });
                                    if (existing) {
                                        existingIndex = existing.index;
                                    }
                                }
                                else if (Math.abs(z - 0.5) <= 0.01) {
                                    edge = 3;
                                    let existing = unstretchedPositionsZ.find(uP => {
                                        return Math.abs(uP.x - unstretchedPosition.x) < 0.01 &&
                                            Math.abs(uP.y - unstretchedPosition.y) < 0.01 &&
                                            Math.abs(uP.z - unstretchedPosition.z) < 0.01;
                                    });
                                    if (existing) {
                                        existingIndex = existing.index;
                                    }
                                }
                                if (existingIndex === -1) {
                                    v01.copyFrom(v1).subtractInPlace(v0).scaleInPlace(x).addInPlace(v0);
                                    v32.copyFrom(v2).subtractInPlace(v3).scaleInPlace(x).addInPlace(v3);
                                    v45.copyFrom(v5).subtractInPlace(v4).scaleInPlace(x).addInPlace(v4);
                                    v76.copyFrom(v6).subtractInPlace(v7).scaleInPlace(x).addInPlace(v7);
                                    v0132.copyFrom(v32).subtractInPlace(v01).scaleInPlace(z).addInPlace(v01);
                                    v4576.copyFrom(v76).subtractInPlace(v45).scaleInPlace(z).addInPlace(v45);
                                    vertex.copyFrom(v4576).subtractInPlace(v0132).scaleInPlace(y).addInPlace(v0132);
                                    positions.push(vertex.x);
                                    positions.push(vertex.y);
                                    positions.push(vertex.z);
                                    colors.push(partColors[4 * n + 0]);
                                    colors.push(partColors[4 * n + 1]);
                                    colors.push(partColors[4 * n + 2]);
                                    colors.push(partColors[4 * n + 3]);
                                    uvs.push(u + x * uL);
                                    uvs.push(v + z * vL);
                                    uvs2.push(w + y * wL);
                                    uvs2.push(1);
                                    if (edge === 1) {
                                        unstretchedPositionsX.push(unstretchedPosition);
                                    }
                                    else if (edge === 2) {
                                        unstretchedPositionsY.push(unstretchedPosition);
                                    }
                                    else if (edge === 3) {
                                        unstretchedPositionsZ.push(unstretchedPosition);
                                    }
                                    for (let a = 0; a < partVertexData.indices.length; a++) {
                                        if (partVertexData.indices[a] === n) {
                                            partIndexes[a] = pIndex;
                                        }
                                    }
                                    pIndex++;
                                }
                                else {
                                    for (let a = 0; a < partVertexData.indices.length; a++) {
                                        if (partVertexData.indices[a] === n) {
                                            partIndexes[a] = existingIndex;
                                        }
                                    }
                                }
                            }
                            else {
                                v01.copyFrom(v1).subtractInPlace(v0).scaleInPlace(x).addInPlace(v0);
                                v32.copyFrom(v2).subtractInPlace(v3).scaleInPlace(x).addInPlace(v3);
                                v45.copyFrom(v5).subtractInPlace(v4).scaleInPlace(x).addInPlace(v4);
                                v76.copyFrom(v6).subtractInPlace(v7).scaleInPlace(x).addInPlace(v7);
                                v0132.copyFrom(v32).subtractInPlace(v01).scaleInPlace(z).addInPlace(v01);
                                v4576.copyFrom(v76).subtractInPlace(v45).scaleInPlace(z).addInPlace(v45);
                                vertex.copyFrom(v4576).subtractInPlace(v0132).scaleInPlace(y).addInPlace(v0132);
                                positions.push(vertex.x);
                                positions.push(vertex.y);
                                positions.push(vertex.z);
                                colors.push(partColors[4 * n + 0]);
                                colors.push(partColors[4 * n + 1]);
                                colors.push(partColors[4 * n + 2]);
                                colors.push(partColors[4 * n + 3]);
                                uvs.push(u + x * uL);
                                uvs.push(v + z * vL);
                                uvs2.push(w + y * wL);
                                uvs2.push(1);
                                for (let a = 0; a < partVertexData.indices.length; a++) {
                                    if (partVertexData.indices[a] === n) {
                                        partIndexes[a] = pIndex;
                                    }
                                }
                                pIndex++;
                            }
                        }
                        indices.push(...partIndexes);
                        trianglesData.push(...extendedpartVertexData.trianglesData.map(tData => { return dAsArray[tData]; }));
                    }
                }
            }
        }
        if (positions.length / 3 != colors.length / 4) {
            debugger;
        }
        if (positions.length / 3 != uvs.length / 2) {
            debugger;
        }
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        // Split by data
        let splitPositions = [];
        let splitIndices = [];
        let splitNormals = [];
        let splitUvs = [];
        let splitUvs2 = [];
        let splitColors = [];
        while (trianglesData.length > 0) {
            let data = trianglesData[0];
            let pToSplitP = new Map();
            let tdi = 0;
            while (tdi < trianglesData.length) {
                if (trianglesData[tdi] === data) {
                    trianglesData.splice(tdi, 1);
                    for (let i = 0; i < 3; i++) {
                        let index = indices.splice(3 * tdi, 1)[0];
                        let splitIndex = pToSplitP.get(index);
                        if (splitIndex === undefined) {
                            splitIndex = splitPositions.length / 3;
                            splitPositions.push(positions[3 * index]);
                            splitPositions.push(positions[3 * index + 1]);
                            splitPositions.push(positions[3 * index + 2]);
                            splitNormals.push(normals[3 * index]);
                            splitNormals.push(normals[3 * index + 1]);
                            splitNormals.push(normals[3 * index + 2]);
                            splitColors.push(chunckDir.x, chunckDir.y, chunckDir.z, data / 128);
                            splitUvs.push(uvs[2 * index], uvs[2 * index + 1]);
                            splitUvs2.push(uvs2[2 * index], uvs2[2 * index + 1]);
                            pToSplitP.set(index, splitIndex);
                        }
                        splitIndices.push(splitIndex);
                    }
                }
                else {
                    tdi++;
                }
            }
        }
        vertexData.positions = splitPositions;
        vertexData.indices = splitIndices;
        vertexData.uvs = splitUvs;
        vertexData.uvs2 = splitUvs2;
        vertexData.colors = splitColors;
        vertexData.normals = splitNormals;
        let waterVertexData;
        if (waterPositions.length > 0) {
            waterVertexData = new BABYLON.VertexData();
            waterVertexData.positions = waterPositions;
            waterVertexData.indices = waterIndices;
            waterVertexData.uvs = waterUvs;
            BABYLON.VertexData.ComputeNormals(waterPositions, waterIndices, waterNormals);
            waterVertexData.normals = waterNormals;
        }
        return [vertexData, waterVertexData];
    }
    static BuildShellLevelVertexData(chunck) {
        let vertexData = new BABYLON.VertexData();
        let positions = [];
        let indices = [];
        let normals = [];
        let uvs = [];
        let levelCoef = 1;
        if (chunck instanceof PlanetChunckGroup) {
            levelCoef = Math.pow(2, chunck.level);
        }
        let vertexCount = Config.performanceConfiguration.shellMeshVertexCount;
        let f = Math.pow(2, chunck.planet.degree - chunck.degree);
        for (let i = -1; i <= vertexCount + 1; i++) {
            for (let j = -1; j <= vertexCount + 1; j++) {
                let l = positions.length / 3;
                let i0 = PlanetTools.CHUNCKSIZE * (chunck.iPos + i / vertexCount) * levelCoef;
                let j0 = PlanetTools.CHUNCKSIZE * (chunck.jPos + j / vertexCount) * levelCoef;
                let p00 = PlanetTools.EvaluateVertex(chunck.size, i0, j0);
                let altOffset = 0;
                if (i < 0) {
                    i0 = PlanetTools.CHUNCKSIZE * chunck.iPos * levelCoef;
                    altOffset = -0.2 * levelCoef;
                }
                if (j < 0) {
                    j0 = PlanetTools.CHUNCKSIZE * chunck.jPos * levelCoef;
                    altOffset = -0.2 * levelCoef;
                }
                if (i > vertexCount) {
                    i0 = PlanetTools.CHUNCKSIZE * (chunck.iPos + 1) * levelCoef;
                    altOffset = -0.2 * levelCoef;
                }
                if (j > vertexCount) {
                    j0 = PlanetTools.CHUNCKSIZE * (chunck.jPos + 1) * levelCoef;
                    altOffset = -0.2 * levelCoef;
                }
                let h00 = Math.floor(chunck.planet.generator.altitudeMap.getForSide(chunck.side, Math.floor(i0 * f), Math.floor(j0 * f)) * chunck.kPosMax * PlanetTools.CHUNCKSIZE);
                p00.scaleInPlace(PlanetTools.KGlobalToAltitude(h00) + altOffset);
                positions.push(p00.x, p00.y, p00.z);
                uvs.push(i0 / chunck.size);
                uvs.push(j0 / chunck.size);
                if (i < vertexCount + 1 && j < vertexCount + 1) {
                    indices.push(l, l + 1 + (vertexCount + 3), l + 1);
                    indices.push(l, l + (vertexCount + 3), l + 1 + (vertexCount + 3));
                }
            }
        }
        //MeshTools.PushQuad([p00, p01, p11, p10], 3, 2, 1, 0, positions, indices);
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.normals = normals;
        vertexData.uvs = uvs;
        return vertexData;
    }
    static BuildWaterVertexData(size, iPos, jPos, kPos, rWater) {
        let vertexData = new BABYLON.VertexData();
        let vertices = [];
        let positions = [];
        let indices = [];
        let uvs = [];
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                let y = i + iPos * PlanetTools.CHUNCKSIZE;
                let z = j + jPos * PlanetTools.CHUNCKSIZE;
                // following vertices should be lazy-computed
                vertices[0] = PCMB.GetVertex(size, y, z);
                vertices[1] = PCMB.GetVertex(size, y, z + 1);
                vertices[2] = PCMB.GetVertex(size, y + 1, z);
                vertices[3] = PCMB.GetVertex(size, y + 1, z + 1);
                vertices[1].scaleInPlace(rWater);
                vertices[2].scaleInPlace(rWater);
                vertices[3].scaleInPlace(rWater);
                vertices[0].scaleInPlace(rWater);
                MeshTools.PushQuad(vertices, 0, 1, 3, 2, positions, indices);
                MeshTools.PushWaterUvs(uvs);
                MeshTools.PushQuad(vertices, 0, 2, 3, 1, positions, indices);
                MeshTools.PushWaterUvs(uvs);
            }
        }
        let normals = [];
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.normals = normals;
        vertexData.uvs = uvs;
        return vertexData;
    }
    static BuildBedrockVertexData(size, iPos, jPos, kPos, r, data) {
        let vertexData = new BABYLON.VertexData();
        let vertices = [];
        let positions = [];
        let indices = [];
        let uvs = [];
        if (kPos === 0) {
            for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
                for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                    let y = i + iPos * PlanetTools.CHUNCKSIZE;
                    let z = j + jPos * PlanetTools.CHUNCKSIZE;
                    // following vertices should be lazy-computed
                    vertices[0] = PCMB.GetVertex(size, y, z);
                    vertices[1] = PCMB.GetVertex(size, y, z + 1);
                    vertices[2] = PCMB.GetVertex(size, y + 1, z);
                    vertices[3] = PCMB.GetVertex(size, y + 1, z + 1);
                    vertices[1].scaleInPlace(r);
                    vertices[2].scaleInPlace(r);
                    vertices[3].scaleInPlace(r);
                    vertices[0].scaleInPlace(r);
                    MeshTools.PushQuad(vertices, 0, 1, 3, 2, positions, indices);
                    MeshTools.PushWaterUvs(uvs);
                }
            }
        }
        let normals = [];
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.normals = normals;
        vertexData.uvs = uvs;
        return vertexData;
    }
    static BuildVertexData_Cubic(size, iPos, jPos, kPos, data) {
        let vertexData = new BABYLON.VertexData();
        if (!PCMB.tmpVertices) {
            PCMB.tmpVertices = [];
            for (let i = 0; i < 8; i++) {
                PCMB.tmpVertices[i] = BABYLON.Vector3.Zero();
            }
        }
        else {
            for (let i = 0; i < 8; i++) {
                PCMB.tmpVertices[i].copyFromFloats(0, 0, 0);
            }
        }
        let positions = [];
        let indices = [];
        let uvs = [];
        let colors = [];
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    if (data[i][j][k] !== 0) {
                        let y = i + iPos * PlanetTools.CHUNCKSIZE;
                        let z = j + jPos * PlanetTools.CHUNCKSIZE;
                        PCMB.GetVertexToRef(size, y, z, PCMB.tmpVertices[0]);
                        PCMB.GetVertexToRef(size, y, z + 1, PCMB.tmpVertices[1]);
                        PCMB.GetVertexToRef(size, y + 1, z, PCMB.tmpVertices[2]);
                        PCMB.GetVertexToRef(size, y + 1, z + 1, PCMB.tmpVertices[3]);
                        let hGlobal = (k + kPos * PlanetTools.CHUNCKSIZE);
                        let hLow = PlanetTools.KGlobalToAltitude(hGlobal);
                        let hHigh = PlanetTools.KGlobalToAltitude(hGlobal + 1);
                        PCMB.tmpVertices[0].scaleToRef(hHigh, PCMB.tmpVertices[4]);
                        PCMB.tmpVertices[1].scaleToRef(hHigh, PCMB.tmpVertices[5]);
                        PCMB.tmpVertices[2].scaleToRef(hHigh, PCMB.tmpVertices[6]);
                        PCMB.tmpVertices[3].scaleToRef(hHigh, PCMB.tmpVertices[7]);
                        PCMB.tmpVertices[0].scaleInPlace(hLow);
                        PCMB.tmpVertices[1].scaleInPlace(hLow);
                        PCMB.tmpVertices[2].scaleInPlace(hLow);
                        PCMB.tmpVertices[3].scaleInPlace(hLow);
                        let c = PCMB.BlockColor.get(data[i][j][k]);
                        if (!c) {
                            c = PCMB.BlockColor.get(136);
                        }
                        if (i - 1 < 0 || data[i - 1][j][k] === 0) {
                            MeshTools.PushQuad(PCMB.tmpVertices, 1, 5, 4, 0, positions, indices);
                            MeshTools.PushSideQuadUvs(data[i][j][k], uvs);
                            MeshTools.PushQuadColor(c.r, c.g, c.b, 1, colors);
                        }
                        if (j - 1 < 0 || data[i][j - 1][k] === 0) {
                            MeshTools.PushQuad(PCMB.tmpVertices, 0, 4, 6, 2, positions, indices);
                            MeshTools.PushSideQuadUvs(data[i][j][k], uvs);
                            MeshTools.PushQuadColor(c.r, c.g, c.b, 1, colors);
                        }
                        if (k - 1 < 0 || data[i][j][k - 1] === 0) {
                            MeshTools.PushQuad(PCMB.tmpVertices, 0, 2, 3, 1, positions, indices);
                            MeshTools.PushTopQuadUvs(data[i][j][k], uvs);
                            MeshTools.PushQuadColor(c.r, c.g, c.b, 1, colors);
                        }
                        if (i + 1 >= PlanetTools.CHUNCKSIZE || data[i + 1][j][k] === 0) {
                            MeshTools.PushQuad(PCMB.tmpVertices, 2, 6, 7, 3, positions, indices);
                            MeshTools.PushSideQuadUvs(data[i][j][k], uvs);
                            MeshTools.PushQuadColor(c.r, c.g, c.b, 1, colors);
                        }
                        if (j + 1 >= PlanetTools.CHUNCKSIZE || data[i][j + 1][k] === 0) {
                            MeshTools.PushQuad(PCMB.tmpVertices, 3, 7, 5, 1, positions, indices);
                            MeshTools.PushSideQuadUvs(data[i][j][k], uvs);
                            MeshTools.PushQuadColor(c.r, c.g, c.b, 1, colors);
                        }
                        if (k + 1 >= PlanetTools.CHUNCKSIZE || data[i][j][k + 1] === 0) {
                            MeshTools.PushQuad(PCMB.tmpVertices, 4, 5, 7, 6, positions, indices);
                            MeshTools.PushTopQuadUvs(data[i][j][k], uvs);
                            MeshTools.PushQuadColor(c.r, c.g, c.b, 1, colors);
                        }
                    }
                }
            }
        }
        let normals = [];
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.uvs = uvs;
        vertexData.colors = colors;
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        vertexData.normals = normals;
        return vertexData;
    }
}
PlanetChunckMeshBuilder.unstretchedPositionNull = { x: NaN, y: NaN, z: NaN, index: -1 };
PlanetChunckMeshBuilder.Corners = [
    new BABYLON.Vector3(0, 0, 0),
    new BABYLON.Vector3(1, 0, 0),
    new BABYLON.Vector3(1, 0, 1),
    new BABYLON.Vector3(0, 0, 1),
    new BABYLON.Vector3(0, 1, 0),
    new BABYLON.Vector3(1, 1, 0),
    new BABYLON.Vector3(1, 1, 1),
    new BABYLON.Vector3(0, 1, 1),
];
PlanetChunckMeshBuilder._tmpBlockCenter = BABYLON.Vector3.Zero();
var PCMB = PlanetChunckMeshBuilder;
class PlanetChunckNice extends PlanetChunck {
    findAdjacents() {
        this._adjacents = [];
        this.adjacentsAsArray = [];
        for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
                for (let dk = -1; dk <= 1; dk++) {
                    if (di != 0 || dj != 0 || dk != 0) {
                        if (!this._adjacents[1 + di]) {
                            this._adjacents[1 + di] = [];
                        }
                        if (!this._adjacents[1 + di][1 + dj]) {
                            this._adjacents[1 + di][1 + dj] = [];
                        }
                        if (!this._adjacents[1 + di][1 + dj][1 + dk]) {
                            let n = this.planetSide.getChunck(this.iPos + di, this.jPos + dj, this.kPos + dk, this.degree);
                            if (n instanceof PlanetChunck) {
                                this._adjacents[1 + di][1 + dj][1 + dk] = [n];
                                this.adjacentsAsArray.push(n);
                            }
                        }
                    }
                }
            }
        }
    }
    syncWithAdjacents() {
        let hasUpdated = false;
        if (!this.dataInitialized) {
            return hasUpdated;
        }
        this._adjacentsDataSynced = true;
        this.findAdjacents();
        let right = this._adjacents[2][1][1][0];
        for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
            for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                this.data[PlanetTools.CHUNCKSIZE][j][k] = right.GetDataNice(0, j, k);
            }
        }
        let front = this._adjacents[1][2][1][0];
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                this.data[i][PlanetTools.CHUNCKSIZE][k] = front.GetDataNice(i, 0, k);
            }
        }
        let above = this._adjacents[1][1][2][0];
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                this.data[i][j][PlanetTools.CHUNCKSIZE] = above.GetDataNice(i, j, 0);
            }
        }
        for (let n = 0; n < PlanetTools.CHUNCKSIZE; n++) {
            this.data[n][PlanetTools.CHUNCKSIZE][PlanetTools.CHUNCKSIZE] = this._adjacents[1][2][2][0].GetDataNice(n, 0, 0);
            this.data[PlanetTools.CHUNCKSIZE][n][PlanetTools.CHUNCKSIZE] = this._adjacents[2][1][2][0].GetDataNice(0, n, 0);
            this.data[PlanetTools.CHUNCKSIZE][PlanetTools.CHUNCKSIZE][n] = this._adjacents[2][2][1][0].GetDataNice(0, 0, n);
        }
        this.data[PlanetTools.CHUNCKSIZE][PlanetTools.CHUNCKSIZE][PlanetTools.CHUNCKSIZE] = this._adjacents[2][2][2][0].GetDataNice(0, 0, 0);
        this.updateIsEmptyIsFull();
        this.register();
        return hasUpdated;
    }
}
class PlanetChunckSemiNice extends PlanetChunck {
    syncWithAdjacents() {
        let hasUpdated = false;
        if (!this.dataInitialized) {
            return hasUpdated;
        }
        this._adjacentsDataSynced = true;
        this.findAdjacents();
        let right = this._adjacents[2][1][1][0];
        for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
            for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                this.data[PlanetTools.CHUNCKSIZE][j][k] = right.GetDataNice(0, j, k);
            }
        }
        let front = this._adjacents[1][2][1][0];
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                this.data[i][PlanetTools.CHUNCKSIZE][k] = front.GetDataNice(i, 0, k);
            }
        }
        for (let n = 0; n < PlanetTools.CHUNCKSIZE; n++) {
            this.data[PlanetTools.CHUNCKSIZE][PlanetTools.CHUNCKSIZE][n] = this._adjacents[2][2][1][0].GetDataNice(0, 0, n);
        }
        this.updateIsEmptyIsFull();
        this.register();
        return hasUpdated;
    }
}
class PlanetChunckVertexData {
    static NameToRef(name) {
        let v = 0b0;
        for (let i = 0; i < name.length; i++) {
            if (name[i] === "1") {
                v |= (0b1 << i);
            }
        }
        return v;
    }
    static RotateXChunckPartRef(ref) {
        return PlanetChunckVertexData.ReOrder(ref, 3, 2, 6, 7, 0, 1, 5, 4);
    }
    static RotateYChunckPartRef(ref) {
        return PlanetChunckVertexData.ReOrder(ref, 1, 2, 3, 0, 5, 6, 7, 4);
    }
    static RotateZChunckPartRef(ref) {
        return PlanetChunckVertexData.ReOrder(ref, 4, 0, 3, 7, 5, 1, 2, 6);
    }
    static FlipChunckPartRef(ref) {
        return ref ^ 0b11111111;
    }
    static AddChunckPartRef(ref1, ref2) {
        return ref1 | ref2;
    }
    static MirrorXChunckPartRef(ref) {
        return PlanetChunckVertexData.ReOrder(ref, 1, 0, 3, 2, 5, 4, 7, 6);
    }
    static MirrorYChunckPartRef(ref) {
        return PlanetChunckVertexData.ReOrder(ref, 4, 5, 6, 7, 0, 1, 2, 3);
    }
    static MirrorZChunckPartRef(ref) {
        return PlanetChunckVertexData.ReOrder(ref, 3, 2, 1, 0, 7, 6, 5, 4);
    }
    static _TryAddFlippedChunckPart(lod, ref, data) {
        let flippedRef = PlanetChunckVertexData.FlipChunckPartRef(ref);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(flippedRef)) {
            let flippedData = PlanetChunckVertexData.Flip(data);
            PlanetChunckVertexData._VertexDatas[lod].set(flippedRef, new ExtendedVertexData(flippedRef, flippedData));
            PlanetChunckVertexData._TryAddVariations(lod, flippedRef, flippedData, false);
            return true;
        }
        return false;
    }
    static _TryAddMirrorXChunckPart(lod, ref, data) {
        let mirrorXRef = PlanetChunckVertexData.MirrorXChunckPartRef(ref);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(mirrorXRef)) {
            let mirrorXData = PlanetChunckVertexData.MirrorX(data);
            PlanetChunckVertexData._VertexDatas[lod].set(mirrorXRef, new ExtendedVertexData(mirrorXRef, mirrorXData));
            PlanetChunckVertexData._TryAddMirrorYChunckPart(lod, mirrorXRef, mirrorXData);
            PlanetChunckVertexData._TryAddMirrorZChunckPart(lod, mirrorXRef, mirrorXData);
            return true;
        }
        return false;
    }
    static _TryAddMirrorYChunckPart(lod, ref, data) {
        let mirrorYRef = PlanetChunckVertexData.MirrorYChunckPartRef(ref);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(mirrorYRef)) {
            let mirrorYData = PlanetChunckVertexData.MirrorY(data);
            PlanetChunckVertexData._VertexDatas[lod].set(mirrorYRef, new ExtendedVertexData(mirrorYRef, mirrorYData));
            PlanetChunckVertexData._TryAddMirrorZChunckPart(lod, mirrorYRef, mirrorYData);
            return true;
        }
        return false;
    }
    static _TryAddMirrorZChunckPart(lod, ref, data) {
        let mirrorZRef = PlanetChunckVertexData.MirrorZChunckPartRef(ref);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(mirrorZRef)) {
            let mirrorZData = PlanetChunckVertexData.MirrorZ(data);
            PlanetChunckVertexData._VertexDatas[lod].set(mirrorZRef, new ExtendedVertexData(mirrorZRef, mirrorZData));
            return true;
        }
        return false;
    }
    static SplitVertexDataTriangles(data) {
        let splitData = new BABYLON.VertexData();
        let positions = [];
        let indices = [];
        let normals = [];
        let uvs = [];
        let colors = [];
        let useUvs = data.uvs && data.uvs.length > 0;
        let useColors = data.colors && data.colors.length > 0;
        for (let i = 0; i < data.indices.length / 3; i++) {
            let l = positions.length / 3;
            let i0 = data.indices[3 * i];
            let i1 = data.indices[3 * i + 1];
            let i2 = data.indices[3 * i + 2];
            let x0 = data.positions[3 * i0];
            let y0 = data.positions[3 * i0 + 1];
            let z0 = data.positions[3 * i0 + 2];
            let x1 = data.positions[3 * i1];
            let y1 = data.positions[3 * i1 + 1];
            let z1 = data.positions[3 * i1 + 2];
            let x2 = data.positions[3 * i2];
            let y2 = data.positions[3 * i2 + 1];
            let z2 = data.positions[3 * i2 + 2];
            /*
            let x = x0 + x1 + x2;
            x = x / 3;
            x0 = 0.98 * x0 + 0.02 * x;
            x1 = 0.98 * x1 + 0.02 * x;
            x2 = 0.98 * x2 + 0.02 * x;
            
            let y = y0 + y1 + y2;
            y = y / 3;
            y0 = 0.98 * y0 + 0.02 * y;
            y1 = 0.98 * y1 + 0.02 * y;
            y2 = 0.98 * y2 + 0.02 * y;
            
            let z = z0 + z1 + z2;
            z = z / 3;
            z0 = 0.98 * z0 + 0.02 * z;
            z1 = 0.98 * z1 + 0.02 * z;
            z2 = 0.98 * z2 + 0.02 * z;
            */
            positions.push(x0, y0, z0);
            positions.push(x1, y1, z1);
            positions.push(x2, y2, z2);
            let nx0 = data.normals[3 * i0];
            let ny0 = data.normals[3 * i0 + 1];
            let nz0 = data.normals[3 * i0 + 2];
            let nx1 = data.normals[3 * i1];
            let ny1 = data.normals[3 * i1 + 1];
            let nz1 = data.normals[3 * i1 + 2];
            let nx2 = data.normals[3 * i2];
            let ny2 = data.normals[3 * i2 + 1];
            let nz2 = data.normals[3 * i2 + 2];
            normals.push(nx0, ny0, nz0);
            normals.push(nx1, ny1, nz1);
            normals.push(nx2, ny2, nz2);
            let u0;
            let v0;
            let u1;
            let v1;
            let u2;
            let v2;
            if (useUvs) {
                u0 = data.positions[2 * i0];
                v0 = data.positions[2 * i0 + 1];
                u1 = data.positions[2 * i1];
                v1 = data.positions[2 * i1 + 1];
                u2 = data.positions[2 * i2];
                v2 = data.positions[2 * i2 + 1];
                uvs.push(u0, v0);
                uvs.push(u1, v1);
                uvs.push(u2, v2);
            }
            let r0;
            let g0;
            let b0;
            let a0;
            let r1;
            let g1;
            let b1;
            let a1;
            let r2;
            let g2;
            let b2;
            let a2;
            if (useColors) {
                r0 = data.colors[4 * i0];
                g0 = data.colors[4 * i0 + 1];
                b0 = data.colors[4 * i0 + 2];
                a0 = data.colors[4 * i0 + 3];
                r1 = data.colors[4 * i0];
                g1 = data.colors[4 * i0 + 1];
                b1 = data.colors[4 * i0 + 2];
                a1 = data.colors[4 * i0 + 3];
                r2 = data.colors[4 * i0];
                g2 = data.colors[4 * i0 + 1];
                b2 = data.colors[4 * i0 + 2];
                a2 = data.colors[4 * i0 + 3];
                colors.push(r0, g0, b0, a0);
                colors.push(r1, g1, b1, a1);
                colors.push(r2, g2, b2, a2);
            }
            indices.push(l, l + 1, l + 2);
        }
        splitData.positions = positions;
        splitData.indices = indices;
        splitData.normals = normals;
        if (useUvs) {
            splitData.uvs = uvs;
        }
        if (useColors) {
            splitData.colors = colors;
        }
        return splitData;
    }
    static _TryAddVariations(lod, ref, data, useXZAxisRotation) {
        let useful = false;
        useful = PlanetChunckVertexData._TryAddMirrorXChunckPart(lod, ref, data) || useful;
        useful = PlanetChunckVertexData._TryAddMirrorYChunckPart(lod, ref, data) || useful;
        useful = PlanetChunckVertexData._TryAddMirrorZChunckPart(lod, ref, data) || useful;
        if (useXZAxisRotation) {
            let rotatedXRef = ref;
            let rotatedXData = data;
            for (let j = 0; j < 3; j++) {
                rotatedXRef = PlanetChunckVertexData.RotateXChunckPartRef(rotatedXRef);
                rotatedXData = PlanetChunckVertexData.RotateX(rotatedXData);
                if (!PlanetChunckVertexData._VertexDatas[lod].has(rotatedXRef)) {
                    PlanetChunckVertexData._VertexDatas[lod].set(rotatedXRef, new ExtendedVertexData(rotatedXRef, rotatedXData));
                    useful = true;
                }
                useful = PlanetChunckVertexData._TryAddMirrorXChunckPart(lod, rotatedXRef, rotatedXData) || useful;
                useful = PlanetChunckVertexData._TryAddMirrorYChunckPart(lod, rotatedXRef, rotatedXData) || useful;
                useful = PlanetChunckVertexData._TryAddMirrorZChunckPart(lod, rotatedXRef, rotatedXData) || useful;
            }
        }
        let rotatedYRef = ref;
        let rotatedYData = data;
        for (let j = 0; j < 3; j++) {
            rotatedYRef = PlanetChunckVertexData.RotateYChunckPartRef(rotatedYRef);
            rotatedYData = PlanetChunckVertexData.RotateY(rotatedYData);
            if (!PlanetChunckVertexData._VertexDatas[lod].has(rotatedYRef)) {
                PlanetChunckVertexData._VertexDatas[lod].set(rotatedYRef, new ExtendedVertexData(rotatedYRef, rotatedYData));
                useful = true;
            }
            useful = PlanetChunckVertexData._TryAddMirrorXChunckPart(lod, rotatedYRef, rotatedYData) || useful;
            useful = PlanetChunckVertexData._TryAddMirrorYChunckPart(lod, rotatedYRef, rotatedYData) || useful;
            useful = PlanetChunckVertexData._TryAddMirrorZChunckPart(lod, rotatedYRef, rotatedYData) || useful;
        }
        if (useXZAxisRotation) {
            let rotatedZRef = ref;
            let rotatedZData = data;
            for (let j = 0; j < 3; j++) {
                rotatedZRef = PlanetChunckVertexData.RotateZChunckPartRef(rotatedZRef);
                rotatedZData = PlanetChunckVertexData.RotateZ(rotatedZData);
                if (!PlanetChunckVertexData._VertexDatas[lod].has(rotatedZRef)) {
                    PlanetChunckVertexData._VertexDatas[lod].set(rotatedZRef, new ExtendedVertexData(rotatedZRef, rotatedZData));
                    useful = true;
                }
                useful = PlanetChunckVertexData._TryAddMirrorXChunckPart(lod, rotatedZRef, rotatedZData) || useful;
                useful = PlanetChunckVertexData._TryAddMirrorYChunckPart(lod, rotatedZRef, rotatedZData) || useful;
                useful = PlanetChunckVertexData._TryAddMirrorZChunckPart(lod, rotatedZRef, rotatedZData) || useful;
            }
        }
        return useful;
    }
    static _AddChunckPartMesh(mesh, lod, useXZAxisRotation) {
        let useful = false;
        let name = mesh.name;
        let ref = PlanetChunckVertexData.NameToRef(name);
        if (ref === 0) {
            return false;
        }
        let data = BABYLON.VertexData.ExtractFromMesh(mesh);
        let normals = [];
        for (let j = 0; j < data.positions.length / 3; j++) {
            let x = data.positions[3 * j];
            let y = data.positions[3 * j + 1];
            let z = data.positions[3 * j + 2];
            let nx = data.normals[3 * j];
            let ny = data.normals[3 * j + 1];
            let nz = data.normals[3 * j + 2];
            if (Math.abs(x) > 0.49 && Math.abs(y) > 0.49 || Math.abs(x) > 0.49 && Math.abs(z) > 0.49 || Math.abs(y) > 0.49 && Math.abs(z) > 0.49) {
                if (Math.abs(nx) > Math.abs(ny) && Math.abs(nx) > Math.abs(nz)) {
                    ny = 0;
                    nz = 0;
                }
                else if (Math.abs(ny) > Math.abs(nx) && Math.abs(ny) > Math.abs(nz)) {
                    nx = 0;
                    nz = 0;
                }
                else if (Math.abs(nz) > Math.abs(nx) && Math.abs(nz) > Math.abs(ny)) {
                    nx = 0;
                    ny = 0;
                }
            }
            if (Math.abs(x) > 0.49) {
                nx = 0;
            }
            if (Math.abs(y) > 0.49) {
                ny = 0;
            }
            if (Math.abs(z) > 0.49) {
                nz = 0;
            }
            if (Math.abs(x) > 0.49 || Math.abs(y) > 0.49 || Math.abs(z) > 0.49) {
                if (Math.abs(Math.abs(x) - 0.144) < 0.02 || Math.abs(Math.abs(y) - 0.144) < 0.02 || Math.abs(Math.abs(z) - 0.144) < 0.02) {
                    if (Math.abs(nx) > Math.abs(ny) && Math.abs(nx) > Math.abs(nz)) {
                        nx = Math.sign(nx) * 0.818;
                        if (Math.abs(ny) > Math.abs(nz)) {
                            ny = Math.sign(ny) * 0.582;
                            nz = 0;
                        }
                        else {
                            ny = 0;
                            nz = Math.sign(nz) * 0.582;
                        }
                    }
                    if (Math.abs(ny) > Math.abs(nx) && Math.abs(ny) > Math.abs(nz)) {
                        ny = Math.sign(ny) * 0.818;
                        if (Math.abs(nx) > Math.abs(nz)) {
                            nx = Math.sign(nx) * 0.582;
                            nz = 0;
                        }
                        else {
                            nx = 0;
                            nz = Math.sign(nz) * 0.582;
                        }
                    }
                    if (Math.abs(nz) > Math.abs(nx) && Math.abs(nz) > Math.abs(ny)) {
                        nz = Math.sign(nz) * 0.818;
                        if (Math.abs(nx) > Math.abs(ny)) {
                            nx = Math.sign(nx) * 0.582;
                            ny = 0;
                        }
                        else {
                            nx = 0;
                            ny = Math.sign(ny) * 0.582;
                        }
                    }
                }
            }
            let l = Math.sqrt(nx * nx + ny * ny + nz * nz);
            normals[3 * j] = nx / l;
            normals[3 * j + 1] = ny / l;
            normals[3 * j + 2] = nz / l;
        }
        data.normals = normals;
        data.positions = data.positions.map((p) => {
            p += 0.5;
            return p;
        });
        //data = PlanetChunckVertexData.SplitVertexDataTriangles(data);
        //data.positions = data.positions.map((n: number) => { return n * 0.98 + 0.01; });
        if (!data.colors || data.colors.length / 4 != data.positions.length / 3) {
            let colors = [];
            for (let j = 0; j < data.positions.length / 3; j++) {
                colors.push(1, 1, 1, 1);
            }
            data.colors = colors;
        }
        mesh.dispose();
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref, new ExtendedVertexData(ref, data));
            useful = true;
        }
        useful = PlanetChunckVertexData._TryAddVariations(lod, ref, data, useXZAxisRotation) || useful;
        if (!useful) {
            console.warn("Chunck-Part " + name + " is redundant.");
        }
        return useful;
    }
    static async _LoadChunckVertexDatasFromFile(lod, useXZAxisRotation) {
        let filename = Config.chunckPartConfiguration.dir + "/" + Config.chunckPartConfiguration.filename;
        return new Promise(resolve => {
            BABYLON.SceneLoader.ImportMesh("", filename + "-lod-" + lod.toFixed(0) + ".babylon", "", Game.Scene, (meshes) => {
                for (let i = 0; i < meshes.length; i++) {
                    let mesh = meshes[i];
                    if (mesh instanceof BABYLON.Mesh && mesh.name != "zero") {
                        PlanetChunckVertexData._AddChunckPartMesh(mesh, lod, useXZAxisRotation);
                    }
                }
                resolve();
            });
        });
    }
    static _LoadComposedChunckVertexDatas(lod, useXZAxisRotation) {
        let ref13 = 0b10000010;
        let baseData13A = PlanetChunckVertexData.Get(lod, 0b10000000);
        let baseData13B = PlanetChunckVertexData.Get(lod, 0b00000010);
        let data13 = PlanetChunckVertexData.Add(baseData13A.vertexData, baseData13B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref13)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref13, new ExtendedVertexData(ref13, data13));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref13, data13, useXZAxisRotation);
        let ref0 = 0b01111111;
        let baseData0 = PlanetChunckVertexData.Get(lod, 0b10000000);
        let data0 = PlanetChunckVertexData.Flip(baseData0.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref0)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref0, new ExtendedVertexData(ref0, data0));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref0, data0, useXZAxisRotation);
        let ref10 = 0b00111111;
        let baseData10 = PlanetChunckVertexData.Get(lod, 0b11000000);
        let data10 = PlanetChunckVertexData.Flip(baseData10.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref10)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref10, new ExtendedVertexData(ref10, data10));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref10, data10, useXZAxisRotation);
        let ref11 = 0b01110111;
        let baseData11 = PlanetChunckVertexData.Get(lod, 0b10001000);
        let data11 = PlanetChunckVertexData.Flip(baseData11.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref11)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref11, new ExtendedVertexData(ref11, data11));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref11, data11, useXZAxisRotation);
        let ref1 = 0b00011111;
        let baseData1 = PlanetChunckVertexData.Get(lod, 0b11100000);
        let data1 = PlanetChunckVertexData.Flip(baseData1.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref1)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref1, new ExtendedVertexData(ref1, data1));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref1, data1, useXZAxisRotation);
        let ref12 = 0b00110111;
        let baseData12 = PlanetChunckVertexData.Get(lod, 0b11001000);
        let data12 = PlanetChunckVertexData.Flip(baseData12.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref12)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref12, new ExtendedVertexData(ref12, data12));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref12, data12, useXZAxisRotation);
        let ref2 = 0b11110101;
        let baseData2A = PlanetChunckVertexData.Get(lod, 0b11110111);
        let baseData2B = PlanetChunckVertexData.Get(lod, 0b11111101);
        let data2 = PlanetChunckVertexData.Add(baseData2A.vertexData, baseData2B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref2)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref2, new ExtendedVertexData(ref2, data2));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref2, data2, useXZAxisRotation);
        let ref3 = 0b01011010;
        let baseData3A = PlanetChunckVertexData.Get(lod, 0b01011111);
        let baseData3B = PlanetChunckVertexData.Get(lod, 0b11111010);
        let data3 = PlanetChunckVertexData.Add(baseData3A.vertexData, baseData3B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref3)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref3, new ExtendedVertexData(ref3, data3));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref3, data3, useXZAxisRotation);
        let ref4 = 0b10100100;
        let baseData4A = PlanetChunckVertexData.Get(lod, 0b11100100);
        let baseData4B = PlanetChunckVertexData.Get(lod, 0b10111111);
        let data4 = PlanetChunckVertexData.Add(baseData4A.vertexData, baseData4B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref4)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref4, new ExtendedVertexData(ref4, data4));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref4, data4, useXZAxisRotation);
        let ref5 = 0b11000011;
        let baseData5A = PlanetChunckVertexData.Get(lod, 0b11001111);
        let baseData5B = PlanetChunckVertexData.Get(lod, 0b11110011);
        let data5 = PlanetChunckVertexData.Add(baseData5A.vertexData, baseData5B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref5)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref5, new ExtendedVertexData(ref5, data5));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref5, data5, useXZAxisRotation);
        let ref6 = 0b01110101;
        let baseData6A = PlanetChunckVertexData.Get(lod, 0b01110111);
        let baseData6B = PlanetChunckVertexData.Get(lod, 0b11111101);
        let data6 = PlanetChunckVertexData.Add(baseData6A.vertexData, baseData6B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref6)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref6, new ExtendedVertexData(ref6, data6));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref6, data6, useXZAxisRotation);
        let ref7 = 0b01111101;
        let baseData7A = PlanetChunckVertexData.Get(lod, 0b01111111);
        let baseData7B = PlanetChunckVertexData.Get(lod, 0b11111101);
        let data7 = PlanetChunckVertexData.Add(baseData7A.vertexData, baseData7B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref7)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref7, new ExtendedVertexData(ref7, data7));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref7, data7, useXZAxisRotation);
        let ref8 = 0b11100101;
        let baseData8A = PlanetChunckVertexData.Get(lod, 0b11101111);
        let baseData8B = PlanetChunckVertexData.Get(lod, 0b11110101);
        let data8 = PlanetChunckVertexData.Add(baseData8A.vertexData, baseData8B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref8)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref8, new ExtendedVertexData(ref8, data8));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref8, data8, useXZAxisRotation);
        let ref9 = 0b11100001;
        let baseData9A = PlanetChunckVertexData.Get(lod, 0b11101111);
        let baseData9B = PlanetChunckVertexData.Get(lod, 0b11110001);
        let data9 = PlanetChunckVertexData.Add(baseData9A.vertexData, baseData9B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref9)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref9, new ExtendedVertexData(ref9, data9));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref9, data9, useXZAxisRotation);
    }
    static _LoadComposedChunckVertexDatasNoXZAxisRotation(lod, useXZAxisRotation) {
        PlanetChunckVertexData._TryAddFlippedChunckPart(lod, 0b10000000, PlanetChunckVertexData.Get(lod, 0b10000000).vertexData);
        PlanetChunckVertexData._TryAddFlippedChunckPart(lod, 0b11000000, PlanetChunckVertexData.Get(lod, 0b11000000).vertexData);
        PlanetChunckVertexData._TryAddFlippedChunckPart(lod, 0b10001000, PlanetChunckVertexData.Get(lod, 0b10001000).vertexData);
        PlanetChunckVertexData._TryAddFlippedChunckPart(lod, 0b11111000, PlanetChunckVertexData.Get(lod, 0b11111000).vertexData);
        PlanetChunckVertexData._TryAddFlippedChunckPart(lod, 0b11001000, PlanetChunckVertexData.Get(lod, 0b11001000).vertexData);
        let ref1 = 0b11110101;
        let baseData1A = PlanetChunckVertexData.Get(lod, 0b11110111);
        let baseData1B = PlanetChunckVertexData.Get(lod, 0b11111101);
        let data1 = PlanetChunckVertexData.Add(baseData1A.vertexData, baseData1B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref1)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref1, new ExtendedVertexData(ref1, data1));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref1, data1, useXZAxisRotation);
        let ref2 = 0b10000010;
        let baseData2A = PlanetChunckVertexData.Get(lod, 0b10000000);
        let baseData2B = PlanetChunckVertexData.Get(lod, 0b00000010);
        let data2 = PlanetChunckVertexData.Add(baseData2A.vertexData, baseData2B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref2)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref2, new ExtendedVertexData(ref2, data2));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref2, data2, useXZAxisRotation);
        PlanetChunckVertexData._TryAddFlippedChunckPart(lod, 0b10000010, PlanetChunckVertexData.Get(lod, 0b10000010).vertexData);
        let ref21 = 0b00111100;
        let baseData21A = PlanetChunckVertexData.Get(lod, 0b00111111);
        let baseData21B = PlanetChunckVertexData.Get(lod, 0b11111100);
        let data21 = PlanetChunckVertexData.Add(baseData21A.vertexData, baseData21B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref21)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref21, new ExtendedVertexData(ref21, data21));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref2, data2, useXZAxisRotation);
        PlanetChunckVertexData._TryAddFlippedChunckPart(lod, 0b00111100, PlanetChunckVertexData.Get(lod, 0b00111100).vertexData);
        let ref3 = 0b01010101;
        let baseData3A = PlanetChunckVertexData.Get(lod, 0b01110111);
        let baseData3B = PlanetChunckVertexData.Get(lod, 0b11011101);
        let data3 = PlanetChunckVertexData.Add(baseData3A.vertexData, baseData3B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref3)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref3, new ExtendedVertexData(ref3, data3));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref3, data3, useXZAxisRotation);
        let ref4 = 0b11010101;
        let baseData4A = PlanetChunckVertexData.Get(lod, 0b11011101);
        let baseData4B = PlanetChunckVertexData.Get(lod, 0b11110111);
        let data4 = PlanetChunckVertexData.Add(baseData4A.vertexData, baseData4B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref4)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref4, new ExtendedVertexData(ref4, data4));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref4, data4, useXZAxisRotation);
        let ref5 = 0b10100001;
        let baseData5A = PlanetChunckVertexData.Get(lod, 0b10110001);
        let baseData5B = PlanetChunckVertexData.Get(lod, 0b11101111);
        let data5 = PlanetChunckVertexData.Add(baseData5A.vertexData, baseData5B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref5)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref5, new ExtendedVertexData(ref5, data5));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref5, data5, useXZAxisRotation);
        let ref6 = 0b11100001;
        let baseData6A = PlanetChunckVertexData.Get(lod, 0b11110001);
        let baseData6B = PlanetChunckVertexData.Get(lod, 0b11101111);
        let data6 = PlanetChunckVertexData.Add(baseData6A.vertexData, baseData6B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref6)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref6, new ExtendedVertexData(ref6, data6));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref6, data6, useXZAxisRotation);
        let ref7 = 0b11101001;
        let baseData7A = PlanetChunckVertexData.Get(lod, 0b11111001);
        let baseData7B = PlanetChunckVertexData.Get(lod, 0b11101111);
        let data7 = PlanetChunckVertexData.Add(baseData7A.vertexData, baseData7B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref7)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref7, new ExtendedVertexData(ref7, data7));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref7, data7, useXZAxisRotation);
        let ref8 = 0b01011100;
        let baseData8A = PlanetChunckVertexData.Get(lod, 0b11011100);
        let baseData8B = PlanetChunckVertexData.Get(lod, 0b01111111);
        let data8 = PlanetChunckVertexData.Add(baseData8A.vertexData, baseData8B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref8)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref8, new ExtendedVertexData(ref8, data8));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref8, data8, useXZAxisRotation);
        let ref9 = 0b11100101;
        let baseData9A = PlanetChunckVertexData.Get(lod, 0b11101111);
        let baseData9B = PlanetChunckVertexData.Get(lod, 0b11110101);
        let data9 = PlanetChunckVertexData.Add(baseData9A.vertexData, baseData9B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref9)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref9, new ExtendedVertexData(ref9, data9));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref9, data9, useXZAxisRotation);
        let ref10 = 0b10100101;
        let baseData10A = PlanetChunckVertexData.Get(lod, 0b10101111);
        let baseData10B = PlanetChunckVertexData.Get(lod, 0b11110101);
        let data10 = PlanetChunckVertexData.Add(baseData10A.vertexData, baseData10B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref10)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref10, new ExtendedVertexData(ref10, data10));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref10, data10, useXZAxisRotation);
        let ref11 = 0b10110111;
        let baseData11A = PlanetChunckVertexData.Get(lod, 0b10111111);
        let baseData11B = PlanetChunckVertexData.Get(lod, 0b11110111);
        let data11 = PlanetChunckVertexData.Add(baseData11A.vertexData, baseData11B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref11)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref11, new ExtendedVertexData(ref11, data11));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref11, data11, useXZAxisRotation);
    }
    static async InitializeData() {
        let timers;
        let logOutput;
        let useLog = DebugDefine.LOG_CHUNCK_VERTEXDATA_INIT_PERFORMANCE;
        if (useLog) {
            timers = [];
            timers.push(performance.now());
            logOutput = "initialize chunck vertex data " + this.name;
        }
        for (let lod = Config.chunckPartConfiguration.lodMin; lod <= Config.chunckPartConfiguration.lodMax; lod++) {
            await PlanetChunckVertexData._LoadChunckVertexDatasFromFile(lod, Config.chunckPartConfiguration.useXZAxisRotation);
            if (Config.chunckPartConfiguration.useXZAxisRotation) {
                PlanetChunckVertexData._LoadComposedChunckVertexDatas(lod, true);
            }
            else {
                PlanetChunckVertexData._LoadComposedChunckVertexDatasNoXZAxisRotation(lod, Config.chunckPartConfiguration.useXZAxisRotation);
            }
            if (useLog) {
                timers.push(performance.now());
                logOutput += "\n  lod " + lod + " loaded in " + (timers[timers.length - 1] - timers[timers.length - 2]).toFixed(0) + " ms";
            }
        }
        if (useLog) {
            timers.push(performance.now());
            logOutput += "\nchunck vertex data initialized in " + (timers[timers.length - 1] - timers[0]).toFixed(0) + " ms";
            console.log(logOutput);
        }
        return true;
    }
    static Clone(data) {
        let clonedData = new BABYLON.VertexData();
        clonedData.positions = [...data.positions];
        clonedData.indices = [...data.indices];
        clonedData.normals = [...data.normals];
        if (data.uvs) {
            clonedData.uvs = [...data.uvs];
        }
        if (data.colors) {
            clonedData.colors = [...data.colors];
        }
        return clonedData;
    }
    static Get(lod, ref) {
        return PlanetChunckVertexData._VertexDatas[lod].get(ref);
    }
    static RotateX(baseData) {
        let data = new BABYLON.VertexData();
        let positions = [...baseData.positions];
        let normals;
        if (baseData.normals && baseData.normals.length === baseData.positions.length) {
            normals = [...baseData.normals];
        }
        data.indices = [...baseData.indices];
        for (let i = 0; i < positions.length / 3; i++) {
            let y = positions[3 * i + 1] - 0.5;
            let z = positions[3 * i + 2] - 0.5;
            positions[3 * i + 1] = -z + 0.5;
            positions[3 * i + 2] = y + 0.5;
            if (normals) {
                let yn = normals[3 * i + 1];
                let zn = normals[3 * i + 2];
                normals[3 * i + 1] = -zn;
                normals[3 * i + 2] = yn;
            }
        }
        data.positions = positions;
        if (normals) {
            data.normals = normals;
        }
        if (baseData.colors) {
            data.colors = [...baseData.colors];
        }
        return data;
    }
    static RotateY(baseData) {
        let data = new BABYLON.VertexData();
        let positions = [...baseData.positions];
        let normals;
        if (baseData.normals && baseData.normals.length === baseData.positions.length) {
            normals = [...baseData.normals];
        }
        data.indices = [...baseData.indices];
        for (let i = 0; i < positions.length / 3; i++) {
            let x = positions[3 * i] - 0.5;
            let z = positions[3 * i + 2] - 0.5;
            positions[3 * i] = z + 0.5;
            positions[3 * i + 2] = -x + 0.5;
            if (normals) {
                let xn = normals[3 * i];
                let zn = normals[3 * i + 2];
                normals[3 * i] = zn;
                normals[3 * i + 2] = -xn;
            }
        }
        data.positions = positions;
        if (normals) {
            data.normals = normals;
        }
        if (baseData.colors) {
            data.colors = [...baseData.colors];
        }
        return data;
    }
    static RotateZ(baseData) {
        let data = new BABYLON.VertexData();
        let positions = [...baseData.positions];
        let normals;
        if (baseData.normals && baseData.normals.length === baseData.positions.length) {
            normals = [...baseData.normals];
        }
        data.indices = [...baseData.indices];
        for (let i = 0; i < positions.length / 3; i++) {
            let x = positions[3 * i] - 0.5;
            let y = positions[3 * i + 1] - 0.5;
            positions[3 * i] = -y + 0.5;
            positions[3 * i + 1] = x + 0.5;
            if (normals) {
                let xn = normals[3 * i];
                let yn = normals[3 * i + 1];
                normals[3 * i] = -yn;
                normals[3 * i + 1] = xn;
            }
        }
        data.positions = positions;
        if (normals) {
            data.normals = normals;
        }
        if (baseData.colors) {
            data.colors = [...baseData.colors];
        }
        return data;
    }
    static Flip(baseData) {
        let data = new BABYLON.VertexData();
        data.positions = [...baseData.positions];
        if (baseData.normals && baseData.normals.length === baseData.positions.length) {
            let normals = [];
            for (let i = 0; i < baseData.normals.length / 3; i++) {
                normals.push(-baseData.normals[3 * i], -baseData.normals[3 * i + 1], -baseData.normals[3 * i + 2]);
            }
            data.normals = normals;
        }
        let indices = [];
        for (let i = 0; i < baseData.indices.length / 3; i++) {
            indices.push(baseData.indices[3 * i], baseData.indices[3 * i + 2], baseData.indices[3 * i + 1]);
        }
        data.indices = indices;
        if (baseData.colors) {
            data.colors = [...baseData.colors];
        }
        return data;
    }
    static Add(baseData1, baseData2) {
        let l = baseData1.positions.length / 3;
        let data = new BABYLON.VertexData();
        data.positions = [...baseData1.positions, ...baseData2.positions];
        data.normals = [...baseData1.normals, ...baseData2.normals];
        data.indices = [...baseData1.indices, ...baseData2.indices.map((i) => { return i + l; })];
        if (baseData1.colors && baseData2.colors) {
            data.colors = [...baseData1.colors, ...baseData2.colors];
        }
        return data;
    }
    static MirrorX(baseData) {
        let data = new BABYLON.VertexData();
        let positions = [];
        for (let i = 0; i < baseData.positions.length / 3; i++) {
            positions.push(1 - baseData.positions[3 * i], baseData.positions[3 * i + 1], baseData.positions[3 * i + 2]);
        }
        data.positions = positions;
        if (baseData.normals && baseData.normals.length === baseData.positions.length) {
            let normals = [];
            for (let i = 0; i < baseData.normals.length / 3; i++) {
                normals.push(-baseData.normals[3 * i], baseData.normals[3 * i + 1], baseData.normals[3 * i + 2]);
            }
            data.normals = normals;
        }
        let indices = [];
        for (let i = 0; i < baseData.indices.length / 3; i++) {
            indices.push(baseData.indices[3 * i], baseData.indices[3 * i + 2], baseData.indices[3 * i + 1]);
        }
        data.indices = indices;
        if (baseData.colors) {
            data.colors = [...baseData.colors];
        }
        return data;
    }
    static MirrorY(baseData) {
        let data = new BABYLON.VertexData();
        let positions = [];
        for (let i = 0; i < baseData.positions.length / 3; i++) {
            positions.push(baseData.positions[3 * i], 1 - baseData.positions[3 * i + 1], baseData.positions[3 * i + 2]);
        }
        data.positions = positions;
        if (baseData.normals && baseData.normals.length === baseData.positions.length) {
            let normals = [];
            for (let i = 0; i < baseData.normals.length / 3; i++) {
                normals.push(baseData.normals[3 * i], -baseData.normals[3 * i + 1], baseData.normals[3 * i + 2]);
            }
            data.normals = normals;
        }
        let indices = [];
        for (let i = 0; i < baseData.indices.length / 3; i++) {
            indices.push(baseData.indices[3 * i], baseData.indices[3 * i + 2], baseData.indices[3 * i + 1]);
        }
        data.indices = indices;
        if (baseData.colors) {
            data.colors = [...baseData.colors];
        }
        return data;
    }
    static MirrorZ(baseData) {
        let data = new BABYLON.VertexData();
        let positions = [];
        for (let i = 0; i < baseData.positions.length / 3; i++) {
            positions.push(baseData.positions[3 * i], baseData.positions[3 * i + 1], 1 - baseData.positions[3 * i + 2]);
        }
        data.positions = positions;
        if (baseData.normals && baseData.normals.length === baseData.positions.length) {
            let normals = [];
            for (let i = 0; i < baseData.normals.length / 3; i++) {
                normals.push(baseData.normals[3 * i], baseData.normals[3 * i + 1], -baseData.normals[3 * i + 2]);
            }
            data.normals = normals;
        }
        let indices = [];
        for (let i = 0; i < baseData.indices.length / 3; i++) {
            indices.push(baseData.indices[3 * i], baseData.indices[3 * i + 2], baseData.indices[3 * i + 1]);
        }
        data.indices = indices;
        if (baseData.colors) {
            data.colors = [...baseData.colors];
        }
        return data;
    }
}
PlanetChunckVertexData._VertexDatas = [
    new Map(),
    new Map(),
    new Map()
];
PlanetChunckVertexData.ReOrder = (ref, ...order) => {
    let v = [];
    for (let i = 0; i < order.length; i++) {
        v[i] = ref & (0b1 << i);
    }
    ref = 0b0;
    for (let i = 0; i < order.length; i++) {
        if (v[order[i]]) {
            ref |= 0b1 << i;
        }
    }
    return ref;
};
class PlanetMaterial extends BABYLON.ShaderMaterial {
    constructor(name, scene) {
        super(name, scene, {
            vertex: "terrainToon",
            fragment: "terrainToon",
        }, {
            attributes: ["position", "normal", "uv", "uv2", "color"],
            uniforms: [
                "world", "worldView", "worldViewProjection", "view", "projection",
                "useSeaLevelTexture", "useVertexColor",
                "seaLevelTexture",
                "planetPos",
                "voidTexture",
                "dirtSideTexture",
                "dirtTopTexture",
                "grassTexture",
                "rockTexture",
                "woodTexture",
                "sandTexture",
                "leafTexture",
                "iceTexture",
            ]
        });
        this._globalColor = BABYLON.Color3.Black();
        this._planetPos = BABYLON.Vector3.Zero();
        this.setVector3("lightInvDirW", BABYLON.Vector3.One().normalize());
        this._terrainColors = [];
        this._terrainColors[BlockType.None] = new BABYLON.Color3(0, 0, 0);
        this._terrainColors[BlockType.Water] = new BABYLON.Color3(0.0, 0.5, 1.0);
        this._terrainColors[BlockType.Grass] = new BABYLON.Color3(0.216, 0.616, 0.165);
        this._terrainColors[BlockType.Dirt] = new BABYLON.Color3(0.451, 0.263, 0.047);
        this._terrainColors[BlockType.Sand] = new BABYLON.Color3(0.761, 0.627, 0.141);
        this._terrainColors[BlockType.Rock] = new BABYLON.Color3(0.522, 0.522, 0.522);
        this._terrainColors[BlockType.Wood] = new BABYLON.Color3(0.600, 0.302, 0.020);
        this._terrainColors[BlockType.Leaf] = new BABYLON.Color3(0.431, 0.839, 0.020);
        this._terrainColors[BlockType.Laterite] = new BABYLON.Color3(0.839, 0.431, 0.020);
        this._terrainColors[BlockType.Basalt] = BABYLON.Color3.FromHexString("#1f1916");
        this._terrainColors[BlockType.Snow] = BABYLON.Color3.FromHexString("#efffff");
        this._terrainColors[BlockType.Ice] = BABYLON.Color3.FromHexString("#95e4f0");
        this._terrainColors[BlockType.Regolith] = new BABYLON.Color3(0.522, 0.522, 0.522);
        this._terrainFillStyles = [];
        for (let i = 0; i < this._terrainColors.length; i++) {
            let color = this._terrainColors[i];
            let fillStyle = "rgb(" + (color.r * 255).toFixed(0) + ", " + (color.g * 255).toFixed(0) + ", " + (color.b * 255).toFixed(0) + ")";
            this._terrainFillStyles[i] = fillStyle;
        }
        let voidTexture = new BABYLON.Texture("datas/images/void-texture.png");
        voidTexture.wrapU = 1;
        voidTexture.wrapV = 1;
        let dirtSideTexture = new BABYLON.Texture("datas/images/dirt-side.png");
        dirtSideTexture.wrapU = 1;
        dirtSideTexture.wrapV = 1;
        let dirtTopTexture = new BABYLON.Texture("datas/images/dirt-top.png");
        dirtTopTexture.wrapU = 1;
        dirtTopTexture.wrapV = 1;
        let grassTexture = new BABYLON.Texture("datas/images/grass.png");
        grassTexture.wrapU = 1;
        grassTexture.wrapV = 1;
        let rockTexture = new BABYLON.Texture("datas/images/rock.png");
        rockTexture.wrapU = 1;
        rockTexture.wrapV = 1;
        let woodTexture = new BABYLON.Texture("datas/images/wood.png");
        woodTexture.wrapU = 1;
        woodTexture.wrapV = 1;
        let sandTexture = new BABYLON.Texture("datas/images/sand.png");
        sandTexture.wrapU = 1;
        sandTexture.wrapV = 1;
        let leafTexture = new BABYLON.Texture("datas/images/leaf.png");
        leafTexture.wrapU = 1;
        leafTexture.wrapV = 1;
        let iceTexture = new BABYLON.Texture("datas/images/ice.png");
        iceTexture.wrapU = 1;
        iceTexture.wrapV = 1;
        this.setColor3("globalColor", this._globalColor);
        this.setColor3Array("terrainColors", this._terrainColors);
        this.setSeaLevelTexture(undefined);
        this.setInt("useVertexColor", 0);
        this.setTexture("seaLevelTexture", voidTexture);
        this.setTexture("voidTexture", voidTexture);
        this.setTexture("dirtSideTexture", dirtSideTexture);
        this.setTexture("dirtTopTexture", dirtTopTexture);
        this.setTexture("grassTexture", grassTexture);
        this.setTexture("rockTexture", rockTexture);
        this.setTexture("woodTexture", woodTexture);
        this.setTexture("sandTexture", sandTexture);
        this.setTexture("leafTexture", leafTexture);
        this.setTexture("iceTexture", iceTexture);
        this.setPlanetPos(BABYLON.Vector3.Zero());
    }
    getGlobalColor() {
        return this._globalColor;
    }
    setGlobalColor(color) {
        this._globalColor.copyFrom(color);
        this.setColor3("globalColor", this._globalColor);
    }
    getColor(blockType) {
        return this._terrainColors[blockType];
    }
    setColor(blockType, color) {
        this._terrainColors[blockType].copyFrom(color);
        let fillStyle = "rgb(" + (color.r * 255).toFixed(0) + ", " + (color.g * 255).toFixed(0) + ", " + (color.b * 255).toFixed(0) + ")";
        this._terrainFillStyles[blockType] = fillStyle;
        this.setColor3Array("terrainColors", this._terrainColors);
    }
    setSeaLevelTexture(texture) {
        this._seaLevelTexture = texture;
        this._useSeaLevelTexture = this._seaLevelTexture ? 1 : 0;
        this.setInt("useSeaLevelTexture", this._useSeaLevelTexture);
        if (this._seaLevelTexture) {
            this.setTexture("seaLevelTexture", this._seaLevelTexture);
        }
    }
    setUseVertexColor(useVertexColor) {
        this._useVertexColor = useVertexColor ? 1 : 0;
        this.setInt("useVertexColor", this._useVertexColor);
    }
    setFlatColors() {
        this._terrainColors[BlockType.None] = new BABYLON.Color3(0, 0, 0);
        this._terrainColors[BlockType.Water] = new BABYLON.Color3(0.224, 0.451, 0.675);
        this._terrainColors[BlockType.Grass] = new BABYLON.Color3(0.294, 0.608, 0.255);
        this._terrainColors[BlockType.Dirt] = new BABYLON.Color3(0.659, 0.463, 0.243);
        this._terrainColors[BlockType.Sand] = new BABYLON.Color3(0.780, 0.667, 0.263);
        this._terrainColors[BlockType.Rock] = new BABYLON.Color3(0.420, 0.420, 0.420);
        this.setColor3Array("terrainColors", this._terrainColors);
    }
    getPlanetPos() {
        return this._planetPos;
    }
    setPlanetPos(p) {
        this._planetPos.copyFrom(p);
        this.setVector3("planetPos", this._planetPos);
    }
    getFillStyle(blockType) {
        return this._terrainFillStyles[blockType];
    }
}
var SideNames = [
    "Front",
    "Right",
    "Back",
    "Left",
    "Top",
    "Bottom"
];
var Side;
(function (Side) {
    Side[Side["Front"] = 0] = "Front";
    Side[Side["Right"] = 1] = "Right";
    Side[Side["Back"] = 2] = "Back";
    Side[Side["Left"] = 3] = "Left";
    Side[Side["Top"] = 4] = "Top";
    Side[Side["Bottom"] = 5] = "Bottom";
})(Side || (Side = {}));
class PlanetSide extends BABYLON.Mesh {
    constructor(side, planet) {
        let name = planet.name + "-side-" + side;
        super(name, Game.Scene);
        this.planet = planet;
        this.parent = planet;
        this._side = side;
        this.rotationQuaternion = PlanetTools.QuaternionForSide(this._side);
        this.freezeWorldMatrix();
    }
    get side() {
        return this._side;
    }
    get chunckManager() {
        return this.planet.chunckManager;
    }
    GetPlanetName() {
        return this.planet.GetPlanetName();
    }
    get kPosMax() {
        return this.planet.kPosMax;
    }
    onShellMaterialReady(callback) {
        if (this.shellMaterial && this.shellMaterial.isReady()) {
            callback();
        }
        else {
            let attempt = () => {
                if (this.shellMaterial && this.shellMaterial.isReady()) {
                    callback();
                }
                else {
                    requestAnimationFrame(attempt);
                }
            };
            attempt();
        }
    }
    getChunck(iPos, jPos, kPos, degree) {
        if (PlanetTools.KPosToDegree(kPos) === degree + 1) {
            let chunck00 = this.getChunck(Math.floor(iPos * 2), Math.floor(jPos * 2), kPos, degree + 1);
            let chunck10 = this.getChunck(Math.floor(iPos * 2 + 1), Math.floor(jPos * 2), kPos, degree + 1);
            let chunck01 = this.getChunck(Math.floor(iPos * 2), Math.floor(jPos * 2 + 1), kPos, degree + 1);
            let chunck11 = this.getChunck(Math.floor(iPos * 2 + 1), Math.floor(jPos * 2 + 1), kPos, degree + 1);
            if (chunck00 instanceof PlanetChunck) {
                if (chunck10 instanceof PlanetChunck) {
                    if (chunck01 instanceof PlanetChunck) {
                        if (chunck11 instanceof PlanetChunck) {
                            return [chunck00, chunck10, chunck01, chunck11];
                        }
                    }
                }
            }
        }
        if (PlanetTools.KPosToDegree(kPos) < degree) {
            return this.getChunck(Math.floor(iPos / 2), Math.floor(jPos / 2), kPos, degree - 1);
        }
        let chunckCount = PlanetTools.DegreeToChuncksCount(PlanetTools.KPosToDegree(kPos));
        if (iPos >= 0 && iPos < chunckCount) {
            if (jPos >= 0 && jPos < chunckCount) {
                if (kPos >= 0 && kPos < this.kPosMax) {
                    let group = this.chunckGroups[degree];
                    if (group) {
                        return group.getPlanetChunck(iPos, jPos, kPos);
                    }
                }
            }
        }
        if (kPos >= 0 && kPos < this.kPosMax) {
            if (iPos < 0) {
                if (this.side <= Side.Left) {
                    let side = this.planet.GetSide((this.side + 1) % 4);
                    return side.getChunck(chunckCount + iPos, jPos, kPos, degree);
                }
                else if (this.side === Side.Top) {
                    let side = this.planet.GetSide(Side.Back);
                    return side.getChunck(chunckCount - 1 - jPos, chunckCount + iPos, kPos, degree);
                }
                else if (this.side === Side.Bottom) {
                    let side = this.planet.GetSide(Side.Back);
                    return side.getChunck(jPos, -1 - iPos, kPos, degree);
                }
            }
            else if (iPos >= chunckCount) {
                if (this.side <= Side.Left) {
                    let side = this.planet.GetSide((this.side + 3) % 4);
                    return side.getChunck(-chunckCount + iPos, jPos, kPos, degree);
                }
                else if (this.side === Side.Top) {
                    let side = this.planet.GetSide(Side.Front);
                    return side.getChunck(jPos, 2 * chunckCount - iPos - 1, kPos, degree);
                }
                else if (this.side === Side.Bottom) {
                    let side = this.planet.GetSide(Side.Front);
                    return side.getChunck(chunckCount - 1 - jPos, chunckCount - iPos, kPos, degree);
                }
            }
            else if (jPos < 0) {
                if (this.side === Side.Front) {
                    let side = this.planet.GetSide(Side.Bottom);
                    return side.getChunck(chunckCount + jPos, chunckCount - 1 - iPos, kPos, degree);
                }
                else if (this.side === Side.Right) {
                    let side = this.planet.GetSide(Side.Bottom);
                    return side.getChunck(iPos, chunckCount + jPos, kPos, degree);
                }
                else if (this.side === Side.Back) {
                    let side = this.planet.GetSide(Side.Bottom);
                    return side.getChunck(-1 - jPos, iPos, kPos, degree);
                }
                else if (this.side === Side.Left) {
                    let side = this.planet.GetSide(Side.Bottom);
                    return side.getChunck(chunckCount - 1 - iPos, -1 - jPos, kPos, degree);
                }
                else if (this.side === Side.Top) {
                    let side = this.planet.GetSide(Side.Right);
                    return side.getChunck(iPos, chunckCount + jPos, kPos, degree);
                }
                else if (this.side === Side.Bottom) {
                    let side = this.planet.GetSide(Side.Left);
                    return side.getChunck(chunckCount - 1 - iPos, -1 - jPos, kPos, degree);
                }
            }
            else if (jPos >= chunckCount) {
                if (this.side === Side.Front) {
                    let side = this.planet.GetSide(Side.Top);
                    return side.getChunck(2 * chunckCount - 1 - jPos, iPos, kPos, degree);
                }
                else if (this.side === Side.Right) {
                    let side = this.planet.GetSide(Side.Top);
                    return side.getChunck(iPos, -chunckCount + jPos, kPos, degree);
                }
                else if (this.side === Side.Back) {
                    let side = this.planet.GetSide(Side.Top);
                    return side.getChunck(-chunckCount + jPos, chunckCount - 1 - iPos, kPos, degree);
                }
                else if (this.side === Side.Left) {
                    let side = this.planet.GetSide(Side.Top);
                    return side.getChunck(chunckCount - 1 - iPos, 2 * chunckCount - 1 - jPos, kPos, degree);
                }
                else if (this.side === Side.Top) {
                    let side = this.planet.GetSide(Side.Left);
                    return side.getChunck(chunckCount - 1 - iPos, 2 * chunckCount - 1 - jPos, kPos, degree);
                }
                else if (this.side === Side.Bottom) {
                    let side = this.planet.GetSide(Side.Right);
                    return side.getChunck(iPos, -chunckCount + jPos, kPos, degree);
                }
            }
        }
    }
    GetData(iGlobal, jGlobal, kGlobal, degree) {
        if (PlanetTools.KGlobalToDegree(kGlobal) != degree) {
            return 0;
        }
        let chuncksCount = PlanetTools.DegreeToChuncksCount(PlanetTools.KGlobalToDegree(kGlobal));
        let L = chuncksCount * PlanetTools.CHUNCKSIZE;
        if (iGlobal < 0) {
            if (this.side <= Side.Left) {
                let side = this.planet.GetSide((this.side + 1) % 4);
                return side.GetData(L + iGlobal, jGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Top) {
                let side = this.planet.GetSide(Side.Back);
                return side.GetData(L - 1 - jGlobal, L + iGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Bottom) {
                let side = this.planet.GetSide(Side.Back);
                return side.GetData(jGlobal, -1 - iGlobal, kGlobal, degree);
            }
        }
        else if (iGlobal >= L) {
            if (this.side <= Side.Left) {
                let side = this.planet.GetSide((this.side + 3) % 4);
                return side.GetData(-L + iGlobal, jGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Top) {
                let side = this.planet.GetSide(Side.Front);
                return side.GetData(jGlobal, 2 * L - iGlobal - 1, kGlobal, degree);
            }
            else if (this.side === Side.Bottom) {
                let side = this.planet.GetSide(Side.Front);
                return side.GetData(L - 1 - jGlobal, L - iGlobal, kGlobal, degree);
            }
        }
        else if (jGlobal < 0) {
            if (this.side === Side.Front) {
                let side = this.planet.GetSide(Side.Bottom);
                return side.GetData(L + jGlobal, L - 1 - iGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Right) {
                let side = this.planet.GetSide(Side.Bottom);
                return side.GetData(iGlobal, L + jGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Back) {
                let side = this.planet.GetSide(Side.Bottom);
                return side.GetData(-1 - jGlobal, iGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Left) {
                let side = this.planet.GetSide(Side.Bottom);
                return side.GetData(L - 1 - iGlobal, -1 - jGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Top) {
                let side = this.planet.GetSide(Side.Right);
                return side.GetData(iGlobal, L + jGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Bottom) {
                let side = this.planet.GetSide(Side.Left);
                return side.GetData(L - 1 - iGlobal, -1 - jGlobal, kGlobal, degree);
            }
        }
        else if (jGlobal >= L) {
            if (this.side === Side.Front) {
                let side = this.planet.GetSide(Side.Top);
                return side.GetData(2 * L - 1 - jGlobal, iGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Right) {
                let side = this.planet.GetSide(Side.Top);
                return side.GetData(iGlobal, -L + jGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Back) {
                let side = this.planet.GetSide(Side.Top);
                return side.GetData(-L + jGlobal, L - 1 - iGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Left) {
                let side = this.planet.GetSide(Side.Top);
                return side.GetData(L - 1 - iGlobal, 2 * L - 1 - jGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Top) {
                let side = this.planet.GetSide(Side.Left);
                return side.GetData(L - 1 - iGlobal, 2 * L - 1 - jGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Bottom) {
                let side = this.planet.GetSide(Side.Right);
                return side.GetData(iGlobal, -L + jGlobal, kGlobal, degree);
            }
        }
        let iChunck = Math.floor(iGlobal / PlanetTools.CHUNCKSIZE);
        let jChunck = Math.floor(jGlobal / PlanetTools.CHUNCKSIZE);
        let kChunck = Math.floor(kGlobal / PlanetTools.CHUNCKSIZE);
        let chunckCount = PlanetTools.DegreeToChuncksCount(PlanetTools.KPosToDegree(kChunck));
        if (iChunck >= 0 && iChunck < chunckCount) {
            if (jChunck >= 0 && jChunck < chunckCount) {
                if (kChunck >= 0 && kChunck < this.kPosMax) {
                    let group = this.chunckGroups[degree];
                    if (group) {
                        let i = iGlobal - iChunck * PlanetTools.CHUNCKSIZE;
                        let j = jGlobal - jChunck * PlanetTools.CHUNCKSIZE;
                        let k = kGlobal - kChunck * PlanetTools.CHUNCKSIZE;
                        let chunck = group.getPlanetChunck(iChunck, jChunck, kChunck);
                        if (chunck) {
                            return chunck.GetData(i, j, k);
                        }
                    }
                }
            }
        }
        return 0;
    }
    instantiate() {
        this.chunckGroups = [];
        for (let degree = PlanetTools.DEGREEMIN; degree <= PlanetTools.KPosToDegree(this.kPosMax); degree++) {
            this.chunckGroups[degree] = new PlanetChunckGroup(0, 0, 0, this, undefined, degree, degree - (PlanetTools.DEGREEMIN - 1));
        }
        let material = new PlanetMaterial(this.name, this.getScene());
        //let material = new BABYLON.StandardMaterial(this.name, this.getScene());
        material.setSeaLevelTexture(this.planet.generator.getTexture(this.side, Config.performanceConfiguration.shellMeshTextureSize));
        material.setPlanetPos(this.planet.position);
        this.shellMaterial = material;
    }
    register() {
        let chunckCount = 0;
        for (let degree = PlanetTools.DEGREEMIN; degree <= PlanetTools.KPosToDegree(this.kPosMax); degree++) {
            this.chunckGroups[degree].register();
        }
        return chunckCount;
    }
}
class PlanetSky {
    constructor(skybox, scene) {
        this.skybox = skybox;
        this.scene = scene;
        this.invertLightDir = BABYLON.Vector3.Up();
        this.zenithColor = new BABYLON.Color3(0.478, 0.776, 1.000);
        this.dawnColor = new BABYLON.Color3(0.702, 0.373, 0.000);
        this.nightColor = new BABYLON.Color3(0.000, 0.008, 0.188);
        this._skyColor = BABYLON.Color3.Black();
        this._initialized = false;
        this._update = () => {
            if (this.player) {
                let factor = BABYLON.Vector3.Dot(this.player.upDirection, this.invertLightDir);
                let atmoLimit = 50;
                let d = (atmoLimit - this.player.altitudeOnPlanet) / 25;
                d = Math.max(Math.min(d, 1), 0);
                if (this.skybox) {
                    let skyAlpha = (1 - factor) / 4;
                    skyAlpha = Math.max(Math.min(skyAlpha, 1), 0);
                    this.skybox.material.alpha = Math.max(skyAlpha, 1 - d);
                }
                let sign = 0;
                if (factor != 0) {
                    sign = factor / Math.abs(factor);
                    factor = sign * Math.sqrt(Math.sqrt(Math.abs(factor)));
                }
                if (sign >= 0) {
                    BABYLON.Color3.LerpToRef(this.dawnColor, this.zenithColor, factor, this._skyColor);
                    this._skyColor.r *= d;
                    this._skyColor.g *= d;
                    this._skyColor.b *= d;
                    this.scene.clearColor.copyFromFloats(this._skyColor.r, this._skyColor.g, this._skyColor.b, 1);
                }
                else {
                    BABYLON.Color3.LerpToRef(this.dawnColor, this.nightColor, Math.abs(factor), this._skyColor);
                    this._skyColor.r *= d;
                    this._skyColor.g *= d;
                    this._skyColor.b *= d;
                    this.scene.clearColor.copyFromFloats(this._skyColor.r, this._skyColor.g, this._skyColor.b, 1);
                }
            }
        };
    }
    get initialized() {
        return this._initialized;
    }
    initialize() {
        this.scene.onBeforeRenderObservable.add(this._update);
        this._initialized = true;
    }
    setInvertLightDir(invertLightDir) {
        this.invertLightDir = invertLightDir;
    }
}
var PI4 = Math.PI / 4;
var PI2 = Math.PI / 2;
var PI = Math.PI;
class PlanetTools {
    static get tmpVertices() {
        if (!PlanetTools._tmpVertices || PlanetTools._tmpVertices.length < 15) {
            PlanetTools._tmpVertices = [];
            for (let i = 0; i < 15; i++) {
                PlanetTools._tmpVertices[i] = BABYLON.Vector3.Zero();
            }
        }
        return PlanetTools._tmpVertices;
    }
    static EmptyVertexData() {
        if (!PlanetTools._emptyVertexData) {
            let emptyMesh = new BABYLON.Mesh("Empty", Game.Scene);
            PlanetTools._emptyVertexData = BABYLON.VertexData.ExtractFromMesh(emptyMesh);
            emptyMesh.dispose();
        }
        return PlanetTools._emptyVertexData;
    }
    static QuaternionForSide(side) {
        if (side === Side.Top) {
            return BABYLON.Quaternion.RotationQuaternionFromAxis(BABYLON.Axis.Z, BABYLON.Axis.Y, BABYLON.Axis.X.scale(-1));
        }
        else if (side === Side.Left) {
            return BABYLON.Quaternion.RotationQuaternionFromAxis(BABYLON.Axis.Z.scale(-1), BABYLON.Axis.X.scale(-1), BABYLON.Axis.Y);
        }
        else if (side === Side.Front) {
            return BABYLON.Quaternion.RotationQuaternionFromAxis(BABYLON.Axis.X.scale(-1), BABYLON.Axis.Z, BABYLON.Axis.Y);
        }
        else if (side === Side.Back) {
            return BABYLON.Quaternion.RotationQuaternionFromAxis(BABYLON.Axis.X, BABYLON.Axis.Z.scale(-1), BABYLON.Axis.Y);
        }
        else if (side === Side.Right) {
            return BABYLON.Quaternion.RotationQuaternionFromAxis(BABYLON.Axis.Z, BABYLON.Axis.X, BABYLON.Axis.Y);
        }
        else if (side === Side.Bottom) {
            return BABYLON.Quaternion.RotationQuaternionFromAxis(BABYLON.Axis.Z, BABYLON.Axis.Y.scale(-1), BABYLON.Axis.X);
        }
    }
    static EvaluateVertex(size, i, j) {
        let v = new BABYLON.Vector3();
        return PlanetTools.EvaluateVertexToRef(size, i, j, v);
    }
    static EvaluateVertexToRef(size, i, j, ref) {
        if (i < 0) {
            let v = PlanetTools.EvaluateVertex(size, i + size, j);
            ref.copyFromFloats(-v.y, v.x, v.z);
            return ref;
        }
        if (i > size) {
            let v = PlanetTools.EvaluateVertex(size, i - size, j);
            ref.copyFromFloats(v.y, -v.x, v.z);
            return ref;
        }
        if (j < 0) {
            let v = PlanetTools.EvaluateVertex(size, i, j + size);
            ref.copyFromFloats(v.x, v.z, -v.y);
            return ref;
        }
        if (j > size) {
            let v = PlanetTools.EvaluateVertex(size, i, j - size);
            ref.copyFromFloats(v.x, -v.z, v.y);
            return ref;
        }
        let xRad = -PI4 + PI2 * (i / size);
        let zRad = -PI4 + PI2 * (j / size);
        ref.copyFromFloats(Math.tan(xRad), 1, Math.tan(zRad)).normalize();
        return ref;
    }
    static SkewVertexData(vertexData, size, i, j, k) {
        let h0 = PlanetTools.KGlobalToAltitude(k);
        let h1 = PlanetTools.KGlobalToAltitude(k + 1);
        let v0 = PlanetTools.tmpVertices[0];
        let v1 = PlanetTools.tmpVertices[1];
        let v2 = PlanetTools.tmpVertices[2];
        let v3 = PlanetTools.tmpVertices[3];
        let v4 = PlanetTools.tmpVertices[4];
        let v5 = PlanetTools.tmpVertices[5];
        let v6 = PlanetTools.tmpVertices[6];
        let v7 = PlanetTools.tmpVertices[7];
        let v01 = PlanetTools.tmpVertices[8];
        let v32 = PlanetTools.tmpVertices[9];
        let v45 = PlanetTools.tmpVertices[10];
        let v76 = PlanetTools.tmpVertices[11];
        let v0132 = PlanetTools.tmpVertices[12];
        let v4576 = PlanetTools.tmpVertices[13];
        let v = PlanetTools.tmpVertices[14];
        PlanetTools.EvaluateVertexToRef(size, i, j, v0);
        PlanetTools.EvaluateVertexToRef(size, i + 1, j, v1);
        PlanetTools.EvaluateVertexToRef(size, i + 1, j + 1, v2);
        PlanetTools.EvaluateVertexToRef(size, i, j + 1, v3);
        v4.copyFrom(v0).scaleInPlace(h1);
        v5.copyFrom(v1).scaleInPlace(h1);
        v6.copyFrom(v2).scaleInPlace(h1);
        v7.copyFrom(v3).scaleInPlace(h1);
        v0.scaleInPlace(h0);
        v1.scaleInPlace(h0);
        v2.scaleInPlace(h0);
        v3.scaleInPlace(h0);
        let skewedVertexData = new BABYLON.VertexData();
        let positions = [];
        let normals = [...vertexData.normals];
        let indices = [...vertexData.indices];
        let uvs = [...vertexData.uvs];
        let colors;
        if (vertexData.colors) {
            colors = [...vertexData.colors];
        }
        for (let n = 0; n < vertexData.positions.length / 3; n++) {
            let x = vertexData.positions[3 * n];
            let y = vertexData.positions[3 * n + 1];
            let z = vertexData.positions[3 * n + 2];
            v01.copyFrom(v1).subtractInPlace(v0).scaleInPlace(x).addInPlace(v0);
            v32.copyFrom(v2).subtractInPlace(v3).scaleInPlace(x).addInPlace(v3);
            v45.copyFrom(v5).subtractInPlace(v4).scaleInPlace(x).addInPlace(v4);
            v76.copyFrom(v6).subtractInPlace(v7).scaleInPlace(x).addInPlace(v7);
            v0132.copyFrom(v32).subtractInPlace(v01).scaleInPlace(z).addInPlace(v01);
            v4576.copyFrom(v76).subtractInPlace(v45).scaleInPlace(z).addInPlace(v45);
            v.copyFrom(v4576).subtractInPlace(v0132).scaleInPlace(y).addInPlace(v0132);
            positions.push(v.x);
            positions.push(v.y);
            positions.push(v.z);
        }
        skewedVertexData.positions = positions;
        skewedVertexData.normals = normals;
        skewedVertexData.indices = indices;
        skewedVertexData.colors = colors;
        skewedVertexData.uvs = uvs;
        return skewedVertexData;
    }
    static Data(refData, callback) {
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            refData[i] = [];
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                refData[i][j] = [];
                for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    refData[i][j][k] = callback(i, j, k);
                }
            }
        }
    }
    static FilledData() {
        let data = [];
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            data[i] = [];
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                data[i][j] = [];
                for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    //data[i][j][k] = 128 + 9 + Math.floor(4 * Math.random());
                    data[i][j][k] = 3;
                }
            }
        }
        return data;
    }
    static RandomData() {
        let data = [];
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            data[i] = [];
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                data[i][j] = [];
                for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    if (Math.random() < 0.5) {
                        data[i][j][k] = 0;
                    }
                    else {
                        data[i][j][k] = Math.floor(Math.random() * 7 + 129);
                    }
                }
            }
        }
        return data;
    }
    static DataFromHexString(hexString) {
        if (hexString.length !== PlanetTools.CHUNCKSIZE * PlanetTools.CHUNCKSIZE * PlanetTools.CHUNCKSIZE * 2) {
            console.log("Invalid HexString. Length is =" +
                hexString.length +
                ". Expected length is = " +
                PlanetTools.CHUNCKSIZE *
                    PlanetTools.CHUNCKSIZE *
                    PlanetTools.CHUNCKSIZE *
                    2 +
                ".");
            return;
        }
        let data = [];
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            data[i] = [];
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                data[i][j] = [];
                for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    let index = 2 * (i * PlanetTools.CHUNCKSIZE * PlanetTools.CHUNCKSIZE + j * PlanetTools.CHUNCKSIZE + k);
                    data[i][j][k] = parseInt(hexString.slice(index, index + 2), 16);
                }
            }
        }
        return data;
    }
    static HexStringFromData(data) {
        let hexString = "";
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    hexString += data[i][j][k].toString(16);
                }
            }
        }
        return hexString;
    }
    static PlanetPositionToSide(planetPos) {
        let ax = Math.abs(planetPos.x);
        let ay = Math.abs(planetPos.y);
        let az = Math.abs(planetPos.z);
        if (ax >= ay && ax >= az) {
            if (planetPos.x >= 0) {
                return Side.Right;
            }
            return Side.Left;
        }
        if (ay >= ax && ay >= az) {
            if (planetPos.y >= 0) {
                return Side.Top;
            }
            return Side.Bottom;
        }
        if (az >= ax && az >= ay) {
            if (planetPos.z >= 0) {
                return Side.Front;
            }
            return Side.Back;
        }
    }
    static WorldPositionToPlanetSide(planet, worldPos) {
        return planet.GetSide(PlanetTools.PlanetPositionToSide(worldPos.subtract(planet.position)));
    }
    static PlanetPositionToPlanetSide(planet, planetPos) {
        return planet.GetSide(PlanetTools.PlanetPositionToSide(planetPos));
    }
    static PlanetPositionToGlobalIJK(a, planetPos) {
        let localPos = BABYLON.Vector3.Zero();
        let q;
        if (a instanceof PlanetSide) {
            q = a.rotationQuaternion.conjugate();
        }
        else {
            q = PlanetTools.QuaternionForSide(a).conjugate();
        }
        VMath.RotateVectorByQuaternionToRef(planetPos, q, localPos);
        let r = localPos.length();
        if (Math.abs(localPos.x) > 1) {
            localPos.scaleInPlace(Math.abs(1 / localPos.x));
        }
        if (Math.abs(localPos.y) > 1) {
            localPos.scaleInPlace(Math.abs(1 / localPos.y));
        }
        if (Math.abs(localPos.z) > 1) {
            localPos.scaleInPlace(Math.abs(1 / localPos.z));
        }
        let xDeg = (Math.atan(localPos.x) / Math.PI) * 180;
        let zDeg = (Math.atan(localPos.z) / Math.PI) * 180;
        let k = PlanetTools.AltitudeToKGlobal(r);
        let i = Math.floor(((xDeg + 45) / 90) * PlanetTools.DegreeToSize(PlanetTools.KGlobalToDegree(k)));
        let j = Math.floor(((zDeg + 45) / 90) * PlanetTools.DegreeToSize(PlanetTools.KGlobalToDegree(k)));
        return { i: i, j: j, k: k };
    }
    static PlanetDirectionToGlobalIJ(a, b, c) {
        let localPos = BABYLON.Vector3.Zero();
        let planetPos;
        let q;
        let size;
        if (a instanceof PlanetSide) {
            size = PlanetTools.DegreeToSize(a.planet.degree);
            planetPos = b;
            q = a.rotationQuaternion.conjugate();
        }
        else {
            size = b;
            planetPos = c;
            q = PlanetTools.QuaternionForSide(a).conjugate();
        }
        VMath.RotateVectorByQuaternionToRef(planetPos, q, localPos);
        let r = localPos.length();
        if (Math.abs(localPos.x) > 1) {
            localPos.scaleInPlace(Math.abs(1 / localPos.x));
        }
        if (Math.abs(localPos.y) > 1) {
            localPos.scaleInPlace(Math.abs(1 / localPos.y));
        }
        if (Math.abs(localPos.z) > 1) {
            localPos.scaleInPlace(Math.abs(1 / localPos.z));
        }
        let xDeg = (Math.atan(localPos.x) / Math.PI) * 180;
        let zDeg = (Math.atan(localPos.z) / Math.PI) * 180;
        let i = Math.floor(((xDeg + 45) / 90) * size);
        let j = Math.floor(((zDeg + 45) / 90) * size);
        return { i: i, j: j };
    }
    static WorldPositionToGlobalIJK(planetSide, worldPos) {
        return PlanetTools.PlanetPositionToGlobalIJK(planetSide, worldPos.subtract(planetSide.planet.position));
    }
    static WorldPositionToLocalIJK(planet, worldPos) {
        return PlanetTools.PlanetPositionToLocalIJK(planet, worldPos.subtract(planet.position));
    }
    static PlanetDirectionToGlobalIJK(planet, planetDirection) {
        let planetSide = PlanetTools.PlanetPositionToPlanetSide(planet, planetDirection);
        let globalIJ = PlanetTools.PlanetDirectionToGlobalIJ(planetSide, planetDirection);
        let k = Math.ceil(planet.generator.altitudeMap.getForSide(planetSide.side, globalIJ.i, globalIJ.j) * planet.kPosMax * PlanetTools.CHUNCKSIZE);
        let f = Math.pow(2, planet.degree - PlanetTools.KGlobalToDegree(k));
        return { i: Math.floor(globalIJ.i / f), j: Math.floor(globalIJ.j / f), k: k };
    }
    static PlanetPositionToLocalIJK(planet, planetPos) {
        let planetSide = PlanetTools.PlanetPositionToPlanetSide(planet, planetPos);
        let globalIJK = PlanetTools.PlanetPositionToGlobalIJK(planetSide, planetPos);
        let localIJK = PlanetTools.GlobalIJKToLocalIJK(planetSide, globalIJK);
        return localIJK;
    }
    static WorldPositionToChunck(planet, worldPos) {
        return PlanetTools.PlanetPositionToChunck(planet, worldPos.subtract(planet.position));
    }
    static PlanetPositionToChunck(planet, planetPos) {
        let localIJK = PlanetTools.PlanetPositionToLocalIJK(planet, planetPos);
        return localIJK ? localIJK.planetChunck : undefined;
    }
    static GlobalIJKToPlanetPosition(planetSide, globalIJK, middleAltitude) {
        let size = PlanetTools.DegreeToSize(PlanetTools.KGlobalToDegree(globalIJK.k));
        let p = PlanetTools.EvaluateVertex(size, globalIJK.i + 0.5, globalIJK.j + 0.5);
        if (middleAltitude) {
            p.scaleInPlace(PlanetTools.KGlobalToAltitude(globalIJK.k) * 0.5 + PlanetTools.KGlobalToAltitude(globalIJK.k + 1) * 0.5);
        }
        else {
            p.scaleInPlace(PlanetTools.KGlobalToAltitude(globalIJK.k));
        }
        VMath.RotateVectorByQuaternionToRef(p, planetSide.rotationQuaternion, p);
        return p;
    }
    static GlobalIJToLatitude(planetSide, size, globalI, globalJ) {
        let planetDirection = PlanetTools.EvaluateVertex(size, globalI + 0.5, globalJ + 0.5);
        VMath.RotateVectorByQuaternionToRef(planetDirection, planetSide.rotationQuaternion, planetDirection);
        return Math.asin(planetDirection.y) / Math.PI * 180;
    }
    static GlobalIJKToLocalIJK(planetSide, global) {
        let kPos = Math.floor(global.k / PlanetTools.CHUNCKSIZE);
        let degree = PlanetTools.KPosToDegree(kPos);
        let chunck = planetSide.getChunck(Math.floor(global.i / PlanetTools.CHUNCKSIZE), Math.floor(global.j / PlanetTools.CHUNCKSIZE), kPos, degree);
        if (chunck) {
            return {
                planetChunck: chunck,
                i: global.i % PlanetTools.CHUNCKSIZE,
                j: global.j % PlanetTools.CHUNCKSIZE,
                k: global.k % PlanetTools.CHUNCKSIZE,
            };
        }
    }
    static LocalIJKToGlobalIJK(a, localI, localJ, localK) {
        let planetChunck;
        if (a instanceof PlanetChunck) {
            planetChunck = a;
        }
        else {
            planetChunck = a.planetChunck;
            localI = a.i;
            localJ = a.j;
            localK = a.k;
        }
        return {
            i: planetChunck.iPos * PlanetTools.CHUNCKSIZE + localI,
            j: planetChunck.jPos * PlanetTools.CHUNCKSIZE + localJ,
            k: planetChunck.kPos * PlanetTools.CHUNCKSIZE + localK
        };
    }
    static LocalIJKToPlanetPosition(a, b, localJ, localK, middleAltitude) {
        let planetChunck;
        let localI;
        if (a instanceof PlanetChunck) {
            planetChunck = a;
            localI = b;
        }
        else {
            planetChunck = a.planetChunck;
            localI = a.i;
            localJ = a.j;
            localK = a.k;
            middleAltitude = b;
        }
        let globalIJK = PlanetTools.LocalIJKToGlobalIJK(planetChunck, localI, localJ, localK);
        return PlanetTools.GlobalIJKToPlanetPosition(planetChunck.planetSide, globalIJK, middleAltitude);
    }
    static KGlobalToDegree(k) {
        return PlanetTools.KPosToDegree(Math.floor(k / PlanetTools.CHUNCKSIZE));
    }
    static KPosToDegree(kPos) {
        return PlanetTools.KPosToDegree8(kPos);
    }
    static KPosToSize(kPos) {
        return PlanetTools.DegreeToSize(PlanetTools.KPosToDegree(kPos));
    }
    static get BSizes() {
        if (!PlanetTools._BSizes) {
            PlanetTools._ComputeBSizes();
        }
        return PlanetTools._BSizes;
    }
    static get Altitudes() {
        if (!PlanetTools._Altitudes) {
            PlanetTools._ComputeBSizes();
        }
        return PlanetTools._Altitudes;
    }
    static get SummedBSizesLength() {
        if (!PlanetTools._SummedBSizesLength) {
            PlanetTools._ComputeBSizes();
        }
        return PlanetTools._SummedBSizesLength;
    }
    static _ComputeBSizes() {
        PlanetTools._BSizes = [];
        PlanetTools._Altitudes = [];
        PlanetTools._SummedBSizesLength = [];
        let coreRadius = 7.6;
        let radius = coreRadius;
        let degree = this.DEGREEMIN;
        let bSizes = [];
        let altitudes = [];
        let summedBSizesLength = 0;
        while (radius < 1000) {
            let size = PlanetTools.DegreeToSize(degree);
            for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
                let a = Math.PI / 2 / size;
                let s = a * radius * 0.8;
                bSizes.push(s);
                altitudes.push(radius);
                radius = radius + s;
            }
            let a = Math.PI / 2 / size;
            let s = a * radius;
            if (s > 1.3) {
                PlanetTools._SummedBSizesLength[degree] = summedBSizesLength;
                summedBSizesLength += bSizes.length;
                PlanetTools._BSizes[degree] = [...bSizes];
                bSizes = [];
                PlanetTools._Altitudes[degree] = [...altitudes];
                altitudes = [];
                degree++;
            }
        }
    }
    static KPosToDegree8(kPos) {
        let v = PlanetTools._KPosToDegree.get(kPos);
        if (isFinite(v)) {
            return v;
        }
        let degree = this.DEGREEMIN;
        let tmpKpos = kPos;
        while (degree < PlanetTools.BSizes.length) {
            let size = PlanetTools.BSizes[degree].length / PlanetTools.CHUNCKSIZE;
            if (tmpKpos < size) {
                PlanetTools._KPosToDegree.set(kPos, degree);
                return degree;
            }
            else {
                tmpKpos -= size;
                degree++;
            }
        }
    }
    static KPosToDegree16(kPos) {
        let v = PlanetTools._KPosToDegree.get(kPos);
        if (isFinite(v)) {
            return v;
        }
        let degree = this.DEGREEMIN;
        let tmpKpos = kPos;
        while (degree < PlanetTools.BSizes.length) {
            let size = PlanetTools.BSizes[degree].length / PlanetTools.CHUNCKSIZE;
            if (tmpKpos < size) {
                PlanetTools._KPosToDegree.set(kPos, degree);
                return degree;
            }
            else {
                tmpKpos -= size;
                degree++;
            }
        }
    }
    static RecursiveFind(data, value, nMin, nMax) {
        let n = Math.floor(nMin * 0.5 + nMax * 0.5);
        if (nMax - nMin === 1) {
            return n;
        }
        let vn = data[n];
        if (nMax - nMin === 2) {
            if (vn > value) {
                return n - 1;
            }
            else {
                return n;
            }
        }
        if (vn > value) {
            return PlanetTools.RecursiveFind(data, value, nMin, n);
        }
        else {
            return PlanetTools.RecursiveFind(data, value, n, nMax);
        }
    }
    static AltitudeToKGlobal(altitude) {
        let degree = this.DEGREEMIN;
        while (degree < PlanetTools.Altitudes.length - 1) {
            let highest = PlanetTools.Altitudes[degree + 1][0];
            if (altitude < highest) {
                break;
            }
            else {
                degree++;
            }
        }
        let altitudes = PlanetTools.Altitudes[degree];
        let summedLength = PlanetTools.SummedBSizesLength[degree];
        return summedLength + PlanetTools.RecursiveFind(altitudes, altitude, 0, altitudes.length);
    }
    static KGlobalToAltitude(kGlobal) {
        if (kGlobal < 0) {
            return 13.4 - 0.5;
        }
        let degree = PlanetTools.KGlobalToDegree(kGlobal);
        let altitudes = PlanetTools.Altitudes[degree];
        let summedLength = PlanetTools.SummedBSizesLength[degree];
        return altitudes[kGlobal - summedLength];
    }
    static KLocalToAltitude(chunck, k) {
        let degree = PlanetTools.KGlobalToDegree(chunck.kPos * PlanetTools.CHUNCKSIZE + k);
        let altitudes = PlanetTools.Altitudes[degree];
        let summedLength = PlanetTools.SummedBSizesLength[degree];
        return altitudes[chunck.kPos * PlanetTools.CHUNCKSIZE + k - summedLength];
    }
    static DegreeToKOffset(degree) {
        return PlanetTools._SummedBSizesLength[degree] / PlanetTools.CHUNCKSIZE;
    }
    /*
    public static KPosToDegree16(kPos: number): number {
        if (kPos < 1) {
            return 4;
        }
        else if (kPos < 2) {
            return 5;
        }
        else if (kPos < 4) {
            return 6;
        }
        else if (kPos < 7) {
            return 7;
        }
        else if (kPos < 13) {
            return 8;
        }
        return 9;
    }

    public static KPosToDegree32(kPos: number): number {
        if (kPos < 1) {
            return 5;
        }
        else if (kPos < 2) {
            return 6;
        }
        else if (kPos < 4) {
            return 7;
        }
        else if (kPos < 7) {
            return 8;
        }
        return 9;
    }
    */
    static DegreeToSize(degree) {
        return Math.pow(2, degree);
    }
    static DegreeToChuncksCount(degree) {
        return PlanetTools.DegreeToSize(degree) / PlanetTools.CHUNCKSIZE;
    }
}
// Chunck Size = 8 case
PlanetTools.DEGREEMIN = 4;
PlanetTools.CHUNCKSIZE = 8;
PlanetTools.CORE_RADIUS = 7.6;
// Chunck Size = 16 case
//public static readonly DEGREEMIN = 5;
//public static readonly CHUNCKSIZE = 16;
//public static readonly CORE_RADIUS = 13.4;
PlanetTools.ALPHALIMIT = Math.PI / 4;
PlanetTools.DISTANCELIMITSQUARED = 128 * 128;
PlanetTools._KPosToDegree = new Map();
var PlanetGeneratorType;
(function (PlanetGeneratorType) {
    PlanetGeneratorType[PlanetGeneratorType["Moon"] = 0] = "Moon";
    PlanetGeneratorType[PlanetGeneratorType["Earth"] = 1] = "Earth";
    PlanetGeneratorType[PlanetGeneratorType["Mars"] = 2] = "Mars";
    PlanetGeneratorType[PlanetGeneratorType["Cold"] = 3] = "Cold";
    PlanetGeneratorType[PlanetGeneratorType["Minimal"] = 4] = "Minimal";
})(PlanetGeneratorType || (PlanetGeneratorType = {}));
class PlanetGeneratorFactory {
    static Create(position, type, kPosMax, scene) {
        let name = "paulita-" + Math.floor(Math.random() * 1000).toString(16) + "-" + PlanetGeneratorFactory.Counter.toFixed(0);
        PlanetGeneratorFactory.Counter++;
        let seaLevelRatio = 0.6;
        if (type === PlanetGeneratorType.Minimal) {
            seaLevelRatio = 0;
        }
        let planet = new Planet(name, position, kPosMax, seaLevelRatio, scene, (p) => {
            if (type === PlanetGeneratorType.Moon) {
                return new PlanetGeneratorMoon(p);
            }
            else if (type === PlanetGeneratorType.Earth) {
                return new PlanetGeneratorEarth(p, 0.15);
            }
            else if (type === PlanetGeneratorType.Mars) {
                return new PlanetGeneratorMars(p, 0.1);
            }
            else if (type === PlanetGeneratorType.Cold) {
                return new PlanetGeneratorCold(p, 0.1);
            }
            else if (type === PlanetGeneratorType.Minimal) {
                return new PlanetGeneratorMinimal(p);
            }
            else {
                debugger;
            }
        });
        return planet;
    }
}
PlanetGeneratorFactory.Counter = 0;
class PlanetGenerator {
    constructor(planet) {
        this.planet = planet;
        this.type = "Unknown";
        this.elements = [];
    }
    getIntersectingElements(chunck) {
        let intersectingElements = [];
        for (let i = 0; i < this.elements.length; i++) {
            let e = this.elements[i];
            if (chunck.aabbMax.x < e.aabbMin.x) {
                continue;
            }
            if (chunck.aabbMax.y < e.aabbMin.y) {
                continue;
            }
            if (chunck.aabbMax.z < e.aabbMin.z) {
                continue;
            }
            if (chunck.aabbMin.x > e.aabbMax.x) {
                continue;
            }
            if (chunck.aabbMin.y > e.aabbMax.y) {
                continue;
            }
            if (chunck.aabbMin.z > e.aabbMax.z) {
                continue;
            }
            intersectingElements.push(e);
        }
        return intersectingElements;
    }
    showDebug() {
        for (let i = 0; i < this.heightMaps.length; i++) {
            let x = -3.5 + Math.floor(i / 3) * 7;
            if (i === 1) {
                x -= 1;
            }
            if (i === 4) {
                x += 1;
            }
            Utils.showDebugPlanetHeightMap(this.heightMaps[i], x, 1.5 - 1.5 * (i % 3));
        }
    }
}
/*
class PlanetGeneratorHole extends PlanetGenerator {

    private _mainHeightMap: PlanetHeightMap;
    private _sqrRadius: number = 0;

    constructor(planet: Planet, number, private _mountainHeight: number, private _holeWorldPosition: BABYLON.Vector3, private _holeRadius: number) {
        super(planet);
        this._mainHeightMap = PlanetHeightMap.CreateMap(planet.degree);
        this._sqrRadius = this._holeRadius * this._holeRadius;
    }

    public makeData(chunck: PlanetChunck, refData: number[][][]): void {
        let f = Math.pow(2, this._mainHeightMap.degree - chunck.degree);
        let seaLevel = Math.floor(this.planet.seaLevel * this.planet.kPosMax * PlanetTools.CHUNCKSIZE);

        for (let i: number = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            refData[i - chunck.firstI] = [];
            for (let j: number = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                refData[i - chunck.firstI][j - chunck.firstJ] = [];

                let v = this._mainHeightMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
                let altitude = Math.floor((this.planet.seaLevel + v * this._mountainHeight) * this.planet.kPosMax * PlanetTools.CHUNCKSIZE);

                for (let k: number = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    let globalK = k + chunck.kPos * PlanetTools.CHUNCKSIZE;
                    let worldPos = PlanetTools.LocalIJKToPlanetPosition(chunck, i, j, k, true);
                    let sqrDist = BABYLON.Vector3.DistanceSquared(this._holeWorldPosition, worldPos);
                    if (sqrDist < this._sqrRadius) {
                        refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.None;
                    }
                    else {
                        if (globalK <= altitude) {
                            if (globalK > altitude - 2) {
                                if (globalK < this.planet.seaLevel * (this.planet.kPosMax * PlanetTools.CHUNCKSIZE)) {
                                    refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Sand;
                                }
                                else {
                                    refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Grass;
                                }
                            }
                            else {
                                refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Rock;
                            }
                        }
                    }
    
                    if (refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] === BlockType.None && globalK < seaLevel * 0.5) {
                        refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Water;
                    }
                }
            }
        }
    }
}

class PlanetGeneratorDebug extends PlanetGenerator {

    constructor(planet: Planet) {
        super(planet);
    }

    public makeData(chunck: PlanetChunck, refData: number[][][], refProcedural: ProceduralTree[]): void {
        PlanetTools.Data(
            refData,
            (i, j, k) => {
                let iGlobal = i + chunck.iPos * PlanetTools.CHUNCKSIZE;
                let jGlobal = j + chunck.jPos * PlanetTools.CHUNCKSIZE;
                let kGlobal = k + chunck.kPos * PlanetTools.CHUNCKSIZE;

                let h = 25;
                if (chunck.side === Side.Front) {
                    h = 28;
                }
                if (jGlobal < 5) {
                    h = 30;
                }
                if (kGlobal < h) {
                    if (iGlobal < 5) {
                        return BlockType.Grass;
                    }
                    if (jGlobal < 5) {
                        return BlockType.Rock;
                    }
                    return BlockType.Sand;
                }
                return 0;
            }
        );
    }
}

class PlanetGeneratorDebug2 extends PlanetGenerator {

    constructor(planet: Planet) {
        super(planet);
    }

    public makeData(chunck: PlanetChunck, refData: number[][][], refProcedural: ProceduralTree[]): void {
        let c = Math.floor(Math.random() * 7 + 1)
        PlanetTools.Data(
            refData,
            (i, j, k) => {
                return c;
            }
        );
    }
}

class PlanetGeneratorDebug3 extends PlanetGenerator {

    constructor(planet: Planet) {
        super(planet);
    }

    public makeData(chunck: PlanetChunck, refData: number[][][], refProcedural: ProceduralTree[]): void {
        PlanetTools.Data(
            refData,
            (i, j, k) => {
                let c = Math.floor(Math.random() * 7 + 1)
                return c;
            }
        );
    }
}

class PlanetGeneratorDebug4 extends PlanetGenerator {

    constructor(planet: Planet) {
        super(planet);
    }

    public makeData(chunck: PlanetChunck, refData: number[][][], refProcedural: ProceduralTree[]): void {
        PlanetTools.Data(
            refData,
            (i, j, k) => {
                let iGlobal = i + chunck.iPos * PlanetTools.CHUNCKSIZE;
                let jGlobal = j + chunck.jPos * PlanetTools.CHUNCKSIZE;
                let kGlobal = k + chunck.kPos * PlanetTools.CHUNCKSIZE;

                let h = this.planet.kPosMax * PlanetTools.CHUNCKSIZE * 0.7 + 3 * Math.random();
                if (iGlobal === 0 || iGlobal === PlanetTools.DegreeToSize(chunck.degree) - 1) {
                    if (jGlobal === 0 || jGlobal === PlanetTools.DegreeToSize(chunck.degree) - 1) {
                        //h = this.planet.kPosMax * PlanetTools.CHUNCKSIZE * 0.7 + 4;
                    }
                }
                
                if (kGlobal < h) {
                    return BlockType.Rock;
                }
                return BlockType.None;
            }
        );
    }
}
*/ 
class PlanetGeneratorCold extends PlanetGenerator {
    constructor(planet, _mountainHeight) {
        super(planet);
        this._mountainHeight = _mountainHeight;
        //private _tunnelMap: PlanetHeightMap;
        //private _tunnelAltitudeMap: PlanetHeightMap;
        //private _rockMap: PlanetHeightMap;
        this.spheres = [];
        this.type = "Cold";
        let timers;
        let logOutput;
        let useLog = DebugDefine.LOG_PLANETMAP_PERFORMANCE;
        if (useLog) {
            timers = [];
            timers.push(performance.now());
            logOutput = "PlanetGeneratorCold constructor for " + planet.name;
        }
        this._mainHeightMap = PlanetHeightMap.CreateMap(planet.degree);
        if (useLog) {
            timers.push(performance.now());
            logOutput += "\n  _mainHeightMap created in " + (timers[timers.length - 1] - timers[timers.length - 2]).toFixed(0) + " ms";
        }
        /*
        this._tunnelMap = PlanetHeightMap.CreateMap(
            planet.degree,
            {
                firstNoiseDegree : planet.degree - 5,
                lastNoiseDegree: planet.degree - 1,
                postComputation: (v) => {
                    if (Math.abs(v) < 0.08) {
                        return 1;
                    }
                    return -1;
                }
            }
        );
        this._tunnelMap.smooth();
        this._tunnelMap.smooth();
        this._tunnelAltitudeMap = PlanetHeightMap.CreateMap(planet.degree);
        this._rockMap = PlanetHeightMap.CreateMap(planet.degree, { firstNoiseDegree : planet.degree - 3});
        */
        this.altitudeMap = PlanetHeightMap.CreateConstantMap(planet.degree, 0).addInPlace(this._mainHeightMap).multiplyInPlace(_mountainHeight).addInPlace(PlanetHeightMap.CreateConstantMap(planet.degree, this.planet.seaLevelRatio));
        this.altitudeMap.maxInPlace(PlanetHeightMap.CreateConstantMap(planet.degree, this.planet.seaLevelRatio));
        if (useLog) {
            timers.push(performance.now());
            logOutput += "\n  altitudeMap created in " + (timers[timers.length - 1] - timers[timers.length - 2]).toFixed(0) + " ms";
            console.log(logOutput);
        }
        for (let i = 0; i < 50; i++) {
            let p = new BABYLON.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
            p.normalize();
            let up = p.clone();
            let forward = new BABYLON.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
            forward.normalize();
            let side = PlanetTools.PlanetPositionToSide(p);
            let ij = PlanetTools.PlanetDirectionToGlobalIJ(side, PlanetTools.DegreeToSize(planet.degree), p);
            let kGlobal = Math.floor(this.altitudeMap.getForSide(side, ij.i, ij.j) * PlanetTools.CHUNCKSIZE * this.planet.kPosMax);
            let pBase = p.scale(PlanetTools.KGlobalToAltitude(kGlobal));
            p.scaleInPlace(PlanetTools.KGlobalToAltitude(kGlobal + 7));
            let w = 2 + 6 * Math.random();
            let h = 1.5 + 3 * Math.random();
            let d = 2 + 6 * Math.random();
            this.elements.push(new GeneratorBox(BlockType.Ice, pBase, up, forward, w, h, d));
        }
        if (useLog) {
            timers.push(performance.now());
            logOutput += "\n  cubes created in " + (timers[timers.length - 1] - timers[timers.length - 2]).toFixed(0) + " ms";
        }
        if (useLog) {
            logOutput += "\nPlanetGeneratorCold constructed in " + (timers[timers.length - 1] - timers[0]).toFixed(0) + " ms";
        }
    }
    getTexture(side, size) {
        let timers;
        let logOutput;
        let useLog = DebugDefine.LOG_PLANETMAP_PERFORMANCE;
        if (useLog) {
            timers = [];
            timers.push(performance.now());
            logOutput = "PlanetGeneratorCold getTexture for " + this.planet.name;
        }
        let texture = new BABYLON.DynamicTexture("texture-" + side, size);
        let context = texture.getContext();
        let f = Math.pow(2, this._mainHeightMap.degree) / size;
        let mainMaterial = SharedMaterials.MainMaterial();
        context.fillStyle = mainMaterial.getFillStyle(BlockType.Water);
        context.fillRect(0, 0, size, size);
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                let v = Math.floor(this.altitudeMap.getForSide(side, Math.floor(i * f), Math.floor(j * f)) * PlanetTools.CHUNCKSIZE * this.planet.kPosMax);
                let blockType = BlockType.None;
                if (v === this.planet.seaLevel + 1) {
                    blockType = BlockType.Rock;
                }
                else if (v > this.planet.seaLevel + 1) {
                    blockType = BlockType.Snow;
                }
                if (blockType != BlockType.None) {
                    context.fillStyle = mainMaterial.getFillStyle(blockType);
                    context.fillRect(i, j, 1, 1);
                }
            }
        }
        if (useLog) {
            timers.push(performance.now());
            logOutput += "\n context filled in " + (timers[timers.length - 1] - timers[timers.length - 2]).toFixed(0) + " ms";
        }
        texture.update(false);
        if (useLog) {
            timers.push(performance.now());
            logOutput += "\n  texture updated in " + (timers[timers.length - 1] - timers[timers.length - 2]).toFixed(0) + " ms";
            logOutput += "\nPlanetGeneratorCold getTexture completed in " + (timers[timers.length - 1] - timers[0]).toFixed(0) + " ms";
            console.log(logOutput);
        }
        return texture;
    }
    makeData(chunck, refData, refProcedural) {
        let f = Math.pow(2, this._mainHeightMap.degree - chunck.degree);
        let intersectingElements = this.getIntersectingElements(chunck);
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            refData[i - chunck.firstI] = [];
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                refData[i - chunck.firstI][j - chunck.firstJ] = [];
                let v = this._mainHeightMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
                let altitude = this.planet.seaLevel + Math.floor((v * this._mountainHeight) * this.planet.kPosMax * PlanetTools.CHUNCKSIZE);
                //let rock = this._rockMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
                //let rockAltitude = altitude + Math.round((rock - 0.4) * this._mountainHeight * this.planet.kPosMax * PlanetTools.CHUNCKSIZE);
                //let tree = this._treeMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f) * 4;
                //let tunnel = Math.floor(this._tunnelMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f) * 5);
                //let tunnelV = this._tunnelAltitudeMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
                //let tunnelAltitude = this.planet.seaLevel + Math.floor((2 * tunnelV * this._mountainHeight) * this.planet.kPosMax * PlanetTools.CHUNCKSIZE);
                /*
                if (tree > 0.7 && treeCount < maxTree) {
                    let localK = altitude + 1 - chunck.kPos * PlanetTools.CHUNCKSIZE;
                    let globalK = localK + chunck.kPos * PlanetTools.CHUNCKSIZE;
                    if (globalK > seaLevel) {
                        if (localK >= 0 && localK < PlanetTools.CHUNCKSIZE) {
                            let tree = new ProceduralTree(chunck.chunckManager);
                            tree.chunck = chunck;
                            tree.i = i;
                            tree.j = j;
                            tree.k = localK;
                            refProcedural.push(tree);
                            treeCount++;
                        }
                    }
                }
                */
                for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    let globalK = k + chunck.kPos * PlanetTools.CHUNCKSIZE;
                    if (globalK <= this.planet.seaLevel) {
                        refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Water;
                    }
                    if (intersectingElements.length > 0) {
                        let pPos = PlanetTools.LocalIJKToPlanetPosition(chunck, i, j, k, true);
                        for (let n = 0; n < intersectingElements.length; n++) {
                            let sV = intersectingElements[n].getData(pPos);
                            if (sV != BlockType.Unknown) {
                                refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = sV;
                            }
                        }
                    }
                    if (globalK <= altitude) {
                        if (globalK > altitude - 2) {
                            if (globalK <= this.planet.seaLevel) {
                                refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Rock;
                            }
                            else {
                                refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Snow;
                            }
                        }
                        else {
                            refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Rock;
                        }
                    }
                    /*
                    else if (globalK <= rockAltitude) {
                        refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Rock;
                    }
                    if (tunnel > 0) {
                        if (globalK >= tunnelAltitude - tunnel && globalK <= tunnelAltitude + tunnel) {
                            refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.None;
                        }
                    }
                    */
                    /*
                    if (tree > 0 && globalK > this.planet.seaLevel) {
                        if (globalK > altitude + 4 && globalK <= altitude + 4 + tree) {
                            refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Leaf;
                        }
                        else if (tree > 3.9 && globalK > altitude && globalK <= altitude + 4) {
                            refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Wood;
                        }
                    }
                    */
                    if (refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] === BlockType.None && globalK <= this.planet.seaLevel) {
                        refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Water;
                    }
                }
            }
        }
    }
    showDebug() {
        Utils.showDebugPlanetMap(this, -3.5, 1.5);
    }
}
class PlanetGeneratorEarth extends PlanetGenerator {
    constructor(planet, _mountainHeight) {
        super(planet);
        this._mountainHeight = _mountainHeight;
        this.spheres = [];
        this.type = "Sunny";
        let timers;
        let logOutput;
        let useLog = DebugDefine.LOG_PLANETMAP_PERFORMANCE;
        if (useLog) {
            timers = [];
            timers.push(performance.now());
            logOutput = "PlanetGeneratorEarth constructor for " + planet.name;
        }
        this._mainHeightMap = PlanetHeightMap.CreateMap(planet.degree);
        if (useLog) {
            timers.push(performance.now());
            logOutput += "\n  _mainHeightMap created in " + (timers[timers.length - 1] - timers[timers.length - 2]).toFixed(0) + " ms";
        }
        this._mainHeightMap.addInPlace(PlanetHeightMap.CreateConstantMap(planet.degree, 1 / planet.kPosMax));
        this._tunnelMap = PlanetHeightMap.CreateMap(planet.degree, {
            firstNoiseDegree: planet.degree - 5,
            lastNoiseDegree: planet.degree - 1,
            postComputation: (v) => {
                if (Math.abs(v) < 0.08) {
                    return 1;
                }
                return -1;
            }
        });
        this._tunnelMap.smooth();
        this._tunnelMap.smooth();
        this._tunnelAltitudeMap = PlanetHeightMap.CreateMap(planet.degree);
        this._rockMap = PlanetHeightMap.CreateMap(planet.degree, { firstNoiseDegree: planet.degree - 3 });
        this.altitudeMap = PlanetHeightMap.CreateConstantMap(planet.degree, 0).addInPlace(this._mainHeightMap).multiplyInPlace(_mountainHeight).addInPlace(PlanetHeightMap.CreateConstantMap(planet.degree, this.planet.seaLevelRatio));
        this.altitudeMap.maxInPlace(PlanetHeightMap.CreateConstantMap(planet.degree, this.planet.seaLevelRatio));
        if (useLog) {
            timers.push(performance.now());
            logOutput += "\n  altitudeMap created in " + (timers[timers.length - 1] - timers[timers.length - 2]).toFixed(0) + " ms";
        }
        for (let i = 0; i < 100; i++) {
            let p = new BABYLON.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
            p.normalize();
            let side = PlanetTools.PlanetPositionToSide(p);
            let ij = PlanetTools.PlanetDirectionToGlobalIJ(side, PlanetTools.DegreeToSize(planet.degree), p);
            let kGlobal = Math.floor(this.altitudeMap.getForSide(side, ij.i, ij.j) * PlanetTools.CHUNCKSIZE * this.planet.kPosMax);
            if (kGlobal > planet.seaLevel + 1) {
                let pBase = p.scale(PlanetTools.KGlobalToAltitude(kGlobal));
                p.scaleInPlace(PlanetTools.KGlobalToAltitude(kGlobal + 7));
                this.elements.push(new GeneratorSphere(BlockType.Leaf, p, 3));
                this.elements.push(new GeneratorSegment(BlockType.Wood, pBase, p, 1));
                //BABYLON.MeshBuilder.CreateLines("line", { points: [p, pBase]});
            }
        }
        if (useLog) {
            timers.push(performance.now());
            logOutput += "\n  segments and spheres created in " + (timers[timers.length - 1] - timers[timers.length - 2]).toFixed(0) + " ms";
            logOutput += "\nPlanetGeneratorEarth constructed in " + (timers[timers.length - 1] - timers[0]).toFixed(0) + " ms";
            console.log(logOutput);
        }
    }
    getTexture(side, size) {
        let timers;
        let logOutput;
        let useLog = DebugDefine.LOG_PLANETMAP_PERFORMANCE;
        if (useLog) {
            timers = [];
            timers.push(performance.now());
            logOutput = "PlanetGeneratorEarth getTexture for " + this.planet.name;
        }
        let texture = new BABYLON.DynamicTexture("texture-" + side, size);
        let context = texture.getContext();
        let f = Math.pow(2, this._mainHeightMap.degree) / size;
        let mainMaterial = SharedMaterials.MainMaterial();
        context.fillStyle = mainMaterial.getFillStyle(BlockType.Water);
        context.fillRect(0, 0, size, size);
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                let v = Math.floor(this.altitudeMap.getForSide(side, Math.floor(i * f), Math.floor(j * f)) * PlanetTools.CHUNCKSIZE * this.planet.kPosMax);
                let blockType = BlockType.None;
                if (v === this.planet.seaLevel + 1) {
                    blockType = BlockType.Sand;
                }
                else if (v > this.planet.seaLevel + 1) {
                    blockType = BlockType.Grass;
                }
                if (blockType != BlockType.None) {
                    context.fillStyle = mainMaterial.getFillStyle(blockType);
                    context.fillRect(i, j, 1, 1);
                }
            }
        }
        if (useLog) {
            timers.push(performance.now());
            logOutput += "\n  context filled in " + (timers[timers.length - 1] - timers[timers.length - 2]).toFixed(0) + " ms";
        }
        texture.update(false);
        if (useLog) {
            timers.push(performance.now());
            logOutput += "\n  texture updated in " + (timers[timers.length - 1] - timers[timers.length - 2]).toFixed(0) + " ms";
            logOutput += "\nPlanetGeneratorEarth getTexture completed in " + (timers[timers.length - 1] - timers[0]).toFixed(0) + " ms";
            console.log(logOutput);
        }
        return texture;
    }
    makeData(chunck, refData, refProcedural) {
        let f = Math.pow(2, this._mainHeightMap.degree - chunck.degree);
        let intersectingElements = this.getIntersectingElements(chunck);
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            //let globalI = i + chunck.iPos * PlanetTools.CHUNCKSIZE;
            refData[i - chunck.firstI] = [];
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                refData[i - chunck.firstI][j - chunck.firstJ] = [];
                let v = this._mainHeightMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
                let altitude = this.planet.seaLevel + Math.floor((v * this._mountainHeight) * this.planet.kPosMax * PlanetTools.CHUNCKSIZE);
                let rock = this._rockMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
                let rockAltitude = altitude + Math.round((rock - 0.4) * this._mountainHeight * this.planet.kPosMax * PlanetTools.CHUNCKSIZE);
                //let tree = this._treeMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f) * 4;
                let tunnel = Math.floor(this._tunnelMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f) * 3);
                let tunnelV = this._tunnelAltitudeMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
                let tunnelAltitude = this.planet.seaLevel + Math.floor((2 * tunnelV * this._mountainHeight) * this.planet.kPosMax * PlanetTools.CHUNCKSIZE);
                /*
                if (tree > 0.7 && treeCount < maxTree) {
                    let localK = altitude + 1 - chunck.kPos * PlanetTools.CHUNCKSIZE;
                    let globalK = localK + chunck.kPos * PlanetTools.CHUNCKSIZE;
                    if (globalK > seaLevel) {
                        if (localK >= 0 && localK < PlanetTools.CHUNCKSIZE) {
                            let tree = new ProceduralTree(chunck.chunckManager);
                            tree.chunck = chunck;
                            tree.i = i;
                            tree.j = j;
                            tree.k = localK;
                            refProcedural.push(tree);
                            treeCount++;
                        }
                    }
                }
                */
                //let globalJ = j + chunck.jPos * PlanetTools.CHUNCKSIZE;
                //let latitude = PlanetTools.GlobalIJToLatitude(chunck.planetSide, chunck.size, globalI, globalJ);
                for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    let globalK = k + chunck.kPos * PlanetTools.CHUNCKSIZE;
                    if (globalK <= this.planet.seaLevel) {
                        refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Water;
                    }
                    if (globalK <= altitude) {
                        if (globalK > altitude - 2) {
                            if (globalK <= this.planet.seaLevel) {
                                refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Sand;
                            }
                            else {
                                refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Grass;
                            }
                        }
                        else {
                            refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Rock;
                        }
                    }
                    else if (globalK <= rockAltitude) {
                        refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Rock;
                    }
                    if (tunnel > 0) {
                        if (globalK >= tunnelAltitude - tunnel && globalK <= tunnelAltitude + tunnel) {
                            refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.None;
                        }
                    }
                    /*
                    if (tree > 0 && globalK > this.planet.seaLevel) {
                        if (globalK > altitude + 4 && globalK <= altitude + 4 + tree) {
                            refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Leaf;
                        }
                        else if (tree > 3.9 && globalK > altitude && globalK <= altitude + 4) {
                            refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Wood;
                        }
                    }
                    */
                    if (intersectingElements.length > 0) {
                        let pPos = PlanetTools.LocalIJKToPlanetPosition(chunck, i, j, k, true);
                        for (let n = 0; n < intersectingElements.length; n++) {
                            let sV = intersectingElements[n].getData(pPos);
                            if (sV != BlockType.Unknown) {
                                refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = sV;
                            }
                        }
                    }
                    if (refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] === BlockType.None && globalK <= this.planet.seaLevel) {
                        refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Water;
                    }
                }
            }
        }
    }
    showDebug() {
        Utils.showDebugPlanetMap(this, -3.5, 1.5);
    }
}
/// <reference path="PlanetGenerator.ts"/>
class PlanetGeneratorMars extends PlanetGenerator {
    constructor(planet, _mountainHeight) {
        super(planet);
        this._mountainHeight = _mountainHeight;
        this.type = "Red";
        this._mainHeightMap = PlanetHeightMap.CreateMap(planet.degree);
        this._rockMap = PlanetHeightMap.CreateMap(planet.degree, { firstNoiseDegree: planet.degree - 3 });
        this.altitudeMap = PlanetHeightMap.CreateConstantMap(planet.degree, 0).addInPlace(this._mainHeightMap).multiplyInPlace(_mountainHeight).addInPlace(PlanetHeightMap.CreateConstantMap(planet.degree, this.planet.seaLevelRatio));
    }
    getTexture(side, size) {
        let timers;
        let logOutput;
        let useLog = DebugDefine.LOG_PLANETMAP_PERFORMANCE;
        if (useLog) {
            timers = [];
            timers.push(performance.now());
            logOutput = "PlanetGeneratorMars getTexture for " + this.planet.name;
        }
        let texture = new BABYLON.DynamicTexture("texture-" + side, size);
        let context = texture.getContext();
        let f = Math.pow(2, this._mainHeightMap.degree) / size;
        let mainMaterial = SharedMaterials.MainMaterial();
        context.fillStyle = mainMaterial.getFillStyle(BlockType.Laterite);
        context.fillRect(0, 0, size, size);
        /*
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                let v = Math.floor(this.altitudeMap.getForSide(side, Math.floor(i * f), Math.floor(j * f)) * PlanetTools.CHUNCKSIZE * this.planet.kPosMax);
                let blockType: BlockType = BlockType.None;
                
                if (blockType != BlockType.None) {
                    context.fillStyle = mainMaterial.getFillStyle(blockType);
                    context.fillRect(i, j, 1, 1);
                }
            }
        }
        */
        if (useLog) {
            timers.push(performance.now());
            logOutput += "\n context filled in " + (timers[timers.length - 1] - timers[timers.length - 2]).toFixed(0) + " ms";
        }
        texture.update(false);
        if (useLog) {
            timers.push(performance.now());
            logOutput += "\n  texture updated in " + (timers[timers.length - 1] - timers[timers.length - 2]).toFixed(0) + " ms";
            logOutput += "\nPlanetGeneratorMars getTexture completed in " + (timers[timers.length - 1] - timers[0]).toFixed(0) + " ms";
            console.log(logOutput);
        }
        return texture;
    }
    makeData(chunck, refData, refProcedural) {
        let f = Math.pow(2, this._mainHeightMap.degree - chunck.degree);
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            refData[i - chunck.firstI] = [];
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                refData[i - chunck.firstI][j - chunck.firstJ] = [];
                let v = this._mainHeightMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
                let altitude = this.planet.seaLevel + Math.floor((v * this._mountainHeight) * this.planet.kPosMax * PlanetTools.CHUNCKSIZE);
                let rock = this._rockMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
                let rockAltitude = altitude + Math.round((rock - 0.4) * this._mountainHeight * this.planet.kPosMax * PlanetTools.CHUNCKSIZE);
                for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    let globalK = k + chunck.kPos * PlanetTools.CHUNCKSIZE;
                    if (globalK <= altitude) {
                        if (globalK > altitude - 2) {
                            refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Laterite;
                        }
                        else {
                            refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Rock;
                        }
                    }
                    else if (globalK <= rockAltitude) {
                        refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Rock;
                    }
                }
            }
        }
    }
    showDebug() {
        Utils.showDebugPlanetMap(this, -3.5, 1.5);
    }
}
class PlanetGeneratorMinimal extends PlanetGenerator {
    constructor(planet) {
        super(planet);
        this.altitudeMap = PlanetHeightMap.CreateConstantMap(planet.degree, 0);
    }
    getTexture(side, size) {
        let timers;
        let logOutput;
        let useLog = DebugDefine.LOG_PLANETMAP_PERFORMANCE;
        if (useLog) {
            timers = [];
            timers.push(performance.now());
            logOutput = "PlanetGeneratorMoon getTexture for " + this.planet.name;
        }
        let texture = new BABYLON.DynamicTexture("texture-" + side, size);
        let context = texture.getContext();
        //let f = Math.pow(2, this._mainHeightMap.degree) / size;
        let mainMaterial = SharedMaterials.MainMaterial();
        context.fillStyle = mainMaterial.getFillStyle(BlockType.Rock);
        context.fillRect(0, 0, size, size);
        /*
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                let v = Math.floor(this.altitudeMap.getForSide(side, Math.floor(i * f), Math.floor(j * f)) * PlanetTools.CHUNCKSIZE * this.planet.kPosMax);
                let blockType: BlockType = BlockType.None;
                
                if (blockType != BlockType.None) {
                    context.fillStyle = mainMaterial.getFillStyle(blockType);
                    context.fillRect(i, j, 1, 1);
                }
            }
        }
        */
        if (useLog) {
            timers.push(performance.now());
            logOutput += "\n context filled in " + (timers[timers.length - 1] - timers[timers.length - 2]).toFixed(0) + " ms";
        }
        texture.update(false);
        if (useLog) {
            timers.push(performance.now());
            logOutput += "\n  texture updated in " + (timers[timers.length - 1] - timers[timers.length - 2]).toFixed(0) + " ms";
            logOutput += "\nPlanetGeneratorMoon getTexture completed in " + (timers[timers.length - 1] - timers[0]).toFixed(0) + " ms";
            console.log(logOutput);
        }
        return texture;
    }
    makeData(chunck, refData, refProcedural) {
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            refData[i - chunck.firstI] = [];
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                refData[i - chunck.firstI][j - chunck.firstJ] = [];
                for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    let globalI = i + chunck.iPos * PlanetTools.CHUNCKSIZE;
                    let globalJ = j + chunck.jPos * PlanetTools.CHUNCKSIZE;
                    let globalK = k + chunck.kPos * PlanetTools.CHUNCKSIZE;
                    if ((globalI === 1 && globalJ === 1) || globalK <= 0) {
                        refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Rock;
                    }
                    if (globalI > 0 && globalI <= 5 && globalJ > 0 && globalJ <= 5 && globalK % PlanetTools.CHUNCKSIZE === (PlanetTools.CHUNCKSIZE - 1)) {
                        refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Rock;
                    }
                }
            }
        }
    }
}
class PlanetGeneratorMoon extends PlanetGenerator {
    constructor(planet) {
        super(planet);
        this.type = "Moon";
        this.altitudeMap = PlanetHeightMap.CreateConstantMap(planet.degree, this.planet.seaLevelRatio);
        this._moutainHeightMap = PlanetHeightMap.CreateMap(planet.degree).multiplyInPlace(4 / (this.planet.kPosMax * PlanetTools.CHUNCKSIZE));
        this._craterMap = PlanetHeightMap.CreateConstantMap(planet.degree, 0);
        for (let i = 0; i < 200; i++) {
            this._craterMap.setRandomDisc(3 / (this.planet.kPosMax * PlanetTools.CHUNCKSIZE), 2, 4);
        }
        this._craterMap.smooth();
        this._craterMap.smooth();
        this._iceMap = PlanetHeightMap.CreateMap(planet.degree, {
            firstNoiseDegree: planet.degree - 5,
            lastNoiseDegree: planet.degree - 1,
            postComputation: (v) => {
                if (Math.abs(v) < 0.08) {
                    return 1;
                }
                return -1;
            }
        });
        this._iceMap.smooth();
        this._iceMap.smooth();
        this.altitudeMap.addInPlace(this._moutainHeightMap).substractInPlace(this._craterMap);
        let center = Math.floor(this._iceMap.size * 0.5);
        for (let i = -3; i <= 3; i++) {
            for (let j = -3; j <= 3; j++) {
                this.altitudeMap.setValue(this.planet.seaLevelRatio, center + i, this.altitudeMap.size, center + j);
                this._iceMap.setValue(-1, center + i, this._iceMap.size, center + j);
            }
        }
    }
    getTexture(side, size) {
        let timers;
        let logOutput;
        let useLog = DebugDefine.LOG_PLANETMAP_PERFORMANCE;
        if (useLog) {
            timers = [];
            timers.push(performance.now());
            logOutput = "PlanetGeneratorMoon getTexture for " + this.planet.name;
        }
        let texture = new BABYLON.DynamicTexture("texture-" + side, size);
        let context = texture.getContext();
        let f = Math.pow(2, this.altitudeMap.degree) / size;
        let mainMaterial = SharedMaterials.MainMaterial();
        context.fillStyle = mainMaterial.getFillStyle(BlockType.Regolith);
        context.fillRect(0, 0, size, size);
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                let ice = this._iceMap.getForSide(side, Math.floor(i * f), Math.floor(j * f));
                let blockType = BlockType.None;
                if (ice > 0) {
                    blockType = BlockType.Ice;
                }
                if (blockType != BlockType.None) {
                    context.fillStyle = mainMaterial.getFillStyle(blockType);
                    context.fillRect(i, j, 1, 1);
                }
            }
        }
        if (useLog) {
            timers.push(performance.now());
            logOutput += "\n context filled in " + (timers[timers.length - 1] - timers[timers.length - 2]).toFixed(0) + " ms";
        }
        texture.update(false);
        if (useLog) {
            timers.push(performance.now());
            logOutput += "\n  texture updated in " + (timers[timers.length - 1] - timers[timers.length - 2]).toFixed(0) + " ms";
            logOutput += "\nPlanetGeneratorMoon getTexture completed in " + (timers[timers.length - 1] - timers[0]).toFixed(0) + " ms";
            console.log(logOutput);
        }
        return texture;
    }
    makeData(chunck, refData, refProcedural) {
        let f = Math.pow(2, this._craterMap.degree - chunck.degree);
        let intersectingElements = this.getIntersectingElements(chunck);
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            refData[i - chunck.firstI] = [];
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                let altitude = this.altitudeMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f) * (this.planet.kPosMax * PlanetTools.CHUNCKSIZE);
                let ice = Math.floor(this._iceMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f));
                refData[i - chunck.firstI][j - chunck.firstJ] = [];
                //let altitude = this.planet.seaLevel;
                for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    let globalK = k + chunck.kPos * PlanetTools.CHUNCKSIZE;
                    if (globalK <= altitude) {
                        if (ice < 0) {
                            refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Regolith;
                        }
                        else {
                            if (globalK <= altitude - 4) {
                                refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Regolith;
                            }
                            else if (globalK <= altitude - 2) {
                                refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Ice;
                            }
                        }
                    }
                    if (intersectingElements.length > 0) {
                        let pPos = PlanetTools.LocalIJKToPlanetPosition(chunck, i, j, k, true);
                        for (let n = 0; n < intersectingElements.length; n++) {
                            let sV = intersectingElements[n].getData(pPos);
                            if (sV != BlockType.Unknown) {
                                refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = sV;
                            }
                        }
                    }
                }
            }
        }
    }
}
class PlanetHeightMap {
    constructor(degree) {
        this.degree = degree;
        this.i0s = [];
        this.iNs = [];
        this.j0s = [];
        this.jNs = [];
        this.k0s = [];
        this.kNs = [];
        this.values = [this.i0s, this.iNs, this.j0s, this.jNs, this.k0s, this.kNs];
        this.size = Math.pow(2, this.degree);
        for (let n = 0; n < 6; n++) {
            let face = this.values[n];
            for (let i = 0; i <= this.size; i++) {
                face[i] = [];
            }
        }
    }
    static CreateConstantMap(degree, value) {
        let constantMap = new PlanetHeightMap(degree);
        constantMap.enumerate((i, j, k) => {
            constantMap.setValue(value, i, j, k);
        });
        return constantMap;
    }
    static CreateMap(degree, options) {
        let map = new PlanetHeightMap(0);
        let firstNoiseDegree = 1;
        if (options && isFinite(options.firstNoiseDegree)) {
            firstNoiseDegree = options.firstNoiseDegree;
        }
        let lastNoiseDegree = degree;
        if (options && isFinite(options.lastNoiseDegree)) {
            lastNoiseDegree = options.lastNoiseDegree;
        }
        map.enumerate((i, j, k) => {
            map.setValue(0, i, j, k);
        });
        let noise = 1;
        while (map.degree < degree) {
            map = map.scale2();
            if (map.degree >= firstNoiseDegree && map.degree < lastNoiseDegree) {
                noise = noise * 0.5;
                map.noise(noise);
            }
        }
        if (options && options.postComputation) {
            map.enumerate((i, j, k) => {
                let v = map.getValue(i, j, k);
                map.setValue(options.postComputation(v), i, j, k);
            });
        }
        return map;
    }
    noise(range) {
        this.enumerate((i, j, k) => {
            let v = this.getValue(i, j, k);
            v += (Math.random() * 2 - 1) * range;
            this.setValue(v, i, j, k);
        });
    }
    setRandomDisc(v, rMin, rMax, shadow = 0) {
        let i = Math.random();
        let j = Math.random();
        let k = Math.random();
        if (i >= j && i >= k) {
            i = 1;
        }
        else if (j >= i && j >= k) {
            j = 1;
        }
        else if (k >= i && k >= j) {
            k = 1;
        }
        if (Math.random() > 0.5) {
            i = -i;
        }
        if (Math.random() > 0.5) {
            j = -j;
        }
        if (Math.random() > 0.5) {
            k = -k;
        }
        i = 0.5 - 0.5 * i;
        j = 0.5 - 0.5 * j;
        k = 0.5 - 0.5 * k;
        i = Math.round(i * this.size);
        j = Math.round(j * this.size);
        k = Math.round(k * this.size);
        let r = (rMax - rMin) * Math.random() + rMin;
        for (let n = shadow; n > 0; n--) {
            let vv = v * (1 - n / (shadow + 1));
            this.fillDisc(vv, i, j, k, r + n);
        }
        this.fillDisc(v, i, j, k, r);
    }
    smooth() {
        let copy = this.clone();
        for (let i = 0; i <= this.size; i++) {
            for (let j = 0; j <= this.size; j++) {
                for (let k = 0; k <= this.size; k++) {
                    if (this.isValid(i, j, k)) {
                        let value = 0;
                        let count = 0;
                        for (let ii = -1; ii <= 1; ii++) {
                            for (let jj = -1; jj <= 1; jj++) {
                                for (let kk = -1; kk <= 1; kk++) {
                                    let I = i + ii;
                                    let J = j + jj;
                                    let K = k + kk;
                                    if (this.isValid(I, J, K)) {
                                        value += copy.getValue(I, J, K);
                                        count++;
                                    }
                                }
                            }
                        }
                        this.setValue(value / count, i, j, k);
                    }
                }
            }
        }
    }
    clone() {
        let newMap = new PlanetHeightMap(this.degree);
        this.enumerate((i, j, k) => {
            newMap.setValue(this.getValue(i, j, k), i, j, k);
        });
        return newMap;
    }
    addInPlace(other) {
        if (other.degree = this.degree) {
            this.enumerate((i, j, k) => {
                let v = this.getValue(i, j, k);
                v += other.getValue(i, j, k);
                this.setValue(v, i, j, k);
            });
        }
        return this;
    }
    substractInPlace(other) {
        if (other.degree = this.degree) {
            this.enumerate((i, j, k) => {
                let v = this.getValue(i, j, k);
                v -= other.getValue(i, j, k);
                this.setValue(v, i, j, k);
            });
        }
        return this;
    }
    multiplyInPlace(value) {
        this.enumerate((i, j, k) => {
            let v = this.getValue(i, j, k);
            v *= value;
            this.setValue(v, i, j, k);
        });
        return this;
    }
    minInPlace(other) {
        if (other.degree = this.degree) {
            this.enumerate((i, j, k) => {
                let v = Math.min(this.getValue(i, j, k), other.getValue(i, j, k));
                this.setValue(v, i, j, k);
            });
        }
        return this;
    }
    maxInPlace(other) {
        if (other.degree = this.degree) {
            this.enumerate((i, j, k) => {
                let v = Math.max(this.getValue(i, j, k), other.getValue(i, j, k));
                this.setValue(v, i, j, k);
            });
        }
        return this;
    }
    scale2() {
        let scaledMap = new PlanetHeightMap(this.degree + 1);
        this.enumerate((i, j, k) => {
            if (this.isValid(i, j, k)) {
                let v = this.getValue(i, j, k);
                scaledMap.setValue(v, 2 * i, 2 * j, 2 * k);
            }
        });
        this.enumerate((i, j, k) => {
            if (scaledMap.isValid(2 * i + 1, 2 * j, 2 * k)) {
                let v1 = scaledMap.getValue(2 * i, 2 * j, 2 * k);
                let v2 = scaledMap.getValue(2 * i + 2, 2 * j, 2 * k);
                if (isFinite(v1) && isFinite(v2)) {
                    scaledMap.setValue((v1 + v2) * 0.5, 2 * i + 1, 2 * j, 2 * k);
                }
            }
            if (scaledMap.isValid(2 * i, 2 * j + 1, 2 * k)) {
                let v1 = scaledMap.getValue(2 * i, 2 * j, 2 * k);
                let v2 = scaledMap.getValue(2 * i, 2 * j + 2, 2 * k);
                if (isFinite(v1) && isFinite(v2)) {
                    scaledMap.setValue((v1 + v2) * 0.5, 2 * i, 2 * j + 1, 2 * k);
                }
            }
            if (scaledMap.isValid(2 * i, 2 * j, 2 * k + 1)) {
                let v1 = scaledMap.getValue(2 * i, 2 * j, 2 * k);
                let v2 = scaledMap.getValue(2 * i, 2 * j, 2 * k + 2);
                if (isFinite(v1) && isFinite(v2)) {
                    scaledMap.setValue((v1 + v2) * 0.5, 2 * i, 2 * j, 2 * k + 1);
                }
            }
        });
        this.enumerate((i, j, k) => {
            if (scaledMap.isValid(2 * i + 1, 2 * j + 1, 2 * k)) {
                let v1 = scaledMap.getValue(2 * i, 2 * j + 1, 2 * k);
                let v2 = scaledMap.getValue(2 * i + 2, 2 * j + 1, 2 * k);
                let v3 = scaledMap.getValue(2 * i + 1, 2 * j + 2, 2 * k);
                let v4 = scaledMap.getValue(2 * i + 1, 2 * j, 2 * k);
                let c = 0;
                let v = 0;
                if (isFinite(v1)) {
                    c++;
                    v += v1;
                }
                if (isFinite(v2)) {
                    c++;
                    v += v2;
                }
                if (isFinite(v3)) {
                    c++;
                    v += v3;
                }
                if (isFinite(v4)) {
                    c++;
                    v += v4;
                }
                v /= c;
                if (isNaN(v)) {
                    debugger;
                }
                scaledMap.setValue(v, 2 * i + 1, 2 * j + 1, 2 * k);
            }
            if (scaledMap.isValid(2 * i + 1, 2 * j, 2 * k + 1)) {
                let v1 = scaledMap.getValue(2 * i, 2 * j, 2 * k + 1);
                let v2 = scaledMap.getValue(2 * i + 2, 2 * j, 2 * k + 1);
                let v3 = scaledMap.getValue(2 * i + 1, 2 * j, 2 * k);
                let v4 = scaledMap.getValue(2 * i + 1, 2 * j, 2 * k + 2);
                let c = 0;
                let v = 0;
                if (isFinite(v1)) {
                    c++;
                    v += v1;
                }
                if (isFinite(v2)) {
                    c++;
                    v += v2;
                }
                if (isFinite(v3)) {
                    c++;
                    v += v3;
                }
                if (isFinite(v4)) {
                    c++;
                    v += v4;
                }
                v /= c;
                if (isNaN(v)) {
                    debugger;
                }
                scaledMap.setValue(v, 2 * i + 1, 2 * j, 2 * k + 1);
            }
            if (scaledMap.isValid(2 * i, 2 * j + 1, 2 * k + 1)) {
                let v1 = scaledMap.getValue(2 * i, 2 * j, 2 * k + 1);
                let v2 = scaledMap.getValue(2 * i, 2 * j + 2, 2 * k + 1);
                let v3 = scaledMap.getValue(2 * i, 2 * j + 1, 2 * k);
                let v4 = scaledMap.getValue(2 * i, 2 * j + 1, 2 * k + 2);
                let c = 0;
                let v = 0;
                if (isFinite(v1)) {
                    c++;
                    v += v1;
                }
                if (isFinite(v2)) {
                    c++;
                    v += v2;
                }
                if (isFinite(v3)) {
                    c++;
                    v += v3;
                }
                if (isFinite(v4)) {
                    c++;
                    v += v4;
                }
                v /= c;
                if (isNaN(v)) {
                    debugger;
                }
                scaledMap.setValue(v, 2 * i, 2 * j + 1, 2 * k + 1);
            }
        });
        if (!scaledMap.sanityCheck()) {
            debugger;
        }
        return scaledMap;
    }
    isValid(i, j, k) {
        return (i === 0 || j === 0 || k === 0 || i === this.size || j === this.size || k === this.size) && (i >= 0 && j >= 0 && k >= 0 && i <= this.size && j <= this.size && k <= this.size);
    }
    sanityCheck() {
        for (let i = 0; i <= this.size; i++) {
            for (let j = 0; j <= this.size; j++) {
                for (let k = 0; k <= this.size; k++) {
                    if (this.isValid(i, j, k)) {
                        if (isNaN(this.getValue(i, j, k))) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }
    getForSide(side, i, j) {
        if (side === Side.Top) {
            return this.getValue(this.size - j, this.size, i);
        }
        else if (side === Side.Right) {
            return this.getValue(this.size, j, i);
        }
        else if (side === Side.Front) {
            return this.getValue(this.size - i, j, this.size);
        }
        else if (side === Side.Left) {
            return this.getValue(0, j, this.size - i);
        }
        else if (side === Side.Back) {
            return this.getValue(i, j, 0);
        }
        if (side === Side.Bottom) {
            return this.getValue(j, 0, i);
        }
        else {
            return 0;
        }
    }
    getForPosition(p) {
        let side = PlanetTools.PlanetPositionToSide(p);
        let ij = PlanetTools.PlanetDirectionToGlobalIJ(side, this.size, p);
        return this.getForSide(side, ij.i, ij.j);
    }
    enumerate(callback) {
        for (let jj = 0; jj <= this.size; jj++) {
            for (let kk = 0; kk <= this.size; kk++) {
                callback(0, jj, kk);
                callback(this.size, jj, kk);
            }
        }
        for (let ii = 1; ii <= this.size - 1; ii++) {
            for (let kk = 0; kk <= this.size; kk++) {
                callback(ii, 0, kk);
                callback(ii, this.size, kk);
            }
        }
        for (let ii = 1; ii <= this.size - 1; ii++) {
            for (let jj = 1; jj <= this.size - 1; jj++) {
                callback(ii, jj, 0);
                callback(ii, jj, this.size);
            }
        }
    }
    getValue(i, j, k) {
        if (i === 0) {
            return this.i0s[j][k];
        }
        else if (i === this.size) {
            return this.iNs[j][k];
        }
        else if (j === 0) {
            return this.j0s[i][k];
        }
        else if (j === this.size) {
            return this.jNs[i][k];
        }
        else if (k === 0) {
            return this.k0s[i][j];
        }
        else if (k === this.size) {
            return this.kNs[i][j];
        }
    }
    setValue(v, i, j, k) {
        if (i === 0) {
            this.i0s[j][k] = v;
        }
        else if (i === this.size) {
            this.iNs[j][k] = v;
        }
        else if (j === 0) {
            this.j0s[i][k] = v;
        }
        else if (j === this.size) {
            this.jNs[i][k] = v;
        }
        else if (k === 0) {
            this.k0s[i][j] = v;
        }
        else if (k === this.size) {
            this.kNs[i][j] = v;
        }
    }
    fillDisc(v, i, j, k, r) {
        let rr = r;
        let rN = Math.floor(r);
        for (let ii = -rN; ii <= rN; ii++) {
            for (let jj = -rN; jj <= rN; jj++) {
                for (let kk = -rN; kk <= rN; kk++) {
                    if (ii * ii + jj * jj + kk * kk < rr) {
                        if (this.isValid(i + ii, j + jj, k + kk)) {
                            this.setValue(v, i + ii, j + jj, k + kk);
                        }
                    }
                }
            }
        }
    }
    getTexture(side, maxValue) {
        let texture = new BABYLON.DynamicTexture("texture-" + side, this.size, Game.Scene, false);
        let context = texture.getContext();
        if (!isFinite(maxValue)) {
            maxValue = 1;
        }
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                let v = this.getForSide(side, i, j);
                let c = (v + 1) * 0.5 / maxValue * 256;
                if (Math.round(c) === 128) {
                    context.fillStyle = "rgb(255 0 0)";
                }
                else {
                    context.fillStyle = "rgb(" + c.toFixed(0) + ", " + c.toFixed(0) + ", " + c.toFixed(0) + ")";
                }
                context.fillRect(i, j, 1, 1);
            }
        }
        texture.update(false);
        return texture;
    }
}
class GeneratorElement {
    constructor() {
        this.aabbMin = new BABYLON.Vector3(Infinity, Infinity, Infinity);
        this.aabbMax = new BABYLON.Vector3(-Infinity, -Infinity, -Infinity);
    }
}
/// <reference path="./GeneratorElement.ts"/>
class GeneratorBox extends GeneratorElement {
    constructor(blockType, position, up, forward, w, h, d) {
        super();
        this.blockType = blockType;
        this.position = position;
        this.up = up;
        this.forward = forward;
        this.w = w;
        this.h = h;
        this.d = d;
        this.right = BABYLON.Vector3.Right();
        this._l = BABYLON.Vector3.Zero();
        this._w2 = this.w * 0.5;
        this._h2 = this.h * 0.5;
        this._d2 = this.d * 0.5;
        BABYLON.Vector3.CrossToRef(this.up, this.forward, this.right);
        this.right.normalize();
        BABYLON.Vector3.CrossToRef(this.right, this.up, this.forward);
        let max = Math.max(this.w, this.h, this.d);
        this.aabbMin.copyFrom(position);
        this.aabbMin.x -= max;
        this.aabbMin.y -= max;
        this.aabbMin.z -= max;
        this.aabbMax.copyFrom(position);
        this.aabbMax.x += max;
        this.aabbMax.y += max;
        this.aabbMax.z += max;
    }
    getData(planetPos) {
        this._l.copyFrom(planetPos).subtractInPlace(this.position);
        let dx = BABYLON.Vector3.Dot(this._l, this.right);
        let dy = BABYLON.Vector3.Dot(this._l, this.up);
        let dz = BABYLON.Vector3.Dot(this._l, this.forward);
        if (Math.abs(dx) < this._w2 && Math.abs(dy) < this._h2 && Math.abs(dz) < this._d2) {
            return this.blockType;
        }
        return BlockType.Unknown;
    }
}
class GeneratorSegment extends GeneratorElement {
    constructor(blockType, p0, p1, radius) {
        super();
        this.blockType = blockType;
        this.p0 = p0;
        this.p1 = p1;
        this.radius = radius;
        this._tmp1 = BABYLON.Vector3.Zero();
        this.aabbMin.x = Math.min(p0.x - radius, p1.x - radius, this.aabbMin.x);
        this.aabbMin.y = Math.min(p0.y - radius, p1.y - radius, this.aabbMin.y);
        this.aabbMin.z = Math.min(p0.z - radius, p1.z - radius, this.aabbMin.z);
        this.aabbMax.x = Math.max(p0.x + radius, p1.x + radius, this.aabbMax.x);
        this.aabbMax.y = Math.max(p0.y + radius, p1.y + radius, this.aabbMax.y);
        this.aabbMax.z = Math.max(p0.z + radius, p1.z + radius, this.aabbMax.z);
        this.l = BABYLON.Vector3.Distance(p0, p1);
        this.u = p1.subtract(p0).scaleInPlace(1 / this.l);
    }
    getData(planetPos) {
        this._tmp1.copyFrom(planetPos);
        this._tmp1.subtractInPlace(this.p0);
        let dP = BABYLON.Vector3.Dot(this._tmp1, this.u);
        if (dP >= 0) {
            this._tmp1.copyFrom(planetPos);
            this._tmp1.subtractInPlace(this.p1);
            let dP2 = BABYLON.Vector3.Dot(this._tmp1, this.u);
            if (dP2 <= 0) {
                this._tmp1.copyFrom(this.u).scaleInPlace(dP).addInPlace(this.p0);
                let sqrDist = BABYLON.Vector3.DistanceSquared(this._tmp1, planetPos);
                if (sqrDist < this.radius * this.radius) {
                    return this.blockType;
                }
            }
        }
        return BlockType.Unknown;
    }
}
class GeneratorSphere extends GeneratorElement {
    constructor(blockType, position, radius) {
        super();
        this.blockType = blockType;
        this.position = position;
        this.radius = radius;
        this.aabbMin.copyFrom(position);
        this.aabbMin.x -= this.radius;
        this.aabbMin.y -= this.radius;
        this.aabbMin.z -= this.radius;
        this.aabbMax.copyFrom(position);
        this.aabbMax.x += this.radius;
        this.aabbMax.y += this.radius;
        this.aabbMax.z += this.radius;
    }
    getData(planetPos) {
        let sqrDist = BABYLON.Vector3.DistanceSquared(planetPos, this.position);
        if (sqrDist < this.radius * this.radius) {
            return this.blockType;
        }
        return BlockType.Unknown;
    }
}
class ProceduralTree {
    constructor(chunckManager) {
        this.chunckManager = chunckManager;
    }
    generateData() {
        let w = PlanetTools.LocalIJKToPlanetPosition(this.chunck, this.i, this.j, this.k);
        let n = this.chunck.normal;
        let chuncks = PlanetBlockMaker.AddLine(this.chunck.planetSide.planet, w, w.add(n.scale(5)), BlockType.Wood);
        chuncks.push(...PlanetBlockMaker.AddSphere(this.chunck.planetSide.planet, w.add(n.scale(5)), 3, BlockType.Leaf));
        for (let i = 0; i < chuncks.length; i++) {
            chuncks[i].doDataSafety();
            if (chuncks[i].lod <= 1) {
                this.chunckManager.requestDraw(chuncks[i], chuncks[i].lod, "ProceduralTree.generateData");
            }
        }
    }
}
var KeyInput;
(function (KeyInput) {
    KeyInput[KeyInput["NULL"] = -1] = "NULL";
    KeyInput[KeyInput["ACTION_SLOT_0"] = 0] = "ACTION_SLOT_0";
    KeyInput[KeyInput["ACTION_SLOT_1"] = 1] = "ACTION_SLOT_1";
    KeyInput[KeyInput["ACTION_SLOT_2"] = 2] = "ACTION_SLOT_2";
    KeyInput[KeyInput["ACTION_SLOT_3"] = 3] = "ACTION_SLOT_3";
    KeyInput[KeyInput["ACTION_SLOT_4"] = 4] = "ACTION_SLOT_4";
    KeyInput[KeyInput["ACTION_SLOT_5"] = 5] = "ACTION_SLOT_5";
    KeyInput[KeyInput["ACTION_SLOT_6"] = 6] = "ACTION_SLOT_6";
    KeyInput[KeyInput["ACTION_SLOT_7"] = 7] = "ACTION_SLOT_7";
    KeyInput[KeyInput["ACTION_SLOT_8"] = 8] = "ACTION_SLOT_8";
    KeyInput[KeyInput["ACTION_SLOT_9"] = 9] = "ACTION_SLOT_9";
    KeyInput[KeyInput["INVENTORY"] = 10] = "INVENTORY";
    KeyInput[KeyInput["MOVE_FORWARD"] = 11] = "MOVE_FORWARD";
    KeyInput[KeyInput["MOVE_LEFT"] = 12] = "MOVE_LEFT";
    KeyInput[KeyInput["MOVE_BACK"] = 13] = "MOVE_BACK";
    KeyInput[KeyInput["MOVE_RIGHT"] = 14] = "MOVE_RIGHT";
    KeyInput[KeyInput["JUMP"] = 15] = "JUMP";
    KeyInput[KeyInput["MAIN_MENU"] = 16] = "MAIN_MENU";
})(KeyInput || (KeyInput = {}));
class InputManager {
    constructor(scene, canvas, main) {
        this.scene = scene;
        this.canvas = canvas;
        this.main = main;
        this.isPointerLocked = false;
        this.isPointerDown = false;
        this.keyInputMap = new Map();
        this.keyInputDown = new UniqueList();
        this.keyDownListeners = [];
        this.mappedKeyDownListeners = new Map();
        this.keyUpListeners = [];
        this.mappedKeyUpListeners = new Map();
        this.pointerDownObservable = new BABYLON.Observable();
        this.pointerUpObservable = new BABYLON.Observable();
        this._firstTouchStartTriggered = false;
        this.pickableElements = new UniqueList();
    }
    initialize(player) {
        this.player = player;
        window.addEventListener("touchstart", this.onTouchStart.bind(this));
        this.canvas.addEventListener("pointerdown", (ev) => {
            this.updateAimedElement(ev.x, ev.y);
            this.isPointerDown = true;
            if (Config.controlConfiguration.canLockPointer) {
                this.canvas.requestPointerLock();
                this.isPointerLocked = true;
            }
            this.pointerDownObservable.notifyObservers(this.aimedElement);
        });
        this.canvas.addEventListener("pointerup", () => {
            this.isPointerDown = false;
            this.pointerUpObservable.notifyObservers(this.aimedElement);
        });
        document.addEventListener("pointerlockchange", () => {
            if (!(document.pointerLockElement === this.canvas)) {
                this.isPointerLocked = false;
            }
        });
        this.scene.onBeforeRenderObservable.add(() => {
            this.updateAimedElement();
        });
        this.keyInputMap.set("Digit0", KeyInput.ACTION_SLOT_0);
        this.keyInputMap.set("Digit1", KeyInput.ACTION_SLOT_1);
        this.keyInputMap.set("Digit2", KeyInput.ACTION_SLOT_2);
        this.keyInputMap.set("Digit3", KeyInput.ACTION_SLOT_3);
        this.keyInputMap.set("Digit4", KeyInput.ACTION_SLOT_4);
        this.keyInputMap.set("Digit5", KeyInput.ACTION_SLOT_5);
        this.keyInputMap.set("Digit6", KeyInput.ACTION_SLOT_6);
        this.keyInputMap.set("Digit7", KeyInput.ACTION_SLOT_7);
        this.keyInputMap.set("Digit8", KeyInput.ACTION_SLOT_8);
        this.keyInputMap.set("Digit9", KeyInput.ACTION_SLOT_9);
        this.keyInputMap.set("KeyI", KeyInput.INVENTORY);
        this.keyInputMap.set("KeyW", KeyInput.MOVE_FORWARD);
        this.keyInputMap.set("KeyA", KeyInput.MOVE_LEFT);
        this.keyInputMap.set("KeyS", KeyInput.MOVE_BACK);
        this.keyInputMap.set("KeyD", KeyInput.MOVE_RIGHT);
        this.keyInputMap.set("Space", KeyInput.JUMP);
        this.keyInputMap.set("Backquote", KeyInput.MAIN_MENU);
        window.addEventListener("keydown", (e) => {
            let keyInput = this.keyInputMap.get(e.code);
            if (isFinite(keyInput)) {
                this.doKeyInputDown(keyInput);
            }
        });
        window.addEventListener("keyup", (e) => {
            let keyInput = this.keyInputMap.get(e.code);
            if (isFinite(keyInput)) {
                this.doKeyInputUp(keyInput);
            }
        });
        document.getElementById("touch-menu").addEventListener("pointerdown", () => {
            let keyInput = KeyInput.MAIN_MENU;
            if (isFinite(keyInput)) {
                this.doKeyInputDown(keyInput);
            }
        });
        document.getElementById("touch-menu").addEventListener("pointerup", () => {
            let keyInput = KeyInput.MAIN_MENU;
            if (isFinite(keyInput)) {
                this.doKeyInputUp(keyInput);
            }
        });
        document.getElementById("touch-jump").addEventListener("pointerdown", () => {
            let keyInput = KeyInput.JUMP;
            if (isFinite(keyInput)) {
                this.doKeyInputDown(keyInput);
            }
        });
        document.getElementById("touch-jump").addEventListener("pointerup", () => {
            let keyInput = KeyInput.JUMP;
            if (isFinite(keyInput)) {
                this.doKeyInputUp(keyInput);
            }
        });
    }
    doKeyInputDown(keyInput) {
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
    onTouchStart() {
        if (!this._firstTouchStartTriggered) {
            this.onFirstTouchStart();
        }
    }
    onFirstTouchStart() {
        let movePad = new PlayerInputMovePad(this.player);
        movePad.connectInput(true);
        let headPad = new PlayerInputHeadPad(this.player);
        headPad.connectInput(false);
        this._firstTouchStartTriggered = true;
        document.getElementById("touch-menu").style.display = "block";
        document.getElementById("touch-jump").style.display = "block";
        this.main.isTouch = true;
    }
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
    getkeyInputActionSlotDown() {
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_0)) {
            return KeyInput.ACTION_SLOT_0;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_1)) {
            return KeyInput.ACTION_SLOT_1;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_2)) {
            return KeyInput.ACTION_SLOT_2;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_3)) {
            return KeyInput.ACTION_SLOT_3;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_4)) {
            return KeyInput.ACTION_SLOT_4;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_5)) {
            return KeyInput.ACTION_SLOT_5;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_6)) {
            return KeyInput.ACTION_SLOT_6;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_7)) {
            return KeyInput.ACTION_SLOT_7;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_8)) {
            return KeyInput.ACTION_SLOT_8;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_9)) {
            return KeyInput.ACTION_SLOT_9;
        }
        return KeyInput.NULL;
    }
    getPickInfo(meshes, x, y) {
        let timers;
        let logOutput;
        let useLog = DebugDefine.LOG_INPUTMANAGER_GETPICKINGINFO_PERFORMANCE;
        if (useLog) {
            timers = [];
            timers.push(performance.now());
            logOutput = "InputManager getPickInfo on " + meshes.length + " meshes.";
        }
        if (isNaN(x) || isNaN(y)) {
            if (this.isPointerLocked) {
                x = this.canvas.clientWidth * 0.5;
                y = this.canvas.clientHeight * 0.5;
            }
            else {
                x = this.scene.pointerX;
                y = this.scene.pointerY;
            }
        }
        let bestDist = Infinity;
        let bestPick;
        let ray = this.scene.createPickingRay(x, y, BABYLON.Matrix.Identity(), this.scene.activeCameras[1]);
        for (let i = 0; i < meshes.length; i++) {
            let mesh = meshes[i];
            if (mesh) {
                let pick = ray.intersectsMesh(mesh);
                if (pick && pick.hit && pick.pickedMesh) {
                    if (pick.distance < bestDist) {
                        bestDist = pick.distance;
                        bestPick = pick;
                    }
                }
                if (useLog) {
                    timers.push(performance.now());
                    logOutput += "\n  mesh " + mesh.name + " checked in " + (timers[timers.length - 1] - timers[timers.length - 2]).toFixed(0) + " ms";
                }
            }
        }
        if (useLog) {
            timers.push(performance.now());
            logOutput += "\nInputManager getPickInfo completed in " + (timers[timers.length - 1] - timers[0]).toFixed(0) + " ms";
            console.log(logOutput);
        }
        return bestPick;
    }
    updateAimedElement(x, y) {
        if (isNaN(x) || isNaN(y)) {
            if (this.isPointerLocked) {
                x = this.canvas.clientWidth * 0.5;
                y = this.canvas.clientHeight * 0.5;
            }
            else {
                x = this.scene.pointerX;
                y = this.scene.pointerY;
            }
        }
        let aimedPickable;
        let aimedDist = Infinity;
        let hit = false;
        let ray = this.scene.createPickingRay(x, y, BABYLON.Matrix.Identity(), this.scene.activeCameras[1]);
        for (let i = 0; i < this.pickableElements.length; i++) {
            let pickableElement = this.pickableElements.get(i);
            let mesh = pickableElement;
            if (pickableElement.proxyPickMesh) {
                mesh = pickableElement.proxyPickMesh;
            }
            let pick = ray.intersectsMesh(mesh);
            if (pick && pick.hit && pick.pickedMesh) {
                if (pick.distance < aimedDist) {
                    aimedPickable = pickableElement;
                    aimedDist = pick.distance;
                    this.aimedPosition = pick.pickedPoint;
                    this.aimedNormal = pick.getNormal(true, true);
                    hit = true;
                }
            }
        }
        if (!hit) {
            this.aimedPosition = undefined;
            this.aimedNormal = undefined;
        }
        if (aimedPickable != this.aimedElement) {
            if (this.aimedElement) {
                this.aimedElement.onHoverEnd();
            }
            this.aimedElement = aimedPickable;
            if (this.aimedElement) {
                this.aimedElement.onHoverStart();
            }
        }
    }
}
class Player extends BABYLON.Mesh {
    constructor(position, main) {
        super("Player", main.scene);
        this.main = main;
        this.mass = 1;
        this.speed = 5;
        this.velocity = BABYLON.Vector3.Zero();
        this.underWater = false;
        this.inputForward = 0;
        this.inputRight = 0;
        this.inputHeadUp = 0;
        this.inputHeadRight = 0;
        this.lockInPlace = false;
        this.lockInput = true;
        this.sqrDistToPlanet = Infinity;
        this.altitudeOnPlanet = 0;
        this.targetLookStrength = 0.5;
        this.wallCollisionMeshes = [];
        this.moveDelay = 1;
        this._initialized = false;
        this._isRegisteredUIOnly = false;
        this._isRegistered = false;
        this._onPointerUpUIOnly = (pickableElement) => {
            if (this.armManager) {
                this.armManager.startActionAnimation(() => {
                    if (pickableElement) {
                        pickableElement.onPointerUp();
                    }
                });
            }
        };
        this._onPointerDownUIOnly = (pickableElement) => {
            if (this.inputManager.aimedElement) {
                this.inputManager.aimedElement.onPointerDown();
            }
        };
        this._keyUp = (e) => {
            if (e.code === "KeyG") {
                if (!this._initialized) {
                    this.initialize();
                }
                this.godMode = !this.godMode;
            }
            if (e.code === "ControlLeft") {
                if (this.godMode) {
                    this.velocity.subtractInPlace(this.getDirection(BABYLON.Axis.Y).scale(5));
                    this._isGrounded = false;
                    this._jumpTimer = 0.2;
                }
            }
        };
        this._headMoveWithMouse = false;
        this._mouseMove = (event) => {
            if (this._headMoveWithMouse || this.inputManager.isPointerLocked) {
                let movementX = event.movementX;
                let movementY = event.movementY;
                let size = Math.min(this.main.canvas.width, this.main.canvas.height);
                this.inputHeadRight += movementX / size * 10;
                this.inputHeadRight = Math.max(Math.min(this.inputHeadRight, 1), -1);
                this.inputHeadUp += movementY / size * 10;
                this.inputHeadUp = Math.max(Math.min(this.inputHeadUp, 1), -1);
            }
        };
        this._moveTimer = Infinity;
        this._gravityFactor = BABYLON.Vector3.Zero();
        this._groundFactor = BABYLON.Vector3.Zero();
        this._surfaceFactor = BABYLON.Vector3.Zero();
        this._controlFactor = BABYLON.Vector3.Zero();
        this._rightDirection = new BABYLON.Vector3(1, 0, 0);
        this._leftDirection = new BABYLON.Vector3(-1, 0, 0);
        this.upDirection = new BABYLON.Vector3(0, 1, 0);
        this._downDirection = new BABYLON.Vector3(0, -1, 0);
        this._forwardDirection = new BABYLON.Vector3(0, 0, 1);
        this._backwardDirection = new BABYLON.Vector3(0, 0, -1);
        this._feetPosition = BABYLON.Vector3.Zero();
        this._headPosition = BABYLON.Vector3.Zero();
        this._collisionAxis = [];
        this._collisionPositions = [];
        this._jumpTimer = 0;
        this._isGrounded = false;
        this._chuncks = [];
        this._meshes = [];
        this._isPosAnimating = false;
        this._update = () => {
            if (this.main.cameraManager.cameraMode != CameraMode.Player) {
                return;
            }
            this.updatePlanet();
            let deltaTime = this.main.engine.getDeltaTime() / 1000;
            if (isFinite(this._moveTimer)) {
                let p = this.inputManager.getPickInfo(this._meshes);
                if (p && p.hit && p.pickedPoint) {
                    if (!this._moveTarget) {
                        this._moveTarget = p.pickedPoint.clone();
                    }
                    if (BABYLON.Vector3.DistanceSquared(this._moveTarget, p.pickedPoint) > 1) {
                        this.abortTeleportation();
                    }
                    if (this._moveTarget) {
                        this._moveTimer -= deltaTime;
                    }
                }
                if (this._moveTimer < 0) {
                    this.animatePos(this._moveTarget, 1, true);
                    this.abortTeleportation();
                }
            }
            let moveTimerNormalized = this._moveTimer / this.moveDelay;
            if (moveTimerNormalized < 0.75 && this._moveTarget) {
                let sDisc = 0;
                if (moveTimerNormalized > 0.6) {
                    sDisc = Easing.easeInOutSine(1 - (moveTimerNormalized - 0.6) / 0.15);
                }
                else {
                    sDisc = Easing.easeInOutSine(moveTimerNormalized / 0.6);
                }
                let sLandmark = 0;
                if (moveTimerNormalized <= 0.6) {
                    sLandmark = Easing.easeInOutSine(1 - moveTimerNormalized / 0.6);
                }
                this.moveIndicatorDisc.isVisible = true;
                this.moveIndicatorDisc.planet = this.planet;
                this.moveIndicatorDisc.scaling.copyFromFloats(sDisc, sDisc, sDisc);
                this.moveIndicatorDisc.setPosition(this._moveTarget);
                this.moveIndicatorLandmark.isVisible = true;
                this.moveIndicatorLandmark.planet = this.planet;
                this.moveIndicatorLandmark.scaling.copyFromFloats(sLandmark, sLandmark, sLandmark);
                this.moveIndicatorLandmark.setPosition(this._moveTarget);
            }
            else {
                this.moveIndicatorDisc.isVisible = false;
                this.moveIndicatorLandmark.isVisible = false;
            }
            this._jumpTimer = Math.max(this._jumpTimer - deltaTime, 0);
            if (this.targetLook) {
                let forward = this.camPos.forward;
                let targetForward = this.targetLook.subtract(this.camPos.absolutePosition).normalize();
                let a = VMath.AngleFromToAround(forward, targetForward, this.upDirection) / Math.PI;
                if (isFinite(a)) {
                    this.inputHeadRight += a * this.targetLookStrength;
                }
                a = VMath.AngleFromToAround(forward, targetForward, this._rightDirection) / (2 * Math.PI);
                if (isFinite(a)) {
                    this.inputHeadUp += a * this.targetLookStrength;
                }
                if (!this.targetDestination && this.velocity.lengthSquared() < 0.001) {
                    if (BABYLON.Vector3.Dot(forward, targetForward) > 0.99) {
                        this.targetLook = undefined;
                        this.targetLookStrength = 0.5;
                    }
                }
            }
            let inputHeadRight = Math.max(Math.min(this.inputHeadRight, 1), -1);
            let inputHeadUp = Math.max(Math.min(this.inputHeadUp, 1), -1);
            let rotationPower = inputHeadRight * Math.PI * deltaTime;
            let rotationCamPower = inputHeadUp * Math.PI * deltaTime;
            let localY = BABYLON.Vector3.TransformNormal(BABYLON.Axis.Y, this.getWorldMatrix());
            let rotation = BABYLON.Quaternion.RotationAxis(localY, rotationPower);
            this.rotationQuaternion = rotation.multiply(this.rotationQuaternion);
            this.camPos.rotation.x += rotationCamPower;
            this.camPos.rotation.x = Math.max(this.camPos.rotation.x, -Math.PI / 2);
            this.camPos.rotation.x = Math.min(this.camPos.rotation.x, Math.PI / 2);
            let chunck = PlanetTools.WorldPositionToChunck(this.planet, this.position);
            if (chunck != this._currentChunck) {
                if (this._currentChunck) {
                    //this._currentChunck.unlit();
                }
                this._currentChunck = chunck;
                if (this._currentChunck) {
                    //this._currentChunck.highlight();
                    this._chuncks = [...this._currentChunck.adjacentsAsArray, this._currentChunck];
                    this._meshes = this._chuncks.map(c => { return c ? c.mesh : undefined; });
                }
                else {
                    this._chuncks = [];
                    this._meshes = [];
                }
            }
            let inputFactor = Easing.smooth025Sec(this.getEngine().getFps());
            this.inputHeadRight *= inputFactor;
            this.inputHeadUp *= inputFactor;
            this._collisionPositions[0] = this._headPosition;
            this._collisionPositions[1] = this._feetPosition;
            this._collisionAxis[0] = this._rightDirection;
            this._collisionAxis[1] = this._leftDirection;
            this._collisionAxis[2] = this._forwardDirection;
            this._collisionAxis[3] = this._backwardDirection;
            this.getDirectionToRef(BABYLON.Axis.X, this._rightDirection);
            this._leftDirection.copyFrom(this._rightDirection);
            this._leftDirection.scaleInPlace(-1);
            if (this.planet && !this.lockInPlace) {
                this.upDirection.copyFrom(this.position).subtractInPlace(this.planet.position);
                this.upDirection.normalize();
            }
            this._downDirection.copyFrom(this.upDirection);
            this._downDirection.scaleInPlace(-1);
            this.getDirectionToRef(BABYLON.Axis.Z, this._forwardDirection);
            this._backwardDirection.copyFrom(this._forwardDirection);
            this._backwardDirection.scaleInPlace(-1);
            this._feetPosition.copyFrom(this.position);
            this._feetPosition.addInPlace(this.upDirection.scale(0.5));
            this._headPosition.copyFrom(this.position);
            this._headPosition.addInPlace(this.upDirection.scale(1.5));
            this._keepUp();
            if (this.lockInPlace) {
                return;
            }
            let fVert = 1;
            // Add gravity and ground reaction.
            let gFactor = 1 - (this.altitudeOnPlanet / 300);
            gFactor = Math.max(Math.min(gFactor, 1), 0) * 9.8;
            this._gravityFactor.copyFrom(this._downDirection).scaleInPlace(gFactor * deltaTime);
            this._groundFactor.copyFromFloats(0, 0, 0);
            if (this._jumpTimer === 0 && this.planet) {
                let checkGroundCollision = false;
                if (this.groundCollisionVData) {
                    let localIJK = PlanetTools.WorldPositionToLocalIJK(this.planet, this.position.subtract(this.upDirection.scale(0.1)));
                    if (localIJK) {
                        let data = localIJK.planetChunck.GetData(localIJK.i, localIJK.j, localIJK.k);
                        if (data > BlockType.Water) {
                            let globalIJK = PlanetTools.LocalIJKToGlobalIJK(localIJK);
                            if (globalIJK) {
                                if (!this.groundCollisionMesh) {
                                    this.groundCollisionMesh = BABYLON.MeshBuilder.CreateSphere("debug-current-block", { diameter: 1 });
                                    if (DebugDefine.SHOW_PLAYER_COLLISION_MESHES) {
                                        let material = new BABYLON.StandardMaterial("material");
                                        material.alpha = 0.25;
                                        this.groundCollisionMesh.material = material;
                                    }
                                    else {
                                        this.groundCollisionMesh.isVisible = false;
                                    }
                                }
                                PlanetTools.SkewVertexData(this.groundCollisionVData, localIJK.planetChunck.size, globalIJK.i, globalIJK.j, globalIJK.k).applyToMesh(this.groundCollisionMesh);
                                this.groundCollisionMesh.parent = localIJK.planetChunck.planetSide;
                                checkGroundCollision = true;
                            }
                        }
                    }
                }
                if (checkGroundCollision) {
                    let ray = new BABYLON.Ray(this.camPos.absolutePosition, this._downDirection);
                    let hit = ray.intersectsMesh(this.groundCollisionMesh);
                    if (hit && hit.pickedPoint) {
                        if (DebugDefine.SHOW_PLAYER_COLLISION_MESHES) {
                            if (!this._debugCollisionGroundMesh) {
                                this._debugCollisionGroundMesh = BABYLON.MeshBuilder.CreateSphere("debug-collision-mesh", { diameter: 0.2 }, this.getScene());
                                let material = new BABYLON.StandardMaterial("material", this.getScene());
                                material.alpha = 0.5;
                                this._debugCollisionGroundMesh.material = material;
                            }
                            this._debugCollisionGroundMesh.position.copyFrom(hit.pickedPoint);
                        }
                        let d = BABYLON.Vector3.Dot(this.position.subtract(hit.pickedPoint), this.upDirection);
                        if (d <= 0.2) {
                            let v = 0;
                            if (d < 0) {
                                v = Math.abs(20 * d);
                            }
                            this._groundFactor
                                .copyFrom(this._gravityFactor)
                                .scaleInPlace(-1 - v);
                            fVert = 0.001;
                            this._isGrounded = true;
                        }
                    }
                }
            }
            this.velocity.addInPlace(this._gravityFactor);
            this.velocity.addInPlace(this._groundFactor);
            // Add input force.
            let fLat = 1;
            this._controlFactor.copyFromFloats(0, 0, 0);
            if (this.targetDestination) {
                this._controlFactor.copyFrom(this.targetDestination);
                this._controlFactor.subtractInPlace(this.position);
                let dist = this._controlFactor.length();
                if (dist > this._lastDistToTarget && this.velocity.length() < 0.1) {
                    this.targetDestination = undefined;
                    this._lastDistToTarget = undefined;
                }
                else {
                    this._lastDistToTarget = dist;
                    this._controlFactor.normalize();
                    this._controlFactor.scaleInPlace((dist * 20 / this.mass) * deltaTime);
                    fLat = 0.2;
                }
            }
            else {
                this._controlFactor.addInPlace(this._rightDirection.scale(this.inputRight));
                this._controlFactor.addInPlace(this._forwardDirection.scale(this.inputForward));
                if (this._controlFactor.lengthSquared() > 0.1) {
                    this._controlFactor.normalize();
                }
                this._controlFactor.scaleInPlace((20 / this.mass) * deltaTime);
                if (this.godMode) {
                    this._controlFactor.scaleInPlace(5);
                }
            }
            this.velocity.addInPlace(this._controlFactor);
            // Check wall collisions.
            this._surfaceFactor.copyFromFloats(0, 0, 0);
            let wallCount = 0;
            if (this.wallCollisionVData) {
                for (let i = 0; i < this._collisionPositions.length; i++) {
                    let pos = this._collisionPositions[i];
                    for (let j = 0; j < this._collisionAxis.length; j++) {
                        let axis = this._collisionAxis[j];
                        let localIJK = PlanetTools.WorldPositionToLocalIJK(this.planet, pos.add(axis.scale(0.35)));
                        if (localIJK) {
                            let data = localIJK.planetChunck.GetData(localIJK.i, localIJK.j, localIJK.k);
                            if (data > BlockType.Water) {
                                let globalIJK = PlanetTools.LocalIJKToGlobalIJK(localIJK);
                                if (globalIJK) {
                                    if (!this.wallCollisionMeshes[wallCount]) {
                                        this.wallCollisionMeshes[wallCount] = BABYLON.MeshBuilder.CreateSphere("wall-collision-mesh", { diameter: 1 });
                                        if (DebugDefine.SHOW_PLAYER_COLLISION_MESHES) {
                                            let material = new BABYLON.StandardMaterial("material");
                                            material.alpha = 0.25;
                                            this.wallCollisionMeshes[wallCount].material = material;
                                        }
                                        else {
                                            this.wallCollisionMeshes[wallCount].isVisible = false;
                                        }
                                    }
                                    PlanetTools.SkewVertexData(this.wallCollisionVData, localIJK.planetChunck.size, globalIJK.i, globalIJK.j, globalIJK.k).applyToMesh(this.wallCollisionMeshes[wallCount]);
                                    this.wallCollisionMeshes[wallCount].parent = localIJK.planetChunck.planetSide;
                                    wallCount++;
                                }
                            }
                        }
                    }
                }
            }
            if (!this.godMode) {
                for (let i = 0; i < this._collisionPositions.length; i++) {
                    let pos = this._collisionPositions[i];
                    for (let j = 0; j < this._collisionAxis.length; j++) {
                        let axis = this._collisionAxis[j];
                        let ray = new BABYLON.Ray(pos, axis, 0.35);
                        let hit = ray.intersectsMeshes(this.wallCollisionMeshes.filter((m, index) => { return index < wallCount; }));
                        hit = hit.sort((h1, h2) => { return h1.distance - h2.distance; });
                        if (hit[0] && hit[0].pickedPoint) {
                            if (DebugDefine.SHOW_PLAYER_COLLISION_MESHES) {
                                if (!this._debugCollisionWallMesh) {
                                    this._debugCollisionWallMesh = BABYLON.MeshBuilder.CreateSphere("debug-collision-mesh", { diameter: 0.2 }, this.getScene());
                                    let material = new BABYLON.StandardMaterial("material", this.getScene());
                                    material.alpha = 0.5;
                                    this._debugCollisionWallMesh.material = material;
                                }
                                this._debugCollisionWallMesh.position.copyFrom(hit[0].pickedPoint);
                            }
                            let d = hit[0].pickedPoint.subtract(pos).length();
                            if (d > 0.01) {
                                this._surfaceFactor.addInPlace(axis.scale((((-10 / this.mass) * 0.3) / d) * deltaTime));
                                fLat = 0.1;
                            }
                            else {
                                // In case where it stuck to the surface, force push.
                                this.position.addInPlace(hit[0].getNormal(true).scale(0.01));
                            }
                        }
                    }
                }
            }
            this.velocity.addInPlace(this._surfaceFactor);
            // Add friction
            let downVelocity = this._downDirection.scale(BABYLON.Vector3.Dot(this.velocity, this._downDirection));
            this.velocity.subtractInPlace(downVelocity);
            downVelocity.scaleInPlace(Math.pow(0.5 * fVert, deltaTime));
            this.velocity.scaleInPlace(Math.pow(0.01 * fLat, deltaTime));
            this.velocity.addInPlace(downVelocity);
            // Safety check.
            if (!VMath.IsFinite(this.velocity)) {
                this.velocity.copyFromFloats(-0.1 + 0.2 * Math.random(), -0.1 + 0.2 * Math.random(), -0.1 + 0.2 * Math.random());
            }
            this.position.addInPlace(this.velocity.scale(deltaTime));
            // Update action
            if (this.currentAction) {
                if (this.currentAction.onUpdate) {
                    this.currentAction.onUpdate();
                }
            }
            //document.querySelector("#camera-altitude").textContent = this.camPos.absolutePosition.length().toFixed(1);
        };
        Player.DEBUG_INSTANCE = this;
        this.position = position;
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.camPos = new BABYLON.Mesh("Dummy", Game.Scene);
        this.camPos.parent = this;
        this.camPos.position = new BABYLON.Vector3(0, 1.7, 0);
        this.camPos.rotation.x = Math.PI / 8;
        this.armManager = new PlayerArmManager(this);
        /*
        BABYLON.CreateSphereVertexData({ diameter: 0.2 }).applyToMesh(this);
        let material = new BABYLON.StandardMaterial("material", this.getScene());
        material.alpha = 0.5;
        this.material = material;
        this.layerMask = 0x10000000;
        */
        let mat = new ToonMaterial("move-indicator-material", this.scene);
        this.moveIndicatorDisc = new PlanetObject("player-move-indicator-disc", this.main);
        this.moveIndicatorDisc.material = mat;
        this.moveIndicatorDisc.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.moveIndicatorDisc.isVisible = false;
        this.moveIndicatorLandmark = new PlanetObject("player-move-indicator-landmark", this.main);
        this.moveIndicatorLandmark.material = mat;
        this.moveIndicatorLandmark.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.moveIndicatorLandmark.isVisible = false;
    }
    get inputManager() {
        return this.main.inputManager;
    }
    get scene() {
        return this._scene;
    }
    async initialize() {
        if (!this._initialized) {
            Game.Scene.onBeforeRenderObservable.add(this._update);
            this.armManager.initialize();
            this._initialized = true;
            this.groundCollisionVData = (await this.main.vertexDataLoader.get("chunck-part"))[1];
            this.wallCollisionVData = (await this.main.vertexDataLoader.get("chunck-part"))[2];
            (await this.main.vertexDataLoader.get("landmark"))[0].applyToMesh(this.moveIndicatorDisc);
            (await this.main.vertexDataLoader.get("landmark"))[1].applyToMesh(this.moveIndicatorLandmark);
        }
    }
    registerControlUIOnly() {
        if (this._isRegisteredUIOnly) {
            return;
        }
        this.inputManager.pointerUpObservable.add(this._onPointerUpUIOnly);
        this.inputManager.pointerDownObservable.add(this._onPointerDownUIOnly);
        this._isRegisteredUIOnly = true;
    }
    unregisterControlUIOnly() {
        this.inputManager.pointerUpObservable.removeCallback(this._onPointerUpUIOnly);
        this.inputManager.pointerDownObservable.removeCallback(this._onPointerDownUIOnly);
        this._isRegisteredUIOnly = false;
    }
    registerControl() {
        if (this._isRegisteredUIOnly) {
            this.unregisterControlUIOnly();
        }
        if (this._isRegistered) {
            return;
        }
        this.inputManager.addMappedKeyDownListener(KeyInput.MOVE_FORWARD, () => {
            this.inputForward = 1;
        });
        this.inputManager.addMappedKeyDownListener(KeyInput.MOVE_BACK, () => {
            this.inputForward = -1;
        });
        this.inputManager.addMappedKeyDownListener(KeyInput.MOVE_RIGHT, () => {
            this.inputRight = 1;
        });
        this.inputManager.addMappedKeyDownListener(KeyInput.MOVE_LEFT, () => {
            this.inputRight = -1;
        });
        this.inputManager.addMappedKeyUpListener(KeyInput.MOVE_FORWARD, () => {
            this.inputForward = 0;
        });
        this.inputManager.addMappedKeyUpListener(KeyInput.MOVE_BACK, () => {
            this.inputForward = 0;
        });
        this.inputManager.addMappedKeyUpListener(KeyInput.MOVE_RIGHT, () => {
            this.inputRight = 0;
        });
        this.inputManager.addMappedKeyUpListener(KeyInput.MOVE_LEFT, () => {
            this.inputRight = 0;
        });
        this.inputManager.addMappedKeyUpListener(KeyInput.JUMP, () => {
            if (this._isGrounded || this.godMode) {
                this.velocity.addInPlace(this.getDirection(BABYLON.Axis.Y).scale(5));
                this._isGrounded = false;
                this._jumpTimer = 0.2;
            }
        });
        this.main.canvas.addEventListener("keyup", this._keyUp);
        this.main.canvas.addEventListener("pointermove", this._mouseMove);
        this.inputManager.pointerUpObservable.add((pickableElement) => {
            this.abortTeleportation();
            if (this.currentAction) {
                if (this.currentAction.onClick) {
                    this.currentAction.onClick();
                    return;
                }
            }
            if (this.armManager) {
                this.armManager.startActionAnimation(() => {
                    if (pickableElement) {
                        pickableElement.onPointerUp();
                    }
                });
            }
            this._headMoveWithMouse = false;
        });
        this.inputManager.pointerDownObservable.add(() => {
            if (this.inputManager.aimedElement) {
                this.inputManager.aimedElement.onPointerDown();
            }
            this.startTeleportation();
            if (!this.inputManager.aimedElement || !this.inputManager.aimedElement.interceptsPointerMove()) {
                this._headMoveWithMouse = true;
            }
        });
        this._isRegistered = true;
    }
    startTeleportation() {
        this._moveTimer = 1;
        this._moveTarget = undefined;
    }
    abortTeleportation() {
        this._moveTimer = Infinity;
    }
    unregisterControl() {
        this.main.canvas.removeEventListener("keyup", this._keyUp);
        this.main.canvas.removeEventListener("mousemove", this._mouseMove);
    }
    get meshes() {
        return this._meshes;
    }
    get isPosAnimating() {
        return this._isPosAnimating;
    }
    async animatePos(posTarget, duration, lookingAt) {
        return new Promise(resolve => {
            let posZero = this.position.clone();
            let quaternionZero;
            let quaternionTarget;
            if (lookingAt) {
                quaternionZero = this.rotationQuaternion.clone();
                let targetZ = posTarget.subtract(posZero).normalize();
                let targetY;
                if (this.planet) {
                    targetY = posTarget.subtract(this.planet.position).normalize();
                }
                else {
                    targetY = posTarget.clone().normalize();
                }
                let targetX = BABYLON.Vector3.Cross(targetY, targetZ);
                targetZ = BABYLON.Vector3.Cross(targetX, targetY);
                quaternionTarget = BABYLON.Quaternion.RotationQuaternionFromAxis(targetX, targetY, targetZ);
            }
            let t = 0;
            let cb = () => {
                t += this.main.engine.getDeltaTime() / 1000;
                if (t < duration) {
                    this._isPosAnimating = true;
                    let f = Easing.easeInOutSine(t / duration);
                    this.position.copyFrom(posZero).scaleInPlace(1 - f).addInPlace(posTarget.scale(f));
                    if (lookingAt) {
                        BABYLON.Quaternion.SlerpToRef(quaternionZero, quaternionTarget, f, this.rotationQuaternion);
                    }
                }
                else {
                    this._isPosAnimating = false;
                    this.position.copyFrom(posTarget);
                    this.main.scene.onBeforeRenderObservable.removeCallback(cb);
                    resolve();
                }
            };
            this.main.scene.onBeforeRenderObservable.add(cb);
        });
    }
    updatePlanet() {
        this.sqrDistToPlanet = Infinity;
        for (let i = 0; i < this.main.planets.length; i++) {
            let p = this.main.planets[i];
            let sqrDist = BABYLON.Vector3.DistanceSquared(this.position, p.position);
            if (sqrDist < this.sqrDistToPlanet) {
                this.planet = p;
                this.sqrDistToPlanet = sqrDist;
            }
        }
        this.altitudeOnPlanet = Math.sqrt(this.sqrDistToPlanet) - this.planet.seaAltitude;
    }
    _keepUp() {
        if (!this) {
            return;
        }
        let currentUp = BABYLON.Vector3.Normalize(BABYLON.Vector3.TransformNormal(BABYLON.Axis.Y, this.getWorldMatrix()));
        let correctionAxis = BABYLON.Vector3.Cross(currentUp, this.upDirection);
        let correctionAngle = Math.abs(Math.asin(correctionAxis.length()));
        let gFactor = 1 - (this.altitudeOnPlanet / 300);
        gFactor = Math.max(Math.min(gFactor, 1), 0);
        gFactor = gFactor * gFactor;
        if (correctionAngle > 0.001) {
            let rotation = BABYLON.Quaternion.RotationAxis(correctionAxis, gFactor * correctionAngle / 10);
            this.rotationQuaternion = rotation.multiply(this.rotationQuaternion);
        }
    }
}
var ACTIVE_DEBUG_PLAYER_ACTION = true;
var ADD_BRICK_ANIMATION_DURATION = 1000;
class PlayerActionTemplate {
    static async CreateBlockAction(player, blockType) {
        let action = new PlayerAction("cube-", player);
        let previewMesh;
        action.iconUrl = "/datas/images/block-icon-" + BlockTypeNames[blockType] + "-miniature.png";
        let vData = (await player.main.vertexDataLoader.get("chunck-part"))[0];
        let lastSize;
        let lastI;
        let lastJ;
        let lastK;
        action.onUpdate = () => {
            let ray = new BABYLON.Ray(player.camPos.absolutePosition, player.camPos.forward);
            let hit = ray.intersectsMeshes(player.meshes);
            hit = hit.sort((h1, h2) => { return h1.distance - h2.distance; });
            if (hit[0] && hit[0].pickedPoint) {
                let n = hit[0].getNormal(true).scaleInPlace(0.2);
                let localIJK = PlanetTools.WorldPositionToLocalIJK(player.planet, hit[0].pickedPoint.add(n));
                if (localIJK) {
                    // Redraw block preview
                    if (!previewMesh) {
                        previewMesh = BABYLON.MeshBuilder.CreateSphere("preview-mesh", { diameter: 1 });
                        let material = new BABYLON.StandardMaterial("material");
                        material.alpha = 0.25;
                        previewMesh.material = material;
                    }
                    let globalIJK = PlanetTools.LocalIJKToGlobalIJK(localIJK);
                    let needRedrawMesh = false;
                    if (lastSize != localIJK.planetChunck.size) {
                        lastSize = localIJK.planetChunck.size;
                        needRedrawMesh = true;
                    }
                    if (lastI != localIJK.i) {
                        lastI = localIJK.i;
                        needRedrawMesh = true;
                    }
                    if (lastJ != localIJK.j) {
                        lastJ = localIJK.j;
                        needRedrawMesh = true;
                    }
                    if (lastK != localIJK.k) {
                        lastK = localIJK.k;
                        needRedrawMesh = true;
                    }
                    if (needRedrawMesh) {
                        PlanetTools.SkewVertexData(vData, localIJK.planetChunck.size, globalIJK.i, globalIJK.j, globalIJK.k).applyToMesh(previewMesh);
                        previewMesh.parent = localIJK.planetChunck.planetSide;
                    }
                    return;
                }
            }
            if (previewMesh) {
                previewMesh.dispose();
                previewMesh = undefined;
            }
        };
        action.onClick = () => {
            let ray = new BABYLON.Ray(player.camPos.absolutePosition, player.camPos.forward);
            let hit = ray.intersectsMeshes(player.meshes);
            hit = hit.sort((h1, h2) => { return h1.distance - h2.distance; });
            if (hit[0] && hit[0].pickedPoint) {
                let n = hit[0].getNormal(true).scaleInPlace(0.2);
                let localIJK = PlanetTools.WorldPositionToLocalIJK(player.planet, hit[0].pickedPoint.add(n));
                if (localIJK) {
                    localIJK.planetChunck.SetData(localIJK.i, localIJK.j, localIJK.k, blockType);
                    localIJK.planetChunck.planetSide.planet.chunckManager.requestDraw(localIJK.planetChunck, localIJK.planetChunck.lod, "PlayerAction.onClick");
                }
            }
        };
        action.onUnequip = () => {
            if (previewMesh) {
                previewMesh.dispose();
                previewMesh = undefined;
            }
        };
        return action;
    }
}
class PlayerAction {
    constructor(name, player) {
        this.name = name;
        this.player = player;
        this.r = 0;
    }
}
class PlayerActionManager {
    constructor(player, game) {
        this.player = player;
        this.game = game;
        this.linkedActions = [];
        this.hintedSlotIndex = new UniqueList();
        this.update = () => {
            if (this.hintedSlotIndex.length > 0) {
                let t = (new Date()).getTime();
                let thickness = Math.cos(2 * Math.PI * t / 1000) * 2 + 3;
                let opacity = (Math.cos(2 * Math.PI * t / 1000) + 1) * 0.5 * 0.5 + 0.25;
                for (let i = 0; i < this.hintedSlotIndex.length; i++) {
                    let slotIndex = this.hintedSlotIndex.get(i);
                    console.log(thickness);
                    document.querySelector("#player-action-" + slotIndex).style.backgroundColor = "rgba(255, 255, 255, " + opacity.toFixed(2) + ")";
                }
            }
        };
    }
    initialize() {
        Main.Scene.onBeforeRenderObservable.add(this.update);
        this.game.inputManager.addKeyDownListener((e) => {
            let slotIndex = e;
            if (slotIndex >= 0 && slotIndex < 10) {
                if (!document.pointerLockElement) {
                    this.startHint(slotIndex);
                }
            }
        });
        this.game.inputManager.addKeyUpListener((e) => {
            let slotIndex = e;
            this.equipAction(slotIndex);
        });
        for (let i = 0; i < 10; i++) {
            let slotIndex = i;
            document.querySelector("#player-action-" + slotIndex).addEventListener("touchend", () => {
                this.equipAction(slotIndex);
            });
        }
    }
    linkAction(action, slotIndex) {
        if (slotIndex >= 0 && slotIndex <= 9) {
            this.linkedActions[slotIndex] = action;
            console.log(slotIndex + " " + action.iconUrl);
            document.querySelector("#player-action-" + slotIndex + " .icon").src = action.iconUrl;
        }
    }
    unlinkAction(slotIndex) {
        if (slotIndex >= 0 && slotIndex <= 9) {
            this.linkedActions[slotIndex] = undefined;
            document.querySelector("#player-action-" + slotIndex + " .icon").src = "";
        }
    }
    equipAction(slotIndex) {
        if (slotIndex >= 0 && slotIndex < 10) {
            this.stopHint(slotIndex);
            for (let i = 0; i < 10; i++) {
                document.querySelector("#player-action-" + i + " .background").src = "/datas/images/inventory-item-background.svg";
            }
            // Unequip current action
            if (this.player.currentAction) {
                if (this.player.currentAction.onUnequip) {
                    this.player.currentAction.onUnequip();
                }
            }
            if (this.linkedActions[slotIndex]) {
                // If request action was already equiped, remove it.
                if (this.player.currentAction === this.linkedActions[slotIndex]) {
                    this.player.currentAction = undefined;
                }
                // Otherwise, equip new action.
                else {
                    this.player.currentAction = this.linkedActions[slotIndex];
                    if (this.player.currentAction) {
                        document.querySelector("#player-action-" + slotIndex + " .background").src = "/datas/images/inventory-item-background-highlit.svg";
                        if (this.player.currentAction.onEquip) {
                            this.player.currentAction.onEquip();
                        }
                    }
                }
            }
            else {
                this.player.currentAction = undefined;
            }
        }
    }
    startHint(slotIndex) {
        this.hintedSlotIndex.push(slotIndex);
    }
    stopHint(slotIndex) {
        this.hintedSlotIndex.remove(slotIndex);
        document.querySelector("#player-action-" + slotIndex).style.backgroundColor = "";
    }
    serialize() {
        let linkedActionsNames = [];
        for (let i = 0; i < this.linkedActions.length; i++) {
            if (this.linkedActions[i]) {
                linkedActionsNames[i] = this.linkedActions[i].name;
            }
        }
        return {
            linkedActionsNames: linkedActionsNames
        };
    }
    deserialize(data) {
        if (data && data.linkedActionsNames) {
            for (let i = 0; i < data.linkedActionsNames.length; i++) {
                let linkedActionName = data.linkedActionsNames[i];
                //let item = this.player.inventory.getItemByPlayerActionName(linkedActionName);
                //if (item) {
                //    this.linkAction(item.playerAction, i);
                //    item.timeUse = (new Date()).getTime();
                //}
            }
        }
    }
}
var HandMode;
(function (HandMode) {
    HandMode[HandMode["Idle"] = 0] = "Idle";
    HandMode[HandMode["Point"] = 1] = "Point";
    HandMode[HandMode["PointPress"] = 2] = "PointPress";
    HandMode[HandMode["Grab"] = 3] = "Grab";
    HandMode[HandMode["Like"] = 4] = "Like";
})(HandMode || (HandMode = {}));
var HandTargetAnchor;
(function (HandTargetAnchor) {
    HandTargetAnchor[HandTargetAnchor["ThumbTip"] = 0] = "ThumbTip";
    HandTargetAnchor[HandTargetAnchor["IndexTip"] = 1] = "IndexTip";
    HandTargetAnchor[HandTargetAnchor["MiddleTip"] = 2] = "MiddleTip";
    HandTargetAnchor[HandTargetAnchor["RingTip"] = 3] = "RingTip";
    HandTargetAnchor[HandTargetAnchor["PinkieTip"] = 4] = "PinkieTip";
    HandTargetAnchor[HandTargetAnchor["Palm"] = 5] = "Palm";
    HandTargetAnchor[HandTargetAnchor["Knucles"] = 6] = "Knucles";
})(HandTargetAnchor || (HandTargetAnchor = {}));
class PlayerArm extends BABYLON.Mesh {
    constructor(isLeftArm = true, scene) {
        super("player-arm", scene);
        this.isLeftArm = isLeftArm;
        this.targetPosition = BABYLON.Vector3.Zero();
        //public targetOffset: BABYLON.Vector3 = BABYLON.Vector3.Zero();
        this.targetUp = BABYLON.Vector3.Up();
        this.targetAnchor = HandTargetAnchor.Palm;
        this._rotationSpeed = [0, 0, 0];
        this._armLength = 0.34;
        this._foreArmLength = 0.35;
        this._handLength = 0.22;
        this._wristLength = this._armLength + this._foreArmLength;
        this._elbowToTargetLength = this._foreArmLength + this._handLength;
        this._fullLength = this._armLength + this._foreArmLength + this._handLength;
        this._fingersLength = [
            [0.043, 0.042, 0.04],
            [0.040, 0.038, 0.035],
            [0.044, 0.042, 0.035],
            [0.040, 0.038, 0.035],
            [0.030, 0.028, 0.03]
        ];
        this._palmLocalPos = new BABYLON.Vector3(0, -0.01, 0.088);
        this._knucklesLocalPos = new BABYLON.Vector3(0, 0.02, 0.09);
        this.handUp = new BABYLON.Vector3(-0.5, 1, 0);
        this.handUpStrictness = 0;
        this.handMode = HandMode.Point;
        this._elbowPosition = BABYLON.Vector3.Zero();
        this._wristPosition = BABYLON.Vector3.Zero();
        this._v0 = BABYLON.Vector3.Zero();
        this._v1 = BABYLON.Vector3.Zero();
        this._v2 = BABYLON.Vector3.Zero();
        this._q0 = BABYLON.Quaternion.Identity();
        this._computedHandQ = BABYLON.Quaternion.Identity();
        this._anchor = BABYLON.Vector3.Zero();
        this._update = () => {
            let dt = this.scene.getEngine().getDeltaTime() / 1000;
            this.updateHandUp();
            this.updateHandUpStrictness();
            this.updateTargetAnchor();
            this.updateGrabness();
            this.updateSpreadness();
            if (DebugDefine.SHOW_PLAYER_ARM_CURRENT_TARGET) {
                if (!this._debugCurrentTarget) {
                    this._debugCurrentTarget = BABYLON.MeshBuilder.CreateSphere("debug-current-target", { diameter: 0.03 }, this.getScene());
                    let material = new BABYLON.StandardMaterial("material", this.getScene());
                    material.alpha = 0.5;
                    this._debugCurrentTarget.material = material;
                }
                this._debugCurrentTarget.position.copyFrom(this.targetPosition);
            }
            this._arm.position.copyFrom(this.absolutePosition);
            this._elbowPosition.copyFromFloats(-this.signLeft * 0.1, -this._armLength * 0.5, 0);
            VMath.RotateVectorByQuaternionToRef(this._elbowPosition, this.rotationQuaternion, this._elbowPosition);
            this._elbowPosition.addInPlace(this._arm.absolutePosition);
            this._wristPosition.copyFrom(this._elbowPosition).addInPlace(this.targetPosition).scaleInPlace(0.5);
            let dHand = this.getAnchorPosition().subtract(this._hand.absolutePosition);
            let handLength = dHand.length();
            let correction = this.getAnchorPosition().subtract(this._hand.absolutePosition.add(this._hand.forward.scale(handLength)));
            let currentTarget = this.targetPosition.subtract(correction);
            let armZ = this._v0;
            let foreArmZ = this._v1;
            let handZ = this._v2;
            for (let i = 0; i < 3; i++) {
                handZ.copyFrom(currentTarget).subtractInPlace(this._wristPosition).normalize().scaleInPlace(handLength);
                this._wristPosition.copyFrom(currentTarget).subtractInPlace(handZ);
                foreArmZ.copyFrom(this._wristPosition).subtractInPlace(this._elbowPosition).normalize().scaleInPlace(this._foreArmLength);
                this._elbowPosition.copyFrom(this._wristPosition).subtractInPlace(foreArmZ);
                armZ.copyFrom(this._elbowPosition).subtractInPlace(this._arm.absolutePosition).normalize().scaleInPlace(this._armLength);
                this._elbowPosition.copyFrom(this._arm.absolutePosition).addInPlace(armZ);
                foreArmZ.copyFrom(this._wristPosition).subtractInPlace(this._elbowPosition).normalize().scaleInPlace(this._foreArmLength);
                this._wristPosition.copyFrom(this._elbowPosition).subtractInPlace(foreArmZ);
            }
            this._wristPosition.copyFrom(this._elbowPosition).addInPlace(foreArmZ);
            let magicNumber2 = 1 - Easing.smooth025Sec(this.scene.getEngine().getFps());
            let armY = this.right.scaleInPlace(-this.signLeft * 1);
            VMath.QuaternionFromZYAxisToRef(armZ, armY, this._q0);
            BABYLON.Quaternion.SlerpToRef(this._arm.rotationQuaternion, this._q0, magicNumber2, this._arm.rotationQuaternion);
            this._foreArm.position.copyFromFloats(0, 0, this._armLength);
            VMath.RotateVectorByQuaternionToRef(this._foreArm.position, this._arm.rotationQuaternion, this._foreArm.position);
            this._foreArm.position.addInPlace(this._arm.position);
            let foreArmX = armZ.scale(-1 * this.signLeft);
            VMath.QuaternionFromZXAxisToRef(foreArmZ, foreArmX, this._q0);
            BABYLON.Quaternion.SlerpToRef(this._foreArm.rotationQuaternion, this._q0, magicNumber2, this._foreArm.rotationQuaternion);
            this._elbow.position.copyFrom(this._foreArm.position);
            let elbowX = foreArmZ.scale(this.signLeft);
            let elbowZ = armZ;
            VMath.QuaternionFromZXAxisToRef(elbowZ, elbowX, this._elbow.rotationQuaternion);
            this._hand.position.copyFromFloats(0, 0, this._foreArmLength);
            VMath.RotateVectorByQuaternionToRef(this._hand.position, this._foreArm.rotationQuaternion, this._hand.position);
            this._hand.position.addInPlace(this._foreArm.position);
            let handY = this.handUp;
            if (this.handUpStrictness < 0.5) {
                VMath.QuaternionFromZYAxisToRef(handZ, handY, this._computedHandQ);
                BABYLON.Quaternion.SlerpToRef(this._hand.rotationQuaternion, this._computedHandQ, magicNumber2, this._hand.rotationQuaternion);
            }
            else {
                VMath.QuaternionFromYZAxisToRef(handY, handZ, this._computedHandQ);
                BABYLON.Quaternion.SlerpToRef(this._hand.rotationQuaternion, this._computedHandQ, magicNumber2, this._hand.rotationQuaternion);
            }
            this._wrist.position.copyFrom(this._hand.position);
            let wristZ = foreArmZ;
            let wristY = this._hand.up;
            VMath.QuaternionFromZYAxisToRef(wristZ, wristY, this._wrist.rotationQuaternion);
        };
    }
    get wristLength() {
        return this._wristLength;
    }
    get fullLength() {
        return this._fullLength;
    }
    get signLeft() {
        return this.isLeftArm ? 1 : -1;
    }
    get scene() {
        return this._scene;
    }
    initialize() {
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        let mat = new ToonMaterial("player-arm-material", this.scene);
        this._arm = new BABYLON.Mesh("arm");
        this._arm.material = mat;
        this._arm.rotationQuaternion = BABYLON.Quaternion.Identity();
        this._elbow = new BABYLON.Mesh("elbow");
        this._elbow.material = mat;
        //this._elbow.parent = this._arm;
        //this._elbow.position.z = this._armLength;
        this._elbow.rotationQuaternion = BABYLON.Quaternion.Identity();
        this._foreArm = new BABYLON.Mesh("foreArm");
        this._foreArm.material = mat;
        //this._foreArm.parent = this._arm;
        //this._foreArm.position.z = this._armLength;
        this._foreArm.rotationQuaternion = BABYLON.Quaternion.Identity();
        this._wrist = new BABYLON.Mesh("wrist");
        this._wrist.material = mat;
        //this._wrist.parent = this._foreArm;
        //this._wrist.position.z = this._foreArmLength;
        this._wrist.rotationQuaternion = BABYLON.Quaternion.Identity();
        this._hand = new BABYLON.Mesh("hand");
        this._hand.material = mat;
        //this._hand.parent = this._wrist;
        //this._hand.position.z = 0;
        this._hand.rotationQuaternion = BABYLON.Quaternion.Identity();
        this._fingers = [];
        this._fingers[0] = [];
        this._fingers[0][0] = new BABYLON.Mesh("finger-0-0");
        this._fingers[0][0].material = mat;
        this._fingers[0][0].parent = this._hand;
        this._fingers[0][0].position.copyFromFloats(this.signLeft * 0.035, -0.01, 0.01);
        let thumbY = BABYLON.Vector3.Right().scale(this.signLeft);
        let thumbZ = (new BABYLON.Vector3(1 * this.signLeft, -1, 1)).normalize();
        let thumbX = BABYLON.Vector3.Cross(thumbY, thumbZ);
        thumbY = BABYLON.Vector3.Cross(thumbZ, thumbX);
        this._fingers[0][0].rotationQuaternion = BABYLON.Quaternion.RotationQuaternionFromAxis(thumbX, thumbY, thumbZ);
        for (let i = 1; i <= 4; i++) {
            this._fingers[i] = [];
            this._fingers[i][0] = new BABYLON.Mesh("finger-" + i.toFixed(0) + "-0");
            this._fingers[i][0].material = mat;
            this._fingers[i][0].parent = this._hand;
            //this._fingers[i][0].rotationQuaternion = BABYLON.Quaternion.Identity();
        }
        this._fingers[1][0].position.copyFromFloats(this.signLeft * 0.034, 0.005, 0.087);
        this._fingers[2][0].position.copyFromFloats(this.signLeft * 0.012, 0.01, 0.088);
        this._fingers[3][0].position.copyFromFloats(-this.signLeft * 0.01, 0.01, 0.086);
        this._fingers[4][0].position.copyFromFloats(-this.signLeft * 0.033, 0.005, 0.079);
        for (let i = 0; i <= 4; i++) {
            for (let j = 1; j <= 3; j++) {
                this._fingers[i][j] = new BABYLON.Mesh("finger-" + i.toFixed(0) + "-" + j.toFixed(0));
                if (j < 3) {
                    this._fingers[i][j].material = mat;
                }
                this._fingers[i][j].parent = this._fingers[i][j - 1];
                this._fingers[i][j].position.z = this._fingersLength[i][j - 1];
                //this._fingers[i][j].rotationQuaternion = BABYLON.Quaternion.Identity();
            }
        }
        this.setFingerGrabiness(1, 0.1);
        this.setFingerGrabiness(2, 0.35);
        this.setFingerGrabiness(3, 0.5);
        this.setFingerGrabiness(4, 0.65);
        this._fingers[0][1].rotation.x = this.signLeft * 0.6 * Math.PI * 0.5;
        this._fingers[0][2].rotation.x = this.signLeft * 0.6 * Math.PI * 0.5;
        this.scene.onBeforeRenderObservable.add(this._update);
    }
    async instantiate() {
        let data = await VertexDataLoader.instance.get("arm");
        if (!this.isLeftArm) {
            data = data.map(d => { return VertexDataUtils.MirrorX(d); });
        }
        data[0].applyToMesh(this._arm);
        data[1].applyToMesh(this._elbow);
        data[2].applyToMesh(this._foreArm);
        data[3].applyToMesh(this._wrist);
        data[4].applyToMesh(this._hand);
        VertexDataUtils.Scale(data[5], this._fingersLength[0][0] / 0.05).applyToMesh(this._fingers[0][0]);
        for (let i = 1; i <= 4; i++) {
            VertexDataUtils.Scale(data[5], this._fingersLength[i][0] / 0.045).applyToMesh(this._fingers[i][0]);
        }
        for (let i = 0; i <= 4; i++) {
            for (let j = 1; j < 3; j++) {
                VertexDataUtils.Scale(data[j === 1 ? 5 : 6], this._fingersLength[i][j] / (j === 1 ? 0.045 : 0.04)).applyToMesh(this._fingers[i][j]);
            }
        }
    }
    setTarget(newTarget) {
        this.targetPosition.copyFrom(newTarget);
    }
    setFingerGrabiness(fingerIndex, grabiness) {
        let a = grabiness * Math.PI * 0.5;
        this._fingers[fingerIndex][0].rotation.x = a;
        this._fingers[fingerIndex][1].rotation.x = a;
        this._fingers[fingerIndex][2].rotation.x = a;
    }
    setHandMode(mode) {
        if (this.handMode != mode) {
            this.handMode = mode;
            this.animateToGrabness(mode);
            this.animateToSpreadness(mode);
        }
    }
    async _animateGrabness(fingerIndex, grabinessTarget, duration) {
        return new Promise(resolve => {
            let grabinessZero = this._fingers[fingerIndex][0].rotation.x / (Math.PI * 0.5);
            let t = 0;
            let cb = () => {
                t += this.scene.getEngine().getDeltaTime() / 1000;
                if (t < duration) {
                    let f = t / duration;
                    this.setFingerGrabiness(fingerIndex, grabinessZero * (1 - f) + grabinessTarget * f);
                }
                else {
                    this.setFingerGrabiness(fingerIndex, grabinessTarget);
                    this.scene.onBeforeRenderObservable.removeCallback(cb);
                    resolve();
                }
            };
            this.scene.onBeforeRenderObservable.add(cb);
        });
    }
    updateHandUp() {
        if (this.handMode === HandMode.Point || this.handMode === HandMode.PointPress) {
            let delta = this.targetPosition.subtract(this.position);
            let dx = this.signLeft * BABYLON.Vector3.Dot(delta, this.right) / this._fullLength;
            let target = new BABYLON.Vector3(dx, 1, 0);
            VMath.RotateVectorByQuaternionToRef(target, this.rotationQuaternion, target);
            target.normalize();
            this.handUp.copyFrom(target);
        }
        else if (this.handMode === HandMode.Grab) {
        }
        else if (this.handMode === HandMode.Like) {
            this.handUp.copyFromFloats(-this.signLeft * 1, 0, 0);
        }
        else if (this.handMode === HandMode.Idle) {
            let target = new BABYLON.Vector3(-this.signLeft * 1, 0, 0);
            VMath.RotateVectorByQuaternionToRef(target, this.rotationQuaternion, target);
            this.handUp.copyFrom(target);
        }
    }
    updateHandUpStrictness() {
        if (this.handMode === HandMode.Grab) {
            this.handUpStrictness = 1;
        }
        else {
            this.handUpStrictness = 0;
        }
    }
    updateTargetAnchor() {
        if (this.handMode === HandMode.Point || this.handMode === HandMode.PointPress) {
            this.targetAnchor = HandTargetAnchor.IndexTip;
        }
        else if (this.handMode === HandMode.Grab) {
            this.targetAnchor = HandTargetAnchor.Palm;
        }
        else {
            this.targetAnchor = HandTargetAnchor.Palm;
        }
    }
    getAnchorPosition() {
        if (this.targetAnchor <= HandTargetAnchor.PinkieTip) {
            return this._fingers[this.targetAnchor][3].absolutePosition;
        }
        else if (this.targetAnchor === HandTargetAnchor.Palm) {
            let m = BABYLON.Matrix.Compose(BABYLON.Vector3.One(), this._computedHandQ, this._hand.absolutePosition);
            return BABYLON.Vector3.TransformCoordinates(this._palmLocalPos, m);
        }
        else if (this.targetAnchor === HandTargetAnchor.Knucles) {
            let m = BABYLON.Matrix.Compose(BABYLON.Vector3.One(), this._computedHandQ, this._hand.absolutePosition);
            return BABYLON.Vector3.TransformCoordinates(this._knucklesLocalPos, m);
        }
    }
    animateToGrabness(mode) {
        if (mode === HandMode.Point) {
            this._animateGrabness(0, 0.6, 0.6);
            this._animateGrabness(1, 0.1, 0.6);
            this._animateGrabness(2, 0.35, 0.6);
            this._animateGrabness(3, 0.5, 0.6);
            this._animateGrabness(4, 0.65, 0.6);
        }
        else if (mode === HandMode.PointPress) {
            this._animateGrabness(0, 0.7, 0.2);
            this._animateGrabness(1, 0, 0.2);
            this._animateGrabness(2, 0.45, 0.2);
            this._animateGrabness(3, 0.6, 0.2);
            this._animateGrabness(4, 0.75, 0.2);
        }
        else if (mode === HandMode.Grab) {
            this._animateGrabness(0, 0.1, 0.6);
            this._animateGrabness(1, 0.1, 0.6);
            this._animateGrabness(2, 0.1, 0.6);
            this._animateGrabness(3, 0.1, 0.6);
            this._animateGrabness(4, 0.1, 0.6);
        }
        else if (mode === HandMode.Like) {
            this._animateGrabness(0, 0, 0.6);
            this._animateGrabness(1, 1, 0.6);
            this._animateGrabness(2, 1, 0.6);
            this._animateGrabness(3, 1, 0.6);
            this._animateGrabness(4, 1, 0.6);
        }
        else {
            this._animateGrabness(0, 0.2, 0.6);
            this._animateGrabness(1, 0.2, 0.6);
            this._animateGrabness(2, 0.2, 0.6);
            this._animateGrabness(3, 0.2, 0.6);
            this._animateGrabness(4, 0.2, 0.6);
        }
    }
    updateGrabness() {
    }
    animateToSpreadness(mode, duration = 1) {
    }
    updateSpreadness() {
    }
}
var ArmManagerMode;
(function (ArmManagerMode) {
    ArmManagerMode[ArmManagerMode["Idle"] = 0] = "Idle";
    ArmManagerMode[ArmManagerMode["Aim"] = 1] = "Aim";
    ArmManagerMode[ArmManagerMode["Lean"] = 2] = "Lean";
})(ArmManagerMode || (ArmManagerMode = {}));
class PlayerArmManager {
    constructor(player) {
        this.player = player;
        this._tmpDP = BABYLON.Vector3.Zero();
        this._dpLeftArm = BABYLON.Vector3.Zero();
        this._dpRightArm = BABYLON.Vector3.Zero();
        this.mode = ArmManagerMode.Idle;
        this._update = () => {
            this._dpLeftArm.copyFrom(this.leftArm.position);
            BABYLON.Vector3.TransformCoordinatesToRef(new BABYLON.Vector3(-0.2, 1.6, 0), this.player.getWorldMatrix(), this._tmpDP);
            this.leftArm.position.copyFrom(this._tmpDP);
            this._dpLeftArm.subtractInPlace(this.leftArm.position).scaleInPlace(-1);
            this.leftArm.rotationQuaternion.copyFrom(this.player.rotationQuaternion);
            this.leftArm.targetPosition.addInPlace(this._dpLeftArm);
            this._dpRightArm.copyFrom(this.rightArm.position);
            BABYLON.Vector3.TransformCoordinatesToRef(new BABYLON.Vector3(0.2, 1.6, 0), this.player.getWorldMatrix(), this._tmpDP);
            this.rightArm.position.copyFrom(this._tmpDP);
            this._dpRightArm.subtractInPlace(this.rightArm.position).scaleInPlace(-1);
            this.rightArm.rotationQuaternion.copyFrom(this.player.rotationQuaternion);
            this.rightArm.targetPosition.addInPlace(this._dpRightArm);
            if (this.mode === ArmManagerMode.Idle) {
                this._updateIdle();
            }
            else if (this.mode === ArmManagerMode.Aim) {
                this._updateAim();
            }
        };
        this._aimingDistance = 0.1;
    }
    other(arm) {
        if (arm === this.leftArm) {
            return this.rightArm;
        }
        return this.leftArm;
    }
    get inputManager() {
        return this.player.inputManager;
    }
    initialize() {
        this.leftArm = new PlayerArm(true, this.player.scene);
        this.leftArm.initialize();
        this.leftArm.instantiate();
        this.rightArm = new PlayerArm(false, this.player.scene);
        this.rightArm.initialize();
        this.rightArm.instantiate();
        this.player.scene.onBeforeRenderObservable.add(this._update);
    }
    dispose() {
        this.leftArm.dispose();
        this.rightArm.dispose();
        this.player.scene.onBeforeRenderObservable.removeCallback(this._update);
    }
    _updateIdle() {
        if (this.inputManager.aimedPosition) {
            this.mode = ArmManagerMode.Aim;
            return;
        }
        if (this.leftArm.handMode != HandMode.Idle) {
            this.leftArm.setHandMode(HandMode.Idle);
        }
        if (this.rightArm.handMode != HandMode.Idle) {
            this.rightArm.setHandMode(HandMode.Idle);
        }
        this._updateRequestedTargetIdle(this.leftArm);
        this._updateRequestedTargetIdle(this.rightArm);
    }
    _updateRequestedTargetIdle(arm) {
        let dP = 2 * this.player.scene.getEngine().getDeltaTime() / 1000;
        if (arm === this.leftArm) {
            let target = new BABYLON.Vector3(-0.1, -this.leftArm.wristLength, 0);
            target.normalize().scaleInPlace(this.leftArm.wristLength);
            target = BABYLON.Vector3.TransformCoordinates(target, this.leftArm.getWorldMatrix());
            this.leftArm.targetPosition.copyFrom(target);
        }
        else {
            let target = new BABYLON.Vector3(0.1, -this.rightArm.wristLength, 0);
            target.normalize().scaleInPlace(this.rightArm.wristLength);
            target = BABYLON.Vector3.TransformCoordinates(target, this.rightArm.getWorldMatrix());
            this.rightArm.targetPosition.copyFrom(target);
        }
    }
    _updateAim() {
        if (!this.inputManager.aimedPosition) {
            this.mode = ArmManagerMode.Idle;
            return;
        }
        // 1 - Track which arm should be used.
        if (!this._aimingArm) {
            this._aimingArm = this.rightArm;
        }
        let dx = BABYLON.Vector3.Dot(this.inputManager.aimedPosition, this.player.right);
        if (this._aimingArm === this.leftArm && dx > 0.1) {
            this._aimingArm = this.rightArm;
            if (this.leftArm.handMode != HandMode.Idle) {
                this.leftArm.setHandMode(HandMode.Idle);
            }
        }
        else if (this._aimingArm === this.rightArm && dx < -0.1) {
            this._aimingArm = this.leftArm;
            if (this.rightArm.handMode != HandMode.Idle) {
                this.rightArm.setHandMode(HandMode.Idle);
            }
        }
        let aimedPointClose = BABYLON.Vector3.Zero();
        VMath.StepToRef(this.player.camPos.absolutePosition.add(this._aimingArm.absolutePosition).scale(0.5), this.inputManager.aimedPosition, 0.9, aimedPointClose);
        // 2 - Update the way the hand should interact depending on aimed object.
        if (this.inputManager.aimedElement.interactionMode === InteractionMode.Point) {
            if (this._aimingArm.handMode != HandMode.Point && this._aimingArm.handMode != HandMode.PointPress) {
                this._aimingArm.setHandMode(HandMode.Point);
            }
        }
        else if (this.inputManager.aimedElement.interactionMode === InteractionMode.Grab) {
            if (this._aimingArm.handMode != HandMode.Grab) {
                this._aimingArm.setHandMode(HandMode.Grab);
            }
        }
        // 3 - Update arm target position.
        this._aimingArm.setTarget(aimedPointClose.add(this.inputManager.aimedNormal.scale(this._aimingDistance)));
        if (this._aimingArm.handMode === HandMode.Grab) {
            this._aimingArm.targetUp.copyFrom(this.inputManager.aimedNormal);
        }
        this._updateRequestedTargetIdle(this.other(this._aimingArm));
    }
    async startActionAnimation(actionCallback) {
        if (this._aimingArm) {
            this._aimingArm.setHandMode(HandMode.PointPress);
            await this._animateAimingDistance(0.01, 0.3);
            if (actionCallback) {
                actionCallback();
            }
            this._aimingArm.setHandMode(HandMode.Point);
            await this._animateAimingDistance(0.1, 0.3);
        }
    }
    async _animateAimingDistance(distanceTarget, duration = 1) {
        if (this.player.scene) {
            if (this._animateAimingDistanceCB) {
                this.player.scene.onBeforeRenderObservable.removeCallback(this._animateAimingDistanceCB);
            }
            return new Promise(resolve => {
                let distanceZero = this._aimingDistance;
                let t = 0;
                this._animateAimingDistanceCB = () => {
                    t += this.player.scene.getEngine().getDeltaTime() / 1000;
                    if (t < duration) {
                        let f = t / duration;
                        this._aimingDistance = distanceZero * (1 - f) + distanceTarget * f;
                    }
                    else {
                        this._aimingDistance = distanceTarget;
                        this.player.scene.onBeforeRenderObservable.removeCallback(this._animateAimingDistanceCB);
                        this._animateAimingDistanceCB = undefined;
                        resolve();
                    }
                };
                this.player.scene.onBeforeRenderObservable.add(this._animateAimingDistanceCB);
            });
        }
    }
}
class SPosition {
    constructor(x = 0, y = 0, textAlign = "start") {
        this.x = x;
        this.y = y;
        this.textAlign = textAlign;
    }
}
class SRect {
    constructor(x0 = 0, y0 = 0, x1 = 0, y1 = 0) {
        this.x0 = x0;
        this.y0 = y0;
        this.x1 = x1;
        this.y1 = y1;
    }
    static WidthHeight(x, y, w, h) {
        return new SRect(x, y, x + w, y + h);
    }
    static MinMax(xMin, yMin, xMax, yMax) {
        return new SRect(xMin, yMin, xMax, yMax);
    }
}
class SArc {
    constructor(r = 10, a0 = 0, a1 = 2 * Math.PI) {
        this.r = r;
        this.a0 = a0;
        this.a1 = a1;
    }
}
class SPoints {
    constructor(points = [], close = false) {
        this.points = points;
        this.close = close;
    }
    scaleInPlace(s) {
        this.points = this.points.map(p => { return p * s; });
        return this;
    }
}
class SlikaShapeStyle {
    constructor(stroke = "white", _strokeAlpha = 1, fill = "none", _fillAlpha = 1, width = 1, highlightColor = "white", highlightRadius = 20) {
        this.stroke = stroke;
        this._strokeAlpha = _strokeAlpha;
        this.fill = fill;
        this._fillAlpha = _fillAlpha;
        this.width = width;
        this.highlightColor = highlightColor;
        this.highlightRadius = highlightRadius;
        this._strokeAlphaString = "ff";
        this._fillAlphaString = "ff";
        this._strokeAlphaString = Math.floor(this._strokeAlpha * 255).toString(16).padStart(2, "0");
        this._fillAlphaString = Math.floor(this._fillAlpha * 255).toString(16).padStart(2, "0");
    }
    get strokeAlphaString() {
        return this._strokeAlphaString;
    }
    get fillAlphaString() {
        return this._fillAlphaString;
    }
    get strokeAlpha() {
        return this._strokeAlpha;
    }
    set strokeAlpha(a) {
        this._strokeAlpha = a;
        this._strokeAlphaString = Math.floor(this._strokeAlpha * 255).toString(16).padStart(2, "0");
    }
    get fillAlpha() {
        return this._fillAlpha;
    }
    set fillAlpha(a) {
        this._fillAlpha = a;
        this._fillAlphaString = Math.floor(this._fillAlpha * 255).toString(16).padStart(2, "0");
    }
}
class SlikaTextStyle {
    constructor(color = "white", size = 20, fontFamily = "Consolas", highlightColor = "grey", highlightRadius = 20) {
        this.color = color;
        this.size = size;
        this.fontFamily = fontFamily;
        this.highlightColor = highlightColor;
        this.highlightRadius = highlightRadius;
    }
}
class SlikaElement {
    constructor() {
        this.isPickable = false;
        this.display = true;
        this._alpha = 1;
    }
    get alpha() {
        return this._alpha;
    }
    setAlpha(v) {
        this._alpha = v;
    }
    get isVisible() {
        return this.display && this._alpha != 0;
    }
    onHoverStart() { }
    onHoverEnd() { }
    async animateAlpha(alphaTarget, duration = 1) {
        if (this.scene) {
            if (this._animateAlphaCB) {
                this.scene.onBeforeRenderObservable.removeCallback(this._animateAlphaCB);
            }
            return new Promise(resolve => {
                let alphaZero = this.alpha;
                let t = 0;
                this._animateAlphaCB = () => {
                    t += this.scene.getEngine().getDeltaTime() / 1000;
                    if (t < duration) {
                        let f = Easing.easeOutCubic(t / duration);
                        this.setAlpha(alphaZero * (1 - f) + alphaTarget * f);
                        if (this.slika) {
                            this.slika.needRedraw = true;
                        }
                    }
                    else {
                        this.setAlpha(alphaTarget);
                        if (this.slika) {
                            this.slika.needRedraw = true;
                        }
                        this.scene.onBeforeRenderObservable.removeCallback(this._animateAlphaCB);
                        this._animateAlphaCB = undefined;
                        resolve();
                    }
                };
                this.scene.onBeforeRenderObservable.add(this._animateAlphaCB);
            });
        }
    }
}
class Slika {
    constructor(width, height, context, texture) {
        this.width = width;
        this.height = height;
        this.context = context;
        this.texture = texture;
        this.elements = new UniqueList();
        this.pickableElements = new UniqueList();
        this.needRedraw = true;
        this._update = () => {
            if (this.needRedraw) {
                this.redraw();
                if (this.texture) {
                    this.texture.update();
                }
                this.needRedraw = false;
            }
        };
        if (texture) {
            this.texture.getScene().onBeforeRenderObservable.add(this._update);
        }
    }
    add(e) {
        this.elements.push(e);
        if (e.isPickable) {
            this.pickableElements.push(e);
        }
        e.slika = this;
        if (this.texture) {
            e.scene = this.texture.getScene();
        }
        return e;
    }
    remove(e) {
        this.elements.remove(e);
        this.pickableElements.remove(e);
    }
    redraw() {
        this.context.clearRect(0, 0, this.width, this.height);
        for (let i = 0; i < this.elements.length; i++) {
            let e = this.elements.get(i);
            if (e.isVisible) {
                this.elements.get(i).redraw(this.context);
            }
        }
    }
    onPointerEnter(x, y) {
        this.onPointerMove(x, y);
    }
    onPointerMove(x, y) {
        for (let i = 0; i < this.pickableElements.length; i++) {
            let e = this.pickableElements.get(i);
            if (e.isVisible) {
                if (x > e.hitBox.x0 && x < e.hitBox.x1) {
                    if (y > e.hitBox.y0 && y < e.hitBox.y1) {
                        this.setAimedElement(e);
                        return;
                    }
                }
            }
        }
        this.setAimedElement(undefined);
    }
    onPointerDown(x, y) {
        if (this.aimedElement) {
            if (this.aimedElement.onPointerDown) {
                this.aimedElement.onPointerDown();
            }
        }
    }
    onPointerUp(x, y) {
        if (this.aimedElement) {
            if (this.aimedElement.onPointerUp) {
                this.aimedElement.onPointerUp();
            }
        }
    }
    onPointerExit() {
        this.setAimedElement(undefined);
    }
    setAimedElement(e) {
        if (e != this.aimedElement) {
            if (this.aimedElement) {
                this.aimedElement.onHoverEnd();
            }
            this.aimedElement = e;
            if (this.aimedElement) {
                this.aimedElement.onHoverStart();
            }
        }
    }
}
var SlikaButtonState;
(function (SlikaButtonState) {
    SlikaButtonState[SlikaButtonState["Enabled"] = 0] = "Enabled";
    SlikaButtonState[SlikaButtonState["Disabled"] = 1] = "Disabled";
    SlikaButtonState[SlikaButtonState["Active"] = 2] = "Active";
    SlikaButtonState[SlikaButtonState["Red"] = 3] = "Red";
})(SlikaButtonState || (SlikaButtonState = {}));
class SlikaButton extends SlikaElement {
    constructor(label, position, state = SlikaButtonState.Enabled, w = 450, h = 160, fontSize = 80) {
        super();
        this.label = label;
        this.position = position;
        this.state = state;
        this.w = w;
        this.h = h;
        this.fontSize = fontSize;
        this.color = BABYLON.Color3.White();
        this.colors = [
            BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            BABYLON.Color3.FromHexString("#a0bab2"),
            BABYLON.Color3.FromHexString("#cc8a2d"),
            BABYLON.Color3.FromHexString("#ff0000")
        ];
        this._strokes = [];
        this._fills = [];
        this.isPickable = true;
        this.hitBox = SRect.WidthHeight(this.position.x, this.position.y, this.w, this.h);
        this.color.copyFrom(this.colors[this.state]);
        let hexColor = this.color.toHexString();
        this._text = new SlikaText({
            text: label,
            x: this.position.x + w * 0.5,
            y: this.position.y + h * 0.5 + this.fontSize * 0.3,
            textAlign: "center",
            color: this.color,
            fontSize: this.fontSize,
            fontFamily: "XoloniumRegular",
            highlightRadius: 0
        });
        let L1 = w / 3;
        let L2 = 20;
        let L3 = 15;
        let L4 = 10;
        this._strokes.push(new SlikaPath(new SPoints([
            this.position.x, this.position.y,
            this.position.x + 2 * L1, this.position.y,
            this.position.x + 2 * L1 + L2, this.position.y + L2,
            this.position.x + w, this.position.y + L2,
            this.position.x + w, this.position.y + h,
            this.position.x + L1, this.position.y + h,
            this.position.x + L1 - L4, this.position.y + h - L4,
            this.position.x, this.position.y + h - L4,
        ], true), new SlikaShapeStyle(hexColor, 1, "none", 1, 3, hexColor, 6)));
        this._fills.push(new SlikaPath(new SPoints([
            this.position.x, this.position.y + 0.4 * h,
            this.position.x + w, this.position.y + 0.4 * h,
            this.position.x + w, this.position.y + 0.5 * h,
            this.position.x, this.position.y + 0.5 * h,
        ], true), new SlikaShapeStyle("none", 1, hexColor, 0.5, 3, hexColor, 0)));
        this._fills.push(new SlikaPath(new SPoints([
            this.position.x, this.position.y + 0.6 * h,
            this.position.x + w, this.position.y + 0.6 * h,
            this.position.x + w, this.position.y + h,
            this.position.x + L1, this.position.y + h,
            this.position.x + L1 - L4, this.position.y + h - L4,
            this.position.x, this.position.y + h - L4,
        ], true), new SlikaShapeStyle("none", 1, hexColor, 0.5, 3, hexColor, 0)));
        /*
        this._fills.push(
            new SlikaPath(
                new SPoints([
                    5 + this.position.x + w, this.position.y + 2,
                    5 + this.position.x + w + L3, this.position.y + L3 + 2,
                    5 + this.position.x + w + L3, this.position.y + h - L3 - 2,
                    5 + this.position.x + w, this.position.y + h - 2,
                ], true),
                new SlikaShapeStyle("none", 1, hexColor, 0.5, 0, hexColor, 20)
        ));

        this._fills.push(
            new SlikaPath(
                new SPoints([
                    5 + this.position.x + 2 * L1, this.position.y - 1.5,
                    1 + this.position.x + 2 * L1 + L2, this.position.y + L2 - 4,
                    1.5 + this.position.x + w, this.position.y + L2 - 4,
                    1.5 + this.position.x + w, this.position.y - 1.5,
                ], true),
                new SlikaShapeStyle("none", 1, hexColor, 0.5, 0, hexColor, 20)
        ));
        
        this._fills.push(
            new SlikaPath(
                new SPoints([
                    - 5.5 + this.position.x, this.position.y + 1.5,
                    - 5.5 + this.position.x - L4, this.position.y + L4 + 1.5,
                    - 5.5 + this.position.x - L4, this.position.y + h - L4 + 1.5 - 0.5,
                    - 5.5 + this.position.x, this.position.y + h - L4 + 1.5 - 0.5,
                ], true),
                new SlikaShapeStyle("none", 1, hexColor, 0.5, 0, hexColor, 20)
        ));
        */
        /*
        this._fills.push(
            new SlikaPath(
                new SPoints([
                    - 7 + this.position.x, this.position.y + h * 0.5 + 3,
                    - 7 + this.position.x - L3, this.position.y + h * 0.5 + 3,
                    - 7 + this.position.x - L3, this.position.y + h - L3 - L2,
                    - 7 + this.position.x, this.position.y + h - L2,
                ], true),
                new SlikaShapeStyle("none", 1, hexColor, 0.5, 0, hexColor, 20)
        ));
        */
    }
    setAlpha(v) {
        super.setAlpha(v);
        if (this._text) {
            this._text.setAlpha(this.alpha);
        }
        this._strokes.forEach(s => {
            s.setAlpha(this.alpha);
        });
        this._fills.forEach(f => {
            f.setAlpha(this.alpha);
        });
    }
    setStatus(state) {
        this.state = state;
        this._animateColor(this.colors[this.state].clone(), 0.5);
    }
    onHoverStart() {
        let color = this.colors[this.state].clone().scale(1.4);
        color.clampToRef(0, 1, color);
        this._animateColor(color, 0.3);
    }
    onHoverEnd() {
        this._animateColor(this.colors[this.state], 0.3);
    }
    redraw(context) {
        this._fills.forEach(f => {
            f.redraw(context);
        });
        this._strokes.forEach(s => {
            s.redraw(context);
        });
        this._text.redraw(context);
    }
    _updateColor() {
        let hexColor = this.color.toHexString();
        this._fills.forEach(f => {
            f.style.fill = hexColor;
            f.style.highlightColor = hexColor;
        });
        this._strokes.forEach(s => {
            s.style.stroke = hexColor;
            s.style.highlightColor = hexColor;
        });
        this._text.prop.color = this.color;
        if (this.slika) {
            this.slika.needRedraw = true;
        }
    }
    async _animateColor(targetColor, duration = 1) {
        if (this.scene) {
            if (this._animateColorCB) {
                this.scene.onBeforeRenderObservable.removeCallback(this._animateColorCB);
            }
            return new Promise(resolve => {
                let colorZero = this.color.clone();
                let t = 0;
                this._animateColorCB = () => {
                    t += this.scene.getEngine().getDeltaTime() / 1000;
                    if (t < duration) {
                        let f = t / duration;
                        BABYLON.Color3.LerpToRef(colorZero, targetColor, f, this.color);
                        this._updateColor();
                    }
                    else {
                        this.color.copyFrom(targetColor);
                        this._updateColor();
                        this.scene.onBeforeRenderObservable.removeCallback(this._animateColorCB);
                        this._animateColorCB = undefined;
                        resolve();
                    }
                };
                this.scene.onBeforeRenderObservable.add(this._animateColorCB);
            });
        }
    }
}
function DefaultSlikaCircleProperties(prop) {
    if (!prop.color) {
        prop.color = BABYLON.Color3.White();
    }
    if (isNaN(prop.alpha)) {
        prop.alpha = 1;
    }
    if (isNaN(prop.width)) {
        prop.width = 1;
    }
    if (!prop.highlightColor) {
        prop.highlightColor = prop.color.clone();
    }
    if (isNaN(prop.highlightRadius)) {
        prop.highlightRadius = 0;
    }
    if (!prop.outlineColor) {
        prop.outlineColor = BABYLON.Color3.Black();
    }
    if (isNaN(prop.outlineAlpha)) {
        prop.outlineAlpha = 1;
    }
    if (isNaN(prop.outlineWidth)) {
        prop.outlineWidth = 0;
    }
}
class SlikaCircle extends SlikaElement {
    constructor(prop) {
        super();
        this.prop = prop;
        DefaultSlikaCircleProperties(this.prop);
    }
    redraw(context) {
        let hsf = Config.performanceConfiguration.holoScreenFactor;
        let strokeStyle = this.prop.color.toHexString() + Math.floor((this.prop.alpha * this.alpha) * 255).toString(16).padStart(2, "0");
        let outlineStyle = this.prop.outlineColor.toHexString() + Math.floor((this.prop.outlineAlpha * this.alpha) * 255).toString(16).padStart(2, "0");
        context.shadowBlur = this.prop.highlightRadius * hsf;
        context.shadowColor = this.prop.highlightColor.toHexString();
        let lineWidth = this.prop.width * hsf;
        context.beginPath();
        context.arc(this.prop.x * hsf, this.prop.y * hsf, this.prop.r * hsf, 0, 2 * Math.PI, true);
        if (this.prop.outlineWidth > 0) {
            context.lineWidth = lineWidth + this.prop.outlineWidth * 2 * hsf;
            context.strokeStyle = outlineStyle;
            context.stroke();
        }
        context.lineWidth = lineWidth;
        context.strokeStyle = strokeStyle;
        context.stroke();
    }
}
class SlikaImage extends SlikaElement {
    constructor(p = new SPosition(), w, h, url) {
        super();
        this.p = p;
        this.w = w;
        this.h = h;
        this.url = url;
        this._isLoaded = false;
        this.size = 1;
        this._img = new Image();
        this._img.src = url;
        this._img.onload = () => {
            this._isLoaded = true;
        };
    }
    get isVisible() {
        return this.display && this.size != 0;
    }
    redraw(context) {
        let hsf = Config.performanceConfiguration.holoScreenFactor;
        if (this._isLoaded) {
            context.drawImage(this._img, (this.p.x - this.w * 0.5 * this.size) * hsf, (this.p.y - this.h * 0.5 * this.size) * hsf, (this.w * this.size) * hsf, (this.h * this.size) * hsf);
        }
        else {
            requestAnimationFrame(() => {
                this.redraw(context);
            });
        }
    }
    async animateSize(sizeTarget, duration = 1) {
        if (this.scene) {
            if (this._animateSizeCB) {
                this.scene.onBeforeRenderObservable.removeCallback(this._animateSizeCB);
            }
            return new Promise(resolve => {
                let sizeZero = this.size;
                let t = 0;
                this._animateSizeCB = () => {
                    t += this.scene.getEngine().getDeltaTime() / 1000;
                    if (t < duration) {
                        let f = t / duration;
                        this.size = sizeZero * (1 - f) + sizeTarget * f;
                        if (this.slika) {
                            this.slika.needRedraw = true;
                        }
                    }
                    else {
                        this.size = sizeTarget;
                        if (this.slika) {
                            this.slika.needRedraw = true;
                        }
                        this.scene.onBeforeRenderObservable.removeCallback(this._animateSizeCB);
                        this._animateSizeCB = undefined;
                        resolve();
                    }
                };
                this.scene.onBeforeRenderObservable.add(this._animateSizeCB);
            });
        }
    }
}
function DefaultSlikaLineProperties(prop) {
    if (!prop.color) {
        prop.color = BABYLON.Color3.White();
    }
    if (isNaN(prop.alpha)) {
        prop.alpha = 1;
    }
    if (isNaN(prop.width)) {
        prop.width = 1;
    }
    if (!prop.highlightColor) {
        prop.highlightColor = prop.color.clone();
    }
    if (isNaN(prop.highlightRadius)) {
        prop.highlightRadius = 0;
    }
    if (!prop.outlineColor) {
        prop.outlineColor = BABYLON.Color3.Black();
    }
    if (isNaN(prop.outlineAlpha)) {
        prop.outlineAlpha = 1;
    }
    if (isNaN(prop.outlineWidth)) {
        prop.outlineWidth = 0;
    }
}
class SlikaLine extends SlikaElement {
    constructor(prop) {
        super();
        this.prop = prop;
        DefaultSlikaLineProperties(this.prop);
    }
    redraw(context) {
        if (!this.isVisible) {
            return;
        }
        let hsf = Config.performanceConfiguration.holoScreenFactor;
        let strokeStyle = this.prop.color.toHexString() + Math.floor((this.prop.alpha * this.alpha) * 255).toString(16).padStart(2, "0");
        let outlineStyle = this.prop.outlineColor.toHexString() + Math.floor((this.prop.outlineAlpha * this.alpha) * 255).toString(16).padStart(2, "0");
        context.shadowBlur = this.prop.highlightRadius * hsf;
        context.shadowColor = this.prop.highlightColor.toHexString();
        let lineWidth = this.prop.width * hsf;
        let dx = this.prop.x1 - this.prop.x0;
        let dy = this.prop.y1 - this.prop.y0;
        let l = Math.sqrt(dx * dx + dy * dy);
        let ux = dx / l;
        let uy = dy / l;
        if (this.prop.outlineWidth > 0) {
            context.beginPath();
            context.moveTo((this.prop.x0 - ux * this.prop.outlineWidth) * hsf, (this.prop.y0 - uy * this.prop.outlineWidth) * hsf);
            context.lineTo((this.prop.x1 + ux * this.prop.outlineWidth) * hsf, (this.prop.y1 + uy * this.prop.outlineWidth) * hsf);
            context.lineWidth = lineWidth + this.prop.outlineWidth * 2 * hsf;
            context.strokeStyle = outlineStyle;
            context.stroke();
        }
        context.beginPath();
        context.moveTo((this.prop.x0) * hsf, (this.prop.y0) * hsf);
        context.lineTo((this.prop.x1) * hsf, (this.prop.y1) * hsf);
        context.lineWidth = lineWidth;
        context.strokeStyle = strokeStyle;
        context.stroke();
    }
}
class SlikaPath extends SlikaElement {
    constructor(points, style) {
        super();
        this.points = points;
        this.style = style;
        this.posX = 0;
        this.posY = 0;
    }
    static CreateParenthesis(x0, x1, y0, H, flip, style) {
        let yUp = y0 + (x1 - x0);
        let yBottom = y0 + H - (x1 - x0);
        if (flip) {
            let tmp = x1;
            x1 = x0;
            x0 = tmp;
        }
        return new SlikaPath(new SPoints([
            x1, y0,
            x0, yUp,
            x0, yBottom,
            x1, y0 + H
        ], true), style);
    }
    static CreatePan(x0, x1, y0, thickness, H, ratio, bigRight, flip, style) {
        let points;
        let sign = flip ? -1 : 1;
        if (bigRight) {
            let xBottom = x1 - (x1 - x0) * ratio;
            let xUp = xBottom - (H - thickness);
            points = [
                x0, y0,
                x1, y0,
                x1, y0 + sign * H,
                xBottom, y0 + sign * H,
                xUp, y0 + sign * thickness,
                x0, y0 + sign * thickness
            ];
        }
        else {
            let xBottom = x0 + (x1 - x0) * ratio;
            let xUp = xBottom + (H - thickness);
            points = [
                x0, y0,
                x1, y0,
                x1, y0 + sign * thickness,
                xUp, y0 + sign * thickness,
                xBottom, y0 + sign * H,
                x0, y0 + sign * H
            ];
        }
        return new SlikaPath(new SPoints(points, true), style);
    }
    redraw(context) {
        let hsf = Config.performanceConfiguration.holoScreenFactor;
        if (this.points.points.length > 0) {
            let outlineStyle = "#000000";
            if (this.style.fill === "none") {
                context.fillStyle = "none";
            }
            else {
                context.fillStyle = this.style.fill + Math.floor((this.style.fillAlpha * this.alpha) * 255).toString(16).padStart(2, "0");
                outlineStyle += Math.floor((this.style.fillAlpha * this.alpha) * 255).toString(16).padStart(2, "0");
            }
            let ss = "";
            if (this.style.stroke === "none") {
                ss = "none";
            }
            else {
                ss = this.style.stroke + Math.floor((this.style.strokeAlpha * this.alpha) * 255).toString(16).padStart(2, "0");
                outlineStyle += Math.floor((this.style.strokeAlpha * this.alpha) * 255).toString(16).padStart(2, "0");
            }
            context.shadowBlur = this.style.highlightRadius * hsf;
            context.shadowBlur = 0;
            context.shadowColor = this.style.highlightColor;
            let lw = this.style.width * hsf;
            context.beginPath();
            context.moveTo((this.points.points[0] + this.posX) * hsf, (this.points.points[1] + this.posY) * hsf);
            for (let i = 1; i < this.points.points.length / 2; i++) {
                context.lineTo((this.points.points[2 * i] + this.posX) * hsf, (this.points.points[2 * i + 1] + this.posY) * hsf);
            }
            if (this.points.close) {
                context.closePath();
            }
            if (this.style.fill != "none") {
                if (this.style.highlightRadius) {
                    context.lineWidth = this.style.highlightRadius * hsf;
                    context.strokeStyle = outlineStyle;
                    context.stroke();
                }
                context.fill();
            }
            if (this.style.stroke != "none") {
                if (this.style.highlightRadius > 0) {
                    context.lineWidth = lw + this.style.highlightRadius * hsf;
                    context.strokeStyle = outlineStyle;
                    context.stroke();
                }
                context.lineWidth = lw;
                context.strokeStyle = ss;
                context.stroke();
            }
        }
    }
}
function DefaultSlikaPointerProperties(prop) {
    if (isNaN(prop.xMin)) {
        prop.xMin = 1;
    }
    if (isNaN(prop.yMin)) {
        prop.yMin = 1;
    }
    if (isNaN(prop.xMax)) {
        prop.xMax = 1;
    }
    if (isNaN(prop.yMax)) {
        prop.yMax = 1;
    }
    if (isNaN(prop.radius)) {
        prop.radius = 1;
    }
    if (!prop.color) {
        prop.color = BABYLON.Color3.White();
    }
}
class SlikaPointer extends SlikaElement {
    constructor(prop) {
        super();
        this.prop = prop;
        this._lines = [];
        this._width = 4;
        DefaultSlikaPointerProperties(prop);
        this._lines.push(new SlikaLine({ x0: 0, y0: 0, x1: 0, y1: 0, color: this.prop.color, alpha: 1, width: this._width, outlineWidth: 2 }));
        this._lines.push(new SlikaLine({ x0: 0, y0: 0, x1: 0, y1: 0, color: this.prop.color, alpha: 1, width: this._width, outlineWidth: 2 }));
        this._lines.push(new SlikaLine({ x0: 0, y0: 0, x1: 0, y1: 0, color: this.prop.color, alpha: 1, width: this._width, outlineWidth: 2 }));
        this._lines.push(new SlikaLine({ x0: 0, y0: 0, x1: 0, y1: 0, color: this.prop.color, alpha: 1, width: this._width, outlineWidth: 2 }));
        this._circle = new SlikaCircle({ x: 0, y: 0, r: this.prop.radius, color: this.prop.color, alpha: 1, width: this._width, outlineWidth: 2 });
    }
    setPosition(x, y) {
        this.prop.x = x;
        this.prop.x = Math.max(this.prop.xMin + this.prop.radius, Math.min(this.prop.xMax - this.prop.radius, this.prop.x));
        this.prop.y = y;
        this.prop.y = Math.max(this.prop.xMin + this.prop.radius, Math.min(this.prop.yMax - this.prop.radius, this.prop.y));
        this._updatePosition();
    }
    _updatePosition() {
        let dx = 0;
        if (this.YToDX) {
            dx = this.YToDX(this.prop.y);
        }
        let dy = 0;
        if (this.XToDY) {
            dy = this.XToDY(this.prop.x);
        }
        this._lines[0].prop.x0 = this.prop.xMin + dx;
        this._lines[0].prop.y0 = this.prop.y;
        this._lines[0].prop.x1 = this.prop.x - this.prop.radius - 3 * this._width;
        this._lines[0].prop.y1 = this.prop.y;
        this._lines[0].display = this._lines[0].prop.x0 < this._lines[0].prop.x1;
        this._lines[1].prop.x0 = this.prop.x;
        this._lines[1].prop.y0 = this.prop.xMin + dy;
        this._lines[1].prop.x1 = this.prop.x;
        this._lines[1].prop.y1 = this.prop.y - this.prop.radius - 3 * this._width;
        this._lines[1].display = this._lines[1].prop.y0 < this._lines[1].prop.y1;
        this._lines[2].prop.x0 = this.prop.x + this.prop.radius + 3 * this._width;
        this._lines[2].prop.y0 = this.prop.y;
        this._lines[2].prop.x1 = this.prop.xMax - dx;
        this._lines[2].prop.y1 = this.prop.y;
        this._lines[2].display = this._lines[2].prop.x0 < this._lines[2].prop.x1;
        this._lines[3].prop.x0 = this.prop.x;
        this._lines[3].prop.y0 = this.prop.y + this.prop.radius + 3 * this._width;
        this._lines[3].prop.x1 = this.prop.x;
        this._lines[3].prop.y1 = this.prop.yMax - dy;
        this._lines[3].display = this._lines[3].prop.y0 < this._lines[3].prop.y1;
        this._circle.prop.x = this.prop.x;
        this._circle.prop.y = this.prop.y;
        if (this.slika) {
            this.slika.needRedraw = true;
        }
    }
    redraw(context) {
        this._lines.forEach(l => {
            l.redraw(context);
        });
        this._circle.redraw(context);
    }
}
class SlikaPointerLite extends SlikaPointer {
    constructor(prop) {
        super(prop);
        this.prop = prop;
        this.animateRadius = AnimationFactory.EmptyNumberCallback;
        this._circle = new SlikaCircle({ x: 0, y: 0, r: this.prop.radius, color: this.prop.color, alpha: 1, width: this._width, outlineWidth: 2 });
        this.animateRadius = AnimationFactory.CreateNumber(this, this._circle.prop, "r", () => {
            if (this.slika) {
                this.slika.needRedraw = true;
            }
        });
    }
    _updatePosition() {
        this._circle.prop.x = this.prop.x;
        this._circle.prop.y = this.prop.y;
        if (this.slika) {
            this.slika.needRedraw = true;
        }
    }
    redraw(context) {
        this._circle.redraw(context);
    }
}
function DefaultSlikaTextProperties(prop) {
    if (!prop.text) {
        prop.text = "";
    }
    if (isNaN(prop.x)) {
        prop.x = 0;
    }
    if (isNaN(prop.y)) {
        prop.y = 0;
    }
    if (!prop.textAlign) {
        prop.textAlign = "left";
    }
    if (isNaN(prop.fontSize)) {
        prop.fontSize = 12;
    }
    if (!prop.color) {
        prop.color = BABYLON.Color3.White();
    }
    if (isNaN(prop.highlightRadius)) {
        prop.highlightRadius = 0;
    }
}
class SlikaText extends SlikaElement {
    constructor(prop) {
        super();
        this.prop = prop;
        this.animatePosX = AnimationFactory.EmptyNumberCallback;
        DefaultSlikaTextProperties(this.prop);
        this.animatePosX = AnimationFactory.CreateNumber(this, this.prop, "x", () => {
            if (this.slika) {
                this.slika.needRedraw = true;
            }
        });
    }
    redraw(context) {
        let hsf = Config.performanceConfiguration.holoScreenFactor;
        let colorString = this.prop.color.toHexString();
        let alphaString = Math.floor(this.alpha * 255).toString(16).padStart(2, "0");
        context.fillStyle = colorString + alphaString;
        context.font = (this.prop.fontSize * hsf) + "px " + this.prop.fontFamily;
        context.shadowBlur = this.prop.highlightRadius * hsf;
        context.shadowColor = colorString + alphaString;
        let offsetX = 0;
        if (this.prop.textAlign === "center") {
            offsetX = context.measureText(this.prop.text).width * 0.5 / hsf;
        }
        else if (this.prop.textAlign === "end") {
            offsetX = context.measureText(this.prop.text).width / hsf;
        }
        context.lineWidth = 6 * hsf;
        context.strokeStyle = "#000000" + alphaString;
        context.strokeText(this.prop.text, (this.prop.x - offsetX) * hsf, this.prop.y * hsf);
        context.fillText(this.prop.text, (this.prop.x - offsetX) * hsf, this.prop.y * hsf);
    }
}
function DefaultSlikaTextBoxProperties(prop) {
    if (!prop.text) {
        prop.text = "";
    }
    if (isNaN(prop.x)) {
        prop.x = 0;
    }
    if (isNaN(prop.y)) {
        prop.y = 0;
    }
    if (isNaN(prop.w)) {
        prop.w = 100;
    }
    if (isNaN(prop.h)) {
        prop.h = 100;
    }
    if (isNaN(prop.fontSize)) {
        prop.fontSize = 12;
    }
    if (!prop.color) {
        prop.color = BABYLON.Color3.White();
    }
    if (isNaN(prop.highlightRadius)) {
        prop.highlightRadius = 0;
    }
}
class SlikaTextBox extends SlikaElement {
    constructor(prop) {
        super();
        this.prop = prop;
        this._strokes = [];
        this._fills = [];
        DefaultSlikaTextBoxProperties(this.prop);
        this._strokes.push(new SlikaPath(new SPoints([
            this.prop.x, this.prop.y,
            this.prop.x + this.prop.w, this.prop.y,
            this.prop.x + this.prop.w, this.prop.y + this.prop.h,
            this.prop.x, this.prop.y + this.prop.h
        ], true), new SlikaShapeStyle(this.prop.color.toHexString(), 1, "none", 1, 2, this.prop.color.toHexString(), 4)));
        this._fills.push(new SlikaPath(new SPoints([
            this.prop.x, this.prop.y,
            this.prop.x + this.prop.w, this.prop.y,
            this.prop.x + this.prop.w, this.prop.y + this.prop.h,
            this.prop.x, this.prop.y + this.prop.h
        ], true), new SlikaShapeStyle("none", 1, this.prop.color.toHexString(), 0.05, 0, this.prop.color.toHexString(), 0)));
    }
    setAlpha(v) {
        super.setAlpha(v * 0.7);
        this._strokes.forEach(s => {
            s.setAlpha(this.alpha);
        });
        this._fills.forEach(f => {
            f.setAlpha(this.alpha);
        });
    }
    redraw(context) {
        let hsf = Config.performanceConfiguration.holoScreenFactor;
        this._fills.forEach(f => {
            f.redraw(context);
        });
        this._strokes.forEach(s => {
            s.redraw(context);
        });
        let colorString = this.prop.color.toHexString();
        let outlineColorString = this.prop.color.scale(0.6).toHexString();
        let alphaString = Math.floor(this.alpha * 255).toString(16).padStart(2, "0");
        context.fillStyle = colorString + alphaString;
        context.font = (this.prop.fontSize * hsf) + "px " + this.prop.fontFamily;
        context.shadowBlur = this.prop.highlightRadius;
        context.shadowColor = outlineColorString + alphaString;
        context.lineWidth = 5 * hsf;
        let l = "";
        let i = 1;
        let lineSplit = this.prop.text.split("\n");
        for (let n = 0; n < lineSplit.length; n++) {
            let split = lineSplit[n].split(" ");
            while (split.length > 0) {
                let v = split[0];
                if (l === "" || context.measureText(l + v).width < this.prop.w * hsf) {
                    l += " " + v;
                    split.splice(0, 1);
                }
                else {
                    context.strokeStyle = "black";
                    //context.strokeText(l, this.prop.x * hsf, (this.prop.y + i * this.prop.fontSize) * hsf);
                    context.fillText(l, this.prop.x * hsf, (this.prop.y + i * this.prop.fontSize) * hsf);
                    l = "";
                    i++;
                }
            }
            context.strokeStyle = "black";
            //context.strokeText(l, this.prop.x * hsf, (this.prop.y + i * this.prop.fontSize) * hsf);
            context.fillText(l, this.prop.x * hsf, (this.prop.y + i * this.prop.fontSize) * hsf);
            l = "";
            i++;
        }
    }
}
// Code by Andrey Sitnik and Ivan Solovev https://github.com/ai/easings.net
class Easing {
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
    static smooth025Sec(fps) {
        if (fps < 8) {
            return 1;
        }
        return 1 - 1 / (0.13 * fps);
    }
    static smooth05Sec(fps) {
        if (fps < 4) {
            return 1;
        }
        return 1 - 1 / (0.25 * fps);
    }
    static smooth1Sec(fps) {
        if (fps < 2.25) {
            return 1;
        }
        return 1 - 1 / (0.45 * fps);
    }
    static smooth2Sec(fps) {
        if (fps < 1.2) {
            return 1;
        }
        return 1 - 1 / (0.9 * fps);
    }
    static smooth3Sec(fps) {
        if (fps < 1) {
            return 1;
        }
        return 1 - 1 / (1.35 * fps);
    }
}
/// <reference path="../PlanetObject.ts"/>
var InteractionMode;
(function (InteractionMode) {
    InteractionMode[InteractionMode["Point"] = 0] = "Point";
    InteractionMode[InteractionMode["Grab"] = 1] = "Grab";
})(InteractionMode || (InteractionMode = {}));
class Pickable extends PlanetObject {
    constructor(name, main) {
        super(name, main);
        this.interactionMode = InteractionMode.Point;
    }
    get scene() {
        return this.main.scene;
    }
    get inputManager() {
        return this.main.inputManager;
    }
    instantiate() {
        this.inputManager.pickableElements.push(this);
    }
    dispose() {
        super.dispose();
        this.inputManager.pickableElements.remove(this);
    }
    interceptsPointerMove() {
        return false;
    }
    onPointerDown() {
    }
    onPointerUp() {
    }
    onHoverStart() {
    }
    onHoverEnd() {
    }
}
/// <reference path="Pickable.ts"/>
class HoloPanel extends Pickable {
    constructor(size = 1, height = 1, _w = 1600, _h = 1000, main) {
        super("holo-panel", main);
        this.size = size;
        this.height = height;
        this._w = _w;
        this._h = _h;
        // 24 lines of 80 characters each
        this.lines = [];
        this._angle = 0.8;
        this._radius = 2;
        this._cz = -2;
        this.animateFramePosY = AnimationFactory.EmptyNumberCallback;
        this.updateMaterialUpDirection = () => {
            this.holoMaterial.up = this.up;
            this.pointerMaterial.up = this.up;
        };
        this._updatePointerMesh = () => {
            let local = BABYLON.Vector3.TransformCoordinates(this.inputManager.aimedPosition, this.holoMesh.getWorldMatrix().clone().invert());
            let x = this.posXToXTexture(local.x);
            let y = this.posYToYTexture(local.y);
            this.holoSlika.onPointerMove(x, y);
            this.pointerElement.setPosition(x, y);
        };
        this._angle = this.size / this._radius;
    }
    xTextureToPos(x) {
        let a = (x - this._w / 2) / this._w * this._angle;
        return new BABYLON.Vector2(Math.sin(a) * this._radius, Math.cos(a) * this._radius + this._cz);
    }
    posXToXTexture(posX) {
        let a = Math.asin(posX / this._radius);
        return a * this._w / this._angle + this._w * 0.5;
    }
    posYToYTexture(posY) {
        let h = this._angle * this._radius / this._w * this._h;
        return -posY / h * this._h + this._h * 0.5;
    }
    async _animateScaleX(xTarget, duration) {
        return new Promise(resolve => {
            let xZero = this.holoMesh.scaling.x;
            let t = 0;
            let cb = () => {
                t += this.main.engine.getDeltaTime() / 1000;
                if (t < duration) {
                    let f = t / duration;
                    this.holoMesh.scaling.x = xZero * (1 - f) + xTarget * f;
                }
                else {
                    this.holoMesh.scaling.x = xTarget;
                    this.main.scene.onBeforeRenderObservable.removeCallback(cb);
                    resolve();
                }
            };
            this.main.scene.onBeforeRenderObservable.add(cb);
        });
    }
    async _animateScaleY(yTarget, duration) {
        return new Promise(resolve => {
            let yZero = this.holoMesh.scaling.y;
            let t = 0;
            let cb = () => {
                t += this.main.engine.getDeltaTime() / 1000;
                if (t < duration) {
                    let f = t / duration;
                    this.holoMesh.scaling.y = yZero * (1 - f) + yTarget * f;
                }
                else {
                    this.holoMesh.scaling.y = yTarget;
                    this.main.scene.onBeforeRenderObservable.removeCallback(cb);
                    resolve();
                }
            };
            this.main.scene.onBeforeRenderObservable.add(cb);
        });
    }
    instantiate() {
        super.instantiate();
        let h = this._angle * this._radius / this._w * this._h;
        this.frame = BABYLON.MeshBuilder.CreateBox("frame", { size: 0.05 });
        this.frame.parent = this;
        this.frame.position.y = 0;
        this.frame.isVisible = true;
        VertexDataLoader.instance.get("holoPanelFrame").then(vertexDatas => {
            let vData = vertexDatas[1];
            vData.applyToMesh(this.frame);
        });
        this.animateFramePosY = AnimationFactory.CreateNumber(this, this.frame.position, "y");
        this.holoMesh = new BABYLON.Mesh("text-page");
        this.holoMesh.layerMask = 0x10000000;
        this.holoMesh.parent = this;
        this.holoMesh.position.y = this.height;
        this.holoMesh.scaling.x = 0.1;
        this.holoMesh.alphaIndex = 1;
        this.pointerMesh = new BABYLON.Mesh("pointer-mesh");
        this.pointerMesh.layerMask = 0x10000000;
        this.pointerMesh.position.z = -0.005;
        this.pointerMesh.parent = this.holoMesh;
        this.pointerMesh.alphaIndex = 2;
        this.interactionAnchor = new BABYLON.Mesh("interaction-anchor");
        //BABYLON.CreateBoxVertexData({ size: 0.1 }).applyToMesh(this.interactionAnchor);
        //this.interactionAnchor.material = SharedMaterials.RedMaterial();
        this.interactionAnchor.position.z = -1;
        this.interactionAnchor.parent = this;
        let data = new BABYLON.VertexData();
        let positions = [];
        let indices = [];
        let uvs = [];
        let normals = [];
        for (let i = 0; i <= 8; i++) {
            let p = this.xTextureToPos(i * this._w / 8);
            let l = positions.length / 3;
            positions.push(p.x, -h * 0.5, p.y);
            positions.push(p.x, h * 0.5, p.y);
            uvs.push(i / 8, 0);
            uvs.push(i / 8, 1);
            if (i < 8) {
                indices.push(l + 1, l, l + 2);
                indices.push(l + 1, l + 2, l + 3);
            }
        }
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        data.positions = positions;
        data.indices = indices;
        data.uvs = uvs;
        data.normals = normals;
        data.applyToMesh(this.holoMesh);
        data.applyToMesh(this.pointerMesh, true);
        this.holoMaterial = new HoloPanelMaterial("text-page-material", this.main.scene);
        this.holoMesh.material = this.holoMaterial;
        this.pointerMaterial = new HoloPanelMaterial("text-page-material", this.main.scene);
        this.pointerMaterial.alpha = 0;
        this.pointerMesh.material = this.pointerMaterial;
        this.refreshHSF();
        this.holoSlika = new Slika(this._w, this._h, this.holoTexture.getContext(), this.holoTexture);
        this.pointerSlika = new Slika(this._w, this._h, this.pointerTexture.getContext(), this.pointerTexture);
        this.pointerElement = new SlikaPointerLite({ x: this._w * 0.5, y: this._h * 0.5, xMin: 30, yMin: 13, xMax: this._w - 26, yMax: this._h - 21, radius: 20, color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor) });
        this.pointerSlika.add(this.pointerElement);
        this.lines[0] = "You know what? It is beets. I've crashed into a beet truck. Jaguar shark! So tell me - does it really exist? Is this my espresso machine? Wh-what is-h-how did you get my espresso machine? Hey, take a look at the earthlings. Goodbye! I was part of something special.";
        this.lines[1] = "Yeah, but John, if The Pirates of the Caribbean breaks down, the pirates don’t eat the tourists. Jaguar shark! So tell me - does it really exist? Did he just throw my cat out of the window? You're a very talented young man, with your own clever thoughts and ideas. Do you need a manager?";
        this.lines[2] = "Forget the fat lady! You're obsessed with the fat lady! Drive us out of here! God creates dinosaurs. God destroys dinosaurs. God creates Man. Man destroys God. Man creates Dinosaurs. You know what? It is beets. I've crashed into a beet truck. Hey, you know how I'm, like, always trying to save the planet? Here's my chance.";
        this.lines[3] = "Eventually, you do plan to have dinosaurs on your dinosaur tour, right? Just my luck, no ice. Remind me to thank John for a lovely weekend. This thing comes fully loaded. AM/FM radio, reclining bucket seats, and... power windows. Must go faster... go, go, go, go, go!";
        this.lines[4] = "Checkmate... Must go faster... go, go, go, go, go! Hey, you know how I'm, like, always trying to save the planet? Here's my chance. God creates dinosaurs. God destroys dinosaurs. God creates Man. Man destroys God. Man creates Dinosaurs. Checkmate... You're a very talented young man, with your own clever thoughts and ideas. Do you need a manager?";
        this.proxyPickMesh = this.holoMesh;
        let off = 5 * Math.random();
        let offPointer = 5 * Math.random();
        let offSpeed = 0.13 + 0.4 * Math.random();
        let offPointerSpeed = 0.13 + 0.4 * Math.random();
        this.scene.onBeforeRenderObservable.add(() => {
            if (Math.random() < 0.1) {
                offSpeed = 0.1 + 0.1 * Math.random();
            }
            off += this.scene.getEngine().getDeltaTime() / 1000 * offSpeed;
            offPointer += this.scene.getEngine().getDeltaTime() / 1000 * offPointerSpeed;
            if (off > 100) {
                off -= 100;
            }
            if (offPointer > 100) {
                offPointer -= 100;
            }
            this.holoMaterial.offset = off;
            this.pointerMaterial.offset = offPointer;
        });
        this.onRotationChangedObservable.add(this.updateMaterialUpDirection);
        Config.performanceConfiguration.onHoloScreenFactorChangedCallbacks.push(() => {
            this.refreshHSF();
        });
    }
    refreshHSF() {
        let hsf = Config.performanceConfiguration.holoScreenFactor;
        this.holoTexture = new BABYLON.DynamicTexture("text-page-texture", { width: this._w * hsf, height: this._h * hsf }, this.main.scene, true);
        this.holoTexture.hasAlpha = true;
        this.holoMaterial.holoTexture = this.holoTexture;
        if (this.holoSlika) {
            this.holoSlika.texture = this.holoTexture;
            this.holoSlika.context = this.holoTexture.getContext();
            this.holoSlika.needRedraw = true;
        }
        this.pointerTexture = new BABYLON.DynamicTexture("text-page-texture", { width: this._w * hsf, height: this._h * hsf }, this.main.scene, true);
        this.pointerTexture.hasAlpha = true;
        this.pointerMaterial.holoTexture = this.pointerTexture;
        if (this.pointerSlika) {
            this.pointerSlika.texture = this.pointerTexture;
            this.pointerSlika.context = this.pointerTexture.getContext();
            this.pointerSlika.needRedraw = true;
        }
    }
    async open() {
        let h = this._angle * this._radius / this._w * this._h;
        this.frame.isVisible = true;
        await this.animateFramePosY(this.height - h * 0.5, 0.5);
        await this._animateScaleX(1, 0.5);
    }
    async close(duration = 1.5) {
        await this._animateScaleX(0, 1 / 3 * duration);
        await this.animateFramePosY(0, 2 / 3 * duration);
        this.frame.isVisible = false;
    }
    redrawSVG(image) {
        let context = this.holoTexture.getContext();
        context.clearRect(0, 0, this._w, this._h);
        context.drawImage(image, 0, 0, this._w, this._h);
        this.holoTexture.update();
    }
    interceptsPointerMove() {
        if (BABYLON.Vector3.DistanceSquared(this.inputManager.player.position, this.interactionAnchor.absolutePosition) < 0.2 * 0.2) {
            return true;
        }
        return false;
    }
    onPointerDown() {
        if (BABYLON.Vector3.DistanceSquared(this.inputManager.player.position, this.interactionAnchor.absolutePosition) < 0.2 * 0.2) {
            let local = BABYLON.Vector3.TransformCoordinates(this.inputManager.aimedPosition, this.holoMesh.getWorldMatrix().clone().invert());
            let x = this.posXToXTexture(local.x);
            let y = this.posYToYTexture(local.y);
            this.holoSlika.onPointerDown(x, y);
        }
    }
    onPointerUp() {
        if (BABYLON.Vector3.DistanceSquared(this.inputManager.player.position, this.interactionAnchor.absolutePosition) < 0.2 * 0.2) {
            let local = BABYLON.Vector3.TransformCoordinates(this.inputManager.aimedPosition, this.holoMesh.getWorldMatrix().clone().invert());
            let x = this.posXToXTexture(local.x);
            let y = this.posYToYTexture(local.y);
            this.holoSlika.onPointerUp(x, y);
            this.pointerElement.animateRadius(60, 0.2).then(() => {
                this.pointerElement.animateRadius(20, 0.2);
            });
        }
        else {
            this.inputManager.player.targetLook = this.holoMesh.absolutePosition;
            this.inputManager.player.targetDestination = this.interactionAnchor.absolutePosition.clone();
        }
    }
    onHoverStart() {
        let mat = this.material;
        if (mat instanceof BABYLON.StandardMaterial) {
            mat.diffuseColor.copyFromFloats(0, 0.8, 0.2);
        }
        this._animatePointerAlpha(1, 0.5);
        this.scene.onBeforeRenderObservable.add(this._updatePointerMesh);
    }
    onHoverEnd() {
        let mat = this.material;
        if (mat instanceof BABYLON.StandardMaterial) {
            mat.diffuseColor.copyFromFloats(0.8, 0, 0.2);
        }
        this._animatePointerAlpha(0, 0.5);
        this.holoSlika.onPointerExit();
        this.scene.onBeforeRenderObservable.removeCallback(this._updatePointerMesh);
    }
    async _animatePointerAlpha(alphaTarget, duration) {
        return new Promise(resolve => {
            let alphaZero = this.pointerMaterial.alpha;
            let t = 0;
            let cb = () => {
                t += this.main.engine.getDeltaTime() / 1000;
                if (t < duration) {
                    let f = t / duration;
                    this.pointerMaterial.alpha = alphaZero * (1 - f) + alphaTarget * f;
                }
                else {
                    this.pointerMaterial.alpha = alphaTarget;
                    this.main.scene.onBeforeRenderObservable.removeCallback(cb);
                    resolve();
                }
            };
            this.main.scene.onBeforeRenderObservable.add(cb);
        });
    }
}
class PlayerInput {
    constructor(player) {
        this.player = player;
        this.game = player.main;
    }
    connectInput() {
    }
}
/// <reference path="PlayerInput.ts"/>
class PlayerInputVirtualButton extends PlayerInput {
    constructor() {
        super(...arguments);
        this.clientWidth = 100;
        this.clientHeight = 100;
        this.size = 10;
        this.marginLeft = 10;
        this.marginBottom = 10;
        this.centerX = 20;
        this.centerY = 20;
    }
    connectInput(callback) {
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("viewBox", "0 0 1000 1000");
        this.clientWidth = document.body.clientWidth;
        this.clientHeight = document.body.clientHeight;
        let ratio = this.clientWidth / this.clientHeight;
        if (ratio > 1) {
            this.size = this.clientHeight * 0.25;
        }
        else {
            this.size = this.clientWidth * 0.25;
        }
        let margin = Math.min(50, this.size * 0.3);
        this.centerX = this.clientWidth * 0.5;
        this.centerY = this.clientHeight - this.size * 0.5 - margin;
        this.svg.style.display = "block";
        this.svg.style.position = "fixed";
        this.svg.style.width = this.size.toFixed(0) + "px";
        this.svg.style.height = this.size.toFixed(0) + "px";
        this.svg.style.zIndex = "2";
        this.svg.style.left = (this.clientWidth * 0.75 * 0.5).toFixed(0) + "px";
        this.svg.style.bottom = margin.toFixed(0) + "px";
        this.svg.style.overflow = "visible";
        this.svg.style.pointerEvents = "none";
        document.body.appendChild(this.svg);
        let base = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        base.setAttribute("cx", "500");
        base.setAttribute("cy", "500");
        base.setAttribute("r", "500");
        base.setAttribute("fill", "white");
        base.setAttribute("fill-opacity", "10%");
        base.setAttribute("stroke-width", "4");
        base.setAttribute("stroke", "white");
        this.svg.appendChild(base);
        if (callback) {
            this.game.canvas.addEventListener("pointerdown", (ev) => {
                let dx = this.clientXToDX(ev.clientX);
                let dy = this.clientYToDY(ev.clientY);
                if (dx * dx + dy * dy < 1) {
                    callback(ev);
                }
            });
        }
    }
    clientXToDX(clientX) {
        return (clientX - this.centerX) / (this.size * 0.5);
    }
    clientYToDY(clientY) {
        return -(clientY - this.centerY) / (this.size * 0.5);
    }
    disconnect() {
        if (this.svg) {
            document.body.removeChild(this.svg);
        }
    }
}
/// <reference path="PlayerInput.ts"/>
class PlayerInputVirtualPad extends PlayerInput {
    constructor() {
        super(...arguments);
        this.clientWidth = 100;
        this.clientHeight = 100;
        this.size = 10;
        this.marginLeft = 10;
        this.marginBottom = 10;
        this.centerX = 20;
        this.centerY = 20;
        this._pointerDown = false;
        this._dx = 0;
        this._dy = 0;
        this._update = () => {
            if (!this._pointerDown) {
                if (Math.abs(this._dx) > 0.001 || Math.abs(this._dy) > 0.001) {
                    this._dx *= 0.9;
                    this._dy *= 0.9;
                    if (Math.abs(this._dx) < 0.001 && Math.abs(this._dy) < 0.001) {
                        this._dx = 0;
                        this._dy = 0;
                    }
                    this.updatePad(this._dx, this._dy);
                    this.updatePilot(this._dx, this._dy);
                }
            }
            else {
                this.updatePad(this._dx, this._dy);
                this.updatePilot(this._dx, this._dy);
            }
        };
    }
    connectInput(left) {
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("viewBox", "0 0 1000 1000");
        this.clientWidth = document.body.clientWidth;
        this.clientHeight = document.body.clientHeight;
        let ratio = this.clientWidth / this.clientHeight;
        if (ratio > 1) {
            this.size = this.clientHeight * 0.25;
        }
        else {
            this.size = this.clientWidth * 0.25;
        }
        let margin = Math.min(50, this.size * 0.3);
        this.svg.style.display = "block";
        this.svg.style.position = "fixed";
        this.svg.style.width = this.size.toFixed(0) + "px";
        this.svg.style.height = this.size.toFixed(0) + "px";
        this.svg.style.zIndex = "2";
        if (left) {
            this.svg.style.left = margin.toFixed(0) + "px";
        }
        else {
            this.svg.style.right = margin.toFixed(0) + "px";
        }
        this.svg.style.bottom = margin.toFixed(0) + "px";
        this.svg.style.overflow = "visible";
        this.svg.style.pointerEvents = "none";
        document.body.appendChild(this.svg);
        let base = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        base.setAttribute("cx", "500");
        base.setAttribute("cy", "500");
        base.setAttribute("r", "500");
        base.setAttribute("fill", "white");
        base.setAttribute("fill-opacity", "10%");
        base.setAttribute("stroke-width", "4");
        base.setAttribute("stroke", "white");
        this.svg.appendChild(base);
        this.pad = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.pad.setAttribute("cx", "500");
        this.pad.setAttribute("cy", "500");
        this.pad.setAttribute("r", "250");
        this.pad.setAttribute("fill", "white");
        this.pad.setAttribute("fill-opacity", "50%");
        this.pad.setAttribute("stroke-width", "4");
        this.pad.setAttribute("stroke", "white");
        this.svg.appendChild(this.pad);
        let letter = document.createElementNS("http://www.w3.org/2000/svg", "text");
        letter.setAttribute("x", "500");
        letter.setAttribute("y", "600");
        letter.setAttribute("fill", "white");
        letter.setAttribute("font-size", "300");
        letter.setAttribute("font-family", "XoloniumBold");
        letter.setAttribute("font-family", "XoloniumBold");
        letter.setAttribute("text-anchor", "middle");
        letter.setAttribute("stroke", "black");
        letter.setAttribute("stroke-width", "5");
        letter.textContent = left ? "L" : "R";
        letter.style.userSelect = "none";
        this.svg.appendChild(letter);
        if (left) {
            this.centerX = this.size * 0.5 + margin;
        }
        else {
            this.centerX = this.clientWidth - this.size * 0.5 - margin;
        }
        this.centerY = this.clientHeight - this.size * 0.5 - margin;
        document.body.addEventListener("pointerdown", (ev) => {
            let dx = this.clientXToDX(ev.clientX);
            let dy = this.clientYToDY(ev.clientY);
            if (dx * dx + dy * dy < 1) {
                this._pointerDown = true;
                this._dx = dx;
                this._dy = dy;
            }
        });
        document.body.addEventListener("pointermove", (ev) => {
            if (this._pointerDown) {
                let dx = this.clientXToDX(ev.clientX);
                let dy = this.clientYToDY(ev.clientY);
                if (dx * dx + dy * dy < 1) {
                    this._dx = dx;
                    this._dy = dy;
                }
                else if (dx * dx + dy * dy < 4) {
                    let l = Math.sqrt(dx * dx + dy * dy);
                    this._dx = dx / l;
                    this._dy = dy / l;
                }
            }
        });
        document.body.addEventListener("pointerup", (ev) => {
            let dx = this.clientXToDX(ev.clientX);
            let dy = this.clientYToDY(ev.clientY);
            if (dx * dx + dy * dy < 4) {
                this._pointerDown = false;
            }
        });
        this.game.scene.onBeforeRenderObservable.add(this._update);
    }
    disconnect() {
        if (this.svg) {
            document.body.removeChild(this.svg);
        }
        this.game.scene.onBeforeRenderObservable.removeCallback(this._update);
    }
    clientXToDX(clientX) {
        return (clientX - this.centerX) / (this.size * 0.5);
    }
    clientYToDY(clientY) {
        return -(clientY - this.centerY) / (this.size * 0.5);
    }
    updatePad(dx, dy) {
        let cx = 500 + dx * 250;
        this.pad.setAttribute("cx", cx.toFixed(1));
        let cy = 500 - dy * 250;
        this.pad.setAttribute("cy", cy.toFixed(1));
    }
    updatePilot(dx, dy) { }
}
class PlayerInputMovePad extends PlayerInputVirtualPad {
    updatePilot(dx, dy) {
        this.player.inputForward = dy;
        this.player.inputRight = dx;
    }
}
class PlayerInputHeadPad extends PlayerInputVirtualPad {
    updatePilot(dx, dy) {
        this.player.inputHeadUp = -dy * 0.35;
        this.player.inputHeadRight = dx * 0.35;
    }
}
class Subtitle {
    constructor(texts = [], imgs = [], duration, durationMin = 1, speed = 60, callback) {
        this.texts = texts;
        this.imgs = imgs;
        this.duration = duration;
        this.durationMin = durationMin;
        this.speed = speed;
        this.callback = callback;
    }
    get totalLength() {
        return this.texts.map(text => { return text.length; }).reduce((l1, l2) => { return l1 + l2; }) + this.imgs.length;
    }
    static Create(content, duration, durationMin, speed, callback) {
        let texts = [];
        let imgs = [];
        for (let i = 0; i < content.length; i++) {
            if (i % 2 === 0) {
                texts.push(content[i]);
            }
            else {
                imgs.push(content[i]);
            }
        }
        return new Subtitle(texts, imgs, duration, durationMin, speed, callback);
    }
}
var SubtitleManagerStatus;
(function (SubtitleManagerStatus) {
    SubtitleManagerStatus[SubtitleManagerStatus["Ready"] = 0] = "Ready";
    SubtitleManagerStatus[SubtitleManagerStatus["Writing"] = 1] = "Writing";
    SubtitleManagerStatus[SubtitleManagerStatus["Displaying"] = 2] = "Displaying";
    SubtitleManagerStatus[SubtitleManagerStatus["Erasing"] = 3] = "Erasing";
})(SubtitleManagerStatus || (SubtitleManagerStatus = {}));
class SubtitleManager {
    constructor(main, container) {
        this.main = main;
        this.container = container;
        this.subtitlesBuffer = [];
        this._timer = 0;
        this._status = SubtitleManagerStatus.Ready;
        this._update = () => {
            if (this._status === SubtitleManagerStatus.Ready && this.subtitlesBuffer.length > 0) {
                this._currentSubtitle = this.subtitlesBuffer.splice(0, 1)[0];
                this._status = SubtitleManagerStatus.Writing;
                this._timer = 0;
                this.container.style.color = "rgba(255, 255, 255, 100%)";
                this.container.style.backgroundColor = "rgba(31, 31, 31, 75%)";
                this.container.style.display = "";
            }
            // If there's no new subtitle to display, hide the container.
            if (this._status === SubtitleManagerStatus.Ready) {
                this.container.innerHTML = "";
                this.container.style.display = "none";
            }
            if (this._status === SubtitleManagerStatus.Writing) {
                this._timer += this.engine.getDeltaTime() / 1000;
                let l = Math.floor(this._timer * this._currentSubtitle.speed);
                if (l > this._currentSubtitle.totalLength) {
                    l = this._currentSubtitle.totalLength;
                    this._status = SubtitleManagerStatus.Displaying;
                    this._timer = 0;
                }
                let ll = l;
                let index = 0;
                let htmlContent = "";
                while (ll > 0 && index < this._currentSubtitle.texts.length) {
                    htmlContent += this._currentSubtitle.texts[index].substring(0, ll);
                    ll -= this._currentSubtitle.texts[index].length;
                    if (ll > 0) {
                        if (this._currentSubtitle.imgs[index]) {
                            htmlContent += this._currentSubtitle.imgs[index];
                            ll--;
                        }
                    }
                    index++;
                }
                this.container.innerHTML = htmlContent;
            }
            if (this._status === SubtitleManagerStatus.Displaying) {
                this._timer += this.engine.getDeltaTime() / 1000;
                let duration = this._currentSubtitle.duration;
                if (this.subtitlesBuffer.length > 0) {
                    duration = this._currentSubtitle.durationMin;
                }
                if (this._timer > duration) {
                    this._status = SubtitleManagerStatus.Erasing;
                    this._timer = 0;
                }
            }
            if (this._status === SubtitleManagerStatus.Erasing) {
                this._timer += this.engine.getDeltaTime() / 1000;
                let a = (1 - (this._timer / 0.25)) * 100;
                a = Math.max(a, 0);
                this.container.style.color = "rgba(255, 255, 255, " + a.toFixed(1) + "%)";
                this.container.querySelectorAll("img").forEach(img => { img.style.opacity = a.toFixed(1) + "%"; });
                this.container.querySelectorAll("span").forEach(span => { span.style.opacity = a.toFixed(1) + "%"; });
                let a2 = (1 - ((this._timer - 0.25) / 0.25)) * 100;
                a2 = Math.max(Math.min(a2, 100), 0) * 0.75;
                this.container.style.backgroundColor = "rgba(31, 31, 31, " + a2.toFixed(1) + "%)";
                if (this._timer > 0.5) {
                    this._status = SubtitleManagerStatus.Ready;
                    this._timer = 0;
                    if (this._currentSubtitle.callback) {
                        this._currentSubtitle.callback();
                    }
                }
            }
        };
        if (!this.container) {
            this.container = document.createElement("div");
            this.container.id = "subtitles-container";
            document.body.appendChild(this.container);
        }
    }
    get engine() {
        return this.main.engine;
    }
    get scene() {
        return this.main.scene;
    }
    initialize() {
        this.scene.onBeforeRenderObservable.add(this._update);
    }
    add(subtitle) {
        this.subtitlesBuffer.push(subtitle);
    }
    async display(subtitle) {
        return new Promise(resolve => {
            if (subtitle.callback) {
                let newCallback = () => {
                    subtitle.callback();
                    resolve();
                };
                subtitle.callback = newCallback;
            }
            else {
                subtitle.callback = resolve;
            }
            this.add(subtitle);
        });
    }
}
class TestGrab extends Pickable {
    constructor(name, main) {
        super(name, main);
        this.interactionMode = InteractionMode.Grab;
    }
    instantiate() {
        super.instantiate();
        BABYLON.CreateIcoSphereVertexData({
            radius: 0.2,
            subdivisions: 2
        }).applyToMesh(this);
    }
    dispose() {
        super.dispose();
    }
}
class MainMenuPanel extends HoloPanel {
    constructor(dpi, main) {
        super(0.6, 1.5, 1000, 1000, main);
        this.dpi = dpi;
        this.titleHeight = 220;
        this.pages = [];
        this.currentPage = 0;
        this.animateTitleHeight = AnimationFactory.CreateNumber(this, this, "titleHeight", () => {
            this.titleLine1.posY = this.titleHeight;
            this.titleLine2.posY = this.titleHeight;
            this.holoSlika.needRedraw = true;
        });
    }
    instantiate() {
        super.instantiate();
        let M = 10;
        let L1 = 40;
        let L2 = 20;
        let L3 = 15;
        let L4 = 400;
        let L5 = 200;
        let L6 = 300;
        this.pointerElement.prop.xMin = M + L2 + 15;
        this.pointerElement.prop.yMin = M + L2 + 15;
        this.pointerElement.prop.xMax = 1000 - M - L2 - 15;
        this.pointerElement.prop.yMax = 1000 - M - L2 - 15;
        this.holoSlika.add(new SlikaPath(new SPoints([
            M + L1, M,
            500 - L4 * 0.5 - L2, M,
            500 - L4 * 0.5, M + L2,
            500 - L5 * 0.5, M + L2,
            500 - L5 * 0.5 + L3, M + L2 - L3,
            500 + L5 * 0.5 - L3, M + L2 - L3,
            500 + L5 * 0.5, M + L2,
            500 + L4 * 0.5, M + L2,
            500 + L4 * 0.5 + L2, M,
            1000 - (L1 + M), M,
            1000 - M, M + L1,
            1000 - M, 500 - L6 * 0.5,
            1000 - (M + L3), 500 - L6 * 0.5 + L3,
            1000 - (M + L3), 500 + L6 * 0.5 - L3,
            1000 - M, 500 + L6 * 0.5,
            1000 - M, 1000 - (M + L1),
            1000 - (L1 + M), 1000 - M,
            500 + L4 * 0.5 + L2, 1000 - M,
            500 + L4 * 0.5, 1000 - (M + L2),
            500 + L5 * 0.5, 1000 - (M + L2),
            500 + L5 * 0.5 - L3, 1000 - (M + L2 - L3),
            500 - L5 * 0.5 + L3, 1000 - (M + L2 - L3),
            500 - L5 * 0.5, 1000 - (M + L2),
            500 - L4 * 0.5, 1000 - (M + L2),
            500 - L4 * 0.5 - L2, 1000 - M,
            M + L1, 1000 - M,
            M, 1000 - (M + L1),
            M, 500 + L6 * 0.5,
            M + L3, 500 + L6 * 0.5 - L3,
            M + L3, 500 - L6 * 0.5 + L3,
            M, 500 - L6 * 0.5,
            M, M + L1,
        ], true), new SlikaShapeStyle("none", 1, "#292e2c", 0.75, 0, "white", 0)));
        for (let i = 100; i < 1000; i += 100) {
            this.holoSlika.add(new SlikaLine({ x0: M, y0: i, x1: 1000 - M, y1: i, color: BABYLON.Color3.White(), alpha: 0.3, highlightRadius: 10 }));
        }
        for (let i = 100; i < 1000; i += 100) {
            let dy = M;
            if (Math.abs(500 - i) < L4 * 0.5 + L2) {
                dy = M + L2;
            }
            this.holoSlika.add(new SlikaLine({ x0: i, y0: dy, x1: i, y1: 1000 - dy, color: BABYLON.Color3.White(), alpha: 0.3, highlightRadius: 10 }));
        }
        this.holoSlika.add(new SlikaPath(new SPoints([
            M + L1, M,
            500 - L4 * 0.5 - L2, M,
            500 - L4 * 0.5, M + L2,
            500 - L5 * 0.5, M + L2,
            500 - L5 * 0.5 + L3, M + L2 - L3,
            500 + L5 * 0.5 - L3, M + L2 - L3,
            500 + L5 * 0.5, M + L2,
            500 + L4 * 0.5, M + L2,
            500 + L4 * 0.5 + L2, M,
            1000 - (L1 + M), M,
            1000 - M, M + L1,
            1000 - M, 500 - L6 * 0.5,
            1000 - (M + L3), 500 - L6 * 0.5 + L3,
            1000 - (M + L3), 500 + L6 * 0.5 - L3,
            1000 - M, 500 + L6 * 0.5,
            1000 - M, 1000 - (M + L1),
            1000 - (L1 + M), 1000 - M,
            500 + L4 * 0.5 + L2, 1000 - M,
            500 + L4 * 0.5, 1000 - (M + L2),
            500 + L5 * 0.5, 1000 - (M + L2),
            500 + L5 * 0.5 - L3, 1000 - (M + L2 - L3),
            500 - L5 * 0.5 + L3, 1000 - (M + L2 - L3),
            500 - L5 * 0.5, 1000 - (M + L2),
            500 - L4 * 0.5, 1000 - (M + L2),
            500 - L4 * 0.5 - L2, 1000 - M,
            M + L1, 1000 - M,
            M, 1000 - (M + L1),
            M, 500 + L6 * 0.5,
            M + L3, 500 + L6 * 0.5 - L3,
            M + L3, 500 - L6 * 0.5 + L3,
            M, 500 - L6 * 0.5,
            M, M + L1,
        ], true), new SlikaShapeStyle(Config.uiConfiguration.holoScreenBaseColor, 1, "none", 1, 6, Config.uiConfiguration.holoScreenBaseColor, 6)));
        this.titleLine1 = SlikaPath.CreatePan(M + L2, 1000 - M - L2, 0, 3, 15, 0.30, true, false, new SlikaShapeStyle("none", 1, Config.uiConfiguration.holoScreenBaseColor, 1, 0, Config.uiConfiguration.holoScreenBaseColor, 6));
        this.titleLine1.posY = this.titleHeight;
        this.holoSlika.add(this.titleLine1);
        this.titleLine2 = SlikaPath.CreatePan(M + L2, 1000 - M - L2, 30, 3, 15, 0.30, false, true, new SlikaShapeStyle("none", 1, Config.uiConfiguration.holoScreenBaseColor, 1, 0, Config.uiConfiguration.holoScreenBaseColor, 6));
        this.titleLine2.posY = this.titleHeight;
        this.holoSlika.add(this.titleLine2);
        this.introPage = new MainMenuPanelIntroPage(this);
        this.introPage.hide(0);
        this.graphicsPage = new MainMenuPanelGraphicsPage(this);
        this.graphicsPage.hide(0);
        this.tutorialPage = new MainMenuPanelTutorialPage(this);
        this.tutorialPage.hide(0);
        this.planetPage = new MainMenuPlanetSelectionPage(this);
        this.planetPage.hide(0);
        this.pages = [this.introPage, this.graphicsPage, this.tutorialPage, this.planetPage];
        this.showPage(0);
    }
    async showPage(page) {
        await this.pages[this.currentPage].hide(0.3);
        this.currentPage = page;
        await this.pages[this.currentPage].show(0.3);
    }
    register() {
        this.inputManager.addMappedKeyUpListener(KeyInput.MAIN_MENU, async () => {
            this.openAtPlayerPosition();
        });
    }
    async openAtPlayerPosition() {
        let player = this.inputManager.player;
        if (player) {
            await this.close(0);
            let p = player.position.add(player.forward.scale(1.2));
            this.planet = player.planet;
            this.setPosition(p, true);
            this.setTarget(player.position);
            requestAnimationFrame(() => {
                this.inputManager.player.targetLook = this.holoMesh.absolutePosition;
                this.inputManager.player.targetDestination = this.interactionAnchor.absolutePosition.clone();
            });
            this.showPage(this.currentPage);
            await this.open();
        }
    }
}
class MainMenuPanelPage {
    constructor(mainMenuPanel) {
        this.mainMenuPanel = mainMenuPanel;
        this.targetTitleHeight = 220;
        this.elements = [];
    }
    async show(duration) {
        this.mainMenuPanel.animateTitleHeight(this.targetTitleHeight, duration);
        for (let i = 0; i < this.elements.length - 1; i++) {
            let e = this.elements[i];
            if (e instanceof SlikaImage) {
                e.animateSize(1, duration);
            }
            else {
                this.elements[i].animateAlpha(1, duration);
            }
        }
        let e = this.elements[this.elements.length - 1];
        if (e instanceof SlikaImage) {
            await e.animateSize(1, duration);
        }
        else {
            await e.animateAlpha(1, duration);
        }
    }
    async hide(duration) {
        for (let i = 0; i < this.elements.length - 1; i++) {
            let e = this.elements[i];
            if (e instanceof SlikaImage) {
                e.animateSize(0, duration);
            }
            else {
                this.elements[i].animateAlpha(0, duration);
            }
        }
        let e = this.elements[this.elements.length - 1];
        if (e instanceof SlikaImage) {
            await e.animateSize(0, duration);
        }
        else {
            await e.animateAlpha(0, duration);
        }
    }
}
/// <reference path="./MainMenuPanelPage.ts"/>
class MainMenuPanelGraphicsPage extends MainMenuPanelPage {
    get holoSlika() {
        return this.mainMenuPanel.holoSlika;
    }
    constructor(mainMenuPanel) {
        super(mainMenuPanel);
        this.targetTitleHeight = 150;
        let confPreset = window.localStorage.getItem("graphic-setting-preset");
        let title1 = this.holoSlika.add(new SlikaText({
            text: "GRAPHIC SETTINGS",
            x: 500,
            y: 110,
            textAlign: "center",
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontSize: 60,
            fontFamily: "XoloniumRegular",
            highlightRadius: 0
        }));
        let buttonHigh = new SlikaButton("HIGH", new SPosition(120, 250), confPreset === ConfigurationPreset.High ? SlikaButtonState.Active : SlikaButtonState.Enabled, 350, 120, 50);
        this.holoSlika.add(buttonHigh);
        let buttonHighExplain = new SlikaTextBox({
            text: "- Large planets and extended render distance.\n- Select if you're playing on a gaming PC or a high-end mobile phone.",
            x: 530,
            y: 265,
            w: 400,
            h: 90,
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontFamily: "XoloniumRegular",
            fontSize: 20,
            highlightRadius: 4
        });
        this.holoSlika.add(buttonHighExplain);
        let buttonMedium = new SlikaButton("MEDIUM", new SPosition(120, 420), confPreset === ConfigurationPreset.Medium ? SlikaButtonState.Active : SlikaButtonState.Enabled, 350, 120, 50);
        this.holoSlika.add(buttonMedium);
        let buttonMediumExplain = new SlikaTextBox({
            text: "- Medium planets and normal render distance. ",
            x: 530,
            y: 450,
            w: 400,
            h: 50,
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontFamily: "XoloniumRegular",
            fontSize: 20,
            highlightRadius: 4
        });
        this.holoSlika.add(buttonMediumExplain);
        let buttonLow = new SlikaButton("LOW", new SPosition(120, 590), confPreset === ConfigurationPreset.Low ? SlikaButtonState.Active : SlikaButtonState.Enabled, 350, 120, 50);
        this.holoSlika.add(buttonLow);
        let buttonLowExplain = new SlikaTextBox({
            text: "- Small planets and reduced render distance.\n- Select if you're playing on a mobile phone.",
            x: 530,
            y: 605,
            w: 400,
            h: 90,
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontFamily: "XoloniumRegular",
            fontSize: 20,
            highlightRadius: 4
        });
        this.holoSlika.add(buttonLowExplain);
        let buttonBack = new SlikaButton("BACK", new SPosition(120, 820), SlikaButtonState.Enabled, 200, 100, 40);
        this.holoSlika.add(buttonBack);
        let buttonNext = new SlikaButton("NEXT", new SPosition(700, 820), confPreset === ConfigurationPreset.None ? SlikaButtonState.Disabled : SlikaButtonState.Enabled, 200, 100, 40);
        this.holoSlika.add(buttonNext);
        buttonHigh.onPointerUp = () => {
            buttonHigh.setStatus(SlikaButtonState.Active);
            buttonMedium.setStatus(SlikaButtonState.Enabled);
            buttonLow.setStatus(SlikaButtonState.Enabled);
            buttonNext.setStatus(SlikaButtonState.Enabled);
            Config.setConfHighPreset();
        };
        buttonMedium.onPointerUp = () => {
            buttonHigh.setStatus(SlikaButtonState.Enabled);
            buttonMedium.setStatus(SlikaButtonState.Active);
            buttonLow.setStatus(SlikaButtonState.Enabled);
            buttonNext.setStatus(SlikaButtonState.Enabled);
            Config.setConfMediumPreset();
        };
        buttonLow.onPointerUp = () => {
            buttonHigh.setStatus(SlikaButtonState.Enabled);
            buttonMedium.setStatus(SlikaButtonState.Enabled);
            buttonLow.setStatus(SlikaButtonState.Active);
            buttonNext.setStatus(SlikaButtonState.Enabled);
            Config.setConfLowPreset();
        };
        buttonBack.onPointerUp = async () => {
            this.mainMenuPanel.animateTitleHeight(this.mainMenuPanel.pages[0].targetTitleHeight, 1);
            this.mainMenuPanel.showPage(0);
        };
        buttonNext.onPointerUp = async () => {
            if (buttonNext.state === SlikaButtonState.Enabled) {
                this.mainMenuPanel.animateTitleHeight(this.mainMenuPanel.pages[2].targetTitleHeight, 1);
                this.mainMenuPanel.showPage(2);
            }
        };
        this.elements.push(title1, buttonHigh, buttonHighExplain, buttonMedium, buttonMediumExplain, buttonLow, buttonLowExplain, buttonBack, buttonNext);
    }
}
/// <reference path="./MainMenuPanelPage.ts"/>
class MainMenuPanelIntroPage extends MainMenuPanelPage {
    get holoSlika() {
        return this.mainMenuPanel.holoSlika;
    }
    constructor(mainMenuPanel) {
        super(mainMenuPanel);
        let title1 = this.holoSlika.add(new SlikaText({
            text: "Welcome to",
            x: 500,
            y: 110,
            textAlign: "center",
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontSize: 60,
            fontFamily: "XoloniumRegular",
            highlightRadius: 0
        }));
        let title2 = this.holoSlika.add(new SlikaText({
            text: "PLANET BUILDER WEB",
            x: 500,
            y: 180,
            textAlign: "center",
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontSize: 60,
            fontFamily: "XoloniumRegular",
            highlightRadius: 0
        }));
        let text1 = this.holoSlika.add(new SlikaText({
            text: "a Spherical Voxel",
            x: 550,
            y: 370,
            textAlign: "end",
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontSize: 50,
            fontFamily: "XoloniumRegular",
            highlightRadius: 0
        }));
        let text2 = this.holoSlika.add(new SlikaText({
            text: "Engine demo",
            x: 550,
            y: 430,
            textAlign: "end",
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontSize: 50,
            fontFamily: "XoloniumRegular",
            highlightRadius: 0
        }));
        let textDecoy = this.holoSlika.add(SlikaPath.CreatePan(100, 620, 460, 3, 30, 0.15, false, true, new SlikaShapeStyle("none", 1, Config.uiConfiguration.holoScreenBaseColor, 1, 0, Config.uiConfiguration.holoScreenBaseColor, 6)));
        let planetImage = this.holoSlika.add(new SlikaImage(new SPosition(750, 390), 200, 200, "datas/images/planet.png"));
        let buttonEnter = new SlikaButton("Enter", new SPosition(275, 550), SlikaButtonState.Enabled);
        buttonEnter.onPointerUp = async () => {
            this.mainMenuPanel.animateTitleHeight(this.mainMenuPanel.pages[1].targetTitleHeight, 1);
            this.mainMenuPanel.showPage(1);
        };
        this.holoSlika.add(buttonEnter);
        let buttonPlayLabel = this.holoSlika.add(new SlikaText({
            text: "(press to enter)",
            x: 500,
            y: 750,
            textAlign: "center",
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontSize: 30,
            fontFamily: "XoloniumRegular",
            highlightRadius: 0
        }));
        let bottom1 = this.holoSlika.add(new SlikaText({
            text: "powered by BabylonJS",
            x: 850,
            y: 850,
            textAlign: "end",
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontSize: 40,
            fontFamily: "XoloniumRegular",
            highlightRadius: 0
        }));
        let babylonIcon = this.holoSlika.add(new SlikaImage(new SPosition(910, 835), 80, 80, "datas/images/babylonjs-holo-logo.png"));
        let bottom2 = this.holoSlika.add(new SlikaText({
            text: "made by Sven Frankson",
            x: 940,
            y: 920,
            textAlign: "end",
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontSize: 40,
            fontFamily: "XoloniumRegular",
            highlightRadius: 0
        }));
        this.elements.push(title1, title2, text1, text2, textDecoy, planetImage, buttonEnter, buttonPlayLabel, bottom1, babylonIcon, bottom2);
    }
}
/// <reference path="./MainMenuPanelPage.ts"/>
class MainMenuPanelTutorialPage extends MainMenuPanelPage {
    get holoSlika() {
        return this.mainMenuPanel.holoSlika;
    }
    constructor(mainMenuPanel) {
        super(mainMenuPanel);
        this.targetTitleHeight = 150;
        let title1 = this.holoSlika.add(new SlikaText({
            text: "TUTORIAL",
            x: 500,
            y: 110,
            textAlign: "center",
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontSize: 60,
            fontFamily: "XoloniumRegular",
            highlightRadius: 0
        }));
        let text1 = this.holoSlika.add(new SlikaText({
            text: "Take a quick control tutorial,",
            x: 100,
            y: 330,
            textAlign: "start",
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontSize: 50,
            fontFamily: "XoloniumRegular",
            highlightRadius: 0
        }));
        let text2 = this.holoSlika.add(new SlikaText({
            text: "or press NEXT to skip.",
            x: 100,
            y: 400,
            textAlign: "start",
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontSize: 50,
            fontFamily: "XoloniumRegular",
            highlightRadius: 0
        }));
        let buttonEnter = new SlikaButton("Start Tutorial", new SPosition(150, 500), SlikaButtonState.Enabled, 700);
        buttonEnter.onPointerUp = async () => {
            if (this.mainMenuPanel.main instanceof MainMenu) {
                this.mainMenuPanel.close();
                this.mainMenuPanel.animateTitleHeight(this.mainMenuPanel.pages[3].targetTitleHeight, 1);
                this.mainMenuPanel.showPage(3);
                this.mainMenuPanel.main.player.registerControl();
                this.mainMenuPanel.main.tutorialManager.runTutorial();
            }
        };
        this.holoSlika.add(buttonEnter);
        let buttonBack = new SlikaButton("BACK", new SPosition(120, 820), SlikaButtonState.Enabled, 200, 100, 40);
        this.holoSlika.add(buttonBack);
        let buttonNext = new SlikaButton("NEXT", new SPosition(700, 820), SlikaButtonState.Enabled, 200, 100, 40);
        this.holoSlika.add(buttonNext);
        buttonBack.onPointerUp = async () => {
            this.mainMenuPanel.animateTitleHeight(this.mainMenuPanel.pages[1].targetTitleHeight, 1);
            this.mainMenuPanel.showPage(1);
        };
        buttonNext.onPointerUp = async () => {
            if (this.mainMenuPanel.main instanceof MainMenu) {
                this.mainMenuPanel.main.player.registerControl();
            }
            this.mainMenuPanel.animateTitleHeight(this.mainMenuPanel.pages[3].targetTitleHeight, 1);
            this.mainMenuPanel.showPage(3);
        };
        this.elements.push(title1, text1, text2, buttonEnter, buttonBack, buttonNext);
    }
}
/// <reference path="./MainMenuPanelPage.ts"/>
class MainMenuPlanetSelectionPage extends MainMenuPanelPage {
    constructor(mainMenuPanel) {
        super(mainMenuPanel);
        this.currentPlanetIndex = 0;
        this.planetNames = [
            "M6-Blue",
            "Horus",
            "Pavlita-6B",
            "Echo-V",
        ];
        this.planetDescriptions = [
            "\n- radius : 460m\n\n- type : telluric\n\n- moons : 0",
            "\n- radius : 210m\n\n- type : mars\n\n- moons : 2",
            "\n- radius : 82m\n\n- type : telluric\n\n- moons : 1",
            "\n- radius : 623m\n\n- type : dry\n\n- moons : 0"
        ];
        this.targetTitleHeight = 150;
        let title1 = this.holoSlika.add(new SlikaText({
            text: "PLANET SELECTION",
            x: 500,
            y: 110,
            textAlign: "center",
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontSize: 60,
            fontFamily: "XoloniumRegular",
            highlightRadius: 0
        }));
        let buttonLeft = new SlikaButton("<", new SPosition(80, 470), SlikaButtonState.Enabled, 100, 100, 80);
        buttonLeft.onPointerUp = () => {
            this.currentPlanetIndex = (this.currentPlanetIndex - 1 + this.planetNames.length) % this.planetNames.length;
            this.updateCurrentPlanetIndex(true);
        };
        this.holoSlika.add(buttonLeft);
        let buttonRight = new SlikaButton(">", new SPosition(820, 470), SlikaButtonState.Enabled, 100, 100, 80);
        buttonRight.onPointerUp = () => {
            this.currentPlanetIndex = (this.currentPlanetIndex + 1) % this.planetNames.length;
            this.updateCurrentPlanetIndex();
        };
        this.holoSlika.add(buttonRight);
        this.planetNameElement = this.holoSlika.add(new SlikaText({
            text: "id: " + this.planetNames[this.currentPlanetIndex],
            x: 500,
            y: 300,
            textAlign: "center",
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontSize: 60,
            fontFamily: "XoloniumRegular",
            highlightRadius: 0
        }));
        let planetImage = this.holoSlika.add(new SlikaImage(new SPosition(370, 520), 250, 250, "datas/images/planet.png"));
        this.locationImage = this.holoSlika.add(new SlikaImage(new SPosition(260, 390), 80, 80, "datas/images/location.png"));
        this.planetDescElement = new SlikaTextBox({
            text: this.planetDescriptions[this.currentPlanetIndex],
            x: 540,
            y: 370,
            w: 220,
            h: 300,
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontFamily: "XoloniumRegular",
            fontSize: 24,
            highlightRadius: 4
        });
        this.holoSlika.add(this.planetDescElement);
        let buttonBack = new SlikaButton("BACK", new SPosition(120, 820), SlikaButtonState.Enabled, 200, 100, 40);
        buttonBack.onPointerUp = async () => {
            this.mainMenuPanel.animateTitleHeight(this.mainMenuPanel.pages[2].targetTitleHeight, 1);
            this.mainMenuPanel.showPage(2);
        };
        this.holoSlika.add(buttonBack);
        let buttonGo = new SlikaButton("GO !", new SPosition(600, 770), SlikaButtonState.Enabled, 300, 150, 60);
        buttonGo.onPointerUp = async () => {
            let destinationPlanet = this.mainMenuPanel.main.planets[this.currentPlanetIndex];
            if (this.mainMenuPanel.main.cameraManager.player.planet != destinationPlanet) {
                let randomPosition = new BABYLON.Vector3(Math.random(), Math.random(), Math.random()).normalize();
                let planetSide = PlanetTools.PlanetPositionToPlanetSide(destinationPlanet, randomPosition);
                let global = PlanetTools.PlanetDirectionToGlobalIJ(planetSide, randomPosition);
                let destinationAltitude = PlanetTools.KGlobalToAltitude(Math.floor(destinationPlanet.generator.altitudeMap.getForSide(planetSide.side, global.i, global.j) * destinationPlanet.kPosMax * PlanetTools.CHUNCKSIZE));
                let destinationPoint = randomPosition.normalize().scale(destinationAltitude + 1).add(destinationPlanet.position);
                let flightPlan = FlyTool.CreateFlightPlan(this.mainMenuPanel.main.cameraManager.player.position, this.mainMenuPanel.main.cameraManager.player.planet, destinationPoint, destinationPlanet);
                //FlyTool.ShowWaypoints(flightPlan.waypoints, this.mainMenuPanel.scene);
                FlyTool.Fly(flightPlan, this.mainMenuPanel.main.cameraManager.player, this.mainMenuPanel.main.scene);
            }
        };
        this.holoSlika.add(buttonGo);
        /*
        let buttonKillChunckManagers = new SlikaButton(
            "K",
            new SPosition(80, 270),
            SlikaButtonState.Red,
            100,
            100,
            80
        );
        buttonKillChunckManagers.onPointerUp = () => {
            this.mainMenuPanel.main.planets.forEach(p => {
                p.chunckManager.dispose();
            });
        }
        this.holoSlika.add(buttonKillChunckManagers);
        */
        this.elements.push(title1, buttonLeft, buttonRight, this.planetNameElement, planetImage, this.locationImage, this.planetDescElement, buttonBack, buttonGo);
    }
    get holoSlika() {
        return this.mainMenuPanel.holoSlika;
    }
    async show(duration) {
        let planet = this.mainMenuPanel.main.planets[this.currentPlanetIndex];
        if (this.mainMenuPanel.main.cameraManager.player && this.mainMenuPanel.main.cameraManager.player.planet === planet) {
            this.locationImage.display = true;
        }
        else {
            this.locationImage.display = false;
        }
        this.planetNames = this.mainMenuPanel.main.planets.map(p => { return p.name; });
        this.planetDescriptions = this.mainMenuPanel.main.planets.map(p => { return "\n- radius " + p.seaAltitude.toFixed(0) + "m\n- type " + p.generator.type + "\n"; });
        this.planetDescElement.prop.text = this.planetDescriptions[this.currentPlanetIndex];
        this.planetNameElement.prop.text = "id: " + this.planetNames[this.currentPlanetIndex];
        /*"\n- radius : 623m\n\n- type : dry\n\n- moons : 0"*/
        return super.show(duration);
    }
    async updateCurrentPlanetIndex(left) {
        let planet = this.mainMenuPanel.main.planets[this.currentPlanetIndex];
        if (this.mainMenuPanel.main.cameraManager.player && this.mainMenuPanel.main.cameraManager.player.planet === planet) {
            this.locationImage.display = true;
            this.locationImage.animateSize(1, 0.3);
        }
        else {
            this.locationImage.display = true;
            this.locationImage.animateSize(0, 0.3);
        }
        this.planetDescElement.animateAlpha(0, 0.3);
        await this.planetNameElement.animatePosX(left ? 1500 : 0, 0.3);
        this.planetDescElement.prop.text = this.planetDescriptions[this.currentPlanetIndex];
        this.planetNameElement.prop.text = "id: " + this.planetNames[this.currentPlanetIndex];
        this.planetNameElement.prop.x = left ? -500 : 1500;
        this.planetDescElement.animateAlpha(1, 0.3);
        await this.planetNameElement.animatePosX(500, 0.3);
    }
}
class AnimationFactory {
    static CreateNumber(owner, obj, property, onUpdateCallback) {
        return (target, duration) => {
            return new Promise(resolve => {
                let origin = obj[property];
                let t = 0;
                if (owner[property + "_animation"]) {
                    owner.scene.onBeforeRenderObservable.removeCallback(owner[property + "_animation"]);
                }
                let animationCB = () => {
                    t += 1 / 60;
                    let f = t / duration;
                    if (f < 1) {
                        obj[property] = origin * (1 - f) + target * f;
                        if (onUpdateCallback) {
                            onUpdateCallback();
                        }
                    }
                    else {
                        obj[property] = target;
                        if (onUpdateCallback) {
                            onUpdateCallback();
                        }
                        owner.scene.onBeforeRenderObservable.removeCallback(animationCB);
                        owner[property + "_animation"] = undefined;
                        resolve();
                    }
                };
                owner.scene.onBeforeRenderObservable.add(animationCB);
                owner[property + "_animation"] = animationCB;
            });
        };
    }
}
AnimationFactory.EmptyNumberCallback = async (target, duration) => { };
class ColorUtils {
    static RGBToHSL(color) {
        let r = color.r;
        let g = color.g;
        let b = color.b;
        let cMax = Math.max(r, g, b);
        let cMin = Math.min(r, g, b);
        let d = cMax - cMin;
        let h = 0;
        let s = 0;
        let l = (cMax + cMin) * 0.5;
        if (d > 0) {
            if (d === r) {
                h = Math.round(60 * ((g - b) / d));
            }
            else if (d === g) {
                h = Math.round(60 * ((b - r) / d));
            }
            else if (d === b) {
                h = Math.round(60 * ((r - g) / d));
            }
            if (h >= 360) {
                h -= 360;
            }
            s = d / (1 - Math.abs(2 * l - 1));
        }
        return {
            h: h,
            s: s,
            l: l
        };
    }
    static HSLToRGBToRef(hsl, ref) {
        let c = (1 - Math.abs(2 * hsl.l - 1)) * hsl.s;
        let x = c * (1 - Math.abs((hsl.h / 60) % 2 - 1));
        let m = hsl.l - c / 2;
        if (hsl.h < 60) {
            ref.r = c + m;
            ref.g = x + m;
            ref.b = m;
        }
        else if (hsl.h < 120) {
            ref.r = x + m;
            ref.g = c + m;
            ref.b = m;
        }
        else if (hsl.h < 180) {
            ref.r = m;
            ref.g = c + m;
            ref.b = x + m;
        }
        else if (hsl.h < 240) {
            ref.r = m;
            ref.g = x + m;
            ref.b = c + m;
        }
        else if (hsl.h < 300) {
            ref.r = x + m;
            ref.g = m;
            ref.b = c + m;
        }
        else {
            ref.r = c + m;
            ref.g = m;
            ref.b = x + m;
        }
    }
}
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
    push(e) {
        if (this._elements.indexOf(e) === -1) {
            this._elements.push(e);
        }
    }
    remove(e) {
        let i = this._elements.indexOf(e);
        if (i != -1) {
            this._elements.splice(i, 1);
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
}
/// <reference path="./UniqueList.ts"/>
class ConfigurationChunckPart {
    constructor() {
        this.dir = "datas/meshes";
        this._filename = "chunck-parts";
        this._lodMin = 0;
        this._lodMax = 2;
        this.useXZAxisRotation = true;
        this.onChunckPartConfigChangedCallbacks = new UniqueList();
    }
    get filename() {
        return this._filename;
    }
    setFilename(v, ignoreCallback) {
        this._filename = v;
        if (!ignoreCallback) {
            this.onChunckPartConfigChangedCallbacks.forEach(c => {
                c();
            });
        }
    }
    get lodMin() {
        return this._lodMin;
    }
    setLodMin(v, ignoreCallback) {
        this._lodMin = v;
        if (!ignoreCallback) {
            this.onChunckPartConfigChangedCallbacks.forEach(c => {
                c();
            });
        }
    }
    get lodMax() {
        return this._lodMax;
    }
    setLodMax(v, ignoreCallback) {
        this._lodMax = v;
        if (!ignoreCallback) {
            this.onChunckPartConfigChangedCallbacks.forEach(c => {
                c();
            });
        }
    }
}
class ConfigurationPerformance {
    constructor() {
        this.lodRanges = [40, 80, 160, 320, 640, 1280];
        this._lodMin = 1;
        this._lodCount = 1;
        this.shellMeshVertexCount = 16;
        this.shellMeshTextureSize = 64;
        this._holoScreenFactor = 0.4;
        this.onLodConfigChangedCallbacks = new UniqueList();
        this.onHoloScreenFactorChangedCallbacks = new UniqueList();
    }
    setLodRanges(v, ignoreCallback) {
        this.lodRanges = v;
        if (!ignoreCallback) {
            this.onLodConfigChangedCallbacks.forEach(c => {
                c();
            });
        }
    }
    get lodMin() {
        return this._lodMin;
    }
    setLodMin(v, ignoreCallback) {
        this._lodMin = v;
        if (!ignoreCallback) {
            this.onLodConfigChangedCallbacks.forEach(c => {
                c();
            });
        }
    }
    get lodCount() {
        return this._lodCount;
    }
    setLodCount(v, ignoreCallback) {
        this._lodCount = v;
        if (!ignoreCallback) {
            this.onLodConfigChangedCallbacks.forEach(c => {
                c();
            });
        }
    }
    get holoScreenFactor() {
        return this._holoScreenFactor;
    }
    setHoloScreenFactor(v, ignoreCallback) {
        this._holoScreenFactor = v;
        if (!ignoreCallback) {
            this.onHoloScreenFactorChangedCallbacks.forEach(c => {
                c();
            });
        }
    }
}
class ConfigurationControl {
    constructor() {
        this.canLockPointer = false;
    }
}
class ConfigurationUI {
    constructor() {
        this.holoScreenBaseColor = "#35b4d4";
    }
}
var ConfigurationPreset;
(function (ConfigurationPreset) {
    ConfigurationPreset["None"] = "none";
    ConfigurationPreset["Low"] = "low";
    ConfigurationPreset["Medium"] = "medium";
    ConfigurationPreset["High"] = "high";
    ConfigurationPreset["Custom"] = "custom";
})(ConfigurationPreset || (ConfigurationPreset = {}));
class Configuration {
    constructor() {
        this.confPreset = ConfigurationPreset.None;
        this.chunckPartConfiguration = new ConfigurationChunckPart();
        this.performanceConfiguration = new ConfigurationPerformance();
        this.controlConfiguration = new ConfigurationControl();
        this.uiConfiguration = new ConfigurationUI();
    }
    setConfHighPreset() {
        this.performanceConfiguration.setLodRanges([80, 160, 320, 640, 1280, 2560]);
        this.performanceConfiguration.setHoloScreenFactor(1);
        this.confPreset = ConfigurationPreset.High;
        window.localStorage.setItem("graphic-setting-preset", this.confPreset);
    }
    setConfMediumPreset() {
        this.performanceConfiguration.setLodRanges([60, 120, 240, 480, 960, 1920]);
        this.performanceConfiguration.setHoloScreenFactor(0.75);
        this.confPreset = ConfigurationPreset.Medium;
        window.localStorage.setItem("graphic-setting-preset", this.confPreset);
    }
    setConfLowPreset() {
        this.performanceConfiguration.setLodRanges([40, 80, 160, 320, 640, 1280]);
        this.performanceConfiguration.setHoloScreenFactor(0.5);
        this.confPreset = ConfigurationPreset.Low;
        window.localStorage.setItem("graphic-setting-preset", this.confPreset);
    }
}
var Config = new Configuration();
class Random {
    static Initialize() {
        let piDecimals = [];
        for (let i = 0; i < Random.PiDecimalsString.length / 4 - 1; i++) {
            piDecimals.push(parseInt(Random.PiDecimalsString.substring(4 * i, 4 * (i + 1))));
        }
        Random.Values = (piDecimals.map(v => { return v / 9999; }));
        Random.Length1 = Random.Values.length;
        Random.Length2 = Math.floor(Math.pow(Random.Length1, 1 / 2));
        Random.Length3 = Math.floor(Math.pow(Random.Length1, 1 / 3));
        Random.Length4 = Math.floor(Math.pow(Random.Length1, 1 / 4));
    }
    static GetN1(n, s = Random.Seed) {
        let i = (n + s) % Random.Length1;
        return Random.Values[i];
    }
    static GetN2(x, y, s = Random.Seed) {
        let i = (x + s) % Random.Length2;
        let j = (y + s) % Random.Length2;
        return Random.Values[i + j * Random.Length2];
    }
    static GetN3(x, y, z, s = Random.Seed) {
        let i = (x + s) % Random.Length3;
        let j = (y + s) % Random.Length3;
        let k = (z + s) % Random.Length3;
        return Random.Values[i + j * Random.Length3 + k * Random.Length3 * Random.Length3];
    }
    static GetN4(x, y, z, w, s = Random.Seed) {
        let i = (x + s) % Random.Length4;
        let j = (y + s) % Random.Length4;
        let k = (z + s) % Random.Length4;
        let l = (w + s) % Random.Length4;
        return Random.Values[i + j * Random.Length4 + k * Random.Length4 * Random.Length4 + l * Random.Length4 * Random.Length4 * Random.Length4];
    }
}
Random.Seed = 0;
Random.Length1 = 1;
Random.Length2 = 1;
Random.Length3 = 1;
Random.Length4 = 1;
Random.PiDecimalsString = "14159265358979323846264338327950288419716939937510582097494459230781640628620899862803482534211706798214808651328230664709384460955058223172535940812848111745028410270193852110555964462294895493038196442881097566593344612847564823378678316527120190914564856692346034861045432664821339360726024914127372458700660631558817488152092096282925409171536436789259036001133053054882046652138414695194151160943305727036575959195309218611738193261179310511854807446237996274956735188575272489122793818301194912983367336244065664308602139494639522473719070217986094370277053921717629317675238467481846766940513200056812714526356082778577134275778960917363717872146844090122495343014654958537105079227968925892354201995611212902196086403441815981362977477130996051870721134999999837297804995105973173281609631859502445945534690830264252230825334468503526193118817101000313783875288658753320838142061717766914730359825349042875546873115956286388235378759375195778185778053217122680661300192787661119590921642019893809525720106548586327886593615338182796823030195203530185296899577362259941389124972177528347913151557485724245415069595082953311686172785588907509838175463746493931925506040092770167113900984882401285836160356370766010471018194295559619894676783744944825537977472684710404753464620804668425906949129331367702898915210475216205696602405803815019351125338243003558764024749647326391419927260426992279678235478163600934172164121992458631503028618297455570674983850549458858692699569092721079750930295532116534498720275596023648066549911988183479775356636980742654252786255181841757467289097777279380008164706001614524919217321721477235014144197356854816136115735255213347574184946843852332390739414333454776241686251898356948556209921922218427255025425688767179049460165346680498862723279178608578438382796797668145410095388378636095068006422512520511739298489608412848862694560424196528502221066118630674427862203919494504712371378696095636437191728746776465757396241389086583264599581339047802759009946576407895126946839835259570982582262052248940772671947826848260147699090264013639443745530506820349625245174939965143142980919065925093722169646151570985838741059788595977297549893016175392846813826868386894277415599185592524595395943104997252468084598727364469584865383673622262609912460805124388439045124413654976278079771569143599770012961608944169486855584840635342207222582848864815845602850601684273945226746767889525213852254995466672782398645659611635488623057745649803559363456817432411251507606947945109659609402522887971089314566913686722874894056010150330861792868092087476091782493858900971490967598526136554978189312978482168299894872265880485756401427047755513237964145152374623436454285844479526586782105114135473573952311342716610213596953623144295248493718711014576540359027993440374200731057853906219838744780847848968332144571386875194350643021845319104848100537061468067491927819119793995206141966342875444064374512371819217999839101591956181467514269123974894090718649423196156794520809514655022523160388193014209376213785595663893778708303906979207734672218256259966150142150306803844773454920260541466592520149744285073251866600213243408819071048633173464965145390579626856100550810665879699816357473638405257145910289706414011097120628043903975951567715770042033786993600723055876317635942187312514712053292819182618612586732157919841484882916447060957527069572209175671167229109816909152801735067127485832228718352093539657251210835791513698820914442100675103346711031412671113699086585163983150197016515116851714376576183515565088490998985998238734552833163550764791853589322618548963213293308985706420467525907091548141654985946163718027098199430992448895757128289059232332609729971208443357326548938239119325974636673058360414281388303203824903758985243744170291327656180937734440307074692112019130203303801976211011004492932151608424448596376698389522868478312355265821314495768572624334418930396864262434107732269780280731891544110104468232527162010526522721116603966655730925471105578537634668206531098965269186205647693125705863566201855810072936065987648611791045334885034611365768675324944166803962657978771855608455296541266540853061434443185867697514566140680070023787765913440171274947042056223053899456131407112700040785473326993908145466464588079727082668306343285878569830523580893306575740679545716377525420211495576158140025012622859413021647155097925923099079654737612551765675135751782966645477917450112996148903046399471329621073404375189573596145890193897131117904297828564750320319869151402870808599048010941214722131794764777262241425485454033215718530614228813758504306332175182979866223717215916077166925474873898665494945011465406284336639379003976926567214638530673609657120918076383271664162748888007869256029022847210403172118608204190004229661711963779213375751149595015660496318629472654736425230817703675159067350235072835405670403867435136222247715891504953098444893330963408780769325993978054193414473774418426312986080998886874132604721";
Random.Initialize();
class Utils {
    static showDebugPlanetHeightMap(heightMap, x, y, maxValue, scene) {
        let debugPlanet = new BABYLON.Mesh("debug-planet");
        if (!scene) {
            scene = BABYLON.Engine.Instances[0].scenes[0];
        }
        for (let i = 0; i < 6; i++) {
            BABYLON.SceneLoader.ImportMesh("", "./resources/models/planet-side.babylon", "", scene, (meshes) => {
                let debugPlanetSide = meshes[0];
                if (debugPlanetSide instanceof (BABYLON.Mesh)) {
                    let debugPlanetSideMaterial = new BABYLON.StandardMaterial("debub-planet-side-material", scene);
                    debugPlanetSideMaterial.diffuseTexture = heightMap.getTexture(i, maxValue);
                    debugPlanetSideMaterial.emissiveColor = BABYLON.Color3.White();
                    debugPlanetSideMaterial.specularColor = BABYLON.Color3.Black();
                    debugPlanetSide.material = debugPlanetSideMaterial;
                    debugPlanetSide.rotationQuaternion = PlanetTools.QuaternionForSide(i);
                    debugPlanetSide.parent = debugPlanet;
                }
            });
        }
        scene.onBeforeRenderObservable.add(() => {
            scene.activeCamera.computeWorldMatrix();
            debugPlanet.position.copyFrom(scene.activeCamera.position);
            debugPlanet.position.addInPlace(scene.activeCamera.getDirection(BABYLON.Axis.Z).scale(7));
            debugPlanet.position.addInPlace(scene.activeCamera.getDirection(BABYLON.Axis.X).scale(x));
            debugPlanet.position.addInPlace(scene.activeCamera.getDirection(BABYLON.Axis.Y).scale(y));
        });
    }
    static showDebugPlanetMap(generator, x, y, maxValue, scene) {
        let debugPlanet = new BABYLON.Mesh("debug-planet");
        if (!scene) {
            scene = BABYLON.Engine.Instances[0].scenes[0];
        }
        for (let i = 0; i < 6; i++) {
            BABYLON.SceneLoader.ImportMesh("", "./resources/models/planet-side.babylon", "", scene, (meshes) => {
                let debugPlanetSide = meshes[0];
                if (debugPlanetSide instanceof (BABYLON.Mesh)) {
                    let debugPlanetSideMaterial = new BABYLON.StandardMaterial("debub-planet-side-material", scene);
                    debugPlanetSideMaterial.diffuseTexture = generator.getTexture(i, Config.performanceConfiguration.shellMeshTextureSize);
                    debugPlanetSideMaterial.emissiveColor = BABYLON.Color3.White();
                    debugPlanetSideMaterial.specularColor = BABYLON.Color3.Black();
                    debugPlanetSide.material = debugPlanetSideMaterial;
                    debugPlanetSide.rotationQuaternion = PlanetTools.QuaternionForSide(i);
                    debugPlanetSide.parent = debugPlanet;
                }
            });
        }
        scene.onBeforeRenderObservable.add(() => {
            scene.activeCamera.computeWorldMatrix();
            debugPlanet.position.copyFrom(scene.activeCamera.position);
            debugPlanet.position.addInPlace(scene.activeCamera.getDirection(BABYLON.Axis.Z).scale(7));
            debugPlanet.position.addInPlace(scene.activeCamera.getDirection(BABYLON.Axis.X).scale(x));
            debugPlanet.position.addInPlace(scene.activeCamera.getDirection(BABYLON.Axis.Y).scale(y));
        });
    }
    static compress(input) {
        let output = "";
        let i = 0;
        let l = input.length;
        let lastC = "";
        let lastCount = 0;
        while (i < l) {
            let c = input[i];
            if (c === lastC) {
                lastCount++;
            }
            else {
                if (lastCount > 3) {
                    if (lastCount < 10) {
                        output += ".";
                    }
                    else if (lastCount < 100) {
                        output += ":";
                    }
                    else if (lastCount < 1000) {
                        output += ";";
                    }
                    else if (lastCount < 10000) {
                        output += "!";
                    }
                    else if (lastCount < 100000) {
                        output += "?";
                    }
                    else {
                        output += "X_ERROR_TOO_MANY_REP_" + lastC + "_X";
                        return output;
                    }
                    output += lastCount.toFixed(0) + lastC;
                    lastC = c;
                    lastCount = 1;
                }
                else {
                    for (let n = 0; n < lastCount; n++) {
                        output += lastC;
                    }
                    lastC = c;
                    lastCount = 1;
                }
            }
            i++;
        }
        if (lastCount > 3) {
            if (lastCount < 10) {
                output += ".";
            }
            else if (lastCount < 100) {
                output += ":";
            }
            else if (lastCount < 1000) {
                output += ";";
            }
            else if (lastCount < 10000) {
                output += "!";
            }
            else if (lastCount < 100000) {
                output += "?";
            }
            else {
                output += "X_ERROR_TOO_MANY_REP_" + lastC + "_X";
                return output;
            }
            output += lastCount.toFixed(0) + lastC;
        }
        else {
            for (let n = 0; n < lastCount; n++) {
                output += lastC;
            }
        }
        return output;
    }
    static decompress(input) {
        let output = "";
        let i = -1;
        let l = input.length;
        while (i < l - 1) {
            let c = input[++i];
            if (c === ".") {
                let countS = input[++i];
                let count = parseInt(countS);
                c = input[++i];
                for (let n = 0; n < count; n++) {
                    output += c;
                }
            }
            else if (c === ":") {
                let countS = input[++i] + input[++i];
                let count = parseInt(countS);
                c = input[++i];
                for (let n = 0; n < count; n++) {
                    output += c;
                }
            }
            else if (c === ";") {
                let countS = input[++i] + input[++i] + input[++i];
                let count = parseInt(countS);
                c = input[++i];
                for (let n = 0; n < count; n++) {
                    output += c;
                }
            }
            else if (c === "!") {
                let countS = input[++i] + input[++i] + input[++i] + input[++i];
                let count = parseInt(countS);
                c = input[++i];
                for (let n = 0; n < count; n++) {
                    output += c;
                }
            }
            else if (c === "?") {
                let countS = input[++i] + input[++i] + input[++i] + input[++i] + input[++i];
                let count = parseInt(countS);
                c = input[++i];
                for (let n = 0; n < count; n++) {
                    output += c;
                }
            }
            else {
                output += c;
            }
        }
        return output;
    }
}
class VertexDataUtils {
    static MirrorX(data) {
        let scaledData = new BABYLON.VertexData();
        let positions = [];
        for (let i = 0; i < data.positions.length / 3; i++) {
            positions[3 * i] = -data.positions[3 * i];
            positions[3 * i + 1] = data.positions[3 * i + 1];
            positions[3 * i + 2] = data.positions[3 * i + 2];
        }
        scaledData.positions = positions;
        let indices = [];
        for (let i = 0; i < data.indices.length / 3; i++) {
            indices[3 * i] = data.indices[3 * i];
            indices[3 * i + 1] = data.indices[3 * i + 2];
            indices[3 * i + 2] = data.indices[3 * i + 1];
        }
        scaledData.indices = indices;
        let normals = [];
        for (let i = 0; i < data.normals.length / 3; i++) {
            normals[3 * i] = -data.normals[3 * i];
            normals[3 * i + 1] = data.normals[3 * i + 1];
            normals[3 * i + 2] = data.normals[3 * i + 2];
        }
        scaledData.normals = normals;
        if (data.colors) {
            scaledData.colors = [...data.colors];
        }
        if (data.uvs) {
            scaledData.uvs = [...data.uvs];
        }
        return scaledData;
    }
    static Scale(data, s) {
        let scaledData = new BABYLON.VertexData();
        scaledData.positions = data.positions.map((n) => { return n * s; });
        scaledData.indices = [...data.indices];
        scaledData.normals = [...data.normals];
        if (data.colors) {
            scaledData.colors = [...data.colors];
        }
        if (data.uvs) {
            scaledData.uvs = [...data.uvs];
        }
        return scaledData;
    }
}
