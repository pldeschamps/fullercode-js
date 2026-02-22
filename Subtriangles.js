class Subtriangles {
    constructor(faceGeoPos) {
        this.faceGeoPos = faceGeoPos;
        this.a = this.faceGeoPos.vertices[0];
        this.b = this.faceGeoPos.vertices[1];
        this.c = this.faceGeoPos.vertices[2];

// Naming convention for points and mid-points:
//
//                   a [0]               
//                   /\                  
//                  /1 \                 
//            ac_a /____\ a_ab          
//                /\  2 /\               
//               /15\  /3 \              
//           ac /__ ac_ab _\ ab         
//             /\ 14 /\  4 /\            
//            /13\  /0 \  / 5\           
//      c_ac /_ bc_ac  ab_bc _\ ab_b     
//          /\12  /\    /\    /\         
//         /11\  /10\ 9/ 8\ 7/6 \        
//        /____\/____\/____\/____\       
//   [2] c    bc_c   bc    b_bc   b [1] 
//

        // First-level midpoints
        this.ab = Subtriangles.midpoint(this.a, this.b);
        this.bc = Subtriangles.midpoint(this.b, this.c);
        this.ac = Subtriangles.midpoint(this.a, this.c);

        // KISS: Keep It Simple Stupid
        // ac_ab is (ac+ab)/||ac+ab||

        // Second-level midpoints
        this.ac_ab = Subtriangles.midpoint(this.ac, this.ab);
        this.ab_bc = Subtriangles.midpoint(this.ab, this.bc);
        this.bc_ac = Subtriangles.midpoint(this.bc, this.ac);

        this.a_ab = Subtriangles.midpoint(this.a, this.ab);
        //console.log("a: ",this.a);
        this.ab_b = Subtriangles.midpoint(this.ab, this.b);
        this.b_bc = Subtriangles.midpoint(this.b, this.bc);
        this.bc_c = Subtriangles.midpoint(this.bc, this.c);
        this.c_ac = Subtriangles.midpoint(this.c, this.ac);
        this.ac_a = Subtriangles.midpoint(this.ac, this.a);

        this.faceGeoPos.ab = this.ab;
        this.faceGeoPos.bc = this.bc;
        this.faceGeoPos.ac = this.ac;
        this.faceGeoPos.ac_ab = this.ac_ab;
        this.faceGeoPos.ab_bc = this.ab_bc;
        this.faceGeoPos.bc_ac = this.bc_ac;
        this.faceGeoPos.a_ab = this.a_ab;
        this.faceGeoPos.ab_b = this.ab_b;
        this.faceGeoPos.b_bc = this.b_bc;
        this.faceGeoPos.bc_c = this.bc_c;
        this.faceGeoPos.c_ac = this.c_ac;
        this.faceGeoPos.ac_a = this.ac_a;



        //  strangely, the following point is not equal to this.ab_bc
        //  this.ac_ab_b_bc = Subtriangles.midpoint(this.ac_ab, this.b_bc);
        // Why is this.ac_ab_b_bc != this.ab_bc ? Because in spherical geometry, it is not possible
        // to divide a spherical triangle into four similar spherical triangles by connecting the midpoints of its sides.
        //console.log(faceGeoPos.subtrianglesIds);

        // If faceGeoPos.faceId is one character long, faceGeoPos is a face of the icosahedron,
        // and subtrianglesIds should be named according to faceGeoPos.subtrianglesIds
        // But if faceGeoPos.faceId is longer than one character, faceGeoPos is already a subtriangle,
        // and subtrianglesIds should be named depending on their orientation within faceGeoPos
        // to prevent their last character from being the same as their neighbours'one.
        let ids = [];
        let up = faceGeoPos.parentOrientation;
        //let down = false;
        //console.log(faceGeoPos.faceId.length);
        //console.log(!faceGeoPos.parentOrientation);
        if (faceGeoPos.faceId.length > 1 && !faceGeoPos.parentOrientation) {
            // console.log("faceId: ",faceGeoPos.faceId, " is down");
            // faceGeoPos is a down triangle, so we change the orientation of its subtriangles
            // according to the following Straight P-box mapping:
            //original pattern: 0, 1, 2, 3, 4, 5,  6,  7,  8,  9,  10, 11, 12, 13, 14, 15
            const pBox =       [0, 2, 1, 8, 9, 10, 7,  6,  13, 14, 15, 12, 11, 3,  4,  5];
            //    const pBox = [0, 2, 1, 8, 9, 10, 12, 11, 13, 14, 15, 7,  6,  3,  4,  5];
            for (let i = 0; i < 16; i++) {
                ids[i] = faceGeoPos.subtrianglesIds[pBox[i]];
            }
            //up = !faceGeoPos.parentOrientation;
            //down = true;

        } else {
            // faceGeoPos is an up triangle, so we keep the orientation of its subtriangles
            ids = faceGeoPos.subtrianglesIds.split('');
        }
        faceGeoPos.ids = ids;
        // console.log(ids[0]);
        // console.log("A: ",[this.a, this.a_ab, this.ac_a]);
        // Define 16 subtriangles (each as a FacesGeoPositions)
        // console.log("faceId: ",this.faceGeoPos.faceId + ids[0], " up: ", up);

        //The vertices are clockwise in order to calculate if a point is inside the triangle:
        this.subFaces = [
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[0], [this.ac_ab, this.ab_bc, this.bc_ac], faceGeoPos.subtrianglesIds,up),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[1], [this.a, this.a_ab, this.ac_a], faceGeoPos.subtrianglesIds,up),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[2], [this.ac_ab, this.ac_a, this.a_ab], faceGeoPos.subtrianglesIds,!up),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[3], [this.a_ab, this.ab, this.ac_ab], faceGeoPos.subtrianglesIds,up),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[4], [this.ab_bc, this.ac_ab, this.ab], faceGeoPos.subtrianglesIds,!up),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[5], [this.ab, this.ab_b, this.ab_bc], faceGeoPos.subtrianglesIds,up),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[6], [this.ab_b, this.b, this.b_bc], faceGeoPos.subtrianglesIds,up),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[7], [this.b_bc, this.ab_bc, this.ab_b], faceGeoPos.subtrianglesIds,!up),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[8], [this.ab_bc, this.b_bc, this.bc], faceGeoPos.subtrianglesIds,up),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[9], [this.bc, this.bc_ac, this.ab_bc], faceGeoPos.subtrianglesIds,!up),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[10], [this.bc_ac, this.bc, this.bc_c], faceGeoPos.subtrianglesIds,up),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[11], [this.c_ac, this.bc_c, this.c], faceGeoPos.subtrianglesIds,up),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[12], [this.bc_c, this.c_ac, this.bc_ac], faceGeoPos.subtrianglesIds,!up),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[13], [this.ac, this.bc_ac, this.c_ac], faceGeoPos.subtrianglesIds,up),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[14], [this.bc_ac, this.ac, this.ac_ab], faceGeoPos.subtrianglesIds,!up),
            new FaceGeoPositions(this.faceGeoPos.faceId + ids[15], [this.ac_a, this.ac_ab, this.ac], faceGeoPos.subtrianglesIds,up)
        ];
    }

    // Static method to compute the midpoint between two Cesium.Cartesian3 points, normalized to the sphere
    static midpoint(p1, p2, radius = 6371010) {
        const x = p1.x + p2.x;
        const y = p1.y + p2.y;
        const z = p1.z + p2.z;
        const length = Math.sqrt(x * x + y * y + z * z);
        return new Cesium.Cartesian3(
            (x / length) * radius,
            (y / length) * radius,
            (z / length) * radius
        );
    }
    //statimethod to compute the gravity center of three Cesium.Cartesian3 points
    static gravityCenter(p1, p2, p3, radius = 6371010) {
        const x = p1.x + p2.x + p3.x;
        const y = p1.y + p2.y + p3.y;
        const z = p1.z + p2.z + p3.z;
        const length = Math.sqrt(x * x + y * y + z * z);
        return new Cesium.Cartesian3(
            (x / length) * radius,
            (y / length) * radius,
            (z / length) * radius
        );
    }
    //static method to compute the vectorial product normalized
    static orthogonalVector(p1, p2) {
        const v = Subtriangles.vectorialProduct(p1, p2);
        return Subtriangles.normalizeVector(v);
    }
    //static method to normalize a Cesium.Cartesian3 vector
    static normalizeVector(v) {
        const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
        return new Cesium.Cartesian3(
            v.x / length,
            v.y / length,
            v.z / length
        );
    }
    //static method to compute the vectorial product of two Cesium.Cartesian3 points
    static vectorialProduct(p1, p2) {
        return new Cesium.Cartesian3(
            p1.y * p2.z - p1.z * p2.y,
            p1.z * p2.x - p1.x * p2.z,
            p1.x * p2.y - p1.y * p2.x
        );
    }
    //static method to compute the rotation of p1 toward p2 around the axis orthogonal to (p1,p2) by angle (in radians)
    static rotateTowards(p1, p2, angle) {
        const axis = Subtriangles.orthogonalVector(p1, p2);
        //console.log("axis: ",axis);
        const {x, y, z} = axis;
        if (x === 0 && y === 0 && z === 0) return p1; // colinear case

        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        const dot = p1.x * x + p1.y*y + p1.z*z;
        //console.log("p1.x: ",p1.x);
        // Rodrigues' rotation formula
        const term1 = [
            p1.x * cosA,
            p1.y * cosA,
            p1.z * cosA
        ];
        //console.log("term1: ",term1);
        const term2 = [
            (y * p1.z - z * p1.y) * sinA,
            (z * p1.x - x * p1.z) * sinA,
            (x * p1.y - y * p1.x) * sinA
        ];
        const term3 = [
             x * dot * (1 - cosA),
             y * dot * (1 - cosA),
             z * dot * (1 - cosA)
        ];
        //console.log("term1[0] + term2[0] + term3[0]: ",term1[0] + term2[0] + term3[0]);
        return new Cesium.Cartesian3(
            term1[0] + term2[0] + term3[0],
            term1[1] + term2[1] + term3[1],
            term1[2] + term2[2] + term3[2]
        );
        
    }
}

// Make it globally available
window.Subtriangles = Subtriangles;