import { Tile } from '#/scene/objects/tile';
import { Ankan, CalledSet, Daiminkan, SimpleSet } from '#/scene/objects/sets';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Scene } from '@babylonjs/core/scene';
import { ActionManager } from '@babylonjs/core/Actions/actionManager';
import { CombineAction, ExecuteCodeAction } from '@babylonjs/core/Actions/directActions';
import { InterpolateValueAction } from '@babylonjs/core/Actions/interpolateValueAction';
import { N_ClaimedFrom, N_Hand } from '#/generated/njord.pb';
import { RecursivePartial } from '#/helpers/partial';

const rightOffset = 9.1;
const bottomOffset = 2;

export class Hand {
  private _closedPart: Tile[] = [];
  private _tsumopai?: Tile;
  private _openPart: CalledSet[] = [];
  private _rootNode: TransformNode;

  private readonly _closedPartMaxWidth = Tile.W * 21 + 0.5; // Bigger size due to biggest hand of 4 daiminkans
  private get _closedPartWidth() {
    return Tile.W * (this._closedPart.length + 1) + 0.5 /* span between hand and tsumopai */;
  }

  constructor() {
    this._rootNode = new TransformNode('hand');
  }

  setState(state?: RecursivePartial<N_Hand>) {
    if (!state) {
      return;
    }
    // TODO: update hand state according to input
  }

  getRoot(): TransformNode {
    return this._rootNode;
  }

  addToScene(scene: Scene): Hand {
    scene.addTransformNode(this._rootNode);
    return this;
  }

  private _initEventHandlers(t: Tile) {
    const actionManager = new ActionManager(this._rootNode.getScene());
    const initX = t.getRoot().position.x;

    actionManager.registerAction(
      new CombineAction(ActionManager.OnPickTrigger, [
        new ExecuteCodeAction(ActionManager.NothingTrigger, (e) => {
          this.discard(t);
        }),
        new InterpolateValueAction(
          ActionManager.NothingTrigger,
          t.getRoot().position,
          'x',
          initX - 1,
          200
        ),
        new InterpolateValueAction(ActionManager.NothingTrigger, t, 'visibility', 0, 200),
      ])
    );

    actionManager.registerAction(
      new InterpolateValueAction(
        ActionManager.OnPointerOutTrigger,
        t.getRoot().position,
        'x',
        initX,
        150
      )
    );
    actionManager.registerAction(
      new InterpolateValueAction(
        ActionManager.OnPointerOverTrigger,
        t.getRoot().position,
        'x',
        initX - 0.3,
        150
      )
    );

    t.setActionManager(actionManager);
  }

  take4(tiles: Tile[]): Hand {
    tiles.forEach((t) => this.take1(t));
    return this;
  }

  take1(tile: Tile): Hand {
    this._closedPart.push(tile);
    tile.getRoot().parent = this._rootNode;
    tile.getRoot().position.z =
      -this._closedPartMaxWidth / 2 + this._closedPart.length * Tile.W - Tile.W / 2;
    this._initEventHandlers(tile);
    return this;
  }

  takeTsumopai(tile: Tile): Hand {
    this._tsumopai = tile;
    tile.getRoot().parent = this._rootNode;
    tile.getRoot().position.z = -this._closedPartMaxWidth / 2 + this._closedPartWidth - Tile.W / 2;
    this._initEventHandlers(tile);
    return this;
  }

  protected _rebuildTilePositions() {
    this._closedPart.forEach((tile, index) => {
      tile.getRoot().position.z =
        -this._closedPartMaxWidth / 2 + index * Tile.W + Tile.W / 2 + rightOffset;
    });
    if (this._tsumopai) {
      this._tsumopai.getRoot().position.z =
        -this._closedPartMaxWidth / 2 + this._closedPartWidth - Tile.W / 2 + rightOffset;
    }
  }

  claimPon(tile: Tile, indicesInHand: number[], claimFrom: N_ClaimedFrom) {
    const tile1 = this._closedPart[indicesInHand[0]];
    const tile2 = this._closedPart[indicesInHand[1]];
    this._closedPart = this._closedPart.filter((t) => t !== tile1 && t !== tile2);
    this._rebuildTilePositions();
    const pon = new SimpleSet([tile1, tile2, tile], claimFrom);
    pon.getRoot().parent = this._rootNode;
    pon.getRoot().rotation.z = Math.PI / 2;
    pon.getRoot().position.x = Tile.D / 2;
    pon.getRoot().position.y = bottomOffset;
    pon.getRoot().position.z =
      // (1 + this._closedPart.length) * Tile.W +
      this._closedPartMaxWidth / 2 -
      this._openPart.reduce((acc, set) => acc + set.getWidth() + 0.3, 0) -
      pon.getWidth() / 2 +
      rightOffset;
    this._openPart.push(pon);
  }

  claimDaiminkan(tile: Tile, indicesInHand: number[], claimFrom: N_ClaimedFrom) {
    const tile1 = this._closedPart[indicesInHand[0]];
    const tile2 = this._closedPart[indicesInHand[1]];
    const tile3 = this._closedPart[indicesInHand[2]];
    this._closedPart = this._closedPart.filter((t) => t !== tile1 && t !== tile2 && t !== tile3);
    this._rebuildTilePositions();
    const kan = new Daiminkan([tile1, tile2, tile3, tile], claimFrom);
    kan.getRoot().parent = this._rootNode;
    kan.getRoot().rotation.z = Math.PI / 2;
    kan.getRoot().position.x = Tile.D / 2;
    kan.getRoot().position.y = bottomOffset;
    kan.getRoot().position.z =
      // (1 + this._closedPart.length) * Tile.W +
      this._closedPartMaxWidth / 2 -
      this._openPart.reduce((acc, set) => acc + set.getWidth() + 0.3, 0) -
      kan.getWidth() / 2 +
      rightOffset;
    this._openPart.push(kan);
  }

  claimAnkan(tile: Tile, indicesInHand: number[]) {
    const tile1 = this._closedPart[indicesInHand[0]];
    const tile2 = this._closedPart[indicesInHand[1]];
    const tile3 = this._closedPart[indicesInHand[2]];
    const tile4 = this._closedPart[indicesInHand[3]];
    this._closedPart = this._closedPart.filter(
      (t) => t !== tile1 && t !== tile2 && t !== tile3 && t !== tile4
    );
    this._rebuildTilePositions();
    const kan = new Ankan([tile1, tile2, tile3, tile]);
    kan.getRoot().parent = this._rootNode;
    kan.getRoot().rotation.z = Math.PI / 2;
    kan.getRoot().position.x = Tile.D / 2;
    kan.getRoot().position.y = bottomOffset;
    kan.getRoot().position.z =
      // (1 + this._closedPart.length) * Tile.W +
      this._closedPartMaxWidth / 2 -
      this._openPart.reduce((acc, set) => acc + set.getWidth() + 0.3, 0) -
      kan.getWidth() / 2 +
      rightOffset;
    this._openPart.push(kan);
  }

  // TODO: chi, shominkan

  discard(tile: Tile) {
    console.log('Discarded ' + tile.getType());
  }
}
