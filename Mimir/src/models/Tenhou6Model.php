<?php
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

namespace Mimir;

/**
 * @Author Steven Vch. <unstatik@staremax.com>
 */
class Tenhou6Model
{
    /**
     * @var int $_platformId
     */
    private int $_platformId;

    /**
     * array names ['name1', 'name2', 'name3', 'name4']
     */
    /**
     * @var array $_tokenUN
     */
    private array $_tokenUN;

    /**
     * @var array $_tokenGO
     */
    private array $_tokenGO;

    /**
     * @var array $owari
     */
    private array $owari;

    /**
     * @var array $_rounds
     */
    private array $_rounds = [];

    /**
     * @var string $_replayHash
     */
    private string $_replayHash;

    /**
     * @var string $AGARI
     */
    private string $AGARI = "AGARI";

    /**
     * @var string $MULTI_AGARI
     */
    private string $MULTI_AGARI = "MULTI_AGARI";

    /**
     * @var string $RYUUKYOKU
     */
    private string $RYUUKYOKU = "RYUUKYOKU";

    /**
     * @var string $RYUUKYOKU_NO_SCORES_ALL_TEMPAI
     */
    private string $RYUUKYOKU_NO_SCORES_ALL_TEMPAI = "RYUUKYOKU_NO_SCORES_ALL_TEMPAI";

    /**
     * @var string $RYUUKYOKU_NO_SCORES_ALL_NOTEN
     */
    private string $RYUUKYOKU_NO_SCORES_ALL_NOTEN = "RYUUKYOKU_NO_SCORES_ALL_NOTEN";

    /**
     * @var string $YAKUMAN
     */
    private string $YAKUMAN = "YAKUMAN";

    /**
     * @var string $MANGAN
     */
    private string $MANGAN = "MANGAN";

    /**
     * @var string $NAGASHI_MANGAN
     */
    private string $NAGASHI_MANGAN = "NAGASHI_MANGAN";

    /**
     * @var string $FOUR_KAN_ABORTTION
     */
    private string $FOUR_KAN_ABORTTION = "FOUR_KAN_ABORTTION";

    /**
     * @var string $FOUR_KAN_ABORTTION_ALT
     */
    private string $FOUR_KAN_ABORTTION_ALT = "FOUR_KAN_ABORTTION_ALT";

    /**
     * @var string $THREE_RON_ABORTION
     */
    private string $THREE_RON_ABORTION = "THREE_RON_ABORTION";

    /**
     * @var string $THREE_RON_ABORTION_ALT
     */
    private string $THREE_RON_ABORTION_ALT = "THREE_RON_ABORTION_ALT";

    /**
     * @var string $NINE_TERMINAL_ABORTION
     */
    private string $NINE_TERMINAL_ABORTION = "NINE_TERMINAL_ABORTION";

    /**
     * @var string $FOUR_WIND_ABORTION
     */
    private string $FOUR_WIND_ABORTION = "FOUR_WIND_ABORTION";

    /**
     * @var string $FOUR_RIICHI_ABORTION
     */
    private string $FOUR_RIICHI_ABORTION = "FOUR_RIICHI_ABORTION";

    /**
     * @var string $POINTS_FOR_ALL
     */
    private string $POINTS_FOR_ALL = "POINTS_FOR_ALL";

    /**
     * @var string $FU
     */
    private string $FU = "FU";

    /**
     * @var string $HAN
     */
    private string $HAN = "HAN";

    /**
     * @var string $Y_TENHOU
     */
    private string $Y_TENHOU = "Y_TENHOU";

    /**
     * @var string $Y_CHIHOU
     */
    private string $Y_CHIHOU = "Y_CHIHOU";

    /**
     * @var string $Y_DAISANGEN
     */
    private string $Y_DAISANGEN = "Y_DAISANGEN";

    /**
     * @var string $Y_SUUANKOU
     */
    private string $Y_SUUANKOU = "Y_SUUANKOU";

    /**
     * @var string $Y_SUUANKOU_TANKI
     */
    private string $Y_SUUANKOU_TANKI = "Y_SUUANKOU_TANKI";

    /**
     * @var string $Y_TSUUIISOU
     */
    private string $Y_TSUUIISOU = "Y_TSUUIISOU";

    /**
     * @var string $Y_RYUUIISOU
     */
    private string $Y_RYUUIISOU = "Y_RYUUIISOU";

    /**
     * @var string $Y_CHINROTO
     */
    private string $Y_CHINROTO = "Y_CHINROTO";

    /**
     * @var string $Y_CHUURENPOUTO
     */
    private string $Y_CHUURENPOUTO = "Y_CHUURENPOUTO";

    /**
     * @var string $Y_CHUURENPOUTO_9
     */
    private string $Y_CHUURENPOUTO_9 = "Y_CHUURENPOUTO_9";

    /**
     * @var string $Y_KOKUSHIMUSOU
     */
    private string $Y_KOKUSHIMUSOU = "Y_KOKUSHIMUSOU";

    /**
     * @var string $Y_KOKUSHIMUSOU_13
     */
    private string $Y_KOKUSHIMUSOU_13 = "Y_KOKUSHIMUSOU_13";

    /**
     * @var string $Y_DAISUUSHII
     */
    private string $Y_DAISUUSHII = "Y_DAISUUSHII";

