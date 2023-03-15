import { CSG } from '@babylonjs/core/Meshes/csg';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { RoundedBox } from '#/objects/roundedBox';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { res } from '#/resources';

export class RiichiStick {
  private static _stick: Mesh;

  private static _createStick() {
    const base = new RoundedBox(3, new Vector3(10, 0.3, 0.8), 0.1).toMesh('stickbase');
    const dot = MeshBuilder.CreateSphere('dot', { diameter: 0.4 });
    dot.position.x = 0;
    dot.position.y = 0.2;
    const baseCsg = CSG.FromMesh(base);
    const dotCsg = CSG.FromMesh(dot);
    const mesh = baseCsg.subtract(dotCsg).toMesh('stick', res.mat.riichiStick, undefined, true);
    base.dispose();
    dot.dispose();
    mesh.getScene().removeMesh(mesh);
    return mesh;
  }

  public static getNew() {
    if (!RiichiStick._stick) {
      RiichiStick._stick = RiichiStick._createStick();
    }
    return RiichiStick._stick.clone();
  }
}
