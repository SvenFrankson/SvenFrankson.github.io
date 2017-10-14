class Twittalert extends BABYLON.Mesh {

    constructor(
        position: BABYLON.Vector3,
        content: string,
        date: string,
        author: string,
        scene: BABYLON.Scene
    ) {
        super("TwittAlert", scene);
        this.position.copyFrom(position);

        BABYLON.SceneLoader.ImportMesh(
            "",
            "./data/twit-logo.babylon",
            "",
            scene,
            (meshes) => {
                if (meshes[0]) {
                    meshes[0].scaling.copyFromFloats(0.2, 0.2, 0.2);
                    meshes[0].material = Main.okMaterial;
                    let k: number = 0;
                    let direction: BABYLON.Vector3 = new BABYLON.Vector3(
                        Math.random() - 0.5,
                        2,
                        Math.random() - 0.5
                    );
                    direction.normalize();
                    direction.scaleInPlace(0.02);
                    let step = () => {
                        meshes[0].position.addInPlace(direction);
                        meshes[0].position.x += Math.cos(k / 10) / 50;
                        meshes[0].position.z += Math.sin(k / 5) / 50;
                        meshes[0].rotation.y += (Math.cos(k / 10) + 1) / 50;
                        k++;
                        if (k > 600) {
                            scene.unregisterBeforeRender(step);
                            meshes[0].dispose();
                            this.dispose();
                        }
                    }
                    scene.registerBeforeRender(step);
                }
            }
        )
    }
}