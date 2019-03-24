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

class Sortition extends Controller
{
    protected $_mainTemplate = 'Sortition';

    protected function _pageTitle()
    {
        return _t('Seating controls') . ' - ' . $this->_mainEventRules->eventTitle();
    }

    protected function _beforeRun()
    {
        if (!empty($_POST['factor'])) {
            // TODO
            // approve, start games
        }

        if (empty($this->_path['seed'])) {
            header('Location: ' . Url::make('/sortition/' . substr(md5(microtime(true)), 3, 5) . '/', $this->_mainEventId));
            return false;
        }

        return true;
    }

    protected function _run()
    {
        if (!$this->_userHasAdminRights()) {
            return [
                'error' => _t("Wrong admin password")
            ];
        }

        $players = $this->_mimir->execute('getAllPlayers', [$this->_eventIdList]);
        $players = ArrayHelpers::elm2key($players, 'id');

        $seed = hexdec($this->_path['seed']);
        $sortition = $this->_mimir->execute('generateSeating', [
            $this->_mainEventId,
            1, // groups
            $seed
        ]);

        // Reformat seating for template...

        $seating = array_map(function ($player) use (&$players) {
            return [
                'id' => $player['id'],
                'rating' => $player['score'],
                'zone' => $player['score'] >= $this->_mainEventRules->startRating() ? 'success' : 'danger',
                // TODO; get rid of bootstrap terminology here ^
                'username' => $players[$player['id']]['display_name']
            ];
        }, $sortition['seating']);

        $seating = array_chunk($seating, 4);
        $tables = [];
        for ($i = 0; $i < count($seating); $i++) {
            $tables []= [
                'tableIndex' => $i + 1,
                'players' => $seating[$i]
            ];
        }

        // Reformat intersections for template...
        $intersections = [];

        if (!empty($sortition['intersections'])) {
            $maxIntersection = max($sortition['intersections']);
            foreach ($players as $id1 => $d1) {
                $entry = [
                    'username' => $d1['display_name'],
                    'intersectWith' => []
                ];

                foreach ($players as $id2 => $d2) {
                    $itemKey1 = $id1 . "+++" . $id2;
                    $itemKey2 = $id2 . "+++" . $id1;
                    $cnt1 = empty($sortition['intersections'][$itemKey1]) ? 0 : intval($sortition['intersections'][$itemKey1]);
                    $cnt2 = empty($sortition['intersections'][$itemKey2]) ? 0 : intval($sortition['intersections'][$itemKey2]);
                    $entry['intersectWith'] [] = [
                        'self' => $id1 == $id2,
                        'intcolor' => $this->_getColor($cnt1 + $cnt2, $maxIntersection),
                        'count' => $cnt1 + $cnt2
                    ];
                }

                $intersections [] = $entry;
            }
        }

        return [
            'seed' => $seed,
            'seating' => $tables,
            'intersections' => $intersections
        ];
    }

    protected function _getColor($num, $max)
    {
        $warningThreshold = ceil($max / 2.);
        if ($num == $max) {
            return 'danger';
        }
        if ($num >= $warningThreshold) {
            return 'warning';
        }
        return '';
    }
}
