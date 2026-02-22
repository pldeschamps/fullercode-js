class FaceGeoPositions {
    constructor(faceId, vertices,subtrianglesIds,parentOrientation=true) {
        this.faceId = faceId;
        this.vertices = vertices; // Array of Cesium.Cartesian3
        this.subtrianglesIds = subtrianglesIds; // String of subtriangle IDs
        this.center = this.computeCenter();
        this.parentOrientation = parentOrientation; // true for up, false for down
        this.ab;
        this.bc;
        this.ac;
        this.ac_ab;
        this.ab_bc;
        this.bc_ac;
        this.a_ab;
        this.ab_b;
        this.b_bc;
        this.bc_c;
        this.c_ac;
        this.ac_a;
        this.ids=[];
    }

    // Compute the centroid in Cartesian coordinates
    computeCenter() {
        if (this.vertices.length !== 3) return null;
        //console.log("this.vertices[0].x:", this.vertices[0].x);
        let x = (this.vertices[0].x + this.vertices[1].x + this.vertices[2].x) ;
        let y = (this.vertices[0].y + this.vertices[1].y + this.vertices[2].y) ;
        let z = (this.vertices[0].z + this.vertices[1].z + this.vertices[2].z) ;
        const length = Math.sqrt(x * x + y * y + z * z);
        x = x / length * 6371010;
        y = y / length * 6371010;
        z = z / length * 6371010;
        //console.log("x after normalization:", x);
        return new Cesium.Cartesian3(x, y, z);
    }
}

// Make it globally available
window.FaceGeoPositions = FaceGeoPositions;