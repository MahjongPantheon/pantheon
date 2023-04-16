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

require_once __DIR__ . '/../Controller.php';

class Mainpage extends Controller
{
    protected $_mainTemplate = 'Mainpage';

    protected function _pageTitle()
    {
        return _t('Statistics') . ' - ' . $this->_mainEventGameConfig->getEventTitle();
    }

    /**
     * @return array
     * @throws \Exception
     */
    protected function _run(): array
    {
        if (count($this->_eventIdList) > 1) {
            return [
                'isAggregated' => true,
                'eventsInfo' => array_values(array_map(function ($rules) {
                    return ['title' => $rules->getEventTitle(), 'description' => $rules->getEventDescription()];
                }, $this->_gameConfig))
            ];
        }

        if ($this->_mainEventId) {
            $admins = $this->_frey->getEventAdmins($this->_mainEventId);
        } else {
            $admins = [];
        }

        /* All code below is for simple non-aggregated events.  */
        if ($this->_mainEventGameConfig->getSeriesLength() == 0) {
            return [
                'admins' => $admins,
                'finished' => $this->_mainEventGameConfig->getIsFinished(),
                'title' => $this->_mainEventGameConfig->getEventTitle(),
                'description' => $this->_mainEventGameConfig->getEventDescription(),
                'isLoggedIn' => $this->_userHasAdminRights()
            ];
        }

        if (empty($this->_mainEventId)) {
            return [
                'error' => _t('Main event is empty: this is unexpected behavior')
            ];
        }
        $data = $this->_mimir->getGamesSeries($this->_mainEventId);

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
            'admins' => $admins,
            'data' => $formattedData,
            'hasData' => true,
            'title' => $this->_mainEventGameConfig->getEventTitle()
        ];
    }
}
