import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { res } from '#/scene/resources';
import { Scene } from '@babylonjs/core/scene';
import { TableDisplay } from '#/scene/objects/tableDisplay';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { RiichiStick } from '#/scene/objects/riichiStick';
import { State } from '#/helpers/state';
import { WindDisplay } from '#/scene/objects/windDisplay';
import { TableInfo } from '#/scene/objects/tableInfo';

export class TableCenter {
  private readonly _rootNode: TransformNode;
  private _tableInfo: TableInfo;
  private _scoreDisplays: TableDisplay[] = [];
  private _windDisplays: WindDisplay[] = [];
  private _sticks: Mesh[] = [];

  constructor() {
    this._rootNode = new TransformNode('table_center');
    this._tableInfo = new TableInfo();
    this._tableInfo.mesh.position.y = 0.8;
    this._tableInfo.mesh.rotation.x = Math.PI / 2;
    this._tableInfo.mesh.rotation.y = -Math.PI / 2;
    this._tableInfo.mesh.parent = this._rootNode;
    res.mdl.tableCenter.parent = this._rootNode;
    this._makeScoreDisplays();
    this._makeWindDisplays();
    this._makeSticks();
  }

  public setState(state: State) {
    this._tableInfo.setState(
      state.game?.currentRound!,
      state.game?.riichiOnTable!,
      state.game?.currentRenchan!
    );
    for (let i = 0; i < 4; i++) {
      this._scoreDisplays[i].setValue(state.game?.currentScores?.[i]!);
      this._windDisplays[i].setWind(state.game?.currentWinds?.[i]! as 'e' | 's' | 'w' | 'n');
      this._sticks[i].visibility = state.currentRound?.currentRiichi?.[i] ? 1 : 0;
    }
  }

  private _makeSticks() {
    this._sticks = [
      RiichiStick.getNew(),
      RiichiStick.getNew(),
      RiichiStick.getNew(),
      RiichiStick.getNew(),
    ];

    this._sticks[0].position.z = 0.45;
    this._sticks[0].position.x = 6.45;
    this._sticks[0].rotation.y = -Math.PI / 2;

    this._sticks[1].position.x = -0.45;
    this._sticks[1].position.z = 6.45;
    this._sticks[1].rotation.y = Math.PI;

    this._sticks[2].position.z = -0.45;
    this._sticks[2].position.x = -6.45;
    this._sticks[2].rotation.y = Math.PI / 2;

    this._sticks[3].position.x = 0.45;
    this._sticks[3].position.z = -6.45;

    this._sticks.forEach((d) => {
      d.position.y = 0.7;
      d.scaling = new Vector3(0.75, 1, 0.8);
      d.parent = this._rootNode;
      d.visibility = 0;
    });
  }

  private _makeScoreDisplays() {
    this._scoreDisplays = [
      new TableDisplay(),
      new TableDisplay(),
      new TableDisplay(),
      new TableDisplay(),
    ];
    this._scoreDisplays[0].mesh.position.x = 4.5;
    this._scoreDisplays[0].mesh.position.z = 0.4;
    this._scoreDisplays[0].mesh.rotation.y = -Math.PI / 2;

    this._scoreDisplays[1].mesh.position.z = 4.5;
    this._scoreDisplays[1].mesh.position.x = -0.4;
    this._scoreDisplays[1].mesh.rotation.y = Math.PI;

    this._scoreDisplays[2].mesh.position.x = -4.5;
    this._scoreDisplays[2].mesh.position.z = -0.4;
    this._scoreDisplays[2].mesh.rotation.y = Math.PI / 2;

    this._scoreDisplays[3].mesh.position.z = -4.5;
    this._scoreDisplays[3].mesh.position.x = 0.4;

    this._scoreDisplays.forEach((d) => {
      d.mesh.position.y = 0.76;
      d.mesh.scaling = new Vector3(0.9, 1, 1);
      d.mesh.rotation.x = Math.PI / 2;
      d.mesh.parent = this._rootNode;
    });
  }

  private _makeWindDisplays() {
    this._windDisplays = [
      new WindDisplay(),
      new WindDisplay(),
      new WindDisplay(),
      new WindDisplay(),
    ];
    this._windDisplays[0].mesh.position.x = 6.15;
    this._windDisplays[0].mesh.position.z = 6.15;
    this._windDisplays[0].mesh.rotation.y = -Math.PI / 2;

    this._windDisplays[1].mesh.position.x = -6.15;
    this._windDisplays[1].mesh.position.z = 6.15;
    this._windDisplays[1].mesh.rotation.y = Math.PI;

    this._windDisplays[2].mesh.position.x = -6.15;
    this._windDisplays[2].mesh.position.z = -6.15;
    this._windDisplays[2].mesh.rotation.y = Math.PI / 2;

    this._windDisplays[3].mesh.position.x = 6.15;
    this._windDisplays[3].mesh.position.z = -6.15;

    this._windDisplays.forEach((d) => {
      d.mesh.position.y = 0.71;
      d.mesh.scaling = new Vector3(2, 2, 2);
      d.mesh.rotation.x = Math.PI / 2;
      d.mesh.parent = this._rootNode;
    });
  }

  addToScene(scene: Scene) {
    scene.addTransformNode(this._rootNode);
  }

  getRoot() {
    return this._rootNode;
  }
}
