/*  Mimir: mahjong games storage
 *  Copyright (C) 2016  o.klimenko aka ctizen
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

/**
 * @Author Steven Vch. <unstatik@staremax.com>
 */
import { PlatformType } from 'tsclients/proto/atoms.pb.js';

interface PlayerMapping {
  nickname: string;
  account_id: string;
}

interface ParsedContent {
  ref: string;
  name: string[];
  sc: number[];
  log: any[][];
  lobby?: number;
  playerMapping?: PlayerMapping[];
}

interface TokenUN {
  player_name: string;
  account_id?: number;
}

interface TokenGO {
  lobby: string;
}

interface ReachToken {
  who: number;
}

interface TokenRyuukyoku {
  type?: string;
  sc: string[];
  hai0: boolean;
  hai1: boolean;
  hai2: boolean;
  hai3: boolean;
}

interface TokenAgari {
  who: number;
  fromWho: number;
  isPao: boolean;
  paoWho: number;
  openHand: boolean;
  fu: number;
  yaku: string[];
  yakuman: string[];
  sc: string[];
  isMangan: boolean;
}

interface PlayerInfo {
  is_open_hand: boolean;
}

type Round =
  | {
      type: 'AGARI';
      token: TokenAgari;
      reach_tokens: ReachToken[];
    }
  | {
      type: 'MULTI_AGARI';
      tokens: TokenAgari[];
      reach_tokens: ReachToken[];
    }
  | {
      type: 'RYUUKYOKU';
      token: TokenRyuukyoku;
      reach_tokens: ReachToken[];
    }
  | {
      type: 'RYUUKYOKU_NO_SCORES_ALL_TEMPAI';
      token: TokenRyuukyoku;
      reach_tokens: ReachToken[];
    }
  | {
      type: 'RYUUKYOKU_NO_SCORES_ALL_NOTEN';
      token: TokenRyuukyoku;
      reach_tokens: ReachToken[];
    };

export class Tenhou6Model {
  private readonly _platformId: PlatformType;
  private _tokenUN: TokenUN[] = [];
  private _tokenGO: TokenGO = { lobby: '0' };
  private owari: number[] = [];
  private readonly _rounds: Round[] = [];
  private _replayHash = '';

  // Round type constants
  private readonly AGARI = 'AGARI';
  private readonly MULTI_AGARI = 'MULTI_AGARI';
  private readonly RYUUKYOKU = 'RYUUKYOKU';
  private readonly RYUUKYOKU_NO_SCORES_ALL_TEMPAI = 'RYUUKYOKU_NO_SCORES_ALL_TEMPAI';
  private readonly RYUUKYOKU_NO_SCORES_ALL_NOTEN = 'RYUUKYOKU_NO_SCORES_ALL_NOTEN';
  private readonly YAKUMAN = 'YAKUMAN';
  private readonly MANGAN = 'MANGAN';
  private readonly NAGASHI_MANGAN = 'NAGASHI_MANGAN';
  private readonly FOUR_KAN_ABORTTION = 'FOUR_KAN_ABORTTION';
  private readonly FOUR_KAN_ABORTTION_ALT = 'FOUR_KAN_ABORTTION_ALT';
  private readonly THREE_RON_ABORTION = 'THREE_RON_ABORTION';
  private readonly THREE_RON_ABORTION_ALT = 'THREE_RON_ABORTION_ALT';
  private readonly NINE_TERMINAL_ABORTION = 'NINE_TERMINAL_ABORTION';
  private readonly FOUR_WIND_ABORTION = 'FOUR_WIND_ABORTION';
  private readonly FOUR_RIICHI_ABORTION = 'FOUR_RIICHI_ABORTION';
  private readonly POINTS_FOR_ALL = 'POINTS_FOR_ALL';
  private readonly FU = 'FU';
  private readonly HAN = 'HAN';

