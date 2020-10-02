class Edge {
    constructor() {
        this.orb = false;
        this.lock = false;
        this.border = false;
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
    load() {
        let puzzle = [
            "01001000",
            "10001110",
            "00100001",
            "00000100",
            "00100010",
            "10100010"
        ];
        this.tileCountWidth = puzzle[0].length;
        this.tileCountHeight = puzzle.length;
        this.tiles = [];
        for (let i = 0; i < this.tileCountWidth; i++) {
            this.tiles[i] = [];
            for (let j = 0; j < this.tileCountHeight; j++) {
                this.tiles[i][j] = new Tile(i, j);
                if (puzzle[j][i] === "1") {
                    this.tiles[i][j].orb = true;
                }
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
                }
                if (j + 1 < this.tileCountHeight) {
                    let bottomTile = this.tiles[i][j + 1];
                    let edge = new Edge();
                    this.edges.push(edge);
                    tile.edges[1] = edge;
                    bottomTile.edges[3] = edge;
                }
            }
        }
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
                if (edgeRight && !edgeRight.border && edgeRight.lock) {
                    let x = i * this.tileSize + this.tileSize + this.wallOffset;
                    let y = j * this.tileSize + this.wallOffset;
                    context.save();
                    context.translate(x, y);
                    context.rotate(Math.PI / 2);
                    context.drawImage(this._edgeSprite, 0, -this.tileSize / 6, this.tileSize, this.tileSize / 3);
                    context.restore();
                }
                let edgeBottom = tile.edges[1];
                if (edgeBottom && !edgeBottom.border && edgeBottom.lock) {
                    context.drawImage(this._edgeSprite, i * this.tileSize + this.wallOffset, j * this.tileSize + this.tileSize - this.tileSize / 6 + this.wallOffset, this.tileSize, this.tileSize / 3);
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
        console.log(x + " " + y);
        let edge = game.getEdgeByPointerPosition(x, y);
        if (edge) {
            if (!edge.border) {
                edge.lock = !edge.lock;
                game.updateZones();
                console.log(game.zones.length + " zones found.");
            }
        }
    });
};
