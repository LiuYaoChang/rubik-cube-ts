import { Object3D } from "three";
import { Camera } from "three";


namespace THREEx {
  class DomEvent {
    // # Constructor
    constructor(camera: Camera, domElement: Element);
    // # Destructor
    destroyed();
    static readonly eventNames: Array<string>;
    _objectCtxInit(object3d: Object3D): void;
    _objectCtxDeinit(object3d: Object3D);
    _objectCtxIsInit(object3d: Object3D): boolean;
    _objectCtxGet(object3d: Object3D);
    _objectCtxInit(object3d: Object3D);
    _objectCtxInit(object3d: Object3D);
  }

}