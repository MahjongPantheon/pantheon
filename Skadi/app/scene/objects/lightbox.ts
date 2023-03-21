import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { PointLight } from '@babylonjs/core/Lights/pointLight';
import { Scene } from '@babylonjs/core/scene';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { ShadowGenerator } from '@babylonjs/core';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';

export class Lightbox {
  private _rootNode: TransformNode;
  private _topLight: PointLight;
  private _cameraLight: PointLight;
  private _shades: ShadowGenerator[] = [];

  constructor(scene: Scene) {
    this._rootNode = new TransformNode('lightbox');
    this._topLight = new PointLight(`light_center`, new Vector3(0, 0, 0), scene);
    this._topLight.intensity = 1;
    const shade = new ShadowGenerator(256, this._topLight);
    shade.usePoissonSampling = true;
    shade.useKernelBlur = true;
    this._shades.push(shade);
    this._topLight.parent = this._rootNode;

    // light for camera-bound hand
    this._cameraLight = new PointLight(`light_camera`, new Vector3(0, 0, 0), scene);
    this._cameraLight.intensity = 1;
    this._cameraLight.position = new Vector3(-1, -11, 10);
    this._cameraLight.diffuse = new Color3(80 / 255, 80 / 255, 80 / 255);
    this._cameraLight.parent = scene.getCameraByName('primary_camera');

    const light0 = new HemisphericLight('ambient', new Vector3(0, 1, 0), scene);
    light0.diffuse = new Color3(1, 1, 1);
    light0.specular = new Color3(1, 1, 1);
    light0.groundColor = new Color3(0, 0, 0);
    light0.intensity = 0.5;

    scene.addTransformNode(this._rootNode);
  }

  setIntensity(val = 1) {
    this._topLight.intensity = val;
    return this;
  }

  addShadowCaster(mesh: AbstractMesh) {
    this._shades.forEach((s) => {
      s.addShadowCaster(mesh, true);
    });
  }

  getRoot() {
    return this._rootNode;
  }
}
