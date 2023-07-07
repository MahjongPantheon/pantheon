<?php
/*  Hugin: system statistics
 *  Copyright (C) 2023  o.klimenko aka ctizen
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
namespace Hugin;

require_once __DIR__ . '/../src/helpers/Config.php';
require_once __DIR__ . '/../src/helpers/Db.php';

if (!empty(getenv('OVERRIDE_CONFIG_PATH'))) {
    $configPath = getenv('OVERRIDE_CONFIG_PATH');
} else {
    $configPath = __DIR__ . '/../config/index.php';
}
$config = new Config($configPath);
$db = new Db($config);

// Run on 5th day of month, so we don't struggle with 28 to 31 days in month, just take 32 days ago.
$from = date('Y-m-01 00:00:00', time() - 32 * 24 * 60 * 60);
$to = date('Y-m-01 00:00:00', time());
$dayData = $db->table('event')->rawQuery(<<<QUERY
    SELECT * from aggregate_day WHERE "day" BETWEEN '{$from}' AND '{$to}'
QUERY)->findArray();

$sites = [];

foreach ($dayData as $day) {
    $siteId = $day['site_id'];
    if (empty($sites[$siteId])) {
        $sites[$siteId] = [
            'event_count' => 0,
            'uniq_count' => 0,
            'country' => [],
            'city' => [],
            'os' => [],
            'browser' => [],
            'device' => [],
            'screen' => [],
            'language' => [],
            'event_type' => [],
            'hostname' => []
        ];
    }
    $sites[$siteId]['event_count'] += $day['event_count'];
    $sites[$siteId]['uniq_count'] += $day['uniq_count'];
    foreach (['country', 'city', 'os', 'device', 'browser', 'screen', 'language', 'event_type', 'hostname'] as $k) {
        if (empty($sites[$siteId][$k])) {
            $sites[$siteId][$k] = json_decode($day[$k], true);
        } else {
            $newData = json_decode($day[$k], true);
            $allKeys = array_merge(array_keys($sites[$siteId][$k]), array_keys($newData));
            foreach ($allKeys as $key) {
                if (empty($sites[$siteId][$k])) {
                    $sites[$siteId][$k] = $newData[$key];
                } else {
                    $sites[$siteId][$k] += $newData[$key];
                }
            }
        }
    }
}

$dataToInsert = [];
foreach ($sites as $siteId => $data) {
    $dataToInsert []= [
        'month' => $from,
        'event_count' => $data['event_count'],
        'uniq_count' => $data['uniq_count'],
        'site_id' => $siteId,
        'country' => json_encode($data['country']),
        'city' => json_encode($data['city']),
        'browser' => json_encode($data['browser']),
        'os' => json_encode($data['os']),
        'device' => json_encode($data['device']),
        'screen' => json_encode($data['screen']),
        'language' => json_encode($data['language']),
        'event_type' => json_encode($data['event_type']),
        'hostname' => json_encode($data['hostname'])
    ];
}

try {
    if (!$db->upsertQuery('aggregate_month', $dataToInsert, ['month', 'site_id'])) {
        throw new \Exception('Upsert of data to aggregated months table failed');
    }
} catch (\Exception $e) {
    trigger_error($e->getMessage());
}