    /**
     * @var string $Y_SHOSUUSHII
     */
    private string $Y_SHOSUUSHII = "Y_SHOSUUSHII";

    /**
     * @var string $Y_SUUKANTSU
     */
    private string $Y_SUUKANTSU = "Y_SUUKANTSU";

    /**
     * @var string $Y_MENZENTSUMO
     */
    private string $Y_MENZENTSUMO = "Y_MENZENTSUMO";

    /**
     * @var string $Y_RIICHI
     */
    private string $Y_RIICHI = "Y_RIICHI";

    /**
     * @var string $Y_IPPATSU
     */
    private string $Y_IPPATSU = "Y_IPPATSU";

    /**
     * @var string $Y_CHANKAN
     */
    private string $Y_CHANKAN = "Y_CHANKAN";

    /**
     * @var string $Y_RINSHANKAIHOU
     */
    private string $Y_RINSHANKAIHOU = "Y_RINSHANKAIHOU";

    /**
     * @var string $Y_HAITEI
     */
    private string $Y_HAITEI = "Y_HAITEI";

    /**
     * @var string $Y_HOUTEI
     */
    private string $Y_HOUTEI = "Y_HOUTEI";

    /**
     * @var string $Y_PINFU
     */
    private string $Y_PINFU = "Y_PINFU";

    /**
     * @var string $Y_TANYAO
     */
    private string $Y_TANYAO = "Y_TANYAO";

    /**
     * @var string $Y_IIPEIKOU
     */
    private string $Y_IIPEIKOU = "Y_IIPEIKOU";

    /**
     * @var string $Y_TON_PLACE
     */
    private string $Y_TON_PLACE = "Y_TON_PLACE";

    /**
     * @var string $Y_NAN_PLACE
     */
    private string $Y_NAN_PLACE = "Y_NAN_PLACE";

    /**
     * @var string $Y_SHA_PLACE
     */
    private string $Y_SHA_PLACE = "Y_SHA_PLACE";

    /**
     * @var string $Y_PEI_PLACE
     */
    private string $Y_PEI_PLACE = "Y_PEI_PLACE";

    /**
     * @var string $Y_TON_ROUND
     */
    private string $Y_TON_ROUND = "Y_TON_ROUND";

    /**
     * @var string $Y_NAN_ROUND
     */
    private string $Y_NAN_ROUND = "Y_NAN_ROUND";

    /**
     * @var string $Y_SHA_ROUND
     */
    private string $Y_SHA_ROUND = "Y_SHA_ROUND";

    /**
     * @var string $Y_PEI_ROUND
     */
    private string $Y_PEI_ROUND = "Y_PEI_ROUND";

    /**
     * @var string $Y_HAKU
     */
    private string $Y_HAKU = "Y_HAKU";

    /**
     * @var string $Y_HATSU
     */
    private string $Y_HATSU = "Y_HATSU";

    /**
     * @var string $Y_CHUN
     */
    private string $Y_CHUN = "Y_CHUN";

    /**
     * @var string $Y_DOUBLERIICHI
     */
    private string $Y_DOUBLERIICHI = "Y_DOUBLERIICHI";

    /**
     * @var string $Y_CHIITOITSU
     */
    private string $Y_CHIITOITSU = "Y_CHIITOITSU";

    /**
     * @var string $Y_CHANTA
     */
    private string $Y_CHANTA = "Y_CHANTA";

    /**
     * @var string $Y_ITTSU
     */
    private string $Y_ITTSU = "Y_ITTSU";

    /**
     * @var string $Y_SANSHOKUDOUJUN
     */
    private string $Y_SANSHOKUDOUJUN = "Y_SANSHOKUDOUJUN";

    /**
     * @var string $Y_SANSHOKUDOUKOU
     */
    private string $Y_SANSHOKUDOUKOU = "Y_SANSHOKUDOUKOU";

    /**
     * @var string $Y_SANKANTSU
     */
    private string $Y_SANKANTSU = "Y_SANKANTSU";

    /**
     * @var string $Y_TOITOI
     */
    private string $Y_TOITOI = "Y_TOITOI";

    /**
     * @var string $Y_SANANKOU
     */
    private string $Y_SANANKOU = "Y_SANANKOU";

    /**
     * @var string $Y_SHOSANGEN
     */
    private string $Y_SHOSANGEN = "Y_SHOSANGEN";

    /**
     * @var string $Y_HONROTO
     */
    private string $Y_HONROTO = "Y_HONROTO";

    /**
     * @var string $Y_RYANPEIKOU
     */
    private string $Y_RYANPEIKOU = "Y_RYANPEIKOU";

    /**
     * @var string $Y_JUNCHAN
     */
    private string $Y_JUNCHAN = "Y_JUNCHAN";

    /**
     * @var string $Y_HONITSU
     */
    private string $Y_HONITSU = "Y_HONITSU";

    /**
     * @var string $Y_CHINITSU
     */
    private string $Y_CHINITSU = "Y_CHINITSU";

    /**
     * @var string $Y_RENHOU
     */
    private string $Y_RENHOU = "Y_RENHOU";

    /**
     * @var string $Y_DORA
     */
    private string $Y_DORA = "Y_DORA";

