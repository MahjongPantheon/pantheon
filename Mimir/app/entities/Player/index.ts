import { playerInfo } from '../../helpers/cache/schema';
import { PersonEx } from 'tsclients/proto/atoms.pb';
import { EntityBase } from 'entities/EntityBase';

export class PlayerEntity extends EntityBase {
  async findById(ids: number[], skipCache = false): Promise<PersonEx[]> {
    let missingIds: number[] = [];
    const fetchedData = new Map<number, PersonEx>();
    const fetchedRemote = new Map<number, PersonEx>();

    if (!skipCache) {
      await Promise.all(
        ids.map((id) =>
          this.repo.cache.client
            .get(playerInfo(id))
            .then((info) => {
              fetchedData.set(id, info as PersonEx);
            })
            .catch(() => {
              missingIds.push(id);
            })
        )
      );
    } else {
      missingIds = ids;
    }

    if (missingIds.length > 0) {
      const data = await this.repo.frey.GetPersonalInfo({
        ids: missingIds,
      });
      const promises: Promise<boolean>[] = [];
      data.people.forEach((person) => {
        promises.push(this.repo.cache.client.set(playerInfo(person.id), person, 300));
        fetchedRemote.set(person.id, person);
      });
      await Promise.all(promises);
    }

    const allData: PersonEx[] = [];
    for (const id of ids) {
      if (fetchedData.has(id)) {
        allData.push(fetchedData.get(id)!);
      }
      if (fetchedRemote.has(id)) {
        allData.push(fetchedRemote.get(id)!);
      }
    }

    return allData;
  }

  async findByTenhouId(ids: string[]): Promise<Record<string, PersonEx>> {
    const data = await this.repo.frey.FindByTenhouIds({ ids });
    return data.people.reduce(
      (acc, player) => {
        acc[player.tenhouId] = player;
        return acc;
      },
      {} as Record<string, PersonEx>
    );
  }

  async findMajsoulAccounts(
    ids: [string, number][] // ms_nickname, ms_account_id
  ): Promise<Record<string, PersonEx>> {
    const data = await this.repo.frey.FindByMajsoulAccountId({
      ids: ids.map(([nickname, accountId]) => ({ nickname, accountId })),
    });
    return data.people.reduce(
      (acc, player) => {
        acc[player.msNickname + '-' + player.msAccountId] = player;
        return acc;
      },
      {} as Record<string, PersonEx>
    );
  }

  async findPlayersForEvents(eventIds: number[]) {
    const registrationData = await findReplacementMapByEvent(eventIds);
    return this._findPlayers(eventIds, registrationData);
  }

  async findPlayersForSession(sessionHash: string, substituteReplacements = false) {
    const session = await findByRepresentationalHash([sessionHash]);
    if (session.length === 0) {
      return { players: [] as PersonEx[], replaceMap: new Map<number, PersonEx>() };
    }
    const playerIds = (
      await this.repo.db.client
        .selectFrom('session_player')
        .select(['player_id'])
        .where('session_id', '=', session[0].id)
        .orderBy('order', 'asc')
        .execute()
    ).map((reg) => reg.player_id);

    const registrationData = await fetchPlayersRegDataByIds([session[0].event_id], playerIds);
    const replacements = new Map<number, number>();
    if (substituteReplacements) {
      for (const registration of registrationData) {
        if (registration.replacement_id) {
          replacements.set(registration.replacement_id, registration.id);
        }
      }
    }

    const playersData = await this._findPlayers(playerIds, replacements);
    // reorder players to match order at the table
    playersData.players.sort((a, b) => playerIds.indexOf(a.id) - playerIds.indexOf(b.id));
    return playersData;
  }

  async _findPlayers(
    ids: number[],
    replacements: Map<number, number> // replacementId -> id : note backward map
  ) {
    const players = await this.findById(ids);
    const replaceMap = new Map<number, PersonEx>();

    if (replacements.size > 0) {
      const replacementPlayers = await this.findById([...replacements.keys()]);
      for (const player of replacementPlayers) {
        if (replacements.has(player.id)) {
          replaceMap.set(replacements.get(player.id)!, player);
        }
      }
    }

    return { players, replaceMap };
  }

  substituteReplacements(players: PersonEx[], replacements: Map<number, PersonEx>) {
    return players.map((p) => {
      if (replacements.has(p.id)) {
        return replacements.get(p.id)!;
      }
      return p;
    });
  }
}
