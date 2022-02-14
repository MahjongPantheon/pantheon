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
require_once __DIR__ . '/../../../Common/rulesets/Ruleset.php';
require_once __DIR__ . '/../../../Common/YakuMap.php';

class UserActionEventEdit extends Controller
{
    /**
     * @var string
     */
    protected $_mainTemplate = 'UserActionEventEdit';
    /**
     * @var null|string|array
     */
    protected $_error = null;
    /**
     * @var array
     */
    protected $_prevData = [];
    /**
     * @var string[]
     */
    protected $_typeMap = [
        'newClubEvent' => 'club',
        'newTournamentEvent' => 'tournament',
        'newOnlineEvent' => 'online',
    ];
    /**
     * @var array
     */
    protected $_defaultSettings = [
        'duration' => 90,
        'seriesLength' => 0,
        'minGames' => 0,
        'available_langs' => ['en', 'ru', 'de'],
        'isTeam' => false,
        'isPrescripted' => false,
    ];

    /**
     * @return string
     */
    protected function _pageTitle()
    {
        return _t('Control panel: create event');
    }

    /**
     * @return bool
     */
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

    /**
     * @return array|string|null
     */
    protected function _run()
    {
        if (!empty($this->_error)) {
            return $this->_error;
        }

        switch ($this->_path['action']) {
            case 'editEvent':
                return $this->_editEvent(intval($this->_path['id']));
            case 'newClubEvent':
                return $this->_newClubEvent($this->_prevData);
            case 'newTournamentEvent':
                return $this->_newTournamentEvent($this->_prevData);
            case 'newOnlineEvent':
                return $this->_newOnlineEvent($this->_prevData);
            default:
        }
        return null;
    }

    /**
     * @param array $prevData
     * @return array
     */
    protected function _newClubEvent($prevData)
    {
        $rulesets = $this->_getRulesets($prevData['ruleset'] ?? '', $prevData);
        return array_merge($this->_defaultSettings, $prevData, [
            'isTournament' => false,
            'isOnline' => false,
            'available_rulesets' => $rulesets['rulesets'],
            'ruleset_fields' => $rulesets['fields'],
            'ruleset_fields_names' => $rulesets['fields_names'],
            'all_yaku' => $rulesets['all_yaku'],
            'pao_yaku' => $rulesets['pao_yaku'],
            'yaku_translations' => $rulesets['yaku_translations'],
            'available_timezones' => $this->_getTimezones($prevData['timezone'] ?? ''),
        ]);
    }

    /**
     * @param array $prevData
     * @return array
     */
    protected function _newTournamentEvent($prevData)
    {
        $rulesets = $this->_getRulesets($prevData['ruleset'] ?? '', $prevData);
        return array_merge($this->_defaultSettings, $prevData, [
            'isTournament' => true,
            'isOnline' => false,
            'available_rulesets' => $rulesets['rulesets'],
            'ruleset_fields' => $rulesets['fields'],
            'ruleset_fields_names' => $rulesets['fields_names'],
            'all_yaku' => $rulesets['all_yaku'],
            'pao_yaku' => $rulesets['pao_yaku'],
            'yaku_translations' => $rulesets['yaku_translations'],
            'available_timezones' => $this->_getTimezones(empty($prevData['timezone']) ? '' : $prevData['timezone']),
        ]);
    }

    /**
     * @param array $prevData
     * @return array
     */
    protected function _newOnlineEvent($prevData)
    {
        $rulesets = $this->_getRulesets($prevData['ruleset'] ?? '', $prevData);
        return array_merge($this->_defaultSettings, $prevData, [
            'isTournament' => false,
            'isOnline' => true,
            'available_rulesets' => $rulesets['rulesets'],
            'ruleset_fields' => $rulesets['fields'],
            'ruleset_fields_names' => $rulesets['fields_names'],
            'all_yaku' => $rulesets['all_yaku'],
            'pao_yaku' => $rulesets['pao_yaku'],
            'yaku_translations' => $rulesets['yaku_translations'],
            'available_timezones' => $this->_getTimezones(empty($prevData['timezone']) ? '' : $prevData['timezone']),
        ]);
    }

