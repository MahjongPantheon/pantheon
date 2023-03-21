import { Scene } from '@babylonjs/core/scene';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { N_TileValue } from '#/generated/njord.pb';
import { MultiMaterial } from '@babylonjs/core/Materials/multiMaterial';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import '@babylonjs/loaders/glTF/glTFFileLoader';

type Resources = {
  mdl: {
    tableCenter: AbstractMesh;
  };
  tex: {
    tileValues: Texture[];
    table: Texture;
    indicators: Record<'e' | 's' | 'w' | 'n', HTMLImageElement>;
    kyoku: HTMLImageElement;
    riichi: HTMLImageElement;
    honba: HTMLImageElement;
    winds: Record<'e' | 's' | 'w' | 'n', Texture>;
  };
  mat: {
    tile: MultiMaterial;
    tileTsumogiri: MultiMaterial;
    tileValues: Record<N_TileValue, StandardMaterial>;
    tileValuesAka: Record<N_TileValue, StandardMaterial>;
    winds: Record<'e' | 's' | 'w' | 'n', StandardMaterial>;
    windColors: Record<'e' | 's' | 'w' | 'n', StandardMaterial>;
    table: StandardMaterial;
    tableCenter: StandardMaterial;
    tableBorder: StandardMaterial;
    riichiStick: MultiMaterial;
    displaySub: StandardMaterial;
  };
};

export const res: Resources = {
  mdl: {},
  tex: {
    tileValues: [] as Texture[],
    winds: {},
    indicators: {},
  },
  mat: {
    winds: {},
    windColors: {},
    tileValues: {},
    tileValuesAka: {},
  },
} as Resources;

// eliminating the specular highlights of the phong model
const noSpec = (mat: StandardMaterial) => {
  mat.specularColor = new Color3(0, 0, 0);
  mat.maxSimultaneousLights = 5;
};

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

  // Models
  promises.push(
    SceneLoader.ImportMeshAsync('center', '/assets/', 'center.gltf', scene).then((result) => {
      res.mdl.tableCenter = result.meshes[1];
      res.mdl.tableCenter.rotation = new Vector3(0, 0, Math.PI);
      res.mdl.tableCenter.scaling = new Vector3(15, 15, 15);
      res.mdl.tableCenter.material = res.mat.tableCenter;
    })
  );

  // Round icon
  promises.push(
    new Promise((resolve) => {
      res.tex.kyoku = new Image();
      res.tex.kyoku.src = '/assets/indicator_kyoku.png';
      res.tex.kyoku.onload = () => {
        resolve(null);
      };
    })
  );

  promises.push(
    new Promise((resolve) => {
      res.tex.riichi = new Image();
      res.tex.riichi.src = '/assets/indicator_riichi.png';
      res.tex.riichi.onload = () => {
        resolve(null);
      };
    })
  );

  promises.push(
    new Promise((resolve) => {
      res.tex.honba = new Image();
      res.tex.honba.src = '/assets/indicator_honba.png';
      res.tex.honba.onload = () => {
        resolve(null);
      };
    })
  );

  // Seat winds & round winds indicators
  ['e', 's', 'w', 'n'].forEach((i) => {
    const wind = i as 'e' | 's' | 'w' | 'n';

    promises.push(
      new Promise((resolve) => {
        res.tex.indicators[wind] = new Image();
        res.tex.indicators[wind].src = '/assets/indicator_' + wind + '.png';
        res.tex.indicators[wind].onload = () => {
          resolve(null);
        };
      })
    );

    promises.push(
      new Promise((resolve) => {
        res.tex.winds[wind] = new Texture(
          '/assets/wind_' + wind + '.png',
          scene,
          undefined,
          undefined,
          undefined,
          () => {
            resolve(null);
          }
        );
        res.tex.winds[wind].hasAlpha = true;

        res.mat.winds[wind] = new StandardMaterial('wind_' + i, scene);
        res.mat.winds[wind].diffuseTexture = res.tex.winds[wind];
        res.mat.winds[wind].alphaMode = 2; // ALPHA_COMBINE
        res.mat.winds[wind].useAlphaFromDiffuseTexture = true;
        noSpec(res.mat.winds[wind]);

        res.mat.windColors[wind] = new StandardMaterial('windcolor_' + i, scene);
        noSpec(res.mat.windColors[wind]);
        res.mat.windColors[wind].alpha = 0.5;
        res.mat.windColors[wind].diffuseColor = {
          e: new Color3(255 / 255, 90 / 255, 90 / 255),
          s: new Color3(255 / 255, 255 / 255, 90 / 255),
          w: new Color3(90 / 255, 255 / 255, 90 / 255),
          n: new Color3(30 / 255, 130 / 255, 255 / 255),
        }[wind];
      })
    );
  });

  // Tiles
  const tileBack = new StandardMaterial('tile_back', scene);
  tileBack.diffuseColor = new Color3(195 / 255, 149 / 255, 89 / 255);
  noSpec(tileBack);
  const tileBase = new StandardMaterial('tile_base', scene);
  tileBase.ambientColor = Color3.White();
  noSpec(tileBase);
  res.mat.tile = new MultiMaterial('tile', scene);
  res.mat.tile.subMaterials.push(tileBase, tileBack);

  const tileBackTsumogiri = new StandardMaterial('tile_back_tg', scene);
  tileBackTsumogiri.diffuseColor = new Color3(135 / 255, 89 / 255, 29 / 255);
  noSpec(tileBackTsumogiri);
  const tileBaseTsumogiri = new StandardMaterial('tile_base_tg', scene);
  tileBaseTsumogiri.ambientColor = new Color3(195 / 255, 195 / 255, 195 / 255);
  noSpec(tileBaseTsumogiri);
  res.mat.tileTsumogiri = new MultiMaterial('tile', scene);
  res.mat.tileTsumogiri.subMaterials.push(tileBaseTsumogiri, tileBackTsumogiri);

  const riichiStickBase = new StandardMaterial('stick_base', scene);
  riichiStickBase.diffuseColor = Color3.White();
  noSpec(riichiStickBase);
  const riichiStickDot = new StandardMaterial('stick_dot', scene);
  riichiStickDot.diffuseColor = Color3.Red();
  noSpec(riichiStickDot);
  res.mat.riichiStick = new MultiMaterial('stick', scene);
  res.mat.riichiStick.subMaterials.push(riichiStickBase, riichiStickDot);

  res.mat.displaySub = new StandardMaterial('display_sub', scene);
  res.mat.displaySub.diffuseColor = new Color3(185 / 255, 185 / 255, 185 / 255);
  noSpec(res.mat.displaySub);

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
          noSpec(mat);
          res.mat.tileValues[i] = mat;

          const matAka = new StandardMaterial('tile_value_' + i, scene);
          matAka.opacityTexture = tex;
          matAka.diffuseColor = Color3.Red();
          noSpec(matAka);
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
  noSpec(res.mat.table);
  res.mat.table.opacityTexture = res.mat.table.diffuseTexture = res.tex.table;

  res.mat.tableCenter = new StandardMaterial('centerMat', scene);
  res.mat.tableCenter.diffuseColor = new Color3(204 / 255, 187 / 255, 157 / 255);
  noSpec(res.mat.tableCenter);

  res.mat.tableBorder = new StandardMaterial('borderMat', scene);
  res.mat.tableBorder.diffuseColor = new Color3(120 / 255, 100 / 255, 90 / 255);
  noSpec(res.mat.tableBorder);

  return Promise.all(promises);
}
