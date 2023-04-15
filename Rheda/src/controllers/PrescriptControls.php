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

class PrescriptControls extends Controller
{
    protected $_mainTemplate = 'PrescriptControls';
    /**
     * @var string
     */
    protected $_lastError = '';

    protected function _pageTitle()
    {
        return _t('Predefined seating and event status') . ' - ' . $this->_mainEventRules->eventTitle();
    }

    /**
     * @return array
     */
    protected function _run(): array
    {
        if (empty($this->_mainEventId)) {
            return [
                'error' => _t('Main event is empty: this is unexpected behavior')
            ];
        }

        $eventConfig = [
            'prescript' => '',
            'next_session_index' => 1
        ];

        if (count($this->_eventIdList) > 1) {
            $this->_lastError = _t("Page not available for aggregated events");
        }

        if (!empty($this->_lastError)) {
            $eventConfig['check_errors'] = [$this->_lastError];
        } else {
            try {
                $eventConfig = $this->_mimir->getPrescriptedEventConfig($this->_mainEventId);
            } catch (\Exception $e) {
                $eventConfig['check_errors'] = [$this->_handleTwirpEx($e) ?: $e->getMessage()];
            }
        }

        return [
            'isAggregated' => (count($this->_eventIdList) > 1),
            'errors' => $eventConfig['check_errors'],
            'has_errors' => count($eventConfig['check_errors']) > 0,
            'prescript' => $eventConfig['prescript'],
            'next_session_index' => $eventConfig['next_session_index']
        ];
    }

    /**
     * @return bool
     */
    protected function _beforeRun()
    {
        if (!empty($_POST['action'])) {
            if (count($this->_eventIdList) > 1) {
                $this->_lastError = _t("Page not available for aggregated events");
                return true;
            }

            if (!$this->_userHasAdminRights()) {
                $this->_lastError = _t("Wrong admin password");
                return true;
            }

            switch ($_POST['action']) {
                case 'update':
                    $err = $this->_updatePrescript($_POST['prescript'], $_POST['next_session_index']);
                    break;
                default:
                    ;
            }

            if (empty($err)) {
                header('Location: ' . Url::make('/prescript', (string)$this->_mainEventId));
                return false;
            }

            $this->_lastError = $err;
        }
        return true;
    }

    /**
     * @param string $prescript
     * @param int $nextGameIndex
     * @return string
     */
    protected function _updatePrescript($prescript, $nextGameIndex)
    {
        $errorMsg = '';
        try {
            $success = $this->_mainEventId && $this->_mimir->updatePrescriptedEventConfig($this->_mainEventId, $nextGameIndex, $prescript);
            if (!$success) {
                $errorMsg = _t('Failed to update predefined seating. Check your network connection.');
            }
        } catch (\Exception $e) {
            $errorMsg = $this->_handleTwirpEx($e) ?: $e->getMessage();
        };

        return $errorMsg;
    }
}
