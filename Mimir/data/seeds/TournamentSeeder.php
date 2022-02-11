<?php

use Phinx\Seed\AbstractSeed;
require_once __DIR__ . '/../../src/primitives/Event.php';
require_once __DIR__ . '/../../src/primitives/Player.php';
require_once __DIR__ . '/../../src/primitives/PlayerRegistration.php';
require_once __DIR__ . '/../../src/primitives/PlayerHistory.php';
require_once __DIR__ . '/../textlogImport/Model.php';
require_once __DIR__ . '/../../src/Db.php';
require_once __DIR__ . '/../../src/Meta.php';
require_once __DIR__ . '/../../src/Ruleset.php';

class TournamentSeeder extends AbstractSeed
{
    /**
     * @throws Exception
     * @throws \Mimir\InvalidParametersException
     */
    public function run()
    {
        // Non-phinx-based seeder to avoid rewriting seeds for every schema change
        list($src, $config) = $this->_getConnection();
        $event = $this->_seedEvent($src);
        $idMap = $this->_seedPlayers($src, $event);
        $this->_seedGames($src, $config, $event, $idMap);

        // update event and set syncEnd to true for pre-finished state testing
        $event->setSyncEnd(1)->save();

        echo '-----------------------------------------------------------------' . PHP_EOL;
        echo "New seeded event link: " . getenv('RHEDA_URL') . "/eid{$event->getId()}" . PHP_EOL;
        echo '-----------------------------------------------------------------' . PHP_EOL;
    }

    /**
     * @param \Mimir\DataSource $ds
     * @return \Mimir\EventPrimitive
     * @throws Exception
     * @throws \Mimir\InvalidParametersException
     */
    protected function _seedEvent(\Mimir\DataSource $ds)
    {
        $event = (new \Mimir\EventPrimitive($ds))
            ->setTitle('title')
            ->setTitleEn('title_en')
            ->setDescription('desc')
            ->setDescriptionEn('desc_en')
            ->setTimezone('Europe/Moscow')
            ->setAllowPlayerAppend(0)
            ->setAutoSeating(1)
            ->setSyncStart(1)
            ->setUsePenalty(1)
            ->setUseTimer(1)
            ->setGameDuration(20)
            ->setRuleset(\Common\Ruleset::instance('ema'));
        $event->save();
        return $event;
    }

    protected function _seedPlayers(\Mimir\DataSource $ds, \Mimir\EventPrimitive $event)
    {
        $idMap = [];
        $playerNames = array_filter(preg_split('#\s#is', file_get_contents(__DIR__ . '/../../tests/models/testdata/players.txt')));
        array_map(function ($id) use ($ds, $event, &$idMap) {
            $playerId = $ds->remote()->createAccount(
                'test' . $id . '@test.te',
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
     * @throws Exception
     * @throws \Mimir\InvalidParametersException
     * @throws \Mimir\MalformedPayloadException
     * @throws \Mimir\ParseException
     */
    protected function _seedGames(\Mimir\DataSource $ds, \Mimir\Config $config, \Mimir\EventPrimitive $event, $idMap)
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

        $meta = new \Mimir\Meta($ds->remote(), $config, $_SERVER);
        $model = new \Mimir\TextlogImportModel($ds, $config, $meta);

        foreach ($games as $log) {
            $model->addGame($event->getId(), $log, $idMap);
        }
    }

    protected function _getConnection()
    {
        $cfg = new \Mimir\Config([
            'db' => [
                'connection_string' => 'pgsql:host=localhost;port=' . $_SERVER['PHINX_DB_PORT']
                    . ';dbname=' . $_SERVER['PHINX_DB_NAME'],
                'credentials' => [
                    'username' => $_SERVER['PHINX_DB_USER'],
                    'password' => $_SERVER['PHINX_DB_PASS']
                ]
            ],
            'admin'     => [
                'debug_token' => '2-839489203hf2893'
            ],
            'routes'    => require __DIR__ . '/../../config/routes.php',
            'freyUrl'   => getenv('FREY_URL'),
            'verbose'   => false,
            'verboseLog' => '',
            'api' => [
                'version_major' => '1',
                'version_minor' => '0'
            ]
        ]);

        $db = new \Mimir\Db($cfg);
        $frey = new \Mimir\FreyClient($cfg->getStringValue('freyUrl'));
        $frey->getClient()->getHttpClient()->withHeaders([
            'X-Debug-Token: CHANGE_ME',
        ]);
        return [new \Mimir\DataSource($db, $frey), $cfg];
    }
}
