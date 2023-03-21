import { Scene } from '@babylonjs/core/scene';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { ActionManager } from '@babylonjs/core/Actions/actionManager';
import { CSG } from '@babylonjs/core/Meshes/csg';
import { N_TileValue } from '#/generated/njord.pb';
import { res } from '#/scene/resources';
import { RoundedBox } from '#/scene/objects/roundedBox';

export class Tile {
  private readonly _rootNode: TransformNode;
  private _meshes: Mesh[] = [];
  private _actionManager?: ActionManager;
  private _type: N_TileValue = 'NIL';
  private _isAka: boolean = false;
  private _isTsumogiri: boolean = false;
  public static readonly H = 3.2;
  public static readonly W = 2.4;
  public static readonly D = 1.6;

  private static _clonableBaseMesh: Mesh | null = null;
  protected static getBase(): Mesh {
    if (!Tile._clonableBaseMesh) {
      const boxBase = new RoundedBox(1, new Vector3(Tile.H, Tile.D, Tile.W), 0.2);
      const base = boxBase.toMesh('base');
      const baseCsg = CSG.FromMesh(base);

      const backBase = new RoundedBox(1, new Vector3(Tile.H, Tile.D, Tile.W), 0.2);
      const back = backBase.toMesh('back');
      const backCsg = CSG.FromMesh(back);

      const cropBox = MeshBuilder.CreateBox('crop', {
        width: Tile.H * 2,
        height: Tile.W * 2,
        depth: Tile.D * 2,
      });
      cropBox.position.y = -2.9;
      const cropCsg = CSG.FromMesh(cropBox);

      Tile._clonableBaseMesh = baseCsg
        .subtract(cropCsg)
        .union(backCsg.intersect(cropCsg))
        .toMesh('tile', res.mat.tile, undefined, true);

      base.dispose();
      back.dispose();
      cropBox.dispose();
      Tile._clonableBaseMesh.getScene().removeMesh(Tile._clonableBaseMesh);
    }

    return Tile._clonableBaseMesh.clone();
  }

  public constructor() {
    const tileValue = MeshBuilder.CreatePlane('val', {
      size: 1,
      width: Tile.H * 0.8,
      height: Tile.W * 0.8,
    });
    tileValue.rotation.x = Math.PI / 2;
    tileValue.position.y = Tile.D * 0.505;
    this._meshes.push(tileValue); // value is expected to be #0 always
    this._meshes.push(Tile.getBase());

    this._rootNode = new TransformNode('tile');
    this._meshes.forEach((n) => (n.parent = this._rootNode));
  }

  public static new(type: N_TileValue, aka?: boolean, tsumogiri?: boolean): Tile {
    return new Tile().setType(type, aka, tsumogiri);
  }

  public getType(): N_TileValue {
    return this._type;
  }

  public getIsAka(): boolean {
    return this._isAka;
  }

  public setType(type: N_TileValue, aka?: boolean, tsumogiri?: boolean): Tile {
    this._isAka = aka ?? false;
    this._isTsumogiri = tsumogiri ?? false;
    const mat = aka ? res.mat.tileValuesAka[type] : res.mat.tileValues[type];
    if (mat) {
      this._type = type;
      this._meshes[0].material = mat;
    }
    if (tsumogiri) {
      this._meshes[1].material = res.mat.tileTsumogiri;
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
