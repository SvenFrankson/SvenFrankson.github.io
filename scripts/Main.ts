class Main {

	public static Canvas: HTMLCanvasElement;
	public static Engine: BABYLON.Engine;
	public static Scene: BABYLON.Scene;
	public static Light: BABYLON.HemisphericLight;
	public static Color: BABYLON.Color3 = BABYLON.Color3.FromHexString("#226372");
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
			let r = Math.random();
			if (r < 1 / 4) {
			//if (r < 0) {
				for (let i = 0; i < 2; i++) {
					let x = width / 2 * (Math.random() - 0.5) * 2;
					let z = depth / 2 * (Math.random() - 0.5) * 2;
					let voxelToy = new VoxelToy(new BABYLON.Vector3(x, - height, z), Main.Scene);
					await voxelToy.start();
					await voxelToy.wait(2.5);
					await voxelToy.end();
				}
			}
			else if (r < 2 / 4) {
			//else if (0) {
				let lifeToy = new LifeToy(new BABYLON.Vector3(0, - height, 0), Math.floor(width * Math.SQRT1_2) - 1, Main.Scene);
				await lifeToy.start();
				for (let i = 0; i < 10; i++) {
					await Main.RunCoroutine(lifeToy.update(120));
				}
				await lifeToy.end();
			}
			else if (r < 3 / 4) {
			//else if (r < 1) {
				let treeToy = new TreeToy(
					new BABYLON.Vector3(0, - height * 0.9, 0),
					new BABYLON.Vector3(- width, - height, - depth / 2).scaleInPlace(0.9),
					new BABYLON.Vector3(width, height, depth / 2).scaleInPlace(0.9),
					Main.Scene);
				await treeToy.start();
				await Main.RunCoroutine(treeToy.update());
				await treeToy.end();
			}
			else {
				let solarToy = new SolarToy(new BABYLON.Vector3(0, - height * 0.3, 0), new BABYLON.Vector3(- Math.PI / 8, 0, Math.PI / 16), width * 0.9, Main.Scene);
				await solarToy.start();
				await solarToy.wait(8);
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


