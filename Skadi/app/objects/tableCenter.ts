import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { res } from '#/resources';
import { Scene } from '@babylonjs/core/scene';
import { TableDisplay } from '#/objects/tableDisplay';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { RiichiStick } from '#/objects/riichiStick';

export class TableCenter {
  private readonly _rootNode: TransformNode;
  private _scoreDisplays: TableDisplay[] = [];
  private _sticks: Mesh[] = [];

  constructor() {
    this._rootNode = new TransformNode('table_center');
    res.mdl.tableCenter.parent = this._rootNode;
    this._makeDisplays();
    this._makeSticks();
  }

  private _makeSticks() {
    this._sticks = [
      RiichiStick.getNew(),
      RiichiStick.getNew(),
      RiichiStick.getNew(),
      RiichiStick.getNew(),
    ];

    this._sticks[0].position.x = 6.3;
    this._sticks[0].rotation.y = -Math.PI / 2;

    this._sticks[1].position.z = 6.3;
    this._sticks[1].rotation.y = Math.PI;

    this._sticks[2].position.x = -6.3;
    this._sticks[2].rotation.y = Math.PI / 2;

    this._sticks[3].position.z = -6.3;

    this._sticks.forEach((d) => {
      d.position.y = 0.5;
      d.scaling = new Vector3(0.7, 0.7, 0.7);
      d.parent = this._rootNode;
      d.visibility = 0;
    });
  }

  private _makeDisplays() {
    this._scoreDisplays = [
      new TableDisplay(),
      new TableDisplay(),
      new TableDisplay(),
      new TableDisplay(),
    ];
    this._scoreDisplays[0].mesh.position.x = 4.5;
    this._scoreDisplays[0].mesh.position.z = -1;
    this._scoreDisplays[0].mesh.rotation.y = -Math.PI / 2;

    this._scoreDisplays[1].mesh.position.z = 4.5;
    this._scoreDisplays[1].mesh.position.x = 1;
    this._scoreDisplays[1].mesh.rotation.y = Math.PI;

    this._scoreDisplays[2].mesh.position.x = -4.5;
    this._scoreDisplays[2].mesh.position.z = 1;
    this._scoreDisplays[2].mesh.rotation.y = Math.PI / 2;

    this._scoreDisplays[3].mesh.position.z = -4.5;
    this._scoreDisplays[3].mesh.position.x = -1;

    this._scoreDisplays.forEach((d) => {
      d.mesh.position.y = 0.8;
      d.mesh.scaling = new Vector3(0.7, 1, 1);
      d.mesh.rotation.x = Math.PI / 2;
      d.mesh.parent = this._rootNode;
    });
  }

  setDisplayValues(vals: Array<{ score: number; wind: number }>) {
    for (let i = 0; i < 4; i++) {
      this._scoreDisplays[i].setValue(vals[i].score, vals[i].wind);
    }
  }

  setStick(index: number, visible: boolean) {
    this._sticks[index].visibility = visible ? 1 : 0;
  }

  addToScene(scene: Scene) {
    scene.addTransformNode(this._rootNode);
  }
}
