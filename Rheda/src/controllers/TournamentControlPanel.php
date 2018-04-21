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

    const STAGE_NOT_READY = 1;
    const STAGE_READY_BUT_NOT_STARTED = 2;
    const STAGE_SEATING_INPROGRESS = 3;
    const STAGE_SEATING_READY = 4;
    const STAGE_STARTED = 5;
    const STAGE_PREFINISHED = 6;

    protected function _pageTitle()
    {
        return _t('Tournament control panel');
    }

    protected function _beforeRun()
    {
        if (!empty($this->_path['action'])) {
            if (count($this->_eventIdList) > 1) {
                return true; // to show error in _run
            }

            if (!$this->_adminAuthOk()) {
                return true; // to show error in _run
            }

            try {
                switch ($this->_path['action']) {
                    case 'shuffledSeating':
                        $this->_api->execute('makeShuffledSeating', [$this->_eventId, 1, mt_rand(100000, 999999)]);
                        break;
                    case 'intervalSeating':
                        $this->_api->execute(
                            'makeIntervalSeating',
                            [$this->_eventId, intval($_POST['step'])]
                        );
                        break;
                    case 'predefinedSeating':
                        $this->_api->execute('makePrescriptedSeating', [$this->_eventId, isset($_POST['rndseat']) && $_POST['rndseat'] == 1]);
                        break;
                    case 'swissSeating':
                        $this->_api->execute('makeSwissSeating', [$this->_eventId]);
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
                    default:
                        ;
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

        if (count($this->_eventIdList) > 1) {
            return [
                'error' => _t('Page not supported for aggregated events')
            ];
        }

        if (!$this->_adminAuthOk()) {
            return [
                'error' => _t('Wrong admin password')
            ];
        }

        if (!empty($this->_lastEx)) {
            return [
                'error' => $this->_lastEx->getMessage()
            ];
        }

        $errCode = null;

        // Api calls. TODO: merge into one? Http pipelining maybe?
        $tables = $this->_api->execute('getTablesState', [$this->_eventId]);
        $tablesFormatted = $formatter->formatTables($tables, $this->_rules->gamesWaitingForTimer());
        $players = $this->_api->execute('getAllPlayers', [$this->_eventIdList]);
        $timerState = $this->_api->execute('getTimerState', [$this->_eventId]);

        $currentStage = $this->_determineStage($tablesFormatted, $players, $timerState);

        $nextPrescriptedSeating = [];
        if ($this->_rules->isPrescripted() && $currentStage == self::STAGE_READY_BUT_NOT_STARTED) {
            try {
                $nextPrescriptedSeating = $this->_api->execute('getNextPrescriptedSeating', [$this->_eventId]);
                if (!empty($nextPrescriptedSeating)) {
                    array_unshift($nextPrescriptedSeating, []); // small hack to start from 1
                }
            } catch (\Exception $e) {
                return [
                    'error' => null,
                    'prescriptedEventErrorDescription' => $e->getCode() == 1404
                        ? _t('No seating defined. Check "Admin actions / Predefined seating" page to define seating for tournament')
                        : $e->getMessage()
                ];
            }
        }

        return [
            'error' => null,
            'tablesList' => empty($_POST['description']) ? '' : $_POST['description'],
            'tables' => $tablesFormatted,
            'stageNotReady' => $currentStage == self::STAGE_NOT_READY,
            'stageReadyButNotStarted' => $currentStage == self::STAGE_READY_BUT_NOT_STARTED,
            'stageSeatingReady' => $currentStage == self::STAGE_SEATING_READY,
            'stageSeatingInProgress' => $currentStage == self::STAGE_SEATING_INPROGRESS,
            'stageStarted' => $currentStage == self::STAGE_STARTED,
            'stagePrefinished' => $currentStage == self::STAGE_PREFINISHED,
            'withAutoSeating' => $this->_rules->autoSeating(),
            'hideResults' => $this->_rules->hideResults(),
            'isPrescripted' => $this->_rules->isPrescripted(),
            'nextPrescriptedSeating' => $nextPrescriptedSeating,
            'noNextPrescript' => empty($nextPrescriptedSeating)
        ];
    }

    protected function _determineStage(&$tables, &$players, &$timerState)
    {
        $notFinishedTablesCount = array_reduce($tables, function ($acc, $i) {
            return $acc + ($i['status'] == 'finished' ? 0 : 1);
        }, 0);

        // This will include both prefinished and finished tables, to show the "Finalize" button in case of any errors.
        // If some of tables are finished, and some are prefinished, this will allow recovering working state.
        $prefinishedTablesCount = array_reduce($tables, function ($acc, $i) {
            return $acc + ($i['status'] == 'prefinished' || $i['finished'] ? 1 : 0);
        }, 0);

        if (count($players) % 4 !== 0) {
            return self::STAGE_NOT_READY;
        } else {
            if ($this->_rules->syncEnd() && $prefinishedTablesCount == count($tables) && $notFinishedTablesCount != 0) {
                return self::STAGE_PREFINISHED;
            }
            if ($this->_rules->gamesWaitingForTimer() && $notFinishedTablesCount !== (count($players) / 4)) {
                return self::STAGE_SEATING_INPROGRESS;
            }
            if ($this->_rules->gamesWaitingForTimer() && $notFinishedTablesCount === (count($players) / 4)) {
                return self::STAGE_SEATING_READY;
            }
            if ($notFinishedTablesCount !== 0) {
                return self::STAGE_STARTED;
            }
        }

        return self::STAGE_READY_BUT_NOT_STARTED;
    }
}
