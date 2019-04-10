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

class Achievements extends Controller
{
    protected $_mainTemplate = 'Achievements';

    protected function _pageTitle()
    {
        return _t('Achievements');
    }

    protected function _run()
    {
        if (!$this->_adminAuthOk()) {
            return [
                'error' => _t("Wrong admin password"),
            ];
        }

        $achievements = null;
        try {
            $achievements = $this->_api->execute('getAchievements', [$this->_eventIdList]);
        } catch (Exception $e) {
            return [
                'error' => $e->getMessage()
            ];
        }

        $dovakins = [];
        foreach ($achievements['dovakin'] as $k => $v) {
            $dovakins []= ['name' => $k, 'count' => $v];
        }

        // This tautology has meaning of template format definition
        return [
            'error' => null,
            'bestHandValue' => $achievements['bestHand']['han'],
            'bestHandPlayers' => $achievements['bestHand']['names'], // string[]
            'bestTsumoCount' => $achievements['bestTsumoist']['tsumo'],
            'bestTsumoPlayers' => $achievements['bestTsumoist']['names'], // string[]
            'bestSapperValue' => $achievements['braveSapper']['feed'],
            'bestSapperPlayers' => $achievements['braveSapper']['names'], // string[]
            'dieHardValue' => $achievements['dieHard']['feed'],
            'dieHardPlayers' => $achievements['dieHard']['names'], // string[]
            'chomboMasters' => $achievements['chomboMaster'], // Array<{ name: string, count: number }>
            'dovakins' => $dovakins,
            'yakumans' => $achievements['yakuman'], // string[]
            'bestFuHandValue' => $achievements['bestFu']['fu'],
            'bestFuHandPlayers' => $achievements['bestFu']['names'], // string[]
            'bestDealerRenchans' => $achievements['bestDealer']['bestWinCount'],
            'bestDealerPlayers' => $achievements['bestDealer']['names'], // string[]
            'shithandsCount' => $achievements['shithander']['handsCount'],
            'shithanderPlayers' => $achievements['shithander']['names'], // string[]
            'impossibleWait' => $achievements['impossibleWait'], // Array<{ name: string, hand: {han: number, fu: number} }>
            'honoredDonor' => $achievements['honoredDonor'], // Array<{ name: string, count: number }>
            'justAsPlanned' => $achievements['justAsPlanned'], // Array<{ name: string, count: number }>,
            'carefulPlanning' => $achievements['carefulPlanning'], // Array<{ name: string, score: number }>,
            'doraLord' => $achievements['doraLord'], // Array<{ name: string, count: number }>,
            'catchEmAll' => $achievements['catchEmAll'], // Array<{ name: string, count: number }>,
            'favoriteAsapinApprentice' => $achievements['favoriteAsapinApprentice'], // Array<{ name: string, score: number }>,
            'andYourRiichiBet' => $achievements['andYourRiichiBet'], // Array<{ name: string, count: number }>,
            'prudent' => $achievements['prudent'], // Array<{ name: string, score: number, lost: number, total: number }>,
        ];
    }
}
