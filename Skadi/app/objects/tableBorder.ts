import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { RoundedBox } from '#/objects/roundedBox';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Tile } from '#/objects/tile';
import { CSG } from '@babylonjs/core/Meshes/csg';
import { res } from '#/resources';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';

const borderWidth = 4;
export class TableBorder {
  private readonly _rootNode: TransformNode;

  constructor(tableSize: number) {
    this._rootNode = new TransformNode('border');

    const border = new RoundedBox(3, new Vector3(tableSize, Tile.D * 0.7, borderWidth), 0.4).toMesh(
      'b1'
    );
    const cropDistance = 2.55;
    const cropper1 = MeshBuilder.CreateBox('crop1', { width: 10, height: 10, depth: 10 });
    cropper1.rotation.y = Math.PI / 4;
    cropper1.position.x = -tableSize / 2 - cropDistance;
    cropper1.position.z = -cropDistance;
    const cropper2 = MeshBuilder.CreateBox('crop2', { width: 10, height: 10, depth: 10 });
    cropper2.rotation.y = Math.PI / 4;
    cropper2.position.x = tableSize / 2 + cropDistance;
    cropper2.position.z = -cropDistance;
    const piece = CSG.FromMesh(border)
      .subtract(CSG.FromMesh(cropper1))
      .subtract(CSG.FromMesh(cropper2))
      .toMesh('piece1');
    border.dispose();
    cropper1.dispose();
    cropper2.dispose();

    const boxes = [piece, piece.clone('piece2'), piece.clone('piece3'), piece.clone('piece4')];
    boxes[0].position = new Vector3(tableSize / 2 - borderWidth / 2, 0.3, 0);
    boxes[1].position = new Vector3(-(tableSize / 2 - borderWidth / 2), 0.3, 0);
    boxes[2].position = new Vector3(0, 0.3, tableSize / 2 - borderWidth / 2);
    boxes[3].position = new Vector3(0, 0.3, -(tableSize / 2 - borderWidth / 2));
    boxes[0].rotation.y = Math.PI / 2;
    boxes[1].rotation.y = -Math.PI / 2;
    boxes[3].rotation.y = Math.PI;

    const csgs = boxes.map((box) => CSG.FromMesh(box));

    const result = csgs[0].union(csgs[3]).union(csgs[2]).union(csgs[1]).toMesh('border');
    result.parent = this._rootNode;
    result.material = res.mat.tableBorder;

    boxes.forEach((m) => m.dispose());
  }

  getRoot() {
    return this._rootNode;
  }
}
