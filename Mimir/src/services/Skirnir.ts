import { RulesetEntity } from 'src/entities/Ruleset.entity.js';
import { PersonEx, Round } from 'tsclients/proto/atoms.pb.js';
import { Model } from 'src/models/Model.js';
import { Repository } from './Repository.js';
import { EventModel } from 'src/models/EventModel.js';
import { PlayerModel } from 'src/models/PlayerModel.js';

enum Notifications {
  SessionSeatingReady = 'sr',
  SessionStartingSoon = 'ss',
  HandHasBeenRecorded = 'h',
  ClubSessionEnded = 'ce',
  TournamentSessionEnded = 'te',
  RefereeCalled = 'rc',
  PenaltyApplied = 'pa',
  HandHasBeenRecordedAdmin = 'ha',
}

const notificationsDefaults = {
  [Notifications.SessionSeatingReady]: 1,
  [Notifications.SessionStartingSoon]: 1,
  [Notifications.HandHasBeenRecorded]: 0,
  [Notifications.ClubSessionEnded]: 0,
  [Notifications.TournamentSessionEnded]: 0,
  [Notifications.RefereeCalled]: 1,
  [Notifications.PenaltyApplied]: 1,
  [Notifications.HandHasBeenRecordedAdmin]: 0,
};

// TODO: i18n
function _t(str: string): string {
  return str;
}

export class SkirnirService {
  private readonly _apiUrl: string;
  private readonly _repo: Repository;

  constructor(apiUrl: string, repo: Repository) {
    this._apiUrl = apiUrl;
    this._repo = repo;
  }

  private getNotificationSettings(notifications: string): typeof notificationsDefaults {
    let settings = {};
    try {
      settings = JSON.parse(notifications);
    } catch (_e) {
      settings = {};
    }
    return { ...notificationsDefaults, ...settings };
  }

  public async messageSeatingReady(
    playerIds: number[],
    table: number,
    eventId: number
  ): Promise<void> {
    const settings = await this._fetchNotificationSettings(playerIds);
    const [disabledForEvent, eventTitle] = await this._fetchEventData(eventId);

    if (disabledForEvent) {
      return;
    }

    const ids = this._getFilteredIdsByPermissions(Notifications.SessionSeatingReady, settings);

    const winds = ['東', '南', '西', '北'];
    const namesAndWinds: string[] = [];

    for (let i = 0; i < 4; i++) {
      for (const player of settings) {
        if (player.id === playerIds[i]) {
          namesAndWinds.push(`${winds[i]} ${player.title}`);
        }
      }
    }

    await this._sendMessage(
      ids,
      `[<b>${eventTitle}</b>]\n\n🪑 The seating for next round is ready!` +
        ` Your table is #${table} - please don't be late!\n\n` +
        `Seating at your table is: \n${namesAndWinds.join('\n')}`
    );
  }

  public async messageSessionStartingSoon(playerIds: number[], eventId: number): Promise<void> {
    const settings = await this._fetchNotificationSettings(playerIds);
    const [disabledForEvent, eventTitle] = await this._fetchEventData(eventId);

    if (disabledForEvent) {
      return;
    }

    const ids = this._getFilteredIdsByPermissions(Notifications.SessionStartingSoon, settings);

    await this._sendMessage(
      ids,
      `[<b>${eventTitle}</b>]\n\n🃏 Next session is about to start! Please head to your table now!`
    );
  }

  public async messageCallReferee(eventId: number, tableId: number): Promise<void> {
    const refereeIds = await this._fetchReferees(eventId);
    const settings = await this._fetchNotificationSettings(refereeIds);
    const [disabledForEvent, eventTitle] = await this._fetchEventData(eventId);

    if (disabledForEvent) {
      return;
    }

    const ids = this._getFilteredIdsByPermissions(Notifications.RefereeCalled, settings);

    await this._sendMessage(
      ids,
      `[<b>${eventTitle}</b>]\n\n⚠️⚠️ Referee is requested at table # ${tableId}`
    );
  }

  public async trackSession(sessionHash: string): Promise<void> {
    await this._sendMessage(['TRACKER'], sessionHash);
  }

  protected _toReadableHanFu(
    han: number,
    fu: number,
    withKiriage = false,
    withKazoe = false
  ): string {
    switch (han) {
      case 1:
      case 2:
      case 3:
      case 4:
        if (withKiriage && ((han === 4 && fu === 30) || (han === 3 && fu === 60))) {
          return 'Mangan';
        }
        return `${han} han ${fu} fu`;
      case 5:
        return 'Mangan';
      case 6:
      case 7:
        return 'Haneman';
      case 8:
      case 9:
      case 10:
        return 'Baiman';
      case 11:
      case 12:
        return 'Sanbaiman';
      case 13:
        return withKazoe ? 'Yakuman' : 'Sanbaiman';
      default:
        if (han < 0) {
          return 'Yakuman';
        }
    }
    return '';
  }

  protected _toReadableYaku(yaku: number[]): string {
    const names = this.getTranslations();
    return yaku.map((y) => names[y]).join(', ');
  }

