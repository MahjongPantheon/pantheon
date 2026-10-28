import { describe, expect, it } from 'vitest';
import { serializeServerData } from './serializeServerData';

describe('hydration JSON serialization', () => {
  it('round-trips user content without allowing it to escape the script element', () => {
    const data = {
      description: '</script><script>window.injected = true</script><img src=x>',
      text: '<>&\u2028\u2029',
    };
    const serialized = serializeServerData(data);
    expect(serialized).not.toMatch(/[<>&\u2028\u2029]/u);
    expect(JSON.parse(serialized)).toEqual(data);
    const doc = new DOMParser().parseFromString(
      `<script>window.initialData = ${serialized};</script>`,
      'text/html'
    );
    expect(doc.querySelectorAll('script')).toHaveLength(1);
    expect(doc.querySelector('img')).toBeNull();
    expect(doc.querySelector('script')!.textContent).toBe(`window.initialData = ${serialized};`);
  });
});
