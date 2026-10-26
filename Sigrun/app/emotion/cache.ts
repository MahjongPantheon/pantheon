import createCache, { EmotionCache } from '@emotion/cache';

export const createEmotionCache = (): EmotionCache => createCache({ key: 'cs', speedy: true });

// The browser reuses one cache; SSR creates a separate cache for each request.
export const emotionCache = createEmotionCache();
