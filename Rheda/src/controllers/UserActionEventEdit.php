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

class UserActionEventEdit extends Controller
{
    protected $_mainTemplate = 'UserActionEventEdit';
    protected $_error = null;
    protected $_prevData = [];

    protected $_typeMap = [
        'newClubEvent' => 'club',
        'newTournamentEvent' => 'tournament',
        'newOnlineEvent' => 'online',
    ];
    protected $_defaultSettings = [
        'duration' => 90,
        'seriesLength' => 0,
        'minGames' => 0,
        'isTeam' => false,
        'isPrescripted' => false,
    ];

    protected function _pageTitle()
    {
        return _t('Control panel: create event');
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

        if (!empty($_POST['save'])) {
            $checkData = $this->_checkData($_POST);
            if ($checkData['haveErrors']) { // non-critical errors
                $this->_prevData = $checkData;
                return true;
            }

            try {
                if (empty($checkData['id'])) {
                    return $this->_saveNewEvent($checkData);
                } else {
                    return $this->_saveExistingEvent($checkData);
                }
            } catch (\Exception $e) {
                $this->_error = [
                    'error' => $e->getMessage(),
                    'critical' => true
                ];
                return true;
            }
        }

        return true;
    }

    protected function _run()
    {
        if (!empty($this->_error)) {
            return $this->_error;
        }

        switch ($this->_path['action']) {
            case 'editEvent':
                return $this->_editEvent($this->_path['id']);
            case 'newClubEvent':
                return $this->_newClubEvent($this->_prevData);
            case 'newTournamentEvent':
                return $this->_newTournamentEvent($this->_prevData);
            case 'newOnlineEvent':
                return $this->_newOnlineEvent($this->_prevData);
            default:;
        }
    }

    protected function _newClubEvent($prevData)
    {
        return array_merge($this->_defaultSettings, $prevData, [
            'isTournament' => false,
            'isOnline' => false,
            'available_rulesets' => $this->_getRulesets($prevData['ruleset'] ?? ''),
            'available_timezones' => $this->_getTimezones($prevData['timezone'] ?? ''),
        ]);
    }

    protected function _newTournamentEvent($prevData)
    {
        return array_merge($this->_defaultSettings, $prevData, [
            'isTournament' => true,
            'isOnline' => false,
            'available_rulesets' => $this->_getRulesets(empty($prevData['ruleset']) ? '' : $prevData['ruleset']),
            'available_timezones' => $this->_getTimezones(empty($prevData['timezone']) ? '' : $prevData['timezone']),
        ]);
    }

    protected function _newOnlineEvent($prevData)
    {
        return array_merge($this->_defaultSettings, $prevData, [
            'isTournament' => false,
            'isOnline' => true,
            'available_rulesets' => $this->_getRulesets(empty($prevData['ruleset']) ? '' : $prevData['ruleset']),
            'available_timezones' => $this->_getTimezones(empty($prevData['timezone']) ? '' : $prevData['timezone']),
        ]);
    }

    protected function _editEvent($eventId)
    {
        if (!empty($this->_prevData)) { // Saving after errors
            $prevData = $this->_prevData;
        } else {
            $prevData = $this->_mimir->getEventForEdit($eventId);
        }
        return array_merge($this->_defaultSettings, $prevData, [
            'id' => $this->_path['id'],
            'isTournament' => !!($prevData['isTournament'] ?? 0),
            'isOnline' => !!($prevData['isOnline'] ?? 0),
            'lobbyId' => 'C' . substr($prevData['lobbyId'], 1),
            'available_rulesets' => $this->_getRulesets(empty($prevData['ruleset']) ? '' : $prevData['ruleset']),
            'available_timezones' => $this->_getTimezones(empty($prevData['timezone']) ? '' : $prevData['timezone']),
        ]);
    }

