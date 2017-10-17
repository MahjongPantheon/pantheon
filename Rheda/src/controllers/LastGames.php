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
namespace Riichi;

include_once __DIR__ . "/../helpers/GameFormatter.php";

class LastGames extends Controller
{
    protected $_mainTemplate = 'LastGames';

    protected function _pageTitle()
    {
        return 'Последние игры';
    }

    protected function _run()
    {
        $limit = 10;
        $offset = 0;
        $currentPage = 1;

        if (isset($_GET['page']) && is_numeric($_GET['page'])) {
            $currentPage = max(1, (int)$_GET['page']);
            $offset = ($currentPage - 1) * $limit;
        }

        $gamesData = $this->_api->execute(
            'getLastGames',
            [$this->_eventId, $limit, $offset, 'end_date', 'desc']
        );

        $formatter = new GameFormatter();

        $totalGames = $gamesData['total_games'];
        $start = $offset + 1;
        $end = $offset + $limit;

        $hasNextButton = true;
        $hasPreviousButton = true;

        if ($end >= $totalGames) {
            $end = $totalGames;
            $hasNextButton = false;
        }

        if ($currentPage == 1) {
            $hasPreviousButton = false;
        }

        return [
            'noGames' => $gamesData['total_games'] == 0,
            'games' => $formatter->formatGamesData($gamesData, $this->_rules),
            'nextPage' => $currentPage + 1,
            'prevPage' => $currentPage == 1 ? 1 : $currentPage - 1,
            'gamesCount' => $gamesData['total_games'],
            'start' => $start,
            'end' => $end,
            'hasNextButton' => $hasNextButton,
            'hasPreviousButton' => $hasPreviousButton,
        ];
    }
}
