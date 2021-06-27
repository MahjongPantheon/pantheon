import {
  IRoundOverviewAbort, IRoundOverviewChombo,
  IRoundOverviewDraw,
  IRoundOverviewInfo,
  IRoundOverviewMultiRon, IRoundOverviewNagashi,
  IRoundOverviewRon,
  IRoundOverviewTsumo,
} from '#/components/screens/log/view/RoundTypes';

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

function getPaoLine(paoPlayer: string) {
  return `Pao from: ${paoPlayer}`;
}

function getHonbaLine(honbaOnTable: number) {
  return `Honba: ${honbaOnTable}`
}

function getTempaiLine(tempai: string[]) {
  return `Tempai: ${tempai.join(', ')}`
}

function getRiichiLine(riichiPlayers: string[], riichiOnTable: number) {
  let riichiStr = '';
  if (riichiPlayers.length) {
    riichiStr = riichiPlayers.join(', ');
    if (riichiOnTable) {
      riichiStr += ` + ${riichiOnTable}`
    }
  } else {
    riichiStr = riichiOnTable.toString();
  }

  return `Riichi bets: ${riichiStr}`;
}

function getYakuLine(yakuList: string[], dora?: number) {
  let yakuStr = yakuList.join(', ');
  if (dora) {
    yakuStr += `, dora ${dora}`
  }

  return `${yakuStr}`;
}

function getRoundDescriptionRon(info: IRoundOverviewRon) {
  const {winner, loser, paoPlayer, han, fu, dora, yakuList, riichiPlayers, riichiOnTable, honbaOnTable} = info;

  const lines: string[] = []
  lines.push(`Ron, ${getHandAmount(han, fu)}`);
  lines.push(`${winner} ← ${loser}`);
  lines.push(getYakuLine(yakuList, dora));
  if (paoPlayer) {
    lines.push(getPaoLine(paoPlayer));
  }
  lines.push('');
  lines.push(getRiichiLine(riichiPlayers, riichiOnTable));
  lines.push(getHonbaLine(honbaOnTable));

  return lines;
}

function getRoundDescriptionMultiron(info: IRoundOverviewMultiRon) {
  const {loser, winnerList, hanList, fuList, doraList, yakuList, paoPlayerList, riichiPlayers, riichiOnTable, honbaOnTable} = info;

  const lines: string[] = []
  lines.push(`Multiron, from ${loser}`);
  lines.push('');

  winnerList.forEach((winner, i) => {
    const han = hanList[i];
    const fu = fuList[i];
    const dora = doraList[i];
    const winnerYakuList = yakuList[i];
    const paoPlayer = paoPlayerList[i];

    lines.push(getHandAmount(han, fu));
    lines.push(winner);
    lines.push(getYakuLine(winnerYakuList, dora));
    if (paoPlayer) {
      lines.push(getPaoLine(paoPlayer));
    }
    lines.push('');
  })

  lines.push(getRiichiLine(riichiPlayers, riichiOnTable));
  lines.push(getHonbaLine(honbaOnTable));

  return lines;
}


function getRoundDescriptionTsumo(info: IRoundOverviewTsumo) {
  const {winner, paoPlayer, han, fu, dora, yakuList, riichiPlayers, riichiOnTable, honbaOnTable} = info;

  const lines: string[] = []
  lines.push(`Tsumo, ${getHandAmount(han, fu)}`);
  lines.push(winner);
  lines.push(getYakuLine(yakuList, dora));
  if (paoPlayer) {
    lines.push(getPaoLine(paoPlayer));
  }
  lines.push('');
  lines.push(getRiichiLine(riichiPlayers, riichiOnTable));
  lines.push(getHonbaLine(honbaOnTable));

  return lines;
}

function getRoundDescriptionDraw(info: IRoundOverviewDraw) {
  const {tempai, riichiPlayers, riichiOnTable, honbaOnTable} = info;

  const lines: string[] = [];
  lines.push('Exhaustive draw');
  lines.push(getTempaiLine(tempai));
  lines.push('');
  lines.push(getRiichiLine(riichiPlayers, riichiOnTable));
  lines.push(getHonbaLine(honbaOnTable));
  return lines;
}

function getRoundDescriptionAbort(info: IRoundOverviewAbort) {
  const {riichiPlayers, riichiOnTable, honbaOnTable} = info;

  const lines: string[] = [];
  lines.push('Abortive draw');

  lines.push('');
  lines.push(getRiichiLine(riichiPlayers, riichiOnTable));
  lines.push(getHonbaLine(honbaOnTable));

  return lines;
}

function getRoundDescriptionChombo(info: IRoundOverviewChombo) {
  const {penaltyFor, riichiPlayers, riichiOnTable, honbaOnTable} = info;

  const lines: string[] = [];
  lines.push('Chombo');
  lines.push(penaltyFor);
  lines.push('');
  lines.push(getRiichiLine(riichiPlayers, riichiOnTable));
  lines.push(getHonbaLine(honbaOnTable));

  return lines;
}

function getRoundDescriptionNagashi(info: IRoundOverviewNagashi) {
  const {nagashi, tempai, riichiPlayers, riichiOnTable, honbaOnTable} = info;

  const lines: string[] = [];
  lines.push('Nagashi mangan');
  lines.push(nagashi.join(', '));
  lines.push(getTempaiLine(tempai));
  lines.push('');
  lines.push(getRiichiLine(riichiPlayers, riichiOnTable));
  lines.push(getHonbaLine(honbaOnTable));

  return lines;
}

export function getRoundDescription(info: IRoundOverviewInfo): string[] {
  switch (info.outcome) {
    case 'ron':
      return getRoundDescriptionRon(info);
    case 'multiron':
      return getRoundDescriptionMultiron(info);
    case 'tsumo':
      return getRoundDescriptionTsumo(info);
    case 'draw':
      return getRoundDescriptionDraw(info);
    case 'abort':
      return getRoundDescriptionAbort(info);
    case 'chombo':
      return getRoundDescriptionChombo(info);
    case 'nagashi':
      return getRoundDescriptionNagashi(info);
  }
}
