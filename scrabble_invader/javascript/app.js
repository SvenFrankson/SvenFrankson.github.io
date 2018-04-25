class LetterCell extends BABYLON.Mesh {
    constructor(letter, i, j, grid) {
        super("LetterCell-" + i + "-" + j, grid.scene);
        this.letter = letter;
        this.i = i;
        this.j = j;
        this.grid = grid;
        this._instance = BABYLON.MeshBuilder.CreateGround(this.name + "_mesh", {
            width: LetterGrid.GRID_SIZE * 0.9,
            height: LetterGrid.GRID_SIZE * 0.9
        }, this.getScene());
        this._instance.parent = this;
        this.position.x = (i + 0.5) * LetterGrid.GRID_SIZE;
        this.position.z = (j + 0.5) * LetterGrid.GRID_SIZE;
        let texture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(this._instance);
        this._textBlock = new BABYLON.GUI.TextBlock("l", this.letter);
        this._textBlock.fontSize = 1000;
        this._textBlock.color = "white";
        texture.addControl(this._textBlock);
    }
    setPendingState() {
        if (this._textBlock) {
            this._textBlock.color = "blue";
        }
    }
    setWrongState() {
        if (this._textBlock) {
            this._textBlock.color = "red";
        }
    }
    setCorrectState() {
        if (this._textBlock) {
            this._textBlock.color = "white";
        }
    }
    kill() {
        this._textBlock.dispose();
        this._instance.dispose();
        this.dispose();
        this.grid.grid[this.i][this.j] = undefined;
    }
}
class LetterGrid {
    constructor(main) {
        this.main = main;
        this._throttle = 0;
        this._lastPendingCellCount = 0;
        this._checkPendingCells = () => {
            if (this.pendingCells.length > 0) {
                if (this.pendingCells.length !== this._lastPendingCellCount) {
                    this._lastPendingCellCount = this.pendingCells.length;
                    this._throttle = 0;
                    return;
                }
                else {
                    this._throttle += this.engine.getDeltaTime() / 1000;
                    if (this._throttle > LetterGrid.PENDING_DELAY) {
                        this._throttle = 0;
                        this._validatePendingCells();
                    }
                }
            }
        };
        this.grid = [];
        this.pendingCells = [];
        this.initialize();
        this.scene.onBeforeRenderObservable.add(this._checkPendingCells);
    }
    static get GRID_DISTANCE() {
        return (LetterGrid.GRID_LENGTH + 1) * LetterGrid.GRID_SIZE;
    }
    get wordValidator() {
        return this.main.wordValidator;
    }
    get scene() {
        return this.main.scene;
    }
    get engine() {
        return this.main.engine;
    }
    initialize() {
        let lines = [];
        for (let i = 0; i <= LetterGrid.GRID_LENGTH; i++) {
            lines[i] = [];
            lines[i].push(new BABYLON.Vector3(i * LetterGrid.GRID_SIZE, 0, 0), new BABYLON.Vector3(i * LetterGrid.GRID_SIZE, 0, (LetterGrid.GRID_LENGTH + 1) * LetterGrid.GRID_SIZE));
        }
        for (let i = 0; i <= LetterGrid.GRID_LENGTH; i++) {
            lines[i + LetterGrid.GRID_LENGTH + 1] = [];
            lines[i + LetterGrid.GRID_LENGTH + 1].push(new BABYLON.Vector3(0, 0, i * LetterGrid.GRID_SIZE), new BABYLON.Vector3((LetterGrid.GRID_LENGTH + 1) * LetterGrid.GRID_SIZE, 0, i * LetterGrid.GRID_SIZE));
        }
        BABYLON.MeshBuilder.CreateLineSystem("GridLineMesh", {
            lines: lines,
            updatable: false,
            instance: undefined
        }, this.scene);
    }
    worldToGrid(world) {
        let gridPosition = BABYLON.Vector2.Zero();
        gridPosition.x = Math.floor(world.x / LetterGrid.GRID_SIZE);
        gridPosition.y = Math.floor(world.z / LetterGrid.GRID_SIZE);
        return gridPosition;
    }
    add(l, world) {
        let gridPosition = this.worldToGrid(world);
        if (gridPosition.x >= 0 && gridPosition.x < LetterGrid.GRID_LENGTH) {
            if (gridPosition.y >= 0 && gridPosition.y < LetterGrid.GRID_LENGTH) {
                let i = Math.floor(gridPosition.x);
                let j = Math.floor(gridPosition.y);
                if (!this.grid[i]) {
                    this.grid[i] = [];
                }
                if (!this.grid[i][j]) {
                    let newCell = new LetterCell(l, i, j, this);
                    this.grid[i][j] = newCell;
                    this.pendingCells.push(newCell);
                    newCell.setPendingState();
                }
            }
        }
    }
    safeGridIJ(i, j) {
        if (this.grid[i]) {
            return this.grid[i][j];
        }
        return undefined;
    }
    getHorizontalWordAt(i, j) {
        let word = "";
        let firstI = i;
        while (this.safeGridIJ(firstI, j) !== undefined) {
            firstI--;
        }
        firstI++;
        while (this.safeGridIJ(firstI, j) !== undefined) {
            word += this.safeGridIJ(firstI, j).letter;
            firstI++;
        }
        return word;
    }
    getVerticalWordAt(i, j) {
        let word = "";
        let firstJ = j;
        while (this.safeGridIJ(i, firstJ) !== undefined) {
            firstJ++;
        }
        firstJ--;
        while (this.safeGridIJ(i, firstJ) !== undefined) {
            word += this.safeGridIJ(i, firstJ).letter;
            firstJ--;
        }
        return word;
    }
    _validatePendingCells() {
        // Check for pendingCells alignment.
        let deltaI = 0;
        let deltaJ = 0;
        for (let i = 0; i < this.pendingCells.length; i++) {
            let cell0 = this.pendingCells[i];
            for (let j = 0; j < this.pendingCells.length && j !== i; j++) {
                let cell1 = this.pendingCells[j];
                deltaI += Math.abs(cell0.i - cell1.i);
                deltaJ += Math.abs(cell0.j - cell1.j);
            }
        }
        if (deltaI > 0 && deltaJ > 0) {
            return this._rejectPendingCells();
        }
        let wordsToCheck = [];
        this.pendingCells.forEach((cell) => {
            let word = this.getHorizontalWordAt(cell.i, cell.j);
            if (word.length > 1 && wordsToCheck.indexOf(word) === -1) {
                console.log(word);
                wordsToCheck.push(word);
            }
            word = this.getVerticalWordAt(cell.i, cell.j);
            if (word.length > 1 && wordsToCheck.indexOf(word) === -1) {
                console.log(word);
                wordsToCheck.push(word);
            }
        });
        if (wordsToCheck.length === 0) {
            return this._rejectPendingCells();
        }
        let valid = true;
        wordsToCheck.forEach((word) => {
            valid = valid && this.wordValidator.isValid(word);
        });
        if (valid) {
            this._acceptPendingCells();
        }
        else {
            this._rejectPendingCells();
        }
    }
    _acceptPendingCells() {
        TipsGenerator.ShowRandomGood();
        this.main.goodSound.play();
        let counter = 0;
        let l = Math.floor(this.pendingCells.length / 2);
        this.main.spaceship.score += l * l * 10;
        this.main.spaceship.words++;
        this.pendingCells.forEach((c) => {
            c.setCorrectState();
            for (let i = 0; i < l; i++) {
                let pos = c.position.clone();
                pos.x += Math.random() * 4 - 2;
                pos.z += Math.random() * 4 - 2;
                setTimeout(() => {
                    this.main.bonusGenerator.popBonus(pos);
                }, counter * 250);
                counter++;
            }
        });
        this.pendingCells = [];
    }
    _rejectPendingCells() {
        TipsGenerator.ShowRandomBad();
        this.main.badSound.play();
        this.pendingCells.forEach((c) => {
            c.setWrongState();
            setTimeout(() => {
                c.kill();
            }, 3000);
        });
        this.pendingCells = [];
    }
}
LetterGrid.GRID_LENGTH = 128;
LetterGrid.GRID_SIZE = 4;
LetterGrid.PENDING_DELAY = 5;
class LetterStack {
    constructor(main) {
        this.main = main;
        this.letters = [];
        this._createUI();
        // debug fill
        this.add(WordValidator.randomLetter());
        this.add(WordValidator.randomLetter());
        this.add(WordValidator.randomLetter());
        this.add(WordValidator.randomLetter());
        this.add(WordValidator.randomLetter());
        this.add(WordValidator.randomLetter());
        this.add(WordValidator.randomLetter());
    }
    get gui() {
        return this.main.gui;
    }
    _createUI() {
        this._letterUISlots = [];
        for (let i = 0; i < LetterStack.MAX_LENGTH; i++) {
            let textIcon = new BABYLON.GUI.Image("TextIcon-" + i, "textures/letter_icon.png");
            textIcon.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            textIcon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            textIcon.left = (20 + (150 + 10) * i) + " px";
            textIcon.top = "20 px";
            textIcon.width = "150px";
            textIcon.height = "150px";
            this.gui.addControl(textIcon);
            let text = new BABYLON.GUI.TextBlock("TextBlock-" + i, "_");
            text.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            text.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            text.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            text.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            text.left = (20 + (150 + 10) * i) + " px";
            text.top = "20 px";
            text.width = "150px";
            text.height = "150px";
            text.fontSize = "80px";
            text.color = "black";
            this._letterUISlots[i] = text;
            this.gui.addControl(text);
            let index = i;
            text.onPointerEnterObservable.add(() => {
                this.main.spaceship.mouseInput.lockInput = true;
            });
            text.onPointerOutObservable.add(() => {
                this.main.spaceship.mouseInput.lockInput = false;
            });
            text.onPointerDownObservable.add(() => {
                this.main.spaceship.mouseInput.currentDragNDropIndex = index;
            });
            let indexBlock = new BABYLON.GUI.TextBlock("indexBlock-" + i, "(" + (i + 1) + ")");
            indexBlock.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            indexBlock.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            indexBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            indexBlock.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            indexBlock.left = (20 + (150 + 10) * i) + " px";
            indexBlock.top = "190 px";
            indexBlock.width = "150px";
            indexBlock.height = "150px";
            indexBlock.fontSize = "30px";
            indexBlock.color = "white";
            this.gui.addControl(indexBlock);
        }
        let langBlock = new BABYLON.GUI.TextBlock("langBlock", "(English Dictionnary)");
        langBlock.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        langBlock.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        langBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        langBlock.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        langBlock.left = (20 + (150 + 10) * 7) + " px";
        langBlock.top = "80 px";
        langBlock.width = "400px";
        langBlock.height = "150px";
        langBlock.fontSize = "25px";
        langBlock.color = "white";
        this.gui.addControl(langBlock);
        if (Main.LANGUAGE === "en") {
            langBlock.text = "Words are validated against an\n(English Dictionnary)";
        }
        else if (Main.LANGUAGE === "fr") {
            langBlock.text = "Words are validated against a\n(French Dictionnary)";
        }
    }
    _updateUI() {
        for (let i = 0; i < LetterStack.MAX_LENGTH; i++) {
            if (this.letters[i]) {
                this._letterUISlots[i].text = this.letters[i];
            }
            else {
                this._letterUISlots[i].text = "_";
            }
        }
    }
    add(l) {
        for (let i = 0; i < LetterStack.MAX_LENGTH; i++) {
            if (!this.letters[i]) {
                this.letters[i] = l;
                this._updateUI();
                return;
            }
        }
    }
    removeAt(n) {
        let l = "";
        if (this.letters[n]) {
            l = this.letters[n];
            this.letters[n] = "";
        }
        this._updateUI();
        return l;
    }
}
LetterStack.MAX_LENGTH = 7;
class Main {
    constructor(canvasElement) {
        Main.instance = this;
        this.canvas = document.getElementById(canvasElement);
        this.engine = new BABYLON.Engine(this.canvas, true);
    }
    createScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor.copyFromFloats(0, 0, 0, 0);
        this.resize();
        this.gui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUI");
        this.gui.idealHeight = 1217;
        let light = new BABYLON.HemisphericLight("Light", (new BABYLON.Vector3(1, 3, 2)).normalize(), this.scene);
        light.groundColor.copyFromFloats(0.5, 0.5, 0.5);
        light.intensity = 1;
        let ratio = this.canvas.clientWidth / this.canvas.clientHeight;
        let height = 5;
        let width = height * ratio;
        let depth = Math.max(height, width);
        this.ground = BABYLON.MeshBuilder.CreateGround("Ground", {
            width: LetterGrid.GRID_LENGTH * LetterGrid.GRID_SIZE * 2,
            height: LetterGrid.GRID_LENGTH * LetterGrid.GRID_SIZE * 2
        }, this.scene);
        this.ground.position.x = LetterGrid.GRID_LENGTH * LetterGrid.GRID_SIZE * 0.5;
        this.ground.position.y = -0.2;
        this.ground.position.z = LetterGrid.GRID_LENGTH * LetterGrid.GRID_SIZE * 0.5;
        this.ground.isVisible = false;
        this.greenLaserSound = new BABYLON.Sound("greenLaserSound", "sounds/laser-shot-1.wav", Main.instance.scene);
        this.blueLaserSound = new BABYLON.Sound("blueLaserSound", "sounds/laser-shot-2.wav", Main.instance.scene);
        this.redLaserSound = new BABYLON.Sound("redLaserSound", "sounds/laser-shot-3.wav", Main.instance.scene);
        this.purpleLaserSound = new BABYLON.Sound("purpleLaserSound", "sounds/laser-shot-4.wav", Main.instance.scene);
        this.goodSound = new BABYLON.Sound("purpleLaserSound", "sounds/good.wav", Main.instance.scene);
        this.badSound = new BABYLON.Sound("purpleLaserSound", "sounds/bad.wav", Main.instance.scene);
        this.upgradeSound = new BABYLON.Sound("purpleLaserSound", "sounds/upgrade.wav", Main.instance.scene);
        this.grid = new LetterGrid(this);
        this.spaceship = new Spaceship(this);
        this.spaceship.position.copyFromFloats(30, 0, 30);
        let camera = new SpaceshipCamera(this.spaceship);
        this.wordValidator = new WordValidator();
        this.wordValidator.initialize();
        this.bonusGenerator = new BonusGenerator(this);
        this.bonusGenerator.start();
        this.invaderGenerator = new InvaderGenerator(this);
        setTimeout(() => {
            this.invaderGenerator.start();
        }, 5000);
    }
    animate() {
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }
    resize() {
        this.engine.resize();
    }
    static Play() {
        $("#render-canvas").show();
        $(".main-menu").hide();
        let game = new Main("render-canvas");
        game.createScene();
        game.animate();
        setTimeout(() => {
            TipsGenerator.ShowRandomTips();
        }, 1000);
    }
    static GameOver() {
        Main.instance.invaderGenerator.invaders.forEach((i) => {
            i.kill();
        });
        Main.instance.gui.dispose();
        Main.instance.bonusGenerator.stop();
        Main.instance.invaderGenerator.stop();
        $("#score").text("SCORE " + Main.instance.spaceship.score);
        $("#kills").text("KILLS " + Main.instance.spaceship.kills);
        $("#words").text("WORDS " + Main.instance.spaceship.words);
        $("#experience").text("EXPERIENCE " + Main.instance.spaceship.xp);
        $(".main-menu").hide();
        $(".game-over").show();
        $("#render-canvas").hide();
    }
}
Main.LANGUAGE = "en";
Main.MOUSE_ONLY_CONTROL = false;
Main.KEYBOARD_LOCAL_CONTROL = false;
window.addEventListener("DOMContentLoaded", () => {
    $(".main-menu").show();
    $(".game-over").hide();
    $("#render-canvas").hide();
    Main.musicSound = new Audio();
    Main.musicSound.src = "sounds/music.wav";
    Main.musicSound.play();
    Main.musicSound.loop = true;
    $("#play-button").on("click", () => {
        $("#render-canvas").show();
        Main.Play();
    });
    $("#lang-en").on("click", () => {
        Main.LANGUAGE = "en";
        $(".lang-button").removeClass("active");
        $("#lang-en").addClass("active");
    });
    $("#lang-fr").on("click", () => {
        Main.LANGUAGE = "fr";
        $(".lang-button").removeClass("active");
        $("#lang-fr").addClass("active");
    });
    $("#lang-es").on("click", () => {
    });
    $("#lang-ge").on("click", () => {
    });
    $("#difficulty-baby").on("click", () => {
        InvaderGenerator.invaderLevelTime = 80;
        InvaderGenerator.invaderRate = 12000;
        $(".difficulty-button").removeClass("active");
        $("#difficulty-baby").addClass("active");
    });
    $("#difficulty-easy").on("click", () => {
        InvaderGenerator.invaderLevelTime = 70;
        InvaderGenerator.invaderRate = 10000;
        $(".difficulty-button").removeClass("active");
        $("#difficulty-easy").addClass("active");
    });
    $("#difficulty-medium").on("click", () => {
        InvaderGenerator.invaderLevelTime = 60;
        InvaderGenerator.invaderRate = 8000;
        $(".difficulty-button").removeClass("active");
        $("#difficulty-medium").addClass("active");
    });
    $("#difficulty-hard").on("click", () => {
        InvaderGenerator.invaderLevelTime = 50;
        InvaderGenerator.invaderRate = 6000;
        $(".difficulty-button").removeClass("active");
        $("#difficulty-hard").addClass("active");
    });
    $("#control-world").on("click", () => {
        Main.KEYBOARD_LOCAL_CONTROL = false;
        $(".control").removeClass("active");
        $("#control-world").addClass("active");
    });
    $("#control-local").on("click", () => {
        Main.KEYBOARD_LOCAL_CONTROL = true;
        $(".control").removeClass("active");
        $("#control-local").addClass("active");
    });
    $("#keyboard-qwerty").on("click", () => {
        SpaceshipKeyboardInput.QwertyMode();
        $(".keyboard-button").removeClass("active");
        $("#keyboard-qwerty").addClass("active");
    });
    $("#keyboard-azerty").on("click", () => {
        SpaceshipKeyboardInput.AzertyMode();
        $(".keyboard-button").removeClass("active");
        $("#keyboard-azerty").addClass("active");
    });
    $("#music-on").on("click", () => {
        Main.musicSound.play();
        $(".music-button").removeClass("active");
        $("#music-on").addClass("active");
    });
    $("#music-off").on("click", () => {
        Main.musicSound.pause();
        $(".music-button").removeClass("active");
        $("#music-off").addClass("active");
    });
});
class Spaceship extends BABYLON.Mesh {
    constructor(main) {
        super("Spaceship", main.scene);
        this.main = main;
        this.straff = 0;
        this.thrust = 0;
        this._hitPoints = 100;
        this._score = 0;
        this.kills = 0;
        this.xp = 0;
        this.words = 0;
        this.regenCooldown = 60;
        this.regenDelay = 180;
        this.velocity = BABYLON.Vector3.Zero();
        this._staminaXp = 0;
        this._shieldXp = 0;
        this._powerXp = 0;
        this._firerateXp = 0;
        this.staminaLevel = 0;
        this.shieldLevel = 0;
        this.powerLevel = 0;
        this.firerateLevel = 0;
        this.staminaCoef = 1;
        this.shieldCoef = 1;
        this.powerCoef = 1;
        this.firerateCoef = 1;
        this._update = () => {
            if (this._coolDown > 0) {
                this._coolDown--;
            }
            this._regenDelayTimer--;
            if (this._regenDelayTimer <= 0) {
                this._regenTimer--;
                if (this._regenTimer <= 0) {
                    this.hitPoints += 1;
                    this._regenTimer = this.regenCooldown;
                    this._updateUI();
                }
            }
            let deltaTime = this.getEngine().getDeltaTime() / 1000;
            if (Main.MOUSE_ONLY_CONTROL || Main.KEYBOARD_LOCAL_CONTROL) {
                this.velocity.addInPlace(this.getDirection(BABYLON.Axis.Z).scale(this.thrust * deltaTime));
                this.velocity.addInPlace(this.getDirection(BABYLON.Axis.X).scale(this.straff * deltaTime));
            }
            else {
                this.velocity.z += this.thrust * deltaTime;
                this.velocity.x += this.straff * deltaTime;
            }
            let dragX = this.getDirection(BABYLON.Axis.X);
            let dragXComp = BABYLON.Vector3.Dot(this.velocity, dragX);
            dragXComp *= Math.abs(dragXComp);
            dragX.scaleInPlace(dragXComp * deltaTime * 0.1);
            let dragZ = this.getDirection(BABYLON.Axis.Z);
            let dragZComp = BABYLON.Vector3.Dot(this.velocity, dragZ);
            if (dragZComp < 0) {
                dragZComp *= 5;
            }
            dragZComp *= Math.abs(dragZComp);
            dragZ.scaleInPlace(dragZComp * deltaTime * 0.02);
            let framer = BABYLON.Vector3.Zero();
            if (this.position.x < 0) {
                framer.x += Math.abs(this.position.x) * 5 * deltaTime;
            }
            if (this.position.x > (LetterGrid.GRID_LENGTH + 1) * LetterGrid.GRID_SIZE) {
                framer.x -= Math.abs(this.position.x - (LetterGrid.GRID_LENGTH + 1) * LetterGrid.GRID_SIZE) * 5 * deltaTime;
            }
            if (this.position.z < 0) {
                framer.z += Math.abs(this.position.z) * 5 * deltaTime;
            }
            if (this.position.z > (LetterGrid.GRID_LENGTH + 1) * LetterGrid.GRID_SIZE) {
                framer.z -= Math.abs(this.position.z - (LetterGrid.GRID_LENGTH + 1) * LetterGrid.GRID_SIZE) * 5 * deltaTime;
            }
            this.velocity.subtractInPlace(dragX).subtractInPlace(dragZ).addInPlace(framer);
            this.position.addInPlace(this.velocity.scale(deltaTime));
            this.position.y = 0;
        };
        this._coolDown = 0;
        this._regenTimer = 0;
        this._regenDelayTimer = 0;
        BABYLON.SceneLoader.ImportMesh("", "./models/spaceship.babylon", "", this.getScene(), (meshes) => {
            if (meshes[0]) {
                meshes[0].parent = this;
            }
        });
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.mouseInput = new SpaceshipMouseInput(this);
        this._keyboardInput = new SpaceshipKeyboardInput(this);
        this.getScene().onBeforeRenderObservable.add(this._update);
        this.letterStack = new LetterStack(this.main);
        this._createUI();
    }
    get hitPoints() {
        return this._hitPoints;
    }
    set hitPoints(v) {
        this._hitPoints = Math.round(v);
        if (this._hitPoints > this.stamina) {
            this._hitPoints = Math.round(this.stamina);
        }
    }
    get score() {
        return this._score;
    }
    set score(v) {
        this._score = Math.round(v);
        this._updateUI();
    }
    upStamina() {
        this.xp++;
        this._staminaXp++;
        this.hitPoints++;
        if (this._staminaXp > this.staminaLevel) {
            this.score += this.staminaLevel * 5;
            this.main.upgradeSound.play();
            this.staminaLevel++;
            this.regenCooldown--;
            this.staminaCoef = Math.pow(1.1, this.staminaLevel);
            this._staminaXp = 0;
            this._updateUI();
        }
    }
    upShield() {
        this.xp++;
        this._shieldXp++;
        this.hitPoints++;
        if (this._shieldXp > this.shieldLevel) {
            this.score += this.shieldLevel * 5;
            this.main.upgradeSound.play();
            this.shieldLevel++;
            this.shieldCoef = Math.pow(1.1, this.shieldLevel);
            this._shieldXp = 0;
            this._updateUI();
        }
    }
    upPower() {
        this.xp++;
        this._powerXp++;
        this.hitPoints++;
        if (this._powerXp > this.powerLevel) {
            this.score += this.powerLevel * 5;
            this.main.upgradeSound.play();
            this.powerLevel++;
            this.powerCoef = Math.pow(1.1, this.powerLevel);
            this._powerXp = 0;
            this._updateUI();
        }
    }
    upFirerate() {
        this.xp++;
        this._firerateXp++;
        this.hitPoints++;
        if (this._firerateXp > this.firerateLevel) {
            this.score += this.firerateLevel * 5;
            this.main.upgradeSound.play();
            this.firerateLevel++;
            this.firerateCoef = Math.pow(1.1, this.firerateLevel);
            this._firerateXp = 0;
            this._updateUI();
        }
    }
    get stamina() {
        return Math.floor(100 * this.staminaCoef);
    }
    get shield() {
        return 10 * this.shieldCoef;
    }
    get power() {
        return 10 * this.powerCoef;
    }
    get firerate() {
        return 2 * this.firerateCoef;
    }
    get grid() {
        return this.main.grid;
    }
    get gui() {
        return this.main.gui;
    }
    _createUI() {
        let leftSideUI = new BABYLON.GUI.Image("leftSideUI", "textures/left_side_ui.png");
        leftSideUI.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        leftSideUI.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        leftSideUI.left = "0px";
        leftSideUI.top = "-75px";
        leftSideUI.width = "475px";
        leftSideUI.height = "950px";
        this.gui.addControl(leftSideUI);
        this.scoreUI = new BABYLON.GUI.TextBlock("ScoreBlock", "SCORE " + this.score);
        this.scoreUI.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.scoreUI.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.scoreUI.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.scoreUI.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.scoreUI.left = "40 px";
        this.scoreUI.top = "-40 px";
        this.scoreUI.width = "500px";
        this.scoreUI.height = "100px";
        this.scoreUI.fontSize = "80px";
        this.scoreUI.color = "white";
        this.gui.addControl(this.scoreUI);
        this.hpUI = new BABYLON.GUI.TextBlock("ScoreBlock", "HP " + this.hitPoints + " / " + this.stamina);
        this.hpUI.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.hpUI.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.hpUI.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.hpUI.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.hpUI.left = "-40 px";
        this.hpUI.top = "-40 px";
        this.hpUI.width = "500px";
        this.hpUI.height = "100px";
        this.hpUI.fontSize = "80px";
        this.hpUI.color = "white";
        this.gui.addControl(this.hpUI);
        let staminaIcon = new BABYLON.GUI.Image("StaminaIcon", "textures/stamina_icon.png");
        staminaIcon.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        staminaIcon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        staminaIcon.left = "-200 px";
        staminaIcon.top = (-160 - 80) + " px";
        staminaIcon.width = "128px";
        staminaIcon.height = "128px";
        this.gui.addControl(staminaIcon);
        let shieldIcon = new BABYLON.GUI.Image("ShieldIcon", "textures/shield_icon.png");
        shieldIcon.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        shieldIcon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        shieldIcon.left = "-200 px";
        shieldIcon.top = (-80) + " px";
        shieldIcon.width = "128px";
        shieldIcon.height = "128px";
        this.gui.addControl(shieldIcon);
        let powerIcon = new BABYLON.GUI.Image("PowerIcon", "textures/power_icon.png");
        powerIcon.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        powerIcon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        powerIcon.left = "-200 px";
        powerIcon.top = (80) + " px";
        powerIcon.width = "128px";
        powerIcon.height = "128px";
        this.gui.addControl(powerIcon);
        let firerateIcon = new BABYLON.GUI.Image("firerateIcon", "textures/firerate_icon.png");
        firerateIcon.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        firerateIcon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        firerateIcon.left = "-200 px";
        firerateIcon.top = (80 + 160) + " px";
        firerateIcon.width = "128px";
        firerateIcon.height = "128px";
        this.gui.addControl(firerateIcon);
        let staminaTitleUI = new BABYLON.GUI.TextBlock("staminaTextUI", "STAMINA");
        staminaTitleUI.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        staminaTitleUI.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        staminaTitleUI.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        staminaTitleUI.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        staminaTitleUI.left = "-40 px";
        staminaTitleUI.top = (-160 - 80 - 48) + " px";
        staminaTitleUI.width = "160px";
        staminaTitleUI.height = "64px";
        staminaTitleUI.fontSize = "30px";
        staminaTitleUI.fontFamily = "Komikax";
        staminaTitleUI.color = "white";
        this.gui.addControl(staminaTitleUI);
        let shieldTitleUI = new BABYLON.GUI.TextBlock("shieldTitleUI", "SHIELD");
        shieldTitleUI.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        shieldTitleUI.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        shieldTitleUI.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        shieldTitleUI.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        shieldTitleUI.left = "-40 px";
        shieldTitleUI.top = (-80 - 48) + " px";
        shieldTitleUI.width = "160px";
        shieldTitleUI.height = "64px";
        shieldTitleUI.fontSize = "30px";
        shieldTitleUI.fontFamily = "Komikax";
        shieldTitleUI.color = "white";
        this.gui.addControl(shieldTitleUI);
        let powerTitleUI = new BABYLON.GUI.TextBlock("powerTitleUI", "POWER");
        powerTitleUI.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        powerTitleUI.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        powerTitleUI.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        powerTitleUI.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        powerTitleUI.left = "-40 px";
        powerTitleUI.top = (80 - 48) + " px";
        powerTitleUI.width = "160px";
        powerTitleUI.height = "64px";
        powerTitleUI.fontSize = "30px";
        powerTitleUI.fontFamily = "Komikax";
        powerTitleUI.color = "white";
        this.gui.addControl(powerTitleUI);
        let firerateTitleUI = new BABYLON.GUI.TextBlock("firerateTitleUI", "FIRERATE");
        firerateTitleUI.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        firerateTitleUI.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        firerateTitleUI.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        firerateTitleUI.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        firerateTitleUI.left = "-40 px";
        firerateTitleUI.top = (160 + 80 - 48) + " px";
        firerateTitleUI.width = "160px";
        firerateTitleUI.height = "64px";
        firerateTitleUI.fontSize = "30px";
        firerateTitleUI.fontFamily = "Komikax";
        firerateTitleUI.color = "white";
        this.gui.addControl(firerateTitleUI);
        this.staminaTextUI = new BABYLON.GUI.TextBlock("staminaTextUI", "LvL 1");
        this.staminaTextUI.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.staminaTextUI.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.staminaTextUI.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.staminaTextUI.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.staminaTextUI.left = "-40 px";
        this.staminaTextUI.top = (-160 - 80) + " px";
        this.staminaTextUI.width = "128px";
        this.staminaTextUI.height = "64px";
        this.staminaTextUI.fontSize = "40px";
        this.staminaTextUI.color = "white";
        this.gui.addControl(this.staminaTextUI);
        this.shieldTextUI = new BABYLON.GUI.TextBlock("shieldTextUI", "LvL 1");
        this.shieldTextUI.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.shieldTextUI.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.shieldTextUI.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.shieldTextUI.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.shieldTextUI.left = "-40 px";
        this.shieldTextUI.top = (-80) + " px";
        this.shieldTextUI.width = "128px";
        this.shieldTextUI.height = "64px";
        this.shieldTextUI.fontSize = "40px";
        this.shieldTextUI.color = "white";
        this.gui.addControl(this.shieldTextUI);
        this.powerTextUI = new BABYLON.GUI.TextBlock("powerTextUI", "LvL 1");
        this.powerTextUI.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.powerTextUI.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.powerTextUI.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.powerTextUI.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.powerTextUI.left = "-40 px";
        this.powerTextUI.top = (80) + " px";
        this.powerTextUI.width = "128px";
        this.powerTextUI.height = "64px";
        this.powerTextUI.fontSize = "40px";
        this.powerTextUI.color = "white";
        this.gui.addControl(this.powerTextUI);
        this.firerateTextUI = new BABYLON.GUI.TextBlock("firerateTextUI", "LvL 1");
        this.firerateTextUI.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.firerateTextUI.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.firerateTextUI.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.firerateTextUI.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.firerateTextUI.left = "-40 px";
        this.firerateTextUI.top = (80 + 160) + " px";
        this.firerateTextUI.width = "128px";
        this.firerateTextUI.height = "64px";
        this.firerateTextUI.fontSize = "40px";
        this.firerateTextUI.color = "white";
        this.gui.addControl(this.firerateTextUI);
        this._updateUI();
    }
    _updateUI() {
        this.hpUI.text = "HP " + this.hitPoints + " / " + this.stamina;
        this.scoreUI.text = "SCORE " + this.score;
        this.staminaTextUI.text = "lvl " + this.staminaLevel;
        this.shieldTextUI.text = "lvl " + this.shieldLevel;
        this.powerTextUI.text = "lvl " + this.powerLevel;
        this.firerateTextUI.text = "lvl " + this.firerateLevel;
    }
    shoot() {
        if (this._coolDown > 0) {
            return;
        }
        new Shot(true, this.position, this.rotationQuaternion, 20, this.power, 100, this.main);
        this._coolDown = Math.round(60 / this.firerate);
    }
    wound(damage) {
        this._regenDelayTimer = this.regenDelay;
        this._regenTimer = this.regenCooldown;
        let r = Math.random();
        if (r < this.shield / 100) {
            return;
        }
        this.hitPoints -= damage;
        if (this.hitPoints <= 0) {
            setTimeout(() => {
                this.getChildMeshes().forEach((m) => {
                    m.isVisible = false;
                });
                Main.GameOver();
            }, 250);
        }
        this._updateUI();
    }
}
class SpaceshipCamera extends BABYLON.FreeCamera {
    constructor(spaceship) {
        super("SpaceshipCamera", spaceship.position.add(new BABYLON.Vector3(0, 20, -5)), spaceship.getScene());
        this.spaceship = spaceship;
        this._update = () => {
            let newPos = this.spaceship.position.add(new BABYLON.Vector3(0, 35, -10));
            this.position = BABYLON.Vector3.Lerp(this.position, newPos, 0.1);
        };
        this.setTarget(spaceship.position);
        this.getScene().onBeforeRenderObservable.add(this._update);
    }
}
class SpaceshipKeyboardInput {
    constructor(spaceship) {
        this.spaceship = spaceship;
        this.leftKeyDown = false;
        this.upKeyDown = false;
        this.rightKeyDown = false;
        this.downKeyDown = false;
        this.spacekeyDown = false;
        this._checkInput = () => {
            if (this.downKeyDown && this.upKeyDown) {
                this.spaceship.thrust = 0;
            }
            else if (this.downKeyDown) {
                this.spaceship.thrust = -10;
            }
            else if (this.upKeyDown) {
                this.spaceship.thrust = 10;
            }
            else {
                this.spaceship.thrust = 0;
            }
            if (this.leftKeyDown && this.rightKeyDown) {
                this.spaceship.straff = 0;
            }
            else if (this.leftKeyDown) {
                this.spaceship.straff = -10;
            }
            else if (this.rightKeyDown) {
                this.spaceship.straff = 10;
            }
            else {
                this.spaceship.straff = 0;
            }
        };
        this.canvas.addEventListener("keyup", (e) => {
            if (e.keyCode === 32) {
                this.spacekeyDown = false;
            }
            if (e.keyCode === 37 || e.key === SpaceshipKeyboardInput.leftKey) {
                this.leftKeyDown = false;
            }
            if (e.keyCode === 38 || e.key === SpaceshipKeyboardInput.forwardKey) {
                this.upKeyDown = false;
            }
            if (e.keyCode === 39 || e.key === SpaceshipKeyboardInput.rightKey) {
                this.rightKeyDown = false;
            }
            if (e.keyCode === 40 || e.key === SpaceshipKeyboardInput.backKey) {
                this.downKeyDown = false;
            }
        });
        this.canvas.addEventListener("keydown", (e) => {
            if (e.keyCode === 32) {
                this.spacekeyDown = true;
            }
            if (e.keyCode === 37 || e.key === SpaceshipKeyboardInput.leftKey) {
                this.leftKeyDown = true;
            }
            if (e.keyCode === 38 || e.key === SpaceshipKeyboardInput.forwardKey) {
                this.upKeyDown = true;
            }
            if (e.keyCode === 39 || e.key === SpaceshipKeyboardInput.rightKey) {
                this.rightKeyDown = true;
            }
            if (e.keyCode === 40 || e.key === SpaceshipKeyboardInput.backKey) {
                this.downKeyDown = true;
            }
        });
        this.canvas.addEventListener("keydown", (e) => {
            for (let i = 0; i < LetterStack.MAX_LENGTH; i++) {
                if (e.keyCode === 49 + i) {
                    let letter = this.spaceship.letterStack.removeAt(i);
                    this.spaceship.grid.add(letter, this.spaceship.position);
                }
            }
        });
        this.scene.onBeforeRenderObservable.add(this._checkInput);
    }
    static AzertyMode() {
        SpaceshipKeyboardInput.forwardKey = "z";
        SpaceshipKeyboardInput.backKey = "s";
        SpaceshipKeyboardInput.leftKey = "q";
        SpaceshipKeyboardInput.rightKey = "d";
    }
    static QwertyMode() {
        SpaceshipKeyboardInput.forwardKey = "w";
        SpaceshipKeyboardInput.backKey = "s";
        SpaceshipKeyboardInput.leftKey = "a";
        SpaceshipKeyboardInput.rightKey = "d";
    }
    get scene() {
        return this.spaceship.main.scene;
    }
    get canvas() {
        return this.spaceship.main.canvas;
    }
}
SpaceshipKeyboardInput.forwardKey = "w";
SpaceshipKeyboardInput.backKey = "s";
SpaceshipKeyboardInput.leftKey = "a";
SpaceshipKeyboardInput.rightKey = "d";
class SpaceshipMouseInput {
    constructor(spaceship) {
        this.spaceship = spaceship;
        this.currentDragNDropIndex = -1;
        this.mouseDown = false;
        this.lockInput = false;
        this._checkInput = () => {
            if (Main.MOUSE_ONLY_CONTROL && (this.lockInput || this.currentDragNDropIndex > -1)) {
                this.spaceship.thrust = 0;
                return;
            }
            if (this.mouseDown) {
                this.spaceship.shoot();
            }
            let pick = this.scene.pick(this.scene.pointerX, this.scene.pointerY, (m) => { return m === this.ground; });
            if (pick && pick.hit) {
                let newDir = pick.pickedPoint.subtract(this.spaceship.position);
                let newRight = BABYLON.Vector3.Cross(BABYLON.Axis.Y, newDir);
                let newRotation = BABYLON.Quaternion.Identity();
                BABYLON.Quaternion.RotationQuaternionFromAxisToRef(newRight, BABYLON.Axis.Y, newDir, newRotation);
                BABYLON.Quaternion.SlerpToRef(this.spaceship.rotationQuaternion, newRotation, 0.1, this.spaceship.rotationQuaternion);
                if (Main.MOUSE_ONLY_CONTROL) {
                    this.spaceship.thrust = BABYLON.Scalar.Clamp(BABYLON.Vector3.Distance(this.spaceship.position, pick.pickedPoint) * 0.5, 0, 10);
                }
            }
        };
        this.scene.onBeforeRenderObservable.add(this._checkInput);
        this.scene.onPointerObservable.add((eventData, eventState) => {
            if (eventData.type === BABYLON.PointerEventTypes._POINTERDOWN) {
                this.mouseDown = true;
            }
            if (eventData.type === BABYLON.PointerEventTypes._POINTERUP) {
                this.mouseDown = false;
                if (this.currentDragNDropIndex !== -1) {
                    let pick = this.scene.pick(this.scene.pointerX, this.scene.pointerY, (m) => { return m === this.ground; });
                    if (pick && pick.hit) {
                        let letter = this.spaceship.letterStack.removeAt(this.currentDragNDropIndex);
                        if (letter !== "") {
                            this.spaceship.grid.add(letter, pick.pickedPoint);
                        }
                    }
                    this.currentDragNDropIndex = -1;
                    this.tmpLetterInstance.dispose();
                    this.tmpLetterInstance = undefined;
                }
            }
            if (eventData.type === BABYLON.PointerEventTypes._POINTERMOVE) {
                if (this.currentDragNDropIndex !== -1) {
                    if (!this.tmpLetterInstance) {
                        this.tmpLetterInstance = BABYLON.MeshBuilder.CreateGround("tmpLetterInstance", {
                            width: LetterGrid.GRID_SIZE * 0.9,
                            height: LetterGrid.GRID_SIZE * 0.9
                        }, Main.instance.scene);
                        let texture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(this.tmpLetterInstance);
                        let textBlock = new BABYLON.GUI.TextBlock("l", this.spaceship.letterStack.letters[this.currentDragNDropIndex]);
                        textBlock.fontSize = 1000;
                        textBlock.color = "grey";
                        texture.addControl(textBlock);
                    }
                    let pick = this.scene.pick(this.scene.pointerX, this.scene.pointerY, (m) => { return m === this.ground; });
                    if (pick && pick.hit) {
                        let gridPos = Main.instance.grid.worldToGrid(pick.pickedPoint);
                        this.tmpLetterInstance.position.x = (gridPos.x + 0.5) * LetterGrid.GRID_SIZE;
                        this.tmpLetterInstance.position.z = (gridPos.y + 0.5) * LetterGrid.GRID_SIZE;
                    }
                }
            }
        });
    }
    get scene() {
        return this.spaceship.main.scene;
    }
    get ground() {
        return this.spaceship.main.ground;
    }
}
class TipsGenerator {
    static Show(id) {
        clearTimeout(TipsGenerator.randomHandle);
        $(".tips").hide();
        $("#" + id).show();
        TipsGenerator.randomHandle = setTimeout(() => {
            $("#" + id).hide();
            TipsGenerator.randomHandle = setTimeout(() => {
                TipsGenerator.ShowRandomTips();
            }, 2000);
        }, 4000);
    }
    static ShowRandomTips() {
        if (TipsGenerator.index > 10) {
            let r = Math.floor(Math.random() * 6 + 1);
            TipsGenerator.Show("tips-" + r);
        }
        else {
            TipsGenerator.Show("tips-" + TipsGenerator.index);
            TipsGenerator.index++;
        }
    }
    static ShowRandomGood() {
        let r = Math.floor(Math.random() * 4 + 1);
        TipsGenerator.Show("good-" + r);
    }
    static ShowRandomBad() {
        let r = Math.floor(Math.random() * 4 + 1);
        TipsGenerator.Show("bad-" + r);
    }
}
TipsGenerator.index = 1;
class WordValidator {
    constructor() {
        this._words = [];
    }
    initialize() {
        this._words = [];
        for (let i = 2; i <= WordValidator.MAX_WORD_LENGTH; i++) {
            $.get("dictionnary/" + Main.LANGUAGE + "/" + i + ".txt", (data) => {
                this._words[i] = data.split(" ");
                for (let j = 0; j < this._words[i].length; j++) {
                    this._words[i][j] = this._words[i][j].toLowerCase();
                }
            });
        }
    }
    isValid(word) {
        let l = word.length;
        if (l < 2 || l > WordValidator.MAX_WORD_LENGTH) {
            return false;
        }
        else {
            let words = this._words[l];
            return words.indexOf(word.toLowerCase()) !== -1;
        }
    }
    static randomLetter() {
        if (Main.LANGUAGE === "en") {
            let r = Math.floor(Math.random() * WordValidator.lettersEN.length);
            return WordValidator.lettersEN[r];
        }
        else if (Main.LANGUAGE === "fr") {
            let r = Math.floor(Math.random() * WordValidator.lettersFR.length);
            return WordValidator.lettersFR[r];
        }
    }
}
WordValidator.MAX_WORD_LENGTH = 8;
WordValidator.lettersEN = "EEEEEEEEEEEEAAAAAAAAAIIIIIIIIIOOOOOOOONNNNNNRRRRRRTTTTTTLLLLSSSSUUUUDDDDGGGBBCCMMPPFFHHVVWWYYKJXQZ";
WordValidator.lettersFR = "EEEEEEEEEEEEEEEAAAAAAAAAIIIIIIIINNNNNNOOOOOORRRRRRSSSSSSTTTTTTUUUUUULLLLLDDDMMMGGBBCCPPFFHHVVJQKWXYZ";
class Bonus extends BABYLON.Mesh {
    constructor(name, main) {
        super(name, main.scene);
        this.main = main;
        this.loaded = false;
        this._k = 0;
        this._pop = () => {
            this._k++;
            let size = Bonus.easeOutElastic(BABYLON.Scalar.Clamp(this._k / 60, 0, 1));
            this.scaling.copyFromFloats(size, size, size);
            if (this._k >= 60) {
                this.scaling.copyFromFloats(1, 1, 1);
                this.main.scene.onBeforeRenderObservable.removeCallback(this._pop);
            }
        };
        this.position.y = 1;
    }
    static easeOutElastic(t) {
        var p = 0.3;
        return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
    }
    disposeBonus() {
        this.main.scene.onBeforeRenderObservable.removeCallback(this._pop);
        this.dispose();
    }
    catch() {
    }
    pop() {
        this.scaling.copyFromFloats(0, 0, 0);
        this.main.scene.onBeforeRenderObservable.add(this._pop);
    }
}
class BonusGenerator {
    constructor(main) {
        this.main = main;
        this.playerRange = 100;
        this.letterRate = 30000;
        this._checkIntersection = () => {
            for (let i = 0; i < this.bonuses.length; i++) {
                let b = this.bonuses[i];
                if (b.loaded) {
                    if (BABYLON.Vector3.DistanceSquared(b.position, this.spaceship.position) < 9) {
                        this.bonuses.splice(i, 1);
                        b.catch();
                        return;
                    }
                }
            }
        };
        this.bonuses = [];
        this.main.scene.onBeforeRenderObservable.add(this._checkIntersection);
    }
    get grid() {
        return this.main.grid;
    }
    get spaceship() {
        return this.main.spaceship;
    }
    start() {
        this._popLetterLoop();
    }
    stop() {
        clearTimeout(this._popLetterHandle);
    }
    popLetter(pos) {
        let letter = new Letter(this.main);
        this.bonuses.push(letter);
        if (pos) {
            letter.position.copyFrom(pos);
        }
        else {
            let minX = Math.max(0, this.spaceship.position.x - this.playerRange);
            let maxX = Math.min(LetterGrid.GRID_DISTANCE, this.spaceship.position.x + this.playerRange);
            let minZ = Math.max(0, this.spaceship.position.x - this.playerRange);
            let maxZ = Math.min(LetterGrid.GRID_DISTANCE, this.spaceship.position.z + this.playerRange);
            letter.position.x = Math.random() * (maxX - minX) + minX;
            letter.position.z = Math.random() * (maxZ - minZ) + minZ;
        }
    }
    popBonus(pos) {
        let bonus;
        let r = Math.random();
        if (r > 0.75) {
            bonus = new StaminaBonus(this.main);
        }
        else if (r > 0.5) {
            bonus = new ShieldBonus(this.main);
        }
        else if (r > 0.25) {
            bonus = new PowerBonus(this.main);
        }
        else {
            bonus = new FirerateBonus(this.main);
        }
        this.bonuses.push(bonus);
        if (pos) {
            bonus.position.x = pos.x;
            bonus.position.z = pos.z;
        }
        else {
            let minX = Math.max(0, this.spaceship.position.x - this.playerRange);
            let maxX = Math.min(LetterGrid.GRID_DISTANCE, this.spaceship.position.x + this.playerRange);
            let minZ = Math.max(0, this.spaceship.position.x - this.playerRange);
            let maxZ = Math.min(LetterGrid.GRID_DISTANCE, this.spaceship.position.z + this.playerRange);
            bonus.position.x = Math.random() * (maxX - minX) + minX;
            bonus.position.z = Math.random() * (maxZ - minZ) + minZ;
        }
    }
    _popLetterLoop() {
        this.popLetter();
        this._popLetterHandle = setTimeout(() => {
            this._popLetterLoop();
        }, Math.random() * this.letterRate * 1.5);
    }
}
class FirerateBonus extends Bonus {
    constructor(main) {
        super("Letter", main);
        this._update = () => {
            if (this.isDisposed()) {
                return;
            }
            this.rotation.y += (Math.sin(this.rotation.y) * 0.03 + 0.06);
        };
        BABYLON.SceneLoader.ImportMesh("", "./models/bonus.babylon", "", this.getScene(), (meshes) => {
            meshes.forEach((m) => {
                m.parent = this;
                if (m.material instanceof BABYLON.StandardMaterial) {
                    if (m.material.name.indexOf("ring") > -1) {
                        m.material.diffuseColor = BABYLON.Color3.FromHexString("#de6715");
                        m.renderOutline = true;
                        m.outlineColor = BABYLON.Color3.White();
                        m.outlineWidth = 0.025;
                    }
                    else if (m.material.name.indexOf("plane") > -1) {
                        m.material.diffuseTexture = new BABYLON.Texture("textures/firerate_icon.png", Main.instance.scene);
                        m.material.diffuseTexture.hasAlpha = true;
                        m.material.useAlphaFromDiffuseTexture;
                    }
                }
            });
            this.loaded = true;
            this.pop();
        });
        this.getScene().onBeforeRenderObservable.add(this._update);
    }
    catch() {
        this.getScene().onBeforeRenderObservable.removeCallback(this._update);
        this.main.spaceship.upFirerate();
        this.disposeBonus();
    }
}
class Letter extends Bonus {
    constructor(main) {
        super("Letter", main);
        this._update = () => {
            if (this.isDisposed()) {
                return;
            }
            this.rotation.y += (Math.sin(this.rotation.y) * 0.03 + 0.06);
        };
        BABYLON.SceneLoader.ImportMesh("", "./models/letter_bonus.babylon", "", this.getScene(), (meshes) => {
            if (meshes[0]) {
                meshes[0].parent = this;
                this.loaded = true;
                let materials = meshes[0].material;
                if (materials instanceof BABYLON.MultiMaterial) {
                    materials.subMaterials.forEach((material) => {
                        if (material.name.indexOf("Letter") !== -1) {
                            if (material instanceof BABYLON.StandardMaterial) {
                                material.diffuseTexture = new BABYLON.Texture("textures/letter_bonus.png", this.getScene());
                                material.diffuseTexture.hasAlpha = true;
                                material.useAlphaFromDiffuseTexture = true;
                            }
                        }
                    });
                }
            }
        });
        this.position.y = 1;
        this.rotation.x = Math.PI / 4;
        this.getScene().onBeforeRenderObservable.add(this._update);
    }
    catch() {
        this.main.spaceship.letterStack.add(WordValidator.randomLetter());
        this.getScene().onBeforeRenderObservable.removeCallback(this._update);
        this.dispose();
    }
}
class PowerBonus extends Bonus {
    constructor(main) {
        super("Letter", main);
        this._update = () => {
            if (this.isDisposed()) {
                return;
            }
            this.rotation.y += (Math.sin(this.rotation.y) * 0.03 + 0.06);
        };
        BABYLON.SceneLoader.ImportMesh("", "./models/bonus.babylon", "", this.getScene(), (meshes) => {
            meshes.forEach((m) => {
                m.parent = this;
                if (m.material instanceof BABYLON.StandardMaterial) {
                    if (m.material.name.indexOf("ring") > -1) {
                        m.material.diffuseColor = BABYLON.Color3.FromHexString("#de2d49");
                        m.renderOutline = true;
                        m.outlineColor = BABYLON.Color3.White();
                        m.outlineWidth = 0.025;
                    }
                    else if (m.material.name.indexOf("plane") > -1) {
                        m.material.diffuseTexture = new BABYLON.Texture("textures/power_icon.png", Main.instance.scene);
                        m.material.diffuseTexture.hasAlpha = true;
                        m.material.useAlphaFromDiffuseTexture;
                    }
                }
            });
            this.loaded = true;
            this.pop();
        });
        this.getScene().onBeforeRenderObservable.add(this._update);
    }
    catch() {
        this.getScene().onBeforeRenderObservable.removeCallback(this._update);
        this.main.spaceship.upPower();
        this.disposeBonus();
    }
}
class ShieldBonus extends Bonus {
    constructor(main) {
        super("Letter", main);
        this._update = () => {
            if (this.isDisposed()) {
                return;
            }
            this.rotation.y += (Math.sin(this.rotation.y) * 0.03 + 0.06);
        };
        BABYLON.SceneLoader.ImportMesh("", "./models/bonus.babylon", "", this.getScene(), (meshes) => {
            meshes.forEach((m) => {
                m.parent = this;
                if (m.material instanceof BABYLON.StandardMaterial) {
                    if (m.material.name.indexOf("ring") > -1) {
                        m.material.diffuseColor = BABYLON.Color3.FromHexString("#247694");
                        m.renderOutline = true;
                        m.outlineColor = BABYLON.Color3.White();
                        m.outlineWidth = 0.025;
                    }
                    else if (m.material.name.indexOf("plane") > -1) {
                        m.material.diffuseTexture = new BABYLON.Texture("textures/shield_icon.png", Main.instance.scene);
                        m.material.diffuseTexture.hasAlpha = true;
                        m.material.useAlphaFromDiffuseTexture;
                    }
                }
            });
            this.loaded = true;
            this.pop();
        });
        this.getScene().onBeforeRenderObservable.add(this._update);
    }
    catch() {
        this.getScene().onBeforeRenderObservable.removeCallback(this._update);
        this.main.spaceship.upShield();
        this.disposeBonus();
    }
}
class StaminaBonus extends Bonus {
    constructor(main) {
        super("Letter", main);
        this._update = () => {
            if (this.isDisposed()) {
                return;
            }
            this.rotation.y += (Math.sin(this.rotation.y) * 0.03 + 0.06);
        };
        BABYLON.SceneLoader.ImportMesh("", "./models/bonus.babylon", "", this.getScene(), (meshes) => {
            meshes.forEach((m) => {
                m.parent = this;
                if (m.material instanceof BABYLON.StandardMaterial) {
                    if (m.material.name.indexOf("ring") > -1) {
                        m.material.diffuseColor = BABYLON.Color3.FromHexString("#3eae47");
                        m.renderOutline = true;
                        m.outlineColor = BABYLON.Color3.White();
                        m.outlineWidth = 0.025;
                    }
                    else if (m.material.name.indexOf("plane") > -1) {
                        m.material.diffuseTexture = new BABYLON.Texture("textures/stamina_icon.png", Main.instance.scene);
                        m.material.diffuseTexture.hasAlpha = true;
                        m.material.useAlphaFromDiffuseTexture;
                    }
                }
            });
            this.loaded = true;
            this.pop();
        });
        this.getScene().onBeforeRenderObservable.add(this._update);
    }
    catch() {
        this.getScene().onBeforeRenderObservable.removeCallback(this._update);
        this.main.spaceship.upStamina();
        this.disposeBonus();
    }
}
class Invader extends BABYLON.Mesh {
    constructor(main, type = -1) {
        super("Invader", main.scene);
        this.main = main;
        this._thrust = 1;
        this._velocity = BABYLON.Vector3.Zero();
        this._hitPoints = 50;
        // caracteristics
        this.maxThrust = 5;
        this.stamina = 25;
        this.power = 5;
        this.firerate = 0.25;
        this._update = () => {
            if (this._coolDown > 0) {
                this._coolDown--;
            }
            let deltaTime = this.getEngine().getDeltaTime() / 1000;
            let distanceToTarget = BABYLON.Vector3.Distance(this.spaceship.position, this.position);
            if (distanceToTarget > 5) {
                this._thrust = BABYLON.Scalar.Clamp(distanceToTarget * 0.5, 0, this.maxThrust);
            }
            else {
                this._thrust = this.maxThrust;
            }
            this._velocity.addInPlace(this.getDirection(BABYLON.Axis.Z).scale(this._thrust * deltaTime));
            let dragX = this.getDirection(BABYLON.Axis.X);
            let dragXComp = BABYLON.Vector3.Dot(this._velocity, dragX);
            dragXComp *= Math.abs(dragXComp);
            dragX.scaleInPlace(dragXComp * deltaTime * 0.8);
            let dragZ = this.getDirection(BABYLON.Axis.Z);
            let dragZComp = BABYLON.Vector3.Dot(this._velocity, dragZ);
            if (dragZComp < 0) {
                dragZComp *= 10;
            }
            dragZComp *= Math.abs(dragZComp);
            dragZ.scaleInPlace(dragZComp * deltaTime * 0.08);
            let framer = BABYLON.Vector3.Zero();
            if (this.position.x < 0) {
                framer.x += Math.abs(this.position.x) * 5 * deltaTime;
            }
            if (this.position.x > (LetterGrid.GRID_LENGTH + 1) * LetterGrid.GRID_SIZE) {
                framer.x -= Math.abs(this.position.x - (LetterGrid.GRID_LENGTH + 1) * LetterGrid.GRID_SIZE) * 5 * deltaTime;
            }
            if (this.position.z < 0) {
                framer.z += Math.abs(this.position.z) * 5 * deltaTime;
            }
            if (this.position.z > (LetterGrid.GRID_LENGTH + 1) * LetterGrid.GRID_SIZE) {
                framer.z -= Math.abs(this.position.z - (LetterGrid.GRID_LENGTH + 1) * LetterGrid.GRID_SIZE) * 5 * deltaTime;
            }
            this._velocity.subtractInPlace(dragX).subtractInPlace(dragZ).addInPlace(framer);
            this.position.addInPlace(this._velocity.scale(deltaTime));
            this.position.y = 0;
            let newDir = this.spaceship.position.subtract(this.position);
            if (distanceToTarget < 5) {
                newDir.scaleInPlace(-1);
            }
            let newRight = BABYLON.Vector3.Cross(BABYLON.Axis.Y, newDir);
            let newRotation = BABYLON.Quaternion.Identity();
            BABYLON.Quaternion.RotationQuaternionFromAxisToRef(newRight, BABYLON.Axis.Y, newDir, newRotation);
            BABYLON.Quaternion.SlerpToRef(this.rotationQuaternion, newRotation, 0.1, this.rotationQuaternion);
            if (BABYLON.Vector3.Dot(newDir, this.getDirection(BABYLON.Axis.Z)) > 0.9) {
                this.shoot();
            }
        };
        this._coolDown = 0;
        if (type = -1) {
            type = Math.floor(Math.random() * 5 + 1);
        }
        if (type === 1) {
            this.maxThrust *= 2;
            this.power *= 2;
        }
        if (type === 2) {
            this.stamina *= 2;
            this.firerate *= 2;
        }
        if (type === 3) {
            this.maxThrust *= 2;
            this.firerate *= 2;
        }
        if (type === 4) {
            this.stamina *= 2;
            this.power *= 2;
        }
        if (type === 5) {
            this.power *= 2;
            this.firerate *= 2;
        }
        this.stamina *= this.generator.invaderLevel;
        this.maxThrust *= this.generator.invaderLevel;
        this.power *= this.generator.invaderLevel;
        this.maxThrust *= this.generator.invaderLevel;
        this._hitPoints = this.stamina;
        BABYLON.SceneLoader.ImportMesh("", "./models/invader-" + type + ".babylon", "", this.getScene(), (meshes) => {
            meshes.forEach((m) => {
                m.parent = this;
                m.scaling.copyFromFloats(this.generator.invaderLevel, this.generator.invaderLevel, this.generator.invaderLevel);
                if (m instanceof BABYLON.Mesh) {
                    m.renderOutline = true;
                    m.outlineColor = BABYLON.Color3.White();
                    m.outlineWidth = 0.025;
                }
            });
        });
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.getScene().onBeforeRenderObservable.add(this._update);
    }
    get grid() {
        return this.main.grid;
    }
    get spaceship() {
        return this.main.spaceship;
    }
    get generator() {
        return this.main.invaderGenerator;
    }
    shoot() {
        if (this._coolDown > 0) {
            return;
        }
        new Shot(false, this.position, this.rotationQuaternion, 20, this.power, 100, this.main);
        this._coolDown = Math.round(60 / this.firerate);
    }
    wound(damage) {
        this._hitPoints -= damage;
        if (this._hitPoints < 0) {
            this.main.spaceship.score += 30;
            this.main.spaceship.kills++;
            this.kill();
        }
    }
    kill() {
        this.getScene().onBeforeRenderObservable.removeCallback(this._update);
        let index = this.generator.invaders.indexOf(this);
        if (index !== -1) {
            this.generator.invaders.splice(index, 1);
        }
        if (Math.random() > 0.5) {
            this.main.bonusGenerator.popLetter(this.position);
        }
        this.dispose();
    }
}
class InvaderGenerator {
    constructor(main) {
        this.main = main;
        this.playerRange = 100;
        this.invaderLevel = 1;
        this.timer = 0;
        this._updateInvadersLevel = () => {
            this.timer += this.main.engine.getDeltaTime() / 1000;
            if (this.timer > InvaderGenerator.invaderLevelTime) {
                this.timer = 0;
                if (Math.random() > 0.5) {
                    this.invaderLevelUpWarningText.text = "INVADERS ARE GETTING STRONGER !";
                    this.invaderLevel *= 1.1;
                }
                else {
                    this.invaderLevelUpWarningText.text = "INVADERS ARE CALLING BACKUPS !";
                    InvaderGenerator.invaderRate /= 1.1;
                }
                this.invaderLevelUpWarning.position.copyFrom(this.main.spaceship.position);
                this.invaderLevelUpWarning.position.y = -1;
                this.invaderLevelUpWarning.position.z -= 5;
                this._k = 0;
                this.invaderLevelUpWarning.isVisible = true;
                this.invaderLevelUpWarning.scaling.copyFromFloats(0, 0, 0);
                this.main.scene.onBeforeRenderObservable.add(this._flashAlert);
            }
        };
        this._k = 0;
        this._flashAlert = () => {
            this._k++;
            let size = Math.sqrt(BABYLON.Scalar.Clamp(this._k / 120, 0, 1));
            this.invaderLevelUpWarning.scaling.copyFromFloats(size, size, size);
            if (this._k > 120) {
                this.invaderLevelUpWarning.isVisible = false;
                this.main.scene.onBeforeRenderObservable.removeCallback(this._flashAlert);
            }
        };
        this.invaders = [];
        this.invaderLevelUpWarning = BABYLON.MeshBuilder.CreateGround("invaderLevelUpWarning", {
            width: 50,
            height: 50
        }, this.main.scene);
        let invaderLevelUpWarningTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(this.invaderLevelUpWarning);
        this.invaderLevelUpWarningText = new BABYLON.GUI.TextBlock("invaderLevelUpWarningText", "INVADERS ARE GETTING STRONGER !");
        this.invaderLevelUpWarningText.color = "white";
        this.invaderLevelUpWarningText.fontSize = "50";
        invaderLevelUpWarningTexture.addControl(this.invaderLevelUpWarningText);
        this.invaderLevelUpWarning.isVisible = false;
    }
    get grid() {
        return this.main.grid;
    }
    get spaceship() {
        return this.main.spaceship;
    }
    start() {
        this._popInvader();
        this.main.scene.onBeforeRenderObservable.add(this._updateInvadersLevel);
    }
    stop() {
        clearTimeout(this._popInvaderHandle);
    }
    _popInvader() {
        let invader = new Invader(this.main);
        this.invaders.push(invader);
        let minX = Math.max(0, this.spaceship.position.x - this.playerRange);
        let maxX = Math.min(LetterGrid.GRID_DISTANCE, this.spaceship.position.x + this.playerRange);
        let minZ = Math.max(0, this.spaceship.position.x - this.playerRange);
        let maxZ = Math.min(LetterGrid.GRID_DISTANCE, this.spaceship.position.z + this.playerRange);
        invader.position.x = Math.random() * (maxX - minX) + minX;
        invader.position.z = Math.random() * (maxZ - minZ) + minZ;
        this._popInvaderHandle = setTimeout(() => {
            this._popInvader();
        }, Math.random() * InvaderGenerator.invaderRate * 1.5);
    }
}
InvaderGenerator.invaderRate = 8000;
InvaderGenerator.invaderLevelTime = 60;
class Shot {
    constructor(playerShot, position, rotationQuaternion, speed, damage, range, main) {
        this.playerShot = playerShot;
        this.position = position;
        this.rotationQuaternion = rotationQuaternion;
        this.speed = speed;
        this.damage = damage;
        this.range = range;
        this.main = main;
        this._direction = BABYLON.Vector3.Zero();
        this._playerShotUpdate = () => {
            let deltaTime = this.main.engine.getDeltaTime() / 1000;
            this._instance.position.addInPlace(this._direction.scale(this.speed * deltaTime));
            if (this.position.x < -64 ||
                this.position.x > LetterGrid.GRID_DISTANCE + 64 ||
                this.position.z < -64 ||
                this.position.z > LetterGrid.GRID_DISTANCE + 64) {
                this.dispose();
                return;
            }
            for (let i = 0; i < this.generator.invaders.length; i++) {
                let invader = this.generator.invaders[i];
                if (BABYLON.Vector3.DistanceSquared(this._instance.position, invader.position) < 4) {
                    invader.wound(this.damage);
                    this.dispose();
                    return;
                }
            }
        };
        this._invaderShotUpdate = () => {
            let deltaTime = this.main.engine.getDeltaTime() / 1000;
            this._instance.position.addInPlace(this._direction.scale(this.speed * deltaTime));
            if (this.position.x < -64 ||
                this.position.x > LetterGrid.GRID_DISTANCE + 64 ||
                this.position.z < -64 ||
                this.position.z > LetterGrid.GRID_DISTANCE + 64) {
                this.dispose();
                return;
            }
            if (BABYLON.Vector3.DistanceSquared(this._instance.position, this.main.spaceship.position) < 4) {
                this.main.spaceship.wound(this.damage);
                this.dispose();
                return;
            }
        };
        let color = Math.floor(damage / 10);
        if (color > 3) {
            this._instance = Shot.purpleLaserBase.createInstance("shotInstance");
            this.main.purpleLaserSound.play();
        }
        else if (color > 2) {
            this._instance = Shot.redLaserBase.createInstance("shotInstance");
            this.main.redLaserSound.play();
        }
        else if (color > 1) {
            this._instance = Shot.blueLaserBase.createInstance("shotInstance");
            this.main.blueLaserSound.play();
        }
        else {
            this._instance = Shot.greenLaserBase.createInstance("shotInstance");
            this.main.greenLaserSound.play();
        }
        let size = BABYLON.Scalar.Clamp((damage - color * 10) / 10 + 1, 1, 3);
        this._instance.position.copyFrom(position);
        this._instance.rotationQuaternion = rotationQuaternion.clone();
        this._instance.scaling.copyFromFloats(size, size, size);
        this._instance.computeWorldMatrix(true);
        this._instance.getDirectionToRef(BABYLON.Axis.Z, this._direction);
        if (playerShot) {
            this.main.scene.onBeforeRenderObservable.add(this._playerShotUpdate);
        }
        else {
            this.main.scene.onBeforeRenderObservable.add(this._invaderShotUpdate);
        }
    }
    static get greenLaserBase() {
        if (!this._greenLaserBase) {
            this._greenLaserBase = BABYLON.MeshBuilder.CreateGround("greenLaser", {
                width: 0.3,
                height: 1.5
            }, Main.instance.scene);
            let greenLaserMaterial = new BABYLON.StandardMaterial("greenLaserMaterial", Main.instance.scene);
            greenLaserMaterial.diffuseTexture = new BABYLON.Texture("textures/green_laser.png", Main.instance.scene);
            greenLaserMaterial.diffuseTexture.hasAlpha = true;
            greenLaserMaterial.useAlphaFromDiffuseTexture;
            this._greenLaserBase.material = greenLaserMaterial;
        }
        return this._greenLaserBase;
    }
    static get blueLaserBase() {
        if (!this._blueLaserBase) {
            this._blueLaserBase = BABYLON.MeshBuilder.CreateGround("blueLaser", {
                width: 0.3,
                height: 1.5
            }, Main.instance.scene);
            let blueLaserMaterial = new BABYLON.StandardMaterial("blueLaserMaterial", Main.instance.scene);
            blueLaserMaterial.diffuseTexture = new BABYLON.Texture("textures/blue_laser.png", Main.instance.scene);
            blueLaserMaterial.diffuseTexture.hasAlpha = true;
            blueLaserMaterial.useAlphaFromDiffuseTexture;
            this._blueLaserBase.material = blueLaserMaterial;
        }
        return this._blueLaserBase;
    }
    static get redLaserBase() {
        if (!this._redLaserBase) {
            this._redLaserBase = BABYLON.MeshBuilder.CreateGround("redLaser", {
                width: 0.3,
                height: 1.5
            }, Main.instance.scene);
            let redLaserMaterial = new BABYLON.StandardMaterial("redLaserMaterial", Main.instance.scene);
            redLaserMaterial.diffuseTexture = new BABYLON.Texture("textures/red_laser.png", Main.instance.scene);
            redLaserMaterial.diffuseTexture.hasAlpha = true;
            redLaserMaterial.useAlphaFromDiffuseTexture;
            this._redLaserBase.material = redLaserMaterial;
        }
        return this._redLaserBase;
    }
    static get purpleLaserBase() {
        if (!this._purpleLaserBase) {
            this._purpleLaserBase = BABYLON.MeshBuilder.CreateGround("purpleLaser", {
                width: 0.3,
                height: 1.5
            }, Main.instance.scene);
            let purpleLaserMaterial = new BABYLON.StandardMaterial("purpleLaserMaterial", Main.instance.scene);
            purpleLaserMaterial.diffuseTexture = new BABYLON.Texture("textures/purple_laser.png", Main.instance.scene);
            purpleLaserMaterial.diffuseTexture.hasAlpha = true;
            purpleLaserMaterial.useAlphaFromDiffuseTexture;
            this._purpleLaserBase.material = purpleLaserMaterial;
        }
        return this._purpleLaserBase;
    }
    get generator() {
        return this.main.invaderGenerator;
    }
    dispose() {
        this.main.scene.onBeforeRenderObservable.removeCallback(this._playerShotUpdate);
        this.main.scene.onBeforeRenderObservable.removeCallback(this._invaderShotUpdate);
        this._instance.dispose();
    }
}
