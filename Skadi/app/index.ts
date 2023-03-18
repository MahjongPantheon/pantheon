import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { PointLight } from '@babylonjs/core/Lights/pointLight';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { environment } from '#config';
import { preloadResources, res } from '#/resources';
import '@babylonjs/core/Debug';
import '@babylonjs/inspector';
import { LoadingScreen } from '#/helpers/loadingScreen';
import { DefaultRenderingPipeline } from '@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline';
import { TableCenter } from '#/objects/tableCenter';
import { Tile } from '#/objects/tile';
import { Discard } from '#/objects/discard';
import { FxaaPostProcess } from '@babylonjs/core/PostProcesses/fxaaPostProcess';
import { Hand } from './objects/hand';
import { Wall } from '#/objects/wall';
import { Lightbox } from '#/objects/lightbox';
import { TableBorder } from '#/objects/tableBorder';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';

const TABLE_SIZE = 75;
const CAMERA_POS = new Vector3(7.5, -1.5, 0);
const CAMERA_DIR_ALPHA = 0;
const CAMERA_DIR_BETA = Math.PI / 5;
const CAMERA_DIR_RADIUS = 92;
const CAMERA_FOV = 120;

const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
engine.setHardwareScalingLevel(1 / window.devicePixelRatio);

const makeScene = (scene: Scene) => {
  const lightbox = new Lightbox(scene);
  lightbox.getRoot().position.y = 40;
  lightbox.setIntensity(0.5);

  const border = new TableBorder(TABLE_SIZE);

  const center = new TableCenter();
  center.addToScene(scene);
  center.setDisplayValues([
    { score: 10000, wind: 0 },
    { score: 20000, wind: 1 },
    { score: 30000, wind: 2 },
    { score: 40000, wind: 3 },
  ]);
  center.setStick(2, true).setStick(0, true).setStick(1, true).setStick(3, true);

  const dis = new Discard();
  dis
    .addToScene(scene)
    .addTile(Tile.new('CHUN'))
    .addTile(Tile.new('TON'))
    .addTile(Tile.new('SOU_1'))
    .addTile(Tile.new('PIN_8'))
    .addTile(Tile.new('MAN_5'))
    .addTile(Tile.new('PIN_3'))
    .addTile(Tile.new('CHUN'))
    .addTile(Tile.new('HAKU'))
    .addTile(Tile.new('MAN_3'))
    .addTile(Tile.new('MAN_2'))
    .addTile(Tile.new('NAN'))
    .addTile(Tile.new('HAKU'))
    .addTile(Tile.new('SOU_4'))
    .addTile(Tile.new('SOU_3'))
    .addTile(Tile.new('SHA'), true)
    .addTile(Tile.new('HAKU'))
    .addTile(Tile.new('PEI'))
    .addTile(Tile.new('HATSU'))
    .addTile(Tile.new('SOU_2'));

  dis.getRoot().position.x = 9;
  dis.getRoot().position.z = -7.15;
  dis.getRoot().position.y = Tile.D / 2;

  const dis2 = new Discard();
  dis2
    .addToScene(scene)
    .addTile(Tile.new('CHUN'))
    .addTile(Tile.new('TON'))
    .addTile(Tile.new('SOU_1'))
    .addTile(Tile.new('PIN_8'))
    .addTile(Tile.new('MAN_5'))
    .addTile(Tile.new('PIN_3'))
    .addTile(Tile.new('CHUN'))
    .addTile(Tile.new('HAKU'))
    .addTile(Tile.new('MAN_3'))
    .addTile(Tile.new('MAN_2'))
    .addTile(Tile.new('NAN'))
    .addTile(Tile.new('HAKU'))
    .addTile(Tile.new('SOU_4'))
    .addTile(Tile.new('SOU_3'))
    .addTile(Tile.new('SHA'), true)
    .addTile(Tile.new('HAKU'))
    .addTile(Tile.new('PEI'))
    .addTile(Tile.new('HATSU'))
    .addTile(Tile.new('SOU_2'));

  dis2.getRoot().position.x = -7.15;
  dis2.getRoot().position.z = -9;
  dis2.getRoot().rotation.y = Math.PI / 2;
  dis2.getRoot().position.y = Tile.D / 2;

  const dis3 = new Discard();
  dis3
    .addToScene(scene)
    .addTile(Tile.new('CHUN'))
    .addTile(Tile.new('TON'))
    .addTile(Tile.new('SOU_1'))
    .addTile(Tile.new('PIN_8'))
    .addTile(Tile.new('MAN_5'))
    .addTile(Tile.new('PIN_3'))
    .addTile(Tile.new('CHUN'))
    .addTile(Tile.new('HAKU'))
    .addTile(Tile.new('MAN_3'))
    .addTile(Tile.new('MAN_2'))
    .addTile(Tile.new('NAN'))
    .addTile(Tile.new('HAKU'))
    .addTile(Tile.new('SOU_4'))
    .addTile(Tile.new('SOU_3'))
    .addTile(Tile.new('SHA'), true)
    .addTile(Tile.new('HAKU'))
    .addTile(Tile.new('PEI'))
    .addTile(Tile.new('HATSU'))
    .addTile(Tile.new('SOU_2'));

  dis3.getRoot().position.x = 7.15;
  dis3.getRoot().position.z = 9;
  dis3.getRoot().rotation.y = -Math.PI / 2;
  dis3.getRoot().position.y = Tile.D / 2;

  const dis4 = new Discard();
  dis4
    .addToScene(scene)
    .addTile(Tile.new('CHUN'))
    .addTile(Tile.new('TON'))
    .addTile(Tile.new('SOU_1'))
    .addTile(Tile.new('PIN_8'))
    .addTile(Tile.new('MAN_5'))
    .addTile(Tile.new('PIN_3'))
    .addTile(Tile.new('CHUN'))
    .addTile(Tile.new('HAKU'))
    .addTile(Tile.new('MAN_3'))
    .addTile(Tile.new('MAN_2'))
    .addTile(Tile.new('NAN'))
    .addTile(Tile.new('HAKU'))
    .addTile(Tile.new('SOU_4'))
    .addTile(Tile.new('SOU_3'))
    .addTile(Tile.new('SHA'), true)
    .addTile(Tile.new('HAKU'))
    .addTile(Tile.new('PEI'))
    .addTile(Tile.new('HATSU'))
    .addTile(Tile.new('SOU_2'));

  dis4.getRoot().position.x = -9;
  dis4.getRoot().position.z = 7.15;
  dis4.getRoot().rotation.y = Math.PI;
  dis4.getRoot().position.y = Tile.D / 2;

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
  hand.getRoot().position.x = 30;
  hand.claimDaiminkan(Tile.new('SOU_3'), [2, 3, 4], 'SHIMOCHA');
  hand.claimDaiminkan(Tile.new('MAN_3'), [4, 5, 6], 'TOIMEN');
  hand.claimDaiminkan(Tile.new('MAN_1'), [2, 3, 4], 'TOIMEN');
  hand.claimDaiminkan(Tile.new('MAN_1'), [0, 1, 2], 'TOIMEN');

  const hand2 = new Hand();
  hand2
    .addToScene(scene)
    .take4([Tile.new('SOU_1'), Tile.new('SOU_1'), Tile.new('SOU_3'), Tile.new('SOU_3')])
    .take4([Tile.new('MAN_1'), Tile.new('MAN_1'), Tile.new('MAN_3'), Tile.new('MAN_3')])
    .take4([Tile.new('PIN_1'), Tile.new('PIN_2'), Tile.new('PIN_3'), Tile.new('PIN_4')])
    .take1(Tile.new('HATSU'))
    .takeTsumopai(Tile.new('CHUN'));
  hand2.getRoot().rotation.z = -Math.PI / 2;
  hand2.getRoot().rotation.y = -Math.PI / 2;
  hand2.getRoot().position.y = Tile.H / 2;
  hand2.getRoot().position.z = 30;
  hand2.claimDaiminkan(Tile.new('SOU_3'), [2, 3, 4], 'SHIMOCHA');
  // hand2.claimDaiminkan(Tile.new('MAN_3'), [4, 5, 6], 'TOIMEN');
  // hand2.claimDaiminkan(Tile.new('MAN_1'), [2, 3, 4], 'TOIMEN');
  hand2.claimDaiminkan(Tile.new('MAN_1'), [0, 1, 2], 'TOIMEN');

  const hand3 = new Hand();
  hand3
    .addToScene(scene)
    .take4([Tile.new('SOU_1'), Tile.new('SOU_1'), Tile.new('SOU_3'), Tile.new('SOU_3')])
    .take4([Tile.new('MAN_1'), Tile.new('MAN_1'), Tile.new('MAN_3'), Tile.new('MAN_3')])
    .take4([Tile.new('PIN_1'), Tile.new('PIN_2'), Tile.new('PIN_3'), Tile.new('PIN_4')])
    .take1(Tile.new('HATSU'))
    .takeTsumopai(Tile.new('CHUN'));
  hand3.getRoot().rotation.z = -Math.PI / 2;
  hand3.getRoot().rotation.y = Math.PI;
  hand3.getRoot().position.y = Tile.H / 2;
  hand3.getRoot().position.x = -30;
  hand3.claimDaiminkan(Tile.new('SOU_3'), [2, 3, 4], 'SHIMOCHA');
  // hand3.claimDaiminkan(Tile.new('MAN_3'), [4, 5, 6], 'TOIMEN');
  // hand3.claimDaiminkan(Tile.new('MAN_1'), [2, 3, 4], 'TOIMEN');
  hand3.claimDaiminkan(Tile.new('MAN_1'), [0, 1, 2], 'TOIMEN');

  const hand4 = new Hand();
  hand4
    .addToScene(scene)
    .take4([Tile.new('SOU_1'), Tile.new('SOU_1'), Tile.new('SOU_3'), Tile.new('SOU_3')])
    .take4([Tile.new('MAN_1'), Tile.new('MAN_1'), Tile.new('MAN_3'), Tile.new('MAN_3')])
    .take4([Tile.new('PIN_1'), Tile.new('PIN_2'), Tile.new('PIN_3'), Tile.new('PIN_4')])
    .take1(Tile.new('HATSU'))
    .takeTsumopai(Tile.new('CHUN'));
  hand4.getRoot().rotation.z = -Math.PI / 2;
  hand4.getRoot().rotation.y = Math.PI / 2;
  hand4.getRoot().position.y = Tile.H / 2;
  hand4.getRoot().position.z = -30;
  hand4.claimDaiminkan(Tile.new('SOU_3'), [2, 3, 4], 'SHIMOCHA');
  hand4.claimDaiminkan(Tile.new('MAN_3'), [4, 5, 6], 'TOIMEN');
  hand4.claimDaiminkan(Tile.new('MAN_1'), [2, 3, 4], 'TOIMEN');
  hand4.claimDaiminkan(Tile.new('MAN_1'), [0, 1, 2], 'TOIMEN');

  const wall = new Wall();
  wall.addToScene(scene);
  wall.setBreak(7, 'SOU_2');
  (window as any).wall = wall;

  [dis, dis2, dis3, dis4, hand, hand2, hand3, hand4, wall].map((item) =>
    item
      .getRoot()
      .getChildMeshes()
      .map((m) => lightbox.addShadowCaster(m))
  );

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
    { width: TABLE_SIZE, height: TABLE_SIZE, subdivisions: 2, updatable: false },
    scene
  );

  ground.receiveShadows = true;
  ground.material = res.mat.table;
};

const createScene = function () {
  const scene = new Scene(engine);
  scene.clearColor = Color4.FromColor3(Color3.Black());

  const camera = new ArcRotateCamera(
    'Camera',
    CAMERA_DIR_ALPHA,
    CAMERA_DIR_BETA,
    CAMERA_DIR_RADIUS,
    CAMERA_POS
  );
  camera.attachControl(canvas, false);
  camera.fov = CAMERA_FOV;
  scene.addCamera(camera);

  // const defaultPipeline = new DefaultRenderingPipeline('default', true, scene, [camera]);
  // const postProcess = new FxaaPostProcess('fxaa', 1.0, camera);
  // camera.attachPostProcess(postProcess);
  // defaultPipeline.fxaaEnabled = true;

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

  engine.loadingScreen = new LoadingScreen();
  engine.displayLoadingUI();

  preloadResources(scene).then(() => {
    makeScene(scene);
    engine.hideLoadingUI();
  });

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
