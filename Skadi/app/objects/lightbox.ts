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
  private _lights: PointLight[];
  private _shades: ShadowGenerator[] = [];
  private readonly _spreadDistance = 50;

  constructor(scene: Scene) {
    this._rootNode = new TransformNode('lightbox');
    this._lights = [
      // [-1, 0],
      // [0, -1],
      // [1, 0],
      // [0, 1],
      [0, 0],
    ].map((c) => {
      const light = new PointLight(
        `light_${c[0]}_${c[1]}`,
        new Vector3(c[0] * this._spreadDistance, 0, c[1] * this._spreadDistance),
        scene
      );
      light.intensity = 1;
      const shade = new ShadowGenerator(256, light);
      shade.usePoissonSampling = true;
      shade.useKernelBlur = true;
      this._shades.push(shade);
      light.parent = this._rootNode;
      return light;
    });

    const light0 = new HemisphericLight('Hemi0', new Vector3(0, 1, 0), scene);
    light0.diffuse = new Color3(1, 1, 1);
    light0.specular = new Color3(1, 1, 1);
    light0.groundColor = new Color3(0, 0, 0);
    light0.intensity = 0.8;

    scene.addTransformNode(this._rootNode);
  }

  setIntensity(val = 1) {
    this._lights.forEach((l) => {
      l.intensity = val;
    });
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