    /**
     * @var string $Y_URADORA
     */
    private string $Y_URADORA = "Y_URADORA";

    /**
     * @var string $Y_AKADORA
     */
    private string $Y_AKADORA = "Y_AKADORA";

    /**
     * @var array $_RUNES
     */
    private array $_RUNES = [];

    public function __construct(string $tenhou6JsonContent, int $platformId)
    {
        $this->_platformId = $platformId;
        $this->initRunes();
        $parsedContent = json_decode($tenhou6JsonContent);
        $this->parseToModel($parsedContent);
    }

    private function initRunes(): void
    {
        $this->_RUNES[$this->AGARI] = "和了";
        $this->_RUNES[$this->RYUUKYOKU] = "流局";
        $this->_RUNES[$this->RYUUKYOKU_NO_SCORES_ALL_TEMPAI] = "全員聴牌";
        $this->_RUNES[$this->FOUR_KAN_ABORTTION] = "四開槓";
        $this->_RUNES[$this->THREE_RON_ABORTION] = "三家和";
        $this->_RUNES[$this->RYUUKYOKU_NO_SCORES_ALL_NOTEN] = "全員不聴";
        $this->_RUNES[$this->FOUR_KAN_ABORTTION_ALT] = "四槓散了";
        $this->_RUNES[$this->THREE_RON_ABORTION_ALT] = "三家和了";
        $this->_RUNES[$this->NINE_TERMINAL_ABORTION] = "九種九牌";
        $this->_RUNES[$this->FOUR_WIND_ABORTION] = "四風連打";
        $this->_RUNES[$this->FOUR_RIICHI_ABORTION] = "四家立直";
        $this->_RUNES[$this->YAKUMAN] = "役満";
        $this->_RUNES[$this->MANGAN] = "満貫";
        $this->_RUNES[$this->NAGASHI_MANGAN] = "流し満貫";
        $this->_RUNES[$this->POINTS_FOR_ALL] = "点∀";
        $this->_RUNES[$this->FU] = "符";
        $this->_RUNES[$this->HAN] = "飜";
        $this->_RUNES[$this->Y_TENHOU] = "天和";
        $this->_RUNES[$this->Y_CHIHOU] = "地和";
        $this->_RUNES[$this->Y_DAISANGEN] = "大三元";
        $this->_RUNES[$this->Y_SUUANKOU] = "四暗刻";
        $this->_RUNES[$this->Y_SUUANKOU_TANKI] = "四暗刻単騎";
        $this->_RUNES[$this->Y_TSUUIISOU] = "字一色";
        $this->_RUNES[$this->Y_RYUUIISOU] = "緑一色";
        $this->_RUNES[$this->Y_CHINROTO] = "清老頭";
        $this->_RUNES[$this->Y_CHUURENPOUTO] = "九蓮宝燈";
        $this->_RUNES[$this->Y_CHUURENPOUTO_9] = "純正九蓮宝燈";
        $this->_RUNES[$this->Y_KOKUSHIMUSOU] = "国士無双";
        $this->_RUNES[$this->Y_KOKUSHIMUSOU_13] = "国士無双１３面";
        $this->_RUNES[$this->Y_DAISUUSHII] = "大四喜";
        $this->_RUNES[$this->Y_SHOSUUSHII] = "小四喜";
        $this->_RUNES[$this->Y_SUUKANTSU] = "四槓子";
        $this->_RUNES[$this->Y_MENZENTSUMO] = "門前清自摸和";
        $this->_RUNES[$this->Y_RIICHI] = "立直";
        $this->_RUNES[$this->Y_IPPATSU] = "一発";
        $this->_RUNES[$this->Y_CHANKAN] = "槍槓";
        $this->_RUNES[$this->Y_RINSHANKAIHOU] = "嶺上開花";
        $this->_RUNES[$this->Y_HAITEI] = "海底摸月";
        $this->_RUNES[$this->Y_HOUTEI] = "河底撈魚";
        $this->_RUNES[$this->Y_PINFU] = "平和";
        $this->_RUNES[$this->Y_TANYAO] = "断幺九";
        $this->_RUNES[$this->Y_IIPEIKOU] = "一盃口";
        $this->_RUNES[$this->Y_TON_PLACE] = "自風 東";
        $this->_RUNES[$this->Y_NAN_PLACE] = "自風 南";
        $this->_RUNES[$this->Y_SHA_PLACE] = "自風 西";
        $this->_RUNES[$this->Y_PEI_PLACE] = "自風 北";
        $this->_RUNES[$this->Y_TON_ROUND] = "場風 東";
        $this->_RUNES[$this->Y_NAN_ROUND] = "場風 南";
        $this->_RUNES[$this->Y_SHA_ROUND] = "場風 西";
        $this->_RUNES[$this->Y_PEI_ROUND] = "場風 北";
        $this->_RUNES[$this->Y_HAKU] = "役牌 白";
        $this->_RUNES[$this->Y_HATSU] = "役牌 發";
        $this->_RUNES[$this->Y_CHUN] = "役牌 中";
        $this->_RUNES[$this->Y_DOUBLERIICHI] = "両立直";
        $this->_RUNES[$this->Y_CHIITOITSU] = "七対子";
        $this->_RUNES[$this->Y_CHANTA] = "混全帯幺九";
        $this->_RUNES[$this->Y_ITTSU] = "一気通貫";
        $this->_RUNES[$this->Y_SANSHOKUDOUJUN] = "三色同順";
        $this->_RUNES[$this->Y_SANSHOKUDOUKOU] = "三色同刻";
        $this->_RUNES[$this->Y_SANKANTSU] = "三槓子";
        $this->_RUNES[$this->Y_TOITOI] = "対々和";
        $this->_RUNES[$this->Y_SANANKOU] = "三暗刻";
        $this->_RUNES[$this->Y_SHOSANGEN] = "小三元";
        $this->_RUNES[$this->Y_HONROTO] = "混老頭";
        $this->_RUNES[$this->Y_RYANPEIKOU] = "二盃口";
        $this->_RUNES[$this->Y_JUNCHAN] = "純全帯幺九";
        $this->_RUNES[$this->Y_HONITSU] = "混一色";
        $this->_RUNES[$this->Y_CHINITSU] = "清一色";
        $this->_RUNES[$this->Y_RENHOU] = "人和";
        $this->_RUNES[$this->Y_DORA] = "ドラ";
        $this->_RUNES[$this->Y_URADORA] = "裏ドラ";
        $this->_RUNES[$this->Y_AKADORA] = "赤ドラ";
    }

