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

class PlayerRegistration extends Controller
{
    protected $_mainTemplate = 'PlayerRegistration';
    protected $_lastError = '';

    protected function _pageTitle()
    {
        return _t('Players registration');
    }

    protected function _run()
    {
        $errorMsg = '';
        $registeredPlayers = [];
        $enrolledPlayers = [];

        $sorter = function ($e1, $e2) {
            return strcmp($e1['display_name'], $e2['display_name']);
        };

        if (!empty($this->_lastError)) {
            $errorMsg = $this->_lastError;
        } else {
            try {
                $registeredPlayers = $this->_api->execute('getAllPlayers', [$this->_eventId]);
                $enrolledPlayers = $this->_api->execute('getAllEnrolled', [$this->_eventId]);
                usort($enrolledPlayers, $sorter);
                usort($registeredPlayers, $sorter);
            } catch (Exception $e) {
                $registeredPlayers = [];
                $enrolledPlayers = [];
                $errorMsg = $e->getMessage();
            }
        }

        return [
            'error' => $errorMsg,
            'registered' => $registeredPlayers,
            'enrolled' => $enrolledPlayers,
            'registeredCount' => count($registeredPlayers),
            'enrolledCount' => count($enrolledPlayers)
        ];
    }

    protected function _beforeRun()
    {
        if (!empty($_POST['action_type'])) {
            if (!$this->_adminAuthOk()) {
                $this->_lastError = _t("Wrong admin password");
                return true;
            }

            switch ($_POST['action_type']) {
                case 'event_reg':
                    $err = $this->_registerUserForEvent($_POST['id']);
                    break;
                case 'event_unreg':
                    $err = $this->_unregisterUserFromEvent($_POST['id']);
                    break;
                case 'reenroll':
                    $err = $this->_reenrollUserForEvent($_POST['id']);
                    break;
                default:
                    ;
            }

            if (empty($err)) {
                header('Location: ' . Url::make('/reg/', $this->_eventId));
                return false;
            }

            $this->_lastError = $err;
        }
        return true;
    }

    protected function _registerUserForEvent($userId)
    {
        $errorMsg = '';
        try {
            $success = $this->_api->execute('registerPlayerCP', [$userId, $this->_eventId]);
            if (!$success) {
                $errorMsg = _t('Failed to register the player. Check your network connection.');
            }
        } catch (Exception $e) {
            $errorMsg = $e->getMessage();
        };

        return $errorMsg;
    }

    protected function _unregisterUserFromEvent($userId)
    {
        $errorMsg = '';
        try {
            $this->_api->execute('unregisterPlayerCP', [$userId, $this->_eventId]);
        } catch (Exception $e) {
            $errorMsg = $e->getMessage();
        };

        return $errorMsg;
    }

    protected function _reenrollUserForEvent($userId)
    {
        $errorMsg = '';
        try {
            $success = $this->_api->execute('enrollPlayerCP', [$userId, $this->_eventId]);
            if (!$success) {
                $errorMsg = _t('Failed to enroll the player. Check your network connection.');
            }
        } catch (Exception $e) {
            $errorMsg = $e->getMessage();
        };

        return $errorMsg;
    }
}