  protected getTranslations(): Record<number, string> {
    return {
      34: _t('Daburu riichi'),
      19: _t('Dai sangen'),
      21: _t('Dai suushii'),
      25: _t('Junchan'),
      9: _t('Iipeikou'),
      35: _t('Ippatsu'),
      12: _t('Itsu'),
      32: _t('Kokushi musou'),
      36: _t('Menzen tsumo'),
      8: _t('Pinfu'),
      43: _t('Renhou'),
      33: _t('Riichi'),
      38: _t('Rinshan kaihou'),
      30: _t('Ryuu iisou'),
      10: _t('Ryan peikou'),
      3: _t('San ankou'),
      5: _t('San kantsu'),
      11: _t('Sanshoku'),
      4: _t('Sanshoku dokou'),
      7: _t('Suu ankou'),
      6: _t('Suu kantsu'),
      23: _t('Tanyao'),
      39: _t('Tenhou'),
      1: _t('Toi-toi'),
      37: _t('Haitei'),
      27: _t('Honitsu'),
      2: _t('Honroutou'),
      41: _t('Houtei'),
      22: _t('Tsuu iisou'),
      42: _t('Chan kan'),
      24: _t('Chanta'),
      31: _t('Chiitoitsu'),
      28: _t('Chinitsu'),
      26: _t('Chinroutou'),
      40: _t('Chihou'),
      29: _t('Chuuren pooto'),
      18: _t('Shou sangen'),
      20: _t('Shou suushii'),
      13: _t('Yakuhai x1'),
      14: _t('Yakuhai x2'),
      15: _t('Yakuhai x3'),
      16: _t('Yakuhai x4'),
      17: _t('Yakuhai x5'),
      44: _t('Open riichi'),
      45: _t('Suu ankou tanki'),
      46: _t('Chuuren poutou 9-side'),
      47: _t('Kokushi musou 13-side'),
    };
  }

  public async messageHandRecorded(
    playerIds: number[],
    adminIds: number[],
    eventId: number,
    diff: Record<string, [number, number]>,
    round: Round
  ): Promise<void> {
    const settings = await this._fetchNotificationSettings(playerIds);
    const settingsAdmin = await this._fetchNotificationSettings(adminIds);
    const [disabledForEvent, eventTitle, ruleset] = await this._fetchEventData(eventId);

    if (disabledForEvent) {
      return;
    }

    const idsFiltered = Array.from(
      new Set([
        ...this._getFilteredIdsByPermissions(Notifications.HandHasBeenRecorded, settings),
        ...this._getFilteredIdsByPermissions(Notifications.HandHasBeenRecordedAdmin, settingsAdmin),
      ])
    );

    const diffMsg: string[] = [];
    const playerMap = this._getPlayersMap(settings);

    for (const [player, scores] of Object.entries(diff)) {
      const playerId = parseInt(player, 10);
      if (scores[0] !== scores[1]) {
        const change = scores[1] - scores[0];
        const sign = change > 0 ? '+' : '';
        diffMsg.push(
          `<b>${playerMap[playerId]}</b>: ${scores[0]}➡️${scores[1]} (${sign}${change})`
        );
      }
    }

    if (round.ron) {
      diffMsg.push('');
      diffMsg.push(
        `<b>${playerMap[round.ron.winnerId]}</b>: - <b>${this._toReadableHanFu(
          round.ron.han,
          round.ron.fu,
          ruleset.rules.withKiriageMangan,
          ruleset.rules.withKazoe
        )}</b>, ${this._toReadableYaku(round.ron.yaku)}`
      );
    } else if (round.multiron) {
      diffMsg.push('');
      round.multiron.wins.forEach((win) => {
        diffMsg.push(
          `<b>${playerMap[win.winnerId]}</b>: - <b>${this._toReadableHanFu(
            win.han,
            win.fu,
            ruleset.rules.withKiriageMangan,
            ruleset.rules.withKazoe
          )}</b>, ${this._toReadableYaku(win.yaku)}`
        );
      });
    } else if (round.tsumo) {
      diffMsg.push('');
      diffMsg.push(
        `<b>${playerMap[round.tsumo.winnerId]}</b>: - <b>${this._toReadableHanFu(
          round.tsumo.han,
          round.tsumo.fu,
          ruleset.rules.withKiriageMangan,
          ruleset.rules.withKazoe
        )}</b>, ${this._toReadableYaku(round.tsumo.yaku)}`
      );
    } else if (round.draw) {
      diffMsg.push('Exhaustive draw');
    } else if (round.abort) {
      diffMsg.push('Abortive draw');
    } else if (round.chombo) {
      diffMsg.push(`Chombo (${playerMap[round.chombo.loserId]})`);
    }

    if (diffMsg.length === 0) {
      diffMsg.push('No changes');
    }

    this._sendMessage(
      idsFiltered,
      `[<b>${eventTitle}</b>]\n✏️ New hand has been recorded.\n${diffMsg.join('\n')}`
    );
  }

