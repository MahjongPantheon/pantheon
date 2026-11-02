import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const repository = fileURLToPath(new URL('../../', import.meta.url));
function workspace(fn) {
  const root = mkdtempSync(join(tmpdir(), "pantheon completion's "));
  try {
    for (const file of [
      'run',
      'bin/pantheon',
      'bin/lib/completion.sh',
      'Frey/tasks.sh',
      'Common/ContainerRuntime/service-tasks.sh',
    ]) {
      mkdirSync(join(root, file, '..'), { recursive: true });
      writeFileSync(join(root, file), readFileSync(join(repository, file)), { mode: 0o755 });
    }
    const cli = (args, options = {}) =>
      spawnSync(join(root, 'run'), ['completion', ...args], {
        cwd: tmpdir(),
        encoding: 'utf8',
        ...options,
        env: {
          ...process.env,
          CONTAINER_COMMAND: '/does-not-exist',
          PANTHEON_COMPLETION_DIR: join(root, "shell's data"),
          ...options.env,
        },
      });
    fn({ root, cli });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('completion suggests context-specific commands, services and owning tasks without containers', () =>
  workspace(({ cli }) => {
    for (const [args, expected] of [
      [[], 'completion'],
      [['prod'], 'recreate'],
      [['lint'], 'frey'],
      [['test'], '--verbose'],
      [['task', 'frey'], 'migrate-frey1'],
      [['task', 'frey'], 'typecheck'],
      [['completion', 'install'], 'zsh'],
    ]) {
      const result = cli(['candidates', ...args]);
      assert.equal(result.status, 0, result.stderr);
      assert.ok(result.stdout.trim().split('\n').includes(expected), result.stdout);
    }
    assert.equal(cli(['candidates', 'task', 'unknown']).stdout, '');
    assert.equal(cli(['fish']).status, 1);
  }));

test('Bash completion handles the root run wrapper, task context and quoted checkout paths', () =>
  workspace(({ root, cli }) => {
    const script = join(root, 'completion.bash');
    writeFileSync(script, cli(['bash']).stdout);
    const result = spawnSync(
      'bash',
      [
        '--noprofile',
        '--norc',
        '-c',
        `
source "$1"
complete -p ./run >/dev/null || exit 11
COMP_WORDS=(./run task frey ty)
COMP_CWORD=3
_pantheon_completion
printf '%s\\n' "\${COMPREPLY[@]}"
`,
        'completion-test',
        script,
      ],
      { cwd: root, encoding: 'utf8' }
    );
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), 'typecheck');
  }));

test('completion installer preserves existing config and is idempotent for both shells', () =>
  workspace(({ root, cli }) => {
    for (const shell of ['bash', 'zsh']) {
      const rc = join(root, `${shell}rc`);
      const original = '# Existing config without a final newline';
      writeFileSync(rc, original);
      for (let i = 0; i < 2; i++) {
        const installed = cli(['install', shell, rc]);
        assert.equal(installed.status, 0, installed.stderr);
      }
      const content = readFileSync(rc, 'utf8');
      assert.ok(content.startsWith(`${original}\n`));
      assert.equal(content.split('# Pantheon completion').length - 1, 1);
      assert.ok(
        readFileSync(join(root, "shell's data", `pantheon.${shell}`), 'utf8').includes(
          '_pantheon_completion'
        )
      );
    }
  }));

const hasZsh = spawnSync('zsh', ['--version']).status === 0;
test('Zsh completion registers run and passes the correct task context', { skip: !hasZsh }, () =>
  workspace(({ root, cli }) => {
    const script = join(root, 'completion.zsh');
    writeFileSync(script, cli(['zsh']).stdout);
    const result = spawnSync(
      'zsh',
      [
        '-f',
        '-c',
        `
autoload -Uz compinit
compinit -D
source "$1"
[[ \${_comps[./run]} == _pantheon_completion ]] || exit 11
compadd() { printf '%s\\n' "$@"; }
words=(./run task frey ty)
CURRENT=4
_pantheon_completion
`,
        'completion-test',
        script,
      ],
      { cwd: root, encoding: 'utf8' }
    );
    assert.equal(result.status, 0, result.stderr);
    assert.ok(result.stdout.split('\n').includes('typecheck'), result.stdout);
    assert.ok(!result.stdout.split('\n').includes('registry'), result.stdout);
  })
);
