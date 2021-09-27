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

class UserActionEventEditPrivileges extends Controller
{
    protected $_mainTemplate = 'UserActionEventEditPrivileges';
    protected $_error = null;

    protected function _pageTitle()
    {
        return _t('Control panel: manage event privileges');
    }

    protected function _beforeRun()
    {
        if ($this->_currentPersonId === null) {
            $this->_error = [
                'error' => _t("Can't proceed to control panel: please log in"),
                'critical' => true
            ];
        }

        if (empty($this->_path['id'])) {
            $this->_error = [
                'error' => _t("Event is not selected"),
                'critical' => true
            ];
        }

        return true;
    }

    protected function _run()
    {
        if (!empty($this->_error)) {
            return $this->_error;
        }

        $event = $this->_mimir->getEventsById([$this->_path['id']]);
        if (empty($event)) {
            return [
                'critical' => true,
                'error' => _t('Event not found in database')
            ];
        }
        $rules = $this->_frey->getAllEventRules($this->_path['id']);

        return [
            'critical' => false,
            'person' => $rules['person'],
            'group' => $rules['group'],
            'event' => $event[0]
        ];
    }
}