    /**
     * @param int $eventId
     * @return array
     */
    protected function _editEvent($eventId)
    {
        if (!empty($this->_prevData)) { // Saving after errors
            $prevData = $this->_prevData;
        } else {
            $prevData = $this->_mimir->getEventForEdit($eventId);
        }
        $rulesets = $this->_getRulesets(empty($prevData['ruleset']) ? '' : $prevData['ruleset'], json_decode($prevData['rulesetChanges'], true));
        return array_merge($this->_defaultSettings, $prevData, [
            'id' => $this->_path['id'],
            'isTournament' => !!($prevData['isTournament'] ?? 0),
            'isOnline' => !!($prevData['isOnline'] ?? 0),
            'lobbyId' => 'C' . substr($prevData['lobbyId'], 1),
            'currentRuleset' => $prevData['ruleset'],
            'available_rulesets' => $rulesets['rulesets'],
            'ruleset_fields' => $rulesets['fields'],
            'ruleset_fields_names' => $rulesets['fields_names'],
            'all_yaku' => $rulesets['all_yaku'],
            'pao_yaku' => $rulesets['pao_yaku'],
            'yaku_translations' => $rulesets['yaku_translations'],
            'available_timezones' => $this->_getTimezones(empty($prevData['timezone']) ? '' : $prevData['timezone']),
        ]);
    }

    /**
     * @param string $current
     * @param array $changes
     * @return array
     */
    protected function _getRulesets($current, $changes = [])
    {
        $rulesets = $this->_mimir->getRulesets();
        $output = [];
        foreach ($rulesets['rules'] as $ident => $data) {
            $output []= [
                'ident' => $ident,
                'name' => $data['description'],
                'originalRules' => json_encode($data['originalRules']),
                'changes' => ($current === $ident && $changes != null) ? json_encode($changes) : '{}',
                'selected' => $current === $ident
            ];
        }
        return [
            'rulesets' => $output,
            'fields' => json_encode($rulesets['fields']),
            'fields_names' => json_encode(\Common\Ruleset::fieldDescriptions()),
            'all_yaku' => json_encode(\Common\YakuMap::allYaku()),
            'pao_yaku' => json_encode(\Common\YakuMap::allPaoYaku()),
            'yaku_translations' => json_encode(\Common\YakuMap::getTranslations())
        ];
    }