    /**
     * @param \stdClass $parsedContent
     * @return void
     */
    private function parseToModel(\stdClass $parsedContent): void
    {
        $this->_replayHash = $parsedContent->ref;
        $playerMappings = null;
        if ($this->getPlatformId() == PlatformTypeId::Majsoul->value) {
            if (!property_exists($parsedContent, 'playerMapping')) {
                throw new ParseException('Tensoul replay format not allowed without player mappings');
            }
            $playerMappings = $parsedContent->playerMapping;
        }

        if (!property_exists($parsedContent, 'log') || count($parsedContent->log) <= 0) {
            throw new ParseException('Log is empty');
        }

        $this->setTokenUN($parsedContent->name, $playerMappings);
        $this->setTokenGO(['lobby' => $this->getLobbyOrDefaultZero($parsedContent)]);
        $this->setOwari($parsedContent->sc);

        foreach ($parsedContent->log as $roundLog) {
            $roundEndType = $this->rawDecode($roundLog[16][0]);
            if ($roundEndType === $this->_RUNES[$this->AGARI]) {
                $fromWho = intval($roundLog[16][2][1]);
                $who = intval($roundLog[16][2][0]);
                $isTsumo = $fromWho == $who;
                $reachTokens = $this->calculateTokensReach($roundLog, $isTsumo, $fromWho);
                $playersInfo = $this->calculateRoundPlayersInfo($roundLog);
                $agariElementsCount = count($roundLog[16]);
                if ($agariElementsCount === 3) {
                    array_push($this->_rounds, [
                            'type' => $this->AGARI,
                            'token' => $this->calculateTokenAgari($roundLog[16][2], $roundLog[16][1], $playersInfo),
                            'reach_tokens' => $reachTokens
                        ]);
                } else {
                    $agariRoundTokens = [];
                    $offset = 0;
                    $agariRecordsCount = ($agariElementsCount - 1) / 2;
                    for ($i = 0; $i < $agariRecordsCount; $i++) {
                        array_push($agariRoundTokens, $this->calculateTokenAgari($roundLog[16][$offset + 2], $roundLog[16][$offset + 1], $playersInfo));
                        $offset = $offset + 2;
                    }
                    array_push($this->_rounds, [
                            'type' => $this->MULTI_AGARI,
                            'tokens' => $agariRoundTokens,
                            'reach_tokens' => $reachTokens
                        ]);
                }
            } else if ($roundEndType === $this->_RUNES[$this->RYUUKYOKU]) {
                $reachTokens = $this->calculateTokensReach($roundLog);
                array_push($this->_rounds, [
                        'type' => $this->RYUUKYOKU,
                        'token' => $this->calculateTokenRyuukyoku($roundLog),
                        'reach_tokens' => $reachTokens
                    ]);
            } else if ($roundEndType === $this->_RUNES[$this->RYUUKYOKU_NO_SCORES_ALL_TEMPAI] || $roundEndType === $this->_RUNES[$this->RYUUKYOKU_NO_SCORES_ALL_NOTEN]) {
                $reachTokens = $this->calculateTokensReach($roundLog);
                array_push($this->_rounds, [
                        'type' => $this->RYUUKYOKU,
                        'token' => $this->calculateTokenRyuukyoku($roundLog, 'no_scores', null, $roundEndType),
                        'reach_tokens' => $reachTokens
                    ]);
            } else if ($roundEndType === $this->_RUNES[$this->NAGASHI_MANGAN]) {
                $reachTokens = $this->calculateTokensReach($roundLog);
                array_push($this->_rounds, [
                        'type' => $this->RYUUKYOKU,
                        'token' => $this->calculateTokenRyuukyoku($roundLog, 'nm'),
                        'reach_tokens' => $reachTokens
                    ]);
            } else if ($roundEndType === $this->_RUNES[$this->FOUR_KAN_ABORTTION] || $roundEndType === $this->_RUNES[$this->FOUR_KAN_ABORTTION_ALT]) {
                $reachTokens = $this->calculateTokensReach($roundLog);
                array_push($this->_rounds, [
                        'type' => $this->RYUUKYOKU,
                        'token' => $this->calculateTokenRyuukyoku($roundLog, 'abort', 'kan4'),
                        'reach_tokens' => $reachTokens
                    ]);
            } else if ($roundEndType === $this->_RUNES[$this->THREE_RON_ABORTION] || $roundEndType === $this->_RUNES[$this->THREE_RON_ABORTION_ALT]) {
                $reachTokens = $this->calculateTokensReach($roundLog);
                array_push($this->_rounds, [
                        'type' => $this->RYUUKYOKU,
                        'token' => $this->calculateTokenRyuukyoku($roundLog, 'abort', 'ron3'),
                        'reach_tokens' => $reachTokens
                    ]);
            } else if ($roundEndType === $this->_RUNES[$this->NINE_TERMINAL_ABORTION]) {
                $reachTokens = $this->calculateTokensReach($roundLog);
                array_push($this->_rounds, [
                        'type' => $this->RYUUKYOKU,
                        'token' => $this->calculateTokenRyuukyoku($roundLog, 'abort', 'yao9'),
                        'reach_tokens' => $reachTokens
                    ]);
            } else if ($roundEndType === $this->_RUNES[$this->FOUR_WIND_ABORTION]) {
                $reachTokens = $this->calculateTokensReach($roundLog);
                array_push($this->_rounds, [
                        'type' => $this->RYUUKYOKU,
                        'token' => $this->calculateTokenRyuukyoku($roundLog, 'abort', 'kaze4'),
                        'reach_tokens' => $reachTokens
                    ]);
            } else if ($roundEndType === $this->_RUNES[$this->FOUR_RIICHI_ABORTION]) {
                $reachTokens = $this->calculateTokensReach($roundLog);
                array_push($this->_rounds, [
                        'type' => $this->RYUUKYOKU,
                        'token' => $this->calculateTokenRyuukyoku($roundLog, 'abort', 'reach4'),
                        'reach_tokens' => $reachTokens
                    ]);
            }
        }
    }

