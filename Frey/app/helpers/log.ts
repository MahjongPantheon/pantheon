import { writeFile } from "node:fs";

export class Log {
  private queue: string[] = [];
  private _timeout: NodeJS.Timeout | null = null;
  constructor(private filename: string) {}

  public logStart(fn: string, args: string[]) {
    this.queue.push("[Frey][" + fn + "](" + args.join(", ") + ") :: started");
    this._flush();
  }

  public logSuccess(fn: string, args: string[]) {
    this.queue.push("[Frey][" + fn + "](" + args.join(", ") + ") :: succeeded");
    this._flush();
  }

  public logFailure(fn: string, args: string[]) {
    this.queue.push("[Frey][" + fn + "](" + args.join(", ") + ") :: errored");
    this._flush();
  }

  protected _flush() {
    if (this.queue.length === 0) {
      if (this._timeout) {
        clearTimeout(this._timeout);
      }
      return;
    }

    if (this._timeout) {
      // in progress...
      return;
    }

    const item = this.queue.shift()!;
    writeFile(this.filename, item, { encoding: "utf8" }, (err) => {
      if (err) {
        this.queue.unshift(item);
      }
      this._timeout = setTimeout(() => this._flush(), 0);
    });
  }
}
