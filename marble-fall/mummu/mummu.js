/// <reference path="../../nabu/nabu.d.ts"/>
var Mummu;
(function (Mummu) {
    class AnimationFactory {
        static CreateWait(owner, onUpdateCallback) {
            return (duration) => {
                return new Promise(resolve => {
                    let t = 0;
                    let animationCB = () => {
                        t += 1 / 60;
                        let f = t / duration;
                        if (f < 1) {
                            if (onUpdateCallback) {
                                onUpdateCallback();
                            }
                        }
                        else {
                            if (onUpdateCallback) {
                                onUpdateCallback();
                            }
                            owner.getScene().onBeforeRenderObservable.removeCallback(animationCB);
                            resolve();
                        }
                    };
                    owner.getScene().onBeforeRenderObservable.add(animationCB);
                });
            };
        }
        static CreateNumber(owner, obj, property, onUpdateCallback, isAngle, easing) {
            return (target, duration) => {
                return new Promise(resolve => {
                    let origin = obj[property];
                    let t = 0;
                    if (owner[property + "_animation"]) {
                        owner.getScene().onBeforeRenderObservable.removeCallback(owner[property + "_animation"]);
                    }
                    let animationCB = () => {
                        t += 1 / 60;
                        let f = t / duration;
                        if (f < 1) {
                            if (isAngle) {
                                obj[property] = Nabu.LerpAngle(origin, target, f);
                            }
                            else {
                                if (easing) {
                                    f = easing(f);
                                }
                                obj[property] = origin * (1 - f) + target * f;
                            }
                            if (onUpdateCallback) {
                                onUpdateCallback();
                            }
                        }
                        else {
                            obj[property] = target;
                            if (onUpdateCallback) {
                                onUpdateCallback();
                            }
                            owner.getScene().onBeforeRenderObservable.removeCallback(animationCB);
                            owner[property + "_animation"] = undefined;
                            resolve();
                        }
                    };
                    owner.getScene().onBeforeRenderObservable.add(animationCB);
                    owner[property + "_animation"] = animationCB;
                });
            };
        }
        static CreateNumbers(owner, obj, properties, onUpdateCallback, isAngle) {
            return (targets, duration) => {
                return new Promise(resolve => {
                    let n = properties.length;
                    let origins = [];
                    for (let i = 0; i < n; i++) {
                        origins[i] = obj[properties[i]];
                    }
                    let t = 0;
                    if (owner[properties[0] + "_animation"]) {
                        owner.getScene().onBeforeRenderObservable.removeCallback(owner[properties[0] + "_animation"]);
                    }
                    let animationCB = () => {
                        t += 1 / 60;
                        let f = t / duration;
                        if (f < 1) {
                            for (let i = 0; i < n; i++) {
                                if (isAngle && isAngle[i]) {
                                    obj[properties[i]] = Nabu.LerpAngle(origins[i], targets[i], f);
                                }
                                else {
                                    obj[properties[i]] = origins[i] * (1 - f) + targets[i] * f;
                                }
                            }
                            if (onUpdateCallback) {
                                onUpdateCallback();
                            }
                        }
                        else {
                            for (let i = 0; i < n; i++) {
                                obj[properties[i]] = targets[i];
                            }
                            if (onUpdateCallback) {
                                onUpdateCallback();
                            }
                            owner.getScene().onBeforeRenderObservable.removeCallback(animationCB);
                            owner[properties[0] + "_animation"] = undefined;
                            resolve();
                        }
                    };
                    owner.getScene().onBeforeRenderObservable.add(animationCB);
                    owner[properties[0] + "_animation"] = animationCB;
                });
            };
        }
        static CreateVector3(owner, obj, property, onUpdateCallback) {
            return (target, duration) => {
                return new Promise(resolve => {
                    let origin = obj[property].clone();
                    let tmpVector3 = BABYLON.Vector3.Zero();
                    let t = 0;
                    if (owner[property + "_animation"]) {
                        owner.getScene().onBeforeRenderObservable.removeCallback(owner[property + "_animation"]);
                    }
                    let animationCB = () => {
                        t += 1 / 60;
                        let f = t / duration;
                        if (f < 1) {
                            tmpVector3.copyFrom(target).scaleInPlace(f);
                            obj[property].copyFrom(origin).scaleInPlace(1 - f).addInPlace(tmpVector3);
                            if (onUpdateCallback) {
                                onUpdateCallback();
                            }
                        }
                        else {
                            obj[property].copyFrom(target);
                            if (onUpdateCallback) {
                                onUpdateCallback();
                            }
                            owner.getScene().onBeforeRenderObservable.removeCallback(animationCB);
                            owner[property + "_animation"] = undefined;
                            resolve();
                        }
                    };
                    owner.getScene().onBeforeRenderObservable.add(animationCB);
                    owner[property + "_animation"] = animationCB;
                });
            };
        }
    }
    AnimationFactory.EmptyVoidCallback = async (duration) => { };
    AnimationFactory.EmptyNumberCallback = async (target, duration) => { };
    AnimationFactory.EmptyNumbersCallback = async (targets, duration) => { };
    AnimationFactory.EmptyVector3Callback = async (target, duration) => { };
    Mummu.AnimationFactory = AnimationFactory;
})(Mummu || (Mummu = {}));
var Mummu;
(function (Mummu) {
    class Intersection {
        constructor() {
            this.hit = false;
            this.depth = 0;
        }
    }
    function AABBAABBIntersect(x1Min, x1Max, y1Min, y1Max, z1Min, z1Max, x2Min, x2Max, y2Min, y2Max, z2Min, z2Max) {
        if (x1Min > x2Max) {
            return false;
        }
        if (x1Max < x1Min) {
            return false;
        }
        if (y1Min > y2Max) {
            return false;
        }
        if (y1Max < y1Min) {
            return false;
        }
        if (z1Min > z2Max) {
            return false;
        }
        if (z1Max < z1Min) {
            return false;
        }
        return true;
    }
    Mummu.AABBAABBIntersect = AABBAABBIntersect;
    function SphereCapsuleIntersection(cSphere, rSphere, c1Capsule, c2Capsule, rCapsule) {
        let intersection = new Intersection();
        if (AABBAABBIntersect(cSphere.x - rSphere, cSphere.x + rSphere, cSphere.y - rSphere, cSphere.y + rSphere, cSphere.z - rSphere, cSphere.z + rSphere, Math.min(c1Capsule.x, c2Capsule.x) - rCapsule, Math.max(c1Capsule.x, c2Capsule.x) + rCapsule, Math.min(c1Capsule.y, c2Capsule.y) - rCapsule, Math.max(c1Capsule.y, c2Capsule.y) + rCapsule, Math.min(c1Capsule.z, c2Capsule.z) - rCapsule, Math.max(c1Capsule.z, c2Capsule.z) + rCapsule)) {
            let dist = Mummu.DistancePointSegment(cSphere, c1Capsule, c2Capsule);
            let depth = (rSphere + rCapsule) - dist;
            if (depth > 0) {
                intersection.hit = true;
                intersection.depth = depth;
                let proj = BABYLON.Vector3.Zero();
                Mummu.ProjectPointOnSegmentToRef(cSphere, c1Capsule, c2Capsule, proj);
                let dir = cSphere.subtract(proj).normalize();
                intersection.point = dir.scale(rCapsule);
                intersection.point.addInPlace(proj);
                intersection.normal = dir;
            }
        }
        return intersection;
    }
    Mummu.SphereCapsuleIntersection = SphereCapsuleIntersection;
    function SphereWireIntersection(cSphere, rSphere, path, rWire, pathIsEvenlyDistributed) {
        let intersection = new Intersection();
        let proj = BABYLON.Vector3.Zero();
        Mummu.ProjectPointOnPathToRef(cSphere, path, proj, pathIsEvenlyDistributed);
        let dist = BABYLON.Vector3.Distance(cSphere, proj);
        let depth = (rSphere + rWire) - dist;
        if (depth > 0) {
            intersection.hit = true;
            intersection.depth = depth;
            let dir = cSphere.subtract(proj).normalize();
            intersection.point = dir.scale(rWire);
            intersection.point.addInPlace(proj);
            intersection.normal = dir;
        }
        return intersection;
    }
    Mummu.SphereWireIntersection = SphereWireIntersection;
})(Mummu || (Mummu = {}));
var Mummu;
(function (Mummu) {
    async function MakeScreenshot(prop) {
        if (!prop) {
            prop = {};
        }
        if (!prop.miniatureName) {
            prop.miniatureName = "my-screenshot";
        }
        if (!isFinite(prop.size)) {
            prop.size = 256;
        }
        if (!prop.engine) {
            prop.engine = BABYLON.Engine.Instances[0];
        }
        if (!prop.canvas) {
            prop.canvas = prop.engine.getRenderingCanvas();
        }
        if (!prop.camera) {
            prop.camera = prop.engine.scenes[0].activeCamera;
        }
        if (!isFinite(prop.outlineWidth)) {
            prop.outlineWidth = 0;
        }
        let s = prop.size;
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                BABYLON.ScreenshotTools.CreateScreenshot(prop.engine, prop.camera, {
                    width: s * prop.canvas.width / prop.canvas.height,
                    height: s
                }, (data) => {
                    let img = document.createElement("img");
                    img.src = data;
                    img.onload = () => {
                        let sx = (img.width - s) * 0.5;
                        let sy = (img.height - s) * 0.5;
                        let canvas = document.createElement("canvas");
                        canvas.width = s;
                        canvas.height = s;
                        let context = canvas.getContext("2d");
                        context.drawImage(img, sx, sy, s, s, 0, 0, s, s);
                        let data = context.getImageData(0, 0, s, s);
                        if (isFinite(prop.desaturation)) {
                            for (let i = 0; i < data.data.length / 4; i++) {
                                let r = data.data[4 * i];
                                let g = data.data[4 * i + 1];
                                let b = data.data[4 * i + 2];
                                let desat = (r + g + b) / 3;
                                desat = Math.floor(Math.sqrt(desat / 255) * 255);
                                data.data[4 * i] = Math.floor(data.data[4 * i] * (1 - prop.desaturation) + desat * prop.desaturation);
                                data.data[4 * i + 1] = Math.floor(data.data[4 * i + 1] * (1 - prop.desaturation) + desat * prop.desaturation);
                                data.data[4 * i + 2] = Math.floor(data.data[4 * i + 2] * (1 - prop.desaturation) + desat * prop.desaturation);
                            }
                        }
                        if (prop.alphaColor) {
                            let rAlpha = Math.floor(prop.alphaColor.r * 255);
                            let gAlpha = Math.floor(prop.alphaColor.g * 255);
                            let bAlpha = Math.floor(prop.alphaColor.b * 255);
                            for (let i = 0; i < data.data.length / 4; i++) {
                                let r = data.data[4 * i];
                                if (r === rAlpha) {
                                    let g = data.data[4 * i + 1];
                                    if (g === gAlpha) {
                                        let b = data.data[4 * i + 2];
                                        if (b === bAlpha) {
                                            data.data[4 * i] = 255;
                                            data.data[4 * i + 1] = 255;
                                            data.data[4 * i + 2] = 255;
                                            data.data[4 * i + 3] = 0;
                                        }
                                    }
                                }
                            }
                        }
                        if (prop.outlineWidth > 0) {
                            let w = prop.outlineWidth;
                            console.log(w);
                            let outlineData = new Uint8ClampedArray(data.data.length);
                            outlineData.fill(0);
                            for (let i = 0; i < data.data.length / 4; i++) {
                                let X = i % prop.size;
                                let Y = Math.floor(i / prop.size);
                                let a = data.data[4 * i + 3];
                                if (a > 127) {
                                    for (let x = X - w; x <= X + w; x++) {
                                        for (let y = Y - w; y <= Y + w; y++) {
                                            if (x >= 0 && x < prop.size && y >= 0 && y < prop.size) {
                                                let index = x + y * prop.size;
                                                outlineData[4 * index] = 0;
                                                outlineData[4 * index + 1] = 0;
                                                outlineData[4 * index + 2] = 0;
                                                outlineData[4 * index + 3] = 255;
                                            }
                                        }
                                    }
                                }
                            }
                            for (let i = 0; i < data.data.length / 4; i++) {
                                let a = data.data[4 * i + 3];
                                data.data[4 * i] = Math.floor(0 + data.data[4 * i] * a / 255);
                                data.data[4 * i + 1] = Math.floor(0 + data.data[4 * i + 1] * a / 255);
                                data.data[4 * i + 2] = Math.floor(0 + data.data[4 * i + 2] * a / 255);
                                data.data[4 * i + 3] = Math.min(255, Math.floor(outlineData[4 * i + 3] + data.data[4 * i + 3]));
                            }
                        }
                        context.putImageData(data, 0, 0);
                        var tmpLink = document.createElement('a');
                        tmpLink.download = prop.miniatureName + ".png";
                        tmpLink.href = canvas.toDataURL();
                        document.body.appendChild(tmpLink);
                        tmpLink.click();
                        document.body.removeChild(tmpLink);
                        resolve();
                    };
                });
            });
        });
    }
    Mummu.MakeScreenshot = MakeScreenshot;
})(Mummu || (Mummu = {}));
/// <reference path="../lib/babylon.d.ts"/>
var Mummu;
(function (Mummu) {
    var TmpVec3 = [
        BABYLON.Vector3.Zero(),
        BABYLON.Vector3.Zero(),
        BABYLON.Vector3.Zero(),
        BABYLON.Vector3.Zero(),
        BABYLON.Vector3.Zero()
    ];
    var TmpQuat = [
        BABYLON.Quaternion.Identity()
    ];
    function IsFinite(v) {
        return isFinite(v.x) && isFinite(v.y) && isFinite(v.z);
    }
    Mummu.IsFinite = IsFinite;
    function ProjectPerpendicularAtToRef(v, at, out) {
        let k = (v.x * at.x + v.y * at.y + v.z * at.z);
        k = k / (at.x * at.x + at.y * at.y + at.z * at.z);
        out.copyFrom(v);
        out.subtractInPlace(at.multiplyByFloats(k, k, k));
        return out;
    }
    Mummu.ProjectPerpendicularAtToRef = ProjectPerpendicularAtToRef;
    function ProjectPerpendicularAt(v, at) {
        let p = BABYLON.Vector3.Zero();
        ProjectPerpendicularAtToRef(v, at, p);
        return p;
    }
    Mummu.ProjectPerpendicularAt = ProjectPerpendicularAt;
    function Rotate(v, axis, angle) {
        let rotatedV = BABYLON.Vector3.Zero();
        return RotateToRef(v, axis, angle, rotatedV);
    }
    Mummu.Rotate = Rotate;
    function RotateToRef(v, axis, angle, ref) {
        BABYLON.Quaternion.RotationAxisToRef(axis, angle, TmpQuat[0]);
        return v.rotateByQuaternionToRef(TmpQuat[0], ref);
    }
    Mummu.RotateToRef = RotateToRef;
    function RotateInPlace(v, axis, angle) {
        return RotateToRef(v, axis, angle, v);
    }
    Mummu.RotateInPlace = RotateInPlace;
    function Angle(from, to) {
        let pFrom = TmpVec3[0].copyFrom(from).normalize();
        let pTo = TmpVec3[1].copyFrom(to).normalize();
        let angle = Math.acos(BABYLON.Vector3.Dot(pFrom, pTo));
        return angle;
    }
    Mummu.Angle = Angle;
    function AngleFromToAround(from, to, around) {
        let pFrom = TmpVec3[0];
        let pTo = TmpVec3[1];
        ProjectPerpendicularAtToRef(from, around, pFrom).normalize();
        ProjectPerpendicularAtToRef(to, around, pTo).normalize();
        let dot = BABYLON.Vector3.Dot(pFrom, pTo);
        dot = Math.min(Math.max(dot, -1), 1);
        let angle = Math.acos(dot);
        if (angle > Math.PI / 360 / 60) {
            BABYLON.Vector3.CrossToRef(pFrom, pTo, TmpVec3[2]);
            if (BABYLON.Vector3.Dot(TmpVec3[2], around) < 0) {
                angle = -angle;
            }
        }
        return angle;
    }
    Mummu.AngleFromToAround = AngleFromToAround;
    function DistancePointLine(point, lineA, lineB) {
        let PA = TmpVec3[0];
        let dir = TmpVec3[1];
        let cross = TmpVec3[2];
        PA.copyFrom(lineA).subtractInPlace(point);
        dir.copyFrom(lineB).subtractInPlace(lineA).normalize();
        BABYLON.Vector3.CrossToRef(PA, dir, cross);
        return cross.length();
    }
    Mummu.DistancePointLine = DistancePointLine;
    function ProjectPointOnSegmentToRef(point, segA, segB, ref) {
        let AP = TmpVec3[0];
        let dir = TmpVec3[1];
        AP.copyFrom(point).subtractInPlace(segA);
        dir.copyFrom(segB).subtractInPlace(segA);
        let l = dir.length();
        dir.scaleInPlace(1 / l);
        let dist = BABYLON.Vector3.Dot(AP, dir);
        dist = Math.max(Math.min(dist, l), 0);
        ref.copyFrom(dir).scaleInPlace(dist).addInPlace(segA);
        return ref;
    }
    Mummu.ProjectPointOnSegmentToRef = ProjectPointOnSegmentToRef;
    function DistancePointSegment(point, segA, segB) {
        let AP = TmpVec3[0];
        let dir = TmpVec3[1];
        let projP = TmpVec3[2];
        AP.copyFrom(point).subtractInPlace(segA);
        dir.copyFrom(segB).subtractInPlace(segA);
        let l = dir.length();
        dir.scaleInPlace(1 / l);
        let dist = BABYLON.Vector3.Dot(AP, dir);
        dist = Math.max(Math.min(dist, l), 0);
        projP.copyFrom(dir).scaleInPlace(dist).addInPlace(segA);
        let PprojP = projP.subtractInPlace(point);
        return PprojP.length();
    }
    Mummu.DistancePointSegment = DistancePointSegment;
    function ProjectPointOnPathToRef(point, path, ref, pathIsEvenlyDistributed) {
        let proj = TmpVec3[3];
        if (pathIsEvenlyDistributed && path.length >= 4) {
            let bestIndex = -1;
            let bestSqrDist = Infinity;
            for (let i = 0; i < path.length; i++) {
                let sqrDist = BABYLON.Vector3.DistanceSquared(point, path[i]);
                if (sqrDist < bestSqrDist) {
                    bestIndex = i;
                    bestSqrDist = sqrDist;
                }
            }
            let iFirst = Math.max(0, bestIndex - 1);
            let iLast = Math.min(path.length - 1, bestIndex + 1);
            bestSqrDist = Infinity;
            for (let i = iFirst; i < iLast; i++) {
                ProjectPointOnSegmentToRef(point, path[i], path[i + 1], proj);
                let sqrDist = BABYLON.Vector3.DistanceSquared(point, proj);
                if (sqrDist < bestSqrDist) {
                    ref.copyFrom(proj);
                    bestSqrDist = sqrDist;
                }
            }
        }
        else {
            let bestSqrDist = Infinity;
            for (let i = 0; i < path.length - 1; i++) {
                ProjectPointOnSegmentToRef(point, path[i], path[i + 1], proj);
                let sqrDist = BABYLON.Vector3.DistanceSquared(point, proj);
                if (sqrDist < bestSqrDist) {
                    ref.copyFrom(proj);
                    bestSqrDist = sqrDist;
                }
            }
        }
        return ref;
    }
    Mummu.ProjectPointOnPathToRef = ProjectPointOnPathToRef;
    function StepToRef(from, to, step, ref) {
        from = TmpVec3[0].copyFrom(from);
        let sqrStep = step * step;
        if (BABYLON.Vector3.DistanceSquared(from, to) < sqrStep) {
            ref.copyFrom(to);
        }
        else {
            ref.copyFrom(to).subtractInPlace(from).normalize().scaleInPlace(step).addInPlace(from);
        }
        return ref;
    }
    Mummu.StepToRef = StepToRef;
    function Step(from, to, step) {
        let v = BABYLON.Vector3.Zero();
        StepToRef(from, to, step, v);
        return v;
    }
    Mummu.Step = Step;
    function ForceDistanceFromOriginInPlace(point, origin, distance) {
        TmpVec3[0].copyFrom(point).subtractInPlace(origin).normalize().scaleInPlace(distance);
        point.copyFrom(origin).addInPlace(TmpVec3[0]);
        return point;
    }
    Mummu.ForceDistanceFromOriginInPlace = ForceDistanceFromOriginInPlace;
    function QuaternionFromXYAxisToRef(x, y, ref) {
        let xAxis = TmpVec3[0].copyFrom(x);
        let yAxis = TmpVec3[1].copyFrom(y);
        let zAxis = TmpVec3[2];
        BABYLON.Vector3.CrossToRef(xAxis, yAxis, zAxis);
        BABYLON.Vector3.CrossToRef(zAxis, xAxis, yAxis);
        BABYLON.Quaternion.RotationQuaternionFromAxisToRef(xAxis, yAxis, zAxis, ref);
        return ref;
    }
    Mummu.QuaternionFromXYAxisToRef = QuaternionFromXYAxisToRef;
    function QuaternionFromXZAxisToRef(x, z, ref) {
        let xAxis = TmpVec3[0].copyFrom(x);
        let yAxis = TmpVec3[1];
        let zAxis = TmpVec3[2].copyFrom(z);
        BABYLON.Vector3.CrossToRef(zAxis, xAxis, yAxis);
        BABYLON.Vector3.CrossToRef(xAxis, yAxis, zAxis);
        BABYLON.Quaternion.RotationQuaternionFromAxisToRef(xAxis, yAxis, zAxis, ref);
        return ref;
    }
    Mummu.QuaternionFromXZAxisToRef = QuaternionFromXZAxisToRef;
    function QuaternionFromYZAxisToRef(y, z, ref) {
        let xAxis = TmpVec3[0];
        let yAxis = TmpVec3[1].copyFrom(y);
        let zAxis = TmpVec3[2].copyFrom(z);
        BABYLON.Vector3.CrossToRef(yAxis, zAxis, xAxis);
        BABYLON.Vector3.CrossToRef(xAxis, yAxis, zAxis);
        BABYLON.Quaternion.RotationQuaternionFromAxisToRef(xAxis, yAxis, zAxis, ref);
        return ref;
    }
    Mummu.QuaternionFromYZAxisToRef = QuaternionFromYZAxisToRef;
    function QuaternionFromZXAxisToRef(z, x, ref) {
        let xAxis = TmpVec3[0].copyFrom(x);
        let yAxis = TmpVec3[1];
        let zAxis = TmpVec3[2].copyFrom(z);
        BABYLON.Vector3.CrossToRef(zAxis, xAxis, yAxis);
        BABYLON.Vector3.CrossToRef(yAxis, zAxis, xAxis);
        BABYLON.Quaternion.RotationQuaternionFromAxisToRef(xAxis, yAxis, zAxis, ref);
        return ref;
    }
    Mummu.QuaternionFromZXAxisToRef = QuaternionFromZXAxisToRef;
    function QuaternionFromZYAxisToRef(z, y, ref) {
        let xAxis = TmpVec3[0];
        let yAxis = TmpVec3[1].copyFrom(y);
        let zAxis = TmpVec3[2].copyFrom(z);
        BABYLON.Vector3.CrossToRef(yAxis, zAxis, xAxis);
        BABYLON.Vector3.CrossToRef(zAxis, xAxis, yAxis);
        BABYLON.Quaternion.RotationQuaternionFromAxisToRef(xAxis, yAxis, zAxis, ref);
        return ref;
    }
    Mummu.QuaternionFromZYAxisToRef = QuaternionFromZYAxisToRef;
    function CatmullRomPathInPlace(path, inDir, outDir) {
        if (path.length >= 2) {
            let pFirst = TmpVec3[0];
            if (inDir) {
                pFirst.copyFrom(inDir).scaleInPlace(BABYLON.Vector3.Distance(path[0], path[1])).scaleInPlace(-1).addInPlace(path[0]);
            }
            else {
                pFirst.copyFrom(path[0]).subtractInPlace(path[1]);
                pFirst.addInPlace(path[0]);
            }
            let pLast = TmpVec3[1];
            if (outDir) {
                pLast.copyFrom(outDir).scaleInPlace(BABYLON.Vector3.Distance(path[path.length - 2], path[path.length - 1])).addInPlace(path[path.length - 1]);
            }
            else {
                pLast.copyFrom(path[path.length - 1]).subtractInPlace(path[path.length - 2]);
                pLast.addInPlace(path[path.length - 1]);
            }
            let interpolatedPoints = [];
            for (let i = 0; i < path.length - 1; i++) {
                let p0 = i > 0 ? path[i - 1] : pFirst;
                let p1 = path[i];
                let p2 = path[i + 1];
                let p3 = i < path.length - 2 ? path[i + 2] : pLast;
                interpolatedPoints.push(BABYLON.Vector3.CatmullRom(p0, p1, p2, p3, 0.5));
            }
            for (let i = 0; i < interpolatedPoints.length; i++) {
                path.splice(2 * i + 1, 0, interpolatedPoints[i]);
            }
            return path;
        }
    }
    Mummu.CatmullRomPathInPlace = CatmullRomPathInPlace;
    function CatmullRomClosedPathInPlace(path) {
        let interpolatedPoints = [];
        for (let i = 0; i < path.length; i++) {
            let p0 = path[(i - 1 + path.length) % path.length];
            let p1 = path[i];
            let p2 = path[(i + 1) % path.length];
            let p3 = path[(i + 2) % path.length];
            interpolatedPoints.push(BABYLON.Vector3.CatmullRom(p0, p1, p2, p3, 0.5));
        }
        for (let i = 0; i < interpolatedPoints.length; i++) {
            path.splice(2 * i + 1, 0, interpolatedPoints[i]);
        }
        return path;
    }
    Mummu.CatmullRomClosedPathInPlace = CatmullRomClosedPathInPlace;
    function DecimatePathInPlace(path, minAngle = 1 / 180 * Math.PI) {
        let done = false;
        while (!done) {
            let flatestAngle = Infinity;
            let flatestIndex = -1;
            let dirPrev = BABYLON.Vector3.Forward();
            let dirNext = path[1].subtract(path[0]).normalize();
            for (let i = 1; i < path.length - 1; i++) {
                dirPrev.copyFrom(dirNext);
                dirNext.copyFrom(path[i + 1]).subtractInPlace(path[i]).normalize();
                let angle = Angle(dirPrev, dirNext);
                if (angle < minAngle && angle < flatestAngle) {
                    flatestAngle = angle;
                    flatestIndex = i;
                }
            }
            if (flatestIndex != -1) {
                path.splice(flatestIndex, 1);
            }
            else {
                done = true;
            }
        }
        return path;
    }
    Mummu.DecimatePathInPlace = DecimatePathInPlace;
})(Mummu || (Mummu = {}));
/// <reference path="../lib/babylon.d.ts"/>
var Mummu;
(function (Mummu) {
    class VertexDataLoader {
        constructor(scene) {
            this.scene = scene;
            this._vertexDatas = new Map();
            VertexDataLoader.instance = this;
        }
        static clone(data) {
            let clonedData = new BABYLON.VertexData();
            clonedData.positions = [...data.positions];
            clonedData.indices = [...data.indices];
            clonedData.normals = [...data.normals];
            if (data.matricesIndices) {
                clonedData.matricesIndices = [...data.matricesIndices];
            }
            if (data.matricesWeights) {
                clonedData.matricesWeights = [...data.matricesWeights];
            }
            if (data.uvs) {
                clonedData.uvs = [...data.uvs];
            }
            if (data.colors) {
                clonedData.colors = [...data.colors];
            }
            return clonedData;
        }
        async get(url, scene) {
            if (this._vertexDatas.get(url)) {
                return this._vertexDatas.get(url);
            }
            let vertexData = undefined;
            let loadedFile = await BABYLON.SceneLoader.ImportMeshAsync("", url, "", scene);
            let vertexDatas = [];
            let loadedFileMeshes = loadedFile.meshes.sort((m1, m2) => {
                if (m1.name < m2.name) {
                    return -1;
                }
                else if (m1.name > m2.name) {
                    return 1;
                }
                return 0;
            });
            for (let i = 0; i < loadedFileMeshes.length; i++) {
                let loadedMesh = loadedFileMeshes[i];
                if (loadedMesh instanceof BABYLON.Mesh) {
                    vertexData = BABYLON.VertexData.ExtractFromMesh(loadedMesh);
                    let colors = [];
                    if (loadedMesh.material) {
                        if (loadedMesh.material instanceof BABYLON.PBRMaterial) {
                            let color = loadedMesh.material.albedoColor;
                            for (let k = 0; k < vertexData.positions.length / 3; k++) {
                                let index = k;
                                colors[4 * index] = color.r;
                                colors[4 * index + 1] = color.g;
                                colors[4 * index + 2] = color.b;
                                colors[4 * index + 3] = 1;
                            }
                        }
                        else if (loadedMesh.material instanceof BABYLON.MultiMaterial) {
                            for (let j = 0; j < loadedMesh.material.subMaterials.length; j++) {
                                let subMaterial = loadedMesh.material.subMaterials[j];
                                if (subMaterial instanceof BABYLON.PBRMaterial) {
                                    let color = subMaterial.albedoColor;
                                    console.log(color);
                                    let subMesh = loadedMesh.subMeshes.find(sm => { return sm.materialIndex === j; });
                                    for (let k = 0; k < subMesh.verticesCount; k++) {
                                        let index = subMesh.verticesStart + k;
                                        colors[4 * index] = color.r;
                                        colors[4 * index + 1] = color.g;
                                        colors[4 * index + 2] = color.b;
                                        colors[4 * index + 3] = 1;
                                    }
                                }
                            }
                        }
                    }
                    if (colors.length === 0) {
                        for (let i = 0; i < vertexData.positions.length / 3; i++) {
                            colors.push(1, 1, 1, 1);
                        }
                    }
                    vertexData.colors = colors;
                    vertexDatas.push(vertexData);
                }
            }
            this._vertexDatas.set(url, vertexDatas);
            loadedFileMeshes.forEach(m => { m.dispose(); });
            loadedFile.skeletons.forEach(s => { s.dispose(); });
            return vertexDatas;
        }
        async getColorized(url, baseColorHex = "#FFFFFF", frameColorHex = "", color1Hex = "", // Replace red
        color2Hex = "", // Replace green
        color3Hex = "" // Replace blue
        ) {
            let vertexDatas = await this.getColorizedMultiple(url, baseColorHex, frameColorHex, color1Hex, color2Hex, color3Hex);
            return vertexDatas[0];
        }
        async getColorizedMultiple(url, baseColorHex = "#FFFFFF", frameColorHex = "", color1Hex = "", // Replace red
        color2Hex = "", // Replace green
        color3Hex = "" // Replace blue
        ) {
            let baseColor;
            if (baseColorHex !== "") {
                baseColor = BABYLON.Color3.FromHexString(baseColorHex);
            }
            let frameColor;
            if (frameColorHex !== "") {
                frameColor = BABYLON.Color3.FromHexString(frameColorHex);
            }
            let color1;
            if (color1Hex !== "") {
                color1 = BABYLON.Color3.FromHexString(color1Hex);
            }
            let color2;
            if (color2Hex !== "") {
                color2 = BABYLON.Color3.FromHexString(color2Hex);
            }
            let color3;
            if (color3Hex !== "") {
                color3 = BABYLON.Color3.FromHexString(color3Hex);
            }
            let vertexDatas = await VertexDataLoader.instance.get(url);
            let colorizedVertexDatas = [];
            for (let d = 0; d < vertexDatas.length; d++) {
                let vertexData = vertexDatas[d];
                let colorizedVertexData = VertexDataLoader.clone(vertexData);
                if (colorizedVertexData.colors) {
                    for (let i = 0; i < colorizedVertexData.colors.length / 4; i++) {
                        let r = colorizedVertexData.colors[4 * i];
                        let g = colorizedVertexData.colors[4 * i + 1];
                        let b = colorizedVertexData.colors[4 * i + 2];
                        if (baseColor) {
                            if (r === 1 && g === 1 && b === 1) {
                                colorizedVertexData.colors[4 * i] = baseColor.r;
                                colorizedVertexData.colors[4 * i + 1] = baseColor.g;
                                colorizedVertexData.colors[4 * i + 2] = baseColor.b;
                                continue;
                            }
                        }
                        if (frameColor) {
                            if (r === 0.502 && g === 0.502 && b === 0.502) {
                                colorizedVertexData.colors[4 * i] = frameColor.r;
                                colorizedVertexData.colors[4 * i + 1] = frameColor.g;
                                colorizedVertexData.colors[4 * i + 2] = frameColor.b;
                                continue;
                            }
                        }
                        if (color1) {
                            if (r === 1 && g === 0 && b === 0) {
                                colorizedVertexData.colors[4 * i] = color1.r;
                                colorizedVertexData.colors[4 * i + 1] = color1.g;
                                colorizedVertexData.colors[4 * i + 2] = color1.b;
                                continue;
                            }
                        }
                        if (color2) {
                            if (r === 0 && g === 1 && b === 0) {
                                colorizedVertexData.colors[4 * i] = color2.r;
                                colorizedVertexData.colors[4 * i + 1] = color2.g;
                                colorizedVertexData.colors[4 * i + 2] = color2.b;
                                continue;
                            }
                        }
                        if (color3) {
                            if (r === 0 && g === 0 && b === 1) {
                                colorizedVertexData.colors[4 * i] = color3.r;
                                colorizedVertexData.colors[4 * i + 1] = color3.g;
                                colorizedVertexData.colors[4 * i + 2] = color3.b;
                                continue;
                            }
                        }
                    }
                }
                else {
                    let colors = [];
                    for (let i = 0; i < colorizedVertexData.positions.length / 3; i++) {
                        colors[4 * i] = baseColor.r;
                        colors[4 * i + 1] = baseColor.g;
                        colors[4 * i + 2] = baseColor.b;
                        colors[4 * i + 3] = 1;
                    }
                    colorizedVertexData.colors = colors;
                }
                colorizedVertexDatas.push(colorizedVertexData);
            }
            return colorizedVertexDatas;
        }
    }
    Mummu.VertexDataLoader = VertexDataLoader;
})(Mummu || (Mummu = {}));
var Mummu;
(function (Mummu) {
    function CloneVertexData(data) {
        let clonedData = new BABYLON.VertexData();
        clonedData.positions = [...data.positions];
        clonedData.indices = [...data.indices];
        clonedData.normals = [...data.normals];
        if (data.uvs) {
            clonedData.uvs = [...data.uvs];
        }
        if (data.colors) {
            clonedData.colors = [...data.colors];
        }
        return clonedData;
    }
    Mummu.CloneVertexData = CloneVertexData;
    function MergeVertexDatas(...datas) {
        let mergedData = new BABYLON.VertexData();
        let positions = [];
        let indices = [];
        let normals = [];
        let uvs = [];
        let colors = [];
        for (let i = 0; i < datas.length; i++) {
            let offset = positions.length / 3;
            positions.push(...datas[i].positions);
            indices.push(...datas[i].indices.map(index => { return index + offset; }));
            normals.push(...datas[i].normals);
            if (datas[i].uvs) {
                uvs.push(...datas[i].uvs);
            }
            if (datas[i].colors) {
                colors.push(...datas[i].colors);
            }
        }
        mergedData.positions = positions;
        mergedData.indices = indices;
        mergedData.normals = normals;
        if (uvs.length > 0) {
            mergedData.uvs = uvs;
        }
        if (colors.length > 0) {
            mergedData.colors = colors;
        }
        return mergedData;
    }
    Mummu.MergeVertexDatas = MergeVertexDatas;
    function TranslateVertexDataInPlace(data, t) {
        let positions = [...data.positions];
        for (let i = 0; i < positions.length / 3; i++) {
            positions[3 * i] += t.x;
            positions[3 * i + 1] += t.y;
            positions[3 * i + 2] += t.z;
        }
        data.positions = positions;
        return data;
    }
    Mummu.TranslateVertexDataInPlace = TranslateVertexDataInPlace;
    function RotateVertexDataInPlace(data, q) {
        let pos = BABYLON.Vector3.Zero();
        let normal = BABYLON.Vector3.Up();
        let positions = [...data.positions];
        let normals = [...data.normals];
        let L = positions.length;
        for (let i = 0; i < L / 3; i++) {
            pos.copyFromFloats(positions[3 * i], positions[3 * i + 1], positions[3 * i + 2]);
            normal.copyFromFloats(normals[3 * i], normals[3 * i + 1], normals[3 * i + 2]);
            pos.rotateByQuaternionToRef(q, pos);
            normal.rotateByQuaternionToRef(q, normal);
            positions[3 * i] = pos.x;
            positions[3 * i + 1] = pos.y;
            positions[3 * i + 2] = pos.z;
            normals[3 * i] = normal.x;
            normals[3 * i + 1] = normal.y;
            normals[3 * i + 2] = normal.z;
        }
        data.positions = positions;
        data.normals = normals;
        return data;
    }
    Mummu.RotateVertexDataInPlace = RotateVertexDataInPlace;
    function ScaleVertexDataInPlace(data, s) {
        data.positions = data.positions.map((n) => { return n * s; });
        return data;
    }
    Mummu.ScaleVertexDataInPlace = ScaleVertexDataInPlace;
})(Mummu || (Mummu = {}));
