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

use \chillerlan\QRCode\QRCode;
use \chillerlan\QRCode\QROptions;

require_once __DIR__ . '/../helpers/Url.php';

class PlayerRegistration extends Controller
{
    protected $_mainTemplate = 'PlayerRegistration';
    /**
     * @var string
     */
    protected $_lastError = '';

    protected function _pageTitle()
    {
        return _t('Players registration') . ' - ' . $this->_mainEventRules->eventTitle();
    }

    /**
     * @return array
     */
    protected function _run(): array
    {
        $errorMsg = '';
        $registeredPlayers = [];
        $showAddRemovePlayer = false;
        $eventType = 'local'; // other types: tournament, online

        $sorter = function ($e1, $e2): int {
            return strcmp($e1['display_name'], $e2['display_name']);
        };

        if (empty($this->_mainEventId)) {
            return [
                'error' => _t('Main event is empty: this is unexpected behavior')
            ];
        }

        if (!empty($this->_lastError)) {
            $errorMsg = $this->_lastError;
        } else {
            try {
                $registeredPlayers = $this->_mimir->getAllPlayers($this->_eventIdList);
                usort($registeredPlayers, $sorter);
                $registeredPlayers = array_map(function ($el, $index) {
                    $el['index'] = $index + 1;
                    return $el;
                }, $registeredPlayers, array_keys($registeredPlayers));

                $ev = $this->_mimir->getEventsById($this->_eventIdList);
                $showAddRemovePlayer = count($ev) === 1 && !$ev[0]['tournamentStarted'];
                $eventType = count($ev) === 1 ? $ev[0]['type'] : 'local';
            } catch (\Exception $e) {
                $registeredPlayers = [];
                $errorMsg = $e->getMessage();
            }
        }

        return [
            'authorized' => $this->_userHasAdminRights(),
            'isAggregated' => (count($this->_eventIdList) > 1),
            'prescriptedEvent' => $this->_mainEventRules->isPrescripted(),
            'onlineEvent' => $this->_mainEventRules->isOnline(),
            'teamEvent' => $this->_mainEventRules->isTeam(),
            'showAddRemove' => $showAddRemovePlayer,
            'showReplace' => $eventType !== 'local',
            // === non-prescripted tournaments
            'canUseSeatingIgnore' => $this->_mainEventRules->syncStart() && !$this->_mainEventRules->isPrescripted(),
            'lastindex' => count($registeredPlayers) + 2,
            'error' => $errorMsg,
            'registered' => $registeredPlayers,
            'registeredCount' => count($registeredPlayers),
        ];
    }

    /**
     * @return bool
     */
    protected function _beforeRun()
    {
        if (count($this->_eventIdList) > 1) {
            $this->_lastError = _t("Page not available for aggregated events");
            return true;
        }

        if (empty($this->_mainEventId)) {
            $this->_lastError = _t('Main event is empty: this is unexpected behavior');
            return true;
        }

        if (!$this->_userHasAdminRights()) {
            $this->_lastError = _t("Wrong admin password");
            return true;
        }

        if (!empty($_POST['action_type'])) {
            switch ($_POST['action_type']) {
                case 'event_reg':
                    $err = $this->_registerUserForEvent($_POST['id']);
                    if (!$err) {
                        echo json_encode(['success' => true]);
                    } else {
                        echo json_encode(['success' => false, 'error' => $err]);
                    }
                    return false;
                    break;
                case 'event_unreg':
                    $err = $this->_unregisterUserFromEvent($_POST['id']);
                    break;
                case 'update_replacement':
                    $err = $this->_updateReplacement($_POST['id'], $_POST['replacement']);
                    if (!$err) {
                        echo json_encode(['success' => true]);
                    } else {
                        echo json_encode(['success' => false, 'error' => $err]);
                    }
                    return false;
                case 'update_ignore_seating':
                    $err = $this->_updateIgnoreSeating($_POST['id'], $_POST['ignore']);
                    break;
                case 'save_local_ids':
                    $err = $this->_saveLocalIds($_POST['map_json']);
                    break;
                case 'save_teams':
                    $err = $this->_saveTeams($_POST['map_json']);
                    break;
                case 'find_persons':
                    [$err, $result] = $this->_findPersons($_POST['query']);
                    if (empty($err)) {
                        echo json_encode($result);
                    } else {
                        echo json_encode(['error' => $err]);
                    }
                    return false;
                default:
                    ;
            }

            if (empty($err)) {
                header('Location: ' . Url::make('/reg/', (string)$this->_mainEventId));
                return false;
            }

            $this->_lastError = $err;
        }
        return true;
    }

