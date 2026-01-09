/**
 * Mimir: mahjong games storage
 * Copyright (C) 2016  o.klimenko aka ctizen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

export class Downloader {
  /**
   * Get replay data from a remote server
   *
   * @param logUrl - The URL of the replay log
   * @returns Object containing hash and content
   */
  async getReplay(logUrl: string): Promise<{ decodedHash: string; content: string }> {
    const replayHash = this.getReplayHash(logUrl);
    const decodedHash = this._decodeHash(replayHash);

    const baseUrl = Buffer.from('aHR0cHM6Ly90ZW5ob3UubmV0LzAvbG9nLz8=', 'base64').toString('utf-8');
    const fullUrl = baseUrl + decodedHash;

    const [content, code] = await this._download(fullUrl);
    if (!content || code !== 200) {
      throw new Error('Content fetch failed: format changed? Contact maintainer for instructions');
    }

    return {
      decodedHash,
      content,
    };
  }

  /**
   * Validate domain and get attributes
   *
   * @param logUrl - The URL to validate
   * @returns true if valid
   * @throws DownloadException
   */
  validateUrl(logUrl: string): boolean {
    const validDomain = Buffer.from('Oi8vdGVuaG91Lm5ldC8=', 'base64').toString('utf-8');
    if (!logUrl.includes(validDomain) || !logUrl.includes('log=')) {
      throw new Error('Invalid replay link');
    }
    return true;
  }

  /**
   * Parse get attributes and find game hash
   *
   * @param logUrl - The URL to parse
   * @returns The replay hash
   * @throws InvalidParametersException
   */
  getReplayHash(logUrl: string): string {
    try {
      const url = new URL(logUrl);
      const log = url.searchParams.get('log');
      if (!log) {
        throw new Error('Log parameter not found');
      }
      return log;
    } catch (_error) {
      throw new Error('Received parameter is not valid URL');
    }
  }

  /**
   * Download content from URL
   *
   * @param url - The URL to download from
   * @returns Tuple of [content, httpCode]
   */
  protected async _download(url: string): Promise<[string, number]> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; .NET CLR 1.1.4322)',
        },
        signal: AbortSignal.timeout(5000),
      });

      const content = await response.text();
      return [content, response.status];
    } catch (_error) {
      return ['', 0];
    }
  }

  /**
   * Decode original replay hash
   * Just don't ask how this magic is done.
   *
   * @param log - The encoded hash
   * @returns The decoded hash
   */
  protected _decodeHash(log: string): string {
    const t: number[] = JSON.parse(
      Buffer.from(
        'WzIyMTM2LDUyNzE5LDU1MTQ2LDQyMTA0LDU5NTkxLDQ2OTM0LDkyNDgsMjg4OTEsNDk1OTcsNTI5Nz' +
          'QsNjI4NDQsNDAxNSwxODMxMSw1MDczMCw0MzA1NiwxNzkzOSw2NDgzOCwzODE0NSwyNzAwOCwzOTEy' +
          'OCwzNTY1Miw2MzQwNyw2NTUzNSwyMzQ3MywzNTE2NCw1NTIzMCwyNzUzNiw0Mzg2LDY0OTIwLDI5MD' +
          'c1LDQyNjE3LDE3Mjk0LDE4ODY4LDIwODFd',
        'base64'
      ).toString('utf-8')
    );

    const parts = log.split('-');
    if (parts.length !== 4) {
      return log;
    }

    if (parts[3].charCodeAt(0) === 120) {
      // 'x' character
      const hexparts: number[] = [
        parseInt(parts[3].substring(1, 5), 16),
        parseInt(parts[3].substring(5, 9), 16),
        parseInt(parts[3].substring(9, 13), 16),
        0,
      ];

      const minDate = Buffer.from('MjAxMDA0MTExMWdt', 'base64').toString('utf-8');
      if (parts[0] >= minDate) {
        hexparts[3] =
          parseInt('3' + parts[0].substring(4, 10)) % (17 * 2 - parseInt(parts[0].charAt(9)) - 1);
      }

      let hashHead = (hexparts[0] ^ hexparts[1] ^ t[hexparts[3] + 0]).toString(16);
      let hashTail = (hexparts[1] ^ t[hexparts[3] + 0] ^ hexparts[2] ^ t[hexparts[3] + 1]).toString(
        16
      );

      hashHead = '0'.repeat(4 - hashHead.length) + hashHead;
      hashTail = '0'.repeat(4 - hashTail.length) + hashTail;
      parts[3] = hashHead + hashTail;
    }

    return parts.join('-');
  }
}
