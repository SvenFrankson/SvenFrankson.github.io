class Main {

    public static instance: Main;
    public canvas: HTMLCanvasElement;
    public engine: BABYLON.Engine;
    public scene: BABYLON.Scene;
    public light: BABYLON.Light;
    public camera: BABYLON.Camera;

    public static okMaterial: BABYLON.StandardMaterial;
    public static failureMaterial: BABYLON.StandardMaterial;

    constructor(canvasElement: string) {
        Main.instance = this;
        this.canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
        this.engine = new BABYLON.Engine(this.canvas, true);
        BABYLON.Engine.ShadersRepository = "./shaders/";
    }

    createScene(): void {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor.copyFromFloats(0, 0, 0, 1);
        this.resize();

        let hemisphericLight: BABYLON.HemisphericLight = new BABYLON.HemisphericLight("Light", BABYLON.Vector3.Up(), this.scene);
        this.light = hemisphericLight;

        let arcRotateCamera: BABYLON.ArcRotateCamera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 1, BABYLON.Vector3.Zero(), this.scene);
        arcRotateCamera.setPosition(new BABYLON.Vector3(3, 2, -5));
        arcRotateCamera.attachControl(this.canvas);
        this.scene.activeCamera = arcRotateCamera;

        Main.okMaterial = new BABYLON.StandardMaterial("Random", this.scene);
        Main.okMaterial.diffuseColor = BABYLON.Color3.FromHexString("#42c8f4");
        Main.okMaterial.backFaceCulling = false;

        Main.failureMaterial = new BABYLON.StandardMaterial("Random", this.scene);
        Main.failureMaterial.diffuseColor = BABYLON.Color3.FromHexString("#f48042");
        Main.failureMaterial.backFaceCulling = false;

        let long: number = 7.76539;
        let lat: number = 48.581;
        if (localStorage.getItem("long-value") !== null) {
            long = parseFloat(localStorage.getItem("long-value"));
        }
        if (localStorage.getItem("lat-value") !== null) {
            lat = parseFloat(localStorage.getItem("lat-value"));
        }
        $("#long-input").val(long + "");
        $("#lat-input").val(lat + "");

        $("#long-input").on("input change", (e) => {
            long = parseFloat((e.currentTarget as HTMLInputElement).value);
            localStorage.setItem("long-value", long + "");
        });
        
        $("#lat-input").on("input change", (e) => {
            lat = parseFloat((e.currentTarget as HTMLInputElement).value);
            localStorage.setItem("lat-value", lat + "");
        });
        
        let poc: Poc = new Poc();
        poc.getDataAt(
            long,
            lat,
            () => {
                poc.instantiateBuildings(this.scene);

                setInterval(
                    () => {
                        new Failure(
                            new BABYLON.Vector2(
                                (Math.random() - 0.5) * 48,
                                (Math.random() - 0.5) * 48
                            ),
                            Math.random() * 5
                        );
                        Failure.update();
                    },
                    1500
                )
            }
        );

        let ground: BABYLON.Mesh = BABYLON.MeshBuilder.CreateDisc("Ground", {radius: 24}, this.scene);
        ground.rotation.x = Math.PI / 2;

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
