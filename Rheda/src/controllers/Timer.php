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

require_once __DIR__ . '/../helpers/Array.php';

class Timer extends Controller
{
    protected $_mainTemplate = 'Timer';

    protected function _pageTitle()
    {
        return 'Таймер';
    }
    
    protected function _run()
    {
        $timerState = $this->_api->execute('getTimerState', [$this->_eventId]);
        $currentSeating = $this->_formatSeating($this->_api->execute('getCurrentSeating', [$this->_eventId]));
        $durationWithoutSeating = $this->_rules->gameDuration() - 5;

        if ($timerState['started'] && $timerState['time_remaining']) {
            $formattedTime = (int)($timerState['time_remaining'] / 60) . ':'
                           . (floor(($timerState['time_remaining'] % 60) / 10) * 10);
            return [
                'redZoneLength' => $this->_rules->redZone() / 60,
                'yellowZoneLength' => $this->_rules->yellowZone() / 60,
                'redZone' => $this->_rules->timerPolicy() === 'redZone',
                'yellowZone' => $this->_rules->timerPolicy() === 'yellowZone',
                'gameDuration' => $this->_rules->gameDuration(), // already in minutes
                'gameDurationWithoutSeating' => $durationWithoutSeating,
                'initialTime' => $formattedTime,
                'seating' => $currentSeating
            ];
        }

        return [
            'redZoneLength' => $this->_rules->redZone() / 60,
            'yellowZoneLength' => $this->_rules->yellowZone() / 60,
            'redZone' => $this->_rules->timerPolicy() === 'redZone',
            'yellowZone' => $this->_rules->timerPolicy() === 'yellowZone',
            'gameDuration' => $this->_rules->gameDuration(), // already in minutes
            'gameDurationWithoutSeating' => $durationWithoutSeating,
            'initialTime' => '00:00',
            'seating' => $currentSeating
        ];
    }

    protected function _formatSeating($seating)
    {
        $result = [];

        // assign colors first
        foreach ($seating as &$player) {
            $player['zone'] = $player['rating'] >= $this->_rules->startRating() ? 'success' : 'important';
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
