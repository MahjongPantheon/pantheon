import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { PointLight } from '@babylonjs/core/Lights/pointLight';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { environment } from '#config';
import { Tile } from '#/objects/tile';
import { preloadResources, res } from '#/resources';
import '@babylonjs/core/Debug';
import '@babylonjs/inspector';
import { Hand } from '#/objects/hand';

const TABLE_W = 90;
const TABLE_H = 90;
const CAMERA_X = 0;
const CAMERA_Y = 30;
const CAMERA_Z = -100;

const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

const createScene = function () {
  const scene = new Scene(engine);
  preloadResources(scene);

  if (!environment.production) {
    // hide/show the Inspector
    window.addEventListener('keypress', (ev) => {
      if (ev.shiftKey && ev.code === 'KeyI') {
        if (scene.debugLayer.isVisible()) {
          scene.debugLayer.hide();
        } else {
          scene.debugLayer.show();
        }
      }
    });
  }

  const camera = new ArcRotateCamera(
    'name',
    Math.PI / 2,
    Math.PI / 5,
    100,
    new Vector3(0, -20, -20)
  );
  // Target the camera to scene origin
  camera.setTarget(Vector3.Zero());
  camera.attachControl(canvas, false);

  const l1 = new PointLight('light1', new Vector3(0, 10, 0), scene);
  l1.intensity = 1;

  const l2 = new PointLight('light1', new Vector3(100, 10, 0), scene);
  l2.intensity = 1;

  const hand = new Hand();
  hand
    .addToScene(scene)
    .take4([Tile.new('SOU_1'), Tile.new('SOU_1'), Tile.new('SOU_3'), Tile.new('SOU_3')])
    .take4([Tile.new('MAN_1'), Tile.new('MAN_1'), Tile.new('MAN_3'), Tile.new('MAN_3')])
    .take4([Tile.new('PIN_1'), Tile.new('PIN_2'), Tile.new('PIN_3'), Tile.new('PIN_4')])
    .take1(Tile.new('HATSU'))
    .takeTsumopai(Tile.new('CHUN'));
  hand.getRoot().rotation.z = -Math.PI / 2;
  hand.getRoot().position.y = Tile.H / 2;

  hand.claimDaiminkan(Tile.new('SOU_3'), [2, 3, 4], 'SHIMOCHA');
  // hand.claimDaiminkan(Tile.new('MAN_3'), [4, 5, 6], 'TOIMEN');
  // hand.claimDaiminkan(Tile.new('MAN_1'), [2, 3, 4], 'TOIMEN');
  // hand.claimDaiminkan(Tile.new('MAN_1'), [0, 1, 2], 'TOIMEN');

  //
  // const tiles = (
  //   [
  //     'PIN_7',
  //     'PIN_8',
  //     'PIN_9',
  //     'SOU_7',
  //     'SOU_8',
  //     'SOU_9',
  //     'MAN_1',
  //     'MAN_2',
  //     'MAN_3',
  //     'TON',
  //     'NAN',
  //     'SHA',
  //     'PEI',
  //     'HAKU',
  //     'HATSU',
  //     'CHUN',
  //   ] as N_TileValue[]
  // ).map((t, index) => {
  //   const tile = Tile.new(t, index % 2 === 1).addToScene(scene);
  //   tile.getRoot().position.y = 2;
  //   tile.getRoot().position.x = 20;
  //   tile.getRoot().position.z = -20 + (Tile.W + 0.05) * index;
  //   tile.getRoot().rotation.z = -Math.PI / 2;
  //   return tile;
  // });
  //
  // const set1 = new SimpleSet([Tile.new('SOU_1'), Tile.new('SOU_1'), Tile.new('SOU_1')], 'KAMICHA');
  // set1.addToScene(scene);
  // set1.getRoot().position.x = -10;
  //
  // set1.makeShominkan(Tile.new('SOU_1'));
  //
  // const set2 = new SimpleSet([Tile.new('SOU_2'), Tile.new('SOU_2'), Tile.new('SOU_2')], 'TOIMEN');
  // set2.addToScene(scene);
  // set2.getRoot().position.x = -15;
  //
  // set2.makeShominkan(Tile.new('SOU_2'));
  //
  // const set3 = new Daiminkan(
  //   [Tile.new('HATSU'), Tile.new('HATSU'), Tile.new('HATSU'), Tile.new('HATSU')],
  //   'TOIMEN'
  // );
  // set3.addToScene(scene);
  // set3.getRoot().position.x = -20;
  //
  // const set4 = new Ankan([
  //   Tile.new('HATSU'),
  //   Tile.new('HATSU'),
  //   Tile.new('HATSU'),
  //   Tile.new('HATSU'),
  // ]);
  // set4.addToScene(scene);
  // set4.getRoot().position.x = -25;
  //
  // const set5 = new Daiminkan(
  //   [Tile.new('HATSU'), Tile.new('HATSU'), Tile.new('HATSU'), Tile.new('HATSU')],
  //   'KAMICHA'
  // );
  //
  // set5.addToScene(scene);
  // set5.getRoot().position.x = -30;

  const ground = MeshBuilder.CreateGround(
    'ground1',
    { width: TABLE_W, height: TABLE_H, subdivisions: 2, updatable: false },
    scene
  );

  ground.material = res.mat.table;

  // Return the created scene
  return scene;
};
// call the createScene function
const scene = createScene();
// run the render loop
engine.runRenderLoop(function () {
  scene.render();
});
// the canvas/window resize event handler
window.addEventListener('resize', function () {
  engine.resize();
});
