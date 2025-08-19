var USE_POKI_SDK = false;
var USE_CG_SDK = false;
var OFFLINE_MODE = false;
var NO_VERTEX_DATA_LOADER = false;
var ADVENT_CAL = false;

if (USE_POKI_SDK) {
    USE_CG_SDK = false;
}

var THE_ORIGIN_OF_TIME_ms = 0;
var GLOBAL_GAME_LOAD_CURRENT_STEP = 0;
var last_step_t = 0;
var displayed_progress = 0;
var real_progress = 0;
var next_progress = 0;
var observed_progress_speed = 0.2;

let fonts = [
  {
    "font-family": "BigBottomCartoonRegular",
    "font-style": "normal",
    "font-weight": "normal",
    "src": "./styles/BigBottomCartoon.ttf"
  }
];

async function loadFonts(fontsToLoad) {
  if (fontsToLoad.length) {
    for (let i = 0; i < fontsToLoad.length; i++) {
      let fontProps = fontsToLoad[i];
      let fontFamily = fontProps["font-family"];
      let fontWeight = fontProps["font-weight"];
      let fontStyle = fontProps["font-style"];
      let fontUrl = Array.isArray(fontProps["src"])
        ? fontProps["src"][0][0]
        : fontProps["src"];
      if (fontUrl.indexOf("url(") === -1) {
        fontUrl = "url(" + fontUrl + ")";
      }
      let fontFormat = fontProps["src"][0][1] ? fontProps["src"][1] : "";
      const font = new FontFace(fontFamily, fontUrl);
      font.weight = fontWeight;
      font.style = fontStyle;
      await font.load();
      document.fonts.add(font);
      console.log(fontFamily, "loaded");

      // apply font styles to body
      let fontDOMEl = document.createElement("div");
      fontDOMEl.textContent = "";
      document.body.appendChild(fontDOMEl);
      fontDOMEl.setAttribute(
        "style",
        `position:fixed; height:0; width:0; overflow:hidden; font-family:${fontFamily}; font-weight:${fontWeight}; font-style:${fontStyle}`
      );
    }
  }
}

async function loadCSS(src) {
    let t0 = performance.now();
    return new Promise((resolve) => {
        let script = document.createElement('link');
        script.rel = "stylesheet";
        script.type = "text/css";
        script.href = src;
        document.body.append(script);
        script.onload = () => {
            let t = performance.now();
            let t_load_this_script = (t - t0);
            let t_since_start = (t - THE_ORIGIN_OF_TIME_ms);
            console.log(src + " loaded at " + t_since_start.toFixed(3) + " ms. (in " + t_load_this_script.toFixed(3) + " ms)");
            resolve();
        };
    });
}

async function loadScript(src) {
    let t0 = performance.now();
    return new Promise((resolve) => {
        let script = document.createElement('script');
        script.src = src;
        document.body.append(script);
        script.onload = () => {
            let t = performance.now();
            let t_load_this_script = (t - t0);
            let t_since_start = (t - THE_ORIGIN_OF_TIME_ms);
            console.log(src + " loaded at " + t_since_start.toFixed(3) + " ms. (in " + t_load_this_script.toFixed(3) + " ms)");
            resolve();
        };
    });
}

async function gameLoaded() {
    let t0 = performance.now();
    return new Promise((resolve) => {
        let wait = () => {
            if (Game) {
                if (Game.Instance) {
                    if (Game.Instance.gameLoaded) {
                        let t = performance.now();
                        let t_wait_this_step = (t - t0);
                        let t_since_start = (t - THE_ORIGIN_OF_TIME_ms);
                        console.log("game loaded at " + t_since_start.toFixed(3) + " ms. (in " + t_wait_this_step.toFixed(3) + " ms)");
                        resolve();
                        return;
                    }
                }
            }
            requestAnimationFrame(wait);
        }
        wait();
    });
}

async function mainMachineInstantiated() {
    let t0 = performance.now();
    return new Promise((resolve) => {
        let wait = () => {
            if (Game) {
                if (Game.Instance) {
                    if (Game.Instance.machine) {
                        if (Game.Instance.machine.ready && Game.Instance.machine.instantiated) {
                            let t = performance.now();
                            let t_wait_this_step = (t - t0);
                            let t_since_start = (t - THE_ORIGIN_OF_TIME_ms);
                            console.log("machine instantiated at " + t_since_start.toFixed(3) + " ms. (in " + t_wait_this_step.toFixed(3) + " ms)");
                            resolve();
                            return;
                        }
                    }
                }
            }
            requestAnimationFrame(wait);
        }
        wait();
    });
}

var steps = []

function setProgressIndex(i, label) {
    let t = performance.now();
    let t_since_start = (t - THE_ORIGIN_OF_TIME_ms);
    console.log("step " + i + " (" + label + ") reached at " + t_since_start.toFixed(3) + " ms.");
    real_progress = steps[i];
    next_progress = steps[i + 1];
    observed_progress_speed_percent_second = real_progress / (t_since_start / 1000);
}