    protected function _getRulesets($current) {
        $rulesets = $this->_mimir->getRulesets();
        $output = [];
        foreach ($rulesets as $ident => $name) {
            $output []= [
                'ident' => $ident,
                'name' => $name,
                'selected' => $current === $ident
            ];
        }
        return $output;
    }

    protected function _getTimezones($current) {
        $data = $this->_mimir->getTimezones($_SERVER['REMOTE_ADDR']);
        if (empty($current)) {
            $current = $data['preferredByIp'];
        }
        $output = [];
        foreach ($data['timezones'] as $tz) {
            $output []= ['ident' => $tz, 'selected' => $tz === $current];
        }
        return $output;
    }

    protected function _checkData($data)
    {
        $checkedData = $data;
        if (mb_strlen($data['title']) < 4) {
            $checkedData['error_title'] = _t('Title must be at least 4 characters length');
        }

        // Little sanitization and reforamtting
        if (empty($data['description'])) {
            $checkedData['description'] = '-';
        }

        if (empty($data['duration']) && !empty($data['isTournament'])) {
            $checkedData['error_duration'] = _t('There must be non-zero duration for tournaments');
        }

        if (!empty($data['isOnline']) && (
            empty($data['lobbyId']) || !preg_match('#^C\d+$#is', $data['lobbyId']))
        ) {
            $checkedData['error_lobbyId'] = _t('Lobby id must be in format: C####, where # is a digit');
        }

        if (!empty($data['seriesLength']) && !is_numeric($data['seriesLength'])) {
            $checkedData['error_seriesLength'] = _t('Series length must be numeric value');
        }

        if (!empty($data['minGames']) && !is_numeric($data['minGames'])) {
            $checkedData['error_minGames'] = _t('Minimal games count must be numeric value');
        }

        foreach ($checkedData as $key => $val) {
            if (strpos($key, 'error_') === 0) {
                $checkedData['haveErrors'] = true;
                break;
            }
        }

        return $checkedData;
    }

    protected function _saveNewEvent($checkData) {
        $id = $this->_mimir->createEvent(
            $this->_typeMap[$this->_path['action']],
            $checkData['title'],
            $checkData['description'],
            $checkData['ruleset'],
            intval($checkData['duration'] ?? 0),
            $checkData['timezone'] ?? '',
            intval($checkData['seriesLength'] ?? 0),
            intval($checkData['minGames'] ?? 0),
            empty($checkData['lobbyId']) ? 0 : intval('1' . str_replace('C', '', $checkData['lobbyId'])),
            empty($checkData['isTeam']) ? false : true,
            empty($checkData['isPrescripted']) ? false : true
        );
        $ruleId = $this->_frey->addRuleForPerson(FreyClient::PRIV_ADMIN_EVENT, true, 'bool', $this->_currentPersonId, $id);
        if (!$ruleId) {
            $this->_error = [
                'error' => _p('Failed to assign administrative rights. Consult support and give them id #%s', $id),
                'critical' => true
            ];
            return true;
        }
        header('Location: /eid' . $id, null, 302);
        return false;
    }

    protected function _saveExistingEvent($checkData) {
        $success = $this->_mimir->updateEvent(
            intval($this->_path['id']),
            $checkData['title'],
            $checkData['description'],
            $checkData['ruleset'],
            intval($checkData['duration'] ?? 0),
            $checkData['timezone'] ?? '',
            intval($checkData['seriesLength'] ?? 0),
            intval($checkData['minGames'] ?? 0),
            empty($checkData['lobbyId']) ? 0 : intval('1' . str_replace('C', '', $checkData['lobbyId'])),
            empty($checkData['isTeam']) ? false : true,
            empty($checkData['isPrescripted']) ? false : true
        );
        if (!$success) {
            $this->_error = [
                'error' => _p('Failed to save event #%s - this should not happen', $this->_path['id']),
                'critical' => true
            ];
            return true;
        }

        header('Location: /eid' . $this->_path['id'], null, 302);
        return false;
    }
}
