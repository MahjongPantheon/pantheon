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
