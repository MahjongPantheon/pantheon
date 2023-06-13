<?php
namespace Hugin;

require_once __DIR__ . '/../Controller.php';
require_once __DIR__ . '/../primitives/Event.php';

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
        var_dump(self::EV . $newId);
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
                var_dump($data);
                var_dump(self::EV . $i);
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
}
