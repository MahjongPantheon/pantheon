import { Scene } from '@babylonjs/core/scene';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { N_TileValue } from '#/generated/njord.pb';

type Resources = {
  tex: {
    tileValues: Texture[];

    table: Texture;
  };
  mat: {
    tileBack: StandardMaterial;
    tileBase: StandardMaterial;
    tileValues: Record<N_TileValue, StandardMaterial>;
    tileValuesAka: Record<N_TileValue, StandardMaterial>;

    table: StandardMaterial;
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

export function preloadResources(scene: Scene) {
  // Tiles
  res.mat.tileBack = new StandardMaterial('tile_back', scene);
  res.mat.tileBack.diffuseColor = new Color3(195 / 255, 149 / 255, 89 / 255);
  res.mat.tileBack.specularColor = new Color3(0, 0, 0); // eliminating the specular highlights of the phong model

  res.mat.tileBase = new StandardMaterial('tile_base', scene);
  res.mat.tileBase.ambientColor = Color3.White();

  Object.values(N_TileValue)
    .filter(function (i): i is N_TileValue {
      return typeof i === 'string';
    })
    .forEach((i) => {
      if (i === 'NIL') return;
      const tex = new Texture('/assets/' + i + '.png', scene);
      tex.hasAlpha = true;
      tex.wAng = -Math.PI / 2;
      // Empiric values
      tex.uOffset = 0.06;
      tex.vOffset = 0;
      tex.uScale = 0.89;
      tex.vScale = 1;
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
    });

  // Table
  res.tex.table = new Texture('/assets/surface.png', scene);
  res.tex.table.vScale = res.tex.table.uScale = 10;

  res.mat.table = new StandardMaterial('groundMat', scene);
  res.mat.table.specularColor = new Color3(0, 0, 0); // eliminating the specular highlights of the phong model
  res.mat.table.opacityTexture = res.mat.table.diffuseTexture = res.tex.table;
}
