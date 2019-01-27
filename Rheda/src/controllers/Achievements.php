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
include_once __DIR__ . "/../helpers/YakuMap.php";

class Achievements extends Controller
{
    protected $_mainTemplate = 'Achievements';

    protected function _pageTitle()
    {
        return _t('Achievements') . ' - ' . $this->_mainEventRules->eventTitle();
    }

    protected function _run()
    {
        if (!$this->_adminAuthOk()) {
            return [
                'error' => _t("Wrong admin password"),
            ];
        }

        if (!empty($this->_path['achievement'])) {
            $ach = null;
            try {
                $ach = $this->_mimir->execute('getAchievements', [$this->_eventIdList, [$this->_path['achievement']]]);
                $value = $this->_achValue($ach);
                if ($this->_path['achievement'] == 'yakumans') {
                    $value = $this->_postProcessYakumans($value);
                }
                return $value;
            } catch (Exception $e) {
                return [
                    'error' => $e->getMessage()
                ];
            }
        } else {
            $this->_mainTemplate = 'AchievementsList';
            return ['achs' => $this->_achList()];
        }
    }

    protected function _achList()
    {
        $names = [
            'bestHand' => _t('Best hand'),
            'bestFu' => _t('Over 9000 fu'),
            'bestTsumoist' => _t('I saw them dancing'),
            'dieHard' => _t('Die Hard'),
            'braveSapper' => _t('Brave minesweeper'),
            'dovakins' => _t('Guest of honors'),
            'bestDealer' => _t('The great dealer'),
            'shithander' => _t('The 1k Flash'),
            'yakumans' => _t('Jewelry included'),
            'impossibleWait' => _t("This can't be your wait"),
            'honoredDonor' => _t('Honored donor'),
            'justAsPlanned' => _t('Just as planned'),
            'carefulPlanning' => _t('Careful planning'),
            'doraLord' => _t('Dora lord'),
            'catchEmAll' => _t('Gotta Catch\'Em All'),
            'favoriteAsapinApprentice' => _t('The favorite apprentice of ASAPIN'),
            'andYourRiichiBet' => _t('And your riichi bet, please'),
            'covetousKnight' => _t('The Covetous Knight'),
            'ninja' => _t('Ninja')
        ];

        $descriptions = [
            'bestHand' => _t('Given for collecting the hand with biggest han count (independent of cost).'),
            'bestFu' => _t('Given for collecting the hand with biggest minipoints (fu) count.'),
            'bestTsumoist' => _t('Given for collecting the most of tsumo hands during single game.'),
            'dieHard' => _t('Given for smallest count of feeding into ron during the tournament.'),
            'braveSapper' => _t('Given for largest count of feeding into ron during the tournament.'),
            'dovakins' => _t('Given for collecting the most of yakuhais during the tournament.'),
            'bestDealer' => _t('Given for largest count of dealer wins during the tournament.'),
            'shithander' => _t('Given for the most of 1/30 wins during tournament.'),
            'yakumans' => _t('Given for collecting a yakuman during tournament.'),
            'impossibleWait' => _t('Given for feeding into largest hand during tournament (but not while in riichi).'),
            'honoredDonor' => _t('Given for losing largest amount of points as riichi bets.'),
            'justAsPlanned' => _t('Given for getting largest number of ippatsu during tournament.'),
            'carefulPlanning' => _t('Given for the smallest average cost of opponents hand that player has dealt.'),
            'doraLord' => _t('Given for the largest average count of dora in player\'s hand.'),
            'catchEmAll' => _t('Given for the largest amount of unique yaku collected during the tournament.'),
            'favoriteAsapinApprentice' => _t('Given for the largest amount of points received as ryukoku payments.'),
            'andYourRiichiBet' => _t('Given for collecting the largest amount of other players\' riichi bets during the tournament.'),
            'covetousKnight' => _t('Given for losing the smallest number of riichi bets.'),
            'ninja' => _t('Given for winning the largest number of hands with damaten.'),
        ];

        return array_map(function ($name, $value) use ($descriptions) {
            return ['code' => $name, 'name' => $value, 'description' => $descriptions[$name]];
        }, array_keys($names), array_values($names));
    }



    protected function _achValue($ach)
    {
        $desc = $this->_achList();
        return [
            'error' => null,
            'bestHand' => $this->_getValue($ach, 'bestHand', $desc), // { han: number, names: string[] }
            'bestTsumoist' => $this->_getValue($ach, 'bestTsumoist', $desc), // { tsumo: number, names: string[] }
            'braveSapper' => $this->_getValue($ach, 'braveSapper', $desc), // { feed: number, names: string[] }
            'dieHard' => $this->_getValue($ach, 'dieHard', $desc), // { feed: number, names: string[] }
            'dovakins' => $this->_getValue($ach, 'dovakins', $desc), // { name: string, count: number }[],
            'yakumans' => $this->_getValue($ach, 'yakumans', $desc), // string[]
            'bestFu' => $this->_getValue($ach, 'bestFu', $desc), // { fu: number, names: string[] }
            'bestDealer' => $this->_getValue($ach, 'bestDealer', $desc), // { bestWinCount: number, names: string[] }
            'shithander' => $this->_getValue($ach, 'shithander', $desc), // { handsCount: number, names: string[] }
            'impossibleWait' => $this->_getValue($ach, 'impossibleWait', $desc), // { name: string, hand: {han: number, fu: number}}[]
            'honoredDonor' => $this->_getValue($ach, 'honoredDonor', $desc), // { name: string, count: number }[]
            'justAsPlanned' => $this->_getValue($ach, 'justAsPlanned', $desc), // { name: string, count: number }[],
            'carefulPlanning' => $this->_getValue($ach, 'carefulPlanning', $desc), // { name: string, score: number }[],
            'doraLord' => $this->_getValue($ach, 'doraLord', $desc), // { name: string, count: number }[],
            'catchEmAll' => $this->_getValue($ach, 'catchEmAll', $desc), // { name: string, count: number }[],
            'favoriteAsapinApprentice' => $this->_getValue($ach, 'favoriteAsapinApprentice', $desc), // { name: string, score: number }[],
            'andYourRiichiBet' => $this->_getValue($ach, 'andYourRiichiBet', $desc), // { name: string, count: number }[],
            'covetousKnight' => $this->_getValue($ach, 'covetousKnight', $desc), // { name: string, count: number }[],
            'ninja' => $this->_getValue($ach, 'ninja', $desc), // { name: string, count: number }[],
        ];
    }

    protected function _getValue($achievements, $key, $desc)
    {
        $d = array_filter($desc, function ($el) use ($key) {
            return $el['code'] == $key;
        });
        return empty($achievements[$key])
            ? null
            : array_merge(['val' => $achievements[$key]], reset($d));
    }

    protected function _formatYakumanString($yakumanIDs)
    {
        $list = array_map(
            function ($yaku) {
                return Yaku::getMap()[$yaku];
            },
            explode(',', $yakumanIDs)
        );
        return implode(', ', $list);
    }

    protected function _postProcessYakumans($value)
    {
        $value['yakumans']['val'] = array_map(function ($value) {
            $value['yaku'] = $this->_formatYakumanString($value['yaku']);
            return $value;
        }, $value['yakumans']['val']);
        return $value;
    }
}
