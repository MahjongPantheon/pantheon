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

class GamesControlPanel extends Controller
{
    protected $_mainTemplate = 'GamesControlPanel';
    /**
     * @var \Exception
     */
    protected $_lastEx = null;

    protected function _pageTitle()
    {
        return _t('Games control panel');
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
                    case 'dropLastRound':
                        $this->_api->execute('dropLastRound', [$this->_path['hash']]);
                        break;
                    default:
                        ;
                }
            } catch (\Exception $e) {
                $this->_lastEx = $e;
                return true;
            }

            header('Location: ' . Url::make('/games/', $this->_eventId));
            return false;
        }

        return true;
    }

    protected function _run()
    {
        $formatter = new GameFormatter();

        if (count($this->_eventIdList) > 1) {
            return [
                'error' => _t('Page not supported for aggregated events'),
                'isAggregated' => true,
            ];
        }

        if (!$this->_adminAuthOk()) {
            return [
                'reason' => _t('Wrong admin password')
            ];
        }

        if (!empty($this->_lastEx)) {
            return [
                'reason' => $this->_lastEx->getMessage()
            ];
        }

        // Tables info
        $tables = $this->_api->execute('getTablesState', [$this->_eventId]);
        $tablesFormatted = $formatter->formatTables($tables, $this->_rules->gamesWaitingForTimer());

        return [
            'reason' => '',
            'tables' => $tablesFormatted
        ];
    }
}
