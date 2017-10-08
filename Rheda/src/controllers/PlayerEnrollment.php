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
namespace Riichi;

require_once __DIR__ . '/../helpers/Url.php';

class PlayerEnrollment extends Controller
{
    protected $_mainTemplate = 'PlayerEnrollment';
    protected $_lastError = '';

    protected function _pageTitle()
    {
        return 'Добавление игроков';
    }

    protected function _run()
    {
        $errorMsg = '';
        $registeredPlayers = [];

        if (!empty($this->_lastError)) {
            $errorMsg = $this->_lastError;
        } else {
            try {
                $registeredPlayers = $this->_api->execute('getEverybody', []);
                usort($registeredPlayers, function ($u1, $u2) {
                    return strcmp($u1['display_name'], $u2['display_name']);
                });
            } catch (Exception $e) {
                $registeredPlayers = [];
                $errorMsg = $e->getMessage();
            }
        }

        return [
            'error' => $errorMsg,
            'everybody' => $registeredPlayers
        ];
    }

    protected function _beforeRun()
    {
        if (!empty($_POST['action_type'])) {
            if (!$this->_adminAuthOk()) {
                $this->_lastError = "Секретное слово неправильное";
                return true;
            }

            switch ($_POST['action_type']) {
                case 'sys_reg':
                    $err = $this->_registerUserInSystem($_POST['ident'], $_POST['display_name']);
                    break;
                case 'enroll':
                    $err = $this->_enrollUserForEvent($_POST['id']);
                    break;
                default:
                    ;
            }

            if (empty($err)) {
                header('Location: ' . Url::make('/enroll/', $this->_eventId));
                return false;
            }

            $this->_lastError = $err;
        }
        return true;
    }

    protected function _registerUserInSystem($ident, $displayName)
    {
        $errorMsg = '';
        if (preg_match('#[^a-z0-9]+#is', $ident)) {
            $errorMsg = "В системном имени должны быть только латинские буквы и цифры, никаких пробелов";
        } else {
            try {
                $this->_api->execute('addPlayer', [$ident, $ident, $displayName, null]);
            } catch (Exception $e) {
                $errorMsg = $e->getMessage();
            };
        }

        return $errorMsg;
    }

    protected function _enrollUserForEvent($userId)
    {
        $errorMsg = '';
        try {
            $success = $this->_api->execute('enrollPlayerCP', [$userId, $this->_eventId]);
            if (!$success) {
                $errorMsg = 'Не удалось добавить игрока в списки - проблемы с сетью?';
            }
        } catch (Exception $e) {
            $errorMsg = $e->getMessage();
        };

        return $errorMsg;
    }
}
