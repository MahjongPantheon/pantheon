// @vitest-environment node
import { describe, expect, it } from 'vitest';
import createEmotionServer from '@emotion/server/create-instance';
import { createStyles } from '@mantine/emotion';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Storage } from '../../../Common/storage';
import { StorageStrategyServer } from '../../../Common/storageStrategyServer';
import { ThemeProvider } from '../ThemeProvider';
import { createEmotionCache } from '../emotion/cache';
import { renderDocument } from './renderDocument';

const useStyles = createStyles({ header: { backgroundColor: '#617193', height: 44 } });

function Header() {
  const { classes } = useStyles();
  return (
    <div className={classes.header}>
      <div>Server header</div>
    </div>
  );
}

describe('server document rendering', () => {
  it('keeps metadata in the head and extracts header CSS independently for consecutive requests', () => {
    for (let request = 0; request < 2; request++) {
      const storage = new Storage();
      storage.setStrategy(new StorageStrategyServer());
      const cache = createEmotionCache();
      const stylesServer = createEmotionServer(cache);
      const { head, appHtml } = renderDocument(
        <HelmetProvider>
          <ThemeProvider storage={storage} dimmed={false} emotionCache={cache}>
            <Helmet>
              <title>Event list - Sigrun</title>
              <meta name='description' content='Ratings and statistics' />
              <link rel='help' href='https://example.com/help' />
            </Helmet>
            <Header />
          </ThemeProvider>
        </HelmetProvider>
      );
      expect(head).toContain('<title>Event list - Sigrun</title>');
      expect(head).toContain('Ratings and statistics');
      expect(head).toContain('https://example.com/help');
      expect(appHtml).not.toMatch(/<(title|meta|link)\b/);
      expect(appHtml).toContain('<div>Server header</div></div>');
      const styles = stylesServer.constructStyleTagsFromChunks(
        stylesServer.extractCriticalToChunks(appHtml)
      );
      expect(styles).toContain('data-emotion="cs ');
      expect(styles).toContain('#617193');
    }
  });
});
