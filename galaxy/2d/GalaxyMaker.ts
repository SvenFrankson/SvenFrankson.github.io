interface ISolvedGalaxy {
    shapes: GalaxyMakerShape[];
    positions: {i: number, j: number}[];
}

class GalaxyMakerShape {

    public width: number;
    public height: number;
    public orbPosition: number; // 0 : Tile, 1 : Edge Right, 2 : Edge Bottom
    public tiles: {i: number, j: number}[] = [];
    public solutionEdges: {i: number, j: number}[] = [];

    public static CreateFromShape(
        shape: string[]
    ): GalaxyMakerShape {
        let galaxyMakerShape = new GalaxyMakerShape();
        galaxyMakerShape.height = shape.length;
        galaxyMakerShape.width = shape[0].length;
        let minW = - Math.floor(galaxyMakerShape.width / 2);
        let minH = - Math.floor(galaxyMakerShape.height / 2);
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

    public updateSolution(): void {
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

    public Clone(): GalaxyMakerShape {
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

    public Rotate(): GalaxyMakerShape {
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

    public MirrorI(): GalaxyMakerShape {
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

    public MirrorJ(): GalaxyMakerShape {
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

    public static SmallShapes: GalaxyMakerShape[];
    public static MediumShapes: GalaxyMakerShape[];
    public static LargeShapes: GalaxyMakerShape[];

    public static InitializeSmallShapes(): void {
        GalaxyMaker.SmallShapes = [
            GalaxyMakerShape.CreateFromShape(
                [
                    "1",
                    "1"
                ]
            ),
            GalaxyMakerShape.CreateFromShape(
                [
                    "11"
                ]
            ),
            GalaxyMakerShape.CreateFromShape(
                [
                    "1",
                    "1",
                    "1"
                ]
            ),
            GalaxyMakerShape.CreateFromShape(
                [
                    "111"
                ]
            )
        ];
    }

    public static InitializeMediumShapes(): void {
        GalaxyMaker.MediumShapes = [
            GalaxyMakerShape.CreateFromShape(
                [
                    "1",
                    "1",
                    "1",
                    "1"
                ]
            ),
            GalaxyMakerShape.CreateFromShape(
                [
                    "1111"
                ]
            ),
            GalaxyMakerShape.CreateFromShape(
                [
                    "11",
                    "11",
                    "11"
                ]
            ),
            GalaxyMakerShape.CreateFromShape(
                [
                    "111",
                    "111"
                ]
            )
        ];

        let s0 = GalaxyMakerShape.CreateFromShape(
            [
                "10",
                "11",
                "01"
            ]
        );
        GalaxyMaker.MediumShapes.push(s0);
        GalaxyMaker.MediumShapes.push(s0.MirrorI());

        let s1 = GalaxyMakerShape.CreateFromShape(
            [
                "110",
                "011"
            ]
        );
        GalaxyMaker.MediumShapes.push(s1);
        GalaxyMaker.MediumShapes.push(s1.MirrorI());
    }

    public static InitializeLargeShapes(): void {
        GalaxyMaker.LargeShapes = [
            GalaxyMakerShape.CreateFromShape(
                [
                    "111",
                    "111",
                    "111",
                ]
            ),
            GalaxyMakerShape.CreateFromShape(
                [
                    "010",
                    "111",
                    "010",
                ]
            ),
            GalaxyMakerShape.CreateFromShape(
                [
                    "111",
                    "111",
                    "111",
                    "111"
                ]
            ),
            GalaxyMakerShape.CreateFromShape(
                [
                    "101",
                    "111",
                    "111",
                    "101"
                ]
            ),
            GalaxyMakerShape.CreateFromShape(
                [
                    "111",
                    "010",
                    "010",
                    "111"
                ]
            ),
            GalaxyMakerShape.CreateFromShape(
                [
                    "010",
                    "111",
                    "111",
                    "010"
                ]
            ),
            GalaxyMakerShape.CreateFromShape(
                [
                    "1111",
                    "1111",
                    "1111",
                ]
            ),
            GalaxyMakerShape.CreateFromShape(
                [
                    "1001",
                    "1111",
                    "1001",
                ]
            ),
            GalaxyMakerShape.CreateFromShape(
                [
                    "1111",
                    "0110",
                    "1111",
                ]
            ),
            GalaxyMakerShape.CreateFromShape(
                [
                    "0110",
                    "1111",
                    "0110",
                ]
            )
        ];
        
        let s0 = GalaxyMakerShape.CreateFromShape(
            [
                "011",
                "111",
                "110",
            ]
        );
        GalaxyMaker.MediumShapes.push(s0);
        GalaxyMaker.MediumShapes.push(s0.MirrorI());
        
        let s1 = GalaxyMakerShape.CreateFromShape(
            [
                "001",
                "111",
                "100",
            ]
        );
        GalaxyMaker.MediumShapes.push(s1);
        GalaxyMaker.MediumShapes.push(s1.MirrorI());
        GalaxyMaker.MediumShapes.push(s1.Rotate());
        GalaxyMaker.MediumShapes.push(s1.Rotate().MirrorI());
        
        let s2 = GalaxyMakerShape.CreateFromShape(
            [
                "101",
                "111",
                "101",
            ]
        );
        GalaxyMaker.MediumShapes.push(s2);
        GalaxyMaker.MediumShapes.push(s2.Rotate());
        
        let s3 = GalaxyMakerShape.CreateFromShape(
            [
                "0111",
                "1111",
                "1110",
            ]
        );
        GalaxyMaker.MediumShapes.push(s3);
        GalaxyMaker.MediumShapes.push(s3.MirrorI());
        
        let s4 = GalaxyMakerShape.CreateFromShape(
            [
                "0011",
                "1111",
                "1100",
            ]
        );
        GalaxyMaker.MediumShapes.push(s4);
        GalaxyMaker.MediumShapes.push(s4.MirrorI());
        
        let s5 = GalaxyMakerShape.CreateFromShape(
            [
                "0001",
                "1111",
                "1000",
            ]
        );
        GalaxyMaker.MediumShapes.push(s5);
        GalaxyMaker.MediumShapes.push(s5.MirrorI());
        
        let s6 = GalaxyMakerShape.CreateFromShape(
            [
                "0011",
                "0110",
                "1100",
            ]
        );
        GalaxyMaker.MediumShapes.push(s6);
        GalaxyMaker.MediumShapes.push(s6.MirrorI());
    }

    public static Generate2(w: number, h: number): ISolvedGalaxy {

        let fillerShape = GalaxyMakerShape.CreateFromShape(["1"]);
        GalaxyMaker.InitializeSmallShapes();
        GalaxyMaker.InitializeMediumShapes();
        GalaxyMaker.InitializeLargeShapes();
        
        let solvedGalaxy: ISolvedGalaxy = {
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

        let canAdd = (shape: GalaxyMakerShape, pI: number, pJ: number) => {
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
        }

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