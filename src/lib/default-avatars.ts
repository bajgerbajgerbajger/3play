
// Facebook-style default avatars (Silhouettes)
// SVG Data URIs

const SVG_BG = "#F0F2F5";
const SVG_FILL = "#BCC0C4"; // Facebook default grey

const MALE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="${SVG_BG}"/>
  <path fill="${SVG_FILL}" d="M50 23c-11.046 0-20 8.954-20 20s8.954 20 20 20 20-8.954 20-20-8.954-20-20-20zm0 44c-18.79 0-35.34 9.475-35.34 23.69V96h70.68v-5.31C85.34 76.475 68.79 67 50 67z"/>
</svg>
`;

const FEMALE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="${SVG_BG}"/>
  <path fill="${SVG_FILL}" d="M50 20c-12 0-22 10-22 22 0 12 10 22 22 22s22-10 22-22c0-12-10-22-22-22zm0 48c-19 0-36 10-36 24v4h72v-4c0-14-17-24-36-24z"/>
  <path fill="${SVG_FILL}" d="M26 42c0 15 10 28 24 28s24-13 24-28h-6c0 11-8 20-18 20s-18-9-18-20h-6z"/>
</svg>
`;

const NEUTRAL_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="${SVG_BG}"/>
  <path fill="${SVG_FILL}" d="M50 23c-11.046 0-20 8.954-20 20s8.954 20 20 20 20-8.954 20-20-8.954-20-20-20zm0 44c-18.79 0-35.34 9.475-35.34 23.69V96h70.68v-5.31C85.34 76.475 68.79 67 50 67z"/>
</svg>
`;

function toDataUrl(svg: string) {
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export const DEFAULT_AVATARS = {
  male: toDataUrl(MALE_SVG),
  female: toDataUrl(FEMALE_SVG),
  other: toDataUrl(NEUTRAL_SVG),
};
