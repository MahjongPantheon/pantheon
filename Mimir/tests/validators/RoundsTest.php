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

require_once __DIR__ . '/../../src/validators/Round.php';
require_once __DIR__ . '/../../src/Db.php';

class RoundsHelperTest extends \PHPUnit\Framework\TestCase
{
    /**
     * @var DataSource
     */
    protected $_ds;
    protected function setUp(): void
    {
        $this->_ds = DataSource::__getCleanTestingInstance();
    }

    // Positive tests

    public function testCheckOneOf()
    {
        $checkOneOf = new \ReflectionMethod('\Mimir\RoundsHelper', '_checkOneOf');
        $checkOneOf->setAccessible(true);

        $data = ['test' => 'okval'];
        $possibleVals = ['okval3', 'okval', 'okval2'];
        $checkOneOf->invokeArgs(null, [$data, 'test', $possibleVals]);
        $this->assertTrue(true); // no exception == ok
    }

    public function testCheckZeroOrMoreOf()
    {
        $checkOneOf = new \ReflectionMethod('\Mimir\RoundsHelper', '_csvCheckZeroOrMoreOf');
        $checkOneOf->setAccessible(true);

        $data = ['test' => 'a,b'];

        $checkOneOf->invokeArgs(null, [
            $data,
            'test',
            'a,b,c,d'
        ]);
        $this->assertTrue(true); // no exception == ok

        $checkOneOf->invokeArgs(null, [
            $data,
            'test',
            'a,b'
        ]);
        $this->assertTrue(true); // no exception == ok

        $checkOneOf->invokeArgs(null, [
            $data,
            'test',
            'c,b,a,d'
        ]);
        $this->assertTrue(true); // no exception == ok

        $checkOneOf->invokeArgs(null, [
            ['test' => ''], // empty ok
            'test',
            'c,b,a,d'
        ]);
        $this->assertTrue(true); // no exception == ok

        $checkOneOf->invokeArgs(null, [
            ['test' => '2'], // single number ok
            'test',
            '1,2,3,4'
        ]);
        $this->assertTrue(true); // no exception == ok
    }

    public function testCheckYakuEmpty()
    {
        $checkYaku = new \ReflectionMethod('\Mimir\RoundsHelper', '_checkYaku');
        $checkYaku->setAccessible(true);

        $data = '';
        $possibleVals = [1, 2, 3];
        $checkYaku->invokeArgs(null, [$data, $possibleVals]);
        $this->assertTrue(true); // no exception == ok
    }

    public function testCheckYakuAllowed()
    {
        $checkYaku = new \ReflectionMethod('\Mimir\RoundsHelper', '_checkYaku');
        $checkYaku->setAccessible(true);

        $data = '1,3';
        $possibleVals = [1, 2, 3];
        $checkYaku->invokeArgs(null, [$data, $possibleVals]);
        $this->assertTrue(true); // no exception == ok
    }

    public function testCheckRonValid()
    {
        $checkRon = new \ReflectionMethod('\Mimir\RoundsHelper', '_checkRon');
        $checkRon->setAccessible(true);

        $checkRon->invokeArgs(null, [
            '1,2,3,4',
            [1, 2, 3],
            [
                'riichi'    => '',
                'winner_id' => 2,
                'loser_id'  => 3,
                'han'       => 2,
                'fu'        => 20,
                'multi_ron' => null,
                'yaku'      => '3',
                'dora'      => 0,
                'uradora'   => 0,
                'kandora'   => 0,
                'kanuradora' => 0
            ]
        ]);
        $this->assertTrue(true); // no exception == ok
    }

    public function testCheckMultiRonValid()
    {
        $checkRon = new \ReflectionMethod('\Mimir\RoundsHelper', '_checkMultiron');
        $checkRon->setAccessible(true);

        $checkRon->invokeArgs(null, [
            '1,2,3,4',
            [1, 2, 3, 8],
            [
                'loser_id'  => 3,
                'multi_ron' => 2,
                'wins' => [
                    [
                        'riichi'    => '',
                        'winner_id' => 1,
                        'han'       => 2,
                        'fu'        => 40,
                        'yaku'      => '8',
                        'dora'      => 0,
                        'uradora'   => 0,
                        'kandora'   => 0,
                        'kanuradora' => 0
                    ], [
                        'riichi'    => '',
                        'winner_id' => 2,
                        'han'       => 2,
                        'fu'        => 20,
                        'yaku'      => '3',
                        'dora'      => 0,
                        'uradora'   => 0,
                        'kandora'   => 0,
                        'kanuradora' => 0
                    ]
                ]
            ]
        ]);
        $this->assertTrue(true); // no exception == ok
    }

