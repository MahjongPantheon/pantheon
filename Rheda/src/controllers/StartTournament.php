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
require_once __DIR__ . '/../helpers/Array.php';

class StartTournament extends Controller
{
    protected $_mainTemplate = 'StartTournament';
    protected $_lastEx = null;

    protected $_errors = [
        '_WRONG_PASSWORD' => 'Секретное слово неправильное',
        '_TABLES_NOT_FULL' => 'Столы не укомплектованы! Число игроков не делится нацело на 4, нужно добавить или убрать людей!',
        '_GAMES_STARTED' => 'Игры уже начаты'
    ];

    protected function _pageTitle()
    {
        return 'Управление турниром';
    }

    protected function _beforeRun()
    {
        if (!empty($this->_path['action']) && $this->_path['action'] == 'start') {
            if (!$this->_adminAuthOk()) {
                return true; // to show error in _run
            }

            try {
                $this->_api->execute('startGamesWithSeating', [$this->_eventId, 1, mt_rand(100000, 999999)]);
                $this->_api->execute('startTimer', [$this->_eventId]);
            } catch (Exception $e) {
                $this->_lastEx = $e;
                return true;
            }
            header('Location: ' . Url::make('/tourn/', $this->_eventId));
            return false;
        }

        if (!empty($this->_path['action']) && $this->_path['action'] == 'startManual') {
            if (!$this->_adminAuthOk()) {
                return true; // to show error in _run
            }

            try {
                $this->_api->execute(
                    'startGamesWithManualSeating',
                    [$this->_eventId, $_POST['description'], $_POST['randomize'] == 'true']
                );
                $this->_api->execute('startTimer', [$this->_eventId]);
            } catch (Exception $e) {
                $this->_lastEx = $e;
                return true;
            }
            header('Location: ' . Url::make('/tourn/', $this->_eventId));
            return false;
        }

        if (!empty($this->_path['action']) && $this->_path['action'] == 'resetTimer') {
            if (!$this->_adminAuthOk()) {
                return true; // to show error in _run
            }

            try {
                $this->_api->execute('startTimer', [$this->_eventId]);
            } catch (Exception $e) {
                $this->_lastEx = $e;
                return true;
            }
            header('Location: ' . Url::make('/tourn/', $this->_eventId));
            return false;
        }

        if (!empty($this->_path['action']) && $this->_path['action'] == 'dropLastRound') {
            if (!$this->_adminAuthOk()) {
                return true; // to show error in _run
            }

            try {
                $this->_api->execute('dropLastRound', [$this->_path['hash']]);
            } catch (Exception $e) {
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
        if (!$this->_adminAuthOk()) {
            return [
                'showAll' => false,
                'reason' => $this->_errors['_WRONG_PASSWORD']
            ];
        }

        if (!empty($this->_lastEx)) {
            return [
                'showAll' => false,
                'reason' => $this->_lastEx->getMessage()
            ];
        }

        $errCode = null;

        // Tables info
        $tables = $this->_api->execute('getTablesState', [$this->_eventId]);
        $tablesFormatted = $this->_formatTables($tables);

        $unfinishedTablesCount = array_reduce($tablesFormatted, function ($acc, $i) {
            return $acc + ($i['finished'] ? 0 : 1);
        }, 0);

        if (!$this->_rules->allowPlayerAppend()) { // Club games do not require all of these checks
            $players = $this->_api->execute('getAllPlayers', [$this->_eventId]);
            if (count($players) % 4 !== 0) {
                $errCode = '_TABLES_NOT_FULL';
            } else {
                $timerState = $this->_api->execute('getTimerState', [$this->_eventId]);
                if ($timerState['started'] && $unfinishedTablesCount !== 0) { // Check once after click on START
                    $errCode = '_GAMES_STARTED';
                }
            }
        }

        return [
            'showAll' => empty($errCode),
            'showControls' => empty($errCode) || $errCode === '_GAMES_STARTED',
            'showAutoSeating' => $this->_rules->autoSeating(),
            'showTimerControls' => $this->_rules->syncStart() || (!empty($errCode) && $errCode === '_GAMES_STARTED'),
            'reason' => $errCode ? $this->_errors[$errCode] : '',
            'tablesList' => empty($_POST['description']) ? '' : $_POST['description'],
            'tables' => $tablesFormatted
        ];
    }

    protected function _formatTables($tables)
    {
        return array_map(function ($t) {
            $t['finished'] = $t['status'] == 'finished';
            if ($t['status'] == 'finished') {
                $t['last_round'] = '';
            } else {
                $t['last_round'] = $this->_formatLastRound($t['last_round'], $t['players']);
            }

            $players = ArrayHelpers::elm2Key($t['players'], 'id');
            $t['penalties'] = array_map(function ($p) use (&$players) {
                $p['who'] = $players[$p['who']]['display_name'];
                return $p;
            }, $t['penalties']);
            return $t;
        }, $tables);
    }

    protected function _formatLastRound($roundData, $players)
    {
        $players = ArrayHelpers::elm2Key($players, 'id');
        if (empty($roundData)) {
            return '';
        }

        switch ($roundData['outcome']) {
            case 'ron':
                return "Рон ({$players[$roundData['winner']]['display_name']} "
                . "с {$players[$roundData['loser']]['display_name']}) "
                . "{$roundData['han']} хан"
                . ($roundData['fu'] ? ", {$roundData['fu']} фу" : '')
                . "; риичи - " . implode(', ', array_map(function ($e) use (&$players) {
                    return $players[$e]['display_name'];
                }, $roundData['riichi']));
            case 'tsumo':
                return "Цумо ({$players[$roundData['winner']]['display_name']}) "
                . "{$roundData['han']} хан"
                . ($roundData['fu'] ? ", {$roundData['fu']} фу" : '')
                . "; риичи - " . implode(', ', array_map(function ($e) use (&$players) {
                    return $players[$e]['display_name'];
                }, $roundData['riichi']));
            case 'draw':
                return "Ничья "
                . "(темпай: " . implode(', ', array_map(function ($e) use (&$players) {
                    return $players[$e]['display_name'];
                }, $roundData['tempai'])) . ")"
                . "; риичи - " . implode(', ', array_map(function ($e) use (&$players) {
                    return $players[$e]['display_name'];
                }, $roundData['riichi']));
            case 'abort':
                return "Пересдача; риичи - " . implode(', ', array_map(function ($e) use (&$players) {
                    return $players[$e]['display_name'];
                }, $roundData['riichi']));
            case 'chombo':
                return "Чомбо ({$players[$roundData['loser']]['display_name']})";
            case 'multiron':
                if (count($roundData['wins']) == 2) {
                    return "Дабл-рон: платит {$players[$roundData['loser']]['display_name']}; "

                        . "№1: {$players[$roundData['wins'][0]['winner']]['display_name']}, "
                        . "{$roundData['wins'][0]['han']} хан"
                        . ($roundData['wins'][0]['fu'] ? ", {$roundData['wins'][0]['fu']} фу" : '')

                        . ", №2: {$players[$roundData['wins'][1]['winner']]['display_name']} "
                        . "{$roundData['wins'][1]['han']} хан"
                        . ($roundData['wins'][1]['fu'] ? ", {$roundData['wins'][1]['fu']} фу" : '')

                        . "; риичи - " . implode(', ', array_map(function ($e) use (&$players) {
                            return $players[$e]['display_name'];
                        }, $roundData['riichi']));
                }

                if (count($roundData['wins']) == 3) {
                    return "Трипл-рон: платит {$players[$roundData['loser']]['display_name']}; "

                        . "№1: {$players[$roundData['wins'][0]['winner']]['display_name']}, "
                        . "{$roundData['wins'][0]['han']} хан"
                        . ($roundData['wins'][0]['fu'] ? ", {$roundData['wins'][0]['fu']} фу" : '')

                        . ", №2: {$players[$roundData['wins'][1]['winner']]['display_name']} "
                        . "{$roundData['wins'][1]['han']} хан"
                        . ($roundData['wins'][1]['fu'] ? ", {$roundData['wins'][1]['fu']} фу" : '')

                        . ", №3: {$players[$roundData['wins'][2]['winner']]['display_name']} "
                        . "{$roundData['wins'][2]['han']} хан"
                        . ($roundData['wins'][2]['fu'] ? ", {$roundData['wins'][2]['fu']} фу" : '')

                        . "; риичи - " . implode(', ', array_map(function ($e) use (&$players) {
                            return $players[$e]['display_name'];
                        }, $roundData['riichi']));
                }

                return '';
            default:
                return '';
        }
    }
}
