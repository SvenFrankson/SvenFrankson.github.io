interface ISoundInfo {
    name: string,
    url: string
}

class Sounds {

    private static _sounds: Map<string, AudioBuffer> = new Map<string, AudioBuffer>();

    public static loadSound(info: ISoundInfo, context: AudioContext, callback?: () => void): void {
        var request = new XMLHttpRequest();
        request.open('GET', info.url, true);
        request.responseType = 'arraybuffer';
      
        // Decode asynchronously
        request.onload = function() {
            context.decodeAudioData(
                request.response,
                (buffer : AudioBuffer) => {
                    Sounds._sounds.set(info.name, buffer);
                    if (callback) {
                        callback();
                    }
                }
            );
        }

        request.send();
    }

    public static loadSounds(infos: ISoundInfo[], context: AudioContext, callback?: () => void) {
        let info = infos.pop();
        if (info) {
            return Sounds.loadSound(
                info,
                context,
                () => {
                    Sounds.loadSounds(infos, context, callback);
                }
            );
        } else {
            if (callback) {
                return callback();
            }
        }
    }

    public static get(name: string): AudioBuffer {
        return Sounds._sounds.get(name);
    }
}

class Brick {

    public node: AudioBufferSourceNode;

    constructor(
        public name: string,
        context: AudioContext,
        public recorderDestination: AudioDestinationNode,
        public time: number = 0
    ) {
        this.node = context.createBufferSource();
        this.node.connect(context.destination);
        this.node.connect(recorderDestination);
        this.node.buffer = Sounds.get(this.name);
    }

    public clone(): Brick {
        return new Brick(this.name, this.node.context, this.recorderDestination, this.time);
    }

    public play(deltaTime: number, bpm: number): void {
        this.node.start((this.time + deltaTime) * 60 / bpm, 0.01);
    }
}

class Block {

    public time: number = 0;
    public bricks: Brick[];

    constructor(...bricks: Brick[]) {
        this.bricks = bricks;
    }

    public clone(): Block {
        let clonedBricks: Brick[] = [];
        this.bricks.forEach(
            (b) => {
                clonedBricks.push(b.clone());
            }
        )
        return new Block(...clonedBricks);
    }

    public play(bpm: number): void {
        this.bricks.forEach(
            (b) => {
                b.play(this.time, bpm);
            }
        )
    }
}