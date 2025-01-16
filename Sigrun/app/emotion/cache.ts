import createCache, { EmotionCache } from '@emotion/cache';

export const emotionCache: EmotionCache = createCache({ key: 'cs', speedy: true, prepend: true });
