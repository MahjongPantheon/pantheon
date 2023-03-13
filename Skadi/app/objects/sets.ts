import { N_ClaimedFrom } from '#/generated/njord.pb';
import { Tile } from '#/objects/tile';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Scene } from '@babylonjs/core/scene';

const rnd = () => 0.01 + Math.random() * 0.05;

export interface CalledSet {
  getWidth(): number;
  getRoot(): TransformNode;
  addToScene(scene: Scene): CalledSet;
  get pon(): boolean;
  get chi(): boolean;
  get shominkan(): boolean;
  get daiminkan(): boolean;
  get ankan(): boolean;
}

// Pon and chi
// Last tile in input array is assumed to be the one that is claimed
export class SimpleSet implements CalledSet {
  private readonly _rootNode: TransformNode;

  protected static updateTilePositions(
    tiles: Tile[],
    claimedFrom: N_ClaimedFrom,
    setWidth: number
  ) {
    switch (claimedFrom) {
      case 'KAMICHA':
        // Position relative to the 3d center of the box
        tiles[2].getRoot().position.z = -(setWidth / 2);
        tiles[0].getRoot().position.z = -(setWidth / 2) + (Tile.H / 2 + Tile.W / 2) + rnd();
        tiles[1].getRoot().position.z =
          -(setWidth / 2) + Tile.W + (Tile.H / 2 + Tile.W / 2) + rnd();
        break;
      case 'SHIMOCHA':
        // Position relative to the 3d center of the box
        tiles[0].getRoot().position.z = -(setWidth / 2);
        tiles[1].getRoot().position.z = -(setWidth / 2) + Tile.W + rnd();
        tiles[2].getRoot().position.z =
          -(setWidth / 2) + Tile.W + (Tile.H / 2 + Tile.W / 2) + rnd();
        break;
      case 'TOIMEN':
        // Position relative to the 3d center of the box
        tiles[0].getRoot().position.z = -(setWidth / 2);
        tiles[2].getRoot().position.z = -(setWidth / 2) + (Tile.H / 2 + Tile.W / 2) + rnd();
        tiles[1].getRoot().position.z = -(setWidth / 2) + Tile.W + Tile.H + rnd();
        break;
    }
    tiles[2].getRoot().rotation.y = Math.PI / 2 + rnd();
    tiles[2].getRoot().position.x = (Tile.H - Tile.W) / 2;
    return tiles;
  }

  constructor(private _tiles: Tile[], private _claimedFrom: N_ClaimedFrom) {
    if (_tiles.length !== 3) {
      throw new Error('Wrong tiles count');
    }
    SimpleSet.updateTilePositions(_tiles, _claimedFrom, this.getWidth());
    this._rootNode = new TransformNode('set_pon');
    _tiles.forEach((t) => (t.getRoot().parent = this._rootNode));
  }

  get pon() {
    return (
      this._tiles.length === 3 &&
      this._tiles[0].getType() === this._tiles[1].getType() &&
      this._tiles[1].getType() === this._tiles[2].getType()
    );
  }

  get chi() {
    return this._tiles.length === 3 && !this.pon;
  }

  get shominkan() {
    return this._tiles.length === 4;
  }

  get daiminkan() {
    return false;
  }

  get ankan() {
    return false;
  }

  public makeShominkan(tile: Tile) {
    const validPon =
      this._tiles[0].getType() === this._tiles[1].getType() &&
      this._tiles[1].getType() === this._tiles[2].getType();
    const validKan = this._tiles[0].getType() === tile.getType();
    if (!validPon) {
      throw new Error("Can't make shominkan: not a pon");
    }
    if (!validKan) {
      throw new Error("Can't make shominkan: different tile");
    }

    tile.getRoot().rotation = this._tiles[2].getRoot().rotation.clone();
    tile.getRoot().position = this._tiles[2].getRoot().position.clone();
    tile.getRoot().position.x -= Tile.W;
    tile.getRoot().parent = this._rootNode;
    this._tiles.push(tile);
  }

  public getWidth() {
    return Tile.H + Tile.W + Tile.W;
  }

  public getRoot(): TransformNode {
    return this._rootNode;
  }

  public addToScene(scene: Scene): CalledSet {
    this._tiles.forEach((n) => n.addToScene(scene));
    scene.addTransformNode(this._rootNode);
    return this;
  }
}

// Last tile in input array is assumed to be the one that is claimed
export class Daiminkan implements CalledSet {
  private readonly _rootNode: TransformNode;

