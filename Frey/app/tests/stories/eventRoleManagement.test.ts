import { createUser, makeFreyClient, makeUniqueEmail } from '../helpers';
import { Rights } from '../../helpers/rights';
import { ActionNotAllowedError } from '../../helpers/errors';

describe('Delegated event administrator manages referees', () => {
  const frey = makeFreyClient();
  const eventId = 79601;
  const otherEventId = 79602;
  type Account = Awaited<ReturnType<typeof createUser>>;
  let owner: Account;
  let administrator: Account;
  let referee: Account;
  let unrelated: Account;
  let refereeRuleId: number;

  const credentials = (account: Account) => ({
    headers: {
      'x-current-person-id': account.personId.toString(),
      'x-auth-token': account.authToken,
    },
  });
  const addRule = (actor: Account, person: Account, targetEventId: number, ruleName: Rights) =>
    frey.AddRuleForPerson(
      { personId: person.personId, eventId: targetEventId, ruleName, ruleValue: 1 },
      credentials(actor)
    );

  beforeAll(async () => {
    owner = await createUser(frey, makeUniqueEmail());
    administrator = await createUser(frey, makeUniqueEmail());
    referee = await createUser(frey, makeUniqueEmail());
    unrelated = await createUser(frey, makeUniqueEmail());
    await addRule(owner, owner, eventId, Rights.ADMIN_EVENT);
    await addRule(owner, owner, otherEventId, Rights.ADMIN_EVENT);
    await addRule(owner, administrator, eventId, Rights.ADMIN_EVENT);
    refereeRuleId = (await addRule(owner, referee, eventId, Rights.REFEREE_FOR_EVENT)).ruleId;
  });

  it('uses the listed ACL ID to remove a referee added by the newly assigned administrator', async () => {
    const target = await createUser(frey, makeUniqueEmail());
    const first = await addRule(administrator, target, eventId, Rights.REFEREE_FOR_EVENT);
    const second = await addRule(owner, target, otherEventId, Rights.REFEREE_FOR_EVENT);
    // Two rules for the same person ensure that person IDs cannot masquerade as both rule IDs.
    for (const [targetEventId, ruleId] of [
      [eventId, first.ruleId],
      [otherEventId, second.ruleId],
    ]) {
      const { referees } = await frey.GetEventReferees({ eventId: targetEventId });
      expect(referees.find((person) => person.personId === target.personId)?.ruleId).toBe(ruleId);
    }
    const { referees } = await frey.GetEventReferees({ eventId });
    const listed = referees.find((person) => person.personId === target.personId)!;
    await expect(
      frey.DeleteRuleForPerson({ ruleId: listed.ruleId }, credentials(administrator))
    ).resolves.toEqual({ success: true });
    expect((await frey.GetEventReferees({ eventId })).referees).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ personId: target.personId })])
    );
    expect((await frey.GetEventReferees({ eventId: otherEventId })).referees).toEqual(
      expect.arrayContaining([expect.objectContaining({ ruleId: second.ruleId })])
    );
  });

  it.each(['referee', 'unrelated user', 'administrator of another event'])(
    'denies adding and removing referees by a %s',
    async (actor) => {
      const account =
        actor === 'referee' ? referee : actor === 'unrelated user' ? unrelated : administrator;
      const targetEventId = actor === 'administrator of another event' ? otherEventId : eventId;
      const ruleId =
        targetEventId === eventId
          ? refereeRuleId
          : (await addRule(owner, referee, otherEventId, Rights.REFEREE_FOR_EVENT)).ruleId;
      await expect(
        addRule(account, unrelated, targetEventId, Rights.REFEREE_FOR_EVENT)
      ).rejects.toEqual(
        new ActionNotAllowedError('You are not allowed to add referees in this event')
      );
      await expect(frey.DeleteRuleForPerson({ ruleId }, credentials(account))).rejects.toEqual(
        new ActionNotAllowedError('You are not allowed to remove referees from this event')
      );
      expect((await frey.GetEventReferees({ eventId: targetEventId })).referees).toEqual(
        expect.arrayContaining([expect.objectContaining({ ruleId })])
      );
    }
  );
});
