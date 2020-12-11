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

class RatingTable extends Controller
{
    protected $_mainTemplate = 'RatingTable';

    protected function _pageTitle()
    {
        return _t('Rating table') . ' - ' . $this->_mainEventRules->eventTitle();
    }

    protected function _run()
    {
        $errMsg = '';
        $data = null;

        if (!isset($_GET['sort'])) {
            $_GET['sort'] = '';
        }

        $order = empty($_GET['order']) ? '' : $_GET['order'];
        if ($order != 'asc' && $order != 'desc') {
            $order = '';
        }

        switch ($_GET['sort']) {
            case 'rating':
                $orderBy = $_GET['sort'];
                if (empty($_GET['order'])) {
                    $order = 'desc';
                }
                break;
            case 'avg_place':
                $orderBy = $_GET['sort'];
                if (empty($_GET['order'])) {
                    $order = 'asc';
                }
                break;
            case 'avg_score':
                $orderBy = $_GET['sort'];
                if (empty($_GET['order'])) {
                    $order = 'desc';
                }
                break;
            case 'name':
                $orderBy = $_GET['sort'];
                if (empty($_GET['order'])) {
                    $order = 'asc';
                }
                break;
            default:
                ;
                $orderBy = 'rating';
                if (empty($_GET['order'])) {
                    $order = 'desc';
                }
        }

        $playedGames = 0;

        $minGamesCount = $this->_mainEventRules->minGamesCount();
        $withMinGamesCount = $minGamesCount != 0;
        $showPlayers = !$withMinGamesCount || empty($_GET['players']) ? 'all' : $_GET['players'];

        try {
            $players = $this->_mimir->execute('getAllPlayers', [$this->_eventIdList]);
            $players = ArrayHelpers::elm2Key($players, 'id');

            $data = $this->_mimir->execute('getRatingTable', [
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

            if ($withMinGamesCount) {
                switch ($showPlayers) {
                    case 'all':
                        // Merge players who didn't finish yet into rating table
                        $data = array_merge($data, array_map(function ($el) {
                            return array_merge($el, [
                                'rating'        => '0',
                                'winner_zone'   => true,
                                'avg_place'     => '0',
                                'avg_score'     => '0',
                                'games_played'  => '0'
                            ]);
                        }, array_values($players)));
                        break;
                    case 'min-played':
                        $filteredData = [];
                        foreach ($data as $item) {
                            if ($item['games_played'] >= $minGamesCount) {
                                array_push($filteredData, $item);
                            }
                        }

                        $data = $filteredData;
                        break;
                    case 'min-not-played':
                        $filteredData = [];
                        foreach ($data as $item) {
                            if ($item['games_played'] < $minGamesCount) {
                                array_push($filteredData, $item);
                            }
                        }

                        $data = $filteredData;
                        break;
                    default:
                        throw new InvalidParametersException("Parameter players should be either 'all', 'min-played' or 'min-not-played'");
                }
            } else {
                // Merge players who didn't finish yet into rating table
                $data = array_merge($data, array_map(function ($el) {
                    return array_merge($el, [
                        'rating'        => '0',
                        'winner_zone'   => true,
                        'avg_place'     => '0',
                        'avg_score'     => '0',
                        'games_played'  => '0'
                    ]);
                }, array_values($players)));
            }

            // Assign indexes for table view
            $ctr = 1;
            $data = array_map(function ($el) use (&$ctr, &$players, $minGamesCount, &$teamNames, &$playedGames) {
                $teamName = null;
                if ($this->_mainEventRules->isTeam()) {
                    $teamName = $teamNames[$el['id']];
                }

                $el['_index'] = $ctr++;
                $el['short_name'] = $this->_makeShortName($el['display_name']);
                $el['avg_place_less_precision'] = sprintf('%.2f', $el['avg_place']);
                $el['avg_score_int'] = round($el['avg_score']);
                $el['min_was_played'] = $minGamesCount != 0 && $minGamesCount <= $el['games_played'];
                $el['team_name'] = $teamName;

                $playedGames += $el['games_played'];

                return $el;
            }, $data);
        } catch (Exception $e) {
            $errMsg = $e->getMessage();
        }

        if ($playedGames == 0 && $this->_mainEventRules->isTeam()) {
            usort($data, function ($a, $b) {
                return strcmp($b['team_name'], $a['team_name']);
            });

            $ctr = 1;
            $data = array_map(function ($el) use (&$ctr) {
                $el['_index'] = $ctr++;
                return $el;
            }, $data);
        }

        $hideResults = $this->_mainEventRules->hideResults();

        $showAdminWarning = false;

        // admin should be able to see results
        if ($this->_userHasAdminRights() && $hideResults) {
            $hideResults = false;
            $showAdminWarning = true;
        }

        $showPlayersOptions = [
                [
                    'name'      => _t('All players'),
                    'value'     => 'all',
                    'selected'  => $showPlayers == 'all',
                ],
                [
                    'name'      => _np('Played at least %d game', 'Played at least %d games', $minGamesCount, $minGamesCount),
                    'value'     => 'min-played',
                    'selected'  => $showPlayers == 'min-played',
                ],
                [
                    'name'      => _np('Played less then %d game', 'Played less then %d games', $minGamesCount, $minGamesCount),
                    'value'     => 'min-not-played',
                    'selected'  => $showPlayers == 'min-not-played',
                ],
            ];

        return [
            'error'             => $errMsg,
            'data'              => $data,

            'orderDesc'         => $order == 'desc',

            'isOnlineTournament'  => $this->_mainEventRules->isOnline(),
            'isTeamTournament'    => $this->_mainEventRules->isTeam(),

            'orderByRating'     => $orderBy == 'rating',
            'orderByAvgPlace'   => $orderBy == 'avg_place',
            'orderByAvgScore'   => $orderBy == 'avg_score',
            'orderByName'       => $orderBy == 'name',

            'withMinGamesCount' => $withMinGamesCount,
            'showPlayersOptions' => $showPlayersOptions,

            'hideResults'       => $hideResults,
            'showAdminWarning'  => $showAdminWarning,
        ];
    }

    private function _makeShortName($name)
    {
        list($surname, $name) = explode(' ', $name . ' '); // Trailing slash will suppress errors with names without any space
        return $surname . ' ' . mb_substr($name, 0, 1, 'utf8') . '.';
    }
}
