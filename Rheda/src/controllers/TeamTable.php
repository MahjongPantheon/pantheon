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

require_once __DIR__ . '/../helpers/Array.php';

class TeamTable extends Controller
{
    protected $_mainTemplate = 'TeamTable';

    protected function _pageTitle()
    {
        return _t('Team table');
    }

    protected function _run()
    {
        $errMsg = '';
        $data = null;

        $orderBy = 'rating';
        $order = 'desc';

        try {
            $players = $this->_api->execute('getAllPlayers', [$this->_eventIdList]);
            $players = ArrayHelpers::elm2Key($players, 'id');

            $data = $this->_api->execute('getRatingTable', [
                $this->_eventIdList,
                $orderBy,
                $order,
                $this->_adminAuthOk() // show prefinished results only for admins
            ]);

            $commandNames = [];
            array_map(function ($el) use (&$players, &$commandNames, &$isCommand) {
                if ($this->_mainEventRules->isCommand()) {
                    $commandNames[$el['id']] = $players[$el['id']]['command_name'];
                }
                // remove from common list - user exists in history
                unset($players[$el['id']]);
            }, $data);

            // Merge players who didn't finish yet into rating table
            $data = array_merge($data, array_map(function ($el) {
                return array_merge($el, [
                    'rating'        => '0',
                    'winner_zone'   => true,
                    'games_played'  => '0',
                ]);
            }, array_values($players)));

            $data = array_map(function ($el) use (&$ctr, &$players, &$commandNames) {
                $commandName = null;
                if ($this->_mainEventRules->isCommand()) {
                    $commandName = $commandNames[$el['id']];
                }
                $el['short_name'] = $this->_makeShortName($el['display_name']);
                $el['command_name'] = $commandName;
                return $el;
            }, $data);
        } catch (Exception $e) {
            $errMsg = $e->getMessage();
        }

        # group players by command
        $commands = [];
        foreach ($data as $player) {
            $commands[$player['command_name']]['players'][] = $player;
            $commands[$player['command_name']]['command_name'] = $player['command_name'];
            $commands[$player['command_name']]['total_rating'] += $player['rating'];
            $commands[$player['command_name']]['winner_zone'] = $commands[$player['command_name']]['total_rating'] >= 0;
        }

        $hideResults = $this->_mainEventRules->hideResults();

        $showAdminWarning = false;

        // admin should be able to see results
        if ($this->_adminAuthOk() && $hideResults) {
            $hideResults = false;
            $showAdminWarning = true;
        }

        usort($commands, function($a, $b) {
            return $b['total_rating'] - $a['total_rating'];
        });

        return [
            'error'             => $errMsg,
            'commands'          => $commands,

            'isOnlineTournament'  => $this->_mainEventRules->isOnline(),

            'hideResults'       => $hideResults,
            'showAdminWarning'  => $showAdminWarning,
        ];
    }

    private function _makeShortName($name)
    {
        list($surname, $name) = explode(' ', $name . ' '); // Trailing slash will suppress errors with names without any space
        return $surname . ' ' . mb_substr($name, 0, 1, 'utf8') . '.';
    }
}
