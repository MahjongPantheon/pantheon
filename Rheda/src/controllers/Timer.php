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

class Timer extends Controller
{
    protected $_mainTemplate = 'Timer';

    protected function _pageTitle()
    {
        return _('Timer') . ' - ' . $this->_mainEventRules->eventTitle();
    }

    protected function _run()
    {
        if (count($this->_eventIdList) > 1) {
            return [
                'isAggregated' => true,
                'error' => _t('Page not available for aggregated events')
            ];
        }

        $timerState = $this->_mimir->execute('getTimerState', [$this->_mainEventId]);
        $currentSeating = $this->_formatSeating($this->_mimir->execute('getCurrentSeating', [$this->_mainEventId]));
        $durationWithoutSeating = $this->_mainEventRules->gameDuration() - 5;

        if ($timerState['started'] && $timerState['time_remaining']) {
            $formattedTime = (int)($timerState['time_remaining'] / 60) . ':'
                           . (floor(($timerState['time_remaining'] % 60) / 10) * 10);
            return [
                'redZoneLength' => $this->_mainEventRules->redZone() / 60,
                'yellowZoneLength' => $this->_mainEventRules->yellowZone() / 60,
                'redZone' => $this->_mainEventRules->timerPolicy() === 'redZone',
                'yellowZone' => $this->_mainEventRules->timerPolicy() === 'yellowZone',
                'gameDuration' => $this->_mainEventRules->gameDuration(), // already in minutes
                'gameDurationWithoutSeating' => $durationWithoutSeating,
                'initialTime' => $formattedTime,
                'seating' => $currentSeating
            ];
        }

        return [
            'waiting' => $this->_mainEventRules->gamesWaitingForTimer(),
            'redZoneLength' => $this->_mainEventRules->redZone() / 60,
            'yellowZoneLength' => $this->_mainEventRules->yellowZone() / 60,
            'redZone' => $this->_mainEventRules->timerPolicy() === 'redZone',
            'yellowZone' => $this->_mainEventRules->timerPolicy() === 'yellowZone',
            'gameDuration' => $this->_mainEventRules->gameDuration(), // already in minutes
            'gameDurationWithoutSeating' => $durationWithoutSeating,
            'initialTime' => $this->_mainEventRules->gamesWaitingForTimer() ? '99:99' : '00:00',
            'seating' => $currentSeating
        ];
    }

    protected function _formatSeating($seating)
    {
        $result = [];

        // assign colors first
        foreach ($seating as &$player) {
            $player['zone'] = $player['rating'] >= $this->_mainEventRules->startRating() ? 'success' : 'danger';
        }

        $seating = ArrayHelpers::elm2key($seating, 'session_id', true);

        foreach ($seating as $table) {
            usort($table, function ($e1, $e2) {
                return $e1['order'] - $e2['order'];
            });
            $result []= [
                'index' => $table[0]['table_index'],
                'players' => $table
            ];
        }

        usort($result, function ($e1, $e2) {
            return $e1['index'] - $e2['index'];
        });

        return $result;
    }
}
