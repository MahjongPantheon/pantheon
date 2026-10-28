import { Session } from 'node:inspector/promises';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { takeCoverage } from 'node:v8';

/** Keep the executed JavaScript alongside V8 ranges for AST-based source remapping. */
export async function captureCoverage(directory: string) {
  const session = new Session();
  const scripts: Array<{ scriptId: string; url: string }> = [];
  session.connect();
  session.on('Debugger.scriptParsed', ({ params }) => {
    if (params.url.startsWith('file:') && !params.url.includes('/node_modules/')) {
      scripts.push(params);
    }
  });
  try {
    await session.post('Debugger.enable');
    const sources: Record<string, string> = {};
    for (const script of scripts) {
      sources[script.url] = (
        await session.post('Debugger.getScriptSource', {
          scriptId: script.scriptId,
        })
      ).scriptSource;
    }
    await writeFile(join(directory, 'sources.json'), JSON.stringify(sources));
    takeCoverage();
  } finally {
    session.disconnect();
  }
}
