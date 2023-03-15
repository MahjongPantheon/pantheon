import { Scene } from '@babylonjs/core/scene';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { ActionManager } from '@babylonjs/core/Actions/actionManager';
import { CSG } from '@babylonjs/core/Meshes/csg';
import { N_TileValue } from '#/generated/njord.pb';
import { res } from '#/resources';
import { RoundedBox } from '#/objects/roundedBox';

export class Tile {
  private readonly _rootNode: TransformNode;
  private _meshes: Mesh[] = [];
  private _actionManager?: ActionManager;
  private _type: N_TileValue = 'NIL';
  public static readonly H = 3.2;
  public static readonly W = 2.4;
  public static readonly D = 1.6;

  private static _clonableBaseMesh: [Mesh, Mesh] | null = null;
  protected static getBase(): [Mesh, Mesh] {
    if (!Tile._clonableBaseMesh) {
      const boxBase = new RoundedBox(3, new Vector3(Tile.H, Tile.D, Tile.W), 0.2);
      const base = boxBase.toMesh('base');
      base.material = res.mat.tileBase;
      const baseCsg = CSG.FromMesh(base);

      const backBase = new RoundedBox(3, new Vector3(Tile.H, Tile.D, Tile.W), 0.2);
      const back = backBase.toMesh('back');
      back.material = res.mat.tileBack;
      const backCsg = CSG.FromMesh(back);

      const cropBox = MeshBuilder.CreateBox('crop', {
        width: Tile.H * 2,
        height: Tile.W * 2,
        depth: Tile.D * 2,
      });
      cropBox.position.y = -2.9;
      const cropCsg = CSG.FromMesh(cropBox);

      const baseCropped = baseCsg.subtract(cropCsg).toMesh('csg_base', res.mat.tileBase);
      const backCropped = backCsg.intersect(cropCsg).toMesh('csg_back', res.mat.tileBack);
      Tile._clonableBaseMesh = [baseCropped, backCropped];

      base.dispose();
      back.dispose();
      cropBox.dispose();
      baseCropped.getScene().removeMesh(baseCropped);
      backCropped.getScene().removeMesh(backCropped);
    }

    return Tile._clonableBaseMesh.map((m) => m.clone()) as [Mesh, Mesh];
  }

  public constructor() {
    const tileValue = MeshBuilder.CreatePlane('val', {
      size: 1,
      width: Tile.H * 0.8,
      height: Tile.W * 0.8,
    });
    tileValue.rotation.x = Math.PI / 2;
    tileValue.position.y = Tile.D * 0.505;
    this._meshes.push(tileValue);

    const [base, back] = Tile.getBase();
    this._meshes.push(base);
    this._meshes.push(back);

    this._rootNode = new TransformNode('tile');
    this._meshes.forEach((n) => (n.parent = this._rootNode));
  }

  public static new(type: N_TileValue, aka?: boolean): Tile {
    return new Tile().setType(type, aka);
  }

  public getType(): N_TileValue {
    return this._type;
  }

  public setType(type: N_TileValue, aka?: boolean): Tile {
    const mat = aka ? res.mat.tileValuesAka[type] : res.mat.tileValues[type];
    if (mat) {
      this._type = type;
      this._meshes[0].material = mat;
    }
    return this;
  }

  get visibility() {
    return this._meshes[0].visibility;
  }

  set visibility(v: number) {
    this._meshes.forEach((m) => {
      m.visibility = v;
    });
  }

  public getRoot() {
    return this._rootNode;
  }

  public setActionManager(m: ActionManager) {
    this._actionManager = m;
    this._meshes.forEach((m) => {
      m.actionManager = this._actionManager!;
    });
    return this._actionManager;
  }

  public addToScene(scene: Scene): Tile {
    this._meshes.forEach((n) => scene.addMesh(n));
    scene.addTransformNode(this._rootNode);
    return this;
  }

  public dispose() {
    this._meshes.forEach((m) => {
      m.actionManager = null;
      m.dispose();
    });
    this._actionManager?.dispose();
    this._rootNode.dispose();
  }
}
