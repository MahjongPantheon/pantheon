<?php
/*  Mimir: mahjong games storage
 *  Copyright (C) 2016  o.klimenko aka ctizen
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
namespace Riichi;

require_once __DIR__ . '/../../src/Ruleset.php';
require_once __DIR__ . '/../../src/models/TextmodeSession.php';
require_once __DIR__ . '/../../src/models/PlayerStat.php';
require_once __DIR__ . '/../../src/models/Event.php';
require_once __DIR__ . '/../../src/primitives/PlayerRegistration.php';
require_once __DIR__ . '/../../src/primitives/Player.php';
require_once __DIR__ . '/../../src/primitives/Event.php';
require_once __DIR__ . '/../../src/Db.php';
require_once __DIR__ . '/../../src/Meta.php';

use \JsonSchema\SchemaStorage;
use \JsonSchema\Validator;
use \JsonSchema\Constraints\Factory;

/**
 * Class SessionTest: integration test suite
 * @package Riichi
 */
class TextmodeSessionWholeEventTest extends \PHPUnit_Framework_TestCase
{
    /**
     * @var Db
     */
    protected $_db;
    /**
     * @var EventPrimitive
     */
    protected $_event;
    /**
     * @var Config
     */
    protected $_config;
    /**
     * @var Meta
     */
    protected $_meta;

    public function testMakeTournament()
    {
        $playerNames = array_filter(preg_split('#\s#is', file_get_contents(__DIR__ . '/testdata/players.txt')));
        $games = explode("\n\n\n", file_get_contents(__DIR__ . '/testdata/games.txt'));

        $this->_config = new Config(getenv('OVERRIDE_CONFIG_PATH'));
        $_SERVER['HTTP_X_AUTH_TOKEN'] = $this->_config->getValue('admin.god_token');

        $this->_meta = new Meta($_SERVER);
        $this->_db = Db::__getCleanTestingInstance();
        $this->_event = (new EventPrimitive($this->_db))
            ->setTitle('title')
            ->setTimezone('UTC')
            ->setDescription('desc')
            ->setType('offline')
            ->setRuleset(Ruleset::instance('ema'));
        $this->_event->save();

        $players = array_map(function ($id) {
            $p = (new PlayerPrimitive($this->_db))
                ->setDisplayName($id)
                ->setAlias($id)
                ->setIdent($id)
                ->setTenhouId($id);
            $p->save();
            (new PlayerRegistrationPrimitive($this->_db))
                ->setReg($p, $this->_event)
                ->save();
            return $p;
        }, $playerNames);

        $model = new TextmodeSessionModel($this->_db, $this->_config, $this->_meta);

        foreach ($games as $log) {
            $model->addGame($this->_event->getId(), $log);
        }
        // no exceptions - ok!

        // Make some stats and check them
        $statModel = new PlayerStatModel($this->_db, $this->_config, $this->_meta);
        $stats = $statModel->getStats($this->_event->getId(), '10');
        $this->assertEquals(8 + 1, count($stats['rating_history'])); // initial + 8 games
        $this->assertEquals(8, count($stats['score_history']));
        $this->assertGreaterThan(12, count($stats['players_info']));
        $this->assertEquals(8, array_sum($stats['places_summary']));

        // check stats schema
        $validator = new Validator();
        $schema = json_decode(file_get_contents(__DIR__ . '/../../src/validators/playerStatSchema.json'));
        $validator->check(json_decode(json_encode($stats)), $schema);
        $this->assertEquals(
            true,
            $validator->isValid(),
            implode("", array_map(function ($error) {
                return sprintf("[%s] %s\n", $error['property'], $error['message']);
            }, $validator->getErrors()))
        );
        $this->assertEquals([], $validator->getErrors());

        // Make rating table
        $eventModel = new EventModel($this->_db, $this->_config, $this->_meta);
        $ratings = $eventModel->getRatingTable($this->_event, 'avg_place', 'asc');
        $this->assertNotEmpty($ratings);
        $this->assertEquals(8, $ratings[0]['games_played']);
        $this->assertEquals(3, $ratings[0]['id']); // we know player 3 to win in current tournament

        // Check rating table schema
        $validatorRating = new Validator();
        $schemaRating = json_decode(file_get_contents(__DIR__ . '/../../src/validators/ratingTableSchema.json'));
        $validatorRating->check(json_decode(json_encode($ratings)), $schemaRating);
        $this->assertEquals(
            true,
            $validatorRating->isValid(),
            implode("", array_map(function ($error) {
                return sprintf("[%s] %s\n", $error['property'], $error['message']);
            }, $validatorRating->getErrors()))
        );
        $this->assertEquals([], $validatorRating->getErrors());

        // Try getting last games list
        $data = $eventModel->getLastFinishedGames($this->_event, 10, 0, 'id', 'desc');
        $this->assertNotEmpty($data['games']);
        $this->assertNotEmpty($data['players']);
        $this->assertEquals(10, count($data['games']));

        // Check games list schema
        $schemaStorage = new SchemaStorage();
        $schemaGameList = json_decode(file_get_contents(__DIR__ . '/../../src/validators/gamesListSchema.json'));
        $schemaStorage->addSchema('file://mySchema', $schemaGameList);
        $validatorList = new Validator(new Factory($schemaStorage));

        $validatorList->check(json_decode(json_encode($data)), $schemaGameList);
        $this->assertEquals(
            true,
            $validatorList->isValid(),
            implode("", array_map(function ($error) {
                return sprintf("[%s] %s\n", $error['property'], $error['message']);
            }, $validatorList->getErrors()))
        );
        $this->assertEquals([], $validatorList->getErrors());
    }
}
