class Building extends BABYLON.Mesh {

    public static instances: Building[] = [];
    public coordinates: BABYLON.Vector2;

    constructor(scene: BABYLON.Scene) {
        super("Building", scene);
        Building.instances.push(this);
        this.material = Main.okMaterial;
    }

    public Dispose(): void {
        let index: number = Building.instances.indexOf(this);
        if (index !== -1) {
            Building.instances.splice(index, 1);
        }
        this.dispose();
    }

    public static Clear(): void {
        while (Building.instances.length > 0) {
            Building.instances[0].Dispose();
        }
    }
}