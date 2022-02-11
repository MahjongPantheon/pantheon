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
namespace Mimir;

require_once __DIR__ . '/../../src/Ruleset.php';
require_once __DIR__ . '/../../src/Db.php';
require_once __DIR__ . '/../../src/Meta.php';
require_once __DIR__ . '/../../src/models/PlayerStat.php';
require_once __DIR__ . '/../../src/models/Event.php';
require_once __DIR__ . '/../../src/models/EventSeries.php';
require_once __DIR__ . '/../../src/primitives/Player.php';
require_once __DIR__ . '/../../src/primitives/PlayerRegistration.php';
require_once __DIR__ . '/../../src/primitives/Event.php';
require_once __DIR__ . '/../../data/textlogImport/Model.php';

class GamesSeriesTest extends \PHPUnit\Framework\TestCase
{
    /**
     * @var DataSource
     */
    protected $_ds;
    /**
     * @var PlayerPrimitive[]
     */
    protected $_players = [];
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

    public function setUp()
    {
        $playerNames = array_filter(preg_split('#\s#is', file_get_contents(__DIR__ . '/../models/testdata/players.txt')));
        $games = explode("\n\n\n", file_get_contents(__DIR__ . '/../models/testdata/games.txt'));

        $this->_config = new Config(getenv('OVERRIDE_CONFIG_PATH'));

        $this->_ds = DataSource::__getCleanTestingInstance();
        $this->_meta = new Meta($this->_ds->remote(), $this->_config, $_SERVER);
        $this->_event = (new EventPrimitive($this->_ds))
            ->setTitle('title')
            ->setTitleEn('title')
            ->setTimezone('UTC')
            ->setDescription('desc')
            ->setDescriptionEn('desc')
            ->setSeriesLength(5)
            ->setRuleset(\Common\Ruleset::instance('ema'));
        $this->_event->save();

        $this->_players = PlayerPrimitive::findById($this->_ds, [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
            17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32
        ]);
        foreach ($this->_players as $p) {
            (new PlayerRegistrationPrimitive($this->_ds))
                ->setReg($p, $this->_event)
                ->save();
        }

        $model = new TextlogImportModel($this->_ds, $this->_config, $this->_meta);

        foreach ($games as $log) {
            $model->addGame($this->_event->getId(), $log, [
                'player1' => 1,
                'player2' => 2,
                'player3' => 3,
                'player4' => 4,
                'player5' => 5,
                'player6' => 6,
                'player7' => 7,
                'player8' => 8,
                'player9' => 9,
                'player10' => 10,
                'player11' => 11,
                'player12' => 12,
                'player13' => 13,
                'player14' => 14,
                'player15' => 15,
                'player16' => 16,
                'player17' => 17,
                'player18' => 18,
                'player19' => 19,
                'player20' => 20,
                'player21' => 21,
                'player22' => 22,
                'player23' => 23,
                'player24' => 24,
                'player25' => 25,
                'player26' => 26,
                'player27' => 27,
                'player28' => 28,
                'player29' => 29,
                'player30' => 30,
                'player31' => 31,
                'player32' => 32,
            ]);
        }
    }

