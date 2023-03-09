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
     * @return array
     */
    protected function _run(): array
    {
        $errMsg = '';
        $data = null;

        $orderBy = 'rating';
        $order = 'desc';

        try {
            $players = $this->_mimir->getAllPlayers($this->_eventIdList);
            $players = ArrayHelpers::elm2Key($players, 'id');

            $data = $this->_mimir->getRatingTable(
                $this->_eventIdList,
                $orderBy,
                $order,
                $this->_userHasAdminRights() // show prefinished results only for admins
            );

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

            $data = array_map(function ($el) use (&$teamNames) {
                $teamName = null;
                if ($this->_mainEventRules->isTeam()) {
                    $teamName = $teamNames[$el['id']];
                }
                $el['short_name'] = $this->_makeShortName($el['title']);
                $el['team_name'] = $teamName;
                return $el;
            }, $data);
        } catch (\Exception $e) {
            $this->_handleTwirpEx($e);
            $errMsg = $e->getMessage();
        }

        // group players by team
        $teams = [];
        if (!empty($data)) {
            foreach ($data as $player) {
                if (empty($teams[$player['team_name']])) {
                    $teams[$player['team_name']] = [
                        'players' => [$player],
                        'team_name' => $player['team_name'],
                        'total_rating' => intval($player['rating']),
                        'winner_zone' => intval($player['rating']) >= 0
                    ];
                } else {
                    $teams[$player['team_name']]['players'][] = $player;
                    $teams[$player['team_name']]['total_rating'] += intval($player['rating']);
                    $teams[$player['team_name']]['winner_zone'] = $teams[$player['team_name']]['total_rating'] >= 0;
                }
            }
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

    /**
     * @param string $name
     * @return string
     */
    private function _makeShortName(string $name): string
    {
        list($surname, $name) = explode(' ', $name . ' '); // Trailing slash will suppress errors with names without any space
        return $surname . ' ' . mb_substr($name, 0, 1, 'utf8') . '.';
    }
}
