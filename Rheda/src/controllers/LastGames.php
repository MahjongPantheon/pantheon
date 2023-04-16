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

include_once __DIR__ . "/../helpers/GameFormatter.php";

class LastGames extends Controller
{
    protected $_mainTemplate = 'LastGames';

    protected function _pageTitle()
    {
        return _t('Latest games') . ' - ' . $this->_mainEventGameConfig->getEventTitle();
    }

    /**
     * @return array
     * @throws \Exception
     */
    protected function _run(): array
    {
        $isTournament = !$this->_mainEventGameConfig->getAllowPlayerAppend();
        if ($isTournament) {
            $players = $this->_mimir->getAllPlayers($this->_eventIdList);
            $numberOfPlayers = count($players);
            $limit = intval($numberOfPlayers / 4);
            if ($limit > 40) {
                $limit = 40;
            }
        } else {
            $limit = 10;
        }

        $offset = 0;
        $currentPage = 1;

        if (isset($this->_path['page'])) {
            $currentPage = max(1, intval($this->_path['page']));
            $offset = ($currentPage - 1) * $limit;
        }

        $gamesData = $this->_mimir->getLastGames($this->_eventIdList, $limit, $offset, 'end_date', 'desc');

        $totalPages = ceil(floatval($gamesData['total_games']) / $limit);
        $start = $offset + 1;
        $end = min($offset + $limit, $gamesData['total_games']);
        $pagination = $this->_generatePaginationData($currentPage, intval($totalPages), '/last/', 5);

        $formatter = new GameFormatter();
        return [
            'noGames' => $gamesData['total_games'] == 0,
            'games' => $formatter->formatGamesData($gamesData),
            'nextPage' => $currentPage + 1,
            'prevPage' => $currentPage == 1 ? 1 : $currentPage - 1,
            'gamesCount' => $gamesData['total_games'],
            'start' => $start,
            'end' => $end,
            'isOnlineTournament' => $this->_mainEventGameConfig->getIsOnline(),
            ...$pagination
        ];
    }
}
