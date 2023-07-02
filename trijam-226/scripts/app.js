var playerColor = "#0abdc6";
var creepColor = "#ea00d9";
class Creep {
    constructor(pos, main) {
        this.pos = pos;
        this.main = main;
        this.radius = 15;
        this.main;
        this.speed = new Vec2(Math.random() - 0.5, Math.random() - 0.5);
        let s = Math.random() * 100 + 50;
        this.speed.normalizeInPlace().scaleInPlace(s);
        let f = 1 - s / 150;
        this.radius = 10 + f * 10;
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
    redraw() {
        if (!this.svgElement) {
            this.svgElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            this.svgElement.setAttribute("r", this.radius.toFixed(0));
            this.svgElement.setAttribute("stroke", "white");
            this.svgElement.setAttribute("stroke-width", "4");
            this.svgElement.setAttribute("fill", creepColor);
            this.main.container.appendChild(this.svgElement);
        }
        this.svgElement.setAttribute("cx", this.pos.x.toFixed(1));
        this.svgElement.setAttribute("cy", this.pos.y.toFixed(1));
    }
}
class Main {
    constructor() {
        this.creeps = [];
        this.score = 0;
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
        this.terrain = new Terrain(this);
    }
    initialize() {
        this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.container.id = "main-container";
        this.container.setAttribute("viewBox", "0 0 1000 1000");
        document.body.appendChild(this.container);
        this.player = new Player(new Vec2(20, 20), this);
        this.player.initialize();
        this.terrain.points = [
            new Vec2(20, 20),
            new Vec2(980, 20),
            new Vec2(980, 980),
            new Vec2(20, 980),
        ];
        this.terrain.redraw();
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
        this.terrain.points = [
            new Vec2(20, 20),
            new Vec2(980, 20),
            new Vec2(980, 980),
            new Vec2(20, 980),
        ];
        this.setScore(0);
        this.player.drawnPoints = [];
        this.player.currentSegmentIndex = 0;
        this.player.speed.x = 0;
        this.player.speed.y = 0;
        this.container.innerHTML = "";
        delete this.terrain.path;
        delete this.terrain.pathCut;
        delete this.player.playerDrawnPath;
        delete this.player.svgElement;
        this.creeps = [];
        for (let n = 0; n < 10; n++) {
            this.creeps.push(new Creep(new Vec2(400 + 200 * Math.random(), 400 + 200 * Math.random()), this));
        }
        this.player.start();
        this._update = (dt) => {
            this.player.update(dt);
            this.creeps.forEach(creep => {
                creep.update(dt);
            });
            this.terrain.redraw();
            this.player.redraw();
            this.creeps.forEach(creep => {
                creep.redraw();
            });
            //this.testCreep.redraw();
        };
    }
    stop() {
        this._update = () => {
        };
    }
    gameover() {
        this.stop();
        document.getElementById("play").style.display = "block";
        document.getElementById("game-over").style.display = "block";
        document.getElementById("credit").style.display = "block";
    }
}
window.addEventListener("load", () => {
    document.getElementById("game-over").style.display = "none";
    let main = new Main();
    main.initialize();
    document.getElementById("play").addEventListener("pointerup", () => {
        main.start();
    });
});
var PlayerMode;
(function (PlayerMode) {
    PlayerMode[PlayerMode["Idle"] = 0] = "Idle";
    PlayerMode[PlayerMode["Tracing"] = 1] = "Tracing";
    PlayerMode[PlayerMode["Closing"] = 2] = "Closing";
})(PlayerMode || (PlayerMode = {}));
class Player {
    constructor(pos, main) {
        this.pos = pos;
        this.main = main;
        this.mode = PlayerMode.Idle;
        this.speedValue = 200;
        this.radius = 15;
        this.currentSegmentIndex = 0;
        this.drawnPoints = [];
        this.main;
        this.speed = new Vec2(0, 0);
    }
    initialize() {
        let action = () => {
            if (this.drawnPoints.length === 0 || Vec2.DistanceSquared(this.pos, this.drawnPoints[this.drawnPoints.length - 1]) > this.radius * this.radius) {
                this.drawnPoints.push(this.pos.clone());
                this.speed.rotateInPlace(Math.PI * 0.5);
                if (this.mode === PlayerMode.Idle) {
                    this.mode = PlayerMode.Tracing;
                }
                else {
                    this.mode = PlayerMode.Closing;
                }
            }
        };
        document.body.addEventListener("keydown", (ev) => {
            if (ev.code === "Space") {
                action();
            }
        });
        this.main.container.addEventListener("pointerup", () => {
            action();
        });
    }
    start() {
        this.pos.x = 20;
        this.pos.y = 20;
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
                        this.updateCurrentSegmentIndex();
                        this.drawnPoints = [];
                        return;
                    }
                }
            }
        }
    }
    redraw() {
        if (!this.playerDrawnPath) {
            this.playerDrawnPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            this.main.container.appendChild(this.playerDrawnPath);
        }
        if (!this.svgElement) {
            this.svgElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            this.svgElement.setAttribute("r", this.radius.toFixed(0));
            this.svgElement.setAttribute("stroke", "white");
            this.svgElement.setAttribute("stroke-width", "4");
            this.svgElement.setAttribute("fill", playerColor);
            this.main.container.appendChild(this.svgElement);
        }
        this.svgElement.setAttribute("cx", this.pos.x.toFixed(1));
        this.svgElement.setAttribute("cy", this.pos.y.toFixed(1));
        let d = "";
        let points = [...this.drawnPoints, this.pos];
        if (points.length > 0) {
            d = "M" + points[0].x + " " + points[0].y + " ";
            for (let i = 1; i < points.length; i++) {
                d += "L" + points[i].x + " " + points[i].y + " ";
            }
        }
        this.playerDrawnPath.setAttribute("stroke", "white");
        this.playerDrawnPath.setAttribute("fill", "none");
        this.playerDrawnPath.setAttribute("stroke-width", "4");
        this.playerDrawnPath.setAttribute("d", d);
    }
}
class Terrain {
    constructor(main) {
        this.main = main;
        this.points = [];
        this.pointsCut = [];
        this.points = [
            new Vec2(20, 20),
            new Vec2(980, 20),
            new Vec2(980, 980),
            new Vec2(20, 980),
        ];
    }
    replace(start, end, points) {
        if (start === end) {
            this.points.splice(start + 1, 0, ...points.reverse());
            this.pointsCut = [...points];
            this.removePathCut();
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
            this.removePathCut();
            return Vec2.BBoxSurface(...this.pointsCut);
        }
    }
    redraw() {
        if (!this.path) {
            this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            this.main.container.appendChild(this.path);
        }
        if (!this.pathCut) {
            this.pathCut = document.createElementNS("http://www.w3.org/2000/svg", "path");
            this.main.container.appendChild(this.pathCut);
        }
        let d = "";
        if (this.points.length > 0) {
            d = "M" + this.points[0].x + " " + this.points[0].y + " ";
            for (let i = 1; i < this.points.length; i++) {
                d += "L" + this.points[i].x + " " + this.points[i].y + " ";
            }
            d += "Z";
        }
        this.path.setAttribute("stroke", "white");
        this.path.setAttribute("fill", "#091833");
        this.path.setAttribute("stroke-width", "4");
        this.path.setAttribute("d", d);
        let dCut = "";
        if (this.pointsCut.length > 0) {
            dCut = "M" + this.pointsCut[0].x + " " + this.pointsCut[0].y + " ";
            for (let i = 1; i < this.pointsCut.length; i++) {
                dCut += "L" + this.pointsCut[i].x + " " + this.pointsCut[i].y + " ";
            }
            dCut += "Z";
        }
        this.pathCut.setAttribute("stroke", "white");
        this.pathCut.setAttribute("fill", playerColor);
        this.pathCut.setAttribute("stroke-width", "4");
        this.pathCut.setAttribute("d", dCut);
    }
    removePathCut() {
        clearTimeout(this._timout);
        this._timout = setTimeout(() => {
            this.pointsCut = [];
        }, 1000);
    }
}
class Vec2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
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
