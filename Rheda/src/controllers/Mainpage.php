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

require_once __DIR__ . '/../Controller.php';

class Mainpage extends Controller
{
    protected $_mainTemplate = 'Mainpage';

    protected function _pageTitle()
    {
        return 'Статистика';
    }

    protected function _run()
    {
        if ($this->_rules->seriesLength() == 0) {
            return [
                'title' => $this->_rules->eventTitle(),
                'description' => $this->_rules->eventDescription()
            ];
        }

        $data = $this->_api->execute('getGamesSeries', [$this->_eventId]);

        $formattedData = [];
        $counter = 1;
        foreach ($data as $item) {
            $item['best_series_scores'] = number_format($item['best_series_scores']);
            $item['current_series_scores'] = number_format($item['current_series_scores']);
            $item['_index'] = $counter;
            $formattedData[] = $item;
            $counter++;
        }

        return [
            'data' => $formattedData,
            'hasData' => true,
            'title' => $this->_rules->eventTitle()
        ];
    }
}
