var playerColor = "#0abdc6";
var creepColor = "#ea00d9";
class Gameobject {
    constructor(prop, main) {
        this.main = main;
        this.name = "";
        this.pos = new Vec2();
        this.rot = 0;
        this.renderers = new UniqueList();
        this.components = new UniqueList();
        if (prop) {
            if (prop.name) {
                this.name = prop.name;
            }
            if (prop.pos) {
                this.pos.copyFrom(prop.pos);
            }
            if (isFinite(prop.rot)) {
                this.rot = prop.rot;
            }
        }
    }
    instantiate() {
        this.main.gameobjects.push(this);
    }
    dispose() {
        this.main.gameobjects.remove(this);
        this.components.forEach(component => {
            component.dispose();
        });
    }
    addComponent(component) {
        if (component instanceof Renderer) {
            this.renderers.push(component);
        }
        this.components.push(component);
        return component;
    }
    start() {
    }
    update(dt) {
    }
    stop() {
        this.components.forEach(component => {
            component.onStop();
        });
    }
    draw() {
        if (this.renderers) {
            this.renderers.forEach(renderer => {
                renderer.draw();
            });
        }
    }
    updatePosRot() {
        if (this.renderers) {
            this.renderers.forEach(renderer => {
                renderer.updatePosRot();
            });
        }
    }
}
/// <reference path="engine/Gameobject.ts" />
class Creep extends Gameobject {
    constructor(main) {
        super({}, main);
        this.speed = new Vec2(0, 0);
        this.radius = 15;
    }
    instantiate() {
        super.instantiate();
        let circle = this.addComponent(new CircleRenderer(this, { radius: this.radius, layer: 1 }));
        circle.addClass("creeper");
        this.impactSound = this.addComponent(new Sound(this, { fileName: "impactMetal_000.ogg" }));
    }
    start() {
        super.start();
        this.pos = new Vec2(400 + 200 * Math.random(), 400 + 200 * Math.random());
        this.speed = new Vec2(Math.random() - 0.5, Math.random() - 0.5);
        let s = Math.random() * 100 + 50;
        this.speed.normalizeInPlace().scaleInPlace(s);
        let f = 1 - s / 150;
        this.radius = 10 + f * 10;
        this.renderers.get(0).radius = this.radius;
    }
    update(dt) {
        let flipX = false;
        let flipY = false;
        let dp = this.speed.scale(dt);
        this.pos.addInPlace(dp);
        let points = this.main.terrain.points;
        for (let i = 0; i < points.length; i++) {
            let ptA = points[i];
            let ptB = points[(i + 1) % points.length];
            let proj = Vec2.ProjectOnABSegment(this.pos, ptA, ptB);
            let sqrDist = this.pos.subtract(proj).lengthSquared();
            if (sqrDist < this.radius * this.radius) {
                this.impactSound.play();
                let n = ptB.subtract(ptA).rotateInPlace(Math.PI / 2);
                if (Math.abs(n.x) > Math.abs(n.y)) {
                    flipX = true;
                }
                else {
                    flipY = true;
                }
            }
        }
        if (flipX || flipY) {
            if (flipX) {
                this.speed.x *= -1;
            }
            if (flipY) {
                this.speed.y *= -1;
            }
            this.speed.rotateInPlace(Math.random() * Math.PI * 0.2 - Math.PI * 0.1);
            this.pos.subtractInPlace(dp.scale(1));
        }
        points = [...this.main.player.drawnPoints, this.main.player.pos];
        for (let i = 0; i < points.length - 1; i++) {
            let ptA = points[i];
            let ptB = points[i + 1];
            let proj = Vec2.ProjectOnABSegment(this.pos, ptA, ptB);
            let sqrDist = this.pos.subtract(proj).lengthSquared();
            if (sqrDist < this.radius * this.radius) {
                this.main.gameover();
            }
        }
    }
}
class Main {
    constructor() {
        this.layers = [];
        this.score = 0;
        this.gameobjects = new UniqueList();
        this._lastT = 0;
        this._mainLoop = () => {
            let dt = 0;
            let t = performance.now();
            if (isFinite(this._lastT)) {
                dt = (t - this._lastT) / 1000;
            }
            this._lastT = t;
            if (this._update) {
                this._update(dt);
            }
            requestAnimationFrame(this._mainLoop);
        };
    }
    instantiate() {
        this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.container.id = "main-container";
        this.container.setAttribute("viewBox", "0 0 1000 1000");
        document.body.appendChild(this.container);
        for (let i = 0; i < 4; i++) {
            let layer = document.createElementNS("http://www.w3.org/2000/svg", "g");
            this.container.appendChild(layer);
            this.layers[i] = layer;
        }
        this.player = new Player(new Vec2(20, 20), this);
        this.terrain = new Terrain(this);
        this.terrain.instantiate();
        this.player = new Player(new Vec2(0, 0), this);
        this.player.instantiate();
        for (let n = 0; n < 10; n++) {
            let creeper = new Creep(this);
            creeper.instantiate();
        }
        this._mainLoop();
    }
    setScore(score) {
        this.score = score;
        document.getElementsByClassName("score-value")[0].innerText = this.score.toFixed(0).padStart(5, "0");
        document.getElementsByClassName("score-value")[1].innerText = this.score.toFixed(0).padStart(5, "0");
    }
    start() {
        document.getElementById("play").style.display = "none";
        document.getElementById("game-over").style.display = "none";
        document.getElementById("credit").style.display = "none";
        this.setScore(0);
        this.gameobjects.forEach(gameobject => {
            gameobject.start();
            gameobject.draw();
        });
        this._update = (dt) => {
            this.player.update(dt);
            this.gameobjects.forEach(gameobject => {
                gameobject.update(dt);
            });
            this.gameobjects.forEach(gameobject => {
                gameobject.updatePosRot();
            });
            //this.testCreep.redraw();
        };
    }
    stop() {
        this._update = () => {
        };
        this.gameobjects.forEach(gameobject => {
            gameobject.stop();
        });
    }
    gameover(success) {
        this.stop();
        document.getElementById("play").style.display = "block";
        document.getElementById("game-over").style.display = "block";
        if (success) {
            document.getElementById("game-over").style.backgroundColor = "#0abdc6";
            document.getElementById("success-value").innerText = "SUCCESS";
        }
        else {
            document.getElementById("game-over").style.backgroundColor = "#711c91";
            document.getElementById("success-value").innerText = "GAME OVER";
        }
        document.getElementById("credit").style.display = "block";
    }
    dispose() {
        while (this.gameobjects.length > 0) {
            this.gameobjects.get(0).dispose();
        }
    }
}
window.addEventListener("load", () => {
    document.getElementById("game-over").style.display = "none";
    let main = new Main();
    main.instantiate();
    document.getElementById("play").addEventListener("pointerup", () => {
        requestAnimationFrame(() => {
            main.start();
        });
    });
});
var PlayerMode;
(function (PlayerMode) {
    PlayerMode[PlayerMode["Idle"] = 0] = "Idle";
    PlayerMode[PlayerMode["Tracing"] = 1] = "Tracing";
    PlayerMode[PlayerMode["Closing"] = 2] = "Closing";
})(PlayerMode || (PlayerMode = {}));
class PlayerBuiltPath extends Gameobject {
    instantiate() {
        let path = this.addComponent(new PathRenderer(this, { layer: 1 }));
        path.addClass("player-built-path");
    }
    setPoints(points) {
        this.renderers.get(0).points = points;
    }
}
class Player extends Gameobject {
    constructor(pos, main) {
        super({
            pos: pos
        }, main);
        this.mode = PlayerMode.Idle;
        this.speedValue = 100;
        this.speed = new Vec2(0, 0);
        this.radius = 15;
        this.currentSegmentIndex = 0;
        this.drawnPoints = [];
        this._onKeyDown = (ev) => {
            if (ev.code === "Space") {
                this._action();
            }
        };
        this._onPointerUp = () => {
            this._action();
        };
        this.playerBuiltPath = new PlayerBuiltPath({}, main);
    }
    instantiate() {
        super.instantiate();
        this.playerBuiltPath.instantiate();
        let circle = this.addComponent(new CircleRenderer(this, { radius: this.radius, layer: 2 }));
        circle.addClass("player");
        let path = this.addComponent(new PathRenderer(this, { d: "M-12 -25 L0 -40 L12 -25 Z", layer: 2 }));
        path.addClass("player-arrow");
        this.engineSound = this.addComponent(new Sound(this, { fileName: "spaceEngine_002.ogg", loop: true }));
        this.turnSound = this.addComponent(new Sound(this, { fileName: "forceField_000.ogg" }));
    }
    dispose() {
        super.dispose();
        this.playerBuiltPath.dispose();
    }
    start() {
        super.start();
        this.mode = PlayerMode.Idle;
        this.drawnPoints = [];
        this.pos.x = 40;
        this.pos.y = 40;
        this.currentSegmentIndex = 0;
        this.speed = new Vec2(0, 0);
        this.playerBuiltPath.setPoints([]);
        document.body.addEventListener("keydown", this._onKeyDown);
        window.addEventListener("pointerup", this._onPointerUp);
    }
    stop() {
        super.stop();
        document.body.removeEventListener("keydown", this._onKeyDown);
        window.removeEventListener("pointerup", this._onPointerUp);
    }
    _action() {
        if (this.drawnPoints.length === 0 || Vec2.DistanceSquared(this.pos, this.drawnPoints[this.drawnPoints.length - 1]) > this.radius * this.radius) {
            this.drawnPoints.push(new Vec2(Math.round(this.pos.x), Math.round(this.pos.y)));
            this.turnSound.play();
            this.speed.rotateInPlace(Math.PI * 0.5);
            if (this.mode === PlayerMode.Idle) {
                this.mode = PlayerMode.Tracing;
                this.engineSound.play();
            }
            else {
                this.mode = PlayerMode.Closing;
            }
        }
    }
    updateCurrentSegmentIndex() {
        this.currentSegmentIndex = 0;
        let bestSqrDist = Infinity;
        let points = this.main.terrain.points;
        for (let i = 0; i < points.length; i++) {
            let ptA = points[i];
            let ptB = points[(i + 1) % points.length];
            let proj = Vec2.ProjectOnABSegment(this.pos, ptA, ptB);
            let sqrDist = this.pos.subtract(proj).lengthSquared();
            if (sqrDist < bestSqrDist) {
                bestSqrDist = sqrDist;
                this.currentSegmentIndex = i;
            }
        }
    }
    update(dt) {
        let targetDir = 0;
        if (Math.abs(this.speed.x) > Math.abs(this.speed.y)) {
            targetDir = this.speed.x > 0 ? Math.PI : 0;
        }
        else {
            targetDir = this.speed.y > 0 ? (3 * Math.PI / 2) : Math.PI / 2;
        }
        this.rot = SMath.StepFromToCirular(this.rot, targetDir, Math.PI * dt * 4);
        if (this.mode === PlayerMode.Idle) {
            let points = this.main.terrain.points;
            let ptA = points[this.currentSegmentIndex];
            let ptB = points[(this.currentSegmentIndex + 1) % points.length];
            let proj = Vec2.ProjectOnABSegment(this.pos, ptA, ptB);
            this.pos = proj;
            if (proj.subtract(ptB).lengthSquared() < 1) {
                this.currentSegmentIndex = (this.currentSegmentIndex + 1) % points.length;
            }
            this.speed = ptB.subtract(ptA).normalizeInPlace().scaleInPlace(this.speedValue);
            let dp = this.speed.scale(dt);
            this.pos.addInPlace(dp);
            this.playerBuiltPath.setPoints([]);
        }
        else if (this.mode === PlayerMode.Tracing || this.mode === PlayerMode.Closing) {
            let dp = this.speed.scale(dt);
            this.pos.addInPlace(dp);
            for (let i = 0; i < this.drawnPoints.length - 2; i++) {
                let ptA = this.drawnPoints[i];
                let ptB = this.drawnPoints[i + 1];
                let proj = Vec2.ProjectOnABSegment(this.pos, ptA, ptB);
                let sqrDist = this.pos.subtract(proj).lengthSquared();
                if (sqrDist < this.radius * this.radius) {
                    this.main.gameover();
                }
            }
            let points = this.main.terrain.points;
            for (let i = 0; i < points.length; i++) {
                if (this.mode === PlayerMode.Closing || i != this.currentSegmentIndex) {
                    let ptA = points[i];
                    let ptB = points[(i + 1) % points.length];
                    let proj = Vec2.ProjectOnABSegment(this.pos, ptA, ptB);
                    let sqrDist = this.pos.subtract(proj).lengthSquared();
                    if (sqrDist < 5) {
                        let prev = this.currentSegmentIndex;
                        this.currentSegmentIndex = i;
                        this.drawnPoints.push(proj);
                        let surface = this.main.terrain.replace(prev, this.currentSegmentIndex, this.drawnPoints);
                        surface = Math.floor(surface / 100);
                        this.main.setScore(this.main.score + Math.pow(surface, 1.2));
                        this.mode = PlayerMode.Idle;
                        this.engineSound.pause();
                        this.turnSound.play();
                        this.updateCurrentSegmentIndex();
                        this.drawnPoints = [];
                        this.playerBuiltPath.setPoints([]);
                        return;
                    }
                }
            }
            this.playerBuiltPath.setPoints([...this.drawnPoints, this.pos]);
        }
    }
}
class SMath {
    static StepFromToCirular(from, to, step = Math.PI / 60) {
        while (from < 0) {
            from += 2 * Math.PI;
        }
        while (from >= 2 * Math.PI) {
            from -= 2 * Math.PI;
        }
        while (to < 0) {
            to += 2 * Math.PI;
        }
        while (to >= 2 * Math.PI) {
            to -= 2 * Math.PI;
        }
        if (Math.abs(to - from) <= step) {
            return to;
        }
        if (Math.abs(to - from) >= 2 * Math.PI - step) {
            return to;
        }
        if (to - from >= 0) {
            if (Math.abs(to - from) <= Math.PI) {
                return from + step;
            }
            return from - step;
        }
        if (to - from < 0) {
            if (Math.abs(to - from) <= Math.PI) {
                return from - step;
            }
            return from + step;
        }
        return to;
    }
}
class Terrain extends Gameobject {
    constructor(main) {
        super({}, main);
        this.points = [];
        this.pointsCut = [];
    }
    instantiate() {
        super.instantiate();
        this.cutSound = new Audio("sounds/doorClose_000.ogg");
        this.cutSound.volume = 1;
        this.path = this.addComponent(new PathRenderer(this, { layer: 0, close: true, classList: ["terrain-path"] }));
        this.pathCut = this.addComponent(new PathRenderer(this, { layer: 0, close: true, classList: ["terrain-path-cut"] }));
    }
    dispose() {
        super.dispose();
    }
    start() {
        super.start();
        this.points = [
            new Vec2(40, 40),
            new Vec2(960, 40),
            new Vec2(960, 960),
            new Vec2(40, 960),
        ];
        this.pointsCut = [];
        this.updatePath();
    }
    replace(start, end, points) {
        if (start === end) {
            this.points.splice(start + 1, 0, ...points.reverse());
            this.pointsCut = [...points];
            this.removePathCut();
            this.updatePath();
            return Vec2.BBoxSurface(...this.pointsCut);
        }
        else {
            if (start < end) {
                let tmp = start;
                start = end;
                end = tmp;
                points = points.reverse();
            }
            let inside = this.points.slice(end + 1, start + 1);
            let outside1 = this.points.slice(0, end + 1);
            let outside2 = this.points.slice(start + 1);
            let pointsInside = [...inside, ...points];
            let pointsOutside = [...outside1, ...points.reverse(), ...outside2];
            let inSurface = Vec2.BBoxSurface(...pointsInside);
            let outSurface = Vec2.BBoxSurface(...pointsOutside);
            if (inSurface < outSurface) {
                this.points = pointsOutside;
                this.pointsCut = pointsInside;
            }
            else {
                this.points = pointsInside;
                this.pointsCut = pointsOutside;
            }
            let i = 0;
            while (i < this.points.length) {
                let ptA = this.points[i];
                let ptB = this.points[(i + 1) % this.points.length];
                if (Vec2.DistanceSquared(ptA, ptB) < 1) {
                    this.points.splice(i, 1);
                }
                else {
                    i++;
                }
            }
            if (Math.max(inSurface, outSurface) < 960 * 960 * 0.2) {
                this.main.gameover(true);
            }
            this.removePathCut();
            this.updatePath();
            return Vec2.BBoxSurface(...this.pointsCut);
        }
    }
    updatePath() {
        this.path.points = this.points;
        this.pathCut.points = this.pointsCut;
    }
    removePathCut() {
        clearTimeout(this._timout);
        this._timout = setTimeout(() => {
            this.pointsCut = [];
            this.updatePath();
            this.cutSound.currentTime = 0;
            this.cutSound.play();
        }, 1000);
    }
}
class Component {
    constructor(gameobject) {
        this.gameobject = gameobject;
    }
    dispose() { }
    onStart() { }
    onPause() { }
    onUnpause() { }
    onStop() { }
}
/// <reference path="Component.ts" />
class Renderer extends Component {
    constructor(gameobject, prop) {
        super(gameobject);
        this.layer = 0;
        this._classList = new UniqueList();
        if (prop) {
            if (isFinite(prop.layer)) {
                this.layer = prop.layer;
            }
            if (prop.classList) {
                prop.classList.forEach(c => {
                    this.addClass(c);
                });
            }
        }
    }
    addClass(c) {
        this._classList.push(c);
        this.onClassAdded(c);
    }
    removeClass(c) {
        this._classList.remove(c);
        this.onClassRemoved(c);
    }
    draw() {
    }
    updatePosRot() {
    }
}
class CircleRenderer extends Renderer {
    constructor(gameobject, prop) {
        super(gameobject, prop);
        this._radius = 10;
        if (prop) {
            if (isFinite(prop.radius)) {
                this.radius = prop.radius;
            }
        }
    }
    get radius() {
        return this._radius;
    }
    set radius(v) {
        this._radius = v;
        if (this.svgElement) {
            this.svgElement.setAttribute("r", this.radius.toFixed(0));
        }
    }
    onClassAdded(c) {
        if (this.svgElement) {
            this.svgElement.classList.add(c);
        }
    }
    onClassRemoved(c) {
        if (this.svgElement) {
            this.svgElement.classList.remove(c);
        }
    }
    draw() {
        if (!this.svgElement) {
            this.svgElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            this.svgElement.setAttribute("r", this.radius.toFixed(0));
            this._classList.forEach(c => {
                this.onClassAdded(c);
            });
            this.gameobject.main.layers[this.layer].appendChild(this.svgElement);
        }
    }
    updatePosRot() {
        this.svgElement.setAttribute("cx", this.gameobject.pos.x.toFixed(1));
        this.svgElement.setAttribute("cy", this.gameobject.pos.y.toFixed(1));
    }
    dispose() {
        if (this.svgElement) {
            this.gameobject.main.layers[this.layer].removeChild(this.svgElement);
        }
        delete this.svgElement;
    }
}
class PathRenderer extends Renderer {
    constructor(gameobject, prop) {
        super(gameobject, prop);
        this._points = [];
        this._d = "";
        this._close = false;
        if (prop) {
            if (prop.points instanceof Array) {
                this.points = prop.points;
            }
            if (prop.d) {
                this.d = prop.d;
            }
            if (prop.close) {
                this.close = prop.close;
            }
        }
    }
    get points() {
        return this._points;
    }
    set points(v) {
        this._points = v;
        this.draw();
    }
    get d() {
        return this._d;
    }
    set d(s) {
        this._d = s;
        this.draw();
    }
    get close() {
        return this._close;
    }
    set close(v) {
        this._close = v;
        this.draw();
    }
    onClassAdded(c) {
        if (this.svgElement) {
            this.svgElement.classList.add(c);
        }
    }
    onClassRemoved(c) {
        if (this.svgElement) {
            this.svgElement.classList.remove(c);
        }
    }
    draw() {
        if (!this.svgElement) {
            this.svgElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
            this._classList.forEach(c => {
                this.onClassAdded(c);
            });
            this.gameobject.main.layers[this.layer].appendChild(this.svgElement);
        }
        let d = "";
        if (this.points.length > 0) {
            d = "M" + this.points[0].x + " " + this.points[0].y + " ";
            for (let i = 1; i < this.points.length; i++) {
                d += "L" + this.points[i].x + " " + this.points[i].y + " ";
            }
            if (this.close) {
                d += "Z";
            }
        }
        else {
            d = this.d;
        }
        this.svgElement.setAttribute("d", d);
    }
    updatePosRot() {
        this.svgElement.setAttribute("transform", "translate(" + this.gameobject.pos.x.toFixed(1) + " " + this.gameobject.pos.y.toFixed(1) + "), rotate(" + (this.gameobject.rot / Math.PI * 180).toFixed(0) + ")");
    }
    dispose() {
        if (this.svgElement) {
            this.gameobject.main.layers[this.layer].removeChild(this.svgElement);
        }
        delete this.svgElement;
    }
}
class Sound extends Component {
    constructor(gameobject, prop) {
        super(gameobject);
        if (prop) {
            if (prop.fileName) {
                this._audioElement = new Audio("sounds/" + prop.fileName);
            }
            if (this._audioElement) {
                if (prop.loop) {
                    this._audioElement.loop = prop.loop;
                }
            }
        }
    }
    play(fromBegin = true) {
        if (this._audioElement) {
            if (fromBegin) {
                this._audioElement.currentTime = 0;
            }
            this._audioElement.play();
        }
    }
    pause() {
        if (this._audioElement) {
            this._audioElement.pause();
        }
    }
    onPause() {
        this.pause();
    }
    onStop() {
        this.pause();
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
    indexOf(e) {
        return this._elements.indexOf(e);
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
            return e;
        }
        return undefined;
    }
    contains(e) {
        return this._elements.indexOf(e) != -1;
    }
    find(callback) {
        return this._elements.find(callback);
    }
    filter(callback) {
        return this._elements.filter(callback);
    }
    forEach(callback) {
        this._elements.forEach(e => {
            callback(e);
        });
    }
    sort(callback) {
        this._elements = this._elements.sort(callback);
    }
    clone() {
        let clonedList = new UniqueList();
        clonedList._elements = [...this._elements];
        return clonedList;
    }
}
class Vec2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    copyFrom(other) {
        this.x = other.x;
        this.y = other.y;
        return this;
    }
    clone() {
        return new Vec2(this.x, this.y);
    }
    static DistanceSquared(a, b) {
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        return dx * dx + dy * dy;
    }
    static Distance(a, b) {
        return Math.sqrt(Vec2.DistanceSquared(a, b));
    }
    static Dot(a, b) {
        return a.x * b.x + a.y * b.y;
    }
    lengthSquared() {
        return this.x * this.x + this.y * this.y;
    }
    length() {
        return Math.sqrt(this.lengthSquared());
    }
    add(other) {
        return new Vec2(this.x + other.x, this.y + other.y);
    }
    addInPlace(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }
    subtract(other) {
        return new Vec2(this.x - other.x, this.y - other.y);
    }
    subtractInPlace(other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }
    normalizeInPlace() {
        this.scaleInPlace(1 / this.length());
        return this;
    }
    scale(s) {
        return new Vec2(this.x * s, this.y * s);
    }
    scaleInPlace(s) {
        this.x *= s;
        this.y *= s;
        return this;
    }
    rotate(alpha) {
        return this.clone().rotateInPlace(alpha);
    }
    rotateInPlace(alpha) {
        let x = Math.cos(alpha) * this.x - Math.sin(alpha) * this.y;
        let y = Math.cos(alpha) * this.y + Math.sin(alpha) * this.x;
        this.x = x;
        this.y = y;
        return this;
    }
    static ProjectOnABLine(pt, ptA, ptB) {
        let dir = ptB.subtract(ptA).normalizeInPlace();
        let tmp = pt.subtract(ptA);
        let dot = Vec2.Dot(dir, tmp);
        let proj = dir.scaleInPlace(dot).addInPlace(ptA);
        return proj;
    }
    static ProjectOnABSegment(pt, ptA, ptB) {
        let dir = ptB.subtract(ptA).normalizeInPlace();
        let proj = Vec2.ProjectOnABLine(pt, ptA, ptB);
        let tmpA = pt.subtract(ptA);
        if (Vec2.Dot(tmpA, dir) < 0) {
            return ptA.clone();
        }
        else {
            let invDir = dir.scale(-1);
            let tmpB = pt.subtract(ptB);
            if (Vec2.Dot(tmpB, invDir) < 0) {
                return ptB.clone();
            }
        }
        return proj;
    }
    static BBoxSurface(...points) {
        let min = points.reduce((v1, v2) => {
            return new Vec2(Math.min(v1.x, v2.x), Math.min(v1.y, v2.y));
        });
        let max = points.reduce((v1, v2) => {
            return new Vec2(Math.max(v1.x, v2.x), Math.max(v1.y, v2.y));
        });
        return (max.x - min.x) * (max.y - min.y);
    }
}