    /**
     * @param string $current
     * @return array
     */
    protected function _getTimezones($current)
    {
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

    /**
     * @param array $data
     * @return mixed
     */
    protected function _checkData($data)
    {
        $checkedData = $data;
        if (mb_strlen($data['title']) < 4) {
            $checkedData['error_title'] = _t('Title must be at least 4 characters length');
        }

        if (empty($data['titleEn'])) {
            $checkedData['titleEn'] = $this->_transliterate($data['title']);
        } else {
            if (mb_strlen($data['titleEn']) < 4) {
                $checkedData['error_titleEn'] = _t('Title must be at least 4 characters length');
            } else {
                $checkedData['titleEn'] = $data['titleEn'];
            }
        }

        $fieldsTypes = json_decode($checkedData['fields_json'], true);
        unset($checkedData['fields_json']);

        // Little sanitization and reforamtting
        if (empty($data['description'])) {
            $checkedData['description'] = '-';
        }

        if (empty($data['descriptionEn'])) {
            $checkedData['descriptionEn'] = $this->_transliterate($data['description']);
        } else {
            $checkedData['descriptionEn'] = $data['description'];
        }

        if (empty($data['duration']) && !empty($data['isTournament'])) {
            $checkedData['error_duration'] = _t('There must be non-zero duration for tournaments');
        }

        if (!empty($data['isOnline']) && (
            empty($data['lobbyId']) || !preg_match('#^C\d+$#is', $data['lobbyId']))
        ) {
            $checkedData['error_lobbyId'] = _t('Lobby id must be in format: C####, where # is a digit');
        }

        if (!empty($data['seriesLength']) && (!is_numeric($data['seriesLength']) || $data['seriesLength'] < 0)) {
            $checkedData['error_seriesLength'] = _t('Series length must be positive numeric value');
        }

        if (!empty($data['minGames']) && (!is_numeric($data['minGames']) || $data['minGames'] < 0)) {
            $checkedData['error_minGames'] = _t('Minimal games count must be positive numeric value');
        }

        $checkedData['rulesetChanges'] = [];
        foreach ($checkedData as $key => $val) {
            if (strpos($key, 'tuning_') === 0) {
                unset($checkedData[$key]);
                if ($val === 'on') {
                    $checkedData['rulesetChanges'][str_replace('tuning_', '', $key)] = true;
                } else if (is_numeric($val)) {
                    $checkedData['rulesetChanges'][str_replace('tuning_', '', $key)] = intval($val);
                } else if (is_array($val) && $key === 'tuning_uma') {
                    $checkedData['rulesetChanges'][str_replace('tuning_', '', $key)] = [1 => $val[0], $val[1], $val[2], $val[3]];
                } else {
                    $checkedData['rulesetChanges'][str_replace('tuning_', '', $key)] = array_map('intval', $val);
                }
            }
        }

        // Force boolean flags to false
        foreach ($fieldsTypes as $name => $type) {
            if ($type === 'bool' && !isset($checkedData['rulesetChanges'][$name])) {
                $checkedData['rulesetChanges'][$name] = false;
            }
        }

        foreach ($checkedData as $key => $val) {
            if (strpos($key, 'error_') === 0) {
                $checkedData['haveErrors'] = true;
                break;
            }
        }

        return $checkedData;
    }

    /**
     * @param array $checkData
     * @return bool
     */
    protected function _saveNewEvent($checkData)
    {
        if (!$this->_currentPersonId) {
            header('Location: /', false, 302);
            return false;
        }
        $id = $this->_mimir->createEvent(
            $this->_typeMap[$this->_path['action']],
            $checkData['title'],
            $checkData['description'],
            $checkData['titleEn'],
            $checkData['descriptionEn'],
            $checkData['lang'],
            $checkData['ruleset'],
            intval($checkData['duration'] ?? 0),
            $checkData['timezone'] ?? '',
            intval($checkData['seriesLength'] ?? 0),
            intval($checkData['minGames'] ?? 0),
            empty($checkData['lobbyId']) ? 0 : intval('1' . str_replace('C', '', $checkData['lobbyId'])),
            empty($checkData['isTeam']) ? false : true,
            empty($checkData['isPrescripted']) ? false : true,
            empty($checkData['rulesetChanges']) ? '{}' : (json_encode($checkData['rulesetChanges']) ?: '{}')
        );
        $ruleId = $this->_frey->addRuleForPerson(
            FreyClient::PRIV_ADMIN_EVENT,
            true,
            'bool',
            $this->_currentPersonId,
            $id
        );
        if (!$ruleId) {
            $this->_error = [
                'error' => _p('Failed to assign administrative rights. Consult support and give them id #%s', $id),
                'critical' => true
            ];
            return true;
        }
        header('Location: /eid' . $id, false, 302);
        return false;
    }

    /**
     * @param array $checkData
     * @return bool
     */
    protected function _saveExistingEvent($checkData)
    {
        $success = $this->_mimir->updateEvent(
            intval($this->_path['id']),
            $checkData['title'],
            $checkData['description'],
            $checkData['titleEn'],
            $checkData['descriptionEn'],
            $checkData['lang'],
            $checkData['ruleset'],
            intval($checkData['duration'] ?? 0),
            $checkData['timezone'] ?? '',
            intval($checkData['seriesLength'] ?? 0),
            intval($checkData['minGames'] ?? 0),
            empty($checkData['lobbyId']) ? 0 : intval('1' . str_replace('C', '', $checkData['lobbyId'])),
            empty($checkData['isTeam']) ? false : true,
            empty($checkData['isPrescripted']) ? false : true,
            empty($checkData['rulesetChanges']) ? '{}' : (json_encode($checkData['rulesetChanges']) ?: '{}')
        );
        if (!$success) {
            $this->_error = [
                'error' => _p('Failed to save event #%s - this should not happen', $this->_path['id']),
                'critical' => true
            ];
            return true;
        }

        header('Location: /eid' . $this->_path['id'], false, 302);
        return false;
    }
}
