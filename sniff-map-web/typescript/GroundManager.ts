class GroundManager {
    public globalGround: BABYLON.Mesh;
    public localGround: BABYLON.Mesh;

    constructor(w: number, h: number) {
        this.globalGround = BABYLON.MeshBuilder.CreateGround("GlobalGround", {width: w, height: h}, Main.instance.scene);
        let groundMaterial: BABYLON.StandardMaterial = new BABYLON.StandardMaterial("GroundMaterial", Main.instance.scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("./data/map.png", Main.instance.scene);
        groundMaterial.specularColor.copyFromFloats(0.2, 0.2, 0.2);
        this.globalGround.material = groundMaterial;

        this.localGround = BABYLON.MeshBuilder.CreateDisc("LocalGround", {radius: 1}, Main.instance.scene);
        this.localGround.rotation.x = Math.PI / 2;
        this.localGround.position.y = -0.05;
        this.localGround.scaling.copyFromFloats(20, 20, 20);
        let localGroundMaterial: BABYLON.StandardMaterial = new BABYLON.StandardMaterial("LocalGroundMaterial", Main.instance.scene);
        localGroundMaterial.diffuseColor.copyFromFloats(0.6, 0.6, 0.6);
        localGroundMaterial.specularColor.copyFromFloats(0.2, 0.2, 0.2);
        this.localGround.material = localGroundMaterial;
    }

    public toLocalGround(target: BABYLON.Vector3): void {
        this.k = 0;
        this.localGround.position.x = target.x;
        this.localGround.position.z = target.z;
        Main.instance.scene.registerBeforeRender(this.transitionStepToLocal);
    }

    public toGlobalGround(): void {
        this.k = 0;
        Main.instance.scene.registerBeforeRender(this.transitionStepToGlobal);
    }
    
    public k: number = 0;
    public duration: number = 120;
    public transitionStepToGlobal = () => {
        this.k++;
        this.localGround.visibility = (1 - this.k / this.duration);
        this.globalGround.visibility = this.k / this.duration;
        Main.failureMaterial.alpha = this.k / this.duration;

        if (this.k >= this.duration) {
            Main.instance.scene.unregisterBeforeRender(this.transitionStepToGlobal);
        }
    }

    public transitionStepToLocal = () => {
        this.k++;
        this.localGround.visibility = this.k / this.duration;
        this.globalGround.visibility = 1 - this.k / this.duration;
        Main.failureMaterial.alpha = 1 - this.k / this.duration;

        if (this.k >= this.duration) {
            Main.instance.scene.unregisterBeforeRender(this.transitionStepToLocal);
        }
    }
}