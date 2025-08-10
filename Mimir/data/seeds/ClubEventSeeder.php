<?php

use Phinx\Seed\AbstractSeed;
require_once __DIR__ . '/../../src/primitives/Event.php';
require_once __DIR__ . '/../../src/primitives/Player.php';
require_once __DIR__ . '/../../src/primitives/PlayerRegistration.php';
require_once __DIR__ . '/../../src/primitives/PlayerHistory.php';
require_once __DIR__ . '/../../src/primitives/PlayerStats.php';
require_once __DIR__ . '/../textlogImport/Model.php';
require_once __DIR__ . '/../../src/Db.php';
require_once __DIR__ . '/../../src/Meta.php';
require_once __DIR__ . '/../../src/FreyClientTwirp.php';
require_once __DIR__ . '/../../src/Ruleset.php';

class ClubEventSeeder extends AbstractSeed
{
    /**
     * @throws Exception
     * @throws \Mimir\InvalidParametersException
     * @throws \Mimir\MalformedPayloadException
     * @throws \Mimir\ParseException
     */
    public function run()
    {
        // Non-phinx-based seeder to avoid rewriting seeds for every schema change
        list($src, $config) = $this->_getConnection();
        date_default_timezone_set((string)$config->getValue('serverDefaultTimezone'));
        $event = $this->_seedEvent($src);
        $idMap = $this->_seedPlayers($src, $event);
        $this->_seedGames($src, $config, $event, $idMap, intval(getenv('SEED_REPEAT') ?: '1'));

        echo '-----------------------------------------------------------------' . PHP_EOL;
        echo "New seeded event link: ' " . getenv('SIGRUN_URL') . "/event/{$event->getId()}/info" . PHP_EOL;
        echo '-----------------------------------------------------------------' . PHP_EOL;
    }

    /**
     * @param \Mimir\DataSource $src
     * @return \Mimir\EventPrimitive
     * @throws Exception
     * @throws \Mimir\InvalidParametersException
     */
    protected function _seedEvent(\Mimir\DataSource $src)
    {
        $event = (new \Mimir\EventPrimitive($src))
            ->setTitle('title')
            ->setDescription('desc')
            ->setTimezone('Europe/Moscow')
            ->setAllowPlayerAppend(1)
            ->setAutoSeating(0)
            ->setSyncStart(0)
            ->setUsePenalty(1)
            ->setIsListed(1)
            ->setRulesetConfig(\Common\Ruleset::instance('ema'));
        $event->save();
        return $event;
    }

    /**
     * @param \Mimir\DataSource $ds
     * @param \Mimir\EventPrimitive $event
     * @return array
     */
    protected function _seedPlayers(\Mimir\DataSource $ds, \Mimir\EventPrimitive $event)
    {
        $idMap = [];
        $playerNames = array_filter(preg_split('#\s#is', file_get_contents(__DIR__ . '/../../tests/models/testdata/players.txt')));
        array_map(function ($id) use ($ds, $event, &$idMap) {
            $playerId = $ds->remote()->createAccount(
                'test' . $id . '_' . crc32(time()) . '@test.te',
                'pwd',
                'player' . $id,
                'City of sin',
                '123-123-123',
                'TH' . $id
            );
            (new \Mimir\PlayerRegistrationPrimitive($ds))
                ->_setRegRaw($playerId, $event)
                ->save();
            $idMap[$id] = $playerId;
        }, $playerNames);
        return $idMap;
    }

    /**
     * @param \Mimir\DataSource $ds
     * @param \Mimir\Config $config
     * @param \Mimir\EventPrimitive $event
     * @param $idMap
     * @param int $repeat
     * @throws Exception
     * @throws \Mimir\InvalidParametersException
     * @throws \Mimir\MalformedPayloadException
     * @throws \Mimir\ParseException
     */
    protected function _seedGames(\Mimir\DataSource $ds, \Mimir\Config $config, \Mimir\EventPrimitive $event, $idMap, $repeat)
    {
        $data = '%' . implode("%\n%", explode("\n", file_get_contents(__DIR__ . '/../../tests/models/testdata/games.txt'))) . '%';
        $games = array_map(function($game) {
            return preg_replace('#^%|%$#ims', '', str_replace("%\n%", "\n", $game));
        }, explode("\n%%\n%%\n",
            preg_replace_callback('#(\s|%)([\d\ ]+)(\s|:|%)#is', function($matches) use ($idMap) {
                return $matches[1] .
                    implode(' ',
                        array_map(
                            function($id) use ($idMap) { return $idMap[$id]; },
                            explode(' ', $matches[2])
                        )
                    )
                    . $matches[3];
            }, $data
            )));

        $meta = new \Mimir\Meta($ds->remote(), new \Common\Storage('localhost'), $config, $_SERVER);
        $model = new \Mimir\TextlogImportModel($ds, $config, $meta);

        for ($i = 0; $i < $repeat; $i++) {
            foreach ($games as $log) {
                $model->addGame($event->getId(), $log, $idMap);
            }
        }
    }

    protected function _getConnection()
    {
        $cfg = new \Mimir\Config([
            'db' => [
                'connection_string' => 'pgsql:host=' . $_SERVER['PHINX_DB_HOST'] . ';port=' . $_SERVER['PHINX_DB_PORT']
                                       . ';dbname=' . $_SERVER['PHINX_DB_NAME'],
                'credentials' => [
                    'username' => $_SERVER['PHINX_DB_USER'],
                    'password' => $_SERVER['PHINX_DB_PASS']
                ]
            ],
            'admin'     => [
                'debug_token' => 'CHANGE_ME'
            ],
            'serverDefaultTimezone' => 'UTC',
            'freyUrl'   => getenv('FREY_URL_INTERNAL'),
            'verbose'   => false,
            'verboseLog' => '',
            'api' => [
                'version_major' => '1',
                'version_minor' => '0'
            ]
        ]);

        $db = new \Mimir\Db($cfg);
        $frey = new \Mimir\FreyClientTwirp($cfg->getStringValue('freyUrl'));
        $frey->withHeaders([
            'X-Internal-Query-Secret' => 'CHANGE_ME_INTERNAL',
            'X-Debug-Token' => 'CHANGE_ME'
        ]);
        $mc = new \Memcached();
        $mc->addServer('localhost', 11211);
        return [new \Mimir\DataSource($db, $frey, $mc), $cfg];
    }
}
