class Gameobject {
    constructor(prop, main) {
        this.main = main;
        this.name = "";
        this.pos = new Vec2();
        this.rot = 0;
        this.scale = new Vec2(1, 1);
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
            if (prop.scale) {
                this.scale.copyFrom(prop.scale);
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
    updatePosRotScale() {
        if (this.renderers) {
            this.renderers.forEach(renderer => {
                renderer.updatePosRotScale();
            });
        }
    }
}
/// <reference path="./engine/Gameobject.ts" />
class Ball extends Gameobject {
    constructor(main, color = BlockColor.Red) {
        super({}, main);
        this.color = color;
        this.speed = new Vec2(0, 0);
        this.radius = 15;
        this.ghost = false;
        this.speedVal = 400;
    }
    instantiate() {
        super.instantiate();
        this._renderer = this.addComponent(new CircleRenderer(this, { radius: this.radius, layer: 3 }));
        this._renderer.addClass("ball");
        this.setColor(this.color);
    }
    start() {
        super.start();
    }
    update(dt) {
        super.update(dt);
        this.pos.x += this.speed.x * dt;
        this.pos.y += this.speed.y * dt;
        if (this.pos.x < this.radius) {
            this.pos.x = this.radius;
            this.speed.x *= -1;
        }
        if (this.pos.y < this.radius) {
            this.pos.y = this.radius;
            this.speed.y *= -1;
        }
        if (this.pos.x > 1600 - this.radius) {
            this.pos.x = 1600 - this.radius;
            this.speed.x *= -1;
        }
        if (this.pos.y > 1000 - this.radius) {
            this.pos.y = 1000 - this.radius;
            this.speed.y *= -1;
        }
        if (!this.ghost) {
            let hit;
            let axis;
            this.main.gameobjects.forEach(other => {
                if (other instanceof Block) {
                    let currHit = other.intersectsBall(this);
                    if (currHit.hit) {
                        hit = other;
                        axis = currHit.axis;
                    }
                }
            });
            if (hit) {
                this.speed.mirrorInPlace(axis);
                if (hit.color != this.color) {
                    if (hit.extraBall) {
                        let extraBall = new Ball(this.main, this.color);
                        extraBall.pos.copyFrom(this.pos);
                        extraBall.speed.copyFrom(this.speed);
                        extraBall.speed.y += -50 + Math.random() * 100;
                        extraBall.speed.normalizeInPlace().scaleInPlace(extraBall.speedVal);
                        extraBall.instantiate();
                        extraBall.start();
                        extraBall.draw();
                    }
                    hit.dispose();
                    let remainingBlocks = this.main.gameobjects.filter(g => { return g instanceof Block; });
                    if (remainingBlocks.length === 0) {
                        this.main.gameover(true);
                        return;
                    }
                }
                else {
                    hit.expand();
                    if (hit.i === 15 || hit.i === 16) {
                        this.main.gameover(false);
                        return;
                    }
                    this.ghost = true;
                    if (this.color === BlockColor.Green) {
                        this.speed.x = Math.abs(this.speed.x);
                    }
                    else {
                        this.speed.x = -Math.abs(this.speed.x);
                    }
                }
            }
        }
        else {
            if (this.color === BlockColor.Green) {
                if (this.pos.x > 800) {
                    this.ghost = false;
                }
            }
            else {
                if (this.pos.x < 800) {
                    this.ghost = false;
                }
            }
        }
    }
    stop() {
        super.stop();
    }
    setColor(color) {
        this.color = color;
        if (this.color === BlockColor.Red) {
            this._renderer.addClass("red");
        }
        else if (this.color === BlockColor.Green) {
            this._renderer.addClass("green");
        }
    }
}
/// <reference path="./engine/Gameobject.ts" />
var BlockColor;
(function (BlockColor) {
    BlockColor[BlockColor["Red"] = 0] = "Red";
    BlockColor[BlockColor["Green"] = 1] = "Green";
})(BlockColor || (BlockColor = {}));
class Block extends Gameobject {
    constructor(i, j, main, color = BlockColor.Red, extraBall = false) {
        super({}, main);
        this.i = i;
        this.j = j;
        this.color = color;
        this.extraBall = extraBall;
        this.animateSize = AnimationFactory.EmptyVec2Callback;
        this.pos.x = 25 + i * 50;
        this.pos.y = 50 + j * 100;
        this.main.blocks[i][j] = this;
        this.animateSize = AnimationFactory.CreateVec2(this, this, "scale");
    }
    instantiate() {
        super.instantiate();
        this._renderer = this.addComponent(new PathRenderer(this, {
            points: [
                new Vec2(-20, -45),
                new Vec2(20, -45),
                new Vec2(20, 45),
                new Vec2(-20, 45)
            ],
            close: true,
            layer: 2
        }));
        this._renderer.addClass("block");
        if (this.extraBall) {
            this._extraBallIcon = this.addComponent(new CircleRenderer(this, {
                radius: 15,
                layer: 3
            }));
            this._extraBallIcon.addClass("ball");
        }
        this.setColor(this.color);
    }
    start() {
        super.start();
    }
    update(dt) {
        super.update(dt);
    }
    stop() {
        super.stop();
    }
    dispose() {
        this.main.blocks[this.i][this.j] = undefined;
        super.dispose();
    }
    setColor(color) {
        this.color = color;
        if (this.color === BlockColor.Red) {
            this._renderer.addClass("red");
            if (this.extraBall) {
                this._extraBallIcon.addClass("green");
            }
        }
        else if (this.color === BlockColor.Green) {
            this._renderer.addClass("green");
            if (this.extraBall) {
                this._extraBallIcon.addClass("red");
            }
        }
    }
    intersectsBall(ball, margin = 0) {
        let xMin = this.pos.x - 25;
        let xMax = this.pos.x + 25;
        let yMin = this.pos.y - 50;
        let yMax = this.pos.y + 50;
        let r = ball.radius + margin;
        if (ball.pos.x - r > xMax) {
            return { hit: false };
        }
        if (ball.pos.y - r > yMax) {
            return { hit: false };
        }
        if (ball.pos.x + r < xMin) {
            return { hit: false };
        }
        if (ball.pos.y + r < yMin) {
            return { hit: false };
        }
        let axis = ball.pos.subtract(this.pos);
        let xDepth = Math.abs(Math.abs(ball.pos.x - this.pos.x) - r - 25);
        let yDepth = Math.abs(Math.abs(ball.pos.y - this.pos.y) - r - 50);
        if (xDepth < yDepth) {
            axis.y = 0;
            axis.normalizeInPlace();
        }
        else {
            axis.x = 0;
            axis.normalizeInPlace();
        }
        return { hit: true, axis: axis };
    }
    expand() {
        let newBlocks = [];
        if (this.main.blocks[this.i + 1]) {
            if (!this.main.blocks[this.i + 1][this.j]) {
                let iNext = new Block(this.i + 1, this.j, this.main, this.color);
                iNext.instantiate();
                iNext.scale.x = 0.01;
                iNext.scale.y = 0.01;
                iNext.animateSize(new Vec2(1, 1), 3);
                newBlocks.push(iNext);
            }
        }
        if (this.main.blocks[this.i - 1]) {
            if (!this.main.blocks[this.i - 1][this.j]) {
                let iPrev = new Block(this.i - 1, this.j, this.main, this.color);
                iPrev.instantiate();
                iPrev.scale.x = 0.01;
                iPrev.scale.y = 0.01;
                iPrev.animateSize(new Vec2(1, 1), 3);
                newBlocks.push(iPrev);
            }
        }
        if (!this.main.blocks[this.i][this.j + 1]) {
            let jNext = new Block(this.i, this.j + 1, this.main, this.color);
            jNext.instantiate();
            jNext.scale.x = 0.01;
            jNext.scale.y = 0.01;
            jNext.animateSize(new Vec2(1, 1), 3);
            newBlocks.push(jNext);
        }
        if (!this.main.blocks[this.i][this.j - 1]) {
            let jPrev = new Block(this.i, this.j - 1, this.main, this.color);
            jPrev.instantiate();
            jPrev.scale.x = 0.01;
            jPrev.scale.y = 0.01;
            jPrev.animateSize(new Vec2(1, 1), 3);
            newBlocks.push(jPrev);
        }
        return newBlocks;
    }
}
/// <reference path="./engine/Gameobject.ts" />
class Main {
    constructor() {
        this.layers = [];
        this.gameobjects = new UniqueList();
        this.score = 0;
        this.updates = new UniqueList();
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
        this.pointerClientPos = new Vec2();
        this._onPointerMove = (ev) => {
            this.pointerClientPos.x = ev.clientX;
            this.pointerClientPos.y = ev.clientY;
        };
        this._onResize = () => {
            let screenWidth = document.body.clientWidth;
            let screenHeight = document.body.clientHeight;
            let screenRatio = screenWidth / screenHeight;
            let w;
            let marginLeft;
            let h;
            let marginTop;
            let r = 1.6;
            if (screenRatio >= r) {
                h = screenHeight * 0.9;
                w = h * r;
            }
            else {
                w = screenWidth * 0.9;
                h = w / r;
            }
            marginLeft = (screenWidth - w) / 2;
            marginTop = (screenHeight - h) / 2;
            this.container.style.width = w + "px";
            this.container.style.height = h + "px";
            this.container.style.marginLeft = marginLeft + "px";
            this.container.style.marginTop = marginTop + "px";
            this.containerRect = this.container.getBoundingClientRect();
        };
    }
    instantiate() {
        this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.container.id = "main-container";
        this.container.setAttribute("viewBox", "0 0 1600 1000");
        document.body.appendChild(this.container);
        for (let i = 0; i < 4; i++) {
            let layer = document.createElementNS("http://www.w3.org/2000/svg", "g");
            this.container.appendChild(layer);
            this.layers[i] = layer;
        }
        window.addEventListener("resize", this._onResize);
        window.addEventListener("pointerenter", this._onPointerMove);
        window.addEventListener("pointermove", this._onPointerMove);
        this.makeLevel1();
        this._onResize();
        this._mainLoop();
    }
    clearLevel() {
        this.dispose();
    }
    makeLevel1() {
        this.blocks = [];
        for (let i = 0; i < 32; i++) {
            this.blocks[i] = [];
        }
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 10; j++) {
                let extraBall = i === 2 && (j === 2 || j === 7);
                let block = new Block(i, j, this, BlockColor.Green, extraBall);
                block.instantiate();
            }
        }
        for (let i = 32 - 5; i < 32; i++) {
            for (let j = 0; j < 10; j++) {
                let extraBall = i === 29 && (j === 2 || j === 7);
                let block = new Block(i, j, this, BlockColor.Red, extraBall);
                block.instantiate();
            }
        }
        let player = new Player(this);
        player.instantiate();
        for (let n = 0; n < 1; n++) {
            let ball = new Ball(this, BlockColor.Red);
            ball.pos.x = 700;
            ball.pos.y = 400;
            ball.instantiate();
            ball.speed.x = -1;
            ball.speed.y = -1 + 2 * Math.random();
            ball.speed.normalizeInPlace().scaleInPlace(ball.speedVal);
            let ball2 = new Ball(this, BlockColor.Green);
            ball2.pos.x = 900;
            ball2.pos.y = 400;
            ball2.instantiate();
            ball2.speed.x = 1;
            ball2.speed.y = -1 + 2 * Math.random();
            ball2.speed.normalizeInPlace().scaleInPlace(ball2.speedVal);
        }
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
        this.setScore(10000);
        this.gameobjects.forEach(gameobject => {
            gameobject.start();
            gameobject.draw();
        });
        this._update = (dt) => {
            this.setScore(this.score - dt * 10);
            this.updates.forEach(up => {
                up();
            });
            this.gameobjects.forEach(gameobject => {
                gameobject.update(dt);
            });
            this.gameobjects.forEach(gameobject => {
                gameobject.updatePosRotScale();
            });
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
    clientXYToContainerXY(clientX, clientY) {
        let v = new Vec2();
        return this.clientXYToContainerXYToRef(clientX, clientY, v);
    }
    clientXYToContainerXYToRef(clientX, clientY, ref) {
        let px = clientX - this.containerRect.left;
        let py = clientY - this.containerRect.top;
        px = px / this.containerRect.width * 1600;
        py = py / this.containerRect.height * 1000;
        ref.x = px;
        ref.y = py;
        return ref;
    }
    addUpdate(callback) {
        this.updates.push(callback);
    }
    removeUpdate(callback) {
        this.updates.remove(callback);
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
/// <reference path="./engine/Gameobject.ts" />
class Player extends Gameobject {
    constructor(main) {
        super({}, main);
        this._pointerDown = false;
        this._inputPos = new Vec2(800, 500);
        this.pointerMove = (ev) => {
            this.main.clientXYToContainerXYToRef(ev.clientX, ev.clientY, this._inputPos);
        };
        this.pointerDown = (ev) => {
            this.main.clientXYToContainerXYToRef(ev.clientX, ev.clientY, this._inputPos);
        };
        this.pos.x = 800;
        this.pos.y = 500;
    }
    instantiate() {
        super.instantiate();
        this._renderer = this.addComponent(new PathRenderer(this, {
            points: [
                new Vec2(-8, -100),
                new Vec2(8, -100),
                new Vec2(15, -93),
                new Vec2(15, 93),
                new Vec2(8, 100),
                new Vec2(-8, 100),
                new Vec2(-15, 93),
                new Vec2(-15, -93)
            ],
            close: true,
            layer: 2
        }));
        this._renderer.addClass("player");
        window.addEventListener("pointermove", this.pointerMove);
        window.addEventListener("pointerdown", this.pointerDown);
    }
    start() {
        super.start();
    }
    update(dt) {
        super.update(dt);
        this.pos.y *= 0.8;
        this.pos.y += this._inputPos.y * 0.2;
        this.pos.y = Math.max(this.pos.y, 105);
        this.pos.y = Math.min(this.pos.y, 895);
        this.main.gameobjects.forEach(ball => {
            if (ball instanceof Ball) {
                if (this.intersectsBall(ball)) {
                    let sign = Math.sign(ball.pos.x - 800);
                    ball.speed.x = sign * Math.abs(ball.speed.x);
                    ball.ghost = false;
                    let dy = ball.pos.y - this.pos.y;
                    ball.speed.y += 3 * dy;
                    ball.speed.normalizeInPlace().scaleInPlace(ball.speedVal);
                    if (Math.abs(ball.speed.x) < ball.speedVal / 5) {
                        ball.speed.x = Math.sign(ball.speed.x) * ball.speedVal / 5;
                        ball.speed.normalizeInPlace().scaleInPlace(ball.speedVal);
                    }
                }
            }
        });
    }
    stop() {
        super.stop();
    }
    dispose() {
        super.dispose();
    }
    intersectsBall(ball, margin = 0) {
        let xMin = this.pos.x - 15;
        let xMax = this.pos.x + 15;
        let yMin = this.pos.y - 100;
        let yMax = this.pos.y + 100;
        let r = ball.radius + margin;
        if (ball.pos.x - r > xMax) {
            return false;
        }
        if (ball.pos.y - r > yMax) {
            return false;
        }
        if (ball.pos.x + r < xMin) {
            return false;
        }
        if (ball.pos.y + r < yMin) {
            return false;
        }
        return true;
    }
}
class AnimationFactory {
    static CreateWait(owner, onUpdateCallback) {
        return (duration) => {
            return new Promise(resolve => {
                let t = 0;
                let animationCB = () => {
                    t += 1 / 60;
                    let f = t / duration;
                    if (f < 1) {
                        if (onUpdateCallback) {
                            onUpdateCallback();
                        }
                    }
                    else {
                        if (onUpdateCallback) {
                            onUpdateCallback();
                        }
                        owner.main.removeUpdate(animationCB);
                        resolve();
                    }
                };
                owner.main.addUpdate(animationCB);
            });
        };
    }
    static CreateNumber(owner, obj, property, onUpdateCallback) {
        return (target, duration) => {
            return new Promise(resolve => {
                let origin = obj[property];
                let t = 0;
                if (owner[property + "_animation"]) {
                    owner.main.removeUpdate(owner[property + "_animation"]);
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
                        owner.main.removeUpdate(animationCB);
                        owner[property + "_animation"] = undefined;
                        resolve();
                    }
                };
                owner.main.addUpdate(animationCB);
                owner[property + "_animation"] = animationCB;
            });
        };
    }
    static CreateVec2(owner, obj, property, onUpdateCallback) {
        return (target, duration) => {
            return new Promise(resolve => {
                let origin = obj[property];
                let t = 0;
                if (owner[property + "_animation"]) {
                    owner.main.removeUpdate(owner[property + "_animation"]);
                }
                let tmp = new Vec2();
                let animationCB = () => {
                    t += 1 / 60;
                    let f = t / duration;
                    if (f < 1) {
                        tmp.copyFrom(target).scaleInPlace(f);
                        obj[property].copyFrom(origin).scaleInPlace(1 - f).addInPlace(tmp);
                        if (onUpdateCallback) {
                            onUpdateCallback();
                        }
                    }
                    else {
                        obj[property].copyFrom(target);
                        if (onUpdateCallback) {
                            onUpdateCallback();
                        }
                        owner.main.removeUpdate(animationCB);
                        owner[property + "_animation"] = undefined;
                        resolve();
                    }
                };
                owner.main.addUpdate(animationCB);
                owner[property + "_animation"] = animationCB;
            });
        };
    }
}
AnimationFactory.EmptyVoidCallback = async (duration) => { };
AnimationFactory.EmptyNumberCallback = async (target, duration) => { };
AnimationFactory.EmptyVec2Callback = async (target, duration) => { };
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
    updatePosRotScale() {
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
            this.svgElement.setAttribute("r", this.radius.toFixed(1));
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
            this.svgElement.setAttribute("r", this.radius.toFixed(1));
            this._classList.forEach(c => {
                this.onClassAdded(c);
            });
            this.gameobject.main.layers[this.layer].appendChild(this.svgElement);
        }
    }
    updatePosRotScale() {
        if (this.svgElement) {
            this.svgElement.setAttribute("cx", this.gameobject.pos.x.toFixed(1));
            this.svgElement.setAttribute("cy", this.gameobject.pos.y.toFixed(1));
        }
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
    updatePosRotScale() {
        this.svgElement.setAttribute("transform", "translate(" + this.gameobject.pos.x.toFixed(1) + " " + this.gameobject.pos.y.toFixed(1) + "), rotate(" + (this.gameobject.rot / Math.PI * 180).toFixed(0) + "), scale(" + this.gameobject.scale.x.toFixed(2) + " " + this.gameobject.scale.y.toFixed(2) + ")");
    }
    dispose() {
        if (this.svgElement) {
            this.gameobject.main.layers[this.layer].removeChild(this.svgElement);
        }
        delete this.svgElement;
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
    static AngleFromTo(from, to, keepPositive = false) {
        let dot = Vec2.Dot(from, to) / from.length() / to.length();
        let angle = Math.acos(dot);
        let cross = from.x * to.y - from.y * to.x;
        if (cross === 0) {
            cross = 1;
        }
        angle *= Math.sign(cross);
        if (keepPositive && angle < 0) {
            angle += Math.PI * 2;
        }
        return angle;
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
    normalize() {
        return this.clone().normalizeInPlace();
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
    mirror(axis) {
        return this.clone().mirrorInPlace(axis);
    }
    mirrorInPlace(axis) {
        this.scaleInPlace(-1);
        let a = Vec2.AngleFromTo(this, axis);
        this.rotateInPlace(2 * a);
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
