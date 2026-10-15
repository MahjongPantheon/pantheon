type Attributes = Record<string, string>;

export type XmlEvent =
  | { type: 'startElement'; name: string; attributes: Attributes }
  | { type: 'endElement'; name: string }
  | { type: 'text'; content: string };

type XmlCallbacks = {
  onEvent?: (event: XmlEvent) => Promise<void>;
};

export class SimpleXmlParser {
  private input = '';
  private pos = 0;
  private paused = false;

  constructor(private readonly callbacks: XmlCallbacks = {}) {}

  async write(chunk: string) {
    this.input += chunk;
    await this.parse();
  }

  pause() {
    this.paused = true;
  }

  resume() {
    if (!this.paused) return;

    this.paused = false;
    this.parse();
  }

  private async parse() {
    while (!this.paused && this.pos < this.input.length) {
      if (this.input[this.pos] === '<') {
        if (this.peek('</')) {
          await this.parseEndElement();
        } else {
          await this.parseStartElement();
        }
      } else {
        await this.parseText();
      }
    }
  }

  private async parseText() {
    const nextTag = this.input.indexOf('<', this.pos);
    const end = nextTag === -1 ? this.input.length : nextTag;

    const text = this.input.slice(this.pos, end);

    this.pos = end;

    if (text.trim()) {
      await this.emit({
        type: 'text',
        content: text,
      });
    }
  }

  private async parseStartElement() {
    const close = this.input.indexOf('>', this.pos);

    if (close === -1) return;

    const raw = this.input.slice(this.pos + 1, close).trim();

    const spaceIdx = raw.indexOf(' ');

    let name: string;
    let attrText = '';

    if (spaceIdx === -1) {
      name = raw;
    } else {
      name = raw.slice(0, spaceIdx);
      attrText = raw.slice(spaceIdx + 1);
    }

    const attributes = this.parseAttributes(attrText);

    this.pos = close + 1;

    await this.emit({
      type: 'startElement',
      name,
      attributes,
    });
  }

  private async parseEndElement() {
    const close = this.input.indexOf('>', this.pos);

    if (close === -1) return;

    const name = this.input.slice(this.pos + 2, close).trim();

    this.pos = close + 1;

    await this.emit({
      type: 'endElement',
      name,
    });
  }

  private parseAttributes(input: string): Attributes {
    const attrs: Attributes = {};

    const regex = /([^\s=]+)\s*=\s*"([^"]*)"/g;

    let match: RegExpExecArray | null;

    while ((match = regex.exec(input))) {
      attrs[match[1]] = match[2];
    }

    return attrs;
  }

  private async emit(event: XmlEvent) {
    await this.callbacks.onEvent?.(event);
  }

  private peek(str: string): boolean {
    return this.input.startsWith(str, this.pos);
  }
}
