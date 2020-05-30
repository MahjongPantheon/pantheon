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

class TeamTable extends Controller
{
    protected $_mainTemplate = 'TeamTable';

    protected function _pageTitle()
    {
        return _t('Team table');
    }

    /**
     * @return ((array|bool|mixed)[][]|bool|mixed|string)[]
     *
     * @psalm-return array{error: mixed|string, teams: list<array{players: non-empty-list<mixed>, team_name?: mixed, total_rating?: mixed, winner_zone?: bool, _index: mixed}>, isOnlineTournament: bool, hideResults: bool, showAdminWarning: bool}
     */
    protected function _run(): array
    {
        $errMsg = '';
        $data = null;

        $orderBy = 'rating';
        $order = 'desc';

        try {
            $players = $this->_api->execute('getAllPlayers', [$this->_eventIdList]);
            $players = ArrayHelpers::elm2Key($players, 'id');

            $data = $this->_api->execute('getRatingTable', [
                $this->_eventIdList,
                $orderBy,
                $order,
                $this->_userHasAdminRights() // show prefinished results only for admins
            ]);

            $teamNames = [];
            if ($this->_mainEventRules->isTeam()) {
                array_map(function ($el) use (&$players, &$teamNames) {
                    $teamNames[$el['id']] = $players[$el['id']]['team_name'];
                }, $players);
            }

            array_map(function ($el) use (&$players) {
                // remove from common list - user exists in history
                unset($players[$el['id']]);
            }, $data);

            // Merge players who didn't finish yet into rating table
            $data = array_merge($data, array_map(function ($el) {
                return array_merge($el, [
                    'rating'        => '0',
                    'winner_zone'   => true,
                    'games_played'  => '0',
                ]);
            }, array_values($players)));

            $data = array_map(function ($el) use (&$ctr, &$players, &$teamNames) {
                $teamName = null;
                if ($this->_mainEventRules->isTeam()) {
                    $teamName = $teamNames[$el['id']];
                }
                $el['short_name'] = $this->_makeShortName($el['display_name']);
                $el['team_name'] = $teamName;
                return $el;
            }, $data);
        } catch (Exception $e) {
            $errMsg = $e->getMessage();
        }

        # group players by team
        $teams = [];
        foreach ($data as $player) {
            $teams[$player['team_name']]['players'][] = $player;
            $teams[$player['team_name']]['team_name'] = $player['team_name'];
            $teams[$player['team_name']]['total_rating'] += $player['rating'];
            $teams[$player['team_name']]['winner_zone'] = $teams[$player['team_name']]['total_rating'] >= 0;
        }

        $hideResults = $this->_mainEventRules->hideResults();

        $showAdminWarning = false;

        // admin should be able to see results
        if ($this->_userHasAdminRights() && $hideResults) {
            $hideResults = false;
            $showAdminWarning = true;
        }

        usort($teams, function ($a, $b) {
            return $b['total_rating'] - $a['total_rating'];
        });

        $ctr = 1;
        $teams = array_map(function ($el) use (&$ctr) {
            $el['_index'] = $ctr++;
            return $el;
        }, $teams);

        return [
            'error'             => $errMsg,
            'teams'             => $teams,

            'isOnlineTournament'  => $this->_mainEventRules->isOnline(),

            'hideResults'       => $hideResults,
            'showAdminWarning'  => $showAdminWarning,
        ];
    }

    private function _makeShortName($name): string
    {
        list($surname, $name) = explode(' ', $name . ' '); // Trailing slash will suppress errors with names without any space
        return $surname . ' ' . mb_substr($name, 0, 1, 'utf8') . '.';
    }
}