  // Yaku constants
  private readonly Y_TENHOU = 'Y_TENHOU';
  private readonly Y_CHIHOU = 'Y_CHIHOU';
  private readonly Y_DAISANGEN = 'Y_DAISANGEN';
  private readonly Y_SUUANKOU = 'Y_SUUANKOU';
  private readonly Y_SUUANKOU_TANKI = 'Y_SUUANKOU_TANKI';
  private readonly Y_TSUUIISOU = 'Y_TSUUIISOU';
  private readonly Y_RYUUIISOU = 'Y_RYUUIISOU';
  private readonly Y_CHINROTO = 'Y_CHINROTO';
  private readonly Y_CHUURENPOUTO = 'Y_CHUURENPOUTO';
  private readonly Y_CHUURENPOUTO_9 = 'Y_CHUURENPOUTO_9';
  private readonly Y_KOKUSHIMUSOU = 'Y_KOKUSHIMUSOU';
  private readonly Y_KOKUSHIMUSOU_13 = 'Y_KOKUSHIMUSOU_13';
  private readonly Y_DAISUUSHII = 'Y_DAISUUSHII';
  private readonly Y_SHOSUUSHII = 'Y_SHOSUUSHII';
  private readonly Y_SUUKANTSU = 'Y_SUUKANTSU';
  private readonly Y_MENZENTSUMO = 'Y_MENZENTSUMO';
  private readonly Y_RIICHI = 'Y_RIICHI';
  private readonly Y_IPPATSU = 'Y_IPPATSU';
  private readonly Y_CHANKAN = 'Y_CHANKAN';
  private readonly Y_RINSHANKAIHOU = 'Y_RINSHANKAIHOU';
  private readonly Y_HAITEI = 'Y_HAITEI';
  private readonly Y_HOUTEI = 'Y_HOUTEI';
  private readonly Y_PINFU = 'Y_PINFU';
  private readonly Y_TANYAO = 'Y_TANYAO';
  private readonly Y_IIPEIKOU = 'Y_IIPEIKOU';
  private readonly Y_TON_PLACE = 'Y_TON_PLACE';
  private readonly Y_NAN_PLACE = 'Y_NAN_PLACE';
  private readonly Y_SHA_PLACE = 'Y_SHA_PLACE';
  private readonly Y_PEI_PLACE = 'Y_PEI_PLACE';
  private readonly Y_TON_ROUND = 'Y_TON_ROUND';
  private readonly Y_NAN_ROUND = 'Y_NAN_ROUND';
  private readonly Y_SHA_ROUND = 'Y_SHA_ROUND';
  private readonly Y_PEI_ROUND = 'Y_PEI_ROUND';
  private readonly Y_HAKU = 'Y_HAKU';
  private readonly Y_HATSU = 'Y_HATSU';
  private readonly Y_CHUN = 'Y_CHUN';
  private readonly Y_DOUBLERIICHI = 'Y_DOUBLERIICHI';
  private readonly Y_CHIITOITSU = 'Y_CHIITOITSU';
  private readonly Y_CHANTA = 'Y_CHANTA';
  private readonly Y_ITTSU = 'Y_ITTSU';
  private readonly Y_SANSHOKUDOUJUN = 'Y_SANSHOKUDOUJUN';
  private readonly Y_SANSHOKUDOUKOU = 'Y_SANSHOKUDOUKOU';
  private readonly Y_SANKANTSU = 'Y_SANKANTSU';
  private readonly Y_TOITOI = 'Y_TOITOI';
  private readonly Y_SANANKOU = 'Y_SANANKOU';
  private readonly Y_SHOSANGEN = 'Y_SHOSANGEN';
  private readonly Y_HONROTO = 'Y_HONROTO';
  private readonly Y_RYANPEIKOU = 'Y_RYANPEIKOU';
  private readonly Y_JUNCHAN = 'Y_JUNCHAN';
  private readonly Y_HONITSU = 'Y_HONITSU';
  private readonly Y_CHINITSU = 'Y_CHINITSU';
  private readonly Y_RENHOU = 'Y_RENHOU';
  private readonly Y_DORA = 'Y_DORA';
  private readonly Y_URADORA = 'Y_URADORA';
  private readonly Y_AKADORA = 'Y_AKADORA';

  private _RUNES: Record<string, string> = {};

  constructor(tenhou6JsonContent: string, platformId: PlatformType) {
    this._platformId = platformId;
    this.initRunes();
    const parsedContent: ParsedContent = JSON.parse(tenhou6JsonContent);
    this.parseToModel(parsedContent);
  }

