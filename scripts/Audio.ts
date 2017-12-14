class MyAudioTest {

    public static all(): ISoundInfo[] {
        let result = [];
        MyAudioTest.drum.forEach(
            (i) => {
                result.push(i);
            }
        )
        MyAudioTest.tom.forEach(
            (i) => {
                result.push(i);
            }
        )
        MyAudioTest.kora.forEach(
            (i) => {
                result.push(i);
            }
        )
        MyAudioTest.shake.forEach(
            (i) => {
                result.push(i);
            }
        )
        MyAudioTest.banjo.forEach(
            (i) => {
                result.push(i);
            }
        )
        MyAudioTest.perc.forEach(
            (i) => {
                result.push(i);
            }
        )
        return result;
    }

    public static drum = [
        {
            name: "crash",
            url: "./data/sound/CYCdh_Crash-03.mp3"
        },
        {
            name: "kick",
            url: "./data/sound/CYCdh_ElecK01-Kick02.mp3"
        },
        {
            name: "snare",
            url: "./data/sound/CYCdh_K4-Snr05.mp3"
        }
    ];
    
    public static perc = [
        {
            name: "perc1",
            url: "./data/sound/CYCdh_Kurz08-Perc02.wav"
        },
        {
            name: "perc2",
            url: "./data/sound/CYCdh_Kurz08-Perc03.wav"
        }
    ];

    public static randomPerc(): string {
        return "perc" + Math.floor(Math.random() * 2);
    }

    public static shake = [
        {
            name: "shake1",
            url: "./data/sound/CYCdh_VinylK1-Shkr01.wav"
        },
        {
            name: "shake2",
            url: "./data/sound/CYCdh_VinylK1-Shkr02.wav"
        },
        {
            name: "shake3",
            url: "./data/sound/CYCdh_VinylK1-Shkr03.wav"
        }
    ];

    public static randomShake(): string {
        return "shake" + Math.floor(Math.random() * 3 + 1);
    }

    public static tom = [
        {
            name: "tom1",
            url: "./data/sound/CYCdh_ElecK03-Tom01.wav"
        },
        {
            name: "tom2",
            url: "./data/sound/CYCdh_ElecK03-Tom02.wav"
        },
        {
            name: "tom3",
            url: "./data/sound/CYCdh_ElecK03-Tom03.wav"
        },
        {
            name: "tom4",
            url: "./data/sound/CYCdh_ElecK03-Tom04.wav"
        },
        {
            name: "tom5",
            url: "./data/sound/CYCdh_ElecK03-Tom05.wav"
        }
    ];

    public static randomTom(): string {
        return "tom" + Math.floor(Math.random() * 5 + 1);
    }
    
    public static banjo = [
        {
            name: "banjo1",
            url: "./data/sound/banjo_A3_very-long_piano_normal.mp3"
        },
        {
            name: "banjo2",
            url: "./data/sound/banjo_A4_very-long_piano_normal.mp3"
        },
        {
            name: "banjo3",
            url: "./data/sound/banjo_A5_very-long_piano_normal.mp3"
        },
        {
            name: "banjo4",
            url: "./data/sound/banjo_B3_very-long_piano_normal.mp3"
        },
        {
            name: "banjo5",
            url: "./data/sound/banjo_B4_very-long_piano_normal.mp3"
        },
        {
            name: "banjo6",
            url: "./data/sound/banjo_B5_very-long_piano_normal.mp3"
        }
    ];

    public static randomBanjo(): string {
        return "banjo" + Math.floor(Math.random() * 6 + 1);
    }

    public static kora = [
        {
            name: "kora1",
            url: "./data/sound/kora1.wav"
        },
        {
            name: "kora2",
            url: "./data/sound/kora2.wav"
        },
        {
            name: "kora3",
            url: "./data/sound/kora3.wav"
        }
    ];

    public static randomKora(): string {
        return "kora" + Math.floor(Math.random() * 3 + 1);
    }

    public static Test1(): void {
        let context = new AudioContext();
        let recorderDestination = context.createMediaStreamDestination();
        let recorder = new MediaRecorder(recorderDestination.stream);
        let chunks = [];
        recorder.ondataavailable = function(evt) {
            // push each chunk (blobs) in an array
            console.log(".");
            chunks.push(evt.data);
          };
     
          recorder.onstop = function(evt) {
            // Make blob out of our blobs, and open it.
            console.log(chunks.length);
            console.log(chunks);
            var blob = new Blob(chunks,  { 'type' : 'audio/ogg; codecs=opus' });
            document.querySelector("audio").src = URL.createObjectURL(blob);
          };
        Sounds.loadSounds(
            MyAudioTest.all(),
            context,
            () => {
                console.log("All loaded !");
                let lTom = 4;
                let toms = [];
                for (let i = 0; i < 10; i++) {
                    toms.push(MyAudioTest.Random(lTom, context, recorderDestination));
                }

                let blocksTom = [new Block(...toms)];

                for (let i = 1; i < 8; i++) {
                    blocksTom[i] = blocksTom[i - 1].clone();
                    blocksTom[i].time = lTom * i;
                }

                recorder.start();
                blocksTom.forEach(
                    (b) => {
                        b.play(180);
                    }
                )
                setTimeout(
                    () => {
                        recorder.stop();
                    },
                    10000
                )
            }
        )
    }
    
    public static RandomShake(length: number, context: AudioContext, destination: MediaStreamAudioDestinationNode): Brick {
        let r = Math.random();
        let b: Brick = new Brick(MyAudioTest.randomShake(), context, destination);
        b.time = Math.floor(Math.random() * 2 * length) / 2;
        return b;
    }

    public static RandomKoraBrick(length: number, context: AudioContext, destination: MediaStreamAudioDestinationNode): Brick {
        let r = Math.random();
        let b: Brick = new Brick(MyAudioTest.randomKora(), context, destination);
        b.time = Math.floor(Math.random() * 2 * length) / 2;
        return b;
    }
    
    public static RandomTomBrick(length: number, context: AudioContext, destination: AudioDestinationNode): Brick {
        let r = Math.random();
        let b: Brick = new Brick(MyAudioTest.randomTom(), context, destination);
        b.time = Math.floor(Math.random() * 2 * length) / 2;
        return b;
    }
    
    public static RandomBanjo(length: number, context: AudioContext, destination: AudioDestinationNode): Brick {
        let r = Math.random();
        let b: Brick = new Brick(MyAudioTest.randomBanjo(), context, destination);
        b.time = Math.floor(Math.random() * 2 * length) / 2;
        return b;
    }

    public static Random(length: number, context: AudioContext, destination: AudioDestinationNode): Brick {
        let r = Math.random();
        let i = Math.floor(Math.random() * 2 + 1);
        let b: Brick;
        if (r > 2 / 3) {
            b = new Brick("perc" + i, context, destination);
        } else if (r > 1 / 3) {
            b = new Brick("shake" + i, context, destination);
        } else {
            b = new Brick("tom" + i, context, destination);
        }
        b.time = Math.floor(Math.random() * 2 * length) / 2;
        return b;
    }
}