import { jest } from '@jest/globals';
import type { MikroORM } from '@mikro-orm/core';
import { AccessAddRuleForPersonResponse } from 'tsclients/proto/frey.pb.js';
import { Repository } from '../Repository.js';

const orm = { em: { fork: () => ({}) } } as unknown as MikroORM;

afterEach(() => jest.restoreAllMocks());

it('forwards each event creator identity to Frey across successive requests', async () => {
  const response = AccessAddRuleForPersonResponse.encode({ ruleId: 1 });
  const transport = jest
    .spyOn(globalThis, 'fetch')
    .mockImplementation(async () => new Response(Uint8Array.from(response).buffer));
  const first = Repository.instance(
    { 'x-current-person-id': '12', 'x-auth-token': 'first-token', 'x-current-event-id': '21' },
    orm
  );
  const second = Repository.instance(
    { 'x-current-person-id': '34', 'x-auth-token': 'second-token', 'x-current-event-id': '43' },
    orm
  );

  await first.frey.AddRuleForPerson({
    eventId: 21,
    personId: 12,
    ruleName: 'ADMIN_EVENT',
    ruleValue: 1,
  });
  await second.frey.AddRuleForPerson({
    eventId: 43,
    personId: 34,
    ruleName: 'ADMIN_EVENT',
    ruleValue: 1,
  });

  expect(transport).toHaveBeenCalledTimes(2);
  const identities = transport.mock.calls.map(([, options]) => {
    const headers = new Headers(options?.headers);
    return [
      headers.get('X-Current-Person-Id'),
      headers.get('X-Auth-Token'),
      headers.get('X-Current-Event-Id'),
    ];
  });
  expect(identities).toEqual([
    ['12', 'first-token', '21'],
    ['34', 'second-token', '43'],
  ]);
});

it('does not replace another request Frey client when mocking one repository', () => {
  const first = Repository.instance({}, orm);
  const second = Repository.instance({}, orm);
  const secondClient = second.frey;
  first.mockFrey();
  expect(second.frey).toBe(secondClient);
  expect(first.frey).not.toBe(secondClient);
});