  private initRunes(): void {
    this._RUNES[this.AGARI] = '和了';
    this._RUNES[this.RYUUKYOKU] = '流局';
    this._RUNES[this.RYUUKYOKU_NO_SCORES_ALL_TEMPAI] = '全員聴牌';
    this._RUNES[this.FOUR_KAN_ABORTTION] = '四開槓';
    this._RUNES[this.THREE_RON_ABORTION] = '三家和';
    this._RUNES[this.RYUUKYOKU_NO_SCORES_ALL_NOTEN] = '全員不聴';
    this._RUNES[this.FOUR_KAN_ABORTTION_ALT] = '四槓散了';
    this._RUNES[this.THREE_RON_ABORTION_ALT] = '三家和了';
    this._RUNES[this.NINE_TERMINAL_ABORTION] = '九種九牌';
    this._RUNES[this.FOUR_WIND_ABORTION] = '四風連打';
    this._RUNES[this.FOUR_RIICHI_ABORTION] = '四家立直';
    this._RUNES[this.YAKUMAN] = '役満';
    this._RUNES[this.MANGAN] = '満貫';
    this._RUNES[this.NAGASHI_MANGAN] = '流し満貫';
    this._RUNES[this.POINTS_FOR_ALL] = '点∀';
    this._RUNES[this.FU] = '符';
    this._RUNES[this.HAN] = '飜';
    this._RUNES[this.Y_TENHOU] = '天和';
    this._RUNES[this.Y_CHIHOU] = '地和';
    this._RUNES[this.Y_DAISANGEN] = '大三元';
    this._RUNES[this.Y_SUUANKOU] = '四暗刻';
    this._RUNES[this.Y_SUUANKOU_TANKI] = '四暗刻単騎';
    this._RUNES[this.Y_TSUUIISOU] = '字一色';
    this._RUNES[this.Y_RYUUIISOU] = '緑一色';
    this._RUNES[this.Y_CHINROTO] = '清老頭';
    this._RUNES[this.Y_CHUURENPOUTO] = '九蓮宝燈';
    this._RUNES[this.Y_CHUURENPOUTO_9] = '純正九蓮宝燈';
    this._RUNES[this.Y_KOKUSHIMUSOU] = '国士無双';
    this._RUNES[this.Y_KOKUSHIMUSOU_13] = '国士無双13面';
    this._RUNES[this.Y_DAISUUSHII] = '大四喜';
    this._RUNES[this.Y_SHOSUUSHII] = '小四喜';
    this._RUNES[this.Y_SUUKANTSU] = '四槓子';
    this._RUNES[this.Y_MENZENTSUMO] = '門前清自摸和';
    this._RUNES[this.Y_RIICHI] = '立直';
    this._RUNES[this.Y_IPPATSU] = '一発';
    this._RUNES[this.Y_CHANKAN] = '槍槓';
    this._RUNES[this.Y_RINSHANKAIHOU] = '嶺上開花';
    this._RUNES[this.Y_HAITEI] = '海底摸月';
    this._RUNES[this.Y_HOUTEI] = '河底撈魚';
    this._RUNES[this.Y_PINFU] = '平和';
    this._RUNES[this.Y_TANYAO] = '断幺九';
    this._RUNES[this.Y_IIPEIKOU] = '一盃口';
    this._RUNES[this.Y_TON_PLACE] = '自風 東';
    this._RUNES[this.Y_NAN_PLACE] = '自風 南';
    this._RUNES[this.Y_SHA_PLACE] = '自風 西';
    this._RUNES[this.Y_PEI_PLACE] = '自風 北';
    this._RUNES[this.Y_TON_ROUND] = '場風 東';
    this._RUNES[this.Y_NAN_ROUND] = '場風 南';
    this._RUNES[this.Y_SHA_ROUND] = '場風 西';
    this._RUNES[this.Y_PEI_ROUND] = '場風 北';
    this._RUNES[this.Y_HAKU] = '役牌 白';
    this._RUNES[this.Y_HATSU] = '役牌 發';
    this._RUNES[this.Y_CHUN] = '役牌 中';
    this._RUNES[this.Y_DOUBLERIICHI] = '両立直';
    this._RUNES[this.Y_CHIITOITSU] = '七対子';
    this._RUNES[this.Y_CHANTA] = '混全帯幺九';
    this._RUNES[this.Y_ITTSU] = '一気通貫';
    this._RUNES[this.Y_SANSHOKUDOUJUN] = '三色同順';
    this._RUNES[this.Y_SANSHOKUDOUKOU] = '三色同刻';
    this._RUNES[this.Y_SANKANTSU] = '三槓子';
    this._RUNES[this.Y_TOITOI] = '対々和';
    this._RUNES[this.Y_SANANKOU] = '三暗刻';
    this._RUNES[this.Y_SHOSANGEN] = '小三元';
    this._RUNES[this.Y_HONROTO] = '混老頭';
    this._RUNES[this.Y_RYANPEIKOU] = '二盃口';
    this._RUNES[this.Y_JUNCHAN] = '純全帯幺九';
    this._RUNES[this.Y_HONITSU] = '混一色';
    this._RUNES[this.Y_CHINITSU] = '清一色';
    this._RUNES[this.Y_RENHOU] = '人和';
    this._RUNES[this.Y_DORA] = 'ドラ';
    this._RUNES[this.Y_URADORA] = '裏ドラ';
    this._RUNES[this.Y_AKADORA] = '赤ドラ';
  }

