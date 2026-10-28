/**
 * SWC/Vite and tsx/esbuild map function bodies and branch arms to different
 * columns, even when their declarations/expressions are the same source node.
 * Istanbul keys merges by the body/first arm. Align that metadata using source
 * declaration/expression starts, while retaining every counter from both runs.
 */
export function alignServerCoverage(unit, server) {
  const aligned = JSON.parse(JSON.stringify(server));
  const position = (loc) => `${loc.line}:${loc.column}`;
  const functionKey = (fn) => position(fn.decl.start);
  const branchKey = (branch) => `${branch.type}:${position(branch.loc.start)}`;
  function index(map, key) {
    const result = new Map();
    for (const value of Object.values(map)) {
      const id = key(value);
      if (result.has(id)) throw new Error(`Ambiguous source coverage identity: ${id}`);
      result.set(id, value);
    }
    return result;
  }
  for (const [path, file] of Object.entries(aligned)) {
    const reference = unit[path];
    if (!reference) continue;
    const functions = index(reference.fnMap, functionKey);
    const branches = index(reference.branchMap, branchKey);
    index(file.fnMap, functionKey);
    index(file.branchMap, branchKey);
    for (const [id, fn] of Object.entries(file.fnMap)) {
      const match = functions.get(functionKey(fn));
      if (match) file.fnMap[id] = structuredClone(match);
    }
    for (const [id, branch] of Object.entries(file.branchMap)) {
      const match = branches.get(branchKey(branch));
      if (!match) continue;
      if (branch.locations.length !== match.locations.length) {
        throw new Error(`Incompatible source branch coverage: ${path}:${branchKey(branch)}`);
      }
      file.branchMap[id] = structuredClone(match);
    }
  }
  return aligned;
}
