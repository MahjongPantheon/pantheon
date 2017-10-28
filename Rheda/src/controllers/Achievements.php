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
        return 'Особые номинации';
    }

    protected function _run()
    {
        $achievements = null;
        try {
            $achievements = $this->_api->execute('getAchievements', [$this->_eventId]);
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
            'chomboMasters' => $achievements['chomboMaster'], // Array<{ name: string, count: number }>
            'dovakins' => $dovakins,
            'yakumans' => $achievements['yakuman'], // string[]
            'bestFuHandValue' => $achievements['bestFu']['fu'],
            'bestFuHandPlayers' => $achievements['bestFu']['names'], // string[]
            'bestDealerRenchans' => $achievements['bestDealer']['bestWinCount'],
            'bestDealerPlayers' => $achievements['bestDealer']['names'], // string[]
            'shithandsCount' => $achievements['shithander']['handsCount'],
            'shithanderPlayers' => $achievements['shithander']['names'], // string[]
        ];
    }
}
