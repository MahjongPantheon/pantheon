<?php

use Phinx\Seed\AbstractSeed;
require_once __DIR__ . '/../../src/primitives/Event.php';
require_once __DIR__ . '/../../src/primitives/Player.php';
require_once __DIR__ . '/../../src/primitives/PlayerRegistration.php';
require_once __DIR__ . '/../../src/primitives/PlayerHistory.php';
require_once __DIR__ . '/../../src/models/TextmodeSession.php';
require_once __DIR__ . '/../../src/Db.php';
require_once __DIR__ . '/../../src/Meta.php';
require_once __DIR__ . '/../../src/Ruleset.php';

class ClubEventSeeder extends AbstractSeed
{
    public function run()
    {
        // Non-phinx-based seeder to avoid rewriting seeds for every schema change

        $tables = file(__DIR__ . '/../tablelist.txt');

        // cleanup. Don't use truncate() - it won't work with FKs
        foreach ($tables as $t) {
            $this->table($t)->getAdapter()->execute('DELETE FROM ' . $t);
        }

        $this->table('player')->getAdapter()->commitTransaction();

        list($db, $config) = $this->_getConnection();
        $event = $this->_seedEvent($db);
        $this->_seedPlayers($db, $event);
        $this->_seedGames($db, $config, $event);

        echo '-----------------------------------------------------------------' . PHP_EOL;
        echo "New seeded event link: ' " . getenv('RHEDA_URL') . "/eid{$event->getId()}" . PHP_EOL;
        echo '-----------------------------------------------------------------' . PHP_EOL;
    }

    protected function _seedEvent(\Mimir\Db $db)
    {
        $event = (new \Mimir\EventPrimitive($db))
            ->setTitle('title')
            ->setDescription('desc')
            ->setTimezone('Europe/Moscow')
            ->setAllowPlayerAppend(1)
            ->setAutoSeating(0)
            ->setSyncStart(0)
            ->setUsePenalty(1)
            ->setRuleset(\Mimir\Ruleset::instance('ema'));
        $event->save();
        return $event;
    }

    protected function _seedPlayers(\Mimir\Db $db, \Mimir\EventPrimitive $event)
    {
        $playerNames = array_filter(preg_split('#\s#is', file_get_contents(__DIR__ . '/../../tests/models/testdata/players.txt')));
        array_map(function ($id) use ($db, $event) {
            $p = (new \Mimir\PlayerPrimitive($db))
                ->setDisplayName($id)
                ->setAlias($id)
                ->setIdent($id)
                ->setTenhouId($id);
            $p->save();
            (new \Mimir\PlayerRegistrationPrimitive($db))
                ->setReg($p, $event)
                ->save();
            return $p;
        }, $playerNames);
    }

    protected function _seedGames(\Mimir\Db $db, \Mimir\Config $config, \Mimir\EventPrimitive $event)
    {
        $games = explode("\n\n\n", file_get_contents(__DIR__ . '/../../tests/models/testdata/games.txt'));
        $freyClient = new \Mimir\FreyClient($config->getValue('freyUrl'));
        $meta = new \Mimir\Meta($freyClient, $_SERVER);
        $model = new \Mimir\TextmodeSessionModel($db, $config, $meta);

        $games = array_slice($games, 0, 10); // 10 games is enough, just to speed up seeding

        foreach ($games as $log) {
            $model->addGame($event->getId(), $log);
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
                'version_major' => 1,
                'version_minor' => 0
            ]
        ]);

        return [new \Mimir\Db($cfg), $cfg];
    }
}
