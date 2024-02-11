var Sumuqan;
(function (Sumuqan) {
    class Antenna extends BABYLON.Mesh {
        constructor(polypode, isLeft) {
            super(polypode.name + "-antenna-" + (isLeft ? "l" : "r"));
            this.polypode = polypode;
            this.isLeft = isLeft;
            this.alpha0 = Math.PI / 5;
            this.alphaSpeed = 0;
            this.beta0 = Math.PI / 12;
            this.betaSpeed = 0;
            this.length = 0.5;
            if (this.isLeft) {
                this.alpha0 *= -1;
            }
            this.parent = this.polypode.head;
        }
        update(dt) {
            if (isFinite(dt)) {
                let dir = this.forward;
                let ray = new BABYLON.Ray(this.absolutePosition, dir, this.length);
                let intersection = Mummu.RayCollidersIntersection(ray, this.polypode.terrain);
                if (intersection.hit) {
                    let n = intersection.normal;
                    if (BABYLON.Vector3.Dot(n, this.polypode.up) > 0) {
                        this.betaSpeed -= Math.PI * 0.2;
                    }
                    else {
                        this.betaSpeed += Math.PI * 0.2;
                    }
                    if (BABYLON.Vector3.Dot(n, this.polypode.right) > 0) {
                        this.alphaSpeed -= Math.PI * 0.2;
                    }
                    else {
                        this.alphaSpeed += Math.PI * 0.2;
                    }
                }
                else {
                    this.alphaSpeed += 0.1 * (this.alpha0 - this.rotation.y);
                    this.betaSpeed += 0.1 * (this.beta0 - this.rotation.x);
                }
                this.alphaSpeed *= 0.95;
                this.betaSpeed *= 0.95;
                this.rotation.x += this.betaSpeed * dt;
                this.rotation.x = Nabu.MinMax(this.rotation.x, -Math.PI / 2, Math.PI / 2);
                this.rotation.y += this.alphaSpeed * dt;
                this.rotation.y = Nabu.MinMax(this.rotation.y, -Math.PI / 3, Math.PI / 3);
            }
        }
    }
    Sumuqan.Antenna = Antenna;
})(Sumuqan || (Sumuqan = {}));
/// <reference path="../lib/babylon.d.ts"/>
/// <reference path="../../nabu/nabu.d.ts"/>
/// <reference path="../../mummu/mummu.d.ts"/>
var Sumuqan;
(function (Sumuqan) {
    let KneeMode;
    (function (KneeMode) {
        KneeMode[KneeMode["Backward"] = 0] = "Backward";
        KneeMode[KneeMode["Vertical"] = 1] = "Vertical";
        KneeMode[KneeMode["Outward"] = 2] = "Outward";
    })(KneeMode = Sumuqan.KneeMode || (Sumuqan.KneeMode = {}));
    class Leg {
        constructor(isLeftLeg) {
            this.isLeftLeg = isLeftLeg;
            this.kneeMode = KneeMode.Vertical;
            this.footLength = 0.5;
            this.lowerLegLength = 1;
            this.upperLegLength = 1;
            this.footThickness = 0.23;
            this.footPos = BABYLON.Vector3.Zero();
            this.footUp = new BABYLON.Vector3(0, 1, 0);
            this.footForward = new BABYLON.Vector3(0, 0, 1);
            this.hipPos = BABYLON.Vector3.Zero();
            this.right = new BABYLON.Vector3(1, 0, 0);
            this.up = new BABYLON.Vector3(0, 1, 0);
            this.forward = new BABYLON.Vector3(0, 0, 1);
            this._scale = 1;
            this._upperLegZ = BABYLON.Vector3.Forward();
            this._lowerLegZ = BABYLON.Vector3.Forward();
            this._kneePos = BABYLON.Vector3.Zero();
            this.foot = new BABYLON.Mesh("foot");
            this.foot.rotationQuaternion = BABYLON.Quaternion.Identity();
            this.lowerLeg = new BABYLON.Mesh("lower-leg");
            this.lowerLeg.rotationQuaternion = BABYLON.Quaternion.Identity();
            this.upperLeg = new BABYLON.Mesh("upper-leg");
            this.upperLeg.rotationQuaternion = BABYLON.Quaternion.Identity();
        }
        get totalLength() {
            return (this.upperLegLength + this.lowerLegLength) * this.scale;
        }
        get scale() {
            return this._scale;
        }
        set scale(s) {
            this._scale = s;
            this.upperLeg.scaling.copyFromFloats(this.scale, this.scale, this.scale);
            this.lowerLeg.scaling.copyFromFloats(this.scale, this.scale, this.scale);
            this.foot.scaling.copyFromFloats(this.scale, this.scale, this.scale);
        }
        updatePositions() {
            if (this.initialKneePos) {
                this._kneePos.copyFrom(this.initialKneePos);
            }
            else if (this.kneeMode === KneeMode.Backward) {
                this._kneePos.copyFrom(this.hipPos).addInPlace(this.footPos).scaleInPlace(0.5).addInPlace(this.footUp.normalize()).subtractInPlace(this.forward).addInPlace(this.right.scale(this.isLeftLeg ? -1 : 1));
            }
            else if (this.kneeMode === KneeMode.Vertical) {
                this._kneePos.copyFrom(this.hipPos).addInPlace(this.footPos).scaleInPlace(0.5).addInPlace(this.footUp.normalize());
            }
            else if (this.kneeMode === KneeMode.Outward) {
                this._kneePos.copyFrom(this.hipPos).addInPlace(this.footPos).scaleInPlace(0.5).addInPlace(this.right.scale(this.isLeftLeg ? -1 : 1));
            }
            for (let n = 0; n < 2; n++) {
                Mummu.ForceDistanceFromOriginInPlace(this._kneePos, this.footPos, this.lowerLegLength * this.scale);
                Mummu.ForceDistanceFromOriginInPlace(this._kneePos, this.hipPos, this.upperLegLength * this.scale);
            }
            this._upperLegZ.copyFrom(this._kneePos).subtractInPlace(this.hipPos).normalize();
            this._lowerLegZ.copyFrom(this.footPos).subtractInPlace(this._kneePos).normalize();
            this.upperLeg.position.copyFrom(this.hipPos);
            Mummu.QuaternionFromZYAxisToRef(this._upperLegZ, this.up, this.upperLeg.rotationQuaternion);
            this._upperLegZ.scaleInPlace(this.upperLegLength * this.scale);
            this._kneePos.copyFrom(this.hipPos).addInPlace(this._upperLegZ);
            this.lowerLeg.position.copyFrom(this._kneePos);
            if (this.kneeMode === KneeMode.Backward) {
                Mummu.QuaternionFromZYAxisToRef(this._lowerLegZ, this._upperLegZ, this.lowerLeg.rotationQuaternion);
            }
            else if (this.kneeMode === KneeMode.Vertical) {
                Mummu.QuaternionFromZYAxisToRef(this._lowerLegZ, this._upperLegZ, this.lowerLeg.rotationQuaternion);
            }
            else if (this.kneeMode === KneeMode.Outward) {
                Mummu.QuaternionFromZYAxisToRef(this._lowerLegZ, this._upperLegZ, this.lowerLeg.rotationQuaternion);
            }
            this._lowerLegZ.scaleInPlace(this.lowerLegLength * this.scale);
            this.foot.position.copyFrom(this.lowerLeg.position).addInPlace(this._lowerLegZ);
            Mummu.QuaternionFromYZAxisToRef(this.footUp, this.footForward, this.foot.rotationQuaternion);
        }
    }
    Sumuqan.Leg = Leg;
})(Sumuqan || (Sumuqan = {}));
var Sumuqan;
(function (Sumuqan) {
    class Polypode extends BABYLON.Mesh {
        constructor(name, prop) {
            super(name);
            this.speed = 0;
            this._fSpeed = 0; // normalized speed between a min and a max (now 0 and 0.5)
            this.rotationSpeed = 0;
            this.bodyColliders = [];
            this.terrain = [];
            // Debug collision display [v]
            this._showCollisionDebug = false;
            this._showPOVDebug = false;
            this.debugBodyCollidersMeshes = [];
            // [^] Debug collision display
            this.mentalMap = [];
            this.mentalMapNormal = [];
            this.mentalMapIndex = 0;
            this.mentalMapMaxSize = 150;
            this.localNormal = BABYLON.Vector3.Up();
            this.mentalCheckPerFrame = 5;
            this.legPairCount = 2;
            this.headAnchor = new BABYLON.Vector3(0, Math.SQRT2, Math.SQRT2);
            this._footThickness = 1.2;
            this.stepDurationMin = 0.3;
            this.stepDurationMax = 0.7;
            this.stepHeightMin = 0.3;
            this.stepHeightMax = 0.7;
            this.bootyShakiness = 0.5;
            this.bodyLocalOffset = BABYLON.Vector3.Zero();
            this.bodyWorldOffset = BABYLON.Vector3.Zero();
            this.leftLegs = [];
            this.rightLegs = [];
            this.legs = [];
            this.antennas = [];
            this.povOffset = new BABYLON.Vector3(0, 0.4, 0);
            this.povAlpha = 5 * Math.PI / 3;
            this.povBetaMin = Math.PI / 10;
            this.povBetaMax = Math.PI / 2.1;
            this.povRadiusMax = 1;
            this.povRadiusMin = 0.5;
            this._stepping = 0;
            this._update = () => {
                let dt = this.getScene().deltaTime / 1000;
                this._fSpeed = Nabu.MinMax(this.speed / 0.5, 0, 1);
                this.position.addInPlace(this.forward.scale(this.speed / 60));
                this.rotate(this.up, this.rotationSpeed / 60, BABYLON.Space.WORLD);
                this.computeWorldMatrix(true);
                Mummu.QuaternionFromYZAxisToRef(this.body.up, this.forward, this.rotationQuaternion);
                // Terrain scan [v]
                let fFindUp = 0.999 * (1 - this._fSpeed) + 0.98 * this._fSpeed;
                let origin = BABYLON.Vector3.TransformCoordinates(this.povOffset, this.getWorldMatrix());
                for (let i = 0; i < this.mentalCheckPerFrame; i++) {
                    let distCheck = this.povRadiusMax;
                    let dir = Mummu.RandomInSphereCut(this.forward, -this.povAlpha * 0.5, this.povAlpha * 0.5, this.povBetaMin, this.povBetaMax, this.up);
                    let ray = new BABYLON.Ray(origin, dir, distCheck);
                    let intersection = Mummu.RayCollidersIntersection(ray, this.terrain);
                    //Mummu.DrawDebugLine(ray.origin, ray.origin.add(ray.direction.scale(distCheck)), this.mentalMapMaxSize / this.mentalCheckPerFrame, BABYLON.Color3.White());
                    if (intersection.hit) {
                        let n = intersection.normal;
                        if (BABYLON.Vector3.Dot(n, this.up) > -0.5) {
                            this.mentalMap[this.mentalMapIndex] = intersection.point;
                            this.mentalMapNormal[this.mentalMapIndex] = n;
                            this.localNormal.scaleInPlace(fFindUp).addInPlace(this.mentalMapNormal[this.mentalMapIndex].scale(1 - fFindUp));
                            if (this._showPOVDebug) {
                                Mummu.DrawDebugHit(intersection.point, this.mentalMapNormal[this.mentalMapIndex], this.mentalMapMaxSize / this.mentalCheckPerFrame, BABYLON.Color3.Green());
                            }
                            this.mentalMapIndex = (this.mentalMapIndex + 1) % this.mentalMapMaxSize;
                        }
                    }
                }
                this.localNormal.normalize();
                // [^] Terrain scan
                for (let i = 0; i < this.legPairCount; i++) {
                    BABYLON.Vector3.TransformCoordinatesToRef(this.leftHipAnchors[i], this.body.getWorldMatrix(), this.leftLegs[i].hipPos);
                    BABYLON.Vector3.TransformCoordinatesToRef(this.rightHipAnchors[i], this.body.getWorldMatrix(), this.rightLegs[i].hipPos);
                }
                BABYLON.Vector3.TransformCoordinatesToRef(this.headAnchor, this.body.getWorldMatrix(), this.head.position);
                for (let i = 0; i < this.legPairCount; i++) {
                    this.leftLegs[i].right = this.right;
                    this.leftLegs[i].up = this.up;
                    this.leftLegs[i].forward = this.forward;
                    this.rightLegs[i].right = this.right;
                    this.rightLegs[i].up = this.up;
                    this.rightLegs[i].forward = this.forward;
                }
                let m = this.computeWorldMatrix(true);
                if (this._stepping <= 0) {
                    let averageTimeBetweenStep = Nabu.MinMax(2 - 20 * Math.abs(this.speed), 0, 2);
                    let prob1s = 1 / averageTimeBetweenStep;
                    let probDT = dt * prob1s;
                    if (Math.random() < probDT) {
                        let legTarget = BABYLON.Vector3.Zero();
                        let longestStepDist = 0;
                        let legToMove;
                        let targetPosition;
                        let targetNormal;
                        for (let i = 0; i < this.legPairCount; i++) {
                            BABYLON.Vector3.TransformCoordinatesToRef(this.rightFootTargets[i], m, legTarget);
                            let targetRight;
                            let normalRight;
                            let closestMentalMapSqrDist = Infinity;
                            for (let j = 0; j < this.mentalMap.length; j++) {
                                let mentalPoint = this.mentalMap[j];
                                let sqrD = BABYLON.Vector3.DistanceSquared(legTarget, mentalPoint);
                                if (sqrD < closestMentalMapSqrDist) {
                                    if (BABYLON.Vector3.DistanceSquared(this.rightLegs[i].hipPos, mentalPoint) < this.rightLegs[i].totalLength) {
                                        targetRight = mentalPoint;
                                        normalRight = this.mentalMapNormal[j];
                                        closestMentalMapSqrDist = sqrD;
                                    }
                                }
                            }
                            if (targetRight) {
                                let d = BABYLON.Vector3.DistanceSquared(this.rightLegs[i].foot.position, targetRight) / this.rightLegs[i].totalLength;
                                if (d > longestStepDist) {
                                    longestStepDist = d;
                                    legToMove = this.rightLegs[i];
                                    targetPosition = targetRight;
                                    targetNormal = normalRight;
                                }
                            }
                            BABYLON.Vector3.TransformCoordinatesToRef(this.leftFootTargets[i], m, legTarget);
                            let targetLeft;
                            let normalLeft;
                            closestMentalMapSqrDist = Infinity;
                            for (let j = 0; j < this.mentalMap.length; j++) {
                                let mentalPoint = this.mentalMap[j];
                                let sqrD = BABYLON.Vector3.DistanceSquared(legTarget, mentalPoint);
                                if (sqrD < closestMentalMapSqrDist) {
                                    if (BABYLON.Vector3.DistanceSquared(this.leftLegs[i].hipPos, mentalPoint) < this.leftLegs[i].totalLength) {
                                        targetLeft = mentalPoint;
                                        normalLeft = this.mentalMapNormal[j];
                                        closestMentalMapSqrDist = sqrD;
                                    }
                                }
                            }
                            if (targetLeft) {
                                let d = BABYLON.Vector3.DistanceSquared(this.leftLegs[i].foot.position, targetLeft) / this.leftLegs[i].totalLength;
                                if (d > longestStepDist) {
                                    longestStepDist = d;
                                    legToMove = this.leftLegs[i];
                                    targetPosition = targetLeft;
                                    targetNormal = normalLeft;
                                }
                            }
                        }
                        if (longestStepDist > 0.01) {
                            this._stepping++;
                            //Mummu.DrawDebugLine(legToMove.hipPos, targetPosition, 60, BABYLON.Color3.Yellow());
                            this.step(legToMove, targetPosition, targetNormal.scale(0.3).add(this.up.scale(0.7)), this.forward).then(() => { this._stepping--; });
                        }
                    }
                }
                for (let i = 0; i < this.legPairCount; i++) {
                    this.leftLegs[i].updatePositions();
                    this.rightLegs[i].updatePositions();
                }
                let bodyPos = BABYLON.Vector3.Zero();
                let offset = BABYLON.Vector3.Zero();
                let averageRightFoot = BABYLON.Vector3.Zero();
                let averageLeftFoot = BABYLON.Vector3.Zero();
                for (let i = 0; i < this.legPairCount; i++) {
                    averageRightFoot.addInPlace(this.rightLegs[i].foot.absolutePosition);
                    averageLeftFoot.addInPlace(this.leftLegs[i].foot.absolutePosition);
                    offset.addInPlace(this.rightFootTargets[i].scale(-1));
                    offset.addInPlace(this.leftFootTargets[i].scale(-1));
                }
                averageRightFoot.scaleInPlace(1 / this.legPairCount);
                averageLeftFoot.scaleInPlace(1 / this.legPairCount);
                bodyPos.copyFrom(averageRightFoot).addInPlace(averageLeftFoot).scaleInPlace(0.5);
                offset.scaleInPlace(1 / this.legCount);
                offset.addInPlace(this.bodyLocalOffset);
                BABYLON.Vector3.TransformNormalToRef(offset, this.getWorldMatrix(), offset);
                offset.addInPlace(this.bodyWorldOffset);
                bodyPos.addInPlace(offset);
                averageRightFoot.subtractInPlace(this.body.position);
                averageLeftFoot.subtractInPlace(this.body.position);
                let quatFromLeg = Mummu.QuaternionFromYZAxis(this.localNormal, this.forward);
                BABYLON.Quaternion.SlerpToRef(this.body.rotationQuaternion, quatFromLeg, 0.1, this.body.rotationQuaternion);
                Mummu.QuaternionFromZYAxisToRef(this.forward, this.up, this.head.rotationQuaternion);
                BABYLON.Vector3.LerpToRef(this.body.position, bodyPos, 0.1, this.body.position);
                // Terrain collision [v]
                for (let i = 0; i < this.bodyColliders.length; i++) {
                    if (this.showCollisionDebug) {
                        this.debugBodyCollidersMeshes[i].material = this.debugColliderMaterial;
                    }
                    let bodyCollider = this.bodyColliders[i];
                    bodyCollider.recomputeWorldCenter();
                    let intersections = Mummu.SphereCollidersIntersection(bodyCollider.center, bodyCollider.radius, this.terrain);
                    let n = intersections.length;
                    for (let j = 0; j < n; j++) {
                        let intersection = intersections[j];
                        this.body.position.addInPlace(intersection.normal.scale(0.1 * intersection.depth / n));
                        if (this.showCollisionDebug) {
                            this.debugBodyCollidersMeshes[i].material = this.debugColliderHitMaterial;
                        }
                    }
                }
                // [^] Terrain collision
                // Prevent overstrech [v]
                let dir = this.position.subtract(this.body.absolutePosition);
                let l = dir.length();
                let maxL = 0.3;
                if (l > maxL) {
                    dir.scaleInPlace(1 / l);
                    this.position.copyFrom(dir).scaleInPlace(maxL).addInPlace(this.body.absolutePosition);
                }
                this.antennas.forEach(antenna => {
                    antenna.update(dt);
                });
                if (this.tail) {
                    this.tail.update(dt);
                }
                // [^] Prevent overstrech
            };
            this.legPairCount = prop.legPairsCount;
            // Create all required meshes
            this.body = BABYLON.MeshBuilder.CreateSphere("body", { diameterX: 1, diameterY: 1, diameterZ: 1.5 });
            this.body.rotationQuaternion = BABYLON.Quaternion.Identity();
            for (let i = 0; i < this.legPairCount; i++) {
                this.rightLegs[i] = new Sumuqan.Leg();
                this.rightLegs[i].kneeMode = Sumuqan.KneeMode.Vertical;
                this.leftLegs[i] = new Sumuqan.Leg(true);
                this.leftLegs[i].kneeMode = Sumuqan.KneeMode.Vertical;
            }
            this.legs = [...this.rightLegs, ...this.leftLegs];
            this.head = BABYLON.MeshBuilder.CreateSphere("head", { diameterX: 0.5, diameterY: 0.5, diameterZ: 0.75 });
            this.head.rotationQuaternion = BABYLON.Quaternion.Identity();
            if (Mummu.IsFinite(prop.antennaAnchor)) {
                this.antennas = [
                    new Sumuqan.Antenna(this, false),
                    new Sumuqan.Antenna(this, true)
                ];
                this.antennas[0].position.copyFrom(prop.antennaAnchor);
                this.antennas[1].position.copyFrom(prop.antennaAnchor);
                this.antennas[1].position.x *= -1;
                if (isFinite(prop.antennaAlphaZero)) {
                    this.antennas[0].alpha0 = prop.antennaAlphaZero;
                    this.antennas[1].alpha0 = prop.antennaAlphaZero;
                }
                if (isFinite(prop.antennaBetaZero)) {
                    this.antennas[0].beta0 = prop.antennaBetaZero;
                    this.antennas[1].beta0 = prop.antennaBetaZero;
                }
                if (isFinite(prop.antennaLength)) {
                    this.antennas[0].length = prop.antennaLength;
                    this.antennas[1].length = prop.antennaLength;
                }
            }
            // Apply properties
            if (Mummu.IsFinite(prop.headAnchor)) {
                this.headAnchor = prop.headAnchor;
            }
            if (prop.hipAnchors) {
                // HipAnchors provided
                this.rightHipAnchors = [...prop.hipAnchors].map(v => { return v.clone(); });
                this.leftHipAnchors = [...prop.hipAnchors].map(v => { return v.multiplyByFloats(-1, 1, 1); });
            }
            else {
                if (prop.rightHipAnchors && prop.leftHipAnchors) {
                    // Right and Left HipAnchors provided
                    this.rightHipAnchors = [...prop.rightHipAnchors].map(v => { return v.clone(); });
                    this.leftHipAnchors = [...prop.leftHipAnchors].map(v => { return v.clone(); });
                }
                else {
                    // Generate default HipAnchors
                    this.rightHipAnchors = [];
                    this.leftHipAnchors = [];
                    for (let i = 0; i < this.legPairCount; i++) {
                        let a = (i + 1) / (this.legPairCount + 1) * Math.PI;
                        let cosa = Math.cos(a);
                        let sina = Math.sin(a);
                        this.rightHipAnchors[i] = (new BABYLON.Vector3(sina, 0, cosa)).normalize();
                        this.leftHipAnchors[i] = (new BABYLON.Vector3(-sina, 0, cosa)).normalize();
                    }
                }
            }
            if (prop.footTargets) {
                // FootTargets provided
                this.rightFootTargets = [...prop.footTargets].map(v => { return v.clone(); });
                this.leftFootTargets = [...prop.footTargets].map(v => { return v.multiplyByFloats(-1, 1, 1); });
            }
            else {
                if (prop.rightFootTargets && prop.leftFootTargets) {
                    // Right and Left FootTargets provided
                    this.rightFootTargets = [...prop.rightFootTargets].map(v => { return v.clone(); });
                    this.leftFootTargets = [...prop.leftFootTargets].map(v => { return v.clone(); });
                }
                else {
                    // Generate default FootTargets
                    this.rightFootTargets = [];
                    this.leftFootTargets = [];
                    for (let i = 0; i < this.legPairCount; i++) {
                        let a = (i + 1) / (this.legPairCount + 1) * Math.PI;
                        let cosa = Math.cos(a);
                        let sina = Math.sin(a);
                        this.rightFootTargets[i] = (new BABYLON.Vector3(sina, -0.5, cosa)).normalize().scaleInPlace(2);
                        this.leftFootTargets[i] = (new BABYLON.Vector3(-sina, -0.5, cosa)).normalize().scaleInPlace(2);
                    }
                }
            }
            if (isFinite(prop.footThickness)) {
                for (let i = 0; i < this.legPairCount; i++) {
                    this.rightLegs[i].footThickness = prop.footThickness;
                    this.leftLegs[i].footThickness = prop.footThickness;
                }
            }
            if (isFinite(prop.kneeMode)) {
                for (let i = 0; i < this.legPairCount; i++) {
                    this.rightLegs[i].kneeMode = prop.kneeMode;
                    this.leftLegs[i].kneeMode = prop.kneeMode;
                }
            }
            if (isFinite(prop.upperLegLength)) {
                for (let i = 0; i < this.legPairCount; i++) {
                    this.rightLegs[i].upperLegLength = prop.upperLegLength;
                    this.leftLegs[i].upperLegLength = prop.upperLegLength;
                }
            }
            if (isFinite(prop.lowerLegLength)) {
                for (let i = 0; i < this.legPairCount; i++) {
                    this.rightLegs[i].lowerLegLength = prop.lowerLegLength;
                    this.leftLegs[i].lowerLegLength = prop.lowerLegLength;
                }
            }
            if (prop.legScales) {
                for (let i = 0; i < this.legPairCount; i++) {
                    if (isFinite(prop.legScales[i])) {
                        this.rightLegs[i].scale = prop.legScales[i];
                        this.leftLegs[i].scale = prop.legScales[i];
                    }
                }
            }
            if (isFinite(prop.stepDuration)) {
                this.stepDurationMin = prop.stepDuration;
                this.stepDurationMax = prop.stepDuration;
            }
            if (isFinite(prop.stepDurationMin)) {
                this.stepDurationMin = prop.stepDurationMin;
            }
            if (isFinite(prop.stepDurationMax)) {
                this.stepDurationMax = prop.stepDurationMax;
            }
            if (isFinite(prop.stepHeight)) {
                this.stepHeightMin = prop.stepHeight;
                this.stepHeightMax = prop.stepHeight;
            }
            if (isFinite(prop.stepHeightMin)) {
                this.stepHeightMin = prop.stepHeightMin;
            }
            if (isFinite(prop.stepHeightMax)) {
                this.stepHeightMax = prop.stepHeightMax;
            }
            if (isFinite(prop.bootyShakiness)) {
                this.bootyShakiness = prop.bootyShakiness;
            }
            if (Mummu.IsFinite(prop.bodyLocalOffset)) {
                this.bodyLocalOffset = prop.bodyLocalOffset;
            }
            if (Mummu.IsFinite(prop.bodyWorldOffset)) {
                this.bodyWorldOffset = prop.bodyWorldOffset;
            }
            if (prop.scorpionTailProps) {
                this.tail = new Sumuqan.ScorpionTail(this, prop.scorpionTailProps);
            }
            this.debugPovMesh = Mummu.CreateSphereCut("debug-pov-mesh", {
                dir: BABYLON.Vector3.Forward(),
                alpha: this.povAlpha,
                betaMin: this.povBetaMin,
                betaMax: this.povBetaMax,
                rMin: this.povRadiusMin,
                rMax: this.povRadiusMax
            });
            this.debugPovMesh.parent = this;
            this.debugPovMesh.position = this.povOffset;
            this.debugPovMesh.isVisible = this._showCollisionDebug;
        }
        get showCollisionDebug() {
            return this._showCollisionDebug;
        }
        set showCollisionDebug(v) {
            this._showCollisionDebug = v;
            this.debugBodyCollidersMeshes.forEach(mesh => {
                mesh.isVisible = this._showCollisionDebug;
            });
            if (this.tail && this.tail.debugColliderMesh) {
                this.tail.debugColliderMesh.isVisible = this._showCollisionDebug;
            }
        }
        get showPOVDebug() {
            return this._showPOVDebug;
        }
        set showPOVDebug(v) {
            this._showPOVDebug = v;
            this.debugPovMesh.isVisible = this._showPOVDebug;
        }
        get debugColliderMaterial() {
            return this._debugColliderMaterial;
        }
        set debugColliderMaterial(mat) {
            this._debugColliderMaterial = mat;
            this.debugBodyCollidersMeshes.forEach(mesh => {
                mesh.material = this._debugColliderMaterial;
            });
            if (this.tail && this.tail.debugColliderMesh) {
                this.tail.debugColliderMesh.material = this._debugColliderMaterial;
            }
        }
        get debugColliderHitMaterial() {
            return this._debugColliderHitMaterial;
        }
        set debugColliderHitMaterial(mat) {
            this._debugColliderHitMaterial = mat;
        }
        get debugPovMaterial() {
            return this._debugPovMaterial;
        }
        set debugPovMaterial(mat) {
            if (this.debugPovMesh) {
                this.debugPovMesh.material = mat;
            }
            this._debugPovMaterial = mat;
        }
        get legCount() {
            return this.legPairCount * 2;
        }
        setFootTarget(v, index) {
            this.rightFootTargets[index].copyFrom(v);
            this.leftFootTargets[index].copyFrom(v);
            this.leftFootTargets[index].x *= -1;
        }
        get footThickness() {
            return this._footThickness;
        }
        setFootThickness(v) {
            this._footThickness = v;
            for (let i = 0; i < this.legPairCount; i++) {
                this.rightLegs[i].footThickness = this._footThickness;
                this.leftLegs[i].footThickness = this._footThickness;
            }
        }
        setPosition(p) {
            this.position.copyFrom(p);
            let m = this.computeWorldMatrix(true);
            for (let i = 0; i < this.legPairCount; i++) {
                BABYLON.Vector3.TransformCoordinatesToRef(this.rightFootTargets[i], m, this.rightLegs[i].footPos);
                BABYLON.Vector3.TransformCoordinatesToRef(this.leftFootTargets[i], m, this.leftLegs[i].footPos);
            }
            this.body.position.copyFrom(this.leftLegs[0].footPos).addInPlace(this.rightLegs[0].footPos).scaleInPlace(0.5);
            this.body.position.addInPlace(this.up.scale(0.5));
            this.body.computeWorldMatrix(true);
            for (let i = 0; i < this.legPairCount; i++) {
                BABYLON.Vector3.TransformCoordinatesToRef(this.leftHipAnchors[i], this.body.getWorldMatrix(), this.leftLegs[i].hipPos);
                BABYLON.Vector3.TransformCoordinatesToRef(this.rightHipAnchors[i], this.body.getWorldMatrix(), this.rightLegs[i].hipPos);
            }
            BABYLON.Vector3.TransformCoordinatesToRef(this.headAnchor, this.body.getWorldMatrix(), this.head.position);
        }
        async initialize() {
            this.getScene().onBeforeRenderObservable.add(this._update);
        }
        async step(leg, target, targetNorm, targetForward) {
            return new Promise(resolve => {
                let origin = leg.footPos.clone();
                let originNorm = leg.footUp.clone();
                let originForward = leg.footForward.clone();
                let destination = target.clone();
                let destinationNorm = targetNorm.clone();
                let destinationForward = targetForward.clone();
                let dist = 1.5 * BABYLON.Vector3.Distance(origin, destination);
                let hMax = Math.min(Math.max(this.stepHeightMin, dist), this.stepHeightMax);
                let duration = Math.min(Math.max(this.stepDurationMin, dist), this.stepDurationMax);
                duration *= 3 * (1 - this._fSpeed) + 1 * this._fSpeed;
                let t = 0;
                let animationCB = () => {
                    t += this.getScene().getEngine().getDeltaTime() / 1000;
                    let f = t / duration;
                    let h = Math.sqrt(Math.sin(f * Math.PI)) * hMax;
                    if (f < 1) {
                        let p = origin.scale(1 - f).addInPlace(destination.scale(f));
                        let n = originNorm.scale(1 - f).addInPlace(destinationNorm.scale(f)).normalize();
                        let forward = originForward.scale(1 - f).addInPlace(destinationForward.scale(f)).normalize();
                        //let n = this.up;
                        p.addInPlace(n.scale(h * dist * Math.sin(f * Math.PI)));
                        leg.footPos.copyFrom(p);
                        leg.footUp.copyFrom(n);
                        leg.footForward.copyFrom(forward);
                    }
                    else {
                        leg.footPos.copyFrom(destination);
                        leg.footUp.copyFrom(destinationNorm);
                        leg.footForward.copyFrom(destinationForward);
                        this.getScene().onBeforeRenderObservable.removeCallback(animationCB);
                        resolve();
                    }
                };
                this.getScene().onBeforeRenderObservable.add(animationCB);
            });
        }
        updateBodyCollidersMeshes() {
            while (this.debugBodyCollidersMeshes.length > 0) {
                this.debugBodyCollidersMeshes.pop().dispose();
            }
            for (let i = 0; i < this.bodyColliders.length; i++) {
                let collider = this.bodyColliders[i];
                let sphere = BABYLON.MeshBuilder.CreateSphere("bodycollider-" + i, { diameter: 2 * collider.radius });
                sphere.material = this._debugColliderMaterial;
                sphere.position.copyFrom(collider.localCenter);
                sphere.parent = collider.parent;
                sphere.isVisible = this._showCollisionDebug;
                this.debugBodyCollidersMeshes[i] = sphere;
            }
            if (this.tail) {
                this.tail.updateTailColliderMesh();
            }
        }
    }
    Sumuqan.Polypode = Polypode;
})(Sumuqan || (Sumuqan = {}));
var Sumuqan;
(function (Sumuqan) {
    class ScorpionTail extends BABYLON.Mesh {
        constructor(polypode, props) {
            super(polypode.name + "-tail-root");
            this.polypode = polypode;
            this.lace = 0;
            this.laceSpeed = 0;
            this.roll = 0;
            this.rollSpeed = 0;
            this.roll0 = 0;
            this.length = 0.5;
            this.tailSegments = [];
            this.parent = this.polypode.body;
            if (props.anchor) {
                this.position.copyFrom(props.anchor);
            }
            if (props.localDir) {
                this.rotationQuaternion = Mummu.QuaternionFromZYAxis(props.localDir, BABYLON.Axis.Y);
            }
            else {
                this.rotationQuaternion = Mummu.QuaternionFromZYAxis(new BABYLON.Vector3(0, 0, -1), BABYLON.Axis.Y);
            }
            let d = 0.3;
            if (isFinite(props.dist)) {
                d = props.dist;
            }
            this.tailSegments[0] = new BABYLON.Mesh("tail-0");
            this.tailSegments[0].parent = this;
            for (let i = 1; i < props.length; i++) {
                this.tailSegments[i] = new BABYLON.Mesh("tail-" + i);
                this.tailSegments[i].parent = this.tailSegments[i - 1];
                if (props.distances) {
                    this.tailSegments[i].position.z = props.distances[i];
                }
                else {
                    this.tailSegments[i].position.z = d;
                    if (isFinite(props.distGeometricFactor)) {
                        d *= props.distGeometricFactor;
                    }
                }
            }
            let updateTailRollTarget = () => {
                this.roll0 = Math.PI / 2 * Math.random();
                setTimeout(updateTailRollTarget, 5000 + Math.random() * 15000);
            };
            updateTailRollTarget();
        }
        update(dt) {
            if (isFinite(dt)) {
                this.debugColliderMesh.material = this.polypode.debugColliderMaterial;
                this.tailCollider.recomputeWorldCenter();
                let intersections = Mummu.SphereCollidersIntersection(this.tailCollider.center, this.tailCollider.radius, this.polypode.terrain);
                let n = intersections.length;
                for (let j = 0; j < n; j++) {
                    let intersection = intersections[j];
                    if (intersection.hit) {
                        let n = intersection.normal;
                        let dir = this.tailCollider.center.subtract(intersection.point).normalize().addInPlace(n).normalize();
                        let dotUp = BABYLON.Vector3.Dot(dir, this.polypode.up);
                        let dotRight = BABYLON.Vector3.Dot(dir, this.polypode.right);
                        this.rollSpeed += Math.PI * 0.1 * dotUp;
                        this.laceSpeed -= Math.PI * 0.1 * dotRight;
                        if (this.polypode.showCollisionDebug) {
                            this.debugColliderMesh.material = this.polypode.debugColliderHitMaterial;
                        }
                    }
                }
                this.laceSpeed -= 0.01 * this.lace;
                this.rollSpeed -= 0.01 * (this.roll - this.roll0);
                this.laceSpeed *= 0.95;
                this.rollSpeed *= 0.95;
                this.roll += this.rollSpeed * dt;
                this.roll = Nabu.MinMax(this.roll, 0, Math.PI / 2);
                this.lace += this.laceSpeed * dt;
                this.lace = Nabu.MinMax(this.lace, -Math.PI / 3, Math.PI / 3);
                this.tailSegments[0].rotation.x = -Math.PI / 5 * this.roll;
                this.tailSegments[0].rotation.z = -Math.PI / 8 * this.lace;
                for (let i = 1; i < 7; i++) {
                    this.tailSegments[i].rotation.x = -Math.PI / 6 * this.roll;
                    let f = 1 - i / 6;
                    this.tailSegments[i].rotation.z = -Math.PI / 8 * this.lace * f * f;
                }
            }
        }
        updateTailColliderMesh() {
            if (this.debugColliderMesh) {
                this.debugColliderMesh.dispose();
            }
            this.debugColliderMesh = BABYLON.MeshBuilder.CreateSphere("tail-collider", { diameter: 2 * this.tailCollider.radius });
            this.debugColliderMesh.material = this.polypode.debugColliderMaterial;
            this.debugColliderMesh.parent = this.tailCollider.parent;
            this.debugColliderMesh.isVisible = this.polypode.showCollisionDebug;
        }
    }
    Sumuqan.ScorpionTail = ScorpionTail;
})(Sumuqan || (Sumuqan = {}));
var Sumuqan;
(function (Sumuqan) {
    class Walker extends BABYLON.Mesh {
        constructor(name) {
            super(name);
            this.leftHipAnchor = new BABYLON.Vector3(-0.5, 0, 0);
            this.rightHipAnchor = new BABYLON.Vector3(0.5, 0, 0);
            this.headAnchor = new BABYLON.Vector3(0, 0, 0.75);
            this._footTarget = new BABYLON.Vector3(0.5, -0.5, 0);
            this._footThickness = 1.2;
            this._stepping = 0;
            this._update = () => {
                BABYLON.Vector3.TransformCoordinatesToRef(this.leftHipAnchor, this.body.getWorldMatrix(), this.leftLeg.hipPos);
                BABYLON.Vector3.TransformCoordinatesToRef(this.rightHipAnchor, this.body.getWorldMatrix(), this.rightLeg.hipPos);
                BABYLON.Vector3.TransformCoordinatesToRef(this.headAnchor, this.body.getWorldMatrix(), this.head.position);
                this.leftLeg.right = this.right;
                this.leftLeg.up = this.up;
                this.leftLeg.forward = this.forward;
                this.rightLeg.right = this.right;
                this.rightLeg.up = this.up;
                this.rightLeg.forward = this.forward;
                if (this._stepping === 0) {
                    let dRight = 0;
                    let dLeft = 0;
                    let rayRight = new BABYLON.Ray(this.rightFootTarget.absolutePosition.add(this.up), this.up.scale(-2));
                    let pickRight = this.getScene().pickWithRay(rayRight, this.terrainFilter);
                    let targetRight;
                    if (pickRight.hit && pickRight.pickedPoint) {
                        targetRight = pickRight.pickedPoint.add(pickRight.getNormal(true, true).scale(this.rightLeg.footThickness));
                        dRight = BABYLON.Vector3.DistanceSquared(this.rightLeg.footPos, targetRight);
                    }
                    let rayLeft = new BABYLON.Ray(this.leftFootTarget.absolutePosition.add(this.up), this.up.scale(-2));
                    let pickLeft = this.getScene().pickWithRay(rayLeft, this.terrainFilter);
                    let targetLeft;
                    if (pickLeft.hit && pickLeft.pickedPoint) {
                        targetLeft = pickLeft.pickedPoint.add(pickLeft.getNormal(true, true).scale(this.leftLeg.footThickness));
                        dLeft = BABYLON.Vector3.DistanceSquared(this.leftLeg.footPos, targetLeft);
                    }
                    if (Math.max(dRight, dLeft) > 0.01) {
                        this._stepping = 1;
                        if (dLeft > dRight) {
                            this.step(this.leftLeg, targetLeft, pickLeft.getNormal(true, true), this.forward).then(() => { this._stepping = 0; });
                        }
                        else {
                            this.step(this.rightLeg, targetRight, pickRight.getNormal(true, true), this.forward).then(() => { this._stepping = 0; });
                        }
                    }
                }
                this.leftLeg.updatePositions();
                this.rightLeg.updatePositions();
                let bodyPos = this.leftLeg.footPos.add(this.rightLeg.footPos).scaleInPlace(0.5);
                let offset = this.rightFootTarget.position.add(this.leftFootTarget.position).scale(0.5);
                BABYLON.Vector3.TransformNormalToRef(offset, this.getWorldMatrix(), offset);
                bodyPos.subtractInPlace(offset);
                let bodyQuat = BABYLON.Quaternion.Identity();
                Mummu.QuaternionFromYZAxisToRef(this.leftLeg.footUp.add(this.rightLeg.footUp), this.forward, bodyQuat);
                let feetQuat = BABYLON.Quaternion.Identity();
                Mummu.QuaternionFromXZAxisToRef(this.rightLeg.foot.absolutePosition.subtract(this.leftLeg.foot.absolutePosition), this.forward, feetQuat);
                BABYLON.Quaternion.SlerpToRef(feetQuat, bodyQuat, 0.5, bodyQuat);
                BABYLON.Quaternion.SlerpToRef(this.body.rotationQuaternion, bodyQuat, 0.05, this.body.rotationQuaternion);
                Mummu.QuaternionFromZYAxisToRef(this.forward, this.up, this.head.rotationQuaternion);
                BABYLON.Vector3.LerpToRef(bodyPos, this.position, 0.2, this.body.position);
            };
            this.body = BABYLON.MeshBuilder.CreateSphere("body", { diameterX: 1, diameterY: 1, diameterZ: 1.5 });
            this.body.rotationQuaternion = BABYLON.Quaternion.Identity();
            this.head = BABYLON.MeshBuilder.CreateSphere("head", { diameterX: 0.5, diameterY: 0.5, diameterZ: 0.75 });
            this.head.rotationQuaternion = BABYLON.Quaternion.Identity();
            this.leftLeg = new Sumuqan.Leg(true);
            this.rightLeg = new Sumuqan.Leg();
            this.rightFootTarget = new BABYLON.Mesh("right-foot-target");
            this.rightFootTarget.parent = this;
            this.rightFootTarget.position.copyFrom(this.footTarget);
            this.leftFootTarget = new BABYLON.Mesh("left-foot-target");
            this.leftFootTarget.parent = this;
            this.leftFootTarget.position.copyFrom(this.footTarget);
            this.leftFootTarget.position.x *= -1;
        }
        get footTarget() {
            return this._footTarget;
        }
        set footTarget(v) {
            this._footTarget = v;
            this.rightFootTarget.position.copyFrom(this.footTarget);
            this.leftFootTarget.position.copyFrom(this.footTarget);
            this.leftFootTarget.position.x *= -1;
        }
        get footThickness() {
            return this._footThickness;
        }
        set footThickness(v) {
            this._footThickness = v;
            this.rightLeg.footThickness = this._footThickness;
            this.leftLeg.footThickness = this._footThickness;
        }
        setPosition(p) {
            this.position.copyFrom(p);
            this.computeWorldMatrix(true);
            this.rightFootTarget.computeWorldMatrix(true);
            this.leftFootTarget.computeWorldMatrix(true);
            this.rightLeg.footPos.copyFrom(this.rightFootTarget.absolutePosition);
            this.leftLeg.footPos.copyFrom(this.rightFootTarget.absolutePosition);
            this.body.position.copyFrom(this.leftLeg.footPos).addInPlace(this.rightLeg.footPos).scaleInPlace(0.5);
            this.body.position.addInPlace(this.up.scale(0.5));
            this.body.computeWorldMatrix(true);
            BABYLON.Vector3.TransformCoordinatesToRef(this.leftHipAnchor, this.body.getWorldMatrix(), this.leftLeg.hipPos);
            BABYLON.Vector3.TransformCoordinatesToRef(this.rightHipAnchor, this.body.getWorldMatrix(), this.rightLeg.hipPos);
            BABYLON.Vector3.TransformCoordinatesToRef(this.headAnchor, this.body.getWorldMatrix(), this.head.position);
        }
        async initialize() {
            this.getScene().onBeforeRenderObservable.add(this._update);
        }
        async step(leg, target, targetNorm, targetForward) {
            return new Promise(resolve => {
                let origin = leg.footPos.clone();
                let originNorm = leg.footUp.clone();
                let originForward = leg.footForward.clone();
                let destination = target.clone();
                let destinationNorm = targetNorm.clone();
                let destinationForward = targetForward.clone();
                let dist = BABYLON.Vector3.Distance(origin, destination);
                let hMax = Math.min(Math.max(0.5, dist), 0.2);
                //let duration = Math.min(0.5, 2 * dist);
                let duration = 0.7;
                let t = 0;
                let animationCB = () => {
                    t += this.getScene().getEngine().getDeltaTime() / 1000;
                    let f = t / duration;
                    let h = Math.sqrt(Math.sin(f * Math.PI)) * hMax;
                    if (f < 1) {
                        let p = origin.scale(1 - f).addInPlace(destination.scale(f));
                        let n = originNorm.scale(1 - f).addInPlace(destinationNorm.scale(f)).normalize();
                        let forward = originForward.scale(1 - f).addInPlace(destinationForward.scale(f)).normalize();
                        //let n = this.up;
                        p.addInPlace(n.scale(h * dist * Math.sin(f * Math.PI)));
                        leg.footPos.copyFrom(p);
                        leg.footUp.copyFrom(n);
                        leg.footForward.copyFrom(forward);
                    }
                    else {
                        leg.footPos.copyFrom(destination);
                        leg.footUp.copyFrom(destinationNorm);
                        leg.footForward.copyFrom(destinationForward);
                        this.getScene().onBeforeRenderObservable.removeCallback(animationCB);
                        resolve();
                    }
                };
                this.getScene().onBeforeRenderObservable.add(animationCB);
            });
        }
    }
    Sumuqan.Walker = Walker;
})(Sumuqan || (Sumuqan = {}));
