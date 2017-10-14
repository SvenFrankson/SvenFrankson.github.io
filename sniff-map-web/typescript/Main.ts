class Main {

    public static instance: Main;
    public canvas: HTMLCanvasElement;
    public engine: BABYLON.Engine;
    public scene: BABYLON.Scene;
    public light: BABYLON.Light;
    public camera: BABYLON.ArcRotateCamera;
    public cameraManager: CameraManager;
    public ui: UI;
    public groundManager: GroundManager;
    public buildingMaker: BuildingMaker;

    public static okMaterial: BABYLON.StandardMaterial;
    public static nokMaterial: BABYLON.StandardMaterial;
    public static failureMaterial: BABYLON.StandardMaterial;

    public static minLon: number = 7.1665596;
    public static maxLon: number = 8.1771085;
    public static minLat: number = 48.3614766;
    public static maxLat: number = 49.0194274;

    public static medLon: number;
    public static medLat: number;

    public static medX: number = 0;
    public static medZ: number = 0;

    constructor(canvasElement: string) {
        Main.instance = this;
        Main.medLon = (Main.minLon + Main.maxLon) / 2;
        Main.medLat = (Main.minLat + Main.maxLat) / 2;
        Main.medX = Tools.LonToX(Main.medLon);
        Main.medZ = Tools.LatToZ(Main.medLat);
        console.log("MedX " + Main.medX);
        console.log("MedZ " + Main.medZ);
        this.canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
        this.engine = new BABYLON.Engine(this.canvas, true);
        BABYLON.Engine.ShadersRepository = "./shaders/";
    }

    createScene(): void {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor.copyFromFloats(0, 0, 0, 1);
        this.resize();

        this.buildingMaker = new BuildingMaker();

        let hemisphericLight: BABYLON.HemisphericLight = new BABYLON.HemisphericLight("Light", BABYLON.Vector3.Up(), this.scene);
        this.light = hemisphericLight;

        this.camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 1, BABYLON.Vector3.Zero(), this.scene);
        this.camera.attachControl(this.canvas);
        this.camera.setPosition(
            new BABYLON.Vector3(
                -1000, 1000, -1000
            )
        );

        this.cameraManager = new CameraManager();

        Main.okMaterial = new BABYLON.StandardMaterial("Random", this.scene);
        Main.okMaterial.diffuseColor = BABYLON.Color3.FromHexString("#42c8f4");
        Main.okMaterial.backFaceCulling = false;
        
        Main.nokMaterial = new BABYLON.StandardMaterial("Random", this.scene);
        Main.nokMaterial.diffuseColor = BABYLON.Color3.FromHexString("#f48042");
        Main.nokMaterial.backFaceCulling = false;

        Main.failureMaterial = new BABYLON.StandardMaterial("Random", this.scene);
        Main.failureMaterial.diffuseColor = BABYLON.Color3.FromHexString("#f48042");
        Main.failureMaterial.backFaceCulling = false;

        this.ui = new UI();

        // let long: number = 7.76539;
        // let lat: number = 48.581;
        // if (localStorage.getItem("long-value") !== null) {
        //     long = parseFloat(localStorage.getItem("long-value"));
        // }
        // if (localStorage.getItem("lat-value") !== null) {
        //     lat = parseFloat(localStorage.getItem("lat-value"));
        // }
        // $("#long-input").val(long + "");
        // $("#lat-input").val(lat + "");
        // 
        // $("#long-input").on("input change", (e) => {
        //     long = parseFloat((e.currentTarget as HTMLInputElement).value);
        //     localStorage.setItem("long-value", long + "");
        // });
        // 
        // $("#lat-input").on("input change", (e) => {
        //     lat = parseFloat((e.currentTarget as HTMLInputElement).value);
        //     localStorage.setItem("lat-value", lat + "");
        // });
        
        let poc: Poc = new Poc();
        let h: number = Tools.LatToZ(Main.maxLat) - Tools.LatToZ(Main.minLat);
        let w: number = Tools.LonToX(Main.maxLon) - Tools.LonToX(Main.minLon);

        this.groundManager = new GroundManager(h, w);

        new Failure(
            new BABYLON.Vector2(
                Tools.LonToX(7.76539),
                Tools.LatToZ(48.581)
            ),
            5
        );

        //setInterval(
        //    () => {
        //        new Failure(
        //            new BABYLON.Vector2(
        //                (Math.random() - 0.5) * w,
        //                (Math.random() - 0.5) * h
        //            ),
        //            Math.random() * 20
        //        );
        //        Failure.update();
        //    },
        //    1500
        //);

        BABYLON.SceneLoader.ImportMesh(
            "",
            "http://svenfrankson.github.io/duck.babylon",
            "",
            this.scene,
            (meshes) => {
                meshes[0].position.x -= 1;
                meshes[0].position.z += 1.5;
                meshes[0].position.y = 0.3;
                this.scene.registerBeforeRender(
                    () => {
                        meshes[0].rotation.y += 0.01;
                    } 
                )
            }
        );

        let bottomLeft: BABYLON.Mesh = BABYLON.MeshBuilder.CreateBox("Cube", {size: 10}, this.scene);
        bottomLeft.position.x = Tools.LonToX(Main.minLon);
        bottomLeft.position.z = Tools.LatToZ(Main.minLat);
        console.log("BottomLeft " + bottomLeft.position);
        
        let topLeft: BABYLON.Mesh = BABYLON.MeshBuilder.CreateBox("Cube", {size: 10}, this.scene);
        topLeft.position.x = Tools.LonToX(Main.minLon);
        topLeft.position.z = Tools.LatToZ(Main.maxLat);
        
        let topRight: BABYLON.Mesh = BABYLON.MeshBuilder.CreateBox("Cube", {size: 10}, this.scene);
        topRight.position.x = Tools.LonToX(Main.maxLon);
        topRight.position.z = Tools.LatToZ(Main.maxLat);
        console.log("TopRight " + topRight.position);
        
        let bottomRight: BABYLON.Mesh = BABYLON.MeshBuilder.CreateBox("Cube", {size: 10}, this.scene);
        bottomRight.position.x = Tools.LonToX(Main.maxLon);
        bottomRight.position.z = Tools.LatToZ(Main.minLat);

        this.scene.onPointerObservable.add(
            (eventData: BABYLON.PointerInfo, eventState: BABYLON.EventState) => {
                if (eventData.type === BABYLON.PointerEventTypes._POINTERUP) {
                    let pickingInfo: BABYLON.PickingInfo = this.scene.pick(
                        this.scene.pointerX,
                        this.scene.pointerY,
                        (m : BABYLON.AbstractMesh) => {
                            return m === this.groundManager.globalGround;
                        }
                    );
                    if (pickingInfo.hit && this.cameraManager.state === CameraState.global) {
                        this.cameraManager.state = CameraState.ready;
                        let lon: number = Tools.XToLon(pickingInfo.pickedPoint.x);
                        let lat: number = Tools.ZToLat(pickingInfo.pickedPoint.z);
                        Building.Clear();
                        poc.getDataAt(
                            lon,
                            lat,
                            () => {
                                this.cameraManager.goToLocal(pickingInfo.pickedPoint);
                                this.groundManager.toLocalGround(pickingInfo.pickedPoint);
                                for (let i: number = -1; i <= 1; i++) {
                                    for (let j: number = -1; j <= 1; j++) {
                                        if (i !== j) {
                                            poc.getDataAt(
                                                lon + i * poc.tileSize * 2,
                                                lat + j * poc.tileSize * 2,
                                                () => {
                                                    
                                                }
                                            );
                                        }
                                    }
                                }
                            }
                        );
                    }
                }
            }
        )
    }

    public animate(): void {
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        window.addEventListener("resize", () => {
            this.resize();
        });
    }

    public resize(): void {
        this.engine.resize();
    }
}

window.addEventListener("DOMContentLoaded", () => {
    let game: Main = new Main("render-canvas");
    game.createScene();
    game.animate();
});
