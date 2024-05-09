import { env } from './env';

const fonts = {
  jp: `@font-face {
  font-family: IBM Plex Sans;
  src: url(${env.urls.gullveig}/static/IBMPlexSansJP-Regular.woff2);
  font-weight: 300;
  font-style: normal;
  font-display: swap;
  unicode-range: U+3000-30FF, U+31F0-31FF, U+FF00-FFEF, U+4E00-9FAF;
}
@font-face {
  font-family: IBM Plex Sans;
  src: url(${env.urls.gullveig}/static/IBMPlexSansJP-Bold.woff2);
  font-weight: 600;
  font-style: normal;
  font-display: swap;
  unicode-range: U+3000-30FF, U+31F0-31FF, U+FF00-FFEF, U+4E00-9FAF;
}`,
  ko: `@font-face {
  font-family: IBM Plex Sans;
  src: url(${env.urls.gullveig}/static/IBMPlexSansKR-Regular.woff2);
  font-weight: 300;
  font-style: normal;
  font-display: swap;
  unicode-range: U+AC00-D7A3, U+3130-318F, U+1100-11FF;
}
@font-face {
  font-family: IBM Plex Sans;
  src: url(${env.urls.gullveig}/static/IBMPlexSansKR-Bold.woff2);
  font-weight: 600;
  font-style: normal;
  font-display: swap;
  unicode-range: U+AC00-D7A3, U+3130-318F, U+1100-11FF;
}`,
};

export const fontLoader = (localeName: string) => {
  if (localeName === 'jp' || localeName === 'ko') {
    const fontLink = window.document.getElementById('font-' + localeName);
    if (!fontLink) {
      const newStyle = window.document.createElement('style');
      newStyle.setAttribute('id', 'font-' + localeName);
      newStyle.innerHTML = fonts[localeName];
      window.document.head.appendChild(newStyle);
    }
  }
};
