var RAD2DEG = 180 / Math.PI;
var PI_4 = Math.PI / 4;

class Tools {
    public static LonToX(lon: number): number {
        return lon * 1250 - Main.medX;
    }

    public static LatToZ(lat: number): number {
        return Math.log(Math.tan((lat / 90 + 1) * PI_4 )) * RAD2DEG * 1250 - Main.medZ;
    }

    public static XToLon(x: number): number {
        return (x + Main.medX) / 1250;
    }
    
    public static ZToLat(z: number): number {
        return (Math.atan(Math.exp((z + Main.medZ) / 1250 / RAD2DEG)) / PI_4 - 1) * 90;
    }
}

/*
class Tools {
    public static LonToX(lon: number): number {
        return (lon - Main.medLon) * 2000;
    }

    public static LatToZ(lat: number): number {
        return (lat - Main.medLat) * 2000;
    }


    public static XToLon(x: number): number {
        return x / 2000 + Main.medLon;
    }
    
    public static ZToLat(z: number): number {
        return z / 2000 + Main.medLat;
    }
}
*/