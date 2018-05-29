abstract class BaseToy extends BABYLON.TransformNode {

    public static easeOutElastic(t) {
        var p = 0.3;
        return Math.pow(2,-10*t) * Math.sin((t-p/4)*(2*Math.PI)/p) + 1;
    }

    public static CreateCircle(r: number, tesselation: number, color: BABYLON.Color4, updatable: boolean = false, instance: BABYLON.LinesMesh = undefined): BABYLON.LinesMesh {
        let points: BABYLON.Vector3[] = [];
        let colors: BABYLON.Color4[] = [];

        for (let i = 0; i <= tesselation; i++) {
            points.push(
                new BABYLON.Vector3(
                    Math.cos(i / tesselation * Math.PI * 2) * r,
                    0,
                    Math.sin(i / tesselation * Math.PI * 2) * r
                )
            );
            colors.push(color);
        }

        return BABYLON.MeshBuilder.CreateLines("circle", {points: points, colors: colors, updatable: updatable, instance: instance})
    }

    constructor(name: string, scene: BABYLON.Scene) {
        super(name, scene);
    }

    public async wait(seconds: number): Promise<void> {
        return new Promise<void>(
            (resolve) => {
                setTimeout(
                    () => {
                        resolve();
                    },
                    1000 * seconds
                );
            }
        )
    }

    public abstract async start(): Promise<void>;
    public abstract async end(): Promise<void>;
}