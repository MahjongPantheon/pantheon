import { Player, Round } from 'tsclients/proto/atoms.pb';
import { I18nService } from '../services/i18n';
import { yakuList } from './yaku';

const winds = [
  '?',
  '東1',
  '東2',
  '東3',
  '東4',
  '南1',
  '南2',
  '南3',
  '南4',
  '西1',
  '西2',
  '西3',
  '西4',
  '北1',
  '北2',
  '北3',
  '北4',
];

export function formatRoundIndex(roundIndex: number) {
  return winds[roundIndex] ?? '?';
}

// Return plain text: player names and translations are rendered by React, never as HTML.
export function formatLastRound(
  round: Round,
  players: Record<number, Pick<Player, 'title'>>,
  i18n: I18nService
): string[] {
  const player = (id: number) => players[id]?.title || i18n._t('Player #%1', [id]);
  const names = (ids: number[]) => ids.map(player).join(', ') || '--';
  const tenpai = (ids: number[]) =>
    ids.length === 4 ? i18n._t('all tenpai') : ids.length === 0 ? i18n._t('all noten') : names(ids);
  const line = (roundIndex: number, text: string) => `${formatRoundIndex(roundIndex)}: ${text}`;
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
      line(
        ron.roundIndex,
        i18n._t('Ron, %1 from %2 (%3), riichi: %4', [
          player(ron.winnerId),
          player(ron.loserId),
          hand(ron),
          names(ron.riichiBets),
        ])
      ),
    ];
  }
  if (round.multiron) {
    const ron = round.multiron;
    return ron.wins.map((win) =>
      line(
        ron.roundIndex,
        i18n._t('Ron, %1 from %2 (%3), riichi: %4', [
          player(win.winnerId),
          player(ron.loserId),
          hand(win),
          names(ron.riichiBets),
        ])
      )
    );
  }
  if (round.tsumo) {
    const tsumo = round.tsumo;
    return [
      line(
        tsumo.roundIndex,
        i18n._t('Tsumo, %1 (%2), riichi: %3', [
          player(tsumo.winnerId),
          hand(tsumo),
          names(tsumo.riichiBets),
        ])
      ),
    ];
  }
  if (round.chombo) {
    return [line(round.chombo.roundIndex, i18n._t('Chombo, %1', [player(round.chombo.loserId)]))];
  }
  if (round.draw) {
    return [
      line(
        round.draw.roundIndex,
        i18n._t('Draw, tempai: %1, riichi: %2', [
          tenpai(round.draw.tempai),
          names(round.draw.riichiBets),
        ])
      ),
    ];
  }
  if (round.abort) {
    return [
      line(
        round.abort.roundIndex,
        i18n._t('Abortive draw, riichi: %1', [names(round.abort.riichiBets)])
      ),
    ];
  }
  if (round.nagashi) {
    return [
      line(
        round.nagashi.roundIndex,
        i18n._t('Nagashi mangan, nagashi: %1, tempai: %2, riichi: %3', [
          names(round.nagashi.nagashi),
          tenpai(round.nagashi.tempai),
          names(round.nagashi.riichiBets),
        ])
      ),
    ];
  }
  return [];
}
