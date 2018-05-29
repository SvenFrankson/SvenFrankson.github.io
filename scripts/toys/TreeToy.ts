/// <reference path="./BaseToy.ts" />

class TreeNode {
	public depth: number = 0;
	public parent: TreeNode;
	public position: BABYLON.Vector3;
	public children: TreeNode[] = [];

	public getDirection(): BABYLON.Vector3 {
		if (this.parent) {
			return this.position.subtract(this.parent.position).normalize();
		}
		return new BABYLON.Vector3(0, 1, 0);
    }
    
    public dispose(): void {
        if (this._nodeMesh) {
            this._nodeMesh.dispose();
        }
        while (this._edgeMeshes.length > 0) {
            this._edgeMeshes.pop().dispose();
        }
		this.children.forEach(
			(c) => {
                c.dispose();
            }
        );        
    }

	public randomize(direction: BABYLON.Vector3): BABYLON.Vector3 {
		let randomized = direction.clone();
		randomized.x += (Math.random() - 0.5) * 1.5;
		randomized.y += (Math.random() - 0.5) * 1.5;
		randomized.z += (Math.random() - 0.5) * 1.5;
		return randomized;
	}

	public grow(distance: number, min: BABYLON.Vector3, max: BABYLON.Vector3): TreeNode[] {
		let c1 = new TreeNode();
		c1.position = this.randomize(this.getDirection());
		c1.position.scaleInPlace(distance);
        c1.position.addInPlace(this.position);
        if (c1.position.x < min.x) {
            c1.position.x += 3 * Math.abs(min.x - c1.position.x);
        }
        if (c1.position.y < min.y) {
            c1.position.y += 3 * Math.abs(min.y - c1.position.y);
        }
        if (c1.position.z < min.z) {
            c1.position.z += 3 * Math.abs(min.z - c1.position.z);
        }
        if (c1.position.x > max.x) {
            c1.position.x -= 3 * Math.abs(max.x - c1.position.x);
        }
        if (c1.position.y > max.y) {
            c1.position.y -= 3 * Math.abs(max.y - c1.position.y);
        }
        if (c1.position.z > max.z) {
            c1.position.z -= 3 * Math.abs(max.z - c1.position.z);
        }
		c1.depth = this.depth + BABYLON.Vector3.Distance(this.position, c1.position);
		c1.parent = this;
		this.children.push(c1);
		if (Math.random() > 0.7) {
			let c2 = new TreeNode();
			c2.position = this.randomize(this.getDirection());
			c2.position.scaleInPlace(distance);
			c2.position.addInPlace(this.position);
            if (c2.position.x < min.x) {
                c2.position.x += 3 * Math.abs(min.x - c2.position.x);
            }
            if (c2.position.y < min.y) {
                c2.position.y += 3 * Math.abs(min.y - c2.position.y);
            }
            if (c2.position.z < min.z) {
                c2.position.z += 3 * Math.abs(min.z - c2.position.z);
            }
            if (c2.position.x > max.x) {
                c2.position.x -= 3 * Math.abs(max.x - c2.position.x);
            }
            if (c2.position.y > max.y) {
                c2.position.y -= 3 * Math.abs(max.y - c2.position.y);
            }
            if (c2.position.z > max.z) {
                c2.position.z -= 3 * Math.abs(max.z - c2.position.z);
            }
			c2.depth = this.depth + BABYLON.Vector3.Distance(this.position, c2.position);
			c2.parent = this;
			this.children.push(c2);
		}
		return this.children;
    }
    
    private * popInNodeMesh(): IterableIterator<void> {
        for (let i = 0; i < 120; i++) {
            let s = BaseToy.easeOutElastic(i / 120);
            this._nodeMesh.scaling.copyFromFloats(s, s, s);
            yield;
        }
        this._nodeMesh.scaling.copyFromFloats(1, 1, 1);
    }
    
