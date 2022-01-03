class Board {
    constructor(main) {
        this.main = main;
        this.playerCount = 1;
        this.activePlayer = 0;
        this.ICenter = 5;
        this.JCenter = 5;
        this.tiles = [];
        for (let i = 0; i < 11; i++) {
            this.tiles[i] = [];
            for (let j = 0; j < 11; j++) {
                this.tiles[i][j] = new Tile(i, j, this);
            }
        }
        this.tiles[5][5].isPlayable = true;
        for (let i = 4; i <= 6; i++) {
            for (let j = 4; j <= 6; j++) {
                this.tiles[i][j].isNextToPlayable = true;
            }
        }
    }
    cloneTiles() {
        let clonedTiles = [];
        for (let i = 0; i < 11; i++) {
            clonedTiles[i] = [];
            for (let j = 0; j < 11; j++) {
                clonedTiles[i][j] = this.tiles[i][j].clone();
            }
        }
        return clonedTiles;
    }
    updateRangeAndPlayable(tiles) {
        if (!tiles) {
            tiles = this.tiles;
        }
        let iMin = 5;
        let jMin = 5;
        let iMax = 5;
        let jMax = 5;
        for (let i = 0; i < 11; i++) {
            for (let j = 0; j < 11; j++) {
                if (tiles[i][j].value > 0) {
                    iMin = Math.min(i, iMin);
                    jMin = Math.min(j, jMin);
                    iMax = Math.max(i, iMax);
                    jMax = Math.max(j, jMax);
                    for (let ii = -2; ii <= 2; ii++) {
                        for (let jj = -2; jj <= 2; jj++) {
                            if (i + ii >= 0 && i + ii < 11 && j + jj >= 0 && j + jj < 11) {
                                tiles[i + ii][j + jj].isNextToPlayable = true;
                            }
                        }
                    }
                    for (let ii = -1; ii <= 1; ii++) {
                        for (let jj = -1; jj <= 1; jj++) {
                            if (i + ii >= 0 && i + ii < 11 && j + jj >= 0 && j + jj < 11) {
                                tiles[i + ii][j + jj].isPlayable = true;
                            }
                        }
                    }
                }
            }
        }
        this.ICenter = (iMin + iMax) * 0.5;
        this.JCenter = (jMin + jMax) * 0.5;
        for (let i = 0; i < 11; i++) {
            for (let j = 0; j < 11; j++) {
                if (i >= iMin + 6) {
                    tiles[i][j].isInRange = false;
                }
                if (j >= jMin + 6) {
                    tiles[i][j].isInRange = false;
                }
                if (i <= iMax - 6) {
                    tiles[i][j].isInRange = false;
                }
                if (j <= jMax - 6) {
                    tiles[i][j].isInRange = false;
                }
            }
        }
    }
    updateShapes() {
        for (let i = 0; i < 11; i++) {
            for (let j = 0; j < 11; j++) {
                this.tiles[i][j].updateShape();
            }
        }
    }
    updateShapesTextPosition() {
        for (let i = 0; i < 11; i++) {
            for (let j = 0; j < 11; j++) {
                this.tiles[i][j].updateTextPosition();
            }
        }
    }
    reset() {
        for (let i = 0; i < 11; i++) {
            for (let j = 0; j < 11; j++) {
                this.tiles[i][j].reset();
            }
        }
        this.tiles[5][5].isPlayable = true;
        for (let i = 4; i <= 6; i++) {
            for (let j = 4; j <= 6; j++) {
                this.tiles[i][j].isNextToPlayable = true;
            }
        }
        this.activePlayer = 0;
        this.ICenter = 5;
        this.JCenter = 5;
        this.updateShapes();
    }
    hide() {
        for (let i = 0; i < 11; i++) {
            for (let j = 0; j < 11; j++) {
                this.tiles[i][j].hide();
            }
        }
    }
    play(player, color, value, i, j) {
        if (player != this.activePlayer) {
            return false;
        }
        if (i >= 0 && i < 11 && j >= 0 && j < 11) {
            let tile = this.tiles[i][j];
            if (tile.isPlayable && tile.isInRange && tile.value < value) {
                tile.color = color;
                tile.value = value;
                this.updateRangeAndPlayable();
                this.updateShapes();
                let victor = this.checkVictor();
                if (victor != -1) {
                    this.main.showEndGame(victor);
                    return false;
                }
                this.activePlayer = (this.activePlayer + 1) % this.playerCount;
                return true;
            }
        }
        return false;
    }
    computeBoardValueForColor(c, tiles) {
        if (!tiles) {
            tiles = this.tiles;
        }
        let value = 0;
        for (let i = 0; i < 11; i++) {
            for (let j = 0; j < 11; j++) {
                let t = tiles[i][j];
                if (c === t.color) {
                    for (let di = -1; di <= 1; di++) {
                        for (let dj = -1; dj <= 1; dj++) {
                            if (di != 0 || dj != 0) {
                                let l = 1;
                                let minValueToPLay = 1;
                                for (let n = 1; n < 5; n++) {
                                    let ii = i + n * di;
                                    let jj = j + n * dj;
                                    if (ii >= 0 && ii < 11 && jj >= 0 && jj < 11 && tiles[ii][jj].isInRange) {
                                        if (tiles[ii][jj].color === c) {
                                            l++;
                                        }
                                        else {
                                            minValueToPLay = Math.max(minValueToPLay, tiles[ii][jj].value + 1);
                                        }
                                    }
                                    else {
                                        l = 0;
                                        break;
                                    }
                                }
                                if (l === 5) {
                                    return 100000;
                                }
                                if (minValueToPLay < 10) {
                                    let v = 10 - minValueToPLay + Math.pow(10, l);
                                    value = Math.max(v, value);
                                }
                            }
                        }
                    }
                }
            }
        }
        return value;
    }
    checkVictor() {
        for (let i = 0; i < 11; i++) {
            for (let j = 0; j < 11; j++) {
                let t = this.tiles[i][j];
                let c = t.color;
                if (c >= 0) {
                    for (let di = -1; di <= 1; di++) {
                        for (let dj = -1; dj <= 1; dj++) {
                            if (di != 0 || dj != 0) {
                                let victory = true;
                                for (let n = 1; n < 5; n++) {
                                    let ii = i + n * di;
                                    let jj = j + n * dj;
                                    if (ii >= 0 && ii < 11 && jj >= 0 && jj < 11) {
                                        if (this.tiles[ii][jj].color != c) {
                                            victory = false;
                                        }
                                    }
                                    else {
                                        victory = false;
                                    }
                                }
                                if (victory === true) {
                                    this.activePlayer = -1;
                                    return Math.floor(c / 2);
                                }
                            }
                        }
                    }
                }
            }
        }
        return -1;
    }
    checkSubVictor() {
        let bestC = -1;
        let bestValue = Infinity;
        for (let i = 0; i < 11; i++) {
            for (let j = 0; j < 11; j++) {
                let t = this.tiles[i][j];
                let c = t.color;
                if (c >= 0) {
                    for (let di = -1; di <= 1; di++) {
                        for (let dj = -1; dj <= 1; dj++) {
                            if (di != 0 || dj != 0) {
                                let subVictory = true;
                                let value = 0;
                                for (let n = 1; n < 4; n++) {
                                    let ii = i + n * di;
                                    let jj = j + n * dj;
                                    if (ii >= 0 && ii < 11 && jj >= 0 && jj < 11) {
                                        if (this.tiles[ii][jj].color != c) {
                                            subVictory = false;
                                        }
                                        else {
                                            value += this.tiles[ii][jj].value;
                                        }
                                    }
                                    else {
                                        subVictory = false;
                                    }
                                }
                                if (subVictory === true) {
                                    if (value < bestValue) {
                                        bestValue = value;
                                        bestC = c;
                                    }
                                    else if (value === bestValue) {
                                        if (Math.floor(bestC * 0.5) != Math.floor(c * 0.5)) {
                                            bestC = -1;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return bestC;
    }
}
class Card {
    constructor(value, color) {
        this.value = value;
        this.color = color;
    }
}
class Deck {
    constructor(board, handSize = 2) {
        this.board = board;
        this.handSize = handSize;
        this.cards = [];
        this.hand = [];
        this.hand = [];
        for (let i = 0; i < this.handSize; i++) {
            this.hand.push(new Tile(-1, -1, this.board));
        }
    }
    draw() {
        for (let i = 0; i < this.handSize; i++) {
            let cardSlot = this.hand[i];
            if (cardSlot.value === 0) {
                let c = this.cards.pop();
                if (c) {
                    cardSlot.color = c.color;
                    cardSlot.value = c.value;
                }
                else {
                    return false;
                }
            }
        }
        return true;
    }
    updateShape() {
        for (let i = 0; i < this.handSize; i++) {
            this.hand[i].updateShape();
        }
    }
    shuffle() {
        let l = this.cards.length;
        for (let n = 0; n < l * l; n++) {
            let i0 = Math.floor(Math.random() * l);
            let i1 = Math.floor(Math.random() * l);
            let c0 = this.cards[i0];
            let c1 = this.cards[i1];
            this.cards[i0] = c1;
            this.cards[i1] = c0;
        }
    }
}
/// <reference path="../lib/babylon.d.ts"/>
/// <reference path="../lib/babylon.gui.d.ts"/>
var COS30 = Math.cos(Math.PI / 6);
class Main {
    constructor(canvasElement) {
        this.ratio = 1;
        this.cameraOffset = BABYLON.Vector2.Zero();
        this.canvas = document.getElementById(canvasElement);
        this.mainMenuContainer = document.getElementById("main-menu-panel");
        this.endGamePanel = document.getElementById("end-game-panel");
        this.tutorialPanel = document.getElementById("tutorial-panel");
        this.engine = new BABYLON.Engine(this.canvas, true, { preserveDrawingBuffer: true, stencil: true });
    }
    async initialize() {
        await this.initializeScene();
        this.initializeMainMenu();
    }
    resize() {
        this.resizeCamera();
        this.centerMainMenu();
    }
    resizeCamera() {
        this.ratio = this.canvas.clientWidth / this.canvas.clientHeight;
        let n = 4;
        /*
        if (Math.abs(this.ratio - 1) < 1 / 6) {
            n = 6;
        }
        else if (Math.abs(this.ratio - 1) < 1 / 3) {
            n = 5;
        }
        */
        let targetOffset = BABYLON.Vector2.Zero();
        if (this.board) {
            targetOffset.x = (this.board.ICenter - 5) * 4;
            targetOffset.y = (this.board.JCenter - 5) * 4;
        }
        let needLayoutUpdate = false;
        if (BABYLON.Vector2.DistanceSquared(this.cameraOffset, targetOffset) > 0) {
            let n = targetOffset.subtract(this.cameraOffset).normalize();
            let d = Math.min(this.engine.getDeltaTime() / 1000 * 10, BABYLON.Vector2.Distance(this.cameraOffset, targetOffset));
            n.scaleInPlace(d);
            this.cameraOffset.addInPlace(n);
            needLayoutUpdate = true;
        }
        if (this.ratio >= 1) {
            this.camera.orthoTop = -n * 4 - this.cameraOffset.y;
            this.camera.orthoRight = -n * 4 * this.ratio - this.cameraOffset.x;
            this.camera.orthoLeft = n * 4 * this.ratio - this.cameraOffset.x;
            this.camera.orthoBottom = n * 4 - this.cameraOffset.y;
        }
        else {
            this.camera.orthoTop = -n * 4 / this.ratio - this.cameraOffset.y;
            this.camera.orthoRight = -n * 4 - this.cameraOffset.x;
            this.camera.orthoLeft = n * 4 - this.cameraOffset.x;
            this.camera.orthoBottom = n * 4 / this.ratio - this.cameraOffset.y;
        }
        if (needLayoutUpdate) {
            this.board.updateShapesTextPosition();
        }
    }
    centerMainMenu() {
        let w = this.canvas.clientWidth * 0.6;
        if (w < 400) {
            w = this.canvas.clientWidth;
        }
        let left = (this.canvas.clientWidth - w) * 0.5;
        this.mainMenuContainer.style.width = w.toFixed(0) + "px";
        this.mainMenuContainer.style.left = left.toFixed(0) + "px";
        this.endGamePanel.style.width = w.toFixed(0) + "px";
        this.endGamePanel.style.left = left.toFixed(0) + "px";
        this.tutorialPanel.style.width = w.toFixed(0) + "px";
        this.tutorialPanel.style.left = left.toFixed(0) + "px";
    }
    showMainMenu() {
        this.mainMenuContainer.style.display = "block";
        this.hideEndGame();
        this.hideTutorialPanel();
    }
    hideMainMenu() {
        this.mainMenuContainer.style.display = "none";
    }
    showEndGame(result, subvictory = false) {
        this.hideTutorialPanel();
        if (result === 0) {
            document.getElementById("end-game-result").innerText = "you win ! :)";
            if (subvictory) {
                document.getElementById("end-game-note").innerText = "- with best 4 tiles line";
            }
            else {
                document.getElementById("end-game-note").innerText = "- with 5 tiles in line";
            }
        }
        if (result === 1) {
            document.getElementById("end-game-result").innerText = "you loose... :(";
            if (subvictory) {
                document.getElementById("end-game-note").innerText = "- AI has best 4 tiles line";
            }
            else {
                document.getElementById("end-game-note").innerText = "- AI has 5 tiles in line";
            }
        }
        if (result === 2) {
            document.getElementById("end-game-result").innerText = "draw";
            document.getElementById("end-game-note").innerText = "";
        }
        this.endGamePanel.style.display = "block";
    }
    hideEndGame() {
        this.endGamePanel.style.display = "none";
    }
    showTutorialPanel(index = 0) {
        this.tutorialPanel.style.display = "block";
        for (let i = 0; i < 5; i++) {
            document.getElementById("tutorial-img-" + i).style.display = i === index ? "inline" : "none";
            document.getElementById("tutorial-txt-" + i).style.display = i === index ? "block" : "none";
        }
        if (index === 0) {
            document.getElementById("tutorial-back").onpointerup = () => {
                this.showMainMenu();
            };
        }
        else {
            document.getElementById("tutorial-back").onpointerup = () => {
                this.showTutorialPanel(index - 1);
            };
        }
        if (index === 4) {
            document.getElementById("tutorial-next").onpointerup = () => {
                this.showMainMenu();
            };
        }
        else {
            document.getElementById("tutorial-next").onpointerup = () => {
                this.showTutorialPanel(index + 1);
            };
        }
        this.hideMainMenu();
        this.hideEndGame();
    }
    hideTutorialPanel() {
        this.tutorialPanel.style.display = "none";
    }
    xToLeft(x) {
        return (x + this.camera.orthoLeft) / this.sceneWidth;
    }
    zToBottom(z) {
        return (z + this.camera.orthoBottom) / this.sceneHeight;
    }
    get sceneWidth() {
        return this.camera.orthoLeft - this.camera.orthoRight;
    }
    get sceneHeight() {
        return this.camera.orthoBottom - this.camera.orthoTop;
    }
    async initializeScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 10, 0), this.scene);
        this.camera.rotation.x = Math.PI / 2 - 0.1;
        this.camera.rotation.z = Math.PI;
        this.camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        this.resize();
        new BABYLON.DirectionalLight("light", BABYLON.Vector3.Down(), this.scene);
        window.onresize = () => {
            this.resize();
        };
        BABYLON.Engine.ShadersRepository = "./shaders/";
        this.scene.clearColor = BABYLON.Color4.FromHexString("#00000000");
        this.board = new Board(this);
        let pickPlane = BABYLON.MeshBuilder.CreateGround("pick-plane", { width: 50, height: 50 }, this.scene);
        pickPlane.isVisible = false;
        /*
        let aiDepth = 1;

        let playSolo = false;
        this.scene.onPointerObservable.add((eventData: BABYLON.PointerInfo) => {
            let pick = this.scene.pick(this.scene.pointerX, this.scene.pointerY, (m) => { return m === pickPlane; });
            if (pick && pick.pickedPoint) {
                let cell = this.cellNetwork.worldPosToCell(pick.pickedPoint);
                if (cell.canRotate()) {
                    this.setPickedCell(cell);
                }
            }
            let reverse = false;
            if (this.pickedCell && pick.pickedPoint) {
                reverse = this.pickedCell.barycenter3D.x < pick.pickedPoint.x;
            }
            this.selected.reverse = reverse;
            if (eventData.type === BABYLON.PointerEventTypes.POINTERUP) {
                if (this.pickedCell) {
                    this.cellNetwork.morphCell(
                        0,
                        this.pickedCell,
                        reverse,
                        () => {
                            this.cellNetwork.checkSurround(
                                () => {
                                    scoreDisplay.update();
                                    if (playSolo) {
                                        return;
                                    }
                                    let aiMove = ai.getMove2(2, aiDepth);
                                    if (aiMove.cell) {
                                        this.cellNetwork.morphCell(
                                            2,
                                            aiMove.cell,
                                            aiMove.reverse,
                                            () => {
                                                this.cellNetwork.checkSurround(
                                                    () => {
                                                        scoreDisplay.update();
                                                    }
                                                );
                                            }
                                        );
                                    }
                                }
                            );
                        }
                    );
                }
            }
        })
        */
    }
    initializeMainMenu() {
        document.getElementById("open-tutorial").addEventListener("pointerup", () => {
            this.showTutorialPanel();
        });
        document.getElementById("level-solo").addEventListener("pointerup", () => {
            this.currentLevel = new LevelRandomSolo(this);
            this.currentLevel.initialize();
        });
        document.getElementById("level-solo").addEventListener("pointerup", () => {
            this.currentLevel = new LevelRandomSolo(this);
            this.currentLevel.initialize();
        });
        document.getElementById("level-vs-ai-easy").addEventListener("pointerup", () => {
            this.currentLevel = new LevelHumanVsAI(this);
            this.currentLevel.aggroAI = 0;
            this.currentLevel.initialize();
        });
        document.getElementById("level-vs-ai").addEventListener("pointerup", () => {
            this.currentLevel = new LevelHumanVsAI(this);
            this.currentLevel.initialize();
        });
        document.getElementById("level-vs-ai-hard").addEventListener("pointerup", () => {
            this.currentLevel = new LevelHumanVsAI(this);
            this.currentLevel.aggroAI = 1.5;
            this.currentLevel.initialize();
        });
        document.getElementById("end-game-back").addEventListener("pointerup", () => {
            if (this.currentLevel) {
                this.currentLevel.dispose();
            }
            this.showMainMenu();
        });
        document.getElementById("coder").addEventListener("pointerup", () => {
            window.open("https://svenfrankson.github.io/");
        });
        document.getElementById("author").addEventListener("pointerup", () => {
            window.open("https://fr.wikipedia.org/wiki/Bernhard_Weber");
        });
        document.getElementById("owner").addEventListener("pointerup", () => {
            window.open("https://www.gamefactory-spiele.com/punto");
        });
        this.showMainMenu();
        // debug
        //this.showEndGame(Math.floor(Math.random() * 3), Math.random() > 0.5);
    }
    animate() {
        this.engine.runRenderLoop(() => {
            this.resizeCamera();
            this.scene.render();
        });
        window.addEventListener("resize", () => {
            this.engine.resize();
        });
    }
}
window.addEventListener("load", async () => {
    let main = new Main("render-canvas");
    await main.initialize();
    main.animate();
});
class Math2D {
    static AreEqualsCircular(a1, a2, epsilon = Math.PI / 60) {
        while (a1 < 0) {
            a1 += 2 * Math.PI;
        }
        while (a1 >= 2 * Math.PI) {
            a1 -= 2 * Math.PI;
        }
        while (a2 < 0) {
            a2 += 2 * Math.PI;
        }
        while (a2 >= 2 * Math.PI) {
            a2 -= 2 * Math.PI;
        }
        return Math.abs(a1 - a2) < epsilon;
    }
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
    }
    static LerpFromToCircular(from, to, amount = 0.5) {
        while (to < from) {
            to += 2 * Math.PI;
        }
        while (to - 2 * Math.PI > from) {
            to -= 2 * Math.PI;
        }
        return from + (to - from) * amount;
    }
    static BissectFromTo(from, to, amount = 0.5) {
        let aFrom = Math2D.AngleFromTo(new BABYLON.Vector2(1, 0), from, true);
        let aTo = Math2D.AngleFromTo(new BABYLON.Vector2(1, 0), to, true);
        let angle = Math2D.LerpFromToCircular(aFrom, aTo, amount);
        return new BABYLON.Vector2(Math.cos(angle), Math.sin(angle));
    }
    static Dot(vector1, vector2) {
        return vector1.x * vector2.x + vector1.y * vector2.y;
    }
    static Cross(vector1, vector2) {
        return vector1.x * vector2.y - vector1.y * vector2.x;
    }
    static DistanceSquared(from, to) {
        return (from.x - to.x) * (from.x - to.x) + (from.y - to.y) * (from.y - to.y);
    }
    static Distance(from, to) {
        return Math.sqrt(Math2D.DistanceSquared(from, to));
    }
    static AngleFromTo(from, to, keepPositive = false) {
        let dot = Math2D.Dot(from, to) / from.length() / to.length();
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
    static Rotate(vector, alpha) {
        let v = vector.clone();
        Math2D.RotateInPlace(v, alpha);
        return v;
    }
    static RotateInPlace(vector, alpha) {
        let x = Math.cos(alpha) * vector.x - Math.sin(alpha) * vector.y;
        let y = Math.cos(alpha) * vector.y + Math.sin(alpha) * vector.x;
        vector.x = x;
        vector.y = y;
    }
    static get _Tmp0() {
        if (!Math2D.__Tmp0) {
            Math2D.__Tmp0 = new BABYLON.Vector2(1, 0);
        }
        return Math2D.__Tmp0;
    }
    static get _Tmp1() {
        if (!Math2D.__Tmp1) {
            Math2D.__Tmp1 = new BABYLON.Vector2(1, 0);
        }
        return Math2D.__Tmp1;
    }
    static get _Tmp2() {
        if (!Math2D.__Tmp2) {
            Math2D.__Tmp2 = new BABYLON.Vector2(1, 0);
        }
        return Math2D.__Tmp2;
    }
    static get _Tmp3() {
        if (!Math2D.__Tmp3) {
            Math2D.__Tmp3 = new BABYLON.Vector2(1, 0);
        }
        return Math2D.__Tmp3;
    }
    static PointSegmentABDistanceSquared(point, segA, segB) {
        Math2D._Tmp0.copyFrom(segB).subtractInPlace(segA).normalize();
        Math2D._Tmp1.copyFrom(point).subtractInPlace(segA);
        let projectionDistance = Math2D.Dot(Math2D._Tmp1, Math2D._Tmp0);
        if (projectionDistance < 0) {
            return Math2D.DistanceSquared(point, segA);
        }
        if (projectionDistance * projectionDistance > Math2D.DistanceSquared(segB, segA)) {
            return Math2D.DistanceSquared(point, segB);
        }
        Math2D._Tmp0.scaleInPlace(projectionDistance);
        return Math2D.Dot(Math2D._Tmp1, Math2D._Tmp1) - Math2D.Dot(Math2D._Tmp0, Math2D._Tmp0);
    }
    static PointSegmentAxAyBxByDistanceSquared(point, segAx, segAy, segBx, segBy) {
        Math2D._Tmp2.x = segAx;
        Math2D._Tmp2.y = segAy;
        Math2D._Tmp3.x = segBx;
        Math2D._Tmp3.y = segBy;
        return Math2D.PointSegmentABDistanceSquared(point, Math2D._Tmp2, Math2D._Tmp3);
    }
    static PointSegmentABUDistanceSquared(point, segA, segB, u) {
        Math2D._Tmp1.copyFrom(point).subtractInPlace(segA);
        let projectionDistance = Math2D.Dot(Math2D._Tmp1, u);
        if (projectionDistance < 0) {
            return Math2D.DistanceSquared(point, segA);
        }
        if (projectionDistance * projectionDistance > Math2D.DistanceSquared(segB, segA)) {
            return Math2D.DistanceSquared(point, segB);
        }
        Math2D._Tmp0.copyFrom(u).scaleInPlace(projectionDistance);
        return Math2D.Dot(Math2D._Tmp1, Math2D._Tmp1) - Math2D.Dot(Math2D._Tmp0, Math2D._Tmp0);
    }
    static IsPointInSegment(point, segA, segB) {
        if ((point.x - segA.x) * (segB.x - segA.x) + (point.y - segA.y) * (segB.y - segA.y) < 0) {
            return false;
        }
        if ((point.x - segB.x) * (segA.x - segB.x) + (point.y - segB.y) * (segA.y - segB.y) < 0) {
            return false;
        }
        return true;
    }
    static IsPointInRay(point, rayOrigin, rayDirection) {
        if ((point.x - rayOrigin.x) * rayDirection.x + (point.y - rayOrigin.y) * rayDirection.y < 0) {
            return false;
        }
        return true;
    }
    static IsPointInRegion(point, region) {
        let count = 0;
        let randomDir = Math.random() * Math.PI * 2;
        Math2D._Tmp0.x = Math.cos(randomDir);
        Math2D._Tmp0.y = Math.sin(randomDir);
        for (let i = 0; i < region.length; i++) {
            Math2D._Tmp1.x = region[i][0];
            Math2D._Tmp1.y = region[i][1];
            Math2D._Tmp2.x = region[(i + 1) % region.length][0];
            Math2D._Tmp2.y = region[(i + 1) % region.length][1];
            if (Math2D.RaySegmentIntersection(point, Math2D._Tmp0, Math2D._Tmp1, Math2D._Tmp2)) {
                count++;
            }
        }
        return count % 2 === 1;
    }
    static IsPointInPath(point, path) {
        let count = 0;
        let randomDir = Math.random() * Math.PI * 2;
        Math2D._Tmp0.x = Math.cos(randomDir);
        Math2D._Tmp0.y = Math.sin(randomDir);
        for (let i = 0; i < path.length; i++) {
            if (Math2D.RaySegmentIntersection(point, Math2D._Tmp0, path[i], path[(i + 1) % path.length])) {
                count++;
            }
        }
        return count % 2 === 1;
    }
    static SegmentShapeIntersection(segA, segB, shape) {
        let intersections = [];
        for (let i = 0; i < shape.length; i++) {
            let shapeA = shape[i];
            let shapeB = shape[(i + 1) % shape.length];
            let intersection = Math2D.SegmentSegmentIntersection(segA, segB, shapeA, shapeB);
            if (intersection) {
                intersections.push(intersection);
            }
        }
        return intersections;
    }
    static FattenShrinkPointShape(shape, distance) {
        let newShape = [];
        let edgesDirs = [];
        for (let i = 0; i < shape.length; i++) {
            let p = shape[i];
            let pNext = shape[(i + 1) % shape.length];
            edgesDirs[i] = pNext.subtract(p).normalize();
        }
        for (let i = 0; i < shape.length; i++) {
            let p = shape[i];
            let edgeDir = edgesDirs[i];
            let edgeDirPrev = edgesDirs[(i - 1 + shape.length) % shape.length];
            let bissection = Math2D.BissectFromTo(edgeDirPrev.scale(-1), edgeDir, 0.5);
            newShape[i] = p.add(bissection.scaleInPlace(distance));
        }
        return newShape;
    }
    static FattenShrinkEdgeShape(shape, distance) {
        let newShape = [];
        let edgesNormals = [];
        let edgesDirs = [];
        for (let i = 0; i < shape.length; i++) {
            let p = shape[i];
            let pNext = shape[(i + 1) % shape.length];
            edgesDirs[i] = pNext.subtract(p).normalize();
            edgesNormals[i] = Math2D.Rotate(edgesDirs[i], -Math.PI / 2).scaleInPlace(distance);
        }
        for (let i = 0; i < shape.length; i++) {
            let p = shape[i];
            let pNext = shape[(i + 1) % shape.length];
            let edgeDir = edgesDirs[i];
            let edgeDirNext = edgesDirs[(i + 1) % shape.length];
            p = p.add(edgesNormals[i]);
            pNext = pNext.add(edgesNormals[(i + 1) % shape.length]);
            if (Math.abs(Math2D.Cross(edgeDir, edgeDirNext)) < 0.01) {
                newShape[i] = pNext;
            }
            else {
                let newP = Math2D.LineLineIntersection(p, edgeDir, pNext, edgeDirNext);
                if (newP) {
                    newShape[i] = newP;
                }
                else {
                    newShape[i] = p;
                    console.warn("Oups 2");
                }
            }
        }
        return newShape;
    }
    static CatmullRomPath(path) {
        let interpolatedPoints = [];
        for (let i = 0; i < path.length; i++) {
            let p0 = path[(i - 1 + path.length) % path.length];
            let p1 = path[i];
            let p2 = path[(i + 1) % path.length];
            let p3 = path[(i + 2) % path.length];
            interpolatedPoints.push(BABYLON.Vector2.CatmullRom(p0, p1, p2, p3, 0.5));
        }
        for (let i = 0; i < interpolatedPoints.length; i++) {
            path.splice(2 * i + 1, 0, interpolatedPoints[i]);
        }
    }
    static Smooth(points, s = 6) {
        let newpoints = [];
        for (let i = 0; i < points.length; i++) {
            let next = points[(i + 1) % points.length];
            newpoints.push(points[i], points[i].add(next).scaleInPlace(0.5));
        }
        points = newpoints;
        newpoints = [];
        for (let i = 0; i < points.length; i++) {
            let prev = points[(i - 1 + points.length) % points.length];
            let p = points[i];
            let next = points[(i + 1) % points.length];
            newpoints[i] = prev.add(p.scale(s)).add(next).scaleInPlace(1 / (s + 2));
        }
        return newpoints;
    }
    /*
    public static IsPointInShape(point: BABYLON.Vector2, shape: IShape): boolean {
        for (let i = 0; i < shape.regions.length; i++) {
            let region = shape.regions[i];
            if (Math2D.IsPointInRegion(point, region)) {
                return true;
            }
        }
        return false;
    }
    */
    static RayRayIntersection(ray1Origin, ray1Direction, ray2Origin, ray2Direction) {
        let x1 = ray1Origin.x;
        let y1 = ray1Origin.y;
        let x2 = x1 + ray1Direction.x;
        let y2 = y1 + ray1Direction.y;
        let x3 = ray2Origin.x;
        let y3 = ray2Origin.y;
        let x4 = x3 + ray2Direction.x;
        let y4 = y3 + ray2Direction.y;
        let det = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (det !== 0) {
            let x = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4);
            let y = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4);
            let intersection = new BABYLON.Vector2(x / det, y / det);
            if (Math2D.IsPointInRay(intersection, ray1Origin, ray1Direction)) {
                if (Math2D.IsPointInRay(intersection, ray2Origin, ray2Direction)) {
                    return intersection;
                }
            }
        }
        return undefined;
    }
    static LineLineIntersection(line1Origin, line1Direction, line2Origin, line2Direction) {
        let x1 = line1Origin.x;
        let y1 = line1Origin.y;
        let x2 = x1 + line1Direction.x;
        let y2 = y1 + line1Direction.y;
        let x3 = line2Origin.x;
        let y3 = line2Origin.y;
        let x4 = x3 + line2Direction.x;
        let y4 = y3 + line2Direction.y;
        let det = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (det !== 0) {
            let x = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4);
            let y = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4);
            return new BABYLON.Vector2(x / det, y / det);
        }
        return undefined;
    }
    static RaySegmentIntersection(rayOrigin, rayDirection, segA, segB) {
        let x1 = rayOrigin.x;
        let y1 = rayOrigin.y;
        let x2 = x1 + rayDirection.x;
        let y2 = y1 + rayDirection.y;
        let x3 = segA.x;
        let y3 = segA.y;
        let x4 = segB.x;
        let y4 = segB.y;
        let det = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (det !== 0) {
            let x = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4);
            let y = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4);
            let intersection = new BABYLON.Vector2(x / det, y / det);
            if (Math2D.IsPointInRay(intersection, rayOrigin, rayDirection)) {
                if (Math2D.IsPointInSegment(intersection, segA, segB)) {
                    return intersection;
                }
            }
        }
        return undefined;
    }
    static SegmentSegmentIntersection(seg1A, seg1B, seg2A, seg2B) {
        let x1 = seg1A.x;
        let y1 = seg1A.y;
        let x2 = seg1B.x;
        let y2 = seg1B.y;
        let x3 = seg2A.x;
        let y3 = seg2A.y;
        let x4 = seg2B.x;
        let y4 = seg2B.y;
        let det = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (det !== 0) {
            let x = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4);
            let y = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4);
            let intersection = new BABYLON.Vector2(x / det, y / det);
            if (Math2D.IsPointInSegment(intersection, seg1A, seg1B)) {
                if (Math2D.IsPointInSegment(intersection, seg2A, seg2B)) {
                    return intersection;
                }
            }
        }
        return undefined;
    }
    static PointRegionDistanceSquared(point, region) {
        let minimalSquaredDistance = Infinity;
        for (let i = 0; i < region.length; i++) {
            Math2D._Tmp1.x = region[i][0];
            Math2D._Tmp1.y = region[i][1];
            Math2D._Tmp2.x = region[(i + 1) % region.length][0];
            Math2D._Tmp2.y = region[(i + 1) % region.length][1];
            let distSquared = Math2D.PointSegmentAxAyBxByDistanceSquared(point, region[i][0], region[i][1], region[(i + 1) % region.length][0], region[(i + 1) % region.length][1]);
            minimalSquaredDistance = Math.min(minimalSquaredDistance, distSquared);
        }
        return minimalSquaredDistance;
    }
}
Math2D.AxisX = new BABYLON.Vector2(1, 0);
Math2D.AxisY = new BABYLON.Vector2(0, 1);
class Tile {
    constructor(i, j, board) {
        this.i = i;
        this.j = j;
        this.board = board;
        this.color = -1;
        this.value = 0;
        this.isInRange = true;
        this.isPlayable = false;
        this.isNextToPlayable = false;
        this.selected = false;
        this.points = [
            new BABYLON.Vector2(-2, -2),
            new BABYLON.Vector2(2, -2),
            new BABYLON.Vector2(2, 2),
            new BABYLON.Vector2(-2, 2)
        ];
    }
    clone() {
        let clonedTile = new Tile(this.i, this.j, this.board);
        clonedTile.color = this.color;
        clonedTile.value = this.value;
        clonedTile.isInRange = this.isInRange;
        clonedTile.isPlayable = this.isPlayable;
        clonedTile.isNextToPlayable = this.isNextToPlayable;
        return clonedTile;
    }
    reset() {
        this.color = -1;
        this.value = 0;
        this.isInRange = true;
        this.isPlayable = false;
        this.isNextToPlayable = false;
        this.selected = false;
    }
    dispose() {
        if (this.shape) {
            this.shape.dispose();
            this.shape = undefined;
        }
        if (this.text) {
            document.body.removeChild(this.text);
            this.text = undefined;
        }
    }
    hide() {
        if (this.shape) {
            this.shape.isVisible = false;
        }
    }
    get shapePosition() {
        if (this.shape) {
            return this.shape.position;
        }
        return BABYLON.Vector3.Zero();
    }
    resetShapePosition() {
        if (this.shape) {
            this.shape.position.copyFromFloats((this.i - 5) * 4, 0, (this.j - 5) * 4);
        }
    }
    updateTextPosition() {
        if (this.shape && this.text) {
            this.text.style.left = (this.board.main.xToLeft(this.shape.position.x) * 100).toFixed(2) + "%";
            this.text.style.bottom = (this.board.main.zToBottom(this.shape.position.z - 2) * 100).toFixed(2) + "%";
        }
    }
    updateShape(points = this.points) {
        if (!this.shape) {
            this.shape = new BABYLON.Mesh("shape_" + this.i + "_" + this.j);
            this.shape.position.x = (this.i - 5) * 4;
            this.shape.position.z = (this.j - 5) * 4;
            /*
            let material = new BABYLON.StandardMaterial("shape-material", this.network.main.scene);
            material.diffuseColor.copyFromFloats(1, 1, 1);
            material.specularColor.copyFromFloats(0, 0, 0);
            this.shape.material = material;
            */
            let material = new ToonMaterial("shape-material", false, this.board.main.scene);
            this.shape.material = material;
        }
        if (!this.text) {
            this.text = document.createElement("div");
            document.body.appendChild(this.text);
            this.text.classList.add("tile-text");
        }
        this.updateTextPosition();
        if (this.value === 0) {
            this.text.innerText = "";
        }
        else {
            this.text.innerText = this.value.toFixed(0);
        }
        if (true) {
            if (!this.isInRange || (!this.isPlayable && !this.isNextToPlayable)) {
                this.shape.isVisible = false;
                return;
            }
            this.shape.isVisible = true;
            let dOut = this.selected ? -0.1 : 0.1;
            let dIn = this.selected ? 0.6 : 0.8;
            let lineOut = Math2D.FattenShrinkEdgeShape(points, -dOut);
            let lineIn = Math2D.FattenShrinkEdgeShape(points, -dIn);
            lineOut = Math2D.Smooth(lineOut, 7);
            lineOut = Math2D.Smooth(lineOut, 5);
            lineOut = Math2D.Smooth(lineOut, 3);
            lineIn = Math2D.Smooth(lineIn, 7);
            lineIn = Math2D.Smooth(lineIn, 5);
            lineIn = Math2D.Smooth(lineIn, 3);
            let c;
            if (this.color < 0) {
                if (this.isPlayable) {
                    c = new BABYLON.Color4(0.8, 0.8, 0.8, 1);
                }
                else {
                    c = new BABYLON.Color4(0.3, 0.3, 0.3, 1);
                }
            }
            else {
                c = Tile.Colors[this.color];
            }
            let data = new BABYLON.VertexData();
            let positions = [0, 0, 0];
            let normals = [0, 1, 0];
            let indices = [];
            let colors = [c.r, c.g, c.b, 1];
            let l = lineIn.length;
            for (let i = 0; i < lineIn.length; i++) {
                positions.push(lineIn[i].x, 0, lineIn[i].y);
                normals.push(0, 1, 0);
                colors.push(c.r, c.g, c.b, 1);
                if (i != lineIn.length - 1) {
                    indices.push(0, i + 1, i + 2);
                }
                else {
                    indices.push(0, i + 1, 1);
                }
            }
            for (let i = 0; i < lineOut.length; i++) {
                positions.push(lineOut[i].x, 0, lineOut[i].y);
                let n = (lineOut[i].x) * (lineOut[i].x) + (lineOut[i].y) * (lineOut[i].y);
                n = Math.sqrt(n);
                normals.push((lineOut[i].x) / n, 0, (lineOut[i].y) / n);
                colors.push(c.r, c.g, c.b, 1);
                if (i != lineOut.length - 1) {
                    indices.push(i + l + 1, i + 2, i + 1);
                    indices.push(i + 2, i + l + 1, i + l + 2);
                }
                else {
                    indices.push(i + l + 1, 1, i + 1);
                    indices.push(1, i + l + 1, l + 1);
                }
            }
            data.positions = positions;
            data.normals = normals;
            data.indices = indices;
            data.colors = colors;
            data.applyToMesh(this.shape);
        }
    }
}
Tile.Colors = [
    BABYLON.Color4.FromHexString("#0ABB07FF"),
    BABYLON.Color4.FromHexString("#070ABBFF"),
    BABYLON.Color4.FromHexString("#FFC800FF"),
    BABYLON.Color4.FromHexString("#FF1900FF")
];
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
    set(i, e) {
        this._elements[i] = e;
    }
    getLast() {
        return this.get(this.length - 1);
    }
    push(e) {
        if (this._elements.indexOf(e) === -1) {
            this._elements.push(e);
        }
    }
    pop() {
        return this._elements.pop();
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
    sort(sortFunction) {
        this._elements = this._elements.sort(sortFunction);
    }
    forEach(callbackfn) {
        this._elements.forEach(callbackfn);
    }
    array() {
        return this._elements;
    }
}
class VMath {
    // Method adapted from gre's work (https://github.com/gre/bezier-easing). Thanks !
    static easeOutElastic(t, b = 0, c = 1, d = 1) {
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t == 0) {
            return b;
        }
        if ((t /= d) == 1) {
            return b + c;
        }
        if (!p) {
            p = d * .3;
        }
        if (a < Math.abs(c)) {
            a = c;
            s = p / 4;
        }
        else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
    }
    static easeInOutCirc(x) {
        return x < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
    }
    static easeOutBack(x) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    }
    static easeOutQuart(x) {
        return 1 - Math.pow(1 - x, 4);
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
        let angle = Math.acos(BABYLON.Vector3.Dot(pFrom, pTo));
        if (BABYLON.Vector3.Dot(BABYLON.Vector3.Cross(pFrom, pTo), around) < 0) {
            angle = -angle;
        }
        return angle;
    }
    static StepAngle(from, to, step) {
        while (from < 0) {
            from += 2 * Math.PI;
        }
        while (to < 0) {
            to += 2 * Math.PI;
        }
        while (from >= 2 * Math.PI) {
            from -= 2 * Math.PI;
        }
        while (to >= 2 * Math.PI) {
            to -= 2 * Math.PI;
        }
        if (Math.abs(from - to) <= step) {
            return to;
        }
        if (to < from) {
            step *= -1;
        }
        if (Math.abs(from - to) > Math.PI) {
            step *= -1;
        }
        return from + step;
    }
    static LerpAngle(from, to, t) {
        while (from < 0) {
            from += 2 * Math.PI;
        }
        while (to < 0) {
            to += 2 * Math.PI;
        }
        while (from >= 2 * Math.PI) {
            from -= 2 * Math.PI;
        }
        while (to >= 2 * Math.PI) {
            to -= 2 * Math.PI;
        }
        if (Math.abs(from - to) > Math.PI) {
            if (from > Math.PI) {
                from -= 2 * Math.PI;
            }
            else {
                to -= 2 * Math.PI;
            }
        }
        return from * (1 - t) + to * t;
    }
    static AngularDistance(from, to) {
        while (from < 0) {
            from += 2 * Math.PI;
        }
        while (to < 0) {
            to += 2 * Math.PI;
        }
        while (from >= 2 * Math.PI) {
            from -= 2 * Math.PI;
        }
        while (to >= 2 * Math.PI) {
            to -= 2 * Math.PI;
        }
        let d = Math.abs(from - to);
        if (d > Math.PI) {
            d *= -1;
        }
        if (to < from) {
            d *= -1;
        }
        return d;
    }
    static CatmullRomPath(path) {
        let interpolatedPoints = [];
        for (let i = 0; i < path.length; i++) {
            let p0 = path[(i - 1 + path.length) % path.length];
            let p1 = path[i];
            let p2 = path[(i + 1) % path.length];
            let p3 = path[(i + 2) % path.length];
            interpolatedPoints.push(BABYLON.Vector3.CatmullRom(p0, p1, p2, p3, 0.5));
        }
        for (let i = 0; i < interpolatedPoints.length; i++) {
            path.splice(2 * i + 1, 0, interpolatedPoints[i]);
        }
    }
    static SetABDistance(a, b, dist) {
        let n = b.subtract(a);
        n.normalize().scaleInPlace(dist);
        return a.add(n);
    }
    static SetABDistanceInPlace(a, b, dist, keepAInPlace) {
        let n = b.subtract(a);
        let l = n.length();
        n.normalize();
        if (keepAInPlace) {
            b.copyFrom(n).scaleInPlace(dist).addInPlace(a);
        }
        else {
            let d = (l - dist) * 0.5;
            n.scaleInPlace(d);
            a.addInPlace(n);
            b.subtractInPlace(n);
        }
    }
}
class Level {
    constructor(main) {
        this.main = main;
        this._update = () => {
            this.update();
        };
    }
    initialize() {
        this.main.hideMainMenu();
        this.main.scene.onBeforeRenderObservable.add(this._update);
        this.main.board.updateShapes();
    }
    update() {
    }
    dispose() {
        this.main.showMainMenu();
        this.main.scene.onBeforeRenderObservable.removeCallback(this._update);
        this.main.board.reset();
        this.main.board.hide();
    }
}
Level.MAX_CARD_VALUE = 9;
class LevelPlayer extends Level {
    constructor(main) {
        super(main);
        this.pickedCard = -1;
        this.hand0I = 12;
        this.hand0J = 5;
        this.hand1I = 13;
        this.hand1J = 5;
        this._pointerEvent = (eventData) => {
            return this.pointerEvent(eventData);
        };
    }
    initialize() {
        super.initialize();
        if (this.main.ratio < 1) {
            this.hand0I = 10;
            this.hand0J = -2;
            this.hand1I = 9;
            this.hand1J = -2;
        }
        this.deckPlayer = new Deck(this.main.board);
        this.makePlayerDeck();
        this.deckPlayer.hand[0].i = this.hand0I;
        this.deckPlayer.hand[0].j = this.hand0J;
        this.deckPlayer.hand[0].isPlayable = true;
        this.deckPlayer.hand[1].i = this.hand1I;
        this.deckPlayer.hand[1].j = this.hand1J;
        this.deckPlayer.hand[1].isPlayable = true;
        this.deckPlayer.shuffle();
        this.deckPlayer.draw();
        this.main.board.updateShapes();
        this.main.scene.onPointerObservable.add(this._pointerEvent);
    }
    pointerEvent(eventData) {
        if (eventData.type === BABYLON.PointerEventTypes.POINTERDOWN) {
            console.log("Alpha");
            if (eventData.pickInfo.pickedMesh) {
                console.log("Bravo " + eventData.pickInfo.pickedMesh.name);
                if (eventData.pickInfo.pickedMesh.name === "shape_" + this.hand0I.toFixed(0) + "_" + this.hand0J.toFixed(0)) {
                    console.log("Charly");
                    this.pickedCard = 0;
                    this.deckPlayer.hand[0].selected = true;
                    this.deckPlayer.hand[0].updateShape();
                    this.deckPlayer.hand[1].selected = false;
                    this.deckPlayer.hand[1].updateShape();
                }
                else if (eventData.pickInfo.pickedMesh.name === "shape_" + this.hand1I.toFixed(0) + "_" + this.hand1J.toFixed(0)) {
                    this.pickedCard = 1;
                    this.deckPlayer.hand[0].selected = false;
                    this.deckPlayer.hand[0].updateShape();
                    this.deckPlayer.hand[1].selected = true;
                    this.deckPlayer.hand[1].updateShape();
                }
            }
        }
        else if (eventData.type === BABYLON.PointerEventTypes.POINTERUP) {
            if (eventData.pickInfo.pickedMesh) {
                let split = eventData.pickInfo.pickedMesh.name.split("_");
                if (split.length === 3) {
                    let i = parseInt(split[1]);
                    let j = parseInt(split[2]);
                    if (isFinite(i) && isFinite(j)) {
                        let value = 0;
                        let color = -1;
                        let pickedTile = this.deckPlayer.hand[this.pickedCard];
                        if (pickedTile) {
                            value = pickedTile.value;
                            color = pickedTile.color;
                        }
                        if (this.main.board.play(0, color, value, i, j)) {
                            pickedTile.reset();
                            pickedTile.isPlayable = true;
                            this.pickedCard = -1;
                            this.deckPlayer.draw();
                        }
                    }
                }
            }
        }
    }
    update() {
        this.deckPlayer.hand[0].shapePosition.x = -this.main.camera.orthoRight - 4;
        this.deckPlayer.hand[0].shapePosition.z = -this.main.camera.orthoBottom + 4;
        this.deckPlayer.hand[1].shapePosition.x = -this.main.camera.orthoRight - 4;
        this.deckPlayer.hand[1].shapePosition.z = -this.main.camera.orthoBottom + 8;
        this.deckPlayer.updateShape();
        if (this.main.board.activePlayer === 0 && this.deckPlayer.hand[0].value === 0 && this.deckPlayer.hand[1].value === 0) {
            let subVictor = this.main.board.checkSubVictor();
            if (subVictor === -1) {
                this.main.showEndGame(2);
            }
            else {
                this.main.showEndGame(Math.floor(subVictor * 0.5), true);
            }
        }
    }
    dispose() {
        super.dispose();
        this.main.scene.onPointerObservable.removeCallback(this._pointerEvent);
        this.deckPlayer.hand.forEach(t => {
            t.dispose();
        });
        delete this.deckPlayer;
    }
}
/// <reference path="LevelPlayer.ts"/>
class LevelHumanVsAI extends LevelPlayer {
    constructor(main) {
        super(main);
        this.aggroAI = 1;
        /*
        public update(): void {
            if (this.main.board.activePlayer === 1) {
                let playableTiles: Tile[] = [];
                for (let i = 0; i < 11; i++) {
                    for (let j = 0; j < 11; j++) {
                        let t = this.main.board.tiles[i][j];
                        if (t.isPlayable && t.isInRange && t.color < 2) {
                            playableTiles.push(t);
                        }
                    }
                }
                ArrayUtils.shuffle(playableTiles);
                let bestN: number;
                let bestTile: Tile;
                let bestValue = - Infinity;
                for (let i = 0; i < playableTiles.length; i++) {
                    for (let n = 0; n < 2; n++) {
                        let card = this.deckAI.hand[n];
                        if (card.value > playableTiles[i].value) {
                            let value = playableTiles[i].value - card.value;
                            if (value > bestValue) {
                                bestValue = value;
                                bestN = n;
                                bestTile = playableTiles[i];
                            }
                        }
                    }
                }
                if (isFinite(bestValue)) {
                    let card = this.deckAI.hand[bestN];
                    if (this.main.board.play(1, card.color, card.value, bestTile.i, bestTile.j)) {
                        card.color = - 1;
                        card.value = 0;
                        this.deckAI.draw();
                        this.deckAI.updateShape();
                        return;
                    }
                }
            }
        }
        */
        this.lock = false;
    }
    initialize() {
        super.initialize();
        this.main.board.playerCount = 2;
        this.deckAI = new Deck(this.main.board);
        this.makeAIDeck();
        this.deckAI.hand[0].i = -10;
        this.deckAI.hand[0].j = 10;
        this.deckAI.hand[0].isPlayable = true;
        this.deckAI.hand[1].i = -10;
        this.deckAI.hand[1].j = 10;
        this.deckAI.hand[1].isPlayable = true;
        this.deckAI.shuffle();
        this.deckAI.draw();
        this.deckAI.updateShape();
    }
    makePlayerDeck() {
        for (let c = 0; c < 2; c++) {
            for (let v = 1; v <= Level.MAX_CARD_VALUE; v++) {
                for (let n = 0; n < 2; n++) {
                    let card = new Card(v, c);
                    this.deckPlayer.cards.push(card);
                }
            }
        }
    }
    makeAIDeck() {
        for (let c = 2; c < 4; c++) {
            for (let v = 1; v <= Level.MAX_CARD_VALUE; v++) {
                for (let n = 0; n < 2; n++) {
                    let card = new Card(v, c);
                    this.deckAI.cards.push(card);
                }
            }
        }
    }
    update() {
        super.update();
        if (this.main.board.activePlayer === 1 && !this.lock) {
            let cloneTiles = this.main.board.cloneTiles();
            let playableTiles = [];
            for (let i = 0; i < 11; i++) {
                for (let j = 0; j < 11; j++) {
                    let t = cloneTiles[i][j];
                    if (t.isPlayable && t.isInRange && t.color < 2) {
                        playableTiles.push(t);
                    }
                }
            }
            ArrayUtils.shuffle(playableTiles);
            let bestN;
            let bestTile;
            let bestValue = -Infinity;
            for (let i = 0; i < playableTiles.length; i++) {
                for (let n = 0; n < 2; n++) {
                    let card = this.deckAI.hand[n];
                    if (card.value > playableTiles[i].value) {
                        let prevColor = playableTiles[i].color;
                        let prevValue = playableTiles[i].value;
                        playableTiles[i].color = card.color;
                        playableTiles[i].value = card.value;
                        let value = this.main.board.computeBoardValueForColor(card.color, cloneTiles);
                        value += this.main.board.computeBoardValueForColor(card.color === 2 ? 3 : 2, cloneTiles) * 0.1;
                        value -= this.main.board.computeBoardValueForColor(0, cloneTiles) * this.aggroAI;
                        value -= this.main.board.computeBoardValueForColor(1, cloneTiles) * this.aggroAI;
                        if (value > bestValue) {
                            bestValue = value;
                            bestN = n;
                            bestTile = playableTiles[i];
                        }
                        playableTiles[i].color = prevColor;
                        playableTiles[i].value = prevValue;
                    }
                }
            }
            if (isFinite(bestValue)) {
                console.log(bestValue);
                let card = this.deckAI.hand[bestN];
                this.lock = true;
                this.aiPlayAnimation(bestN, bestTile.i, bestTile.j, () => {
                    if (this.main.board.play(1, card.color, card.value, bestTile.i, bestTile.j)) {
                        this.lock = false;
                        card.color = -1;
                        card.value = 0;
                        this.deckAI.draw();
                        this.deckAI.updateShape();
                        return;
                    }
                });
            }
            else {
                debugger;
            }
        }
    }
    aiPlayAnimation(cardIndex, targetI, targetJ, callback) {
        let p0 = this.deckAI.hand[cardIndex].shapePosition.clone();
        p0.y += 0.5;
        let p1 = this.main.board.tiles[targetI][targetJ].shapePosition.clone();
        p1.y += 0.5;
        let t = 0;
        let duration = 0.8;
        let step = () => {
            t += this.main.engine.getDeltaTime() / 1000;
            let dt = t / duration;
            if (dt >= 1) {
                this.deckAI.hand[cardIndex].resetShapePosition();
                callback();
            }
            else {
                this.deckAI.hand[cardIndex].shapePosition.copyFrom(p0).scaleInPlace(1 - dt).addInPlace(p1.scale(dt));
                requestAnimationFrame(step);
            }
        };
        step();
    }
    dispose() {
        super.dispose();
        this.deckAI.hand.forEach(t => {
            console.log("Deck AI Dispose Tile");
            t.dispose();
        });
    }
}
class LevelHumanVsAIEasy extends LevelHumanVsAI {
    constructor() {
        super(...arguments);
        this.lock = false;
    }
    update() {
        super.update();
        if (this.main.board.activePlayer === 1 && !this.lock) {
            for (let i = 0; i < 1000; i++) {
                let n = Math.floor(Math.random() * 2);
                let card = this.deckAI.hand[n];
                if (card.value > 0) {
                    let I = Math.floor(Math.random() * 11);
                    let J = Math.floor(Math.random() * 11);
                    let currentBoardTile = this.main.board.tiles[I][J];
                    if (currentBoardTile.isInRange && currentBoardTile.isPlayable) {
                        if (currentBoardTile.color < 2 && currentBoardTile.value < card.value) {
                            this.lock = true;
                            return this.aiPlayAnimation(n, I, J, () => {
                                if (this.main.board.play(1, card.color, card.value, I, J)) {
                                    this.lock = false;
                                    card.color = -1;
                                    card.value = 0;
                                    this.deckAI.draw();
                                    this.deckAI.updateShape();
                                }
                            });
                        }
                    }
                }
            }
        }
    }
}
class LevelRandomAIVsAI extends Level {
    constructor(main) {
        super(main);
    }
    initialize() {
        super.initialize();
    }
    update() {
    }
    dispose() {
        super.dispose();
    }
}
/// <reference path="LevelPlayer.ts"/>
class LevelRandomSolo extends LevelPlayer {
    constructor(main) {
        super(main);
    }
    initialize() {
        super.initialize();
    }
    makePlayerDeck() {
        for (let c = 0; c < 4; c++) {
            for (let v = 1; v <= 9; v++) {
                for (let n = 0; n < 2; n++) {
                    let card = new Card(v, c);
                    this.deckPlayer.cards.push(card);
                }
            }
        }
    }
    update() {
        super.update();
    }
    dispose() {
        super.dispose();
    }
}
class TerrainToonMaterial extends BABYLON.ShaderMaterial {
    constructor(name, color, scene) {
        super(name, scene, {
            vertex: "terrainToon",
            fragment: "terrainToon",
        }, {
            attributes: ["position", "normal", "uv", "color"],
            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
        });
        this.setVector3("lightInvDirW", (new BABYLON.Vector3(0.5 + Math.random(), 2.5 + Math.random(), 1.5 + Math.random())).normalize());
        this.setColor3("colGrass", BABYLON.Color3.FromHexString("#47a632"));
        this.setColor3("colDirt", BABYLON.Color3.FromHexString("#a86f32"));
        this.setColor3("colRock", BABYLON.Color3.FromHexString("#8c8c89"));
        this.setColor3("colSand", BABYLON.Color3.FromHexString("#dbc67b"));
    }
}
class TerrainTileToonMaterial extends BABYLON.ShaderMaterial {
    constructor(name, scene) {
        super(name, scene, {
            vertex: "terrainTileToon",
            fragment: "terrainTileToon",
        }, {
            attributes: ["position", "normal", "uv"],
            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
        });
        this.setVector3("lightInvDirW", (new BABYLON.Vector3(0.5, 2.5, 1.5)).normalize());
    }
    get diffuseTexture() {
        return this._diffuseTexture;
    }
    set diffuseTexture(tex) {
        this._diffuseTexture = tex;
        this.setTexture("diffuseTexture", this._diffuseTexture);
    }
}
class ToonMaterial extends BABYLON.ShaderMaterial {
    constructor(name, transparent, scene) {
        super(name, scene, {
            vertex: "toon",
            fragment: "toon",
        }, {
            attributes: ["position", "normal", "uv", "color"],
            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"],
            needAlphaBlending: true
        });
        this.setTexture("pencil_texture", new BABYLON.Texture("assets/pencil.png", this.getScene()));
    }
}
class ArrayUtils {
    static shuffle(array) {
        let l = array.length;
        for (let i = 0; i < l * l; i++) {
            let i0 = Math.floor(Math.random() * l);
            let i1 = Math.floor(Math.random() * l);
            let e0 = array[i0];
            let e1 = array[i1];
            array[i0] = e1;
            array[i1] = e0;
        }
    }
}
class AsyncUtils {
    static async timeOut(delay, callback) {
        return new Promise(resolve => {
            setTimeout(() => {
                if (callback) {
                    callback();
                }
                resolve();
            }, delay);
        });
    }
}
