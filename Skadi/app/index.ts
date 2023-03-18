import { SkadiScene } from '#/scene';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
  const skadiScene = new SkadiScene(canvas, window.devicePixelRatio);
  window.addEventListener('resize', () => {
    skadiScene.resize();
  });
});
