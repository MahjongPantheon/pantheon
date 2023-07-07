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

use Common\HuginData;

require_once __DIR__ . '/../Controller.php';
require_once __DIR__ . '/../primitives/Event.php';
require_once __DIR__ . '/../primitives/SysError.php';
require_once __DIR__ . '/../primitives/AggregateDay.php';
require_once __DIR__ . '/../primitives/AggregateMonth.php';

class EventsController extends Controller
{
    const CTR_ID = 'hugin_ctr';
    const LAST_PROC_ID = 'hugin_last_proc';
    const EV = 'hugin_ev_';

    const ERR_CTR_ID = 'hugin_ctr_err';
    const ERR_LAST_PROC_ID = 'hugin_last_proc_err';
    const ERR_EV = 'hugin_ev_err_';

    /**
     * Input: JSON-encoded data in format:
     * {
     *   "s": SITE_ID,
     *   "si": SESSION_ID,
     *   "h": HOSTNAME,
     *   "o": OS_TITLE,
     *   "d": DEVICE_TYPE,
     *   "sc": SCREEN_SIZE,
     *   "l": LANGUAGE,
     *   "t": DATE,
     *   "e": EVENT_ID, // nullable, page_view by default
     *   "m": EVENT_META // nullable
     *   "b:" BROWSER
     * }
     *
     * @param string $data
     * @return string
     * @throws \Exception
     */
    public function track($data)
    {
        $parsed = json_decode($data, true);
        if ($parsed && !empty($parsed['error'])) {
            if (preg_match("#(Tyr|Forseti|Sigrun) \[(twirp|common)\]#is", $parsed['source'])) {
                return $this->_trackError((string)$parsed['error'], (string)$parsed['source']);
            }
        }

        return $this->_trackAnalytics($parsed);
    }

    /**
     * @param string $error
     * @param string $source
     * @return string
     * @throws \Exception
     */
    protected function _trackError($error, $source)
    {

        if (!$this->_mc->get(self::ERR_CTR_ID)) {
            $this->_mc->set(self::ERR_CTR_ID, 1);
            $this->_mc->set(self::ERR_LAST_PROC_ID, 0);
        }

        $newId = $this->_mc->increment(self::ERR_CTR_ID, 1);
        $this->_mc->set(self::ERR_EV . $newId, [
            $source, date('Y-m-d H:i:s'), $error
        ]);

        // Don't query DB for each error, do it once every twenty requests
        if ($newId % 20 === 0) {
            $lastProc = $this->_mc->get(self::ERR_LAST_PROC_ID);
            for ($i = $lastProc; $i <= $newId; $i++) {
                $data = $this->_mc->get(self::ERR_EV . $i);
                if (!$data) {
                    continue;
                }
                (new SysErrorPrimitive($this->_db))
                    ->setSource($data[0])
                    ->setCreatedAt($data[1])
                    ->setError($data[2])
                    ->save();
                $this->_mc->delete(self::ERR_EV . $i);
            }
            $this->_mc->set(self::LAST_PROC_ID, $newId);
        }

        return 'ok';
    }

    /**
     * @param array|false $parsed
     * @return string
     * @throws \Exception
     */
    protected function _trackAnalytics($parsed): string
    {
        if (!$parsed || empty($parsed['s']) || empty($parsed['si']) || empty($parsed['h']) ||
            empty($parsed['o']) || empty($parsed['d']) || empty($parsed['sc']) ||
            empty($parsed['l']) || empty($parsed['t']) || empty($parsed['b'])) {
            return 'malformed payload';
        }

        if (!$this->_mc->get(self::CTR_ID)) {
            $this->_mc->set(self::CTR_ID, 1);
            $this->_mc->set(self::LAST_PROC_ID, 0);
        }

        $newId = $this->_mc->increment(self::CTR_ID, 1);
        $this->_mc->set(self::EV . $newId, [
            empty($_SERVER['HTTP_X_FORWARDED_FOR']) ? $_SERVER['REMOTE_ADDR'] : $_SERVER['HTTP_X_FORWARDED_FOR'],
            $parsed['s'], $parsed['si'], $parsed['h'],
            $parsed['o'], $parsed['d'], $parsed['sc'],
            $parsed['l'], $parsed['t'], $parsed['e'] ?: 'page_view',
            $parsed['m'] ?? '', $parsed['b']
        ]);

        // Don't query DB and geoip for each track request, do it once every twenty requests
        if ($newId % 20 === 0) {
            require_once __DIR__ . '/../../bin/geoip2.phar';
            /** @phpstan-ignore-next-line */
            $readerCity = new \GeoIp2\Database\Reader(__DIR__ . '/../../bin/GeoLite2-City.mmdb');
            /** @phpstan-ignore-next-line */
            $reader = new \GeoIp2\Database\Reader(__DIR__ . '/../../bin/GeoLite2-Country.mmdb');

            $lastProc = $this->_mc->get(self::LAST_PROC_ID);
            for ($i = $lastProc; $i <= $newId; $i++) {
                $data = $this->_mc->get(self::EV . $i);
                if (!$data) {
                    continue;
                }
                $addr = array_shift($data);
                $country = $city = '';
                if ($addr) {
                    try {
                        /** @phpstan-ignore-next-line */
                        $recordCity = $readerCity->city($addr);
                        /** @phpstan-ignore-next-line */
                        $record = $reader->country($addr);
                        $country = $record->country->name;
                        $city = $recordCity->city->name;
                    } catch (\Exception $e) {
                        // Do nothing actually.
                    }
                }
                (new EventPrimitive($this->_db))
                    ->setSiteId($data[0])
                    ->setSessionId($data[1])
                    ->setHostname($data[2])
                    ->setOs($data[3])
                    ->setDevice($data[4])
                    ->setScreen($data[5])
                    ->setLanguage($data[6])
                    ->setCreatedAt($data[7])
                    ->setEventType($data[8])
                    ->setEventMeta(json_encode($data[9]) ?: '')
                    ->setBrowser($data[10])
                    ->setCountry($country)
                    ->setCity($city)
                    ->save();
                $this->_mc->delete(self::EV . $i);
            }
            $this->_mc->set(self::LAST_PROC_ID, $newId);
        }

        return 'ok';
    }