  private parseToModel(parsedContent: ParsedContent): void {
    this._replayHash = parsedContent.ref;
    let playerMappings: PlayerMapping[] | undefined = undefined;

    if (this.getPlatformId() === PlatformType.PLATFORM_TYPE_MAHJONGSOUL) {
      if (!parsedContent.playerMapping) {
        throw new Error('Tensoul replay format not allowed without player mappings');
      }
      playerMappings = parsedContent.playerMapping;
    }

    if (!parsedContent.log || parsedContent.log.length <= 0) {
      throw new Error('Log is empty');
    }

    this.setTokenUN(parsedContent.name, playerMappings);
    this.setTokenGO({ lobby: this.getLobbyOrDefaultZero(parsedContent) });
    this.setOwari(parsedContent.sc);

    for (const roundLog of parsedContent.log) {
      const roundEndType = this.rawDecode(roundLog[16][0]);

      if (roundEndType === this._RUNES[this.AGARI]) {
        const fromWho = parseInt(roundLog[16][2][1]);
        const who = parseInt(roundLog[16][2][0]);
        const isTsumo = fromWho === who;
        const reachTokens = this.calculateTokensReach(roundLog, isTsumo, fromWho);
        const playersInfo = this.calculateRoundPlayersInfo(roundLog);
        const agariElementsCount = roundLog[16].length;

        if (agariElementsCount === 3) {
          this._rounds.push({
            type: this.AGARI,
            token: this.calculateTokenAgari(roundLog[16][2], roundLog[16][1], playersInfo),
            reach_tokens: reachTokens,
          });
        } else {
          const agariRoundTokens: TokenAgari[] = [];
          let offset = 0;
          const agariRecordsCount = (agariElementsCount - 1) / 2;

          for (let i = 0; i < agariRecordsCount; i++) {
            agariRoundTokens.push(
              this.calculateTokenAgari(
                roundLog[16][offset + 2],
                roundLog[16][offset + 1],
                playersInfo
              )
            );
            offset = offset + 2;
          }

          this._rounds.push({
            type: this.MULTI_AGARI,
            tokens: agariRoundTokens,
            reach_tokens: reachTokens,
          });
        }
      } else if (roundEndType === this._RUNES[this.RYUUKYOKU]) {
        const reachTokens = this.calculateTokensReach(roundLog);
        this._rounds.push({
          type: this.RYUUKYOKU,
          token: this.calculateTokenRyuukyoku(roundLog),
          reach_tokens: reachTokens,
        });
      } else if (
        roundEndType === this._RUNES[this.RYUUKYOKU_NO_SCORES_ALL_TEMPAI] ||
        roundEndType === this._RUNES[this.RYUUKYOKU_NO_SCORES_ALL_NOTEN]
      ) {
        const reachTokens = this.calculateTokensReach(roundLog);
        this._rounds.push({
          type: this.RYUUKYOKU,
          token: this.calculateTokenRyuukyoku(roundLog, 'no_scores', undefined, roundEndType),
          reach_tokens: reachTokens,
        });
      } else if (roundEndType === this._RUNES[this.NAGASHI_MANGAN]) {
        const reachTokens = this.calculateTokensReach(roundLog);
        this._rounds.push({
          type: this.RYUUKYOKU,
          token: this.calculateTokenRyuukyoku(roundLog, 'nm'),
          reach_tokens: reachTokens,
        });
      } else if (
        roundEndType === this._RUNES[this.FOUR_KAN_ABORTTION] ||
        roundEndType === this._RUNES[this.FOUR_KAN_ABORTTION_ALT]
      ) {
        const reachTokens = this.calculateTokensReach(roundLog);
        this._rounds.push({
          type: this.RYUUKYOKU,
          token: this.calculateTokenRyuukyoku(roundLog, 'abort', 'kan4'),
          reach_tokens: reachTokens,
        });
      } else if (
        roundEndType === this._RUNES[this.THREE_RON_ABORTION] ||
        roundEndType === this._RUNES[this.THREE_RON_ABORTION_ALT]
      ) {
        const reachTokens = this.calculateTokensReach(roundLog);
        this._rounds.push({
          type: this.RYUUKYOKU,
          token: this.calculateTokenRyuukyoku(roundLog, 'abort', 'ron3'),
          reach_tokens: reachTokens,
        });
      } else if (roundEndType === this._RUNES[this.NINE_TERMINAL_ABORTION]) {
        const reachTokens = this.calculateTokensReach(roundLog);
        this._rounds.push({
          type: this.RYUUKYOKU,
          token: this.calculateTokenRyuukyoku(roundLog, 'abort', 'yao9'),
          reach_tokens: reachTokens,
        });
      } else if (roundEndType === this._RUNES[this.FOUR_WIND_ABORTION]) {
        const reachTokens = this.calculateTokensReach(roundLog);
        this._rounds.push({
          type: this.RYUUKYOKU,
          token: this.calculateTokenRyuukyoku(roundLog, 'abort', 'kaze4'),
          reach_tokens: reachTokens,
        });
      } else if (roundEndType === this._RUNES[this.FOUR_RIICHI_ABORTION]) {
        const reachTokens = this.calculateTokensReach(roundLog);
        this._rounds.push({
          type: this.RYUUKYOKU,
          token: this.calculateTokenRyuukyoku(roundLog, 'abort', 'reach4'),
          reach_tokens: reachTokens,
        });
      }
    }
  }

