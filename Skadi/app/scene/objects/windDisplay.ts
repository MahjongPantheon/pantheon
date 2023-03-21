import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { res } from '#/scene/resources';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';

export class WindDisplay {
  private readonly _rootNode: TransformNode;
  private readonly _mesh: Mesh;
  private readonly _sub: Mesh;

  constructor() {
    this._rootNode = new TransformNode('wind_display');
    this._mesh = MeshBuilder.CreatePlane('display', {
      width: 1,
      height: 1,
    });
    this._sub = MeshBuilder.CreatePlane('display_sub', {
      width: 1,
      height: 1,
    });
    this._sub.parent = this._rootNode;
    this._mesh.parent = this._rootNode;
    this._sub.position.z = 0.002;
  }

  setWind(wind: 'e' | 's' | 'w' | 'n') {
    this._mesh.material = res.mat.winds[wind];
    this._sub.material = res.mat.windColors[wind];
  }

  get mesh() {
    return this._rootNode;
  }
}
