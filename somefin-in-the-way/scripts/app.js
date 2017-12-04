class Animal {
    constructor(name, manager) {
        this.name = name;
        this.manager = manager;
        this.dir = BABYLON.Vector3.Forward();
        this.targetDir = BABYLON.Vector3.Right();
        this._update = () => {
            this.dir = this.instance.getDirection(BABYLON.Axis.Z);
            let alpha = LDMath.AngleFromToAround(this.dir, this.targetDir, BABYLON.Axis.Y);
            if (Math.abs(alpha) > Math.PI / 64) {
                this.dir = BABYLON.Vector3.Lerp(this.dir, this.targetDir, 0.001).normalize();
                this.instance.rotate(BABYLON.Axis.Y, Math.sign(alpha) * Math.min(Math.abs(alpha), 0.01));
                this.instance.translate(BABYLON.Axis.Z, 0.1);
            }
            else {
                this.targetDir = new BABYLON.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
            }
        };
    }
    dispose() {
        this.manager.removeAnimal(this);
        if (this.instance) {
            this.instance.dispose();
        }
    }
    instantiate(position, scene, callback) {
        if (this.manager.datas.get(this.name)) {
            BABYLON.SceneLoader.ImportMesh("", "", "data:" + this.manager.datas.get(this.name), scene, (meshes) => {
                this.instance = meshes[0];
                this.instance.position = position;
                scene.registerBeforeRender(this._update);
                if (callback) {
                    callback();
                }
            });
        }
        else {
            this.dispose();
        }
    }
}
class Protected extends Animal {
    catch(fishnet) {
        Main.instance.scene.unregisterBeforeRender(this._update);
        this.instance.parent = fishnet.instance;
        this.instance.position.copyFromFloats(Math.random() * 2 - 2, -Math.random() - 1, Math.random() * 2 - 2);
        this.manager.removeAnimal(this);
        return 1;
    }
}
class Turtle extends Protected {
    constructor(manager) {
        super("turtle", manager);
    }
    catch(fishnet) {
        Main.instance.score -= 100;
        Main.instance.turtles++;
        return super.catch(fishnet);
    }
    instantiate(position, scene, callback) {
        super.instantiate(position, scene, () => {
            this.instance.material = Main.instance.turtleMaterial;
            this.instance.renderOutline = true;
            this.instance.outlineColor = BABYLON.Color3.Black();
            this.instance.outlineWidth = 0.04;
            this.instance.skeleton.beginAnimation("TurtleArmatureAction", true);
            if (callback) {
                callback();
            }
        });
    }
}
class Tuna extends Protected {
    constructor(manager) {
        super("tuna", manager);
    }
    catch(fishnet) {
        Main.instance.score -= 50;
        Main.instance.tunas++;
        setTimeout(() => {
            this.dispose();
            fishnet.protectedCaught--;
        }, 10000);
        return super.catch(fishnet);
    }
    instantiate(position, scene, callback) {
        super.instantiate(position, scene, () => {
            this.instance.material = Main.instance.tunaMaterial;
            this.instance.renderOutline = true;
            this.instance.outlineColor = BABYLON.Color3.Black();
            this.instance.outlineWidth = 0.04;
            this.instance.skeleton.beginAnimation("TunaArmatureAction", true);
            if (callback) {
                callback();
            }
        });
    }
}
class Fishable extends Animal {
    catch(fishnet) {
        Main.instance.scene.unregisterBeforeRender(this._update);
        this.instance.parent = fishnet.instance;
        this.instance.position.copyFromFloats(Math.random() * 3 - 3, -Math.random() - 1, Math.random() * 3 - 3);
        this.manager.removeAnimal(this);
        return 1;
    }
}
class Herring extends Fishable {
    constructor(manager) {
        super("fish", manager);
    }
    catch(fishnet) {
        Main.instance.score += 25;
        Main.instance.timer += 3;
        Main.instance.herrings++;
        setTimeout(() => {
            this.dispose();
            fishnet.protectedCaught--;
        }, 3000);
        return super.catch(fishnet);
    }
    instantiate(position, scene, callback) {
        super.instantiate(position, scene, () => {
            this.instance.material = Main.instance.fishMaterial;
            this.instance.renderOutline = true;
            this.instance.outlineColor = BABYLON.Color3.Black();
            this.instance.outlineWidth = 0.04;
            this.instance.skeleton.beginAnimation("FishArmatureAction", true);
            if (callback) {
                callback();
            }
        });
    }
}
class Cod extends Fishable {
    constructor(manager) {
        super("cod", manager);
    }
    catch(fishnet) {
        Main.instance.score += 50;
        Main.instance.timer += 5;
        Main.instance.cods++;
        setTimeout(() => {
            this.dispose();
            fishnet.protectedCaught--;
        }, 5000);
        return super.catch(fishnet);
    }
    instantiate(position, scene, callback) {
        super.instantiate(position, scene, () => {
            this.instance.material = Main.instance.fishMaterial;
            this.instance.renderOutline = true;
            this.instance.outlineColor = BABYLON.Color3.Black();
            this.instance.outlineWidth = 0.04;
            this.instance.skeleton.beginAnimation("CodArmatureAction", true);
            if (callback) {
                callback();
            }
        });
    }
}
class AnimalManager {
    constructor(ship, scene) {
        this.ship = ship;
        this.scene = scene;
        this.maxCount = 30;
        this.maxDistance = 100;
        this.protectedRate = 0.25;
        this.animals = [];
        this.protected = [];
        this.fishable = [];
        this.datas = new Map();
        this.loaded = false;
        this._updateAnimals = () => {
            if (!this.loaded) {
                return;
            }
            let pCreation = 1 - this.animals.length / this.maxCount;
            let p = Math.random();
            if (p < pCreation) {
                this._createAnimal();
            }
            let sqrDist = this.maxDistance * this.maxDistance * 1.2;
            for (let i = 0; i < this.animals.length; i++) {
                if (this.animals[i].instance) {
                    let sqrD = BABYLON.Vector3.DistanceSquared(this.animals[i].instance.position, this.ship.instance.position);
                    if (sqrD > sqrDist) {
                        this.animals[i].dispose();
                    }
                }
            }
        };
        scene.registerBeforeRender(this._updateAnimals);
    }
    loadData() {
        $.get("./data/fish.babylon", "", (content) => {
            this.datas.set("fish", content);
            $.get("./data/cod.babylon", "", (content) => {
                this.datas.set("cod", content);
                $.get("./data/tuna.babylon", "", (content) => {
                    this.datas.set("tuna", content);
                    $.get("./data/turtle.babylon", "", (content) => {
                        this.datas.set("turtle", content);
                        this.loaded = true;
                    });
                });
            });
        });
    }
    addAnimal(animal) {
        this.animals.push(animal);
        if (animal instanceof Turtle) {
            this.protected.push(animal);
        }
        else {
            this.fishable.push(animal);
        }
    }
    removeAnimal(animal) {
        let index = this.animals.indexOf(animal);
        if (index !== -1) {
            this.animals.splice(index, 1);
        }
        if (animal instanceof Turtle) {
            index = this.protected.indexOf(animal);
            if (index !== -1) {
                this.protected.splice(index, 1);
            }
        }
        else {
            index = this.fishable.indexOf(animal);
            if (index !== -1) {
                this.fishable.splice(index, 1);
            }
        }
    }
    _createAnimal() {
        let ratioProtected = this.protected.length / this.animals.length;
        let ratioFishable = this.fishable.length / this.animals.length;
        let probabiltyFishable = Math.sqrt(ratioProtected);
        let probabilityProtected = 1 - probabiltyFishable;
        probabilityProtected = probabilityProtected / 2;
        let p = Math.random();
        if (p < probabilityProtected) {
            this.addAnimal(this._createProtected());
        }
        else {
            this.addAnimal(this._createFishable());
        }
    }
    _createProtected() {
        let pr;
        let r = Math.random();
        if (r < 0.5) {
            pr = new Turtle(this);
        }
        else {
            pr = new Tuna(this);
        }
        let p = new BABYLON.Vector3(this.ship.instance.position.x + (Math.random() - 0.5) * 2 * this.maxDistance, -2, this.ship.instance.position.z + (Math.random() - 0.5) * 2 * this.maxDistance);
        pr.instantiate(p, this.scene);
        return pr;
    }
    _createFishable() {
        let f;
        let r = Math.random();
        if (r < 0.5) {
            f = new Herring(this);
        }
        else {
            f = new Cod(this);
        }
        let p = new BABYLON.Vector3(this.ship.instance.position.x + (Math.random() - 0.5) * 2 * this.maxDistance, -2, this.ship.instance.position.z + (Math.random() - 0.5) * 2 * this.maxDistance);
        f.instantiate(p, this.scene);
        return f;
    }
}
class FishNet {
    constructor(ship, manager) {
        this.ship = ship;
        this.manager = manager;
        this.velocity = BABYLON.Vector3.Zero();
        this.protectedCaught = 0;
        this._updateFishNet = () => {
            if (this.ship && this.instance) {
                let deltaTime = this.instance.getScene().getEngine().getDeltaTime();
                this.instance.position.y = this.ship.instance.position.y;
                let dir = this.ship.instance.position.subtract(this.instance.position);
                let delta = (dir.length() - 10) / 10;
                delta = Math.min(Math.max(delta, -1), 1);
                dir.normalize();
                this.velocity.scaleInPlace(0.98);
                this.velocity.addInPlace(dir.scale(delta / 1.5));
                this.instance.position.addInPlace(this.velocity.scale(deltaTime / 1000));
                this.instance.lookAt(this.ship.instance.position, Math.PI);
                let ropeLeftStart = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(-3.37, 0, 0.62), this.instance.getWorldMatrix());
                let ropeRightStart = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(3.37, 0, 0.62), this.instance.getWorldMatrix());
                let ropeShipEnd = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0, 3.22, -4.35), this.ship.container.getWorldMatrix());
                BABYLON.MeshBuilder.CreateTube("RopeLeft", {
                    path: [
                        ropeLeftStart,
                        ropeShipEnd
                    ],
                    radius: 0.05,
                    updatable: true,
                    instance: this.ropeLeft,
                }, this.instance.getScene());
                BABYLON.MeshBuilder.CreateTube("RopeRight", {
                    path: [
                        ropeRightStart,
                        ropeShipEnd
                    ],
                    radius: 0.05,
                    updatable: true,
                    instance: this.ropeRight,
                }, this.instance.getScene());
                if (Main.instance.playing) {
                    let p = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0, 0, -2.5), this.instance.getWorldMatrix());
                    for (let i = 0; i < this.manager.animals.length; i++) {
                        let a = this.manager.animals[i];
                        if (a.instance) {
                            if (BABYLON.Vector3.DistanceSquared(p, a.instance.position) < 14) {
                                this.protectedCaught += a.catch(this);
                            }
                        }
                    }
                }
            }
        };
    }
    instantiate(scene) {
        BABYLON.SceneLoader.ImportMesh("", "./data/fishnet.babylon", "", scene, (meshes) => {
            this.instance = meshes[0];
            this.instance.position = this.ship.instance.position.subtract(this.ship.instance.getDirection(BABYLON.Axis.Z).scale(10));
            this.instance.material = new ToonMaterial("ToonMaterial", BABYLON.Color3.Black(), scene);
            this.instance.renderOutline = true;
            this.instance.outlineColor = BABYLON.Color3.Black();
            this.instance.outlineWidth = 0.01;
            this.ropeLeft = BABYLON.MeshBuilder.CreateTube("RopeLeft", {
                path: [
                    BABYLON.Vector3.Zero(),
                    BABYLON.Vector3.One()
                ],
                radius: 0.05,
                updatable: true
            }, scene);
            this.ropeLeft.material = this.instance.material;
            this.ropeRight = BABYLON.MeshBuilder.CreateTube("RopeRight", {
                path: [
                    BABYLON.Vector3.Zero(),
                    BABYLON.Vector3.One()
                ],
                radius: 0.05,
                updatable: true
            }, scene);
            this.ropeRight.material = this.instance.material;
            scene.registerBeforeRender(this._updateFishNet);
        });
    }
}
class Main {
    constructor(canvasElement) {
        this.playing = false;
        this.pointerDown = false;
        this._score = 0;
        this.timer = 0;
        this._herrings = 0;
        this._cods = 0;
        this._tunas = 0;
        this._turtles = 0;
        Main.instance = this;
        this.canvas = document.getElementById(canvasElement);
        this.engine = new BABYLON.Engine(this.canvas, true);
        BABYLON.Engine.ShadersRepository = "./shaders/";
    }
    get score() {
        return this._score;
    }
    set score(v) {
        this._score = v;
        $("#score").text(this.score.toFixed(0));
        $("#score-count").text(this.score.toFixed(0));
    }
    get herrings() {
        return this._herrings;
    }
    set herrings(v) {
        this._herrings = v;
        $("#herrings-count").text((this.herrings).toFixed(0));
        $("#herrings-score").text((this.herrings * 25).toFixed(0));
    }
    get cods() {
        return this._cods;
    }
    set cods(v) {
        this._cods = v;
        $("#cods-count").text((this.cods).toFixed(0));
        $("#cods-score").text((this.cods * 50).toFixed(0));
    }
    get tunas() {
        return this._tunas;
    }
    set tunas(v) {
        this._tunas = v;
        $("#tunas-count").text((this.tunas).toFixed(0));
        $("#tunas-score").text((this.tunas * -50).toFixed(0));
    }
    get turtles() {
        return this._turtles;
    }
    set turtles(v) {
        this._turtles = v;
        $("#turtles-count").text((this.turtles).toFixed(0));
        $("#turtles-score").text((this.turtles * -100).toFixed(0));
    }
    createScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor.copyFromFloats(1, 1, 1, 1);
        this.resize();
        this.light = new BABYLON.HemisphericLight("Light", (new BABYLON.Vector3(0.5, 0.65, 0.8)).normalize(), this.scene);
        this.light.groundColor.copyFromFloats(0.5, 0.5, 0.5);
        this.light.intensity = 0.7;
    }
    animate() {
        this.engine.runRenderLoop(() => {
            this.scene.render();
            this.timer -= this.engine.getDeltaTime() / 1000;
            if (this.playing && this.timer < 0) {
                this.gameOver();
            }
            $("#time").text(this.timer.toFixed(0));
        });
    }
    resize() {
        this.engine.resize();
    }
    playButtonClic() {
        $("#gui").fadeOut(600, undefined, () => {
            this.score = 0;
            this.timer = 60;
            $("#in-game").fadeIn(300, undefined, () => {
                this.playing = true;
                $("#message-1").fadeIn(300, undefined, () => {
                    setTimeout(() => {
                        $("#message-2").fadeIn(300, undefined, () => {
                            $("#message-1").fadeOut(300);
                            setTimeout(() => {
                                $("#message-3").fadeIn(300, undefined, () => {
                                    $("#message-2").fadeOut(300);
                                    setTimeout(() => {
                                        $("#message-3").fadeOut(300);
                                    }, 2300);
                                });
                            }, 2000);
                        });
                    }, 2000);
                });
            });
        });
    }
    gameOver() {
        $("#in-game").fadeOut(600, undefined, () => {
            $("#game-over-menu").fadeIn(600, undefined, () => {
                this.playing = false;
            });
        });
    }
}
window.addEventListener("DOMContentLoaded", () => {
    let game = new Main("render-canvas");
    game.createScene();
    game.animate();
    game.fishMaterial = new BABYLON.StandardMaterial("FishMaterial", game.scene);
    game.fishMaterial.diffuseColor = BABYLON.Color3.FromHexString("#4aa9d6");
    game.fishMaterial.specularColor.copyFromFloats(0, 0, 0);
    game.fishMaterial.emissiveColor.copyFromFloats(0.5, 0.5, 0.5);
    game.turtleMaterial = new BABYLON.StandardMaterial("TurtleMaterial", game.scene);
    game.turtleMaterial.diffuseColor = BABYLON.Color3.FromHexString("#4ad658");
    game.turtleMaterial.specularColor.copyFromFloats(0, 0, 0);
    game.turtleMaterial.emissiveColor.copyFromFloats(0.5, 0.5, 0.5);
    game.tunaMaterial = new BABYLON.StandardMaterial("TunaMaterial", game.scene);
    game.tunaMaterial.diffuseColor = BABYLON.Color3.FromHexString("#d64a78");
    game.tunaMaterial.specularColor.copyFromFloats(0, 0, 0);
    game.tunaMaterial.emissiveColor.copyFromFloats(0.5, 0.5, 0.5);
    game.seaBottomMaterial = new BABYLON.StandardMaterial("SeaBottomMaterial", game.scene);
    game.seaBottomMaterial.diffuseColor = BABYLON.Color3.FromHexString("#000000");
    game.seaBottomMaterial.specularColor.copyFromFloats(0, 0, 0);
    game.seaBottomMaterial.emissiveColor = BABYLON.Color3.FromHexString("#191919");
    $("#play-button").on("click", () => {
        game.playButtonClic();
    });
    $("#replay-button").on("click", () => {
        location.reload();
    });
    $("#share-button").on("click", () => {
        let tweet = "#LDJAM I just scored " + game.score + " on 'SomeFin In The Way' ! Try to beat me here https://goo.gl/GKC4KA";
        window.open("https://twitter.com/intent/tweet?text=" + tweet);
    });
    game.canvas.addEventListener("pointerdown", () => {
        game.pointerDown = true;
    });
    game.canvas.addEventListener("pointerout", () => {
        game.pointerDown = false;
    });
    document.addEventListener("pointerup", () => {
        game.pointerDown = false;
    });
    let seaSize = 64;
    let sea = new Sea(seaSize);
    sea.instantiate(game.scene);
    let ship = new Ship(sea);
    game.camera = new ShipCamera("ShipCamera", ship, game.scene);
    ship.instantiate(game.scene, () => {
        let shipControler = new ShipControler(ship, game.scene);
        let manager = new AnimalManager(ship, game.scene);
        manager.loadData();
        ship.fishnet = new FishNet(ship, manager);
        ship.fishnet.instantiate(game.scene);
    });
    game.groundZero = BABYLON.MeshBuilder.CreateGround("GroundZero", { width: seaSize * 10, height: seaSize * 10 }, game.scene);
    game.groundZero.isVisible = false;
});
class LDMath {
    static IsNanOrZero(n) {
        return isNaN(n) || n === 0;
    }
    static ProjectPerpendicularAtToRef(v, at, ref) {
        if (v && at) {
            let k = BABYLON.Vector3.Dot(v, at);
            k = k / at.lengthSquared();
            if (isFinite(k)) {
                ref.copyFrom(v);
                ref.subtractInPlace(at.scale(k));
            }
        }
    }
    static ProjectPerpendicularAt(v, at) {
        let out = BABYLON.Vector3.Zero();
        LDMath.ProjectPerpendicularAtToRef(v, at, out);
        return out;
    }
    static Angle(from, to) {
        return Math.acos(BABYLON.Vector3.Dot(from, to) / from.length() / to.length());
    }
    static AngleFromToAround(from, to, around, onlyPositive = false) {
        let pFrom = LDMath.ProjectPerpendicularAt(from, around).normalize();
        if (LDMath.IsNanOrZero(pFrom.lengthSquared())) {
            return NaN;
        }
        let pTo = LDMath.ProjectPerpendicularAt(to, around).normalize();
        if (LDMath.IsNanOrZero(pTo.lengthSquared())) {
            return NaN;
        }
        let angle = Math.acos(BABYLON.Vector3.Dot(pFrom, pTo));
        if (BABYLON.Vector3.Dot(BABYLON.Vector3.Cross(pFrom, pTo), around) < 0) {
            if (onlyPositive) {
                angle = 2 * Math.PI - angle;
            }
            else {
                angle = -angle;
            }
        }
        return angle;
    }
}
class Sea {
    constructor(size) {
        this.size = 0;
        this.time = 0;
        this.size = size;
        this.heightMap = [];
        for (let i = 0; i <= this.size; i++) {
            this.heightMap[i] = [];
        }
        this.waves = [];
        for (let i = 0; i < 6; i++) {
            this.waves.push(new Wave(Math.random() / 4, Math.random() / 1, 5 * Math.random(), new BABYLON.Vector2(Math.random(), Math.random()).normalize()));
        }
    }
    instantiate(scene) {
        this.mesh = BABYLON.MeshBuilder.CreateGround("Sea", { width: 2048, height: 2048, subdivisions: 1 }, scene);
        this.mesh.material = new SeaMaterial("SeaMaterial", scene);
        let bottom = BABYLON.MeshBuilder.CreateGround("Sea", { width: 2048, height: 2048, subdivisions: 1 }, scene);
        bottom.position.y = -5;
        bottom.material = Main.instance.seaBottomMaterial;
    }
    wavesSum(x, y, t) {
        let s = 0;
        for (let i = 0; i < this.waves.length; i++) {
            s += this.waves[i].evaluate(x, y, t);
        }
        return s;
    }
    evaluate(x, y) {
        return 0;
        /*
        let h = 0;

        let i = Math.floor(x);
        let i1 = i + 1;
        let dx = x - i;
        let j = Math.floor(y);
        let j1 = j + 1;
        let dy = y - j;

        let hX0 = BABYLON.Scalar.Lerp(this.wavesSum(i, j, this.time), this.wavesSum(i1, j, this.time), dx);
        let hX1 = BABYLON.Scalar.Lerp(this.wavesSum(i, j1, this.time), this.wavesSum(i1, j1, this.time), dx);

        return BABYLON.Scalar.Lerp(hX0, hX1, dy);
        */
    }
}
class SeaMaterial extends BABYLON.ShaderMaterial {
    constructor(name, scene) {
        super(name, scene, {
            vertex: "sea",
            fragment: "sea",
        }, {
            attributes: ["position", "normal", "uv"],
            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"],
            needAlphaBlending: true
        });
        this.t = 0;
        this.dir0 = BABYLON.Vector2.Zero();
        this.dir1 = BABYLON.Vector2.Zero();
        this.dir2 = BABYLON.Vector2.Zero();
        this.dir3 = BABYLON.Vector2.Zero();
        this.dir4 = BABYLON.Vector2.Zero();
        this.dir5 = BABYLON.Vector2.Zero();
        this.dir6 = BABYLON.Vector2.Zero();
        this._updateTime = () => {
            this.setFloat("time", this.t++ / 60);
        };
        this.dir0 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.dir1 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.dir2 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.dir3 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.dir4 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.dir5 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.dir6 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.setVector2("dir0", this.dir0);
        this.setVector2("dir1", this.dir1);
        this.setVector2("dir2", this.dir2);
        this.setVector2("dir3", this.dir3);
        this.setVector2("dir4", this.dir4);
        this.setVector2("dir5", this.dir5);
        this.setVector2("dir6", this.dir6);
        this.setFloat("a0", 1 / 7);
        this.setFloat("a1", 1 / 7);
        this.setFloat("a2", 1 / 7);
        this.setFloat("a3", 1 / 7);
        this.setFloat("a4", 1 / 7);
        this.setFloat("a5", 1 / 7);
        this.setFloat("a6", 1 / 7);
        scene.registerBeforeRender(this._updateTime);
    }
}
class Ship {
    constructor(sea) {
        this.target = BABYLON.Vector3.Zero();
        this.velocity = BABYLON.Vector3.Zero();
        this._update = () => {
            if (this.instance && Main.instance.playing) {
                let deltaTime = this.instance.getScene().getEngine().getDeltaTime();
                let dir = this.target.subtract(this.instance.position);
                let forward = this.instance.getDirection(BABYLON.Axis.Z);
                let right = this.instance.getDirection(BABYLON.Axis.X);
                let speedInput = BABYLON.Vector3.Dot(dir, forward) / 20;
                speedInput = Math.min(Math.max(speedInput, 0), 1);
                let drag = 0.98;
                if (this.fishnet) {
                    drag = Math.pow(drag, this.fishnet.protectedCaught + 1);
                }
                this.velocity.scaleInPlace(drag);
                if (dir.lengthSquared() > 1) {
                    this.velocity.addInPlace(forward.scale(speedInput / 2.5));
                }
                this.instance.position.x += this.velocity.x * deltaTime / 1000;
                this.instance.position.z += this.velocity.z * deltaTime / 1000;
                this.instance.position.y = -0.5;
                let alpha = LDMath.AngleFromToAround(forward, dir, BABYLON.Axis.Y);
                /*
                if (this.debugDir) {
                    this.debugDir.dispose();
                   
                }
                this.debugDir = BABYLON.RayHelper.CreateAndShow(
                    new BABYLON.Ray(this.instance.position, dir, 10), this.instance.getScene(), BABYLON.Color3.Blue()
                );
                if (this.debugZ) {
                    this.debugZ.dispose();
                }
                this.debugZ = BABYLON.RayHelper.CreateAndShow(
                    new BABYLON.Ray(this.instance.position, forward, 10), this.instance.getScene(), BABYLON.Color3.Red()
                );
                */
                if (isFinite(alpha)) {
                    if (dir.lengthSquared() > 1) {
                        this.instance.rotate(BABYLON.Axis.Y, Math.sign(alpha) * Math.min(Math.abs(alpha), Math.PI / 2 * deltaTime / 1000));
                    }
                    this.container.rotation.x = -Math.PI / 16 * this.velocity.length() / 10;
                    this.container.rotation.z = BABYLON.Vector3.Dot(this.velocity, right) / 20;
                }
                BABYLON.Vector3.TransformCoordinatesToRef(this._trailLeftLocalPos, this.instance.getWorldMatrix(), this.trailLeftPos);
                BABYLON.Vector3.TransformCoordinatesToRef(this._trailRightLocalPos, this.instance.getWorldMatrix(), this.trailRightPos);
            }
        };
        this._trailLeftLocalPos = new BABYLON.Vector3(-0.6, 0, -3.3);
        this._trailRightLocalPos = new BABYLON.Vector3(0.6, 0, -3.3);
        this.trailLeftPos = BABYLON.Vector3.Zero();
        this.trailRightPos = BABYLON.Vector3.Zero();
        this.sea = sea;
    }
    instantiate(scene, callback) {
        BABYLON.SceneLoader.ImportMesh("", "./data/ship.babylon", "", scene, (meshes) => {
            this.instance = new BABYLON.Mesh("Ship", scene);
            this.container = new BABYLON.Mesh("Container", scene);
            this.container.parent = this.instance;
            meshes.forEach((m) => {
                m.material = new ToonMaterial("ToonMaterial", BABYLON.Color3.Black(), scene);
                m.renderOutline = true;
                m.outlineColor = BABYLON.Color3.Black();
                m.outlineWidth = 0.01;
                m.parent = this.container;
            });
            new ShipTrail(this.trailLeftPos, this.instance, -1, scene);
            new ShipTrail(this.trailRightPos, this.instance, 1, scene);
            scene.registerBeforeRender(this._update);
            if (callback) {
                callback();
            }
        });
    }
}
class ShipCamera extends BABYLON.FreeCamera {
    constructor(name, ship, scene) {
        super(name, BABYLON.Vector3.Zero(), scene);
        this.smoothness = 30;
        this.k = 0;
        this._update = () => {
            if (this.ship && this.ship.instance) {
                this.k++;
                let targetPos = this.ship.instance.position.clone();
                let cameraPos = this.ship.instance.getDirection(BABYLON.Axis.Z);
                cameraPos.y = 0;
                cameraPos.scaleInPlace(-25);
                if (!Main.instance.playing) {
                    targetPos.y = 6;
                    let x = Math.cos(Math.PI * this.k / 1200) * cameraPos.x - Math.sin(Math.PI * this.k / 1200) * cameraPos.z;
                    let z = Math.sin(Math.PI * this.k / 1200) * cameraPos.x + Math.cos(Math.PI * this.k / 1200) * cameraPos.z;
                    cameraPos.x = x;
                    cameraPos.z = z;
                }
                cameraPos.addInPlace(new BABYLON.Vector3(0, 25, 0));
                cameraPos.x += this.ship.instance.position.x;
                cameraPos.z += this.ship.instance.position.z;
                this.position = BABYLON.Vector3.Lerp(this.position, cameraPos, 1 / this.smoothness);
                this.update();
                this.setTarget(targetPos);
            }
        };
        this.ship = ship;
        scene.registerBeforeRender(this._update);
    }
}
class ShipControler {
    constructor(ship, scene) {
        this._checkInputs = () => {
            if (this.ship.instance) {
                let newTarget = this.ship.instance.position.clone();
                if (Main.instance.pointerDown) {
                    let pickInfo = this.scene.pick(this.scene.pointerX, this.scene.pointerY, (mesh) => {
                        return mesh === Main.instance.groundZero;
                    });
                    if (pickInfo.hit) {
                        newTarget.copyFrom(pickInfo.pickedPoint);
                    }
                }
                else {
                    let localTarget = BABYLON.Vector3.Zero();
                    if (this.forward) {
                        localTarget.z = 20;
                    }
                    if (this.right) {
                        localTarget.x = 10;
                    }
                    else if (this.left) {
                        localTarget.x = -10;
                    }
                    BABYLON.Vector3.TransformCoordinatesToRef(localTarget, this.ship.instance.getWorldMatrix(), newTarget);
                }
                this.ship.target.copyFrom(newTarget);
            }
        };
        this.ship = ship;
        this.scene = scene;
        this.scene.registerBeforeRender(this._checkInputs);
        window.onkeydown = (ev) => {
            if (ev.key === "ArrowLeft") {
                this.left = true;
            }
            if (ev.key === "ArrowRight") {
                this.right = true;
            }
            if (ev.key === "ArrowUp") {
                this.forward = true;
            }
        };
        window.onkeyup = (ev) => {
            if (ev.key === "ArrowLeft") {
                this.left = false;
            }
            if (ev.key === "ArrowRight") {
                this.right = false;
            }
            if (ev.key === "ArrowUp") {
                this.forward = false;
            }
        };
    }
}
class ShipTrail extends BABYLON.Mesh {
    constructor(origin, target, normalLength, scene) {
        super("ShipTrail", scene);
        this.origin = origin;
        this.target = target;
        this.normalLength = normalLength;
        this.length = 300;
        this.points = [];
        this.normals = [];
        this._updateTrail = () => {
            this.points.push(this.origin.clone());
            this.points.splice(0, 1);
            this.normals.push(this.target.getDirection(BABYLON.Axis.X).scaleInPlace(0.2));
            this.normals.splice(0, 1);
            let positions = [];
            for (let i = 0; i < this.points.length; i++) {
                this.points[i].x += this.normalLength * this.normals[i].x / 3;
                this.points[i].y += this.normalLength * this.normals[i].y / 3;
                this.points[i].z += this.normalLength * this.normals[i].z / 3;
                positions.push(this.points[i].x + this.normals[i].x * i / this.length, this.points[i].y + this.normals[i].y * i / this.length, this.points[i].z + this.normals[i].z * i / this.length);
                positions.push(this.points[i].x - this.normals[i].x * i / this.length, this.points[i].y - this.normals[i].y * i / this.length, this.points[i].z - this.normals[i].z * i / this.length);
            }
            this.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions, false);
            this.computeWorldMatrix(true);
            this.refreshBoundingInfo();
        };
        this.position.y = 0.1;
        this.points = [];
        this.normals = [];
        for (let i = 0; i < this.length; i++) {
            this.points.push(origin.clone());
            this.normals.push(target.getDirection(BABYLON.Axis.X).scaleInPlace(normalLength));
        }
        this.initialize();
        scene.registerBeforeRender(this._updateTrail);
    }
    initialize() {
        let positions = [];
        let indices = [];
        let data = new BABYLON.VertexData();
        for (let i = 0; i < this.points.length; i++) {
            positions.push(this.points[i].x, this.points[i].y, this.points[i].z);
            positions.push(this.points[i].x, this.points[i].y, this.points[i].z);
        }
        for (let i = 0; i < this.points.length - 1; i++) {
            indices.push(2 * i, 2 * i + 1, 2 * i + 3);
            indices.push(2 * i, 2 * i + 3, 2 * i + 2);
            indices.push(2 * i, 2 * i + 3, 2 * i + 1);
            indices.push(2 * i, 2 * i + 2, 2 * i + 3);
        }
        data.positions = positions;
        data.indices = indices;
        data.applyToMesh(this, true);
    }
}
class ToonMaterial extends BABYLON.ShaderMaterial {
    constructor(name, color, scene) {
        super(name, scene, {
            vertex: "toon",
            fragment: "toon",
        }, {
            attributes: ["position", "normal", "uv"],
            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
        });
        this._updateCameraPosition = () => {
            let camera = this.getScene().activeCamera;
            if (camera && camera.position) {
                this.setVector3("cameraPosition", camera.position);
            }
        };
        scene.registerBeforeRender(this._updateCameraPosition);
        this.setColor3("color", color);
    }
}
class Wave {
    constructor(amplitude, speed, period, direction) {
        this.amplitude = amplitude;
        this.speed = speed;
        this.period = period;
        this.direction = direction;
        this._evaluatePos = BABYLON.Vector2.Zero();
    }
    evaluate(x, y, t) {
        let v = 0;
        this._evaluatePos.x = x;
        this._evaluatePos.y = y;
        let d = BABYLON.Vector2.Dot(this._evaluatePos, this.direction);
        v = (Math.sin(d + (t * this.speed) * this.period) + Math.sin(d + (t * this.speed / 2) * this.period)) * this.amplitude;
        return v;
    }
}
