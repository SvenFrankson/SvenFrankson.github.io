/// <reference path="./BaseToy.ts" />

class LifeToy extends BaseToy {

    private lum: number = 3;
    private radius: number = 0;
    private meshes: BABYLON.Mesh[][];
    private states: boolean[][];

    constructor(position: BABYLON.Vector3, radius: number, scene: BABYLON.Scene) {
        super("SolarToy", scene);
        this.position = position;
        this.radius = Math.round(radius);
        this.meshes = [];
        this.states = [];

        let mat = new BABYLON.StandardMaterial("Test", Main.Scene);
        mat.alpha = 0;

        for (let i = 0; i < 2 * this.radius + 1; i++) {
            this.meshes[i] = [];
            this.states[i] = [];
            for (let j = 0; j < 2 * this.radius + 1; j++) {
                this.meshes[i][j] = BABYLON.MeshBuilder.CreateSphere("s", {diameter: 0.75 + (Math.random() - 0.5) * 0.5, segments: 6}, this.getScene());
                this.meshes[i][j].position.x = i - this.radius;
                this.meshes[i][j].position.z = j - this.radius;
                let max = Math.max(Math.abs(i - this.radius), Math.abs(j - this.radius));
                let r = Math.sqrt(2 * max * max) / this.meshes[i][j].position.length();
                this.meshes[i][j].position.scaleInPlace(r);
                this.meshes[i][j].scaling.copyFromFloats(0, 0, 0);
                this.meshes[i][j].parent = this;
                this.states[i][j] = Math.random() > 0.75;
                this.meshes[i][j].material = mat;
                this.meshes[i][j].enableEdgesRendering();
                this.meshes[i][j].edgesColor = Main.Color4.scale(this.lum);
            }
        }
    }

    public destroy(): void {
        this.dispose();
    }

    public async start(): Promise<void> {
        for (let i = 0; i < 2 * this.radius + 1; i++) {
            for (let j = 0; j < 2 * this.radius + 1; j++) {
                if (this.states[i][j]) {
                    Main.StartCoroutine(this.unfold(this.meshes[i][j], 0, 120, 0));
                }
            }
        }
        return Main.RunCoroutine(this.idle(undefined, 120));
    }

    public async end(): Promise<void> {
        for (let i = 0; i < 2 * this.radius + 1; i++) {
            for (let j = 0; j < 2 * this.radius + 1; j++) {
                if (this.states[i][j]) {
                    Main.StartCoroutine(this.fold(this.meshes[i][j], 0, 120, 0));
                }
            }
        }
        await Main.RunCoroutine(this.idle(undefined, 120));
        this.destroy();
    }

    public * update(duration: number): IterableIterator<void> {
        let newStates: boolean[][] = [];
        for (let i = 0; i < 2 * this.radius + 1; i++) {
            newStates[i] = [];
            for (let j = 0; j < 2 * this.radius + 1; j++) {
                let n = 0;
                if (this.states[i - 1]) {
                    if (this.states[i - 1][j - 1]) {
                        n++;
                    }
                    if (this.states[i - 1][j]) {
                        n++;
                    }
                    if (this.states[i - 1][j + 1]) {
                        n++;
                    }
                }
                if (this.states[i][j - 1]) {
                    n++;
                }
                if (this.states[i][j + 1]) {
                    n++;
                }
                if (this.states[i + 1]) {
                    if (this.states[i + 1][j - 1]) {
                        n++;
                    }
                    if (this.states[i + 1][j]) {
                        n++;
                    }
                    if (this.states[i + 1][j + 1]) {
                        n++;
                    }
                }
                if (n === 3) {
                    newStates[i][j] = true;
                    if (this.states[i][j]) {
                        //Main.StartCoroutine(this.idle(this.meshes[i][j], duration));
                    }
                    else {
                        let delay = Math.round(Math.random() * duration / 4);
                        let cooldown = Math.round(Math.random() * duration / 4);
                        Main.StartCoroutine(this.unfold(this.meshes[i][j], delay, duration - delay - cooldown, cooldown));
                    }
                }
                else if (n < 2 || n > 3) {
                    newStates[i][j] = false;
                    if (this.states[i][j]) {
                        let delay = Math.round(Math.random() * duration / 8);
                        let cooldown = Math.round(Math.random() * duration / 2);
                        Main.StartCoroutine(this.fold(this.meshes[i][j], delay, duration - delay - cooldown, cooldown));
                    }
                }
                else {
                    newStates[i][j] = this.states[i][j];
                    if (this.states[i][j]) {
                        //Main.StartCoroutine(this.idle(this.meshes[i][j], duration));
                    }
                }
            }
        }
        this.states = newStates;
        for (let i = 0; i < duration; i++) {
            yield;
        }
    }

    private * unfold(mesh: BABYLON.Mesh, delay: number, duration: number, cooldown: number): IterableIterator<void> {
        mesh.scaling.copyFromFloats(0, 0, 0);
        for (let i = 0; i < delay; i++) {
            yield;
        }
        for (let i = 0; i < duration; i++) {
            let s = i / duration;
            s = BaseToy.easeOutElastic(s);
            mesh.scaling.copyFromFloats(s, s, s);
            yield;
        }
        for (let i = 0; i < cooldown; i++) {
            yield;
        }
        mesh.scaling.copyFromFloats(1, 1, 1);
    }

    private * idle(mesh: BABYLON.Mesh, duration: number): IterableIterator<void> {
        
        for (let i = 0; i < duration; i++) {
            yield;
        }
    }

    private * fold(mesh: BABYLON.Mesh, delay: number, duration: number, cooldown: number): IterableIterator<void> {
        mesh.scaling.copyFromFloats(1, 1, 1);
        for (let i = 0; i < delay; i++) {
            yield;
        }
        for (let i = 0; i < duration; i++) {
            let s = 1 - i / duration;
            s *= s;
            mesh.scaling.copyFromFloats(s, s, s);
            yield;
        }
        for (let i = 0; i < cooldown; i++) {
            yield;
        }
        mesh.scaling.copyFromFloats(0, 0, 0);
    }
}