  private getLobbyOrDefaultZero(parsedContent: ParsedContent): string {
    if (parsedContent.lobby !== undefined) {
      return String(parsedContent.lobby);
    }
    return '0';
  }

  private calculateTokensReach(roundLog: any[], isTsumo?: boolean, fromWho?: number): ReachToken[] {
    const reachTokens: ReachToken[] = [];

    // player1
    let [, , riichiCount] = this.tenhouRiiqi(roundLog[6], 0, fromWho, isTsumo);
    if (riichiCount > 0) {
      reachTokens.push({ who: 0 });
    }

    // player2
    [, , riichiCount] = this.tenhouRiiqi(roundLog[9], 1, fromWho, isTsumo);
    if (riichiCount > 0) {
      reachTokens.push({ who: 1 });
    }

    // player3
    [, , riichiCount] = this.tenhouRiiqi(roundLog[12], 2, fromWho, isTsumo);
    if (riichiCount > 0) {
      reachTokens.push({ who: 2 });
    }

    // player4
    [, , riichiCount] = this.tenhouRiiqi(roundLog[15], 3, fromWho, isTsumo);
    if (riichiCount > 0) {
      reachTokens.push({ who: 3 });
    }

    return reachTokens;
  }

  private calculateTokenRyuukyoku(
    roundLog: any[],
    type?: string,
    abortType?: string,
    roundEndType?: string
  ): TokenRyuukyoku {
    let calculatedType: string | null = null;
    let sc: string[] = ['0', '0', '0', '0'];
    let hai0 = false;
    let hai1 = false;
    let hai2 = false;
    let hai3 = false;

    if (type && type !== 'no_scores') {
      calculatedType = type;
      if (calculatedType === 'abort' && abortType) {
        calculatedType = abortType;
      }
    }

    const isNormalRyuukyoku = !type;

    if (isNormalRyuukyoku || (type && type !== 'no_scores' && type !== 'abort')) {
      sc = roundLog[16][1].map((n: any) => String(n));

      // nagashi not provide tempai
      if (isNormalRyuukyoku || type !== 'nm') {
        const score0 = parseInt(sc[0]);
        const score1 = parseInt(sc[1]);
        const score2 = parseInt(sc[2]);
        const score3 = parseInt(sc[3]);

        hai0 = score0 > 0;
        hai1 = score1 > 0;
        hai2 = score2 > 0;
        hai3 = score3 > 0;

        // all tempai
        if (score0 === 0 && score1 === 0 && score2 === 0 && score3 === 0) {
          hai0 = true;
          hai1 = true;
          hai2 = true;
          hai3 = true;
        }
      }
    }

    if (roundEndType && roundEndType === this._RUNES[this.RYUUKYOKU_NO_SCORES_ALL_TEMPAI]) {
      hai0 = true;
      hai1 = true;
      hai2 = true;
      hai3 = true;
    }

    return {
      type: calculatedType ?? undefined,
      sc,
      hai0,
      hai1,
      hai2,
      hai3,
    };
  }

