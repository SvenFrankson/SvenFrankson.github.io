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
    public static greenMaterial: BABYLON.StandardMaterial;

    public static medLon: number = 7.7554;
    public static medLat: number = 48.5844;

    public static medX: number = 0;
    public static medZ: number = 0;

    constructor(canvasElement: string) {
        Main.instance = this;
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
                -500, 500, -500
            )
        );

        this.cameraManager = new CameraManager();

        Main.okMaterial = new BABYLON.StandardMaterial("Random", this.scene);
        Main.okMaterial.diffuseColor = BABYLON.Color3.FromHexString("#ffffff");
        Main.okMaterial.backFaceCulling = false;
        
        Main.nokMaterial = new BABYLON.StandardMaterial("Random", this.scene);
        Main.nokMaterial.diffuseColor = BABYLON.Color3.FromHexString("#E74D3B");
        Main.nokMaterial.backFaceCulling = false;

        Main.failureMaterial = new BABYLON.StandardMaterial("Random", this.scene);
        Main.failureMaterial.diffuseColor = BABYLON.Color3.FromHexString("#E74D3B");
        Main.failureMaterial.backFaceCulling = false;
        
        Main.greenMaterial = new BABYLON.StandardMaterial("Random", this.scene);
        Main.greenMaterial.diffuseColor = BABYLON.Color3.FromHexString("#38c128");

        this.ui = new UI();

        setInterval(
            () => {
                let position: BABYLON.Vector2 = BABYLON.Vector2.Zero();
                position.x = Math.random() - 0.5;
                position.y = Math.random() - 0.5;
                position.scaleInPlace(64);
                let range: number = Math.random() * 8 + 2;
                new Failure(position, range);
            },
            10000
        );

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
        let h: number = 1024;
        let w: number = 1024;

        this.groundManager = new GroundManager(h, w);

        let lon: number = Tools.XToLon(0);
        let lat: number = Tools.ZToLat(0);
        Building.Clear();
        poc.getDataAt(
            lon,
            lat,
            () => {
                poc.getDataAt(
                    lon - poc.tileSize * 2,
                    lat - poc.tileSize * 2,
                    () => {
                        poc.getDataAt(
                            lon + poc.tileSize * 2,
                            lat + poc.tileSize * 2,
                            () => {
                                poc.getDataAt(
                                    lon - poc.tileSize * 2,
                                    lat + poc.tileSize * 2,
                                    () => {
                                        poc.getDataAt(
                                            lon + poc.tileSize * 2,
                                            lat - poc.tileSize * 2,
                                            () => {
                                                poc.getDataAt(
                                                    lon - poc.tileSize * 2,
                                                    lat,
                                                    () => {
                                                        poc.getDataAt(
                                                            lon + poc.tileSize * 2,
                                                            lat,
                                                            () => {
                                                                poc.getDataAt(
                                                                    lon,
                                                                    lat + poc.tileSize * 2,
                                                                    () => {
                                                                        poc.getDataAt(
                                                                            lon,
                                                                            lat - poc.tileSize * 2,
                                                                            () => {
                                                                                
                                                                            }
                                                                        );
                                                                    }
                                                                );
                                                            }
                                                        );
                                                    }
                                                );
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );

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
                        this.cameraManager.goToLocal(pickingInfo.pickedPoint);
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

function myMethod(node1: ITweet) {
    let position: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    position.x = Tools.LonToX(node1.Longitude);
    position.z = -Tools.LatToZ(node1.Latitude);
    new Twittalert(
        position,
        node1.Text,
        " today",
        node1.Name,
        node1.URLPicture,
        Main.instance.scene
    );
}

window.addEventListener("DOMContentLoaded", () => {
    let game: Main = new Main("supermap");
    game.createScene();
    game.animate();
});
