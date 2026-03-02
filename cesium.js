// cesium.js

// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.

//Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1MDk0NDgwMS03NmEzLTQ0MzQtOTc3Ny02MmNmNDg2ZGY3MTUiLCJpZCI6MzQ1MTMzLCJpYXQiOjE3NTg5OTA0MTN9.1aWmnRsHn8Z70pU5B7gJhQOLrarcr4SGf6GxTuPB0Xs';
Cesium.Ion.defaultAccessToken = null;

// const naturalEarthProvider = await Cesium.TileMapServiceImageryProvider.fromUrl(
//   Cesium.buildModuleUrl("Assets/Textures/NaturalEarthII")
// );
const osm = new Cesium.OpenStreetMapImageryProvider({
    url : 'https://tile.openstreetmap.org/'
});
window.viewer = new Cesium.Viewer('cesiumContainer', {
    // baseLayer: Cesium.ImageryLayer.fromProviderAsync(
    //     Cesium.TileMapServiceImageryProvider.fromUrl(
    //         Cesium.buildModuleUrl("Assets/Textures/NaturalEarthII"),
    //     ),
    // ),
    imageryProvider: osm,
    animation: false,
    timeline: false,
    geocoder: false,
    skyBox: false,
    skyatmosphere: false,
    sun: false,
    moon: false,
});
window.viewer.imageryLayers.addImageryProvider(osm);
//window.viewer.imageryLayers.raiseToTop(osm);
const cameraLabel = document.createElement("div");
cameraLabel.id = "cameraWidget";
cameraLabel.textContent = "Lat: - Lon: - Alt: -";
window.viewer.container.appendChild(cameraLabel);
const fullerCodeLabel = document.createElement("div");
fullerCodeLabel.id = "fullerCodeWidget";
fullerCodeLabel.textContent = "fullercode: ";
window.viewer.container.appendChild(fullerCodeLabel);

// Copy button to the right of the fullerCodeWidget
const fullerCodeCopyBtn = document.createElement('button');
fullerCodeCopyBtn.id = 'fullerCodeCopy';
fullerCodeCopyBtn.type = 'button';
fullerCodeCopyBtn.textContent = 'Copy';
// use a CSS class for styling; JS will position the button (left/top)
fullerCodeCopyBtn.className = 'fullerCodeCopy';
fullerCodeCopyBtn.setAttribute('aria-label', 'Copy fullercode link');

window.viewer.container.appendChild(fullerCodeCopyBtn);

function positionCopyButton() {
    // Position the copy button to the right of the fullerCodeLabel
    try {
        const rect = fullerCodeLabel.getBoundingClientRect();
        // viewer.container is positioned; compute left relative to container
        const containerRect = window.viewer.container.getBoundingClientRect();
        const left = rect.right - containerRect.left + 8; // 8px gap
        fullerCodeCopyBtn.style.left = left + 'px';
        // align vertically with label
        fullerCodeCopyBtn.style.top = (rect.top - containerRect.top) + 'px';
    } catch (e) {
        // fallback
        fullerCodeCopyBtn.style.left = '220px';
    }
}

// initial position and on resize
positionCopyButton();
window.addEventListener('resize', positionCopyButton);

// Copy handler: build URL and copy to clipboard
async function copyFullercodeLink() {
    // Extract only the last word (the actual code) from the label text.
    // Example: "fullercode: XF" -> "XF"
    const labelText = (fullerCodeLabel.textContent || '').trim();
    console.log('labelText:', labelText);
    const match = labelText.match(/([A-Z0-9]+)$/i);
    let code = match ? match[1].toUpperCase() : '';
    // If label didn't contain a code yet, fall back to the input value
    if (!code) code = (fullerCodeInput.value || '').trim().toUpperCase();
    // Build base URL (use canonical host); change if you prefer dynamic origin
    const base = 'https://www.fullercode.org/index.html';
    const hash = code ? ('#' + code) : '';
    const url = base + hash;

    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(url);
        } else {
            // fallback
            const ta = document.createElement('textarea');
            ta.value = url;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
        }
        // feedback
        const old = fullerCodeCopyBtn.textContent;
        fullerCodeCopyBtn.textContent = 'Copied!';
        setTimeout(() => { fullerCodeCopyBtn.textContent = old; }, 1500);
    } catch (err) {
        console.error('Copy failed', err);
        fullerCodeCopyBtn.textContent = 'Failed';
        setTimeout(() => { fullerCodeCopyBtn.textContent = 'Copy'; }, 1500);
    }
}

