import { THREE } from "./Three";

export const GeometryUtils = {

  merge: function(geometry1, object2 /* mesh | geometry */) {
    var isMesh = object2 instanceof THREE.Mesh;
    // 顶点
    var vertexOffset = geometry1.vertices.length;
    // var uvPosition = geometry1.faceVertexUvs[0].length;
    var geometry2 = isMesh ? object2.geometry : object2;
    var vertices1 = geometry1.vertices;
    var vertices2 = geometry2.vertices;
    var faces1 = geometry1.faces;
    var faces2 = geometry2.faces;
    var uvs1 = geometry1.faceVertexUvs[0];
    var uvs2 = geometry2.faceVertexUvs[0];

    isMesh && object2.matrixAutoUpdate && object2.updateMatrix();

    for (var i = 0, il = vertices2.length; i < il; i++) {
      var vertex = vertices2[i];
      var vertexCopy = new THREE.Vertex(vertex.position.clone());
      isMesh && object2.matrix.multiplyVector3(vertexCopy.position);
      vertices1.push(vertexCopy);
    }

    for (i = 0, il = faces2.length; i < il; i++) {
      var face = faces2[i]; var faceCopy; var normal; var color;
      var faceVertexNormals = face.vertexNormals;
      var faceVertexColors = face.vertexColors;

      if (face instanceof THREE.Face3) {
        faceCopy = new THREE.Face3(face.a + vertexOffset, face.b + vertexOffset, face.c + vertexOffset);
      } else if (face instanceof THREE.Face4) {
        faceCopy = new THREE.Face4(face.a + vertexOffset, face.b + vertexOffset, face.c + vertexOffset, face.d + vertexOffset);
      }
      faceCopy.normal.copy(face.normal);
      for (let j = 0, jl = faceVertexNormals.length; j < jl; j++) {
        normal = faceVertexNormals[j];
        faceCopy.vertexNormals.push(normal.clone());
      }

      faceCopy.color.copy(face.color);
      for (let j = 0, jl = faceVertexColors.length; j < jl; j++) {
        color = faceVertexColors[j];
        faceCopy.vertexColors.push(color.clone());
      }

      faceCopy.materials = face.materials.slice();

      faceCopy.centroid.copy(face.centroid);

      faces1.push(faceCopy);
    }

    for (i = 0, il = uvs2.length; i < il; i++) {
      var uv = uvs2[i]; var uvCopy = [];
      for (var j = 0, jl = uv.length; j < jl; j++) {
        uvCopy.push(new THREE.UV(uv[j].u, uv[j].v));
      }
      uvs1.push(uvCopy);
    }
  }
}