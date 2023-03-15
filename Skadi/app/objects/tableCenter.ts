import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Mesh } from '@babylonjs/core/Meshes/mesh';

export class TableCenter {
  private _rootNode: TransformNode;
  private _meshes: Mesh[] = [];

  constructor() {
    this._rootNode = new TransformNode('table_center');
  }
}
