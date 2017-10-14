var RAD2DEG = 180 / Math.PI;
var PI_4 = Math.PI / 4;

class Tools {
    public static LonToX(lon: number): number {
        return lon * 1000 - Main.medX;
    }

    public static LatToZ(lat: number): number {
        return Math.log(Math.tan((lat / 90 + 1) * PI_4 )) * RAD2DEG * 1000 - Main.medZ;
    }

    public static XToLon(x: number): number {
        return (x + Main.medX) / 1000;
    }
    
    public static ZToLat(z: number): number {
        return (Math.atan(Math.exp((z + Main.medZ) / 1000 / RAD2DEG)) / PI_4 - 1) * 90;
    }
}