var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Side;
(function (Side) {
    Side[Side["Right"] = 0] = "Right";
    Side[Side["Left"] = 1] = "Left";
    Side[Side["Top"] = 2] = "Top";
    Side[Side["Bottom"] = 3] = "Bottom";
    Side[Side["Front"] = 4] = "Front";
    Side[Side["Back"] = 5] = "Back";
})(Side || (Side = {}));
var PlanetSide = (function (_super) {
    __extends(PlanetSide, _super);
    function PlanetSide(side, planet) {
        var _this = this;
        var name = "side-" + side;
        _this = _super.call(this, name, Game.Instance.getScene()) || this;
        _this.planet = planet;
        _this.side = side;
        _this.chuncksLength = _this.GetSize() / PlanetTools.CHUNCKSIZE;
        _this.rotationQuaternion = PlanetTools.QuaternionForSide(_this.side);
        _this.chuncks = new Array();
        for (var i = 0; i < _this.chuncksLength; i++) {
            _this.chuncks[i] = new Array();
            for (var j = 0; j < _this.chuncksLength; j++) {
                _this.chuncks[i][j] = new Array();
                for (var k = 0; k < _this.chuncksLength; k++) {
                    _this.chuncks[i][j][k] = new PlanetChunck(i, j, k, _this);
                    _this.chuncks[i][j][k].parent = _this;
                }
            }
        }
        return _this;
    }
    PlanetSide.prototype.GetSize = function () {
        return this.planet.GetSize();
    };
    PlanetSide.prototype.Initialize = function () {
        for (var i = 0; i < this.chuncksLength; i++) {
            for (var j = 0; j < this.chuncksLength; j++) {
                for (var k = 0; k < this.chuncksLength; k++) {
                    this.chuncks[i][j][k].Initialize();
                }
            }
        }
    };
    return PlanetSide;
}(BABYLON.Mesh));