    /**
     * @param \stdClass $parsedContent
     * @return string resolve lobby or return "0"
     */
    private function getLobbyOrDefaultZero(\stdClass $parsedContent): string
    {
        if (isset($parsedContent->lobby)) {
            return strval($parsedContent->lobby);
        }
        return "0";
    }

    /**
     * @param array $roundLog
     * @param bool $isTsumo
     * @param int $fromWho
     * @return array return tokens with data for _tokenREACH
     */
    private function calculateTokensReach($roundLog, $isTsumo = null, $fromWho = null): array
    {
        $kakanCount = 0;
        $ankanCount = 0;
        $riichiCount = 0;
        $reachTokens = [];

        //player1
        list($kakanCount, $ankanCount, $riichiCount) = $this->tenhouRiiqi($roundLog[6], 0, $fromWho, $isTsumo);
        if ($riichiCount > 0) {
            array_push($reachTokens, ['who' => 0]);
        }

        //player2
        list($kakanCount, $ankanCount, $riichiCount) = $this->tenhouRiiqi($roundLog[9], 1, $fromWho, $isTsumo);
        if ($riichiCount > 0) {
            array_push($reachTokens, ['who' => 1]);
        }

        //player3
        list($kakanCount, $ankanCount, $riichiCount) = $this->tenhouRiiqi($roundLog[12], 2, $fromWho, $isTsumo);
        if ($riichiCount > 0) {
            array_push($reachTokens, ['who' => 2]);
        }

        //player4
        list($kakanCount, $ankanCount, $riichiCount) = $this->tenhouRiiqi($roundLog[15], 3, $fromWho, $isTsumo);
        if ($riichiCount > 0) {
            array_push($reachTokens, ['who' => 3]);
        }

        return $reachTokens;
    }

    /**
     * @param array $roundLog
     * @param string $type
     * @param string $abortType
     * @param string $roundEndType
     * @return array return data for _tokenRYUUKYOKU
     */
    private function calculateTokenRyuukyoku($roundLog, $type = null, $abortType = null, $roundEndType = null): array
    {
        $calculatedType = null;
        $sc = ["0", "0", "0", "0"];
        $hai0 = false;
        $hai1 = false;
        $hai2 = false;
        $hai3 = false;
        if ($type && $type != 'no_scores') {
            $calculatedType = $type;
            if ($calculatedType === 'abort' && $abortType) {
                $calculatedType = $abortType;
            }
        }

        $isNormalRyuukyoku = !isset($type);

        if ($isNormalRyuukyoku || ($type && $type != 'no_scores' && $type != 'abort')) {
            /** @phpstan-ignore-next-line */
            $sc = array_map('self::asString', $roundLog[16][1]);
            //nagashi not provide tempai
            if ($isNormalRyuukyoku || $type != 'nm') {
                $score0 = intval($sc[0]);
                $score1 = intval($sc[1]);
                $score2 = intval($sc[2]);
                $score3 = intval($sc[3]);

                $hai0 = $score0 > 0;
                $hai1 = $score1 > 0;
                $hai2 = $score2 > 0;
                $hai3 = $score3 > 0;

                //all tempai
                if ($score0 === 0 && $score1 === 0 && $score2 === 0 && $score3 === 0) {
                    $hai0 = true;
                    $hai1 = true;
                    $hai2 = true;
                    $hai3 = true;
                }
            }
        }

        if ($roundEndType && $roundEndType === $this->_RUNES[$this->RYUUKYOKU_NO_SCORES_ALL_TEMPAI]) {
            $hai0 = true;
            $hai1 = true;
            $hai2 = true;
            $hai3 = true;
        }

        return [
            'type' => $calculatedType,
            'sc' => $sc,
            'hai0' => $hai0,
            'hai1' => $hai1,
            'hai2' => $hai2,
            'hai3' => $hai3
        ];
    }

