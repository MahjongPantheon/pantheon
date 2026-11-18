import { renderToString } from 'react-dom/server';
import { useRemarkSync } from 'react-remark';
import strip from 'strip-markdown';
import { expect, it } from 'vitest';
import { descriptionText } from './descriptionText';

it.each([
  '',
  'Plain text & <literal> text',
  '# Heading\n\nTwo **bold** and *italic* paragraphs.\n\nThe next paragraph.',
  '- One\n- Two\n\n> Quoted text\n\nA `code` word and [link](https://example.test).',
  '![An image](image.png) &amp; &#x1f000; &#65; &lt;tag&gt;',
  'Before\n\n```js\nhidden code\n```\n\n<div>hidden HTML</div>\n\nAfter',
  'A hard  \nbreak\n\n---\n\nThe end',
  'Text '.repeat(100),
])('preserves description text without creating React or DOM representations: %s', (markdown) => {
  const old = renderToString(useRemarkSync(markdown, { remarkPlugins: [strip as any] }));
  const document = new DOMParser().parseFromString(old, 'text/html');
  expect(descriptionText(markdown)).toBe((document.body.textContent ?? '').slice(0, 300));
});
