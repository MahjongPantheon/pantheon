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
        return _t('Statistics');
    }

    protected function _run()
    {
        if (count($this->_eventIdList) > 1) {
            return [
                'isAggregated' => true,
                'eventsInfo' => array_values(array_map(function ($rules) {
                    return ['title' => $rules->eventTitle(), 'description' => $rules->eventDescription()];
                }, $this->_rulesList))
            ];
        }

        /* All code below is for simple non-aggregated events.  */
        if ($this->_mainEventRules->seriesLength() == 0) {
            $rules = $this->_mainEventRules->toArray();
            $ruleDescriptions = Config::getRuleDescriptions();
            return [
                'title' => $this->_mainEventRules->eventTitle(),
                'description' => $this->_mainEventRules->eventDescription(),
                'isLoggedIn' => $this->_adminAuthOk(),
                'rules' => array_map(function($key, $value) use(&$ruleDescriptions) {
                    if (
                        $key == 'allowedYaku' ||
                        $key == 'tenboDivider' ||
                        $key == 'ratingDivider' ||
                        $key == 'gameExpirationTime' ||
                        $key == 'eventTitle ' ||
                        $key == 'eventDescription' ||
                        $key == 'eventStatHost' ||
                        $key == 'isTextlog' ||
                        $key == 'gamesStatus' ||
                        $key == 'hideResults' ||
                        $key == 'hideAddReplayButton'
                    ) { // don't display this for now
                        return null;
                    }
                    return [
                        'name' => $key,
                        'value' => $value === true || $value === false
                            ? ($value === true ? _t('yes') : _t('no'))
                            : $value,
                        'description' => $ruleDescriptions[$key]
                    ];
                }, array_keys($rules), array_values($rules))
            ];
        }

        $data = $this->_api->execute('getGamesSeries', [$this->_mainEventId]);

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
            'title' => $this->_mainEventRules->eventTitle()
        ];
    }
}
