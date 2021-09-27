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

class UserActionManageEvents extends Controller
{
    protected $_mainTemplate = 'UserActionManageEvents';
    protected $_error = null;
    const PERPAGE = 30;

    protected function _pageTitle()
    {
        return _t('Control panel: manage events');
    }

    protected function _beforeRun()
    {
        if ($this->_currentPersonId === null) {
            $this->_error = [
                'error' => _t("Can't proceed to control panel: please log in"),
                'critical' => true
            ];
            return true;
        }

        if (empty($this->_path['action'])) {
            return true;
        }

        switch ($this->_path['action']) {
            case 'finishEvent':
                if (!empty($this->_path['id'])) {
                    $success = $this->_mimir->finishEvent(intval($this->_path['id']));
                    if (!$success) {
                        $this->_error = [
                            'error' => _t("Failed to finish event"),
                            'critical' => true
                        ];
                        return true;
                    }
                    header('Location: /cp/manageEvents', null, 302);
                    return false;
                }
                break;
            default:;
        }

        return true;
    }

    protected function _run()
    {
        if (!empty($this->_error)) {
            return $this->_error;
        }

        $eventIds = $this->_frey->getOwnedEventIds($this->_currentPersonId);
        if (in_array('__global', $eventIds)) {
            $data = $this->_mimir->getEvents(self::PERPAGE, $this->_offset(self::PERPAGE));
            $events = $data['events'];
            $hasNextPage = ($this->_offset(self::PERPAGE) + self::PERPAGE) < $data['total'];
        } else {
            $events = $this->_mimir->getEventsById($eventIds);
            $hasNextPage = false;
        }

        return [
            'critical' => false,
            'events' => $events,
            'hasNextPage' => $hasNextPage
        ];
    }
}
