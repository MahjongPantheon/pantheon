import { Scene } from '@babylonjs/core/scene';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { GroundMesh } from '@babylonjs/core/Meshes/groundMesh';
import { TableBorder } from '#/scene/objects/tableBorder';
import { TableCenter } from '#/scene/objects/tableCenter';
import { Discard } from '#/scene/objects/discard';
import { Tile } from '#/scene/objects/tile';
import { Hand } from '#/scene/objects/hand';
import { Wall } from '#/scene/objects/wall';
import { Lightbox } from '#/scene/objects/lightbox';
import { res } from '#/scene/resources';
import { N_TileValue } from '#/generated/njord.pb';
import { State } from '#/helpers/state';

export const TABLE_SIZE = 75;

const vOffsetDis = 9.5;
const hOffsetDis = 5.2;
const discardPositions = [
  new Vector3(vOffsetDis, Tile.D / 2, -hOffsetDis),
  new Vector3(hOffsetDis, Tile.D / 2, vOffsetDis),
  new Vector3(-vOffsetDis, Tile.D / 2, hOffsetDis),
  new Vector3(-hOffsetDis, Tile.D / 2, -vOffsetDis),
];
const discardRotationY = [0, -Math.PI / 2, Math.PI, Math.PI / 2];
const handPositions = [
  new Vector3(30, Tile.H / 2, 0),
  new Vector3(0, Tile.H / 2, 30),
  new Vector3(-30, Tile.H / 2, 0),
  new Vector3(0, Tile.H / 2, -30),
];
const handRotation = [
  new Vector3(0, 0, -Math.PI / 2),
  new Vector3(0, -Math.PI / 2, -Math.PI / 2),
  new Vector3(0, Math.PI, -Math.PI / 2),
  new Vector3(0, Math.PI / 2, -Math.PI / 2),
];

export class Table {
  private _border: TableBorder;
  private _center: TableCenter;
  private _discards: Discard[] = [];
  private _hands: Hand[] = [];
  private _wall: Wall;
  private _surface: GroundMesh;
  constructor(private _lights: Lightbox, scene: Scene) {
    this._border = new TableBorder(TABLE_SIZE);
    scene.addTransformNode(this._border.getRoot());

    this._surface = MeshBuilder.CreateGround(
      'table_surface',
      { width: TABLE_SIZE, height: TABLE_SIZE, subdivisions: 2, updatable: false },
      scene
    );

    this._surface.receiveShadows = true;
    this._surface.material = res.mat.table;

    this._center = new TableCenter();
    this._center.getRoot().position.y = -0.3;
    this._center.getRoot().scaling = new Vector3(1.2, 1.2, 1.2);
    this._center.addToScene(scene);
    // TODO remove
    this._center.setState({
      game: {
        currentRound: 1,
        currentRenchan: 1,
        riichiOnTable: 2,
        currentScores: [12300, 1200, 54300, 100],
        currentWinds: ['s', 'w', 'n', 'e'],
      },
      currentRound: {
        currentRiichi: [false, true, true, false],
      },
    });

    [1, 2, 3, 4].forEach((_, idx) => {
      // discards
      const dis = new Discard();
      // .addTile(Tile.new('CHUN'))
      dis.getRoot().position = discardPositions[idx];
      dis.getRoot().rotation.y = discardRotationY[idx];
      dis.addToScene(scene);
      dis.addTile(Tile.new(['SOU_1', 'SOU_2', 'SOU_3', 'SOU_4'][idx] as N_TileValue)); // TODO remove
      dis.addTile(Tile.new(['SOU_1', 'SOU_2', 'SOU_3', 'SOU_4'][idx] as N_TileValue)); // TODO remove
      dis.addTile(Tile.new(['SOU_1', 'SOU_2', 'SOU_3', 'SOU_4'][idx] as N_TileValue)); // TODO remove
      dis.addTile(Tile.new(['SOU_1', 'SOU_2', 'SOU_3', 'SOU_4'][idx] as N_TileValue)); // TODO remove
      dis.addTile(Tile.new(['SOU_1', 'SOU_2', 'SOU_3', 'SOU_4'][idx] as N_TileValue)); // TODO remove
      dis.addTile(Tile.new(['SOU_1', 'SOU_2', 'SOU_3', 'SOU_4'][idx] as N_TileValue)); // TODO remove
      this._discards.push(dis);

      // hands
      const hand = new Hand();
      hand.getRoot().position = handPositions[idx];
      hand.getRoot().rotation = handRotation[idx];
      hand.addToScene(scene);
      hand.take1(Tile.new(['SOU_1', 'SOU_2', 'SOU_3', 'SOU_4'][idx] as N_TileValue)); // TODO remove
      this._hands.push(hand);
    });

    this._wall = new Wall();
    this._wall.addToScene(scene);
    // this._wall.setBreak(7, 'SOU_2');
    // (window as any).wall = wall;

    this.resetState();
  }

  public setState(state: State) {
    this._center.setState(state);
    this._discards.forEach((dis, index) => {
      dis.setState(state.currentRound?.discards?.[index]);
    });
    this._hands.forEach((hand, index) => {
      hand.setState(state.currentRound?.hands?.[index]);
    });
    this._wall.setState(state.currentRound);
  }

  resetState() {
    // TODO: shadowing seems quirky
    [...this._discards, ...this._hands, this._wall].map((item) =>
      item
        .getRoot()
        .getChildMeshes()
        .map((m) => this._lights.addShadowCaster(m))
    );
  }
}