    public * popOutNodeMesh(duration: number = 60): IterableIterator<void> {
        if (this._nodeMesh) {
            for (let i = 0; i < duration; i++) {
                let s = 1 - i / duration;
                s = s * s;
                this._nodeMesh.scaling.copyFromFloats(s, s, s);
                yield;
            }
            this._nodeMesh.scaling.copyFromFloats(0, 0, 0);
        }
    }

	private _nodeMesh: BABYLON.Mesh;
	private _edgeMeshes: BABYLON.LinesMesh[] = [];
	public show(depth: number, scene: BABYLON.Scene): void {
		if (!this._nodeMesh) {
            let mat = new BABYLON.StandardMaterial("Test", Main.Scene);
            mat.alpha = 0;

            let lum = 3;
			this._nodeMesh = BaseToy.CreateCircle(0.15, 24, Main.Color4.scale(lum));
            this._nodeMesh.position = this.position;
            this._nodeMesh.rotation.x = Math.PI / 2;
            Main.StartCoroutine(this.popInNodeMesh());
		}
		this.children.forEach(
			(c, i) => {
				if (depth > this.depth && depth < c.depth) {
					if (this._edgeMeshes[i]) {
						this._edgeMeshes[i].dispose();
					}
                    let lum = 2;
					let delta = c.position.subtract(this.position);
					let ratio = (depth - this.depth) / (c.depth - this.depth);
					delta.scaleInPlace(ratio)
					this._edgeMeshes[i] = BABYLON.MeshBuilder.CreateLines(
						"l",
						{
							points: [
								this.position,
								this.position.add(delta)
                            ],
                            colors: [
                                Main.Color4.scale(lum),
                                Main.Color4.scale(lum)
                            ],
                            updatable: false,
                            instance: undefined
						},
						scene
					);
				}
				if (c.depth < depth) {
					c.show(depth, scene);
				}
			}
		)
    }
    
    public setEdgeVisibility(v: number): void {
        for (let i = 0; i < this._edgeMeshes.length; i++) {
            this._edgeMeshes[i].visibility = v;
        }
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].setEdgeVisibility(v);
        }
    }
}

class TreeToy extends BaseToy {

    private tree: TreeNode;
    private nodes: TreeNode[];
    private min: BABYLON.Vector3;
    private max: BABYLON.Vector3;
    private nodesCount: number = 11;
    private distance: number = 2;

    constructor(position: BABYLON.Vector3, min: BABYLON.Vector3, max: BABYLON.Vector3, scene: BABYLON.Scene) {
        super("SolarToy", scene);
        this.min = min;
        this.max = max;
        this.tree = new TreeNode();
        this.tree.position = position;
    }

    public destroy(): void {
        this.dispose();
        this.tree.dispose();
    }

    public async start(): Promise<void> {
        let leaves: TreeNode[] = [this.tree];
        this.nodes = [this.tree];
        for (let i = 0; i < this.nodesCount; i++) {
            let newLeaves: TreeNode[] = [];
            for (let j = 0; j < leaves.length; j++) {
                newLeaves.push(...leaves[j].grow(this.distance, this.min, this.max));
            }
            leaves = newLeaves;
            this.nodes.push(...newLeaves);
        }
    }

    public async end(): Promise<void> {
        await Main.RunCoroutine(this.fadeTree());
        await 
        this.destroy();
    }

    public * update(): IterableIterator<void> {
        for (let i = 0; i < this.nodesCount * this.distance * 1.5; i += 0.01) {
            this.tree.show(i, Main.Scene);
            yield;
        }
    }

    public * fadeTree(): IterableIterator<void> {
        this.tree.setEdgeVisibility(0);
        while (this.nodes.length > 0) {
            let i = Math.floor(Math.random() * this.nodes.length);
            let node = this.nodes.splice(i, 1)[0];
            Main.StartCoroutine(node.popOutNodeMesh(60));
            let d = Math.random() * 10;
            yield;
        }
        for (let i = 0; i < 60; i++) {
            yield;
        }
    }
}