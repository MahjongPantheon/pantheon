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

require_once __DIR__ . '/../../src/helpers/YakuMap.php';

class YakuMapTest extends \PHPUnit\Framework\TestCase
{
    public function testFromTenhou()
    {
        $yakuList = '1,1,2,1,24,2,52,2,53,1,54,3';
        $yakumanList = '46';

        $result = YakuMap::fromTenhou($yakuList, $yakumanList);
        $expected = [
            Y_RIICHI,
            Y_IPPATSU,
            Y_ITTSU,
            Y_CHUURENPOUTO
        ];

        sort($result['yaku']);
        sort($expected);

        $this->assertEquals($expected, $result['yaku']);
        $this->assertEquals(1, $result['yakuman']);
        $this->assertEquals(6, $result['dora']);
        $this->assertEquals(-1, $result['han']);
    }
}
