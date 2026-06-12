/*  Sigrun: rating tables and statistics frontend
 *  Copyright (C) 2023  o.klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Player, Round } from 'tsclients/proto/atoms.pb';
import { I18nService } from '../services/i18n';
import { YakuId, yakuNameMap as yakuNameMapGen } from './yaku';

export const makeLog = (
  rounds: Round[],
  players: Record<number, Player>,
  i18n: I18nService,
  playersCount = 4
) => {
  const noRiichi = i18n._pt('Riichi bets count', 'none');
  const yakuNameMap = yakuNameMapGen(i18n);
  return rounds.map((round) => {
    if (round.ron) {
      const loser = round.ron.paoPlayerId
        ? i18n._pt('Ron log item partial', '<b>%1</b>, pao: <b>%2</b>', [
            players[round.ron.loserId]?.title,
            players[round.ron.paoPlayerId]?.title,
          ])
        : `<b>${players[round.ron.loserId]?.title}</b>`;
      return i18n._pt('Ron log item', '%1: <b>%2</b> - %3 (%4), %5. Riichi bets: %6', [
        makeRound(round.ron.roundIndex, playersCount),
        players[round.ron.winnerId]?.title,
        makeYaku(round.ron.yaku, round.ron.dora + round.ron.uradora, i18n, yakuNameMap),
        loser,
        makeHanFu(round.ron.han, round.ron.fu, i18n),
        makeCsvPlayers(players, round.ron.riichiBets) || noRiichi,
      ]);
    }

    if (round.tsumo) {
      const winner = round.tsumo.paoPlayerId
        ? i18n._pt('Tsumo item partial', '(tsumo, pao: <b>%1</b>)', [
            players[round.tsumo.paoPlayerId]?.title,
          ])
        : i18n._pt('Tsumo log item partial', '(tsumo)');
      return i18n._pt('Tsumo log item', '%1: <b>%2</b> - %3 %4, %5. Riichi bets: %6', [
        makeRound(round.tsumo.roundIndex, playersCount),
        players[round.tsumo.winnerId]?.title,
        winner,
        makeYaku(round.tsumo.yaku, round.tsumo.dora + round.tsumo.uradora, i18n, yakuNameMap),
        makeHanFu(round.tsumo.han, round.tsumo.fu, i18n),
        makeCsvPlayers(players, round.tsumo.riichiBets) || noRiichi,
      ]);
    }

    if (round.draw) {
      return i18n._pt('Draw log item', '%1: Exhaustive draw (tenpai: %2). Riichi bets: %3', [
        makeRound(round.draw.roundIndex, playersCount),
        round.draw.tempai.length === playersCount
          ? i18n._t('all tenpai')
          : makeCsvPlayers(players, round.draw.tempai) || i18n._t('all noten'),
        makeCsvPlayers(players, round.draw.riichiBets) || noRiichi,
      ]);
    }

    if (round.abort) {
      return i18n._pt('Abortive draw log item', '%1: Abortive draw. Riichi bets: %2', [
        makeRound(round.abort.roundIndex, playersCount),
        makeCsvPlayers(players, round.abort.riichiBets) || noRiichi,
      ]);
    }

    if (round.chombo) {
      return i18n._pt('Chombo log item', '%1: Chombo (<b>%2</b>)', [
        makeRound(round.chombo.roundIndex, playersCount),
        players[round.chombo.loserId]?.title,
      ]);
    }

    if (round.nagashi) {
      return i18n._pt('Nagashi log item', '%1: Nagashi mangan (<b>%2</b>). Riichi bets: %3', [
        makeRound(round.nagashi.roundIndex, playersCount),
        makeCsvPlayers(players, round.nagashi.nagashi),
        makeCsvPlayers(players, round.nagashi.riichiBets) || noRiichi,
      ]);
    }

    if (round.multiron) {
      const list =
        '<ul>' +
        round.multiron.wins
          .map((win) => {
            const winner = win.paoPlayerId
              ? i18n._pt('Multiron item partial', '<b>%1</b> (pao: <b>%2</b>)', [
                  players[win.winnerId]?.title,
                  players[win.paoPlayerId]?.title,
                ])
              : `<b>${players[win.winnerId]?.title}</b>`;
            return i18n._pt('Multiron inner log item', '<li>%1 - %2, %3</li>', [
              winner,
              makeYaku(win.yaku, win.dora + win.uradora, i18n, yakuNameMap),
              makeHanFu(win.han, win.fu, i18n),
            ]);
          })
          .join('\n') +
        '</ul>';
      return (
        i18n._pt('Multiron outer log item', '%1: Ron (<b>%2</b>). Riichi bets: %3', [
          makeRound(round.multiron.roundIndex, playersCount),
          players[round.multiron.loserId]?.title,
          makeCsvPlayers(players, round.multiron.riichiBets) || noRiichi,
        ]) + list
      );
    }

    return '';
  });
};

function makeRound(roundIndex: number, playersCount = 4) {
  if (roundIndex < 1) {
    return '?';
  }
  if (roundIndex > 3 * playersCount) {
    return `北${roundIndex - 3 * playersCount}`;
  }
  if (roundIndex > 2 * playersCount) {
    return `西${roundIndex - 2 * playersCount}`;
  }
  if (roundIndex > playersCount) {
    return `南${roundIndex - playersCount}`;
  }
  return `東${roundIndex}`;
}

function makeYaku(yaku: YakuId[], dora: number, i18n: I18nService, yakuNames: Map<YakuId, string>) {
  const yakuList = yaku.map((id) => yakuNames.get(id));
  if (dora > 0) {
    yakuList.push(i18n._t('dora %1', [dora]));
  }
  return yakuList.join(', ');
}

function makeHanFu(han: number, fu: number, i18n: I18nService) {
  if (han < 0) {
    return i18n._t('yakuman!');
  }
  if (han >= 5) {
    return i18n._t('%1 han', [han]);
  }
  return i18n._t('%1 han, %2 fu', [han, fu]);
}

function makeCsvPlayers(players: Record<number, Player>, actualList: number[]) {
  return actualList.map((id) => players[id]?.title).join(', ');
}
