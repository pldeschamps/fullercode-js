// vectorOps.js

/**
 * Produit scalaire entre deux vecteurs CartesianCoord
 * @param {CartesianCoord} a
 * @param {CartesianCoord} b
 * @returns {number}
 */
function dot_product(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

/**
 * Produit vectoriel entre deux vecteurs CartesianCoord
 * @param {CartesianCoord} a
 * @param {CartesianCoord} b
 * @returns {CartesianCoord}
 */
function cross_product(a, b) {
  const x = a.y * b.z - a.z * b.y;
  const y = a.z * b.x - a.x * b.z;
  const z = a.x * b.y - a.y * b.x;
  return new CartesianCoord(x, y, z);
}

// midpoint between two Cesium.Cartesian3 points, normalized to the sphere
function midpoint(p1, p2, radius = 6371010) {
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

window.dot_product = dot_product;
window.cross_product = cross_product;
window.midpoint = midpoint;