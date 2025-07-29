import { createHash } from 'crypto';

export function sha384(input: string): string {
  return createHash('sha3-384').update(input).digest('hex');
}

export function md5(input: string): string {
  return createHash('md5').update(input).digest('hex');
}

export function sha1(input: string): string {
  return createHash('sha1').update(input).digest('hex');
}

export function base64encode(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64');
}

export function base64decode(input: string): string {
  return Buffer.from(input, 'base64').toString('utf8');
}

// Note: function is not multibyte-safe
export function chunks(input: string, size = 76): string[] {
  const c = [];
  let strIndex = 0;
  for (let nextIndex = 0; strIndex < input.length; nextIndex++) {
    c[nextIndex] = input.slice(strIndex, (strIndex += size));
  }
  return c;
}

export function calcPasswordStrength(password: string): number {
  const hasLatinSymbols = password.match(/[a-z]/);
  const hasUppercaseLatinSymbols = password.match(/[A-Z]/);
  const hasDigits = password.match(/[0-9]/);
  const hasPunctuation = password.match(/[-@#$%^&*(),\.\/\\"']/);
  const hasOtherSymbols = password.replace(/[-a-z0-9@#$%^&*(),\./\\"']/g, '').length > 0;

  return (
    Math.ceil(password.length / 2) *
    (hasDigits ? 2 : 1) *
    (hasUppercaseLatinSymbols ? 2 : 1) *
    (hasPunctuation ? 2 : 1) *
    (hasOtherSymbols ? 2 : 1) *
    (hasLatinSymbols ? 2 : 1)
  );
}
