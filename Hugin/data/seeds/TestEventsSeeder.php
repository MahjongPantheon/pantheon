<?php

use Phinx\Seed\AbstractSeed;

require_once __DIR__ . '/../../src/primitives/Event.php';
require_once __DIR__ . '/../../src/primitives/AggregateDay.php';
require_once __DIR__ . '/../../src/primitives/AggregateMonth.php';
require_once __DIR__ . '/../../src/helpers/Config.php';
require_once __DIR__ . '/../../src/helpers/Db.php';

class TestEventsSeeder extends AbstractSeed
{
    /**
     * @throws \Exception
     */
    public function run()
    {
        $this->_seedEvents($this->_getConnection());
    }

    /**
     * @param \Hugin\Db $db
     * @throws \Exception
     */
    protected function _seedEvents(\Hugin\Db $db)
    {
        $db->table('event')->rawQuery("DELETE FROM event")->findArray();
        $db->table('aggregate_day')->rawQuery("DELETE FROM aggregate_day")->findArray();
        $db->table('aggregate_month')->rawQuery("DELETE FROM aggregate_month")->findArray();
        $sites = ['Tyr', 'Sigrun', 'Forseti'];
        foreach ($sites as $site) {
            /* Fields order:
                'session_id', 'site_id', 'hostname', 'browser',
                'os', 'device', 'screen', 'language', 'country',
                'city', 'created_at'
            '*/
            $fd = fopen(__DIR__ . '/testdata.csv', 'r');
            /** @var array|false $row */
            while (($row = fgetcsv($fd, 20000, ',')) !== false) {
                (new \Hugin\EventPrimitive($db))
                    ->setSessionId($row[0])
                    ->setSiteId($site)
                    ->setHostname($site)
                    ->setBrowser($row[3] === 'NULL' ? null : $row[3])
                    ->setOs($row[4] === 'NULL' ? null : $row[4])
                    ->setDevice($row[5] === 'NULL' ? null : $row[5])
                    ->setScreen($row[6] === 'NULL' ? null : $row[6])
                    ->setLanguage($row[7] === 'NULL' ? null : $row[7])
                    ->setCountry($row[8] === 'NULL' ? null : $row[8])
                    ->setCity($row[9] === 'NULL' ? null : $row[9])
                    ->setCreatedAt(date('Y-m-d H:i:s', mt_rand(time() - 48 * 60 * 60, time() - 24 * 60 * 60)))
                    ->save();
            }
            for ($i = 1; $i <= 28; $i++) {
                (new \Hugin\AggregateDayPrimitive($db))
                    ->setEventCount(mt_rand(50, 200))
                    ->setUniqCount(mt_rand(10, 50))
                    ->setSiteId($site)
                    ->setHostname($site)
                    ->setDay(date('Y-m-') . $i . ' 00:00:00')
                    ->setCountry(json_encode([
                        'RU' => mt_rand(10, 50),
                        'BY' => mt_rand(10, 50),
                        'KZ' => mt_rand(10, 50),
                        'KG' => mt_rand(10, 50),
                        'TR' => mt_rand(10, 50),
                        'FR' => mt_rand(10, 50),
                        'DE' => mt_rand(10, 50),
                        'ES' => mt_rand(10, 50),
                        'BG' => mt_rand(10, 50),
                        'LT' => mt_rand(10, 50),
                        'GE' => mt_rand(10, 50),
                        'TH' => mt_rand(10, 50),
                        'NL' => mt_rand(10, 50),
                        'CH' => mt_rand(10, 50),
                    ]))
                    ->setCity(json_encode([
                        'Minsk' => mt_rand(10, 50),
                        'Moscow' => mt_rand(10, 50),
                        'Yekaterinburg' => mt_rand(10, 50),
                        'Bishkek' => mt_rand(10, 50),
                        'Novosibirsk' => mt_rand(10, 50),
                        'Alaquas' => mt_rand(10, 50),
                        'Chelyabinsk' => mt_rand(10, 50),
                        'Novorossiysk' => mt_rand(10, 50),
                        'Seesen' => mt_rand(10, 50),
                        'Nizhniy Novgorod' => mt_rand(10, 50),
                        'Vidnoye' => mt_rand(10, 50),
                        'Ostrozhka' => mt_rand(10, 50),
                        'Amsterdam' => mt_rand(10, 50),
                        'Sofia' => mt_rand(10, 50),
                        'St Petersburg' => mt_rand(10, 50),
                        'Barnaul' => mt_rand(10, 50),
                        'Perm' => mt_rand(10, 50),
                        'Istanbul' => mt_rand(10, 50),
                        'Bangkok' => mt_rand(10, 50),
                        'Berlin' => mt_rand(10, 50),
                    ]))
                    ->setDevice(json_encode([
                        "mobile" => mt_rand(100, 500),
                        "laptop" => mt_rand(100, 500),
                        "desktop" => mt_rand(100, 500),
                        "tablet" => mt_rand(100, 500),
                    ]))
                    ->setScreen(json_encode([
                        '396x725' => mt_rand(10, 50),
                        '393x767' => mt_rand(10, 50),
                        '388x752' => mt_rand(10, 50),
                        '412x764' => mt_rand(10, 50),
                        '414x720' => mt_rand(10, 50),
                        '360x560' => mt_rand(10, 50),
                        '457x891' => mt_rand(10, 50),
                        '412x652' => mt_rand(10, 50),
                        '1512x833' => mt_rand(10, 50),
                        '360x714' => mt_rand(10, 50),
                        '980x1740' => mt_rand(10, 50),
                        '420x846' => mt_rand(10, 50),
                        '360x800' => mt_rand(10, 50),
                        '414x706' => mt_rand(10, 50),
                        '360x647' => mt_rand(10, 50),
                        '360x660' => mt_rand(10, 50),
                        '375x636' => mt_rand(10, 50),
                        '459x781' => mt_rand(10, 50),
                        '393x668' => mt_rand(10, 50),
                        '393x720' => mt_rand(10, 50),
                        '1574x1046' => mt_rand(10, 50),
                        '396x774' => mt_rand(10, 50),
                        '412x763' => mt_rand(10, 50),
                        '360x628' => mt_rand(10, 50),
                        '396x735' => mt_rand(10, 50),
                        '1920x955' => mt_rand(10, 50),
                        '407x720' => mt_rand(10, 50),
                        '393x734' => mt_rand(10, 50),
                        '430x740' => mt_rand(10, 50),
                        '393x752' => mt_rand(10, 50),
                        '384x712' => mt_rand(10, 50),
                        '393x789' => mt_rand(10, 50),
                        '1920x936' => mt_rand(10, 50),
                        '360x619' => mt_rand(10, 50),
                        '375x705' => mt_rand(10, 50),
                        '393x763' => mt_rand(10, 50),
                        '1920x974' => mt_rand(10, 50),
                        '375x640' => mt_rand(10, 50),
                        '1495x794' => mt_rand(10, 50),
                        '360x657' => mt_rand(10, 50),
                        '393x694' => mt_rand(10, 50),
                        '360x613' => mt_rand(10, 50),
                        '360x627' => mt_rand(10, 50),
                        '360x607' => mt_rand(10, 50),
                        '3840x2041' => mt_rand(10, 50),
                        '980x1795' => mt_rand(10, 50),
                        '1920x979' => mt_rand(10, 50),
                        '1865x961' => mt_rand(10, 50),
                        '360x711' => mt_rand(10, 50),
                        '390x661' => mt_rand(10, 50),
                        '384x681' => mt_rand(10, 50),
                        '1728x999' => mt_rand(10, 50),
                        '906x817' => mt_rand(10, 50),
                        '1625x769' => mt_rand(10, 50),
                        '360x464' => mt_rand(10, 50),
                        '1279x1256' => mt_rand(10, 50),
                        '1366x845' => mt_rand(10, 50),
                        '2056x1206' => mt_rand(10, 50),
                        '384x713' => mt_rand(10, 50),
                        '412x784' => mt_rand(10, 50),
                        '412x777' => mt_rand(10, 50),
                        '412x776' => mt_rand(10, 50),
                        '1451x724' => mt_rand(10, 50),
                        '360x663' => mt_rand(10, 50),
                        '390x664' => mt_rand(10, 50),
                        '412x724' => mt_rand(10, 50),
                        '1534x863' => mt_rand(10, 50),
                        '1366x768' => mt_rand(10, 50),
                        '360x643' => mt_rand(10, 50),
                        '393x737' => mt_rand(10, 50),
                        '360x632' => mt_rand(10, 50),
                        '1920x937' => mt_rand(10, 50),
                        '412x832' => mt_rand(10, 50),
                        '1536x746' => mt_rand(10, 50),
                        '428x748' => mt_rand(10, 50),
                        '1600x716' => mt_rand(10, 50),
                        '954x928' => mt_rand(10, 50),
                        '414x715' => mt_rand(10, 50),
                        '360x606' => mt_rand(10, 50),
                        '412x785' => mt_rand(10, 50),
                        '375x553' => mt_rand(10, 50),
                        '360x694' => mt_rand(10, 50),
                        '393x733' => mt_rand(10, 50),
                        '360x595' => mt_rand(10, 50),
                        '412x718' => mt_rand(10, 50),
                        '412x714' => mt_rand(10, 50),
                        '360x708' => mt_rand(10, 50),
                        '393x608' => mt_rand(10, 50),
                        '390x669' => mt_rand(10, 50),
                        '384x726' => mt_rand(10, 50),
                        '428x743' => mt_rand(10, 50),
                        '1872x964' => mt_rand(10, 50),
                        '1920x947' => mt_rand(10, 50),
                        '1526x1039' => mt_rand(10, 50),
                        '393x567' => mt_rand(10, 50),
                        '384x719' => mt_rand(10, 50),
                        '393x719' => mt_rand(10, 50),
                        '360x669' => mt_rand(10, 50),
                        '412x751' => mt_rand(10, 50),
                        '388x750' => mt_rand(10, 50),
                        '360x586' => mt_rand(10, 50),
                        '320x454' => mt_rand(10, 50),
                        '396x683' => mt_rand(10, 50),
                        '390x659' => mt_rand(10, 50),
                    ]))
                    ->setLanguage(json_encode([
                        'ru-RU' => mt_rand(40, 200),
                        'en-US' => mt_rand(40, 200),
                        'ru-ru' => mt_rand(40, 200),
                        'en-GB' => mt_rand(40, 200),
                        'ru' => mt_rand(40, 200),
                        'de-DE' => mt_rand(40, 200),
                        'en-DE' => mt_rand(40, 200),
                        'es-ES' => mt_rand(40, 200),
                        'en-AU' => mt_rand(40, 200),
                        'ru-BY' => mt_rand(40, 200),
                        'uk' => mt_rand(40, 200),
                        'zh-CN' => mt_rand(40, 200),
                        'zh-TW' => mt_rand(40, 200),
                    ]))
                    ->setBrowser(json_encode([
                        'yandexbrowser' => mt_rand(100, 400),
                        'firefox' => mt_rand(100, 400),
                        'chrome' => mt_rand(100, 400),
                        'crios' => mt_rand(100, 400),
                        'ios' => mt_rand(100, 400),
                        'safari' => mt_rand(100, 400),
                        'samsung' => mt_rand(100, 400),
                        'opera' => mt_rand(100, 400),
                        'edge-chromium' => mt_rand(100, 400),
                        'ios-webview' => mt_rand(100, 400),
                    ]))
                    ->setOs(json_encode([
                        'Android OS' => mt_rand(10, 50),
                        'iOS' => mt_rand(10, 50),
                        'Mac OS' => mt_rand(10, 50),
                        'Linux' => mt_rand(10, 50),
                        'Windows 10' => mt_rand(10, 50),
                        'Windows 7' => mt_rand(10, 50),
                    ]))
                    ->setEventType(json_encode([
                        'page_view' => mt_rand(100, 500),
                        'load_start' => mt_rand(100, 500),
                        'load_finish' => mt_rand(100, 500),
                        'load_error' => mt_rand(100, 500),
                    ]))
                    ->save();
            }

            for ($i = 1; $i <= 12; $i++) {
                (new \Hugin\AggregateMonthPrimitive($db))
                    ->setEventCount(mt_rand(500, 2000))
                    ->setUniqCount(mt_rand(100, 500))
                    ->setSiteId($site)
                    ->setHostname($site)
                    ->setMonth(date('Y-') . ($i >= 10 ? $i : '0' . $i) . '-05 00:00:00')
                    ->setCountry(json_encode([
                        'RU' => mt_rand(10, 50),
                        'BY' => mt_rand(10, 50),
                        'KZ' => mt_rand(10, 50),
                        'KG' => mt_rand(10, 50),
                        'TR' => mt_rand(10, 50),
                        'FR' => mt_rand(10, 50),
                        'DE' => mt_rand(10, 50),
                        'ES' => mt_rand(10, 50),
                        'BG' => mt_rand(10, 50),
                        'LT' => mt_rand(10, 50),
                        'GE' => mt_rand(10, 50),
                        'TH' => mt_rand(10, 50),
                        'NL' => mt_rand(10, 50),
                        'CH' => mt_rand(10, 50),
                    ]))
                    ->setCity(json_encode([
                        'Minsk' => mt_rand(10, 50),
                        'Moscow' => mt_rand(10, 50),
                        'Yekaterinburg' => mt_rand(10, 50),
                        'Bishkek' => mt_rand(10, 50),
                        'Novosibirsk' => mt_rand(10, 50),
                        'Alaquas' => mt_rand(10, 50),
                        'Chelyabinsk' => mt_rand(10, 50),
                        'Novorossiysk' => mt_rand(10, 50),
                        'Seesen' => mt_rand(10, 50),
                        'Nizhniy Novgorod' => mt_rand(10, 50),
                        'Vidnoye' => mt_rand(10, 50),
                        'Ostrozhka' => mt_rand(10, 50),
                        'Amsterdam' => mt_rand(10, 50),
                        'Sofia' => mt_rand(10, 50),
                        'St Petersburg' => mt_rand(10, 50),
                        'Barnaul' => mt_rand(10, 50),
                        'Perm' => mt_rand(10, 50),
                        'Istanbul' => mt_rand(10, 50),
                        'Bangkok' => mt_rand(10, 50),
                        'Berlin' => mt_rand(10, 50),
                    ]))
                    ->setDevice(json_encode([
                        "mobile" => mt_rand(100, 500),
                        "laptop" => mt_rand(100, 500),
                        "desktop" => mt_rand(100, 500),
                        "tablet" => mt_rand(100, 500),
                    ]))
                    ->setScreen(json_encode([
                        '396x725' => mt_rand(10, 50),
                        '393x767' => mt_rand(10, 50),
                        '388x752' => mt_rand(10, 50),
                        '412x764' => mt_rand(10, 50),
                        '414x720' => mt_rand(10, 50),
                        '360x560' => mt_rand(10, 50),
                        '457x891' => mt_rand(10, 50),
                        '412x652' => mt_rand(10, 50),
                        '1512x833' => mt_rand(10, 50),
                        '360x714' => mt_rand(10, 50),
                        '980x1740' => mt_rand(10, 50),
                        '420x846' => mt_rand(10, 50),
                        '360x800' => mt_rand(10, 50),
                        '414x706' => mt_rand(10, 50),
                        '360x647' => mt_rand(10, 50),
                        '360x660' => mt_rand(10, 50),
                        '375x636' => mt_rand(10, 50),
                        '459x781' => mt_rand(10, 50),
                        '393x668' => mt_rand(10, 50),
                        '393x720' => mt_rand(10, 50),
                        '1574x1046' => mt_rand(10, 50),
                        '396x774' => mt_rand(10, 50),
                        '412x763' => mt_rand(10, 50),
                        '360x628' => mt_rand(10, 50),
                        '396x735' => mt_rand(10, 50),
                        '1920x955' => mt_rand(10, 50),
                        '407x720' => mt_rand(10, 50),
                        '393x734' => mt_rand(10, 50),
                        '430x740' => mt_rand(10, 50),
                        '393x752' => mt_rand(10, 50),
                        '384x712' => mt_rand(10, 50),
                        '393x789' => mt_rand(10, 50),
                        '1920x936' => mt_rand(10, 50),
                        '360x619' => mt_rand(10, 50),
                        '375x705' => mt_rand(10, 50),
                        '393x763' => mt_rand(10, 50),
                        '1920x974' => mt_rand(10, 50),
                        '375x640' => mt_rand(10, 50),
                        '1495x794' => mt_rand(10, 50),
                        '360x657' => mt_rand(10, 50),
                        '393x694' => mt_rand(10, 50),
                        '360x613' => mt_rand(10, 50),
                        '360x627' => mt_rand(10, 50),
                        '360x607' => mt_rand(10, 50),
                        '3840x2041' => mt_rand(10, 50),
                        '980x1795' => mt_rand(10, 50),
                        '1920x979' => mt_rand(10, 50),
                        '1865x961' => mt_rand(10, 50),
                        '360x711' => mt_rand(10, 50),
                        '390x661' => mt_rand(10, 50),
                        '384x681' => mt_rand(10, 50),
                        '1728x999' => mt_rand(10, 50),
                        '906x817' => mt_rand(10, 50),
                        '1625x769' => mt_rand(10, 50),
                        '360x464' => mt_rand(10, 50),
                        '1279x1256' => mt_rand(10, 50),
                        '1366x845' => mt_rand(10, 50),
                        '2056x1206' => mt_rand(10, 50),
                        '384x713' => mt_rand(10, 50),
                        '412x784' => mt_rand(10, 50),
                        '412x777' => mt_rand(10, 50),
                        '412x776' => mt_rand(10, 50),
                        '1451x724' => mt_rand(10, 50),
                        '360x663' => mt_rand(10, 50),
                        '390x664' => mt_rand(10, 50),
                        '412x724' => mt_rand(10, 50),
                        '1534x863' => mt_rand(10, 50),
                        '1366x768' => mt_rand(10, 50),
                        '360x643' => mt_rand(10, 50),
                        '393x737' => mt_rand(10, 50),
                        '360x632' => mt_rand(10, 50),
                        '1920x937' => mt_rand(10, 50),
                        '412x832' => mt_rand(10, 50),
                        '1536x746' => mt_rand(10, 50),
                        '428x748' => mt_rand(10, 50),
                        '1600x716' => mt_rand(10, 50),
                        '954x928' => mt_rand(10, 50),
                        '414x715' => mt_rand(10, 50),
                        '360x606' => mt_rand(10, 50),
                        '412x785' => mt_rand(10, 50),
                        '375x553' => mt_rand(10, 50),
                        '360x694' => mt_rand(10, 50),
                        '393x733' => mt_rand(10, 50),
                        '360x595' => mt_rand(10, 50),
                        '412x718' => mt_rand(10, 50),
                        '412x714' => mt_rand(10, 50),
                        '360x708' => mt_rand(10, 50),
                        '393x608' => mt_rand(10, 50),
                        '390x669' => mt_rand(10, 50),
                        '384x726' => mt_rand(10, 50),
                        '428x743' => mt_rand(10, 50),
                        '1872x964' => mt_rand(10, 50),
                        '1920x947' => mt_rand(10, 50),
                        '1526x1039' => mt_rand(10, 50),
                        '393x567' => mt_rand(10, 50),
                        '384x719' => mt_rand(10, 50),
                        '393x719' => mt_rand(10, 50),
                        '360x669' => mt_rand(10, 50),
                        '412x751' => mt_rand(10, 50),
                        '388x750' => mt_rand(10, 50),
                        '360x586' => mt_rand(10, 50),
                        '320x454' => mt_rand(10, 50),
                        '396x683' => mt_rand(10, 50),
                        '390x659' => mt_rand(10, 50),
                    ]))
                    ->setLanguage(json_encode([
                        'ru-RU' => mt_rand(40, 200),
                        'en-US' => mt_rand(40, 200),
                        'ru-ru' => mt_rand(40, 200),
                        'en-GB' => mt_rand(40, 200),
                        'ru' => mt_rand(40, 200),
                        'de-DE' => mt_rand(40, 200),
                        'en-DE' => mt_rand(40, 200),
                        'es-ES' => mt_rand(40, 200),
                        'en-AU' => mt_rand(40, 200),
                        'ru-BY' => mt_rand(40, 200),
                        'uk' => mt_rand(40, 200),
                        'zh-CN' => mt_rand(40, 200),
                        'zh-TW' => mt_rand(40, 200),
                    ]))
                    ->setBrowser(json_encode([
                        'yandexbrowser' => mt_rand(100, 400),
                        'firefox' => mt_rand(100, 400),
                        'chrome' => mt_rand(100, 400),
                        'crios' => mt_rand(100, 400),
                        'ios' => mt_rand(100, 400),
                        'safari' => mt_rand(100, 400),
                        'samsung' => mt_rand(100, 400),
                        'opera' => mt_rand(100, 400),
                        'edge-chromium' => mt_rand(100, 400),
                        'ios-webview' => mt_rand(100, 400),
                    ]))
                    ->setOs(json_encode([
                        'Android OS' => mt_rand(10, 50),
                        'iOS' => mt_rand(10, 50),
                        'Mac OS' => mt_rand(10, 50),
                        'Linux' => mt_rand(10, 50),
                        'Windows 10' => mt_rand(10, 50),
                        'Windows 7' => mt_rand(10, 50),
                    ]))
                    ->setEventType(json_encode([
                        'page_view' => mt_rand(100, 500),
                        'load_start' => mt_rand(100, 500),
                        'load_finish' => mt_rand(100, 500),
                        'load_error' => mt_rand(100, 500),
                    ]))
                    ->save();
            }
        }
    }

    protected function _getConnection()
    {
        $cfg = new \Hugin\Config([
            'db' => [
                'connection_string' => 'pgsql:host=' . $_SERVER['PHINX_DB_HUGIN_HOST'] . ';port=' . $_SERVER['PHINX_DB_HUGIN_PORT']
                    . ';dbname=' . $_SERVER['PHINX_DB_HUGIN_NAME'],
                'credentials' => [
                    'username' => $_SERVER['PHINX_DB_HUGIN_USER'],
                    'password' => $_SERVER['PHINX_DB_HUGIN_PASS']
                ]
            ],
            'verbose' => false,
            'verboseLog' => '',
            'serverDefaultTimezone' => 'UTC'
        ]);

        return new \Hugin\Db($cfg);
    }
}