  constructor(private _tiles: Tile[], private _claimedFrom: N_ClaimedFrom) {
    if (_tiles.length !== 4) {
      throw new Error('Wrong tiles count');
    }
    Daiminkan.updateTilePositions(_tiles, _claimedFrom, this.getWidth());
    this._rootNode = new TransformNode('set_pon');
    _tiles.forEach((t) => (t.getRoot().parent = this._rootNode));
  }

  protected static updateTilePositions(
    tiles: Tile[],
    claimedFrom: N_ClaimedFrom,
    setWidth: number
  ) {
    switch (claimedFrom) {
      case 'KAMICHA':
        // Position relative to the 3d center of the box
        tiles[3].getRoot().position.z = -(setWidth / 2);
        tiles[0].getRoot().position.z = -(setWidth / 2) + (Tile.H / 2 + Tile.W / 2) + rnd();
        tiles[1].getRoot().position.z =
          -(setWidth / 2) + Tile.W + (Tile.H / 2 + Tile.W / 2) + rnd();
        tiles[2].getRoot().position.z =
          -(setWidth / 2) + Tile.W + Tile.W + (Tile.H / 2 + Tile.W / 2) + rnd();
        break;
      case 'SHIMOCHA':
        // Position relative to the 3d center of the box
        tiles[0].getRoot().position.z = -(setWidth / 2);
        tiles[1].getRoot().position.z = -(setWidth / 2) + Tile.W + rnd();
        tiles[2].getRoot().position.z = -(setWidth / 2) + Tile.W + Tile.W + rnd();
        tiles[3].getRoot().position.z =
          -(setWidth / 2) + Tile.W + Tile.W + (Tile.H / 2 + Tile.W / 2) + rnd();
        break;
      case 'TOIMEN':
        // Position relative to the 3d center of the box
        tiles[0].getRoot().position.z = -(setWidth / 2);
        tiles[3].getRoot().position.z = -(setWidth / 2) + (Tile.H / 2 + Tile.W / 2) + rnd();
        tiles[2].getRoot().position.z = -(setWidth / 2) + 2 * (Tile.H / 2 + Tile.W / 2) + rnd();
        tiles[1].getRoot().position.z = -(setWidth / 2) + Tile.W + Tile.W + Tile.H + rnd();
        break;
    }
    tiles[3].getRoot().rotation.y = Math.PI / 2 + rnd();
    tiles[3].getRoot().position.x = (Tile.H - Tile.W) / 2;
    return tiles;
  }

  get pon() {
    return false;
  }
  get chi() {
    return false;
  }
  get shominkan() {
    return false;
  }
  get daiminkan() {
    return true;
  }
  get ankan() {
    return false;
  }

  public getWidth() {
    return Tile.H + Tile.W + Tile.W + Tile.W;
  }

  public getRoot(): TransformNode {
    return this._rootNode;
  }

  public addToScene(scene: Scene): CalledSet {
    this._tiles.forEach((n) => n.addToScene(scene));
    scene.addTransformNode(this._rootNode);
    return this;
  }
}

// Last tile in input array is assumed to be the one that is claimed
export class Ankan implements CalledSet {
  private readonly _rootNode: TransformNode;

  constructor(private _tiles: Tile[]) {
    if (_tiles.length !== 4) {
      throw new Error('Wrong tiles count');
    }
    Ankan.updateTilePositions(_tiles, this.getWidth());
    this._rootNode = new TransformNode('set_pon');
    _tiles.forEach((t) => (t.getRoot().parent = this._rootNode));
  }

  protected static updateTilePositions(tiles: Tile[], setWidth: number) {
    // Position relative to the 3d center of the box
    tiles[0].getRoot().position.z = -(setWidth / 2);
    tiles[1].getRoot().position.z = -(setWidth / 2) + Tile.W + rnd();
    tiles[2].getRoot().position.z = -(setWidth / 2) + 2 * Tile.W + rnd();
    tiles[3].getRoot().position.z = -(setWidth / 2) + 3 * Tile.W + rnd();
    tiles[0].getRoot().rotation.x = Math.PI;
    tiles[3].getRoot().rotation.x = Math.PI;
    return tiles;
  }

  get pon() {
    return false;
  }
  get chi() {
    return false;
  }
  get shominkan() {
    return false;
  }
  get daiminkan() {
    return false;
  }
  get ankan() {
    return true;
  }

  public getWidth() {
    return Tile.W * 4;
  }

  public getRoot(): TransformNode {
    return this._rootNode;
  }

  public addToScene(scene: Scene): CalledSet {
    this._tiles.forEach((n) => n.addToScene(scene));
    scene.addTransformNode(this._rootNode);
    return this;
  }
}