    protected function _findPersons($query)
    {
        $errorMsg = '';
        $result = [];
        try {
            $result = $this->_frey->findByTitle($query);
        } catch (\Exception $e) {
            $errorMsg = $e->getMessage();
        };

        return [$errorMsg, $result];
    }

    /**
     * @param int $userId
     * @return string
     */
    protected function _registerUserForEvent(int $userId)
    {
        $errorMsg = '';
        try {
            $success = $this->_mainEventId && $this->_mimir->registerPlayerCP($userId, $this->_mainEventId);
            if (!$success) {
                $errorMsg = _t('Failed to register the player. Check your network connection.');
            }
        } catch (\Exception $e) {
            $errorMsg = $e->getMessage();
        };

        return $errorMsg;
    }

    /**
     * @param int $userId
     * @return string
     */
    protected function _unregisterUserFromEvent(int $userId): string
    {
        $errorMsg = '';
        try {
            if ($this->_mainEventId) {
                $this->_mimir->unregisterPlayerCP($userId, $this->_mainEventId);
            }
        } catch (\Exception $e) {
            $errorMsg = $e->getMessage();
        };

        return $errorMsg;
    }

    /**
     * @param string $json
     * @return string
     */
    protected function _saveLocalIds(string $json)
    {
        $errorMsg = '';
        $mapping = json_decode($json, true);
        try {
            $success = $this->_mainEventId && $this->_mimir->updatePlayersLocalIds($this->_mainEventId, $mapping);
            if (!$success) {
                $errorMsg = _t('Failed to save local ids mapping. Check your network connection.');
            }
        } catch (\Exception $e) {
            $errorMsg = $e->getMessage();
        }

        return $errorMsg;
    }

    /**
     * @param string $json
     * @return string
     */
    protected function _saveTeams(string $json)
    {
        $errorMsg = '';
        $mapping = json_decode($json, true);
        try {
            $success = $this->_mainEventId && $this->_mimir->updatePlayersTeams($this->_mainEventId, $mapping);
            if (!$success) {
                $errorMsg = _t('Failed to save teams mapping. Check your network connection.');
            }
        } catch (\Exception $e) {
            $errorMsg = $e->getMessage();
        }

        return $errorMsg;
    }

    /**
     * @param int $playerId
     * @param bool $ignore
     * @return string
     */
    protected function _updateIgnoreSeating(int $playerId, bool $ignore)
    {
        $errorMsg = '';
        try {
            $success = $this->_mainEventId && $this->_mimir->updatePlayerSeatingFlagCP($playerId, $this->_mainEventId, $ignore ? 1 : 0);
            if (!$success) {
                $errorMsg = _t('Failed to save ignore seating flag. Check your network connection.');
            }
        } catch (\Exception $e) {
            $errorMsg = $e->getMessage();
        }

        return $errorMsg;
    }

    /**
     * @param int $playerId
     * @param int $replacement
     * @return string
     */
    protected function _updateReplacement(int $playerId, int $replacement)
    {
        $errorMsg = '';
        try {
            $success = $this->_mainEventId && $this->_mimir->updatePlayerReplacement(
                $playerId, $this->_mainEventId, $replacement
            );
            if (!$success) {
                $errorMsg = _t('Failed to save replacement player. Check your network connection.');
            }
        } catch (\Exception $e) {
            $errorMsg = $e->getMessage();
        }

        return $errorMsg;
    }
}
