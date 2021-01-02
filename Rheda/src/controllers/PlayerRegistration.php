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
                $registeredPlayers = $this->_api->execute('getAllPlayers', [$this->_eventIdList]);
                $enrolledPlayers = $this->_api->execute('getAllEnrolled', [$this->_mainEventId]);
                usort($enrolledPlayers, $sorter);
                usort($registeredPlayers, $sorter);
                $registeredPlayers = array_map(function ($el, $index) {
                    $el['index'] = $index + 1;
                    return $el;
                }, $registeredPlayers, array_keys($registeredPlayers));
            } catch (\Exception $e) {
                $registeredPlayers = [];
                $enrolledPlayers = [];
                $errorMsg = $e->getMessage();
            }
        }

        return [
            'authorized' => $this->_adminAuthOk(),
            'isAggregated' => (count($this->_eventIdList) > 1),
            'prescriptedEvent' => $this->_mainEventRules->isPrescripted(),
            'onlineEvent' => $this->_mainEventRules->isOnline(),
            'teamEvent' => $this->_mainEventRules->isTeam(),
            // === non-prescripted tournaments
            'canUseSeatingIgnore' => $this->_mainEventRules->syncStart() && !$this->_mainEventRules->isPrescripted(),
            'lastindex' => count($registeredPlayers) + 2,
            'error' => $errorMsg,
            'registered' => $registeredPlayers,
            'enrolled' => $enrolledPlayers,
            'showPrint' => count($enrolledPlayers) > 0,
            'registeredCount' => count($registeredPlayers),
            'enrolledCount' => count($enrolledPlayers)
        ];
    }

    protected function _beforeRun()
    {
        if (count($this->_eventIdList) > 1) {
            $this->_lastError = _t("Page not available for aggregated events");
            return true;
        }

        if (!$this->_adminAuthOk()) {
            $this->_lastError = _t("Wrong admin password");
            return true;
        }

        if (!empty($this->_path['print'])) {
            $this->_printCards();
            return false; // just print our cards and exit
        }

        if (!empty($_POST['action_type'])) {
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
                case 'update_ignore_seating':
                    $err = $this->_updateIgnoreSeating($_POST['id'], $_POST['ignore']);
                    break;
                case 'save_local_ids':
                    $err = $this->_saveLocalIds($_POST['map_json']);
                    break;
                case 'save_teams':
                    $err = $this->_saveTeams($_POST['map_json']);
                    break;
                default:
                    ;
            }

            if (empty($err)) {
                header('Location: ' . Url::make('/reg/', $this->_mainEventId));
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
            $success = $this->_api->execute('registerPlayerCP', [$userId, $this->_mainEventId]);
            if (!$success) {
                $errorMsg = _t('Failed to register the player. Check your network connection.');
            }
        } catch (\Exception $e) {
            $errorMsg = $e->getMessage();
        };

        return $errorMsg;
    }

    protected function _unregisterUserFromEvent($userId)
    {
        $errorMsg = '';
        try {
            $this->_api->execute('unregisterPlayerCP', [$userId, $this->_mainEventId]);
        } catch (\Exception $e) {
            $errorMsg = $e->getMessage();
        };

        return $errorMsg;
    }

    protected function _reenrollUserForEvent($userId)
    {
        $errorMsg = '';
        try {
            $success = $this->_api->execute('enrollPlayerCP', [$userId, $this->_mainEventId]);
            if (!$success) {
                $errorMsg = _t('Failed to enroll the player. Check your network connection.');
            }
        } catch (\Exception $e) {
            $errorMsg = $e->getMessage();
        };

        return $errorMsg;
    }

    protected function _saveLocalIds($json)
    {
        $errorMsg = '';
        $mapping = json_decode($json, true);
        try {
            $success = $this->_api->execute('updatePlayersLocalIds', [$this->_mainEventId, $mapping]);
            if (!$success) {
                $errorMsg = _t('Failed to save local ids mapping. Check your network connection.');
            }
        } catch (\Exception $e) {
            $errorMsg = $e->getMessage();
        }

        return $errorMsg;
    }

    protected function _saveTeams($json)
    {
        $errorMsg = '';
        $mapping = json_decode($json, true);
        try {
            $success = $this->_api->execute('updatePlayersTeams', [$this->_mainEventId, $mapping]);
            if (!$success) {
                $errorMsg = _t('Failed to save teams mapping. Check your network connection.');
            }
        } catch (\Exception $e) {
            $errorMsg = $e->getMessage();
        }

        return $errorMsg;
    }

    protected function _updateIgnoreSeating($playerId, $ignore)
    {
        $errorMsg = '';
        try {
            $success = $this->_api->execute('updatePlayerSeatingFlagCP', [$playerId, $this->_mainEventId, $ignore ? 1 : 0]);
            if (!$success) {
                $errorMsg = _t('Failed to save ignore seating flag. Check your network connection.');
            }
        } catch (\Exception $e) {
            $errorMsg = $e->getMessage();
        }

        return $errorMsg;
    }

    protected function _printCards()
    {
        /** @var array $enrolledPlayers */
        $enrolledPlayers = $this->_api->execute('getAllEnrolled', [$this->_mainEventId]);
        $host = Sysconf::MOBILE_CLIENT_URL();

        $options = new QROptions([
            'version'    => 5,
            'outputType' => QRCode::OUTPUT_MARKUP_SVG,
            'eccLevel'   => QRCode::ECC_L,
        ]);

        // invoke a fresh QRCode instance
        $qrcode = new QRCode($options);

        $origFile = file_get_contents(__DIR__ . '/../../www/assets/printcard.svg');

        $i = 0;
        $data = implode(PHP_EOL, array_map(function ($playerEntry) use ($host, $qrcode, $origFile, &$i) {
            $xIdx = $i % 2;
            $yIdx = ceil($i / 2);
            $xOffset = 20 + $xIdx * 88;
            $yOffset = 20 + $yIdx * 55;
            $i++;

            $qrlink = $host . '/' . $playerEntry['pin'] . '_' . dechex(crc32($playerEntry['pin']));
            return str_replace(
                ['%name', '%pin', '%host', '%qr', '%xoffset', '%yoffset'],
                [
                    $playerEntry['display_name'],
                    $playerEntry['pin'],
                    $host,
                    str_replace('<svg', '<svg width="32" height="32" x="54" y="18"', $qrcode->render($qrlink)),
                    $xOffset . 'mm',
                    $yOffset . 'mm'
                ],
                $origFile
            );
        }, $enrolledPlayers));

        header('Content-type: image/svg+xml');
        echo <<<SVG
<?xml version="1.0" encoding="UTF-8"?>
<svg version="1.1" width="210.03mm" height="297.02mm" x="10mm">
  $data
</svg>
SVG;
    }
}
