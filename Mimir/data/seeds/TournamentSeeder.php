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

class TournamentSeeder extends AbstractSeed
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
        echo "New seeded event link: http://localhost:4002/eid{$event->getId()}" . PHP_EOL;
        echo '-----------------------------------------------------------------' . PHP_EOL;
    }

    protected function _seedEvent(\Riichi\Db $db)
    {
        $event = (new \Riichi\EventPrimitive($db))
            ->setTitle('title')
            ->setDescription('desc')
            ->setType('offline')
            ->setTimezone('Europe/Moscow')
            ->setAllowPlayerAppend(0)
            ->setAutoSeating(1)
            ->setSyncStart(1)
            ->setUsePenalty(1)
            ->setUseTimer(1)
            ->setGameDuration(20)
            ->setRuleset(\Riichi\Ruleset::instance('ema'));
        $event->save();
        return $event;
    }

    protected function _seedPlayers(\Riichi\Db $db, \Riichi\EventPrimitive $event)
    {
        $playerNames = array_filter(preg_split('#\s#is', file_get_contents(__DIR__ . '/../../tests/models/testdata/players.txt')));
        array_map(function ($id) use ($db, $event) {
            $p = (new \Riichi\PlayerPrimitive($db))
                ->setDisplayName($id)
                ->setAlias($id)
                ->setIdent($id)
                ->setTenhouId($id);
            $p->save();
            (new \Riichi\PlayerRegistrationPrimitive($db))
                ->setReg($p, $event)
                ->save();
            return $p;
        }, $playerNames);
    }

    protected function _seedGames(\Riichi\Db $db, \Riichi\Config $config, \Riichi\EventPrimitive $event)
    {
        $games = explode("\n\n\n", file_get_contents(__DIR__ . '/../../tests/models/testdata/games.txt'));
        $meta = new \Riichi\Meta($_SERVER);
        $model = new \Riichi\TextmodeSessionModel($db, $config, $meta);

        foreach ($games as $log) {
            $model->addGame($event->getId(), $log);
        }
    }

    protected function _getConnection()
    {
        $cfg = new \Riichi\Config([
            'db' => [
                'connection_string' => 'pgsql:host=localhost;port=' . $_SERVER['PHINX_DB_PORT']
                                       . 'dbname=' . $_SERVER['PHINX_DB_NAME'],
                'credentials' => [
                    'username' => $_SERVER['PHINX_DB_USER'],
                    'password' => $_SERVER['PHINX_DB_PASS']
                ]
            ],
            'admin'     => [
                'god_token' => '198vdsh904hfbnkjv98whb2iusvd98b29bsdv98svbr9wghj',
                'debug_token' => '2-839489203hf2893'
            ],
            'routes'    => require __DIR__ . '/../../config/routes.php',
            'verbose'   => false,
            'verboseLog' => '',
            'api' => [
                'version_major' => 1,
                'version_minor' => 0
            ]
        ]);

        return [new \Riichi\Db($cfg), $cfg];
    }
}
