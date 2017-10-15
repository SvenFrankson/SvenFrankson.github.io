class BuildingData {
    public static instances: BuildingData[] = [];
    public c: BABYLON.Vector2;
    public s: BABYLON.Vector2[];
    public l: number;

    constructor() {
        this.c = BABYLON.Vector2.Zero();
        this.s = [];
        this.l = 1;
    }

    public pushNode(node: BABYLON.Vector2): void {
        this.c.scaleInPlace(this.s.length);
        this.s.push(node);
        this.c.addInPlace(node);
        this.c.scaleInPlace(1 / this.s.length);
    }

    public static instantiateBakeMany(data: BuildingData[], scene: BABYLON.Scene): Building {
        if (data.length === 0) {
            return undefined;
        }
        let rawData = BuildingData.extrudeToSolidRaw(data[0].s, data[0].l * 0.3 + 0.15 * Math.random());
        let vCount: number = rawData.positions.length / 3;
        for (let i: number = 1; i < data.length; i++) {
            let otherRawData = BuildingData.extrudeToSolidRaw(data[i].s, data[i].l * 0.3 + 0.15 * Math.random());
            for (let j: number = 0; j < otherRawData.indices.length; j++) {
                otherRawData.indices[j] += vCount;
            }
            vCount += otherRawData.positions.length / 3;
            rawData.positions.push(...otherRawData.positions);
            rawData.indices.push(...otherRawData.indices);
            rawData.colors.push(...otherRawData.colors);
        }

        let building: Building = new Building(scene);
        building.c = data[0].c.clone();
        let vertexData: BABYLON.VertexData = new BABYLON.VertexData();
        vertexData.positions = rawData.positions;
        vertexData.indices = rawData.indices;
        vertexData.colors = rawData.colors;
        vertexData.applyToMesh(building);
        building.freezeWorldMatrix();

        return building;
    }

    public instantiate(scene: BABYLON.Scene): Building {
        let building: Building = new Building(scene);
        building.c = this.c.clone();
        let data: BABYLON.VertexData = BuildingData.extrudeToSolid(this.s, this.l * 0.3 + 0.15 * Math.random());
        data.applyToMesh(building);
        building.freezeWorldMatrix();

        return building;
    }

    public static extrudeToSolidRaw(
        points: BABYLON.Vector2[], height: number
    ): {positions: number[], indices: number[], colors: number[]} {
        let positions: number[] = [];
        let indices: number[] = [];
        let colors: number[] = [];
        let colorTop: BABYLON.Color4 = BABYLON.Color4.FromHexString("#0FEACAFF");
        let colorBottom: BABYLON.Color4 = BABYLON.Color4.FromHexString("#AD5EECFF");

        for (let i: number = 0; i < points.length; i++) {
            positions.push(points[i].x, height, points[i].y);
            colors.push(colorTop.r, colorTop.g, colorTop.b, colorTop.a);
        }
        for (let i: number = 0; i < points.length; i++) {
            positions.push(points[i].x, 0, points[i].y);
            colors.push(colorBottom.r, colorBottom.g, colorBottom.b, colorBottom.a);
        }

        for (let i: number = 0; i < points.length; i++) {
            let a: number = i + points.length;
            let b: number = i + points.length + 1;
            if (i === points.length - 1) {
                b = points.length;
            }
            let c: number = i + 1;
            if (i === points.length - 1) {
                c = 0;
            }
            let d: number = i;

            indices.push(a, b, c);
            indices.push(a, c, d);
        }

        let topPoints: number[] = [];
        for (let i: number = 0; i < points.length; i++) {
            topPoints.push(points[i].x, points[i].y);
        }
        indices.push(...Earcut.earcut(topPoints, [], 2));

        return {
            positions: positions,
            indices: indices,
            colors: colors
        };
    }

    public static extrudeToSolid(points: BABYLON.Vector2[], height: number): BABYLON.VertexData {
        let data: BABYLON.VertexData = new BABYLON.VertexData();

        let rawData = BuildingData.extrudeToSolidRaw(points, height);

        data.positions = rawData.positions;
        data.indices = rawData.indices;
        data.colors = rawData.colors;

        return data;
    }
}