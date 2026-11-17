import type { ClientConfiguration } from 'twirpscript';
import { ApiService } from './api';

vi.mock('tsclients/proto/mimir.pb', () => ({}));
vi.mock('tsclients/proto/hugin.pb', () => ({}));
vi.mock('tsclients/proto/frey.pb', async () => {
  const { JSONrequest } = await import('twirpscript');
  return {
    UpdatePersonalInfo: (payload: object, config: ClientConfiguration) =>
      JSONrequest('/common.Frey/UpdatePersonalInfo', JSON.stringify(payload), config),
  };
});

afterEach(() => vi.unstubAllGlobals());

it('rejects a Frey error with its Twirp code and message', async () => {
  const body = { code: 'already_exists', msg: 'Ronin ID is already taken' };
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status: 409 }))
  );
  const api = new ApiService();
  api.setCredentials(7, 'token');

  await expect(
    api.updatePersonalInfo(7, 'Alice', 'DE', '', 'a@b.test', '', '', false, '', '', -1, -1, 'ronin')
  ).rejects.toMatchObject(body);
});
