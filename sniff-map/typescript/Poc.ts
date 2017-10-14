class Poc {

    public buildings: BABYLON.Vector2[][] = [];

    public instantiateBuildings(long: number, lat: number, scene: BABYLON.Scene): void {
        for (let i: number = 0; i < this.buildings.length; i++) {
            let building = this.buildings[i];
            let randomMaterial: BABYLON.StandardMaterial = new BABYLON.StandardMaterial("Random", scene);
            randomMaterial.diffuseColor = BABYLON.Color3.FromHexString("#42c8f4");
            randomMaterial.diffuseColor.r += (Math.random() - 0.5) * 0.3;
            randomMaterial.diffuseColor.g += (Math.random() - 0.5) * 0.3;
            randomMaterial.diffuseColor.b += (Math.random() - 0.5) * 0.3;
            randomMaterial.backFaceCulling = false;
            
            let bMesh: BABYLON.Mesh = new BABYLON.Mesh("Building", scene);
            let data: BABYLON.VertexData = this.extrudeToSolid(building, 0.2 + 0.1 * Math.random());
            data.applyToMesh(bMesh);
            bMesh.material = randomMaterial;
        }
    }

    public extrudeToSolid(points: BABYLON.Vector2[], height: number): BABYLON.VertexData {
        let data: BABYLON.VertexData = new BABYLON.VertexData();

        let positions: number[] = [];
        let indices: number[] = [];

        let center: BABYLON.Vector2 = BABYLON.Vector2.Zero();

        for (let i: number = 0; i < points.length; i++) {
            center.addInPlace(points[i]);
        }
        if (points.length > 0) {
            center.scaleInPlace(1 / points.length);
        }

        positions.push(center.x, height, center.y);

        for (let i: number = 0; i < points.length - 1; i++) {
            let zero: number = positions.length / 3;
            positions.push(points[i].x, 0, points[i].y);
            positions.push(points[i].x, height, points[i].y);
            positions.push(points[i + 1].x, height, points[i + 1].y);
            positions.push(points[i + 1].x, 0, points[i + 1].y);
            indices.push(zero, zero + 1, zero + 2);
            indices.push(zero, zero + 2, zero + 3);
            indices.push(0, zero + 2, zero + 1);
        }

        let zero: number = positions.length / 3;
        positions.push(points[points.length - 1].x, 0, points[points.length - 1].y);
        positions.push(points[points.length - 1].x, height, points[points.length - 1].y);
        positions.push(points[0].x, height, points[0].y);
        positions.push(points[0].x, 0, points[0].y);

        indices.push(zero, zero + 1, zero + 2);
        indices.push(zero, zero + 2, zero + 3);
        indices.push(0, zero + 2, zero + 1);

        data.positions = positions;
        data.indices = indices;

        return data;
    }

    public getDataAt(long: number, lat: number, callback: () => void): void {
        let box: string = (long - 0.004).toFixed(5) + "," + (lat - 0.004).toFixed(5) + "," + (long + 0.004).toFixed(5) + "," + (lat + 0.004).toFixed(5);
        let url: string = "http://api.openstreetmap.org/api/0.6/map?bbox=" + box;
        console.log(url);
        $.ajax(
            {
                url: url,
                success: (data: XMLDocument) => {
                    let mapNodes = new Map<number, BABYLON.Vector2>();
                    console.log("Success");
                    let root = data.firstElementChild;
                    console.log("Root");
                    // console.log(root);
                    console.log("Root has " + root.childElementCount + " children elements.");
                    let nodes = root.children;
                    console.log("Nodes");
                    for (let i: number = 0; i < nodes.length; i++) {
                        if (nodes[i].tagName === "node") {
                            let id: number = parseInt(nodes[i].id);
                            let lLat: number = parseFloat(nodes[i].getAttribute("lat"));
                            let lLong: number = parseFloat(nodes[i].getAttribute("lon"));
                            let coordinates: BABYLON.Vector2 = new BABYLON.Vector2(lLong, lLat);
                            coordinates.x -= long;
                            coordinates.x *= 2000;
                            coordinates.y -= lat;
                            coordinates.y *= 2000;
                            mapNodes.set(id, coordinates);
                        }
                        if (nodes[i].tagName === "way") {
                            let itsBuilding: boolean = false;
                            let nodeIChildren = nodes[i].children;
                            for (let j: number = 0; j < nodeIChildren.length; j++) {
                                if (nodeIChildren[j].tagName === "tag") {
                                    if (nodeIChildren[j].hasAttribute("k")) {
                                        if (nodeIChildren[j].getAttribute("k") === "building") {
                                            itsBuilding = true;
                                            break;
                                        }
                                    }
                                }
                            }
                            if (itsBuilding) {
                                let newBuilding: BABYLON.Vector2[] = [];
                                for (let j: number = 0; j < nodeIChildren.length; j++) {
                                    if (nodeIChildren[j].tagName === "nd") {
                                        let nodeRef: number = parseInt(nodeIChildren[j].getAttribute("ref"));
                                        let node: BABYLON.Vector2 = mapNodes.get(nodeRef);
                                        newBuilding.push(node);
                                    }
                                }
                                this.buildings.push(newBuilding);
                            }
                        }
                    }
                    if (callback) {
                        callback();
                    }
                },
                error: () => {
                    console.log("Error");
                }
            }
        )
    }
}