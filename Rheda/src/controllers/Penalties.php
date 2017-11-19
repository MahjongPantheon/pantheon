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
require_once __DIR__ . '/../helpers/Array.php';

class Penalties extends Controller
{
    protected $_errors = [];
    protected $_mainTemplate = 'Penalties';

    protected function _pageTitle()
    {
        return _t('Penalties');
    }

    protected function _beforeRun()
    {
        $this->_errors = [];

        if ($this->_path['action'] == 'apply') {
            if (!$this->_adminAuthOk()) {
                return true; // to show error in _run
            }

            $userId = intval($_POST['player']);
            $amount = intval($_POST['amount']);
            $reason = $_POST['reason'];
            try {
                $this->_api->execute('addPenalty', [$this->_eventId, $userId, $amount, $reason]);
            } catch (Exception $e) {
                $this->_errors []= $e->getMessage();
                return true;
            }

            header('Location: ' . Url::make('/penalties/', $this->_eventId));
            return false;
        }

        return true;
    }

    protected function _run()
    {
        if (!$this->_adminAuthOk()) {
            return [
                'error' => _t('Wrong admin password')
            ];
        }

        $amounts = [];
        try {
            $players = $this->_api->execute('getAllPlayers', [$this->_eventId]);
            $settings = $this->_api->execute('getGameConfig', [$this->_eventId]);
            for ($i = $settings['minPenalty']; $i <= $settings['maxPenalty']; $i += $settings['penaltyStep']) {
                $amounts []= [
                    'view' => $i / (float)$settings['ratingDivider'],
                    'value' => $i
                ];
            }
        } catch (Exception $e) {
            $players = [];
            $this->_errors []= $e->getMessage();
        }

        return [
            'players' => $players,
            'penaltyAmounts' => $amounts,
            'error' => implode(', ', $this->_errors)
        ];
    }
}