fullerCodeCopyBtn.addEventListener('click', copyFullercodeLink);

const fullerCodeInput = document.createElement("input");
fullerCodeInput.id = "fullerCodeInput";
fullerCodeInput.type = "text";
fullerCodeInput.placeholder = "Enter fullercode...";
window.viewer.container.appendChild(fullerCodeInput);
let cameraHeight = 100000;
// Enforce uppercase and allowed-character rules:
// - first character allowed set: "CM3FA2H5PX9V8TR7NSJK"
// - following characters allowed set: "CM3FA2H5PX9V8TR7"
const MAX_FULLERCODE_LEN = 12;
const ALLOWED_FIRST = "CM3FA2H5PX9V8TR7NSJK";
const ALLOWED_REST = "CM3FA2H5PX9V8TR7";
fullerCodeInput.maxLength = MAX_FULLERCODE_LEN;
fullerCodeInput.addEventListener('input', function (e) {
    // force uppercase and filter invalid characters
    const raw = (this.value || '').toUpperCase();
    let filtered = '';
    for (let i = 0; i < raw.length && filtered.length < MAX_FULLERCODE_LEN; i++) {
        const ch = raw[i];
        if (i === 0) {
            if (ALLOWED_FIRST.indexOf(ch) !== -1) filtered += ch;
        } else {
            if (ALLOWED_REST.indexOf(ch) !== -1) filtered += ch;
        }
    }

    // If filtering removed or changed characters, update the input value
    if (this.value !== filtered) {
        this.value = filtered;
    }

    // adjust camera height heuristically based on code length (keeps previous behaviour)
    if (filtered.length > 1) {
        const idx = Math.min(filtered.length - 1, window.LevelHeights.length - 1);
        const prevIdx = Math.max(filtered.length - 2, 0);
        cameraHeight = (window.LevelHeights[idx] + window.LevelHeights[prevIdx]) / 2;
    }  else {
        cameraHeight = 7000000; // default
    }
});

fullerCodeInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const code = this.value.trim();
        flyToCode(code);
    }
});

function flyToCode(code) {
    // Safety checks
    if (!code || code.length === 0)  {
        console.log('invalid code');
        return;
    } else {
        if (!window.fullerData || !window.fullerData.viewer) {
            console.log('Cannot fly: data not ready');
            return;
        }
    }
   

    // Find the triangle with matching fullercode
    let targetTriangle = window.triangles.find(t => t.faceId === code);
    
    // If not found, try to create the necessary subtriangles
    if (!targetTriangle) {
        try {
            createLevels(code.length);
            for (let i = 1; i <= code.length; i++) {
                const partialCode = code.substring(0, i);
                console.log("Creating subtriangle for:", partialCode);
                const subTriangle = window.triangles.find(t => t.faceId === partialCode);
                if (subTriangle) {
                    addSubtriangles(subTriangle, i-1);
                } else {
                    console.log('Could not find parent triangle for:', partialCode);
                }
            }
            // Try to find the target triangle again
            targetTriangle = window.triangles.find(t => t.faceId === code);
        } catch (e) {
            console.error('Error creating subtriangles:', e);
        }
    }

    if (targetTriangle) {
        try {
            // Convert center position to get latitude and longitude
            const cartographic = Cesium.Cartographic.fromCartesian(targetTriangle.center);
            const destinationPosition = Cesium.Cartesian3.fromRadians(
                cartographic.longitude,
                cartographic.latitude,
                cameraHeight // Use height computed by input handler
            );
            // Move camera to the target triangle's center with specified height
            window.viewer.camera.flyTo({
                destination: destinationPosition,
                orientation: {
                    heading: 0.0,
                    pitch: -Cesium.Math.PI_OVER_TWO,
                    roll: 0.0
                }
            });
        } catch (e) {
            console.error('Error flying to triangle:', e);
        }
    } else {
        console.log('Fullercode not found:', code);
    }
}


