//Cartesian3.js

class CartesianCoord {
    constructor(x, y, z) {
        // If x is an object (cartesian), normalize it
        if (typeof x === 'object' && x !== null && !isNaN(x.x)) {
            const cartesian = x;
            const length = Math.sqrt(cartesian.x * cartesian.x + cartesian.y * cartesian.y + cartesian.z * cartesian.z);
            this.x = cartesian.x / length;
            this.y = cartesian.y / length;
            this.z = cartesian.z / length;
        } else {
            // Otherwise treat as three separate coordinates
            const length = Math.sqrt(x * x + y * y + z * z);
            this.x = x/ length;
            this.y = y/ length;
            this.z = z/ length;
        }
    }
    static cross_product(a, b) {
        return new CartesianCoord(
            a.y * b.z - a.z * b.y,
            a.z * b.x - a.x * b.z,
            a.x * b.y - a.y * b.x
        );
    }
    static dot_product(a, b) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }
}
window.CartesianCoord = CartesianCoord;