  public async messageClubSessionEnd(
    playerIds: number[],
    eventId: number,
    results: Record<number, number>
  ): Promise<void> {
    const settings = await this._fetchNotificationSettings(playerIds);
    const [disabledForEvent, eventTitle] = await this._fetchEventData(eventId);

    if (disabledForEvent) {
      return;
    }

    const ids = this._getFilteredIdsByPermissions(Notifications.ClubSessionEnded, settings);

    const playerMap = this._getPlayersMap(settings);
    const resultsMsg = Object.entries(results).map(
      ([player, score]) => `<b>${playerMap[parseInt(player, 10)]}</b>: ${score}`
    );

    await this._sendMessage(
      ids,
      `[<b>${eventTitle}</b>]\n🏁 Session has ended. Results: \n${resultsMsg.join('\n')}`
    );
  }

  public async messageTournamentSessionEnd(
    playerIds: number[],
    eventId: number,
    results: Record<number, number>
  ): Promise<void> {
    const settings = await this._fetchNotificationSettings(playerIds);
    const [disabledForEvent, eventTitle] = await this._fetchEventData(eventId);

    if (disabledForEvent) {
      return;
    }

    const ids = this._getFilteredIdsByPermissions(Notifications.TournamentSessionEnded, settings);

    const playerMap = this._getPlayersMap(settings);
    const resultsMsg = Object.entries(results).map(
      ([player, score]) => `<b>${playerMap[parseInt(player, 10)]}</b>: ${score}`
    );

    await this._sendMessage(
      ids,
      `[<b>${eventTitle}</b>]\n🏁 Session has ended. Results: \n${resultsMsg.join('\n')}`
    );
  }

  public async messagePenaltyApplied(
    playerId: number,
    eventId: number,
    amount: number,
    reason: string
  ): Promise<void> {
    const settings = await this._fetchNotificationSettings([playerId]);
    const [disabledForEvent, eventTitle] = await this._fetchEventData(eventId);

    if (disabledForEvent) {
      return;
    }

    const ids = this._getFilteredIdsByPermissions(Notifications.PenaltyApplied, settings);

    await this._sendMessage(
      ids,
      `[<b>${eventTitle}</b>]\n⚠ A penalty of ${amount} points has been assigned to you. Reason: ${reason}\n`
    );
  }

  public async messagePenaltyCancelled(
    playerId: number,
    eventId: number,
    amount: number,
    reason: string
  ): Promise<void> {
    const settings = await this._fetchNotificationSettings([playerId]);
    const [disabledForEvent, eventTitle] = await this._fetchEventData(eventId);

    if (disabledForEvent) {
      return;
    }

    const ids = this._getFilteredIdsByPermissions(Notifications.PenaltyApplied, settings);

    await this._sendMessage(
      ids,
      `[<b>${eventTitle}</b>]\n⚠ A penalty of ${amount} points has been cancelled. Reason: ${reason}\n`
    );
  }

  protected _getFilteredIdsByPermissions(
    type: keyof typeof notificationsDefaults,
    settings: Array<{ id: number; title: string; telegramId: string; notifications: string }>
  ): string[] {
    const ids: string[] = [];

    for (const userSettings of settings) {
      if (!userSettings.telegramId) {
        continue;
      }

      const userNotifications = this.getNotificationSettings(userSettings.notifications);
      if (!userNotifications[type]) {
        continue;
      }

      ids.push(userSettings.telegramId);
    }

    return ids;
  }

  protected async _fetchEventData(eventId: number): Promise<[boolean, string, RulesetEntity]> {
    const eventModel = Model.getModel(this._repo, EventModel);
    const events = await eventModel.findById([eventId]);

    if (events.length === 0) {
      throw new Error('Event not found in DB');
    }

    const event = events[0];
    const isTestEvent = event.title.includes('TEST');

    return [isTestEvent, event.title, event.ruleset];
  }

  protected async _fetchNotificationSettings(
    playerIds: number[]
  ): Promise<Array<{ id: number; title: string; telegramId: string; notifications: string }>> {
    const playerModel = Model.getModel(this._repo, PlayerModel);
    const players = await playerModel.findById(playerIds, true);

    return playerIds
      .map((id) => players.find((p) => p.id === id))
      .filter((p): p is PersonEx => p !== undefined);
  }

  protected async _fetchReferees(eventId: number): Promise<number[]> {
    const admins = await this._repo.frey.GetEventAdmins({ eventId });
    const referees = await this._repo.frey.GetEventReferees({ eventId });

    return [...admins.admins, ...referees.referees].map((item) => parseInt(item.id, 10));
  }

  protected _getPlayersMap(
    settings: Array<{ id: number; title: string; telegramId: string; notifications: string }>
  ): Record<number, string> {
    const map: Record<number, string> = {};

    for (const p of settings) {
      map[p.id] = p.title;
    }

    return map;
  }

  protected async _sendMessage(telegramIds: string[], message: string): Promise<void> {
    try {
      const response = await fetch(this._apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: telegramIds,
          message: message,
        }),
      });

      if (!response.ok) {
        console.error(`Failed to send message: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
}