    public function testCheckTsumoValid()
    {
        $checkTsumo = new \ReflectionMethod('\Mimir\RoundsHelper', '_checkTsumo');
        $checkTsumo->setAccessible(true);

        $checkTsumo->invokeArgs(null, [
            '1,2,3,4',
            [1, 2, 3],
            [
                'riichi'    => '1',
                'winner_id' => 2,
                'han'       => 2,
                'fu'        => 20,
                'yaku'      => '2',
                'dora'      => 0,
                'uradora'   => 0,
                'kandora'   => 0,
                'kanuradora' => 0
            ]
        ]);
        $this->assertTrue(true); // no exception == ok
    }

    public function testCheckDrawValid()
    {
        $checkDraw = new \ReflectionMethod('\Mimir\RoundsHelper', '_checkDraw');
        $checkDraw->setAccessible(true);

        $checkDraw->invokeArgs(null, [
            '1,2,3,4',
            [
                'riichi'    => '1',
                'tempai'    => '1,2'
            ]
        ]);
        $this->assertTrue(true); // no exception == ok
    }

    public function testCheckAbortiveDrawValid()
    {
        $checkAbort = new \ReflectionMethod('\Mimir\RoundsHelper', '_checkAbortiveDraw');
        $checkAbort->setAccessible(true);

        $checkAbort->invokeArgs(null, [
            '1,2,3,4',
            [
                'riichi'    => '1'
            ]
        ]);
        $this->assertTrue(true); // no exception == ok
    }

    public function testCheckChomboValid()
    {
        $checkChombo = new \ReflectionMethod('\Mimir\RoundsHelper', '_checkChombo');
        $checkChombo->setAccessible(true);

        $checkChombo->invokeArgs(null, [
            '1,2,3,4',
            [
                'loser_id'  => 2
            ]
        ]);
        $this->assertTrue(true); // no exception == ok
    }

    // Negative tests

    public function testCheckOneOfFail()
    {
        $this->expectException(\Mimir\MalformedPayloadException::class);
        $checkOneOf = new \ReflectionMethod('\Mimir\RoundsHelper', '_checkOneOf');
        $checkOneOf->setAccessible(true);

        $data = ['test' => 'notokval'];
        $possibleVals = ['okval3', 'okval', 'okval2'];
        $checkOneOf->invokeArgs(null, [$data, 'test', $possibleVals]);
    }

    public function testCheckYakuWrongDataFail()
    {
        $this->expectException(\Mimir\MalformedPayloadException::class);
        $checkYaku = new \ReflectionMethod('\Mimir\RoundsHelper', '_checkYaku');
        $checkYaku->setAccessible(true);

        $data = 'wat';
        $possibleVals = [1, 2, 3];
        $checkYaku->invokeArgs(null, [$data, $possibleVals]);
    }

    public function testCheckYakuNotAllowedFail()
    {
        $this->expectException(\Mimir\MalformedPayloadException::class);
        $checkYaku = new \ReflectionMethod('\Mimir\RoundsHelper', '_checkYaku');
        $checkYaku->setAccessible(true);

        $data = '1,4';
        $possibleVals = [1, 2, 3];
        $checkYaku->invokeArgs(null, [$data, $possibleVals]);
    }

    public function testCheckZeroOrMoreOfFail()
    {
        $checkOneOf = new \ReflectionMethod('\Mimir\RoundsHelper', '_csvCheckZeroOrMoreOf');
        $checkOneOf->setAccessible(true);

        $data = ['test' => 'a,b'];
        $expected = 0;
        $catched = 0;

        try {
            $expected ++;
            $checkOneOf->invokeArgs(null, [
                $data,
                'test',
                'c,d'
            ]);
        } catch (\Exception $e) {
            $catched ++;
        }

        try {
            $expected ++;
            $checkOneOf->invokeArgs(null, [
                $data,
                'test',
                'a,c,d'
            ]);
        } catch (\Exception $e) {
            $catched ++;
        }

        try {
            $expected ++;
            $checkOneOf->invokeArgs(null, [
                $data,
                'test',
                '' // nothing matches
            ]);
        } catch (\Exception $e) {
            $catched ++;
        }

        $this->assertEquals($expected, $catched, "Catched exceptions count matches expectations");
    }
}
