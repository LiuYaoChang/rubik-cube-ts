
import { Camera, Face, Raycaster, Vector3 } from "three";
import { Object3D, Mesh } from "./Mesh";

// export type Object3D = Mesh;

type ObjectWithNull = Object3D | null;

type EventNames = 	"click" | "dblclick" | "mouseover" | "mouseout" | "mousedown" | "mouseup";

type Handle = {
  callback: Function,
  useCapture: boolean
}

// type DomEventInner = {
//   [index: string]: Handle[]
// }
export type ThreexDomEventType = {
  type: string;
  target: Object3D;
  targetFace: Face,
  origDomEvent: MouseEvent;
  stopPropagation: Function;
}

export class THREExDomEvent {

    _camera: Camera;
    _domElement: Element | Document;
    // _projector: THREE.Projector
    _selected: ObjectWithNull;
    _boundObjs: Array<Object3D>;

    constructor(camera: Camera, el?: HTMLElement) {
      // Bind dom event for mouse and touch
      this._domElement = el || document;
      this._camera = camera;
      this._selected = null;
      this._boundObjs = [];
      const _this	= this;
      const _$onClick		= function(event: Event){ _this._onClick.apply(_this, [event as MouseEvent]);};
      const _$onDblClick		= function(event: Event){ _this._onDblClick.apply(_this, [event as MouseEvent]);};
      const _$onMouseMove		= function(event: Event){ _this._onMouseMove.apply(_this, [event as MouseEvent]);};
      const _$onMouseDown		= function(event: Event){ _this._onMouseDown.apply(_this, [event as MouseEvent]);};
      const _$onMouseUp		= function(event: Event){ _this._onMouseUp.apply(_this, [event as MouseEvent]);};
      // const _$onDblClick	= function(){ _this._onDblClick.apply(_this, arguments);	};
      // const _$onMouseMove	= function(){ _this._onMouseMove.apply(_this, arguments);	};
      // const _$onMouseDown	= function(){ _this._onMouseDown.apply(_this, arguments);	};
      // const _$onMouseUp	= function(){ _this._onMouseUp.apply(_this, arguments);		};
      // const _$onTouchMove	= function(){ _this._onTouchMove.apply(_this, arguments);	};
      // const _$onTouchStart	= function(){ _this._onTouchStart.apply(_this, arguments);	};
      // const _$onTouchEnd	= function(){ _this._onTouchEnd.apply(_this, arguments);	};
      // const event: EventListenerOrEventListenerObject
      this._domElement.addEventListener( 'click'	, _$onClick	, false );
      this._domElement.addEventListener( 'dblclick'	, _$onDblClick	, false );
      this._domElement.addEventListener( 'mousemove'	,_$onMouseMove	, false );
      this._domElement.addEventListener( 'mousedown'	, _$onMouseDown	, false );
      this._domElement.addEventListener( 'mouseup'	, _$onMouseUp	, false );
      // this._domElement.addEventListener( 'touchmove'	, _$onTouchMove	, false );
      // this._domElement.addEventListener( 'touchstart'	, _$onTouchStart	, false );
      // this._domElement.addEventListener( 'touchend'	, _$onTouchEnd	, false );
    }
    // deconstruct function
    destroy():void {

    }

    // readonly eventNames: Array<string>;
    /********************************************************************************/
    /*		domevent context						*/
    /********************************************************************************/
  
    // handle domevent context in object3d instance
    _objectCtxInit(object3d: Object3D): void {
      object3d._3xDomEvent = {};
    }
    _objectCtxDeinit(object3d: Object3D): void {
      object3d._3xDomEvent = undefined;
    }
    _objectCtxIsInit(object3d: Object3D): boolean {
      return object3d._3xDomEvent ? true : false;
    }
    _objectCtxGet(object3d: Object3D) {
      return object3d._3xDomEvent;
    }
  
    /**
     * Getter/Setter for camera
    */
    camera(camera?: Camera): Camera {
      if (camera) {
        this._camera = camera;
      }
      return this._camera;
    }
    bind(object3d: Object3D, eventName: EventNames, callback: Function, useCapture: boolean = false) {
      const handlerName = eventName + 'Handlers';
      const objectCtx = this._getObjectCtx(object3d);

      if (!objectCtx[handlerName]) {
        objectCtx[handlerName] = [];
      }
      objectCtx[handlerName].push({
        callback,
        useCapture
      })
      this._boundObjs.push(object3d);
    }

    unbind(object3d: Object3D, eventName: EventNames, callback: Function) {
      const handlerName = eventName + 'Handlers';
      const objectCtx = this._getObjectCtx(object3d);

      if (!objectCtx[handlerName]) {
        objectCtx[handlerName] = [];
      }
      let handles = objectCtx[handlerName];

      handles = handles.filter((handle: Handle) => {
        return handle.callback !== callback;
      });

      objectCtx[handlerName] = handles;
      const index = this._boundObjs.findIndex((mesh: Object3D) => (mesh.target === object3d.target));

      if (index !== -1) {
        this._boundObjs.splice(index, 1);
      }
    }

    _bound(eventName: EventNames, object3d: Object3D): boolean {

      const objectCtx = this._objectCtxGet(object3d);
      if (!objectCtx) return false;

      return objectCtx[eventName + 'Handlers'] ? true : false;
    }