    /**
     * @param array $roundLog
     * @return array return info with player's open hands
     */
    private function calculateRoundPlayersInfo($roundLog): array
    {
        //player1
        list($chiiCount, $ponCount, $kanCount) = $this->tenhouFuro($roundLog[5]);
        $player1IsOpenHand = $chiiCount > 0 || $ponCount > 0 || $kanCount > 0;

        //player2
        list($chiiCount, $ponCount, $kanCount) = $this->tenhouFuro($roundLog[8]);
        $player2IsOpenHand = $chiiCount > 0 || $ponCount > 0 || $kanCount > 0;

        //player3
        list($chiiCount, $ponCount, $kanCount) = $this->tenhouFuro($roundLog[11]);
        $player3IsOpenHand = $chiiCount > 0 || $ponCount > 0 || $kanCount > 0;

        //player4
        list($chiiCount, $ponCount, $kanCount) = $this->tenhouFuro($roundLog[14]);
        $player4IsOpenHand = $chiiCount > 0 || $ponCount > 0 || $kanCount > 0;

        return [["is_open_hand" => $player1IsOpenHand],
                ["is_open_hand" => $player2IsOpenHand],
                ["is_open_hand" => $player3IsOpenHand],
                ["is_open_hand" => $player4IsOpenHand]];
    }

    /**
     * @param array $roundAgariLog
     * @param array $roundAgariScores
     * @param array $playersInfo
     * @return array return data for _tokenAGARI
     */
    private function calculateTokenAgari($roundAgariLog, $roundAgariScores, $playersInfo): array
    {
        $paoWho = -1;
        $isPaoApplied = false;
        $isMangan = false;
        $fu = 20;
        $yakuList = [];
        $yakumanList = [];
        $finalScoreRow = $this->rawDecode($roundAgariLog[3]);

        //if yakuman happened
        if (str_contains($finalScoreRow, $this->_RUNES[$this->YAKUMAN])) {
            $yakumanList = $this->resolveYakumanList($roundAgariLog);

            $possibleRonPaoApplied = false;
            $fromWhoCount = 0;
            $noPointsDeltaCount = 0;
            $isTsumo = str_contains($finalScoreRow, "-") || str_contains($finalScoreRow, $this->_RUNES[$this->POINTS_FOR_ALL]);

            for ($i = 0; $i < 4; $i++) {
                if ((int)$roundAgariScores[$i] === 0) {
                    if (!$isTsumo) {
                        $possibleRonPaoApplied = true;
                    }
                    $noPointsDeltaCount++;
                }

                if ((int)$roundAgariScores[$i] < 0) {
                    $fromWhoCount++;
                }
            }

            if ($isTsumo && $noPointsDeltaCount > 0) {
                $isPaoApplied = true;
            }

            if ($possibleRonPaoApplied && $fromWhoCount > 1) {
                $isPaoApplied = true;
            }
        } else {
            if (str_contains($finalScoreRow, $this->_RUNES[$this->MANGAN])) {
                $isMangan = true;
            }
            $yakuList = $this->resolveYakuList($roundAgariLog);
            if (str_contains($finalScoreRow, $this->_RUNES[$this->FU])) {
                $fuRunePosition = strpos($finalScoreRow, $this->_RUNES[$this->FU]);
                if (is_numeric($fuRunePosition)) {
                    $fu = intval(substr($finalScoreRow, 0, $fuRunePosition));
                }
            }
        }

        if ($isPaoApplied) {
            $paoWho = $roundAgariLog[2];
        }

        $isAgariWithOpenHand = $playersInfo[$roundAgariLog[0]]["is_open_hand"];

        return [
            "who" => $roundAgariLog[0],
            "fromWho" => $roundAgariLog[1],
            "isPao" => $isPaoApplied,
            "paoWho" => $paoWho,
            "openHand" => $isAgariWithOpenHand,
            "fu" => $fu,
            /** @phpstan-ignore-next-line */
            "yaku" => array_map('self::asString', $yakuList),
            /** @phpstan-ignore-next-line */
            "yakuman" => array_map('self::asString', $yakumanList),
            /** @phpstan-ignore-next-line */
            "sc" => array_map('self::asString', $roundAgariScores),
            "isMangan" => $isMangan
        ];
    }

    /**
     * @return array return data for _tokenGO
     */
    public function getTokenGO(): array
    {
        return $this->_tokenGO;
    }

    /**
     * @param array $tokenGO
     * @return void
     */
    public function setTokenGO($tokenGO): void
    {
        $this->_tokenGO = $tokenGO;
    }

    /**
     * @return array
     */
    public function getOwari(): array
    {
        return $this->owari;
    }

