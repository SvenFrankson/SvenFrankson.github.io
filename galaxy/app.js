class Edge {
    constructor() {
        this.tiles = [];
        this.orb = false;
        this.lock = false;
        this.border = false;
        this.hovered = false;
    }
}
class Tile {
    constructor(i, j) {
        this.i = i;
        this.j = j;
        this.orb = false;
        this.validState = 0;
        this.edges = [];
    }
}
class Galaxy {
    constructor(canvas) {
        this.canvas = canvas;
        this.tileCountWidth = 10;
        this.tileCountHeight = 6;
        this.edges = [];
        document.body.style.backgroundImage = "url(./sprites/background.png)";
        this._tileSprite = document.createElement("img");
        this._tileSprite.src = "./sprites/tile.png";
        this._tileValidSprite = document.createElement("img");
        this._tileValidSprite.src = "./sprites/tile-valid.png";
        this._edgeSprite = document.createElement("img");
        this._edgeSprite.src = "./sprites/light.png";
        this._edgeSpriteHover = document.createElement("img");
        this._edgeSpriteHover.src = "./sprites/light-hover.png";
        this._orbSprite = document.createElement("img");
        this._orbSprite.src = "./sprites/orb.png";
        this._plotSprite = document.createElement("img");
        this._plotSprite.src = "./sprites/plot.png";
        this._wallSprite = document.createElement("img");
        this._wallSprite.src = "./sprites/wall.png";
        this._wallCornerSprite = document.createElement("img");
        this._wallCornerSprite.src = "./sprites/wall-cap.png";
        this._wallCornerSpriteFlip = document.createElement("img");
        this._wallCornerSpriteFlip.src = "./sprites/wall-cap-right.png";
    }
    setHoveredEdge(edge) {
        if (this.hoveredEdge) {
            this.hoveredEdge.hovered = false;
        }
        this.hoveredEdge = edge;
        if (this.hoveredEdge) {
            this.hoveredEdge.hovered = true;
        }
    }
    load(solved = false) {
        this.tileCountWidth = 6 + 2 * Math.floor(Math.random() * 5);
        this.tileCountHeight = 4 + 2 * Math.floor(Math.random() * 4);
        this.tiles = [];
        for (let i = 0; i < this.tileCountWidth; i++) {
            this.tiles[i] = [];
            for (let j = 0; j < this.tileCountHeight; j++) {
                this.tiles[i][j] = new Tile(i, j);
            }
        }
        for (let i = 0; i < this.tileCountWidth; i++) {
            for (let j = 0; j < this.tileCountHeight; j++) {
                let tile = this.tiles[i][j];
                if (i + 1 < this.tileCountWidth) {
                    let rightTile = this.tiles[i + 1][j];
                    let edge = new Edge();
                    this.edges.push(edge);
                    tile.edges[0] = edge;
                    rightTile.edges[2] = edge;
                    edge.tiles = [tile, rightTile];
                }
                if (j + 1 < this.tileCountHeight) {
                    let bottomTile = this.tiles[i][j + 1];
                    let edge = new Edge();
                    this.edges.push(edge);
                    tile.edges[1] = edge;
                    bottomTile.edges[3] = edge;
                    edge.tiles = [tile, bottomTile];
                }
            }
        }
        let galaxy = GalaxyMaker.Generate2(this.tileCountWidth, this.tileCountHeight);
        let orbCount = 0;
        let borderedOrbCount = 0;
        for (let i = 0; i < galaxy.shapes.length; i++) {
            let I = galaxy.positions[i].i;
            let J = galaxy.positions[i].j;
            let shape = galaxy.shapes[i];
            if (shape.orbPosition === 0) {
                this.tiles[I][J].orb = true;
                orbCount++;
                if (I === 0 || J === 0 || I === this.tileCountWidth - 1 || J === this.tileCountHeight) {
                    borderedOrbCount++;
                }
            }
            if (shape.orbPosition === 1) {
                this.tiles[I][J].edges[0].orb = true;
                orbCount++;
                if (J === 0 || J === this.tileCountHeight) {
                    borderedOrbCount++;
                }
            }
            if (shape.orbPosition === 2) {
                this.tiles[I][J].edges[1].orb = true;
                orbCount++;
                if (I === 0 || I === this.tileCountWidth - 1) {
                    borderedOrbCount++;
                }
            }
            if (solved) {
                for (let j = 0; j < shape.solutionEdges.length; j++) {
                    let edge = shape.solutionEdges[j];
                    let index = I + Math.floor(edge.i / 2);
                    let jndex = J + Math.floor(edge.j / 2);
                    if (edge.i % 2 === 0) {
                        if (index >= 0 && index < this.tileCountWidth) {
                            if (jndex >= 0 && jndex < this.tileCountHeight) {
                                if (this.tiles[index][jndex].edges[1]) {
                                    this.tiles[index][jndex].edges[1].lock = true;
                                }
                            }
                        }
                    }
                    if (edge.j % 2 === 0) {
                        if (index >= 0 && index < this.tileCountWidth) {
                            if (jndex >= 0 && jndex < this.tileCountHeight) {
                                if (this.tiles[index][jndex].edges[0]) {
                                    this.tiles[index][jndex].edges[0].lock = true;
                                }
                            }
                        }
                    }
                }
            }
        }
        let density = orbCount / (this.tileCountWidth * this.tileCountHeight) * 100;
        document.getElementById("density").innerText = "DENSITY " + density.toFixed(0) + "%";
        let borderedOrb = borderedOrbCount / orbCount * 100;
        document.getElementById("bordered-orbs").innerText = "BORDER " + borderedOrb.toFixed(0) + "%";
        let clientWidth = window.innerWidth;
        let clientHeight = window.innerHeight;
        let canvasWidth = window.innerWidth * 0.8;
        let canvasHeight = window.innerHeight * 0.8;
        if (canvasWidth < 600) {
            canvasWidth = Math.min(600, clientWidth);
        }
        if (canvasHeight < 600) {
            canvasHeight = Math.min(600, clientHeight);
        }
        this.tileSize = Math.min(canvasWidth / this.tileCountWidth, canvasHeight / this.tileCountHeight);
        this.tileSize = Math.min(this.tileSize, 128);
        this.tileSize = Math.floor(this.tileSize);
        this.plotSize = this.tileSize / 3.5;
        this.wallOffset = this.tileSize / 4;
        this.wallSize = this.tileSize / 3;
        this.canvas.width = this.tileSize * this.tileCountWidth + 2 * this.wallOffset;
        this.canvas.height = this.tileSize * this.tileCountHeight + 2 * this.wallOffset;
        this.canvas.style.position = "fixed";
        this.canvas.style.left = Math.floor((clientWidth - this.canvas.width) * 0.5) + "px";
        this.canvas.style.top = Math.floor((clientHeight - this.canvas.height) * 0.5) + "px";
        this.updateZones();
    }
    getEdgeByPointerPosition(x, y) {
        x -= this.wallOffset;
        y -= this.wallOffset;
        let dx = Math.abs(x - Math.round(x / this.tileSize) * this.tileSize);
        let dy = Math.abs(y - Math.round(y / this.tileSize) * this.tileSize);
        if (dx < dy) {
            let i = Math.round(x / this.tileSize) - 1;
            let j = Math.floor(y / this.tileSize);
            if (i >= 0 && i < this.tileCountWidth && j >= 0 && j < this.tileCountHeight) {
                let tile = this.tiles[i][j];
                return tile.edges[0];
            }
        }
        else {
            let i = Math.floor(x / this.tileSize);
            let j = Math.round(y / this.tileSize) - 1;
            if (i >= 0 && i < this.tileCountWidth && j >= 0 && j < this.tileCountHeight) {
                let tile = this.tiles[i][j];
                return tile.edges[1];
            }
        }
    }
    addAdjacentsToZone(tile, zone, allTiles) {
        let edgeRight = tile.edges[0];
        if (edgeRight && !edgeRight.border && !edgeRight.lock) {
            let tileRight = this.tiles[tile.i + 1][tile.j];
            let i = allTiles.indexOf(tileRight);
            if (i != -1) {
                zone.push(tileRight);
                allTiles.splice(i, 1);
                this.addAdjacentsToZone(tileRight, zone, allTiles);
            }
        }
        let edgeBottom = tile.edges[1];
        if (edgeBottom && !edgeBottom.border && !edgeBottom.lock) {
            let tileBottom = this.tiles[tile.i][tile.j + 1];
            let i = allTiles.indexOf(tileBottom);
            if (i != -1) {
                zone.push(tileBottom);
                allTiles.splice(i, 1);
                this.addAdjacentsToZone(tileBottom, zone, allTiles);
            }
        }
        let edgeLeft = tile.edges[2];
        if (edgeLeft && !edgeLeft.border && !edgeLeft.lock) {
            let tileLeft = this.tiles[tile.i - 1][tile.j];
            let i = allTiles.indexOf(tileLeft);
            if (i != -1) {
                zone.push(tileLeft);
                allTiles.splice(i, 1);
                this.addAdjacentsToZone(tileLeft, zone, allTiles);
            }
        }
        let edgeTop = tile.edges[3];
        if (edgeTop && !edgeTop.border && !edgeTop.lock) {
            let tileTop = this.tiles[tile.i][tile.j - 1];
            let i = allTiles.indexOf(tileTop);
            if (i != -1) {
                zone.push(tileTop);
                allTiles.splice(i, 1);
                this.addAdjacentsToZone(tileTop, zone, allTiles);
            }
        }
    }
    updateZones() {
        let allTiles = [];
        for (let i = 0; i < this.tiles.length; i++) {
            for (let j = 0; j < this.tiles[i].length; j++) {
                let tile = this.tiles[i][j];
                allTiles.push(tile);
            }
        }
        this.zones = [];
        while (allTiles.length > 0) {
            let zone = [];
            let t = allTiles.pop();
            zone.push(t);
            this.addAdjacentsToZone(t, zone, allTiles);
            this.zones.push(zone);
        }
    }
    isZoneValid(zone) {
        let hasOrb = false;
        let pivotI = -1;
        let pivotJ = -1;
        for (let i = 0; i < zone.length; i++) {
            let tile = zone[i];
            if (tile.orb) {
                if (hasOrb) {
                    return false;
                }
                hasOrb = true;
                pivotI = tile.i;
                pivotJ = tile.j;
            }
            let rightTile = zone.find(t => { return t.i === tile.i + 1 && t.j === tile.j; });
            if (rightTile) {
                let rightEdge = tile.edges[0];
                if (rightEdge && rightEdge.orb) {
                    if (hasOrb) {
                        return false;
                    }
                    hasOrb = true;
                    pivotI = tile.i + 0.5;
                    pivotJ = tile.j;
                }
            }
            let bottomTile = zone.find(t => { return t.i === tile.i && t.j === tile.j + 1; });
            if (bottomTile) {
                let bottomEdge = tile.edges[1];
                if (bottomEdge && bottomEdge.orb) {
                    if (hasOrb) {
                        return false;
                    }
                    hasOrb = true;
                    pivotI = tile.i;
                    pivotJ = tile.j + 0.5;
                }
            }
        }
        if (!hasOrb) {
            return false;
        }
        for (let i = 0; i < zone.length; i++) {
            let tile = zone[i];
            let mirrorI = 2 * pivotI - tile.i;
            let mirrorJ = 2 * pivotJ - tile.j;
            if (!zone.find(t => {
                return t.i === mirrorI && t.j === mirrorJ;
            })) {
                return false;
            }
        }
        return true;
    }
    redraw() {
        let context = this.canvas.getContext("2d");
        let w = this.canvas.width;
        let h = this.canvas.height;
        context.clearRect(0, 0, w, h);
        for (let i = 0; i < this.zones.length; i++) {
            let zone = this.zones[i];
            let zoneValid = this.isZoneValid(zone);
            for (let j = 0; j < zone.length; j++) {
                let tile = zone[j];
                if (zoneValid) {
                    context.drawImage(this._tileValidSprite, tile.i * this.tileSize + this.wallOffset, tile.j * this.tileSize + this.wallOffset, this.tileSize, this.tileSize);
                }
                else {
                    context.drawImage(this._tileSprite, tile.i * this.tileSize + this.wallOffset, tile.j * this.tileSize + this.wallOffset, this.tileSize, this.tileSize);
                }
                if (tile.orb) {
                    context.drawImage(this._orbSprite, tile.i * this.tileSize + this.wallOffset, tile.j * this.tileSize + this.wallOffset, this.tileSize, this.tileSize);
                }
            }
        }
        for (let i = 0; i < this.tiles.length; i++) {
            for (let j = 0; j < this.tiles[i].length; j++) {
                let tile = this.tiles[i][j];
                let edgeRight = tile.edges[0];
                if (edgeRight && !edgeRight.border && (edgeRight.lock || edgeRight.hovered && !edgeRight.orb)) {
                    let x = i * this.tileSize + this.tileSize + this.wallOffset;
                    let y = j * this.tileSize + this.wallOffset;
                    context.save();
                    context.translate(x, y);
                    context.rotate(Math.PI / 2);
                    context.drawImage(edgeRight.lock ? this._edgeSprite : this._edgeSpriteHover, 0, -this.tileSize / 6, this.tileSize, this.tileSize / 3);
                    context.restore();
                }
                if (edgeRight && edgeRight.orb) {
                    context.drawImage(this._orbSprite, tile.i * this.tileSize + this.tileSize * 0.5 + this.wallOffset, tile.j * this.tileSize + this.wallOffset, this.tileSize, this.tileSize);
                }
                let edgeBottom = tile.edges[1];
                if (edgeBottom && !edgeBottom.border && (edgeBottom.lock || edgeBottom.hovered && !edgeBottom.orb)) {
                    context.drawImage(edgeBottom.lock ? this._edgeSprite : this._edgeSpriteHover, i * this.tileSize + this.wallOffset, j * this.tileSize + this.tileSize - this.tileSize / 6 + this.wallOffset, this.tileSize, this.tileSize / 3);
                }
                if (edgeBottom && edgeBottom.orb) {
                    context.drawImage(this._orbSprite, tile.i * this.tileSize + this.wallOffset, tile.j * this.tileSize + this.tileSize * 0.5 + this.wallOffset, this.tileSize, this.tileSize);
                }
            }
        }
        for (let i = 0; i < this.tileCountWidth + 1; i++) {
            for (let j = 0; j < this.tileCountHeight + 1; j++) {
                context.drawImage(this._plotSprite, i * this.tileSize - this.plotSize / 2 + this.wallOffset, j * this.tileSize - this.plotSize / 2 + this.wallOffset, this.plotSize, this.plotSize);
            }
        }
        for (let i = 0; i < this.tileCountHeight; i++) {
            context.drawImage(this._wallSprite, 0, i * this.tileSize + this.wallOffset, this.wallSize, this.tileSize);
            let x = this.tileCountWidth * this.tileSize + 2 * this.wallOffset;
            let y = (i + 1) * this.tileSize + this.wallOffset;
            context.save();
            context.translate(x, y);
            context.rotate(Math.PI);
            context.drawImage(this._wallSprite, 0, 0, this.wallSize, this.tileSize);
            context.restore();
        }
        for (let i = 0; i < this.tileCountWidth; i++) {
            let x = i * this.tileSize + this.wallOffset;
            let y = this.tileCountHeight * this.tileSize + 2 * this.wallOffset;
            context.save();
            context.translate(x, y);
            context.rotate(-Math.PI / 2);
            context.drawImage(this._wallSprite, 0, 0, this.wallSize, this.tileSize);
            context.restore();
            x = (i + 1) * this.tileSize + this.wallOffset;
            y = 0;
            context.save();
            context.translate(x, y);
            context.rotate(Math.PI / 2);
            context.drawImage(this._wallSprite, 0, 0, this.wallSize, this.tileSize);
            context.restore();
        }
        context.drawImage(this._wallCornerSprite, 0, 0, this.wallSize, this.wallOffset);
        context.drawImage(this._wallCornerSpriteFlip, 0, this.tileCountHeight * this.tileSize + this.wallOffset, this.wallSize, this.wallOffset);
        context.save();
        context.translate(this.tileCountWidth * this.tileSize + 2 * this.wallOffset, this.wallOffset);
        context.rotate(Math.PI);
        context.drawImage(this._wallCornerSpriteFlip, 0, 0, this.wallSize, this.wallOffset);
        context.restore();
        context.save();
        context.translate(this.tileCountWidth * this.tileSize + 2 * this.wallOffset, this.tileCountHeight * this.tileSize + 2 * this.wallOffset);
        context.rotate(Math.PI);
        context.drawImage(this._wallCornerSprite, 0, 0, this.wallSize, this.wallOffset);
        context.restore();
    }
}
window.onload = () => {
    let game = new Galaxy(document.getElementsByTagName("canvas")[0]);
    game.load();
    setInterval(() => {
        game.redraw();
    }, 15);
    game.canvas.addEventListener("pointerup", (e) => {
        let x = e.clientX - game.canvas.offsetLeft;
        let y = e.clientY - game.canvas.offsetTop;
        let edge = game.getEdgeByPointerPosition(x, y);
        if (edge) {
            if (!edge.border && !edge.orb) {
                edge.lock = !edge.lock;
                game.updateZones();
            }
        }
    });
    game.canvas.addEventListener("pointermove", (e) => {
        let x = e.clientX - game.canvas.offsetLeft;
        let y = e.clientY - game.canvas.offsetTop;
        let edge = game.getEdgeByPointerPosition(x, y);
        game.setHoveredEdge(edge);
    });
    document.getElementById("random").onclick = () => {
        game.load();
    };
    document.getElementById("random-solved").onclick = () => {
        game.load(true);
    };
};
class GalaxyMakerShape {
    constructor() {
        this.tiles = [];
        this.solutionEdges = [];
    }
    static CreateFromShape(shape) {
        let galaxyMakerShape = new GalaxyMakerShape();
        galaxyMakerShape.height = shape.length;
        galaxyMakerShape.width = shape[0].length;
        let minW = -Math.floor(galaxyMakerShape.width / 2);
        let minH = -Math.floor(galaxyMakerShape.height / 2);
        if (galaxyMakerShape.height % 2 === 1 && galaxyMakerShape.width % 2 === 1) {
            galaxyMakerShape.orbPosition = 0;
            for (let j = 0; j < galaxyMakerShape.height; j++) {
                for (let i = 0; i < galaxyMakerShape.width; i++) {
                    let v = shape[j][i];
                    if (v === "1") {
                        galaxyMakerShape.tiles.push({
                            i: (minW + i) * 2,
                            j: (minH + j) * 2
                        });
                    }
                }
            }
        }
        else if (galaxyMakerShape.height % 2 === 1 && galaxyMakerShape.width % 2 === 0) {
            galaxyMakerShape.orbPosition = 1;
            for (let j = 0; j < galaxyMakerShape.height; j++) {
                for (let i = 0; i < galaxyMakerShape.width; i++) {
                    let v = shape[j][i];
                    if (v === "1") {
                        galaxyMakerShape.tiles.push({
                            i: (minW + i + 1) * 2,
                            j: (minH + j) * 2
                        });
                    }
                }
            }
        }
        else if (galaxyMakerShape.height % 2 === 0 && galaxyMakerShape.width % 2 === 1) {
            galaxyMakerShape.orbPosition = 2;
            for (let j = 0; j < galaxyMakerShape.height; j++) {
                for (let i = 0; i < galaxyMakerShape.width; i++) {
                    let v = shape[j][i];
                    if (v === "1") {
                        galaxyMakerShape.tiles.push({
                            i: (minW + i) * 2,
                            j: (minH + j + 1) * 2
                        });
                    }
                }
            }
        }
        galaxyMakerShape.updateSolution();
        return galaxyMakerShape;
    }
    updateSolution() {
        this.solutionEdges = [];
        for (let i = 0; i < this.tiles.length; i++) {
            let tile = this.tiles[i];
            if (!this.tiles.find(t => { return t.i === tile.i - 2 && t.j === tile.j; })) {
                this.solutionEdges.push({ i: tile.i - 1, j: tile.j });
            }
            if (!this.tiles.find(t => { return t.i === tile.i && t.j === tile.j - 2; })) {
                this.solutionEdges.push({ i: tile.i, j: tile.j - 1 });
            }
            if (!this.tiles.find(t => { return t.i === tile.i + 2 && t.j === tile.j; })) {
                this.solutionEdges.push({ i: tile.i + 1, j: tile.j });
            }
            if (!this.tiles.find(t => { return t.i === tile.i && t.j === tile.j + 2; })) {
                this.solutionEdges.push({ i: tile.i, j: tile.j + 1 });
            }
        }
    }
    Clone() {
        let shape = new GalaxyMakerShape();
        shape.width = this.width;
        shape.height = this.height;
        shape.orbPosition = this.orbPosition;
        shape.tiles = [];
        for (let i = 0; i < this.tiles.length; i++) {
            shape.tiles.push({
                i: this.tiles[i].i,
                j: this.tiles[i].j
            });
        }
        shape.updateSolution();
        return shape;
    }
    Rotate() {
        let shape = this.Clone();
        for (let i = 0; i < this.tiles.length; i++) {
            let pI = shape.tiles[i].i;
            let pJ = shape.tiles[i].j;
            shape.tiles[i].i = -pJ;
            shape.tiles[i].j = pI;
        }
        shape.updateSolution();
        return shape;
    }
    MirrorI() {
        let shape = this.Clone();
        for (let i = 0; i < this.tiles.length; i++) {
            shape.tiles[i].i *= -1;
            if (shape.orbPosition === 1) {
                shape.tiles[i].i += 2;
            }
        }
        shape.updateSolution();
        return shape;
    }
    MirrorJ() {
        let shape = this.Clone();
        for (let i = 0; i < this.tiles.length; i++) {
            shape.tiles[i].j *= -1;
            if (shape.orbPosition === 2) {
                shape.tiles[i].j += 2;
            }
        }
        shape.updateSolution();
        return shape;
    }
}
class GalaxyMaker {
    static InitializeSmallShapes() {
        GalaxyMaker.SmallShapes = [
            GalaxyMakerShape.CreateFromShape([
                "1",
                "1"
            ]),
            GalaxyMakerShape.CreateFromShape([
                "11"
            ]),
            GalaxyMakerShape.CreateFromShape([
                "1",
                "1",
                "1"
            ]),
            GalaxyMakerShape.CreateFromShape([
                "111"
            ])
        ];
    }
    static InitializeMediumShapes() {
        GalaxyMaker.MediumShapes = [
            GalaxyMakerShape.CreateFromShape([
                "1",
                "1",
                "1",
                "1"
            ]),
            GalaxyMakerShape.CreateFromShape([
                "1111"
            ]),
            GalaxyMakerShape.CreateFromShape([
                "11",
                "11",
                "11"
            ]),
            GalaxyMakerShape.CreateFromShape([
                "111",
                "111"
            ])
        ];
        let s0 = GalaxyMakerShape.CreateFromShape([
            "10",
            "11",
            "01"
        ]);
        GalaxyMaker.MediumShapes.push(s0);
        GalaxyMaker.MediumShapes.push(s0.MirrorI());
        let s1 = GalaxyMakerShape.CreateFromShape([
            "110",
            "011"
        ]);
        GalaxyMaker.MediumShapes.push(s1);
        GalaxyMaker.MediumShapes.push(s1.MirrorI());
    }
    static InitializeLargeShapes() {
        GalaxyMaker.LargeShapes = [
            GalaxyMakerShape.CreateFromShape([
                "111",
                "111",
                "111",
            ]),
            GalaxyMakerShape.CreateFromShape([
                "010",
                "111",
                "010",
            ]),
            GalaxyMakerShape.CreateFromShape([
                "111",
                "111",
                "111",
                "111"
            ]),
            GalaxyMakerShape.CreateFromShape([
                "101",
                "111",
                "111",
                "101"
            ]),
            GalaxyMakerShape.CreateFromShape([
                "111",
                "010",
                "010",
                "111"
            ]),
            GalaxyMakerShape.CreateFromShape([
                "010",
                "111",
                "111",
                "010"
            ]),
            GalaxyMakerShape.CreateFromShape([
                "1111",
                "1111",
                "1111",
            ]),
            GalaxyMakerShape.CreateFromShape([
                "1001",
                "1111",
                "1001",
            ]),
            GalaxyMakerShape.CreateFromShape([
                "1111",
                "0110",
                "1111",
            ]),
            GalaxyMakerShape.CreateFromShape([
                "0110",
                "1111",
                "0110",
            ])
        ];
        let s0 = GalaxyMakerShape.CreateFromShape([
            "011",
            "111",
            "110",
        ]);
        GalaxyMaker.MediumShapes.push(s0);
        GalaxyMaker.MediumShapes.push(s0.MirrorI());
        let s1 = GalaxyMakerShape.CreateFromShape([
            "001",
            "111",
            "100",
        ]);
        GalaxyMaker.MediumShapes.push(s1);
        GalaxyMaker.MediumShapes.push(s1.MirrorI());
        GalaxyMaker.MediumShapes.push(s1.Rotate());
        GalaxyMaker.MediumShapes.push(s1.Rotate().MirrorI());
        let s2 = GalaxyMakerShape.CreateFromShape([
            "101",
            "111",
            "101",
        ]);
        GalaxyMaker.MediumShapes.push(s2);
        GalaxyMaker.MediumShapes.push(s2.Rotate());
        let s3 = GalaxyMakerShape.CreateFromShape([
            "0111",
            "1111",
            "1110",
        ]);
        GalaxyMaker.MediumShapes.push(s3);
        GalaxyMaker.MediumShapes.push(s3.MirrorI());
        let s4 = GalaxyMakerShape.CreateFromShape([
            "0011",
            "1111",
            "1100",
        ]);
        GalaxyMaker.MediumShapes.push(s4);
        GalaxyMaker.MediumShapes.push(s4.MirrorI());
        let s5 = GalaxyMakerShape.CreateFromShape([
            "0001",
            "1111",
            "1000",
        ]);
        GalaxyMaker.MediumShapes.push(s5);
        GalaxyMaker.MediumShapes.push(s5.MirrorI());
        let s6 = GalaxyMakerShape.CreateFromShape([
            "0011",
            "0110",
            "1100",
        ]);
        GalaxyMaker.MediumShapes.push(s6);
        GalaxyMaker.MediumShapes.push(s6.MirrorI());
    }
    static Generate2(w, h) {
        let fillerShape = GalaxyMakerShape.CreateFromShape(["1"]);
        GalaxyMaker.InitializeSmallShapes();
        GalaxyMaker.InitializeMediumShapes();
        GalaxyMaker.InitializeLargeShapes();
        let solvedGalaxy = {
            shapes: [],
            positions: []
        };
        let grid = [];
        for (let i = 0; i < w; i++) {
            grid[i] = [];
            for (let j = 0; j < h; j++) {
                grid[i][j] = true;
            }
        }
        let canAdd = (shape, pI, pJ) => {
            for (let t = 0; t < shape.tiles.length; t++) {
                let ii = pI + Math.floor(shape.tiles[t].i / 2);
                let jj = pJ + Math.floor(shape.tiles[t].j / 2);
                if (ii < 0 || jj < 0 || ii >= w || jj >= h) {
                    debugger;
                }
                if (!grid[ii][jj]) {
                    return false;
                }
            }
            return true;
        };
        let shapeCountRatio = w * h / 80;
        let largeShapeCount = 0;
        let largeShapeMaxCount = Math.floor((3 + Math.floor(Math.random() * 3)) * shapeCountRatio);
        let attempts = 0;
        while (largeShapeCount < largeShapeMaxCount && attempts < 100 * largeShapeMaxCount) {
            attempts++;
            let shape = GalaxyMaker.LargeShapes[Math.floor(Math.random() * GalaxyMaker.LargeShapes.length)];
            let pI = Math.floor(Math.random() * (w - shape.width) + shape.width / 2);
            let pJ = Math.floor(Math.random() * (h - shape.height) + shape.height / 2);
            if (shape.orbPosition === 2) {
                pJ--;
            }
            let position = { i: pI, j: pJ };
            if (canAdd(shape, pI, pJ)) {
                for (let t = 0; t < shape.tiles.length; t++) {
                    let ii = pI + Math.floor(shape.tiles[t].i / 2);
                    let jj = pJ + Math.floor(shape.tiles[t].j / 2);
                    grid[ii][jj] = false;
                }
                largeShapeCount++;
                solvedGalaxy.shapes.push(shape);
                solvedGalaxy.positions.push(position);
            }
        }
        let mediumShapeCount = 0;
        let mediumShapeMaxCount = Math.floor((5 + Math.floor(Math.random() * 5)) * shapeCountRatio);
        attempts = 0;
        while (mediumShapeCount < mediumShapeMaxCount && attempts < 100 * mediumShapeMaxCount) {
            attempts++;
            let shape = GalaxyMaker.MediumShapes[Math.floor(Math.random() * GalaxyMaker.MediumShapes.length)];
            let pI = Math.floor(Math.random() * (w - shape.width) + shape.width / 2);
            let pJ = Math.floor(Math.random() * (h - shape.height) + shape.height / 2);
            if (shape.orbPosition === 2) {
                pJ--;
            }
            let position = { i: pI, j: pJ };
            if (canAdd(shape, pI, pJ)) {
                for (let t = 0; t < shape.tiles.length; t++) {
                    let ii = pI + Math.floor(shape.tiles[t].i / 2);
                    let jj = pJ + Math.floor(shape.tiles[t].j / 2);
                    grid[ii][jj] = false;
                }
                mediumShapeCount++;
                solvedGalaxy.shapes.push(shape);
                solvedGalaxy.positions.push(position);
            }
        }
        let smallShapeCount = 0;
        let smallShapeMaxCount = Math.floor((20 + Math.floor(Math.random() * 11)) * shapeCountRatio);
        attempts = 0;
        while (smallShapeCount < smallShapeMaxCount && attempts < 100 * smallShapeMaxCount) {
            attempts++;
            let shape = GalaxyMaker.SmallShapes[Math.floor(Math.random() * GalaxyMaker.SmallShapes.length)];
            let pI = Math.floor(Math.random() * (w - shape.width) + shape.width / 2);
            let pJ = Math.floor(Math.random() * (h - shape.height) + shape.height / 2);
            if (shape.orbPosition === 2) {
                pJ--;
            }
            let position = { i: pI, j: pJ };
            if (canAdd(shape, pI, pJ)) {
                for (let t = 0; t < shape.tiles.length; t++) {
                    let ii = pI + Math.floor(shape.tiles[t].i / 2);
                    let jj = pJ + Math.floor(shape.tiles[t].j / 2);
                    grid[ii][jj] = false;
                }
                smallShapeCount++;
                solvedGalaxy.shapes.push(shape);
                solvedGalaxy.positions.push(position);
            }
        }
        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                if (grid[i][j]) {
                    solvedGalaxy.shapes.push(fillerShape);
                    solvedGalaxy.positions.push({ i: i, j: j });
                }
            }
        }
        return solvedGalaxy;
    }
}
