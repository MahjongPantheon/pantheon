import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { res } from '#/scene/resources';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';

const font = '"PT Sans Narrow"';
const planeSize = 5;
const DTSize = 512;

export class TableInfo {
  private readonly _rootNode: TransformNode;
  private readonly _tex: DynamicTexture;
  private readonly _mat: StandardMaterial;
  private readonly _mesh: Mesh;
  private readonly _sub: Mesh;
  private _fontSettingsRound;
  private _fontSettings;

  constructor() {
    this._rootNode = new TransformNode('table_display');

    // Note: generateMipmaps = true for better smoothing
    this._tex = new DynamicTexture('display', { width: DTSize, height: DTSize }, null, true);
    this._tex.hasAlpha = true;
    this._fontSettings = '140px ' + font;
    this._fontSettingsRound = '200px ' + font;

    this._mat = new StandardMaterial('Mat');
    this._mat.diffuseTexture = this._mat.opacityTexture = this._tex;

    this._mat.alphaMode = 2; // ALPHA_COMBINE
    this._mat.useAlphaFromDiffuseTexture = true;
    this._mat.alpha = 0.9;
    this._mat.specularColor = new Color3(0, 0, 0);
    this._mesh = MeshBuilder.CreatePlane('display', {
      width: planeSize,
      height: planeSize,
    });
    this._mesh.material = this._mat;

    this._sub = MeshBuilder.CreatePlane('display_sub', { width: planeSize, height: planeSize });
    this._sub.material = res.mat.displaySub;
    this._sub.position.z = 0.002;

    this._mesh.parent = this._rootNode;
    this._sub.parent = this._rootNode;
  }

  setState(round: number, riichi: number, honba: number) {
    const ctx = this._tex.getContext();
    ctx.clearRect(0, 0, DTSize, DTSize);
    ctx.font = this._fontSettings;
    const rnd = ['e', 's', 'w', 'n'][round] as 'e' | 's' | 'w' | 'n';

    // Round index
    ctx.drawImage(res.tex.indicators[rnd], 40, 40, 160, 160);
    ctx.drawImage(res.tex.kyoku, 320, 40, 160, 160);
    this._tex.drawText(
      round.toString(),
      220,
      200,
      this._fontSettingsRound,
      'black',
      null,
      true,
      true
    );
    // Riichi count
    ctx.drawImage(res.tex.riichi, 40, 280, 72, 150);
    this._tex.drawText(riichi.toString(), 110, 405, this._fontSettings, 'black', null, true, true);
    // Honba count
    ctx.drawImage(res.tex.honba, 280, 280, 72, 150);
    this._tex.drawText(honba.toString(), 350, 405, this._fontSettings, 'black', null, true, true);
    this._tex.update();
  }

  get mesh() {
    return this._rootNode;
  }
}
