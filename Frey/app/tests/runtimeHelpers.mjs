import { parseAstAsync } from 'vitest/node';

/** Remove only tsx/esbuild module scaffolding, preserving offsets for V8 ranges. */
export async function sourceWithoutRuntimeHelpers(code) {
  // Only tsx's generated CommonJS wrapper can contain these module helpers.
  if (!code.startsWith('__filename=')) return code;
  const ast = await parseAstAsync(code);
  const spans = [];
  const helpers = new Set([
    '__defProp',
    '__getOwnPropDesc',
    '__getOwnPropNames',
    '__hasOwnProp',
    '__export',
    '__copyProps',
    '__toCommonJS',
    '__toESM',
    '__name',
    '__publicField',
    '__defNormalProp',
    '__decorateClass',
    '__decorateParam',
  ]);
  let statements = ast.body;
  const wrapper = ast.body.find(
    (node) =>
      node.type === 'ExpressionStatement' &&
      node.expression.type === 'CallExpression' &&
      node.expression.callee.type === 'ArrowFunctionExpression' &&
      node.expression.callee.body.type === 'BlockStatement'
  );
  if (!wrapper) return code;
  {
    const body = wrapper.expression.callee.body;
    spans.push([wrapper.start, body.start + 1], [body.end - 1, wrapper.end]);
    statements = [...ast.body.filter((n) => n !== wrapper), ...body.body];
  }
  const exportsNames = new Set(
    statements
      .filter(
        (n) =>
          n.type === 'ExpressionStatement' &&
          n.expression.type === 'CallExpression' &&
          n.expression.callee.name === '__export'
      )
      .map((n) => n.expression.arguments[0]?.name)
  );
  for (const node of statements) {
    if (
      node.type === 'VariableDeclaration' &&
      node.declarations.every((d) => helpers.has(d.id.name) || exportsNames.has(d.id.name))
    )
      spans.push([node.start, node.end]);
    if (node.type !== 'ExpressionStatement') continue;
    const e = node.expression;
    if (
      e.type === 'AssignmentExpression' &&
      (e.left.name === '__filename' ||
        (e.left.object?.name === 'module' &&
          e.left.property?.name === 'exports' &&
          e.right.callee?.name === '__toCommonJS'))
    )
      spans.push([node.start, node.end]);
    if (e.type === 'CallExpression' && e.callee.name === '__export')
      spans.push([node.start, node.end]);
    if (
      e.type === 'LogicalExpression' &&
      e.left.value === 0 &&
      e.right.type === 'AssignmentExpression' &&
      e.right.left.object?.name === 'module' &&
      e.right.left.property?.name === 'exports'
    )
      spans.push([node.start, node.end]);
  }
  let result = code;
  for (const [start, end] of spans)
    result =
      result.slice(0, start) +
      result.slice(start, end).replace(/[^\r\n]/g, ' ') +
      result.slice(end);
  return result;
}
