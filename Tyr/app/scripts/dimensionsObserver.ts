function formatNumber(value: number) {
  return `${value}px`;
}

function updateDimensions() {
  const style = document.documentElement.style;
  style.setProperty('--screenWidth', formatNumber(window.screen.width));
  style.setProperty('--screenHeight', formatNumber(window.screen.height));
}

export function observe() {
  updateDimensions();
  window.addEventListener('resize', updateDimensions);
}
