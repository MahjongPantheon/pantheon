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
    /**
     * @var string
     */
    protected $_mainTemplate = 'UserActionManageEvents';
    /**
     * @var null|array|string
     */
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
                    header('Location: /cp/manageEvents', false, 302);
                    return false;
                }
                break;
            case 'toggleListed':
                if (!empty($this->_path['id'])) {
                    $success = $this->_mimir->toggleListed(intval($this->_path['id']));
                    if (!$success) {
                        $this->_error = [
                            'error' => _t("Failed to toggle listed flag of the event"),
                            'critical' => true
                        ];
                        return true;
                    }
                    header('Location: /cp/manageEvents', false, 302);
                    return false;
                }
                break;
            case 'rebuildScoring':
                if (!empty($this->_path['id'])) {
                    $this->_mimir->rebuildScoring(intval($this->_path['id']));
                    header('Location: /cp/manageEvents', false, 302);
                    return false;
                }
                break;
            default:
        }

        return true;
    }

    /**
     * @return array|string|null
     */
    protected function _run()
    {
        if (!empty($this->_error)) {
            return $this->_error;
        }

        if (!$this->_currentPersonId) {
            header('Location: /', false, 302);
            return null;
        }

        $eventIds = $this->_frey->getOwnedEventIds($this->_currentPersonId);
        $isSuperadmin = $this->_frey->getSuperadminFlag($this->_currentPersonId);
        if (in_array('__global', $eventIds)) {
            $data = $this->_mimir->getEvents(self::PERPAGE, $this->_offset(self::PERPAGE), false);
            $events = $data['events'];
            $hasNextPage = ($this->_offset(self::PERPAGE) + self::PERPAGE) < $data['total'];
        } else {
            $events = $this->_mimir->getEventsById($eventIds);
            $hasNextPage = false;
        }

        return [
            'critical' => false,
            'events' => $events,
            'isSuperadmin' => $isSuperadmin,
            'hasNextPage' => $hasNextPage
        ];
    }
}
