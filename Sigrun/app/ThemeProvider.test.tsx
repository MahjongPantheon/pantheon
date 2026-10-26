import { act } from 'react';
import { hydrateRoot, Root } from 'react-dom/client';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Button, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { createStyles } from '@mantine/emotion';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Storage } from '../../Common/storage';
import { StorageStrategyServer } from '../../Common/storageStrategyServer';
import { ThemeProvider } from './ThemeProvider';
import { createEmotionCache } from './emotion/cache';
import { renderDocument } from './helpers/renderDocument';

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute('data-mantine-color-scheme');
  document.head
    .querySelectorAll('[data-migration-test], style[data-emotion]')
    .forEach((el) => el.remove());
  vi.unstubAllGlobals();
});

function createStorage() {
  const storage = new Storage();
  storage.setStrategy(new StorageStrategyServer());
  return storage;
}

function ThemeControls() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  return (
    <>
      <Button onClick={() => toggleColorScheme()}>Theme: {colorScheme}</Button>
      <output aria-label='palette'>{theme.colors.blue[6]}</output>
      <output aria-label='radius'>{theme.defaultRadius}</output>
    </>
  );
}

const useStyles = createStyles({ header: { backgroundColor: '#617193', height: 44 } });

function StyledHeader() {
  const { classes } = useStyles();
  return <div className={classes.header}>Styled header</div>;
}

describe('Mantine migration compatibility', () => {
  it('preserves shared day/night storage across remounts and independent dimmed palettes', () => {
    const storage = createStorage();
    storage.setTheme('night');
    const tree = (dimmed: boolean) => (
      <ThemeProvider storage={storage} dimmed={dimmed}>
        <ThemeControls />
      </ThemeProvider>
    );
    const view = render(tree(false));
    expect(screen.getByRole('button').textContent).toBe('Theme: dark');
    expect(screen.getByLabelText('radius').textContent).toBe('sm');
    fireEvent.click(screen.getByRole('button'));
    expect(storage.getTheme()).toBe('day');
    expect(document.documentElement.dataset.mantineColorScheme).toBe('light');
    view.rerender(tree(true));
    expect(screen.getByLabelText('palette').textContent).toBe('#40678C');
    expect(screen.getByRole('button').textContent).toBe('Theme: light');
    view.unmount();
    render(tree(true));
    expect(screen.getByRole('button').textContent).toBe('Theme: light');
    fireEvent.click(screen.getByRole('button'));
    expect(storage.getTheme()).toBe('night');
  });

  it('hydrates metadata and styled components without recovering the root', async () => {
    const storage = createStorage();
    const serverCache = createEmotionCache();
    const tree = (cache: ReturnType<typeof createEmotionCache>) => (
      <HelmetProvider>
        <ThemeProvider storage={storage} dimmed={false} emotionCache={cache}>
          <Helmet>
            <title data-migration-test>Sigrun migration</title>
            <meta data-migration-test name='description' content='Ratings and statistics' />
          </Helmet>
          <StyledHeader />
        </ThemeProvider>
      </HelmetProvider>
    );
    const { appHtml, head } = renderDocument(tree(serverCache));
    expect(head).toContain('Sigrun migration');
    expect(head).toContain('Ratings and statistics');
    expect(appHtml).not.toContain('<title');
    expect(appHtml).not.toContain('<meta');
    document.head.insertAdjacentHTML('beforeend', head);
    const container = document.createElement('div');
    container.innerHTML = appHtml;
    document.body.append(container);
    const errors: unknown[] = [];
    let root: Root | undefined;
    try {
      const clientCache = createEmotionCache();
      await act(async () => {
        root = hydrateRoot(container, tree(clientCache), {
          onRecoverableError: (error) => errors.push(error),
        });
      });
      expect(errors).toEqual([]);
      expect(container.textContent).toContain('Styled header');
      expect(document.title).toBe('Sigrun migration');
    } finally {
      await act(async () => root?.unmount());
      container.remove();
    }
  });
});
