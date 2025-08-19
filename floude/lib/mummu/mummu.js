/// <reference path="../../nabu/nabu.d.ts"/>
var Mummu;
(function (Mummu) {
    class AnimationFactory {
        static CreateWait(owner, onUpdateCallback) {
            return (duration) => {
                return new Promise(resolve => {
                    let t0 = performance.now();
                    let animationCB = () => {
                        let t = (performance.now() - t0) / 1000;
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
            return (target, duration, overrideEasing) => {
                return new Promise(resolve => {
                    let origin = obj[property];
                    let t0 = performance.now();
                    if (owner[property + "_animation"]) {
                        owner.getScene().onBeforeRenderObservable.removeCallback(owner[property + "_animation"]);
                    }
                    let animationCB = () => {
                        let f = (performance.now() - t0) / 1000 / duration;
                        if (f < 1) {
                            if (isAngle) {
                                obj[property] = Nabu.LerpAngle(origin, target, f);
                            }
                            else {
                                if (overrideEasing) {
                                    f = overrideEasing(f);
                                }
                                else if (easing) {
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
        static CreateNumbers(owner, obj, properties, onUpdateCallback, isAngle, easing) {
            return (targets, duration) => {
                return new Promise(resolve => {
                    let n = properties.length;
                    let origins = [];
                    for (let i = 0; i < n; i++) {
                        origins[i] = obj[properties[i]];
                    }
                    let t0 = performance.now();
                    if (owner[properties[0] + "_animation"]) {
                        owner.getScene().onBeforeRenderObservable.removeCallback(owner[properties[0] + "_animation"]);
                    }
                    let animationCB = () => {
                        let f = (performance.now() - t0) / 1000 / duration;
                        if (f < 1) {
                            if (easing) {
                                f = easing(f);
                            }
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
        static CreateVector3(owner, obj, property, onUpdateCallback, easing) {
            return (target, duration, overrideEasing) => {
                return new Promise(resolve => {
                    let origin = obj[property].clone();
                    let tmpVector3 = BABYLON.Vector3.Zero();
                    let t0 = performance.now();
                    if (owner[property + "_animation"]) {
                        owner.getScene().onBeforeRenderObservable.removeCallback(owner[property + "_animation"]);
                    }
                    let animationCB = () => {
                        let f = (performance.now() - t0) / 1000 / duration;
                        if (f < 1) {
                            if (overrideEasing) {
                                f = overrideEasing(f);
                            }
                            else if (easing) {
                                f = easing(f);
                            }
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
        static CreateQuaternion(owner, obj, property, onUpdateCallback, easing) {
            return (target, duration, overrideEasing) => {
                return new Promise(resolve => {
                    let origin = obj[property].clone();
                    let t0 = performance.now();
                    if (owner[property + "_animation"]) {
                        owner.getScene().onBeforeRenderObservable.removeCallback(owner[property + "_animation"]);
                    }
                    let animationCB = () => {
                        let f = (performance.now() - t0) / 1000 / duration;
                        if (f < 1) {
                            if (overrideEasing) {
                                f = overrideEasing(f);
                            }
                            else if (easing) {
                                f = easing(f);
                            }
                            BABYLON.Quaternion.SlerpToRef(origin, target, f, obj[property]);
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
    AnimationFactory.EmptyNumberCallback = async (target, duration, overrideEasing) => { };
    AnimationFactory.EmptyNumbersCallback = async (targets, duration) => { };
    AnimationFactory.EmptyVector3Callback = async (target, duration, overrideEasing) => { };
    AnimationFactory.EmptyQuaternionCallback = async (target, duration, overrideEasing) => { };
    Mummu.AnimationFactory = AnimationFactory;
})(Mummu || (Mummu = {}));
var Mummu;
(function (Mummu) {
    function SphereCollidersIntersection(cSphere, rSphere, colliders) {
        let intersections = [];
        for (let i = 0; i < colliders.length; i++) {
            let intersection = SphereColliderIntersection(cSphere, rSphere, colliders[i]);
            if (intersection.hit) {
                intersections.push(intersection);
            }
        }
        return intersections;
    }
    Mummu.SphereCollidersIntersection = SphereCollidersIntersection;
    function SphereColliderIntersection(cSphere, rSphere, collider) {
        if (collider instanceof PlaneCollider) {
            return Mummu.SpherePlaneIntersection(cSphere, rSphere, collider);
        }
        else if (collider instanceof SphereCollider) {
            // todo
        }
        else if (collider instanceof MeshCollider) {
            return Mummu.SphereMeshIntersection(cSphere, rSphere, collider.mesh);
        }
        else if (collider instanceof BABYLON.Mesh) {
            return Mummu.SphereMeshIntersection(cSphere, rSphere, collider);
        }
    }
    Mummu.SphereColliderIntersection = SphereColliderIntersection;
    function RayCollidersIntersection(ray, colliders) {
        let intersection = new Mummu.Intersection();
        for (let i = 0; i < colliders.length; i++) {
            let currIntersection = RayColliderIntersection(ray, colliders[i]);
            if (currIntersection.hit) {
                if (!currIntersection.hit || currIntersection.depth > intersection.depth) {
                    intersection = currIntersection;
                }
            }
        }
        return intersection;
    }
    Mummu.RayCollidersIntersection = RayCollidersIntersection;
    function RayColliderIntersection(ray, collider) {
        if (collider instanceof PlaneCollider) {
            return Mummu.RayPlaneIntersection(ray, collider);
        }
        else if (collider instanceof SphereCollider) {
            // todo
        }
        else if (collider instanceof MeshCollider) {
            return Mummu.RayMeshIntersection(ray, collider.mesh);
        }
        else if (collider instanceof BABYLON.Mesh) {
            return Mummu.RayMeshIntersection(ray, collider);
        }
    }
    Mummu.RayColliderIntersection = RayColliderIntersection;
    class Collider {
    }
    Mummu.Collider = Collider;
    class PlaneCollider extends Collider {
        constructor(point, normal) {
            super();
            this.point = point;
            this.normal = normal;
            if (this.normal.lengthSquared() != 1) {
                this.normal = this.normal.clone().normalize();
            }
        }
        static CreateFromBJSPlane(plane) {
            plane.computeWorldMatrix(true);
            return new PlaneCollider(plane.position, plane.forward.scale(-1));
        }
        static CreateFromPoints(p1, p2, p3) {
            let l1 = p2.subtract(p1);
            let l2 = p3.subtract(p1);
            return new PlaneCollider(p1, BABYLON.Vector3.Cross(l1, l2));
        }
    }
    Mummu.PlaneCollider = PlaneCollider;
    class SphereCollider extends Collider {
        constructor(localCenter, radius, parent) {
            super();
            this.localCenter = localCenter;
            this.radius = radius;
            this.parent = parent;
            this.center = BABYLON.Vector3.Zero();
            this.recomputeWorldCenter();
        }
        recomputeWorldCenter() {
            if (this.parent) {
                BABYLON.Vector3.TransformCoordinatesToRef(this.localCenter, this.parent.getWorldMatrix(), this.center);
            }
            else {
                this.center.copyFrom(this.localCenter);
            }
        }
    }
    Mummu.SphereCollider = SphereCollider;
    class MeshCollider extends Collider {
        constructor(mesh) {
            super();
            this.mesh = mesh;
        }
    }
    Mummu.MeshCollider = MeshCollider;
})(Mummu || (Mummu = {}));
/// <reference path="../lib/babylon.d.ts"/>
var Mummu;
(function (Mummu) {
    function DrawDebugLine(from, to, frames = Infinity, color, scene) {
        if (!scene) {
            scene = BABYLON.Engine.Instances[0]?.scenes[0];
        }
        if (scene) {
            let colors;
            if (color) {
                colors = [
                    color.toColor4(),
                    color.toColor4()
                ];
            }
            let line = BABYLON.MeshBuilder.CreateLines("debug-line", {
                points: [from, to],
                colors: colors
            });
            if (isFinite(frames)) {
                let frameCount = frames;
                let disposeTimer = () => {
                    frameCount--;
                    if (frameCount <= 0) {
                        line.dispose();
                    }
                    else {
                        requestAnimationFrame(disposeTimer);
                    }
                };
                requestAnimationFrame(disposeTimer);
            }
            return line;
        }
    }
    Mummu.DrawDebugLine = DrawDebugLine;
    function DrawDebugHit(point, normal, frames = Infinity, color, scene) {
        if (!scene) {
            scene = BABYLON.Engine.Instances[0]?.scenes[0];
        }
        if (scene) {
            let colors;
            if (color) {
                colors = [
                    [
                        color.toColor4(),
                        color.toColor4(),
                        color.toColor4()
                    ],
                    [
                        color.toColor4(),
                        color.toColor4()
                    ],
                    [
                        color.toColor4(),
                        color.toColor4()
                    ],
                    [
                        color.toColor4(),
                        color.toColor4()
                    ]
                ];
            }
            let f1 = BABYLON.Vector3.Cross(normal, new BABYLON.Vector3(Math.random(), Math.random(), Math.random())).normalize().scaleInPlace(0.01);
            let f2 = Mummu.Rotate(f1, normal, 2 * Math.PI / 3);
            let f3 = Mummu.Rotate(f2, normal, 2 * Math.PI / 3);
            f1.addInPlace(point);
            f2.addInPlace(point);
            f3.addInPlace(point);
            let p = point.add(normal.scale(0.1));
            let line = BABYLON.MeshBuilder.CreateLineSystem("debug-points", {
                lines: [
                    [f1, f2, f3],
                    [f1, p],
                    [f2, p],
                    [f3, p]
                ],
                colors: colors
            }, scene);
            if (isFinite(frames)) {
                let frameCount = frames;
                let disposeTimer = () => {
                    frameCount--;
                    if (frameCount <= 0) {
                        line.dispose();
                    }
                    else {
                        requestAnimationFrame(disposeTimer);
                    }
                };
                requestAnimationFrame(disposeTimer);
            }
            return line;
        }
    }
    Mummu.DrawDebugHit = DrawDebugHit;
    function DrawDebugPoint(points, frames = Infinity, color, size = 0.2, scene) {
        if (!scene) {
            scene = BABYLON.Engine.Instances[0]?.scenes[0];
        }
        if (scene) {
            let colors;
            if (color) {
                colors = [
                    [
                        color.toColor4(),
                        color.toColor4()
                    ],
                    [
                        color.toColor4(),
                        color.toColor4()
                    ],
                    [
                        color.toColor4(),
                        color.toColor4()
                    ]
                ];
            }
            let line = BABYLON.MeshBuilder.CreateLineSystem("debug-points", {
                lines: [
                    [
                        points.add(new BABYLON.Vector3(-size * 0.5, 0, 0)),
                        points.add(new BABYLON.Vector3(size * 0.5, 0, 0))
                    ],
                    [
                        points.add(new BABYLON.Vector3(0, -size * 0.5, 0)),
                        points.add(new BABYLON.Vector3(0, size * 0.5, 0))
                    ],
                    [
                        points.add(new BABYLON.Vector3(0, 0, -size * 0.5)),
                        points.add(new BABYLON.Vector3(0, 0, size * 0.5))
                    ]
                ],
                colors: colors
            }, scene);
            if (isFinite(frames)) {
                let frameCount = frames;
                let disposeTimer = () => {
                    frameCount--;
                    if (frameCount <= 0) {
                        line.dispose();
                    }
                    else {
                        requestAnimationFrame(disposeTimer);
                    }
                };
                requestAnimationFrame(disposeTimer);
            }
            return line;
        }
    }
    Mummu.DrawDebugPoint = DrawDebugPoint;
    function DrawDebugTriangle(p1, p2, p3, frames = Infinity, color, scene) {
        if (!scene) {
            scene = BABYLON.Engine.Instances[0]?.scenes[0];
        }
        if (scene) {
            let colors;
            if (color) {
                colors = [
                    color.toColor4(),
                    color.toColor4(),
                    color.toColor4(),
                    color.toColor4()
                ];
            }
            let line = BABYLON.MeshBuilder.CreateLines("debug-triangle", {
                points: [p1, p2, p3, p1],
                colors: colors
            });
            if (isFinite(frames)) {
                let frameCount = frames;
                let disposeTimer = () => {
                    frameCount--;
                    if (frameCount <= 0) {
                        line.dispose();
                    }
                    else {
                        requestAnimationFrame(disposeTimer);
                    }
                };
                requestAnimationFrame(disposeTimer);
            }
            return line;
        }
    }
    Mummu.DrawDebugTriangle = DrawDebugTriangle;
})(Mummu || (Mummu = {}));
/*
    Point
    Line
    Segment
    Ray
    Path
    Wire
    Plane
    AABB
    Triangle
    Sphere
    Capsule
    Mesh
*/
var Mummu;
(function (Mummu) {
    class Intersection {
        constructor() {
            this.hit = false;
            this.depth = 0;
            this.index = -1;
        }
    }
    Mummu.Intersection = Intersection;
    function SphereTriangleCheck(cSphere, rSphere, p1, p2, p3) {
        return SphereAABBCheck(cSphere, rSphere, Math.min(p1.x, p2.x, p3.x), Math.max(p1.x, p2.x, p3.x), Math.min(p1.y, p2.y, p3.y), Math.max(p1.y, p2.y, p3.y), Math.min(p1.z, p2.z, p3.z), Math.max(p1.z, p2.z, p3.z));
    }
    Mummu.SphereTriangleCheck = SphereTriangleCheck;
    function SphereRayCheck(cSphere, rSphere, ray) {
        return SphereAABBCheck(cSphere, rSphere, Math.min(ray.origin.x, ray.origin.x + ray.direction.x), Math.max(ray.origin.x, ray.origin.x + ray.direction.x), Math.min(ray.origin.y, ray.origin.y + ray.direction.y), Math.max(ray.origin.y, ray.origin.y + ray.direction.y), Math.min(ray.origin.z, ray.origin.z + ray.direction.z), Math.max(ray.origin.z, ray.origin.z + ray.direction.z));
    }
    Mummu.SphereRayCheck = SphereRayCheck;
    function PointAABBCheck(p, arg1, arg2, y1Min, y1Max, z1Min, z1Max) {
        let x1Min;
        let x1Max;
        if (arg1 instanceof BABYLON.Vector3) {
            x1Min = arg1.x;
            x1Max = arg2.x;
            y1Min = arg1.y;
            y1Max = arg2.y;
            z1Min = arg1.z;
            z1Max = arg2.z;
        }
        else {
            x1Min = arg1;
            x1Max = arg2;
        }
        if (p.x >= x1Min) {
            if (p.x <= x1Max) {
                if (p.y >= y1Min) {
                    if (p.y <= y1Max) {
                        if (p.z >= z1Min) {
                            if (p.z <= z1Max) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }
    Mummu.PointAABBCheck = PointAABBCheck;
    function SphereAABBCheck(cSphere, rSphere, arg1, arg2, y2Min, y2Max, z2Min, z2Max) {
        let x2Min;
        let x2Max;
        if (arg1 instanceof BABYLON.Vector3) {
            x2Min = arg1.x;
            x2Max = arg2.x;
            y2Min = arg1.y;
            y2Max = arg2.y;
            z2Min = arg1.z;
            z2Max = arg2.z;
        }
        else {
            x2Min = arg1;
            x2Max = arg2;
        }
        return AABBAABBCheck(cSphere.x - rSphere, cSphere.x + rSphere, cSphere.y - rSphere, cSphere.y + rSphere, cSphere.z - rSphere, cSphere.z + rSphere, x2Min, x2Max, y2Min, y2Max, z2Min, z2Max);
    }
    Mummu.SphereAABBCheck = SphereAABBCheck;
    function AABBAABBCheck(arg1, arg2, arg3, arg4, z1Min, z1Max, x2Min, x2Max, y2Min, y2Max, z2Min, z2Max) {
        let x1Min;
        let x1Max;
        let y1Min;
        let y1Max;
        if (arg1 instanceof BABYLON.Vector3) {
            x1Min = arg1.x;
            x1Max = arg2.x;
            y1Min = arg1.y;
            y1Max = arg2.y;
            z1Min = arg1.z;
            z1Max = arg2.z;
            x2Min = arg3.x;
            x2Max = arg4.x;
            y2Min = arg3.y;
            y2Max = arg4.y;
            z2Min = arg3.z;
            z2Max = arg4.z;
        }
        else {
            x1Min = arg1;
            x1Max = arg2;
            y1Min = arg3;
            y1Max = arg4;
        }
        if (x1Min > x2Max) {
            return false;
        }
        if (x1Max < x2Min) {
            return false;
        }
        if (y1Min > y2Max) {
            return false;
        }
        if (y1Max < y2Min) {
            return false;
        }
        if (z1Min > z2Max) {
            return false;
        }
        if (z1Max < z2Min) {
            return false;
        }
        return true;
    }
    Mummu.AABBAABBCheck = AABBAABBCheck;
    function RaySphereIntersection(ray, arg2, rSphere) {
        let cSphere;
        if (arg2 instanceof BABYLON.Vector3) { // 2
            cSphere = arg2;
        }
        else { // 1
            cSphere = arg2.center;
            rSphere = arg2.radius;
        }
        let intersection = new Intersection();
        if (SphereRayCheck(cSphere, rSphere, ray)) {
            // todo
        }
        return intersection;
    }
    Mummu.RaySphereIntersection = RaySphereIntersection;
    function RayMeshIntersection(ray, mesh) {
        let intersection = new Intersection();
        let pickingInfo = ray.intersectsMesh(mesh);
        if (pickingInfo.hit) {
            intersection.hit = true;
            intersection.point = pickingInfo.pickedPoint;
            intersection.normal = pickingInfo.getNormal(true);
            intersection.depth = ray.length - pickingInfo.distance;
        }
        return intersection;
    }
    Mummu.RayMeshIntersection = RayMeshIntersection;
    function RayPlaneIntersection(ray, arg1, nPlane) {
        let pPlane;
        if (arg1 instanceof BABYLON.Vector3) { // 2
            pPlane = arg1;
        }
        else { // 1
            pPlane = arg1.point;
            nPlane = arg1.normal;
        }
        let intersection = new Intersection();
        let bjsPlane = BABYLON.Plane.FromPositionAndNormal(pPlane, nPlane);
        let d = ray.intersectsPlane(bjsPlane);
        if (d > 0.001 && (d <= ray.length)) {
            intersection.hit = true;
            intersection.point = ray.origin.add(ray.direction.scale(d));
            intersection.normal = nPlane.clone();
            intersection.depth = ray.length - d;
        }
        return intersection;
    }
    Mummu.RayPlaneIntersection = RayPlaneIntersection;
    function SpherePlaneIntersection(arg1, arg2, arg3, nPlane) {
        let cSphere;
        let rSphere;
        let pPlane;
        if (arg1 instanceof BABYLON.Vector3 && arg3 instanceof BABYLON.Vector3) {
            cSphere = arg1;
            rSphere = arg2;
            pPlane = arg3;
        }
        else if (arg1 instanceof BABYLON.Vector3) {
            cSphere = arg1;
            rSphere = arg2;
            pPlane = arg3.point;
            nPlane = arg3.normal;
        }
        else {
            cSphere = arg1.center;
            rSphere = arg1.radius;
            pPlane = arg2.point;
            nPlane = arg2.normal;
        }
        let intersection = new Intersection();
        let proj = Mummu.ProjectPointOnPlane(cSphere, pPlane, nPlane);
        let sqrDist = BABYLON.Vector3.DistanceSquared(cSphere, proj);
        if (sqrDist <= rSphere * rSphere) {
            let dist = Math.sqrt(sqrDist);
            intersection.hit = true;
            intersection.depth = rSphere - dist;
            intersection.point = proj;
            intersection.normal = nPlane.clone();
        }
        return intersection;
    }
    Mummu.SpherePlaneIntersection = SpherePlaneIntersection;
    function SphereCapsuleIntersection(cSphere, rSphere, c1Capsule, c2Capsule, rCapsule) {
        let intersection = new Intersection();
        if (SphereAABBCheck(cSphere, rSphere, Math.min(c1Capsule.x, c2Capsule.x) - rCapsule, Math.max(c1Capsule.x, c2Capsule.x) + rCapsule, Math.min(c1Capsule.y, c2Capsule.y) - rCapsule, Math.max(c1Capsule.y, c2Capsule.y) + rCapsule, Math.min(c1Capsule.z, c2Capsule.z) - rCapsule, Math.max(c1Capsule.z, c2Capsule.z) + rCapsule)) {
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
    var SphereLatheIntersectionTmpVec3 = BABYLON.Vector3.Zero();
    function SphereLatheIntersection(cSphere, rSphere, cLathe, path, rWire = 0) {
        let proj = SphereLatheIntersectionTmpVec3;
        proj.copyFrom(cSphere).subtractInPlace(cLathe);
        let alpha = Mummu.AngleFromToAround(proj, BABYLON.Axis.X, BABYLON.Axis.Y);
        Mummu.RotateInPlace(proj, BABYLON.Axis.Y, alpha);
        let intersection = SphereWireIntersection(proj, rSphere, path, rWire);
        if (intersection.hit) {
            Mummu.RotateInPlace(intersection.point, BABYLON.Axis.Y, -alpha);
            Mummu.RotateInPlace(intersection.normal, BABYLON.Axis.Y, -alpha);
            intersection.point.addInPlace(cLathe);
        }
        return intersection;
    }
    Mummu.SphereLatheIntersection = SphereLatheIntersection;
    var SphereWireIntersectionTmpWireProj_0 = { point: BABYLON.Vector3.Zero(), index: -1 };
    function SphereWireIntersection(cSphere, rSphere, path, rWire, pathIsEvenlyDistributed, nearBestIndex, nearBestSearchRange) {
        let intersection = new Intersection();
        let proj = SphereWireIntersectionTmpWireProj_0;
        Mummu.ProjectPointOnPathToRef(cSphere, path, proj, pathIsEvenlyDistributed, nearBestIndex, nearBestSearchRange);
        let sqrDist = BABYLON.Vector3.DistanceSquared(cSphere, proj.point);
        let sqrDepth = (rSphere + rWire) * (rSphere + rWire) - sqrDist;
        if (sqrDepth > 0) {
            intersection.hit = true;
            intersection.depth = (rSphere + rWire) - Math.sqrt(sqrDist);
            let dir = cSphere.subtract(proj.point).normalize();
            intersection.point = dir.scale(rWire);
            intersection.point.addInPlace(proj.point);
            intersection.normal = dir;
            intersection.index = proj.index;
        }
        return intersection;
    }
    Mummu.SphereWireIntersection = SphereWireIntersection;
    var SphereInTubeIntersectionTmpWireProj_0 = { point: BABYLON.Vector3.Zero(), index: -1 };
    function SphereInTubeIntersection(cSphere, rSphere, path, rTube, pathIsEvenlyDistributed, nearBestIndex, nearBestSearchRange) {
        let intersection = new Intersection();
        let proj = SphereInTubeIntersectionTmpWireProj_0;
        Mummu.ProjectPointOnPathToRef(cSphere, path, proj, pathIsEvenlyDistributed, nearBestIndex, nearBestSearchRange);
        let dist = BABYLON.Vector3.Distance(cSphere, proj.point);
        if (proj.index === 0) {
            let AB = path[1].subtract(path[0]);
            let AP = cSphere.subtract(path[0]);
            if (BABYLON.Vector3.Dot(AB, AP) < 0) {
                dist = 0;
            }
        }
        else if (proj.index === path.length - 2) {
            let AB = path[path.length - 1].subtract(path[path.length - 2]);
            let AP = cSphere.subtract(path[path.length - 1]);
            if (BABYLON.Vector3.Dot(AB, AP) > 0) {
                dist = 0;
            }
        }
        let depth = (rSphere + dist) - rTube;
        if (depth > 0 && depth < rSphere) {
            intersection.hit = true;
            intersection.depth = depth;
            let dir = proj.point.subtract(cSphere).normalize();
            intersection.point = dir.scale(-rTube);
            intersection.point.addInPlace(proj.point);
            intersection.normal = dir;
            intersection.index = proj.index;
        }
        return intersection;
    }
    Mummu.SphereInTubeIntersection = SphereInTubeIntersection;
    var SphereTriangleIntersectionTmpVec3_0 = BABYLON.Vector3.Zero();
    var SphereTriangleIntersectionTmpVec3_1 = BABYLON.Vector3.Zero();
    var SphereTriangleIntersectionTmpVec3_2 = BABYLON.Vector3.Zero();
    var SphereTriangleIntersectionTmpVec3_3 = BABYLON.Vector3.Zero();
    var SphereTriangleIntersectionTmpVec3_4 = BABYLON.Vector3.Zero();
    var SphereTriangleIntersectionTmpQuat_0 = BABYLON.Quaternion.Identity();
    var SphereTriangleIntersectionTmpMatrix_0 = BABYLON.Matrix.Identity();
    function SphereTriangleIntersection(arg1, arg2, arg3, arg4, arg5) {
        let intersection = new Intersection();
        let cSphere;
        let rSphere;
        let p1;
        let p2;
        let p3;
        if (arg1 instanceof BABYLON.Vector3) {
            cSphere = arg1;
            rSphere = arg2;
            p1 = arg3;
            p2 = arg4;
            p3 = arg5;
        }
        else {
            cSphere = arg1.center;
            rSphere = arg1.radius;
            p1 = arg2;
            p2 = arg3;
            p3 = arg4;
        }
        if (SphereTriangleCheck(cSphere, rSphere, p1, p2, p3)) {
            let plane = Mummu.PlaneCollider.CreateFromPoints(p1, p2, p3);
            let proj = Mummu.ProjectPointOnPlaneToRef(cSphere, plane.point, plane.normal, SphereTriangleIntersectionTmpVec3_0);
            let sqrDist = BABYLON.Vector3.DistanceSquared(cSphere, proj);
            if (sqrDist <= rSphere * rSphere) {
                let barycentric = Mummu.Barycentric(cSphere, p1, p2, p3);
                if (barycentric.u < 0 || barycentric.u > 1 || barycentric.v < 0 || barycentric.v > 1 || barycentric.w < 0 || barycentric.w > 1) {
                    let proj1 = Mummu.ProjectPointOnSegmentToRef(proj, p1, p2, SphereTriangleIntersectionTmpVec3_1);
                    let sqrDist1 = BABYLON.Vector3.DistanceSquared(proj, proj1);
                    let proj2 = Mummu.ProjectPointOnSegmentToRef(proj, p2, p3, SphereTriangleIntersectionTmpVec3_2);
                    let sqrDist2 = BABYLON.Vector3.DistanceSquared(proj, proj2);
                    let proj3 = Mummu.ProjectPointOnSegmentToRef(proj, p3, p1, SphereTriangleIntersectionTmpVec3_3);
                    let sqrDist3 = BABYLON.Vector3.DistanceSquared(proj, proj3);
                    if (sqrDist1 <= sqrDist2 && sqrDist1 <= sqrDist3) {
                        proj = proj1;
                    }
                    else if (sqrDist2 <= sqrDist1 && sqrDist2 <= sqrDist3) {
                        proj = proj2;
                    }
                    else if (sqrDist3 <= sqrDist1 && sqrDist3 <= sqrDist2) {
                        proj = proj3;
                    }
                }
                sqrDist = BABYLON.Vector3.DistanceSquared(cSphere, proj);
                if (sqrDist <= rSphere * rSphere) {
                    let triangleNormal = BABYLON.Vector3.CrossToRef(p3.subtract(p1), p2.subtract(p1), SphereTriangleIntersectionTmpVec3_4);
                    let normal = cSphere.subtract(proj);
                    if (BABYLON.Vector3.Dot(triangleNormal, normal) > 0) {
                        let dist = Math.sqrt(sqrDist);
                        intersection.hit = true;
                        intersection.point = proj;
                        intersection.normal = triangleNormal.normalize();
                        intersection.depth = rSphere - dist;
                    }
                }
            }
        }
        return intersection;
    }
    Mummu.SphereTriangleIntersection = SphereTriangleIntersection;
    var SphereMeshIntersectionTmpVec3_0 = BABYLON.Vector3.Zero();
    var SphereMeshIntersectionTmpVec3_1 = BABYLON.Vector3.Zero();
    var SphereMeshIntersectionTmpVec3_2 = BABYLON.Vector3.Zero();
    var SphereMeshIntersectionTmpVec3_3 = BABYLON.Vector3.Zero();
    var SphereMeshIntersectionTmpVec3_4 = BABYLON.Vector3.Zero();
    var SphereMeshIntersectionTmpQuat_0 = BABYLON.Quaternion.Identity();
    var SphereMeshIntersectionTmpMatrix_0 = BABYLON.Matrix.Identity();
    function SphereMeshIntersection(cSphere, rSphere, mesh) {
        let intersection = new Intersection();
        let bbox = mesh.getBoundingInfo();
        let scale = SphereMeshIntersectionTmpVec3_0;
        mesh.getWorldMatrix().decompose(scale, SphereMeshIntersectionTmpQuat_0, SphereMeshIntersectionTmpVec3_1);
        let invMatrix = SphereMeshIntersectionTmpMatrix_0;
        invMatrix.copyFrom(mesh.getWorldMatrix()).invert();
        let localCSphere = BABYLON.Vector3.TransformCoordinates(cSphere, invMatrix);
        let localRadius = rSphere / scale.x;
        if (SphereAABBCheck(localCSphere, localRadius, bbox.minimum, bbox.maximum)) {
            let positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            let indices = mesh.getIndices();
            let p1 = SphereMeshIntersectionTmpVec3_2;
            let p2 = SphereMeshIntersectionTmpVec3_3;
            let p3 = SphereMeshIntersectionTmpVec3_4;
            for (let i = 0; i < indices.length / 3; i++) {
                let i1 = indices[3 * i];
                let i2 = indices[3 * i + 1];
                let i3 = indices[3 * i + 2];
                p1.x = positions[3 * i1];
                p1.y = positions[3 * i1 + 1];
                p1.z = positions[3 * i1 + 2];
                p2.x = positions[3 * i2];
                p2.y = positions[3 * i2 + 1];
                p2.z = positions[3 * i2 + 2];
                p3.x = positions[3 * i3];
                p3.y = positions[3 * i3 + 1];
                p3.z = positions[3 * i3 + 2];
                let triIntersection = SphereTriangleIntersection(localCSphere, localRadius, p1, p2, p3);
                if (triIntersection.hit) {
                    if (!intersection || triIntersection.depth > intersection.depth) {
                        intersection = triIntersection;
                    }
                }
            }
            if (intersection.hit) {
                BABYLON.Vector3.TransformCoordinatesToRef(intersection.point, mesh.getWorldMatrix(), intersection.point);
                BABYLON.Vector3.TransformNormalToRef(intersection.normal, mesh.getWorldMatrix(), intersection.normal);
            }
        }
        return intersection;
    }
    Mummu.SphereMeshIntersection = SphereMeshIntersection;
})(Mummu || (Mummu = {}));
/// <reference path="../lib/babylon.d.ts"/>
var Mummu;
(function (Mummu) {
    function CreateQuadVertexData(props) {
        let data = new BABYLON.VertexData();
        if (isFinite(props.width) && isFinite(props.height)) {
            props.p1 = new BABYLON.Vector3(-props.width * 0.5, -props.height * 0.5, 0);
            props.p2 = props.p1.clone();
            props.p2.x += props.width;
            props.p3 = props.p1.clone();
            props.p3.x += props.width;
            props.p3.y += props.height;
            props.p4 = props.p1.clone();
            props.p4.y += props.height;
        }
        let positions = [props.p1.x, props.p1.y, props.p1.z, props.p2.x, props.p2.y, props.p2.z, props.p3.x, props.p3.y, props.p3.z, props.p4.x, props.p4.y, props.p4.z];
        let n1 = BABYLON.Vector3.Cross(props.p4.subtract(props.p1), props.p2.subtract(props.p1)).normalize();
        let n2 = BABYLON.Vector3.Cross(props.p1.subtract(props.p2), props.p3.subtract(props.p2)).normalize();
        let n3 = BABYLON.Vector3.Cross(props.p2.subtract(props.p3), props.p4.subtract(props.p3)).normalize();
        let n4 = BABYLON.Vector3.Cross(props.p3.subtract(props.p4), props.p1.subtract(props.p4)).normalize();
        let indices = [];
        if (BABYLON.Vector3.DistanceSquared(props.p1, props.p3) <= BABYLON.Vector3.DistanceSquared(props.p2, props.p4)) {
            if (isNaN(props.sideOrientation) || props.sideOrientation === 0 || props.sideOrientation === 2) {
                indices.push(0, 1, 2);
                indices.push(0, 2, 3);
            }
            if (props.sideOrientation === 1 || props.sideOrientation === 2) {
                indices.push(0, 2, 1);
                indices.push(0, 3, 2);
            }
        }
        else {
            if (isNaN(props.sideOrientation) || props.sideOrientation === 0 || props.sideOrientation === 2) {
                indices.push(0, 1, 3);
                indices.push(1, 2, 3);
            }
            if (props.sideOrientation === 1 || props.sideOrientation === 2) {
                indices.push(0, 3, 1);
                indices.push(1, 3, 2);
            }
        }
        let normals = [n1.x, n1.y, n1.z, n2.x, n2.y, n2.z, n3.x, n3.y, n3.z, n4.x, n4.y, n4.z];
        let uvs;
        if (props.uvInWorldSpace) {
            let s = props.uvSize;
            if (isNaN(s)) {
                s = 1;
            }
            let w = props.p2.subtract(props.p1).length() / s;
            let h = props.p4.subtract(props.p1).length() / s;
            uvs = [0, 0, w, 0, w, h, 0, h];
        }
        else {
            uvs = [0, 0, 1, 0, 1, 1, 0, 1];
        }
        data.positions = positions;
        data.normals = normals;
        data.indices = indices;
        data.uvs = uvs;
        if (props.colors) {
            if (props.colors instanceof BABYLON.Color4) {
                let colors = [...props.colors.asArray(), ...props.colors.asArray(), ...props.colors.asArray(), ...props.colors.asArray()];
                data.colors = colors;
            }
            else {
                let colors = [...props.colors[0].asArray(), ...props.colors[1].asArray(), ...props.colors[2].asArray(), ...props.colors[3].asArray()];
                data.colors = colors;
            }
        }
        return data;
    }
    Mummu.CreateQuadVertexData = CreateQuadVertexData;
    function CreateQuad(name, props, scene) {
        let mesh = new BABYLON.Mesh(name, scene);
        CreateQuadVertexData(props).applyToMesh(mesh);
        return mesh;
    }
    Mummu.CreateQuad = CreateQuad;
    function Create9SliceVertexData(props) {
        let data = new BABYLON.VertexData();
        let w2 = props.width * 0.5;
        let h2 = props.height * 0.5;
        let m = props.margin;
        let positions = [
            -w2, -h2, 0,
            -w2 + m, -h2, 0,
            w2 - m, -h2, 0,
            w2, -h2, 0,
            -w2, -h2 + m, 0,
            -w2 + m, -h2 + m, 0,
            w2 - m, -h2 + m, 0,
            w2, -h2 + m, 0,
            -w2, h2 - m, 0,
            -w2 + m, h2 - m, 0,
            w2 - m, h2 - m, 0,
            w2, h2 - m, 0,
            -w2, h2, 0,
            -w2 + m, h2, 0,
            w2 - m, h2, 0,
            w2, h2, 0
        ];
        let normals = [
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1
        ];
        let indices = [];
        let i0 = props.cutLeft ? 1 : 0;
        let j0 = props.cutBottom ? 1 : 0;
        let im = props.cutRight ? 2 : 3;
        let jm = props.cutTop ? 2 : 3;
        for (let j = j0; j < jm; j++) {
            for (let i = i0; i < im; i++) {
                let n = i + j * 4;
                indices.push(n, n + 1, n + 1 + 4);
                indices.push(n, n + 1 + 4, n + 4);
            }
        }
        let slice9uvs = [
            0, 0,
            1 / 3, 0,
            2 / 3, 0,
            1, 0,
            0, 1 / 3,
            1 / 3, 1 / 3,
            2 / 3, 1 / 3,
            1, 1 / 3,
            0, 2 / 3,
            1 / 3, 2 / 3,
            2 / 3, 2 / 3,
            1, 2 / 3,
            0, 1,
            1 / 3, 1,
            2 / 3, 1,
            1, 1
        ];
        data.positions = positions;
        data.normals = normals;
        data.indices = indices;
        if (props.color) {
            let colors = [];
            for (let i = 0; i < 16; i++) {
                colors.push(...props.color.asArray());
            }
            data.colors = colors;
        }
        if (props.uv1InWorldSpace) {
            let s = props.uv1Size;
            if (isNaN(s)) {
                s = 1;
            }
            let uvs = [];
            for (let i = 0; i < positions.length / 3; i++) {
                uvs[2 * i] = positions[3 * i] * s;
                uvs[2 * i + 1] = positions[3 * i + 1] * s;
            }
            data.uvs = uvs;
            data.uvs2 = slice9uvs;
        }
        else {
            data.uvs = slice9uvs;
        }
        return data;
    }
    Mummu.Create9SliceVertexData = Create9SliceVertexData;
    function Create9Slice(name, props, scene) {
        let mesh = new BABYLON.Mesh(name, scene);
        Create9SliceVertexData(props).applyToMesh(mesh);
        return mesh;
    }
    Mummu.Create9Slice = Create9Slice;
    function CreateExtrudeShapeVertexData(data) {
        let tmp = BABYLON.MeshBuilder.ExtrudeShape("tmp", data);
        let vertexData = BABYLON.VertexData.ExtractFromMesh(tmp);
        tmp.dispose();
        return vertexData;
    }
    Mummu.CreateExtrudeShapeVertexData = CreateExtrudeShapeVertexData;
    function CreateCylinderSliceVertexData(props) {
        if (isNaN(props.tesselation)) {
            props.tesselation = 16;
        }
        if (isNaN(props.radius)) {
            props.radius = 1;
        }
        if (isNaN(props.yMin)) {
            props.yMin = 0;
        }
        if (isNaN(props.yMax)) {
            props.yMax = 1;
        }
        if (isNaN(props.sideOrientation)) {
            props.sideOrientation = BABYLON.Mesh.FRONTSIDE;
        }
        if (isNaN(props.uvSize)) {
            props.uvSize = 1;
        }
        let data = new BABYLON.VertexData();
        let positions = [];
        let normals = [];
        let indices = [];
        let uvs = [];
        if (props.sideOrientation === BABYLON.Mesh.FRONTSIDE || props.sideOrientation === BABYLON.Mesh.DOUBLESIDE) {
            for (let i = 0; i <= props.tesselation; i++) {
                let f = i / props.tesselation;
                let a = props.alphaMin * (1 - f) + props.alphaMax * f;
                let cosa = Math.cos(a);
                let sina = Math.sin(a);
                let x = cosa * props.radius;
                let z = sina * props.radius;
                let l = positions.length / 3;
                positions.push(x, props.yMin, z);
                positions.push(x, props.yMax, z);
                normals.push(cosa, 0, sina);
                normals.push(cosa, 0, sina);
                if (i < props.tesselation) {
                    indices.push(l, l + 2, l + 3);
                    indices.push(l, l + 3, l + 1);
                }
                if (props.uvInWorldSpace) {
                    let p = (props.alphaMax - props.alphaMin) * props.radius;
                    uvs.push((f * p) / props.uvSize, 0);
                    uvs.push((f * p) / props.uvSize, (props.yMax - props.yMin) / props.uvSize);
                }
                else {
                    uvs.push(f, 0);
                    uvs.push(f, 1);
                }
            }
        }
        if (props.sideOrientation === BABYLON.Mesh.BACKSIDE || props.sideOrientation === BABYLON.Mesh.DOUBLESIDE) {
            for (let i = 0; i <= props.tesselation; i++) {
                let f = i / props.tesselation;
                let a = props.alphaMin * (1 - f) + props.alphaMax * f;
                let cosa = Math.cos(a);
                let sina = Math.sin(a);
                let x = cosa * props.radius;
                let z = sina * props.radius;
                let l = positions.length / 3;
                positions.push(x, props.yMin, z);
                positions.push(x, props.yMax, z);
                normals.push(-cosa, 0, -sina);
                normals.push(-cosa, 0, -sina);
                if (i < props.tesselation) {
                    indices.push(l, l + 3, l + 2);
                    indices.push(l, l + 1, l + 3);
                }
                if (props.uvInWorldSpace) {
                    let p = (props.alphaMax - props.alphaMin) * props.radius;
                    uvs.push(((1 - f) * p) / props.uvSize, 0);
                    uvs.push(((1 - f) * p) / props.uvSize, (props.yMax - props.yMin) / props.uvSize);
                }
                else {
                    uvs.push((1 - f), 0);
                    uvs.push((1 - f), 1);
                }
            }
        }
        data.positions = positions;
        data.uvs = uvs;
        data.indices = indices;
        data.normals = normals;
        return data;
    }
    Mummu.CreateCylinderSliceVertexData = CreateCylinderSliceVertexData;
    function CreateCylinderSlice(name, props, scene) {
        let mesh = new BABYLON.Mesh(name, scene);
        CreateCylinderSliceVertexData(props).applyToMesh(mesh);
        return mesh;
    }
    Mummu.CreateCylinderSlice = CreateCylinderSlice;
    function CreateDiscSliceVertexData(props) {
        if (isNaN(props.tesselation)) {
            props.tesselation = 16;
        }
        if (isNaN(props.innerRadius)) {
            props.innerRadius = 1;
        }
        if (isNaN(props.outterRadius)) {
            props.outterRadius = 1;
        }
        if (isNaN(props.y)) {
            props.y = 0;
        }
        if (isNaN(props.sideOrientation)) {
            props.sideOrientation = BABYLON.Mesh.FRONTSIDE;
        }
        if (isNaN(props.uvSize)) {
            props.uvSize = 1;
        }
        if (isNaN(props.alphaMin)) {
            props.alphaMin = 0;
        }
        if (isNaN(props.alphaMax)) {
            props.alphaMax = 2 * Math.PI;
        }
        let data = new BABYLON.VertexData();
        let positions = [];
        let normals = [];
        let indices = [];
        let uvs = [];
        if (props.sideOrientation === BABYLON.Mesh.FRONTSIDE || props.sideOrientation === BABYLON.Mesh.DOUBLESIDE) {
            for (let i = 0; i <= props.tesselation; i++) {
                let f = i / props.tesselation;
                let a = props.alphaMin * (1 - f) + props.alphaMax * f;
                let cosa = Math.cos(a);
                let sina = Math.sin(a);
                let xInner = cosa * props.innerRadius;
                let zInner = sina * props.innerRadius;
                let xOutter = cosa * props.outterRadius;
                let zOutter = sina * props.outterRadius;
                let l = positions.length / 3;
                positions.push(xInner, props.y, zInner);
                positions.push(xOutter, props.y, zOutter);
                normals.push(0, 1, 0);
                normals.push(0, 1, 0);
                if (i < props.tesselation) {
                    indices.push(l, l + 1, l + 3);
                    indices.push(l, l + 3, l + 2);
                }
                if (props.uvInWorldSpace) {
                    uvs.push(xInner / props.uvSize, zInner / props.uvSize);
                    uvs.push(xOutter / props.uvSize, zOutter / props.uvSize);
                }
                else {
                    uvs.push(f, 1);
                    uvs.push(f, 0);
                }
            }
        }
        if (props.sideOrientation === BABYLON.Mesh.BACKSIDE || props.sideOrientation === BABYLON.Mesh.DOUBLESIDE) {
            for (let i = 0; i <= props.tesselation; i++) {
                let f = i / props.tesselation;
                let a = props.alphaMin * (1 - f) + props.alphaMax * f;
                let cosa = Math.cos(a);
                let sina = Math.sin(a);
                let xInner = cosa * props.innerRadius;
                let zInner = sina * props.innerRadius;
                let xOutter = cosa * props.outterRadius;
                let zOutter = sina * props.outterRadius;
                let l = positions.length / 3;
                positions.push(xInner, props.y, zInner);
                positions.push(xOutter, props.y, zOutter);
                normals.push(0, -1, 0);
                normals.push(0, -1, 0);
                if (i < props.tesselation) {
                    indices.push(l, l + 2, l + 3);
                    indices.push(l, l + 3, l + 1);
                }
                if (props.uvInWorldSpace) {
                    uvs.push(xInner / props.uvSize, zInner / props.uvSize);
                    uvs.push(xOutter / props.uvSize, zOutter / props.uvSize);
                }
                else {
                    uvs.push(f, 0);
                    uvs.push(f, 1);
                }
            }
        }
        data.positions = positions;
        data.uvs = uvs;
        data.indices = indices;
        data.normals = normals;
        return data;
    }
    Mummu.CreateDiscSliceVertexData = CreateDiscSliceVertexData;
    function CreateDiscSlice(name, props, scene) {
        let mesh = new BABYLON.Mesh(name, scene);
        CreateDiscSliceVertexData(props).applyToMesh(mesh);
        return mesh;
    }
    Mummu.CreateDiscSlice = CreateDiscSlice;
    function CreateDiscVertexData(props) {
        if (isNaN(props.tesselation)) {
            props.tesselation = 16;
        }
        if (isNaN(props.radius)) {
            props.radius = 1;
        }
        if (isNaN(props.y)) {
            props.y = 0;
        }
        if (isNaN(props.sideOrientation)) {
            props.sideOrientation = BABYLON.Mesh.FRONTSIDE;
        }
        if (isNaN(props.uvSize)) {
            props.uvSize = 1;
        }
        if (isNaN(props.alphaMin)) {
            props.alphaMin = 0;
        }
        if (isNaN(props.alphaMax)) {
            props.alphaMax = 2 * Math.PI;
        }
        let data = new BABYLON.VertexData();
        let positions = [];
        let normals = [];
        let indices = [];
        let uvs = [];
        if (props.sideOrientation === BABYLON.Mesh.FRONTSIDE || props.sideOrientation === BABYLON.Mesh.DOUBLESIDE) {
            let centerIndex = positions.length / 3;
            positions.push(0, props.y, 0);
            normals.push(0, 1, 0);
            uvs.push(0, 0);
            for (let i = 0; i <= props.tesselation; i++) {
                let f = i / props.tesselation;
                let a = props.alphaMin * (1 - f) + props.alphaMax * f;
                let cosa = Math.cos(a);
                let sina = Math.sin(a);
                let x = cosa * props.radius;
                let z = sina * props.radius;
                let l = positions.length / 3;
                positions.push(x, props.y, z);
                normals.push(0, 1, 0);
                if (i < props.tesselation) {
                    indices.push(centerIndex, l, l + 1);
                }
                if (props.uvInWorldSpace) {
                    uvs.push(x / props.uvSize, z / props.uvSize);
                }
                else {
                    uvs.push(x, z);
                }
            }
        }
        if (props.sideOrientation === BABYLON.Mesh.BACKSIDE || props.sideOrientation === BABYLON.Mesh.DOUBLESIDE) {
            let centerIndex = positions.length / 3;
            positions.push(0, props.y, 0);
            normals.push(0, -1, 0);
            uvs.push(0, 0);
            for (let i = 0; i <= props.tesselation; i++) {
                let f = i / props.tesselation;
                let a = props.alphaMin * (1 - f) + props.alphaMax * f;
                let cosa = Math.cos(a);
                let sina = Math.sin(a);
                let x = cosa * props.radius;
                let z = sina * props.radius;
                let l = positions.length / 3;
                positions.push(x, props.y, z);
                normals.push(0, -1, 0);
                if (i < props.tesselation) {
                    indices.push(centerIndex, l + 1, l);
                }
                if (props.uvInWorldSpace) {
                    uvs.push(x / props.uvSize, z / props.uvSize);
                }
                else {
                    uvs.push(x, z);
                }
            }
        }
        data.positions = positions;
        data.uvs = uvs;
        data.indices = indices;
        data.normals = normals;
        return data;
    }
    Mummu.CreateDiscVertexData = CreateDiscVertexData;
    function CreateDisc(name, props, scene) {
        let mesh = new BABYLON.Mesh(name, scene);
        CreateDiscVertexData(props).applyToMesh(mesh);
        return mesh;
    }
    Mummu.CreateDisc = CreateDisc;
    function CreateDiscLine(name, props, scene) {
        if (isNaN(props.tesselation)) {
            props.tesselation = 16;
        }
        if (isNaN(props.radius)) {
            props.radius = 1;
        }
        if (isNaN(props.y)) {
            props.y = 0;
        }
        if (isNaN(props.alphaMin)) {
            props.alphaMin = 0;
        }
        if (isNaN(props.alphaMax)) {
            props.alphaMax = 2 * Math.PI;
        }
        let points = [];
        let colors;
        if (props.colors instanceof BABYLON.Color4) {
            colors = [];
        }
        for (let i = 0; i <= props.tesselation; i++) {
            let f = i / props.tesselation;
            let a = props.alphaMin * (1 - f) + props.alphaMax * f;
            let cosa = Math.cos(a);
            let sina = Math.sin(a);
            let x = cosa * props.radius;
            let z = sina * props.radius;
            points.push(new BABYLON.Vector3(x, 0, z));
            if (props.colors instanceof BABYLON.Color4) {
                colors.push(props.colors);
            }
        }
        return BABYLON.MeshBuilder.CreateLines(name, {
            points: points,
            colors: colors
        }, scene);
    }
    Mummu.CreateDiscLine = CreateDiscLine;
    function CreateLineBox(name, props, scene) {
        let w = isFinite(props.width) ? props.width : props.size;
        let h = isFinite(props.height) ? props.height : props.size;
        let d = isFinite(props.depth) ? props.depth : props.size;
        let w05 = w * 0.5;
        let h05 = h * 0.5;
        let d05 = d * 0.5;
        let p000 = new BABYLON.Vector3(-w05, -h05, -d05);
        let p100 = new BABYLON.Vector3(w05, -h05, -d05);
        let p101 = new BABYLON.Vector3(w05, -h05, d05);
        let p001 = new BABYLON.Vector3(-w05, -h05, d05);
        let p010 = new BABYLON.Vector3(-w05, h05, -d05);
        let p110 = new BABYLON.Vector3(w05, h05, -d05);
        let p111 = new BABYLON.Vector3(w05, h05, d05);
        let p011 = new BABYLON.Vector3(-w05, h05, d05);
        let lines = [
            [p000.clone(), p100.clone(), p101.clone(), p001.clone(), p000.clone()],
            [p000.clone(), p010.clone()],
            [p100.clone(), p110.clone()],
            [p101.clone(), p111.clone()],
            [p001.clone(), p011.clone()],
            [p010.clone(), p110.clone(), p111.clone(), p011.clone(), p010.clone()],
        ];
        let colors;
        if (props.color) {
            colors = [
                [props.color, props.color, props.color, props.color, props.color],
                [props.color, props.color],
                [props.color, props.color],
                [props.color, props.color],
                [props.color, props.color],
                [props.color, props.color, props.color, props.color, props.color],
            ];
        }
        if (props.grid) {
            let cW = Math.round(w / props.grid);
            let cH = Math.round(h / props.grid);
            let cD = Math.round(d / props.grid);
            for (let i = 1; i < cW; i++) {
                lines.push([
                    new BABYLON.Vector3(-w05 + i * props.grid, -h05, -d05),
                    new BABYLON.Vector3(-w05 + i * props.grid, -h05, d05),
                    new BABYLON.Vector3(-w05 + i * props.grid, h05, d05),
                    new BABYLON.Vector3(-w05 + i * props.grid, h05, -d05),
                    new BABYLON.Vector3(-w05 + i * props.grid, -h05, -d05)
                ]);
                if (props.color) {
                    colors.push([props.color, props.color, props.color, props.color, props.color]);
                }
            }
            for (let i = 1; i < cH; i++) {
                lines.push([
                    new BABYLON.Vector3(-w05, -h05 + i * props.grid, -d05),
                    new BABYLON.Vector3(-w05, -h05 + i * props.grid, d05),
                    new BABYLON.Vector3(w05, -h05 + i * props.grid, d05),
                    new BABYLON.Vector3(w05, -h05 + i * props.grid, -d05),
                    new BABYLON.Vector3(-w05, -h05 + i * props.grid, -d05)
                ]);
                if (props.color) {
                    colors.push([props.color, props.color, props.color, props.color, props.color]);
                }
            }
            for (let i = 1; i < cD; i++) {
                lines.push([
                    new BABYLON.Vector3(-w05, -h05, -d05 + i * props.grid),
                    new BABYLON.Vector3(-w05, h05, -d05 + i * props.grid),
                    new BABYLON.Vector3(w05, h05, -d05 + i * props.grid),
                    new BABYLON.Vector3(w05, -h05, -d05 + i * props.grid),
                    new BABYLON.Vector3(-w05, -h05, -d05 + i * props.grid)
                ]);
                if (props.color) {
                    colors.push([props.color, props.color, props.color, props.color, props.color]);
                }
            }
        }
        if (props.offset) {
            lines.forEach(line => {
                line.forEach(point => {
                    point.addInPlace(props.offset);
                });
            });
        }
        return BABYLON.MeshBuilder.CreateLineSystem(name, {
            lines: lines,
            colors: colors
        }, scene);
    }
    Mummu.CreateLineBox = CreateLineBox;
    function CreateBeveledBoxVertexData(props) {
        let w = isFinite(props.width) ? props.width : props.size;
        let h = isFinite(props.height) ? props.height : props.size;
        let d = isFinite(props.depth) ? props.depth : props.size;
        let data = new BABYLON.VertexData();
        let positions;
        let normals;
        let indices;
        let colors;
        if (props.flat) {
            positions = [
                0.25, -0.5, 0.25, -0.25, -0.5, -0.25, -0.25, -0.5, 0.25, -0.5, 0.25, -0.25, -0.5, -0.25, 0.25, -0.5, -0.25, -0.25, 0.25, 0.25, -0.5, -0.25, -0.25, -0.5, 0.25, -0.25, -0.5, -0.25, 0.5, 0.25, 0.25, 0.5, -0.25, 0.25, 0.5, 0.25, 0.5, 0.25, 0.25, 0.5, -0.25, -0.25, 0.5, -0.25, 0.25, 0.25, 0.25, 0.5, 0.25, 0.5, 0.25, 0.5, 0.25, 0.25, 0.25, -0.5, 0.25, 0.25, -0.25, 0.5, 0.5, -0.25, 0.25,
                0.5, 0.25, -0.25, 0.25, 0.5, -0.25, 0.25, 0.25, -0.5, 0.5, -0.25, -0.25, 0.25, -0.25, -0.5, 0.25, -0.5, -0.25, -0.25, 0.25, 0.5, -0.5, 0.25, 0.25, -0.25, 0.5, 0.25, -0.5, -0.25, 0.25, -0.25, -0.25, 0.5, -0.25, -0.5, 0.25, -0.5, 0.25, -0.25, -0.25, 0.25, -0.5, -0.25, 0.5, -0.25, -0.25, -0.5, -0.25, -0.25, -0.25, -0.5, -0.5, -0.25, -0.25, -0.25, -0.5, -0.25, -0.5, -0.25, 0.25, -0.25,
                -0.5, 0.25, -0.25, -0.5, 0.25, 0.25, -0.25, 0.5, 0.25, -0.5, 0.25, 0.5, -0.25, 0.25, 0.25, 0.25, 0.5, 0.5, 0.25, 0.25, -0.25, 0.25, -0.5, -0.5, -0.25, -0.25, -0.25, -0.25, -0.5, 0.25, -0.25, -0.5, 0.5, 0.25, -0.25, 0.25, 0.25, -0.5, -0.25, -0.25, 0.5, -0.5, 0.25, 0.25, -0.25, 0.25, 0.5, -0.25, 0.5, -0.25, 0.25, 0.25, -0.5, 0.25, 0.5, -0.25, 0.25, 0.5, -0.25, 0.5, 0.25, 0.25, 0.25,
                0.5, 0.25, 0.25, -0.5, -0.25, -0.25, -0.25, -0.5, -0.25, -0.5, -0.25, -0.25, 0.5, 0.25, -0.5, 0.25, -0.25, -0.25, 0.5, -0.25, 0.25, 0.5, 0.25, -0.25, 0.25, 0.5, -0.25, 0.5, 0.25, 0.25, -0.5, 0.25, 0.5, -0.25, -0.25, 0.25, -0.5, -0.25, -0.25, 0.25, 0.5, 0.25, -0.25, 0.5, -0.25, -0.25, 0.5, 0.25, -0.5, -0.25, -0.5, 0.25, 0.25, -0.25, 0.25, -0.5, -0.25, 0.5, -0.25, 0.5, 0.25, -0.25,
                -0.25, -0.5, -0.25, -0.5, -0.25, -0.25, -0.5, -0.25, 0.25, -0.25, -0.5, 0.25, -0.25, -0.25, 0.5, 0.25, -0.25, 0.5, 0.5, -0.25, 0.25, 0.25, -0.25, 0.5, 0.25, 0.25, 0.5, -0.25, 0.25, -0.5, -0.5, 0.25, -0.25, -0.5, -0.25, -0.25, 0.25, -0.25, -0.5, 0.5, -0.25, -0.25, 0.5, 0.25, -0.25, -0.25, -0.25, 0.5, -0.5, -0.25, 0.25, -0.5, 0.25, 0.25, -0.25, 0.5, -0.25, -0.25, 0.25, -0.5, 0.25,
                0.25, -0.5, 0.25, 0.5, -0.25, 0.5, 0.25, -0.25, 0.5, 0.25, 0.25, 0.25, -0.5, -0.25, 0.25, -0.25, -0.5, -0.25, -0.25, -0.5, -0.25, 0.5, 0.25, -0.5, 0.25, 0.25, -0.5, 0.25, -0.25, 0.25, 0.5, 0.25, 0.25, 0.25, 0.5, -0.25, 0.25, 0.5, 0.25, -0.5, 0.25, 0.5, -0.25, 0.25, 0.5, -0.25, -0.25, -0.25, 0.25, 0.5, 0.25, 0.25, 0.5, 0.25, -0.25, 0.5,
            ];
            normals = [
                0, -1, 0, 0, -1, 0, 0, -1, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0.577, 0.577, 0.577, 0.577, 0.577, 0.577, 0.577, 0.577, 0.577, 0.577, -0.577, 0.577, 0.577, -0.577, 0.577, 0.577, -0.577, 0.577, 0.577, 0.577, -0.577, 0.577, 0.577, -0.577, 0.577, 0.577, -0.577, 0.577, -0.577, -0.577, 0.577, -0.577, -0.577,
                0.577, -0.577, -0.577, -0.577, 0.577, 0.577, -0.577, 0.577, 0.577, -0.577, 0.577, 0.577, -0.577, -0.577, 0.577, -0.577, -0.577, 0.577, -0.577, -0.577, 0.577, -0.577, 0.577, -0.577, -0.577, 0.577, -0.577, -0.577, 0.577, -0.577, -0.577, -0.577, -0.577, -0.577, -0.577, -0.577, -0.577, -0.577, -0.577, -0.707, -0.707, 0, -0.707, -0.707, 0, -0.707, -0.707, 0, 0, -0.707, 0.707, 0, -0.707,
                0.707, 0, -0.707, 0.707, 0.707, 0, 0.707, 0.707, 0, 0.707, 0.707, 0, 0.707, -0.707, 0, -0.707, -0.707, 0, -0.707, -0.707, 0, -0.707, 0.707, 0, -0.707, 0.707, 0, -0.707, 0.707, 0, -0.707, -0.707, 0, 0.707, -0.707, 0, 0.707, -0.707, 0, 0.707, 0, 0.707, -0.707, 0, 0.707, -0.707, 0, 0.707, -0.707, 0.707, 0.707, 0, 0.707, 0.707, 0, 0.707, 0.707, 0, 0, -0.707, -0.707, 0, -0.707, -0.707,
                0, -0.707, -0.707, -0.707, 0.707, 0, -0.707, 0.707, 0, -0.707, 0.707, 0, 0, 0.707, 0.707, 0, 0.707, 0.707, 0, 0.707, 0.707, 0.707, -0.707, 0, 0.707, -0.707, 0, 0.707, -0.707, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, -1, 0, -1, 0, 0, 0, 0, -1, 0, 1, 0, 1, 0, 0, -0.707, -0.707, 0, -0.707, -0.707, 0, -0.707, -0.707, 0, 0, -0.707, 0.707, 0, -0.707, 0.707, 0, -0.707, 0.707, 0.707, 0, 0.707,
                0.707, 0, 0.707, 0.707, 0, 0.707, -0.707, 0, -0.707, -0.707, 0, -0.707, -0.707, 0, -0.707, 0.707, 0, -0.707, 0.707, 0, -0.707, 0.707, 0, -0.707, -0.707, 0, 0.707, -0.707, 0, 0.707, -0.707, 0, 0.707, 0, 0.707, -0.707, 0, 0.707, -0.707, 0, 0.707, -0.707, 0.707, 0.707, 0, 0.707, 0.707, 0, 0.707, 0.707, 0, 0, -0.707, -0.707, 0, -0.707, -0.707, 0, -0.707, -0.707, -0.707, 0.707, 0,
                -0.707, 0.707, 0, -0.707, 0.707, 0, 0, 0.707, 0.707, 0, 0.707, 0.707, 0, 0.707, 0.707, 0.707, -0.707, 0, 0.707, -0.707, 0, 0.707, -0.707, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1,
            ];
            indices = [
                0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 0, 78, 1, 3, 79, 4, 6, 80, 7, 9, 81, 10, 12, 82, 13, 83, 84, 85, 86, 87, 88, 89,
                90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121,
            ];
        }
        else {
            positions = [
                0.25, -0.5, 0.25, -0.25, -0.5, -0.25, -0.25, -0.5, 0.25, -0.5, 0.25, -0.25, -0.5, -0.25, 0.25, -0.5, -0.25, -0.25, 0.25, 0.25, -0.5, -0.25, -0.25, -0.5, 0.25, -0.25, -0.5, -0.25, 0.5, 0.25, 0.25, 0.5, -0.25, 0.25, 0.5, 0.25, 0.5, 0.25, 0.25, 0.5, -0.25, -0.25, 0.5, -0.25, 0.25, 0.25, 0.25, 0.5, 0.25, 0.5, 0.25, 0.5, 0.25, 0.25, 0.25, -0.25, 0.5, 0.5, -0.25, 0.25, 0.5, 0.25, -0.25,
                0.25, 0.5, -0.25, 0.25, 0.25, -0.5, 0.5, -0.25, -0.25, 0.25, -0.25, -0.5, 0.25, -0.5, -0.25, -0.25, 0.25, 0.5, -0.5, 0.25, 0.25, -0.25, 0.5, 0.25, -0.25, -0.25, 0.5, -0.25, -0.5, 0.25, -0.25, 0.25, -0.5, -0.25, 0.5, -0.25, -0.25, -0.25, -0.5, -0.5, -0.25, -0.25, -0.5, -0.25, 0.25, -0.25, -0.25, -0.5, -0.25, -0.25, 0.5, -0.5, 0.25, 0.25, -0.25, 0.25, 0.5, -0.25, 0.5, -0.25, 0.25,
                0.5, -0.25, 0.25, -0.5, -0.25, -0.25, -0.25, -0.5, -0.25, 0.5, 0.25, 0.25, 0.5, 0.25, -0.25, 0.25, 0.5, -0.25, 0.5, 0.25, 0.25, -0.5, -0.25, -0.25, 0.25, 0.5, 0.25, -0.25, 0.5, -0.25, -0.25, 0.5, 0.25, -0.5, -0.25, -0.5, 0.25, 0.25, -0.25, 0.25, -0.5, -0.25, 0.5, -0.25, -0.5, -0.25, -0.25, -0.5, -0.25, 0.25, -0.25, -0.25, 0.5, 0.25, -0.25, 0.5, -0.25, -0.25, 0.5, -0.5, 0.25, 0.25,
                -0.25, 0.5, -0.25, -0.25, 0.25, -0.5, 0.25, -0.5, -0.25, 0.25, -0.25, -0.5, -0.25, -0.25, -0.5, -0.25, 0.5, 0.25, -0.5, 0.25, 0.25, 0.25, 0.5, 0.25, -0.25, 0.25, 0.5, -0.25, 0.25, 0.5, 0.25, -0.25, 0.5,
            ];
            normals = [
                0.342, -0.876, 0.342, -0.342, -0.876, -0.342, -0.342, -0.876, 0.342, -0.876, 0.342, -0.342, -0.876, -0.342, 0.342, -0.876, -0.342, -0.342, 0.342, 0.342, -0.876, -0.342, -0.342, -0.876, 0.342, -0.342, -0.876, -0.342, 0.876, 0.342, 0.342, 0.876, -0.342, 0.342, 0.876, 0.342, 0.876, 0.342, 0.342, 0.876, -0.342, -0.342, 0.876, -0.342, 0.342, 0.342, 0.342, 0.876, 0.342, 0.876, 0.342,
                0.876, 0.342, 0.342, 0.342, -0.342, 0.876, 0.876, -0.342, 0.342, 0.876, 0.342, -0.342, 0.342, 0.876, -0.342, 0.342, 0.342, -0.876, 0.876, -0.342, -0.342, 0.342, -0.342, -0.876, 0.342, -0.876, -0.342, -0.342, 0.342, 0.876, -0.876, 0.342, 0.342, -0.342, 0.876, 0.342, -0.342, -0.342, 0.876, -0.342, -0.876, 0.342, -0.342, 0.342, -0.876, -0.342, 0.876, -0.342, -0.342, -0.342, -0.876,
                -0.876, -0.342, -0.342, -0.876, -0.342, 0.342, -0.342, -0.342, -0.876, -0.342, -0.342, 0.876, -0.876, 0.342, 0.342, -0.342, 0.342, 0.876, -0.342, 0.876, -0.342, 0.342, 0.876, -0.342, 0.342, -0.876, -0.342, -0.342, -0.342, -0.876, -0.342, 0.876, 0.342, 0.342, 0.876, 0.342, -0.342, 0.342, 0.876, -0.342, 0.876, 0.342, 0.342, -0.876, -0.342, -0.342, 0.342, 0.876, 0.342, -0.342, 0.876,
                -0.342, -0.342, 0.876, 0.342, -0.876, -0.342, -0.876, 0.342, 0.342, -0.342, 0.342, -0.876, -0.342, 0.876, -0.342, -0.876, -0.342, -0.342, -0.876, -0.342, 0.342, -0.342, -0.342, 0.876, 0.342, -0.342, 0.876, -0.342, -0.342, 0.876, -0.876, 0.342, 0.342, -0.342, 0.876, -0.342, -0.342, 0.342, -0.876, 0.342, -0.876, -0.342, 0.342, -0.342, -0.876, -0.342, -0.342, -0.876, -0.342, 0.876,
                0.342, -0.876, 0.342, 0.342, 0.342, 0.876, 0.342, -0.342, 0.342, 0.876, -0.342, 0.342, 0.876, 0.342, -0.342, 0.876,
            ];
            indices = [
                0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 0, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 4, 29, 30, 3, 31, 32, 1, 33, 34, 1, 35, 2, 2, 18, 0, 14, 15, 12, 31, 5, 36, 8, 20, 6, 37, 38, 39, 40, 6, 41, 10, 12, 11, 42, 43, 1, 44, 3, 32, 45, 46, 47, 0, 13, 48, 49, 50, 51, 0, 52, 1, 3, 53, 4, 6, 54, 7, 9, 55, 10, 12, 20, 13, 1, 56, 57, 2, 58, 18, 14, 59, 15, 31, 3, 5,
                8, 13, 20, 60, 4, 61, 62, 63, 6, 10, 20, 12, 64, 65, 66, 67, 68, 3, 69, 15, 70, 0, 14, 13, 71, 15, 72,
            ];
        }
        let l = positions.length / 3;
        for (let i = 0; i < l; i++) {
            let x = positions[3 * i];
            let y = positions[3 * i + 1];
            let z = positions[3 * i + 2];
            if (x > 0) {
                x += 0.5 * w - 0.5;
            }
            else {
                x -= 0.5 * w - 0.5;
            }
            if (y > 0) {
                y += 0.5 * h - 0.5;
            }
            else {
                y -= 0.5 * h - 0.5;
            }
            if (z > 0) {
                z += 0.5 * d - 0.5;
            }
            else {
                z -= 0.5 * d - 0.5;
            }
            positions[3 * i] = x;
            positions[3 * i + 1] = y;
            positions[3 * i + 2] = z;
        }
        if (props.color) {
            colors = [];
            for (let i = 0; i < l; i++) {
                colors.push(props.color.r, props.color.g, props.color.b, props.color.a);
            }
        }
        data.positions = positions;
        data.normals = normals;
        data.indices = indices;
        if (colors) {
            data.colors = colors;
        }
        return data;
    }
    Mummu.CreateBeveledBoxVertexData = CreateBeveledBoxVertexData;
    function CreateBeveledBox(name, props, scene) {
        let mesh = new BABYLON.Mesh(name, scene);
        CreateBeveledBoxVertexData(props).applyToMesh(mesh);
        return mesh;
    }
    Mummu.CreateBeveledBox = CreateBeveledBox;
    function CreateSphereCutData(props) {
        let data = new BABYLON.VertexData();
        let positions = [];
        let normals = [];
        let uvs = [];
        let indices = [];
        let dir = props.dir;
        let up = props.up ? props.up : BABYLON.Axis.Y;
        if (!isFinite(props.angularQuadLength)) {
            props.angularQuadLength = Math.PI / 12;
        }
        let right = BABYLON.Vector3.Cross(up, dir).normalize();
        up = BABYLON.Vector3.Cross(dir, right).normalize();
        let alphaL = isFinite(props.alpha) ? props.alpha : props.alphaMax - props.alphaMin;
        let alphaMin = isFinite(props.alpha) ? -props.alpha * 0.5 : props.alphaMin;
        let betaL = isFinite(props.beta) ? props.beta : props.betaMax - props.betaMin;
        let betaMin = isFinite(props.beta) ? -props.beta * 0.5 : props.betaMin;
        let cAlpha = Math.round(alphaL / props.angularQuadLength);
        let cBeta = Math.round(betaL / props.angularQuadLength);
        // Large face
        for (let j = 0; j <= cBeta; j++) {
            for (let i = 0; i <= cAlpha; i++) {
                let a = (i / cAlpha) * alphaL + alphaMin;
                let b = (j / cBeta) * betaL + betaMin;
                let p = Mummu.Rotate(dir, right, b);
                Mummu.RotateInPlace(p, up, a);
                let n = positions.length / 3;
                positions.push(p.x * props.rMax, p.y * props.rMax, p.z * props.rMax);
                uvs.push(1 - i / cAlpha, 1 - j / cBeta);
                if (i < cAlpha && j < cBeta) {
                    if (isNaN(props.sideOrientation) || props.sideOrientation === 0 || props.sideOrientation === 2) {
                        indices.push(n, n + 1, n + 1 + (cAlpha + 1));
                        indices.push(n, n + 1 + (cAlpha + 1), n + (cAlpha + 1));
                    }
                    if (props.sideOrientation === 1 || props.sideOrientation === 2) {
                        indices.push(n, n + 1 + (cAlpha + 1), n + 1);
                        indices.push(n, n + (cAlpha + 1), n + 1 + (cAlpha + 1));
                    }
                }
            }
        }
        // Small face
        for (let j = 0; j <= cBeta; j++) {
            for (let i = 0; i <= cAlpha; i++) {
                let a = (i / cAlpha) * alphaL + alphaMin;
                let b = (j / cBeta) * betaL + betaMin;
                let p = Mummu.Rotate(dir, right, b);
                Mummu.RotateInPlace(p, up, a);
                let n = positions.length / 3;
                positions.push(p.x * props.rMin, p.y * props.rMin, p.z * props.rMin);
                uvs.push(i / cAlpha, 1 - j / cBeta);
                if (i < cAlpha && j < cBeta) {
                    if (isNaN(props.sideOrientation) || props.sideOrientation === 0 || props.sideOrientation === 2) {
                        indices.push(n, n + 1 + (cAlpha + 1), n + 1);
                        indices.push(n, n + (cAlpha + 1), n + 1 + (cAlpha + 1));
                    }
                    if (props.sideOrientation === 1 || props.sideOrientation === 2) {
                        indices.push(n, n + 1, n + 1 + (cAlpha + 1));
                        indices.push(n, n + 1 + (cAlpha + 1), n + (cAlpha + 1));
                    }
                }
            }
        }
        // Left face
        for (let j = 0; j <= cBeta; j++) {
            let a = alphaMin;
            let b = (j / cBeta) * betaL + betaMin;
            let p = Mummu.Rotate(dir, right, b);
            Mummu.RotateInPlace(p, up, a);
            let n = positions.length / 3;
            positions.push(p.x * props.rMin, p.y * props.rMin, p.z * props.rMin);
            positions.push(p.x * props.rMax, p.y * props.rMax, p.z * props.rMax);
            uvs.push(1, 1 - j / cBeta);
            uvs.push(0, 1 - j / cBeta);
            if (j < cBeta) {
                if (isNaN(props.sideOrientation) || props.sideOrientation === 0 || props.sideOrientation === 2) {
                    indices.push(n, n + 1, n + 3);
                    indices.push(n, n + 3, n + 2);
                }
                if (props.sideOrientation === 1 || props.sideOrientation === 2) {
                    indices.push(n, n + 3, n + 1);
                    indices.push(n, n + 2, n + 3);
                }
            }
        }
        // Right face
        for (let j = 0; j <= cBeta; j++) {
            let a = alphaMin + alphaL;
            let b = (j / cBeta) * betaL + betaMin;
            let p = Mummu.Rotate(dir, right, b);
            Mummu.RotateInPlace(p, up, a);
            let n = positions.length / 3;
            positions.push(p.x * props.rMin, p.y * props.rMin, p.z * props.rMin);
            positions.push(p.x * props.rMax, p.y * props.rMax, p.z * props.rMax);
            uvs.push(0, 1 - j / cBeta);
            uvs.push(1, 1 - j / cBeta);
            if (j < cBeta) {
                if (isNaN(props.sideOrientation) || props.sideOrientation === 0 || props.sideOrientation === 2) {
                    indices.push(n, n + 3, n + 1);
                    indices.push(n, n + 2, n + 3);
                }
                if (props.sideOrientation === 1 || props.sideOrientation === 2) {
                    indices.push(n, n + 1, n + 3);
                    indices.push(n, n + 3, n + 2);
                }
            }
        }
        // Top face
        for (let i = 0; i <= cAlpha; i++) {
            let a = (i / cAlpha) * alphaL + alphaMin;
            let b = betaMin;
            let p = Mummu.Rotate(dir, right, b);
            Mummu.RotateInPlace(p, up, a);
            let n = positions.length / 3;
            positions.push(p.x * props.rMin, p.y * props.rMin, p.z * props.rMin);
            positions.push(p.x * props.rMax, p.y * props.rMax, p.z * props.rMax);
            uvs.push(i / cAlpha, 0);
            uvs.push(i / cAlpha, 1);
            if (i < cAlpha) {
                if (isNaN(props.sideOrientation) || props.sideOrientation === 0 || props.sideOrientation === 2) {
                    indices.push(n, n + 3, n + 1);
                    indices.push(n, n + 2, n + 3);
                }
                if (props.sideOrientation === 1 || props.sideOrientation === 2) {
                    indices.push(n, n + 1, n + 3);
                    indices.push(n, n + 3, n + 2);
                }
            }
        }
        // Bottom face
        for (let i = 0; i <= cAlpha; i++) {
            let a = (i / cAlpha) * alphaL + alphaMin;
            let b = betaL + betaMin;
            let p = Mummu.Rotate(dir, right, b);
            Mummu.RotateInPlace(p, up, a);
            let n = positions.length / 3;
            positions.push(p.x * props.rMin, p.y * props.rMin, p.z * props.rMin);
            positions.push(p.x * props.rMax, p.y * props.rMax, p.z * props.rMax);
            uvs.push(1 - i / cAlpha, 0);
            uvs.push(1 - i / cAlpha, 1);
            if (i < cAlpha) {
                if (isNaN(props.sideOrientation) || props.sideOrientation === 0 || props.sideOrientation === 2) {
                    indices.push(n, n + 1, n + 3);
                    indices.push(n, n + 3, n + 2);
                }
                if (props.sideOrientation === 1 || props.sideOrientation === 2) {
                    indices.push(n, n + 3, n + 1);
                    indices.push(n, n + 2, n + 3);
                }
            }
        }
        data.positions = positions;
        data.indices = indices;
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        data.normals = normals;
        data.uvs = uvs;
        if (props.color) {
            let colors = [];
            for (let i = 0; i < positions.length / 3; i++) {
                colors.push(...props.color.asArray());
            }
            data.colors = colors;
        }
        return data;
    }
    Mummu.CreateSphereCutData = CreateSphereCutData;
    function CreateSphereCut(name, props, scene) {
        let mesh = new BABYLON.Mesh(name, scene);
        CreateSphereCutData(props).applyToMesh(mesh);
        return mesh;
    }
    Mummu.CreateSphereCut = CreateSphereCut;
    function CreateWireVertexData(props) {
        let data = new BABYLON.VertexData();
        let positions = [];
        let normals = [];
        let indices = [];
        let uvs = [];
        let colors = [];
        if (isNaN(props.tesselation)) {
            props.tesselation = 12;
        }
        if (isNaN(props.textureRatio)) {
            props.textureRatio = 1;
        }
        let center = BABYLON.Vector3.Zero();
        let path = [...props.path];
        let ups;
        if (props.pathUps) {
            ups = [...props.pathUps];
        }
        let n = path.length;
        let directions = [];
        let perimeter = 2 * Math.PI * props.radius;
        if (props.closed) {
            if (BABYLON.Vector3.DistanceSquared(path[0], path[n - 1]) > 0) {
                path.push(path[0].clone());
                if (ups) {
                    ups.push(ups[0].clone());
                }
            }
        }
        n = path.length;
        if (props.closed) {
            let prev = path[n - 2];
            let next = path[1];
            directions[0] = next.subtract(prev).normalize();
        }
        else {
            let prev = path[0];
            let next = path[1];
            directions[0] = next.subtract(prev).normalize();
        }
        center.addInPlace(path[0]);
        for (let i = 1; i < path.length - 1; i++) {
            center.addInPlace(path[i]);
            let prev = path[i - 1];
            let next = path[i + 1];
            directions[i] = next.subtract(prev).normalize();
        }
        if (props.closed) {
            let prev = path[n - 2];
            let next = path[1];
            directions[n - 1] = next.subtract(prev).normalize();
        }
        else {
            let prev = path[n - 2];
            let next = path[n - 1];
            directions[n - 1] = next.subtract(prev).normalize();
        }
        center.addInPlace(path[n - 1]);
        center.scaleInPlace(1 / n);
        let cumulLength = 0;
        let t = props.tesselation;
        let angle = 2 * Math.PI / t;
        for (let i = 0; i < n; i++) {
            let p = path[i];
            if (i > 0) {
                cumulLength += BABYLON.Vector3.Distance(p, path[i - 1]);
            }
            let dir = directions[i];
            let rayon;
            if (ups) {
                rayon = ups[i].clone();
            }
            else {
                rayon = p.subtract(center);
            }
            let xDir = BABYLON.Vector3.Cross(dir, rayon);
            let r = props.radius;
            if (props.radiusFunc) {
                r = props.radiusFunc(i / (n - 1));
            }
            rayon = BABYLON.Vector3.Cross(xDir, dir).normalize().scaleInPlace(r);
            if (props.bissectFirstRayon) {
                Mummu.RotateInPlace(rayon, dir, -angle * 0.5);
            }
            let idx0 = positions.length / 3;
            positions.push(rayon.x + p.x, rayon.y + p.y, rayon.z + p.z);
            if (props.color) {
                colors.push(props.color.r, props.color.g, props.color.b, props.color.a);
            }
            let normal = rayon.clone().normalize();
            normals.push(normal.x, normal.y, normal.z);
            uvs.push(0, cumulLength / perimeter / props.textureRatio);
            if (i < n - 1) {
                indices.push(idx0, idx0 + (t + 1) + 1, idx0 + (t + 1));
                indices.push(idx0, idx0 + 1, idx0 + (t + 1) + 1);
            }
            for (let j = 1; j <= t; j++) {
                Mummu.RotateInPlace(rayon, dir, -angle);
                positions.push(rayon.x + p.x, rayon.y + p.y, rayon.z + p.z);
                if (props.color) {
                    colors.push(props.color.r, props.color.g, props.color.b, props.color.a);
                }
                let normal = rayon.clone().normalize();
                normals.push(normal.x, normal.y, normal.z);
                uvs.push(j / t, cumulLength / perimeter / props.textureRatio);
                if (i < n - 1) {
                    if (j < t) {
                        indices.push(idx0 + j, idx0 + j + (t + 1) + 1, idx0 + j + (t + 1));
                        indices.push(idx0 + j, idx0 + j + 1, idx0 + j + (t + 1) + 1);
                    }
                }
            }
        }
        if (props.cap === BABYLON.Mesh.CAP_START || props.cap === BABYLON.Mesh.CAP_ALL) {
            let cx = 0;
            let cy = 0;
            let cz = 0;
            let l = positions.length / 3;
            for (let i = 0; i <= t; i++) {
                let idx = 3 * i;
                let px = positions[idx];
                let py = positions[idx + 1];
                let pz = positions[idx + 2];
                cx += px;
                cy += py;
                cz += pz;
                if (i < t) {
                    indices.push(l, (i + 1) % t, i);
                }
            }
            cx /= (t + 1);
            cy /= (t + 1);
            cz /= (t + 1);
            positions.push(cx, cy, cz);
            let dir = path[0].subtract(path[1]).normalize();
            normals.push(dir.x, dir.y, dir.z);
            for (let i = 0; i <= t; i++) {
                let idx = 3 * i;
                let nx = normals[idx];
                let ny = normals[idx + 1];
                let nz = normals[idx + 2];
                nx += dir.x;
                ny += dir.y;
                nz += dir.z;
                let nL = Math.sqrt(nx * nx + ny * ny + nz * nz);
                normals[idx] = nx / nL;
                normals[idx + 1] = ny / nL;
                normals[idx + 2] = nz / nL;
            }
        }
        if (props.cap === BABYLON.Mesh.CAP_END || props.cap === BABYLON.Mesh.CAP_ALL) {
            let cx = 0;
            let cy = 0;
            let cz = 0;
            let l = positions.length / 3;
            for (let i = 0; i <= t; i++) {
                let idx = 3 * (n - 1) * (t + 1) + 3 * i;
                let px = positions[idx];
                let py = positions[idx + 1];
                let pz = positions[idx + 2];
                cx += px;
                cy += py;
                cz += pz;
                if (i < t) {
                    indices.push(l, (n - 1) * (t + 1) + i, (n - 1) * (t + 1) + (i + 1) % t);
                }
            }
            cx /= (t + 1);
            cy /= (t + 1);
            cz /= (t + 1);
            positions.push(cx, cy, cz);
            let dir = path[n - 1].subtract(path[n - 2]).normalize();
            normals.push(dir.x, dir.y, dir.z);
            for (let i = 0; i <= t; i++) {
                let idx = 3 * (n - 1) * (t + 1) + 3 * i;
                let nx = normals[idx];
                let ny = normals[idx + 1];
                let nz = normals[idx + 2];
                nx += dir.x;
                ny += dir.y;
                nz += dir.z;
                let nL = Math.sqrt(nx * nx + ny * ny + nz * nz);
                normals[idx] = nx / nL;
                normals[idx + 1] = ny / nL;
                normals[idx + 2] = nz / nL;
            }
        }
        data.positions = positions;
        data.indices = indices;
        data.normals = normals;
        data.uvs = uvs;
        if (props.color) {
            data.colors = colors;
        }
        return data;
    }
    Mummu.CreateWireVertexData = CreateWireVertexData;
    function CreateCubeSphereVertexData(diameter, color, alpha = 1) {
        let datas = new BABYLON.VertexData();
        let positions = [];
        let indices = [];
        let normals = [];
        let colors = [];
        let o = 0.005;
        let first = -Math.floor(diameter / 2);
        let last = Math.ceil(diameter / 2);
        let offset = diameter % 2 === 0 ? 0.5 : 0;
        let isInRange = (i, j, k) => {
            if (i >= first && i < last) {
                if (j >= first && j < last) {
                    if (k >= first && k < last) {
                        let r = Math.sqrt((i + offset) * (i + offset) + (j + offset) * (j + offset) + (k + offset) * (k + offset));
                        if (r <= Math.ceil(diameter / 2)) {
                            return true;
                        }
                        return false;
                    }
                }
            }
        };
        for (let i = first; i < last; i++) {
            for (let j = first; j < last; j++) {
                for (let k = first; k < last; k++) {
                    let b = isInRange(i, j, k);
                    if (b) {
                        let x0 = i - 0.5 + offset;
                        let x1 = i + 1 - 0.5 + offset;
                        let y0 = k - 0.5 + offset;
                        let y1 = k + 1 - 0.5 + offset;
                        let z0 = j - 0.5 + offset;
                        let z1 = j + 1 - 0.5 + offset;
                        let bIP = isInRange(i + 1, j, k);
                        if (!bIP) {
                            let l = positions.length / 3;
                            positions.push(x1 + o, y0 + o, z0 + o);
                            positions.push(x1 + o, y1 - o, z0 + o);
                            positions.push(x1 + o, y1 - o, z1 - o);
                            positions.push(x1 + o, y0 + o, z1 - o);
                            indices.push(l, l + 2, l + 1);
                            indices.push(l, l + 3, l + 2);
                            normals.push(1, 0, 0);
                            normals.push(1, 0, 0);
                            normals.push(1, 0, 0);
                            normals.push(1, 0, 0);
                            colors.push(color.r, color.g, color.b, alpha);
                            colors.push(color.r, color.g, color.b, alpha);
                            colors.push(color.r, color.g, color.b, alpha);
                            colors.push(color.r, color.g, color.b, alpha);
                        }
                        let bIM = isInRange(i - 1, j, k);
                        if (!bIM) {
                            let l = positions.length / 3;
                            positions.push(x0 - o, y0 + o, z1 + o);
                            positions.push(x0 - o, y1 - o, z1 + o);
                            positions.push(x0 - o, y1 - o, z0 - o);
                            positions.push(x0 - o, y0 + o, z0 - o);
                            indices.push(l, l + 2, l + 1);
                            indices.push(l, l + 3, l + 2);
                            normals.push(-1, 0, 0);
                            normals.push(-1, 0, 0);
                            normals.push(-1, 0, 0);
                            normals.push(-1, 0, 0);
                            colors.push(color.r, color.g, color.b, alpha);
                            colors.push(color.r, color.g, color.b, alpha);
                            colors.push(color.r, color.g, color.b, alpha);
                            colors.push(color.r, color.g, color.b, alpha);
                        }
                        let bKP = isInRange(i, j, k + 1);
                        if (!bKP) {
                            let l = positions.length / 3;
                            positions.push(x0 + o, y1 + o, z0 + o);
                            positions.push(x0 + o, y1 + o, z1 - o);
                            positions.push(x1 - o, y1 + o, z1 - o);
                            positions.push(x1 - o, y1 + o, z0 + o);
                            indices.push(l, l + 2, l + 1);
                            indices.push(l, l + 3, l + 2);
                            normals.push(0, 1, 0);
                            normals.push(0, 1, 0);
                            normals.push(0, 1, 0);
                            normals.push(0, 1, 0);
                            colors.push(color.r, color.g, color.b, alpha);
                            colors.push(color.r, color.g, color.b, alpha);
                            colors.push(color.r, color.g, color.b, alpha);
                            colors.push(color.r, color.g, color.b, alpha);
                        }
                        let bKM = isInRange(i, j, k - 1);
                        if (!bKM) {
                            let l = positions.length / 3;
                            positions.push(x0 + o, y0 - o, z1 - o);
                            positions.push(x0 + o, y0 - o, z0 + o);
                            positions.push(x1 - o, y0 - o, z0 + o);
                            positions.push(x1 - o, y0 - o, z1 - o);
                            indices.push(l, l + 2, l + 1);
                            indices.push(l, l + 3, l + 2);
                            normals.push(0, -1, 0);
                            normals.push(0, -1, 0);
                            normals.push(0, -1, 0);
                            normals.push(0, -1, 0);
                            colors.push(color.r, color.g, color.b, alpha);
                            colors.push(color.r, color.g, color.b, alpha);
                            colors.push(color.r, color.g, color.b, alpha);
                            colors.push(color.r, color.g, color.b, alpha);
                        }
                        let bJP = isInRange(i, j + 1, k);
                        if (!bJP) {
                            let l = positions.length / 3;
                            positions.push(x1 - o, y0 + o, z1 + o);
                            positions.push(x1 - o, y1 - o, z1 + o);
                            positions.push(x0 + o, y1 - o, z1 + o);
                            positions.push(x0 + o, y0 + o, z1 + o);
                            indices.push(l, l + 2, l + 1);
                            indices.push(l, l + 3, l + 2);
                            normals.push(0, 0, 1);
                            normals.push(0, 0, 1);
                            normals.push(0, 0, 1);
                            normals.push(0, 0, 1);
                            colors.push(color.r, color.g, color.b, alpha);
                            colors.push(color.r, color.g, color.b, alpha);
                            colors.push(color.r, color.g, color.b, alpha);
                            colors.push(color.r, color.g, color.b, alpha);
                        }
                        let bJM = isInRange(i, j - 1, k);
                        if (!bJM) {
                            let l = positions.length / 3;
                            positions.push(x0 - o, y0 + o, z0 - o);
                            positions.push(x0 - o, y1 - o, z0 - o);
                            positions.push(x1 + o, y1 - o, z0 - o);
                            positions.push(x1 + o, y0 + o, z0 - o);
                            indices.push(l, l + 2, l + 1);
                            indices.push(l, l + 3, l + 2);
                            normals.push(0, 0, -1);
                            normals.push(0, 0, -1);
                            normals.push(0, 0, -1);
                            normals.push(0, 0, -1);
                            colors.push(color.r, color.g, color.b, alpha);
                            colors.push(color.r, color.g, color.b, alpha);
                            colors.push(color.r, color.g, color.b, alpha);
                            colors.push(color.r, color.g, color.b, alpha);
                        }
                    }
                }
            }
        }
        datas.positions = positions;
        datas.indices = indices;
        datas.normals = normals;
        datas.colors = colors;
        return datas;
    }
    Mummu.CreateCubeSphereVertexData = CreateCubeSphereVertexData;
    function CreateCubeDiscVertexData(diameter, color, alpha = 1) {
        let datas = new BABYLON.VertexData();
        let positions = [];
        let indices = [];
        let normals = [];
        let colors = [];
        let o = 0.005;
        let first = -Math.floor(diameter / 2);
        let last = Math.ceil(diameter / 2);
        let offset = diameter % 2 === 0 ? 0 : 0.5;
        let isInRange = (i, j) => {
            if (i >= first && i < last) {
                if (j >= first && j < last) {
                    let r = Math.sqrt(i * i + j * j);
                    if (r < Math.floor(diameter / 2) + 0.3) {
                        return true;
                    }
                    return false;
                }
            }
        };
        if (diameter % 2 === 0) {
            isInRange = (i, j) => {
                if (i >= first && i < last) {
                    if (j >= first && j < last) {
                        let r = Math.sqrt((i + 0.5) * (i + 0.5) + (j + 0.5) * (j + 0.5));
                        if (r < Math.floor(diameter / 2) + 0.3) {
                            return true;
                        }
                        return false;
                    }
                }
            };
        }
        for (let i = first; i < last; i++) {
            for (let j = first; j < last; j++) {
                let b = isInRange(i, j);
                if (b) {
                    let x0 = i - offset;
                    let x1 = i + 1 - offset;
                    let y0 = -0.5;
                    let y1 = 0.5;
                    let z0 = j - offset;
                    let z1 = j + 1 - offset;
                    let bIP = isInRange(i + 1, j);
                    if (!bIP) {
                        let l = positions.length / 3;
                        positions.push(x1 + o, y0 + o, z0 + o);
                        positions.push(x1 + o, y1 - o, z0 + o);
                        positions.push(x1 + o, y1 - o, z1 - o);
                        positions.push(x1 + o, y0 + o, z1 - o);
                        indices.push(l, l + 2, l + 1);
                        indices.push(l, l + 3, l + 2);
                        normals.push(1, 0, 0);
                        normals.push(1, 0, 0);
                        normals.push(1, 0, 0);
                        normals.push(1, 0, 0);
                        colors.push(color.r, color.g, color.b, alpha);
                        colors.push(color.r, color.g, color.b, alpha);
                        colors.push(color.r, color.g, color.b, alpha);
                        colors.push(color.r, color.g, color.b, alpha);
                    }
                    let bIM = isInRange(i - 1, j);
                    if (!bIM) {
                        let l = positions.length / 3;
                        positions.push(x0 - o, y0 + o, z1 + o);
                        positions.push(x0 - o, y1 - o, z1 + o);
                        positions.push(x0 - o, y1 - o, z0 - o);
                        positions.push(x0 - o, y0 + o, z0 - o);
                        indices.push(l, l + 2, l + 1);
                        indices.push(l, l + 3, l + 2);
                        normals.push(-1, 0, 0);
                        normals.push(-1, 0, 0);
                        normals.push(-1, 0, 0);
                        normals.push(-1, 0, 0);
                        colors.push(color.r, color.g, color.b, alpha);
                        colors.push(color.r, color.g, color.b, alpha);
                        colors.push(color.r, color.g, color.b, alpha);
                        colors.push(color.r, color.g, color.b, alpha);
                    }
                    let bKP = false;
                    if (!bKP) {
                        let l = positions.length / 3;
                        positions.push(x0 + o, y1 + o, z0 + o);
                        positions.push(x0 + o, y1 + o, z1 - o);
                        positions.push(x1 - o, y1 + o, z1 - o);
                        positions.push(x1 - o, y1 + o, z0 + o);
                        indices.push(l, l + 2, l + 1);
                        indices.push(l, l + 3, l + 2);
                        normals.push(0, 1, 0);
                        normals.push(0, 1, 0);
                        normals.push(0, 1, 0);
                        normals.push(0, 1, 0);
                        colors.push(color.r, color.g, color.b, alpha);
                        colors.push(color.r, color.g, color.b, alpha);
                        colors.push(color.r, color.g, color.b, alpha);
                        colors.push(color.r, color.g, color.b, alpha);
                    }
                    let bKM = false;
                    if (!bKM) {
                        let l = positions.length / 3;
                        positions.push(x0 + o, y0 - o, z1 - o);
                        positions.push(x0 + o, y0 - o, z0 + o);
                        positions.push(x1 - o, y0 - o, z0 + o);
                        positions.push(x1 - o, y0 - o, z1 - o);
                        indices.push(l, l + 2, l + 1);
                        indices.push(l, l + 3, l + 2);
                        normals.push(0, -1, 0);
                        normals.push(0, -1, 0);
                        normals.push(0, -1, 0);
                        normals.push(0, -1, 0);
                        colors.push(color.r, color.g, color.b, alpha);
                        colors.push(color.r, color.g, color.b, alpha);
                        colors.push(color.r, color.g, color.b, alpha);
                        colors.push(color.r, color.g, color.b, alpha);
                    }
                    let bJP = isInRange(i, j + 1);
                    if (!bJP) {
                        let l = positions.length / 3;
                        positions.push(x1 - o, y0 + o, z1 + o);
                        positions.push(x1 - o, y1 - o, z1 + o);
                        positions.push(x0 + o, y1 - o, z1 + o);
                        positions.push(x0 + o, y0 + o, z1 + o);
                        indices.push(l, l + 2, l + 1);
                        indices.push(l, l + 3, l + 2);
                        normals.push(0, 0, 1);
                        normals.push(0, 0, 1);
                        normals.push(0, 0, 1);
                        normals.push(0, 0, 1);
                        colors.push(color.r, color.g, color.b, alpha);
                        colors.push(color.r, color.g, color.b, alpha);
                        colors.push(color.r, color.g, color.b, alpha);
                        colors.push(color.r, color.g, color.b, alpha);
                    }
                    let bJM = isInRange(i, j - 1);
                    if (!bJM) {
                        let l = positions.length / 3;
                        positions.push(x0 - o, y0 + o, z0 - o);
                        positions.push(x0 - o, y1 - o, z0 - o);
                        positions.push(x1 + o, y1 - o, z0 - o);
                        positions.push(x1 + o, y0 + o, z0 - o);
                        indices.push(l, l + 2, l + 1);
                        indices.push(l, l + 3, l + 2);
                        normals.push(0, 0, -1);
                        normals.push(0, 0, -1);
                        normals.push(0, 0, -1);
                        normals.push(0, 0, -1);
                        colors.push(color.r, color.g, color.b, alpha);
                        colors.push(color.r, color.g, color.b, alpha);
                        colors.push(color.r, color.g, color.b, alpha);
                        colors.push(color.r, color.g, color.b, alpha);
                    }
                }
            }
        }
        datas.positions = positions;
        datas.indices = indices;
        datas.normals = normals;
        datas.colors = colors;
        return datas;
    }
    Mummu.CreateCubeDiscVertexData = CreateCubeDiscVertexData;
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
    function QuaternionFromXYAxis(x, y) {
        let q = BABYLON.Quaternion.Identity();
        QuaternionFromXYAxisToRef(x, y, q);
        return q;
    }
    Mummu.QuaternionFromXYAxis = QuaternionFromXYAxis;
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
    function QuaternionFromXZAxis(x, z) {
        let q = BABYLON.Quaternion.Identity();
        QuaternionFromXZAxisToRef(x, z, q);
        return q;
    }
    Mummu.QuaternionFromXZAxis = QuaternionFromXZAxis;
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
    function QuaternionFromYZAxis(y, z) {
        let q = BABYLON.Quaternion.Identity();
        QuaternionFromYZAxisToRef(y, z, q);
        return q;
    }
    Mummu.QuaternionFromYZAxis = QuaternionFromYZAxis;
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
    function QuaternionFromZXAxis(z, x) {
        let q = BABYLON.Quaternion.Identity();
        QuaternionFromZXAxisToRef(z, x, q);
        return q;
    }
    Mummu.QuaternionFromZXAxis = QuaternionFromZXAxis;
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
    function QuaternionFromZYAxis(z, y) {
        let q = BABYLON.Quaternion.Identity();
        QuaternionFromZYAxisToRef(z, y, q);
        return q;
    }
    Mummu.QuaternionFromZYAxis = QuaternionFromZYAxis;
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
                                    for (let xx = -w; xx <= w; xx++) {
                                        for (let yy = -w; yy <= w; yy++) {
                                            if (xx * xx + yy * yy <= w * w) {
                                                let x = X + xx;
                                                let y = Y + yy;
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
        return v && isFinite(v.x) && isFinite(v.y) && isFinite(v.z);
    }
    Mummu.IsFinite = IsFinite;
    function Barycentric(point, p1, p2, p3) {
        let v0 = p2.subtract(p1);
        let v1 = p3.subtract(p1);
        let v2 = point.subtract(p1);
        let d00 = BABYLON.Vector3.Dot(v0, v0);
        let d01 = BABYLON.Vector3.Dot(v0, v1);
        let d11 = BABYLON.Vector3.Dot(v1, v1);
        let d20 = BABYLON.Vector3.Dot(v2, v0);
        let d21 = BABYLON.Vector3.Dot(v2, v1);
        let d = d00 * d11 - d01 * d01;
        let v = (d11 * d20 - d01 * d21) / d;
        let w = (d00 * d21 - d01 * d20) / d;
        let u = 1 - v - w;
        return {
            u: u,
            v: v,
            w: w
        };
    }
    Mummu.Barycentric = Barycentric;
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
    function ProjectPointOnPlaneToRef(point, pPlane, nPlane, ref) {
        ref.copyFrom(point).subtractInPlace(pPlane);
        let dot = BABYLON.Vector3.Dot(ref, nPlane);
        ref.copyFrom(nPlane).scaleInPlace(-dot);
        ref.addInPlace(point);
        return ref;
    }
    Mummu.ProjectPointOnPlaneToRef = ProjectPointOnPlaneToRef;
    function ProjectPointOnPlane(point, pPlane, nPlane) {
        let proj = BABYLON.Vector3.Zero();
        ProjectPointOnPlaneToRef(point, pPlane, nPlane, proj);
        return proj;
    }
    Mummu.ProjectPointOnPlane = ProjectPointOnPlane;
    function DistancePointRay(point, a, direction) {
        let origin;
        if (a instanceof BABYLON.Ray) {
            origin = a.origin;
            direction = a.direction;
        }
        else {
            origin = a;
        }
        let PA = TmpVec3[0];
        let dir = TmpVec3[1];
        let cross = TmpVec3[2];
        PA.copyFrom(origin).subtractInPlace(point);
        dir.copyFrom(direction).normalize();
        BABYLON.Vector3.CrossToRef(PA, dir, cross);
        return cross.length();
    }
    Mummu.DistancePointRay = DistancePointRay;
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
    function ProjectPointOnLineToRef(point, lineA, lineB, ref) {
        let AP = TmpVec3[0];
        let dir = TmpVec3[1];
        AP.copyFrom(point).subtractInPlace(lineA);
        dir.copyFrom(lineB).subtractInPlace(lineA);
        let l = dir.length();
        dir.scaleInPlace(1 / l);
        let dist = BABYLON.Vector3.Dot(AP, dir);
        ref.copyFrom(dir).scaleInPlace(dist).addInPlace(lineA);
        return ref;
    }
    Mummu.ProjectPointOnLineToRef = ProjectPointOnLineToRef;
    function ProjectPointOnLine(point, lineA, lineB) {
        let proj = BABYLON.Vector3.Zero();
        ProjectPointOnLineToRef(point, lineA, lineB, proj);
        return proj;
    }
    Mummu.ProjectPointOnLine = ProjectPointOnLine;
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
    function ProjectPointOnSegment(point, segA, segB) {
        let proj = BABYLON.Vector3.Zero();
        ProjectPointOnSegmentToRef(point, segA, segB, proj);
        return proj;
    }
    Mummu.ProjectPointOnSegment = ProjectPointOnSegment;
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
    function ProjectPointOnPathToRef(point, path, ref, pathIsEvenlyDistributed, nearBestIndex = -1, nearBestSearchRange = 32) {
        let proj = TmpVec3[3];
        if (pathIsEvenlyDistributed && path.length >= 4) {
            let bestIndex = -1;
            let bestSqrDist = Infinity;
            let start;
            let end;
            if (nearBestIndex >= 0) {
                start = Nabu.MinMax(nearBestIndex - nearBestSearchRange, 0, path.length);
                end = Nabu.MinMax(nearBestIndex + nearBestSearchRange, 0, path.length);
            }
            else {
                start = 0;
                end = path.length;
            }
            for (let i = start; i < end; i++) {
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
                    ref.point.copyFrom(proj);
                    ref.index = i;
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
                    ref.point.copyFrom(proj);
                    ref.index = i;
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
    function EvaluatePathToRef(f, path, ref) {
        if (f === 1) {
            return path[path.length - 1].clone();
        }
        let n = Math.floor(f * (path.length - 1));
        let ff = f * (path.length - 1) - n;
        TmpVec3[0].copyFrom(path[n]).scaleInPlace(1 - ff);
        ref.copyFrom(path[n + 1]).scaleInPlace(ff).addInPlace(TmpVec3[0]);
        return ref;
    }
    Mummu.EvaluatePathToRef = EvaluatePathToRef;
    function EvaluatePath(f, path) {
        let v = BABYLON.Vector3.Zero();
        EvaluatePathToRef(f, path, v);
        return v;
    }
    Mummu.EvaluatePath = EvaluatePath;
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
    function SmoothPathInPlace(path, f) {
        let clone = path.map(p => { return p.clone(); });
        let l = path.length;
        for (let i = 1; i < l - 1; i++) {
            let x = (path[i - 1].x + path[i].x * (1 - f) + path[i + 1].x) / (3 - f);
            let y = (path[i - 1].y + path[i].y * (1 - f) + path[i + 1].y) / (3 - f);
            let z = (path[i - 1].z + path[i].z * (1 - f) + path[i + 1].z) / (3 - f);
            clone[i].copyFromFloats(x, y, z);
        }
        for (let i = 0; i < l; i++) {
            path[i].copyFrom(clone[i]);
        }
        return path;
    }
    Mummu.SmoothPathInPlace = SmoothPathInPlace;
    function BevelClosedPath(path, bevel) {
        let beveledPath = [];
        for (let i = 0; i < path.length; i++) {
            let pPrev = path[(i - 1 + path.length) % path.length];
            let p = path[i];
            let pNext = path[(i + 1) % path.length];
            let dPrev = pPrev.subtract(p).normalize();
            dPrev.scaleInPlace(bevel);
            let dNext = pNext.subtract(p).normalize();
            dNext.scaleInPlace(bevel);
            beveledPath.push(p.add(dPrev));
            beveledPath.push(p.add(dNext));
        }
        return beveledPath;
    }
    Mummu.BevelClosedPath = BevelClosedPath;
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
    function DecimatePathInPlace(path, minAngle = 1 / 180 * Math.PI, collateral) {
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
                if (collateral) {
                    collateral.splice(flatestIndex, 1);
                }
            }
            else {
                done = true;
            }
        }
        return path;
    }
    Mummu.DecimatePathInPlace = DecimatePathInPlace;
    function RemoveFromStartForDistanceInPlace(path, distance, outRemovedPart) {
        if (!outRemovedPart) {
            outRemovedPart = [];
        }
        let distanceLeft = distance;
        while (distanceLeft > 0 && path.length >= 2) {
            let pA = path[0];
            let pB = path[1];
            let d = BABYLON.Vector3.Distance(pA, pB);
            if (d <= distanceLeft) {
                outRemovedPart.push(path[0]);
                path.splice(0, 1);
                distanceLeft -= d;
            }
            else if (d > distanceLeft) {
                let newPoint = pB.subtract(pA).normalize().scaleInPlace(distanceLeft).addInPlace(pA);
                outRemovedPart.push(path[0]);
                outRemovedPart.push(newPoint);
                path[0] = newPoint;
                distanceLeft = 0;
            }
        }
        return path;
    }
    Mummu.RemoveFromStartForDistanceInPlace = RemoveFromStartForDistanceInPlace;
    function RemoveFromEndForDistanceInPlace(path, distance, outRemovedPart) {
        if (!outRemovedPart) {
            outRemovedPart = [];
        }
        path.reverse();
        RemoveFromStartForDistanceInPlace(path, distance, outRemovedPart);
        path.reverse();
        outRemovedPart.reverse();
        return path;
    }
    Mummu.RemoveFromEndForDistanceInPlace = RemoveFromEndForDistanceInPlace;
    function RandomInSphereCutToRef(dir, alphaMin, alphaMax, betaMin, betaMax, up, ref) {
        if (!up) {
            up = BABYLON.Axis.Y;
        }
        let right = BABYLON.Vector3.CrossToRef(up, dir, TmpVec3[0]).normalize();
        up = BABYLON.Vector3.CrossToRef(dir, right, TmpVec3[1]).normalize();
        let a = Math.random() * (alphaMax - alphaMin) + alphaMin;
        let b = Math.random() * (betaMax - betaMin) + betaMin;
        Mummu.RotateToRef(dir, right, b, ref);
        Mummu.RotateToRef(ref, up, a, ref);
        return ref;
    }
    Mummu.RandomInSphereCutToRef = RandomInSphereCutToRef;
    function RandomInSphereCut(dir, alphaMin, alphaMax, betaMin, betaMax, up) {
        let v = BABYLON.Vector3.Zero();
        RandomInSphereCutToRef(dir, alphaMin, alphaMax, betaMin, betaMax, up, v);
        return v;
    }
    Mummu.RandomInSphereCut = RandomInSphereCut;
    function GetClosestAxisToRef(dir, ref) {
        let X = Math.abs(dir.x);
        let Y = Math.abs(dir.y);
        let Z = Math.abs(dir.z);
        if (X >= Y && X >= Z) {
            if (dir.x >= 0) {
                ref.copyFromFloats(1, 0, 0);
            }
            else {
                ref.copyFromFloats(-1, 0, 0);
            }
        }
        else if (Y >= X && Y >= Z) {
            if (dir.y >= 0) {
                ref.copyFromFloats(0, 1, 0);
            }
            else {
                ref.copyFromFloats(0, -1, 0);
            }
        }
        else if (Z >= X && Z >= Y) {
            if (dir.z >= 0) {
                ref.copyFromFloats(0, 0, 1);
            }
            else {
                ref.copyFromFloats(0, 0, -1);
            }
        }
        return ref;
    }
    Mummu.GetClosestAxisToRef = GetClosestAxisToRef;
    function GetClosestAxis(dir) {
        let v = BABYLON.Vector3.Zero();
        GetClosestAxisToRef(dir, v);
        return v;
    }
    Mummu.GetClosestAxis = GetClosestAxis;
})(Mummu || (Mummu = {}));
/// <reference path="../lib/babylon.d.ts"/>
var Mummu;
(function (Mummu) {
    class VertexDataInfo {
    }
    class VertexDataWithInfo {
        constructor(vertexDatas, infos) {
            this.vertexDatas = vertexDatas;
            this.infos = infos;
        }
        serialize() {
            let datas = {
                vertexDatas: [],
                infos: []
            };
            for (let i = 0; i < this.vertexDatas.length; i++) {
                let bVData = this.vertexDatas[i];
                for (let i = 0; i < bVData.positions.length; i++) {
                    bVData.positions[i] = Math.floor(bVData.positions[i] * 1000) / 1000;
                }
                for (let i = 0; i < bVData.normals.length; i++) {
                    bVData.normals[i] = Math.floor(bVData.normals[i] * 1000) / 1000;
                }
                datas.vertexDatas[i] = bVData.serialize();
            }
            for (let i = 0; i < this.infos.length; i++) {
                datas.infos[i] = {
                    name: this.infos[i].name,
                    position: this.infos[i].position.asArray(),
                };
            }
            return datas;
        }
        static CreateFromData(data) {
            let vertexDatas = [];
            let infos = [];
            for (let i = 0; i < data.vertexDatas.length; i++) {
                let vertexData = new BABYLON.VertexData();
                vertexData.positions = data.vertexDatas[i].positions;
                vertexData.indices = new Uint16Array(data.vertexDatas[i].indices);
                vertexData.normals = data.vertexDatas[i].normals;
                vertexData.uvs = data.vertexDatas[i].uvs;
                vertexData.colors = data.vertexDatas[i].colors;
                vertexDatas[i] = vertexData;
            }
            for (let i = 0; i < data.infos.length; i++) {
                let info = new VertexDataInfo();
                info.name = data.infos[i].name;
                info.position = BABYLON.Vector3.FromArray(data.infos[i].position);
                infos[i] = info;
            }
            return new VertexDataWithInfo(vertexDatas, infos);
        }
    }
    class VertexDataLoader {
        constructor(scene) {
            this.scene = scene;
            this.vertexDatas = new Map();
            VertexDataLoader.instance = this;
        }
        serialize() {
            let datas = [];
            this.vertexDatas.forEach((vData, name) => {
                datas.push({
                    key: name,
                    value: vData.serialize()
                });
            });
            return datas;
        }
        deserialize(data) {
            for (let i = 0; i < data.length; i++) {
                this.vertexDatas.set(data[i].key, VertexDataWithInfo.CreateFromData(data[i].value));
            }
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
        async getInfos(url, scene) {
            if (!this.vertexDatas.get(url)) {
                await this.get(url, scene);
            }
            if (this.vertexDatas.has(url)) {
                return this.vertexDatas.get(url).infos;
            }
            return [];
        }
        async get(url, scene) {
            if (this.vertexDatas.get(url)) {
                return this.vertexDatas.get(url).vertexDatas;
            }
            let vertexData = undefined;
            let loadedFile = await BABYLON.SceneLoader.ImportMeshAsync("", url, "", scene);
            let vertexDatas = [];
            let infos = [];
            let gltfCase = false;
            if (loadedFile.meshes && loadedFile.meshes[0] && loadedFile.meshes[0].name === "__root__") {
                gltfCase = true;
            }
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
                    if (vertexData.positions && vertexData.positions.length > 0) {
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
                        if (gltfCase) {
                            Mummu.RotateAngleAxisVertexDataInPlace(vertexData, Math.PI, BABYLON.Axis.Y);
                        }
                        let vertexDataInfos = new VertexDataInfo();
                        vertexDataInfos.name = loadedMesh.name;
                        vertexDataInfos.position = loadedMesh.position.clone();
                        infos.push(vertexDataInfos);
                    }
                }
            }
            this.vertexDatas.set(url, new VertexDataWithInfo(vertexDatas, infos));
            loadedFileMeshes.forEach(m => { m.dispose(); });
            loadedFile.skeletons.forEach(s => { s.dispose(); });
            return vertexDatas;
        }
        async getAtIndex(url, index = 0, scene) {
            let datas = await this.get(url, scene);
            if (datas) {
                return datas[index];
            }
        }
        async getAndInstantiateAtIndex(name, url, index = 0, scene) {
            let data = await this.getAtIndex(url, index);
            let mesh = new BABYLON.Mesh(name, scene);
            data.applyToMesh(mesh);
            return mesh;
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
        let uvs2 = [];
        let colors = [];
        let useColors = false;
        for (let i = 0; i < datas.length; i++) {
            if (datas[i].colors) {
                useColors = true;
            }
        }
        for (let i = 0; i < datas.length; i++) {
            let offset = positions.length / 3;
            positions.push(...datas[i].positions);
            indices.push(...datas[i].indices.map(index => { return index + offset; }));
            normals.push(...datas[i].normals);
            if (datas[i].uvs) {
                uvs.push(...datas[i].uvs);
            }
            if (datas[i].uvs2) {
                uvs2.push(...datas[i].uvs2);
            }
            if (datas[i].colors) {
                colors.push(...datas[i].colors);
            }
            else if (useColors) {
                for (let j = 0; j < positions.length / 3; j++) {
                    colors.push(1, 1, 1, 1);
                }
            }
        }
        mergedData.positions = positions;
        mergedData.indices = indices;
        mergedData.normals = normals;
        if (uvs.length > 0) {
            mergedData.uvs = uvs;
        }
        if (uvs2.length > 0) {
            mergedData.uvs2 = uvs2;
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
    function RotateAngleAxisVertexDataInPlace(data, angle, axis) {
        let q = BABYLON.Quaternion.RotationAxis(axis, angle);
        return RotateVertexDataInPlace(data, q);
    }
    Mummu.RotateAngleAxisVertexDataInPlace = RotateAngleAxisVertexDataInPlace;
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
    function ShrinkVertexDataInPlace(data, d) {
        let positions = [...data.positions];
        let normals = data.normals;
        for (let i = 0; i < positions.length / 3; i++) {
            let nx = normals[3 * i];
            let ny = normals[3 * i + 1];
            let nz = normals[3 * i + 2];
            positions[3 * i] += d * nx;
            positions[3 * i + 1] += d * ny;
            positions[3 * i + 2] += d * nz;
        }
        data.positions = positions;
        return data;
    }
    Mummu.ShrinkVertexDataInPlace = ShrinkVertexDataInPlace;
    function MirrorXVertexDataInPlace(data) {
        let positions = [...data.positions];
        let normals = [...data.normals];
        let uvs = [...data.uvs];
        for (let i = 0; i < positions.length / 3; i++) {
            normals[3 * i] *= -1;
            positions[3 * i] *= -1;
            uvs[2 * i] *= -1;
        }
        data.positions = positions;
        data.normals = normals;
        data.uvs = uvs;
        let indices = [...data.indices];
        for (let i = 0; i < indices.length / 3; i++) {
            let i1 = indices[3 * i];
            let i2 = indices[3 * i + 1];
            indices[3 * i] = i2;
            indices[3 * i + 1] = i1;
        }
        data.indices = indices;
        return data;
    }
    Mummu.MirrorXVertexDataInPlace = MirrorXVertexDataInPlace;
    function MirrorZVertexDataInPlace(data) {
        let positions = [...data.positions];
        let normals = [...data.normals];
        let uvs = [...data.uvs];
        for (let i = 0; i < positions.length / 3; i++) {
            normals[3 * i + 2] *= -1;
            positions[3 * i + 2] *= -1;
            uvs[2 * i] *= -1;
        }
        data.positions = positions;
        data.normals = normals;
        data.uvs = uvs;
        let indices = [...data.indices];
        for (let i = 0; i < indices.length / 3; i++) {
            let i1 = indices[3 * i];
            let i2 = indices[3 * i + 1];
            indices[3 * i] = i2;
            indices[3 * i + 1] = i1;
        }
        data.indices = indices;
        return data;
    }
    Mummu.MirrorZVertexDataInPlace = MirrorZVertexDataInPlace;
    function TriFlipVertexDataInPlace(data) {
        let indices = [...data.indices];
        for (let i = 0; i < indices.length / 3; i++) {
            let i1 = indices[3 * i];
            let i2 = indices[3 * i + 1];
            indices[3 * i] = i2;
            indices[3 * i + 1] = i1;
        }
        data.indices = indices;
        data.normals = data.normals.map((n) => { return -n; });
        return data;
    }
    Mummu.TriFlipVertexDataInPlace = TriFlipVertexDataInPlace;
    function ColorizeVertexDataInPlace(data, color, colorToReplace) {
        let colors = [];
        if (colorToReplace && data.colors) {
            colors = [...data.colors];
        }
        for (let i = 0; i < data.positions.length / 3; i++) {
            if (colorToReplace) {
                let r = data.colors[4 * i];
                let g = data.colors[4 * i + 1];
                let b = data.colors[4 * i + 2];
                if (r != colorToReplace.r || g != colorToReplace.g || b != colorToReplace.b) {
                    continue;
                }
            }
            colors[4 * i] = color.r;
            colors[4 * i + 1] = color.g;
            colors[4 * i + 2] = color.b;
            colors[4 * i + 3] = 1;
        }
        data.colors = colors;
        return data;
    }
    Mummu.ColorizeVertexDataInPlace = ColorizeVertexDataInPlace;
})(Mummu || (Mummu = {}));