    /**
     * @param array $owari
     * @return void
     */
    public function setOwari($owari): void
    {
        $this->owari = $owari;
    }

    /**
     * @param int $n
     * @return string
     */
    /** @phpstan-ignore-next-line-pattern 'Method Mimir\Tenhou6Model::asString() is unused' */
    private function asString($n): string
    {
        return strval($n);
    }

    /**
     * @param array $agariRow
     * @return array return array with yaku codes
     */
    private function resolveYakuList($agariRow): array
    {
        $yakuList = [];
        for ($i = 4; $i < count($agariRow); $i++) {
            $currentYakuCode = $this->resolveYakuFromString($agariRow[$i]);
            if ($currentYakuCode != -1) {
                array_push($yakuList, $currentYakuCode);
                array_push($yakuList, $this->resolveYakuHanFromString($agariRow[$i]));
            }
        }
        return $yakuList;
    }

    /**
     * @param array $agariRow
     * @return array return array with yakuman codes
     */
    private function resolveYakumanList($agariRow): array
    {
        $yakumanList = [];
        for ($i = 4; $i < count($agariRow); $i++) {
            $currentYakumanCode = $this->resolveYakumanFromString($agariRow[$i]);
            if ($currentYakumanCode != -1) {
                array_push($yakumanList, $currentYakumanCode);
            }
        }
        return $yakumanList;
    }

    /**
     * @param string $yakuString
     * @return int return count han
     */
    private function resolveYakuHanFromString($yakuString): int
    {
        $han = 0;
        $rawYakuString = $this->rawDecode($yakuString);
        if (str_contains($rawYakuString, $this->_RUNES[$this->HAN])) {
            $from = strpos($rawYakuString, "(");
            $to = strpos($rawYakuString, $this->_RUNES[$this->HAN]);
            $han = intval(substr($rawYakuString, $from + 1, $to - $from));
        }
        return $han;
    }

