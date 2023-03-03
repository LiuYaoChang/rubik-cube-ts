import { Mesh as ThreeMesh, Vector3, Object3D as BaseObject3D } from 'three';

export class Mesh extends ThreeMesh {
  rubikPosition: Vector3;
}

export function create() {
  return new BaseObject3D();
}


export class Object3D extends BaseObject3D {
  _3xDomEvent: any;
  readonly target: Mesh;
  constructor(target?: Mesh) {
    super();
    if (target) {
      this.target = target;
    }
  }
}
