export class Busy extends Error {}

export class BatchWriter<T> {
  private readonly pending: { value: T; resolve: () => void; reject: (error: unknown) => void }[] =
    [];
  private running?: Promise<void>;
  private timer?: ReturnType<typeof setTimeout>;
  private closed = false;

  constructor(
    private readonly write: (rows: T[]) => Promise<unknown>,
    private readonly size = 100,
    private readonly delay = 10,
    private readonly limit = 5000
  ) {}

  enqueue(value: T): Promise<void> {
    if (this.closed || this.pending.length >= this.limit) {
      return Promise.reject(new Busy('Analytics writer is busy'));
    }
    const result = new Promise<void>((resolve, reject) => {
      this.pending.push({ value, resolve, reject });
    });
    this.schedule();
    return result;
  }

  private schedule() {
    if (this.running || !this.pending.length) {
      return;
    }
    if (this.pending.length >= this.size || this.closed) {
      this.start();
    } else {
      this.timer ??= setTimeout(() => this.start(), this.delay);
    }
  }

  private start() {
    if (this.running || !this.pending.length) {
      return;
    }
    clearTimeout(this.timer);
    this.timer = undefined;
    const batch = this.pending.splice(0, this.size);
    this.running = Promise.resolve()
      .then(() => this.write(batch.map((item) => item.value)))
      .then(
        () => {
          for (const item of batch) item.resolve();
        },
        (error) => {
          for (const item of batch) item.reject(error);
        }
      )
      .finally(() => {
        this.running = undefined;
        this.schedule();
      });
  }

  async close() {
    this.closed = true;
    clearTimeout(this.timer);
    while (this.pending.length || this.running) {
      this.start();
      await this.running;
    }
  }
}