window.scene = window.viewer.scene;

// Parse a fullercode from the URL and attempt to fly to it.
// Acceptable URL formats:
//  - https://example.com/?MAXTT5V
//  - https://example.com/@MAXTT5V
//  - any location containing '?CODE' or '/@CODE'
function parseFullercodeFromUrl() {
    const MAX = MAX_FULLERCODE_LEN;
    let code = null;

    // 1) Check hash fragment first (safe for static servers): e.g. index.html#@MTV or index.html#MTV
    if (window.location.hash && window.location.hash.length > 1) {
        // remove leading '#'
        let h = window.location.hash.substring(1);
        // allow optional leading '@'
        if (h.startsWith('@')) h = h.substring(1);
        if (h.length > 0) code = h.split(/[\/?&#]/)[0];
    }

    // 2) then query/search (e.g. ?MAXTT5V or ?code=MAXTT5V)
    if (!code && window.location.search && window.location.search.length > 1) {
        const raw = window.location.search.substring(1);
        if (raw.indexOf('=') === -1) {
            code = raw.split('&')[0];
        } else {
            const pairs = raw.split('&');
            for (const p of pairs) {
                const parts = p.split('=');
                if (parts.length === 2 && parts[1]) {
                    const val = parts[1].toUpperCase().replace(/[^A-Z0-9]/g,'');
                    if (val.length > 0) { code = val; break; }
                }
            }
        }
    }

    // 3) fallback: look for '@' in href (works only if server serves the path back to index.html)
    if (!code) {
        const href = window.location.href;
        const atIndex = href.indexOf('/@');
        const at2 = href.indexOf('@');
        let idx = -1;
        if (atIndex !== -1) idx = atIndex + 2; // after '/@'
        else if (at2 !== -1) idx = at2 + 1; // after '@'
        if (idx !== -1) {
            let substr = href.substring(idx);
            const stop = substr.search(/[\/?&#]/);
            if (stop !== -1) substr = substr.substring(0, stop);
            code = substr;
        }
    }

    if (!code) return null;
    code = code.toUpperCase().replace(/[^A-Z0-9]/g,'').substring(0, MAX);
    return code;
}

// function tryFlyToCodeFromUrl() {
//     const code = parseFullercodeFromUrl();
//     if (!code) return;
//     console.log('Found code in URL:', code);
//     // Put code into input (this will be filtered/validated by input handler)
//     fullerCodeInput.value = code;
//     fullerCodeInput.dispatchEvent(new Event('input', { bubbles: true }));

//     // Try to fly when triangles are available. Retry a few times if necessary.
//     let attempts = 0;
//     const maxAttempts = 50; // ~5 seconds at 100ms
//     const iv = setInterval(() => {
//         attempts++;
//         if (window.triangles && window.triangles.length > 0) {
//             clearInterval(iv);
//             const target = window.triangles.find(t => t.faceId === fullerCodeInput.value);
//             if (target) {
//                 console.log('Flying to code from URL:', fullerCodeInput.value);
//                 // reuse cameraHeight computed by input handler
//                 const cartographic = Cesium.Cartographic.fromCartesian(target.center);
//                 const destinationPosition = Cesium.Cartesian3.fromRadians(
//                     cartographic.longitude,
//                     cartographic.latitude,
//                     cameraHeight
//                 );
//                 window.viewer.camera.flyTo({ destination: destinationPosition, orientation: { heading: 0.0, pitch: -Cesium.Math.PI_OVER_TWO, roll: 0.0 } });
//             } else {
//                 console.log('Fullercode from URL not found among loaded triangles:', fullerCodeInput.value);
//             }
//         } else if (attempts >= maxAttempts) {
//             clearInterval(iv);
//             console.log('Timed out waiting for triangles to load to fly to URL code.');
//         }
//     }, 100);
// }

// Run once at load
// tryFlyToCodeFromUrl();
// window.scene.globe.show = true;
// window.scene.globe.baseColor = Cesium.Color.darkblue;

// test to show Natural Earth II layer even in high alitude on mobile
const layer = window.viewer.imageryLayers.get(0);
  layer.show = true;
  layer.alpha = 1.0;
  layer.brightness = 1.2;

  // 👇 désactive la coupure d’affichage aux grandes distances
  layer.minificationFilter = Cesium.TextureMinificationFilter.LINEAR;
  layer.magnificationFilter = Cesium.TextureMagnificationFilter.LINEAR;


window.viewer.scene.screenSpaceCameraController.enableTilt = false
window.entities = window.viewer.entities;
window.LevelHeights = [6500000, 2600000, 1000000, 200000, 100000,10000,1800,700,170,50,10];
window.triangles = []; // To store subdivided triangles

window.entities.add({
    id:"camera",
    position: Cesium.Cartesian3.fromDegrees(0, 90, 0),
    point: { pixelSize: 3, color: Cesium.Color.RED },
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    label: { text: "your position", font: "24px sans-serif", pixelOffset: new Cesium.Cartesian2(0, -12),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND 
     }
    });

const entitiesLevels = [];
var level0 = viewer.entities.add(new Cesium.Entity());
entitiesLevels.push(level0);
var level1 = viewer.entities.add(new Cesium.Entity());
entitiesLevels.push(level1);
let addedSub = [];
// Attendre que fuller.js ait charg� les donn�es
document.addEventListener("DOMContentLoaded", () => {
    let initCode = parseFullercodeFromUrl();
    // Attendre que le JSON soit charg� (sinon facesPositions sera undefined)
    const interval = setInterval(() => {
        if (window.fullerData && window.fullerData.facesPositions) {
            console.log('Data loaded, initializing...');
            addPolygons(window.fullerData.facesGeoPositions, entitiesLevels[0]);
            
            // Only try to process the code after data is loaded
            if (initCode) {
                console.log('Processing URL code:', initCode);
                fullerCodeInput.value = initCode;
                fullerCodeInput.dispatchEvent(new Event('input', { bubbles: true }));
                // Give a small delay to ensure polygons are properly added
                setTimeout(() => {
                    console.log('Flying to initial code location');
                    flyToCode(initCode);
                }, 1000);
            }
            
            clearInterval(interval);
        }
    }, 100);
});

// Listen for camera changes
//window.viewer.camera.changed.addEventListener(findClosestFaceCenter);
window.viewer.camera.changed.addEventListener(findEnclosingTriangle);
// Listen for camera changes
window.viewer.camera.changed.addEventListener(updateCameraLabel);

// Initial update
updateCameraLabel();

function addPolygons(facesGeoPositions,parentEntity) {
//    const facesPositions = window.fullerData.facesPositions;
    const viewer = window.fullerData.viewer;
    if (!facesGeoPositions || !viewer) return;
    
    //facesPositions.forEach(positions => {
    //    addPolygon(positions);
    //console.log("A: ",facesGeoPositions[1].vertices);
    //console.log("C: ",facesGeoPositions[0].vertices);
    facesGeoPositions.forEach(faceObj => {
        addPolygon(faceObj.vertices, faceObj.faceId, parentEntity, faceObj.center);
        window.triangles.push(faceObj);
    });
}
function addPolygon(positions, triangleId, parentEntity,center) {
    
    viewer.entities.add({
        id: "triangle "+triangleId,
        parent: parentEntity,
            polygon: {
                hierarchy: positions,
                height: 1,
                material: Cesium.Color.BLUE.withAlpha(0.05),
                outline: true,
                outlineWidth: 5,
                outlineColor: Cesium.Color.MAGENTA,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            }
    });
    const labelFont = (32 - triangleId.length).toString()+"px Consolas";
    viewer.entities.add({
        id: "label " + triangleId,
        parent: parentEntity,
        position: center,
        //point: { pixelSize: 10, color: Cesium.Color.YELLOW },
        label: {
            text: `${triangleId}`, font: labelFont,
            fillColor: Cesium.Color.MAGENTA.withAlpha(0.9),
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        }
    });
    }

// Camera change event to update lat/lon label
function updateCameraLabel() {

    const viewer = window.fullerData.viewer;
    const cameraCartographic = viewer.camera.positionCartographic;

    const cameraCartesian = Cesium.Cartesian3.fromRadians(
        cameraCartographic.longitude,
        cameraCartographic.latitude,
        0
    );
    //cameraCartographic.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
    // TODO: pourquoi sans effet ? la position du label ne suit pas le terrain, même en mettant heightReference à CLAMP_TO_GROUND
    //cameraCartographic.height = 6371010;
    const lat = Cesium.Math.toDegrees(cameraCartographic.latitude).toFixed(6);
    const lon = Cesium.Math.toDegrees(cameraCartographic.longitude).toFixed(6);
    //console.log("Lat: ", lat, " Lon: ", lon, " Alt: ", cameraCartographic.height.toFixed(0));
    cameraLabel.textContent =
        `Lat: ${lat} Lon: ${lon} Alt: ${cameraCartographic.height.toFixed(0)}`;


}

// Seems not to be optimized
// The right way would be :
// - to divide the triangle in 4
// - for each edge of the triangle in the middle, find in which hemisphere the camera is
/* function findClosestFaceCenter() {
    const viewer = window.fullerData.viewer;
    const facesGeoPositions = window.fullerData.facesGeoPositions;
    if (!viewer || !facesGeoPositions) return;

    // Get camera position in Cartesian3
    const cameraCartographic = viewer.camera.positionCartographic;
    
    const cameraCartesian = Cesium.Cartesian3.fromRadians(
        cameraCartographic.longitude,
        cameraCartographic.latitude,
        0
    );
    const levelIndex = getLevelIndex(cameraCartographic.height);
    console.log("levelIndex: ", levelIndex);
    console.log("entitiesLevels.length: ", entitiesLevels.length);

    //create levels if not exist
    createLevels(levelIndex);
    //hide all levels except current
    for (let i = 0; i < entitiesLevels.length; i++) {
        entitiesLevels[i].show = (i === levelIndex);
    //    console.log("Show: ", i);
    //    console.log("show: ", i === levelIndex);
    }


    let minDist = Number.POSITIVE_INFINITY;
    let secondMinDist = Number.POSITIVE_INFINITY;
    let closestFace = null;
    let secondClosestFace = null;

    facesGeoPositions.forEach(faceObj => {
        const dist = Cesium.Cartesian3.distance(cameraCartesian, faceObj.center);
        if (dist < secondMinDist) {
            if (dist < minDist) {
                secondMinDist = minDist;
                secondClosestFace = closestFace;
                minDist = dist;
                closestFace = faceObj;
            } else {
                secondMinDist = dist;
                secondClosestFace = faceObj;
            }
        }
    });
    //check, at each level, if the two closest subtriangles are already added
    for (let i = 0; i < levelIndex; i++) {

        
        addSubtriangles(closestFace, i);
        addSubtriangles(secondClosestFace, i);
        
        //find the next closest faces for the next level
        let nextMinDist = Number.POSITIVE_INFINITY;
        let nextClosestFace = null;
        let nextSecondMinDist = Number.POSITIVE_INFINITY;
        let nextSecondClosestFace = null;
        window.triangles.forEach(faceObj => {
            if (faceObj.faceId.startsWith(closestFace.faceId) && faceObj.faceId.length === closestFace.faceId.length + 1
                || faceObj.faceId.startsWith(secondClosestFace.faceId) && faceObj.faceId.length === secondClosestFace.faceId.length + 1) {
                //console.log("faceObj.faceId: ", faceObj.faceId);
                const dist = Cesium.Cartesian3.distance(cameraCartesian, faceObj.center);
                //console.log("dist: ", dist);

                //if (dist < nextMinDist && dist > minDist) {
                if (dist < nextSecondMinDist ) {
                    if (dist < nextMinDist) {
                        nextSecondMinDist = nextMinDist;
                        nextSecondClosestFace = nextClosestFace;
                        nextMinDist = dist;
                        nextClosestFace = faceObj;
                    } else {
                        nextSecondMinDist = dist;
                        nextSecondClosestFace = faceObj;
                    }
                }
                
            }
        }

        );
        minDist = nextMinDist;
        secondMinDist = nextSecondMinDist;
        closestFace = nextClosestFace;
        secondClosestFace = nextSecondClosestFace;
        fullerCodeLabel.textContent =
        `fullercode: ${closestFace.faceId}`;
        positionCopyButton();
        console.log("closest: ", closestFace.faceId);
        console.log("second closest: ", secondClosestFace.faceId);
    }
}
 */
//the purpose of this function is to replace findClosestFaceCenter with an optimized version
function findEnclosingTriangle() {
    const viewer = window.fullerData.viewer;
    const facesGeoPositions = window.fullerData.facesGeoPositions;
    if (!viewer || !facesGeoPositions) return;

    // Get camera position in Cartesian3
    const cameraCartographic = viewer.camera.positionCartographic;
    
    let cameraCartesian = Cesium.Cartesian3.fromRadians(
        cameraCartographic.longitude,
        cameraCartographic.latitude,
        1
    );
    //console.log("Camera Cartesian height: ", cameraCartesian);
    viewer.entities.getById("camera").position = cameraCartesian;
    // undefined: viewer.entities.getById("camera").position.height
    // undefined: viewer.entities.getById("camera").position.heightReference);

    viewer.entities.getById("camera").heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
    //TODO: pourquoi sans effet ?
    viewer.entities.getById("camera").height = 0;
    //TODO: pourquoi sans effet ?

    //console.log("camera height reference: ", viewer.entities.getById("camera").heightReference);
    //console.log("Cesium.HeightReference.CLAMP_TO_GROUND: ", Cesium.HeightReference.CLAMP_TO_GROUND);

/*     let x = cameraCartesian.x;
    let y = cameraCartesian.y;
    let z = cameraCartesian.z;
    let length = Math.sqrt(x * x + y * y + z * z);
    x = x / length;
    y = y / length;
    z = z / length;
    x = x * window.radius;
    y = y * window.radius;
    z = z * window.radius;
    cameraCartesian = Cesium.Cartesian3.fromElements(x, y, z); */
    cameraCartesian.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;

    const levelIndex = getLevelIndex(cameraCartographic.height);
    //console.log("levelIndex: ", levelIndex);
    //console.log("entitiesLevels.length: ", entitiesLevels.length);

    //create levels if not exist
    createLevels(levelIndex);
    //hide all levels except current
    for (let i = 0; i < entitiesLevels.length; i++) {
        entitiesLevels[i].show = (i === levelIndex);
    //    console.log("Show: ", i);
    //    console.log("show: ", i === levelIndex);
    }
    // Find the closest icosahedron face to the camera
    let minDist = Number.POSITIVE_INFINITY;
    let closestFace = null;
    facesGeoPositions.forEach(faceObj => {
        const dist = Cesium.Cartesian3.distance(cameraCartesian, faceObj.center);
            if (dist < minDist) {
                minDist = dist;
                closestFace = faceObj;
            }
 //       }
    });
    //check, at each level, if the two closest subtriangles are already added
    for (let i = 0; i < levelIndex; i++) {
        addSubtriangles(closestFace, i);
 //       addSubtriangles(secondClosestFace, i);
        
        //find the face enclosing the point for the next level
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
//                  v0 [0]               
//                   /\                  
//                  /t1\                 
//              v8 /____\ v6        
//                /\ t2 /\               
//               /15\  /t3\              
//           v5 /____v7____\ v3         
//             /\ 14 /\ t4 /\            
//            /13\  /t0\  /t5\           
//       v12 /___v13___v10____\ v11     
//          /\t12 /\ t9 /\ t7 /\         
//         /  \  /  \  /t8\  /t6\        
//        /_t11\/t10_\/____\/____\       
//   [2] v2    v14   v4    v9    v1 [1] 

        // First-level midpoints
        let p_ab = new window.CartesianCoord(closestFace.v[3]);
        let p_bc = new window.CartesianCoord(closestFace.v[4]);
        let p_ac = new window.CartesianCoord(closestFace.v[5]);

        // Second-level midpoints
        let p_a_ab = new window.CartesianCoord(closestFace.v[6]);
        let p_ab_b = new window.CartesianCoord(closestFace.v[11]);
        let p_b_bc = new window.CartesianCoord(closestFace.v[9]);
        let p_bc_c = new window.CartesianCoord(closestFace.v[14]);
        let p_c_ac = new window.CartesianCoord(closestFace.v[12]);
        let p_ac_a = new window.CartesianCoord(closestFace.v[8]);

        // Third-level midpoints
        let p_ab_bc = new CartesianCoord(closestFace.v[10]);
        let p_bc_ac = new CartesianCoord(closestFace.v[13]);
        let p_ac_ab = new CartesianCoord(closestFace.v[7]);

        let cameraNormalized = new CartesianCoord(cameraCartesian);
        //in icosahedron.json the vertices of the faces are in the clockwise order
        let enclosingTriangleId = -1;
        let nextClosestFace = null;

        const th = 1;

        if (i > th) {
            console.log("closestFace: ", closestFace.faceId);
            console.log("cameraCartesian: ", cameraNormalized);
        }
        let cp = cross_product(p_ab, p_bc);
        let dp = dot_product(cp, cameraNormalized);
        if(i > th) {
            console.log("p_ab, p_bc, cp: ", p_ab, p_bc, cp);
            console.log("dp: ", dp);
        }
        if (dp > 0) {
            cp = cross_product(p_ab_bc, p_ab_b);
            dp = dot_product(cp, cameraNormalized);
            if(i > th) {
            console.log("closestFace.ab_bc, p_ab_b: ", p_ab_bc, p_ab_b, cp);
            console.log("dp: ", dp);
        }
            if (dp > 0) {
                enclosingTriangleId = 5;
            } else {
                cp = cross_product(p_ab_b, p_b_bc);
                dp = dot_product(cp, cameraNormalized);
                if(i > th) {
            console.log("p_ab_b, p_b_bc, cp: ", p_ab_b, p_b_bc, cp);
            console.log("dp: ", dp);
        }
                if (dp > 0) {
                    enclosingTriangleId = 6;
                } else {
                    cp = cross_product(p_b_bc, p_ab_bc);
                    dp = dot_product(cp, cameraNormalized);
                    if(i > th) {
            console.log("p_b_bc, p_ab_bc, cp: ", p_b_bc, p_ab_bc, cp);
            console.log("dp: ", dp);
        }
                    if (dp > 0) {
                        enclosingTriangleId = 8;
                    } else {
                        enclosingTriangleId = 7;
                    }
                }
            }
        } else {
            cp = cross_product(p_ac, p_ab);
            dp = dot_product(cp, cameraNormalized);
                if(i > th) {
            console.log("p_ac, p_ab, cp: ", p_ac, p_ab, cp);
            console.log("dp: ", dp);
        }
            if (dp > 0) {
                cp = cross_product(p_ac_a, p_a_ab);
                dp = dot_product(cp, cameraNormalized);
                    if(i > th) {
            console.log("p_ac_a, p_a_ab, cp: ", p_ac_a, p_a_ab, cp);
            console.log("dp: ", dp);
        }
                if (dp > 0) {
                    enclosingTriangleId = 1;
                } else {
                    cp = cross_product(p_a_ab, p_ac_ab);
                    dp = dot_product(cp, cameraNormalized);
                    if(i > th) {
            console.log("p_a_ab, p_ac_ab, cp: ", p_a_ab, p_ac_ab, cp);
            console.log("dp: ", dp);
        }
                    if (dp > 0) {
                        enclosingTriangleId = 3;
                    } else {
                        cp = cross_product(p_ac_ab, p_ac_a);
                        dp = dot_product(cp, cameraNormalized);
                        if(i > th) {
            console.log("p_ac_ab, p_ac_a, cp: ", p_ac_ab, p_ac_a, cp);
            console.log("dp: ", dp);
        }
                        if (dp > 0) {
                            enclosingTriangleId = 15;
                        } else {
                            enclosingTriangleId = 2;
                        }
                    }
                }
            }
            else {
                cp = cross_product(p_bc, p_ac);
                dp = dot_product(cp, cameraNormalized);
                if(i > th) {
            console.log("p_bc, p_ac, cp: ", p_bc, p_ac, cp);
            console.log("dp: ", dp);
        }
                if (dp > 0) {
                    cp = cross_product(p_c_ac, p_bc_ac);
                    dp = dot_product(cp, cameraNormalized);
                    if(i > th) {
            console.log("p_c_ac, p_bc_ac, cp: ", p_c_ac, p_bc_ac, cp);
            console.log("dp: ", dp);
        }
                    if (dp > 0) {
                        enclosingTriangleId = 13;
                    } else {
                        cp = cross_product(p_bc_ac, p_bc_c);
                        dp = dot_product(cp, cameraNormalized);
                        if(i > th) {
            console.log("p_bc_ac, p_bc_c, cp: ", p_bc_ac, p_bc_c, cp);
            console.log("dp: ", dp);
        }
                        if (dp > 0) {
                            enclosingTriangleId = 10;
                        } else {
                            cp = cross_product(p_bc_c, p_c_ac);
                            dp = dot_product(cp, cameraNormalized);
                            if (dp > 0) {
                                enclosingTriangleId = 11;
                            } else {
                                enclosingTriangleId = 12;
                            }
                        }
                    }
                }
                else {
                //The closest sutriangle is inside ac, ab, bc
                    cp = cross_product(p_ac_ab, p_ab_bc);
                    dp = dot_product(cp, cameraNormalized);
                    if (dp > 0) {
                        enclosingTriangleId = 4;
                    } else {
                        cp = cross_product(p_ab_bc, p_bc_ac);
                        dp = dot_product(cp, cameraNormalized);
                        if (dp > 0) {
                            enclosingTriangleId = 9;
                        } else {
                            cp = cross_product(p_bc_ac, p_ac_ab);
                            dp = dot_product(cp, cameraNormalized);
                            if (dp > 0) {
                                enclosingTriangleId = 14;
                            } else {
                                enclosingTriangleId = 0;
                            }
                        }
                    } 
                }
            }
        }

        
        let nextClosestFaceId = closestFace.faceId + closestFace.ids[enclosingTriangleId];
        closestFace = window.triangles.find(t => t.faceId === nextClosestFaceId);
        if (!closestFace) {
            console.log("Could not find face with id: ", nextClosestFaceId);
            return;
        }
        //console.log("closest: ", closestFace.center);
        fullerCodeLabel.textContent =
        `fullercode: ${closestFace.faceId}`;
        positionCopyButton();

    }
}

function addSubtriangles(closestFace, i) {
    if (!closestFace || !window.fullerData || !window.fullerData.viewer) return;
    
    let alreadyAdded = addedSub.includes(closestFace.faceId);
    //console.log("closestFace: ", closestFace.faceId);
    //console.log("alreadyAdded: ", alreadyAdded);
    if (!alreadyAdded) {
        addedSub.push(closestFace.faceId);
        console.log("calling Subtriangles for: ", closestFace.faceId);
        let st = new Subtriangles(closestFace);
        //console.log("st A: ", st.subFaces[1].vertices);
        addPolygons(st.subFaces, entitiesLevels[i + 1]);
    }
}

function createLevels(levelIndex) {
    const viewer = window.fullerData.viewer;
    //console.log("entitiesLevels.length: ", entitiesLevels.length);
    //console.log("Creating levels up to: ", levelIndex);
    for (let i = entitiesLevels.length; i <= levelIndex; i++) {
        console.log("Creating level:", i);
        var level = viewer.entities.add(new Cesium.Entity());
        entitiesLevels.push(level);

    }
}

function getLevelIndex(height) {
    const levels = window.LevelHeights;

    for (let i = 0; i < levels.length; i++) {
        if (height >= levels[i]) {
            return i; // Plus grand ou �gal � ce niveau
        }
    }

    // Si plus petit que tous les niveaux
    return levels.length;
}

