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
    createScene() {
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
        for (let i = 0; i < 50; i++) {
            let m = this.createCube();
            m.position.x = (Math.random() - 0.5) * 2 * width;
            m.position.y = (Math.random() - 0.5) * 2 * height;
            m.position.z = (Math.random() - 0.5) * 2 * depth;
            let s = Math.random() + 0.5;
            m.scaling.copyFromFloats(s, s, s);
            let axis = new BABYLON.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
            let speed = Math.random() / 100;
            Main.Scene.registerBeforeRender(() => {
                m.rotate(axis, speed);
            });
        }
        let route = new Route();
        window.addEventListener('hashchange', route.route);
        route.route();
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
