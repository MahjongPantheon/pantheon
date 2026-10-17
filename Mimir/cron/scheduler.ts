import { ChildProcess, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { JobName } from './jobs.js';

function launchWorker(name: JobName) {
  return spawn(
    process.execPath,
    ['--import', 'tsx', fileURLToPath(new URL('./worker.ts', import.meta.url)), name],
    { stdio: 'inherit' }
  );
}

export class JobScheduler {
  private readonly running = new Map<JobName, Promise<void>>();
  private readonly terminators = new Set<() => void>();
  private stopping = false;

  constructor(
    private readonly timeoutMs = 300_000,
    private readonly graceMs = 5_000,
    private readonly launch: (name: JobName) => ChildProcess = launchWorker
  ) {}

  async run(name: JobName) {
    if (this.stopping || this.running.has(name)) {
      console.log(JSON.stringify({ job: name, status: 'skipped', reason: 'scheduler-busy' }));
      return;
    }
    const execution = this.execute(name);
    this.running.set(name, execution);
    try {
      await execution;
    } finally {
      this.running.delete(name);
    }
  }

  async stop() {
    this.stopping = true;
    this.terminators.forEach((terminate) => terminate());
    await Promise.allSettled(this.running.values());
  }

  private execute(name: JobName) {
    return new Promise<void>((resolve, reject) => {
      const child = this.launch(name);
      const startedAt = Date.now();
      let timedOut = false;
      let spawnError: Error | undefined;
      let killTimer: ReturnType<typeof setTimeout> | undefined;
      const terminate = () => {
        if (killTimer) return;
        child.kill('SIGTERM');
        killTimer = setTimeout(() => child.kill('SIGKILL'), this.graceMs);
      };
      this.terminators.add(terminate);
      const deadline = setTimeout(() => {
        timedOut = true;
        terminate();
      }, this.timeoutMs);
      child.on('error', (error) => {
        spawnError = error;
      });
      child.once('close', (code, signal) => {
        clearTimeout(deadline);
        clearTimeout(killTimer);
        this.terminators.delete(terminate);
        console.log(
          JSON.stringify({
            job: name,
            status: 'exited',
            code,
            signal,
            timedOut,
            durationMs: Date.now() - startedAt,
          })
        );
        if (timedOut) {
          reject(new Error(`Cron job ${name} exceeded ${this.timeoutMs}ms`));
        } else if (spawnError || code !== 0) {
          reject(spawnError ?? new Error(`Cron job ${name} exited with ${signal ?? code}`));
        } else {
          resolve();
        }
      });
    });
  }
}
