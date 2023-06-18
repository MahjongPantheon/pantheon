<?php
namespace Hugin;

use Common\HuginData;

require_once __DIR__ . '/../Controller.php';
require_once __DIR__ . '/../primitives/Event.php';
require_once __DIR__ . '/../primitives/AggregateDay.php';
require_once __DIR__ . '/../primitives/AggregateMonth.php';

class EventsController extends Controller
{
    const CTR_ID = 'hugin_ctr';
    const LAST_PROC_ID = 'hugin_last_proc';
    const EV = 'hugin_ev_';

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
     * }
     *
     * @param string $data
     * @return string
     * @throws \Exception
     */
    public function track($data)
    {
        $parsed = json_decode($data, true);
        if (!$parsed || empty($parsed['s']) || empty($parsed['si']) || empty($parsed['h']) ||
            empty($parsed['o']) || empty($parsed['d']) || empty($parsed['sc']) ||
            empty($parsed['l']) || empty($parsed['t'])) {
            return 'malformed payload';
        }

        if (!apcu_fetch(self::CTR_ID)) {
            apcu_store(self::CTR_ID, 1);
            apcu_store(self::LAST_PROC_ID, 0);
        }

        $newId = apcu_inc(self::CTR_ID, 1);
        apcu_store(self::EV . $newId, [
            $_SERVER['REMOTE_ADDR'],
            $parsed['s'], $parsed['si'], $parsed['h'],
            $parsed['o'], $parsed['d'], $parsed['sc'],
            $parsed['l'], $parsed['t'], $parsed['e'] ?? 'page_view', $parsed['m'] ?? ''
        ]);

        // Don't query DB and geoip for each track request, do it once every twenty requests
        if ($newId % 20 === 0) {
            require_once __DIR__ . '/../../bin/geoip2.phar';
            /** @phpstan-ignore-next-line */
            $readerCity = new \GeoIp2\Database\Reader(__DIR__ . '/../../bin/GeoLite2-City.mmdb');
            $reader = new \GeoIp2\Database\Reader(__DIR__ . '/../../bin/GeoLite2-Country.mmdb');

            $lastProc = apcu_fetch(self::LAST_PROC_ID);
            for ($i = $lastProc; $i <= $newId; $i++) {
                $data = apcu_fetch(self::EV . $i);
                if (!$data) {
                    continue;
                }
                $addr = array_shift($data);
                $country = $city = '';
                if ($addr) {
                    try {
                        /** @phpstan-ignore-next-line */
                        $recordCity = $readerCity->city($addr);
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
                    ->setEventMeta(json_encode($data[9]))
                    ->setCountry($country)
                    ->setCity($city)
                    ->save();
                apcu_delete(self::EV . $i);
            }
            apcu_store(self::LAST_PROC_ID, $newId);
        }

        return 'ok';
    }

    /**
     * @return HuginData[]
     * @throws \Exception
     */
    public function getLastDay(): array {
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
                    ->setDatetime($hour)
                    ->setCountry(json_encode($perHour['country']))
                    ->setCity(json_encode($perHour['city']))
                    ->setOs(json_encode($perHour['os']))
                    ->setDevice(json_encode($perHour['device']))
                    ->setBrowser(json_encode($perHour['browser']))
                    ->setScreen(json_encode($perHour['screen']))
                    ->setLanguage(json_encode($perHour['language']))
                    ->setEventType(json_encode($perHour['event_type']))
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
    public function getLastMonth(): array {
        $days = AggregateDayPrimitive::findLastMonth($this->_db);
        return array_map(function(AggregateDayPrimitive $item) {
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
                ->setEventType($item->getEventType())
                ->setCountry($item->getCountry() ?? '')
                ->setCity($item->getCity() ?? '');
        }, $days);
    }

    /**
     * @return HuginData[]
     * @throws \Exception
     */
    public function getLastYear(): array {
        $days = AggregateMonthPrimitive::findLastYear($this->_db);
        return array_map(function(AggregateMonthPrimitive $item) {
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
                ->setEventType($item->getEventType())
                ->setCountry($item->getCountry() ?? '')
                ->setCity($item->getCity() ?? '');
        }, $days);
    }
}
