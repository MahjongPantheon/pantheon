<?php
/*  Rheda: visualizer and control panel
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

namespace Rheda;

require_once __DIR__ . '/../helpers/Array.php';
include_once __DIR__ . "/../../../Common/YakuMap.php";

class Achievements extends Controller
{
    protected $_mainTemplate = 'Achievements';
    const A_BEST_HAND = 'bestHand';
    const A_BEST_FU = 'bestFu';
    const A_BEST_TSUMOIST = 'bestTsumoist';
    const A_DIE_HARD = 'dieHard';
    const A_BRAVE_SAPPER = 'braveSapper';
    const A_DOVAKINS = 'dovakins';
    const A_BEST_DEALER = 'bestDealer';
    const A_SHITHANDER = 'shithander';
    const A_YAKUMANS = 'yakumans';
    const A_IMPOSSIBLE_WAIT = 'impossibleWait';
    const A_HONORED_DONOR = 'honoredDonor';
    const A_JUST_AS_PLANNED = 'justAsPlanned';
    const A_CAREFUL_PLANNING = 'carefulPlanning';
    const A_DORA_LORD = 'doraLord';
    const A_CATCH_EM_ALL = 'catchEmAll';
    const A_FAVORITE_ASAPIN_APPRENTICE = 'favoriteAsapinApprentice';
    const A_AND_YOUR_RIICHI_BET = 'andYourRiichiBet';
    const A_COVETOUS_KNIGHT = 'covetousKnight';
    const A_NINJA = 'ninja';
    const A_NEED_MORE_GOLD = 'needMoreGold';

    protected function _pageTitle()
    {
        return _t('Achievements') . ' - ' . $this->_mainEventGameConfig->getEventTitle();
    }

    protected function _run()
    {
        if (!empty($this->_path['achievement'])) {
            try {
                $ach = $this->_mimir->getAchievements(intval($this->_mainEventId), [$this->_path['achievement']]);
                return $this->_ach($ach, $this->_path['achievement']);
            } catch (\Exception $e) {
                return [
                    'error' => $this->_handleTwirpEx($e) ?: $e->getMessage()
                ];
            }
        } else {
            $this->_mainTemplate = 'AchievementsList';
            [$names, $descriptions] = $this->_getDesc();
            return ['achs' => array_map(function ($key) use (&$names, &$descriptions) {
                return [
                    'code' => $key,
                    'name' => $names[$key],
                    'description' => $descriptions[$key],
                ];
            }, array_keys($names))];
        }
    }

    /**
     * @param array $ach
     * @param string $key
     * @return (mixed|string)[][]
     *
     * @psalm-return non-empty-array<array{code: string, name: mixed, description: mixed, val: mixed}>
     */
    protected function _ach($ach, $key): array
    {
        [$names, $descriptions] = $this->_getDesc();

        return [$key => [
            'code' => $key,
            'name' => $names[$key],
            'description' => $descriptions[$key],
            'val' => $key === self::A_YAKUMANS ? $this->_postProcessYakumans($ach[$key]) : $ach[$key]
        ]];
    }

    /**
     * @return array[]
     */
    protected function _getDesc()
    {
        return [
            [
                self::A_BEST_HAND => _t('Best hand'),
                self::A_BEST_FU => _t('Over 9000 fu'),
                self::A_BEST_TSUMOIST => _t('I saw them dancing'),
                self::A_DIE_HARD => _t('Die Hard'),
                self::A_BRAVE_SAPPER => _t('Brave minesweeper'),
                self::A_DOVAKINS => _t('Guest of honors'),
                self::A_BEST_DEALER => _t('The great dealer'),
                self::A_SHITHANDER => _t('The 1k Flash'),
                self::A_YAKUMANS => _t('Jewelry included'),
                self::A_IMPOSSIBLE_WAIT => _t("This can't be your wait"),
                self::A_HONORED_DONOR => _t('Honored donor'),
                self::A_JUST_AS_PLANNED => _t('Just as planned'),
                self::A_CAREFUL_PLANNING => _t('Careful planning'),
                self::A_DORA_LORD => _t('Dora lord'),
                self::A_CATCH_EM_ALL => _t('Gotta Catch\'Em All'),
                self::A_FAVORITE_ASAPIN_APPRENTICE => _t('The favorite apprentice of ASAPIN'),
                self::A_AND_YOUR_RIICHI_BET => _t('And your riichi bet, please'),
                self::A_COVETOUS_KNIGHT => _t('The Covetous Knight'),
                self::A_NINJA => _t('Ninja'),
                self::A_NEED_MORE_GOLD => _t('We need more gold'),
            ], [
                self::A_BEST_HAND => _t('Given for collecting the hand with biggest han count (independent of cost).'),
                self::A_BEST_FU => _t('Given for collecting the hand with biggest minipoints (fu) count.'),
                self::A_BEST_TSUMOIST => _t('Given for collecting the most of tsumo hands during single game.'),
                self::A_DIE_HARD => _t('Given for smallest count of feeding into ron during the tournament.'),
                self::A_BRAVE_SAPPER => _t('Given for largest count of feeding into ron during the tournament.'),
                self::A_DOVAKINS => _t('Given for collecting the most of yakuhais during the tournament.'),
                self::A_BEST_DEALER => _t('Given for largest count of dealer wins during the tournament.'),
                self::A_SHITHANDER => _t('Given for the most of 1/30 wins during tournament.'),
                self::A_YAKUMANS => _t('Given for collecting a yakuman during tournament.'),
                self::A_IMPOSSIBLE_WAIT => _t('Given for feeding into largest hand during tournament (but not while in riichi).'),
                self::A_HONORED_DONOR => _t('Given for losing largest amount of points as riichi bets.'),
                self::A_JUST_AS_PLANNED => _t('Given for getting largest number of ippatsu during tournament.'),
                self::A_CAREFUL_PLANNING => _t('Given for the smallest average cost of opponents hand that player has dealt.'),
                self::A_DORA_LORD => _t('Given for the largest average count of dora in player\'s hand.'),
                self::A_CATCH_EM_ALL => _t('Given for the largest amount of unique yaku collected during the tournament.'),
                self::A_FAVORITE_ASAPIN_APPRENTICE => _t('Given for the largest amount of points received as ryukoku payments.'),
                self::A_AND_YOUR_RIICHI_BET => _t('Given for collecting the largest amount of other players\' riichi bets during the tournament.'),
                self::A_COVETOUS_KNIGHT => _t('Given for losing the smallest number of riichi bets.'),
                self::A_NINJA => _t('Given for winning the largest number of hands with damaten.'),
                self::A_NEED_MORE_GOLD => _t('Given for having biggest score in the end of the session across the tournament.'),
            ]
        ];
    }

    /**
     * @param string $yakumanIDs
     * @return string
     */
    protected function _formatYakumanString(string $yakumanIDs): string
    {
        $list = array_map(
            function ($yaku) {
                return \Common\YakuMap::getTranslations()[(int)$yaku];
            },
            explode(',', $yakumanIDs)
        );
        return implode(', ', $list);
    }

    /**
     * @param array $value
     * @return mixed
     */
    protected function _postProcessYakumans($value)
    {
        if (empty($value)) {
            $value = [
                'name' => 'Sorry',
                'yaku' => 'no yakumans'
            ];
        } else {
            $value = array_map(function ($value) {
                $value['yaku'] = $this->_formatYakumanString($value['yaku']);
                return $value;
            }, $value);
        }

        return $value;
    }
}
