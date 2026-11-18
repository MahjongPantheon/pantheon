import unified from 'unified';
import remarkParse from 'remark-parse';
import strip from 'strip-markdown';

const parser = unified()
  .use(remarkParse)
  .use(strip as any);
type TextNode = { value?: string; children?: TextNode[] };
const text = (node: TextNode): string => node.value ?? node.children?.map(text).join('') ?? '';

export function descriptionText(markdown: string): string {
  const tree = parser.runSync(parser.parse(markdown)) as TextNode;
  return (tree.children ?? []).map(text).join('\n').slice(0, 300);
}
