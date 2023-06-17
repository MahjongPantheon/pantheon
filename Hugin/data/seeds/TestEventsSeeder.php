<?php

use Phinx\Seed\AbstractSeed;

require_once __DIR__ . '/../../src/primitives/Event.php';
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
        /* Fields order:
            'session_id', 'site_id', 'hostname', 'browser',
            'os', 'device', 'screen', 'language', 'country',
            'city', 'created_at'
        '*/
        $fd = fopen(__DIR__ . '/testdata.csv', 'r');
        $cnt = 0;
        /** @var array|false $row */
        while (($row = fgetcsv($fd, 20000, ',')) !== false) {
            $cnt ++;
            (new \Hugin\EventPrimitive($db))
                ->setSessionId($row[0])
                ->setSiteId($row[1])
                ->setHostname($row[2])
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
