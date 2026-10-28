import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider, Menu } from '@mantine/core';
import { MenuItemLink } from './MenuItemLink';
const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));
vi.mock('wouter', () => ({ useLocation: () => ['/', navigate] }));

it.each([true, false])(
  'uses browser navigation for external links and app navigation for internal links (%s)',
  async (external) => {
    navigate.mockClear();
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    try {
      await act(async () =>
        root.render(
          <MantineProvider env='test'>
            <Menu opened>
              <Menu.Dropdown>
                <MenuItemLink
                  href='/event/5/games'
                  icon={null}
                  title={external ? 'Open games' : undefined}
                  text='Games'
                  external={external}
                  testId='link'
                />
              </Menu.Dropdown>
            </Menu>
          </MantineProvider>
        )
      );
      const link = document.querySelector<HTMLAnchorElement>('[data-testid="link"]')!;
      expect(link.getAttribute('href')).toBe('/event/5/games');
      expect(link.title).toBe(external ? 'Open games' : 'Games');
      expect(link.getAttribute('target')).toBe(external ? '_blank' : null);
      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      await act(async () => {
        link.dispatchEvent(event);
      });
      expect(event.defaultPrevented).toBe(!external);
      if (external) expect(navigate).not.toHaveBeenCalled();
      else expect(navigate).toHaveBeenCalledWith('/event/5/games');
    } finally {
      act(() => root.unmount());
      container.remove();
    }
  }
);