    public function testGetGamesSeries()
    {
        $data = (new EventSeriesModel($this->_ds, $this->_config, $this->_meta))->getGamesSeries($this->_event);
        //$this->assertNotEmpty($data);

        $referenceData = [
            27 => [
                'best_series'    => [1, 1, 2, 1, 1],
                'current_series' => [1, 2, 1, 1, 4]
            ],
            15 => [
                'best_series'    => [2, 2, 1, 1, 1],
                'current_series' => [1, 1, 4, 1, 4]
            ],
            3 => [
                'best_series'    => [2, 2, 1, 3, 1],
                'current_series' => [2, 2, 1, 3, 1]
            ],
            19 => [
                'best_series'    => [1, 1, 2, 4, 1],
                'current_series' => [1, 1, 2, 4, 1]
            ],
            9 => [
                'best_series'    => [1, 3, 1, 3, 1],
                'current_series' => [1, 3, 1, 4, 3]
            ],
            29 => [
                'best_series'    => [3, 1, 1, 2, 2],
                'current_series' => [2, 2, 3, 4, 2]
            ],
            6 => [
                'best_series'    => [1, 3, 4, 1, 1],
                'current_series' => [3, 4, 1, 1, 2]
            ],
            10 => [
                'best_series'    => [3, 1, 3, 2, 1],
                'current_series' => [3, 1, 3, 2, 1]
            ],
            4 => [
                'best_series'    => [2, 4, 2, 1, 1],
                'current_series' => [2, 4, 2, 1, 1]
            ],
            8 => [
                'best_series'    => [1, 1, 4, 3, 1],
                'current_series' => [3, 1, 3, 3, 2]
            ],
            26 => [
                'best_series'    => [2, 1, 3, 3, 1],
                'current_series' => [3, 1, 3, 1, 3]
            ],
            25 => [
                'best_series'    => [2, 3, 1, 2, 2],
                'current_series' => [2, 3, 1, 2, 2]
            ],
            28 => [
                'best_series'    => [1, 1, 1, 3, 4],
                'current_series' => [1, 3, 4, 3, 2]
            ],
            21 => [
                'best_series'    => [1, 3, 2, 1, 4],
                'current_series' => [1, 4, 4, 2, 2]
            ],
            11 => [
                'best_series'    => [4, 3, 1, 1, 2],
                'current_series' => [1, 1, 2, 4, 3]
            ],
            2 => [
                'best_series'    => [1, 3, 2, 2, 3],
                'current_series' => [1, 3, 2, 2, 3]
            ],
            14 => [
                'best_series'    => [2, 4, 1, 3, 1],
                'current_series' => [2, 4, 1, 3, 1]
            ],
            5 => [
                'best_series'    => [4, 1, 2, 3, 1],
                'current_series' => [2, 3, 1, 4, 4]
            ],
            18 => [
                'best_series'    => [3, 4, 1, 1, 2],
                'current_series' => [3, 4, 1, 1, 2]
            ],
            32 => [
                'best_series'    => [1, 3, 4, 2, 1],
                'current_series' => [3, 4, 2, 1, 4]
            ],
            30 => [
                'best_series'    => [1, 2, 2, 4, 3],
                'current_series' => [4, 3, 3, 3, 4]
            ],
            23 => [
                'best_series'    => [2, 3, 4, 1, 2],
                'current_series' => [4, 1, 2, 2, 4]
            ],
            17 => [
                'best_series'    => [1, 2, 3, 4, 2],
                'current_series' => [4, 2, 4, 2, 1]
            ],
            13 => [
                'best_series'    => [2, 3, 2, 2, 3],
                'current_series' => [2, 2, 3, 3, 4]
            ],
            7 => [
                'best_series'    => [2, 3, 3, 2, 2],
                'current_series' => [3, 3, 2, 2, 3]
            ],
            16 => [
                'best_series'    => [1, 4, 2, 4, 2],
                'current_series' => [4, 2, 3, 4, 1]
            ],
            31 => [
                'best_series'    => [2, 2, 2, 3, 4],
                'current_series' => [3, 4, 4, 3, 4]
            ],
            1 => [
                'best_series'    => [4, 2, 2, 2, 3],
                'current_series' => [4, 2, 2, 2, 3]
            ],
            20 => [
                'best_series'    => [2, 2, 4, 4, 2],
                'current_series' => [4, 2, 4, 4, 2]
            ],
            22 => [
                'best_series'    => [4, 1, 3, 3, 3],
                'current_series' => [4, 1, 3, 3, 3]
            ],
            12 => [
                'best_series'    => [2, 3, 4, 4, 1],
                'current_series' => [2, 3, 4, 4, 1]
            ],
            24 => [
                'best_series'    => [2, 4, 4, 4, 1],
                'current_series' => [4, 4, 4, 1, 3]
            ]
        ];

        foreach ($data as $item) {
            $bestSeries = array_map(function ($el) {
                return $el['place'];
            }, $item['best_series']);

            $currentSeries = array_map(function ($el) {
                return $el['place'];
            }, $item['current_series']);

            $this->assertEquals($bestSeries, $referenceData[$item['player']['id']]['best_series']);
            $this->assertEquals($currentSeries, $referenceData[$item['player']['id']]['current_series']);
        }
    }
}
