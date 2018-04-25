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

require_once __DIR__ . '/../helpers/Url.php';
require_once __DIR__ . '/../helpers/Array.php';
require_once __DIR__ . '/../helpers/GameFormatter.php';

class TableStatus extends Controller
{
    protected $_mainTemplate = 'TableStatus';

    protected function _pageTitle()
    {
        return _t('Event tables status');
    }

    protected function _run()
    {
        $formatter = new GameFormatter();

        $errCode = null;

        $tables = $this->_api->execute('getTablesState', [$this->_eventId, true]);
        $timerState = $this->_api->execute('getTimerState', [$this->_eventId]);
        $tablesFormatted = $formatter->formatTables($tables, $this->_rules->gamesWaitingForTimer());

        if ($timerState['started'] && $timerState['time_remaining']) {
            $formattedTime = (int)($timerState['time_remaining'] / 60) . ':'
                . (floor(($timerState['time_remaining'] % 60) / 10) * 10);
        } else {
            $formattedTime = '00:00';
        }

        return [
            'error' => null,
            'tables' => $tablesFormatted,

            // timer related
            'redZoneLength' => $this->_rules->redZone() / 60,
            'yellowZoneLength' => $this->_rules->yellowZone() / 60,
            'redZone' => $this->_rules->timerPolicy() === 'redZone',
            'yellowZone' => $this->_rules->timerPolicy() === 'yellowZone',
            'gameDuration' => $this->_rules->gameDuration(), // already in minutes
            'initialTime' => $formattedTime
        ];
    }
}