function loadStep() {
    if (real_progress < 1) {
        displayed_progress = displayed_progress * 0.985 + real_progress * 0.015;

        let ok = Math.sqrt(displayed_progress);
        if (ok > 0.1) {
            //document.querySelector("#cas-message-1").style.opacity = "1";
        }
        if (ok > 0.3) {
            //document.querySelector("#cas-message-2").style.opacity = "1";
        }
        if (ok > 0.6) {
            //document.querySelector("#cas-message-3").style.opacity = "1";
        }
        let c = Math.floor((1 - ok) * (1 - ok) * 256).toString(16).padStart(2, "0").substring(0, 2);
        //document.querySelector("#loading-bar-text").style.color = "#" + c + c + c;
        //document.querySelector("#loading-bar-text").innerHTML = "Loading...";
        //document.querySelector("#loading-bar-progress").style.width = (ok * 70).toFixed(2) + "%";
        //document.querySelector("#loading-text").innerHTML = "Loading... " + (ok * 100).toFixed(0) + "%";
        //document.querySelector("#click-anywhere-screen img").style.opacity = ok;

        //document.querySelector("#click-anywhere-screen .white-track").style.opacity = displayed_progress;
        //document.querySelector("#click-anywhere-screen .message-bottom").innerHTML = "loading... " + (displayed_progress * 100).toFixed(0) + "%";
        requestAnimationFrame(loadStep);
    }
    else {
        //document.querySelector("#cas-message-1").style.opacity = "1";
        //document.querySelector("#cas-message-2").style.opacity = "1";
        //document.querySelector("#cas-message-3").style.opacity = "1";
        //document.querySelector("#loading-bar-progress").style.width = "70%";
        //document.querySelector("#loading-text").innerHTML = "Press to Enter";
        //document.querySelector("#loading-bar-text").style.color = "#000000";
        //document.querySelector("#loading-bar-text").innerHTML = "Done !";
        //document.querySelector("#click-anywhere-screen img").style.opacity = "1";
        //document.querySelector("#click-anywhere-screen .white-track").style.opacity = "1";
        //document.querySelector("#click-anywhere-screen .message-bottom").innerHTML = "Click or press anywhere to Enter";
    }
}

async function doLoad() {
    let stepsCount = 8;
    if (USE_POKI_SDK) {
        stepsCount++;
    }
    if (USE_CG_SDK) {
        stepsCount++;
    }
    if (!NO_VERTEX_DATA_LOADER) {
        stepsCount++;
    }
    steps = [];
    for (let i = 0; i <= stepsCount; i++) {
        steps[i] = i / stepsCount;
    }
    setProgressIndex(0);
    loadStep();


    await loadFonts(fonts);

    await loadCSS("./styles/app.css");
    setProgressIndex(GLOBAL_GAME_LOAD_CURRENT_STEP++);

    if (USE_POKI_SDK) {
        await loadScript("https://game-cdn.poki.com/scripts/v2/poki-sdk.js");
        setProgressIndex(GLOBAL_GAME_LOAD_CURRENT_STEP++);
    }
    if (USE_CG_SDK) {
        await loadScript("https://sdk.crazygames.com/crazygames-sdk-v3.js");
        setProgressIndex(GLOBAL_GAME_LOAD_CURRENT_STEP++);
    }

    await loadScript("./lib/babylon.js");
    setProgressIndex(GLOBAL_GAME_LOAD_CURRENT_STEP++);

    if (!NO_VERTEX_DATA_LOADER) {
        await loadScript("./lib/babylonjs.loaders.js");
        setProgressIndex(GLOBAL_GAME_LOAD_CURRENT_STEP++);
    }

    await loadScript("./lib/nabu/nabu.js");
    setProgressIndex(GLOBAL_GAME_LOAD_CURRENT_STEP++, "nabu.js loaded");

    await loadScript("./lib/mummu/mummu.js");
    setProgressIndex(GLOBAL_GAME_LOAD_CURRENT_STEP++, "mummu.js loaded");

    await loadScript("./game.js");
    setProgressIndex(GLOBAL_GAME_LOAD_CURRENT_STEP++, "game.js loaded");

    await gameLoaded();
    setProgressIndex(GLOBAL_GAME_LOAD_CURRENT_STEP, "all done");

    console.log("Load complete. GLOBAL_GAME_LOAD_CURRENT_STEP is " + GLOBAL_GAME_LOAD_CURRENT_STEP.toFixed(0));
}

window.addEventListener("DOMContentLoaded", async () => {
    THE_ORIGIN_OF_TIME_ms = performance.now();
    last_step_t = THE_ORIGIN_OF_TIME_ms;
    doLoad();
});
