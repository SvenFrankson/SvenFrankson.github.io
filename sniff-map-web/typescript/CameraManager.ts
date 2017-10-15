enum CameraState {
    global,
    transition,
    local
}

class CameraManager {

    public state: CameraState = CameraState.global;
    private _preventForcedMove: boolean = false;
    public get preventForcedMove(): boolean {
        return this._preventForcedMove;
    }
    public set preventForcedMove(b: boolean) {
        this._preventForcedMove = b;
        if (this.preventForcedMove) {
            Main.instance.scene.unregisterBeforeRender(this.transitionStep);
            if (this.onTransitionDone) {
                this.onTransitionDone();
            }
        }
    }

    public goToLocal(target: BABYLON.Vector3) {
        this.state = CameraState.transition;
        this.fromPosition.copyFrom(Main.instance.camera.position);
        this.toPosition.copyFrom(target);
        let direction: BABYLON.Vector3 = target.subtract(Main.instance.camera.position);
        direction.normalize();
        direction.scaleInPlace(10);
        direction.y = Math.min(10, Main.instance.camera.position.y);
        this.toPosition.addInPlace(direction);
        this.fromTarget.copyFrom(Main.instance.camera.target);
        this.toTarget.copyFrom(target);
        this.onTransitionDone = () => {
            this.state = CameraState.local;
            Main.instance.camera.useAutoRotationBehavior = true;
            Main.instance.camera.autoRotationBehavior.idleRotationWaitTime = 500;
            Main.instance.camera.autoRotationBehavior.idleRotationSpinupTime = 2000;
        }

        this.k = 0;
        Main.instance.scene.registerBeforeRender(this.transitionStep);
    }

    public goToGlobal() {
        if (this.state !== CameraState.local) {
            return;
        }
        this.state = CameraState.transition;
        this.fromPosition.copyFrom(Main.instance.camera.position);
        this.toPosition.copyFrom(new BABYLON.Vector3(
            -500, 500, -500
        ));
        this.fromTarget.copyFrom(Main.instance.camera.target);
        this.toTarget.copyFromFloats(0, 0, 0);
        this.onTransitionDone = () => {
            this.state = CameraState.global;
            Main.instance.camera.useAutoRotationBehavior = false;
        }

        this.k = 0;
        Main.instance.scene.registerBeforeRender(this.transitionStep);
    }

    public k: number = 0;
    public duration: number = 180;
    public fromPosition: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public toPosition: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public fromTarget: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public toTarget: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public tmpPosition: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public tmpTarget: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public onTransitionDone: () => void;

    public transitionStep = () => {
        this.k++;
        this.tmpPosition.x = this.fromPosition.x * (1 - this.k / this.duration) + this.toPosition.x * this.k / this.duration;
        this.tmpPosition.y = this.fromPosition.y * (1 - this.k / this.duration) + this.toPosition.y * this.k / this.duration;
        this.tmpPosition.z = this.fromPosition.z * (1 - this.k / this.duration) + this.toPosition.z * this.k / this.duration;

        this.tmpTarget.x = this.fromTarget.x * (1 - this.k / this.duration) + this.toTarget.x * this.k / this.duration;
        this.tmpTarget.y = this.fromTarget.y * (1 - this.k / this.duration) + this.toTarget.y * this.k / this.duration;
        this.tmpTarget.z = this.fromTarget.z * (1 - this.k / this.duration) + this.toTarget.z * this.k / this.duration;
    
        Main.instance.camera.setPosition(this.tmpPosition);
        Main.instance.camera.setTarget(this.tmpTarget);

        if (this.k >= this.duration) {
            Main.instance.scene.unregisterBeforeRender(this.transitionStep);
            if (this.onTransitionDone) {
                this.onTransitionDone();
            }
        }
    }
}