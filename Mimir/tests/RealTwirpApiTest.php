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

use Common\Generic_Event_Payload;

require_once __DIR__ . '/../src/Db.php';
require_once __DIR__ . '/../src/DataSource.php';
require_once __DIR__ . '/../src/primitives/Event.php';

/**
 * Class RealApiTest: integration test suite
 * @package Mimir
 */
class RealTwirpApiTest extends \PHPUnit\Framework\TestCase
{
    /**
     * @var
     */
    protected $_client;
    /**
     * @var DataSource
     */
    protected $_ds;

    /**
     * @throws \Exception
     */
    protected function setUp(): void
    {
        $this->_ds = DataSource::__getCleanTestingInstance();
        $this->_client = new \Common\MimirAdapter(
            'http://localhost:1349',
            null,
            null,
            null,
            '/v2'
        );
        $this->_client->withHeaders([
            'X-Twirp' => 'true',
            'X-Auth-Token' => '198vdsh904hfbnkjv98whb2iusvd98b29bsdv98svbr9wghj',
            'X-Current-Person-Id' => 1
        ]);
    }

    protected function _createEvent()
    {
        $evt = (new EventPrimitive($this->_ds))
            ->setRuleset(\Common\Ruleset::instance('ema')) // TODO: why 'tenhounet' rules fail? o_0
            ->setTimezone('UTC')
            ->setTitle('test')
            ->setDescription('test')
            ->setUseTimer(1)
            ->setAllowPlayerAppend(0)
            ->setGameDuration(1);
        $evt->save();
        return $evt->getId();
    }

    public function testGameConfig()
    {
        $eventId = $this->_createEvent();
        $response = $this->_client->GetGameConfig(
            [],
            (new Generic_Event_Payload())->setEventId($eventId)
        );
        $this->assertEquals(false, $response->getWithAbortives());
        $this->assertEquals(30000, $response->getStartPoints());
    }
}