    /**
     * @return HuginData[]
     * @throws \Exception
     */
    public function getLastDay(): array
    {
        $events = EventPrimitive::findLastHours($this->_db);
        $sites = [];
        foreach ($events as $event) {
            if (empty($sites[$event->getSiteId()])) {
                $sites[$event->getSiteId()] = [];
            }
            $dt = new \DateTime($event->getCreatedAt());
            if (empty($sites[$event->getSiteId()][$dt->format('H')])) {
                $sites[$event->getSiteId()][$dt->format('H')] = [
                    'created_at' => $event->getCreatedAt(),
                    'sessions' => [],
                    'event_count' => 0,
                    'country' => [],
                    'city' => [],
                    'os' => [],
                    'browser' => [],
                    'device' => [],
                    'screen' => [],
                    'language' => [],
                    'event_type' => [],
                ];
            }

            $map = [
                'getCountry' => 'country',
                'getCity' => 'city',
                'getOs' => 'os',
                'getDevice' => 'device',
                'getBrowser' => 'browser',
                'getScreen' => 'screen',
                'getLanguage' => 'language',
                'getEventType' => 'event_type'
            ];

            $sites[$event->getSiteId()][$dt->format('H')]['event_count']++;
            $sites[$event->getSiteId()][$dt->format('H')]['sessions'] []= $event->getSessionId();
            foreach (array_keys($map) as $k) {
                if (empty($event->$k())) {
                    continue;
                }
                if (empty($sites[$event->getSiteId()][$dt->format('H')][$map[$k]][$event->$k()])) {
                    $sites[$event->getSiteId()][$dt->format('H')][$map[$k]][$event->$k()] = 0;
                }
                $sites[$event->getSiteId()][$dt->format('H')][$map[$k]][$event->$k()]++;
            }
        }

        $returnData = [];
        foreach ($sites as $siteId => $data) {
            foreach ($data as $hour => $perHour) {
                $returnData [] = (new HuginData())
                    ->setSiteId($siteId)
                    ->setDatetime((string)$hour)
                    ->setCountry(json_encode($perHour['country']) ?: '')
                    ->setCity(json_encode($perHour['city']) ?: '')
                    ->setOs(json_encode($perHour['os']) ?: '')
                    ->setDevice(json_encode($perHour['device']) ?: '')
                    ->setBrowser(json_encode($perHour['browser']) ?: '')
                    ->setScreen(json_encode($perHour['screen']) ?: '')
                    ->setLanguage(json_encode($perHour['language']) ?: '')
                    ->setEventType(json_encode($perHour['event_type']) ?: '')
                    ->setEventCount($perHour['event_count'])
                    ->setUniqCount(count(array_unique($perHour['sessions'])));
            }
        }

        return $returnData;
    }

    /**
     * @return HuginData[]
     * @throws \Exception
     */
    public function getLastMonth(): array
    {
        $days = AggregateDayPrimitive::findLastMonth($this->_db);
        return array_map(function (AggregateDayPrimitive $item) {
            return (new HuginData())
                ->setDatetime((new \DateTime($item->getDay()))->format('d'))
                ->setSiteId($item->getSiteId())
                ->setEventCount($item->getEventCount())
                ->setUniqCount($item->getUniqCount())
                ->setHostname($item->getHostname() ?? '')
                ->setBrowser($item->getBrowser() ?? '')
                ->setOs($item->getOs() ?? '')
                ->setDevice($item->getDevice() ?? '')
                ->setScreen($item->getScreen() ?? '')
                ->setLanguage($item->getLanguage() ?? '')
                ->setEventType($item->getEventType() ?? '')
                ->setCountry($item->getCountry() ?? '')
                ->setCity($item->getCity() ?? '');
        }, $days);
    }

    /**
     * @return HuginData[]
     * @throws \Exception
     */
    public function getLastYear(): array
    {
        $days = AggregateMonthPrimitive::findLastYear($this->_db);
        return array_map(function (AggregateMonthPrimitive $item) {
            return (new HuginData())
                ->setDatetime((new \DateTime($item->getMonth()))->format('m'))
                ->setSiteId($item->getSiteId())
                ->setEventCount($item->getEventCount())
                ->setUniqCount($item->getUniqCount())
                ->setHostname($item->getHostname() ?? '')
                ->setBrowser($item->getBrowser() ?? '')
                ->setOs($item->getOs() ?? '')
                ->setDevice($item->getDevice() ?? '')
                ->setScreen($item->getScreen() ?? '')
                ->setLanguage($item->getLanguage() ?? '')
                ->setEventType($item->getEventType() ?? '')
                ->setCountry($item->getCountry() ?? '')
                ->setCity($item->getCity() ?? '');
        }, $days);
    }
}