    /**
     * @param string $yakuString
     * @return int return yaku code
     */
    private function resolveYakuFromString($yakuString): int
    {
        $yakuCode = -1;
        $rawYakuString = $this->rawDecode($yakuString);
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_MENZENTSUMO])) {
            $yakuCode = 0;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_RIICHI])) {
            $yakuCode = 1;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_IPPATSU])) {
            $yakuCode = 2;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_CHANKAN])) {
            $yakuCode = 3;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_RINSHANKAIHOU])) {
            $yakuCode = 4;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_HAITEI])) {
            $yakuCode = 5;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_HOUTEI])) {
            $yakuCode = 6;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_PINFU])) {
            $yakuCode = 7;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_TANYAO])) {
            $yakuCode = 8;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_IIPEIKOU])) {
            $yakuCode = 9;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_TON_PLACE])) {
            $yakuCode = 10;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_NAN_PLACE])) {
            $yakuCode = 11;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_SHA_PLACE])) {
            $yakuCode = 12;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_PEI_PLACE])) {
            $yakuCode = 13;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_TON_ROUND])) {
            $yakuCode = 14;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_NAN_ROUND])) {
            $yakuCode = 15;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_SHA_ROUND])) {
            $yakuCode = 16;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_PEI_ROUND])) {
            $yakuCode = 17;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_HAKU])) {
            $yakuCode = 18;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_HATSU])) {
            $yakuCode = 19;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_CHUN])) {
            $yakuCode = 20;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_DOUBLERIICHI])) {
            $yakuCode = 21;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_CHIITOITSU])) {
            $yakuCode = 22;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_CHANTA])) {
            $yakuCode = 23;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_ITTSU])) {
            $yakuCode = 24;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_SANSHOKUDOUJUN])) {
            $yakuCode = 25;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_SANSHOKUDOUKOU])) {
            $yakuCode = 26;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_SANKANTSU])) {
            $yakuCode = 27;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_TOITOI])) {
            $yakuCode = 28;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_SANANKOU])) {
            $yakuCode = 29;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_SHOSANGEN])) {
            $yakuCode = 30;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_HONROTO])) {
            $yakuCode = 31;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_RYANPEIKOU])) {
            $yakuCode = 32;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_JUNCHAN])) {
            $yakuCode = 33;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_HONITSU])) {
            $yakuCode = 34;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_CHINITSU])) {
            $yakuCode = 35;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_RENHOU])) {
            $yakuCode = 36;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_DORA])) {
            $yakuCode = 52;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_URADORA])) {
            $yakuCode = 53;
        }
        if (str_contains($rawYakuString, $this->_RUNES[$this->Y_AKADORA])) {
            $yakuCode = 54;
        }
        return $yakuCode;
    }

    /**
     * @param string $yakumanString
     * @return int return yakuman code
     */
    private function resolveYakumanFromString($yakumanString): int
    {
        $yakumanCode = -1;
        $rawYakumanString = $this->rawDecode($yakumanString);
        if (str_contains($rawYakumanString, $this->_RUNES[$this->Y_TENHOU])) {
            $yakumanCode = 37;
        }
        if (str_contains($rawYakumanString, $this->_RUNES[$this->Y_CHIHOU])) {
            $yakumanCode = 38;
        }
        if (str_contains($rawYakumanString, $this->_RUNES[$this->Y_DAISANGEN])) {
            $yakumanCode = 39;
        }
        if (str_contains($rawYakumanString, $this->_RUNES[$this->Y_SUUANKOU])) {
            $yakumanCode = 40;
        }
        if (str_contains($rawYakumanString, $this->_RUNES[$this->Y_SUUANKOU_TANKI])) {
            $yakumanCode = 41;
        }
        if (str_contains($rawYakumanString, $this->_RUNES[$this->Y_TSUUIISOU])) {
            $yakumanCode = 42;
        }
        if (str_contains($rawYakumanString, $this->_RUNES[$this->Y_RYUUIISOU])) {
            $yakumanCode = 43;
        }
        if (str_contains($rawYakumanString, $this->_RUNES[$this->Y_CHINROTO])) {
            $yakumanCode = 44;
        }
        if (str_contains($rawYakumanString, $this->_RUNES[$this->Y_CHUURENPOUTO])) {
            $yakumanCode = 45;
        }
        if (str_contains($rawYakumanString, $this->_RUNES[$this->Y_CHUURENPOUTO_9])) {
            $yakumanCode = 46;
        }
        if (str_contains($rawYakumanString, $this->_RUNES[$this->Y_KOKUSHIMUSOU])) {
            $yakumanCode = 47;
        }
        if (str_contains($rawYakumanString, $this->_RUNES[$this->Y_KOKUSHIMUSOU_13])) {
            $yakumanCode = 48;
        }
        if (str_contains($rawYakumanString, $this->_RUNES[$this->Y_DAISUUSHII])) {
            $yakumanCode = 49;
        }
        if (str_contains($rawYakumanString, $this->_RUNES[$this->Y_SHOSUUSHII])) {
            $yakumanCode = 50;
        }
        if (str_contains($rawYakumanString, $this->_RUNES[$this->Y_SUUKANTSU])) {
            $yakumanCode = 51;
        }
        return $yakumanCode;
    }

    /**
     * @param array $playerRound
     * @return array return array with counts chi, pon, kan
     */
    private function tenhouFuro($playerRound): array
    {
        $chiiCount = 0;
        $ponCount = 0;
        $kanCount = 0;

        for ($i = 0; $i < count($playerRound); $i++) {
            if (is_string($playerRound[$i])) {
                if (str_contains($playerRound[$i], "c")) {
                    $chiiCount++;
                }
                if (str_contains($playerRound[$i], "p")) {
                    $ponCount++;
                }
                if (str_contains($playerRound[$i], "m")) {
                    $kanCount++;
                }
            }
        }
        return [$chiiCount, $ponCount, $kanCount];
    }

    /**
     * @param array $playerRound
     * @param int $currentWho
     * @param int|null $fromWho
     * @param bool|null $isTsumo
     * @return array return array with counts kakan, ankan, riichi
     */
    private function tenhouRiiqi($playerRound, $currentWho, $fromWho, $isTsumo): array
    {
        $kakanCount = 0;
        $ankanCount = 0;
        $riichiCount = 0;
        $lastIndex = count($playerRound) - 1;

        for ($i = 0; $i <= $lastIndex; $i++) {
            if (is_string($playerRound[$i])) {
                if (str_contains($playerRound[$i], "r")) {
                    if (isset($fromWho)) {
                        //emulate step="2" from XML reach tag, if last action is reach and not ron from this player
                        if (!$isTsumo && $i == $lastIndex && $currentWho !== $fromWho) {
                            $riichiCount++;
                        }
                        if ($isTsumo || $i !== $lastIndex) {
                            $riichiCount++;
                        }
                    } else {
                        $riichiCount++;
                    }
                }
                if (str_contains($playerRound[$i], "k")) {
                    $kakanCount++;
                }
                if (str_contains($playerRound[$i], "a")) {
                    $ankanCount++;
                }
            }
        }

        return [$kakanCount, $ankanCount, $riichiCount];
    }

    //decode encoded string
    /**
     * @param string $str
     * @return string
     */
    private function rawDecode($str): string
    {
        return rawurldecode($str);
    }

    /**
     * @param array $tokenUN
     * @param \stdClass[] $playerMapping player name mapping
     * @return void
     */
    public function setTokenUN($tokenUN, $playerMapping): void
    {
        if ($this->getPlatformId() === PlatformTypeId::Majsoul->value) {
            $this->_tokenUN = [];
            foreach ($playerMapping as $playerItem) {
                array_push($this->_tokenUN, [
                    'player_name' => $this->rawDecode($playerItem->nickname),
                    'account_id' => $playerItem->account_id
                ]);
            }
        } else {
            $this->_tokenUN = [];
            foreach ($tokenUN as $playerName) {
                array_push($this->_tokenUN, ['player_name' => $this->rawDecode($playerName)]);
            }
        }
    }

    /**
     * @return array return array with player's names
     */
    public function getTokenUN(): array
    {
        return $this->_tokenUN;
    }

    /**
     * @return array return array with round tokens
     */
    public function getRounds(): array
    {
        return $this->_rounds;
    }

    /**
     * @return int return platform id
     */
    public function getPlatformId(): int
    {
        return $this->_platformId;
    }

    /**
     * @return string return replay hash
     */
    public function getReplayHash(): string
    {
        return $this->_replayHash;
    }
}
