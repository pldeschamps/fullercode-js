// fuller.js

window.fullerData = {}; // Objet global pour partager les donn�es
window.radius = 6371010

fetch("icosahedron.json")
    .then(response => response.json())
    .then(data => {
        // Cr�ation des sommets
        const verts = {};
        data.vertices.forEach(v => {
            //console.log(v.y);
            let x = v.x;
            let y = v.y;
            let z = v.z;
            x = x * window.radius;
            y = y * window.radius;
            z = z * window.radius;
            verts[v.id] = Cesium.Cartesian3.fromElements(x, y, z);
            //console.log(verts[v.id].y);
            viewer.entities.add({
                position: verts[v.id],
                point: { pixelSize: 3, color: Cesium.Color.MAGENTA },
                label: { text: v.id.toString(), font: "24px sans-serif", pixelOffset: new Cesium.Cartesian2(0, -12) }
            });
        });
        //console.log(verts[3]);
        // Cr�ation des positions pour chaque face (tableau de FacesGeoPositions)
        //console.log(data.vertices[3].y);
        const facesGeoPositions = data.faces.map(face => {
            const positions = face.vertices.map(id =>
            {
                const vert = data.vertices.find(v => v.id === id);
                let x = vert.x * window.radius;
                let y = vert.y * window.radius;
                let z = vert.z * window.radius;
        return Cesium.Cartesian3.fromElements(x, y, z);
            }
                
            );
            // console.log(positions[1].y);
            // console.log(face.subtrianglesids);
            return new FaceGeoPositions(face.id, positions, face.subtrianglesids);
        });

        // Stockage dans l'objet global
        window.fullerData.facesGeoPositions = facesGeoPositions;
        //Stockage d'un tableau de tableaux de Cesium.Cartesian3 pour Cesium
        window.fullerData.facesPositions = facesGeoPositions.map(faceObj => faceObj.vertices);
        window.fullerData.viewer = viewer; // Pour acc�s dans cesium.js

        // Optionally, add the center as a point entity for visualization
    //    facesGeoPositions.forEach(faceObj => {
    //        viewer.entities.add({
    //            position: faceObj.center,
    //            //point: { pixelSize: 10, color: Cesium.Color.YELLOW },
    //            label: {
    //                text: `${faceObj.faceId}`, font: "48px sans-serif",
    //                fillColor: Cesium.Color.MAGENTA.withAlpha(0.5)               }
    //        });
    //    });
    });