  private calculateRoundPlayersInfo(roundLog: any[]): PlayerInfo[] {
    // player1
    let [chiiCount, ponCount, kanCount] = this.tenhouFuro(roundLog[5]);
    const player1IsOpenHand = chiiCount > 0 || ponCount > 0 || kanCount > 0;

    // player2
    [chiiCount, ponCount, kanCount] = this.tenhouFuro(roundLog[8]);
    const player2IsOpenHand = chiiCount > 0 || ponCount > 0 || kanCount > 0;

    // player3
    [chiiCount, ponCount, kanCount] = this.tenhouFuro(roundLog[11]);
    const player3IsOpenHand = chiiCount > 0 || ponCount > 0 || kanCount > 0;

    // player4
    [chiiCount, ponCount, kanCount] = this.tenhouFuro(roundLog[14]);
    const player4IsOpenHand = chiiCount > 0 || ponCount > 0 || kanCount > 0;

    return [
      { is_open_hand: player1IsOpenHand },
      { is_open_hand: player2IsOpenHand },
      { is_open_hand: player3IsOpenHand },
      { is_open_hand: player4IsOpenHand },
    ];
  }

  private calculateTokenAgari(
    roundAgariLog: any[],
    roundAgariScores: any[],
    playersInfo: PlayerInfo[]
  ): TokenAgari {
    let paoWho = -1;
    let isPaoApplied = false;
    let isMangan = false;
    let fu = 20;
    let yakuList: number[] = [];
    let yakumanList: number[] = [];
    const finalScoreRow = this.rawDecode(roundAgariLog[3]);

    // if yakuman happened
    if (finalScoreRow.includes(this._RUNES[this.YAKUMAN])) {
      yakumanList = this.resolveYakumanList(roundAgariLog);

      let possibleRonPaoApplied = false;
      let fromWhoCount = 0;
      let noPointsDeltaCount = 0;
      const isTsumo =
        finalScoreRow.includes('-') || finalScoreRow.includes(this._RUNES[this.POINTS_FOR_ALL]);

      for (let i = 0; i < 4; i++) {
        if (parseInt(roundAgariScores[i]) === 0) {
          if (!isTsumo) {
            possibleRonPaoApplied = true;
          }
          noPointsDeltaCount++;
        }

        if (parseInt(roundAgariScores[i]) < 0) {
          fromWhoCount++;
        }
      }

      if (isTsumo && noPointsDeltaCount > 0) {
        isPaoApplied = true;
      }

      if (possibleRonPaoApplied && fromWhoCount > 1) {
        isPaoApplied = true;
      }
    } else {
      if (finalScoreRow.includes(this._RUNES[this.MANGAN])) {
        isMangan = true;
      }
      yakuList = this.resolveYakuList(roundAgariLog);
      if (finalScoreRow.includes(this._RUNES[this.FU])) {
        const fuRunePosition = finalScoreRow.indexOf(this._RUNES[this.FU]);
        if (fuRunePosition >= 0) {
          fu = parseInt(finalScoreRow.substring(0, fuRunePosition));
        }
      }
    }

    if (isPaoApplied) {
      paoWho = roundAgariLog[2];
    }

    const isAgariWithOpenHand = playersInfo[roundAgariLog[0]].is_open_hand;

    return {
      who: roundAgariLog[0],
      fromWho: roundAgariLog[1],
      isPao: isPaoApplied,
      paoWho,
      openHand: isAgariWithOpenHand,
      fu,
      yaku: yakuList.map((n) => String(n)),
      yakuman: yakumanList.map((n) => String(n)),
      sc: roundAgariScores.map((n: any) => String(n)),
      isMangan,
    };
  }

  private resolveYakuList(agariRow: any[]): number[] {
    const yakuList: number[] = [];
    for (let i = 4; i < agariRow.length; i++) {
      const currentYakuCode = this.resolveYakuFromString(agariRow[i]);
      if (currentYakuCode !== -1) {
        yakuList.push(currentYakuCode);
        yakuList.push(this.resolveYakuHanFromString(agariRow[i]));
      }
    }
    return yakuList;
  }

  private resolveYakumanList(agariRow: any[]): number[] {
    const yakumanList: number[] = [];
    for (let i = 4; i < agariRow.length; i++) {
      const currentYakumanCode = this.resolveYakumanFromString(agariRow[i]);
      if (currentYakumanCode !== -1) {
        yakumanList.push(currentYakumanCode);
      }
    }
    return yakumanList;
  }

  private resolveYakuHanFromString(yakuString: string): number {
    let han = 0;
    const rawYakuString = this.rawDecode(yakuString);
    if (rawYakuString.includes(this._RUNES[this.HAN])) {
      const from = rawYakuString.indexOf('(');
      const to = rawYakuString.indexOf(this._RUNES[this.HAN]);
      han = parseInt(rawYakuString.substring(from + 1, to));
    }
    return han;
  }

