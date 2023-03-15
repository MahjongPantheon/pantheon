import { Scene } from '@babylonjs/core/scene';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { N_TileValue } from '#/generated/njord.pb';
import { MultiMaterial } from '@babylonjs/core/Materials/multiMaterial';

type Resources = {
  tex: {
    tileValues: Texture[];
    table: Texture;
    winds: HTMLImageElement[];
  };
  mat: {
    tileBack: StandardMaterial;
    tileBase: StandardMaterial;
    tileValues: Record<N_TileValue, StandardMaterial>;
    tileValuesAka: Record<N_TileValue, StandardMaterial>;
    table: StandardMaterial;
    tableCenter: StandardMaterial;
    riichiStickBase: StandardMaterial;
    riichiStickDot: StandardMaterial;
    riichiStick: MultiMaterial;
  };
};

export const res: Resources = {
  tex: {
    tileValues: [] as Texture[],
  },
  mat: {
    tileValues: {},
    tileValuesAka: {},
  },
} as Resources;

const loadTileTexture: (scene: Scene, i: string) => Promise<Texture> = (scene, i) => {
  return new Promise((resolve) => {
    const tex = new Texture('/assets/' + i + '.png', scene, undefined, undefined, undefined, () => {
      resolve(tex);
    });
    tex.hasAlpha = true;
    tex.wAng = -Math.PI / 2;
    // Empiric values
    tex.uOffset = 0.06;
    tex.vOffset = 0;
    tex.uScale = 0.89;
    tex.vScale = 1;
  });
};

export function preloadResources(scene: Scene): Promise<any> {
  const promises: Array<Promise<any>> = [];

  // Winds
  res.tex.winds = [new Image(), new Image(), new Image(), new Image()];
  res.tex.winds[0].src = '/assets/wind_ton.png';
  res.tex.winds[1].src = '/assets/wind_nan.png';
  res.tex.winds[2].src = '/assets/wind_sha.png';
  res.tex.winds[3].src = '/assets/wind_pei.png';
  for (let i = 0; i < 4; i++) {
    promises.push(
      new Promise((resolve) => {
        res.tex.winds[i].onload = () => {
          resolve(null);
        };
      })
    );
  }
  // Tiles
  res.mat.tileBack = new StandardMaterial('tile_back', scene);
  res.mat.tileBack.diffuseColor = new Color3(195 / 255, 149 / 255, 89 / 255);
  res.mat.tileBack.specularColor = new Color3(0, 0, 0); // eliminating the specular highlights of the phong model

  res.mat.tileBase = new StandardMaterial('tile_base', scene);
  res.mat.tileBase.ambientColor = Color3.White();

  res.mat.riichiStickBase = new StandardMaterial('stick_base', scene);
  res.mat.riichiStickBase.diffuseColor = Color3.White();
  res.mat.riichiStickBase.specularColor = new Color3(0, 0, 0);
  res.mat.riichiStickDot = new StandardMaterial('stick_dot', scene);
  res.mat.riichiStickDot.diffuseColor = Color3.Red();
  res.mat.riichiStickDot.specularColor = new Color3(0, 0, 0);
  res.mat.riichiStick = new MultiMaterial('stick', scene);
  res.mat.riichiStick.subMaterials.push(res.mat.riichiStickBase, res.mat.riichiStickDot);
  // eliminating the specular highlights of the phong model

  Object.values(N_TileValue)
    .filter(function (i): i is N_TileValue {
      return typeof i === 'string';
    })
    .forEach((i) => {
      if (i === 'NIL') return;
      promises.push(
        loadTileTexture(scene, i).then((tex) => {
          res.tex.tileValues.push(tex);

          const mat = new StandardMaterial('tile_value_' + i, scene);
          mat.opacityTexture = mat.diffuseTexture = tex;
          mat.specularColor = new Color3(0, 0, 0); // eliminating the specular highlights of the phong model
          res.mat.tileValues[i] = mat;

          const matAka = new StandardMaterial('tile_value_' + i, scene);
          matAka.opacityTexture = tex;
          matAka.diffuseColor = Color3.Red();
          matAka.specularColor = new Color3(0, 0, 0); // eliminating the specular highlights of the phong model
          res.mat.tileValuesAka[i] = matAka;
        })
      );
    });

  // Table
  promises.push(
    new Promise((resolve) => {
      res.tex.table = new Texture(
        '/assets/surface.png',
        scene,
        undefined,
        undefined,
        undefined,
        () => {
          resolve(null);
        }
      );
      res.tex.table.vScale = res.tex.table.uScale = 10;
    })
  );

  res.mat.table = new StandardMaterial('groundMat', scene);
  res.mat.table.specularColor = new Color3(0, 0, 0); // eliminating the specular highlights of the phong model
  res.mat.table.opacityTexture = res.mat.table.diffuseTexture = res.tex.table;

  res.mat.tableCenter = new StandardMaterial('centerMat', scene);
  res.mat.tableCenter.diffuseColor = new Color3();
  res.mat.table.specularColor = new Color3(0, 0, 0); // eliminating the specular highlights of the phong model

  return Promise.all(promises);
}
