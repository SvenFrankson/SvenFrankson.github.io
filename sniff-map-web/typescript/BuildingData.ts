class BuildingData {
    public coordinates: BABYLON.Vector2;
    public shape: BABYLON.Vector2[];
    public level: number;

    constructor() {
        this.coordinates = BABYLON.Vector2.Zero();
        this.shape = [];
        this.level = 1;
    }

    public pushNode(node: BABYLON.Vector2): void {
        this.coordinates.scaleInPlace(this.shape.length);
        this.shape.push(node);
        this.coordinates.addInPlace(node);
        this.coordinates.scaleInPlace(1 / this.shape.length);
    }

    public instantiate(scene: BABYLON.Scene): Building {
        let building: Building = new Building(scene);
        building.coordinates = this.coordinates.clone();
        let data: BABYLON.VertexData = BuildingData.extrudeToSolid(this.shape, this.level * 0.2 + 0.1 * Math.random());
        data.applyToMesh(building);
        building.freezeWorldMatrix();

        return building;
    }

    public static extrudeToSolid(points: BABYLON.Vector2[], height: number): BABYLON.VertexData {
        let data: BABYLON.VertexData = new BABYLON.VertexData();

        let positions: number[] = [];
        let indices: number[] = [];
        let colors: number[] = [];

        for (let i: number = 0; i < points.length; i++) {
            positions.push(points[i].x, height, points[i].y);
            colors.push(1, 1, 1, 1);
        }
        for (let i: number = 0; i < points.length; i++) {
            positions.push(points[i].x, 0, points[i].y);
            colors.push(0.3, 0.3, 0.3, 1);
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

        data.positions = positions;
        data.indices = indices;
        data.colors = colors;

        return data;
    }
}