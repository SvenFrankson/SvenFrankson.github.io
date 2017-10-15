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
    public positionPointerDown: BABYLON.Vector2;

    public static okMaterial: BABYLON.StandardMaterial;
    public static nokMaterial: BABYLON.StandardMaterial;
    public static failureMaterial: BABYLON.StandardMaterial;
    public static greenMaterial: BABYLON.StandardMaterial;
    public static purpleMaterial: BABYLON.StandardMaterial;
    public static twitterMaterial: BABYLON.StandardMaterial;

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
        this.positionPointerDown = BABYLON.Vector2.Zero();
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
                -350, 350, -350
            )
        );

        this.cameraManager = new CameraManager();

        Main.okMaterial = new BABYLON.StandardMaterial("Random", this.scene);
        Main.okMaterial.diffuseColor = BABYLON.Color3.FromHexString("#FFFFFF");
        Main.okMaterial.backFaceCulling = false;
        
        Main.nokMaterial = new BABYLON.StandardMaterial("Random", this.scene);
        Main.nokMaterial.diffuseColor = BABYLON.Color3.FromHexString("#E74D3B");
        Main.nokMaterial.backFaceCulling = false;

        Main.failureMaterial = new BABYLON.StandardMaterial("Random", this.scene);
        Main.failureMaterial.diffuseColor = BABYLON.Color3.FromHexString("#E74D3B");
        Main.failureMaterial.backFaceCulling = false;
        
        Main.greenMaterial = new BABYLON.StandardMaterial("Random", this.scene);
        Main.greenMaterial.diffuseColor = BABYLON.Color3.FromHexString("#0FEACA");
        
        Main.purpleMaterial = new BABYLON.StandardMaterial("Random", this.scene);
        Main.purpleMaterial.diffuseColor = BABYLON.Color3.FromHexString("#AD5EEC");

        Main.twitterMaterial = new BABYLON.StandardMaterial("TwitterMaterial", this.scene);
        Main.twitterMaterial.diffuseTexture = new BABYLON.Texture("./Content/twitter-logo.png", this.scene);

        this.ui = new UI();

        let poc: Poc = new Poc();
        let h: number = 1024;
        let w: number = 1024;

        this.groundManager = new GroundManager(h, w);

        /*
        for (let i: number = 0; i < 10; i++) {
            $.ajax(
                {
                    url: "http://svenfrankson.github.io/sniff-map-web/Content/test-tweet.json",
                    success: (data: ITweet) => {
                        myMethod(data);
                    }
                }
            )
        }
        */
        /*
        setInterval(
            () => {
                $.ajax(
                    {
                        url: "http://svenfrankson.github.io/sniff-map-web/Content/test-tweet.json",
                        success: (data: ITweet) => {
                            myMethod(data);
                        }
                    }
                )
            },
            3000
        )
        */

        let lon: number = Tools.XToLon(0);
        let lat: number = Tools.ZToLat(0);
        Building.Clear();
        poc.loadTile(
            0,
            () => {
                poc.loadTile(
                    1,
                    () => {
                        poc.loadTile(
                            2,
                            () => {
                                poc.loadTile(
                                    3,
                                    () => {
                                        poc.loadTile(
                                            4,
                                            () => {
                                                poc.loadTile(
                                                    5,
                                                    () => {
                                                        poc.loadTile(
                                                            6,
                                                            () => {
                                                                poc.loadTile(
                                                                    7,
                                                                    () => {
                                                                        poc.loadTile(
                                                                            8,
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

        let positionPointerUp: BABYLON.Vector2 = BABYLON.Vector2.Zero();
        this.scene.onPointerObservable.add(
            (eventData: BABYLON.PointerInfo, eventState: BABYLON.EventState) => {
                if (eventData.type === BABYLON.PointerEventTypes._POINTERUP) {
                    positionPointerUp.x = this.scene.pointerX;
                    positionPointerUp.y = this.scene.pointerY;

                    if (BABYLON.Vector2.Distance(this.positionPointerDown, positionPointerUp) > 5) {
                        return;
                    }

                    this.cameraManager.preventForcedMove = false;
                    let pickingInfo: BABYLON.PickingInfo = this.scene.pick(
                        this.scene.pointerX,
                        this.scene.pointerY,
                        (m: BABYLON.AbstractMesh) => {
                            return m.name === "Tile";
                        }
                    )
                    if (pickingInfo.pickedMesh) {
                        let tweetAlert = pickingInfo.pickedMesh.parent as Twittalert;
                        tweetAlert.hidden = !tweetAlert.hidden;
                    }
                    pickingInfo = this.scene.pick(
                        this.scene.pointerX,
                        this.scene.pointerY,
                        (m : BABYLON.AbstractMesh) => {
                            return m === this.groundManager.globalGround;
                        }
                    );
                    if (pickingInfo.hit) {
                        this.cameraManager.goToLocal(pickingInfo.pickedPoint);
                    }
                } else if (eventData.type === BABYLON.PointerEventTypes._POINTERDOWN) {
                    this.cameraManager.preventForcedMove = true;
                    this.positionPointerDown.x = this.scene.pointerX;
                    this.positionPointerDown.y = this.scene.pointerY;
                } else if (eventData.type === BABYLON.PointerEventTypes._POINTERWHEEL) {
                    this.cameraManager.preventForcedMove = true;
                    this.cameraManager.preventForcedMove = false;
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

    public pointsOfInterestBoundingInfo(): {min: BABYLON.Vector3, max: BABYLON.Vector3} {
        let min: BABYLON.Vector3 = new BABYLON.Vector3(-1, -1, -1);
        let max: BABYLON.Vector3 = new BABYLON.Vector3(1, 1, 1);

        Twittalert.instances.forEach(
            (t: Twittalert) => {
                min.x = Math.min(t.position.x, min.x);
                min.y = Math.min(t.position.y, min.y);
                min.z = Math.min(t.position.z, min.z);

                max.x = Math.max(t.position.x, max.x);
                max.y = Math.max(t.position.y, max.y);
                max.z = Math.max(t.position.z, max.z);
            }
        );

        Failure.instances.forEach(
            (f: Failure) => {
                min.x = Math.min(f.origin.x, min.x);
                min.z = Math.min(f.origin.y, min.z);

                max.x = Math.max(f.origin.x, max.x);
                max.z = Math.max(f.origin.y, max.z);
            }
        );

        return {
            min: min,
            max: max
        };
    }
}

function myMethod(node1: ITweet) {
    let position: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    position.x = Tools.LonToX(node1.Longitude);
    position.z = -Tools.LatToZ(node1.Latitude);
    position.x += (Math.random() - 0.5) * 64;
    position.z += (Math.random() - 0.5) * 64;
    new Twittalert(
        position,
        node1.Text,
        " Today",
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
