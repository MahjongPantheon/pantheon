import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function supervisorStatus(service, run = execFileSync) {
  if (
    ['tyr', 'forseti'].includes(service.toLowerCase()) &&
    process.env.PANTHEON_DEV_WATCH !== 'true'
  )
    return 'ready';
  let output;
  try {
    output = run('supervisorctl', ['status'], { encoding: 'utf8', timeout: 2000 });
  } catch (error) {
    // Supervisor returns nonzero when one of its programs is not running.
    output = error.stdout ?? '';
  }
  const disabledWorkers =
    process.env.PANTHEON_MODE === 'development' &&
    process.env.PANTHEON_PRODUCTION_WORKERS === 'false';
  const worker = new RegExp(
    `^(?:${service.toLowerCase()}:)?${service.toLowerCase()}(?:_\\d+)?\\s+STOPPED\\b`
  );
  const processes = String(output)
    .trim()
    .split('\n')
    .filter(Boolean)
    .filter((line) => !(disabledWorkers && worker.test(line)));
  if (processes.some((line) => /^\S+\s+(FATAL|STOPPED)\b/.test(line))) return 'failed';
  if (processes.length && processes.every((line) => /^\S+\s+RUNNING\b/.test(line))) {
    return 'ready';
  }
  return 'starting';
}

export function startupStatus(
  service,
  {
    readyPath = '/run/pantheon-ready',
    failedPath = '/run/pantheon-startup-failed',
    supervisor = supervisorStatus,
  } = {}
) {
  if (existsSync(failedPath)) return 'failed';
  if (!existsSync(readyPath)) return 'preparing';
  return supervisor(service);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(startupStatus(process.argv[2]));
}
