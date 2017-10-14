class BuildingMaker {

    public toDoList: BuildingData[];

    constructor() {
        this.toDoList = [];
        Main.instance.scene.registerBeforeRender(this.stepInstantiate);
    }

    public stepInstantiate = () => {
        let t0: number = (new Date()).getTime();
        let t1: number = t0;
        if (this.toDoList.length > 0) {
            console.log(".");
        }
        while (this.toDoList.length > 0 && (t1 - t0) < 10) {
            let data: BuildingData = this.toDoList.pop();
            data.instantiate(Main.instance.scene);
            t1 = (new Date()).getTime();
        }
        if (this.toDoList.length === 0) {
            Failure.update();
        }
    }
}