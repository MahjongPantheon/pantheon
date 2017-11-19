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

class RatingTable extends Controller
{
    protected $_mainTemplate = 'RatingTable';

    protected function _pageTitle()
    {
        return _t('Таблица результатов');
    }

    protected function _run()
    {
        $errMsg = '';
        $data = null;

        if (!isset($_GET['sort'])) {
            $_GET['sort'] = '';
        }

        $order = empty($_GET['order']) ? '' : $_GET['order'];
        if ($order != 'asc' && $order != 'desc') {
            $order = '';
        }

        switch ($_GET['sort']) {
            case 'rating':
                $orderBy = $_GET['sort'];
                if (empty($_GET['order'])) {
                    $order = 'desc';
                }
                break;
            case 'avg_place':
                $orderBy = $_GET['sort'];
                if (empty($_GET['order'])) {
                    $order = 'asc';
                }
                break;
            case 'avg_score':
                $orderBy = $_GET['sort'];
                if (empty($_GET['order'])) {
                    $order = 'desc';
                }
                break;
            case 'name':
                $orderBy = $_GET['sort'];
                if (empty($_GET['order'])) {
                    $order = 'asc';
                }
                break;
            default:
                ;
                $orderBy = 'rating';
                if (empty($_GET['order'])) {
                    $order = 'desc';
                }
        }

        try {
            $players = $this->_api->execute('getAllPlayers', [$this->_eventId]);
            $players = ArrayHelpers::elm2Key($players, 'id');

            $data = $this->_api->execute('getRatingTable', [
                $this->_eventId,
                $orderBy,
                $order,
                $this->_adminAuthOk() // show prefinished results only for admins
            ]);

            array_map(function ($el) use (&$players) {
                // remove from common list - user exists in history
                unset($players[$el['id']]);
            }, $data);

            // Merge players who didn't finish yet into rating table
            $data = array_merge($data, array_map(function ($el) {
                return array_merge($el, [
                    'rating'        => '0',
                    'winner_zone'   => true,
                    'avg_place'     => '0',
                    'avg_score'     => '0',
                    'games_played'  => '0'
                ]);
            }, array_values($players)));

            // Assign indexes for table view
            $ctr = 1;
            $data = array_map(function ($el) use (&$ctr, &$players) {
                $el['_index'] = $ctr++;
                $el['short_name'] = $this->_makeShortName($el['display_name']);
                $el['avg_place_less_precision'] = sprintf('%.2f', $el['avg_place']);
                $el['avg_score_int'] = round($el['avg_score']);
                return $el;
            }, $data);
        } catch (Exception $e) {
            $errMsg = $e->getMessage();
        }

        $hideResults = $this->_rules->hideResults();
        $showAdminWarning = false;

        // admin should be able to see results
        if ($this->_adminAuthOk() && $hideResults) {
            $hideResults = false;
            $showAdminWarning = true;
        }

        return [
            'error'             => $errMsg,
            'data'              => $data,

            'orderDesc'         => $order == 'desc',

            'orderByRating'     => $orderBy == 'rating',
            'orderByAvgPlace'   => $orderBy == 'avg_place',
            'orderByAvgScore'   => $orderBy == 'avg_score',
            'orderByName'       => $orderBy == 'name',

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
