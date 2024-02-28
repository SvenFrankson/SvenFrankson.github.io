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
    function DrawDebugPoint(points, frames = Infinity, color, scene) {
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
                        points.add(new BABYLON.Vector3(-0.1, 0, 0)),
                        points.add(new BABYLON.Vector3(0.1, 0, 0))
                    ],
                    [
                        points.add(new BABYLON.Vector3(0, -0.1, 0)),
                        points.add(new BABYLON.Vector3(0, 0.1, 0))
                    ],
                    [
                        points.add(new BABYLON.Vector3(0, 0, -0.1)),
                        points.add(new BABYLON.Vector3(0, 0, 0.1))
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
    var SphereWireIntersectionTmpWireProj_0 = { point: BABYLON.Vector3.Zero(), index: -1 };
    function SphereWireIntersection(cSphere, rSphere, path, rWire, pathIsEvenlyDistributed, nearBestIndex, nearBestSearchRange) {
        let intersection = new Intersection();
        let proj = SphereWireIntersectionTmpWireProj_0;
        Mummu.ProjectPointOnPathToRef(cSphere, path, proj, pathIsEvenlyDistributed, nearBestIndex, nearBestSearchRange);
        let dist = BABYLON.Vector3.Distance(cSphere, proj.point);
        let depth = (rSphere + rWire) - dist;
        if (depth > 0) {
            intersection.hit = true;
            intersection.depth = depth;
            let dir = cSphere.subtract(proj.point).normalize();
            intersection.point = dir.scale(rWire);
            intersection.point.addInPlace(proj.point);
            intersection.normal = dir;
            intersection.index = proj.index;
        }
        return intersection;
    }
    Mummu.SphereWireIntersection = SphereWireIntersection;
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
        let positions = [
            props.p1.x, props.p1.y, props.p1.z,
            props.p2.x, props.p2.y, props.p2.z,
            props.p3.x, props.p3.y, props.p3.z,
            props.p4.x, props.p4.y, props.p4.z
        ];
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
        let normals = [
            n1.x, n1.y, n1.z,
            n2.x, n2.y, n2.z,
            n3.x, n3.y, n3.z,
            n4.x, n4.y, n4.z
        ];
        let uvs = [0, 0, 1, 0, 1, 1, 0, 1];
        data.positions = positions;
        data.normals = normals;
        data.indices = indices;
        data.uvs = uvs;
        if (props.colors) {
            if (props.colors instanceof BABYLON.Color4) {
                let colors = [
                    ...props.colors.asArray(),
                    ...props.colors.asArray(),
                    ...props.colors.asArray(),
                    ...props.colors.asArray(),
                ];
                data.colors = colors;
            }
            else {
                let colors = [
                    ...props.colors[0].asArray(),
                    ...props.colors[1].asArray(),
                    ...props.colors[2].asArray(),
                    ...props.colors[3].asArray(),
                ];
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
