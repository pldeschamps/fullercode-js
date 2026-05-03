class UnitSphereCartesian {
    constructor(cesiumCartesian){
        //console.log("UnitSphereCartesian: cesiumCartesian", cesiumCartesian);
        const latRad = cesiumCartesian.latitude;
        //console.log("UnitSphereCartesian: latDeg", Cesium.Math.toDegrees(latRad));
        const lonRad = cesiumCartesian.longitude;
        const cosLat = Math.cos(latRad);
        this.x = cosLat * Math.cos(lonRad);
        this.y = cosLat * Math.sin(lonRad);
        this.z = Math.sin(latRad);
    }
}
window.UnitSphereCartesian = UnitSphereCartesian;