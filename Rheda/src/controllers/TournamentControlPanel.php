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
     * @var ?\Exception
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
        return _t('Tournament control panel') . ' - ' . $this->_mainEventRules->eventTitle();
    }

    /**
     * @return bool
     */
    protected function _beforeRun()
    {
        if (!empty($this->_path['action'])) {
            if (count($this->_eventIdList) > 1 || empty($this->_mainEventId)) {
                return true; // to show error in _run
            }

            if (!$this->_userHasAdminRights()) {
                return true; // to show error in _run
            }

            try {
                switch ($this->_path['action']) {
                    case 'shuffledSeating':
                        $this->_mimir->makeShuffledSeating($this->_mainEventId, 1, mt_rand(100000, 999999));
                        $this->_mimir->initStartingTimer($this->_mainEventId);
                        break;
                    case 'intervalSeating':
                        $this->_mimir->makeIntervalSeating($this->_mainEventId, intval($_POST['step']));
                        $this->_mimir->initStartingTimer($this->_mainEventId);
                        break;
                    case 'predefinedSeating':
                        $this->_mimir->makePrescriptedSeating($this->_mainEventId, isset($_POST['rndseat']) && $_POST['rndseat'] == 1);
                        $this->_mimir->initStartingTimer($this->_mainEventId);
                        break;
                    case 'swissSeating':
                        $this->_mimir->makeSwissSeating($this->_mainEventId);
                        $this->_mimir->initStartingTimer($this->_mainEventId);
                        break;
                    case 'resetSeating':
                        $this->_mimir->resetSeating($this->_mainEventId);
                        break;
                    case 'resetStartingTimer':
                        $this->_mimir->initStartingTimer($this->_mainEventId);
                        break;
                    case 'startTimer':
                        $this->_mimir->startTimer($this->_mainEventId);
                        break;
                    case 'dropLastRound':
                        $this->_mimir->dropLastRound($this->_path['hash']);
                        break;
                    case 'finalizeSessions':
                        $this->_mimir->finalizeSessions($this->_mainEventId);
                        break;
                    case 'toggleHideResults':
                        $this->_mimir->toggleHideResults($this->_mainEventId);
                        break;
                    default:
                        ;
                }
            } catch (\Exception $e) {
                $this->_lastEx = $e;
                return true;
            }

            header('Location: ' . Url::make('/tourn/', (string)$this->_mainEventId));
            return false;
        }

        return true;
    }

    /**
     * @return array
     * @throws \Exception
     */
    protected function _run(): array
    {
        $formatter = new GameFormatter();

        if (count($this->_eventIdList) > 1) {
            return [
                'error' => _t('Page not available for aggregated events')
            ];
        }

        if (empty($this->_mainEventId)) {
            return [
                'error' => _t('Main event is empty: this is unexpected behavior')
            ];
        }

        if (!$this->_userHasAdminRights()) {
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
        $tables = $this->_mimir->getTablesState($this->_mainEventId);
        $tablesFormatted = $formatter->formatTables(
            $tables,
            $this->_mainEventRules->gamesWaitingForTimer(),
            $this->_mainEventRules->syncStart()
        );
        $players = $this->_mimir->getAllPlayers($this->_eventIdList);
        $showOnlyShuffleSeating = empty($tables);

        // filter $players who are ignored from seating
        $players = array_values(array_filter($players, function ($player) {
            return !$player['ignore_seating'];
        }));

        $currentStage = $this->_determineStage($tablesFormatted, $players);

        $nextPrescriptedSeating = [];
        if ($this->_mainEventRules->isPrescripted() && $currentStage == self::STAGE_READY_BUT_NOT_STARTED) {
            try {
                $nextPrescriptedSeating = $this->_mimir->getNextPrescriptedSeating($this->_mainEventId);
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

        $startingTimer = $this->_mimir->getStartingTimer($this->_mainEventId);
        return [
            'error' => null,
            'startingTimer' => $startingTimer,
            'haveStartingTimer' => $startingTimer > 0,
            'showOnlyShuffleSeating' => $showOnlyShuffleSeating,
            'isTournament' => true, // false in games control panel controller
            'tablesList' => empty($_POST['description']) ? '' : $_POST['description'],
            'tables' => $tablesFormatted,
            'stageNotReady' => $currentStage == self::STAGE_NOT_READY,
            'stageReadyButNotStarted' => $currentStage == self::STAGE_READY_BUT_NOT_STARTED,
            'stageSeatingReady' => $currentStage == self::STAGE_SEATING_READY,
            'stageSeatingInProgress' => $currentStage == self::STAGE_SEATING_INPROGRESS,
            'stageStarted' => $currentStage == self::STAGE_STARTED,
            'stagePrefinished' => $currentStage == self::STAGE_PREFINISHED,
            'withAutoSeating' => $this->_mainEventRules->autoSeating(),
            'hideResults' => $this->_mainEventRules->hideResults(),
            'isPrescripted' => $this->_mainEventRules->isPrescripted(),
            'nextPrescriptedSeating' => $nextPrescriptedSeating,
            'noNextPrescript' => empty($nextPrescriptedSeating)
        ];
    }

    /**
     * @param array $tables
     * @param array $players
     * @return int
     */
    protected function _determineStage(&$tables, array &$players): int
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
            if ($this->_mainEventRules->syncEnd() && $prefinishedTablesCount == count($tables) && $notFinishedTablesCount != 0) {
                return self::STAGE_PREFINISHED;
            }

            if ($this->_mainEventRules->gamesWaitingForTimer()) {
                if (!$this->_mainEventRules->isPrescripted()) {
                    if ($notFinishedTablesCount === (count($players) / 4)) {
                        return self::STAGE_SEATING_READY;
                    } else {
                        return self::STAGE_SEATING_INPROGRESS;
                    }
                } else {
                    $assignedPlayers = array_filter($players, function ($player) {
                        return !empty($player['local_id']);
                    });
                    if ($notFinishedTablesCount === (count($assignedPlayers) / 4)) {
                        return self::STAGE_SEATING_READY;
                    } else {
                        return self::STAGE_SEATING_INPROGRESS;
                    }
                }
            }

            if ($notFinishedTablesCount !== 0) {
                return self::STAGE_STARTED;
            }
        }

        return self::STAGE_READY_BUT_NOT_STARTED;
    }
}
