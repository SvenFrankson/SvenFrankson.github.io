/// <reference path="./BaseToy.ts" />

class SolarToy extends BaseToy {

    private earthDiameter: number = 0.1;
    private radius: number = 1;
    public sun: BABYLON.Mesh;
    public mercury: BABYLON.Mesh;
    public venus: BABYLON.Mesh;
    public earth: BABYLON.Mesh;
    public mars: BABYLON.Mesh;
    public jupiter: BABYLON.Mesh;
    public saturn: BABYLON.Mesh;
    public uranus: BABYLON.Mesh;
    public neptune: BABYLON.Mesh;
    public pluto: BABYLON.Mesh;
    public orbitLines: BABYLON.LinesMesh;
    public planets: BABYLON.Mesh[] = [];
    public alphas: number[] = [];
    public speeds: number[] = [];

    constructor(position: BABYLON.Vector3, rotation: BABYLON.Vector3, radius: number, scene: BABYLON.Scene) {
        super("SolarToy", scene);
        this.position = position;
        this.rotation = rotation;
        this.radius = radius;
    }

    public destroy(): void {
        this.dispose();
    }

    public async start(): Promise<void> {
        this.sun = this.createPlanet("sun", Math.sqrt(109) * this.earthDiameter);
        this.mercury = this.createPlanet("mercury", Math.sqrt(0.38) * this.earthDiameter);
        this.venus = this.createPlanet("venus", Math.sqrt(0.95) * this.earthDiameter);
        this.earth = this.createPlanet("earth", Math.sqrt(1) * this.earthDiameter);
        this.mars = this.createPlanet("mars", Math.sqrt(0.53) * this.earthDiameter);
        this.jupiter = this.createPlanet("jupiter", Math.sqrt(11) * this.earthDiameter);
        this.saturn = this.createPlanet("saturn", Math.sqrt(9.4) * this.earthDiameter);
        this.uranus = this.createPlanet("uranus", Math.sqrt(4) * this.earthDiameter);
        this.neptune = this.createPlanet("neptune", Math.sqrt(3.8) * this.earthDiameter);
        this.pluto = this.createPlanet("pluto", Math.sqrt(0.19) * this.earthDiameter);

        this.planets = [
            this.sun,
            this.mercury,
            this.venus,
            this.earth,
            this.mars,
            this.jupiter,
            this.saturn,
            this.uranus,
            this.neptune,
            this.pluto
        ];
        
        this.speeds = [
            1,
            2,
            1,
            3,
            1,
            4,
            3,
            1,
            3,
            4
        ];
                        
        let orbitPoints: BABYLON.Vector3[][] = [];
        let orbitColors: BABYLON.Color4[][] = [];

        let mat = new BABYLON.StandardMaterial("Test", Main.Scene);
        mat.alpha = 0;

        for (let i = 0; i < this.planets.length; i++) {
            this.planets[i].parent = this;
            this.alphas.push(Math.random() * 2 * Math.PI);
            this.alphas.push(Math.random() * 2 * Math.PI);
            let lum = 3;
            this.planets[i].material = mat;
            this.planets[i].enableEdgesRendering();
            this.planets[i].edgesColor = Main.Color4.scale(lum);

            orbitPoints[i] = [];
            orbitColors[i] = [];
            let r = i / (this.planets.length - 1) * this.radius;
            for (let j = 0; j <= 64; j++) {
                orbitPoints[i].push(
                    new BABYLON.Vector3(
                        r * Math.cos(j / 64 * Math.PI * 2),
                        0,
                        r * Math.sin(j / 64 * Math.PI * 2)
                    )
                )
                orbitColors[i].push(Main.Color4.scale(lum * 0.75 * (1 - i / this.planets.length)));
            }
        }

        this.orbitLines = BABYLON.MeshBuilder.CreateLineSystem(
            "orbits",
            {
                lines: orbitPoints,
                colors: orbitColors,
                updatable: true,
                instance: undefined
            },
            this.getScene()
        );
        this.orbitLines.parent = this;

        this.getScene().onBeforeRenderObservable.add(this._update);

        return Main.RunCoroutine(this.unfold(120));
    }

    public async end(): Promise<void> {
        await Main.RunCoroutine(this.fold(120));
        this.getScene().onBeforeRenderObservable.removeCallback(this._update);
    }

    private createPlanet(name: string, diameter: number): BABYLON.Mesh {
        return BABYLON.MeshBuilder.CreateSphere(name, {diameter: diameter, segments: 6}, this.getScene());
    }

    private * unfold(duration: number): IterableIterator<void> {
        let foldedPosition = this.position.scale(2);
        let unfoldedPosition = this.position.clone();
        for (let i = 0; i < duration; i++) {
            let d = i / duration;
            d = SolarToy.easeOutElastic(d);
            this.scaling.copyFromFloats(d, d, d);
            BABYLON.Vector3.LerpToRef(foldedPosition, unfoldedPosition, d, this.position);
            yield;
        }
        this.position.copyFrom(unfoldedPosition);
        this.scaling.copyFromFloats(1, 1, 1);
    }

    private * fold(duration: number): IterableIterator<void> {
        let foldedPosition = this.position.scale(2);
        let unfoldedPosition = this.position.clone();
        for (let i = 0; i < duration; i++) {
            let d = i / duration;
            d = d * d;
            this.scaling.copyFromFloats(1 - d, 1 - d, 1 - d);
            BABYLON.Vector3.LerpToRef(unfoldedPosition, foldedPosition, d, this.position);
            yield;
        }
        this.position.copyFrom(foldedPosition);
        this.scaling.copyFromFloats(0, 0, 0);
    }

    private _update = () => {
        for (let i = 0; i < this.planets.length; i++) {
            this.alphas[i] += 0.002 * this.speeds[i];
            let r = i / (this.planets.length - 1) * this.radius;
            this.planets[i].position.x = r * Math.cos(this.alphas[i]);
            this.planets[i].position.z = r * Math.sin(this.alphas[i]);
            this.planets[i].rotation.y -= 0.003 * this.speeds[i]
        }
    }
}