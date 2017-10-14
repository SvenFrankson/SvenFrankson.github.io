class Failure {
    public static instances: Failure[] = [];

    public origin: BABYLON.Vector2;
    public sqrRange: number;

    constructor(origin: BABYLON.Vector2, range: number) {
        Failure.instances.push(this);
        this.origin = origin.clone();
        this.sqrRange = range * range;

        let debugSphere: BABYLON.Mesh = BABYLON.MeshBuilder.CreateDisc(
            "Disc",
            {
                radius: range
            },
            Main.instance.scene
        );
        debugSphere.position.x = origin.x;
        debugSphere.position.y = 0.05;
        debugSphere.position.z = origin.y;
        debugSphere.rotation.x = Math.PI / 2;
        debugSphere.material = Main.failureMaterial;
    }

    public static update(): void {
        Building.instances.forEach(
            (b: Building) => {
                b.material = Main.okMaterial;
                Failure.instances.forEach(
                    (f: Failure) => {
                        if (BABYLON.Vector2.DistanceSquared(b.coordinates, f.origin) < f.sqrRange) {
                            b.material = Main.failureMaterial;
                        }
                    }
                )
            }
        )

    }
}