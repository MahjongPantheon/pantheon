import { Player, Round } from 'tsclients/proto/atoms.pb';
import { I18nService } from '../services/i18n';
import { yakuList } from './yaku';

export function formatRoundIndex(roundIndex: number, playersCount: 3 | 4 = 4) {
  if (roundIndex < 1 || roundIndex > 4 * playersCount) return '?';
  const wind = ['東', '南', '西', '北'][Math.floor((roundIndex - 1) / playersCount)];
  return `${wind}${((roundIndex - 1) % playersCount) + 1}`;
}

export type LastRoundPart = { text: string; playerId?: number };

export function formatLastRound(
  round: Round,
  players: Record<number, Pick<Player, 'title'>>,
  i18n: I18nService
): string[] {
  return formatLastRoundParts(round, players, i18n).map((line) =>
    line.map((part) => part.text).join('')
  );
}

export function formatLastRoundParts(
  round: Round,
  players: Record<number, Pick<Player, 'title'>>,
  i18n: I18nService
): LastRoundPart[][] {
  const references: LastRoundPart[] = [];
  const lines = formatWithPlayerTokens(round, i18n, (id) => {
    const index =
      references.push({
        text: players[id]?.title || i18n._t('Player #%1', [id]),
        playerId: id,
      }) - 1;
    return `\u0000player:${index}\u0000`;
  });
  return lines.map((line) => {
    const parts: LastRoundPart[] = [];
    let offset = 0;
    // Parse only our placeholders. Names are inserted afterwards, so overlapping names,
    // HTML characters, and names matching yaku or placeholder text remain literal text.
    for (const match of line.matchAll(/\u0000player:(\d+)\u0000/g)) {
      if (match.index > offset) parts.push({ text: line.slice(offset, match.index) });
      parts.push(references[Number(match[1])]);
      offset = match.index + match[0].length;
    }
    if (offset < line.length) parts.push({ text: line.slice(offset) });
    return parts;
  });
}

function formatWithPlayerTokens(
  round: Round,
  i18n: I18nService,
  player: (id: number) => string
): string[] {
  const names = (ids: number[]) => ids.map(player).join(', ') || '--';
  const tenpai = (ids: number[]) =>
    ids.length === 4 ? i18n._t('all tenpai') : ids.length === 0 ? i18n._t('all noten') : names(ids);
  const hand = (win: {
    yaku: number[];
    dora: number;
    uradora: number;
    han: number;
    fu: number;
    paoPlayerId: number;
  }) => {
    const details = yakuList
      .filter((yaku) => win.yaku.includes(yaku.id))
      .map((yaku) => yaku.name(i18n));
    // Match Sigrun's game log: dora includes ura-dora in the displayed bonus count.
    const dora = win.dora + win.uradora;
    if (dora > 0) details.push(i18n._t('dora %1', [dora]));
    details.push(
      win.han < 0
        ? i18n._t('yakuman!')
        : win.han >= 5
          ? i18n._t('%1 han', [win.han])
          : i18n._t('%1 han, %2 fu', [win.han, win.fu])
    );
    if (win.paoPlayerId) details.push(i18n._t('pao: %1', [player(win.paoPlayerId)]));
    return details.join(', ');
  };

  if (round.ron) {
    const ron = round.ron;
    return [
      i18n._t('Ron, %1 from %2 (%3), riichi: %4', [
        player(ron.winnerId),
        player(ron.loserId),
        hand(ron),
        names(ron.riichiBets),
      ]),
    ];
  }
  if (round.multiron) {
    const ron = round.multiron;
    return ron.wins.map((win) =>
      i18n._t('Ron, %1 from %2 (%3), riichi: %4', [
        player(win.winnerId),
        player(ron.loserId),
        hand(win),
        names(ron.riichiBets),
      ])
    );
  }
  if (round.tsumo) {
    const tsumo = round.tsumo;
    return [
      i18n._t('Tsumo, %1 (%2), riichi: %3', [
        player(tsumo.winnerId),
        hand(tsumo),
        names(tsumo.riichiBets),
      ]),
    ];
  }
  if (round.chombo) {
    return [i18n._t('Chombo, %1', [names(round.chombo.loserIds)])];
  }
  if (round.draw) {
    return [
      i18n._t('Draw, tempai: %1, riichi: %2', [
        tenpai(round.draw.tempai),
        names(round.draw.riichiBets),
      ]),
    ];
  }
  if (round.abort) {
    return [i18n._t('Abortive draw, riichi: %1', [names(round.abort.riichiBets)])];
  }
  if (round.nagashi) {
    return [
      i18n._t('Nagashi mangan, nagashi: %1, tempai: %2, riichi: %3', [
        names(round.nagashi.nagashi),
        tenpai(round.nagashi.tempai),
        names(round.nagashi.riichiBets),
      ]),
    ];
  }
  return [];
}
