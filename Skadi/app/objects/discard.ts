import { Tile } from '#/objects/tile';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Scene } from '@babylonjs/core/scene';
import { rnd } from '#/helpers/rnd';

export class Discard {
  private _tiles: Tile[] = [];
  private _riichiOnTile: number | null = null;
  private _rootNode: TransformNode;
  private readonly _rndFactor: number = Math.random();

  constructor() {
    this._rootNode = new TransformNode('discard');
  }

  getWidth() {
    return (Tile.W + 0.05) * 6;
  }

  addToScene(scene: Scene) {
    scene.addTransformNode(this._rootNode);
    return this;
  }

  addTile(tile: Tile, riichi?: boolean) {
    if (riichi) {
      this._riichiOnTile = this._tiles.length;
    }
    tile.getRoot().parent = this._rootNode;
    this._tiles.push(tile);
    this._rebuildDiscard();
    return this;
  }

  private _rebuildDiscard() {
    let row = 0;
    let riichiAddedOnRow = false;
    for (let i = 0; i < this._tiles.length; i++) {
      if (i > 0 && i % 6 === 0 && row < 2) {
        // split by rows 6 tiles each
        row++;
        riichiAddedOnRow = false;
      }
      if (this._riichiOnTile !== null && this._riichiOnTile === i) {
        // riichi tile
        this._tiles[i].getRoot().rotation.y = Math.PI / 2 + rnd(i * this._rndFactor);
        const xPos = Tile.H / 2 + Tile.W * (row < 2 ? i % 6 : i - 12);
        const yPos = Tile.H / 2 + (Tile.H - Tile.W) / 2 + Tile.H * row;
        this._tiles[i].getRoot().position.z = xPos + 0.03;
        this._tiles[i].getRoot().position.x = yPos + 0.03;
        riichiAddedOnRow = true;
      } else {
        const addSpace = riichiAddedOnRow ? Tile.H - Tile.W : 0;
        const xPos = Tile.W / 2 + Tile.W * (row < 2 ? i % 6 : i - 12);
        const yPos = Tile.H / 2 + Tile.H * row;
        this._tiles[i].getRoot().position.z = xPos + addSpace + 0.03;
        this._tiles[i].getRoot().position.x = yPos + 0.03;
        this._tiles[i].getRoot().rotation.y = rnd(i * this._rndFactor);
      }
    }
  }
}
