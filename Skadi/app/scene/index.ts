import '@babylonjs/core/Debug';
import '@babylonjs/inspector';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { environment } from '#config';
import { preloadResources } from '#/scene/resources';
import { LoadingScreen } from '#/helpers/loadingScreen';
import { Lightbox } from '#/scene/objects/lightbox';
import { Table } from '#/scene/objects/table';
import { Camera } from '@babylonjs/core/Cameras/camera';
import { State } from '#/helpers/state';
import { TableCenter } from '#/scene/objects/tableCenter';

const CAMERA_POS = new Vector3(7.5, -1.5, 0);
const CAMERA_DIR_ALPHA = 0;
const CAMERA_DIR_BETA = Math.PI / 5;
const CAMERA_DIR_RADIUS = 92;
const CAMERA_FOV = 120;

export class SkadiScene {
  protected _engine: Engine;
  protected _scene: Scene;
  protected _camera?: Camera;
  protected _lightbox?: Lightbox;
  protected _table?: Table;
  constructor(protected _canvas: HTMLCanvasElement, pixelRatio: number) {
    this._engine = new Engine(this._canvas, true, { preserveDrawingBuffer: false, stencil: false });
    this._engine.setHardwareScalingLevel(1 / pixelRatio);
    this._engine.loadingScreen = new LoadingScreen();
    this._engine.displayLoadingUI();

    this._scene = new Scene(this._engine);
    this._setCamera();

    preloadResources(this._scene).then(() => {
      this._initSceneObjects();
      this._engine.hideLoadingUI();
    });

    this._engine.runRenderLoop(() => {
      this._scene.render();
    });
  }

  public resize() {
    this._engine.resize();
  }

  protected _setCamera() {
    this._scene.clearColor = Color4.FromColor3(Color3.Black());
    this._camera = new ArcRotateCamera(
      'Camera',
      CAMERA_DIR_ALPHA,
      CAMERA_DIR_BETA,
      CAMERA_DIR_RADIUS,
      CAMERA_POS
    );
    this._scene.addCamera(this._camera);
    this._camera.attachControl(this._canvas, false);
    this._camera.fov = CAMERA_FOV;
  }

  protected _initSceneObjects() {
    this._maybeDebug();
    this._lightbox = new Lightbox(this._scene);
    this._lightbox.getRoot().position.y = 40;
    this._lightbox.setIntensity(0.5);
    this._table = new Table(this._lightbox, this._scene);
  }

  public setState(state: State) {
    this._table?.setState(state);
  }

  protected _maybeDebug() {
    if (!environment.production) {
      // hide/show the Inspector
      window.addEventListener('keypress', (ev) => {
        if (ev.shiftKey && ev.code === 'KeyI') {
          if (this._scene.debugLayer.isVisible()) {
            this._scene.debugLayer.hide();
          } else {
            this._scene.debugLayer.show();
          }
        }
      });
    }
  }
}
