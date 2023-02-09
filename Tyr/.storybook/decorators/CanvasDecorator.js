export const CanvasDecorator = (Story) => {
  if (document.getElementById('measure-canvas') === null) {
    const canvas = document.createElement('canvas');
    canvas.id = 'measure-canvas';
    canvas.style.cssText = 'top: -1000px; left: -1000px; position: absolute; display: hidden;';
    document.body.appendChild(canvas);
  }

  return (
    <div>
      <Story />
    </div>
  );
};
