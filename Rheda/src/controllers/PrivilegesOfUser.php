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

class PrivilegesOfUser extends Controller
{
    protected $_mainTemplate = 'PrivilegesOfUser';
    protected $_selectedPersonData = null;

    protected function _pageTitle()
    {
        return _p('%s : rights and privileges', $this->_selectedPersonData['title']);
    }

    protected function _beforeRun()
    {
        if (!empty($_POST['eventId'])) {
            // save...
            return false;
        }

        return true;
    }

    protected function _run()
    {
        $rulesList = $this->_frey->getRulesList();
        $data = $this->_frey->getPersonalInfo([$this->_path['id']]);
        if (empty($data)) {
            return ['error' => true, 'message' => _t('Person not found in database')];
        }

        $this->_selectedPersonData = $data[0];
        $allAccessData = $this->_frey->getAllPersonAccess($this->_path['id']);

        /** @var array $events */
        $events = $this->_mimir->execute('getEventsById', [
            array_filter(array_keys($allAccessData), function($v) {
                return $v !='__global';
            })
        ]);

        $eventTitles = array_combine(
            array_map(function($ev) { return $ev['id']; }, $events),
            array_map(function($ev) { return $ev['title']; }, $events)
        );

        $rules = array_map(function($eventId) use(&$rulesList, &$allAccessData, &$eventTitles) {
            return [
                'id' => $eventId,
                'title' => $eventId == '__global' ? _t('Global privileges') : $eventTitles[$eventId],
                'rules' => array_map(function($key, $ruleInfo) use(&$allAccessData, $eventId) {
                    $currentValue = isset($allAccessData[$eventId][$key]['value'])
                        ? $allAccessData[$eventId][$key]['value']
                        : $ruleInfo['default'];
                    $ruleId = isset($allAccessData[$eventId][$key]['id'])
                        ? $allAccessData[$eventId][$key]['id']
                        : null;
                    $allowedValues = isset($allAccessData[$eventId][$key]['allowed_values'])
                        ? $allAccessData[$eventId][$key]['allowed_values']
                        : [];

                    return [
                        'id' => $ruleId,
                        'key' => $key,
                        'title' => $ruleInfo['title'],
                        'type' => $ruleInfo['type'],
                        'type_bool' => $ruleInfo['type'] == 'bool',
                        'type_int' => $ruleInfo['type'] == 'int',
                        'type_enum' => $ruleInfo['type'] == 'enum',
                        'allowed_values' => array_map(function($val) use ($currentValue, $ruleInfo) {
                            return [
                                'value' => $val,
                                'selected' => $val == $currentValue
                            ];
                        }, $allowedValues),
                        'value' => $currentValue,
                        'checked' => $ruleInfo['type'] == 'bool' && $currentValue == 'true'
                    ];
                }, array_keys($rulesList), array_values($rulesList))
            ];
        }, array_keys($allAccessData));

        return [
            'error' => false,
            'personName' => $this->_selectedPersonData['title'],
            'rules' => $rules
        ];
    }
}
