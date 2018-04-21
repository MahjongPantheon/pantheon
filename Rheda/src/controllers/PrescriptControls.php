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
    protected $_lastError = '';

    protected function _pageTitle()
    {
        return _t('Predefined seating and event status');
    }

    protected function _run()
    {
        $eventConfig = [
            'prescript' => '',
            'next_session_index' => 1,
            'has_errors' => false
        ];

        if (count($this->_eventIdList) > 1) {
            $this->_lastError = _t("Page not supported for aggregated events");
        }

        if (!empty($this->_lastError)) {
            $eventConfig['check_errors'] = [$this->_lastError];
            $eventConfig['has_errors'] = true;
        } else {
            try {
                $eventConfig = $this->_api->execute('getPrescriptedEventConfig', [$this->_eventId]);
            } catch (\Exception $e) {
                $eventConfig['check_errors'] = [$e->getMessage()];
                $eventConfig['has_errors'] = true;
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

    protected function _beforeRun()
    {
        if (!empty($_POST['action'])) {
            if (count($this->_eventIdList) > 1) {
                $this->_lastError = _t("Page not supported for aggregated events");
                return true;
            }

            if (!$this->_adminAuthOk()) {
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
                header('Location: ' . Url::make('/prescript', $this->_eventId));
                return false;
            }

            $this->_lastError = $err;
        }
        return true;
    }

    protected function _updatePrescript($prescript, $nextGameIndex)
    {
        $errorMsg = '';
        try {
            $success = $this->_api->execute('updatePrescriptedEventConfig', [$this->_eventId, $nextGameIndex, $prescript]);
            if (!$success) {
                $errorMsg = _t('Failed to update predefined seating. Check your network connection.');
            }
        } catch (\Exception $e) {
            $errorMsg = $e->getMessage();
        };

        return $errorMsg;
    }
}
