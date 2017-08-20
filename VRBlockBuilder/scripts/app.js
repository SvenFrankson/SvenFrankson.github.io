class Brick extends BABYLON.Mesh {
    constructor(c, width, height, length, orientation, color, save = true) {
        super("Brick", Main.Scene);
        this.coordinates = BABYLON.Vector3.Zero();
        console.log("Add new Brick at " + c.x + " " + c.y + " " + c.z);
        this.coordinates.copyFrom(c);
        this.width = width;
        this.height = height;
        this.length = length;
        this.orientation = orientation;
        this.rotation.y = orientation * Math.PI / 2;
        BrickData.CubicalData(width, height, length).applyToMesh(this);
        this.position = Brick.BrickCoordinatesToWorldPos(c);
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                for (let k = 0; k < length; k++) {
                    Brick.Occupy(c.add(VRMath.RotateVector3(new BABYLON.Vector3(i, j, k), orientation)));
                }
            }
        }
        this.material = BrickMaterial.GetMaterial(color);
        this.Unlit();
        this.freezeWorldMatrix();
        Brick.instances.push(this);
        if (save) {
            SaveManager.Save();
        }
    }
    static WorldPosToBrickCoordinates(worldPosition) {
        let coordinates = BABYLON.Vector3.Zero();
        coordinates.x = Math.round(worldPosition.x / Config.XSize);
        coordinates.y = Math.round(worldPosition.y / Config.YSize);
        coordinates.z = Math.round(worldPosition.z / Config.ZSize);
        return coordinates;
    }
    static BrickCoordinatesToWorldPos(coordinates) {
        let worldPosition = BABYLON.Vector3.Zero();
        worldPosition.x = coordinates.x * Config.XSize;
        worldPosition.y = coordinates.y * Config.YSize;
        worldPosition.z = coordinates.z * Config.ZSize;
        return worldPosition;
    }
    static IsOccupied(c) {
        if (Brick.grid[c.x] === undefined) {
            return false;
        }
        if (Brick.grid[c.x][c.y] === undefined) {
            return false;
        }
        if (Brick.grid[c.x][c.y][c.z] === true) {
            return true;
        }
        return false;
    }
    static Occupy(c) {
        if (Brick.grid[c.x] === undefined) {
            Brick.grid[c.x] = [];
        }
        if (Brick.grid[c.x][c.y] === undefined) {
            Brick.grid[c.x][c.y] = [];
        }
        Brick.grid[c.x][c.y][c.z] = true;
    }
    static Free(c) {
        if (Brick.grid[c.x] === undefined) {
            Brick.grid[c.x] = [];
        }
        if (Brick.grid[c.x][c.y] === undefined) {
            Brick.grid[c.x][c.y] = [];
        }
        Brick.grid[c.x][c.y][c.z] = false;
    }
    static TryAdd(c, width, height, length, orientation, color) {
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                for (let k = 0; k < length; k++) {
                    if (Brick.IsOccupied(c.add(VRMath.RotateVector3(new BABYLON.Vector3(i, j, k), orientation)))) {
                        return undefined;
                    }
                }
            }
        }
        let brick = new Brick(c, width, height, length, orientation, color);
        return brick;
    }
    static Serialize() {
        let serialized = [];
        Brick.instances.forEach((b) => {
            serialized.push(b.Serialize());
        });
        return serialized;
    }
    static UnserializeArray(serialized, save = false) {
        serialized.forEach((data) => {
            Brick.Unserialize(data, save);
        });
    }
    get color() {
        if (this.material instanceof BABYLON.StandardMaterial) {
            return this.material.diffuseColor.toHexString();
        }
    }
    set color(c) {
        this.material = BrickMaterial.GetMaterial(c);
        SaveManager.Save();
    }
    Dispose() {
        this.dispose();
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                for (let k = 0; k < this.length; k++) {
                    Brick.Free(this.coordinates.add(VRMath.RotateVector3(new BABYLON.Vector3(i, j, k), this.orientation)));
                }
            }
        }
        let index = Brick.instances.indexOf(this);
        if (index !== -1) {
            Brick.instances.splice(index, 1);
        }
    }
    Hightlight(color) {
        this.renderOutline = true;
        this.outlineColor.copyFrom(color);
        this.outlineWidth = 0.02;
    }
    Unlit() {
        this.renderOutline = true;
        this.outlineColor.copyFromFloats(0, 0, 0);
        this.outlineWidth = 0.02;
    }
    static UnlitAll() {
        Brick.instances.forEach((b) => {
            b.Unlit();
        });
    }
    Serialize() {
        return {
            i: this.coordinates.x,
            j: this.coordinates.y,
            k: this.coordinates.z,
            orientation: this.orientation,
            width: this.width,
            height: this.height,
            length: this.length,
            color: this.color
        };
    }
    static Unserialize(data, save = true) {
        let coordinates = new BABYLON.Vector3(data.i, data.j, data.k);
        return new Brick(coordinates, data.width, data.height, data.length, data.orientation, data.color, save);
    }
}
Brick.instances = [];
Brick.grid = [];
class BrickData {
    static VertexDataFromJSON(jsonData) {
        let tmp = JSON.parse(jsonData);
        let vertexData = new BABYLON.VertexData();
        vertexData.positions = tmp.positions;
        vertexData.normals = tmp.normals;
        for (let i = 0; i < vertexData.normals.length; i++) {
            vertexData.positions[i] = vertexData.positions[i] / 100.0;
            vertexData.normals[i] = vertexData.normals[i] / 100.0;
        }
        vertexData.indices = tmp.indices;
        return vertexData;
    }
    static CubicalData(width, height, length) {
        let cubeData = new BABYLON.VertexData();
        let vertices = new Array();
        let positions = new Array();
        let indices = new Array();
        vertices[0] = new Array(-0.5, -0.5, -0.5);
        vertices[1] = new Array(-0.5 + width, -0.5, -0.5);
        vertices[2] = new Array(-0.5 + width, -0.5, -0.5 + length);
        vertices[3] = new Array(-0.5, -0.5, -0.5 + length);
        vertices[4] = new Array(-0.5, -0.5 + height, -0.5);
        vertices[5] = new Array(-0.5 + width, -0.5 + height, -0.5);
        vertices[6] = new Array(-0.5 + width, -0.5 + height, -0.5 + length);
        vertices[7] = new Array(-0.5, -0.5 + height, -0.5 + length);
        for (let i = 0; i < vertices.length; i++) {
            vertices[i][0] = vertices[i][0] * Config.XSize;
            vertices[i][1] = vertices[i][1] * Config.YSize;
            vertices[i][2] = vertices[i][2] * Config.ZSize;
        }
        BrickData.PushQuad(vertices, 0, 1, 2, 3, positions, indices);
        BrickData.PushQuad(vertices, 1, 5, 6, 2, positions, indices);
        BrickData.PushQuad(vertices, 5, 4, 7, 6, positions, indices);
        BrickData.PushQuad(vertices, 0, 4, 5, 1, positions, indices);
        BrickData.PushQuad(vertices, 3, 7, 4, 0, positions, indices);
        BrickData.PushQuad(vertices, 2, 6, 7, 3, positions, indices);
        for (let i = 0; i < width; i++) {
            for (let k = 0; k < length; k++) {
                BrickData.PushSlot(i, height - 1, k, positions, indices);
            }
        }
        let normals = new Array();
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        cubeData.positions = positions;
        cubeData.indices = indices;
        cubeData.normals = normals;
        return cubeData;
    }
    static SlideData(width, height, length) {
        let slideData = new BABYLON.VertexData();
        let vertices = new Array();
        let positions = new Array();
        let indices = new Array();
        vertices[0] = new Array(-0.5, -0.5, -0.5);
        vertices[1] = new Array(-0.5 + width / 2, -0.5, -0.5);
        vertices[2] = new Array(-0.5 + width / 2, -0.5, -0.5 + length);
        vertices[3] = new Array(-0.5, -0.5, -0.5 + length);
        vertices[4] = new Array(-0.5, -0.5 + height, -0.5);
        vertices[5] = new Array(-0.5 + width / 2, -0.5 + height, -0.5);
        vertices[6] = new Array(-0.5 + width / 2, -0.5 + height, -0.5 + length);
        vertices[7] = new Array(-0.5, -0.5 + height, -0.5 + length);
        vertices[8] = new Array(-0.5 + width, -0.5, -0.5);
        vertices[9] = new Array(-0.5 + width, -0.5, -0.5 + length);
        vertices[10] = new Array(-0.5 + width, 0.5, -0.5);
        vertices[11] = new Array(-0.5 + width, 0.5, -0.5 + length);
        for (let i = 0; i < vertices.length; i++) {
            vertices[i][0] = vertices[i][0] * Config.XSize;
            vertices[i][1] = vertices[i][1] * Config.YSize;
            vertices[i][2] = vertices[i][2] * Config.ZSize;
        }
        BrickData.PushQuad(vertices, 0, 1, 2, 3, positions, indices);
        BrickData.PushQuad(vertices, 5, 4, 7, 6, positions, indices);
        BrickData.PushQuad(vertices, 0, 4, 5, 1, positions, indices);
        BrickData.PushQuad(vertices, 3, 7, 4, 0, positions, indices);
        BrickData.PushQuad(vertices, 2, 6, 7, 3, positions, indices);
        BrickData.PushQuad(vertices, 8, 10, 11, 9, positions, indices);
        BrickData.PushQuad(vertices, 5, 6, 11, 10, positions, indices);
        BrickData.PushQuad(vertices, 1, 8, 9, 2, positions, indices);
        BrickData.PushQuad(vertices, 1, 5, 10, 8, positions, indices);
        BrickData.PushQuad(vertices, 9, 11, 6, 2, positions, indices);
        for (let i = 0; i < width / 2; i++) {
            for (let k = 0; k < length; k++) {
                BrickData.PushSlot(i, height - 1, k, positions, indices);
            }
        }
        let normals = new Array();
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        slideData.positions = positions;
        slideData.indices = indices;
        slideData.normals = normals;
        return slideData;
    }
    static GroundData() {
        let cubeData = new BABYLON.VertexData();
        let vertices = new Array();
        let positions = new Array();
        let indices = new Array();
        vertices[0] = new Array(-10.5, -0.5, -10.5);
        vertices[1] = new Array(10.5, -0.5, -10.5);
        vertices[2] = new Array(10.5, -0.5, 10.5);
        vertices[3] = new Array(-10.5, -0.5, 10.5);
        vertices[4] = new Array(-10.5, 0.5, -10.5);
        vertices[5] = new Array(10.5, 0.5, -10.5);
        vertices[6] = new Array(10.5, 0.5, 10.5);
        vertices[7] = new Array(-10.5, 0.5, 10.5);
        for (let i = 0; i < vertices.length; i++) {
            vertices[i][0] = vertices[i][0] * Config.XSize;
            vertices[i][1] = vertices[i][1] * Config.YSize;
            vertices[i][2] = vertices[i][2] * Config.ZSize;
        }
        BrickData.PushQuad(vertices, 0, 1, 2, 3, positions, indices);
        BrickData.PushQuad(vertices, 1, 5, 6, 2, positions, indices);
        BrickData.PushQuad(vertices, 5, 4, 7, 6, positions, indices);
        BrickData.PushQuad(vertices, 0, 4, 5, 1, positions, indices);
        BrickData.PushQuad(vertices, 3, 7, 4, 0, positions, indices);
        BrickData.PushQuad(vertices, 2, 6, 7, 3, positions, indices);
        for (let i = -10; i <= 10; i++) {
            for (let k = -10; k <= 10; k++) {
                BrickData.PushSlot(i, 0, k, positions, indices);
            }
        }
        let normals = new Array();
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        cubeData.positions = positions;
        cubeData.indices = indices;
        cubeData.normals = normals;
        return cubeData;
    }
    static PushSlot(x, y, z, positions, indices) {
        let vertices = new Array();
        vertices[0] = new Array(-0.1, 0.5, -0.25);
        vertices[1] = new Array(0.1, 0.5, -0.25);
        vertices[2] = new Array(0.25, 0.5, -0.1);
        vertices[3] = new Array(0.25, 0.5, 0.1);
        vertices[4] = new Array(0.1, 0.5, 0.25);
        vertices[5] = new Array(-0.1, 0.5, 0.25);
        vertices[6] = new Array(-0.25, 0.5, 0.1);
        vertices[7] = new Array(-0.25, 0.5, -0.1);
        vertices[8] = new Array(-0.1, 1.1, -0.25);
        vertices[9] = new Array(0.1, 1.1, -0.25);
        vertices[10] = new Array(0.25, 1.1, -0.1);
        vertices[11] = new Array(0.25, 1.1, 0.1);
        vertices[12] = new Array(0.1, 1.1, 0.25);
        vertices[13] = new Array(-0.1, 1.1, 0.25);
        vertices[14] = new Array(-0.25, 1.1, 0.1);
        vertices[15] = new Array(-0.25, 1.1, -0.1);
        vertices[16] = new Array(0, 1.1, 0);
        for (let i = 0; i < vertices.length; i++) {
            vertices[i][0] = (vertices[i][0] + x) * Config.XSize;
            vertices[i][1] = (vertices[i][1] + y) * Config.YSize;
            vertices[i][2] = (vertices[i][2] + z) * Config.ZSize;
        }
        BrickData.PushQuad(vertices, 0, 8, 9, 1, positions, indices);
        BrickData.PushQuad(vertices, 1, 9, 10, 2, positions, indices);
        BrickData.PushQuad(vertices, 2, 10, 11, 3, positions, indices);
        BrickData.PushQuad(vertices, 3, 11, 12, 4, positions, indices);
        BrickData.PushQuad(vertices, 4, 12, 13, 5, positions, indices);
        BrickData.PushQuad(vertices, 5, 13, 14, 6, positions, indices);
        BrickData.PushQuad(vertices, 6, 14, 15, 7, positions, indices);
        BrickData.PushQuad(vertices, 7, 15, 8, 0, positions, indices);
        BrickData.PushTriangle(vertices, 8, 9, 16, positions, indices);
        BrickData.PushTriangle(vertices, 9, 10, 16, positions, indices);
        BrickData.PushTriangle(vertices, 10, 11, 16, positions, indices);
        BrickData.PushTriangle(vertices, 11, 12, 16, positions, indices);
        BrickData.PushTriangle(vertices, 12, 13, 16, positions, indices);
        BrickData.PushTriangle(vertices, 13, 14, 16, positions, indices);
        BrickData.PushTriangle(vertices, 14, 15, 16, positions, indices);
        BrickData.PushTriangle(vertices, 15, 8, 16, positions, indices);
    }
    static PushTriangle(vertices, a, b, c, positions, indices) {
        let index = positions.length / 3;
        for (let n in vertices[a]) {
            if (vertices[a] != null) {
                positions.push(vertices[a][n]);
            }
        }
        for (let n in vertices[b]) {
            if (vertices[b] != null) {
                positions.push(vertices[b][n]);
            }
        }
        for (let n in vertices[c]) {
            if (vertices[c] != null) {
                positions.push(vertices[c][n]);
            }
        }
        indices.push(index);
        indices.push(index + 1);
        indices.push(index + 2);
    }
    static PushQuad(vertices, a, b, c, d, positions, indices) {
        let index = positions.length / 3;
        for (let n in vertices[a]) {
            if (vertices[a] != null) {
                positions.push(vertices[a][n]);
            }
        }
        for (let n in vertices[b]) {
            if (vertices[b] != null) {
                positions.push(vertices[b][n]);
            }
        }
        for (let n in vertices[c]) {
            if (vertices[c] != null) {
                positions.push(vertices[c][n]);
            }
        }
        for (let n in vertices[d]) {
            if (vertices[d] != null) {
                positions.push(vertices[d][n]);
            }
        }
        indices.push(index);
        indices.push(index + 2);
        indices.push(index + 1);
        indices.push(index + 3);
        indices.push(index + 2);
        indices.push(index);
    }
}
class BrickMaterial {
    static GetMaterial(color) {
        let material = BrickMaterial.materials.get(color);
        if (!material) {
            material = new BABYLON.StandardMaterial("BrickMaterial-" + color, Main.Scene);
            material.diffuseColor = BABYLON.Color3.FromHexString(color);
            material.specularColor.copyFromFloats(0.2, 0.2, 0.2);
            BrickMaterial.materials.set(color, material);
        }
        return material;
    }
}
BrickMaterial.materials = new Map();
class Config {
}
Config.XSize = 0.7;
Config.YSize = 0.3;
Config.ZSize = 0.7;
Config.XMax = 32;
Config.YMax = 32;
Config.ZMax = 32;
class Control {
    static get mode() {
        return Control._mode;
    }
    static set mode(v) {
        Control._mode = v;
        if (Control.mode === 1) {
            Control.previewBrick.isVisible = true;
        }
        else {
            Control.previewBrick.isVisible = false;
        }
        if (Control.mode === 0) {
            new Text3D(new BABYLON.Vector3(0, 0.3, 2), "Move Mode", 200, 1000, 1000);
            if (Control._firstMove) {
                Control._firstMove = false;
                new Text3D(new BABYLON.Vector3(0, 0, 2), "Clic to go Forward.", 200, 5000, 1000);
                new Text3D(new BABYLON.Vector3(0, -0.3, 2), "Double clic to go backward.", 200, 7000, 1000);
            }
        }
        else if (Control.mode === 1) {
            new Text3D(new BABYLON.Vector3(0, 0.3, 2), "Build Mode", 200, 1000, 1000);
            if (Control._firstBuild) {
                Control._firstBuild = false;
                new Text3D(new BABYLON.Vector3(0, 0, 2), "Clic to add block.", 200, 5000, 1000);
                new Text3D(new BABYLON.Vector3(0, -0.3, 2), "Tilt your head to rotate.", 200, 7000, 1000);
            }
        }
        else if (Control.mode === 4) {
            new Text3D(new BABYLON.Vector3(0, 0.3, 2), "Paint Mode", 200, 1000, 1000);
            if (Control._firstPaint) {
                Control._firstPaint = false;
                new Text3D(new BABYLON.Vector3(0, 0, 2), "Clic to paint aimed block.", 200, 5000, 1000);
            }
        }
        else if (Control.mode === 2) {
            new Text3D(new BABYLON.Vector3(0, 0.3, 2), "Delete Mode", 200, 1000, 1000);
            if (Control._firstDelete) {
                Control._firstDelete = false;
                new Text3D(new BABYLON.Vector3(0, 0, 2), "Clic to delete aimed block.", 200, 5000, 1000);
            }
        }
    }
    static get width() {
        return this._width;
    }
    static set width(v) {
        this._width = v;
        BrickData.CubicalData(this.width, this.height, this.length).applyToMesh(Control.previewBrick);
    }
    static get height() {
        return this._height;
    }
    static set height(v) {
        this._height = v;
        BrickData.CubicalData(this.width, this.height, this.length).applyToMesh(Control.previewBrick);
    }
    static get length() {
        return this._length;
    }
    static set length(v) {
        this._length = v;
        BrickData.CubicalData(this.width, this.height, this.length).applyToMesh(Control.previewBrick);
    }
    static get color() {
        return this._color;
    }
    static set color(v) {
        this._color = v;
        if (Control.previewBrick.material instanceof BABYLON.StandardMaterial) {
            Control.previewBrick.material.diffuseColor = BABYLON.Color3.FromHexString(this.color);
        }
    }
    static get rotation() {
        return this._rotation;
    }
    static set rotation(v) {
        this._rotation = v % 4;
        Control.previewBrick.rotation.y = v * Math.PI / 2;
    }
    static pickPredicate(mesh) {
        return (mesh !== Main.cursor &&
            mesh !== Control.previewBrick &&
            mesh.isVisible &&
            !mesh.name.includes("Text3D"));
    }
    static onPointerDown() {
        let t = (new Date()).getTime();
        if ((t - Control._lastPointerDownTime) < Control.DOUBLEPOINTERDELAY) {
            Control._lastPointerDownTime = t;
            return this.onDoublePointerDown();
        }
        Control._lastPointerDownTime = t;
        let ray = Main.Camera.getForwardRay();
        console.log(ray);
        let pick = Main.Scene.pickWithRay(ray, Control.pickPredicate);
        if (pick.hit) {
            Control._meshAimed = pick.pickedMesh;
            if (Control._meshAimed instanceof SmallIcon) {
                Control._meshAimed.onActivate();
                return;
            }
            else if (Control._meshAimed.parent instanceof Icon) {
                Control._meshAimed.parent.onActivate();
                return;
            }
        }
        if (Control.mode === 0) {
            Control._cameraSpeed = 0.05;
        }
        if (Control.mode === 1) {
            if (pick.hit) {
                let correctedPickPoint = BABYLON.Vector3.Zero();
                correctedPickPoint.copyFrom(pick.pickedPoint.add(pick.getNormal().scale(0.1)));
                let coordinates = Brick.WorldPosToBrickCoordinates(correctedPickPoint);
                Brick.TryAdd(coordinates, this.width, this.height, this.length, this.rotation, Control.color);
            }
        }
        if (Control.mode === 2) {
            if (pick.hit) {
                if (pick.pickedMesh instanceof Brick) {
                    pick.pickedMesh.Dispose();
                }
            }
        }
        if (Control.mode === 4) {
            if (pick.hit) {
                if (pick.pickedMesh instanceof Brick) {
                    pick.pickedMesh.color = Control.color;
                }
            }
        }
    }
    static onPointerUp() {
        Control._cameraSpeed = 0;
    }
    static onDoublePointerDown() {
        if (Control.mode === 0) {
            Control._cameraSpeed = -0.05;
        }
    }
    static Update() {
        Control.CheckHeadTilt();
        Control.previewBrick.isVisible = false;
        Icon.UnlitAll();
        SmallIcon.UnlitAll();
        Brick.UnlitAll();
        let ray = Main.Camera.getForwardRay();
        let pick = Main.Scene.pickWithRay(ray, Control.pickPredicate);
        if (pick.hit) {
            Control._meshAimed = pick.pickedMesh;
            if (Control._meshAimed instanceof SmallIcon) {
                Control._meshAimed.Hightlight();
            }
            else if (Control._meshAimed.parent instanceof Icon) {
                Control._meshAimed.parent.Hightlight();
            }
            else {
                if (Control._meshAimed instanceof Brick) {
                    if (Control.mode === 1) {
                        Control._meshAimed.Hightlight(BABYLON.Color3.White());
                    }
                    if (Control.mode === 2) {
                        Control._meshAimed.Hightlight(BABYLON.Color3.Red());
                    }
                    if (Control.mode === 4) {
                        Control._meshAimed.Hightlight(BABYLON.Color3.FromHexString(Control.color));
                    }
                }
                if (Control.mode === 1) {
                    let correctedPickPoint = BABYLON.Vector3.Zero();
                    correctedPickPoint.copyFrom(pick.pickedPoint.add(pick.getNormal().scale(0.1)));
                    Control.previewBrick.isVisible = true;
                    Control.previewBrick.position = Brick.BrickCoordinatesToWorldPos(Brick.WorldPosToBrickCoordinates(correctedPickPoint));
                }
            }
        }
        if (Control.mode === 0) {
            Control.UpdateModeMove();
        }
    }
    static CheckHeadTilt() {
        if (Main.cameraQuaternion instanceof BABYLON.Quaternion) {
            let angle = Main.cameraQuaternion.toEulerAngles().z;
            if (Math.abs(angle) > Math.PI / 6) {
                Control.HeadTilted(-BABYLON.MathTools.Sign(angle));
            }
            else {
                Control._lastHeadTiltedTime = (new Date()).getTime();
            }
        }
    }
    static HeadTilted(sign) {
        let t = (new Date()).getTime();
        if ((t - Control._lastHeadTiltedTime) > Control.HEADTILTDELAY) {
            Control.rotation += sign;
            Control._lastHeadTiltedTime = (new Date()).getTime();
        }
    }
    static UpdateModeMove() {
        if (Control._cameraSpeed !== 0) {
            let move = Main.Camera.getForwardRay().direction;
            move.scaleInPlace(Control._cameraSpeed);
            Main.Camera.position.addInPlace(move);
            Main.Camera.position.y = Math.max(Main.Camera.position.y, 2);
        }
    }
    static CreatePreviewBrick() {
        Control.previewBrick = new BABYLON.Mesh("PreviewBrick", Main.Scene);
        Control.previewBrick.isPickable = false;
        BrickData.CubicalData(1, 3, 1).applyToMesh(Control.previewBrick);
        let previewBrickMaterial = new BABYLON.StandardMaterial("PreviewBrickMaterial", Main.Scene);
        previewBrickMaterial.diffuseColor = BABYLON.Color3.FromHexString(Control.color);
        previewBrickMaterial.specularColor.copyFromFloats(0.2, 0.2, 0.2);
        previewBrickMaterial.alpha = 0.5;
        Control.previewBrick.material = previewBrickMaterial;
        Control.previewBrick.rotation.y = Control.rotation * Math.PI / 2;
    }
}
Control.DOUBLEPOINTERDELAY = 500;
Control._lastPointerDownTime = 0;
Control.HEADTILTDELAY = 1000;
Control._lastHeadTiltedTime = 0;
Control._cameraSpeed = 0;
Control._mode = 0;
Control._firstMove = true;
Control._firstBuild = true;
Control._firstPaint = true;
Control._firstDelete = true;
Control._width = 1;
Control._height = 1;
Control._length = 1;
Control._color = "#efefef";
Control._rotation = 0;
class GUI {
    static UpdateCameraGUIMatrix() {
        GUI._cameraForward = Main.Camera.getForwardRay().direction;
        GUI._alphaCam = VRMath.AngleFromToAround(BABYLON.Axis.Z, GUI._cameraForward, BABYLON.Axis.Y);
        let rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, GUI._alphaCam);
        BABYLON.Matrix.ComposeToRef(BABYLON.Vector3.One(), rotationQuaternion, Main.Camera.position, GUI.cameraGUIMatrix);
    }
    static CreateGUI() {
        Main.moveIcon = new SmallIcon("move-icon", "L0", Main.Camera, [""], () => {
            SmallIcon.UnLockCameraRotation();
            SmallIcon.HideClass("brick-pick");
            SmallIcon.HideClass("paint-pick");
            SmallIcon.HideClass("brick-cat");
            SmallIcon.HideClass("brick-rotate");
            Control.mode = 0;
        });
        Main.buildIcon = new SmallIcon("build-icon", "L1", Main.Camera, [""], () => {
            SmallIcon.LockCameraRotation();
            SmallIcon.HideClass("brick-pick");
            SmallIcon.HideClass("paint-pick");
            SmallIcon.ShowClass("brick-cat");
            SmallIcon.HideClass("brick-rotate");
            Control.mode = 5;
        });
        Main.deleteIcon = new SmallIcon("paint-icon", "L2", Main.Camera, [""], () => {
            SmallIcon.LockCameraRotation();
            SmallIcon.HideClass("brick-pick");
            SmallIcon.HideClass("brick-cat");
            SmallIcon.ShowClass("paint-pick");
            SmallIcon.HideClass("brick-rotate");
            Control.mode = 5;
        });
        Main.deleteIcon = new SmallIcon("delete-icon", "L3", Main.Camera, [""], () => {
            SmallIcon.UnLockCameraRotation();
            SmallIcon.HideClass("brick-pick");
            SmallIcon.HideClass("brick-cat");
            SmallIcon.HideClass("paint-pick");
            SmallIcon.HideClass("brick-rotate");
            Control.mode = 2;
        });
        new SmallIcon("bricks/brick-s-bar", "M0", Main.Camera, ["brick-cat"], () => {
            SmallIcon.HideClass("brick-cat");
            SmallIcon.ShowClass("brick-s-bar");
        }).Hide();
        [1, 2, 4, 6, 8].forEach((v, i) => {
            new SmallIcon("bricks/brick-" + v + "-1-1", "M" + i, Main.Camera, ["brick-pick", "brick-s-bar"], () => {
                SmallIcon.UnLockCameraRotation();
                SmallIcon.HideClass("brick-s-bar");
                SmallIcon.ShowClass("brick-rotate");
                Control.width = v;
                Control.height = 1;
                Control.length = 1;
                Control.mode = 1;
            }).Hide();
        });
        new SmallIcon("bricks/brick-m-bar", "M1", Main.Camera, ["brick-cat"], () => {
            SmallIcon.HideClass("brick-cat");
            SmallIcon.ShowClass("brick-m-bar");
        }).Hide();
        [1, 2, 4, 6, 8].forEach((v, i) => {
            new SmallIcon("bricks/brick-" + v + "-3-1", "M" + i, Main.Camera, ["brick-pick", "brick-m-bar"], () => {
                SmallIcon.UnLockCameraRotation();
                SmallIcon.HideClass("brick-m-bar");
                SmallIcon.ShowClass("brick-rotate");
                Control.width = v;
                Control.height = 3;
                Control.length = 1;
                Control.mode = 1;
            }).Hide();
        });
        new SmallIcon("bricks/brick-s-brick", "M2", Main.Camera, ["brick-cat"], () => {
            SmallIcon.HideClass("brick-cat");
            SmallIcon.ShowClass("brick-s-brick");
        }).Hide();
        [2, 4, 6, 8].forEach((v, i) => {
            new SmallIcon("bricks/brick-" + v + "-1-2", "M" + i, Main.Camera, ["brick-pick", "brick-s-brick"], () => {
                SmallIcon.UnLockCameraRotation();
                SmallIcon.HideClass("brick-s-brick");
                SmallIcon.ShowClass("brick-rotate");
                Control.width = v;
                Control.height = 1;
                Control.length = 2;
                Control.mode = 1;
            }).Hide();
        });
        new SmallIcon("bricks/brick-m-brick", "M3", Main.Camera, ["brick-cat"], () => {
            SmallIcon.HideClass("brick-cat");
            SmallIcon.ShowClass("brick-m-brick");
        }).Hide();
        [2, 4, 6, 8].forEach((v, i) => {
            new SmallIcon("bricks/brick-" + v + "-3-2", "M" + i, Main.Camera, ["brick-pick", "brick-m-brick"], () => {
                SmallIcon.UnLockCameraRotation();
                SmallIcon.HideClass("brick-m-brick");
                SmallIcon.ShowClass("brick-rotate");
                Control.width = v;
                Control.height = 3;
                Control.length = 2;
                Control.mode = 1;
            }).Hide();
        });
        new SmallIcon("rotate-left", "S10", Main.Camera, ["brick-rotate"], () => {
            Control.rotation--;
        }).Hide();
        new SmallIcon("rotate-right", "S11", Main.Camera, ["brick-rotate"], () => {
            Control.rotation++;
        }).Hide();
        [
            { name: "black", color: "#232323" },
            { name: "red", color: "#f45342" },
            { name: "green", color: "#77f442" },
            { name: "blue", color: "#42b0f4" }
        ].forEach((c, i) => {
            new SmallIcon("paint/" + c.name + "", "S" + i, Main.Camera, ["paint-pick"], () => {
                SmallIcon.UnLockCameraRotation();
                SmallIcon.HideClass("paint-pick");
                Control.color = c.color;
                Control.mode = 4;
            }).Hide();
        });
        [
            { name: "white", color: "#efefef" },
            { name: "yellow", color: "#eef442" },
            { name: "purple", color: "#c242f4" },
            { name: "orange", color: "#f48c42" }
        ].forEach((c, i) => {
            new SmallIcon("paint/" + c.name + "", "S" + (4 + i), Main.Camera, ["paint-pick"], () => {
                SmallIcon.UnLockCameraRotation();
                SmallIcon.HideClass("paint-pick");
                Control.color = c.color;
                Control.mode = 4;
            }).Hide();
        });
    }
}
GUI.cameraGUIMatrix = BABYLON.Matrix.Identity();
GUI.iconWidth = 0.3;
GUI.paintIconWidth = 0.15;
GUI.iconHeight = 0.15;
GUI.mainIconHeight = 0.3;
GUI.iconAlphaZero = 0.28;
GUI.iconAlpha = 0.175;
GUI.iconBeta = 0.8;
GUI._cameraForward = BABYLON.Vector3.Zero();
GUI._alphaCam = 0;
class Icon extends BABYLON.Mesh {
    constructor(picture, position, camera, scale = 1, onActivate = () => { return; }) {
        super(picture, camera.getScene());
        this.localPosition = BABYLON.Vector3.Zero();
        this._cameraForward = BABYLON.Vector3.Zero();
        this._targetPosition = BABYLON.Vector3.Zero();
        this._worldishMatrix = BABYLON.Matrix.Identity();
        this._alphaCam = 0;
        this.localPosition.copyFrom(position);
        this.camera = camera;
        this.rotation.copyFromFloats(0, 0, 0);
        this.scaling.copyFromFloats(scale, scale, scale);
        this.onActivate = onActivate;
        if (Icon.iconMeshData && Icon.iconFrameMeshData) {
            this.Initialize();
        }
        else {
            Icon.LoadIconFrameData(camera.getScene());
            Icon.onIconFrameDataLoaded.push(() => {
                this.Initialize();
            });
        }
        camera.getScene().registerBeforeRender(() => {
            this.UpdatePosition();
        });
        Icon.instances.push(this);
    }
    static LoadIconFrameData(scene) {
        if (Icon.iconFrameDataLoading) {
            return;
        }
        Icon.iconFrameDataLoading = true;
        BABYLON.SceneLoader.ImportMesh("", "./datas/icon-base.babylon", "", scene, (meshes) => {
            console.log("IconMeshData loaded");
            for (let i = 0; i < meshes.length; i++) {
                if (meshes[i] instanceof BABYLON.Mesh) {
                    let mesh = meshes[i];
                    if (mesh.name.indexOf("Icon") !== -1) {
                        Icon.iconMeshData = BABYLON.VertexData.ExtractFromMesh(mesh);
                    }
                    else if (mesh.name.indexOf("Frame") !== -1) {
                        Icon.iconFrameMeshData = BABYLON.VertexData.ExtractFromMesh(mesh);
                    }
                    mesh.dispose();
                }
            }
            Icon.iconFrameMaterial = new BABYLON.StandardMaterial("IconFrameMaterial", scene);
            Icon.iconFrameMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/frame-icon.png", scene);
            Icon.iconFrameMaterial.diffuseColor.copyFromFloats(0.9, 0.9, 0.9);
            Icon.iconFrameMaterial.specularColor.copyFromFloats(0.2, 0.2, 0.2);
            for (let i = 0; i < Icon.onIconFrameDataLoaded.length; i++) {
                Icon.onIconFrameDataLoaded[i]();
            }
        });
    }
    Initialize() {
        console.log("Icon " + this.name + " initializing...");
        let icon = new BABYLON.Mesh(this.name + "-icon", this.getScene());
        Icon.iconMeshData.applyToMesh(icon);
        icon.position.copyFromFloats(0, 0, 0);
        icon.parent = this;
        let iconMaterial = new BABYLON.StandardMaterial(this.name + "-mat", this.getScene());
        iconMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/" + this.name + ".png", this.getScene());
        iconMaterial.diffuseTexture.hasAlpha = true;
        iconMaterial.specularColor.copyFromFloats(0.2, 0.2, 0.2);
        icon.material = iconMaterial;
        this.frame = new BABYLON.Mesh(this.name + "-frame", this.getScene());
        Icon.iconFrameMeshData.applyToMesh(this.frame);
        this.frame.position.copyFromFloats(0, 0, 0);
        this.frame.parent = this;
        this.frame.material = Icon.iconFrameMaterial;
        console.log("Icon " + this.name + " initialized.");
    }
    Hightlight() {
        if (this.frame) {
            this.frame.renderOutline = true;
            this.frame.outlineColor = BABYLON.Color3.White();
            this.frame.outlineWidth = 0.02;
        }
    }
    Unlit() {
        if (this.frame) {
            this.frame.renderOutline = false;
        }
    }
    static UnlitAll() {
        Icon.instances.forEach((i) => {
            i.Unlit();
        });
    }
    UpdatePosition() {
        this._cameraForward = this.camera.getForwardRay().direction;
        if (this._cameraForward.y > -0.3) {
            this._alphaCam = VRMath.AngleFromToAround(BABYLON.Axis.Z, this._cameraForward, BABYLON.Axis.Y);
        }
        let rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, this._alphaCam);
        BABYLON.Matrix.ComposeToRef(BABYLON.Vector3.One(), rotationQuaternion, this.camera.position, this._worldishMatrix);
        BABYLON.Vector3.TransformCoordinatesToRef(this.localPosition, this._worldishMatrix, this._targetPosition);
        if (isNaN(this._targetPosition.x)) {
            return;
        }
        BABYLON.Vector3.LerpToRef(this.position, this._targetPosition, 0.05, this.position);
        this.lookAt(this.camera.position, 0, Math.PI, Math.PI);
    }
}
Icon.instances = [];
Icon.onIconFrameDataLoaded = [];
Icon.iconFrameDataLoading = false;
class IconData {
    constructor(vertexData, position) {
        this.vertexData = vertexData;
        this.position = position;
    }
}
class IconLoader {
    static LoadIcons(callback) {
        BABYLON.SceneLoader.ImportMesh("", "./datas/icon-base.babylon", "", Main.Scene, (meshes) => {
            for (let i = 0; i < meshes.length; i++) {
                let m = meshes[i];
                if (m instanceof BABYLON.Mesh) {
                    IconLoader.datas.set(m.name, new IconData(BABYLON.VertexData.ExtractFromMesh(m), m.position.clone()));
                }
            }
            callback();
        });
    }
}
IconLoader.datas = new Map();
class Interact {
    static ButtonDown() {
        BABYLON.Vector3.TransformNormalToRef(BABYLON.Axis.Z, Main.Camera.getWorldMatrix(), Interact._camForward);
        let ray = new BABYLON.Ray(Main.Camera.position, Interact._camForward);
        let pick = Main.Scene.pickWithRay(ray, (mesh) => {
            return true;
        });
        if (pick.hit) {
            let ball = BABYLON.MeshBuilder.CreateSphere("Ball", { diameter: 0.5 }, Main.Scene);
            let ballMat = new BABYLON.StandardMaterial("BallMaterial", Main.Scene);
            ballMat.diffuseColor.copyFromFloats(Math.random(), Math.random(), Math.random());
            ball.material = ballMat;
            ball.position = pick.pickedPoint;
        }
    }
}
Interact._camForward = BABYLON.Vector3.Zero();
class Main {
    constructor(canvasElement) {
        Main.Canvas = document.getElementById(canvasElement);
        Main.Engine = new BABYLON.Engine(Main.Canvas, true, { preserveDrawingBuffer: true }, true);
    }
    static get cameraQuaternion() {
        if (Main.Camera instanceof BABYLON.WebVRFreeCamera) {
            return Main.Camera.deviceRotationQuaternion;
        }
        else {
            return Main.Camera.rotationQuaternion;
        }
    }
    CreateScene(vrMode) {
        $("canvas").show();
        Main.Scene = new BABYLON.Scene(Main.Engine);
        Main.Scene.registerBeforeRender(Control.Update);
        if (vrMode) {
            if (navigator.getVRDisplays) {
                Main.Camera = new BABYLON.WebVRFreeCamera("WebVRFreeCamera", new BABYLON.Vector3(Config.XMax * Config.XSize / 2, 2, Config.ZMax * Config.ZSize / 2), Main.Scene);
            }
            else if (Main.hasGyro) {
                Main.Engine.setHardwareScalingLevel(1);
                Main.Camera = new BABYLON.VRDeviceOrientationFreeCamera("VRDeviceOrientationFreeCamera", new BABYLON.Vector3(Config.XMax * Config.XSize / 2, 2, Config.ZMax * Config.ZSize / 2), Main.Scene);
            }
            else {
                Main.textPositionScale = 1.5;
                Main.Camera = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(Config.XMax * Config.XSize / 2, 4, Config.ZMax * Config.ZSize / 2), Main.Scene);
            }
        }
        else {
            if (Main.hasGyro) {
                Main.textPositionScale = 1.5;
                Main.Camera = new BABYLON.DeviceOrientationCamera("DeviceOrientationCamera", new BABYLON.Vector3(Config.XMax * Config.XSize / 2, 4, Config.ZMax * Config.ZSize / 2), Main.Scene);
            }
            else {
                Main.textPositionScale = 1.5;
                Main.Camera = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(Config.XMax * Config.XSize / 2, 4, Config.ZMax * Config.ZSize / 2), Main.Scene);
            }
        }
        console.log("Camera : " + Main.Camera.name);
        Main.Camera.minZ = 0.2;
        Main.Engine.switchFullscreen(true);
        Main.Engine.resize();
        Main.Camera.attachControl(Main.Canvas, true);
        Main.Canvas.onpointerdown = () => {
            Control.onPointerDown();
        };
        Main.Canvas.onpointerup = () => {
            Control.onPointerUp();
        };
        Main.CreateCursor();
        Control.CreatePreviewBrick();
        Main.Light = new BABYLON.HemisphericLight("AmbientLight", BABYLON.Axis.Y, Main.Scene);
        Main.Light.diffuse = new BABYLON.Color3(1, 1, 1);
        Main.Light.specular = new BABYLON.Color3(1, 1, 1);
        let ground = new BABYLON.Mesh("Ground", Main.Scene);
        BrickData.CubicalData(Config.XMax, 1, Config.ZMax).applyToMesh(ground);
        ground.position.y = -Config.YSize;
        let groundMaterial = new BABYLON.StandardMaterial("GroundMaterial", Main.Scene);
        groundMaterial.diffuseColor = BABYLON.Color3.FromHexString("#98f442");
        groundMaterial.specularColor.copyFromFloats(0.2, 0.2, 0.2);
        ground.material = groundMaterial;
        IconLoader.LoadIcons(GUI.CreateGUI);
        SaveManager.Load();
        setTimeout(() => {
            new Text3D(new BABYLON.Vector3(0, 0.3, 2), "Welcome to VR Brick Builder,");
        }, 100);
        setTimeout(() => {
            new Text3D(new BABYLON.Vector3(0, 0, 2), "Raise your head to pick an action !");
        }, 2100);
        Main.Scene.registerBeforeRender(GUI.UpdateCameraGUIMatrix);
    }
    CreateDevShowBrickScene() {
        Main.Scene = new BABYLON.Scene(Main.Engine);
        Main.Scene.clearColor.copyFromFloats(1, 1, 1, 0.5);
        let arcRotateCamera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 0, 0, 1, BABYLON.Vector3.Zero(), Main.Scene);
        arcRotateCamera.setPosition(new BABYLON.Vector3(4, 3, -5));
        arcRotateCamera.attachControl(Main.Canvas);
        arcRotateCamera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        let cameraFrameSize = 4;
        arcRotateCamera.orthoTop = cameraFrameSize / 2;
        arcRotateCamera.orthoBottom = -cameraFrameSize / 2;
        arcRotateCamera.orthoLeft = -cameraFrameSize;
        arcRotateCamera.orthoRight = cameraFrameSize;
        let light = new BABYLON.DirectionalLight("Light", new BABYLON.Vector3(-0.75, -1, 0.5), Main.Scene);
        light.intensity = 1.5;
        let brick6 = new PrettyBrick(6, 3, 1, Main.Scene);
        brick6.position.z = Config.ZSize;
        let brick4 = new PrettyBrick(4, 3, 1, Main.Scene);
        brick4.position.z = -Config.ZSize;
        brick4.position.x = -Config.XSize;
        let brick2 = new PrettyBrick(2, 3, 1, Main.Scene);
        brick2.position.z = -Config.ZSize;
        brick2.position.x = 3 * Config.XSize;
    }
    animate() {
        Main.Engine.runRenderLoop(() => {
            Main.Scene.render();
        });
        window.addEventListener("resize", () => {
            Main.Engine.resize();
        });
    }
    static CreateCursor() {
        Main.cursor = BABYLON.MeshBuilder.CreateSphere("Cursor", { diameter: 0.4 }, Main.Scene);
        Main.cursor.position.copyFromFloats(0, 0, 10);
        Main.cursor.parent = Main.Camera;
        let cursorMaterial = new BABYLON.StandardMaterial("CursorMaterial", Main.Scene);
        cursorMaterial.diffuseColor.copyFromFloats(0, 0, 0);
        cursorMaterial.specularColor.copyFromFloats(0, 0, 0);
        cursorMaterial.emissiveColor.copyFromFloats(1, 1, 1);
        Main.cursor.material = cursorMaterial;
        Main.cursor.renderOutline = true;
        Main.cursor.outlineColor.copyFromFloats(0, 0, 0);
        Main.cursor.outlineWidth = 0.05;
        Main.cursor.renderingGroupId = 1;
    }
}
Main.currentSave = "save1";
Main.hasGyro = false;
Main.textPositionScale = 1;
window.addEventListener("devicemotion", (event) => {
    Main.hasGyro = true;
});
window.addEventListener("DOMContentLoaded", () => {
    $("#cardboard-main-icon").on("click", () => {
        let game = new Main("render-canvas");
        game.CreateScene(true);
        game.animate();
    });
    $("#classic-main-icon").on("click", () => {
        let game = new Main("render-canvas");
        game.CreateScene(false);
        game.animate();
    });
});
$(document).on("webkitfullscreenchange mozfullscreenchange fullscreenchange", (e) => {
    if (!!Main.Engine.isFullscreen) {
        location.reload();
    }
});
function UnselectAllSaves() {
    $(".save").removeClass("panel-primary");
    $(".save").addClass("panel-default");
}
window.addEventListener("DOMContentLoaded", () => {
    for (let i = 1; i <= 5; i++) {
        let data = localStorage.getItem("save" + i + "-pic");
        if (data && data.indexOf("data") !== -1) {
            $("#save" + i + "-pic").attr("src", data);
        }
    }
    $(".save").on("pointerdown", (e) => {
        if (e.currentTarget instanceof HTMLElement) {
            let id = e.currentTarget.id;
            Main.currentSave = id;
            UnselectAllSaves();
            $("#" + id).removeClass("panel-default");
            $("#" + id).addClass("panel-primary");
        }
    });
});
class VRMath {
    static IsNanOrZero(n) {
        return isNaN(n) || n === 0;
    }
    static ProjectPerpendicularAtToRef(v, at, ref) {
        if (v && at) {
            let k = BABYLON.Vector3.Dot(v, at);
            k = k / at.lengthSquared();
            if (isFinite(k)) {
                ref.copyFrom(v);
                ref.subtractInPlace(at.scale(k));
            }
        }
    }
    static ProjectPerpendicularAt(v, at) {
        let out = BABYLON.Vector3.Zero();
        VRMath.ProjectPerpendicularAtToRef(v, at, out);
        return out;
    }
    static Angle(from, to) {
        return Math.acos(BABYLON.Vector3.Dot(from, to) / from.length() / to.length());
    }
    static AngleFromToAround(from, to, around, onlyPositive = false) {
        let pFrom = VRMath.ProjectPerpendicularAt(from, around).normalize();
        if (VRMath.IsNanOrZero(pFrom.lengthSquared())) {
            return NaN;
        }
        let pTo = VRMath.ProjectPerpendicularAt(to, around).normalize();
        if (VRMath.IsNanOrZero(pTo.lengthSquared())) {
            return NaN;
        }
        let angle = Math.acos(BABYLON.Vector3.Dot(pFrom, pTo));
        if (BABYLON.Vector3.Dot(BABYLON.Vector3.Cross(pFrom, pTo), around) < 0) {
            if (onlyPositive) {
                angle = 2 * Math.PI - angle;
            }
            else {
                angle = -angle;
            }
        }
        return angle;
    }
    static XAngleYAngle(x, y) {
        let vector = new BABYLON.Vector3(0, 0, 1);
        let xMatrix = BABYLON.Matrix.RotationX(-x);
        let yMatrix = BABYLON.Matrix.RotationY(y);
        let globalMatrix = BABYLON.Matrix.RotationX(5 * Math.PI / 16);
        BABYLON.Vector3.TransformNormalToRef(vector, globalMatrix, vector);
        BABYLON.Vector3.TransformNormalToRef(vector, xMatrix, vector);
        BABYLON.Vector3.TransformNormalToRef(vector, yMatrix, vector);
        return vector;
    }
    static RotateVector3(v, orientation) {
        if (orientation === 0) {
            return v;
        }
        else if (orientation === 1) {
            return new BABYLON.Vector3(v.z, v.y, -v.x);
        }
        else if (orientation === 2) {
            return new BABYLON.Vector3(-v.x, v.y, -v.z);
        }
        else if (orientation === 3) {
            return new BABYLON.Vector3(-v.z, v.y, v.x);
        }
    }
}
class PrettyBrick extends BABYLON.Mesh {
    constructor(width, height, length, scene) {
        super("PrettyBrick", scene);
        let box = BABYLON.MeshBuilder.CreateBox("Box", {
            width: width * Config.XSize,
            height: height * Config.YSize,
            depth: length * Config.ZSize
        }, scene);
        box.renderOutline = true;
        box.outlineColor.copyFromFloats(0, 0, 0);
        box.outlineWidth = 0.05;
        box.parent = this;
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < length; j++) {
                let plot = BABYLON.MeshBuilder.CreateCylinder("Plot", {
                    height: Config.YSize / 2,
                    diameter: Config.XSize / 2
                }, scene);
                plot.position.x = i * Config.XSize + Config.XSize / 2 - width * Config.XSize / 2;
                plot.position.y = height * Config.YSize - height * Config.YSize / 2 + Config.YSize / 4;
                plot.position.z = j * Config.ZSize + Config.ZSize / 2 - length * Config.ZSize / 2;
                plot.renderOutline = true;
                plot.outlineColor.copyFromFloats(0, 0, 0);
                plot.outlineWidth = 0.05;
                plot.parent = this;
            }
        }
    }
}
class SaveManager {
    static Save() {
        localStorage.setItem(Main.currentSave, JSON.stringify(Brick.Serialize()));
        localStorage.setItem(Main.currentSave + "-pic", Main.Canvas.toDataURL("image/png"));
    }
    static Load() {
        let save = JSON.parse(localStorage.getItem(Main.currentSave));
        if (save) {
            Brick.UnserializeArray(save, false);
        }
    }
}
class SmallIcon extends BABYLON.Mesh {
    constructor(picture, icon, camera, iconClass = [], onActivate = () => { return; }) {
        super(picture, camera.getScene());
        this.localPosition = BABYLON.Vector3.Zero();
        this.iconClass = [];
        this._cameraForward = BABYLON.Vector3.Zero();
        this._targetPosition = BABYLON.Vector3.Zero();
        this._worldishMatrix = BABYLON.Matrix.Identity();
        this._alphaCam = 0;
        this.localPosition.copyFrom(IconLoader.datas.get(icon).position);
        this.camera = camera;
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.onActivate = onActivate;
        this.iconClass = iconClass;
        IconLoader.datas.get(icon).vertexData.applyToMesh(this);
        let iconMaterial = new BABYLON.StandardMaterial(this.name + "-mat", this.getScene());
        iconMaterial.emissiveColor.copyFromFloats(1, 1, 1);
        iconMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/" + this.name + ".png", this.getScene());
        iconMaterial.diffuseTexture.hasAlpha = true;
        iconMaterial.specularColor.copyFromFloats(0.2, 0.2, 0.2);
        this.material = iconMaterial;
        this.enableEdgesRendering();
        this.Unlit();
        SmallIcon.instances.push(this);
        camera.getScene().registerBeforeRender(() => {
            this.UpdatePosition();
        });
    }
    static LockCameraRotation() {
        SmallIcon.lockCameraRotation = true;
    }
    static UnLockCameraRotation() {
        SmallIcon.lockCameraRotation = false;
    }
    Hightlight() {
        this.edgesColor.copyFromFloats(0, 0, 0, 1);
        this.edgesWidth = 0.5;
        if (this.material instanceof BABYLON.StandardMaterial) {
            this.material.useAlphaFromDiffuseTexture = false;
        }
    }
    Unlit() {
        this.edgesColor.copyFromFloats(0, 0, 0, 0.75);
        this.edgesWidth = 0.5;
        if (this.material instanceof BABYLON.StandardMaterial) {
            this.material.useAlphaFromDiffuseTexture = true;
        }
    }
    Show() {
        this.isVisible = true;
    }
    Hide() {
        this.isVisible = false;
    }
    static UnlitAll() {
        SmallIcon.instances.forEach((i) => {
            i.Unlit();
        });
    }
    static ShowClass(iconClass) {
        for (let i = 0; i < SmallIcon.instances.length; i++) {
            let smallIcon = SmallIcon.instances[i];
            for (let j = 0; j < smallIcon.iconClass.length; j++) {
                if (smallIcon.iconClass[j].indexOf(iconClass) !== -1) {
                    smallIcon.Show();
                }
            }
        }
    }
    static HideClass(iconClass) {
        for (let i = 0; i < SmallIcon.instances.length; i++) {
            let smallIcon = SmallIcon.instances[i];
            for (let j = 0; j < smallIcon.iconClass.length; j++) {
                if (smallIcon.iconClass[j].indexOf(iconClass) !== -1) {
                    smallIcon.Hide();
                }
            }
        }
    }
    UpdatePosition() {
        this._cameraForward = this.camera.getForwardRay().direction;
        if (!SmallIcon.lockCameraRotation && this._cameraForward.y < 0.2) {
            this._alphaCam = VRMath.AngleFromToAround(BABYLON.Axis.Z, this._cameraForward, BABYLON.Axis.Y);
        }
        let rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, this._alphaCam);
        BABYLON.Matrix.ComposeToRef(BABYLON.Vector3.One(), rotationQuaternion, this.camera.position, this._worldishMatrix);
        BABYLON.Vector3.TransformCoordinatesToRef(this.localPosition, this._worldishMatrix, this._targetPosition);
        if (isNaN(this._targetPosition.x)) {
            return;
        }
        BABYLON.Vector3.LerpToRef(this.position, this._targetPosition, 0.05, this.position);
        this.rotationQuaternion = BABYLON.Quaternion.Slerp(this.rotationQuaternion, rotationQuaternion, 0.05);
    }
}
SmallIcon.lockCameraRotation = false;
SmallIcon.instances = [];
class Text3D {
    constructor(position, text, fadeInDelay = 500, delay = 3000, fadeOutDelay = 1000) {
        this.mesh = BABYLON.Mesh.CreatePlane("Text3D", 4, Main.Scene);
        this.mesh.position.copyFrom(position.scale(Main.textPositionScale));
        BABYLON.Vector3.TransformCoordinatesToRef(this.mesh.position, GUI.cameraGUIMatrix, this.mesh.position);
        this.mesh.lookAt(Main.Camera.position);
        this.texture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(this.mesh);
        this.block = new BABYLON.GUI.TextBlock();
        this.block.text = text;
        this.block.color = "white";
        this.block.fontFamily = "Helvetica";
        this.block.fontSize = 50;
        this.texture.addControl(this.block);
        this.tStart = (new Date()).getTime();
        this.fadeInDelay = fadeInDelay;
        this.delay = delay;
        this.fadeOutDelay = fadeOutDelay;
        let up = () => {
            this.update(() => {
                Main.Scene.unregisterBeforeRender(up);
            });
        };
        Main.Scene.registerBeforeRender(up);
    }
    update(onDone) {
        let t = (new Date()).getTime() - this.tStart;
        if (t < this.fadeInDelay) {
            this.block.alpha = t / this.fadeInDelay;
        }
        else if (t < this.fadeInDelay + this.delay) {
            this.block.alpha = 1;
        }
        else if (t < this.fadeInDelay + this.delay + this.fadeOutDelay) {
            this.block.alpha = 1 - ((t - this.fadeInDelay - this.delay) / this.fadeOutDelay);
        }
        else {
            this.texture.dispose();
            this.mesh.dispose();
            onDone();
        }
    }
}
class Utils {
    static RequestFullscreen() {
        if (Main.Canvas.requestFullscreen) {
            Main.Canvas.requestFullscreen();
        }
        else if (Main.Canvas.webkitRequestFullscreen) {
            Main.Canvas.webkitRequestFullscreen();
        }
        Main.Engine.resize();
    }
}