    _onMove(mouseX: number, mouseY: number, event: MouseEvent) {
      const vector: Vector3 = new Vector3(mouseX, mouseY, 1);

      vector.unproject(this._camera);
      vector.sub(this._camera.position).normalize();
      const meshs = this._boundObjs.map(obj => obj.target)
      const intersects = intersectObjects(meshs, this._camera, vector);
      // const ray = new Raycaster(this._camera.position, vector.sub(this._camera.position).normalize());

      // const intersects = ray.intersectObjects(this._boundObjs);

      const oldSelected = this._selected;
      let notifyOver, notifyOut;
      let newObj: Object3D = new Object3D();
      // 点击模型
      if (intersects.length > 0) {
        newObj = intersects[0].object as Object3D;

        this._selected = newObj;
        if (oldSelected != newObj) {
          notifyOver = this._bound('mouseover', newObj);
          notifyOut = oldSelected && this._bound('mouseout', oldSelected);
        }
      } else {
        notifyOut = oldSelected && this._bound('mouseout', oldSelected);
        this._selected = null;
      }
      notifyOver && this._notify('mouseover', newObj, event)
      notifyOut && this._notify('mouseout', newObj, event)
      // ray.camera =

    }
    _onEvent(eventName: EventNames, mouseX: number, mouseY: number, event: MouseEvent) {
      const vector = new Vector3(mouseX, mouseY, 1);
      vector.unproject(this._camera);
      vector.sub(this._camera.position).normalize()
      const meshs = this._boundObjs.map(obj => obj.target)
      const intersects = intersectObjects(meshs, this._camera, vector);

      if (intersects.length === 0) return;

      const intersect = intersects[0];

      const object = intersect.object as Mesh;
      const face = intersect.face;
      const obj = this._boundObjs.find(obj => (obj.target === object))
      const objectCtx = this._objectCtxGet(obj as Object3D);

      if (!objectCtx) return;
      this._notify(eventName, obj as Object3D, event, face);
    }

    _notify(eventName: EventNames, object3d: Object3D, event?: MouseEvent, targetFace?: any) {
      const name = eventName + 'Handlers';
      const objectCtx	= this._objectCtxGet(object3d);
      const handlers	= objectCtx ? objectCtx[name] : null;
    
      // do bubbling
      if(!objectCtx || !handlers || handlers.length === 0) {
        object3d.parent && this._notify(eventName, object3d.parent as Object3D);
        return;
      }
      
      // notify all handlers
      for(let i = 0; i < handlers.length; i++) {
        let handler	= handlers[i];
        let toPropagate	= true;
        handler.callback({
          type: eventName,
          target: object3d.target,
          targetFace: targetFace, //joews
          origDomEvent: event,
          stopPropagation	: function() {
            toPropagate	= false;
          }
        });
        if (!toPropagate) continue;
        // do bubbling
        if (handler.useCapture === false) {
          object3d.parent && this._notify(eventName, object3d.parent as Object3D);
        }
      }
    }


    _onMouseDown(event: MouseEvent): void {
      return this._onMouseEvent('mousedown', event);
    }
    
    _onMouseUp(event: MouseEvent): void {
      return this._onMouseEvent('mouseup', event);
    }

    _onMouseEvent(eventName: EventNames, event: MouseEvent): void {
      var mouseX	= +(event.clientX / window.innerWidth ) * 2 - 1;
      var mouseY	= -(event.clientY / window.innerHeight) * 2 + 1;
      return this._onEvent(eventName, mouseX, mouseY, event);
    }

    _onMouseMove(event: MouseEvent): void {
      var mouseX	= +(event.clientX / window.innerWidth ) * 2 - 1;
      var mouseY	= -(event.clientY / window.innerHeight) * 2 + 1;
      return this._onMove(mouseX, mouseY, event);
    }
    _onClick(event: MouseEvent): void {
      	// TODO handle touch ?
	    return this._onMouseEvent('click'	, event);
    }
    _onDblClick(event: MouseEvent): void {
      // TODO handle touch ?
	    return this._onMouseEvent('dblclick'	, event);
    }


    _onTouchStart(event: MouseEvent): void {
      return this._onTouchEvent('mousedown', event);
    }
    _onTouchEnd(event: MouseEvent): void {
      return this._onTouchEvent('mouseup'	, event);
    }
    _onTouchMove(event: MouseEvent): void {
      // if( event.touches.length != 1 )	return undefined;

      // event.preventDefault();
    
      // var mouseX	= +(event.touches[0].pageX / window.innerWidth ) * 2 - 1;
      // var mouseY	= -(event.touches[0].pageY / window.innerHeight) * 2 + 1;
      // return this._onMove('mousemove', mouseX, mouseY, event);
    }
    _onTouchEvent(eventName: EventNames, event: MouseEvent): void {
      // if( event.touches.length != 1 )	return undefined;

      // domEvent.preventDefault();
    
      // var mouseX	= +(event.touches[ 0 ].pageX / window.innerWidth ) * 2 - 1;
      // var mouseY	= -(event.touches[ 0 ].pageY / window.innerHeight) * 2 + 1;
      // return this._onEvent(eventName, mouseX, mouseY, domEvent);	
    }

    _getObjectCtx(object3d: Object3D) {
      if (!this._objectCtxIsInit(object3d)) {
        this._objectCtxInit(object3d);
      }
      return this._objectCtxGet(object3d);
    }
  }

  function intersectObjects(objects: Mesh[], camera: Camera, vector: Vector3) {
    var ray		= new Raycaster(camera.position, vector);
    var intersects	= ray.intersectObjects(objects);

    return intersects;

  }


