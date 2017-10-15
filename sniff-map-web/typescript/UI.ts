class UI {

    public texture: BABYLON.GUI.AdvancedDynamicTexture;
    public back: BABYLON.GUI.Button;

    constructor() {
        this.texture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        this.back = BABYLON.GUI.Button.CreateSimpleButton("Back", "Back");
        this.back.width = 0.1;
        this.back.height = 0.1;
        this.back.left = "4Opx";
        this.back.top = "10px";
        this.back.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.back.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.back.background = "white";
        this.back.color = "#13EA8D";
        this.back.children[0].color = "black";
        this.back.cornerRadius = 5;
        this.back.onPointerUpObservable.add(
            () => {
                Main.instance.cameraManager.goToGlobal();
                Main.instance.groundManager.toGlobalGround();
                Main.instance.positionPointerDown.x = -42;
            }
        )

        this.texture.addControl(this.back);
    }
}