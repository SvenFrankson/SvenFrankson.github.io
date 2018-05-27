class Main {

	public static Canvas: HTMLCanvasElement;
	public static Engine: BABYLON.Engine;
	public static Scene: BABYLON.Scene;
	public static Light: BABYLON.HemisphericLight;
	public static Color: BABYLON.Color3 = BABYLON.Color3.FromHexString("#22724b");
	public static Color4: BABYLON.Color4 = new BABYLON.Color4(Main.Color.r, Main.Color.g, Main.Color.b, 1);

	constructor(canvasElement: string) {
		Main.Canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
		Main.Engine = new BABYLON.Engine(Main.Canvas, true);
	}
	
	async createScene() {
		Main.Scene = new BABYLON.Scene(Main.Engine);
		this.resize();

		let light = new BABYLON.HemisphericLight("Light", (new BABYLON.Vector3(0.5, 0.65, 0.8)).normalize(), Main.Scene);
		light.groundColor.copyFromFloats(0.5, 0.5, 0.5);
		light.intensity = 0.7;

		let ratio: number = Main.Canvas.clientWidth / Main.Canvas.clientHeight;
		let height = 5;
		let width = height * ratio;
		let depth = Math.max(height, width);

		let camera = new BABYLON.FreeCamera("MenuCamera", BABYLON.Vector3.Zero(), Main.Scene);
		camera.attachControl(Main.Canvas);
		camera.position.z = - depth / 2 - height / Math.tan(camera.fov / 2);
		camera.rotation.x = 0.06;

		let mat = new BABYLON.StandardMaterial("Test", Main.Scene);
		mat.diffuseColor = Main.Color;
		mat.specularColor.copyFromFloats(0.1, 0.1, 0.1);
		mat.diffuseTexture = new BABYLON.Texture("./shadow.png", Main.Scene);

		let planeRight = BABYLON.MeshBuilder.CreatePlane("PlaneRight", {size: height * 2, width: depth * 2}, Main.Scene);
		planeRight.position.x = width;
		planeRight.rotation.y = Math.PI / 2;
		planeRight.material = mat;

		let planeLeft = BABYLON.MeshBuilder.CreatePlane("PlaneLeft", {size: height * 2, width: depth * 2}, Main.Scene);
		planeLeft.position.x = - width;
		planeLeft.rotation.y = - Math.PI / 2;
		planeLeft.material = mat;

		let planeBottom = BABYLON.MeshBuilder.CreatePlane("PlaneBottom", {size: depth * 2, width: width * 2}, Main.Scene);
		planeBottom.position.y = -height;
		planeBottom.rotation.x = Math.PI / 2;
		planeBottom.material = mat;

		let planeBack = BABYLON.MeshBuilder.CreatePlane("PlaneBack", {size: height * 2, width: width * 2}, Main.Scene);
		planeBack.position.z = depth;
		planeBack.material = mat;

		let planeTop = BABYLON.MeshBuilder.CreatePlane("PlaneTop", {size: depth * 2, width: width * 2}, Main.Scene);
		planeTop.position.y = height;
		planeTop.rotation.x = - Math.PI / 2;
		planeTop.material = mat;

		/*
		for (let i: number = 0; i < 50; i++) {
			let m = this.createCube();
			m.position.x = (Math.random() - 0.5) * 2 * width;
			m.position.y = (Math.random() - 0.5) * 2 * height;
			m.position.z = (Math.random() - 0.5) * 2 * depth;
			let s = Math.random() + 0.5;
			m.scaling.copyFromFloats(s, s, s);
			let axis = new BABYLON.Vector3(
				Math.random() - 0.5,
				Math.random() - 0.5,
				Math.random() - 0.5
			).normalize();
			let speed = Math.random() / 100;
			Main.Scene.registerBeforeRender(
				() => {
					m.rotate(axis, speed);
				}
			)
		}
		*/

		let route = new Route();
		window.addEventListener('hashchange', route.route);
		route.route();

		while (true) {
			if (Math.random() < 0.5) {
				for (let i = 0; i < 6; i++) {
					let x = width / 2 * (Math.random() - 0.5) * 2;
					let z = depth / 2 * (Math.random() - 0.5) * 2;
					await VoxelToy.start(
						new BABYLON.Vector3(x, - height, z)
					);
					await VoxelToy.wait(1.5);
					await VoxelToy.end();
				}
			}
			else {
				let solarToy = new SolarToy(new BABYLON.Vector3(0, - height * 0.3, 0), new BABYLON.Vector3(- Math.PI / 8, 0, 0), width * 0.9, Main.Scene);
				await solarToy.start();
				await solarToy.wait(2);
				await solarToy.end();
			}
		}

	}

	public animate(): void {
		Main.Engine.runRenderLoop(() => {
			Main.Scene.render();
		});
	}

	public resize(): void {
		Main.Engine.resize();
	}

	public createCube(): BABYLON.Mesh {
		let mat = new BABYLON.StandardMaterial("Test", Main.Scene);
		mat.alpha = 0;
		let mesh = BABYLON.MeshBuilder.CreateBox("Test", {}, Main.Scene);
		mesh.material = mat;
		mesh.enableEdgesRendering();
		let lum = 3;
		mesh.edgesColor = Main.Color4.scale(lum);
		return mesh;
	}

	public static StartCoroutine(coroutine: Iterator<void>): void {
        let observer = Main.Scene.onBeforeRenderObservable.add(
            () => {
                if (coroutine.next().done) {
                    Main.Scene.onBeforeRenderObservable.remove(observer);
                }
            }
        );
	}
	
	public static async RunCoroutine(coroutine: Iterator<void>): Promise<void> {
		return new Promise<void>(
			(resolve) => {
				let observer = Main.Scene.onBeforeRenderObservable.add(
					() => {
						if (coroutine.next().done) {
							Main.Scene.onBeforeRenderObservable.remove(observer);
							resolve();
						}
					}
				);
			}
		)
	}
}


window.addEventListener("DOMContentLoaded", () => {
	let game: Main = new Main("render-canvas");
	game.createScene();
	game.animate();
});