  private resolveYakuFromString(yakuString: string): number {
    let yakuCode = -1;
    const rawYakuString = this.rawDecode(yakuString);

    if (rawYakuString.includes(this._RUNES[this.Y_MENZENTSUMO])) yakuCode = 0;
    if (rawYakuString.includes(this._RUNES[this.Y_RIICHI])) yakuCode = 1;
    if (rawYakuString.includes(this._RUNES[this.Y_IPPATSU])) yakuCode = 2;
    if (rawYakuString.includes(this._RUNES[this.Y_CHANKAN])) yakuCode = 3;
    if (rawYakuString.includes(this._RUNES[this.Y_RINSHANKAIHOU])) yakuCode = 4;
    if (rawYakuString.includes(this._RUNES[this.Y_HAITEI])) yakuCode = 5;
    if (rawYakuString.includes(this._RUNES[this.Y_HOUTEI])) yakuCode = 6;
    if (rawYakuString.includes(this._RUNES[this.Y_PINFU])) yakuCode = 7;
    if (rawYakuString.includes(this._RUNES[this.Y_TANYAO])) yakuCode = 8;
    if (rawYakuString.includes(this._RUNES[this.Y_IIPEIKOU])) yakuCode = 9;
    if (rawYakuString.includes(this._RUNES[this.Y_TON_PLACE])) yakuCode = 10;
    if (rawYakuString.includes(this._RUNES[this.Y_NAN_PLACE])) yakuCode = 11;
    if (rawYakuString.includes(this._RUNES[this.Y_SHA_PLACE])) yakuCode = 12;
    if (rawYakuString.includes(this._RUNES[this.Y_PEI_PLACE])) yakuCode = 13;
    if (rawYakuString.includes(this._RUNES[this.Y_TON_ROUND])) yakuCode = 14;
    if (rawYakuString.includes(this._RUNES[this.Y_NAN_ROUND])) yakuCode = 15;
    if (rawYakuString.includes(this._RUNES[this.Y_SHA_ROUND])) yakuCode = 16;
    if (rawYakuString.includes(this._RUNES[this.Y_PEI_ROUND])) yakuCode = 17;
    if (rawYakuString.includes(this._RUNES[this.Y_HAKU])) yakuCode = 18;
    if (rawYakuString.includes(this._RUNES[this.Y_HATSU])) yakuCode = 19;
    if (rawYakuString.includes(this._RUNES[this.Y_CHUN])) yakuCode = 20;
    if (rawYakuString.includes(this._RUNES[this.Y_DOUBLERIICHI])) yakuCode = 21;
    if (rawYakuString.includes(this._RUNES[this.Y_CHIITOITSU])) yakuCode = 22;
    if (rawYakuString.includes(this._RUNES[this.Y_CHANTA])) yakuCode = 23;
    if (rawYakuString.includes(this._RUNES[this.Y_ITTSU])) yakuCode = 24;
    if (rawYakuString.includes(this._RUNES[this.Y_SANSHOKUDOUJUN])) yakuCode = 25;
    if (rawYakuString.includes(this._RUNES[this.Y_SANSHOKUDOUKOU])) yakuCode = 26;
    if (rawYakuString.includes(this._RUNES[this.Y_SANKANTSU])) yakuCode = 27;
    if (rawYakuString.includes(this._RUNES[this.Y_TOITOI])) yakuCode = 28;
    if (rawYakuString.includes(this._RUNES[this.Y_SANANKOU])) yakuCode = 29;
    if (rawYakuString.includes(this._RUNES[this.Y_SHOSANGEN])) yakuCode = 30;
    if (rawYakuString.includes(this._RUNES[this.Y_HONROTO])) yakuCode = 31;
    if (rawYakuString.includes(this._RUNES[this.Y_RYANPEIKOU])) yakuCode = 32;
    if (rawYakuString.includes(this._RUNES[this.Y_JUNCHAN])) yakuCode = 33;
    if (rawYakuString.includes(this._RUNES[this.Y_HONITSU])) yakuCode = 34;
    if (rawYakuString.includes(this._RUNES[this.Y_CHINITSU])) yakuCode = 35;
    if (rawYakuString.includes(this._RUNES[this.Y_RENHOU])) yakuCode = 36;
    if (rawYakuString.includes(this._RUNES[this.Y_DORA])) yakuCode = 52;
    if (rawYakuString.includes(this._RUNES[this.Y_URADORA])) yakuCode = 53;
    if (rawYakuString.includes(this._RUNES[this.Y_AKADORA])) yakuCode = 54;

    return yakuCode;
  }

