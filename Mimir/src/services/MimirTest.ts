import { ClientConfiguration } from 'twirpscript';

export class MimirTest {
  protected _config: ClientConfiguration;

  protected _eventId = 1;
  protected _personId = 1;
  protected _authToken = '';

  setEventId(eventId: number) {
    this._eventId = eventId;
  }

  setPersonId(personId: number) {
    this._personId = personId;
  }

  setAuthToken(authToken: string) {
    this._authToken = authToken;
  }

  constructor() {
    this._config = {
      prefix: '/v2',
      baseURL: 'http://localhost:4301',
    };

    const headers = new Headers();
    headers.append('X-Auth-Token', this._authToken);
    headers.append('X-Current-Person-Id', this._personId?.toString() ?? '');

    this._config.rpcTransport = async (url, opts) => {
      Object.keys(opts.headers ?? {}).forEach((key) => headers.set(key, opts.headers[key]));
      headers.set('X-Current-Event-Id', this._eventId?.toString() ?? '');
      // Note: IDE might warn about inconsistent types of opts.body; this is not the case here.
      const resp = await fetch(url, {
        ...opts,
        headers,
      });

      if (!resp.ok) {
        const err = await resp.json();
        // Twirp server error handling
        if (err.code && err.meta && err.meta.cause) {
          throw new Error(err.meta.cause);
        }
      }
      return resp;
    };
  }
}
