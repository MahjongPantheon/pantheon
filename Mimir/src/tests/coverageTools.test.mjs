import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseAstAsync } from 'vitest/node';
import { sourceWithoutRuntimeHelpers } from './runtimeHelpers.mjs';

test('removes CommonJS scaffolding without moving or deleting user branches', async () => {
  const code = `__filename="fixture.ts";(()=>{
var __defProp=Object.defineProperty;
var __export=(target,all)=>{for(var name in all)__defProp(target,name,{get:all[name]});};
var __copyProps=(to,from)=>{if(from){for(let key in from)to[key]=from[key];}return to;};
var __toCommonJS=mod=>__copyProps({},mod);
var fixture_exports={};
__export(fixture_exports,{choose:()=>choose});
module.exports=__toCommonJS(fixture_exports);
function choose(flag){return flag ? 1 : 2;}
0&&(module.exports={choose});
})();`;
  const clean = await sourceWithoutRuntimeHelpers(code);
  assert.equal(clean.length, code.length);
  assert.deepEqual(
    [...clean.matchAll(/\n/g)].map((m) => m.index),
    [...code.matchAll(/\n/g)].map((m) => m.index)
  );
  const originalFunction = 'function choose(flag){return flag ? 1 : 2;}';
  assert.equal(clean.indexOf(originalFunction), code.indexOf(originalFunction));
  const ast = await parseAstAsync(clean);
  assert.equal(ast.body.length, 1);
  assert.equal(ast.body[0].type, 'FunctionDeclaration');
  assert.equal(ast.body[0].id.name, 'choose');
  assert.equal(ast.body[0].body.body[0].argument.type, 'ConditionalExpression');
});

test('preserves ordinary ESM source and similarly named application variables', async () => {
  const code =
    'export function choose(flag) { return flag ? 1 : 2; }\nconst __name = flag => flag || 42;\n';
  assert.equal(await sourceWithoutRuntimeHelpers(code), code);
});

import { alignServerCoverage } from './alignCoverage.mjs';
import { V8CoverageProvider } from '@vitest/coverage-v8/dist/provider.js';

test('unions executions of the same source function and both branch arms', () => {
  const point = (line, column) => ({ line, column });
  const loc = (a, b) => ({ start: point(1, a), end: point(1, b) });
  const file = (bodyStart, armStart, hits) => ({
    path: '/fixture.ts',
    statementMap: {},
    s: {},
    fnMap: { 0: { name: 'choose', decl: loc(9, 15), loc: loc(bodyStart, 70), line: 1 } },
    f: { 0: hits.reduce((sum, hit) => sum + hit, 0) },
    branchMap: {
      0: {
        type: 'cond-expr',
        loc: loc(30, 60),
        locations: [loc(armStart, 45), loc(50, 60)],
        line: 1,
      },
    },
    b: { 0: hits },
  });
  const unit = { '/fixture.ts': file(20, 40, [1, 0]) };
  const server = { '/fixture.ts': file(22, 42, [0, 1]) };
  const original = structuredClone(server);
  const combined = new V8CoverageProvider().createCoverageMap();
  combined.merge(unit);
  combined.merge(alignServerCoverage(unit, server));
  const result = combined.fileCoverageFor('/fixture.ts').toSummary().toJSON();
  assert.equal(result.functions.total, 1);
  assert.equal(result.functions.covered, 1);
  assert.equal(result.branches.total, 2);
  assert.equal(result.branches.covered, 2);
  assert.deepEqual(server, original);
});

test('fails instead of silently conflating ambiguous or incompatible source branches', () => {
  const loc = { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } };
  const branch = { type: 'if', loc, locations: [loc, loc] };
  const unit = { '/fixture.ts': { fnMap: {}, branchMap: { 0: branch }, f: {}, b: { 0: [1, 0] } } };
  const server = structuredClone(unit);
  server['/fixture.ts'].branchMap[0].locations.pop();
  assert.throws(() => alignServerCoverage(unit, server), /Incompatible source branch/);
  const ambiguous = structuredClone(unit);
  ambiguous['/fixture.ts'].branchMap[1] = branch;
  assert.throws(() => alignServerCoverage(ambiguous, unit), /Ambiguous source coverage/);
});
