import { TwirpError } from 'twirpscript';
import {
  ActionNotAllowedError,
  DataMalformedError,
  ExistsError,
  InvalidInputError,
  NotFoundError,
  wrapError,
  wrapErrorObject,
} from './errors';

it.each([
  [NotFoundError, 'not_found'],
  [DataMalformedError, 'malformed'],
  [ExistsError, 'already_exists'],
  [ActionNotAllowedError, 'permission_denied'],
  [InvalidInputError, 'invalid_argument'],
] as const)('preserves the public error code for %s', (ErrorType, code) => {
  const error = new ErrorType('Details');
  expect(error).toBeInstanceOf(TwirpError);
  expect(error).toMatchObject({ code, msg: 'Details' });
  expect(wrapErrorObject(error)).toBe(error);
});

it('wraps unexpected errors and preserves diagnostic context', async () => {
  const error = new Error('Database unavailable');
  const wrapped = wrapErrorObject(error);
  expect(wrapped).toMatchObject({ code: 'internal', msg: error.message });
  expect(wrapped.meta?.originalError).toContain(error.stack);
  await expect(wrapError(Promise.resolve(42))).resolves.toBe(42);
  await expect(wrapError(Promise.reject(error))).rejects.toMatchObject({
    code: 'internal',
    msg: error.message,
  });
  const known = new InvalidInputError('Invalid');
  await expect(wrapError(Promise.reject(known))).rejects.toBe(known);
});
