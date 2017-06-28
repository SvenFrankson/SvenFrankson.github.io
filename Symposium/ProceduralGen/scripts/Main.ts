/// <reference path="../lib/babylon.d.ts"/>
/// <reference path="../lib/jquery.d.ts"/>

class Main {

  public static Canvas: HTMLCanvasElement;
  public static Engine: BABYLON.Engine;
  public static Scene: BABYLON.Scene;
  public static Camera: BABYLON.ArcRotateCamera;
  public static Light: BABYLON.HemisphericLight;
  public static ShadowLight: BABYLON.DirectionalLight;

  public static Sliding: boolean = false;
  public static LockedMouse: boolean = false;
  public static ClientXOnLock: number = -1;
  public static ClientYOnLock: number = -1;

  constructor(canvasElement: string) {
    Main.Canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
    Main.Engine = new BABYLON.Engine(Main.Canvas, true);
  }

  public CreateScene(): void {
    Main.Scene = new BABYLON.Scene(Main.Engine);

    Main.Camera = new BABYLON.ArcRotateCamera("ArcCamera", 0, 0, 1, BABYLON.Vector3.Zero(), Main.Scene);
    Main.Camera.setPosition(new BABYLON.Vector3(256, 256, 256));
    Main.Camera.attachControl(Main.Canvas);
    Main.Camera.wheelPrecision = 5;

    Main.Light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), Main.Scene);
    Main.Light.diffuse = new BABYLON.Color3(1, 1, 1);
    Main.Light.groundColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    Main.Light.specular = new BABYLON.Color3(1, 1, 1);

    /*
    Main.ShadowLight = new BABYLON.DirectionalLight("ShadowLight", new BABYLON.Vector3(0.2, -1, 0.2), Main.Scene);
    Main.ShadowLight.position = new BABYLON.Vector3(5, 10, 5);
    */
  }

  public Animate(): void {
    Main.Engine.runRenderLoop(() => {
      Main.Scene.render();
    });

    window.addEventListener("resize", () => {
      Main.Engine.resize();
    });
  }

  public LoadTerrainFromBabylonFile(): void {
    let t0: Date = new Date();
    BABYLON.SceneLoader.ImportMesh(
      "",
      "./datas/terrain256.babylon",
      "",
      Main.Scene,
      (
        meshes: Array<BABYLON.AbstractMesh>,
        particles: Array<BABYLON.ParticleSystem>,
        skeletons: Array<BABYLON.Skeleton>
      ) => {
        console.log("Terrain Successfuly loaded.");
        let t1: Date = new Date();
        $("#loading-time").text((t1.getTime() - t0.getTime()).toString());
      }
    );
  }

  public LoadTerrainFromPNGHeightMap(): void {
    let t0: Date = new Date();
    let img: HTMLImageElement = $("#height-map").get(0);
    img.onload = () => {
      let c: HTMLCanvasElement = document.getElementById("debug-output") as HTMLCanvasElement;
      let ctx: CanvasRenderingContext2D = c.getContext("2d");
      ctx.drawImage(img, 0, 0, 257, 257);

      let mesh: BABYLON.Mesh = new BABYLON.Mesh("Terrain00", Main.Scene);
      let vertexData: BABYLON.VertexData = new BABYLON.VertexData();
      let positions: Array<number> = [];
      let indices: Array<number> = [];
      let pixels: Uint8ClampedArray = ctx.getImageData(0, 0, 129, 129).data;
      for (let i: number = 0; i < 129; i++) {
        for (let j: number = 0; j < 129; j++) {
          let pixel: number = pixels[(i + j * 129) * 4];
          positions.push(i - 128);
          positions.push(pixel / 256 * 100);
          positions.push(j - 128);
          if (i > 0 && j > 0) {
            indices.push(i + j * 129);
            indices.push(i + (j - 1) * 129);
            indices.push((i - 1) + j * 129);
            indices.push((i - 1) + (j - 1) * 129);
            indices.push((i - 1) + j * 129);
            indices.push(i + (j - 1) * 129);
          }
        }
      }
      vertexData.positions = positions;
      vertexData.indices = indices;
      vertexData.normals = [];
      BABYLON.VertexData.ComputeNormals(positions, indices, vertexData.normals);
      vertexData.applyToMesh(mesh);
      let t1: Date = new Date();

      mesh = new BABYLON.Mesh("Terrain10", Main.Scene);
      vertexData = new BABYLON.VertexData();
      positions = [];
      indices = [];
      pixels = ctx.getImageData(128, 0, 129, 129).data;
      for (let i: number = 0; i < 129; i++) {
        for (let j: number = 0; j < 129; j++) {
          let pixel: number = pixels[(i + j * 129) * 4];
          positions.push(i);
          positions.push(pixel / 256 * 100);
          positions.push(j - 128);
          if (i > 0 && j > 0) {
            indices.push(i + j * 129);
            indices.push(i + (j - 1) * 129);
            indices.push((i - 1) + j * 129);
            indices.push((i - 1) + (j - 1) * 129);
            indices.push((i - 1) + j * 129);
            indices.push(i + (j - 1) * 129);
          }
        }
      }
      vertexData.positions = positions;
      vertexData.indices = indices;
      vertexData.normals = [];
      BABYLON.VertexData.ComputeNormals(positions, indices, vertexData.normals);
      vertexData.applyToMesh(mesh);

      mesh = new BABYLON.Mesh("Terrain11", Main.Scene);
      vertexData = new BABYLON.VertexData();
      positions = [];
      indices = [];
      pixels = ctx.getImageData(128, 128, 129, 129).data;
      for (let i: number = 0; i < 129; i++) {
        for (let j: number = 0; j < 129; j++) {
          let pixel: number = pixels[(i + j * 129) * 4];
          positions.push(i);
          positions.push(pixel / 256 * 100);
          positions.push(j);
          if (i > 0 && j > 0) {
            indices.push(i + j * 129);
            indices.push(i + (j - 1) * 129);
            indices.push((i - 1) + j * 129);
            indices.push((i - 1) + (j - 1) * 129);
            indices.push((i - 1) + j * 129);
            indices.push(i + (j - 1) * 129);
          }
        }
      }
      vertexData.positions = positions;
      vertexData.indices = indices;
      vertexData.normals = [];
      BABYLON.VertexData.ComputeNormals(positions, indices, vertexData.normals);
      vertexData.applyToMesh(mesh);

      mesh = new BABYLON.Mesh("Terrain01", Main.Scene);
      vertexData = new BABYLON.VertexData();
      positions = [];
      indices = [];
      pixels = ctx.getImageData(0, 128, 129, 129).data;
      for (let i: number = 0; i < 129; i++) {
        for (let j: number = 0; j < 129; j++) {
          let pixel: number = pixels[(i + j * 129) * 4];
          positions.push(i - 128);
          positions.push(pixel / 256 * 100);
          positions.push(j);
          if (i > 0 && j > 0) {
            indices.push(i + j * 129);
            indices.push(i + (j - 1) * 129);
            indices.push((i - 1) + j * 129);
            indices.push((i - 1) + (j - 1) * 129);
            indices.push((i - 1) + j * 129);
            indices.push(i + (j - 1) * 129);
          }
        }
      }
      vertexData.positions = positions;
      vertexData.indices = indices;
      vertexData.normals = [];
      BABYLON.VertexData.ComputeNormals(positions, indices, vertexData.normals);
      vertexData.applyToMesh(mesh);
      t1 = new Date();
      $("#loading-time").text((t1.getTime() - t0.getTime()).toString());
    };
  }

  public DebugGetMeshHeightMap(mesh: BABYLON.AbstractMesh): void {
    let c: HTMLCanvasElement = document.getElementById("debug-output") as HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D = c.getContext("2d");
    if (mesh instanceof BABYLON.Mesh) {
      let vertices: Array<number> | Float32Array = BABYLON.VertexData.ExtractFromMesh(mesh).positions;
      for (let i: number = 0; i < vertices.length / 3; i++) {
        let x: number = Math.floor(vertices[3 * i] + 128);
        let y: number = vertices[3 * i + 1];
        let z: number = Math.floor(vertices[3 * i + 2] + 128);
        let c: BABYLON.Color3 = new BABYLON.Color3(y / 100, y / 100, y / 100);
        ctx.fillStyle = c.toHexString();
        ctx.fillRect(x, z, 1, 1);
      }
    } else {
      console.warn("Argument is not a mesh. Aborting");
    }
  }

  private k: number = 0;
  public LoadDemoScene(): void {
    let t0: Date = new Date();
    BABYLON.SceneLoader.ImportMesh(
      "",
      "./datas/demoScene.babylon",
      "",
      Main.Scene,
      (
        meshes: Array<BABYLON.AbstractMesh>,
        particles: Array<BABYLON.ParticleSystem>,
        skeletons: Array<BABYLON.Skeleton>
      ) => {
        console.log("Demo Scene Successfuly loaded.");
        let t1: Date = new Date();
        $("#loading-time").text((t1.getTime() - t0.getTime()).toString());
        Main.Camera.setPosition(new BABYLON.Vector3(5, 5, 5));
        let shadowMaker: BABYLON.ShadowGenerator = new BABYLON.ShadowGenerator(1024, Main.ShadowLight);
        shadowMaker.usePoissonSampling = true;
        for (let i: number = 0; i < meshes.length; i++) {
          meshes[i].renderOutline = true;
          meshes[i].outlineColor = BABYLON.Color3.Black();
          meshes[i].outlineWidth = 0.01;
          if (meshes[i].name.indexOf("Ball") !== -1) {
            shadowMaker.getShadowMap().renderList.push(meshes[i]);
            Main.Scene.registerBeforeRender(() => {
              meshes[i].rotation.y += 0.01;
            });
          }
          if (meshes[i].name.indexOf("LargeCube") !== -1) {
            shadowMaker.getShadowMap().renderList.push(meshes[i]);
            Main.Scene.registerBeforeRender(() => {
              meshes[i].rotation.y -= 0.01;
              meshes[i].position.y = Math.cos(this.k / 50) + 1;
              this.k++;
            });
          }
          if (meshes[i].name.indexOf("Base") !== -1) {
            meshes[i].receiveShadows = true;
          }
        }
      }
    );
  }
}

window.addEventListener("DOMContentLoaded", () => {
  let game : Main = new Main("render-canvas");
  game.CreateScene();
  game.Animate();
  if ($("#babylon-file").get(0)) {
    console.log("Load Terrain from Babylon file");
    game.LoadTerrainFromBabylonFile();
  }
  if ($("#png-height-map").get(0)) {
    console.log("Load Terrain from PNG HeightMap");
    game.LoadTerrainFromPNGHeightMap();
  }
  if ($("#demo-scene").get(0)) {
    console.log("Load Terrain from PNG HeightMap");
    game.LoadDemoScene();
  }
});
