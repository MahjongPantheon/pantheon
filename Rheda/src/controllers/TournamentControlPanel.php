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
require_once __DIR__ . '/../helpers/GameFormatter.php';

class TournamentControlPanel extends Controller
{
    protected $_mainTemplate = 'TournamentControlPanel';
    /**
     * @var \Exception
     */
    protected $_lastEx = null;

    protected $_errors = [
        '_WRONG_PASSWORD' => 'Секретное слово неправильное',
        '_TABLES_NOT_FULL' => 'Столы не укомплектованы! Число игроков не делится нацело на 4, нужно добавить или убрать людей!',
        '_GAMES_STARTED' => 'Игры уже начаты / еще не завершены'
    ];

    protected function _pageTitle()
    {
        return 'Управление турниром';
    }

    protected function _beforeRun()
    {
        if (!empty($this->_path['action'])) {
            if (!$this->_adminAuthOk()) {
                return true; // to show error in _run
            }

            try {
                switch ($this->_path['action']) {
                    case 'shuffledSeating':
                        $this->_api->execute('startGamesWithSeating', [$this->_eventId, 1, mt_rand(100000, 999999)]);
                        break;
                    case 'manualSeating':
                        $this->_api->execute(
                            'startGamesWithManualSeating',
                            [$this->_eventId, $_POST['description'], $_POST['randomize'] == 'true']
                        );
                        break;
                    case 'swissSeating':
                        $this->_api->execute('startGamesWithSwissSeating', [$this->_eventId]);
                        break;
                    case 'startTimer':
                        $this->_api->execute('startTimer', [$this->_eventId]);
                        break;
                    case 'dropLastRound':
                        $this->_api->execute('dropLastRound', [$this->_path['hash']]);
                        break;
                    case 'finalizeSessions':
                        $this->_api->execute('finalizeSessions', [$this->_eventId]);
                        break;
                    case 'toggleHideResults':
                        $this->_api->execute('toggleHideResults', [$this->_eventId]);
                        break;
                    default:;
                }
            } catch (\Exception $e) {
                $this->_lastEx = $e;
                return true;
            }

            header('Location: ' . Url::make('/tourn/', $this->_eventId));
            return false;
        }

        return true;
    }

    protected function _run()
    {
        $formatter = new GameFormatter();

        if (!$this->_adminAuthOk()) {
            return [
                'showManualControls' => false,
                'showAutoControls' => false,
                'reason' => $this->_errors['_WRONG_PASSWORD']
            ];
        }

        if (!empty($this->_lastEx)) {
            return [
                'showManualControls' => false,
                'showAutoControls' => false,
                'reason' => $this->_lastEx->getMessage()
            ];
        }

        $errCode = null;

        // Tables info
        $tables = $this->_api->execute('getTablesState', [$this->_eventId]);
        $tablesFormatted = $formatter->formatTables($tables, $this->_rules->gamesWaitingForTimer());

        $unfinishedTablesCount = array_reduce($tablesFormatted, function ($acc, $i) {
            return $acc + ($i['finished'] ? 0 : 1);
        }, 0);

        // This will include both prefinished and finished tables, to show the button in case of any errors.
        // If some of tables are finished, and some are prefinished, this will allow recovering working state.
        $prefinishedTablesCount = array_reduce($tablesFormatted, function ($acc, $i) {
            return $acc + ($i['status'] == 'prefinished' || $i['finished'] ? 1 : 0);
        }, 0);

        $players = $this->_api->execute('getAllPlayers', [$this->_eventId]);
        if (count($players) % 4 !== 0) {
            $errCode = '_TABLES_NOT_FULL';
        } else {
            $timerState = $this->_api->execute('getTimerState', [$this->_eventId]);
            if ($timerState['started'] && $unfinishedTablesCount !== 0) { // Check once after click on START
                $errCode = '_GAMES_STARTED';
            }
            if ($unfinishedTablesCount === (count($players) / 4)) {
                // seating just done, timer not yet started, should show timer controls
                $errCode = '_GAMES_STARTED';
            }
        }

        return [
            'showManualControls' => !$this->_rules->gamesWaitingForTimer() && empty($errCode),
            'showAutoControls' => !$this->_rules->gamesWaitingForTimer() && empty($errCode) && $this->_rules->autoSeating(),
            'seatingReady' => $this->_rules->gamesWaitingForTimer(),
            'showTimerControls' => $this->_rules->syncStart() && !empty($errCode) && $errCode === '_GAMES_STARTED',
            'reason' => $errCode ? $this->_errors[$errCode] : '',
            'tablesList' => empty($_POST['description']) ? '' : $_POST['description'],
            'tables' => $tablesFormatted,
            'hideResults' => $this->_rules->hideResults(),
            'finalizeSessions' => $this->_rules->syncEnd() && $prefinishedTablesCount == count($tables) && $unfinishedTablesCount != 0
        ];
    }
}
