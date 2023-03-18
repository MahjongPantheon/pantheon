import { Tile } from '#/objects/tile';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Scene } from '@babylonjs/core/scene';
import { N_TileValue } from '#/generated/njord.pb';

export class Wall {
  private _rootNode: TransformNode;
  private _subNodes: TransformNode[];
  private _breakAt?: number;
  private _tiles: Tile[];
  private readonly _wallWidth = 17 * Tile.W;
  private readonly _wallPos = Tile.W + this._wallWidth / 2;

  constructor() {
    this._tiles = [];
    for (let i = 0; i < 136; i++) {
      this._tiles.push(new Tile());
    }
    this._rootNode = new TransformNode('wall');
    this._subNodes = [1, 2, 3, 4].map((i) => {
      const node = new TransformNode('wall_part_' + i);
      node.parent = this._rootNode;
      return node;
    });
    this._subNodes[0].position.x = this._wallPos;
    this._subNodes[1].rotation.y = Math.PI / 2;
    this._subNodes[1].position.z = -this._wallPos;
    this._subNodes[2].position.x = -this._wallPos;
    this._subNodes[2].rotation.y = Math.PI;
    this._subNodes[3].rotation.y = -Math.PI / 2;
    this._subNodes[3].position.z = this._wallPos;
    this._buildWall();
  }

  // get tile in the ring by module 136
  protected _getTileIdx(position: number) {
    while (position < 0) {
      position += 136;
    }
    position += 136; // just in case
    return position % 136;
  }

  public setBreak(dicesValue: number, doraValue: N_TileValue) {
    this._breakAt = -(
      // Negative to count counterclockwise
      (
        34 * (dicesValue - 1) - // Starting from current player
        2 * (dicesValue - 1)
      ) // Count N stacks of 2 tiles
    );
    const tile = this._tiles[this._getTileIdx(this._breakAt - 4)];
    tile.setType(doraValue);
    tile.getRoot().rotation.z = 0; // flip indicator
  }

  public takeTile(index: number) {
    this._tiles[this._getTileIdx(index)].dispose();
  }

  public addToScene(scene: Scene) {
    scene.addTransformNode(this._rootNode);
  }

  protected _buildWall() {
    this._tiles.forEach((tile, idx) => {
      tile.getRoot().rotation.z = Math.PI;
      tile.getRoot().position.y = Tile.D / 2 + (idx % 2 === 0 ? Tile.D : 0); // top and bottom tile
      tile.getRoot().position.z = -(
        Tile.W / 2 -
        this._wallWidth / 2 +
        Math.floor((idx % 34) / 2) * Tile.W
      );
      tile.getRoot().parent = this._subNodes[Math.floor(idx / 34)];
    });
  }
}
