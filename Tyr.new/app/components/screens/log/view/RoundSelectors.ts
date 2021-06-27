import {IRoundInfo, IRoundOverviewRon, IRoundPlayer} from '#/components/screens/log/view/RoundTypes';

// function getPlayerName(id: number, players: IRoundPlayer[]): string {
//   return players.find(player => player.id === id)!.name;
// }

function getHandAmount(han: number, fu?: number): string {
  if (han < 0) {
    return 'yakuman';
  }

  let str = `${han} han`;

  if (han < 5 && fu) {
    str += ` ${fu} fu`;
  }
  return str;
}

function getRoundDescriptionSingleRon(info: IRoundOverviewRon) {
  const winner = info.winner;
  const loser = info.loser;
  const han = info.han;
  const fu = info.fu;
  const dora = info.dora;
  const yakuList = info.yakuList;
  const riichiPlayers = info.riichiPlayers;

  const riichiOnTable = info.riichiOnTable;
  const honbaOnTable = info.honbaOnTable;

  if (!han) {
    return []
  }

  const lines: string[] = []
  lines.push(`Ron, ${getHandAmount(han, fu)}`);
  lines.push(`${winner} form ${loser}`);

  const yakuStr = yakuList.join(', ');
  if (dora) {
    lines.push(`${yakuStr}, dora ${dora}`);
  } else {
    lines.push(yakuStr);
  }

  let riichiStr = '';
  if (riichiPlayers.length) {
    riichiStr = riichiPlayers.join(', ');
    if (riichiOnTable) {
      riichiStr += `+ ${riichiOnTable}`
    }
  } else {
    riichiStr = riichiOnTable.toString();
  }
  lines.push(`Riichi bets: ${riichiStr}`);

  lines.push(` Honba: ${honbaOnTable}`);

  return lines;
}

function getRoundDescriptionMultiron(info: IRoundInfo) {

}

function getRoundDescriptionRon(info: IRoundInfo) {

}

export function getRoundDescription(info: IRoundInfo): string[] {
  switch (info.outcome) {
    case 'ron':
      getRoundDescriptionSingleRon(info);

      break;
    case 'tsumo':
      break;
    case 'draw':
      break;
    case 'abort':
      break;
    case 'chombo':
      break;
    case 'nagashi':
      break;
  }

  return [];
}
