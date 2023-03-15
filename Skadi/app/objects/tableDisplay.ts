import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { res } from '#/resources';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';

const font = '"DSEG7 Classic Mini"';
const digitsWidth = 9;
const planeWidth = digitsWidth;
const planeHeight = 2;
const DTWidth = planeWidth * 60;
const DTHeight = planeHeight * 60;

export class TableDisplay {
  private readonly _tex: DynamicTexture;
  private readonly _mat: StandardMaterial;
  private readonly _mesh: Mesh;
  private _fontSettings;

  constructor() {
    this._tex = new DynamicTexture('table_display', { width: DTWidth, height: DTHeight });
    this._tex.updateSamplingMode(Texture.TRILINEAR_SAMPLINGMODE);

    const ctx = this._tex.getContext();
    const size = 44;
    ctx.font = size + 'px ' + font;
    const textWidth = ctx.measureText('0'.repeat(digitsWidth)).width;
    const ratio = textWidth / size;
    const fontSize = Math.floor(DTWidth / ratio);
    this._fontSettings = fontSize + 'px ' + font;

    this._mat = new StandardMaterial('Mat');
    this._mat.diffuseTexture = this._tex;
    this._mat.specularColor = new Color3(0, 0, 0);
    this._mesh = MeshBuilder.CreatePlane('table_display', {
      width: planeWidth,
      height: planeHeight,
    });
    this._mesh.material = this._mat;
  }

  setValue(val: number, round: number) {
    const padded = val
      .toString()
      .padStart(digitsWidth, ' ' /* figure space - same width as numbers! */);
    this._tex.drawText(padded, 0, 100, this._fontSettings, 'black', '#999999', true, true);
    this._tex
      .getContext()
      .drawImage(res.tex.winds[round], 0, 0, 350, 350, 20, 0, DTHeight, DTHeight);
    this._tex.update();
  }

  get mesh() {
    return this._mesh;
  }
}
