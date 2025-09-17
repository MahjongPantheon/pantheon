import { TwirpError } from 'twirpscript';

export class NotFoundError extends TwirpError {
  constructor(message: string) {
    super({
      code: 'not_found',
      msg: message,
    });
  }
}

export class DataMalformedError extends TwirpError {
  constructor(message: string) {
    super({
      code: 'malformed',
      msg: message,
    });
  }
}

export class ExistsError extends TwirpError {
  constructor(message: string) {
    super({
      code: 'already_exists',
      msg: message,
    });
  }
}

export class ActionNotAllowedError extends TwirpError {
  constructor(message: string) {
    super({
      code: 'permission_denied',
      msg: message,
    });
  }
}

export class InvalidInputError extends TwirpError {
  constructor(message: string) {
    super({
      code: 'invalid_argument',
      msg: message,
    });
  }
}

export function wrapErrorObject(e: Error | TwirpError) {
  if (e instanceof TwirpError) {
    return e;
  }
  return new TwirpError({
    msg: e.message,
    code: 'internal',
    meta: { originalError: e.message + e.stack },
  });
}

export async function wrapError<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (e: any) {
    throw wrapErrorObject(e);
  }
}
