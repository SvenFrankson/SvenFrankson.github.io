abstract class BaseToy extends BABYLON.TransformNode {

    public static easeOutElastic(t) {
        var p = 0.3;
        return Math.pow(2,-10*t) * Math.sin((t-p/4)*(2*Math.PI)/p) + 1;
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