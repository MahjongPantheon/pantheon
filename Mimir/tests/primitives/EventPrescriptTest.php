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
require_once __DIR__ . '/../../src/primitives/Event.php';
require_once __DIR__ . '/../../src/primitives/Player.php';
require_once __DIR__ . '/../../src/Db.php';

class EventPrescriptPrimitiveTest extends \PHPUnit\Framework\TestCase
{
    /**
     * @var DataSource
     */
    protected $_ds;

    protected function setUp(): void
    {
        $this->_ds = DataSource::__getCleanTestingInstance();
    }

    public function testPackScript()
    {
        $newEventPrescript = new EventPrescriptPrimitive($this->_ds);
        $script = [
            [
                [1, 2, 3, 4],
                [5, 6, 7, 8]
            ],
            [
                [1, 3, 5, 7],
                [2, 4, 6, 8]
            ],
        ];
        $expectedString = implode("\n", [
            '1-2-3-4',
            '5-6-7-8',
            '',
            '1-3-5-7',
            '2-4-6-8'
        ]);

        $this->assertEquals($expectedString, $newEventPrescript->packScript($script));
    }

    public function testUnpackScript()
    {
        $newEventPrescript = new EventPrescriptPrimitive($this->_ds);
        $string = implode("\n", [
            '1-2-3-4',
            '5-6-7-8',
            '',
            '1-3-5-7',
            '2-4-6-8'
        ]);
        $expectedScript = [
            [
                [1, 2, 3, 4],
                [5, 6, 7, 8]
            ],
            [
                [1, 3, 5, 7],
                [2, 4, 6, 8]
            ],
        ];

        $this->assertEquals($expectedScript, $newEventPrescript->unpackScript($string));
    }
}
