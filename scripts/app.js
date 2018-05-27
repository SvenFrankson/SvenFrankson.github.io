class MyAudioTest {
    static all() {
        let result = [];
        MyAudioTest.drum.forEach((i) => {
            result.push(i);
        });
        MyAudioTest.tom.forEach((i) => {
            result.push(i);
        });
        MyAudioTest.kora.forEach((i) => {
            result.push(i);
        });
        MyAudioTest.shake.forEach((i) => {
            result.push(i);
        });
        MyAudioTest.banjo.forEach((i) => {
            result.push(i);
        });
        MyAudioTest.perc.forEach((i) => {
            result.push(i);
        });
        return result;
    }
    static randomPerc() {
        return "perc" + Math.floor(Math.random() * 2);
    }
    static randomShake() {
        return "shake" + Math.floor(Math.random() * 3 + 1);
    }
    static randomTom() {
        return "tom" + Math.floor(Math.random() * 5 + 1);
    }
    static randomBanjo() {
        return "banjo" + Math.floor(Math.random() * 6 + 1);
    }
    static randomKora() {
        return "kora" + Math.floor(Math.random() * 3 + 1);
    }
    static Test1() {
        let context = new AudioContext();
        let recorderDestination = context.createMediaStreamDestination();
        let recorder = new MediaRecorder(recorderDestination.stream);
        let chunks = [];
        recorder.ondataavailable = function (evt) {
            // push each chunk (blobs) in an array
            console.log(".");
            chunks.push(evt.data);
        };
        recorder.onstop = function (evt) {
            // Make blob out of our blobs, and open it.
            console.log(chunks.length);
            console.log(chunks);
            var blob = new Blob(chunks, { 'type': 'audio/ogg; codecs=opus' });
            document.querySelector("audio").src = URL.createObjectURL(blob);
        };
        Sounds.loadSounds(MyAudioTest.all(), context, () => {
            console.log("All loaded !");
            let lTom = 4;
            let toms = [];
            for (let i = 0; i < 10; i++) {
                toms.push(MyAudioTest.Random(lTom, context, recorderDestination));
            }
            let blocksTom = [new Block(...toms)];
            for (let i = 1; i < 8; i++) {
                blocksTom[i] = blocksTom[i - 1].clone();
                blocksTom[i].time = lTom * i;
            }
            recorder.start();
            blocksTom.forEach((b) => {
                b.play(180);
            });
            setTimeout(() => {
                recorder.stop();
            }, 10000);
        });
    }
    static RandomShake(length, context, destination) {
        let r = Math.random();
        let b = new Brick(MyAudioTest.randomShake(), context, destination);
        b.time = Math.floor(Math.random() * 2 * length) / 2;
        return b;
    }
    static RandomKoraBrick(length, context, destination) {
        let r = Math.random();
        let b = new Brick(MyAudioTest.randomKora(), context, destination);
        b.time = Math.floor(Math.random() * 2 * length) / 2;
        return b;
    }
    static RandomTomBrick(length, context, destination) {
        let r = Math.random();
        let b = new Brick(MyAudioTest.randomTom(), context, destination);
        b.time = Math.floor(Math.random() * 2 * length) / 2;
        return b;
    }
    static RandomBanjo(length, context, destination) {
        let r = Math.random();
        let b = new Brick(MyAudioTest.randomBanjo(), context, destination);
        b.time = Math.floor(Math.random() * 2 * length) / 2;
        return b;
    }
    static Random(length, context, destination) {
        let r = Math.random();
        let i = Math.floor(Math.random() * 2 + 1);
        let b;
        if (r > 2 / 3) {
            b = new Brick("perc" + i, context, destination);
        }
        else if (r > 1 / 3) {
            b = new Brick("shake" + i, context, destination);
        }
        else {
            b = new Brick("tom" + i, context, destination);
        }
        b.time = Math.floor(Math.random() * 2 * length) / 2;
        return b;
    }
}
MyAudioTest.drum = [
    {
        name: "crash",
        url: "./data/sound/CYCdh_Crash-03.mp3"
    },
    {
        name: "kick",
        url: "./data/sound/CYCdh_ElecK01-Kick02.mp3"
    },
    {
        name: "snare",
        url: "./data/sound/CYCdh_K4-Snr05.mp3"
    }
];
MyAudioTest.perc = [
    {
        name: "perc1",
        url: "./data/sound/CYCdh_Kurz08-Perc02.wav"
    },
    {
        name: "perc2",
        url: "./data/sound/CYCdh_Kurz08-Perc03.wav"
    }
];
MyAudioTest.shake = [
    {
        name: "shake1",
        url: "./data/sound/CYCdh_VinylK1-Shkr01.wav"
    },
    {
        name: "shake2",
        url: "./data/sound/CYCdh_VinylK1-Shkr02.wav"
    },
    {
        name: "shake3",
        url: "./data/sound/CYCdh_VinylK1-Shkr03.wav"
    }
];
MyAudioTest.tom = [
    {
        name: "tom1",
        url: "./data/sound/CYCdh_ElecK03-Tom01.wav"
    },
    {
        name: "tom2",
        url: "./data/sound/CYCdh_ElecK03-Tom02.wav"
    },
    {
        name: "tom3",
        url: "./data/sound/CYCdh_ElecK03-Tom03.wav"
    },
    {
        name: "tom4",
        url: "./data/sound/CYCdh_ElecK03-Tom04.wav"
    },
    {
        name: "tom5",
        url: "./data/sound/CYCdh_ElecK03-Tom05.wav"
    }
];
MyAudioTest.banjo = [
    {
        name: "banjo1",
        url: "./data/sound/banjo_A3_very-long_piano_normal.mp3"
    },
    {
        name: "banjo2",
        url: "./data/sound/banjo_A4_very-long_piano_normal.mp3"
    },
    {
        name: "banjo3",
        url: "./data/sound/banjo_A5_very-long_piano_normal.mp3"
    },
    {
        name: "banjo4",
        url: "./data/sound/banjo_B3_very-long_piano_normal.mp3"
    },
    {
        name: "banjo5",
        url: "./data/sound/banjo_B4_very-long_piano_normal.mp3"
    },
    {
        name: "banjo6",
        url: "./data/sound/banjo_B5_very-long_piano_normal.mp3"
    }
];
MyAudioTest.kora = [
    {
        name: "kora1",
        url: "./data/sound/kora1.wav"
    },
    {
        name: "kora2",
        url: "./data/sound/kora2.wav"
    },
    {
        name: "kora3",
        url: "./data/sound/kora3.wav"
    }
];
class Main {
    constructor(canvasElement) {
        Main.Canvas = document.getElementById(canvasElement);
        Main.Engine = new BABYLON.Engine(Main.Canvas, true);
    }
    async createScene() {
        Main.Scene = new BABYLON.Scene(Main.Engine);
        this.resize();
        let light = new BABYLON.HemisphericLight("Light", (new BABYLON.Vector3(0.5, 0.65, 0.8)).normalize(), Main.Scene);
        light.groundColor.copyFromFloats(0.5, 0.5, 0.5);
        light.intensity = 0.7;
        let ratio = Main.Canvas.clientWidth / Main.Canvas.clientHeight;
        let height = 5;
        let width = height * ratio;
        let depth = Math.max(height, width);
        let camera = new BABYLON.FreeCamera("MenuCamera", BABYLON.Vector3.Zero(), Main.Scene);
        camera.attachControl(Main.Canvas);
        camera.position.z = -depth / 2 - height / Math.tan(camera.fov / 2);
        camera.rotation.x = 0.06;
        let mat = new BABYLON.StandardMaterial("Test", Main.Scene);
        mat.diffuseColor = Main.Color;
        mat.specularColor.copyFromFloats(0.1, 0.1, 0.1);
        mat.diffuseTexture = new BABYLON.Texture("./shadow.png", Main.Scene);
        let planeRight = BABYLON.MeshBuilder.CreatePlane("PlaneRight", { size: height * 2, width: depth * 2 }, Main.Scene);
        planeRight.position.x = width;
        planeRight.rotation.y = Math.PI / 2;
        planeRight.material = mat;
        let planeLeft = BABYLON.MeshBuilder.CreatePlane("PlaneLeft", { size: height * 2, width: depth * 2 }, Main.Scene);
        planeLeft.position.x = -width;
        planeLeft.rotation.y = -Math.PI / 2;
        planeLeft.material = mat;
        let planeBottom = BABYLON.MeshBuilder.CreatePlane("PlaneBottom", { size: depth * 2, width: width * 2 }, Main.Scene);
        planeBottom.position.y = -height;
        planeBottom.rotation.x = Math.PI / 2;
        planeBottom.material = mat;
        let planeBack = BABYLON.MeshBuilder.CreatePlane("PlaneBack", { size: height * 2, width: width * 2 }, Main.Scene);
        planeBack.position.z = depth;
        planeBack.material = mat;
        let planeTop = BABYLON.MeshBuilder.CreatePlane("PlaneTop", { size: depth * 2, width: width * 2 }, Main.Scene);
        planeTop.position.y = height;
        planeTop.rotation.x = -Math.PI / 2;
        planeTop.material = mat;
        /*
        for (let i: number = 0; i < 50; i++) {
            let m = this.createCube();
            m.position.x = (Math.random() - 0.5) * 2 * width;
            m.position.y = (Math.random() - 0.5) * 2 * height;
            m.position.z = (Math.random() - 0.5) * 2 * depth;
            let s = Math.random() + 0.5;
            m.scaling.copyFromFloats(s, s, s);
            let axis = new BABYLON.Vector3(
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5
            ).normalize();
            let speed = Math.random() / 100;
            Main.Scene.registerBeforeRender(
                () => {
                    m.rotate(axis, speed);
                }
            )
        }
        */
        let route = new Route();
        window.addEventListener('hashchange', route.route);
        route.route();
        while (true) {
            if (Math.random() < 0.5) {
                for (let i = 0; i < 6; i++) {
                    let x = width / 2 * (Math.random() - 0.5) * 2;
                    let z = depth / 2 * (Math.random() - 0.5) * 2;
                    await VoxelToy.start(new BABYLON.Vector3(x, -height, z));
                    await VoxelToy.wait(1.5);
                    await VoxelToy.end();
                }
            }
            else {
                let solarToy = new SolarToy(new BABYLON.Vector3(0, -height * 0.3, 0), new BABYLON.Vector3(-Math.PI / 8, 0, 0), width * 0.9, Main.Scene);
                await solarToy.start();
                await solarToy.wait(2);
                await solarToy.end();
            }
        }
    }
    animate() {
        Main.Engine.runRenderLoop(() => {
            Main.Scene.render();
        });
    }
    resize() {
        Main.Engine.resize();
    }
    createCube() {
        let mat = new BABYLON.StandardMaterial("Test", Main.Scene);
        mat.alpha = 0;
        let mesh = BABYLON.MeshBuilder.CreateBox("Test", {}, Main.Scene);
        mesh.material = mat;
        mesh.enableEdgesRendering();
        let lum = 3;
        mesh.edgesColor = Main.Color4.scale(lum);
        return mesh;
    }
    static StartCoroutine(coroutine) {
        let observer = Main.Scene.onBeforeRenderObservable.add(() => {
            if (coroutine.next().done) {
                Main.Scene.onBeforeRenderObservable.remove(observer);
            }
        });
    }
    static async RunCoroutine(coroutine) {
        return new Promise((resolve) => {
            let observer = Main.Scene.onBeforeRenderObservable.add(() => {
                if (coroutine.next().done) {
                    Main.Scene.onBeforeRenderObservable.remove(observer);
                    resolve();
                }
            });
        });
    }
}
Main.Color = BABYLON.Color3.FromHexString("#22724b");
Main.Color4 = new BABYLON.Color4(Main.Color.r, Main.Color.g, Main.Color.b, 1);
window.addEventListener("DOMContentLoaded", () => {
    let game = new Main("render-canvas");
    game.createScene();
    game.animate();
});
class NavTree {
    static Clear() {
        let navTree = document.getElementById("nav-tree");
        while (navTree.firstChild) {
            navTree.removeChild(navTree.firstChild);
        }
    }
    static Update(treeNode) {
        NavTree.Clear();
        let navTree = document.getElementById("nav-tree");
        for (let i = 0; i < treeNode.length; i++) {
            let a = document.createElement("a");
            a.href = treeNode[i].url;
            let e = document.createElement("span");
            e.textContent = treeNode[i].name;
            a.appendChild(e);
            navTree.appendChild(a);
            if (i !== treeNode.length - 1) {
                let separator = document.createElement("span");
                separator.textContent = " > ";
                navTree.appendChild(separator);
            }
        }
    }
}
class Route {
    constructor() {
        this.route = () => {
            let url = location.hash.slice(1) || "/";
            console.log("Route : Queried URL is '" + url + "'");
            if (url === "/") {
                this.home();
            }
            else if (url === "projects") {
                this.projects();
            }
            else if (url.startsWith("project/")) {
                let projectId = url.split("/")[1];
                this.project(projectId);
            }
            else if (url === "contact") {
                this.contact();
            }
            else if (url === "about") {
                this.about();
            }
            else {
                this.home();
            }
        };
    }
    home() {
        $.ajax({
            url: "./home.html",
            success: (data) => {
                document.getElementById("page").innerHTML = data;
                NavTree.Update([
                    {
                        name: "home",
                        url: "#"
                    }
                ]);
            }
        });
    }
    projects() {
        $.ajax({
            url: "./projects.html",
            success: (data) => {
                document.getElementById("page").innerHTML = data;
                NavTree.Update([
                    {
                        name: "home",
                        url: "#"
                    },
                    {
                        name: "projects",
                        url: "#projects"
                    }
                ]);
            }
        });
    }
    contact() {
        console.log("!");
        $.ajax({
            url: "./contact.html",
            success: (data) => {
                document.getElementById("page").innerHTML = data;
                NavTree.Update([
                    {
                        name: "home",
                        url: "#"
                    },
                    {
                        name: "contact",
                        url: "#contact"
                    }
                ]);
            }
        });
    }
    project(projectId) {
        $.ajax({
            url: "./project.html",
            success: (data) => {
                document.getElementById("page").innerHTML = data;
                $.getJSON("./content/projects/" + projectId + ".json", undefined, (data) => {
                    document.getElementById("project-title").innerText = data.name;
                    document.getElementById("project-image").setAttribute("src", data.img);
                    if (data.play) {
                        document.getElementById("project-play").setAttribute("href", data.play);
                    }
                    else {
                        document.getElementById("project-play").remove();
                    }
                    if (data.source) {
                        document.getElementById("project-source").setAttribute("href", data.source);
                    }
                    else {
                        document.getElementById("project-source").remove();
                    }
                    if (data.link) {
                        document.getElementById("project-link").setAttribute("href", data.link);
                    }
                    else {
                        document.getElementById("project-link").remove();
                    }
                });
                $.ajax({
                    url: "./content/projects/" + projectId + ".html",
                    success: (data) => {
                        document.getElementById("project-page").innerHTML = data;
                        NavTree.Update([
                            {
                                name: "home",
                                url: "#"
                            },
                            {
                                name: "projects",
                                url: "#projects"
                            },
                            {
                                name: projectId,
                                url: "#projects/" + projectId
                            }
                        ]);
                    }
                });
            }
        });
    }
    about() {
        document.getElementById("page").innerText = "ABOUT";
    }
}
class Sounds {
    static loadSound(info, context, callback) {
        var request = new XMLHttpRequest();
        request.open('GET', info.url, true);
        request.responseType = 'arraybuffer';
        // Decode asynchronously
        request.onload = function () {
            context.decodeAudioData(request.response, (buffer) => {
                Sounds._sounds.set(info.name, buffer);
                if (callback) {
                    callback();
                }
            });
        };
        request.send();
    }
    static loadSounds(infos, context, callback) {
        let info = infos.pop();
        if (info) {
            return Sounds.loadSound(info, context, () => {
                Sounds.loadSounds(infos, context, callback);
            });
        }
        else {
            if (callback) {
                return callback();
            }
        }
    }
    static get(name) {
        return Sounds._sounds.get(name);
    }
}
Sounds._sounds = new Map();
class Brick {
    constructor(name, context, recorderDestination, time = 0) {
        this.name = name;
        this.recorderDestination = recorderDestination;
        this.time = time;
        this.node = context.createBufferSource();
        this.node.connect(context.destination);
        this.node.connect(recorderDestination);
        this.node.buffer = Sounds.get(this.name);
    }
    clone() {
        return new Brick(this.name, this.node.context, this.recorderDestination, this.time);
    }
    play(deltaTime, bpm) {
        this.node.start((this.time + deltaTime) * 60 / bpm, 0.01);
    }
}
class Block {
    constructor(...bricks) {
        this.time = 0;
        this.bricks = bricks;
    }
    clone() {
        let clonedBricks = [];
        this.bricks.forEach((b) => {
            clonedBricks.push(b.clone());
        });
        return new Block(...clonedBricks);
    }
    play(bpm) {
        this.bricks.forEach((b) => {
            b.play(this.time, bpm);
        });
    }
}
class SolarToy extends BABYLON.TransformNode {
    constructor(position, rotation, radius, scene) {
        super("solarToy", scene);
        this.earthDiameter = 0.1;
        this.radius = 1;
        this.planets = [];
        this.alphas = [];
        this.speeds = [];
        this._update = () => {
            for (let i = 0; i < this.planets.length; i++) {
                this.alphas[i] += 0.002 * this.speeds[i];
                let r = i / (this.planets.length - 1) * this.radius;
                this.planets[i].position.x = r * Math.cos(this.alphas[i]);
                this.planets[i].position.z = r * Math.sin(this.alphas[i]);
                this.planets[i].rotation.y -= 0.003 * this.speeds[i];
            }
        };
        this.position = position;
        this.rotation = rotation;
        this.radius = radius;
    }
    static easeOutElastic(t) {
        var p = 0.3;
        return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
    }
    destroy() {
        this.sun.dispose();
        this.mercury.dispose();
        this.venus.dispose();
        this.earth.dispose();
        this.mars.dispose();
        this.jupiter.dispose();
        this.saturn.dispose();
        this.uranus.dispose();
        this.neptune.dispose();
        this.pluto.dispose();
        this.orbitLines.dispose();
        this.dispose();
    }
    async start() {
        this.sun = this.createPlanet("sun", Math.sqrt(109) * this.earthDiameter);
        this.mercury = this.createPlanet("mercury", Math.sqrt(0.38) * this.earthDiameter);
        this.venus = this.createPlanet("venus", Math.sqrt(0.95) * this.earthDiameter);
        this.earth = this.createPlanet("earth", Math.sqrt(1) * this.earthDiameter);
        this.mars = this.createPlanet("mars", Math.sqrt(0.53) * this.earthDiameter);
        this.jupiter = this.createPlanet("jupiter", Math.sqrt(11) * this.earthDiameter);
        this.saturn = this.createPlanet("saturn", Math.sqrt(9.4) * this.earthDiameter);
        this.uranus = this.createPlanet("uranus", Math.sqrt(4) * this.earthDiameter);
        this.neptune = this.createPlanet("neptune", Math.sqrt(3.8) * this.earthDiameter);
        this.pluto = this.createPlanet("pluto", Math.sqrt(0.19) * this.earthDiameter);
        this.planets = [
            this.sun,
            this.mercury,
            this.venus,
            this.earth,
            this.mars,
            this.jupiter,
            this.saturn,
            this.uranus,
            this.neptune,
            this.pluto
        ];
        this.speeds = [
            1,
            2,
            1,
            3,
            1,
            4,
            3,
            1,
            3,
            4
        ];
        let orbitPoints = [];
        let orbitColors = [];
        let mat = new BABYLON.StandardMaterial("Test", Main.Scene);
        mat.alpha = 0;
        for (let i = 0; i < this.planets.length; i++) {
            this.planets[i].parent = this;
            this.alphas.push(Math.random() * 2 * Math.PI);
            this.alphas.push(Math.random() * 2 * Math.PI);
            let lum = 3;
            this.planets[i].material = mat;
            this.planets[i].enableEdgesRendering();
            this.planets[i].edgesColor = Main.Color4.scale(lum);
            orbitPoints[i] = [];
            orbitColors[i] = [];
            let r = i / (this.planets.length - 1) * this.radius;
            for (let j = 0; j <= 64; j++) {
                orbitPoints[i].push(new BABYLON.Vector3(r * Math.cos(j / 64 * Math.PI * 2), 0, r * Math.sin(j / 64 * Math.PI * 2)));
                orbitColors[i].push(Main.Color4.scale(lum * 0.75 * (1 - i / this.planets.length)));
            }
        }
        this.orbitLines = BABYLON.MeshBuilder.CreateLineSystem("orbits", {
            lines: orbitPoints,
            colors: orbitColors,
            updatable: true,
            instance: undefined
        }, this.getScene());
        this.orbitLines.parent = this;
        this.getScene().onBeforeRenderObservable.add(this._update);
        return Main.RunCoroutine(this.unfold(120));
    }
    async wait(seconds) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 1000 * seconds);
        });
    }
    async end() {
        await Main.RunCoroutine(this.fold(120));
        this.getScene().onBeforeRenderObservable.removeCallback(this._update);
    }
    createPlanet(name, diameter) {
        return BABYLON.MeshBuilder.CreateSphere(name, { diameter: diameter, segments: 6 }, this.getScene());
    }
    *unfold(duration) {
        let foldedPosition = this.position.scale(2);
        let unfoldedPosition = this.position.clone();
        for (let i = 0; i < duration; i++) {
            let d = i / duration;
            d = SolarToy.easeOutElastic(d);
            this.scaling.copyFromFloats(d, d, d);
            BABYLON.Vector3.LerpToRef(foldedPosition, unfoldedPosition, d, this.position);
            yield;
        }
        this.position.copyFrom(unfoldedPosition);
        this.scaling.copyFromFloats(1, 1, 1);
    }
    *fold(duration) {
        let foldedPosition = this.position.scale(2);
        let unfoldedPosition = this.position.clone();
        for (let i = 0; i < duration; i++) {
            let d = i / duration;
            d = d * d;
            this.scaling.copyFromFloats(1 - d, 1 - d, 1 - d);
            BABYLON.Vector3.LerpToRef(unfoldedPosition, foldedPosition, d, this.position);
            yield;
        }
        this.position.copyFrom(foldedPosition);
        this.scaling.copyFromFloats(0, 0, 0);
    }
}
class VoxelToy {
    static async start(position) {
        let randomShape = [VoxelToy.bridge, VoxelToy.truck, VoxelToy.egg, VoxelToy.house, VoxelToy.eiffel];
        this.container = new BABYLON.Mesh("container", Main.Scene);
        this.container.position = position;
        Main.Scene.onBeforeRenderObservable.add(VoxelToy.rotateContainer);
        return Main.RunCoroutine(VoxelToy.create(randomShape[Math.floor(Math.random() * randomShape.length)]));
    }
    static wait(seconds) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 1000 * seconds);
        });
    }
    static async end() {
        await Main.RunCoroutine(VoxelToy.destroy());
        Main.Scene.onBeforeRenderObservable.removeCallback(VoxelToy.rotateContainer);
    }
    static *create(data) {
        let offsetX = -(data[0][0].length - 1) / 2;
        let offsetZ = -(data[0].length - 1) / 2;
        for (let j = 0; j < data.length; j++) {
            for (let k = 0; k < data[j].length; k++) {
                for (let i = 0; i < data[j][k].length; i++) {
                    if (data[j][k][i]) {
                        let cube = BABYLON.MeshBuilder.CreateBox("cube", { size: 0.8 }, Main.Scene);
                        cube.position.copyFromFloats(i + offsetX, j, k + offsetZ);
                        let mat = new BABYLON.StandardMaterial("Test", Main.Scene);
                        mat.alpha = 0;
                        cube.material = mat;
                        cube.enableEdgesRendering();
                        let lum = 3;
                        cube.edgesColor = Main.Color4.scale(lum);
                        cube.parent = this.container;
                        VoxelToy.meshes.push(cube);
                        yield;
                        yield;
                    }
                }
            }
        }
    }
    static *destroy() {
        let cube = VoxelToy.meshes.pop();
        while (cube) {
            cube.dispose();
            cube = VoxelToy.meshes.splice(0, 1)[0];
            yield;
        }
        this.container.dispose();
    }
}
// cube editor : https://playground.babylonjs.com/#BYJPXJ#4
VoxelToy.bridge = [[[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 1, 1, 1, 1, 1, 0, 0], [0, 0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 1, 1, 1, 1, 1, 0, 0], [0, 0, 0, 0, 1, 1, 1, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]];
VoxelToy.truck = [[[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 1, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 1, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 1, 1, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0, 1, 1], [0, 0, 0, 0, 1, 1, 1, 1, 1, 0], [0, 0, 0, 0, 1, 1, 1, 1, 1, 0], [0, 0, 0, 0, 0, 1, 0, 0, 1, 1], [0, 0, 0, 0, 0, 0, 1, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 1, 1, 1, 1, 0], [0, 0, 0, 0, 0, 1, 0, 0, 0, 1], [0, 0, 0, 0, 0, 1, 0, 0, 0, 1], [0, 0, 0, 0, 0, 1, 1, 1, 1, 0], [0, 0, 0, 0, 0, 1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 1, 1, 1, 1, 0], [0, 0, 0, 0, 0, 1, 0, 0, 0, 1], [0, 0, 0, 0, 0, 1, 0, 0, 0, 1], [0, 0, 0, 0, 0, 1, 1, 1, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 1, 1, 1, 1, 1], [0, 0, 0, 0, 0, 1, 1, 1, 1, 1], [0, 0, 0, 0, 0, 1, 1, 1, 1, 1], [0, 0, 0, 0, 0, 1, 1, 1, 1, 1], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]];
VoxelToy.egg = [[[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 0, 1, 0, 1, 0, 0, 0], [0, 0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0, 0, 0], [0, 0, 0, 0, 1, 0, 1, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 1, 0, 1, 0, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0, 0, 0], [0, 0, 0, 0, 1, 0, 1, 0, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]];
VoxelToy.house = [[[0, 0, 1, 1, 1, 1, 0, 0, 0, 0], [0, 0, 1, 0, 0, 1, 0, 0, 0, 0], [0, 0, 1, 0, 0, 0, 1, 1, 1, 0], [0, 0, 1, 0, 0, 0, 0, 0, 1, 0], [0, 0, 1, 0, 0, 0, 0, 0, 1, 0], [0, 0, 1, 0, 0, 0, 0, 0, 0, 0], [0, 0, 1, 0, 0, 0, 0, 0, 0, 0], [0, 0, 1, 0, 0, 0, 0, 0, 1, 0], [0, 0, 1, 1, 1, 1, 1, 1, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 1, 0, 1, 1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 1, 0, 1, 0], [0, 0, 1, 0, 0, 0, 0, 0, 0, 0], [0, 0, 1, 0, 0, 0, 0, 0, 1, 0], [0, 0, 1, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 1, 0], [0, 0, 1, 0, 0, 1, 0, 0, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 1, 0, 1, 1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 1, 0, 1, 0], [0, 0, 1, 0, 0, 0, 0, 0, 0, 0], [0, 0, 1, 0, 0, 0, 0, 0, 1, 0], [0, 0, 1, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 1, 0], [0, 0, 1, 0, 0, 1, 0, 0, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 1, 1, 1, 1, 0, 0, 0, 0], [0, 0, 1, 0, 0, 1, 0, 0, 0, 0], [0, 0, 1, 0, 0, 0, 1, 1, 1, 0], [0, 0, 1, 0, 0, 0, 0, 0, 1, 0], [0, 0, 1, 0, 0, 0, 0, 0, 1, 0], [0, 0, 1, 0, 0, 0, 0, 0, 1, 0], [0, 0, 1, 0, 0, 0, 0, 0, 1, 0], [0, 0, 1, 0, 0, 0, 0, 0, 1, 0], [0, 0, 1, 1, 1, 1, 1, 1, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 1, 1, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0, 1, 1, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 1, 1, 1, 1, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 0, 1, 0, 1, 0, 0, 0], [0, 0, 0, 0, 1, 0, 1, 0, 0, 0], [0, 0, 0, 0, 1, 0, 1, 0, 0, 0], [0, 0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]];
VoxelToy.eiffel = [[[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 1, 0, 0, 0, 0, 0, 1, 1], [0, 1, 0, 0, 0, 0, 0, 0, 0, 1], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 0, 0, 0, 0, 0, 0, 0, 1], [0, 1, 1, 0, 0, 0, 0, 0, 1, 1]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 1, 0, 0, 0, 0, 0, 1, 0], [0, 1, 1, 1, 0, 0, 0, 1, 1, 1], [0, 0, 1, 0, 0, 0, 0, 0, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 1, 0, 0, 0, 0, 0, 1, 0], [0, 1, 1, 1, 0, 0, 0, 1, 1, 1], [0, 0, 1, 0, 0, 0, 0, 0, 1, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 1, 1, 1, 1, 1, 1, 1, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 1, 1, 1, 1, 1, 1, 1, 0], [0, 0, 0, 1, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 0, 1, 0, 1, 0, 0, 0], [0, 0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 0, 1, 0, 1, 0, 0, 0], [0, 0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0, 0, 0], [0, 0, 0, 0, 1, 0, 1, 0, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]];
VoxelToy.meshes = [];
VoxelToy.rotateContainer = () => {
    VoxelToy.container.rotation.y += 0.005;
};
