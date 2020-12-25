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

class UserActionNewEvent extends Controller
{
    protected $_mainTemplate = 'UserActionNewEvent';
    protected $_error = null;
    protected $_typeMap = [
        'newClubEvent' => 'club',
        'newTournamentEvent' => 'tournament',
        'newOnlineEvent' => 'online',
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
            // todo precheck data

            try {
                $id = $this->_mimir->createEvent(
                    $this->_typeMap[$this->_path['action']],
                    $_POST['title'],
                    $_POST['description'],
                    $_POST['ruleset'],
                    intval($_POST['duration'] ?? 0),
                    $_POST['timezone'] ?? '',
                    intval($_POST['seriesLength'] ?? 0),
                    intval($_POST['minGames'] ?? 0),
                    empty($_POST['isTeam']) ? false : true,
                    empty($_POST['isPrescripted']) ? false : true
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

        return [
            'critical' => false,

            'isTournament' => $this->_path['action'] === 'newTournamentEvent' || $this->_path['action'] === 'newOnlineEvent',
            'isOnline' => $this->_path['action'] === 'newOnlineEvent',

            'duration' => 90,
            'available_rulesets' => $this->_getRulesets(empty($_POST['ruleset']) ? '' : $_POST['ruleset']),
            'available_timezones' => $this->_getTimezones(empty($_POST['timezone']) ? '' : $_POST['timezone']),
            'seriesLength' => 0,
            'minGames' => 0,
            'isTeam' => false,
            'isPrescripted' => false,
        ];
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
}