  private resolveYakumanFromString(yakumanString: string): number {
    let yakumanCode = -1;
    const rawYakumanString = this.rawDecode(yakumanString);

    if (rawYakumanString.includes(this._RUNES[this.Y_TENHOU])) yakumanCode = 37;
    if (rawYakumanString.includes(this._RUNES[this.Y_CHIHOU])) yakumanCode = 38;
    if (rawYakumanString.includes(this._RUNES[this.Y_DAISANGEN])) yakumanCode = 39;
    if (rawYakumanString.includes(this._RUNES[this.Y_SUUANKOU])) yakumanCode = 40;
    if (rawYakumanString.includes(this._RUNES[this.Y_SUUANKOU_TANKI])) yakumanCode = 41;
    if (rawYakumanString.includes(this._RUNES[this.Y_TSUUIISOU])) yakumanCode = 42;
    if (rawYakumanString.includes(this._RUNES[this.Y_RYUUIISOU])) yakumanCode = 43;
    if (rawYakumanString.includes(this._RUNES[this.Y_CHINROTO])) yakumanCode = 44;
    if (rawYakumanString.includes(this._RUNES[this.Y_CHUURENPOUTO])) yakumanCode = 45;
    if (rawYakumanString.includes(this._RUNES[this.Y_CHUURENPOUTO_9])) yakumanCode = 46;
    if (rawYakumanString.includes(this._RUNES[this.Y_KOKUSHIMUSOU])) yakumanCode = 47;
    if (rawYakumanString.includes(this._RUNES[this.Y_KOKUSHIMUSOU_13])) yakumanCode = 48;
    if (rawYakumanString.includes(this._RUNES[this.Y_DAISUUSHII])) yakumanCode = 49;
    if (rawYakumanString.includes(this._RUNES[this.Y_SHOSUUSHII])) yakumanCode = 50;
    if (rawYakumanString.includes(this._RUNES[this.Y_SUUKANTSU])) yakumanCode = 51;

    return yakumanCode;
  }

  private tenhouFuro(playerRound: any[]): [number, number, number] {
    let chiiCount = 0;
    let ponCount = 0;
    let kanCount = 0;

    for (const round of playerRound) {
      if (typeof round === 'string') {
        if (round.includes('c')) chiiCount++;
        if (round.includes('p')) ponCount++;
        if (round.includes('m')) kanCount++;
      }
    }

    return [chiiCount, ponCount, kanCount];
  }

  private tenhouRiiqi(
    playerRound: any[],
    currentWho: number,
    fromWho?: number,
    isTsumo?: boolean
  ): [number, number, number] {
    let kakanCount = 0;
    let ankanCount = 0;
    let riichiCount = 0;
    const lastIndex = playerRound.length - 1;

    for (let i = 0; i <= lastIndex; i++) {
      if (typeof playerRound[i] === 'string') {
        if (playerRound[i].includes('r')) {
          if (fromWho !== undefined) {
            // emulate step="2" from XML reach tag, if last action is reach and not ron from this player
            if (!isTsumo && i === lastIndex && currentWho !== fromWho) {
              riichiCount++;
            }
            if (isTsumo || i !== lastIndex) {
              riichiCount++;
            }
          } else {
            riichiCount++;
          }
        }
        if (playerRound[i].includes('k')) kakanCount++;
        if (playerRound[i].includes('a')) ankanCount++;
      }
    }

    return [kakanCount, ankanCount, riichiCount];
  }

  private rawDecode(str: string): string {
    return decodeURIComponent(str);
  }

  public setTokenUN(tokenUN: string[], playerMapping?: PlayerMapping[]): void {
    if (this.getPlatformId() === PlatformType.PLATFORM_TYPE_MAHJONGSOUL) {
      this._tokenUN = [];
      if (playerMapping) {
        for (const playerItem of playerMapping) {
          this._tokenUN.push({
            player_name: this.rawDecode(playerItem.nickname),
            account_id: +playerItem.account_id || undefined,
          });
        }
      }
    } else {
      this._tokenUN = [];
      for (const playerName of tokenUN) {
        this._tokenUN.push({ player_name: this.rawDecode(playerName) });
      }
    }
  }

  public getTokenUN(): TokenUN[] {
    return this._tokenUN;
  }

  public getTokenGO(): TokenGO {
    return this._tokenGO;
  }

  public setTokenGO(tokenGO: TokenGO): void {
    this._tokenGO = tokenGO;
  }

  public getOwari(): number[] {
    return this.owari;
  }

  public setOwari(owari: number[]): void {
    this.owari = owari;
  }

  public getRounds(): Round[] {
    return this._rounds;
  }

  public getPlatformId(): PlatformType {
    return this._platformId;
  }

  public getReplayHash(): string {
    return this._replayHash;
  }
}
