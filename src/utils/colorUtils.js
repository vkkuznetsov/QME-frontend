export function generateColorFromString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 60%, 90%)`;
}
  
export function darkenColor(color, amount = 50) {
  const tempElem = document.createElement('div');
  tempElem.style.color = color;
  document.body.appendChild(tempElem);
  const rgb = getComputedStyle(tempElem).color;
  document.body.removeChild(tempElem);
  const rgbValues = rgb.match(/\d+/g).map(Number);
  let [r, g, b] = rgbValues;
  r = Math.max(0, r - Math.round(255 * (amount / 100)));
  g = Math.max(0, g - Math.round(255 * (amount / 100)));
  b = Math.max(0, b - Math.round(255 * (amount / 100)));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b)
      .toString(16)
      .slice(1)
      .toUpperCase()}`;
}
  
  export function getGroupTypeColor(type) {
    switch (type.toLowerCase()) {
      case 'лекции':
        return 'green';
      case 'практики':
        return 'blue';
      case 'лабораторные':
        return 'orange';
      default:
        return 'grey';
    }
  }

  // src/utils/colorUtils.js
export function getGroupIcon(type) {
    switch (type.toLowerCase()) {
      case 'лекция':
        return 'mdi-book-open-page-variant';
      case 'практика':
        return 'mdi-clipboard-text';
      case 'лабораторная':
        return 'mdi-flask';
      default:
        return 'mdi-account-group';
    }
  }